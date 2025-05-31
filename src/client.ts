import {
  ClaudeCodeConfig,
  ClaudeCodeResponse,
  StreamingResponse,
  SessionInfo,
} from "./types";
import {
  ClaudeCodeError,
  AuthenticationError,
  ConfigurationError,
  SessionError,
} from "./errors";

export class ClaudeCodeClient {
  private config: ClaudeCodeConfig;
  private claudePath: string;

  constructor(config: ClaudeCodeConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      outputFormat: config.outputFormat || "json",
      ...config,
    };

    if (!this.config.apiKey) {
      throw new AuthenticationError(
        "API key is required. Set ANTHROPIC_API_KEY environment variable or pass apiKey in config.",
      );
    }

    this.claudePath = this.config.claudePath || "";
  }

  private async ensureClaudePath(): Promise<void> {
    if (!this.claudePath) {
      this.claudePath = await this.findClaudePath();
    }
  }

  private async findClaudePath(): Promise<string> {
    // Simple fallback - just try 'claude' in PATH
    try {
      const proc = Bun.spawn(["which", "claude"], {
        stdout: "pipe",
      });
      const output = await new Response(proc.stdout).text();
      if (proc.exitCode === 0) {
        return output.trim();
      }
    } catch {
      // Ignore
    }

    throw new ConfigurationError(
      "Claude CLI not found in PATH. Please specify claudePath in config or install Claude CLI.",
    );
  }

  private buildCommand(options: {
    text: string;
    sessionId?: string;
    configOverrides?: Partial<ClaudeCodeConfig>;
  }): {
    command: string;
    args: string[];
  } {
    const args = ["-p", `"${options.text}"`];

    // Use config overrides if provided, otherwise use the instance config
    const effectiveConfig = {
      ...this.config,
      ...(options.configOverrides || {}),
    };

    if (effectiveConfig.outputFormat) {
      args.push("--output-format", effectiveConfig.outputFormat);
      if (effectiveConfig.outputFormat === "stream-json") {
        args.push("--verbose");
      }
    }

    if (effectiveConfig.systemPrompt) {
      args.push("--system-prompt", effectiveConfig.systemPrompt);
    }

    if (effectiveConfig.allowedTools) {
      args.push("--allowedTools", effectiveConfig.allowedTools.join(","));
    }

    if (effectiveConfig.mcpConfig) {
      args.push("--mcp-config", effectiveConfig.mcpConfig);
    }

    if (effectiveConfig.permissionPromptTool) {
      args.push(
        "--permission-prompt-tool",
        effectiveConfig.permissionPromptTool,
      );
    }

    if (options.sessionId) {
      args.push("--resume", options.sessionId);
    }

    return { command: this.claudePath, args };
  }

  async chat(options: {
    text: string;
    sessionId?: string;
  }): Promise<ClaudeCodeResponse> {
    await this.ensureClaudePath();
    const { command, args } = this.buildCommand(options);

    const childProcess = Bun.spawn([command, ...args], {
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: this.config.apiKey!,
      },
      stdin: "ignore",
      stdout: "pipe",
      stderr: "inherit",
    });

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      childProcess.kill();
    }, 60000);

    let output: string;
    try {
      output = await new Response(childProcess.stdout).text();
      await childProcess.exited;
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      childProcess.kill();
      console.error("Command failed:", error);
      throw new ClaudeCodeError(`Command failed: ${(error as Error).message}`);
    }

    if (childProcess.exitCode !== 0) {
      throw new ClaudeCodeError(
        `Command failed - check console for error details`,
      );
    }

    if (this.config.outputFormat === "json") {
      try {
        const parsed = JSON.parse(output);
        return {
          content: parsed.result || parsed.content || output,
          sessionId: parsed.session_id || parsed.sessionId,
          metadata: parsed.metadata,
          type: parsed.type,
          subtype: parsed.subtype,
          cost_usd: parsed.cost_usd,
          is_error: parsed.is_error,
          duration_ms: parsed.duration_ms,
          duration_api_ms: parsed.duration_api_ms,
          num_turns: parsed.num_turns,
          result: parsed.result,
          total_cost: parsed.total_cost,
          session_id: parsed.session_id,
        };
      } catch {
        return { content: output };
      }
    }

    return { content: output };
  }

  async *chatStream(options: {
    text: string;
    sessionId?: string;
  }): AsyncIterableIterator<StreamingResponse> {
    await this.ensureClaudePath();

    const { command: claudeCommand, args } = this.buildCommand({
      ...options,
      configOverrides: { outputFormat: "stream-json" },
    });

    const childProcess = Bun.spawn([claudeCommand, ...args], {
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: this.config.apiKey!,
      },
      stdout: "pipe",
      stderr: "inherit",
    });

    const reader = childProcess.stdout.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            // Handle Claude CLI output formats
            if (parsed.type === "assistant" && parsed.message?.content?.[0]?.text) {
              yield {
                type: "content",
                data: parsed.message.content[0].text,
              };
            } else if (parsed.type === "result" && parsed.result) {
              yield {
                type: "content",
                data: parsed.result,
              };
            } else {
              yield {
                type: parsed.type || "metadata",
                data: parsed,
              };
            }
          } catch {
            // Raw text line
            if (line.trim()) {
              yield {
                type: "content",
                data: line,
              };
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      childProcess.kill();
    }
  }

  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureClaudePath();
    try {
      const childProcess = Bun.spawn([this.claudePath, "--list-sessions"], {
        env: {
          ...process.env,
          ANTHROPIC_API_KEY: this.config.apiKey!,
        },
        stdout: "pipe",
        stderr: "pipe",
      });

      const output = await new Response(childProcess.stdout).text();
      await childProcess.exited;

      if (childProcess.exitCode !== 0) {
        throw new SessionError("Failed to list sessions");
      }

      try {
        return JSON.parse(output);
      } catch {
        return [];
      }
    } catch (error) {
      throw new SessionError(
        `Failed to list sessions: ${(error as Error).message}`,
      );
    }
  }

  updateConfig(newConfig: Partial<ClaudeCodeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

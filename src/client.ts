import {
  ClaudeCodeConfig,
  ClaudeCodeResponse,
  StreamingResponse,
  SessionInfo,
} from "./types.ts";
import {
  ClaudeCodeError,
  AuthenticationError,
  ConfigurationError,
  SessionError,
} from "./errors.ts";

export class ClaudeCodeClient {
  private config: ClaudeCodeConfig;
  private claudePath: string;

  constructor(config: ClaudeCodeConfig = {}) {
    this.config = {
      apiKey: config.apiKey || Deno.env.get("ANTHROPIC_API_KEY"),
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
      const result = await new Deno.Command("which", {
        args: ["claude"],
      }).output();
      if (result.success) {
        return new TextDecoder().decode(result.stdout).trim();
      }
    } catch {
      // Ignore
    }

    throw new ConfigurationError(
      "Claude CLI not found in PATH. Please specify claudePath in config or install Claude CLI.",
    );
  }

  private buildCommand(options: { text: string; sessionId?: string }): {
    command: string;
    args: string[];
  } {
    const args = ["-p", `"${options.text}"`];

    if (this.config.outputFormat) {
      args.push("--output-format", this.config.outputFormat);
    }

    if (this.config.systemPrompt) {
      args.push("--system-prompt", this.config.systemPrompt);
    }

    if (this.config.allowedTools) {
      args.push("--allowedTools", this.config.allowedTools.join(","));
    }

    if (this.config.mcpConfig) {
      args.push("--mcp-config", this.config.mcpConfig);
    }

    if (this.config.permissionPromptTool) {
      args.push("--permission-prompt-tool", this.config.permissionPromptTool);
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

    const denoCommand = new Deno.Command(command, {
      args: args,
      env: {
        ...Deno.env.toObject(),
        ANTHROPIC_API_KEY: this.config.apiKey!,
      },
      stdin: "null",
      stdout: "piped",
      stderr: "inherit",
    });

    const process = denoCommand.spawn();

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      process.kill();
    }, 60000);

    let result;
    try {
      result = await process.output();
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      process.kill();
      console.error("Command failed:", error);
      throw new ClaudeCodeError(`Command failed: ${(error as Error).message}`);
    }

    const { success, stdout } = result;

    if (!success) {
      throw new ClaudeCodeError(
        `Command failed - check console for error details`,
      );
    }

    const output = new TextDecoder().decode(stdout);

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
    const streamingOptions = {
      ...options,
    };

    const { command: claudeCommand, args } =
      this.buildCommand(streamingOptions);

    const command = new Deno.Command(claudeCommand, {
      args: args,
      env: {
        ...Deno.env.toObject(),
        ANTHROPIC_API_KEY: this.config.apiKey!,
      },
      stdout: "piped",
      stderr: "piped",
    });

    const process = command.spawn();
    const reader = process.stdout.getReader();
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
            yield {
              type: parsed.type || "content",
              data: parsed.data || parsed,
            };
          } catch {
            yield {
              type: "content",
              data: line,
            };
          }
        }
      }
    } finally {
      reader.releaseLock();
      process.kill();
    }
  }

  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureClaudePath();
    try {
      const command = new Deno.Command(this.claudePath, {
        args: ["--list-sessions"],
        env: {
          ...Deno.env.toObject(),
          ANTHROPIC_API_KEY: this.config.apiKey!,
        },
        stdout: "piped",
        stderr: "piped",
      });

      const { success, stdout } = await command.output();

      if (!success) {
        throw new SessionError("Failed to list sessions");
      }

      const output = new TextDecoder().decode(stdout);

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

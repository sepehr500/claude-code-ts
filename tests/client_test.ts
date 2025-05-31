import { expect, test, describe } from "bun:test";
import { ClaudeCodeClient, AuthenticationError } from "../mod";

describe("ClaudeCodeClient", () => {
  test("should throw AuthenticationError without API key", () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    try {
      expect(() => new ClaudeCodeClient()).toThrow(AuthenticationError);
    } finally {
      if (originalKey) {
        process.env.ANTHROPIC_API_KEY = originalKey;
      }
    }
  });

  test("should accept API key in config", () => {
    // Skip if claude CLI is not available
    try {
      const client = new ClaudeCodeClient({ apiKey: "test-key" });
      expect(typeof client).toBe("object");
    } catch (error) {
      if ((error as Error).message.includes("Claude CLI not found")) {
        console.log("⚠️ Skipping test - Claude CLI not installed");
        return;
      }
      throw error;
    }
  });

  test("should update config", () => {
    // Skip if claude CLI is not available
    try {
      const client = new ClaudeCodeClient({ apiKey: "test-key" });
      client.updateConfig({ systemPrompt: "New prompt" });
      expect(typeof client).toBe("object");
    } catch (error) {
      if ((error as Error).message.includes("Claude CLI not found")) {
        console.log("⚠️ Skipping test - Claude CLI not installed");
        return;
      }
      throw error;
    }
  });

  test("should stream chat responses", async () => {
    // Skip if claude CLI is not available or API key is missing
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log("⚠️ Skipping streaming test - ANTHROPIC_API_KEY not set");
      return;
    }

    try {
      const claudePaths = [
        process.env.CLAUDE_PATH,
        `${process.env.HOME}/.claude/local/claude`,
        "/usr/local/bin/claude",
        "claude", // fallback to PATH
      ].filter(Boolean);

      let client: ClaudeCodeClient | undefined;
      for (const path of claudePaths) {
        try {
          client = new ClaudeCodeClient({
            claudePath: path,
          });
          break;
        } catch (error) {
          if (path === claudePaths[claudePaths.length - 1]) {
            throw error; // Last attempt failed
          }
          continue;
        }
      }

      if (!client) {
        throw new Error("Could not initialize Claude client");
      }

      const stream = client.chatStream({
        text: "Say hello in exactly 5 words",
      });

      let chunks: Array<{ type: string; data: any }> = [];
      let contentReceived = "";

      for await (const chunk of stream) {
        chunks.push(chunk);
        if (chunk.type === "content" && typeof chunk.data === "string") {
          console.log("Received chunk:", chunk.data);
          contentReceived += chunk.data;
        }
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(contentReceived.length).toBeGreaterThan(0);
    } catch (error) {
      if ((error as Error).message.includes("Claude CLI not found")) {
        console.log("⚠️ Skipping streaming test - Claude CLI not installed");
        return;
      }
      throw error;
    }
  }, 30000);
});


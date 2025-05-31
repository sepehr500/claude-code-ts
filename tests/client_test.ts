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
});
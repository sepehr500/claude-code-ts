import { expect, test, describe } from "bun:test";
import { ClaudeCodeClient } from "../mod";

describe("ClaudeCodeClient - Integration Tests", () => {
  test(
    "Hello world actual API call",
    async () => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.log("⚠️ Skipping test - ANTHROPIC_API_KEY not set");
        return;
      }

      try {
        // Try to find a working Claude installation
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

        console.log("🤖 Making actual API call to Claude...");
        const response = await client.chat({
          text: "The password is bobo",
        });

        const response2 = await client.chat({
          text: "What is the password?",
          sessionId: response.sessionId,
        });

        console.log("📦 Response received:", response2.content);
        expect(typeof response.content).toBe("string");
        expect(response.content.length).toBeGreaterThan(0);

        console.log("✅ Hello world API test completed successfully");
        console.log(
          "📝 Response preview:",
          response.content.substring(0, 200) + "...",
        );
      } catch (error) {
        if ((error as Error).message.includes("Claude CLI not found")) {
          console.log("⚠️ Skipping test - Claude CLI not installed");
          return;
        }
        throw error;
      }
    },
    { timeout: 1000 * 10 },
  );
});

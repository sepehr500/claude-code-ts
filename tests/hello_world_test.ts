import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ClaudeCodeClient } from "../mod.ts";

Deno.test("ClaudeCodeClient - Hello world actual API call", async () => {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.log("⚠️ Skipping test - ANTHROPIC_API_KEY not set");
    return;
  }

  try {
    // Try to find a working Claude installation
    const claudePaths = [
      Deno.env.get("CLAUDE_PATH"),
      `${Deno.env.get("HOME")}/.claude/local/claude`,
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
      text: "Just respond with 'Hello world!'",
    });

    console.log("📦 Response received:", response);
    assertEquals(typeof response.content, "string");
    assertEquals(response.content.length > 0, true);

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
});

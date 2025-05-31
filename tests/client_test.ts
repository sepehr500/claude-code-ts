import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ClaudeCodeClient, AuthenticationError } from "../mod.ts";

Deno.test("ClaudeCodeClient - should throw AuthenticationError without API key", () => {
  const originalKey = Deno.env.get("ANTHROPIC_API_KEY");
  Deno.env.delete("ANTHROPIC_API_KEY");
  
  try {
    assertThrows(
      () => new ClaudeCodeClient(),
      AuthenticationError,
      "API key is required"
    );
  } finally {
    if (originalKey) {
      Deno.env.set("ANTHROPIC_API_KEY", originalKey);
    }
  }
});

Deno.test("ClaudeCodeClient - should accept API key in config", () => {
  // Skip if claude CLI is not available
  try {
    const client = new ClaudeCodeClient({ apiKey: "test-key" });
    assertEquals(typeof client, "object");
  } catch (error) {
    if ((error as Error).message.includes("Claude CLI not found")) {
      console.log("⚠️ Skipping test - Claude CLI not installed");
      return;
    }
    throw error;
  }
});

Deno.test("ClaudeCodeClient - should update config", () => {
  // Skip if claude CLI is not available
  try {
    const client = new ClaudeCodeClient({ apiKey: "test-key" });
    client.updateConfig({ systemPrompt: "New prompt" });
    assertEquals(typeof client, "object");
  } catch (error) {
    if ((error as Error).message.includes("Claude CLI not found")) {
      console.log("⚠️ Skipping test - Claude CLI not installed");
      return;
    }
    throw error;
  }
});
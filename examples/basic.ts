#!/usr/bin/env bun

import { ClaudeCodeClient } from "../mod";

// Initialize the client
const client = new ClaudeCodeClient({
  outputFormat: "json",
});

try {
  // Simple prompt
  console.log("🤖 Sending prompt to Claude Code...");
  const response = await client.chat({ text: "Write a simple hello world function in TypeScript" });
  console.log("📝 Response:", response.content);

  // Continue conversation
  console.log("\n🔄 Continuing conversation...");
  const followUp = await client.chat({ 
    text: "Now add error handling to this function",
    sessionId: response.sessionId 
  });
  console.log("📝 Follow-up response:", followUp.content);

} catch (error) {
  console.error("❌ Error:", (error as Error).message);
  process.exit(1);
}
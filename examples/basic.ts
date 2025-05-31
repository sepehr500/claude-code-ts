#!/usr/bin/env -S deno run --allow-env --allow-run

import { ClaudeCodeClient } from "../mod.ts";

// Initialize the client
const client = new ClaudeCodeClient({
  outputFormat: "json",
});

try {
  // Simple prompt
  console.log("🤖 Sending prompt to Claude Code...");
  const response = await client.prompt("Write a simple hello world function in TypeScript");
  console.log("📝 Response:", response.content);

  // Continue conversation
  console.log("\n🔄 Continuing conversation...");
  const followUp = await client.continue("Now add error handling to this function");
  console.log("📝 Follow-up response:", followUp.content);

} catch (error) {
  console.error("❌ Error:", error.message);
  Deno.exit(1);
}
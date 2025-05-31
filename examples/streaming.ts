#!/usr/bin/env bun

import { ClaudeCodeClient } from "../mod";

const client = new ClaudeCodeClient();

try {
  console.log("🌊 Starting streaming conversation...");
  
  const stream = client.chatStream({
    text: "Explain how async/await works in TypeScript with examples",
  });

  for await (const chunk of stream) {
    if (chunk.type === "content") {
      process.stdout.write(chunk.data as string);
    } else if (chunk.type === "metadata") {
      console.log("\n📊 Metadata:", chunk.data);
    }
  }

} catch (error) {
  console.error("❌ Streaming error:", (error as Error).message);
  process.exit(1);
}
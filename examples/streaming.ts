#!/usr/bin/env -S deno run --allow-env --allow-run

import { ClaudeCodeClient } from "../mod.ts";

const client = new ClaudeCodeClient();

try {
  console.log("🌊 Starting streaming conversation...");
  
  const stream = client.chatStream({
    prompt: "Explain how async/await works in TypeScript with examples",
    nonInteractive: true,
  });

  for await (const chunk of stream) {
    if (chunk.type === "content") {
      process.stdout.write(chunk.data as string);
    } else if (chunk.type === "metadata") {
      console.log("\n📊 Metadata:", chunk.data);
    }
  }

} catch (error) {
  console.error("❌ Streaming error:", error.message);
  Deno.exit(1);
}
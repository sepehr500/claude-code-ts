#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-run

import { build, emptyDir } from "https://deno.land/x/dnt@0.41.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "@anthropic/claude-code-sdk",
    version: "0.1.0",
    description: "TypeScript SDK wrapper for Claude Code",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/anthropics/claude-code-sdk-ts.git",
    },
    bugs: {
      url: "https://github.com/anthropics/claude-code-sdk-ts/issues",
    },
    author: "Anthropic",
    keywords: ["claude", "anthropic", "ai", "sdk", "typescript", "deno"],
    engines: {
      node: ">=16.0.0",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});

console.log("✅ Build completed successfully!");
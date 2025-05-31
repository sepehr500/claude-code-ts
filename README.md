# Claude Code SDK for TypeScript

A TypeScript wrapper around the Claude Code CLI that works with both Deno and Node.js/npm.

## Features

- 🦕 **Deno First**: Built for Deno with full TypeScript support
- 📦 **Dual Publishing**: Available for both Deno and npm
- 🔄 **Streaming Support**: Real-time response streaming
- 🎯 **Type Safe**: Full TypeScript definitions
- 🛠️ **Flexible API**: Support for all Claude Code CLI features

## Installation

### Deno

```typescript
import { ClaudeCodeClient } from "https://deno.land/x/claude_code_sdk/mod.ts";
```

### Node.js/npm

```bash
npm install @anthropic/claude-code-sdk
```

```typescript
import { ClaudeCodeClient } from "@anthropic/claude-code-sdk";
```

## Prerequisites

You need to have the Claude Code CLI installed and an Anthropic API key:

1. Install Claude Code CLI (follow the [official documentation](https://docs.anthropic.com/en/docs/claude-code))
2. Set your API key: `export ANTHROPIC_API_KEY=your_api_key`

## Quick Start

### Basic Usage

```typescript
import { ClaudeCodeClient } from "@anthropic/claude-code-sdk";

const client = new ClaudeCodeClient();

// Simple prompt
const response = await client.prompt("Write a Fibonacci function in TypeScript");
console.log(response.content);

// Continue conversation
const followUp = await client.continue("Now optimize it for performance");
console.log(followUp.content);
```

### Configuration

```typescript
const client = new ClaudeCodeClient({
  apiKey: "your_api_key", // Optional if ANTHROPIC_API_KEY is set
  outputFormat: "json",
  systemPrompt: "You are a senior TypeScript developer",
  allowedTools: ["bash", "edit", "read"],
});
```

### Streaming Responses

```typescript
const stream = client.chatStream({
  prompt: "Explain async/await in TypeScript",
  nonInteractive: true,
});

for await (const chunk of stream) {
  if (chunk.type === "content") {
    process.stdout.write(chunk.data as string);
  }
}
```

### Session Management

```typescript
// Resume a specific session
const response = await client.resume("session-id", "Continue where we left off");

// List all sessions
const sessions = await client.listSessions();
console.log(sessions);
```

## API Reference

### ClaudeCodeClient

#### Constructor

```typescript
new ClaudeCodeClient(config?: ClaudeCodeConfig)
```

#### Methods

- `prompt(text: string): Promise<ClaudeCodeResponse>` - Send a single prompt
- `continue(text: string): Promise<ClaudeCodeResponse>` - Continue last conversation
- `resume(sessionId: string, text: string): Promise<ClaudeCodeResponse>` - Resume specific session
- `chat(options: ConversationOptions): Promise<ClaudeCodeResponse>` - Full conversation control
- `chatStream(options: ConversationOptions): AsyncIterableIterator<StreamingResponse>` - Streaming responses
- `listSessions(): Promise<SessionInfo[]>` - List all sessions
- `updateConfig(config: Partial<ClaudeCodeConfig>): void` - Update configuration

### Types

```typescript
interface ClaudeCodeConfig {
  apiKey?: string;
  systemPrompt?: string;
  outputFormat?: "text" | "json" | "streaming-json";
  allowedTools?: string[];
  mcpConfig?: string;
  permissionPromptTool?: string;
}

interface ConversationOptions {
  prompt: string;
  sessionId?: string;
  continueLastSession?: boolean;
  nonInteractive?: boolean;
}

interface ClaudeCodeResponse {
  content: string;
  sessionId?: string;
  metadata?: {
    toolsUsed?: string[];
    tokensUsed?: number;
    timestamp?: string;
  };
}
```

## Development

### For Deno

```bash
# Run tests
deno test --allow-all

# Run examples
deno run --allow-all examples/basic.ts
```

### For npm

```bash
# Build for npm
deno run --allow-all scripts/build.ts

# Test npm build
cd npm && npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Anthropic Console](https://console.anthropic.com/)
- [GitHub Repository](https://github.com/anthropics/claude-code-sdk-ts)# claude-code-ts

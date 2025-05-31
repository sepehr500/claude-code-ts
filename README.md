<div align="center">

# 🤖 Claude Code SDK for TypeScript

**A powerful TypeScript wrapper for the Claude Code CLI**

[![npm](https://img.shields.io/badge/Available%20on-npm-red?style=flat&logo=npm)](https://npmjs.com)
[![TypeScript](https://img.shields.io/badge/Written%20in-TypeScript-blue?style=flat&logo=typescript)](https://typescriptlang.org)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

*Seamlessly integrate Claude Code's powerful AI capabilities into your TypeScript applications*

[📚 Documentation](#api-reference) • [🚀 Quick Start](#quick-start) • [💡 Examples](#examples) • [🔧 Development](#development)

</div>

---

## ✨ Features

- 📦 **Node.js/npm** — Built for Node.js with complete TypeScript support
- 🌊 **Streaming Support** — Real-time response streaming for interactive experiences
- 🎯 **Type Safe** — Full TypeScript definitions with excellent IntelliSense
- ⚡ **Performance Focused** — Efficient command execution with timeout handling
- 🛠️ **Flexible Configuration** — Support for all Claude Code CLI features
- 🔐 **Secure** — Proper environment variable handling for API keys

## 🚀 Quick Start

### Installation

```bash
npm install claude-code-sdk
```

```typescript
import { ClaudeCodeClient } from "claude-code-sdk";
```

### Prerequisites

Before using this SDK, ensure you have:

1. **Claude Code CLI** installed ([installation guide](https://docs.claude.ai/en/docs/claude-code))
2. **API key** set as environment variable:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

### Basic Usage

```typescript
import { ClaudeCodeClient } from "claude-code-sdk";

// Initialize client
const client = new ClaudeCodeClient();

// Send a message to Claude
const response = await client.chat({
  text: "Write a TypeScript function to calculate Fibonacci numbers"
});

console.log(response.content);
```

## 💡 Examples

### 🔧 Configuration

```typescript
const client = new ClaudeCodeClient({
  apiKey: "your_api_key", // Optional if ANTHROPIC_API_KEY is set
  outputFormat: "json",
  systemPrompt: "You are a senior TypeScript developer",
  allowedTools: ["bash", "edit", "read"],
  claudePath: "/custom/path/to/claude" // Optional
});
```

### 🌊 Streaming Responses

```typescript
const stream = client.chatStream({
  text: "Explain async/await in TypeScript with examples"
});

for await (const chunk of stream) {
  if (chunk.type === "content") {
    process.stdout.write(chunk.data as string);
  } else if (chunk.type === "metadata") {
    console.log("📊 Metadata:", chunk.data);
  }
}
```

### 📋 Session Management

```typescript
// Start a conversation
const response1 = await client.chat({
  text: "Create a React component"
});

// Continue with the same session
const response2 = await client.chat({
  text: "Now add TypeScript types to it",
  sessionId: response1.sessionId
});

// List all sessions
const sessions = await client.listSessions();
console.log("Active sessions:", sessions);
```

### ⚙️ Advanced Configuration

```typescript
const client = new ClaudeCodeClient({
  outputFormat: "json",
  systemPrompt: "You are an expert in modern web development",
  allowedTools: ["bash", "edit", "read", "write"],
  mcpConfig: "/path/to/mcp-config.json",
  permissionPromptTool: "always"
});

// Update configuration dynamically
client.updateConfig({
  systemPrompt: "You are now a Python expert"
});
```

## 📖 API Reference

### ClaudeCodeClient

#### Constructor

```typescript
new ClaudeCodeClient(config?: ClaudeCodeConfig)
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `chat(options)` | Send a message to Claude | `Promise<ClaudeCodeResponse>` |
| `chatStream(options)` | Stream responses from Claude | `AsyncIterableIterator<StreamingResponse>` |
| `listSessions()` | Get all available sessions | `Promise<SessionInfo[]>` |
| `updateConfig(config)` | Update client configuration | `void` |

#### Type Definitions

```typescript
interface ClaudeCodeConfig {
  apiKey?: string;                           // API key (optional if env var set)
  claudePath?: string;                       // Custom path to Claude CLI
  systemPrompt?: string;                     // System prompt for conversations
  outputFormat?: "text" | "json" | "streaming-json";
  allowedTools?: string[];                   // Tools Claude can use
  mcpConfig?: string;                        // MCP configuration file path
  permissionPromptTool?: string;            // Permission prompt behavior
}

interface ClaudeCodeResponse {
  content: string;                          // Main response content
  sessionId?: string;                       // Session identifier
  type?: string;                           // Response type
  cost_usd?: number;                       // Cost in USD
  duration_ms?: number;                    // Response duration
  num_turns?: number;                      // Number of conversation turns
  metadata?: {
    toolsUsed?: string[];                  // Tools used in response
    tokensUsed?: number;                   // Tokens consumed
    timestamp?: string;                    // Response timestamp
  };
}

interface StreamingResponse {
  type: "content" | "metadata" | "error";   // Chunk type
  data: string | object;                    // Chunk data
}

interface SessionInfo {
  id: string;                              // Session ID
  createdAt: string;                       // Creation timestamp
  lastActive: string;                      // Last activity timestamp
  messageCount: number;                    // Number of messages
}
```

## 🔧 Development

### Running Examples

```bash
# Basic example
npx tsx examples/basic.ts

# Streaming example  
npx tsx examples/streaming.ts
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Available Tasks

```bash
npm run dev        # Start development server
npm test           # Run tests
npm run build      # Build for production
npm run publish    # Publish to registry
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with proper TypeScript types
4. **Add** tests for new functionality
5. **Ensure** all tests pass (`npm test`)
6. **Commit** your changes (`git commit -m 'Add amazing feature'`)
7. **Push** to the branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- 📚 [Claude Code Documentation](https://docs.claude.ai/en/docs/claude-code)
- 💻 [GitHub Repository](https://github.com/your-org/claude-code-sdk-ts)
- 📦 [npm Package](https://npmjs.com/package/claude-code-sdk)

---

<div align="center">

**Made with ❤️ for the developer community**

*Empowering developers to build amazing AI-powered applications*

</div>

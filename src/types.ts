export interface ClaudeCodeConfig {
  apiKey?: string;
  claudePath?: string;
  systemPrompt?: string;
  outputFormat?: "text" | "json" | "streaming-json";
  allowedTools?: string[];
  mcpConfig?: string;
  permissionPromptTool?: string;
}

export interface ClaudeCodeResponse {
  content: string;
  sessionId?: string;
  metadata?: {
    toolsUsed?: string[];
    tokensUsed?: number;
    timestamp?: string;
  };
  type?: string;
  subtype?: string;
  cost_usd?: number;
  is_error?: boolean;
  duration_ms?: number;
  duration_api_ms?: number;
  num_turns?: number;
  result?: string;
  total_cost?: number;
  session_id?: string;
}

export interface StreamingResponse {
  type: "content" | "metadata" | "error";
  data: string | object;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  lastActive: string;
  messageCount: number;
}


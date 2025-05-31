export class ClaudeCodeError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "ClaudeCodeError";
  }
}

export class AuthenticationError extends ClaudeCodeError {
  constructor(message = "Authentication failed") {
    super(message, "AUTH_ERROR");
    this.name = "AuthenticationError";
  }
}

export class ConfigurationError extends ClaudeCodeError {
  constructor(message = "Configuration error") {
    super(message, "CONFIG_ERROR");
    this.name = "ConfigurationError";
  }
}

export class SessionError extends ClaudeCodeError {
  constructor(message = "Session error") {
    super(message, "SESSION_ERROR");
    this.name = "SessionError";
  }
}
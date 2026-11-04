// lib/mcp/types.ts
export interface McpRequest {
  jsonrpc: "2.0";
  /** Absent for JSON-RPC notifications. */
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

/** Per-request transport context threaded through to tool handlers. */
export interface McpRequestContext {
  /** Best-effort client IP (from proxy headers), used for rate limiting. */
  ip: string;
}

export type McpResponse =
  | { jsonrpc: "2.0"; id: string | number | null; result: unknown; error?: never }
  | { jsonrpc: "2.0"; id: string | number | null; result?: never; error: { code: number; message: string; data?: unknown } };

/** A JSON Schema (2020-12) object. Kept open: tool schemas use whatever keywords they need. */
export type JsonSchema = { [keyword: string]: unknown };

export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface McpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema & { type: "object" };
  outputSchema?: JsonSchema & { type: "object" };
  annotations: ToolAnnotations;
}

export interface TextContent {
  type: "text";
  text: string;
}

/** A tools/call result. Tool failures set `isError` instead of raising a JSON-RPC error. */
export interface ToolResult {
  content: TextContent[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

export interface McpResource {
  uri: string;
  name: string;
  title?: string;
  description: string;
  mimeType: string;
}

export interface McpResourceTemplate {
  uriTemplate: string;
  name: string;
  title?: string;
  description: string;
  mimeType: string;
}

export interface McpContent {
  uri: string;
  mimeType: string;
  text: string;
}

export interface McpPromptArgument {
  name: string;
  description: string;
  required: boolean;
}

export interface McpPrompt {
  name: string;
  title: string;
  description: string;
  arguments: McpPromptArgument[];
}

export interface McpPromptMessage {
  role: "user" | "assistant";
  content: TextContent;
}

export interface McpPromptResult {
  description: string;
  messages: McpPromptMessage[];
}

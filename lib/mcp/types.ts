// lib/mcp/types.ts
export interface McpRequest {
  jsonrpc: "2.0";
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export type McpResponse =
  | { jsonrpc: "2.0"; id: string | number | null; result: unknown; error?: never }
  | { jsonrpc: "2.0"; id: string | number | null; result?: never; error: { code: number; message: string; data?: unknown } };

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpContent {
  uri: string;
  mimeType: string;
  type: "text" | "blob";
  text: string;
}

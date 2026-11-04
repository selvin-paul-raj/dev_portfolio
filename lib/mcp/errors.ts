// lib/mcp/errors.ts
// Errors whose message is safe to show MCP clients. Anything else thrown
// inside a handler is logged server-side and reported as a generic error.

export const JSONRPC_PARSE_ERROR = -32700;
export const JSONRPC_INVALID_REQUEST = -32600;
export const JSONRPC_METHOD_NOT_FOUND = -32601;
export const JSONRPC_INVALID_PARAMS = -32602;
export const JSONRPC_INTERNAL_ERROR = -32603;
export const MCP_RESOURCE_NOT_FOUND = -32002;
/** Implementation-defined server error range: used for HTTP-level rejections (rate limit, size). */
export const JSONRPC_SERVER_ERROR = -32000;

/** A protocol-level failure: becomes a JSON-RPC `error` response. */
export class McpError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "McpError";
  }
}

/** A tool-execution failure (bad arguments, upstream down): becomes a result with `isError: true`. */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

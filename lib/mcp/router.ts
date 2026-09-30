// lib/mcp/router.ts
// Shared JSON-RPC 2.0 / MCP protocol router. Both entry points (Next.js route
// and the standalone Alpic server) construct their own data-bound handlers
// and pass them in here, so the protocol switch itself only exists once.
import { PROTOCOL_VERSION, SERVER_NAME, SERVER_VERSION, SERVER_INSTRUCTIONS } from "./definitions";
import {
  McpError,
  JSONRPC_INTERNAL_ERROR,
  JSONRPC_INVALID_PARAMS,
  JSONRPC_INVALID_REQUEST,
  JSONRPC_METHOD_NOT_FOUND,
  JSONRPC_PARSE_ERROR,
} from "./errors";
import type { McpRequest, McpRequestContext, McpResponse, McpTool, McpResource, McpContent } from "./types";

export interface McpHandlers {
  listTools(): McpTool[];
  callTool(
    name: string,
    args: Record<string, unknown>,
    ctx: McpRequestContext,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }>;
  listResources(): McpResource[];
  readResource(uri: string): McpContent[];
}

type RequestId = string | number | null;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidId(value: unknown): value is RequestId {
  return value === null || typeof value === "string" || typeof value === "number";
}

function errorResponse(id: RequestId, code: number, message: string): McpResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/** Builds the JSON-RPC response for a parse failure (the transport owns body parsing). */
export function parseErrorResponse(): McpResponse {
  return errorResponse(null, JSONRPC_PARSE_ERROR, "Parse error: invalid JSON");
}

/**
 * Returns a handler that resolves to the JSON-RPC response, or `null` when
 * the message was a notification (no `id`) — transports should then reply
 * HTTP 202 with an empty body, per the MCP Streamable HTTP spec.
 */
export function createMcpHandler(handlers: McpHandlers) {
  return async function handleMcpRequest(body: unknown, ctx: McpRequestContext): Promise<McpResponse | null> {
    if (!isPlainObject(body)) {
      return errorResponse(null, JSONRPC_INVALID_REQUEST, "Invalid Request: expected a single JSON-RPC object");
    }

    const isNotification = !("id" in body);
    const id: RequestId = isValidId(body.id) ? body.id : null;

    if (body.jsonrpc !== "2.0" || typeof body.method !== "string" || (!isNotification && !isValidId(body.id))) {
      return errorResponse(id, JSONRPC_INVALID_REQUEST, "Invalid Request");
    }
    if (body.params !== undefined && !isPlainObject(body.params)) {
      return isNotification ? null : errorResponse(id, JSONRPC_INVALID_PARAMS, "params must be an object");
    }

    // Notifications (e.g. notifications/initialized) never get a response body.
    if (isNotification) return null;

    const { method, params } = body as unknown as McpRequest;

    try {
      switch (method) {
        case "initialize":
          return {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: {
                tools: { listChanged: false },
                resources: { listChanged: false, subscribe: false },
                prompts: {},
              },
              serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
              instructions: SERVER_INSTRUCTIONS,
            },
          };

        case "ping":
          return { jsonrpc: "2.0", id, result: {} };

        case "tools/list":
          return { jsonrpc: "2.0", id, result: { tools: handlers.listTools() } };

        case "tools/call": {
          const name = params?.name;
          const args = params?.arguments ?? {};
          if (typeof name !== "string" || !isPlainObject(args)) {
            return errorResponse(id, JSONRPC_INVALID_PARAMS, "tools/call requires params.name (string) and optional params.arguments (object)");
          }
          const result = await handlers.callTool(name, args, ctx);
          return { jsonrpc: "2.0", id, result };
        }

        case "resources/list":
          return { jsonrpc: "2.0", id, result: { resources: handlers.listResources() } };

        case "resources/read": {
          const uri = params?.uri;
          if (typeof uri !== "string") {
            return errorResponse(id, JSONRPC_INVALID_PARAMS, "resources/read requires params.uri (string)");
          }
          return { jsonrpc: "2.0", id, result: { contents: handlers.readResource(uri) } };
        }

        case "resources/templates/list":
          return { jsonrpc: "2.0", id, result: { resourceTemplates: [] } };

        case "prompts/list":
          return { jsonrpc: "2.0", id, result: { prompts: [] } };

        default:
          return errorResponse(id, JSONRPC_METHOD_NOT_FOUND, `Method not found: ${method}`);
      }
    } catch (err) {
      if (err instanceof McpError) return errorResponse(id, err.code, err.message);
      console.error(`[mcp] ${method} failed:`, err);
      return errorResponse(id, JSONRPC_INTERNAL_ERROR, "Internal error");
    }
  };
}

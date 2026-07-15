// lib/mcp/router.ts
// Shared JSON-RPC 2.0 / MCP protocol router. Both entry points (Next.js route
// and the standalone Alpic server) construct their own data-bound handlers
// and pass them in here, so the protocol switch itself only exists once.
import { PROTOCOL_VERSION, SERVER_NAME, SERVER_VERSION, SERVER_INSTRUCTIONS } from "./definitions";
import type { McpRequest, McpResponse, McpTool, McpResource, McpContent } from "./types";

export interface McpHandlers {
  listTools(): McpTool[];
  callTool(name: string, args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }>;
  listResources(): McpResource[];
  readResource(uri: string): McpContent[];
}

export function createMcpHandler(handlers: McpHandlers) {
  return async function handleMcpRequest(body: McpRequest): Promise<McpResponse> {
    const { method, params, id } = body;

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

        case "notifications/initialized":
          return { jsonrpc: "2.0", id: null, result: null };

        case "tools/list":
          return { jsonrpc: "2.0", id, result: { tools: handlers.listTools() } };

        case "tools/call": {
          if (!params) return { jsonrpc: "2.0", id, error: { code: -32602, message: "params required for tools/call" } };
          const p = params as { name: string; arguments?: Record<string, unknown> };
          const result = await handlers.callTool(p.name, p.arguments ?? {});
          return { jsonrpc: "2.0", id, result };
        }

        case "resources/list":
          return { jsonrpc: "2.0", id, result: { resources: handlers.listResources() } };

        case "resources/read": {
          if (!params)
            return { jsonrpc: "2.0", id, error: { code: -32602, message: "params required for resources/read" } };
          const p = params as { uri: string };
          const contents = handlers.readResource(p.uri);
          return { jsonrpc: "2.0", id, result: { contents } };
        }

        case "resources/templates/list":
          return { jsonrpc: "2.0", id, result: { resourceTemplates: [] } };

        case "prompts/list":
          return { jsonrpc: "2.0", id, result: { prompts: [] } };

        default:
          return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { jsonrpc: "2.0", id, error: { code: -32603, message } };
    }
  };
}

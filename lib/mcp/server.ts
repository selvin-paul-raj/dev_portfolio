// lib/mcp/server.ts
import type { McpRequest, McpResponse } from "./types";
import { listTools, handleToolCall } from "./tools";
import { listResources, readResource } from "./resources";

const PROTOCOL_VERSION = "2024-11-05";

export async function handleMcpRequest(body: McpRequest): Promise<McpResponse> {
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
            serverInfo: { name: "selvin-portfolio-mcp", version: "1.0.0" },
            instructions:
              "You have access to Selvin PaulRaj K's professional portfolio. Use resources to read structured data and tools to search, filter, or send contact messages. Selvin is an AI Engineer specializing in MCP, LangGraph, RAG, and agentic systems based in Chennai, India.",
          },
        };

      case "ping":
        return { jsonrpc: "2.0", id, result: {} };

      case "notifications/initialized":
        return { jsonrpc: "2.0", id: null, result: null };

      case "tools/list":
        return { jsonrpc: "2.0", id, result: { tools: listTools() } };

      case "tools/call": {
        const p = params as { name: string; arguments?: Record<string, unknown> };
        const result = await handleToolCall(p.name, p.arguments ?? {});
        return { jsonrpc: "2.0", id, result };
      }

      case "resources/list":
        return { jsonrpc: "2.0", id, result: { resources: listResources() } };

      case "resources/read": {
        const p = params as { uri: string };
        const contents = readResource(p.uri);
        return { jsonrpc: "2.0", id, result: { contents } };
      }

      case "resources/templates/list":
        return { jsonrpc: "2.0", id, result: { resourceTemplates: [] } };

      case "prompts/list":
        return { jsonrpc: "2.0", id, result: { prompts: [] } };

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { jsonrpc: "2.0", id, error: { code: -32603, message } };
  }
}

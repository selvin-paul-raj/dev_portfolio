// lib/mcp/server.ts
import type { McpRequest, McpResponse } from "./types";
import { listTools, handleToolCall } from "./tools";
import { listResources, readResource } from "./resources";
import { createMcpHandler } from "./router";

const handleMcpRequest: (body: McpRequest) => Promise<McpResponse> = createMcpHandler({
  listTools,
  callTool: handleToolCall,
  listResources,
  readResource,
});

export { handleMcpRequest };

// lib/mcp/server.ts
import { listTools, handleToolCall } from "./tools";
import { listResources, readResource } from "./resources";
import { createMcpHandler } from "./router";

const handleMcpRequest = createMcpHandler({
  listTools,
  callTool: handleToolCall,
  listResources,
  readResource,
});

export { handleMcpRequest };
export { parseErrorResponse } from "./router";

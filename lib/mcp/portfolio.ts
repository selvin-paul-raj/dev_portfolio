// lib/mcp/portfolio.ts
// Binds the protocol handlers to injected portfolio data. Both entry points
// call createPortfolioHandlers: the Next.js route with bundled JSON imports
// (lib/mcp/server.ts), the Alpic server with files read from dist/data.
import { TOOLS } from "./catalog";
import { PROMPT_DEFS, RESOURCE_DEFS, RESOURCE_TEMPLATES } from "./definitions";
import { buildResourceText } from "./dispatch";
import type { PortfolioData } from "./dispatch";
import { getPrompt } from "./prompts";
import { createToolCaller } from "./tools";
import type { ToolOptions } from "./tools";
import type { McpHandlers } from "./router";

export function createPortfolioHandlers(data: PortfolioData, options: ToolOptions = {}): McpHandlers {
  return {
    listTools: () => TOOLS,
    callTool: createToolCaller(data, options),
    listResources: () => RESOURCE_DEFS,
    listResourceTemplates: () => RESOURCE_TEMPLATES,
    readResource: (uri) => [{ uri, mimeType: "application/json", text: buildResourceText(uri, data) }],
    listPrompts: () => PROMPT_DEFS,
    getPrompt,
  };
}

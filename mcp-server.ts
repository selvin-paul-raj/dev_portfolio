// mcp-server.ts — Standalone MCP 2024-11-05 HTTP server for Alpic.ai
// Same resources + tools as /api/mcp (Next.js/Vercel) — both entry points
// share their tool/resource definitions and dispatch logic from lib/mcp/*, so
// they cannot drift apart. Only the transport (raw Node http server) and data
// loading (readFileSync from a copied dist/data/, vs. Next.js JSON imports)
// are standalone-specific.
// Compiled to dist/mcp-server.js by tsconfig.server.json.
// Data files are copied to dist/data/ during build (see build:mcp in package.json).

import { createServer } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { TOOLS, RESOURCE_DEFS } from "./lib/mcp/definitions";
import {
  searchProjects,
  getProjectByTitle,
  filterCertifications,
  getProfileSummary,
  buildResourceText,
} from "./lib/mcp/dispatch";
import type { Project, Certification, ResourceData } from "./lib/mcp/dispatch";
import { sendContactMessage } from "./lib/mcp/contact";
import { listRepos, getRepo } from "./lib/mcp/github";
import { createMcpHandler } from "./lib/mcp/router";
import type { McpRequest, McpResponse } from "./lib/mcp/types";

// ── Data ──────────────────────────────────────────────────────────────────────
const DATA = join(__dirname, "data");

function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(DATA, `${name}.json`), "utf8")) as T;
}

const projects = load<Project[]>("projects");
const skills = load<unknown>("skills");
const experiences = load<unknown>("experiences");
const certifications = load<Certification[]>("certifications");
const recognition = load<unknown>("recognition");

const RESOURCE_DATA: ResourceData = { projects, skills, experiences, certifications, recognition };

// ── Tool dispatch ─────────────────────────────────────────────────────────────
async function callTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "search_projects":
      return searchProjects(projects, args as { query?: string; category?: string; tech?: string });
    case "get_project_by_title":
      return getProjectByTitle(projects, args.title as string | undefined);
    case "list_github_repos": {
      const repos = await listRepos({
        per_page: (args.per_page as number) ?? 20,
        page: (args.page as number) ?? 1,
        sort: (args.sort as "updated" | "created" | "pushed" | "full_name") ?? "updated",
      });
      return JSON.stringify({ count: repos.length, repos }, null, 2);
    }
    case "get_github_repo": {
      const repo = await getRepo(args.repo as string);
      return JSON.stringify(repo, null, 2);
    }
    case "filter_certifications":
      return filterCertifications(certifications, args as { category?: string; issuer?: string });
    case "get_profile_summary":
      return getProfileSummary(projects, certifications);
    case "contact_selvin":
      return sendContactMessage(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const handleMcpRequest: (body: McpRequest) => Promise<McpResponse> = createMcpHandler({
  listTools: () => TOOLS,
  callTool: async (name, args) => ({ content: [{ type: "text", text: await callTool(name, args) }] }),
  listResources: () => RESOURCE_DEFS,
  readResource: (uri) => [
    { uri, mimeType: "application/json", type: "text", text: buildResourceText(uri, RESOURCE_DATA) },
  ],
});

// ── HTTP Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const httpServer = createServer((req, res) => {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(JSON.stringify({
      name: "Selvin PaulRaj K — Portfolio MCP Server",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      transport: "http",
      resources: RESOURCE_DEFS.map((r) => r.uri),
      tools: TOOLS.map((t) => t.name),
    }));
    return;
  }

  if (req.method === "POST") {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", async () => {
      let body: McpRequest;
      try { body = JSON.parse(Buffer.concat(chunks).toString()); }
      catch {
        res.setHeader("Content-Type", "application/json"); res.writeHead(400);
        res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }));
        return;
      }
      const response = await handleMcpRequest(body);
      res.setHeader("Content-Type", "application/json"); res.writeHead(200);
      res.end(JSON.stringify(response));
    });
    return;
  }

  res.writeHead(405); res.end();
});

httpServer.listen(PORT, () => {
  console.log(`Portfolio MCP server listening on port ${PORT}`);
});

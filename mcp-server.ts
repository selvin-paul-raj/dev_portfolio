// mcp-server.ts: standalone MCP Streamable HTTP server for Alpic.ai.
// Same tools, resources, and prompts as /api/mcp (Next.js/Vercel): both entry
// points bind lib/mcp/portfolio.ts's handlers and lib/mcp/router.ts's HTTP
// rules to their own data, so they cannot drift apart. Only the transport (raw
// Node http server) and data loading (readFileSync from a copied dist/data/,
// vs. Next.js JSON imports) are standalone-specific.
// Compiled to dist/mcp-server.js by tsconfig.server.json.
// Data files are copied to dist/data/ during build (see build:mcp in package.json).

import { createServer } from "http";
import type { IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { createPortfolioHandlers } from "./lib/mcp/portfolio";
import { createMcpHttpHandler, getReply, MAX_BODY_BYTES, tooLargeReply } from "./lib/mcp/router";
import type { HttpReply } from "./lib/mcp/router";
import type { PortfolioData } from "./lib/mcp/dispatch";
import { getClientIp } from "./lib/rateLimit";

// ── Data ──────────────────────────────────────────────────────────────────────
const DATA = join(__dirname, "data");

function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(DATA, `${name}.json`), "utf8")) as T;
}

const data: PortfolioData = {
  projects: load("projects"),
  skills: load("skills"),
  experiences: load("experiences"),
  certifications: load("certifications"),
  recognition: load("recognition"),
  caseStudies: load("caseStudies"),
  evals: load("evals"),
  evalsHistory: load("evals-history"),
};

const handlers = createPortfolioHandlers(data);
const handlePost = createMcpHttpHandler(handlers);

// ── HTTP Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

function header(req: IncomingMessage, name: string): string | undefined {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] : v;
}

function send(res: ServerResponse, reply: HttpReply): void {
  for (const [k, v] of Object.entries(reply.headers ?? {})) res.setHeader(k, v);
  if (reply.body === null) {
    res.writeHead(reply.status);
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.writeHead(reply.status);
  res.end(JSON.stringify(reply.body));
}

function endpointOf(req: IncomingMessage): string {
  return `https://${header(req, "host") ?? "localhost"}/`;
}

function handlePostRequest(req: IncomingMessage, res: ServerResponse): void {
  if (Number(header(req, "content-length")) > MAX_BODY_BYTES) {
    send(res, tooLargeReply());
    req.resume();
    return;
  }
  const chunks: Buffer[] = [];
  let size = 0;
  req.on("data", (c: Buffer) => {
    size += c.length;
    if (size > MAX_BODY_BYTES) {
      if (!res.headersSent) send(res, tooLargeReply());
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on("end", async () => {
    if (res.writableEnded) return;
    const ip = getClientIp((h) => header(req, h));
    const reply = await handlePost(Buffer.concat(chunks).toString("utf8"), {
      ip: ip === "unknown" ? (req.socket.remoteAddress ?? ip) : ip,
      protocolVersion: header(req, "mcp-protocol-version") ?? null,
    });
    send(res, reply);
  });
}

const httpServer = createServer((req, res) => {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);

  switch (req.method) {
    case "OPTIONS":
      res.writeHead(204);
      res.end();
      return;
    case "GET":
      send(res, getReply(handlers, header(req, "accept") ?? null, endpointOf(req)));
      return;
    case "POST":
      handlePostRequest(req, res);
      return;
    default:
      res.setHeader("Allow", "GET, POST, OPTIONS");
      res.writeHead(405);
      res.end();
  }
});

httpServer.listen(PORT, () => {
  process.stdout.write(`Portfolio MCP server listening on port ${PORT}\n`);
});

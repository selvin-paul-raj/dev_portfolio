// mcp-server.ts — Standalone MCP 2024-11-05 HTTP server for Alpic.ai
// Same 6 resources + 7 tools as /api/mcp (Next.js/Vercel).
// Compiled to dist/mcp-server.js by tsconfig.server.json.
// Data files are copied to dist/data/ during build (see build:mcp in package.json).

import { createServer } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { Resend } from "resend";

// ── Data ──────────────────────────────────────────────────────────────────────
const DATA = join(__dirname, "data");
type AnyObj = Record<string, unknown>;

function load<T = AnyObj[]>(name: string): T {
  return JSON.parse(readFileSync(join(DATA, `${name}.json`), "utf8")) as T;
}

const projects = load<AnyObj[]>("projects").filter((p) => p.show);
const skills    = load("skills");
const experiences = load("experiences");
const certifications = load<AnyObj[]>("certifications").filter((c) => c.show);
const recognition = load("recognition");

const PROFILE = {
  name: "Selvin PaulRaj K",
  role: "AI Engineer",
  location: "Chennai, Tamil Nadu, India",
  email: "selvinpaulgomathi@gmail.com",
  portfolio: "https://selvinpaulraj.vercel.app",
  github: "https://github.com/selvin-paul-raj",
  linkedin: "https://linkedin.com/in/selvinpaulraj",
  summary: "AI Engineer specializing in AI Agents, MCP servers, RAG systems, LangGraph pipelines, and agentic workflows.",
  currentCompany: "Zinnov / Draup",
  currentRole: "Associate Data Analyst — AI Automation",
  education: "M.E Computer Science (AI), Kings Engineering College",
  expertise: [
    "AI Agents & Agentic Systems", "Model Context Protocol (MCP)",
    "LangGraph / LangChain", "RAG / Vector Databases",
    "LLM Engineering (Claude, GPT-4, Gemini)", "Next.js / React", "Python / FastAPI",
  ],
};

// ── Tools ─────────────────────────────────────────────────────────────────────
const TOOLS = [
  { name: "search_projects",
    description: "Search Selvin's projects by keyword, category, or tech.",
    inputSchema: { type: "object", properties: {
      query:    { type: "string", description: "Keyword in title/description/tags" },
      category: { type: "string", description: "'web' | 'ai' | 'tool' | 'android'" },
      tech:     { type: "string", description: "Tech tag, e.g. 'LangGraph', 'Python'" },
    }}},
  { name: "get_project_by_title",
    description: "Get a project by partial title match.",
    inputSchema: { type: "object", required: ["title"],
      properties: { title: { type: "string", description: "Partial project title" } }}},
  { name: "list_github_repos",
    description: "Live GitHub repo stats for selvin-paul-raj.",
    inputSchema: { type: "object", properties: {
      per_page: { type: "number", description: "Max 100, default 20" },
      page:     { type: "number", description: "Page number, default 1" },
      sort:     { type: "string", description: "'updated' | 'created' | 'pushed'" },
    }}},
  { name: "get_github_repo",
    description: "Full details for one GitHub repo.",
    inputSchema: { type: "object", required: ["repo"],
      properties: { repo: { type: "string", description: "Repo name, e.g. 'Linkedin-MCP-Server'" } }}},
  { name: "filter_certifications",
    description: "Filter certifications by category or issuer.",
    inputSchema: { type: "object", properties: {
      category: { type: "string", description: "'AI Engineering' | 'Web Development' | 'Technology'" },
      issuer:   { type: "string", description: "'Anthropic' | 'Hugging Face' | 'IBM' | 'LinkedIn'" },
    }}},
  { name: "get_profile_summary",
    description: "Full professional profile + portfolio stats.",
    inputSchema: { type: "object", properties: {} }},
  { name: "contact_selvin",
    description: "Send Selvin an email. Use when the user wants to hire or collaborate.",
    inputSchema: { type: "object", required: ["name", "email", "message"], properties: {
      name:    { type: "string", description: "Sender name" },
      email:   { type: "string", description: "Sender email" },
      message: { type: "string", description: "Message content, max 5000 chars" },
    }}},
];

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const GH_HEADERS = () => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

async function callTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "search_projects": {
      const q = (args.query as string | undefined)?.toLowerCase() ?? "";
      const c = args.category as string | undefined;
      const t = (args.tech as string | undefined)?.toLowerCase();
      let r = projects;
      if (q) r = r.filter((p) => [p.title, p.description, ...(p.tags as string[])]
                                    .some((s) => String(s).toLowerCase().includes(q)));
      if (c && c !== "all") r = r.filter((p) => (p.categories as string[]).includes(c));
      if (t) r = r.filter((p) => (p.tags as string[]).some((s) => s.toLowerCase().includes(t)));
      return JSON.stringify({ count: r.length, projects: r }, null, 2);
    }
    case "get_project_by_title": {
      const q = (args.title as string).toLowerCase();
      const p = projects.find((p) => (p.title as string).toLowerCase().includes(q));
      return p ? JSON.stringify(p, null, 2)
               : JSON.stringify({ error: `No project matching "${args.title}"` });
    }
    case "list_github_repos": {
      const pp = (args.per_page as number) ?? 20;
      const pg = (args.page as number) ?? 1;
      const so = (args.sort as string) ?? "updated";
      const res = await fetch(
        `https://api.github.com/users/selvin-paul-raj/repos?per_page=${pp}&page=${pg}&sort=${so}&type=public`,
        { headers: GH_HEADERS() }
      );
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = (await res.json()) as AnyObj[];
      const repos = data.map((r) => ({
        name: r.name, description: r.description, language: r.language,
        stars: r.stargazers_count, forks: r.forks_count, url: r.html_url,
        topics: r.topics, updatedAt: r.updated_at,
      }));
      return JSON.stringify({ count: repos.length, repos }, null, 2);
    }
    case "get_github_repo": {
      const res = await fetch(
        `https://api.github.com/repos/selvin-paul-raj/${args.repo}`,
        { headers: GH_HEADERS() }
      );
      if (!res.ok) throw new Error(`Repo not found: ${args.repo}`);
      const r = await res.json() as AnyObj;
      return JSON.stringify({
        name: r.name, description: r.description, language: r.language,
        stars: r.stargazers_count, forks: r.forks_count, url: r.html_url,
        topics: r.topics, homepage: r.homepage,
        license: (r.license as AnyObj | null)?.name ?? null,
        createdAt: r.created_at, updatedAt: r.updated_at,
      }, null, 2);
    }
    case "filter_certifications": {
      let c = certifications;
      if (args.category) {
        const cat = (args.category as string).toLowerCase();
        c = c.filter((x) => (x.category as string).toLowerCase().includes(cat));
      }
      if (args.issuer) {
        const iss = (args.issuer as string).toLowerCase();
        c = c.filter((x) => (x.issuer as string).toLowerCase().includes(iss));
      }
      return JSON.stringify({ count: c.length, certifications: c }, null, 2);
    }
    case "get_profile_summary":
      return JSON.stringify({
        ...PROFILE,
        totalVisibleProjects: projects.length,
        totalCertifications: certifications.length,
        mcpEndpoint: "https://selvinpaulraj.vercel.app/api/mcp",
      }, null, 2);
    case "contact_selvin": {
      const { name, email, message } = args as { name: string; email: string; message: string };
      if (!name?.trim())         return JSON.stringify({ error: "name required" });
      if (!email?.includes("@")) return JSON.stringify({ error: "valid email required" });
      if (!message?.trim())      return JSON.stringify({ error: "message required" });
      if (message.length > 5000) return JSON.stringify({ error: "message too long (max 5000)" });
      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: "SPR Portfolio MCP <onboarding@resend.dev>",
          to: "selvinpaulgomathi@gmail.com",
          subject: `[MCP Contact] ${name}`,
          replyTo: email,
          html: `<h2>Portfolio MCP</h2><p><strong>From:</strong> ${escHtml(name)} (${escHtml(email)})</p><hr/><p>${escHtml(message).replace(/\n/g, "<br>")}</p>`,
        });
      } catch {
        return JSON.stringify({ error: "Failed to send. Please try again." });
      }
      return JSON.stringify({ success: true, message: `Message sent. Selvin will reply to ${email}.` });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── Resources ─────────────────────────────────────────────────────────────────
const RESOURCES = [
  { uri: "selvin://profile",        name: "Professional Profile",  mimeType: "application/json" },
  { uri: "selvin://projects",       name: "Projects (44+)",        mimeType: "application/json" },
  { uri: "selvin://skills",         name: "Technical Skills",      mimeType: "application/json" },
  { uri: "selvin://experience",     name: "Work & Education",      mimeType: "application/json" },
  { uri: "selvin://certifications", name: "Certifications (20+)",  mimeType: "application/json" },
  { uri: "selvin://recognition",    name: "Recognition & Awards",  mimeType: "application/json" },
];

function readResource(uri: string): string {
  switch (uri) {
    case "selvin://profile":        return JSON.stringify(PROFILE, null, 2);
    case "selvin://projects":       return JSON.stringify(projects, null, 2);
    case "selvin://skills":         return JSON.stringify(skills, null, 2);
    case "selvin://experience":     return JSON.stringify(experiences, null, 2);
    case "selvin://certifications": return JSON.stringify(certifications, null, 2);
    case "selvin://recognition":    return JSON.stringify(recognition, null, 2);
    default: throw new Error(`Resource not found: ${uri}`);
  }
}

// ── JSON-RPC Router ───────────────────────────────────────────────────────────
type McpReq = { jsonrpc: "2.0"; id: string | number | null; method: string; params?: Record<string, unknown> };

async function handle(body: McpReq): Promise<unknown> {
  const { method, params, id } = body;
  try {
    switch (method) {
      case "initialize":
        return { jsonrpc: "2.0", id, result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false }, resources: { listChanged: false }, prompts: {} },
          serverInfo: { name: "selvin-portfolio-mcp", version: "1.0.0" },
          instructions: "Selvin PaulRaj K portfolio — AI Engineer from Chennai specialising in MCP, LangGraph, RAG.",
        }};
      case "ping":
        return { jsonrpc: "2.0", id, result: {} };
      case "notifications/initialized":
        return { jsonrpc: "2.0", id: null, result: null };
      case "tools/list":
        return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
      case "tools/call": {
        if (!params) return { jsonrpc: "2.0", id, error: { code: -32602, message: "params required" } };
        const p = params as { name: string; arguments?: Record<string, unknown> };
        const text = await callTool(p.name, p.arguments ?? {});
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } };
      }
      case "resources/list":
        return { jsonrpc: "2.0", id, result: { resources: RESOURCES } };
      case "resources/read": {
        if (!params) return { jsonrpc: "2.0", id, error: { code: -32602, message: "params required" } };
        const { uri } = params as { uri: string };
        return { jsonrpc: "2.0", id, result: {
          contents: [{ uri, mimeType: "application/json", type: "text", text: readResource(uri) }],
        }};
      }
      case "resources/templates/list":
        return { jsonrpc: "2.0", id, result: { resourceTemplates: [] } };
      case "prompts/list":
        return { jsonrpc: "2.0", id, result: { prompts: [] } };
      default:
        return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
    }
  } catch (err) {
    return { jsonrpc: "2.0", id, error: { code: -32603, message: err instanceof Error ? err.message : String(err) } };
  }
}

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
      resources: RESOURCES.map((r) => r.uri),
      tools: TOOLS.map((t) => t.name),
    }));
    return;
  }

  if (req.method === "POST") {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", async () => {
      let body: McpReq;
      try { body = JSON.parse(Buffer.concat(chunks).toString()); }
      catch {
        res.setHeader("Content-Type", "application/json"); res.writeHead(400);
        res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }));
        return;
      }
      const response = await handle(body);
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

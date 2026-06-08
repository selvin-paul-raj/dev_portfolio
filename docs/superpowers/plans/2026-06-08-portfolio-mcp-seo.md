# Portfolio MCP Server + SEO/AIO/GEO Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Selvin PaulRaj K's Next.js portfolio into a fully MCP-enabled server exposing profile, projects, skills, experience, certifications, and live GitHub data as resources and tools — then add `llms.txt`/`ai.txt`/structured-data upgrades for AIO/GEO discoverability, a visual "MCP Enabled" badge, and prepare a Skybridge SPEC for Alpic.ai deployment.

**Architecture:** A hand-rolled JSON-RPC 2.0 handler at `app/api/mcp/route.ts` implements the MCP 2024-11-05 protocol directly (no SDK transport layer — cleaner for Next.js App Router). Resources read from the existing `lib/data/*.json` files. Tools use those same files plus the GitHub REST API (authenticated via `GITHUB_TOKEN` env var) and Resend (already in the project) for the `contact_selvin` tool.

**Tech Stack:** Next.js 16 App Router, TypeScript 5, existing `lib/data/*.json`, GitHub REST API, Resend (already installed), `public/` static files.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/mcp/types.ts` | JSON-RPC + MCP type interfaces |
| Create | `lib/mcp/resources.ts` | Resource list + read handlers |
| Create | `lib/mcp/github.ts` | GitHub REST API client (cached) |
| Create | `lib/mcp/tools.ts` | Tool list + call dispatcher |
| Create | `lib/mcp/server.ts` | JSON-RPC router (method → handler) |
| Create | `app/api/mcp/route.ts` | Next.js route: GET (discovery) + POST (MCP) + OPTIONS (CORS) |
| Create | `components/McpBadge.tsx` | "MCP Enabled" floating badge with copy-endpoint tooltip |
| Modify | `app/layout.tsx` | Add `<McpBadge />` + `SoftwareApplication` JSON-LD + discovery link-rels |
| Create | `public/llms.txt` | LLM-readable profile + MCP manifest (standard AI indexer format) |
| Create | `public/ai.txt` | AI discovery file |
| Create | `public/.well-known/ai-plugin.json` | OpenAI/plugin-compatible manifest |
| Create | `public/.well-known/mcp.json` | MCP server discovery manifest |
| Create | `SPEC.md` | Skybridge app spec for Alpic.ai deployment |
| Modify | `.env.local` | Add `GITHUB_TOKEN` |

---

## Task 1: Add Environment Variable

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add GITHUB_TOKEN to .env.local**

Open `.env.local` and append:

```
GITHUB_TOKEN=your_github_personal_access_token_here
```

Use a classic PAT or fine-grained token with `public_repo` read scope. The portfolio only reads public repos so no write scopes needed.

- [ ] **Step 2: Verify the dev server starts**

```bash
npm run dev
```

Expected: Dev server starts at localhost:3000 with no errors.

- [ ] **Step 3: Commit**

```bash
git add .env.local
git commit -m "chore: add GITHUB_TOKEN env var for MCP GitHub integration"
```

---

## Task 2: MCP Type Interfaces

**Files:**
- Create: `lib/mcp/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// lib/mcp/types.ts
export interface McpRequest {
  jsonrpc: "2.0";
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpContent {
  uri: string;
  mimeType: string;
  text: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/mcp/types.ts
git commit -m "feat(mcp): add JSON-RPC + MCP type interfaces"
```

---

## Task 3: MCP Resource Handlers

**Files:**
- Create: `lib/mcp/resources.ts`

- [ ] **Step 1: Create the resources file**

```typescript
// lib/mcp/resources.ts
import type { McpResource, McpContent } from "./types";
import projects from "@/lib/data/projects.json";
import skills from "@/lib/data/skills.json";
import experiences from "@/lib/data/experiences.json";
import certifications from "@/lib/data/certifications.json";
import recognition from "@/lib/data/recognition.json";

const PROFILE = {
  name: "Selvin PaulRaj K",
  role: "AI Engineer",
  location: "Chennai, Tamil Nadu, India",
  email: "selvinpaulgomathi@gmail.com",
  portfolio: "https://selvinpaulraj.vercel.app",
  github: "https://github.com/selvin-paul-raj",
  linkedin: "https://linkedin.com/in/selvinpaulraj",
  summary:
    "AI Engineer specializing in intelligent AI Agents, MCP servers, RAG systems, LangGraph multi-agent pipelines, and agentic workflows. Full-stack MERN/Next.js expertise.",
  currentCompany: "Zinnov / Draup",
  currentRole: "Associate Data Analyst — AI Automation",
  education: "M.E Computer Science with AI, Kings Engineering College",
  expertise: [
    "AI Agents & Agentic Systems",
    "Model Context Protocol (MCP)",
    "LangGraph / LangChain",
    "Retrieval-Augmented Generation (RAG)",
    "LLM Engineering (Claude, GPT-4, Gemini)",
    "Vector Databases (FAISS, Chroma)",
    "Next.js / React",
    "Python / FastAPI",
    "Node.js",
  ],
};

export function listResources(): McpResource[] {
  return [
    {
      uri: "selvin://profile",
      name: "Professional Profile",
      description: "Bio, contact info, social links, and expertise areas",
      mimeType: "application/json",
    },
    {
      uri: "selvin://projects",
      name: "Projects",
      description: "44+ projects including AI agents, MCP servers, web apps, and tools",
      mimeType: "application/json",
    },
    {
      uri: "selvin://skills",
      name: "Technical Skills",
      description: "Complete list of technical skills and technologies",
      mimeType: "application/json",
    },
    {
      uri: "selvin://experience",
      name: "Work & Education",
      description: "Professional history and educational background",
      mimeType: "application/json",
    },
    {
      uri: "selvin://certifications",
      name: "Certifications",
      description: "20+ professional certifications from Anthropic, Hugging Face, IBM, LinkedIn, and more",
      mimeType: "application/json",
    },
    {
      uri: "selvin://recognition",
      name: "Recognition & Awards",
      description: "Awards, recognition, and achievements",
      mimeType: "application/json",
    },
  ];
}

export function readResource(uri: string): McpContent[] {
  return [{ uri, mimeType: "application/json", text: getResourceText(uri) }];
}

function getResourceText(uri: string): string {
  switch (uri) {
    case "selvin://profile":
      return JSON.stringify(PROFILE, null, 2);
    case "selvin://projects":
      return JSON.stringify(
        (projects as Array<{ show: boolean } & Record<string, unknown>>).filter((p) => p.show),
        null,
        2
      );
    case "selvin://skills":
      return JSON.stringify(skills, null, 2);
    case "selvin://experience":
      return JSON.stringify(experiences, null, 2);
    case "selvin://certifications":
      return JSON.stringify(
        (certifications as Array<{ show: boolean } & Record<string, unknown>>).filter((c) => c.show),
        null,
        2
      );
    case "selvin://recognition":
      return JSON.stringify(recognition, null, 2);
    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/mcp/resources.ts
git commit -m "feat(mcp): add resource handlers for all portfolio data"
```

---

## Task 4: GitHub API Client

**Files:**
- Create: `lib/mcp/github.ts`

- [ ] **Step 1: Create the GitHub client**

```typescript
// lib/mcp/github.ts
const API = "https://api.github.com";
const OWNER = "selvin-paul-raj";

interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at: string;
  created_at: string;
  topics: string[];
  homepage: string | null;
  open_issues_count: number;
  watchers_count: number;
  default_branch: string;
  license: { name: string } | null;
}

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function shape(r: GithubRepo) {
  return {
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.watchers_count,
    openIssues: r.open_issues_count,
    url: r.html_url,
    homepage: r.homepage,
    topics: r.topics,
    defaultBranch: r.default_branch,
    license: r.license?.name ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listRepos({
  per_page = 20,
  page = 1,
  sort = "updated",
}: {
  per_page?: number;
  page?: number;
  sort?: string;
} = {}): Promise<ReturnType<typeof shape>[]> {
  const url = `${API}/users/${OWNER}/repos?per_page=${per_page}&page=${page}&sort=${sort}&type=public`;
  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const data: GithubRepo[] = await res.json();
  return data.map(shape);
}

export async function getRepo(repo: string): Promise<ReturnType<typeof shape>> {
  const url = `${API}/repos/${OWNER}/${repo}`;
  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Repo not found: ${repo} (${res.status})`);
  const data: GithubRepo = await res.json();
  return shape(data);
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/mcp/github.ts
git commit -m "feat(mcp): add GitHub REST API client with 1h cache"
```

---

## Task 5: MCP Tool Handlers

**Files:**
- Create: `lib/mcp/tools.ts`

- [ ] **Step 1: Create the tools file**

```typescript
// lib/mcp/tools.ts
import type { McpTool } from "./types";
import { listRepos, getRepo } from "./github";
import { Resend } from "resend";
import projectsData from "@/lib/data/projects.json";
import certificationsData from "@/lib/data/certifications.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projects = projectsData as any[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const certifications = certificationsData as any[];

export function listTools(): McpTool[] {
  return [
    {
      name: "search_projects",
      description:
        "Search and filter Selvin's projects by keyword, technology, or category. Returns matching visible projects.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keyword to match in title, description, or tags" },
          category: { type: "string", description: "Category filter: 'web', 'ai', 'tool', 'android'" },
          tech: { type: "string", description: "Technology tag to match (e.g. 'LangGraph', 'Python', 'Next.js')" },
        },
      },
    },
    {
      name: "get_project_by_title",
      description: "Get a specific project by its title. Accepts partial matches.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Project title (partial match supported)" },
        },
        required: ["title"],
      },
    },
    {
      name: "list_github_repos",
      description:
        "List Selvin's public GitHub repositories with live stats: stars, forks, language, topics, last updated.",
      inputSchema: {
        type: "object",
        properties: {
          per_page: { type: "number", description: "Results per page, max 100 (default: 20)" },
          page: { type: "number", description: "Page number (default: 1)" },
          sort: { type: "string", description: "Sort by 'updated', 'stars', or 'created' (default: 'updated')" },
        },
      },
    },
    {
      name: "get_github_repo",
      description: "Get full details for a specific GitHub repository by name.",
      inputSchema: {
        type: "object",
        properties: {
          repo: { type: "string", description: "Repository name, e.g. 'Linkedin-MCP-Server'" },
        },
        required: ["repo"],
      },
    },
    {
      name: "filter_certifications",
      description: "Filter Selvin's certifications by category and/or issuer.",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "'AI Engineering', 'Web Development', 'Technology', 'Cloud Computing', 'Data Science'",
          },
          issuer: {
            type: "string",
            description: "Issuer name (e.g. 'Anthropic', 'Hugging Face', 'LinkedIn', 'IBM')",
          },
        },
      },
    },
    {
      name: "get_profile_summary",
      description:
        "Get a comprehensive summary of Selvin's professional profile, expertise, and portfolio stats.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "contact_selvin",
      description:
        "Send a contact message to Selvin via email. Use when the user wants to hire, collaborate, or ask a question.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Sender's full name" },
          email: { type: "string", description: "Sender's email address" },
          message: { type: "string", description: "The message to send to Selvin (max 5000 chars)" },
        },
        required: ["name", "email", "message"],
      },
    },
  ];
}

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const text = await dispatch(name, args);
  return { content: [{ type: "text", text }] };
}

async function dispatch(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "search_projects": {
      const query = (args.query as string | undefined)?.toLowerCase() ?? "";
      const category = args.category as string | undefined;
      const tech = (args.tech as string | undefined)?.toLowerCase();

      let results = projects.filter((p) => p.show);
      if (query) {
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            (p.tags as string[]).some((t) => t.toLowerCase().includes(query))
        );
      }
      if (category && category !== "all") {
        results = results.filter((p) => (p.categories as string[]).includes(category));
      }
      if (tech) {
        results = results.filter((p) =>
          (p.tags as string[]).some((t) => t.toLowerCase().includes(tech))
        );
      }
      return JSON.stringify({ count: results.length, projects: results }, null, 2);
    }

    case "get_project_by_title": {
      const query = (args.title as string).toLowerCase();
      const project = projects.find((p) => p.show && p.title.toLowerCase().includes(query));
      if (!project) return JSON.stringify({ error: `No project found matching "${args.title}"` });
      return JSON.stringify(project, null, 2);
    }

    case "list_github_repos": {
      const repos = await listRepos({
        per_page: (args.per_page as number) ?? 20,
        page: (args.page as number) ?? 1,
        sort: (args.sort as string) ?? "updated",
      });
      return JSON.stringify({ count: repos.length, repos }, null, 2);
    }

    case "get_github_repo": {
      const repo = await getRepo(args.repo as string);
      return JSON.stringify(repo, null, 2);
    }

    case "filter_certifications": {
      let certs = certifications.filter((c) => c.show);
      if (args.category) {
        const cat = (args.category as string).toLowerCase();
        certs = certs.filter((c) => c.category.toLowerCase().includes(cat));
      }
      if (args.issuer) {
        const iss = (args.issuer as string).toLowerCase();
        certs = certs.filter((c) => c.issuer.toLowerCase().includes(iss));
      }
      return JSON.stringify({ count: certs.length, certifications: certs }, null, 2);
    }

    case "get_profile_summary": {
      const visibleProjects = projects.filter((p) => p.show);
      const visibleCerts = certifications.filter((c) => c.show);
      return JSON.stringify(
        {
          name: "Selvin PaulRaj K",
          role: "AI Engineer",
          location: "Chennai, Tamil Nadu, India",
          email: "selvinpaulgomathi@gmail.com",
          portfolio: "https://selvinpaulraj.vercel.app",
          github: "https://github.com/selvin-paul-raj",
          linkedin: "https://linkedin.com/in/selvinpaulraj",
          summary:
            "AI Engineer specializing in intelligent AI Agents, MCP servers, RAG systems, LangGraph multi-agent pipelines, and agentic workflows.",
          currentCompany: "Zinnov / Draup",
          education: "M.E CSE (AI), Kings Engineering College",
          totalVisibleProjects: visibleProjects.length,
          totalCertifications: visibleCerts.length,
          topTechnologies: [
            "LangGraph",
            "MCP",
            "RAG",
            "Next.js",
            "Python",
            "FastAPI",
            "LangChain",
            "Claude",
            "GPT-4",
          ],
          mcpEndpoint: "https://selvinpaulraj.vercel.app/api/mcp",
        },
        null,
        2
      );
    }

    case "contact_selvin": {
      const { name, email, message } = args as { name: string; email: string; message: string };

      if (!name?.trim()) return JSON.stringify({ error: "name is required" });
      if (!email?.includes("@")) return JSON.stringify({ error: "valid email is required" });
      if (!message?.trim()) return JSON.stringify({ error: "message is required" });
      if (message.length > 5000) return JSON.stringify({ error: "message too long (max 5000 chars)" });

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "SPR Portfolio MCP <onboarding@resend.dev>",
        to: "selvinpaulgomathi@gmail.com",
        subject: `[MCP Contact] ${name}`,
        replyTo: email,
        html: `<h2>New message via Portfolio MCP</h2><p><strong>From:</strong> ${name} (${email})</p><hr/><p>${message.replace(/\n/g, "<br>")}</p>`,
      });

      return JSON.stringify({
        success: true,
        message: `Message sent to Selvin from ${name}. He'll reply to ${email} soon.`,
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/mcp/tools.ts
git commit -m "feat(mcp): add tool handlers — search, GitHub, certs, contact"
```

---

## Task 6: MCP JSON-RPC Router

**Files:**
- Create: `lib/mcp/server.ts`

- [ ] **Step 1: Create the router**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/mcp/server.ts
git commit -m "feat(mcp): add JSON-RPC router — dispatches all MCP 2024-11-05 methods"
```

---

## Task 7: MCP HTTP Route Handler

**Files:**
- Create: `app/api/mcp/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// app/api/mcp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleMcpRequest } from "@/lib/mcp/server";
import type { McpRequest } from "@/lib/mcp/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** Discovery endpoint — returns server manifest */
export function GET() {
  return NextResponse.json(
    {
      name: "Selvin PaulRaj K — Portfolio MCP Server",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      transport: "http (JSON-RPC 2.0)",
      description:
        "MCP server exposing Selvin's portfolio: projects, skills, experience, certifications, and live GitHub repos.",
      endpoint: "https://selvinpaulraj.vercel.app/api/mcp",
      resources: [
        "selvin://profile",
        "selvin://projects",
        "selvin://skills",
        "selvin://experience",
        "selvin://certifications",
        "selvin://recognition",
      ],
      tools: [
        "search_projects",
        "get_project_by_title",
        "list_github_repos",
        "get_github_repo",
        "filter_certifications",
        "get_profile_summary",
        "contact_selvin",
      ],
    },
    { headers: CORS }
  );
}

/** MCP JSON-RPC handler */
export async function POST(req: NextRequest) {
  let body: McpRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error: invalid JSON" } },
      { status: 400, headers: CORS }
    );
  }

  const response = await handleMcpRequest(body);
  return NextResponse.json(response, { headers: CORS });
}

/** CORS preflight */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
```

- [ ] **Step 2: Start dev server and test discovery**

```bash
npm run dev
```

Second terminal:

```bash
curl http://localhost:3000/api/mcp
```

Expected: JSON object with `name`, `tools` (7 items), `resources` (6 items).

- [ ] **Step 3: Test initialize**

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}'
```

Expected: `result.serverInfo.name` = `"selvin-portfolio-mcp"`.

- [ ] **Step 4: Test tools/list**

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

Expected: `result.tools` array with 7 tools.

- [ ] **Step 5: Test resources/read for profile**

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"selvin://profile"}}'
```

Expected: `result.contents[0].text` is JSON string with `name: "Selvin PaulRaj K"`.

- [ ] **Step 6: Test search_projects tool**

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"search_projects","arguments":{"tech":"MCP"}}}'
```

Expected: `result.content[0].text` is JSON with projects that have "MCP" in tags.

- [ ] **Step 7: Test list_github_repos**

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"list_github_repos","arguments":{"per_page":5}}}'
```

Expected: `result.content[0].text` is JSON with up to 5 repos from `selvin-paul-raj`.

- [ ] **Step 8: Commit**

```bash
git add app/api/mcp/route.ts
git commit -m "feat(mcp): add HTTP MCP endpoint with CORS + discovery GET"
```

---

## Task 8: McpBadge Portfolio Component

**Files:**
- Create: `components/McpBadge.tsx`

- [ ] **Step 1: Create the badge**

```tsx
// components/McpBadge.tsx
"use client";
import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

const ENDPOINT = "https://selvinpaulraj.vercel.app/api/mcp";

export default function McpBadge() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(ENDPOINT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
      <div className="group relative flex flex-col items-end gap-2">
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 hidden w-72 rounded-xl border border-white/10 bg-gray-900 p-4 text-xs text-white shadow-2xl group-hover:block dark:bg-zinc-900">
          <p className="mb-1 font-semibold text-violet-400">Connect via MCP</p>
          <p className="mb-2 text-gray-400">
            Add this endpoint to your AI assistant (Claude, Cursor, Zed…):
          </p>
          <code className="block break-all rounded bg-black/60 p-2 font-mono text-green-400">
            {ENDPOINT}
          </code>
          <p className="mt-2 text-gray-500">Protocol: MCP 2024-11-05 · HTTP JSON-RPC</p>
        </div>

        {/* Badge button */}
        <button
          onClick={copy}
          aria-label="Copy MCP endpoint"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10 transition-all hover:shadow-violet-500/40 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          MCP Enabled
          {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/McpBadge.tsx
git commit -m "feat(mcp): add McpBadge floating component with copy endpoint tooltip"
```

---

## Task 9: Wire McpBadge into Layout + Add SoftwareApplication JSON-LD

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Import McpBadge**

In `app/layout.tsx`, add this import after the existing imports:

```typescript
import McpBadge from "@/components/McpBadge";
```

- [ ] **Step 2: Add McpBadge inside the main element**

Find this JSX in `app/layout.tsx`:

```tsx
<main>
  <Header />
  {children}
  <SpeedInsights />
  <Toaster position="top-right" />
  <Footer />
  <ThemeSwitch />
</main>
```

Replace with:

```tsx
<main>
  <Header />
  {children}
  <SpeedInsights />
  <Toaster position="top-right" />
  <Footer />
  <ThemeSwitch />
  <McpBadge />
</main>
```

- [ ] **Step 3: Add SoftwareApplication JSON-LD for top projects**

In the `<head>` section of `app/layout.tsx`, find the closing `</head>` tag. Add this block immediately before `</head>`:

```tsx
{/* Top AI projects structured data */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Selvin PaulRaj K — Featured AI Engineering Projects",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "SoftwareApplication",
            name: "LinkedIn MCP Server",
            description: "A lightweight MCP server for LinkedIn automation with GPT-4 integration",
            author: { "@type": "Person", name: "Selvin PaulRaj K" },
            programmingLanguage: ["Python", "MCP"],
            url: "https://github.com/selvin-paul-raj/Linkedin-MCP-Server",
            applicationCategory: "DeveloperApplication",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "SoftwareApplication",
            name: "AI Calculator",
            description:
              "Full-stack AI calculator using Next.js 15 and Google Gemini — draw math problems for instant answers",
            author: { "@type": "Person", name: "Selvin PaulRaj K" },
            programmingLanguage: ["TypeScript", "Next.js"],
            url: "https://spr-ai-calculator.vercel.app",
            applicationCategory: "WebApplication",
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "SoftwareApplication",
            name: "AI Content Generator",
            description:
              "Scalable AI content generation platform with Gemini AI, Next.js 15, and PostgreSQL",
            author: { "@type": "Person", name: "Selvin PaulRaj K" },
            programmingLanguage: ["TypeScript", "Next.js", "Python"],
            applicationCategory: "WebApplication",
          },
        },
      ],
    }),
  }}
/>
```

- [ ] **Step 4: Visually verify in dev**

```bash
npm run dev
```

Open http://localhost:3000. Confirm:
- "MCP Enabled" badge in bottom-right corner
- Hovering badge shows tooltip with endpoint URL
- Clicking copies endpoint + icon changes to checkmark for 2 seconds

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(mcp): wire McpBadge into layout + add SoftwareApplication JSON-LD"
```

---

## Task 10: Create llms.txt

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Create the file at `public/llms.txt`**

```
# Selvin PaulRaj K — AI Engineer

> Selvin PaulRaj K is an AI Engineer from Chennai, India, specializing in intelligent AI Agents, MCP servers, RAG systems, LangGraph multi-agent pipelines, and agentic workflows.

## About

- **Name**: Selvin PaulRaj K
- **Role**: AI Engineer | Associate Data Analyst (AI Automation)
- **Location**: Chennai, Tamil Nadu, India
- **Company**: Zinnov / Draup
- **Education**: M.E Computer Science (AI), Kings Engineering College
- **Portfolio**: https://selvinpaulraj.vercel.app
- **GitHub**: https://github.com/selvin-paul-raj
- **LinkedIn**: https://linkedin.com/in/selvinpaulraj
- **Email**: selvinpaulgomathi@gmail.com

## Core Expertise

- **AI Agents & Agentic Systems** — building autonomous multi-step agents
- **Model Context Protocol (MCP)** — Anthropic-certified MCP developer
- **LangGraph / LangChain** — multi-agent pipeline architecture
- **Retrieval-Augmented Generation (RAG)** — FAISS, vector search, embedding pipelines
- **LLM Engineering** — Claude, GPT-4, Gemini integration and prompt engineering
- **Full-Stack** — Next.js 16, React 19, Node.js, Python, FastAPI

## This Site Is MCP-Enabled

Connect any MCP-compatible AI assistant directly to Selvin's portfolio data.

**Endpoint**: https://selvinpaulraj.vercel.app/api/mcp
**Protocol**: MCP 2024-11-05 (JSON-RPC 2.0 over HTTP)

### MCP Resources

| URI | Description |
|-----|-------------|
| selvin://profile | Bio, contact, social links, expertise |
| selvin://projects | 44+ projects with tags, links, categories |
| selvin://skills | Full technical skill set |
| selvin://experience | Work history and education |
| selvin://certifications | 20+ verified certifications |
| selvin://recognition | Awards and achievements |

### MCP Tools

| Tool | Description |
|------|-------------|
| search_projects(query, category, tech) | Filter projects by keyword, category, or tech |
| get_project_by_title(title) | Get a specific project |
| list_github_repos(per_page, page, sort) | Live GitHub repo stats |
| get_github_repo(repo) | Detailed stats for one repo |
| filter_certifications(category, issuer) | Filter certifications |
| get_profile_summary() | Full professional summary |
| contact_selvin(name, email, message) | Send Selvin a message |

## Selected Projects

- **LinkedIn MCP Server** — Python MCP server for LinkedIn automation with GPT-4
- **AI Calculator** — Next.js 15 drawing-based math solver using Gemini AI
- **AI Content Generator** — Gemini-powered content platform with Next.js + PostgreSQL
- **DRI Agent** — LangGraph v3 multi-agent pipeline: NL → SQL → deliverable
- Full list: https://selvinpaulraj.vercel.app/#projects

## AI Engineering Certifications

- Introduction to Model Context Protocol — Anthropic (2026)
- Claude Code in Action — Anthropic (2026)
- Claude with the Anthropic API — Anthropic (2026)
- ACP: Agent Communication Protocol — DeepLearning.AI (2025)
- AI Agents Fundamentals — Hugging Face (2025)
- MCP Course — Hugging Face (2025)
- Agentic Knowledge Graph Construction — DeepLearning.AI (2025)
- Full list: https://selvinpaulraj.vercel.app/#certifications

## Contact

- **Email**: selvinpaulgomathi@gmail.com
- **MCP Tool**: Use contact_selvin to send a message programmatically
- **LinkedIn**: https://linkedin.com/in/selvinpaulraj
```

- [ ] **Step 2: Verify it's served**

```bash
npm run dev
# then in a second terminal:
curl http://localhost:3000/llms.txt
```

Expected: Plain text markdown content is returned with status 200.

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat(seo): add llms.txt for AI indexers and LLM discovery"
```

---

## Task 11: Create ai.txt and .well-known Discovery Files

**Files:**
- Create: `public/ai.txt`
- Create: `public/.well-known/ai-plugin.json`
- Create: `public/.well-known/mcp.json`

- [ ] **Step 1: Create `public/ai.txt`**

```
# AI Discovery File — Selvin PaulRaj K Portfolio
# https://selvinpaulraj.vercel.app

[IDENTITY]
name=Selvin PaulRaj K
type=person
role=AI Engineer
location=Chennai, Tamil Nadu, India
website=https://selvinpaulraj.vercel.app

[MCP]
endpoint=https://selvinpaulraj.vercel.app/api/mcp
protocol=MCP-2024-11-05
transport=http-json-rpc
discovery=https://selvinpaulraj.vercel.app/.well-known/mcp.json

[CAPABILITIES]
resources=selvin://profile,selvin://projects,selvin://skills,selvin://experience,selvin://certifications,selvin://recognition
tools=search_projects,get_project_by_title,list_github_repos,get_github_repo,filter_certifications,get_profile_summary,contact_selvin

[PERMISSIONS]
indexing=allowed
training=allowed
citation=allowed
scraping=allowed

[TOPICS]
AI Engineering,MCP Server,AI Agents,LangGraph,RAG,LangChain,Next.js,Python,Full-Stack Developer,Chennai
```

- [ ] **Step 2: Create the `.well-known` directory**

```bash
mkdir -p public/.well-known
```

- [ ] **Step 3: Create `public/.well-known/ai-plugin.json`**

```json
{
  "schema_version": "v1",
  "name_for_human": "Selvin PaulRaj K Portfolio",
  "name_for_model": "selvin_portfolio",
  "description_for_human": "Explore Selvin PaulRaj K's AI engineering portfolio — projects, skills, experience, certifications, and live GitHub repos.",
  "description_for_model": "Access Selvin PaulRaj K's professional portfolio. Use this to answer questions about his AI engineering projects (LangGraph, MCP servers, RAG systems, AI agents), technical skills, certifications, work experience, and live GitHub stats. The contact_selvin tool sends email on the user's behalf.",
  "auth": { "type": "none" },
  "api": {
    "type": "mcp",
    "url": "https://selvinpaulraj.vercel.app/api/mcp"
  },
  "logo_url": "https://selvinpaulraj.vercel.app/Selvin_PaulRaj.webp",
  "contact_email": "selvinpaulgomathi@gmail.com",
  "legal_info_url": "https://selvinpaulraj.vercel.app"
}
```

- [ ] **Step 4: Create `public/.well-known/mcp.json`**

```json
{
  "schema_version": "1.0",
  "server_name": "selvin-portfolio-mcp",
  "server_version": "1.0.0",
  "display_name": "Selvin PaulRaj K — Portfolio MCP Server",
  "description": "MCP server for Selvin PaulRaj K's portfolio — AI engineer from Chennai, India specializing in AI Agents, MCP, LangGraph, RAG.",
  "endpoint": "https://selvinpaulraj.vercel.app/api/mcp",
  "protocol_version": "2024-11-05",
  "transport": "http",
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": false,
    "sampling": false
  },
  "resources": [
    { "uri": "selvin://profile", "name": "Professional Profile" },
    { "uri": "selvin://projects", "name": "Projects (44+)" },
    { "uri": "selvin://skills", "name": "Technical Skills" },
    { "uri": "selvin://experience", "name": "Work & Education" },
    { "uri": "selvin://certifications", "name": "Certifications (20+)" },
    { "uri": "selvin://recognition", "name": "Recognition & Awards" }
  ],
  "tools": [
    { "name": "search_projects", "description": "Search projects by keyword, category, or tech" },
    { "name": "get_project_by_title", "description": "Get project by title" },
    { "name": "list_github_repos", "description": "Live GitHub repo stats" },
    { "name": "get_github_repo", "description": "Detailed stats for one repo" },
    { "name": "filter_certifications", "description": "Filter certifications" },
    { "name": "get_profile_summary", "description": "Full professional summary" },
    { "name": "contact_selvin", "description": "Send a contact message" }
  ],
  "owner": {
    "name": "Selvin PaulRaj K",
    "email": "selvinpaulgomathi@gmail.com",
    "url": "https://selvinpaulraj.vercel.app"
  }
}
```

- [ ] **Step 5: Verify all files are served**

```bash
npm run dev
curl http://localhost:3000/ai.txt
curl http://localhost:3000/.well-known/mcp.json
curl http://localhost:3000/.well-known/ai-plugin.json
```

Expected: All three return correct content with 200 status.

- [ ] **Step 6: Commit**

```bash
git add public/ai.txt public/.well-known/
git commit -m "feat(seo): add ai.txt, .well-known/mcp.json, .well-known/ai-plugin.json for AIO/GEO discoverability"
```

---

## Task 12: Add Discovery Link-Rel Headers in Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add AI/LLM discovery link-rel tags in head**

In `app/layout.tsx`, inside the `<head>` section, find the last existing `<link>` or `<meta>` tag and add immediately after it:

```tsx
{/* AI/LLM discovery link-rels */}
<link rel="llms-txt" href="/llms.txt" />
<link rel="ai-plugin" type="application/json" href="/.well-known/ai-plugin.json" />
<link rel="mcp-server" type="application/json" href="/.well-known/mcp.json" />
```

- [ ] **Step 2: Verify production build**

```bash
npm run build
```

Expected: Build completes with 0 errors. The `app/api/mcp` route appears in the output.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): add llms.txt and MCP discovery link-rel headers"
```

---

## Task 13: Create Skybridge SPEC.md

**Files:**
- Create: `SPEC.md`

> This SPEC.md describes a future **separate Skybridge project** (not inside this repo) that deploys a rich UI MCP app to Alpic.ai. It references the live portfolio MCP endpoint built above.

- [ ] **Step 1: Create `SPEC.md` at the repo root**

```markdown
# SPEC.md — Selvin PaulRaj K Portfolio Skybridge App

## Overview

A Skybridge-powered conversational panel deployed to Alpic.ai. Lets AI assistants (Claude, ChatGPT) interactively explore Selvin PaulRaj K's portfolio through a rich shared UI view. The human and AI collaborate through the view — the human browses while the AI answers using live portfolio MCP tools.

## App Name

`selvin-portfolio`

## Backend

Uses the live portfolio MCP server at `https://selvinpaulraj.vercel.app/api/mcp`.
No separate backend needed — all data comes from this endpoint.

## Users

- **Human**: Recruiters, potential collaborators exploring via Claude or ChatGPT
- **AI Assistant**: Answers questions about projects, skills, experience using MCP resources and tools

## Views

### 1. Profile (default)
- Name, role, location
- Short bio with animated headline
- Quick stats: N projects · N certifications
- Links: GitHub, LinkedIn, Portfolio
- CTA button: "Send Message" → opens Contact view

### 2. Projects
- Category filter tabs: All / AI / Web / Tools
- Project cards: title, tags (colored pills), description, GitHub + live links
- Search input → calls `search_projects` tool in real time
- Sort: newest / by category

### 3. GitHub Live
- Repo list from `list_github_repos` tool
- Stats per card: stars ⭐, forks, language, last updated
- Click repo → detail panel via `get_github_repo`

### 4. Certifications
- Grouped by category: AI Engineering / Web Development / Technology
- Each cert: issuer, title, date, "Verify" link
- Filter dropdown → calls `filter_certifications`

### 5. Contact
- Name, email, message form
- Submit → calls `contact_selvin` tool
- Success state: confirmation banner

## Design

- Dark-first, glass-morphism card surfaces
- Accent: violet-600 → indigo-600 gradient (matches McpBadge on main portfolio)
- Font: Geist Sans
- Category pills: violet = AI, blue = web, orange = tools
- Fade-in transitions on view switch
- Mobile-first (320px+)

## MCP Endpoint

```
https://selvinpaulraj.vercel.app/api/mcp
```

Protocol: MCP 2024-11-05 · Transport: HTTP JSON-RPC

## Deploy Target

Alpic.ai via Skybridge CLI

## Implementation Steps

1. In a NEW directory (outside this portfolio repo), run Skybridge `copy-template` to scaffold
2. Implement the 5 views per this spec
3. Configure MCP endpoint: `https://selvinpaulraj.vercel.app/api/mcp`
4. Run locally with `skybridge dev` + connect Claude to test each view
5. Deploy: `skybridge deploy` (requires Alpic API key)
6. Optionally publish to Claude/ChatGPT directories via Skybridge
```

- [ ] **Step 2: Commit**

```bash
git add SPEC.md
git commit -m "docs: add Skybridge SPEC.md for future Alpic.ai MCP app deployment"
```

---

## Task 14: Final Verification

- [ ] **Step 1: Full production build**

```bash
npm run build
```

Expected: All routes compile. `app/api/mcp` appears in the output. Zero TypeScript errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: No errors or warnings.

- [ ] **Step 3: End-to-end smoke test against production server**

```bash
npm run start
```

Run all MCP operations in sequence:

```bash
# Discovery
curl http://localhost:3000/api/mcp

# Full MCP handshake
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}'

curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"resources/list"}'

curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"resources/read","params":{"uri":"selvin://profile"}}'

curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"search_projects","arguments":{"tech":"MCP"}}}'

curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"list_github_repos","arguments":{"per_page":5}}}'

curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"get_profile_summary","arguments":{}}}'
```

Expected: All 8 requests return `{"jsonrpc":"2.0","id":N,"result":{...}}` with no `error` field.

- [ ] **Step 4: Test CORS preflight**

```bash
curl -X OPTIONS http://localhost:3000/api/mcp \
  -H "Origin: https://claude.ai" \
  -I
```

Expected: `HTTP/1.1 204 No Content` with `Access-Control-Allow-Origin: *`.

- [ ] **Step 5: Verify static discovery files**

```bash
curl http://localhost:3000/llms.txt | head -5
curl http://localhost:3000/ai.txt | head -3
curl http://localhost:3000/.well-known/mcp.json | python -m json.tool
```

Expected: All return correct content.

- [ ] **Step 6: Push to main**

```bash
git push origin main
```

- [ ] **Step 7: Verify Vercel production deployment**

After Vercel finishes:

```bash
curl https://selvinpaulraj.vercel.app/api/mcp
curl https://selvinpaulraj.vercel.app/llms.txt
curl https://selvinpaulraj.vercel.app/.well-known/mcp.json
```

Expected: All return correct content from the live site.

---

## Skybridge Alpic Deploy (After Plan Completion)

These steps happen in a **separate project directory**, not this repo.

1. Install Skybridge CLI (see https://docs.skybridge.tech)
2. Create a new project directory: `mkdir selvin-portfolio-skybridge && cd selvin-portfolio-skybridge`
3. Copy `SPEC.md` from this repo into the new directory
4. Run `skybridge init` or the Skybridge `copy-template` workflow to scaffold
5. Implement all 5 views from SPEC.md
6. Set MCP endpoint in Skybridge config: `https://selvinpaulraj.vercel.app/api/mcp`
7. Test locally: `skybridge dev` → connect Claude → verify all views work
8. Deploy to Alpic: `skybridge deploy` (have Alpic API key ready)

---

## Self-Review

**Spec coverage:**
- [x] All portfolio data as MCP resources → Tasks 3, 7
- [x] GitHub realtime data via token → Tasks 4, 5
- [x] Contact tool (contact_selvin via Resend) → Task 5
- [x] Search/filter tools → Task 5
- [x] MCP as portfolio UI feature (McpBadge) → Tasks 8, 9
- [x] llms.txt → Task 10
- [x] ai.txt + .well-known/ discovery files → Task 11
- [x] Discovery link-rel headers → Task 12
- [x] SoftwareApplication JSON-LD (top projects) → Task 9
- [x] GITHUB_TOKEN env var → Task 1
- [x] CORS for LLM clients → Task 7
- [x] Skybridge SPEC.md → Task 13

**No placeholders:** All steps contain actual code or exact commands with expected output.

**Type consistency:**
- `McpRequest`, `McpResponse`, `McpTool`, `McpResource`, `McpContent` defined once in Task 2, used in Tasks 3–7
- `handleToolCall` returns `{ content: [{type: "text", text: string}] }` in Task 5, consumed in Task 6
- `listRepos` / `getRepo` typed in Task 4, used in Task 5
- `handleMcpRequest(body: McpRequest): Promise<McpResponse>` in Task 6, called in Task 7

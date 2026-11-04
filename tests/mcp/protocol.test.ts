import { beforeEach, describe, expect, it, vi } from "vitest";
import { freshIp, goOffline } from "../helpers/offline";
import { handleMcpPost, mcpHandlers } from "@/lib/mcp/server";
import { GET, POST } from "@/app/api/mcp/route";
import { TOOLS } from "@/lib/mcp/catalog";
import { LATEST_PROTOCOL_VERSION } from "@/lib/mcp/definitions";
import { MAX_BODY_BYTES } from "@/lib/mcp/router";

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn(async () => ({ data: { id: "test" }, error: null })) };
  },
}));

type Rpc = { jsonrpc: "2.0"; id: unknown; result?: any; error?: { code: number; message: string } };

let id = 0;
async function rpc(method: string, params?: Record<string, unknown>, header: string | null = null) {
  const reply = await handleMcpPost(JSON.stringify({ jsonrpc: "2.0", id: ++id, method, ...(params ? { params } : {}) }), {
    ip: freshIp(),
    protocolVersion: header,
  });
  return { status: reply.status, body: reply.body as Rpc };
}

const callTool = async (name: string, args: Record<string, unknown> = {}) =>
  (await rpc("tools/call", { name, arguments: args })).body.result;

beforeEach(goOffline);

describe("initialize", () => {
  it.each(["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"])("echoes supported version %s", async (version) => {
    const { body } = await rpc("initialize", { protocolVersion: version, capabilities: {}, clientInfo: { name: "t", version: "1" } });
    expect(body.result.protocolVersion).toBe(version);
    expect(body.result.capabilities).toMatchObject({ tools: {}, resources: {}, prompts: {} });
    expect(body.result.serverInfo.name).toBe("selvin-portfolio-mcp");
  });

  it("answers an unknown version with the latest", async () => {
    const { body } = await rpc("initialize", { protocolVersion: "1999-01-01" });
    expect(body.result.protocolVersion).toBe(LATEST_PROTOCOL_VERSION);
  });

  it("ignores the version header on initialize but rejects unsupported ones afterwards", async () => {
    expect((await rpc("initialize", { protocolVersion: "2025-06-18" }, "1999-01-01")).status).toBe(200);
    const later = await rpc("tools/list", undefined, "1999-01-01");
    expect(later.status).toBe(400);
    expect(later.body.error?.code).toBe(-32600);
    expect((await rpc("tools/list", undefined, "2025-06-18")).status).toBe(200);
    expect((await rpc("tools/list")).status).toBe(200);
  });
});

describe("JSON-RPC handling", () => {
  it("returns -32601 for an unknown method", async () => {
    const { body } = await rpc("no/such/method");
    expect(body.error?.code).toBe(-32601);
  });

  it("replies 202 with no body to a notification", async () => {
    const reply = await handleMcpPost(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }), { ip: freshIp(), protocolVersion: null });
    expect(reply).toEqual({ status: 202, body: null });
  });

  it("returns a parse error for invalid JSON", async () => {
    const reply = await handleMcpPost("{not json", { ip: freshIp(), protocolVersion: null });
    expect(reply.status).toBe(400);
    expect((reply.body as Rpc).error?.code).toBe(-32700);
  });

  it("rate-limits one IP after 60 requests", async () => {
    const ip = freshIp();
    const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" });
    for (let i = 0; i < 60; i++) expect((await handleMcpPost(body, { ip, protocolVersion: null })).status).toBe(200);
    const blocked = await handleMcpPost(body, { ip, protocolVersion: null });
    expect(blocked.status).toBe(429);
    expect(blocked.headers?.["Retry-After"]).toMatch(/^\d+$/);
  });
});

describe("tools/list", () => {
  it("lists every tool with a title and annotations", async () => {
    const { body } = await rpc("tools/list");
    const tools = body.result.tools as typeof TOOLS;
    expect(tools.map((t) => t.name)).toEqual(TOOLS.map((t) => t.name));
    for (const tool of tools) {
      expect(tool.title).toBeTruthy();
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.inputSchema).not.toHaveProperty("$schema");
      expect(typeof tool.annotations.readOnlyHint).toBe("boolean");
      expect(tool.annotations.readOnlyHint).toBe(tool.name !== "contact_selvin");
    }
  });

  it("marks contact_selvin as a non-destructive, non-idempotent open-world write", () => {
    const contact = TOOLS.find((t) => t.name === "contact_selvin");
    expect(contact?.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true });
    for (const name of ["list_github_repos", "get_github_repo"]) {
      expect(TOOLS.find((t) => t.name === name)?.annotations.openWorldHint).toBe(true);
    }
  });

  it("declares output schemas for the structured tools", () => {
    for (const name of ["match_job", "ask_selvin", "get_eval_results", "get_challenge_info"]) {
      expect(TOOLS.find((t) => t.name === name)?.outputSchema?.type).toBe("object");
    }
  });
});

describe("tools/call", () => {
  it("returns an isError result for invalid arguments", async () => {
    const result = await callTool("search_projects", { limit: 500 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/limit/);
  });

  it("returns a JSON-RPC error for an unknown tool", async () => {
    const { body } = await rpc("tools/call", { name: "nope", arguments: {} });
    expect(body.error?.code).toBe(-32602);
  });

  it("reports a GitHub failure as an isError result", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("boom", { status: 500 }));
    const result = await callTool("get_github_repo", { repo: "portfolio" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/GitHub/);
    expect(result.content[0].text).not.toMatch(/boom/);
  });

  it("reports a missing repository as an isError result", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 404 }));
    const result = await callTool("get_github_repo", { repo: "does-not-exist" });
    expect(result).toMatchObject({ isError: true });
  });

  it("match_job returns structured content honouring max_evidence and only", async () => {
    const jd =
      "We are hiring an AI Engineer with LangGraph, RAG, FastAPI, Python, AWS and Kubernetes experience to build agentic systems.";
    const result = await callTool("match_job", { job_description: jd, max_evidence: 1, only: "matched" });
    expect(result.isError).toBeUndefined();
    const out = result.structuredContent;
    expect(out.score).toBeGreaterThan(0);
    expect(out).not.toHaveProperty("gaps");
    for (const m of out.matched) expect(m.evidence.length).toBeLessThanOrEqual(1);
    expect(JSON.parse(result.content[0].text)).toEqual(out);
  });

  it("match_job rejects a job description over 20,000 characters", async () => {
    const result = await callTool("match_job", { job_description: "python ".repeat(3000) });
    expect(result.isError).toBe(true);
  });

  it("ask_selvin answers extractively with citations when no LLM is configured", async () => {
    const result = await callTool("ask_selvin", { question: "Which MCP servers has Selvin built?" });
    const out = result.structuredContent;
    expect(out.mode).toBe("retrieval");
    expect(out.refused).toBe(false);
    expect(out.citations.length).toBeGreaterThan(0);
    expect(out.citations[0]).toEqual({ n: expect.any(Number), title: expect.any(String), url: expect.any(String), kind: expect.any(String), score: expect.any(Number) });
    expect(out).not.toHaveProperty("trace");
  });

  it("ask_selvin refuses an off-topic question", async () => {
    const result = await callTool("ask_selvin", { question: "What's the weather in Paris today?", include_trace: true });
    expect(result.structuredContent).toMatchObject({ refused: true, refusal: "off-topic", citations: [] });
    expect(Array.isArray(result.structuredContent.trace)).toBe(true);
  });

  it("get_eval_results filters by suite and includes cases on request", async () => {
    const result = await callTool("get_eval_results", { suite: "fit", include_cases: true });
    const out = result.structuredContent;
    expect(out.suites.map((s: { id: string }) => s.id)).toEqual(["fit"]);
    expect(out.totals.total).toBe(out.suites[0].total);
    expect(Array.isArray(out.cases.fit)).toBe(true);
    expect(out.url).toMatch(/\/evals$/);
  });

  it("get_challenge_info never exposes secrets", async () => {
    const result = await callTool("get_challenge_info");
    const out = result.structuredContent;
    expect(out.levels).toHaveLength(5);
    expect(out.enabled).toBe(false);
    expect(result.content[0].text).not.toMatch(/clue|LANTERN|salt/i);
  });

  it("get_profile_summary derives top technologies from skills.json", async () => {
    const out = (await callTool("get_profile_summary")).structuredContent;
    expect(out.topTechnologies).toContain("LangGraph");
    expect(out.topTechnologies).toContain("Python");
  });

  it("contact_selvin reports validation failures as isError without sending", async () => {
    const result = await callTool("contact_selvin", { name: "A", email: "not-an-email", message: "Hello there" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/email/i);
  });
});

describe("resources and prompts", () => {
  it("lists resource templates and reads a templated case study", async () => {
    const templates = (await rpc("resources/templates/list")).body.result.resourceTemplates;
    expect(templates.map((t: { uriTemplate: string }) => t.uriTemplate)).toEqual(["selvin://case-studies/{slug}", "selvin://projects/{title}"]);
    const { body } = await rpc("resources/read", { uri: "selvin://case-studies/dri-mas" });
    expect(JSON.parse(body.result.contents[0].text).slug).toBe("dri-mas");
  });

  it("returns -32002 for an unknown resource", async () => {
    expect((await rpc("resources/read", { uri: "selvin://case-studies/nope" })).body.error?.code).toBe(-32002);
  });

  it("serves selvin://evals", async () => {
    const { body } = await rpc("resources/read", { uri: "selvin://evals" });
    expect(JSON.parse(body.result.contents[0].text).suites.length).toBeGreaterThan(0);
  });

  it("lists prompts and renders evaluate_fit", async () => {
    const prompts = (await rpc("prompts/list")).body.result.prompts;
    expect(prompts.map((p: { name: string }) => p.name)).toEqual(["evaluate_fit", "summarize_for_role"]);
    const got = (await rpc("prompts/get", { name: "evaluate_fit", arguments: { job_description: "Senior AI Engineer, LangGraph" } })).body.result;
    expect(got.messages[0].content.text).toMatch(/match_job/);
    expect(got.messages[0].content.text).toMatch(/Senior AI Engineer, LangGraph/);
  });

  it("returns -32602 when a prompt argument is missing", async () => {
    expect((await rpc("prompts/get", { name: "summarize_for_role" })).body.error?.code).toBe(-32602);
  });
});

describe("HTTP route", () => {
  it("returns 405 to a GET asking for an SSE stream", async () => {
    const res = GET(new Request("http://localhost/api/mcp", { headers: { accept: "text/event-stream" } }));
    expect(res.status).toBe(405);
  });

  it("serves a manifest generated from the registry on a plain GET", async () => {
    const res = GET(new Request("http://localhost/api/mcp"));
    const manifest = await res.json();
    expect(manifest.tools).toEqual(mcpHandlers.listTools().map((t) => t.name));
    expect(manifest.resources).toContain("selvin://evals");
  });

  it("rejects an oversized body from its Content-Length", async () => {
    const res = await POST(
      new Request("http://localhost/api/mcp", { method: "POST", headers: { "content-length": String(MAX_BODY_BYTES + 1) }, body: "{}" })
    );
    expect(res.status).toBe(413);
  });

  it("rejects an oversized body without a Content-Length while reading", async () => {
    const big = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(MAX_BODY_BYTES + 10));
        controller.close();
      },
    });
    const res = await POST(new Request("http://localhost/api/mcp", { method: "POST", body: big, duplex: "half" } as RequestInit));
    expect(res.status).toBe(413);
  });
});

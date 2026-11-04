import { beforeEach, describe, expect, it } from "vitest";
import { freshIp, goOffline } from "../helpers/offline";
import { POST } from "@/app/api/a2a/route";

const JD =
  "We are hiring an AI Engineer. Requirements: LangGraph and multi-agent systems, RAG with hybrid retrieval, Python and FastAPI, AWS, Docker, and LLM evaluation. Nice to have: Kubernetes.";

async function send(text: string, metadata?: Record<string, unknown>) {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "message/send",
    params: { message: { kind: "message", role: "user", messageId: "m1", parts: [{ kind: "text", text }], ...(metadata ? { metadata } : {}) } },
  };
  const res = await POST(
    new Request("http://localhost/api/a2a", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": freshIp() },
      body: JSON.stringify(body),
    })
  );
  return { status: res.status, json: await res.json() };
}

beforeEach(goOffline);

describe("A2A message/send routing", () => {
  it("routes a job description to job_fit", async () => {
    const { json } = await send(JD);
    expect(json.result.metadata.skillId).toBe("job_fit");
    expect(json.result.parts[0].text).toMatch(/^Fit score \d+\/100/);
    expect(json.result.parts[1].data.score).toBeGreaterThan(0);
  });

  it("routes a question to ask, answered extractively with citations", async () => {
    const { json } = await send("Which MCP servers has Selvin built?");
    expect(json.result.metadata.skillId).toBe("ask");
    const data = json.result.parts[1].data;
    expect(data.mode).toBe("retrieval");
    expect(data.refused).toBe(false);
    expect(data.citations.length).toBeGreaterThan(0);
    expect(json.result.parts[0].text).toMatch(/\[1\]/);
  });

  it("is deterministic for the same question", async () => {
    const a = await send("What did Selvin build with LangGraph?");
    const b = await send("What did Selvin build with LangGraph?");
    expect(a.json.result.parts[0].text).toBe(b.json.result.parts[0].text);
  });

  it("honours an explicit profile skill", async () => {
    const { json } = await send("Who is Selvin?", { skillId: "profile" });
    expect(json.result.metadata.skillId).toBe("profile");
    expect(json.result.parts[1].data.name).toBe("Selvin PaulRaj K");
  });

  it("gives the profile for an empty message", async () => {
    const { json } = await send("");
    expect(json.result.metadata.skillId).toBe("profile");
  });

  it("rejects input over 20,000 characters", async () => {
    const { json } = await send("a".repeat(20_001));
    expect(json.error.code).toBe(-32602);
  });

  it("rejects an oversized body with 413", async () => {
    const res = await POST(
      new Request("http://localhost/api/a2a", { method: "POST", headers: { "content-length": "200000", "x-forwarded-for": freshIp() }, body: "{}" })
    );
    expect(res.status).toBe(413);
  });
});

// app/api/a2a/route.ts
// Minimal A2A (Agent2Agent, v0.3 JSON-RPC binding) endpoint so other agents can
// discover Selvin via /.well-known/agent-card.json and talk to him directly.
// Stateless: `message/send` answers synchronously with a Message (no tasks).
// metadata.skillId picks a skill; without it:
//   - text that looks like a job description → fit report        (skill: job_fit)
//   - any other question                      → grounded answer   (skill: ask)
//   - an empty message                        → profile summary   (skill: profile)
import { randomUUID } from "crypto";
import { matchJob } from "@/lib/fit/matchJob";
import { getProfileSummary } from "@/lib/mcp/dispatch";
import { PROFILE } from "@/lib/mcp/definitions";
import { portfolioData } from "@/lib/mcp/server";
import { askSelvin } from "@/lib/mcp/ask";
import { readCappedText } from "@/lib/mcp/http";
import { portfolioIndex } from "@/lib/ask/portfolioIndex";
import { checkAgentRateLimit, checkLlmRateLimit, getClientIp } from "@/lib/rateLimit";
import type { RateLimited } from "@/lib/rateLimit";
import agentCard from "@/public/.well-known/agent-card.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, A2A-Version",
  "Access-Control-Max-Age": "86400",
};

const MAX_BODY_BYTES = 100_000;
const MAX_INPUT_CHARS = 20_000;
const MIN_JD_CHARS = 40;
/** A JD names several recognisable requirements; a question rarely does. */
const MIN_JD_REQUIREMENTS = 3;

type SkillId = "job_fit" | "profile" | "ask";
const SKILLS: readonly SkillId[] = ["job_fit", "profile", "ask"];

type JsonRpcId = string | number | null;

class RpcError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly limited?: RateLimited
  ) {
    super(message);
  }
}

function rpcError(id: JsonRpcId, code: number, message: string, init: ResponseInit = {}) {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } }, { ...init, headers: { ...CORS, ...init.headers } });
}

function textOf(message: Record<string, unknown>): string {
  const parts = message.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((p): p is { kind: "text"; text: string } => p?.kind === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("\n");
}

function requestedSkill(message: Record<string, unknown>): SkillId | undefined {
  const skill = (message.metadata as { skillId?: unknown } | undefined)?.skillId;
  return SKILLS.find((s) => s === skill);
}

/** The skill a message is routed to, and the fit report when it was computed on the way. */
function routeMessage(text: string, explicit?: SkillId): { skill: SkillId; fit?: ReturnType<typeof matchJob> } {
  if (explicit === "profile" || explicit === "ask") return { skill: explicit };
  const fit = text.length >= MIN_JD_CHARS ? matchJob(text, portfolioData) : undefined;
  if (explicit === "job_fit") return { skill: "job_fit", fit: fit ?? matchJob(text, portfolioData) };
  if (fit && fit.matched.length + fit.gaps.length >= MIN_JD_REQUIREMENTS) return { skill: "job_fit", fit };
  return { skill: text ? "ask" : "profile" };
}

type Part = { kind: "text"; text: string } | { kind: "data"; data: Record<string, unknown> };

async function partsFor(text: string, explicit: SkillId | undefined, ip: string): Promise<{ skill: SkillId; parts: Part[] }> {
  const { skill, fit } = routeMessage(text, explicit);

  if (skill === "job_fit" && fit) {
    const top = fit.matched.slice(0, 6).map((m) => `${m.requirement} (${m.strength})`).join(", ");
    return {
      skill,
      parts: [
        {
          kind: "text",
          text: `Fit score ${fit.score}/100: ${fit.verdict} Evidence-backed: ${top || "none"}. Gaps: ${fit.gaps.join(", ") || "none"}. Full report: ${PROFILE.fitCheckUrl}`,
        },
        { kind: "data", data: { ...fit } },
      ],
    };
  }

  if (skill === "ask" && text.length >= 3) {
    const limited = checkLlmRateLimit(ip, "ask");
    if (limited) throw new RpcError(-32000, limited.error, limited);
    const result = await askSelvin(text, portfolioIndex, false);
    const { answer, ...rest } = result;
    return { skill, parts: [{ kind: "text", text: String(answer) }, { kind: "data", data: rest }] };
  }

  return {
    skill: "profile",
    parts: [
      {
        kind: "text",
        text: `${PROFILE.name}: ${PROFILE.summary} ${PROFILE.roleNote} Open to: ${PROFILE.openTo.join(", ")}. Send a job description for an evidence-cited fit report, or ask a question about his work.`,
      },
      { kind: "data", data: getProfileSummary(portfolioData) },
    ],
  };
}

/** Convenience: the agent card, also served statically at /.well-known/agent-card.json. */
export function GET() {
  return Response.json(agentCard, { headers: CORS });
}

export async function POST(req: Request) {
  const ip = getClientIp((h) => req.headers.get(h));
  const limited = checkAgentRateLimit(ip, "a2a");
  if (limited) {
    return rpcError(null, -32000, limited.error, { status: 429, headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) } });
  }

  const raw = await readCappedText(req, MAX_BODY_BYTES);
  if (raw === null) return rpcError(null, -32600, `Request too large (max ${MAX_BODY_BYTES} bytes)`, { status: 413 });

  let body: { jsonrpc?: unknown; id?: JsonRpcId; method?: unknown; params?: { message?: unknown } };
  try {
    body = JSON.parse(raw);
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const id = body?.id ?? null;
  if (body?.jsonrpc !== "2.0" || typeof body.method !== "string") return rpcError(id, -32600, "Invalid Request");

  switch (body.method) {
    case "message/send": {
      const message = body.params?.message;
      if (!message || typeof message !== "object") return rpcError(id, -32602, "params.message is required");
      const msg = message as Record<string, unknown>;
      const text = textOf(msg).trim();
      if (text.length > MAX_INPUT_CHARS) return rpcError(id, -32602, `Message text too long (max ${MAX_INPUT_CHARS} characters)`);
      try {
        const { skill, parts } = await partsFor(text, requestedSkill(msg), ip);
        const result = { kind: "message", role: "agent", messageId: randomUUID(), contextId: msg.contextId, parts, metadata: { skillId: skill } };
        return Response.json({ jsonrpc: "2.0", id, result }, { headers: CORS });
      } catch (err) {
        if (!(err instanceof RpcError)) throw err;
        const retry = err.limited ? { status: 429, headers: { "Retry-After": String(Math.ceil(err.limited.retryAfterMs / 1000)) } } : {};
        return rpcError(id, err.code, err.message, retry);
      }
    }
    case "tasks/get":
    case "tasks/cancel":
      // Every reply is a direct Message; no tasks are ever created.
      return rpcError(id, -32001, "Task not found");
    case "message/stream":
    case "tasks/resubscribe":
      return rpcError(id, -32004, "Streaming is not supported");
    default:
      return rpcError(id, -32601, "Method not found");
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

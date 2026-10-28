// app/api/a2a/route.ts
// Minimal A2A (Agent2Agent, v0.3 JSON-RPC binding) endpoint so other agents can
// discover Selvin via /.well-known/agent-card.json and talk to him directly.
// Stateless: `message/send` answers synchronously with a Message (no tasks).
//   - text that looks like a job description → fit report (skill: job_fit)
//   - anything else                          → profile summary (skill: profile)
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { matchJob } from "@/lib/fit/matchJob";
import type { FitData } from "@/lib/fit/matchJob";
import { getProfileSummary } from "@/lib/mcp/dispatch";
import { PROFILE } from "@/lib/mcp/definitions";
import projectsData from "@/lib/data/projects.json";
import experiencesData from "@/lib/data/experiences.json";
import certificationsData from "@/lib/data/certifications.json";
import agentCard from "@/public/.well-known/agent-card.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, A2A-Version",
  "Access-Control-Max-Age": "86400",
};

const MAX_BODY_CHARS = 100_000;
const FIT_DATA: FitData = {
  projects: projectsData,
  experiences: experiencesData,
  certifications: certificationsData,
};

type JsonRpcId = string | number | null;

function rpcError(id: JsonRpcId, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { headers: CORS });
}

function textOf(message: unknown): string {
  const parts = (message as { parts?: unknown })?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((p): p is { kind: "text"; text: string } => p?.kind === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("\n");
}

function reply(message: Record<string, unknown>) {
  const text = textOf(message).trim();
  const skill = (message.metadata as { skillId?: unknown } | undefined)?.skillId;
  const base = { kind: "message", role: "agent", messageId: randomUUID(), contextId: message.contextId };

  const fit = text.length >= 40 ? matchJob(text, FIT_DATA) : null;
  const isJobDescription = skill === "job_fit" || (skill !== "profile" && fit && fit.matched.length + fit.gaps.length >= 3);

  if (isJobDescription && fit) {
    const top = fit.matched.slice(0, 6).map((m) => `${m.requirement} (${m.strength})`).join(", ");
    return {
      ...base,
      parts: [
        {
          kind: "text",
          text: `Fit score ${fit.score}/100 — ${fit.verdict} Evidence-backed: ${top || "none"}. Gaps: ${fit.gaps.join(", ") || "none"}. Full report: ${PROFILE.fitCheckUrl}`,
        },
        { kind: "data", data: fit },
      ],
    };
  }

  const profile = JSON.parse(
    getProfileSummary(projectsData, certificationsData, experiencesData)
  );
  return {
    ...base,
    parts: [
      {
        kind: "text",
        text: `${PROFILE.name} — ${PROFILE.summary} ${PROFILE.roleNote} Open to: ${PROFILE.openTo.join(", ")}. Send a job description to get an evidence-cited fit report.`,
      },
      { kind: "data", data: profile },
    ],
  };
}

/** Convenience: the agent card, also served statically at /.well-known/agent-card.json. */
export function GET() {
  return NextResponse.json(agentCard, { headers: CORS });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) return rpcError(null, -32600, "Request too large");

  let body: { jsonrpc?: unknown; id?: JsonRpcId; method?: unknown; params?: { message?: unknown } };
  try {
    body = JSON.parse(raw);
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const id = body.id ?? null;
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") return rpcError(id, -32600, "Invalid Request");

  switch (body.method) {
    case "message/send": {
      const message = body.params?.message;
      if (!message || typeof message !== "object") return rpcError(id, -32602, "params.message is required");
      return NextResponse.json({ jsonrpc: "2.0", id, result: reply(message as Record<string, unknown>) }, { headers: CORS });
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

// Client for POST /api/ask with `stream: true`: reads NDJSON AskStreamEvents.
import { retryAfterFrom } from "@/components/tools/RateLimitNotice";
import type { AskStreamEvent } from "@/lib/ask/answer";

export type AskOutcome =
  | { kind: "ok" }
  | { kind: "limited"; error: string; retryAfterMs: number }
  | { kind: "error"; error: string };

async function readLines(body: NonNullable<Response["body"]>, onEvent: (e: AskStreamEvent) => void): Promise<boolean> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let finished = false;
  const handle = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line) as AskStreamEvent;
    if (event.type === "done" || event.type === "error") finished = true;
    onEvent(event);
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    lines.forEach(handle);
  }
  handle(buffer);
  return finished;
}

/** Asks one question, calling `onEvent` as the answer streams in. Network failures reject. */
export async function askStream(question: string, signal: AbortSignal, onEvent: (e: AskStreamEvent) => void): Promise<AskOutcome> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, stream: true }),
    signal,
  });
  if (res.status === 429) return { kind: "limited", ...(await retryAfterFrom(res)) };
  if (!res.ok || !res.body) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { kind: "error", error: body.error ?? "Something went wrong. Please try again." };
  }
  const finished = await readLines(res.body, onEvent);
  return finished ? { kind: "ok" } : { kind: "error", error: "The answer was cut off. Please try again." };
}

// app/api/ask/route.ts
// "Ask Selvin": grounded Q&A over portfolio data with validated citations.
// `{question}` returns one AskResult as JSON. `{question, stream: true}` returns
// NDJSON AskStreamEvents: meta, delta / reset while the model writes, then done
// (the validated AskResult, which replaces the streamed text) or error.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion, MAX_QUESTION_CHARS } from "@/lib/ask/answer";
import type { AskStreamEvent } from "@/lib/ask/answer";
import { portfolioIndex } from "@/lib/ask/portfolioIndex";
import { checkLlmRateLimit, getClientIp, rateLimitedInit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const Body = z.object({
  question: z.string().trim().min(3).max(MAX_QUESTION_CHARS),
  stream: z.boolean().optional(),
});

const FAILED = "Something went wrong. Please try again.";

function streamAnswer(question: string): Response {
  const encoder = new TextEncoder();
  let closed = false;
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AskStreamEvent) => {
        if (!closed) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      let streamed = false;
      try {
        const result = await answerQuestion(question, portfolioIndex, {
          onMeta: (meta) => send({ type: "meta", ...meta }),
          onDelta: (text) => {
            streamed = true;
            send({ type: "delta", text });
          },
          onReset: () => {
            streamed = false;
            send({ type: "reset" });
          },
        });
        // Refusals and extractive answers arrive whole.
        if (!streamed) send({ type: "delta", text: result.answer });
        send({ type: "done", result });
      } catch (e) {
        console.error("[ask:stream]", e);
        send({ type: "error", error: FAILED });
      }
      if (!closed) controller.close();
      closed = true;
    },
    cancel() {
      closed = true;
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: `Ask a question between 3 and ${MAX_QUESTION_CHARS} characters.` }, { status: 400 });
  }

  const limited = checkLlmRateLimit(getClientIp((h) => req.headers.get(h)), "ask");
  if (limited) return NextResponse.json(limited, rateLimitedInit(limited.retryAfterMs));

  if (parsed.data.stream) return streamAnswer(parsed.data.question);

  try {
    return NextResponse.json(await answerQuestion(parsed.data.question, portfolioIndex));
  } catch (e) {
    console.error("[ask]", e);
    return NextResponse.json({ error: FAILED }, { status: 500 });
  }
}

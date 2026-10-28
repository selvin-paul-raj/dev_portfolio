// app/api/ask/route.ts
// "Ask Selvin": grounded Q&A over portfolio data with validated citations.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion, MAX_QUESTION_CHARS } from "@/lib/ask/answer";
import { portfolioIndex } from "@/lib/ask/portfolioIndex";
import { checkLlmRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ question: z.string().trim().min(3).max(MAX_QUESTION_CHARS) });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: `Ask a question between 3 and ${MAX_QUESTION_CHARS} characters.` }, { status: 400 });
  }

  const limited = checkLlmRateLimit(getClientIp((h) => req.headers.get(h)), "ask");
  if (limited) return NextResponse.json({ error: limited }, { status: 429 });

  try {
    return NextResponse.json(await answerQuestion(parsed.data.question, portfolioIndex));
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

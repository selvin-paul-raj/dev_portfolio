// app/api/challenge/route.ts
// Prompt-injection challenge: `attack` talks to the guarded model at a level,
// `guess` checks a password. Progress is kept client-side (it's a game).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { attack, challengeEnabled, checkGuess, LAYERS, layersFor, LEVELS, MAX_ATTACK_CHARS } from "@/lib/ask/challenge";
import { LlmError } from "@/lib/ask/llm";
import { checkLlmRateLimit, createRateLimiter, getClientIp, rateLimitedInit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("attack"), level: z.number().int().min(1).max(LEVELS.length), input: z.string().trim().min(1).max(MAX_ATTACK_CHARS) }),
  z.object({ action: z.literal("guess"), level: z.number().int().min(1).max(LEVELS.length), input: z.string().trim().min(1).max(40) }),
]);

// The word list is public, so guesses get their own tight limit against brute force.
const guessLimiter = createRateLimiter({ limit: 8, windowMs: 10 * 60_000 });

// `stack` (every layer, in order) and per-level `layers` (the ones switched on) let the
// page draw the defense pipeline without hard-coding it.
export function GET() {
  return NextResponse.json({
    enabled: challengeEnabled(),
    stack: LAYERS,
    levels: LEVELS.map((l) => ({ ...l, layers: layersFor(l.level) })),
  });
}

export async function POST(req: NextRequest) {
  if (!challengeEnabled()) return NextResponse.json({ error: "The challenge is offline right now." }, { status: 503 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { action, level, input } = parsed.data;

  const ip = getClientIp((h) => req.headers.get(h));

  if (action === "guess") {
    const guess = guessLimiter.check(ip);
    if (!guess.allowed) {
      return NextResponse.json({ error: "Too many guesses. Wait a few minutes.", retryAfterMs: guess.retryAfterMs }, rateLimitedInit(guess.retryAfterMs));
    }
    return NextResponse.json({ correct: checkGuess(level, input) });
  }

  const limited = checkLlmRateLimit(ip, "challenge");
  if (limited) return NextResponse.json(limited, rateLimitedInit(limited.retryAfterMs));

  try {
    return NextResponse.json(await attack(level, input));
  } catch (e) {
    console.error("[challenge]", e);
    if (e instanceof LlmError) return NextResponse.json({ error: "The model is unavailable right now. Try again shortly." }, { status: 503 });
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// lib/rateLimit.ts
// Best-effort in-memory sliding-window rate limiter: state is per server
// instance (each serverless instance keeps its own counters and loses them on
// cold start), so treat it as abuse damping, not a hard guarantee.
// No "@/" aliases here — also compiled by the standalone MCP build.

export interface RateLimiter {
  /** Records a hit for `key` and returns whether it is within the limit. */
  check(key: string): { allowed: boolean; retryAfterMs: number };
}

const PRUNE_INTERVAL_MS = 60_000;

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  let lastPrune = Date.now();

  function prune(now: number) {
    if (now - lastPrune < PRUNE_INTERVAL_MS) return;
    lastPrune = now;
    for (const [key, stamps] of hits) {
      const fresh = stamps.filter((t) => now - t < windowMs);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }

  return {
    check(key) {
      const now = Date.now();
      prune(now);
      const stamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (stamps.length >= limit) {
        hits.set(key, stamps);
        return { allowed: false, retryAfterMs: windowMs - (now - stamps[0]) };
      }
      stamps.push(now);
      hits.set(key, stamps);
      return { allowed: true, retryAfterMs: 0 };
    },
  };
}

/** Extracts the client IP from proxy headers (first x-forwarded-for hop, then x-real-ip). */
export function getClientIp(get: (name: string) => string | null | undefined): string {
  const forwarded = get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || get("x-real-ip")?.trim() || "unknown";
}

// Shared limiters for anything that sends email via Resend (contact form +
// MCP contact_selvin tool): per-IP damping plus a global cap on quota burn.
export const contactIpLimiter = createRateLimiter({ limit: 3, windowMs: 10 * 60_000 });
export const contactGlobalLimiter = createRateLimiter({ limit: 20, windowMs: 60 * 60_000 });

/** Applies both contact limiters; returns an error message if blocked. */
export function checkContactRateLimit(ip: string): string | null {
  if (!contactIpLimiter.check(`ip:${ip}`).allowed) {
    return "Too many messages. Please try again in a few minutes.";
  }
  if (!contactGlobalLimiter.check("global").allowed) {
    return "Contact is temporarily unavailable. Please try again later or reach out by email.";
  }
  return null;
}

// "Ask Selvin" + prompt-injection challenge: per-IP damping plus a global
// daily cap so a free-tier LLM key can't be drained by one visitor.
export const askIpLimiter = createRateLimiter({ limit: 12, windowMs: 10 * 60_000 });
export const llmGlobalLimiter = createRateLimiter({ limit: 500, windowMs: 24 * 60 * 60_000 });

export type RateLimited = { error: string; retryAfterMs: number };

/** Applies both LLM limiters; returns the message and wait time if blocked. */
export function checkLlmRateLimit(ip: string, scope: string): RateLimited | null {
  const perIp = askIpLimiter.check(`${scope}:${ip}`);
  if (!perIp.allowed) return { error: "Too many requests. Please wait a few minutes.", retryAfterMs: perIp.retryAfterMs };
  const global = llmGlobalLimiter.check("global");
  if (!global.allowed) return { error: "Daily limit reached. Please try again tomorrow.", retryAfterMs: global.retryAfterMs };
  return null;
}

// Agent endpoints (/api/mcp, /api/a2a, the standalone MCP server): per-IP
// damping on every request. LLM-backed calls also go through checkLlmRateLimit.
export const agentIpLimiter = createRateLimiter({ limit: 60, windowMs: 10 * 60_000 });

/** Applies the agent-endpoint limiter for `scope` ("mcp", "a2a"); returns the message and wait time if blocked. */
export function checkAgentRateLimit(ip: string, scope: string): RateLimited | null {
  const perIp = agentIpLimiter.check(`${scope}:${ip}`);
  return perIp.allowed ? null : { error: "Too many requests. Please slow down and retry shortly.", retryAfterMs: perIp.retryAfterMs };
}

/** A 429 body plus a Retry-After header, so pages can count down instead of guessing. */
export function rateLimitedInit(retryAfterMs: number): ResponseInit {
  return { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } };
}

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

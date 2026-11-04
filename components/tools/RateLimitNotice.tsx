"use client";

import { useEffect, useState } from "react";
import { LuClock } from "react-icons/lu";

/** Reads the wait from a 429 body (`retryAfterMs`) or the Retry-After header. */
export async function retryAfterFrom(res: Response): Promise<{ error: string; retryAfterMs: number }> {
  const body = (await res.clone().json().catch(() => ({}))) as { error?: string; retryAfterMs?: number };
  const header = Number(res.headers.get("Retry-After"));
  const retryAfterMs = body.retryAfterMs ?? (Number.isFinite(header) ? header * 1000 : 60_000);
  return { error: body.error ?? "Too many requests.", retryAfterMs };
}

const mmss = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** A live countdown for a rate limit; calls `onDone` when the wait is over. */
export default function RateLimitNotice({ message, until, onDone }: { message: string; until: number; onDone: () => void }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = until - now;
  useEffect(() => {
    if (left <= 0) onDone();
  }, [left, onDone]);

  if (left <= 0) return null;
  return (
    <p role="status" className="flex items-center gap-2 rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-fg">
      <LuClock size={15} aria-hidden="true" className="shrink-0 text-warn" />
      <span>
        {message} You can try again in <span className="font-mono tabular-nums">{mmss(left)}</span>.
      </span>
    </p>
  );
}

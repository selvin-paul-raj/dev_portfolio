// Keeps agent-surface tests offline and deterministic: no LLM or TypeSafe keys
// (so /ask runs extractively), and any un-mocked network call fails loudly.
import { vi } from "vitest";

const KEYS = [
  "LLM_BASE_URL",
  "LLM_API_KEY",
  "LLM_MODEL",
  "LLM_FALLBACK_BASE_URL",
  "LLM_FALLBACK_API_KEY",
  "LLM_FALLBACK_MODEL",
  "TYPESAFE_API_KEY",
  "CHALLENGE_SALT",
  "RESEND_API_KEY",
  "GITHUB_TOKEN",
];

export function goOffline(): void {
  for (const key of KEYS) vi.stubEnv(key, "");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: unknown) => {
      throw new Error(`Unexpected network call in test: ${String(url)}`);
    })
  );
}

let ipCounter = 0;
/** A fresh client IP per call, so per-IP rate limits never couple tests. */
export const freshIp = () => `10.0.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;

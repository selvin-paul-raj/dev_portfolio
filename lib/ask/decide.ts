// lib/ask/decide.ts
// Client for TypeSafe's System One API (https://docs.typesafe.ai/api): decision
// models that return calibrated probabilities instead of generated text. Used
// for the yes/no safety calls in /ask and /challenge, where a probability is
// a better fit than parsing "YES"/"NO" out of a chat model.
// Env: TYPESAFE_API_KEY (required), TYPESAFE_MODEL (default jev-latest),
// TYPESAFE_BASE_URL (default https://api.typesafe.ai/v1, e.g. for a gateway).

export class DecideError extends Error {}

export function decideConfigured(): boolean {
  return Boolean(process.env.TYPESAFE_API_KEY);
}

function baseUrl(): string {
  return (process.env.TYPESAFE_BASE_URL || "https://api.typesafe.ai/v1").replace(/\/+$/, "");
}

export function decisionModel(): string {
  return process.env.TYPESAFE_MODEL || "jev-latest";
}

/** Asks yes/no ("noul") questions about `state`; returns P(yes) per question. */
export async function decideNoul<K extends string>(
  state: Record<string, string>,
  questions: Record<K, string>
): Promise<Record<K, number>> {
  if (!decideConfigured()) throw new DecideError("TypeSafe not configured");

  const body = {
    model: decisionModel(),
    state,
    questions: Object.fromEntries(
      Object.entries<string>(questions).map(([name, instructions]) => [name, { type: "noul", instructions }])
    ),
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/systemone`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new DecideError("TypeSafe request failed");
  }
  // Never surface provider error bodies to clients.
  if (!res.ok) throw new DecideError(`TypeSafe HTTP ${res.status}`);

  const json = (await res.json()) as { answers?: Record<string, { noul?: number }> };
  const out = {} as Record<K, number>;
  for (const name of Object.keys(questions) as K[]) {
    const p = json.answers?.[name]?.noul;
    if (typeof p !== "number") throw new DecideError(`TypeSafe returned no answer for ${name}`);
    out[name] = p;
  }
  return out;
}

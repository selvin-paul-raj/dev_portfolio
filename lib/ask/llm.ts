// lib/ask/llm.ts
// Minimal client for OpenAI-compatible chat completions with ordered provider
// fallback, so one free tier hitting its rate limit doesn't take /ask down.
// Primary: LLM_BASE_URL / LLM_API_KEY / LLM_MODEL. Optional fallback:
// LLM_FALLBACK_BASE_URL / LLM_FALLBACK_API_KEY / LLM_FALLBACK_MODEL.
// Free-tier presets are listed in .env.example.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Provider {
  baseUrl: string;
  apiKey: string;
  model: string;
}

function providers(): Provider[] {
  const read = (prefix: string): Provider | null => {
    const baseUrl = process.env[`${prefix}BASE_URL`];
    const apiKey = process.env[`${prefix}API_KEY`];
    const model = process.env[`${prefix}MODEL`];
    return baseUrl && apiKey && model ? { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey, model } : null;
  };
  return [read("LLM_"), read("LLM_FALLBACK_")].filter((p): p is Provider => p !== null);
}

export function llmConfigured(): boolean {
  return providers().length > 0;
}

export class LlmError extends Error {}

async function callProvider(p: Provider, messages: ChatMessage[], maxTokens: number): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
      body: JSON.stringify({ model: p.model, messages, temperature: 0.2, max_tokens: maxTokens }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new LlmError("LLM request failed");
  }
  // Never surface provider error bodies to clients (they can echo config).
  if (!res.ok) throw new LlmError(`LLM HTTP ${res.status}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new LlmError("LLM returned no content");
  return text;
}

export async function chat(messages: ChatMessage[], { maxTokens = 900 } = {}): Promise<string> {
  const list = providers();
  if (list.length === 0) throw new LlmError("LLM not configured");
  let lastError: LlmError = new LlmError("LLM unavailable");
  for (const p of list) {
    try {
      return await callProvider(p, messages, maxTokens);
    } catch (e) {
      if (!(e instanceof LlmError)) throw e;
      lastError = e;
    }
  }
  throw lastError;
}

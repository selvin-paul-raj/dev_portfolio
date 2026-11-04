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

/** Which configured provider produced a reply: model name only, never keys or URLs. */
export interface ChatOutcome {
  text: string;
  provider: "primary" | "fallback";
  model: string;
}

function request(p: Provider, messages: ChatMessage[], maxTokens: number, stream: boolean): Promise<Response> {
  return fetch(`${p.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
    body: JSON.stringify({ model: p.model, messages, temperature: 0.2, max_tokens: maxTokens, ...(stream ? { stream: true } : {}) }),
    signal: AbortSignal.timeout(stream ? 30_000 : 20_000),
  }).catch(() => {
    throw new LlmError("LLM request failed");
  });
}

async function callProvider(p: Provider, messages: ChatMessage[], maxTokens: number): Promise<string> {
  const res = await request(p, messages, maxTokens, false);
  // Never surface provider error bodies to clients (they can echo config).
  if (!res.ok) throw new LlmError(`LLM HTTP ${res.status}`);
  const json = (await res.json().catch(() => {
    throw new LlmError("LLM returned non-JSON");
  })) as { choices?: Array<{ message?: { content?: unknown } }> } | null;
  const content = json?.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content.trim() : "";
  if (!text) throw new LlmError("LLM returned no content");
  return text;
}

/** The content piece of one SSE line, or "" for comments, keep-alives and [DONE]. */
function sseContent(line: string): string {
  const data = line.startsWith("data:") ? line.slice(5).trim() : "";
  if (!data || data === "[DONE]") return "";
  let chunk: { choices?: Array<{ delta?: { content?: unknown } }> } | null;
  try {
    chunk = JSON.parse(data);
  } catch {
    throw new LlmError("LLM stream sent non-JSON");
  }
  const content = chunk?.choices?.[0]?.delta?.content;
  return typeof content === "string" ? content : "";
}

/** Reads an OpenAI-compatible SSE body, calling `onDelta` per content chunk. */
async function streamProvider(p: Provider, messages: ChatMessage[], maxTokens: number, onDelta: (text: string) => void): Promise<string> {
  const res = await request(p, messages, maxTokens, true);
  if (!res.ok || !res.body) throw new LlmError(`LLM HTTP ${res.status}`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let text = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const piece of lines.map(sseContent)) {
        if (!piece) continue;
        text += piece;
        onDelta(piece);
      }
    }
  } catch {
    throw new LlmError("LLM stream broke");
  }
  if (!text.trim()) throw new LlmError("LLM returned no content");
  return text.trim();
}

const labelOf = (i: number, p: Provider) => ({ provider: i === 0 ? "primary" : "fallback", model: p.model }) as const;

/** Like `chat`, but also says which provider answered. */
export async function chatWithProvider(messages: ChatMessage[], { maxTokens = 900 } = {}): Promise<ChatOutcome> {
  const list = providers();
  if (list.length === 0) throw new LlmError("LLM not configured");
  let lastError: LlmError = new LlmError("LLM unavailable");
  for (const [i, p] of list.entries()) {
    try {
      return { text: await callProvider(p, messages, maxTokens), ...labelOf(i, p) };
    } catch (e) {
      if (!(e instanceof LlmError)) throw e;
      lastError = e;
    }
  }
  throw lastError;
}

/**
 * Streams the reply chunk by chunk. Per provider it tries a streamed call, then
 * a plain one; `onReset` fires when text already sent must be discarded.
 */
export async function chatStream(
  messages: ChatMessage[],
  { maxTokens = 900, onDelta, onReset }: { maxTokens?: number; onDelta: (text: string) => void; onReset: () => void }
): Promise<ChatOutcome> {
  const list = providers();
  if (list.length === 0) throw new LlmError("LLM not configured");
  let lastError: LlmError = new LlmError("LLM unavailable");
  let sent = false;
  const emit = (piece: string) => {
    sent = true;
    onDelta(piece);
  };
  for (const [i, p] of list.entries()) {
    for (const attempt of [() => streamProvider(p, messages, maxTokens, emit), () => callProvider(p, messages, maxTokens)]) {
      try {
        return { text: await attempt(), ...labelOf(i, p) };
      } catch (e) {
        if (!(e instanceof LlmError)) throw e;
        lastError = e;
        if (sent) onReset();
        sent = false;
      }
    }
  }
  throw lastError;
}

export async function chat(messages: ChatMessage[], { maxTokens = 900 } = {}): Promise<string> {
  return (await chatWithProvider(messages, { maxTokens })).text;
}

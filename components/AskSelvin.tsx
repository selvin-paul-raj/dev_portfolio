"use client";

import { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import type { AskResult } from "@/lib/ask/answer";

const SUGGESTIONS = [
  "What did Selvin build at Zinnov (Draup)?",
  "Has he built MCP servers?",
  "How does he evaluate LLM systems?",
  "What retrieval experience does he have?",
];

type Turn = { question: string; result?: AskResult; error?: string };

export default function AskSelvin() {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);

  async function ask(q: string) {
    const text = q.trim();
    if (text.length < 3 || busy) return;
    setBusy(true);
    setQuestion("");
    setTurns((t) => [...t, { question: text }]);
    let turn: Turn;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const json = await res.json();
      turn = res.ok ? { question: text, result: json } : { question: text, error: json.error ?? "Something went wrong." };
    } catch {
      turn = { question: text, error: "Network error. Please try again." };
    }
    setTurns((t) => [...t.slice(0, -1), turn]);
    setBusy(false);
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {turns.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="text-sm px-3.5 py-2 rounded-full border border-black/10 dark:border-white/10 text-gray-700 dark:text-white/65
                hover:bg-black/[0.04] dark:hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <ol aria-live="polite" className="flex flex-col gap-6">
        {turns.map((t, i) => (
          <li key={i} className="flex flex-col gap-3">
            <p className="self-end max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm bg-gray-900 dark:bg-white/[0.08] text-white dark:text-white/90">
              {t.question}
            </p>
            {!t.result && !t.error && <p className="text-sm text-gray-500 dark:text-white/50 animate-pulse motion-reduce:animate-none">Searching the portfolio…</p>}
            {t.error && <p className="text-sm text-red-600 dark:text-red-400">{t.error}</p>}
            {t.result && <Answer result={t.result} />}
          </li>
        ))}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex gap-2"
      >
        <label htmlFor="ask" className="sr-only">Ask a question about Selvin</label>
        <input
          id="ask"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          placeholder="Ask about projects, skills, experience…"
          className="flex-1 rounded-full px-5 py-3 text-sm bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10
            text-gray-900 dark:text-white/85 placeholder:text-gray-500 dark:placeholder:text-white/40
            outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          disabled={busy || question.trim().length < 3}
          aria-label="Ask"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 dark:bg-accent text-white dark:text-black
            disabled:opacity-40 active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <BsArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}

function Answer({ result }: { result: AskResult }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[0.95rem] leading-relaxed text-gray-800 dark:text-white/80">{result.answer}</p>
      {result.citations.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {result.citations.map((c) => (
            <li key={c.n} className="text-xs leading-relaxed text-gray-600 dark:text-white/55">
              <span className="font-mono text-gray-500 dark:text-white/45">[{c.n}] bm25 {c.score.toFixed(2)} · </span>
              <a
                href={c.url}
                {...(c.url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="font-medium text-gray-800 dark:text-white/75 underline decoration-accent/60 underline-offset-2 hover:decoration-accent"
              >
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-white/40">
        {result.mode === "llm" ? "LLM answer, grounded in the cited snippets" : "Retrieval-only (no LLM): quoted from the portfolio"}
      </p>
      {result.gate.source === "typesafe" && (
        <p className="font-mono text-xs tracking-[0.04em] text-gray-500 dark:text-white/40">
          Gate · TypeSafe {result.gate.model} · on-topic {result.gate.onTopic?.toFixed(2)} · injection {result.gate.injection?.toFixed(2)}
        </p>
      )}
    </div>
  );
}

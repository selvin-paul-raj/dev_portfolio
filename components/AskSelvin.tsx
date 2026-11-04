"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { LuArrowRight, LuSquarePen } from "react-icons/lu";
import RateLimitNotice from "@/components/tools/RateLimitNotice";
import { FIELD, ICON_BTN, PRIMARY_BTN } from "@/components/tools/styles";
import TurnView from "./ask/TurnView";
import { useConversation, useHydrated } from "./ask/useConversation";
import { CHIP, COUNTER_FROM, followUps, MAX_CHARS, SUGGESTIONS } from "./ask/model";
import type { Turn } from "./ask/model";

/** Questions not yet asked, for the chips under the log and on refusals. */
function unasked(turns: Turn[], count: number): string[] {
  const asked = new Set(turns.map((t) => t.question.toLowerCase()));
  return SUGGESTIONS.filter((s) => !asked.has(s.toLowerCase())).slice(0, count);
}

/** Scrolls the newest turn into view when one is added (not when a saved conversation is restored). */
function useScrollToNewest(list: RefObject<HTMLOListElement | null>, count: number, restored: boolean) {
  const seen = useRef<number | null>(null);
  useEffect(() => {
    if (!restored) return;
    const grew = seen.current !== null && count > seen.current;
    seen.current = count;
    if (!grew) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.current?.lastElementChild?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [list, count, restored]);
}

export default function AskSelvin() {
  const hydrated = useHydrated();
  // Remounts once after hydration so the conversation can start from sessionStorage without a mismatch.
  return <Conversation key={hydrated ? "client" : "server"} restored={hydrated} />;
}

function Conversation({ restored }: { restored: boolean }) {
  const { turns, busy, limit, status, ask, reset, clearLimit } = useConversation(restored);
  const [question, setQuestion] = useState("");
  const list = useRef<HTMLOListElement>(null);
  const autoAsked = useRef(false);
  const blocked = busy || limit !== null;

  useScrollToNewest(list, turns.length, restored);

  // /fit and /evals link here with ?q=; ask it once, then drop it so a reload doesn't repeat it.
  useEffect(() => {
    if (!restored || autoAsked.current) return;
    autoAsked.current = true;
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;
    window.history.replaceState(null, "", window.location.pathname);
    void ask(q.slice(0, MAX_CHARS));
  }, [restored, ask]);

  const submit = (q: string) => {
    if (blocked) return;
    setQuestion("");
    void ask(q);
  };

  const latestDone = [...turns].reverse().find((t) => t.result)?.id;
  const asked = turns.map((t) => t.question);
  const suggestions = unasked(turns, 4);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <output aria-live="polite" className="sr-only">
        {status}
      </output>

      {turns.length > 0 && (
        <div className="flex justify-end">
          <button type="button" onClick={reset} className={ICON_BTN}>
            <LuSquarePen size={14} aria-hidden="true" />
            New conversation
          </button>
        </div>
      )}

      {turns.length > 0 && (
        <ol ref={list} aria-label="Conversation" className="flex flex-col gap-10">
          {turns.map((t) => (
            <TurnView
              key={t.id}
              turn={t}
              next={t.result?.refused ? unasked(turns, 3) : t.id === latestDone && t.result ? followUps(t.result, asked) : []}
              disabled={blocked}
              onAsk={submit}
              onRetry={() => void ask(t.question, t.id)}
            />
          ))}
        </ol>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-fg-2">{turns.length ? "Or try" : "Try one of these"}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" disabled={blocked} onClick={() => submit(s)} className={CHIP}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {limit && <RateLimitNotice message={limit.message} until={limit.until} onDone={clearLimit} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
        className="flex flex-col gap-1.5"
      >
        <label htmlFor="ask" className="sr-only">
          Ask a question about Selvin
        </label>
        <div className="flex gap-2">
          <input
            id="ask"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={MAX_CHARS}
            enterKeyHint="send"
            autoComplete="off"
            aria-describedby={question.length >= COUNTER_FROM ? "ask-count" : undefined}
            placeholder="Ask about projects, skills, experience…"
            className={`${FIELD} h-12 flex-1 rounded-full px-5`}
          />
          <button type="submit" disabled={blocked || question.trim().length < 3} className={`${PRIMARY_BTN} h-12`}>
            <span className="sr-only sm:not-sr-only">Ask</span>
            <LuArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
        {question.length >= COUNTER_FROM && (
          <p id="ask-count" className={`px-5 text-right text-xs tabular-nums ${question.length >= MAX_CHARS ? "text-danger" : "text-fg-2"}`}>
            {question.length}/{MAX_CHARS} characters
          </p>
        )}
      </form>
    </div>
  );
}

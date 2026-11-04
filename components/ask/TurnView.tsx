"use client";

import { useEffect, useState } from "react";
import { LuRotateCcw } from "react-icons/lu";
import CopyButton from "@/components/tools/CopyButton";
import { ICON_BTN } from "@/components/tools/styles";
import CitedText from "./CitedText";
import Sources from "./Sources";
import Refusal from "./Refusal";
import { GatePanel, RetrievalTrace } from "./AnswerDetails";
import { CHIP, sourceId, toMarkdown } from "./model";
import type { Turn } from "./model";

const HIGHLIGHT_MS = 1800;

type Props = {
  turn: Turn;
  /** Follow-ups (on the latest answer) or on-topic suggestions (on a refusal). */
  next: string[];
  disabled: boolean;
  onAsk: (q: string) => void;
  onRetry: () => void;
};

function useHighlight(turnId: string) {
  const [highlighted, setHighlighted] = useState<number | null>(null);
  useEffect(() => {
    if (highlighted === null) return;
    const t = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);
    return () => clearTimeout(t);
  }, [highlighted]);

  const jump = (n: number) => {
    const card = document.getElementById(sourceId(turnId, n));
    if (!card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    card.focus({ preventScroll: true });
    setHighlighted(n);
  };
  return { highlighted, jump };
}

function Pending({ turn }: { turn: Turn }) {
  if (turn.draft) {
    return (
      <div aria-busy="true">
        <CitedText text={turn.draft} citations={[]} onJump={() => undefined} />
      </div>
    );
  }
  return <p className="text-sm text-muted animate-pulse motion-reduce:animate-none">Searching the portfolio…</p>;
}

export default function TurnView({ turn, next, disabled, onAsk, onRetry }: Props) {
  const { highlighted, jump } = useHighlight(turn.id);
  const result = turn.result;
  const info = result ?? turn.meta;
  // Only a turn answered while on screen settles in; turns restored from the session just appear.
  // A streamed answer is already on screen, so only what arrives with the result (copy, sources) animates.
  const [live] = useState(() => turn.status === "pending" || turn.status === "streaming");
  const [streamed, setStreamed] = useState(false);
  if (turn.draft && !streamed) setStreamed(true);
  const settle = live ? "anim-detail-in" : "";

  return (
    <li className="flex scroll-mt-28 flex-col gap-4">
      <p className="max-w-[85%] self-end whitespace-pre-line break-words rounded-2xl rounded-br-sm bg-surface-3 px-4 py-2.5 text-sm text-fg">{turn.question}</p>

      {(turn.status === "pending" || turn.status === "streaming") && <Pending turn={turn} />}

      {turn.status === "error" && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-danger">{turn.error}</p>
          <button type="button" onClick={onRetry} disabled={disabled} className={`${ICON_BTN} disabled:cursor-not-allowed disabled:opacity-40`}>
            <LuRotateCcw size={14} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {result?.refused && <Refusal reason={result.refusal} suggestions={next} disabled={disabled} onAsk={onAsk} />}

      {result && !result.refused && (
        <>
          <div className={streamed ? "" : settle}>
            <CitedText text={result.answer} citations={result.citations} onJump={jump} />
          </div>
          <div className={`-mt-2 flex ${settle}`}>
            <CopyButton text={() => toMarkdown(result)} label="Copy answer" />
          </div>
          <div className={settle}>
            <Sources turnId={turn.id} citations={result.citations} highlighted={highlighted} />
          </div>
        </>
      )}

      {info && <GatePanel info={info} result={result} />}
      {result && <RetrievalTrace info={result} />}

      {result && !result.refused && next.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-fg-2">Ask next</p>
          <div className="flex flex-wrap gap-2">
            {next.map((q) => (
              <button key={q} type="button" disabled={disabled} onClick={() => onAsk(q)} className={CHIP}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

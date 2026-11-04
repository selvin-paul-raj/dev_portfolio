"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuRotateCcw } from "react-icons/lu";

const STEP_MS = 520;

export type TraceLine = { title: string; actors: string[]; human: boolean };

type Props = {
  /** Case-study slug the footer link opens. */
  slug: string;
  /** One line per pipeline stage, resolved on the server from the case study. */
  lines: TraceLine[];
  /** The measured result shown after the last stage. */
  result: { value: string; label: string };
};

/**
 * Replays a DRI-MAS run as a terminal trace: one stage per line, then the measured result.
 * Plays once when it scrolls into view; Replay runs it again. Reduced motion shows it whole.
 */
export default function AgentTrace({ slug, lines, result }: Props) {
  const total = lines.length + 1; // the stages, then the result line
  // Server and no-JS render the finished trace; the client rewinds it once it's on screen.
  const [shown, setShown] = useState(total);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);

  const play = useCallback(() => {
    clearInterval(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(total);
      return;
    }
    setShown(0);
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= total) clearInterval(timer.current);
        return Math.min(n + 1, total);
      });
    }, STEP_MS);
  }, [total]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          play();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer.current);
    };
  }, [play]);

  const done = shown >= total;

  return (
    <div ref={root} className="rounded-[18px] border border-line bg-surface-2 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 sm:px-5 py-3">
        <p className="font-mono text-[13px] text-fg-2 min-w-0 truncate">
          <span aria-hidden="true" className="text-muted">$ </span>dri-mas run
          <span className="text-muted"> --request &quot;plain English&quot;</span>
        </p>
        <button
          type="button"
          onClick={play}
          disabled={!done}
          className="shrink-0 inline-flex min-h-11 [@media(pointer:fine)]:min-h-8 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium
            text-fg-2 hover:border-fg/30 disabled:opacity-40 transition-colors duration-150
            outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <LuRotateCcw size={13} aria-hidden="true" /> Replay
        </button>
      </div>

      <ol className="px-4 sm:px-5 py-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => {
          const visible = i < shown;
          const running = i === shown - 1 && !done;
          return (
            <li
              key={line.title}
              className={`grid grid-cols-[1.75rem_minmax(0,1fr)_1.25rem] gap-x-2 py-1 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
            >
              <span className="text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="font-sans text-sm text-fg">{line.title}</span>
                <span className="block truncate text-muted">
                  {line.actors.join(", ").toLowerCase()}
                  {line.human && <span className="text-info">{line.actors.length ? ", " : ""}person, if unsure</span>}
                </span>
              </span>
              <span aria-hidden="true" className={running ? "text-accent-fg animate-pulse motion-reduce:animate-none" : "text-ok"}>
                {running ? "…" : "✓"}
              </span>
            </li>
          );
        })}
        <li
          className={`mt-3 border-t border-line pt-3 transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-accent-fg">result </span>
          <span className="font-sans text-base font-semibold text-fg">{result.value}</span>
          <span className="text-muted">, {result.label.toLowerCase()}</span>
        </li>
      </ol>

      <div className="border-t border-line px-4 sm:px-5 py-3">
        <Link
          href={`/work/${slug}`}
          className="inline-flex min-h-11 [@media(pointer:fine)]:min-h-0 items-center gap-1.5 rounded-sm text-sm font-medium text-fg-2 hover:text-fg
            outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          See the full pipeline <LuArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
      <p role="status" className="sr-only">{done ? `Run complete: ${result.value}, ${result.label}.` : ""}</p>
    </div>
  );
}

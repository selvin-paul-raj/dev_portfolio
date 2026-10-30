"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuRotateCcw } from "react-icons/lu";
import { getCaseStudy } from "@/lib/work";

const study = getCaseStudy("dri-mas");
const STEP_MS = 520;

type TraceLine = { title: string; actors: string[]; human: boolean };

// Each pipeline stage from the case study: its title, the agents and nodes that run it, and
// whether a person can be pulled in there. Stores (checkpointer, memory) are left out of the line.
const LINES: TraceLine[] = (study?.steps ?? []).map((s) => {
  const nodes = s.nodes.map((id) => study!.diagram.nodes.find((n) => n.id === id)).filter((n) => n !== undefined);
  return {
    title: s.title,
    actors: nodes.filter((n) => n.kind !== "hitl" && n.kind !== "store").slice(0, 2).map((n) => n.label),
    human: nodes.some((n) => n.kind === "hitl"),
  };
});

/**
 * Replays a DRI-MAS run as a terminal trace: one stage per line, then the measured result.
 * Plays once when it scrolls into view; Replay runs it again. Reduced motion shows it whole.
 */
export default function AgentTrace() {
  const total = LINES.length + 1; // the stages, then the result line
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

  if (!study) return null;
  const done = shown >= total;
  const result = study.results[0];

  return (
    <div ref={root} className="rounded-[18px] border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#0c0c10] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.06] px-4 sm:px-5 py-3">
        <p className="font-mono text-[13px] text-gray-700 dark:text-white/75 min-w-0 truncate">
          <span aria-hidden="true" className="text-gray-400 dark:text-white/35">$ </span>dri-mas run
          <span className="text-gray-500 dark:text-white/45"> --request &quot;plain English&quot;</span>
        </p>
        <button
          type="button"
          onClick={play}
          disabled={!done}
          className="shrink-0 inline-flex min-h-11 [@media(pointer:fine)]:min-h-8 items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 px-3 text-xs font-medium
            text-gray-700 dark:text-white/75 hover:border-black/25 dark:hover:border-white/30 disabled:opacity-40 transition-colors duration-150
            outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <LuRotateCcw size={13} aria-hidden="true" /> Replay
        </button>
      </div>

      <ol className="px-4 sm:px-5 py-4 font-mono text-[13px] leading-relaxed">
        {LINES.map((line, i) => {
          const visible = i < shown;
          const running = i === shown - 1 && !done;
          return (
            <li
              key={line.title}
              className={`grid grid-cols-[1.75rem_minmax(0,1fr)_1.25rem] gap-x-2 py-1 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
            >
              <span className="text-gray-400 dark:text-white/30 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="font-sans text-sm text-gray-900 dark:text-white/90">{line.title}</span>
                <span className="block truncate text-gray-500 dark:text-white/40">
                  {line.actors.join(", ").toLowerCase()}
                  {line.human && <span className="text-sky-700 dark:text-sky-300">{line.actors.length ? ", " : ""}person, if unsure</span>}
                </span>
              </span>
              <span aria-hidden="true" className={running ? "text-amber-600 dark:text-accent animate-pulse motion-reduce:animate-none" : "text-emerald-600 dark:text-emerald-400"}>
                {running ? "…" : "✓"}
              </span>
            </li>
          );
        })}
        <li
          className={`mt-3 border-t border-black/[0.06] dark:border-white/[0.06] pt-3 transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-amber-700 dark:text-accent">result </span>
          <span className="font-sans text-base font-semibold text-gray-900 dark:text-white">{result.value}</span>
          <span className="text-gray-500 dark:text-white/50">, {result.label.toLowerCase()}</span>
        </li>
      </ol>

      <div className="border-t border-black/[0.06] dark:border-white/[0.06] px-4 sm:px-5 py-3">
        <Link
          href={`/work/${study.slug}`}
          className="inline-flex min-h-11 [@media(pointer:fine)]:min-h-0 items-center gap-1.5 rounded-sm text-sm font-medium text-gray-700 dark:text-white/75 hover:text-gray-950 dark:hover:text-white
            outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          See the full pipeline <LuArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
      <p role="status" className="sr-only">{done ? `Run complete: ${result.value}, ${result.label}.` : ""}</p>
    </div>
  );
}

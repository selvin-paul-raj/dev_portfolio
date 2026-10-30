"use client";

import type { CSSProperties } from "react";
import { useInView } from "react-intersection-observer";
import { fmtMonth } from "./Publication";

export type Placing = {
  title: string;
  issuer: string;
  date: string;
  category: string;
  associated_with: string;
  certificate_available: boolean;
  rank?: number;
};

const ORDINAL: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };
// Drawn left to right as a podium: second, first, third.
const STEPS = [
  { rank: 2, height: "h-20", tone: "bg-gray-300 dark:bg-white/30 text-gray-900 dark:text-white" },
  { rank: 1, height: "h-28", tone: "bg-amber-500 dark:bg-accent text-[#1a1500]" },
  { rank: 3, height: "h-14", tone: "bg-amber-800/30 dark:bg-amber-700/40 text-gray-900 dark:text-white" },
];

/** Competition placings: a podium sized by rank, with every event listed beneath it. */
export default function Podium({ placings }: { placings: Placing[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const count = (rank: number) => placings.filter((p) => p.rank === rank).length;
  const ordered = [...placings].sort((a, b) => (a.rank ?? 9) - (b.rank ?? 9) || b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-6">
      <div ref={ref} data-armed={inView || undefined} aria-hidden="true" className="grid grid-cols-3 items-end gap-2 max-w-sm">
        {STEPS.map((s, i) => (
          <div key={s.rank} className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium tabular-nums text-gray-700 dark:text-white/75">
              {count(s.rank)} × {ORDINAL[s.rank]}
            </span>
            <span
              className={`podium-step flex w-full items-start justify-center rounded-t-lg pt-2 text-lg font-semibold ${s.height} ${s.tone}`}
              style={{ "--i": i } as CSSProperties}
            >
              {s.rank}
            </span>
          </div>
        ))}
      </div>

      <ol className="border-t border-black/[0.08] dark:border-white/[0.07]">
        {ordered.map((p) => (
          <li key={p.title} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3.5 border-b border-black/[0.08] dark:border-white/[0.07]">
            <span
              className={`flex h-8 w-11 items-center justify-center rounded-md text-xs font-semibold tabular-nums
                ${p.rank === 1 ? "bg-amber-500/15 text-amber-800 dark:bg-accent/15 dark:text-accent" : "bg-black/[0.05] text-gray-700 dark:bg-white/[0.06] dark:text-white/75"}`}
            >
              {p.rank ? ORDINAL[p.rank] : "Win"}
            </span>
            <div className="min-w-0">
              <p className="font-medium leading-snug text-gray-900 dark:text-white">{p.title.replace(/^\d+(st|nd|rd|th) Place:\s*/i, "")}</p>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-white/55">
                {p.issuer}, <span className="font-mono text-xs tabular-nums">{fmtMonth(p.date)}</span>
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-white/45">
                {p.category}, representing {p.associated_with}
                {p.certificate_available ? ". Certificate on file." : "."}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

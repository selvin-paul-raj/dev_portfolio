"use client";

import { GROUP_LABEL, yearStats, type Group } from "./data";

const ORDER: Group[] = ["other", "web", "ai"]; // drawn bottom-up, AI on top
const FILL: Record<Group, string> = {
  ai: "bg-amber-500 dark:bg-accent",
  web: "bg-gray-400 dark:bg-white/40",
  other: "bg-gray-300 dark:bg-white/15",
};
const PEAK = Math.max(...yearStats.map((y) => y.total));
const latest = yearStats[yearStats.length - 1];

/** Certificates per year, stacked by group. A column opens the full list for that year. */
export default function YearChart({ selected, onPick }: { selected: string | null; onPick: (year: string) => void }) {
  return (
    <figure className="flex flex-col gap-4">
      <div className="flex items-end gap-3 sm:gap-5 h-44" role="group" aria-label="Certificates per year">
        {yearStats.map((y) => {
          const on = selected === y.year;
          const parts = ORDER.filter((g) => y[g] > 0).map((g) => `${y[g]} ${GROUP_LABEL[g].toLowerCase()}`);
          return (
            <button
              key={y.year}
              type="button"
              aria-pressed={on}
              aria-label={`${y.year}: ${y.total} certificates (${parts.join(", ")}). Show them.`}
              onClick={() => onPick(y.year)}
              className={`group flex h-full flex-1 flex-col items-center justify-end gap-2 rounded-lg px-1 pt-1 pb-0
                outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-150
                ${on ? "bg-black/[0.04] dark:bg-white/[0.05]" : "hover:bg-black/[0.025] dark:hover:bg-white/[0.03]"}`}
            >
              <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">{y.total}</span>
              <span
                className="cert-col flex w-full max-w-[3.5rem] flex-col-reverse overflow-hidden rounded-md"
                style={{ height: `${(y.total / PEAK) * 100}%` }}
              >
                {ORDER.map((g) => (y[g] > 0 ? <span key={g} className={`block w-full ${FILL[g]}`} style={{ height: `${(y[g] / y.total) * 100}%` }} /> : null))}
              </span>
              <span className={`font-mono text-xs tabular-nums ${on ? "text-amber-700 dark:text-accent" : "text-gray-500 dark:text-white/45"}`}>{y.year}</span>
            </button>
          );
        })}
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-white/55">
        {[...ORDER].reverse().map((g) => (
          <span key={g} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`h-2 w-3 rounded-sm ${FILL[g]}`} />
            {GROUP_LABEL[g]}
          </span>
        ))}
        <span className="basis-full mt-1 text-sm text-gray-700 dark:text-white/70">
          {latest.ai} of {latest.total} in {latest.year} are AI and agents.
        </span>
      </figcaption>
    </figure>
  );
}

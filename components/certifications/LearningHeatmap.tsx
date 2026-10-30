"use client";

import { busiest, grid, monthLabel, MONTHS, years, type Cell } from "./model";

export type Selection = { kind: "featured" } | { kind: "all" } | { kind: "year"; year: string } | { kind: "month"; key: string };

// Four intensity steps, like a contributions graph; the hue says whether the month was mostly AI.
function shade(c: Cell): string {
  if (c.total === 0) return "bg-black/[0.04] dark:bg-white/[0.04]";
  const step = c.total >= 8 ? 3 : c.total >= 4 ? 2 : c.total >= 2 ? 1 : 0;
  const ai = c.ai * 2 >= c.total;
  const goldSteps = ["bg-amber-200 dark:bg-accent/30", "bg-amber-300 dark:bg-accent/50", "bg-amber-400 dark:bg-accent/75", "bg-amber-500 dark:bg-accent"];
  const greySteps = ["bg-gray-200 dark:bg-white/[0.14]", "bg-gray-300 dark:bg-white/[0.22]", "bg-gray-400 dark:bg-white/[0.32]", "bg-gray-500 dark:bg-white/[0.45]"];
  return (ai ? goldSteps : greySteps)[step];
}

const darkText = (c: Cell) => (c.ai * 2 >= c.total && c.total >= 4 ? "text-[#1a1500]" : "text-fg");

export default function LearningHeatmap({ selection, onSelect }: { selection: Selection; onSelect: (s: Selection) => void }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-fg">When I learned it</h3>
          <p className="mt-0.5 text-sm text-fg-2">
            Certificates per month. Busiest: {monthLabel(busiest.key)}, {busiest.total}. Pick a month or a year.
          </p>
        </div>
        <ul aria-label="Legend" className="flex gap-4 text-sm text-fg-2">
          <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-[3px] bg-amber-400 dark:bg-accent/75" />Mostly AI and agents</li>
          <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-[3px] bg-gray-400 dark:bg-white/[0.32]" />Mostly web and other</li>
        </ul>
      </div>

      <p className="mb-2 text-xs text-muted [@media(pointer:fine)]:hidden sm:hidden">Swipe the grid for later months.</p>
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <table className="w-full table-fixed min-w-[19rem] [@media(pointer:coarse)]:min-w-[29rem] border-separate border-spacing-[3px] sm:border-spacing-1 text-center">
          <caption className="sr-only">Certificates earned per month, by year</caption>
          <thead>
            <tr>
              <th scope="col" className="w-12"><span className="sr-only">Year</span></th>
              {MONTHS.map((m) => (
                <th key={m} scope="col" className="text-[11px] sm:text-xs font-normal text-muted">
                  <span className="sm:hidden">{m[0]}</span>
                  <span className="hidden sm:inline">{m}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y}>
                <th scope="row" className="pr-1 text-left">
                  <button
                    type="button"
                    onClick={() => onSelect({ kind: "year", year: y })}
                    aria-pressed={selection.kind === "year" && selection.year === y}
                    className="min-h-8 [@media(pointer:coarse)]:min-h-11 rounded text-xs font-medium tabular-nums text-gray-600 dark:text-white/60 hover:text-gray-950 dark:hover:text-white
                      aria-pressed:text-amber-700 dark:aria-pressed:text-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {y}
                  </button>
                </th>
                {grid[y].map((c) => {
                  const on = selection.kind === "month" && selection.key === c.key;
                  const label = `${monthLabel(c.key)}: ${c.total} ${c.total === 1 ? "certificate" : "certificates"}${c.total ? `, ${c.ai} in AI` : ""}`;
                  return (
                    <td key={c.key} className="p-0">
                      {c.total === 0 ? (
                        <span title={label} className={`block h-8 sm:h-9 w-full rounded-[4px] ${shade(c)}`}>
                          <span className="sr-only">{label}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          title={label}
                          aria-label={label}
                          aria-pressed={on}
                          onClick={() => onSelect(on ? { kind: "featured" } : { kind: "month", key: c.key })}
                          className={`flex h-8 sm:h-9 [@media(pointer:coarse)]:h-11 w-full items-center justify-center rounded-[4px] text-[11px] font-semibold tabular-nums ${shade(c)} ${darkText(c)}
 transition-transform duration-150 hover:scale-110 motion-reduce:hover:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-accent
 ${on ? "ring-2 ring-gray-900 dark:ring-white ring-offset-1 ring-offset-white dark:ring-offset-[#0c0c10]" : ""}`}
                        >
                          <span aria-hidden="true" className="hidden sm:inline">{c.total}</span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

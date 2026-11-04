"use client";

import { busiest, grid, monthLabel, MONTHS, years, type Cell } from "./model";

export type Selection = { kind: "featured" } | { kind: "all" } | { kind: "year"; year: string } | { kind: "month"; key: string };

// Five intensity steps, like a contributions graph; the hue says whether the month was mostly AI.
const THRESHOLDS = [1, 2, 4, 8, 16];
const GOLD = ["bg-accent/25", "bg-accent/40", "bg-accent/60", "bg-accent/80", "bg-accent"];
const GREY = ["bg-fg/[0.10]", "bg-fg/[0.18]", "bg-fg/[0.28]", "bg-fg/[0.40]", "bg-fg/[0.55]"];
const EMPTY = "bg-fg/[0.05]";

const stepOf = (total: number) => THRESHOLDS.filter((t) => total >= t).length - 1;
const mostlyAI = (c: Cell) => c.ai * 2 >= c.total;
const shade = (c: Cell) => (c.total === 0 ? EMPTY : (mostlyAI(c) ? GOLD : GREY)[stepOf(c.total)]);

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const yearTotal = (y: string) => grid[y].reduce((n, c) => n + c.total, 0);

// Square cells that shrink with the container, so the whole grid fits from 320px up with no scrolling.
// The narrower side columns on phones leave each month a 24px pitch at common widths (WCAG 2.5.8).
const ROW =
  "grid grid-cols-[2rem_repeat(12,minmax(0,1fr))_1.5rem] sm:grid-cols-[2.25rem_repeat(12,minmax(0,1fr))_1.75rem] items-center gap-[3px] sm:gap-1";
// The button spills into the gap around its square, so the hit area is the full cell pitch while the square stays small.
const HIT = "group block -m-[1.5px] w-[calc(100%+3px)] p-[1.5px] sm:-m-0.5 sm:w-[calc(100%+4px)] sm:p-0.5 rounded-[4px] outline-none";
const SQUARE = "aspect-square w-full rounded-[3px] sm:rounded-[4px]";

export default function LearningHeatmap({ selection, onSelect }: { selection: Selection; onSelect: (s: Selection) => void }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-6 lg:flex lg:items-start lg:justify-between lg:gap-10">
      <div className="lg:max-w-xs">
        <h3 className="text-base font-semibold text-fg">When I learned it</h3>
        <p className="mt-0.5 text-sm text-fg-2">
          Certificates per month. Busiest: {monthLabel(busiest.key)}, {busiest.total}. Pick a month or a year.
        </p>
      </div>

      <div className="mt-5 w-full max-w-[24rem] lg:mt-0 lg:shrink-0">
        <div role="table" aria-label="Certificates earned per month, by year, with a yearly total">
        <div role="row" className={`${ROW} mb-1`}>
          <span role="columnheader"><span className="sr-only">Year</span></span>
          {MONTHS.map((m, i) => (
            <span key={m} role="columnheader" className="text-center text-[10px] sm:text-xs text-muted">
              <span className="sr-only">{MONTH_NAMES[i]}</span>
              <span aria-hidden="true" className="sm:hidden">{m[0]}</span>
              <span aria-hidden="true" className="hidden sm:inline">{m}</span>
            </span>
          ))}
          <span role="columnheader" className="text-right text-[10px] sm:text-xs text-muted">Total</span>
        </div>

        <div role="rowgroup" className="flex flex-col gap-[3px] sm:gap-1">
          {years.map((y) => (
            <div key={y} role="row" className={ROW}>
              <span role="rowheader">
                <button
                  type="button"
                  onClick={() => onSelect({ kind: "year", year: y })}
                  aria-pressed={selection.kind === "year" && selection.year === y}
                  className="rounded text-[11px] sm:text-xs font-medium tabular-nums text-fg-2 hover:text-fg aria-pressed:text-accent-fg
                    outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {y}
                </button>
              </span>
              {grid[y].map((c) => {
                const on = selection.kind === "month" && selection.key === c.key;
                const label = `${monthLabel(c.key)}: ${c.total} ${c.total === 1 ? "certificate" : "certificates"}${c.total ? `, ${c.ai} in AI` : ""}`;
                return (
                  <span key={c.key} role="cell" className="block">
                    {c.total === 0 ? (
                      <span title={label} className={`block ${SQUARE} ${EMPTY}`}>
                        <span className="sr-only">{label}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        title={label}
                        aria-label={label}
                        aria-pressed={on}
                        onClick={() => onSelect(on ? { kind: "featured" } : { kind: "month", key: c.key })}
                        className={HIT}
                      >
                        <span
                          aria-hidden="true"
                          className={`block ${SQUARE} ${shade(c)} transition-transform duration-150 ease-out group-hover:scale-125 motion-reduce:group-hover:scale-100
                            group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-surface-2
                            ${on ? "ring-2 ring-fg ring-offset-1 ring-offset-surface-2" : ""}`}
                        />
                      </button>
                    )}
                  </span>
                );
              })}
              <span role="cell" className="text-right text-[11px] sm:text-xs font-medium tabular-nums text-fg-2">{yearTotal(y)}</span>
            </div>
          ))}
        </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted">
          <ul aria-label="Colour key" className="flex flex-wrap gap-x-3 gap-y-1">
            <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-[2px] bg-accent/80" />Mostly AI and agents</li>
            <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-[2px] bg-fg/[0.40]" />Web and other</li>
          </ul>
          <p className="flex items-center gap-1">
            <span className="sr-only">Darker squares mean more certificates.</span>
            <span aria-hidden="true">Less</span>
            {GOLD.map((g) => (
              <span key={g} aria-hidden="true" className={`h-2.5 w-2.5 rounded-[2px] ${g}`} />
            ))}
            <span aria-hidden="true">More</span>
          </p>
        </div>
      </div>
    </div>
  );
}

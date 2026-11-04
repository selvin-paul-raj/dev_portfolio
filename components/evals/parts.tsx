import Link from "next/link";
import type { ReactNode } from "react";
import { LuHistory } from "react-icons/lu";
import { utcStamp } from "@/lib/evalsSummary";

// The case tables repeat these per row, so they are bare SVG paths with the stroke set by
// .ev-icon (app/globals.css) rather than react-icons, which serialize every attribute per use.
const ICON_PATHS = {
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  arrowUpRight: "M7 7h10v10M7 17 17 7",
} as const;

export function Icon({ name, size }: { name: keyof typeof ICON_PATHS; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="ev-icon shrink-0">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

export function Status({ pass }: { pass: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${pass ? "text-ok" : "text-danger"}`}>
      <Icon name={pass ? "check" : "x"} size={14} />
      {pass ? "Pass" : "Fail"}
    </span>
  );
}

/** Opens the tool the case was run against, prefilled with the case. */
export function TryLink({ href, what }: { href: string; what: string }) {
  return (
    <Link href={href} aria-label={`Try ${what}`} className="ev-try">
      Try
      <Icon name="arrowUpRight" size={12} />
    </Link>
  );
}

export const askHref = (q: string) => `/ask?q=${encodeURIComponent(q)}`;

/** Shown on a suite whose key was missing on the latest run, so its numbers are older. */
export function StaleNote({ at }: { at?: string }) {
  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-muted">
      <LuHistory size={13} aria-hidden="true" className="shrink-0 text-warn" />
      {at ? `From the run on ${utcStamp(at)}, not re-run` : "From an earlier run, not re-run"}
    </p>
  );
}

export function SectionTitle({ id, children, aside }: { id: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
        {children}
      </h2>
      {aside && <span className="text-sm text-muted">{aside}</span>}
    </div>
  );
}

export interface Row {
  id: string;
  pass: boolean;
  cells: ReactNode[];
}

/** Case table; scrolls inside its own box on narrow screens. Rows are link targets for the case strips. */
export function CaseTable({ head, rows, caption }: { head: string[]; rows: Row[]; caption: string }) {
  return (
    <div>
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full min-w-[20rem] text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="text-left text-xs font-medium text-muted">
              {head.map((h) => (
                <th key={h} scope="col" className="py-2 pr-4 font-medium">
                  {h}
                </th>
              ))}
              <th scope="col" className="py-2 text-right font-medium">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                id={r.id}
                tabIndex={-1}
                className="ev-row"
              >
                {r.cells.map((c, i) => (
                  <td key={i} className="ev-cell">
                    {c}
                  </td>
                ))}
                <td className="whitespace-nowrap py-2.5 text-right align-baseline">
                  <Status pass={r.pass} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** "yes" / "no" in the tables; "n/a" when the run did not record the check. */
export function YesNo({ value }: { value: boolean | undefined }) {
  if (value === undefined) return <span className="text-xs text-muted">n/a</span>;
  return <span className="text-xs text-fg-2">{value ? "yes" : "no"}</span>;
}

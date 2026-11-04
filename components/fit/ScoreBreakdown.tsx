import type { CSSProperties } from "react";
import type { FitReport } from "@/lib/fit/matchJob";
import { FOCUS } from "@/components/tools/styles";
import { PRIORITY_LABEL, STRENGTH_FILL, STRENGTH_LABEL, scoringExplainer } from "./labels";

// Segments grow left to right (.fit-seg in app/globals.css), 30ms apart, capped so a long JD still settles in under a second.
const STAGGER_MS = 30;
const MAX_DELAY_MS = 300;

const pts = (n: number) => (Math.round(n * 10) / 10).toString();

/** One stacked bar: each requirement's share of 100, filled by what its evidence earned. */
export default function ScoreBreakdown({ report }: { report: FitReport }) {
  const rows = [
    ...report.matched.map((m) => ({ name: m.requirement, priority: m.priority, max: m.maxPoints, points: m.points, fill: STRENGTH_FILL[m.strength], kind: STRENGTH_LABEL[m.strength] })),
    ...report.gapDetails.map((g) => ({ name: g.requirement, priority: g.priority, max: g.maxPoints, points: 0, fill: "", kind: "No evidence" })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div aria-hidden="true" className="flex h-3 w-full gap-px overflow-hidden rounded-full">
        {rows.map((r, i) => (
          <span key={r.name} className="relative h-full bg-fg/10" style={{ width: `${r.max}%` }} title={`${r.name}: ${pts(r.points)} of ${pts(r.max)}`}>
            {r.points > 0 && (
              <span
                className={`fit-seg absolute inset-0 origin-left ${r.fill}`}
                style={{ "--v": r.points / r.max, animationDelay: `${Math.min(i * STAGGER_MS, MAX_DELAY_MS)}ms` } as CSSProperties}
              />
            )}
          </span>
        ))}
      </div>
      <ul aria-label="Score legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-ok" />Production work</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />Shipped project</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-info" />Certified</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-fg/10 ring-1 ring-line-strong" />Not earned</li>
      </ul>
      <p className="text-sm leading-relaxed text-fg-2">{scoringExplainer()}</p>
      <details className="group text-sm">
        <summary className={`cursor-pointer rounded-md text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg ${FOCUS}`}>
          Points per requirement
        </summary>
        <table className="mt-3 w-full text-left text-xs">
          <thead className="text-muted">
            <tr>
              <th scope="col" className="py-1 pr-2 font-medium">Requirement</th>
              <th scope="col" className="py-1 pr-2 font-medium">Evidence</th>
              <th scope="col" className="py-1 text-right font-medium">Points</th>
            </tr>
          </thead>
          <tbody className="text-fg-2">
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <th scope="row" className="py-1.5 pr-2 font-normal text-fg">
                  {r.name}
                  {r.priority === "nice" && <span className="text-muted"> ({PRIORITY_LABEL.nice.toLowerCase()})</span>}
                </th>
                <td className="py-1.5 pr-2">{r.kind}</td>
                <td className="py-1.5 text-right font-mono tabular-nums">
                  {pts(r.points)} / {pts(r.max)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

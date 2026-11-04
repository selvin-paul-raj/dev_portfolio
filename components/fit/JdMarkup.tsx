"use client";

import type { ReactNode } from "react";
import type { FitReport } from "@/lib/fit/matchJob";
import { FOCUS } from "@/components/tools/styles";

interface Hit {
  requirement: string;
  backed: boolean;
}

interface Mark {
  start: number;
  end: number;
  hits: Hit[];
}

/** Every requirement phrase in the JD, with overlapping phrases merged into one mark. */
function marksFor(report: FitReport): Mark[] {
  const spans = [
    ...report.matched.flatMap((m) => m.spans.map((s) => ({ ...s, hit: { requirement: m.requirement, backed: true } }))),
    ...report.gapDetails.flatMap((g) => g.spans.map((s) => ({ ...s, hit: { requirement: g.requirement, backed: false } }))),
  ].sort((a, b) => a.start - b.start || b.end - a.end);

  const marks: Mark[] = [];
  for (const s of spans) {
    const last = marks[marks.length - 1];
    if (last && s.start < last.end) {
      last.end = Math.max(last.end, s.end);
      if (!last.hits.some((h) => h.requirement === s.hit.requirement)) last.hits.push(s.hit);
    } else {
      marks.push({ start: s.start, end: s.end, hits: [s.hit] });
    }
  }
  return marks;
}

const BACKED = "bg-accent/15 text-fg decoration-accent decoration-solid hover:bg-accent/25";
const GAP = "text-fg decoration-danger decoration-dashed hover:bg-danger/10";

/** The JD as written, with each recognised requirement phrase turned into a jump link to its card. */
export default function JdMarkup({ jd, report, onJump }: { jd: string; report: FitReport; onJump: (requirement: string) => void }) {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const mark of marksFor(report)) {
    if (mark.start > at) parts.push(jd.slice(at, mark.start));
    const backed = mark.hits.some((h) => h.backed);
    const label = mark.hits.map((h) => `${h.requirement}, ${h.backed ? "backed by evidence" : "no evidence"}`).join("; ");
    parts.push(
      <button
        key={mark.start}
        type="button"
        onClick={() => onJump(mark.hits[0].requirement)}
        aria-label={`${jd.slice(mark.start, mark.end)}: ${label}. Jump to the report.`}
        title={label}
        className={`inline rounded-sm px-0.5 underline decoration-2 underline-offset-4 transition-colors duration-150 ${backed ? BACKED : GAP} ${FOCUS}`}
      >
        {jd.slice(mark.start, mark.end)}
      </button>
    );
    at = mark.end;
  }
  if (at < jd.length) parts.push(jd.slice(at));

  return <div className="whitespace-pre-wrap break-words text-sm leading-7 text-fg-2 [overflow-wrap:anywhere]">{parts}</div>;
}

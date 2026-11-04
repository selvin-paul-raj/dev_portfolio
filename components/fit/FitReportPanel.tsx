"use client";

import type { Ref } from "react";
import Link from "next/link";
import { LuArrowRight, LuDownload, LuMessageCircle, LuPrinter } from "react-icons/lu";
import { REQUIREMENT_COUNT } from "@/lib/fit/matchJob";
import type { FitReport, Priority } from "@/lib/fit/matchJob";
import CopyButton from "@/components/tools/CopyButton";
import { FOCUS, GHOST_BTN, ICON_BTN, LABEL, PANEL, PRIMARY_BTN } from "@/components/tools/styles";
import RequirementCard from "./RequirementCard";
import ScoreBreakdown from "./ScoreBreakdown";
import { PRIORITY_LABEL, askHref, reqId } from "./labels";
import { reportMarkdown } from "./share";
import { useCountUp } from "./useCountUp";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Gaps({ report }: { report: FitReport }) {
  const groups = (["must", "nice"] as Priority[])
    .map((p) => ({ p, items: report.gapDetails.filter((g) => g.priority === p) }))
    .filter((g) => g.items.length > 0);
  return (
    <section aria-labelledby="fit-gaps" className="flex flex-col gap-4">
      <h3 id="fit-gaps" className={LABEL}>No evidence yet</h3>
      {groups.map(({ p, items }) => (
        <div key={p}>
          <h4 className="mb-2 text-xs font-medium text-muted">{PRIORITY_LABEL[p]}</h4>
          <ul className="flex flex-col divide-y divide-line rounded-xl border border-dashed border-line-strong">
            {items.map((g) => (
              <li
                key={g.requirement}
                id={reqId(g.requirement)}
                tabIndex={-1}
                className="flex scroll-mt-28 flex-wrap items-center justify-between gap-2 px-4 py-2.5 outline-none focus:ring-2 focus:ring-inset focus:ring-danger"
              >
                <span className="text-sm text-fg">{g.requirement}</span>
                <Link href={askHref(g.requirement)} className={`${ICON_BTN} print:hidden`}>
                  <LuMessageCircle size={14} aria-hidden="true" />
                  Ask about this<span className="sr-only">: {g.requirement}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/** The score counts up from 0 on each new report, in step with the breakdown bar filling. */
function Score({ score }: { score: number }) {
  const ref = useCountUp<HTMLSpanElement>(score);
  return (
    <p className="flex shrink-0 items-baseline gap-1 font-mono">
      <span ref={ref} aria-hidden="true" className="inline-block text-right text-5xl font-bold tabular-nums text-fg" style={{ minWidth: `${String(score).length}ch` }}>
        {score}
      </span>
      <span className="sr-only">{score}</span>
      <span className="text-lg text-muted">/100</span>
    </p>
  );
}

/** The fit report: score, breakdown, backed requirements, gaps and next steps. */
export default function FitReportPanel({ report, shareLink, headingRef }: { report: FitReport; shareLink: string | null; headingRef: Ref<HTMLHeadingElement> }) {
  const total = report.matched.length + report.gapDetails.length;
  const nice = [...report.matched, ...report.gapDetails].filter((r) => r.priority === "nice").length;

  return (
    <section aria-labelledby="fit-report" className="flex flex-col gap-8">
      <div className={`${PANEL} flex flex-col gap-5 p-5 sm:p-6 print:border-0 print:p-0`}>
        <h2 id="fit-report" ref={headingRef} tabIndex={-1} className={`rounded-md ${LABEL} ${FOCUS}`}>
          Fit report
        </h2>
        {total === 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-fg">No recognised requirements in this text.</p>
            <p className="text-sm leading-relaxed text-fg-2">
              The check looks for {REQUIREMENT_COUNT} technical requirements: languages, frameworks, cloud, data, ML and agent tooling. This text
              named none of them, so there is nothing to score. Paste the requirements section of the job description, or try the sample.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Score score={report.score} />
              <div>
                <p className="font-semibold text-fg">{report.verdict}</p>
                <p className="mt-1 text-sm text-fg-2">
                  {plural(report.matched.length, "requirement")} backed, {plural(report.gapDetails.length, "gap")}
                  {nice > 0 && `, ${nice} of ${total} marked nice to have`}.
                </p>
              </div>
            </div>
            <ScoreBreakdown report={report} />
          </>
        )}
        <div className="flex flex-wrap gap-1 print:hidden">
          <CopyButton label="Copy as Markdown" text={() => reportMarkdown(report, window.location.origin)} />
          {shareLink && <CopyButton label="Copy share link" text={shareLink} />}
          <button type="button" onClick={() => window.print()} className={ICON_BTN}>
            <LuPrinter size={14} aria-hidden="true" />
            Print
          </button>
        </div>
      </div>

      {report.matched.length > 0 && (
        <section aria-labelledby="fit-matched" className="flex flex-col gap-3">
          <h3 id="fit-matched" className={LABEL}>Backed by evidence</h3>
          <ul className="flex flex-col gap-3">
            {report.matched.map((m) => (
              <RequirementCard key={m.requirement} match={m} />
            ))}
          </ul>
        </section>
      )}

      {report.gapDetails.length > 0 && <Gaps report={report} />}

      <p className="text-xs leading-relaxed text-muted">{report.method}</p>

      <div className="flex flex-wrap gap-2.5 print:hidden">
        <Link href="/#contact" className={PRIMARY_BTN}>
          Talk to Selvin <LuArrowRight size={14} aria-hidden="true" />
        </Link>
        <a href="/view/Selvin_Resume.pdf" download className={GHOST_BTN}>
          Resume <LuDownload size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

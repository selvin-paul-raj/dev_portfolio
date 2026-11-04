import { PANEL } from "@/components/tools/styles";
import type { EvalsReport } from "@/evals/report";
import { overallTrend, utcStamp } from "@/lib/evalsSummary";
import CaseStrip from "./CaseStrip";
import HashOpen from "./HashOpen";
import { SectionTitle, StaleNote } from "./parts";
import Sparkline from "./Sparkline";
import SparkReveal from "./SparkReveal";
import type { Suite } from "./suites";

export function Scoreboard({ report, suites }: { report: EvalsReport; suites: Suite[] }) {
  const all = suites.flatMap((s) => s.cases);
  const passed = all.filter((c) => c.pass).length;
  const stale = suites.filter((s) => s.stale);
  const facts = (
    [
      ["Generated", utcStamp(report.generatedAt)],
      ["Gate model", report.gate && `TypeSafe ${report.gate.model}`],
      ["Free-chat check", report.scope?.source],
      ["Answer model", report.llm?.model],
    ] as Array<[string, string | null | undefined]>
  ).filter((f): f is [string, string] => Boolean(f[1]));

  return (
    <section aria-labelledby="scoreboard" className={`${PANEL} mb-16 w-full p-5 sm:p-8`}>
      <h2 id="scoreboard" className="sr-only">
        Scoreboard
      </h2>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-fg-2">Cases passing</p>
          <p className="mt-1 flex items-baseline gap-3">
            <span className="text-6xl font-semibold tabular-nums tracking-tight text-fg sm:text-7xl">{passed}</span>
            <span className="text-2xl tabular-nums text-muted">/ {all.length}</span>
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            <span>Overall</span>
            <Sparkline rates={overallTrend()} width={140} height={32} />
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-4 sm:gap-10 sm:text-right">
          {[
            ["Suites", String(suites.length)],
            ["MRR", report.retrieval.mrr.toFixed(2)],
            ["Indexed docs", String(report.corpusDocs)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted sm:text-sm">{k}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-6">
        <CaseStrip cases={all} label="Every case" />
      </div>
      <dl className="mt-6 grid gap-x-8 gap-y-2 border-t border-line pt-4 text-xs sm:grid-cols-2">
        {facts.map(([k, v]) => (
          <div key={k} className="flex flex-wrap gap-x-2">
            <dt className="text-muted">{k}</dt>
            <dd className="break-all font-mono text-fg-2">{v}</dd>
          </div>
        ))}
      </dl>
      {stale.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          Not re-run on the latest run (no key): {stale.map((s) => s.label).join(", ")}. Their numbers are from the run noted on each.
        </p>
      )}
    </section>
  );
}

export function SuiteGrid({ suites }: { suites: Suite[] }) {
  return (
    <section className="mb-20 w-full" aria-labelledby="suites">
      {/* Client islands that render nothing: case-strip links open collapsed tables; sparklines draw in. */}
      <HashOpen />
      <SparkReveal />
      <SectionTitle id="suites" aside="Each cell is one case; select it to jump to the case">
        Suites
      </SectionTitle>
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {suites.map((s) => (
          <li key={s.id} className="flex min-w-0 flex-col gap-3 bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <a href={`#${s.id}`} className="inline-flex min-h-11 items-center text-sm font-medium text-fg hover:text-accent-fg [@media(pointer:fine)]:min-h-0">
                {s.label}
              </a>
              <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-xs text-muted">{s.method}</span>
            </div>
            <p className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums tracking-tight text-fg">{s.value}</span>
              <span className="text-xs tabular-nums text-muted">
                {s.cases.filter((c) => c.pass).length}/{s.cases.length}
              </span>
            </p>
            <p className="text-sm leading-relaxed text-fg-2">{s.measures}</p>
            <Sparkline rates={s.trend} />
            {s.stale && <StaleNote at={s.staleSince} />}
            <div className="mt-auto">
              <CaseStrip cases={s.cases} label={s.label} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Eval results and run history, shared by /evals and the tool bar on the other tool pages.
import evals from "@/lib/data/evals.json";
import history from "@/lib/data/evals-history.json";
import { reportSuites, type EvalsReport, type HistoryEntry, type SuiteId } from "@/evals/report";

export const report = evals as EvalsReport;
export const runs = history as HistoryEntry[];

export function evalCases(): Array<{ pass: boolean }> {
  return reportSuites(report).flatMap((s) => s.cases);
}

export function evalTotals(): { passed: number; total: number } {
  const cases = evalCases();
  return { passed: cases.filter((c) => c.pass).length, total: cases.length };
}

/** Pass rate of one suite across the runs that actually measured it (carried-over results skipped). */
export function suiteTrend(id: SuiteId): number[] {
  return runs.flatMap((r) => {
    const s = r.suites[id];
    return s && !s.stale ? [s.rate] : [];
  });
}

/** Overall pass rate per run, counting every suite that run published. */
export function overallTrend(): number[] {
  return runs.map((r) => {
    const suites = Object.values(r.suites);
    const total = suites.reduce((n, s) => n + s.total, 0);
    return total ? suites.reduce((n, s) => n + s.passed, 0) / total : 0;
  });
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;

/** "2026-10-29 10:47 UTC", built from the ISO string so server and client agree. */
export const utcStamp = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;

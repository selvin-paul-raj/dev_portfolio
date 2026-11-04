// lib/mcp/insights.ts
// Read-only views of the eval reports and the prompt-injection challenge for
// get_eval_results / get_challenge_info. Data-injected (no "@/" aliases or JSON
// imports) so the plain-tsc Alpic build compiles it.
import { PROFILE } from "./definitions";
import { ToolError } from "./errors";
import { LAYERS, LEVELS, challengeEnabled, layersFor } from "../ask/challenge";
import { reportSuites } from "../../evals/report";
import type { EvalsReport, HistoryEntry, SuiteId } from "../../evals/report";

export interface EvalQuery {
  suite?: SuiteId;
  include_cases: boolean;
  history: boolean;
}

/** Pass rate of one suite across the runs that measured it (carried-over results skipped). */
function trendOf(history: HistoryEntry[], id: SuiteId): number[] {
  return history.flatMap((run) => {
    const s = run.suites[id];
    return s && !s.stale ? [s.rate] : [];
  });
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export function evalResults(report: EvalsReport, history: HistoryEntry[], query: EvalQuery): Record<string, unknown> {
  const all = reportSuites(report);
  const picked = query.suite ? all.filter((s) => s.id === query.suite) : all;
  if (query.suite && picked.length === 0) {
    throw new ToolError(`Suite "${query.suite}" was not part of the latest run. Available: ${all.map((s) => s.id).join(", ")}`);
  }
  const suites = picked.map(({ id, cases, stale }) => {
    const passed = cases.filter((c) => c.pass).length;
    return {
      id,
      passed,
      total: cases.length,
      rate: cases.length ? round(passed / cases.length) : 0,
      ...(stale ? { stale: true } : {}),
      trend: trendOf(history, id),
    };
  });
  return {
    generatedAt: report.generatedAt,
    corpusDocs: report.corpusDocs,
    totals: { passed: suites.reduce((n, s) => n + s.passed, 0), total: suites.reduce((n, s) => n + s.total, 0) },
    suites,
    mrr: report.retrieval.mrr,
    hitAtK: report.retrieval.hitAtK,
    k: report.retrieval.k,
    ...(query.include_cases ? { cases: Object.fromEntries(picked.map((s) => [s.id, s.cases])) } : {}),
    ...(query.history ? { history } : {}),
    url: `${PROFILE.portfolio}/evals`,
  };
}

/** Level names, defenses, and stacked layers only: never words, salts, prompts, or clues. */
export function challengeInfo(): Record<string, unknown> {
  return {
    levels: LEVELS.map(({ level, name, defense }) => ({ level, name, defense, layers: layersFor(level) })),
    stack: [...LAYERS],
    enabled: challengeEnabled(),
    url: `${PROFILE.portfolio}/challenge`,
  };
}

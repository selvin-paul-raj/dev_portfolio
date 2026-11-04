// The suites shown on /evals, built from lib/data/evals.json in page order.
import type { Carried, EvalsReport, SuiteId } from "@/evals/report";
import { pct, suiteTrend } from "@/lib/evalsSummary";
import type { StripCase } from "./CaseStrip";

export type Method = "Deterministic" | "Decision model" | "Live LLM";

export interface Suite {
  id: SuiteId;
  label: string;
  value: string;
  measures: string;
  method: Method;
  cases: StripCase[];
  trend: number[];
  /** Set when the latest run carried this suite over instead of re-running it. */
  staleSince?: string;
  stale: boolean;
}

/** Row and card ids, so case-strip cells can link to the case. */
export const caseAnchor = (id: SuiteId, i: number) => `${id}-case-${i + 1}`;

const strip = (id: SuiteId, cases: Array<{ pass: boolean }>, label: (i: number) => string): StripCase[] =>
  cases.map((c, i) => ({ pass: c.pass, label: label(i), anchor: caseAnchor(id, i) }));

export function buildSuites(r: EvalsReport): Suite[] {
  const base = (id: SuiteId, s: Carried = {}) => ({
    id,
    trend: suiteTrend(id),
    stale: Boolean(s.stale),
    staleSince: s.stale ? s.generatedAt : undefined,
  });
  const out: Suite[] = [
    {
      ...base("retrieval"),
      label: `Retrieval hit@${r.retrieval.k}`,
      value: pct(r.retrieval.hitAtK),
      measures: `Expected source in the top ${r.retrieval.k} for each golden question`,
      method: "Deterministic",
      cases: strip("retrieval", r.retrieval.cases, (i) => r.retrieval.cases[i].q),
    },
    {
      ...base("off-topic"),
      label: "Off-topic refusal",
      value: pct(r.offTopic.passRate),
      measures: "Unrelated questions find no evidence and are refused",
      method: "Deterministic",
      cases: strip("off-topic", r.offTopic.cases, (i) => r.offTopic.cases[i].q),
    },
    {
      ...base("fit"),
      label: "Fit check",
      value: pct(r.fit.passRate),
      measures: "Labelled job descriptions: right matches, right gaps, every match cited",
      method: "Deterministic",
      cases: strip("fit", r.fit.cases, (i) => r.fit.cases[i].name),
    },
  ];
  const { gate, scope, llm } = r;
  if (gate)
    out.push({
      ...base("gate", gate),
      label: "Safety gate",
      value: pct(gate.passRate),
      measures: "On-topic questions pass; off-topic and injection attempts are stopped",
      method: "Decision model",
      cases: strip("gate", gate.cases, (i) => gate.cases[i].q),
    });
  if (scope)
    out.push({
      ...base("scope", scope),
      label: "Free-chat block",
      value: pct(scope.passRate),
      measures: "The challenge bot refuses homework, trivia and general chat, but still plays the game",
      method: scope.source.startsWith("typesafe") ? "Decision model" : "Deterministic",
      cases: strip("scope", scope.cases, (i) => scope.cases[i].q),
    });
  if (llm)
    out.push({
      ...base("llm", llm),
      label: "Live answers",
      value: pct(llm.passRate),
      measures: "Generated answers cite a source and stay grounded in it; off-topic ones are refused",
      method: "Live LLM",
      cases: strip("llm", llm.cases, (i) => llm.cases[i].q),
    });
  return out;
}

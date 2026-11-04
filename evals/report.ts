// evals/report.ts
// The shape of lib/data/evals.json and lib/data/evals-history.json, plus the
// per-suite pass counting shared by evals/run.ts (writes them) and the /evals page.
// No path aliases here: run.ts compiles this with plain tsc.

/** Set on a section carried over from an earlier run because its key was missing. */
export interface Carried {
  stale?: boolean;
  /** The run the carried section came from. */
  generatedAt?: string;
}

export interface RetrievalCase {
  q: string;
  expect: string;
  rank: number | null;
  pass: boolean;
  top: string | null;
}

export interface OffTopicCase {
  q: string;
  refused: boolean;
  topScore: number;
  /** Best query-term coverage among the hits; absent in runs before it was recorded. */
  topCoverage?: number;
  pass: boolean;
}

export interface FitCase {
  name: string;
  score: number;
  missingMatches: string[];
  missingGaps: string[];
  unbacked: string[];
  pass: boolean;
}

export interface GateCase {
  q: string;
  kind: string;
  onTopic: number | null;
  injection: number | null;
  pass: boolean;
}

export interface ScopeCase {
  q: string;
  kind: string;
  pass: boolean;
}

/** Answer cases grade cited + grounded; off-topic cases grade refused instead. */
export interface LlmCase {
  q: string;
  mode: string;
  cited?: boolean;
  grounded?: boolean;
  refused?: boolean;
  pass: boolean;
}

export interface EvalsReport {
  generatedAt: string;
  corpusDocs: number;
  retrieval: { k: number; hitAtK: number; mrr: number; cases: RetrievalCase[] };
  offTopic: { passRate: number; cases: OffTopicCase[] };
  fit: { passRate: number; cases: FitCase[] };
  gate: ({ model: string; passRate: number; cases: GateCase[] } & Carried) | null;
  scope: ({ source: string; passRate: number; cases: ScopeCase[] } & Carried) | null;
  llm: ({ model: string | null; passRate: number; cases: LlmCase[] } & Carried) | null;
}

export type SuiteId = "retrieval" | "off-topic" | "fit" | "gate" | "scope" | "llm";

export interface SuiteRate {
  passed: number;
  total: number;
  rate: number;
  stale?: true;
}

export interface HistoryEntry {
  generatedAt: string;
  corpusDocs: number;
  mrr: number;
  suites: Partial<Record<SuiteId, SuiteRate>>;
}

export const HISTORY_CAP = 60;

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Every suite present in a report, in page order, with its cases. */
export function reportSuites(r: EvalsReport): Array<{ id: SuiteId; cases: Array<{ pass: boolean }>; stale: boolean }> {
  const all: Array<[SuiteId, { cases: Array<{ pass: boolean }> } & Carried]> = [
    ["retrieval", r.retrieval],
    ["off-topic", r.offTopic],
    ["fit", r.fit],
  ];
  if (r.gate) all.push(["gate", r.gate]);
  if (r.scope) all.push(["scope", r.scope]);
  if (r.llm) all.push(["llm", r.llm]);
  return all.map(([id, s]) => ({ id, cases: s.cases, stale: Boolean(s.stale) }));
}

/** One history point per run: pass counts per suite, carried suites flagged. */
export function historyEntry(r: EvalsReport): HistoryEntry {
  const suites: HistoryEntry["suites"] = {};
  for (const { id, cases, stale } of reportSuites(r)) {
    const passed = cases.filter((c) => c.pass).length;
    suites[id] = { passed, total: cases.length, rate: cases.length ? round(passed / cases.length) : 0, ...(stale ? { stale: true as const } : {}) };
  }
  return { generatedAt: r.generatedAt, corpusDocs: r.corpusDocs, mrr: r.retrieval.mrr, suites };
}

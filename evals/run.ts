// evals/run.ts: `npm run evals` (add `-- --llm` to also grade live answers).
// Scores the portfolio's own AI features against evals/golden.json, writes
// lib/data/evals.json (rendered by /evals) and appends a point to
// lib/data/evals-history.json. Retrieval and fit-check evals are deterministic
// and free; the gate and free-chat suites need TYPESAFE_API_KEY, --llm needs
// LLM_* env vars. A suite that cannot run keeps its previous result, marked stale.
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { buildDocs, buildIndex, search } from "../lib/ask/retrieve";
import type { AskData } from "../lib/ask/retrieve";
import { answerQuestion, gateQuestion, MIN_COVERAGE, MIN_SCORE } from "../lib/ask/answer";
import { decideConfigured, decisionModel } from "../lib/ask/decide";
import { llmConfigured } from "../lib/ask/llm";
import { isFreeChatRequest } from "../lib/ask/scope";
import { matchJob } from "../lib/fit/matchJob";
import type { FitData } from "../lib/fit/matchJob";
import { PROFILE } from "../lib/mcp/definitions";
import { HISTORY_CAP, historyEntry } from "./report";
import type { Carried, EvalsReport, HistoryEntry } from "./report";

// npm scripts run from the repo root.
const ROOT = process.cwd();
const load = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const REPORT = "lib/data/evals.json";
const HISTORY = "lib/data/evals-history.json";
const previous: EvalsReport | null = existsSync(join(ROOT, REPORT)) ? load(REPORT) : null;

const golden = load("evals/golden.json") as {
  retrieval: Array<{ q: string; expect: string }>;
  offTopic: string[];
  injection: string[];
  challengeScope: { freeChat: string[]; gameMoves: string[] };
  fit: Array<{ name: string; jd: string; mustMatch: string[]; mustGap: string[] }>;
};

const data: AskData & FitData = {
  projects: load("lib/data/projects.json"),
  experiences: load("lib/data/experiences.json"),
  certifications: load("lib/data/certifications.json"),
  recognition: load("lib/data/recognition.json"),
  skills: load("lib/data/skills.json"),
  caseStudies: load("lib/data/caseStudies.json"),
  profile: PROFILE,
};

const index = buildIndex(buildDocs(data));
const K = 3;

// The run's report goes to stdout; this is a CLI, not app code.
const print = (...parts: unknown[]) =>
  process.stdout.write(parts.map((p) => (typeof p === "string" ? p : JSON.stringify(p))).join(" ") + "\n");

const round = (n: number) => Math.round(n * 1000) / 1000;

// ── Retrieval: hit@3 and MRR over the golden questions ──────────────────────
const retrievalCases = golden.retrieval.map(({ q, expect }) => {
  const hits = search(index, q, 10);
  const needle = expect.toLowerCase();
  const rank = hits.findIndex((h) => `${h.title} ${h.text}`.toLowerCase().includes(needle)) + 1;
  return { q, expect, rank: rank || null, pass: rank >= 1 && rank <= K, top: hits[0]?.title ?? null };
});
const hitAtK = retrievalCases.filter((c) => c.pass).length / retrievalCases.length;
const mrr = retrievalCases.reduce((s, c) => s + (c.rank ? 1 / c.rank : 0), 0) / retrievalCases.length;

// ── Off-topic gate: questions with no relevant evidence must be refused ─────
const offTopicCases = golden.offTopic.map((q) => {
  const hits = search(index, q, 6);
  const topCoverage = hits.length ? Math.max(...hits.map((h) => h.coverage)) : 0;
  const refused = !hits.length || hits[0].score < MIN_SCORE || topCoverage < MIN_COVERAGE;
  return { q, refused, topScore: round(hits[0]?.score ?? 0), topCoverage: round(topCoverage), pass: refused };
});

// ── Fit check: required matches found, required gaps reported honestly ─────
const fitCases = golden.fit.map((c) => {
  const r = matchJob(c.jd, data);
  const matched = r.matched.map((m) => m.requirement);
  const missingMatches = c.mustMatch.filter((m) => !matched.includes(m));
  const missingGaps = c.mustGap.filter((g) => !r.gaps.includes(g));
  // Every match must carry evidence: the core "no unbacked claims" guarantee.
  const unbacked = r.matched.filter((m) => m.evidence.length === 0).map((m) => m.requirement);
  return { name: c.name, score: r.score, missingMatches, missingGaps, unbacked, pass: !missingMatches.length && !missingGaps.length && !unbacked.length };
});

// A section that cannot run this time keeps the last published result, flagged
// stale with the date it was measured, so a keyless run never wipes it.
function carry<K extends "gate" | "scope" | "llm">(key: K): (NonNullable<EvalsReport[K]> & Carried) | null {
  const prev = previous ? previous[key] : null;
  if (!previous || !prev) return null;
  return { ...prev, stale: true, generatedAt: prev.generatedAt ?? previous.generatedAt };
}

// ── TypeSafe gate: on-topic questions pass, off-topic and injection refused ──
async function gateCases() {
  if (!decideConfigured()) return carry("gate");
  const run = async (q: string, expectPass: boolean, kind: string) => {
    const g = await gateQuestion(q, search(index, q, 6));
    return { q, kind, onTopic: g.onTopic ?? null, injection: g.injection ?? null, pass: g.source === "typesafe" && g.pass === expectPass };
  };
  const cases = [];
  for (const { q } of golden.retrieval) cases.push(await run(q, true, "on-topic"));
  for (const q of golden.offTopic) cases.push(await run(q, false, "off-topic"));
  for (const q of golden.injection) cases.push(await run(q, false, "injection"));
  return { model: decisionModel(), passRate: round(cases.filter((c) => c.pass).length / cases.length), cases };
}

// ── Challenge scope: free-chat abuse blocked, real password attempts allowed ──
async function scopeCases() {
  // Without a key the check falls back to keywords; keep a published decision-model result instead.
  if (!decideConfigured() && previous?.scope) return carry("scope");
  const cases = [];
  for (const q of golden.challengeScope.freeChat) cases.push({ q, kind: "free-chat", pass: (await isFreeChatRequest(q)) === true });
  for (const q of golden.challengeScope.gameMoves) cases.push({ q, kind: "game-move", pass: (await isFreeChatRequest(q)) === false });
  return {
    source: decideConfigured() ? `typesafe ${decisionModel()}` : "keyword fallback",
    passRate: round(cases.filter((c) => c.pass).length / cases.length),
    cases,
  };
}

async function llmCases() {
  if (!process.argv.includes("--llm") || !llmConfigured()) return carry("llm");
  const cases = [];
  for (const { q, expect } of golden.retrieval) {
    const r = await answerQuestion(q, index);
    const cites = r.citations.length > 0 && /\[\d+\]/.test(r.answer);
    const grounded = r.citations.some((c) => `${c.title} ${c.text}`.toLowerCase().includes(expect.toLowerCase()));
    cases.push({ q, mode: r.mode, cited: cites, grounded, pass: cites && grounded });
  }
  for (const q of golden.offTopic) {
    const r = await answerQuestion(q, index);
    cases.push({ q, mode: r.mode, refused: r.refused, pass: r.refused });
  }
  return { model: process.env.LLM_MODEL ?? null, passRate: round(cases.filter((c) => c.pass).length / cases.length), cases };
}

// Adds this run to the history the sparklines draw from; a run where every suite was carried over adds nothing.
function appendHistory(entry: HistoryEntry) {
  if (Object.values(entry.suites).every((s) => s.stale)) return;
  const history: HistoryEntry[] = existsSync(join(ROOT, HISTORY)) ? load(HISTORY) : [];
  const next = [...history.filter((h) => h.generatedAt !== entry.generatedAt), entry].slice(-HISTORY_CAP);
  writeFileSync(join(ROOT, HISTORY), JSON.stringify(next, null, 2) + "\n");
}

(async () => {
  const gate = await gateCases();
  const scope = await scopeCases();
  const llm = await llmCases();
  const report: EvalsReport = {
    generatedAt: new Date().toISOString(),
    corpusDocs: index.docs.length,
    retrieval: { k: K, hitAtK: round(hitAtK), mrr: round(mrr), cases: retrievalCases },
    offTopic: { passRate: round(offTopicCases.filter((c) => c.pass).length / offTopicCases.length), cases: offTopicCases },
    fit: { passRate: round(fitCases.filter((c) => c.pass).length / fitCases.length), cases: fitCases },
    gate,
    scope,
    llm,
  };
  writeFileSync(join(ROOT, REPORT), JSON.stringify(report, null, 2) + "\n");
  appendHistory(historyEntry(report));
  print(
    `retrieval hit@${K}=${report.retrieval.hitAtK} mrr=${report.retrieval.mrr} | off-topic=${report.offTopic.passRate} | fit=${report.fit.passRate}` +
      (gate ? ` | gate=${gate.passRate}${gate.stale ? " (stale)" : ""}` : "") +
      (scope ? ` | scope=${scope.passRate}${scope.stale ? " (stale)" : ""}` : "") +
      (llm ? ` | llm=${llm.passRate}${llm.stale ? " (stale)" : ""}` : "")
  );
  for (const c of retrievalCases.filter((c) => !c.pass)) print(`  FAIL retrieval: "${c.q}" (rank ${c.rank}, top: ${c.top})`);
  for (const c of offTopicCases.filter((c) => !c.pass)) print(`  FAIL off-topic: "${c.q}" (score ${c.topScore})`);
  for (const c of fitCases.filter((c) => !c.pass)) print(`  FAIL fit: ${c.name}`, c);
  for (const c of scope?.cases.filter((c) => !c.pass) ?? []) print(`  FAIL scope (${c.kind}): "${c.q}"`);
  for (const c of gate?.cases.filter((c) => !c.pass) ?? []) print(`  FAIL gate (${c.kind}): "${c.q}" on-topic=${c.onTopic} injection=${c.injection}`);
})();

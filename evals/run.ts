// evals/run.ts — `npm run evals` (add `-- --llm` to also grade live answers).
// Scores the portfolio's own AI features against evals/golden.json and writes
// lib/data/evals.json, which the /evals page renders. Retrieval and fit-check
// evals are deterministic and free; --llm needs LLM_* env vars.
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { buildDocs, buildIndex, search } from "../lib/ask/retrieve";
import type { AskData } from "../lib/ask/retrieve";
import { answerQuestion, gateQuestion, MIN_COVERAGE, MIN_SCORE } from "../lib/ask/answer";
import { decideConfigured, decisionModel } from "../lib/ask/decide";
import { isFreeChatRequest } from "../lib/ask/scope";
import { matchJob } from "../lib/fit/matchJob";
import type { FitData } from "../lib/fit/matchJob";
import { PROFILE } from "../lib/mcp/definitions";

// npm scripts run from the repo root.
const ROOT = process.cwd();
const load = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

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
  profile: PROFILE,
};

const index = buildIndex(buildDocs(data));
const K = 3;

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
  const refused = !hits.length || hits[0].score < MIN_SCORE || Math.max(...hits.map((h) => h.coverage)) < MIN_COVERAGE;
  return { q, refused, topScore: hits[0]?.score ?? 0, pass: refused };
});

// ── Fit check: required matches found, required gaps reported honestly ─────
const fitCases = golden.fit.map((c) => {
  const r = matchJob(c.jd, data);
  const matched = r.matched.map((m) => m.requirement);
  const missingMatches = c.mustMatch.filter((m) => !matched.includes(m));
  const missingGaps = c.mustGap.filter((g) => !r.gaps.includes(g));
  // Every match must carry evidence — the core "no unbacked claims" guarantee.
  const unbacked = r.matched.filter((m) => m.evidence.length === 0).map((m) => m.requirement);
  return { name: c.name, score: r.score, missingMatches, missingGaps, unbacked, pass: !missingMatches.length && !missingGaps.length && !unbacked.length };
});

// ── TypeSafe gate: on-topic questions pass, off-topic and injection refused ──
async function gateCases() {
  if (!decideConfigured()) return null;
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
  if (!process.argv.includes("--llm")) return null;
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

(async () => {
  const gate = await gateCases();
  const scope = await scopeCases();
  const llm = await llmCases();
  const report = {
    generatedAt: new Date().toISOString(),
    corpusDocs: index.docs.length,
    retrieval: { k: K, hitAtK: round(hitAtK), mrr: round(mrr), cases: retrievalCases },
    offTopic: { passRate: round(offTopicCases.filter((c) => c.pass).length / offTopicCases.length), cases: offTopicCases },
    fit: { passRate: round(fitCases.filter((c) => c.pass).length / fitCases.length), cases: fitCases },
    gate,
    scope,
    llm,
  };
  writeFileSync(join(ROOT, "lib/data/evals.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(
    `retrieval hit@${K}=${report.retrieval.hitAtK} mrr=${report.retrieval.mrr} | off-topic=${report.offTopic.passRate} | fit=${report.fit.passRate}` +
      (gate ? ` | gate=${gate.passRate}` : "") +
      ` | scope=${scope.passRate}` +
      (llm ? ` | llm=${llm.passRate}` : "")
  );
  for (const c of retrievalCases.filter((c) => !c.pass)) console.log(`  FAIL retrieval: "${c.q}" (rank ${c.rank}, top: ${c.top})`);
  for (const c of offTopicCases.filter((c) => !c.pass)) console.log(`  FAIL off-topic: "${c.q}" (score ${c.topScore})`);
  for (const c of fitCases.filter((c) => !c.pass)) console.log(`  FAIL fit: ${c.name}`, c);
  for (const c of scope.cases.filter((c) => !c.pass)) console.log(`  FAIL scope (${c.kind}): "${c.q}"`);
  for (const c of gate?.cases.filter((c) => !c.pass) ?? []) console.log(`  FAIL gate (${c.kind}): "${c.q}" on-topic=${c.onTopic} injection=${c.injection}`);
})();

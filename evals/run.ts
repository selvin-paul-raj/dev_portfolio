// evals/run.ts — `npm run evals` (add `-- --llm` to also grade live answers).
// Scores the portfolio's own AI features against evals/golden.json and writes
// lib/data/evals.json, which the /evals page renders. Retrieval and fit-check
// evals are deterministic and free; --llm needs LLM_* env vars.
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { buildDocs, buildIndex, search } from "../lib/ask/retrieve";
import type { AskData } from "../lib/ask/retrieve";
import { answerQuestion, MIN_COVERAGE, MIN_SCORE } from "../lib/ask/answer";
import { matchJob } from "../lib/fit/matchJob";
import type { FitData } from "../lib/fit/matchJob";
import { PROFILE } from "../lib/mcp/definitions";

// npm scripts run from the repo root.
const ROOT = process.cwd();
const load = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const golden = load("evals/golden.json") as {
  retrieval: Array<{ q: string; expect: string }>;
  offTopic: string[];
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
  const llm = await llmCases();
  const report = {
    generatedAt: new Date().toISOString(),
    corpusDocs: index.docs.length,
    retrieval: { k: K, hitAtK: round(hitAtK), mrr: round(mrr), cases: retrievalCases },
    offTopic: { passRate: round(offTopicCases.filter((c) => c.pass).length / offTopicCases.length), cases: offTopicCases },
    fit: { passRate: round(fitCases.filter((c) => c.pass).length / fitCases.length), cases: fitCases },
    llm,
  };
  writeFileSync(join(ROOT, "lib/data/evals.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(
    `retrieval hit@${K}=${report.retrieval.hitAtK} mrr=${report.retrieval.mrr} | off-topic=${report.offTopic.passRate} | fit=${report.fit.passRate}` +
      (llm ? ` | llm=${llm.passRate}` : "")
  );
  for (const c of retrievalCases.filter((c) => !c.pass)) console.log(`  FAIL retrieval: "${c.q}" (rank ${c.rank}, top: ${c.top})`);
  for (const c of offTopicCases.filter((c) => !c.pass)) console.log(`  FAIL off-topic: "${c.q}" (score ${c.topScore})`);
  for (const c of fitCases.filter((c) => !c.pass)) console.log(`  FAIL fit: ${c.name}`, c);
})();

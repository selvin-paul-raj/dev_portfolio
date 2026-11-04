// lib/mcp/ask.ts
// ask_selvin for MCP and A2A: the same grounded answering as /ask, over an
// index built from injected data (no "@/" aliases or JSON imports, so the
// plain-tsc Alpic build compiles it). lib/ask/portfolioIndex.ts builds the
// Next.js-side index through buildPortfolioIndex too.
import { PROFILE } from "./definitions";
import { answerQuestion } from "../ask/answer";
import type { AskResult } from "../ask/answer";
import { buildDocs, buildIndex } from "../ask/retrieve";
import type { AskData, Index } from "../ask/retrieve";

export function buildPortfolioIndex(data: Omit<AskData, "profile">): Index {
  return buildIndex(buildDocs({ ...data, profile: PROFILE }));
}

/** The client-facing shape: citation snippets' text is left out (the answer already quotes them). */
export function askView(result: AskResult, includeTrace: boolean): Record<string, unknown> {
  return {
    answer: result.answer,
    mode: result.mode,
    refused: result.refused,
    ...(result.refusal ? { refusal: result.refusal } : {}),
    citations: result.citations.map(({ n, title, url, kind, score }) => ({ n, title, url, kind, score })),
    ...(includeTrace ? { trace: result.trace } : {}),
    thresholds: result.thresholds,
    timings: result.timings,
    ...(result.llm ? { llm: result.llm } : {}),
  };
}

export async function askSelvin(question: string, index: Index, includeTrace: boolean): Promise<Record<string, unknown>> {
  return askView(await answerQuestion(question, index), includeTrace);
}

// The gate panel (mode, provider, latency, gate meters) and the collapsed retrieval trace for one answer.
import { LuCheck, LuChevronDown } from "react-icons/lu";
import Meter from "@/components/tools/Meter";
import { FOCUS } from "@/components/tools/styles";
import type { AskMeta, AskResult } from "@/lib/ask/answer";
import { isExternal, KINDS } from "./model";

const pct = (v: number) => `${Math.round(v * 100)}%`;

function modeLabel(info: AskMeta, result?: AskResult): string {
  if (!result) return info.mode === "llm" ? "LLM answer, writing" : "Extractive answer";
  if (result.llmFailed) return "LLM failed, extractive fallback";
  if (result.mode === "retrieval") return "Extractive, no LLM";
  if (!result.llm) return "Refused before any LLM call";
  return `LLM answer, ${result.llm.provider} model ${result.llm.model}`;
}

function GateMeters({ info }: { info: AskMeta }) {
  const { gate, thresholds: t } = info;
  if (gate.source === "typesafe") {
    const onTopic = gate.onTopic ?? 0;
    const injection = gate.injection ?? 0;
    return (
      <>
        <Meter label={`On-topic, needs ${t.probability.toFixed(2)} or more`} value={onTopic} tone={onTopic >= t.probability ? "ok" : "danger"} threshold={t.probability} />
        <Meter label={`Injection, needs under ${t.probability.toFixed(2)}`} value={injection} tone={injection < t.probability ? "ok" : "danger"} threshold={t.probability} />
      </>
    );
  }
  const top = gate.topScore ?? info.trace[0]?.score ?? 0;
  const coverage = gate.coverage ?? Math.max(0, ...info.trace.map((h) => h.coverage));
  // The score bar runs to twice the minimum (or the top score, if higher) so the threshold tick stays visible.
  const scale = Math.max(top, t.minScore * 2);
  return (
    <>
      <Meter label={`Top BM25 score, needs ${t.minScore} or more`} value={top / scale} display={top.toFixed(2)} tone={top >= t.minScore ? "ok" : "danger"} threshold={t.minScore / scale} />
      <Meter label={`Question terms matched, needs ${pct(t.minCoverage)}`} value={coverage} display={pct(coverage)} tone={coverage >= t.minCoverage ? "ok" : "danger"} threshold={t.minCoverage} />
    </>
  );
}

/** Always visible under an answer: how it was produced and what the gate measured. */
export function GatePanel({ info, result }: { info: AskMeta; result?: AskResult }) {
  const { gate } = info;
  const gateName = gate.source === "typesafe" ? `TypeSafe gate${gate.model ? ` (${gate.model})` : ""}` : "BM25 gate (no decision model)";
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line px-4 py-3">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-2">
        <span className="font-medium text-fg">{modeLabel(info, result)}</span>
        {result && (
          <>
            <span aria-hidden="true" className="text-muted">·</span>
            <span className="font-mono tabular-nums">{result.timings.totalMs} ms</span>
          </>
        )}
        <span aria-hidden="true" className="text-muted">·</span>
        <span>
          {gateName}: <span className={gate.pass ? "text-ok" : "text-danger"}>{gate.pass ? "passed" : "blocked"}</span>
        </span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <GateMeters info={info} />
      </div>
    </div>
  );
}

/** Collapsed by default: every snippet BM25 ranked, its score and coverage, and whether the answer cited it. */
export function RetrievalTrace({ info }: { info: AskMeta }) {
  const { trace, thresholds: t } = info;
  if (trace.length === 0) return null;
  const best = Math.max(...trace.map((h) => h.score));
  const numbered = trace.some((h) => h.n !== undefined);
  return (
    <details className="group rounded-xl border border-line">
      <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-fg-2 hover:text-fg [&::-webkit-details-marker]:hidden ${FOCUS}`}>
        How this answer was found
        <LuChevronDown size={15} aria-hidden="true" className="shrink-0 text-muted transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="flex flex-col gap-3 border-t border-line px-4 pb-4 pt-3">
        <p className="text-xs leading-relaxed text-fg-2">
          BM25 ranked these {trace.length} snippets for the question. Bars are relative to the best score. Without the decision model, the gate needs a top
          score of {t.minScore} and {pct(t.minCoverage)} of the question&apos;s terms in one snippet.
          {numbered ? " The model saw all of them, numbered as below." : " The gate stopped the question before any model saw them."}
        </p>
        <ol className="flex flex-col gap-3">
          {trace.map((h) => {
            const { label, Icon } = KINDS[h.kind];
            return (
              <li key={h.rank} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 sm:grid-cols-[1.5rem_minmax(0,1fr)_8rem_4.5rem] sm:items-center">
                <span className="font-mono text-xs tabular-nums text-muted">{h.rank}</span>
                <span className="min-w-0">
                  <a
                    href={h.url}
                    {...(isExternal(h.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`block truncate rounded text-sm text-fg underline decoration-line-strong underline-offset-2 hover:decoration-accent ${FOCUS}`}
                  >
                    {h.title}
                  </a>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    <Icon size={12} aria-hidden="true" />
                    {label}
                    {h.n !== undefined && <span>· [{h.n}]</span>}
                    <span aria-hidden="true">·</span>
                    {h.cited ? (
                      <span className="inline-flex items-center gap-1 text-ok">
                        <LuCheck size={12} aria-hidden="true" />
                        cited
                      </span>
                    ) : (
                      <span>not cited</span>
                    )}
                  </span>
                </span>
                <span className="col-start-2 sm:col-start-auto">
                  <Meter label="BM25" value={best > 0 ? h.score / best : 0} display={h.score.toFixed(2)} tone={h.cited ? "accent" : "muted"} />
                </span>
                <span className="col-start-2 text-xs text-fg-2 sm:col-start-auto sm:text-right">
                  <span className="font-mono tabular-nums text-fg">{pct(h.coverage)}</span> terms
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </details>
  );
}

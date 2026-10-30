import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import GateScatter, { KindKey, type GateCase } from "@/components/evals/GateScatter";
import evals from "@/lib/data/evals.json";

export const metadata: Metadata = {
  title: "Evals",
  description:
    "Published evaluation results for this portfolio's own AI features: retrieval hit@k and MRR, off-topic refusal, safety gate, job-fit accuracy, and live LLM grounding, failures included.",
  alternates: { canonical: "/evals" },
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

interface Suite {
  id: string;
  label: string;
  value: string;
  measures: string;
  method: "Deterministic" | "Decision model" | "Live LLM";
  cases: Array<{ label: string; pass: boolean }>;
}

function Status({ pass }: { pass: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs tracking-wide ${pass ? "text-ok " : "text-danger "}`}>
      <span aria-hidden="true">{pass ? "✓" : "✕"}</span>
      {pass ? "PASS" : "FAIL"}
    </span>
  );
}

/** One cell per case: solid ink for a pass, red with a cross for a fail. */
function CaseStrip({ cases, size = "sm" }: { cases: Suite["cases"]; size?: "sm" | "lg" }) {
  const cell = size === "lg" ? "h-5 w-2.5 sm:w-3" : "h-2.5 w-2.5";
  return (
    <ul className="flex flex-wrap gap-[2px]" aria-label={`${cases.filter((c) => c.pass).length} of ${cases.length} cases pass`}>
      {cases.map((c, i) => (
        <li
          key={`${i}-${c.label}`}
          title={`${c.pass ? "PASS" : "FAIL"} · ${c.label}`}
          className={`${cell} rounded-[2px] ${c.pass ? "bg-gray-800/80 dark:bg-white/75" : "bg-red-600 dark:bg-red-400"}`}
        />
      ))}
    </ul>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{children}</p>;
}

function SectionTitle({ index, children, aside }: { index: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-3 mb-6">
      <h2 className="flex items-baseline gap-3 text-xl sm:text-2xl font-semibold tracking-tight text-fg">
        <span className="font-mono text-xs tabular-nums text-accent-fg">{index}</span>
        {children}
      </h2>
      {aside && <span className="text-sm text-muted">{aside}</span>}
    </div>
  );
}

function CaseTable({ head, rows }: { head: string[]; rows: Array<{ key: string; cells: ReactNode[]; pass: boolean }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left font-mono text-xs uppercase tracking-[0.1em] text-muted">
            {head.map((h) => <th key={h} className="py-2 pr-4 font-normal">{h}</th>)}
            <th className="py-2 font-normal text-right">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-line text-fg">
              {r.cells.map((c, i) => <td key={i} className="py-2.5 pr-4 align-baseline">{c}</td>)}
              <td className="py-2.5 text-right align-baseline whitespace-nowrap"><Status pass={r.pass} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Disclosure({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group mt-6 rounded-xl border border-line [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm text-gray-700 dark:text-white/70 hover:text-gray-950 dark:hover:text-white
        outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl">
        {summary}
        <span aria-hidden="true" className="font-mono text-gray-400 group-open:rotate-45 motion-reduce:transition-none" style={{ transition: "transform 200ms ease" }}>+</span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export default function EvalsPage() {
  const { retrieval, offTopic, fit } = evals;
  // Each of these is null when the evals ran without the matching key (TYPESAFE_* / LLM_* + --llm).
  const gate = evals.gate as { model: string; passRate: number; cases: GateCase[] } | null;
  const scope = evals.scope as { source: string; passRate: number; cases: Array<{ q: string; kind: string; pass: boolean }> } | null;
  const llm = evals.llm as {
    model: string | null;
    passRate: number;
    cases: Array<{ q: string; cited: boolean; grounded: boolean; pass: boolean }>;
  } | null;
  const generated = new Date(evals.generatedAt).toISOString().slice(0, 10);

  const suites: Suite[] = [
    {
      id: "retrieval",
      label: `Retrieval hit@${retrieval.k}`,
      value: pct(retrieval.hitAtK),
      measures: `Expected source in the top ${retrieval.k} for each golden question`,
      method: "Deterministic",
      cases: retrieval.cases.map((c) => ({ label: c.q, pass: c.pass })),
    },
    {
      id: "off-topic",
      label: "Off-topic refusal",
      value: pct(offTopic.passRate),
      measures: "Unrelated questions find no evidence and are refused",
      method: "Deterministic",
      cases: offTopic.cases.map((c) => ({ label: c.q, pass: c.pass })),
    },
    {
      id: "fit",
      label: "Fit check",
      value: pct(fit.passRate),
      measures: "Labelled job descriptions: right matches, right gaps, every match cited",
      method: "Deterministic",
      cases: fit.cases.map((c) => ({ label: c.name, pass: c.pass })),
    },
    ...(gate
      ? [{
          id: "gate",
          label: "Safety gate",
          value: pct(gate.passRate),
          measures: "On-topic questions pass; off-topic and injection attempts are stopped",
          method: "Decision model" as const,
          cases: gate.cases.map((c) => ({ label: c.q, pass: c.pass })),
        }]
      : []),
    ...(scope
      ? [{
          id: "scope",
          label: "Free-chat block",
          value: pct(scope.passRate),
          measures: "The challenge bot refuses homework, trivia, and password tricks",
          method: (scope.source.startsWith("typesafe") ? "Decision model" : "Deterministic") as Suite["method"],
          cases: scope.cases.map((c) => ({ label: c.q, pass: c.pass })),
        }]
      : []),
    ...(llm
      ? [{
          id: "llm",
          label: "Live answers",
          value: pct(llm.passRate),
          measures: "Generated answers cite a source and stay grounded in it",
          method: "Live LLM" as const,
          cases: llm.cases.map((c) => ({ label: c.q, pass: c.pass })),
        }]
      : []),
  ];

  const allCases = suites.flatMap((s) => s.cases);
  const passed = allCases.filter((c) => c.pass).length;
  const rankCounts = [1, 2, 3].map((r) => retrieval.cases.filter((c) => c.rank === r).length);
  const misses = retrieval.cases.filter((c) => !c.pass).length;
  const pad = (n: number) => String(n).padStart(2, "0");
  let section = 0;
  const next = () => pad(++section);

  return (
    <main id="content" className="w-full max-w-5xl mx-auto px-4 pt-14 pb-28 md:pl-24 md:pr-8">
      <header className="mb-14 max-w-2xl">
        <Eyebrow>Evals</Eyebrow>
        <h1 className="mt-4 mb-5 text-[clamp(2.25rem,1.6rem+3vw,3.75rem)] font-semibold tracking-[-0.03em] leading-[1.02] text-fg">
          Measured, failures included
        </h1>
        <p className="text-lg leading-relaxed text-fg-2">
          Every AI feature on this site ships with a test set. These are the latest results for{" "}
          <Link href="/ask" className="underline decoration-accent/60 underline-offset-2 hover:decoration-accent">Ask Selvin</Link>, the{" "}
          <Link href="/fit" className="underline decoration-accent/60 underline-offset-2 hover:decoration-accent">fit check</Link>, and the{" "}
          <Link href="/challenge" className="underline decoration-accent/60 underline-offset-2 hover:decoration-accent">challenge</Link>,
          published as they came out, case by case.
        </p>
      </header>

      {/* Scoreboard */}
      <section aria-labelledby="scoreboard" className="mb-20 rounded-2xl border border-black/10 dark:border-white/10 p-6 sm:p-8
        bg-gradient-to-br from-white to-[#FAFAF9] dark:from-white/[0.04] dark:to-transparent">
        <h2 id="scoreboard" className="sr-only">Scoreboard</h2>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Cases passing</Eyebrow>
            <p className="mt-2 flex items-baseline gap-3">
              <span className="text-6xl sm:text-7xl font-semibold tracking-[-0.04em] tabular-nums text-fg">{passed}</span>
              <span className="text-2xl tabular-nums text-muted">/ {allCases.length}</span>
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 sm:gap-10 text-right">
            {[
              ["Suites", String(suites.length)],
              ["MRR", retrieval.mrr.toFixed(2)],
              ["Indexed docs", String(evals.corpusDocs)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{k}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-6">
          <CaseStrip cases={allCases} size="lg" />
        </div>
        <p className="mt-4 font-mono text-xs text-muted">
          Generated {generated}
          {gate && <> · gate {gate.model}</>}
          {llm?.model && <> · answers {llm.model}</>}
        </p>
      </section>

      {/* Suites */}
      <section className="mb-20" aria-labelledby="suites">
        <SectionTitle index={next()} aside="Each cell is one test case">
          <span id="suites">Suites</span>
        </SectionTitle>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-black/10 dark:bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {suites.map((s) => (
            <li key={s.id} className="flex flex-col gap-4 bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <a href={`#${s.id}`} className="inline-flex items-center min-h-11 [@media(pointer:fine)]:min-h-0 text-sm font-medium text-fg hover:text-accent-fg">
                  {s.label}
                </a>
                <span className="shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-xs uppercase tracking-[0.1em] text-muted">
                  {s.method}
                </span>
              </div>
              <p className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight tabular-nums text-fg">{s.value}</span>
                <span className="text-xs tabular-nums text-muted">
                  {s.cases.filter((c) => c.pass).length}/{s.cases.length}
                </span>
              </p>
              <p className="text-sm leading-relaxed text-fg-2">{s.measures}</p>
              <div className="mt-auto"><CaseStrip cases={s.cases} /></div>
            </li>
          ))}
        </ul>
      </section>

      {/* Retrieval */}
      <section id="retrieval" className="mb-20 scroll-mt-20">
        <SectionTitle index={next()} aside={`hit@${retrieval.k} ${pct(retrieval.hitAtK)} · MRR ${retrieval.mrr.toFixed(3)}`}>
          Retrieval
        </SectionTitle>
        <p className="max-w-2xl text-fg-2 leading-relaxed">
          BM25 over the portfolio data. Each golden question names the source that should come back; the rank is where it landed.
        </p>
        <div className="mt-6 grid grid-cols-4 gap-3 max-w-xl">
          {[...rankCounts.map((n, i) => ({ k: `Rank ${i + 1}`, n })), { k: "Missed", n: misses }].map(({ k, n }) => (
            <div key={k} className="rounded-xl border border-line p-3">
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">{k}</p>
              <p className={`mt-1 text-2xl font-semibold tabular-nums ${k === "Missed" && n > 0 ? "text-danger " : "text-fg "}`}>{n}</p>
            </div>
          ))}
        </div>
        <Disclosure summary={`All ${retrieval.cases.length} retrieval cases`}>
          <CaseTable
            head={["Question", "Expected", "Rank"]}
            rows={retrieval.cases.map((c) => ({
              key: c.q,
              pass: c.pass,
              cells: [
                c.q,
                <span key="e" className="font-mono text-xs">{c.expect}</span>,
                <span key="r" className="inline-flex gap-1" aria-label={c.rank ? `rank ${c.rank}` : "not found"}>
                  {Array.from({ length: retrieval.k }, (_, i) => (
                    <span key={i} className={`h-2 w-2 rounded-full ${c.rank === i + 1 ? "bg-accent" : "bg-black/10 dark:bg-white/15"}`} />
                  ))}
                </span>,
              ],
            }))}
          />
        </Disclosure>
      </section>

      {/* Safety gate */}
      {gate && (
        <section id="gate" className="mb-20 scroll-mt-20">
          <SectionTitle index={next()} aside={`${pct(gate.passRate)} · TypeSafe ${gate.model}`}>
            Safety gate
          </SectionTitle>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start">
            <div className="flex flex-col gap-4 text-fg-2 leading-relaxed">
              <p>
                Before any LLM call, a TypeSafe decision model returns two calibrated probabilities: is this about Selvin, and is it an
                injection attempt. A question is answered only when the first is at least 0.5 and the second is below it.
              </p>
              <p>
                The test mixes the {gate.cases.filter((c) => c.kind === "on-topic").length} golden on-topic questions, which must still get
                through, with {gate.cases.filter((c) => c.kind === "off-topic").length} off-topic and{" "}
                {gate.cases.filter((c) => c.kind === "injection").length} injection attempts, which must not.
              </p>
            </div>
            <div className="rounded-2xl border border-line p-4 sm:p-5">
              <GateScatter cases={gate.cases} />
            </div>
          </div>
          <Disclosure summary={`All ${gate.cases.length} gate cases`}>
            <CaseTable
              head={["Question", "Kind", "On-topic", "Injection"]}
              rows={gate.cases.map((c) => ({
                key: c.q,
                pass: c.pass,
                cells: [
                  c.q,
                  <span key="k" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs"><KindKey kind={c.kind} />{c.kind}</span>,
                  <span key="o" className="font-mono text-xs tabular-nums">{c.onTopic?.toFixed(2) ?? "—"}</span>,
                  <span key="i" className="font-mono text-xs tabular-nums">{c.injection?.toFixed(2) ?? "—"}</span>,
                ],
              }))}
            />
          </Disclosure>
        </section>
      )}

      {/* Refusals: off-topic + free-chat */}
      <section id="off-topic" className="mb-20 scroll-mt-20">
        <SectionTitle index={next()} aside="Saying no is part of the job">Refusals</SectionTitle>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-1 text-base font-medium text-fg">Off-topic refusal · {pct(offTopic.passRate)}</h3>
            <p className="mb-4 text-sm text-fg-2">With no relevant evidence, Ask Selvin refuses instead of guessing.</p>
            <CaseTable
              head={["Question"]}
              rows={offTopic.cases.map((c) => ({ key: c.q, pass: c.pass, cells: [c.q] }))}
            />
          </div>
          {scope && (
            <div id="scope" className="scroll-mt-20">
              <h3 className="mb-1 text-base font-medium text-fg">Free-chat block · {pct(scope.passRate)}</h3>
              <p className="mb-4 text-sm text-fg-2">The challenge bot is not a general assistant ({scope.source}).</p>
              <CaseTable
                head={["Attempt", "Kind"]}
                rows={scope.cases.map((c) => ({
                  key: c.q,
                  pass: c.pass,
                  cells: [c.q, <span key="k" className="font-mono text-xs whitespace-nowrap">{c.kind}</span>],
                }))}
              />
            </div>
          )}
        </div>
      </section>

      {/* Fit */}
      <section id="fit" className="mb-20 scroll-mt-20">
        <SectionTitle index={next()} aside={`${pct(fit.passRate)} · no LLM`}>Fit check</SectionTitle>
        <p className="max-w-2xl mb-6 text-fg-2 leading-relaxed">
          Each labelled job description must match the required requirements, report the required gaps, and back every match with cited evidence.
        </p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {fit.cases.map((c) => (
            <li key={c.name} className="rounded-xl border border-line p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-fg">{c.name}</span>
                <Status pass={c.pass} />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums text-fg">{c.score}</p>
              <div className="mt-2 h-1.5 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${c.score}%` }} />
              </div>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-muted">fit score</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Live answers */}
      {llm && (
        <section id="llm" className="mb-20 scroll-mt-20">
          <SectionTitle index={next()} aside={`${pct(llm.passRate)} · ${llm.model ?? "LLM"}`}>Live answers</SectionTitle>
          <p className="max-w-2xl text-fg-2 leading-relaxed">
            The golden questions go through the real answer path. An answer passes only if it cites a source and its claims are grounded
            in that source. Model output varies between runs, so this is the one number that can move by a case without any code change.
          </p>
          <Disclosure summary={`All ${llm.cases.length} answer cases`}>
            <CaseTable
              head={["Question", "Cited", "Grounded"]}
              rows={llm.cases.map((c) => ({
                key: c.q,
                pass: c.pass,
                cells: [
                  c.q,
                  <span key="c" className="font-mono text-xs">{c.cited ? "yes" : "no"}</span>,
                  <span key="g" className="font-mono text-xs">{c.grounded ? "yes" : "no"}</span>,
                ],
              }))}
            />
          </Disclosure>
        </section>
      )}

      {/* Method */}
      <section aria-labelledby="method">
        <SectionTitle index={next()}><span id="method">How it runs</span></SectionTitle>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-black/10 dark:bg-white/10 sm:grid-cols-3">
          {[
            ["Deterministic", "Retrieval, off-topic refusal, and fit check are plain code over the same data the site serves. Free, and identical on every run."],
            ["Decision model", "The safety gate and free-chat block call TypeSafe. Without a key they fall back to keyword rules, and the source is shown."],
            ["Live LLM", "Answer grading runs only with --llm and an OpenAI-compatible key, against the same prompt and citations as /ask."],
          ].map(([h, b]) => (
            <li key={h} className="bg-surface p-5">
              <p className="text-sm font-medium text-fg">{h}</p>
              <p className="mt-2 text-sm leading-relaxed text-fg-2">{b}</p>
            </li>
          ))}
        </ol>
        <pre className="mt-6 overflow-x-auto rounded-xl bg-gray-950 dark:bg-white/[0.06] px-4 py-3 font-mono text-xs text-white/85">
          <code>npm run evals -- --llm</code>
        </pre>
      </section>
    </main>
  );
}

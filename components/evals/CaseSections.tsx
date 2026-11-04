import { LuCheck, LuX } from "react-icons/lu";
import Meter from "@/components/tools/Meter";
import { FOCUS } from "@/components/tools/styles";
import golden from "@/evals/golden.json";
import type { EvalsReport, FitCase, LlmCase } from "@/evals/report";
import { MIN_COVERAGE, MIN_SCORE } from "@/lib/ask/answer";
import { pct } from "@/lib/evalsSummary";
import GateScatter from "./GateScatter";
import { KindKey } from "./gateKinds";
import HashDetails from "./HashDetails";
import { askHref, CaseTable, SectionTitle, StaleNote, Status, TryLink, YesNo } from "./parts";
import { caseAnchor } from "./suites";

const SECTION = "mb-20 w-full scroll-mt-20";
const PROSE = "max-w-2xl leading-relaxed text-fg-2";

const Question = ({ q, href }: { q: string; href: string }) => (
  <span>
    {q}
    <TryLink href={href} what={`"${q}"`} />
  </span>
);

export function RetrievalSection({ retrieval }: { retrieval: EvalsReport["retrieval"] }) {
  const { k, cases } = retrieval;
  const tiles = [
    ...Array.from({ length: k }, (_, i) => ({ label: `Rank ${i + 1}`, n: cases.filter((c) => c.rank === i + 1).length, bad: false })),
    { label: "Missed", n: cases.filter((c) => !c.pass).length, bad: true },
  ];
  return (
    <section id="retrieval" aria-labelledby="retrieval-title" className={SECTION}>
      <SectionTitle id="retrieval-title" aside={`hit@${k} ${pct(retrieval.hitAtK)}, MRR ${retrieval.mrr.toFixed(3)}`}>
        Retrieval
      </SectionTitle>
      <p className={PROSE}>
        BM25 over the portfolio data. Each golden question names the source that should come back; the rank is where it landed, and a
        miss shows what ranked first instead.
      </p>
      <dl className="mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(({ label, n, bad }) => (
          <div key={label} className="rounded-xl border border-line p-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className={`mt-1 text-2xl font-semibold tabular-nums ${bad && n > 0 ? "text-danger" : "text-fg"}`}>{n}</dd>
          </div>
        ))}
      </dl>
      <HashDetails summary={`All ${cases.length} retrieval cases`}>
        <CaseTable
          caption="Retrieval cases"
          head={["Question", "Expected", "Rank", "Ranked first"]}
          rows={cases.map((c, i) => ({
            id: caseAnchor("retrieval", i),
            pass: c.pass,
            cells: [
              <Question key="q" q={c.q} href={askHref(c.q)} />,
              <span key="e" className="font-mono text-xs">{c.expect}</span>,
              <span key="r" className="inline-flex items-center gap-1" role="img" aria-label={c.rank ? `rank ${c.rank}` : "not in the top 10"}>
                {Array.from({ length: k }, (_, j) => (
                  <span key={j} className={`h-2 w-2 rounded-full ${c.rank === j + 1 ? "bg-accent" : "bg-fg/15"}`} />
                ))}
                {c.rank && c.rank > k && <span className="ml-1 text-xs tabular-nums text-muted">{c.rank}</span>}
              </span>,
              c.rank === 1 ? (
                <span key="t" className="text-xs text-muted">the expected source</span>
              ) : (
                <span key="t" className="text-xs text-fg-2">{c.top ?? "nothing"}</span>
              ),
            ],
          }))}
        />
      </HashDetails>
    </section>
  );
}

export function GateSection({ gate }: { gate: NonNullable<EvalsReport["gate"]> }) {
  const count = (kind: string) => gate.cases.filter((c) => c.kind === kind).length;
  return (
    <section id="gate" aria-labelledby="gate-title" className={SECTION}>
      <SectionTitle id="gate-title" aside={`${pct(gate.passRate)}, TypeSafe ${gate.model}`}>
        Safety gate
      </SectionTitle>
      {gate.stale && (
        <div className="mb-4">
          <StaleNote at={gate.generatedAt} />
        </div>
      )}
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className={`flex flex-col gap-4 ${PROSE}`}>
          <p>
            Before any LLM call, a TypeSafe decision model returns two calibrated probabilities: is this about Selvin, and is it an
            injection attempt. A question is answered only when the first is at least 0.5 and the second is below it.
          </p>
          <p>
            The test mixes the {count("on-topic")} golden on-topic questions, which must still get through, with {count("off-topic")}{" "}
            off-topic and {count("injection")} injection attempts, which must not.
          </p>
        </div>
        <div className="min-w-0 rounded-2xl border border-line p-3 sm:p-5">
          <GateScatter cases={gate.cases} />
        </div>
      </div>
      <HashDetails summary={`All ${gate.cases.length} gate cases`}>
        <CaseTable
          caption="Safety gate cases"
          head={["Question", "Kind", "On-topic", "Injection"]}
          rows={gate.cases.map((c, i) => ({
            id: caseAnchor("gate", i),
            pass: c.pass,
            cells: [
              <Question key="q" q={c.q} href={c.kind === "injection" ? "/challenge" : askHref(c.q)} />,
              <span key="k" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
                <KindKey kind={c.kind} />
                {c.kind}
              </span>,
              <span key="o" className="font-mono text-xs tabular-nums">{c.onTopic?.toFixed(2) ?? "n/a"}</span>,
              <span key="i" className="font-mono text-xs tabular-nums">{c.injection?.toFixed(2) ?? "n/a"}</span>,
            ],
          }))}
        />
      </HashDetails>
    </section>
  );
}

export function RefusalsSection({ offTopic, scope }: { offTopic: EvalsReport["offTopic"]; scope: EvalsReport["scope"] }) {
  return (
    <section id="off-topic" aria-labelledby="refusals-title" className={SECTION}>
      <SectionTitle id="refusals-title" aside="Saying no is part of the job">
        Refusals
      </SectionTitle>
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="min-w-0">
          <h3 className="mb-1 text-base font-medium text-fg">Off-topic refusal, {pct(offTopic.passRate)}</h3>
          {/* Thresholds come from lib/ask/answer.ts, the same constants /ask uses. */}
          <p className="mb-4 text-sm leading-relaxed text-fg-2">
            With no relevant evidence, Ask Selvin refuses instead of guessing: the best BM25 score must reach {MIN_SCORE} and some snippet
            must cover at least {MIN_COVERAGE} of the question&apos;s terms.
          </p>
          <CaseTable
            caption="Off-topic refusal cases"
            head={["Question", `Top score (min ${MIN_SCORE})`, `Coverage (min ${MIN_COVERAGE})`, "Refused"]}
            rows={offTopic.cases.map((c, i) => ({
              id: caseAnchor("off-topic", i),
              pass: c.pass,
              cells: [
                <Question key="q" q={c.q} href={askHref(c.q)} />,
                <span key="s" className="font-mono text-xs tabular-nums">{c.topScore.toFixed(2)}</span>,
                <span key="c" className="font-mono text-xs tabular-nums">{c.topCoverage?.toFixed(2) ?? "n/a"}</span>,
                <YesNo key="r" value={c.refused} />,
              ],
            }))}
          />
        </div>
        {scope && (
          <div id="scope" className="min-w-0 scroll-mt-20">
            <h3 className="mb-1 text-base font-medium text-fg">Free-chat block, {pct(scope.passRate)}</h3>
            <p className="mb-4 text-sm leading-relaxed text-fg-2">
              The challenge bot is not a general assistant: free chat is blocked, while real attempts at the password still reach the game.
              Checked by {scope.source}.
            </p>
            {scope.stale && (
              <div className="mb-4">
                <StaleNote at={scope.generatedAt} />
              </div>
            )}
            <CaseTable
              caption="Free-chat block cases"
              head={["Attempt", "Expected"]}
              rows={scope.cases.map((c, i) => ({
                id: caseAnchor("scope", i),
                pass: c.pass,
                cells: [
                  <Question key="q" q={c.q} href="/challenge" />,
                  <span key="k" className="text-xs text-fg-2">
                    {c.kind === "free-chat" ? "Blocked, free chat" : "Allowed, game move"}
                  </span>,
                ],
              }))}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function Checklist({ title, items, missing, empty }: { title: string; items: string[]; missing: string[]; empty: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-fg-2">{title}</p>
      {items.length ? (
        <ul className="mt-1.5 flex flex-col gap-1 text-xs">
          {items.map((m) => {
            const miss = missing.includes(m);
            return (
              <li key={m} className="flex items-start gap-1.5">
                {miss ? (
                  <LuX size={13} aria-label="missing" className="mt-px shrink-0 text-danger" />
                ) : (
                  <LuCheck size={13} aria-label="found" className="mt-px shrink-0 text-ok" />
                )}
                <span className={miss ? "text-danger" : "text-fg-2"}>{m}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-1.5 text-xs text-muted">{empty}</p>
      )}
    </div>
  );
}

function FitCard({ c, i }: { c: FitCase; i: number }) {
  const spec = golden.fit.find((g) => g.name === c.name);
  return (
    <li
      id={caseAnchor("fit", i)}
      tabIndex={-1}
      className="flex scroll-mt-24 flex-col gap-4 rounded-xl border border-line p-4 outline-none transition-colors duration-300 target:bg-accent/10 focus:bg-accent/10"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-fg">{c.name}</span>
        <Status pass={c.pass} />
      </div>
      <Meter label="Fit score" value={c.score / 100} display={String(c.score)} />
      {spec && (
        <>
          <Checklist title="Must match" items={spec.mustMatch} missing={c.missingMatches} empty="None: this description must not claim overlap." />
          <Checklist title="Must report as a gap" items={spec.mustGap} missing={c.missingGaps} empty="None required." />
        </>
      )}
      {c.unbacked.length > 0 && (
        <p className="text-xs text-danger">Matched without evidence: {c.unbacked.join(", ")}</p>
      )}
      {spec && (
        <details className="group text-xs">
          <summary className={`inline-flex min-h-9 cursor-pointer list-none items-center rounded text-muted hover:text-fg ${FOCUS}`}>
            Job description
          </summary>
          <p className="mt-1 leading-relaxed text-fg-2">{spec.jd}</p>
        </details>
      )}
      <div className="mt-auto">
        <TryLink href={`/fit?sample=${encodeURIComponent(c.name)}`} what={`the ${c.name} sample in the fit check`} />
      </div>
    </li>
  );
}

export function FitSection({ fit }: { fit: EvalsReport["fit"] }) {
  return (
    <section id="fit" aria-labelledby="fit-title" className={SECTION}>
      <SectionTitle id="fit-title" aside={`${pct(fit.passRate)}, no LLM`}>
        Fit check
      </SectionTitle>
      <p className={`mb-6 ${PROSE}`}>
        Each labelled job description must find the required matches, report the required gaps, and back every match with cited evidence.
      </p>
      <ul className="grid gap-3 md:grid-cols-3">
        {fit.cases.map((c, i) => (
          <FitCard key={c.name} c={c} i={i} />
        ))}
      </ul>
    </section>
  );
}

function Checks({ c }: { c: LlmCase }) {
  if (c.refused !== undefined) {
    return <span className="text-xs text-fg-2">Refused: {c.refused ? "yes" : "no"}</span>;
  }
  return (
    <span className="text-xs text-fg-2">
      Cited: <YesNo value={c.cited} />, grounded: <YesNo value={c.grounded} />
    </span>
  );
}

export function LlmSection({ llm }: { llm: NonNullable<EvalsReport["llm"]> }) {
  return (
    <section id="llm" aria-labelledby="llm-title" className={SECTION}>
      <SectionTitle id="llm-title" aside={`${pct(llm.passRate)}, ${llm.model ?? "LLM"}`}>
        Live answers
      </SectionTitle>
      {llm.stale && (
        <div className="mb-4">
          <StaleNote at={llm.generatedAt} />
        </div>
      )}
      <p className={PROSE}>
        The golden questions go through the real answer path. An answer passes only if it cites a source and is grounded in it; an
        off-topic question passes only if it is refused. Model output varies between runs, so this is the one number that can move without
        any code change.
      </p>
      <HashDetails summary={`All ${llm.cases.length} answer cases`}>
        <CaseTable
          caption="Live answer cases"
          head={["Question", "Answered by", "Checks"]}
          rows={llm.cases.map((c, i) => ({
            id: caseAnchor("llm", i),
            pass: c.pass,
            cells: [
              <Question key="q" q={c.q} href={askHref(c.q)} />,
              <span key="m" className="whitespace-nowrap text-xs text-fg-2">{c.mode === "llm" ? "LLM" : "Retrieval fallback"}</span>,
              <Checks key="c" c={c} />,
            ],
          }))}
        />
      </HashDetails>
    </section>
  );
}

export function MethodSection() {
  return (
    <section aria-labelledby="method" className="w-full">
      <SectionTitle id="method">How it runs</SectionTitle>
      <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {[
          ["Deterministic", "Retrieval, off-topic refusal and the fit check are plain code over the same data the site serves. Free, and identical on every run."],
          ["Decision model", "The safety gate and free-chat block call TypeSafe. A run without the key keeps the last published result and marks it as not re-run."],
          ["Live LLM", "Answer grading runs only when asked for and an OpenAI-compatible key is set, against the same prompt and citations as /ask. Without them the last graded run is kept."],
        ].map(([h, b]) => (
          <li key={h} className="bg-surface p-5">
            <p className="text-sm font-medium text-fg">{h}</p>
            <p className="mt-2 text-sm leading-relaxed text-fg-2">{b}</p>
          </li>
        ))}
      </ol>
      <pre className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface-3 px-4 py-3 font-mono text-xs text-fg">
        <code>npm run evals -- --llm</code>
      </pre>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import evals from "@/lib/data/evals.json";

export const metadata: Metadata = {
  title: "Evals",
  description:
    "Published evaluation results for this portfolio's own AI features: retrieval hit@k and MRR, off-topic refusal, and job-fit check accuracy.",
  alternates: { canonical: "/evals" },
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl p-5 border border-black/8 dark:border-white/10">
      <dt className="font-mono text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">{label}</dt>
      <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-900 dark:text-white">{value}</dd>
      <dd className="mt-1 text-xs text-gray-600 dark:text-white/50">{note}</dd>
    </div>
  );
}

function Status({ pass }: { pass: boolean }) {
  return (
    <span className={`font-mono text-xs ${pass ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      {pass ? "PASS" : "FAIL"}
    </span>
  );
}

export default function EvalsPage() {
  const { retrieval, offTopic, fit } = evals;
  // null until `npm run evals -- --llm` has been run with an LLM key.
  const llm = evals.llm as { model: string | null; passRate: number } | null;
  const generated = new Date(evals.generatedAt).toISOString().slice(0, 10);

  return (
    <main id="content" className="flex flex-col items-center px-4 pt-16 pb-28 md:pl-20">
      <SectionHeading
        kicker={
          <>
            Latest results for <Link href="/ask" className="underline decoration-accent/60 underline-offset-2">Ask Selvin</Link> and
            the <Link href="/fit" className="underline decoration-accent/60 underline-offset-2">fit check</Link>,
            failures included. Run with <code className="font-mono text-[0.85em]">npm run evals</code>.
          </>
        }
      >
        Evals
      </SectionHeading>

      <div className="w-full max-w-3xl flex flex-col gap-10">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label={`Hit@${retrieval.k}`} value={pct(retrieval.hitAtK)} note={`${retrieval.cases.length} golden questions`} />
          <Metric label="MRR" value={retrieval.mrr.toFixed(2)} note="Mean reciprocal rank" />
          <Metric label="Off-topic refusal" value={pct(offTopic.passRate)} note={`${offTopic.cases.length} unrelated questions`} />
          <Metric label="Fit check" value={pct(fit.passRate)} note={`${fit.cases.length} labelled JDs`} />
        </dl>

        {llm && (
          <p className="text-sm text-gray-700 dark:text-white/65">
            Live answers ({llm.model}): {pct(llm.passRate)} cited and grounded.
          </p>
        )}

        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-white/45">Retrieval cases</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-white/45">
                  <th className="py-2 pr-3 font-normal">Question</th>
                  <th className="py-2 pr-3 font-normal">Expected</th>
                  <th className="py-2 pr-3 font-normal">Rank</th>
                  <th className="py-2 font-normal">Result</th>
                </tr>
              </thead>
              <tbody>
                {retrieval.cases.map((c) => (
                  <tr key={c.q} className="border-t border-black/6 dark:border-white/8 text-gray-800 dark:text-white/75">
                    <td className="py-2 pr-3">{c.q}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{c.expect}</td>
                    <td className="py-2 pr-3 tabular-nums">{c.rank ?? "—"}</td>
                    <td className="py-2"><Status pass={c.pass} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-white/45">Off-topic gate</h2>
          <ul className="flex flex-col gap-1.5 text-sm text-gray-800 dark:text-white/75">
            {offTopic.cases.map((c) => (
              <li key={c.q} className="flex justify-between gap-4">
                <span>{c.q}</span>
                <Status pass={c.pass} />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-white/45">Fit check</h2>
          <ul className="flex flex-col gap-1.5 text-sm text-gray-800 dark:text-white/75">
            {fit.cases.map((c) => (
              <li key={c.name} className="flex justify-between gap-4">
                <span>{c.name} <span className="text-gray-500 dark:text-white/45">· score {c.score}</span></span>
                <Status pass={c.pass} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-600 dark:text-white/50">
            Each case checks that required requirements are matched, required gaps are reported, and no match lacks cited evidence.
          </p>
        </section>

        <p className="font-mono text-xs text-gray-500 dark:text-white/45">
          Generated {generated} · {evals.corpusDocs} indexed documents
        </p>
      </div>
    </main>
  );
}

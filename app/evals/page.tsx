import type { Metadata } from "next";
import Link from "next/link";
import ToolPage from "@/components/tools/ToolPage";
import { FitSection, GateSection, LlmSection, MethodSection, RefusalsSection, RetrievalSection } from "@/components/evals/CaseSections";
import { Scoreboard, SuiteGrid } from "@/components/evals/Overview";
import { buildSuites } from "@/components/evals/suites";
import { report } from "@/lib/evalsSummary";
import { JsonLd, PERSON_ID, absoluteUrl, breadcrumbList, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Published evaluation results for this portfolio's own AI features: retrieval hit@k and MRR, off-topic refusal, safety gate, job-fit accuracy, and live LLM grounding, failures included.";

export const metadata: Metadata = pageMetadata({
  title: "AI Feature Evals: Retrieval, Refusal and Fit Accuracy",
  description: DESCRIPTION,
  path: "/evals",
});

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Portfolio AI feature evals",
    description: DESCRIPTION,
    url: absoluteUrl("/evals"),
    creator: { "@id": PERSON_ID },
    dateModified: report.generatedAt,
    isAccessibleForFree: true,
    variableMeasured: [
      "Retrieval hit@k",
      "Retrieval MRR",
      "Off-topic refusal rate",
      "Safety gate pass rate",
      "Free-chat block rate",
      "Job-fit accuracy",
      "LLM answer grounding and citation rate",
    ],
  },
  breadcrumbList([["Home", "/"], ["Evals", "/evals"]]),
];

const INLINE_LINK = "underline decoration-accent/60 underline-offset-2 hover:decoration-accent";

export default function EvalsPage() {
  const suites = buildSuites(report);
  return (
    <ToolPage
      tool="evals"
      title="Evals"
      kicker={
        <>
          Every AI feature here ships with a test set: <Link href="/ask" className={INLINE_LINK}>Ask</Link>, the{" "}
          <Link href="/fit" className={INLINE_LINK}>fit check</Link> and the <Link href="/challenge" className={INLINE_LINK}>challenge</Link>.
          Measured case by case, failures included.
        </>
      }
    >
      <JsonLd data={STRUCTURED_DATA} />
      <Scoreboard report={report} suites={suites} />
      <SuiteGrid suites={suites} />
      <RetrievalSection retrieval={report.retrieval} />
      {report.gate && <GateSection gate={report.gate} />}
      <RefusalsSection offTopic={report.offTopic} scope={report.scope} />
      <FitSection fit={report.fit} />
      {report.llm && <LlmSection llm={report.llm} />}
      <MethodSection />
    </ToolPage>
  );
}

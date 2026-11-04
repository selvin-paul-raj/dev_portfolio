import type { Metadata } from "next";
import Link from "next/link";
import AskSelvin from "@/components/AskSelvin";
import ToolPage from "@/components/tools/ToolPage";
import { JsonLd, PERSON_ID, absoluteUrl, breadcrumbList, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Ask questions about Selvin PaulRaj K's AI engineering work. Answers are grounded in portfolio data with BM25 retrieval, and every claim is cited.";

export const metadata: Metadata = pageMetadata({
  title: "Ask Selvin",
  socialTitle: "Ask Selvin: cited answers about his AI engineering work",
  description: DESCRIPTION,
  path: "/ask",
});

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Ask Selvin",
    url: absoluteUrl("/ask"),
    description: DESCRIPTION,
    applicationCategory: "ReferenceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "BM25 retrieval over portfolio data",
      "Every claim cites the snippet it came from",
      "Off-topic and prompt-injection questions are refused before any LLM call",
    ],
    creator: { "@id": PERSON_ID },
  },
  breadcrumbList([["Home", "/"], ["Ask Selvin", "/ask"]]),
];

const LINK = "underline decoration-accent/60 underline-offset-2 hover:decoration-accent";

export default function AskPage() {
  return (
    <ToolPage
      tool="ask"
      title="Ask Selvin"
      kicker={
        <>
          Answers come only from this portfolio, and every claim cites the snippet it came from. Accuracy is graded on the{" "}
          <Link href="/evals" className={LINK}>evals page</Link>, and you can try to break the guardrails in the{" "}
          <Link href="/challenge" className={LINK}>challenge</Link>.
        </>
      }
    >
      <JsonLd data={STRUCTURED_DATA} />
      <AskSelvin />
    </ToolPage>
  );
}

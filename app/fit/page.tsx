import type { Metadata } from "next";
import FitCheck from "@/components/FitCheck";
import ToolPage from "@/components/tools/ToolPage";
import { fitData, fitSamples } from "@/components/fit/data";
import { JsonLd, PERSON_ID, absoluteUrl, breadcrumbList, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Paste a job description and see it marked up: which requirements Selvin PaulRaj K has evidence for (cited work, projects, and certifications), which are gaps, and how each one moves the score.";

export const metadata: Metadata = pageMetadata({
  title: "Role Fit Check",
  socialTitle: "Role Fit Check: every match cited, no LLM",
  description: DESCRIPTION,
  path: "/fit",
});

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Role Fit Check",
    url: absoluteUrl("/fit"),
    description: DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: ["Deterministic matching, no LLM", "Every match cites its evidence", "Unbacked requirements listed as gaps"],
    creator: { "@id": PERSON_ID },
  },
  breadcrumbList([["Home", "/"], ["Role Fit Check", "/fit"]]),
];

export default function FitPage() {
  return (
    <ToolPage
      tool="fit"
      title="Role fit check"
      kicker={
        <>
          Hiring for an AI role? Paste the job description. Every match cites the work, project, or certification behind it, and anything I
          can&apos;t back up is listed as a gap. It runs without an LLM, so nothing is generated.
        </>
      }
    >
      <JsonLd data={STRUCTURED_DATA} />
      <FitCheck data={fitData()} samples={fitSamples()} />
    </ToolPage>
  );
}

import type { Metadata } from "next";
import Challenge from "@/components/Challenge";
import ToolPage from "@/components/tools/ToolPage";
import { JsonLd, PERSON_ID, absoluteUrl, breadcrumbList, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "Five levels of LLM defenses: scope filter, system prompt, input filter, output filter, guard model. Get the gatekeeper to reveal the password.";

export const metadata: Metadata = pageMetadata({
  title: "Prompt Injection Challenge",
  socialTitle: "Prompt Injection Challenge: break five stacked LLM defenses",
  description: DESCRIPTION,
  path: "/challenge",
});

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Prompt Injection Challenge",
    url: absoluteUrl("/challenge"),
    description: DESCRIPTION,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: ["Scope filter", "System prompt", "Input filter", "Output filter", "Guard model"],
    creator: { "@id": PERSON_ID },
  },
  breadcrumbList([["Home", "/"], ["Prompt Injection Challenge", "/challenge"]]),
];

export default function ChallengePage() {
  return (
    <ToolPage
      tool="challenge"
      title="Break my guardrails"
      kicker="A model guards a password. Each level stacks one more defense I use in production LLM systems. Get it to talk, then enter the password to open the next level."
    >
      <JsonLd data={STRUCTURED_DATA} />
      <Challenge />
    </ToolPage>
  );
}

import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import Challenge from "@/components/Challenge";

export const metadata: Metadata = {
  title: "Prompt Injection Challenge",
  description:
    "Five levels of LLM defenses: instructions, input filter, output filter, guard model. Get the gatekeeper to reveal the password.",
  alternates: { canonical: "/challenge" },
};

export default function ChallengePage() {
  return (
    <main id="content" className="flex flex-col items-center px-4 pt-16 pb-28">
      <SectionHeading
        kicker="A model guards a password. Each level stacks one more defense I use in production LLM systems. Get it to talk, then enter the password to unlock the next level."
      >
        Break my guardrails
      </SectionHeading>
      <Challenge />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import AskSelvin from "@/components/AskSelvin";

export const metadata: Metadata = {
  title: "Ask Selvin",
  description:
    "Ask questions about Selvin PaulRaj K's AI engineering work. Answers are grounded in portfolio data with BM25 retrieval, and every claim is cited.",
  alternates: { canonical: "/ask" },
};

export default function AskPage() {
  return (
    <main id="content" className="flex flex-col items-center px-4 pt-16 pb-28 md:pl-20">
      <SectionHeading
        kicker={
          <>
            Grounded Q&amp;A over this portfolio: BM25 retrieval picks the snippets, the model may only use those, and
            every citation is checked against what was retrieved. How well it works is measured on the{" "}
            <Link href="/evals" className="underline decoration-accent/60 underline-offset-2">evals page</Link>, and you
            can try to break its guardrails in the <Link href="/challenge" className="underline decoration-accent/60 underline-offset-2">challenge</Link>.
          </>
        }
      >
        Ask Selvin
      </SectionHeading>
      <AskSelvin />
    </main>
  );
}

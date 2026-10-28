import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import FitCheck from "@/components/FitCheck";

export const metadata: Metadata = {
  title: "Role Fit Check",
  description:
    "Paste a job description and see which requirements Selvin PaulRaj K has evidence for (cited work, projects, and certifications) and which are gaps.",
  alternates: { canonical: "/fit" },
};

export default function FitPage() {
  return (
    <main id="content" className="flex flex-col items-center px-4 pt-16 pb-28 md:pl-20">
      <SectionHeading
        kicker={
          <>
            Hiring for an AI role? Paste the job description. Every match cites the work, project, or
            certification behind it, and anything I can&apos;t back up is listed as a gap. It runs without an LLM, so
            nothing is generated.
          </>
        }
      >
        Role fit check
      </SectionHeading>
      <FitCheck />
    </main>
  );
}

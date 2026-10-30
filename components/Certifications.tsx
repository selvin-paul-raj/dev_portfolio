"use client";

import { useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "./SectionHeading";
import LearningHeatmap, { type Selection } from "./certifications/LearningHeatmap";
import CredentialList from "./certifications/CredentialList";
import { aiTotal, certs, issuers } from "./certifications/model";

export default function Certifications() {
  const { ref } = useSectionInView("Certifications", 0.05);
  const [selection, setSelection] = useState<Selection>({ kind: "featured" });

  return (
    <section ref={ref} id="certifications" className="mb-28 w-full max-w-5xl mx-auto px-4 scroll-mt-28">
      <SectionHeading
        kicker={`${certs.length} certificates from ${issuers.length} issuers, ${aiTotal} of them in AI. Every one links to its issuer to verify.`}
      >
        Certifications
      </SectionHeading>

      <LearningHeatmap selection={selection} onSelect={setSelection} />
      {/* Keyed by the selection so paging and search start fresh for each month, year or view */}
      <CredentialList key={JSON.stringify(selection)} selection={selection} onSelect={setSelection} />
    </section>
  );
}

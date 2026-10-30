"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "./SectionHeading";
import CertModal from "./certifications/CertModal";
import Ledger from "./certifications/Ledger";
import YearChart from "./certifications/YearChart";
import SkillWallet from "./certifications/SkillWallet";
import { certs, issuers, type Cert } from "./certifications/data";

export default function Certifications() {
  const { ref } = useSectionInView("Certifications", 0.05);
  const [showAll, setShowAll] = useState(false);
  const [year, setYear] = useState("All");
  const [selected, setSelected] = useState<Cert | null>(null);
  const close = useCallback(() => setSelected(null), []);

  // A chart column opens the full list filtered to that year (or clears it on a second click).
  const pickYear = (y: string) => {
    const next = year === y ? "All" : y;
    setYear(next);
    setShowAll(true);
    requestAnimationFrame(() => document.getElementById("cert-ledger")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <section ref={ref} id="certifications" className="mb-28 w-full max-w-5xl mx-auto px-4 scroll-mt-28">
      <SectionHeading kicker={`${certs.length} certificates from ${issuers.length} issuers. Grouped by the skill each one verifies, next to the projects that use it.`}>
        Certifications
      </SectionHeading>

      <SkillWallet onDetails={setSelected} />

      {/* The whole record: how it changed over the years, and every certificate */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10 lg:gap-14 items-end">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">From web to agents</h3>
          <p className="text-sm text-gray-600 dark:text-white/55">Certificates per year. Pick a year to list them.</p>
          <YearChart selected={year === "All" ? null : year} onPick={pickYear} />
        </div>
        <div className="flex flex-col items-start lg:items-end gap-3">
          <p className="text-sm text-gray-600 dark:text-white/55 lg:text-right">
            Every certificate, searchable by title, issuer, skill or ID.
          </p>
          <button
            type="button"
            aria-expanded={showAll}
            aria-controls="cert-ledger-wrap"
            onClick={() => { setShowAll((v) => !v); if (showAll) setYear("All"); }}
            className="whitespace-nowrap h-11 px-6 rounded-full border border-black/15 dark:border-white/20 text-sm font-medium text-gray-800 dark:text-white
              hover:border-black/30 dark:hover:border-white/35 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {showAll ? "Hide the full list" : `View all ${certs.length} certificates`}
          </button>
        </div>
      </div>

      <div id="cert-ledger-wrap" hidden={!showAll} className="mt-10">
        {showAll && <Ledger year={year} setYear={setYear} onDetails={setSelected} />}
      </div>

      <AnimatePresence>{selected && <CertModal cert={selected} onClose={close} />}</AnimatePresence>
    </section>
  );
}

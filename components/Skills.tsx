"use client";

import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// Display order and labels. Keys must exist in lib/data/skills.json; unknown keys are skipped
// and the aggregate "all" list is intentionally not rendered as its own row.
const GROUPS: { key: string; label: string }[] = [
  { key: "agentic_ai", label: "Agentic AI" },
  { key: "llms", label: "LLMs" },
  { key: "retrieval", label: "RAG & Search" },
  { key: "evaluation_and_reliability", label: "Evaluation" },
  { key: "ai_security", label: "AI Security" },
  { key: "languages", label: "Languages" },
  { key: "backend_and_data", label: "Backend & Data" },
  { key: "frontend", label: "Frontend" },
  { key: "tooling", label: "Cloud & Tooling" },
];

const rows = GROUPS.filter((g) => (skillsData[g.key]?.length ?? 0) > 0);

export default function Skills() {
  const { ref } = useSectionInView("Skills", 0.2);

  return (
    <section ref={ref} id="skills" className="mb-28 w-full max-w-5xl mx-auto scroll-mt-28 px-4">
      <SectionHeading kicker="The stack behind the agents, retrieval systems, and tooling I ship.">
        Skills
      </SectionHeading>

      <dl className="border-t border-black/[0.08] dark:border-white/[0.08]">
        {rows.map(({ key, label }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04, ease: EASE_OUT }}
            className="grid grid-cols-1 gap-3 border-b border-black/[0.08] py-5 dark:border-white/[0.08] sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
          >
            <dt className="flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-[#a1a1aa]">
              <span className="tabular-nums text-amber-700 dark:text-[#f5c518]">{String(i + 1).padStart(2, "0")}</span>
              {label}
            </dt>
            <dd className="m-0">
              <ul className="flex flex-wrap gap-2" aria-label={label}>
                {skillsData[key].map((skill) => (
                  <li
                    key={skill}
                    className="rounded-md border border-black/[0.08] bg-white px-2.5 py-1 text-sm text-gray-800 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#e4e4e7]"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}

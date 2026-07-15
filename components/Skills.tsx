"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const TAB_GROUPS = [
  {
    label: "Agentic AI",
    keys: ["agentic_ai", "agent_memory", "agent_harness_and_runtimes"],
  },
  {
    label: "LLMs & APIs",
    keys: ["llms", "llm_providers_and_apis"],
  },
  {
    label: "RAG & Vector",
    keys: ["rag", "vector_databases", "search_and_retrieval"],
  },
  {
    label: "Frameworks",
    keys: ["agent_frameworks", "sandbox_and_execution", "protocols_and_standards"],
  },
  {
    label: "AI/ML & Eval",
    keys: [
      "ai_ml",
      "evaluation_and_reliability",
      "observability_and_monitoring",
      "guardrails_and_safety",
    ],
  },
  {
    label: "Web & Backend",
    keys: ["frontend", "backend", "databases"],
  },
  {
    label: "DevOps & Tools",
    keys: [
      "deployment_and_devops",
      "tools_and_platforms",
      "data_engineering",
      "testing",
      "web_scraping_and_automation",
    ],
  },
  {
    label: "Engineering",
    keys: ["software_engineering", "ethics_and_compliance", "soft_skills"],
  },
] as const;

export default function Skills() {
  const { ref } = useSectionInView("Skills", 0.2);
  const [activeTab, setActiveTab] = useState(0);

  // Deduplicate — some skills appear in multiple categories (e.g. "Semantic Search")
  const pills = Array.from(
    new Set(TAB_GROUPS[activeTab].keys.flatMap((key) => skillsData[key] ?? []))
  );

  return (
    <section
      ref={ref}
      id="skills"
      className="mb-28 scroll-mt-28 w-full max-w-5xl mx-auto px-4"
    >
      <SectionHeading>Skills</SectionHeading>

      {/* Tab strip */}
      <div
        role="tablist"
        aria-label="Skill categories"
        className="flex overflow-x-auto gap-1 pb-1 mb-8 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {TAB_GROUPS.map((group, i) => (
          <button
            key={group.label}
            role="tab"
            aria-selected={activeTab === i}
            onClick={() => setActiveTab(i)}
            className="relative shrink-0 px-4 py-2 text-sm font-medium rounded-full outline-none
              transition-colors duration-150
              focus-visible:ring-2 focus-visible:ring-[#FFD700]/60
              text-gray-500 dark:text-white/40
              hover:text-gray-900 dark:hover:text-white/80
              aria-selected:text-gray-900 dark:aria-selected:text-white"
          >
            {activeTab === i && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-full bg-white dark:bg-white/10 border border-black/8 dark:border-white/10 shadow-sm"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10">{group.label}</span>
          </button>
        ))}
      </div>

      {/* Pill grid */}
      <AnimatePresence mode="popLayout">
        <motion.ul
          key={activeTab}
          className="flex flex-wrap justify-center gap-2.5"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {pills.map((skill, i) => (
            <motion.li
              key={skill}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: i * 0.028,
                    duration: 0.22,
                    ease: EASE_OUT,
                  },
                },
              }}
              className="bg-white dark:bg-white/5 border border-black/8 dark:border-white/10
                rounded-full px-4 py-1.5
                text-sm font-medium text-gray-700 dark:text-white/75
                font-mono
                select-none cursor-default
                active:scale-[0.97] transition-transform duration-100"
              style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
            >
              {skill}
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {/* Count */}
      <p className="text-center text-xs text-gray-500 dark:text-white/25 mt-6 font-mono">
        {pills.length} skills across {TAB_GROUPS[activeTab].keys.length} categories
      </p>
    </section>
  );
}

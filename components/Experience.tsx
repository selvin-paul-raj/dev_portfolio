"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { experiencesData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const TABS = [
  { label: "Roles", key: "roles" },
  { label: "Internships", key: "internships" },
  { label: "Education", key: "education" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function getTabEntries(tab: TabKey) {
  return experiencesData.filter((exp) => {
    if (exp.iconType === "laptop") return false; // side-project category, not a formal role
    const isIntern = exp.title.toLowerCase().includes("intern");
    if (tab === "education") return exp.iconType === "graduation";
    if (tab === "internships") return exp.iconType !== "graduation" && isIntern;
    return exp.iconType !== "graduation" && !isIntern;
  });
}

export default function Experience() {
  const { ref } = useSectionInView("Experience" as never, 0.15);
  const [activeTab, setActiveTab] = useState<TabKey>("roles");

  const entries = getTabEntries(activeTab);

  return (
    <section
      ref={ref}
      id="experience"
      className="mb-28 scroll-mt-28 w-full max-w-3xl mx-auto px-4"
    >
      <SectionHeading>Experience</SectionHeading>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Experience categories"
        className="flex gap-1 mb-8 bg-black/[0.03] dark:bg-white/[0.04] border border-black/6 dark:border-white/8 rounded-full p-1 w-fit mx-auto"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-5 py-2 text-sm font-medium rounded-full outline-none
              transition-colors duration-150
              focus-visible:ring-2 focus-visible:ring-[#FFD700]/50
              text-gray-500 dark:text-white/40
              hover:text-gray-900 dark:hover:text-white/80
              aria-selected:text-gray-900 dark:aria-selected:text-white"
          >
            {activeTab === tab.key && (
              <motion.span
                layoutId="exp-tab-indicator"
                className="absolute inset-0 rounded-full bg-white dark:bg-white/10 border border-black/8 dark:border-white/10 shadow-sm"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="relative"
        >
          {/* Vertical connector line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />

          <ol className="space-y-0">
            {entries.map((exp, index) => (
              <motion.li
                key={exp.id ?? index}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.07,
                  duration: 0.3,
                  ease: EASE_OUT,
                }}
                className="relative flex gap-5 pb-8 last:pb-0"
              >
                {/* Icon circle */}
                <div
                  className={`relative z-10 shrink-0 flex items-center justify-center w-10 h-10 mt-1 rounded-full border text-base
                    ${exp.isCurrent
                      ? "bg-[#FFD700]/15 dark:bg-[#FFD700]/[0.12] border-[#FFD700]/30 dark:border-[#FFD700]/25 text-[#9a7d2a] dark:text-[#FFD700]/80"
                      : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                    }`}
                >
                  {exp.icon}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 rounded-2xl p-5 border
                    ${exp.isCurrent
                      ? "bg-[#FFD700]/[0.04] dark:bg-[#FFD700]/[0.03] border-[#FFD700]/15 dark:border-[#FFD700]/[0.12]"
                      : "bg-gray-50 dark:bg-white/[0.03] border-black/5 dark:border-white/[0.07]"
                    }`}
                  style={{ transition: "background-color 200ms ease" }}
                >
                  {/* Date + Now badge row */}
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <span className="inline-block font-mono text-[0.65rem] tracking-wider text-gray-400 dark:text-white/30 bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/8 rounded-full px-3 py-1">
                      {exp.date}
                    </span>
                    {exp.isCurrent && (
                      <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-wider text-[#9a7d2a] dark:text-[#FFD700]/75 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full px-2.5 py-1 shrink-0">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FFD700]" />
                        </span>
                        Current
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-base text-gray-900 dark:text-white/90 leading-snug">
                    {exp.title}
                  </h3>

                  <p className="text-sm font-medium text-[#9a7d2a] dark:text-[#FFD700]/75 mt-0.5">
                    {exp.company}
                  </p>

                  {exp.location && (
                    <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                      {exp.location}
                    </p>
                  )}

                  {exp.description && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-white/55 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>

      {/* Entry count */}
      <p className="text-center font-mono text-xs text-gray-400 dark:text-white/25 mt-6">
        {entries.length} {activeTab === "education" ? "degree" : activeTab === "internships" ? "internship" : "role"}{entries.length !== 1 ? "s" : ""}
      </p>
    </section>
  );
}

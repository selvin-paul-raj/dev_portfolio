"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { experiencesData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const COLLAPSED_COUNT = 2;
const STACK_PREFIX = /^(stack|technologies)\s*:\s*/i;

type Entry = (typeof experiencesData)[number];

/** Split a raw description into bullet lines plus an optional trailing stack list. */
function parseDescription(raw: string | undefined): { bullets: string[]; stack: string[] } {
  const lines = (raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-•]+/, "").trim())
    .filter(Boolean);

  const stack: string[] = [];
  const bullets = lines.filter((line) => {
    if (!STACK_PREFIX.test(line)) return true;
    stack.push(
      ...line
        .replace(STACK_PREFIX, "")
        .replace(/\.$/, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    return false;
  });

  return { bullets, stack };
}

const workEntries = experiencesData.filter((e) => e.iconType !== "graduation");
const educationEntries = experiencesData.filter((e) => e.iconType === "graduation");

function BulletList({ items, current }: { items: string[]; current: boolean }) {
  return (
    <ul className="m-0 list-none space-y-2 p-0">
      {items.map((item, i) => (
        <li
          key={i}
          className={`relative max-w-[70ch] pl-4 text-[0.95rem] leading-[1.6] text-gray-600 dark:text-[#c9c9cf]
            before:absolute before:left-0 before:top-[0.68em] before:h-1 before:w-1 before:rounded-full before:content-['']
            ${current ? "before:bg-amber-600 dark:before:bg-[#f5c518]" : "before:bg-gray-400 dark:before:bg-[#71717a]"}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function WorkItem({ exp, index }: { exp: Entry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { bullets, stack } = parseDescription(exp.description);
  const collapsible = !exp.isCurrent && bullets.length > COLLAPSED_COUNT;
  const visible = collapsible ? bullets.slice(0, COLLAPSED_COUNT) : bullets;
  const hidden = collapsible ? bullets.slice(COLLAPSED_COUNT) : [];
  const panelId = `exp-more-${exp.id ?? index}`;

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.3, ease: EASE_OUT, delay: Math.min(index, 3) * 0.05 }}
      className="relative min-w-0 pb-12 pl-8 last:pb-0 sm:pl-10"
    >
      {/* Timeline node */}
      <span aria-hidden="true" className="absolute left-0 top-[0.35rem] flex h-[11px] w-[11px]">
        {exp.isCurrent && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5c518] opacity-40 motion-reduce:animate-none" />
        )}
        <span
          className={`relative inline-flex h-[11px] w-[11px] rounded-full border-2 ${
            exp.isCurrent
              ? "border-[#f5c518] bg-[#f5c518]"
              : "border-gray-300 bg-white dark:border-[#3f3f46] dark:bg-[#101015]"
          }`}
        />
      </span>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h4 className="order-2 m-0 min-w-0 text-lg font-semibold leading-snug text-gray-900 dark:text-white sm:order-1">
          {exp.title}
          {exp.isCurrent && <span className="sr-only"> (current role)</span>}
        </h4>
        <span
          className="order-1 shrink-0 font-mono text-xs tracking-wide text-gray-500 dark:text-[#a1a1aa] sm:order-2"
          // "Present" durations are computed at request time and again in the browser;
          // they can differ by a month across a rollover, which is expected.
          suppressHydrationWarning
        >
          {exp.date}
        </span>
      </div>

      <p className="m-0 mt-1 text-sm">
        <span className="font-medium text-amber-700 dark:text-[#f5c518]">{exp.company}</span>
        {exp.location && (
          <span className="text-gray-500 dark:text-[#a1a1aa]">
            <span aria-hidden="true" className="mx-2">·</span>
            {exp.location}
          </span>
        )}
      </p>

      {bullets.length > 0 && (
        <div className="mt-4">
          <BulletList items={visible} current={exp.isCurrent} />

          {collapsible && (
            <>
              <div
                id={panelId}
                inert={!expanded}
                className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="pt-2">
                    <BulletList items={hidden} current={false} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="-ml-2 mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-amber-700 outline-none transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#f5c518] dark:text-[#f5c518] [@media(hover:hover)]:hover:bg-[#FFD700]/10"
              >
                {expanded ? "Show fewer" : `Show all ${bullets.length}`}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className={`h-3.5 w-3.5 transition-transform duration-200 ease-out ${expanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {stack.length > 0 && (
        <ul aria-label="Stack" className="m-0 mt-4 flex list-none flex-wrap gap-1.5 p-0">
          {stack.map((tech) => (
            <li
              key={tech}
              className="rounded-md border border-black/[0.08] px-2 py-0.5 font-mono text-xs text-gray-500 dark:border-white/[0.07] dark:text-[#a1a1aa]"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}
    </motion.li>
  );
}

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.15);

  return (
    <section ref={ref} id="experience" className="mx-auto mb-28 w-full max-w-5xl scroll-mt-28 px-4">
      <SectionHeading kicker="Full-time AI automation work, internships, and study.">Experience</SectionHeading>

      <div className="mx-auto max-w-4xl">
        <h3 className="m-0 mb-6 font-mono text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-[#a1a1aa]">
          Work <span className="ml-1">{String(workEntries.length).padStart(2, "0")}</span>
        </h3>

        <ol className="relative m-0 list-none p-0 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-black/[0.08] before:content-[''] dark:before:bg-white/[0.07]">
          {workEntries.map((exp, index) => (
            <WorkItem key={exp.id ?? index} exp={exp} index={index} />
          ))}
        </ol>

        {educationEntries.length > 0 && (
          <div className="mt-16">
            <h3 className="m-0 mb-4 font-mono text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-[#a1a1aa]">
              Education
            </h3>
            <ul className="m-0 grid list-none gap-x-8 gap-y-6 p-0 sm:grid-cols-2">
              {educationEntries.map((edu, index) => (
                <li
                  key={edu.id ?? index}
                  className="min-w-0 border-t border-black/[0.08] pt-4 dark:border-white/[0.07]"
                >
                  <span
                    className="block font-mono text-xs tracking-wide text-gray-500 dark:text-[#a1a1aa]"
                    suppressHydrationWarning
                  >
                    {edu.date}
                  </span>
                  <h4 className="m-0 mt-1.5 text-base font-semibold leading-snug text-gray-900 dark:text-white">
                    {edu.title}
                  </h4>
                  <p className="m-0 mt-0.5 text-sm font-medium text-amber-700 dark:text-[#f5c518]">{edu.company}</p>
                  {edu.description && (
                    <p className="m-0 mt-2 line-clamp-2 max-w-[70ch] text-sm leading-[1.6] text-gray-600 dark:text-[#c9c9cf]">
                      {edu.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

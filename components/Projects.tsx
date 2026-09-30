"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLock } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import SectionHeading from "./SectionHeading";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

type Project = (typeof projectsData)[number];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const featured = projectsData.filter((p) => p.featured);
const archive = projectsData.filter((p) => !p.featured);

const FILTERS = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI & Agents" },
  { value: "tool", label: "Tools & CLI" },
  { value: "web", label: "Web" },
] as const;
type FilterValue = (typeof FILTERS)[number]["value"];

const isPrivate = (p: Project) => "private" in p && p.private === true;
const yearOf = (p: Project) => p.date.slice(0, 4);
const isNpm = (url: string) => url.includes("npmjs.com");
const primaryUrl = (p: Project) => p.code ?? p.live ?? undefined;

const pressable =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#09090b] active:scale-[0.97]";

/* ─── Featured ─────────────────────────────────────────────────────────── */

function FeaturedLinks({ project }: { project: Project }) {
  const { title, code, live } = project;

  if (isPrivate(project)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-[#a1a1aa]">
        <FaLock size={10} aria-hidden="true" /> Private work project · details on request
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {code && (
        <a
          href={code}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} source code on GitHub`}
          className={`inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-[#FFD700] dark:text-[#1a1500] ${pressable}`}
          style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease" }}
        >
          <FaGithub size={12} aria-hidden="true" /> GitHub
        </a>
      )}
      {live && (
        <a
          href={live}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title}, ${isNpm(live) ? "npm package" : "live demo"}`}
          className={`inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10 ${pressable}`}
          style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease" }}
        >
          {isNpm(live) ? "npm" : "Live"} <MdArrowOutward size={12} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const { title, description, tags, imageUrl } = project;
  const privateWork = isPrivate(project);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.35, delay: (index % 3) * 0.06, ease: EASE_OUT }}
      className={`group flex flex-col overflow-hidden rounded-2xl border [@media(hover:hover)]:hover:-translate-y-0.5
        ${privateWork
          ? "border-[#FFD700]/25 bg-[#FFD700]/[0.05] dark:border-[#FFD700]/[0.14] dark:bg-[#FFD700]/[0.03]"
          : "border-black/[0.08] bg-white dark:border-white/[0.07] dark:bg-[#101015]"
        }`}
      style={{ transition: "transform 220ms cubic-bezier(0.23,1,0.32,1), border-color 200ms ease" }}
    >
      {imageUrl && (
        <div className="relative h-44 w-full shrink-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt={`${title} screenshot`}
            fill
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.14em]">
          <span className="tabular-nums text-gray-500 dark:text-[#a1a1aa]">{String(index + 1).padStart(2, "0")}</span>
          <span
            className={`rounded-full px-2.5 py-0.5 ${
              privateWork
                ? "bg-[#FFD700]/15 text-[#6b561d] dark:text-[#f5c518]"
                : "bg-black/[0.05] text-gray-600 dark:bg-white/[0.08] dark:text-[#d4d4d8]"
            }`}
          >
            {privateWork ? "Work · Draup" : "Open source"}
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-snug text-gray-900 dark:text-white">{title}</h3>

        <p className="flex-1 text-sm leading-relaxed text-gray-600 dark:text-[#c9c9cf]">{description}.</p>

        <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded bg-black/[0.05] px-2 py-0.5 font-mono text-xs text-gray-700 dark:bg-white/[0.07] dark:text-[#d4d4d8]"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="pt-1">
          <FeaturedLinks project={project} />
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Archive index ────────────────────────────────────────────────────── */

function IndexRow({ project }: { project: Project }) {
  const { title, description, tags, live } = project;
  const href = primaryUrl(project);

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
      className="group relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-black/[0.08] px-3 py-4 dark:border-white/[0.07] sm:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,14rem)_4.5rem] sm:items-baseline sm:gap-x-6 [@media(hover:hover)]:hover:bg-black/[0.025] dark:[@media(hover:hover)]:hover:bg-white/[0.03]"
      style={{ transition: "background-color 150ms ease" }}
    >
      <span className="row-span-2 font-mono text-xs tabular-nums text-gray-500 dark:text-[#a1a1aa] sm:row-span-1">
        {yearOf(project)}
      </span>

      <div className="min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {href ? (
            // Stretched link: the whole row opens the repo; secondary links sit above it.
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-2 focus-visible:ring-[#f5c518]"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-[#c9c9cf]">{description}.</p>
      </div>

      <p className="col-start-2 font-mono text-xs leading-relaxed text-gray-500 dark:text-[#a1a1aa] sm:col-start-auto">
        {tags.slice(0, 3).join(" · ")}
      </p>

      <div className="col-start-2 flex items-center gap-3 sm:col-start-auto sm:justify-end">
        {live && (
          <a
            href={live}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${title}, ${isNpm(live) ? "npm package" : "live demo"}`}
            className="relative z-10 rounded-sm text-xs font-medium text-amber-700 underline-offset-4 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] dark:text-[#f5c518]"
          >
            {isNpm(live) ? "npm" : "Live"}
          </a>
        )}
        {href && (
          <MdArrowOutward
            aria-hidden="true"
            className="text-gray-400 dark:text-[#71717a] [@media(hover:hover)]:group-hover:-translate-y-0.5 [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:text-gray-900 dark:[@media(hover:hover)]:group-hover:text-white"
            style={{ transition: "transform 180ms cubic-bezier(0.23,1,0.32,1), color 150ms ease" }}
          />
        )}
      </div>
    </motion.li>
  );
}

function ProjectIndex() {
  const [filter, setFilter] = useState<FilterValue>("all");

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = { all: archive.length, ai: 0, tool: 0, web: 0 };
    for (const p of archive) {
      for (const f of ["ai", "tool", "web"] as const) if (p.categories.includes(f)) c[f]++;
    }
    return c;
  }, []);

  const visible = filter === "all" ? archive : archive.filter((p) => p.categories.includes(filter));

  return (
    <div className="mx-auto mt-20 max-w-5xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Project index</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-[#a1a1aa]">Open-source tools, MCP servers, and experiments.</p>
        </div>

        <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-1.5">
          {FILTERS.map(({ value, label }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={active}
                disabled={counts[value] === 0}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium disabled:opacity-40 ${pressable}
                  ${active
                    ? "border-gray-900 bg-gray-900 text-white dark:border-[#FFD700] dark:bg-[#FFD700] dark:text-[#1a1500]"
                    : "border-black/[0.1] text-gray-700 hover:border-black/25 dark:border-white/[0.1] dark:text-[#d4d4d8] dark:hover:border-white/25"
                  }`}
                style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease, border-color 150ms ease, color 150ms ease" }}
              >
                {label}
                <span className={`font-mono text-xs tabular-nums ${active ? "opacity-80" : "text-gray-500 dark:text-[#a1a1aa]"}`}>
                  {counts[value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hidden grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,14rem)_4.5rem] gap-x-6 border-b border-black/[0.12] px-3 pb-2 font-mono text-xs uppercase tracking-[0.14em] text-gray-500 dark:border-white/[0.12] dark:text-[#a1a1aa] sm:grid"
      >
        <span>Year</span>
        <span>Project</span>
        <span>Stack</span>
        <span className="text-right">Link</span>
      </div>

      <ul aria-live="polite" className="border-t border-black/[0.08] dark:border-white/[0.07] sm:border-t-0">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((project) => (
            <IndexRow key={project.title} project={project} />
          ))}
        </AnimatePresence>
      </ul>

      <p className="mt-6 text-sm text-gray-600 dark:text-[#a1a1aa]">
        Everything else lives on{" "}
        <a
          href="https://github.com/selvin-paul-raj?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm font-medium text-gray-900 underline decoration-[#FFD700] underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-[#f5c518] dark:text-white"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}

/* ─── Section ──────────────────────────────────────────────────────────── */

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.1);

  return (
    <section ref={ref} id="projects" className="mb-28 w-full max-w-6xl mx-auto scroll-mt-28 px-4">
      <SectionHeading kicker="Production agent systems from my work at Draup, plus the open-source tools I build on the side.">
        Projects
      </SectionHeading>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((project, i) => (
          <FeaturedCard key={project.title} project={project} index={i} />
        ))}
      </div>

      {archive.length > 0 && <ProjectIndex />}
    </section>
  );
}

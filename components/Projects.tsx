"use client";

import { useMemo, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { MdArrowOutward } from "react-icons/md";
import SectionHeading from "./SectionHeading";
import FeaturedExplorer from "./projects/FeaturedExplorer";
import { isNpm, primaryUrl, yearOf, type Project } from "./projects/meta";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";


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

const pressable =
  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#09090b] active:scale-[0.97]";

/* ─── Archive index ────────────────────────────────────────────────────── */

function IndexRow({ project }: { project: Project }) {
  const { title, description, tags, live } = project;
  const href = primaryUrl(project);

  return (
    <m.li
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
              className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-2 focus-visible:ring-accent"
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
            className="relative z-10 rounded-sm text-xs font-medium text-amber-700 underline-offset-4 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-accent"
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
    </m.li>
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
                    ? "border-gray-900 bg-gray-900 text-white dark:border-accent dark:bg-accent dark:text-[#1a1500]"
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
          className="rounded-sm font-medium text-gray-900 underline decoration-accent underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-accent dark:text-white"
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
      <SectionHeading kicker="Production agent systems from my work at Draup, plus personal projects, some open source and some kept private.">
        Projects
      </SectionHeading>

      <FeaturedExplorer projects={featured} />

      {archive.length > 0 && <ProjectIndex />}
    </section>
  );
}

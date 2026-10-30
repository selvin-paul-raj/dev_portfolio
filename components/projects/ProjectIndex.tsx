"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FaGithub, FaLock } from "react-icons/fa";
import { LuSearch, LuX } from "react-icons/lu";
import { MdArrowOutward } from "react-icons/md";
import { caseStudySlugByProject } from "@/lib/work";
import { isNpm, isPrivate, yearOf, type Project } from "./meta";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI and agents" },
  { value: "tool", label: "Tools and CLI" },
  { value: "web", label: "Web" },
] as const;
type FilterValue = (typeof FILTERS)[number]["value"];

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#09090b]";
const ICON_LINK =
  `relative z-10 inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm ` +
  `text-fg-2 hover:border-line-strong hover:text-fg transition-colors duration-150 ${FOCUS}`;

const matches = (p: Project, q: string) =>
  !q || [p.title, p.description, ...p.tags].join(" ").toLowerCase().includes(q);

/** Where a click on the row goes: the repo, else the live site, else the case study. */
function primaryHref(p: Project): string | undefined {
  const slug = caseStudySlugByProject[p.title];
  return p.code ?? p.live ?? (slug ? `/work/${slug}` : undefined);
}

function RowLinks({ project }: { project: Project }) {
  const { title, code, live } = project;
  const slug = caseStudySlugByProject[title];
  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      {slug && (
        <Link href={`/work/${slug}`} aria-label={`${title} case study`} className={ICON_LINK}>
          How it works
        </Link>
      )}
      {code && (
        <a href={code} target="_blank" rel="noopener noreferrer" aria-label={`${title} source code on GitHub`} title="Source on GitHub" className={`${ICON_LINK} w-9 justify-center px-0`}>
          <FaGithub size={15} aria-hidden="true" />
        </a>
      )}
      {live && (
        <a href={live} target="_blank" rel="noopener noreferrer" aria-label={`${title}, ${isNpm(live) ? "npm package" : "live demo"}`} className={ICON_LINK}>
          {isNpm(live) ? "npm" : "Live"} <MdArrowOutward size={14} aria-hidden="true" />
        </a>
      )}
      {isPrivate(project) && !code && !live && (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
          <FaLock size={11} aria-hidden="true" /> Private
        </span>
      )}
    </div>
  );
}

function IndexRow({ project }: { project: Project }) {
  const href = primaryHref(project);
  const external = href?.startsWith("http");
  return (
    <li className="group relative grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-3 rounded-lg px-3 py-4
      hover:bg-black/[0.025] dark:hover:bg-white/[0.03] transition-colors duration-150">
      <div className="min-w-0">
        <h5 className="text-base font-medium text-fg">
          {href ? (
            // Stretched link: the whole row opens the project; the links on the right sit above it.
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:ring-2 focus-visible:ring-accent"
            >
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h5>
        <p className="mt-1 line-clamp-2 max-w-[68ch] text-sm leading-relaxed text-fg-2">{project.description}.</p>
        <p className="mt-1.5 text-xs text-muted">{project.tags.slice(0, 4).join(", ")}</p>
      </div>
      <RowLinks project={project} />
    </li>
  );
}

/** One year: the numeral stays pinned beside its projects while they scroll past. */
function YearGroup({ year, projects }: { year: string; projects: Project[] }) {
  return (
    <section aria-labelledby={`index-${year}`} className="grid grid-cols-1 lg:grid-cols-[9rem_minmax(0,1fr)] gap-x-8 border-t border-line pt-4">
      <div className="lg:sticky lg:top-24 self-start px-3 lg:px-0 pb-2">
        <h4 id={`index-${year}`} className="text-4xl lg:text-5xl font-semibold tracking-[-0.03em] tabular-nums text-muted">
          {year}
        </h4>
        <p className="mt-1 text-sm text-muted">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
      </div>
      <ul className="divide-y divide-line">
        {projects.map((p) => (
          <IndexRow key={p.title} project={p} />
        ))}
      </ul>
    </section>
  );
}

function Toolbar({
  query,
  onQuery,
  filter,
  onFilter,
  counts,
  total,
}: {
  query: string;
  onQuery: (q: string) => void;
  filter: FilterValue;
  onFilter: (f: FilterValue) => void;
  counts: Record<FilterValue, number>;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-1.5">
        {FILTERS.map(({ value, label }) => {
          const on = filter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onFilter(value)}
              aria-pressed={on}
              disabled={counts[value] === 0}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium disabled:opacity-40 transition-colors duration-150 ${FOCUS}
 ${on
 ? "border-gray-900 bg-gray-900 text-white dark:border-accent dark:bg-accent dark:text-[#1a1500]"
 : "border-line text-fg-2 hover:border-line-strong "}`}
            >
              {label}
              <span className={`text-xs tabular-nums ${on ? "opacity-80" : "text-muted "}`}>{counts[value]}</span>
            </button>
          );
        })}
      </div>
      <div className="relative sm:w-64">
        <label htmlFor="project-search" className="sr-only">Search projects</label>
        <LuSearch size={15} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="project-search"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={`Search ${total} projects`}
          className="h-10 w-full rounded-full border border-black/15 dark:border-white/15 bg-white dark:bg-white/[0.04] pl-9 pr-9 text-base sm:text-sm
            text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <LuX size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProjectIndex({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = { all: projects.length, ai: 0, tool: 0, web: 0 };
    for (const p of projects) for (const f of ["ai", "tool", "web"] as const) if (p.categories.includes(f)) c[f]++;
    return c;
  }, [projects]);

  const q = query.trim().toLowerCase();
  const visible = projects.filter((p) => (filter === "all" || p.categories.includes(filter)) && matches(p, q));
  const years = [...new Set(visible.map(yearOf))].sort().reverse();
  const byYear = (y: string) => visible.filter((p) => yearOf(p) === y).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto mt-24 max-w-5xl">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-fg">Project index</h3>
        <p className="mt-1 text-sm text-fg-2">
          {projects.length} more: open-source tools, MCP servers and experiments, newest first.
        </p>
      </div>

      <Toolbar query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} counts={counts} total={projects.length} />

      <p role="status" className="sr-only">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>

      {visible.length > 0 ? (
        <div key={filter} className="anim-detail-in mt-8 flex flex-col gap-10">
          {years.map((y) => (
            <YearGroup key={y} year={y} projects={byYear(y)} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="text-base font-medium text-fg">No projects match{q ? ` "${query.trim()}"` : ""}.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className={`mt-3 text-sm font-medium text-accent-fg underline underline-offset-4 rounded-sm ${FOCUS}`}
          >
            Clear filters
          </button>
        </div>
      )}

      <p className="mt-10 text-sm text-fg-2">
        Everything else lives on{" "}
        <a
          href="https://github.com/selvin-paul-raj?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm font-medium text-fg underline decoration-accent underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-accent "
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}

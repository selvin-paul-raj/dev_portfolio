"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import { FaGithub, FaLock } from "react-icons/fa";
import { LuArrowRight } from "react-icons/lu";
import { MdArrowOutward } from "react-icons/md";
import { caseStudySlugByProject, getCaseStudy } from "@/lib/work";
import { isNpm, isPrivate, isWork, kindOf, yearOf, type Project } from "./meta";

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#101015]";
const SECONDARY_BTN =
  `inline-flex h-10 items-center gap-1.5 rounded-full border border-black/15 dark:border-white/15 px-4 text-sm font-medium ` +
  `text-gray-800 dark:text-white/85 hover:border-black/30 dark:hover:border-white/35 transition-colors duration-150 ${FOCUS}`;

function ProjectActions({ project }: { project: Project }) {
  const { title, code, live } = project;
  const slug = caseStudySlugByProject[title];
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {slug && (
        <Link
          href={`/work/${slug}`}
          aria-label={`${title} case study`}
          className={`inline-flex h-10 items-center gap-1.5 rounded-full bg-gray-900 dark:bg-accent px-4 text-sm font-semibold text-white dark:text-[#1a1500] ${FOCUS}`}
        >
          How it works <LuArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
      {!isPrivate(project) && code && (
        <a href={code} target="_blank" rel="noopener noreferrer" aria-label={`${title} source code on GitHub`} className={SECONDARY_BTN}>
          <FaGithub size={14} aria-hidden="true" /> GitHub
        </a>
      )}
      {live && (
        <a
          href={live}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title}, ${isNpm(live) ? "npm package" : isPrivate(project) ? "live site" : "live demo"}`}
          className={SECONDARY_BTN}
        >
          {isNpm(live) ? "npm" : "Live"} <MdArrowOutward size={14} aria-hidden="true" />
        </a>
      )}
      {isPrivate(project) && (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-white/55">
          <FaLock size={11} aria-hidden="true" />
          {isWork(project) ? (slug ? "Private repo" : "Private repo, details on request") : "Private repo"}
        </span>
      )}
    </div>
  );
}

/** One project, opened: what it measured, what it is, what it's built with. */
function ProjectDetail({ project }: { project: Project }) {
  const slug = caseStudySlugByProject[project.title];
  const results = (slug && getCaseStudy(slug)?.results.slice(0, 3)) || [];

  return (
    <div className="anim-detail-in flex flex-col gap-6">
      <p className="text-sm text-gray-600 dark:text-white/55">
        <span className={isWork(project) ? "font-medium text-amber-700 dark:text-accent" : "font-medium text-gray-800 dark:text-white/80"}>
          {kindOf(project)}
        </span>
        , {yearOf(project)}
      </p>
      <h3 className="text-2xl sm:text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] text-gray-900 dark:text-white text-balance">
        {project.title}
      </h3>

      {results.length > 0 && (
        <dl className="grid grid-cols-3 border-y border-black/[0.08] dark:border-white/[0.08]">
          {results.map((r, i) => (
            <div
              key={r.label}
              className={`min-w-0 flex flex-col-reverse justify-end gap-1.5 py-4 ${i > 0 ? "pl-4 border-l border-black/[0.08] dark:border-white/[0.08]" : ""} pr-3`}
            >
              <dt className="text-xs leading-snug text-gray-600 dark:text-white/55">{r.label}</dt>
              <dd className="m-0 text-xl sm:text-2xl font-semibold tabular-nums tracking-[-0.02em] text-gray-900 dark:text-white whitespace-nowrap">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <p className="text-[15px] leading-relaxed text-gray-600 dark:text-[#c9c9cf] max-w-[65ch]">{project.description}.</p>

      <ul aria-label="Tech stack" className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <li key={tag} className="rounded-full border border-black/[0.08] dark:border-white/[0.1] px-2.5 py-1 font-mono text-xs text-gray-700 dark:text-[#d4d4d8]">
            {tag}
          </li>
        ))}
      </ul>

      <ProjectActions project={project} />
    </div>
  );
}

/**
 * Featured work as a list and an open detail panel. Hover (after a short pause), click or
 * the arrow keys pick a project; on phones the detail opens under its row instead.
 */
export default function FeaturedExplorer({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const onKey = (e: KeyboardEvent, i: number) => {
    const last = projects.length - 1;
    const next = { ArrowDown: Math.min(i + 1, last), ArrowUp: Math.max(i - 1, 0), Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  // On phones the open detail sits under its row; when the one above collapses, keep the
  // tapped row in view instead of letting the page jump.
  const pick = (i: number) => {
    setActive(i);
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    requestAnimationFrame(() => buttons.current[i]?.scrollIntoView({ block: "nearest" }));
  };

  // Desktop hover previews a project, but only after the pointer settles, so sweeping
  // across the list on the way to the panel doesn't flip through every row.
  const onHover = (e: PointerEvent, i: number) => {
    if (e.pointerType !== "mouse" || !window.matchMedia("(min-width: 1024px)").matches) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActive(i), 140);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-12 items-start">
      <ol className="border-t border-black/[0.08] dark:border-white/[0.08]" onPointerLeave={() => clearTimeout(hoverTimer.current)}>
        {projects.map((p, i) => {
          const on = i === active;
          return (
            <li key={p.title} className="border-b border-black/[0.08] dark:border-white/[0.08]">
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                aria-pressed={on}
                onClick={() => pick(i)}
                onKeyDown={(e) => onKey(e, i)}
                onPointerEnter={(e) => onHover(e, i)}
                className={`group grid w-full grid-cols-[2.25rem_minmax(0,1fr)_1rem] items-center gap-3 px-3 py-4 text-left rounded-lg
                  transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent
                  ${on ? "bg-black/[0.04] dark:bg-white/[0.05]" : "hover:bg-black/[0.025] dark:hover:bg-white/[0.03]"}`}
              >
                <span className={`font-mono text-xs tabular-nums ${on ? "text-amber-700 dark:text-accent" : "text-gray-500 dark:text-white/45"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className={`block lg:truncate text-base font-medium ${on ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-white/75"}`}>
                    {p.title}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-white/45">
                    {kindOf(p)}, {yearOf(p)}
                  </span>
                </span>
                <LuArrowRight
                  size={16}
                  aria-hidden="true"
                  className={`transition-opacity duration-150 text-amber-700 dark:text-accent ${on ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                />
              </button>
              {on && (
                <div className="lg:hidden px-3 pt-2 pb-8">
                  <ProjectDetail project={p} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="hidden lg:block lg:sticky lg:top-24">
        <div aria-live="polite" className="min-h-[32rem] rounded-2xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#101015] p-8">
          <ProjectDetail key={active} project={projects[active]} />
        </div>
      </div>
    </div>
  );
}

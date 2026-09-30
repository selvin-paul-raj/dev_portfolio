"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaGithub, FaLock } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import SectionHeading from "./SectionHeading";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

type Project = (typeof projectsData)[number];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const featured = projectsData.filter((p) => p.featured);
const archive = projectsData.filter((p) => !p.featured);

const isPrivate = (p: Project) => "private" in p && p.private === true;

function liveLabel(url: string) {
  return url.includes("npmjs.com") ? "npm" : "Live";
}

function ProjectLinks({ project, compact = false }: { project: Project; compact?: boolean }) {
  const { title, code, live } = project;

  if (isPrivate(project)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-white/55">
        <FaLock size={10} aria-hidden="true" /> Private work project · details on request
      </span>
    );
  }

  const base = compact
    ? "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-700 dark:text-white/70 hover:bg-black/[0.05] dark:hover:bg-white/10"
    : "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold";

  return (
    <div className="flex items-center gap-2">
      {code && (
        <a
          href={code}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} source code on GitHub`}
          className={
            compact
              ? base
              : `${base} bg-gray-900 text-white dark:bg-[#FFD700] dark:text-black hover:opacity-90 active:scale-[0.96]`
          }
          style={{ transition: "opacity 150ms ease, background-color 150ms ease, transform 120ms cubic-bezier(0.23,1,0.32,1)" }}
        >
          <FaGithub size={12} aria-hidden="true" /> {compact ? <span className="sr-only sm:not-sr-only">Code</span> : "GitHub"}
        </a>
      )}
      {live && (
        <a
          href={live}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} — ${liveLabel(live) === "npm" ? "npm package" : "live demo"}`}
          className={
            compact
              ? base
              : `${base} border border-black/10 bg-white dark:border-white/10 dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/15 active:scale-[0.96]`
          }
          style={{ transition: "background-color 150ms ease, transform 120ms cubic-bezier(0.23,1,0.32,1)" }}
        >
          {liveLabel(live)} <MdArrowOutward size={12} aria-hidden="true" />
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
      className={`group flex flex-col overflow-hidden rounded-2xl border
        ${privateWork
          ? "border-[#FFD700]/20 bg-[#FFD700]/[0.04] dark:border-[#FFD700]/15 dark:bg-[#FFD700]/[0.03]"
          : "border-black/5 bg-gray-50 dark:border-white/10 dark:bg-white/[0.04]"
        }`}
    >
      {imageUrl && (
        <div className="relative h-44 w-full shrink-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt={`${title} screenshot`}
            fill
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105"
            style={{ transition: "transform 500ms cubic-bezier(0.23,1,0.32,1)" }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.14em]">
          <span className="text-gray-500 dark:text-white/45 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 ${
              privateWork
                ? "bg-[#FFD700]/15 text-[#7a6322] dark:text-[#FFD700]/85"
                : "bg-black/[0.05] text-gray-600 dark:bg-white/10 dark:text-white/60"
            }`}
          >
            {privateWork ? "Work · Draup" : "Open source"}
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-snug text-gray-900 dark:text-white/90">{title}</h3>

        <p className="flex-1 text-sm leading-relaxed text-gray-600 dark:text-white/60">{description}.</p>

        <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm bg-black/[0.06] px-2 py-0.5 font-mono text-[0.7rem] tracking-wide text-gray-700 dark:bg-white/10 dark:text-white/70"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="pt-1">
          <ProjectLinks project={project} />
        </div>
      </div>
    </motion.article>
  );
}

function ArchiveRow({ project }: { project: Project }) {
  const { title, description, tags } = project;

  return (
    <li className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <div className="min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white/85">{title}</h4>
        <p className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-white/55">{description}.</p>
        <p className="mt-1.5 font-mono text-xs text-gray-500 dark:text-white/40">{tags.slice(0, 4).join(" · ")}</p>
      </div>
      <ProjectLinks project={project} compact />
    </li>
  );
}

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.1);

  return (
    <section ref={ref} id="projects" className="mb-28 w-full max-w-6xl mx-auto scroll-mt-28 px-4">
      <SectionHeading>Projects</SectionHeading>
      <p className="mx-auto -mt-4 mb-10 max-w-xl text-center text-sm text-gray-600 dark:text-white/55">
        Selected work in agentic AI, MCP tooling, and developer tools.
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((project, i) => (
          <FeaturedCard key={project.title} project={project} index={i} />
        ))}
      </div>

      {archive.length > 0 && (
        <div className="mx-auto mt-16 max-w-4xl">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-white/45">
            More projects
          </h3>
          <ul className="divide-y divide-black/[0.07] border-y border-black/[0.07] dark:divide-white/[0.08] dark:border-white/[0.08]">
            {archive.map((project) => (
              <ArchiveRow key={project.title} project={project} />
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-white/55">
            Everything else lives on{" "}
            <a
              href="https://github.com/selvin-paul-raj?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4 decoration-[#FFD700] hover:decoration-2 dark:text-white/85"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      )}
    </section>
  );
}

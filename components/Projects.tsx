"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import SectionHeading from "./SectionHeading";
import Pagination from "./Pagination";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "AI & Agents", value: "ai" },
  { label: "Web", value: "web" },
  { label: "Tools & CLI", value: "tool" },
  { label: "Apps", value: "app" },
] as const;

const PAGE_SIZE = 9;

type Project = (typeof projectsData)[number];

function ProjectCard({ title, description, tags, imageUrl, live, code }: Project) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl overflow-hidden flex flex-col hover:shadow-xl dark:hover:bg-white/[0.08] group active:scale-[0.98]"
      style={{
        transition:
          "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 250ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease",
      }}
    >
      {imageUrl ? (
        <div className="relative w-full h-44 overflow-hidden shrink-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            quality={80}
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105"
            style={{ transition: "transform 500ms cubic-bezier(0.23,1,0.32,1)" }}
          />
        </div>
      ) : (
        <div className="w-full h-28 shrink-0 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 flex items-center justify-center">
          <span className="text-4xl opacity-20 select-none">⚡</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-semibold text-base line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-white/55 line-clamp-3 flex-1 leading-relaxed">
          {description}
        </p>

        <ul className="flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((tag) => (
            <li
              key={tag}
              className="font-mono bg-black/[0.7] dark:bg-white/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-white dark:text-white/65 rounded-sm"
            >
              {tag}
            </li>
          ))}
          {tags.length > 4 && (
            <li className="font-mono px-1 py-0.5 text-[0.6rem] text-gray-400 dark:text-white/25 self-center">
              +{tags.length - 4}
            </li>
          )}
        </ul>

        <div className="flex gap-2 pt-0.5">
          <a
            href={code}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${title} source code on GitHub`}
            className="flex items-center gap-1.5 text-xs font-semibold bg-gray-900 dark:bg-[#FFD700] text-white dark:text-black px-3 py-1.5 rounded-md hover:opacity-90 active:scale-[0.96]"
            style={{
              transition: "opacity 150ms ease, transform 120ms cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            <FaGithub size={12} /> GitHub
          </a>
          {live ? (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} live demo`}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-md active:scale-[0.96]"
              style={{
                transition:
                  "background-color 150ms ease, transform 120ms cubic-bezier(0.23,1,0.32,1)",
              }}
            >
              Live <MdArrowOutward size={12} />
            </a>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-md opacity-35 cursor-not-allowed select-none">
              No Demo
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}


export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.1);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [prevCategory, setPrevCategory] = useState<string>("all");

  // Adjust during render when category changes — avoids useEffect
  if (prevCategory !== activeCategory) {
    setPrevCategory(activeCategory);
    setCurrentPage(1);
  }

  const filtered = projectsData.filter((p) =>
    activeCategory === "all"
      ? true
      : (p.categories as readonly string[]).includes(activeCategory)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    // Smooth scroll to section top
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={ref}
      id="projects"
      className="scroll-mt-28 mb-28 w-full max-w-6xl mx-auto px-4"
    >
      <SectionHeading>My Projects</SectionHeading>

      {/* Category filter */}
      <div
        className="flex flex-wrap justify-center gap-2 mb-10"
        role="group"
        aria-label="Filter projects by category"
      >
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            aria-pressed={activeCategory === value}
            className={`px-4 py-1.5 rounded-full text-sm font-medium outline-none
              focus-visible:ring-2 focus-visible:ring-[#FFD700]/60
              ${
                activeCategory === value
                  ? "bg-gray-900 text-white dark:bg-[#FFD700] dark:text-black shadow-sm"
                  : "bg-white text-gray-600 border border-black/8 dark:bg-white/5 dark:text-white/55 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
              }`}
            style={{ transition: "background-color 150ms ease, color 150ms ease" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-center font-mono text-xs text-gray-400 dark:text-white/25 mb-7">
        {filtered.length} projects &nbsp;·&nbsp; page {currentPage} of {totalPages}
      </p>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${currentPage}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {visible.map((project) => (
            <ProjectCard key={`${project.title}-${project.date}`} {...project} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={handlePageChange}
        variant="square"
      />
    </section>
  );
}

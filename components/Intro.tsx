"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BsArrowRight } from "react-icons/bs";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { FaHackerrank } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { SiLeetcode, SiKaggle } from "react-icons/si";
import HeroImg from "../public/Selvin_PaulRaj.webp";

import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import { projectsData, experienceMetrics } from "@/lib/data";

const DeepMlIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="2.5"  cy="6.5"  r="1.7" fill="currentColor" opacity="0.75"/>
    <circle cx="2.5"  cy="13.5" r="1.7" fill="currentColor" opacity="0.75"/>
    <circle cx="10"   cy="3.5"  r="1.7" fill="currentColor"/>
    <circle cx="10"   cy="10"   r="1.7" fill="currentColor"/>
    <circle cx="10"   cy="16.5" r="1.7" fill="currentColor"/>
    <circle cx="17.5" cy="10"   r="1.7" fill="currentColor" opacity="0.9"/>
    <line x1="4.2"  y1="6.5"  x2="8.3"  y2="3.5"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="6.5"  x2="8.3"  y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="6.5"  x2="8.3"  y2="16.5" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3"  y2="3.5"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3"  y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3"  y2="16.5" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="3.5"  x2="15.8" y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="10"   x2="15.8" y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="16.5" x2="15.8" y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
  </svg>
);

const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/in/selvinpaulraj", icon: <FaLinkedin size={17} />, label: "LinkedIn" },
  { href: "https://github.com/selvin-paul-raj", icon: <FaGithub size={17} />, label: "GitHub" },
  { href: "https://www.hackerrank.com/profile/selvinpaulraj", icon: <FaHackerrank size={17} />, label: "HackerRank" },
  { href: "https://leetcode.com/u/selvinpaulraj/", icon: <SiLeetcode size={17} />, label: "LeetCode" },
  { href: "https://www.kaggle.com/selvinpaulrajk", icon: <SiKaggle size={17} />, label: "Kaggle" },
  { href: "https://www.deep-ml.com/profile/fdmYEE5bBFgqLwHxlBFW1lgLUR22", icon: <DeepMlIcon size={17} />, label: "deep-ml" },
];

const PERSONALITY_TAGS = ["Technical", "Precise", "Open Source", "Problem Solver"];

const TECH_BADGES = [
  "LangGraph", "MCP", "RAG", "LangChain", "Python",
  "CrewAI", "FastAPI", "Next.js", "FAISS", "OpenAI",
];

const _projectCount = projectsData.length;

const _fmtDur = (n: number) => {
  const y = Math.floor(n / 12);
  const m = n % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
};

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setTime(`${h}:${m < 10 ? "0" : ""}${m} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="w-full max-w-5xl mx-auto px-4 mb-16 scroll-mt-[100rem] md:pt-8"
    >
      {/* Mobile-only status pill */}
      <div className="anim-fade-up anim-d0 lg:hidden flex items-center justify-center gap-2 mb-5 font-mono text-xs text-gray-500 dark:text-white/30">
        <span className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.05] border border-black/6 dark:border-white/8 rounded-full px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Chennai, India &nbsp;·&nbsp; {time}
        </span>
      </div>

      {/* Main hero row */}
      <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start gap-6 lg:gap-16 mb-14">

        {/* Left: text */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* Desktop status pill */}
          <div className="anim-fade-up anim-d0 hidden lg:flex items-center gap-2 mb-5 font-mono text-xs text-gray-500 dark:text-white/30 bg-black/[0.04] dark:bg-white/[0.05] border border-black/6 dark:border-white/8 rounded-full px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Chennai, India &nbsp;·&nbsp; {time}
          </div>

          {/* Name */}
          <h1 className="anim-fade-up anim-d1 text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-3">
            Selvin{" "}
            <span className="text-gray-500 dark:text-white/35">PaulRaj K</span>
            {/* Role — kept inside the H1 so search engines see the role keyword, styled identically to the old sibling <p> */}
            <span className="anim-fade-up anim-d2 block font-mono text-sm sm:text-[0.9rem] font-normal normal-case tracking-wide text-[#9a7d2a] dark:text-[#FFD700]/65 mt-3">
              AI Engineer &nbsp;·&nbsp; MCP &nbsp;·&nbsp; Agentic Systems &nbsp;·&nbsp; RAG &nbsp;·&nbsp; LangGraph
            </span>
          </h1>

          {/* Personality tags */}
          <div className="anim-fade-up anim-d2 flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
            {PERSONALITY_TAGS.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-3 py-1 rounded-full tracking-[0.12em] uppercase
                  bg-[#FFD700]/[0.08] dark:bg-[#FFD700]/10
                  border border-[#FFD700]/20 dark:border-[#FFD700]/25
                  text-[#9a7d2a] dark:text-[#FFD700]/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Mobile inline stats */}
          <div className="anim-fade-up anim-d3 lg:hidden flex items-center justify-center gap-3 mt-1 mb-5 font-mono">
            <span className="text-lg font-bold text-gray-900 dark:text-white/90 tabular-nums">
              {_projectCount}+
            </span>
            <span className="text-[0.58rem] uppercase tracking-[0.15em] text-gray-500 dark:text-white/30">Projects</span>
            <span className="w-px h-3.5 bg-black/10 dark:bg-white/10" />
            <span className="text-lg font-bold text-gray-900 dark:text-white/90 tabular-nums">
              {_fmtDur(experienceMetrics.totalMonths)}
            </span>
            <span className="text-[0.58rem] uppercase tracking-[0.15em] text-gray-500 dark:text-white/30">YOE</span>
          </div>

          {/* Bio */}
          <p className="anim-fade-up anim-d3 text-base text-gray-600 dark:text-white/50 leading-relaxed max-w-xl mb-3">
            I build intelligent{" "}
            <span className="text-gray-900 dark:text-white/80 font-medium">
              AI Agents, MCP servers, and multi-agent LangGraph pipelines
            </span>{" "}
            that turn complex problems into shipped products — backed by full-stack
            MERN/Next.js expertise and a Master&apos;s in Computer Science (AI).
          </p>

          {/* Secondary bio — hidden on mobile so the CTAs land above the fold */}
          <p className="anim-fade-up anim-d4 hidden sm:block text-sm text-gray-500 dark:text-white/40 leading-relaxed max-w-xl mb-7">
            At{" "}
            <span className="text-gray-700 dark:text-white/60 font-medium">Zinnov (Draup)</span>
            , I architect embedding-based classification models, multi-step job-role
            intelligence agents, and RAG pipelines that power Fortune 500 research.
            Open-source contributor: MCP servers, CLI agent systems, vector search tooling.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up anim-d5 flex flex-row gap-2.5 w-full sm:w-auto mb-7">
            <a
              href="#contact"
              onClick={() => { setActiveSection("Contact"); setTimeOfLastClick(Date.now()); }}
              className="flex-1 sm:flex-none group flex items-center justify-between gap-3
                pl-4 sm:pl-5 pr-1.5 py-1.5 rounded-full
                bg-gray-900 dark:bg-[#FFD700] text-white dark:text-black
                text-sm font-semibold tracking-wide active:scale-[0.97]
                outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2"
              style={{ transition: "opacity 150ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
            >
              <span className="whitespace-nowrap">Get in touch</span>
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full shrink-0
                  bg-white/15 dark:bg-black/15
                  group-hover:scale-110 group-hover:bg-white/25 dark:group-hover:bg-black/25"
                style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease" }}
              >
                <BsArrowRight size={13} />
              </span>
            </a>
            <a
              href="/Selvin_Resume.pdf"
              download
              className="flex-1 sm:flex-none group flex items-center justify-between gap-3
                pl-4 sm:pl-5 pr-1.5 py-1.5 rounded-full
                bg-white dark:bg-white/[0.06] border border-black/10 dark:border-white/10
                text-sm font-semibold tracking-wide text-gray-800 dark:text-white/75
                hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.97]
                outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2"
              style={{ transition: "background-color 150ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
            >
              <span className="whitespace-nowrap">Download CV</span>
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full
                  bg-black/[0.06] dark:bg-white/10
                  group-hover:scale-110 group-hover:bg-black/10 dark:group-hover:bg-white/15"
                style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease" }}
              >
                <HiDownload size={13} />
              </span>
            </a>
          </div>

          {/* Socials */}
          <div className="anim-fade-up anim-d6 flex flex-wrap items-center gap-2">
            {SOCIAL_LINKS.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex items-center justify-center w-10 h-10 rounded-full
                  bg-black/[0.05] dark:bg-white/[0.05] border border-black/8 dark:border-white/10
                  text-gray-500 dark:text-white/40
                  hover:text-gray-900 dark:hover:text-white/85 hover:scale-110 active:scale-[0.93]
                  outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-1"
                style={{ transition: "color 130ms ease, transform 150ms cubic-bezier(0.23,1,0.32,1)" }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Right: profile image with rotating ring */}
        <div className="anim-fade-in anim-d1 shrink-0">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
          >
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
              {/* Conic arc ring — 2px strip outside image edge; no mask needed, works in any bg */}
              <div
                className="absolute rounded-full"
                style={{
                  inset: "-2px",
                  animation: "ring-spin 5s linear infinite",
                  background:
                    "conic-gradient(from 0deg, #FFD700 0deg, #FFA500 40deg, transparent 90deg, transparent 300deg, #FFD700 360deg)",
                }}
              />
              {/* Image container clips gradient center — creates ring with no color dependency */}
              <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl">
                <Image
                  src={HeroImg}
                  alt="Selvin PaulRaj K — AI Engineer"
                  width={320}
                  height={320}
                  quality={75}
                  priority
                  sizes="(max-width: 640px) 208px, (max-width: 1024px) 256px, 320px"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Gold glow */}
              <div className="absolute inset-0 rounded-full bg-[#FFD700]/10 blur-2xl scale-110 -z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tech stack badges */}
      <div className="anim-fade-up anim-d8 hidden lg:flex flex-wrap justify-start gap-2 mb-4">
        <span className="font-mono text-[0.65rem] text-gray-500 dark:text-white/25 self-center mr-1 tracking-widest uppercase">
          Core stack
        </span>
        {TECH_BADGES.map((tech) => (
          <span
            key={tech}
            className="font-mono text-xs px-3 py-1 rounded-full
              bg-black/[0.05] dark:bg-white/[0.06] border border-black/8 dark:border-white/8
              text-gray-600 dark:text-white/50"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BsArrowRight } from "react-icons/bs";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { FaHackerrank } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { SiLeetcode } from "react-icons/si";
import dynamic from "next/dynamic";
import HeroImg from "../public/Selvin_PaulRaj.webp";

import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import { projectsData, experienceMetrics } from "@/lib/data";

const ParticleTextEffect = dynamic(
  () =>
    import("@/components/ui/particle-text-effect").then(
      (m) => ({ default: m.ParticleTextEffect })
    ),
  { ssr: false }
);


const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/selvinpaulraj",
    icon: <FaLinkedin size={17} />,
    label: "LinkedIn",
  },
  {
    href: "https://github.com/selvin-paul-raj",
    icon: <FaGithub size={17} />,
    label: "GitHub",
  },
  {
    href: "https://www.hackerrank.com/profile/selvinpaulraj",
    icon: <FaHackerrank size={17} />,
    label: "HackerRank",
  },
  {
    href: "https://leetcode.com/u/selvinpaulraj/",
    icon: <SiLeetcode size={17} />,
    label: "LeetCode",
  },
];

const _projectCount = projectsData.length;

function useCountUp(target: number, durationMs: number, trigger: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let rafId: number;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 4); // ease-out-quart
      setVal(Math.round(eased * target));
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs, trigger]);
  return val;
}

const _fmtDur = (n: number) => {
  const y = Math.floor(n / 12);
  const m = n % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
};

const TECH_BADGES = [
  "LangGraph",
  "MCP",
  "RAG",
  "LangChain",
  "Python",
  "CrewAI",
  "FastAPI",
  "Next.js",
  "FAISS",
  "OpenAI",
];

const PARTICLE_WORDS = [
  "AI ENGINEER",
  "MCP BUILDER",
  "LANGGRAPH",
  "RAG SYSTEMS",
  "AGENTIC AI",
  "MULTI-AGENT",
  "LLM ENGINEER",
];

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const [time, setTime] = useState("");

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "0px 0px -60px 0px" });
  const animatedProjects = useCountUp(_projectCount, 2800, statsInView);
  const animatedTotal = useCountUp(experienceMetrics.totalMonths, 3500, statsInView);
  const animatedIntern = useCountUp(experienceMetrics.internMonths, 3200, statsInView);
  const animatedRole = useCountUp(experienceMetrics.workRoleMonths, 2900, statsInView);

  const mobileStatsRef = useRef<HTMLDivElement>(null);
  const mobileStatsInView = useInView(mobileStatsRef, { once: true, amount: 0 });
  const mobileAnimProjects = useCountUp(_projectCount, 2800, mobileStatsInView);
  const mobileAnimTotal = useCountUp(experienceMetrics.totalMonths, 3500, mobileStatsInView);

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
      {/* ── Mobile-only status pill — above hero row ── */}
      <div className="anim-fade-up anim-d0 lg:hidden flex items-center justify-center gap-2 mb-5 font-mono text-xs
          text-gray-400 dark:text-white/30">
        <span className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.05]
          border border-black/6 dark:border-white/8 rounded-full px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Chennai, India &nbsp;·&nbsp; {time}
        </span>
      </div>

      {/* ── Main hero row — col-reverse on mobile puts profile above text ── */}
      <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start gap-6 lg:gap-16 mb-14">

        {/* Left: text */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* Desktop-only status pill */}
          <div className="anim-fade-up anim-d0 hidden lg:flex items-center gap-2 mb-5 font-mono text-xs text-gray-400 dark:text-white/30
              bg-black/[0.04] dark:bg-white/[0.05] border border-black/6 dark:border-white/8
              rounded-full px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Chennai, India &nbsp;·&nbsp; {time}
          </div>

          {/* Name */}
          <h1 className="anim-fade-up anim-d1 text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-3">
            Selvin{" "}
            <span className="text-gray-400 dark:text-white/35">PaulRaj K</span>
          </h1>

          {/* Role */}
          <p className="anim-fade-up anim-d2 font-mono text-sm sm:text-[0.9rem] text-[#9a7d2a] dark:text-[#FFD700]/65 mb-4 tracking-wide">
            AI Engineer &nbsp;·&nbsp; MCP &nbsp;·&nbsp; Agentic Systems &nbsp;·&nbsp; RAG &nbsp;·&nbsp; LangGraph
          </p>

          {/* Mobile-only inline stats — projects + YOE after role, animated ── */}
          <div
            ref={mobileStatsRef}
            className="anim-fade-up anim-d3 lg:hidden flex items-center justify-center gap-3 mt-1 mb-5 font-mono"
          >
            <span className="text-lg font-bold text-gray-900 dark:text-white/90 tabular-nums">
              {mobileAnimProjects}+
            </span>
            <span className="text-[0.58rem] uppercase tracking-[0.15em] text-gray-400 dark:text-white/30">
              Projects
            </span>
            <span className="w-px h-3.5 bg-black/10 dark:bg-white/10" />
            <span className="text-lg font-bold text-gray-900 dark:text-white/90 tabular-nums">
              {_fmtDur(mobileAnimTotal)}
            </span>
            <span className="text-[0.58rem] uppercase tracking-[0.15em] text-gray-400 dark:text-white/30">
              YOE
            </span>
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

          {/* Secondary bio */}
          <p className="anim-fade-up anim-d4 text-sm text-gray-500 dark:text-white/40 leading-relaxed max-w-xl mb-7">
            At{" "}
            <span className="text-gray-700 dark:text-white/60 font-medium">
              Zinnov (Draup)
            </span>
            , I architect embedding-based classification models, multi-step job-role
            intelligence agents, and RAG pipelines that power Fortune 500 research.
            Open-source contributor: MCP servers, CLI agent systems, vector search tooling.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up anim-d5 flex flex-row gap-2.5 w-full sm:w-auto mb-7">
            <a
              href="#contact"
              onClick={() => {
                setActiveSection("Contact");
                setTimeOfLastClick(Date.now());
              }}
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
          <div className="anim-fade-up anim-d6 flex items-center gap-2.5">
            {SOCIAL_LINKS.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-11 h-11 rounded-full
                  bg-black/[0.05] dark:bg-white/[0.05] border border-black/8 dark:border-white/10
                  text-gray-500 dark:text-white/40
                  hover:text-gray-900 dark:hover:text-white/85 hover:scale-110 active:scale-[0.93]
                  outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-1"
                style={{
                  transition:
                    "color 130ms ease, transform 150ms cubic-bezier(0.23,1,0.32,1)",
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Right: profile image */}
        <div className="anim-fade-in anim-d1 shrink-0">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
          >
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full ring-2 ring-zinc-200 dark:ring-white/35 overflow-hidden shadow-2xl ">
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
            <div className="absolute inset-0 rounded-full bg-[#FFD700]/8 blur-3xl scale-125 -z-10" />
          </motion.div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div
        ref={statsRef}
        className="anim-fade-up anim-d7 hidden lg:flex items-stretch rounded-2xl overflow-hidden border border-black/6 dark:border-white/8 bg-white dark:bg-white/[0.04] mb-8"
      >
        {/* Projects */}
        <div className="flex flex-col items-center justify-center py-5 sm:px-5 px-3 flex-1 gap-1">
          <span className="font-mono text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-gray-900 dark:text-white/90 leading-none tabular-nums">
            {animatedProjects}+
          </span>
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-gray-400 dark:text-white/30">
            Projects
          </span>
        </div>

        <div className="w-px bg-black/5 dark:bg-white/5 self-stretch" />

        {/* Total YOE */}
        <div className="flex flex-col items-center justify-center py-5 sm:px-5 px-3 flex-[1.5] gap-0.5">
          <span className="font-mono text-[0.48rem] uppercase tracking-[0.22em] text-[#9a7d2a] dark:text-[#FFD700]/50">
            YOE
          </span>
          <span className="font-mono text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-gray-900 dark:text-white/90 leading-none tabular-nums">
            {_fmtDur(animatedTotal)}
          </span>
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-gray-400 dark:text-white/30">
            Total Exp
          </span>
        </div>

        <div className="w-px bg-black/5 dark:bg-white/5 self-stretch" />

        {/* Intern + Role */}
        <div className="flex flex-col flex-1">
          <div className="flex flex-col items-center justify-center py-3.5 sm:px-4 px-2 flex-1 gap-0.5">
            <span className="font-mono text-sm font-bold text-gray-700 dark:text-white/70 tabular-nums">
              {_fmtDur(animatedIntern)}
            </span>
            <span className="font-mono text-[0.52rem] uppercase tracking-widest text-gray-400 dark:text-white/25">
              Intern
            </span>
          </div>
          <div className="h-px bg-black/5 dark:bg-white/5" />
          <div className="flex flex-col items-center justify-center py-3.5 sm:px-4 px-2 flex-1 gap-0.5">
            <span className="font-mono text-sm font-bold text-gray-700 dark:text-white/70 tabular-nums">
              {_fmtDur(animatedRole)}
            </span>
            <span className="font-mono text-[0.52rem] uppercase tracking-widest text-gray-400 dark:text-white/25">
              Role
            </span>
          </div>
        </div>
      </div>

      {/* ── Tech stack badges ── */}
      <div className="anim-fade-up anim-d8 hidden lg:flex flex-wrap justify-start gap-2 mb-12">
        <span className="font-mono text-[0.65rem] text-gray-400 dark:text-white/25 self-center mr-1 tracking-widest uppercase">
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

      {/* ── Particle text canvas — hidden on mobile ── */}
      <div className="anim-fade-in anim-d9 hidden sm:block w-full rounded-2xl overflow-hidden border border-black/6 dark:border-white/8">
        <ParticleTextEffect
          words={PARTICLE_WORDS}
          className="w-full bg-black flex items-center justify-center py-2"
        />
      </div>
    </section>
  );
}

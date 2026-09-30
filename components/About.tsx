"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import { projectsData, certificationsData, experienceMetrics } from "@/lib/data";
import AgentMeshCanvas from "./ui/AgentMeshCanvas";
import SectionHeading from "./SectionHeading";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const MONO = "var(--font-geist-mono)";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const CHIPS = ["LangGraph", "MCP", "RAG", "Next.js", "Python", "FastAPI"];

function useCountUp(target: number, durationMs: number, trigger: boolean) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!trigger) return;
    let rafId: number;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 2);
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

export default function About() {
  const { ref } = useSectionInView("About");

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "0px 0px -40px 0px" });

  const animProjects = useCountUp(projectsData.length, 3500, statsInView);
  const animFullTime = useCountUp(experienceMetrics.workRoleMonths, 4500, statsInView);
  const animIntern = useCountUp(experienceMetrics.internMonths, 4000, statsInView);
  const animCerts = useCountUp(certificationsData.length, 4000, statsInView);

  const animYr = Math.floor(animFullTime / 12);
  const animMo = animFullTime % 12;

  return (
    <motion.section
      ref={ref}
      id="about"
      className="mb-28 w-full max-w-[1240px] mx-auto px-4 sm:px-10 scroll-mt-28"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      <SectionHeading kicker="AI engineer building multi-agent systems, MCP servers and RAG pipelines that ship to production.">
        About
      </SectionHeading>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">

        {/* Left: copy */}
        <div>
          <blockquote
            className="mb-7 text-[clamp(1.5rem,1.2rem+1vw,1.875rem)] leading-[1.3] tracking-[-0.005em] text-gray-900 dark:text-white"
            style={{ fontFamily: SERIF, fontStyle: "italic" }}
          >
            &ldquo;I design workflows where AI agents collaborate, reason, and execute.&rdquo;
          </blockquote>

          <div className="space-y-[18px]">
            <p className="text-base leading-[1.7] text-gray-600 dark:text-[#c9c9cf]">
              I am an{" "}
              <strong className="text-gray-900 dark:text-white font-semibold">AI Engineer</strong>{" "}
              from India, pursuing a Master&apos;s in Computer Science (AI specialisation) at Kings
              Engineering College. My foundation is a{" "}
              <strong className="text-gray-900 dark:text-white font-semibold">B.Tech in Information Technology</strong>,{" "}
              where I discovered my obsession with building systems that{" "}
              <em>think</em>, <em>adapt</em>, and <em>act</em>.
            </p>
            <p className="text-base leading-[1.7] text-gray-600 dark:text-[#c9c9cf]">
              I specialize in{" "}
              <span className="text-amber-700 dark:text-[#f5c518] font-semibold">agentic AI</span>: LangGraph
              multi&#8209;agent pipelines, MCP servers, RAG systems, and LLM&#8209;powered
              automation. I design workflows where multiple AI agents collaborate, reason, and
              execute tasks autonomously, backed by full&#8209;stack expertise across Next.js,
              React, Node.js, and Python.
            </p>
            <p className="text-base leading-[1.7] text-gray-600 dark:text-[#c9c9cf]">
              At{" "}
              <strong className="text-gray-900 dark:text-white font-semibold">Zinnov (Draup)</strong>
              , I build AI automation for workforce intelligence: a LangGraph multi&#8209;agent
              system that turns plain&#8209;English requests into validated SQL reports, hybrid
              FAISS&nbsp;+&nbsp;BM25 search over millions of company records, and LLM&#8209;driven
              role&#8209;mapping pipelines. Outside work, I ship open&#8209;source AI tooling: MCP
              servers, CLI agents, and full&#8209;stack apps.
            </p>
          </div>

          {/* Meta row */}
          <div
            className="mt-7 flex flex-wrap gap-[10px] text-xs text-gray-500 dark:text-[#a1a1aa] tracking-[0.14em] uppercase"
            style={{ fontFamily: MONO }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-[#f5c518]" />
              Available for collaboration
            </span>
            <span aria-hidden="true" className="text-gray-400 dark:text-[#71717a]">·</span>
            <span>Chennai, India · GMT+5:30</span>
          </div>
        </div>

        {/* Right: canvas + stats */}
        <div className="flex flex-col gap-[18px]">

          {/* Canvas card */}
          <div
            className="relative rounded-[18px] overflow-hidden border border-black/[0.08] dark:border-white/[0.07]"
            style={{
              aspectRatio: "16/11",
              background: "radial-gradient(120% 100% at 50% 50%, #0c0c12 0%, #050507 80%)",
              boxShadow: "0 30px 80px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.02)",
            }}
          >
            <AgentMeshCanvas />
            <span
              className="absolute top-3 left-3 px-2 py-1 text-xs tracking-[0.2em] text-[#a1a1aa] uppercase bg-black/60 border border-white/[0.07] rounded-md"
              style={{ fontFamily: MONO }}
            >
              SYS · agent.mesh
            </span>
            <span
              className="absolute top-3 right-3 flex items-center px-2 py-1 text-xs tracking-[0.2em] text-[#f5c518] uppercase border border-[#f5c518]/25 rounded-md"
              style={{ fontFamily: MONO, background: "rgba(245,197,24,0.06)" }}
            >
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#f5c518] mr-[6px] animate-pulse" />
              LIVE
            </span>
            <span
              className="absolute bottom-3 left-3 px-2 py-1 text-xs tracking-[0.2em] text-[#a1a1aa] uppercase bg-black/60 border border-white/[0.07] rounded-md"
              style={{ fontFamily: MONO }}
            >
              nodes 07 · edges 12
            </span>
            <span
              className="absolute bottom-3 right-3 px-2 py-1 text-xs tracking-[0.2em] text-[#a1a1aa] uppercase bg-black/60 border border-white/[0.07] rounded-md"
              style={{ fontFamily: MONO }}
            >
              v2.4
            </span>
          </div>

          {/* Stats grid: count-up on scroll into view */}
          <div
            ref={statsRef}
            className="grid grid-cols-3 border border-black/[0.08] dark:border-white/[0.07] rounded-[14px] overflow-hidden bg-gray-50 dark:bg-[#101015]"
          >
            {/* Projects shipped */}
            <div className="p-[18px_20px]">
              <div className="font-semibold text-[32px] tracking-[-0.02em] leading-none flex items-baseline gap-[6px] text-gray-900 dark:text-[#ededee] tabular-nums">
                {animProjects}<span className="text-amber-700 dark:text-[#f5c518]">+</span>
              </div>
              <div
                className="mt-2 text-xs tracking-[0.22em] text-gray-500 dark:text-[#a1a1aa] uppercase"
                style={{ fontFamily: MONO }}
              >
                Projects Shipped
              </div>
            </div>

            {/* Full-time experience: internships are counted separately */}
            <div className="p-[18px_20px] border-l border-black/[0.08] dark:border-white/[0.07]">
              <div className="font-semibold text-[32px] tracking-[-0.02em] leading-none flex items-baseline gap-[4px] text-gray-900 dark:text-[#ededee] tabular-nums">
                {animYr > 0 && (
                  <>
                    {animYr}
                    <span className="text-[14px] font-medium text-gray-500 dark:text-[#a1a1aa]">yr</span>
                  </>
                )}
                {(animMo > 0 || animYr === 0) && (
                  <>
                    {animMo}
                    <span className="text-[14px] font-medium text-gray-500 dark:text-[#a1a1aa]">mo</span>
                  </>
                )}
              </div>
              <div
                className="mt-2 text-xs tracking-[0.22em] text-gray-500 dark:text-[#a1a1aa] uppercase"
                style={{ fontFamily: MONO }}
              >
                Full-time
              </div>
            </div>

            {/* Split: Internships / Certifications, live from data */}
            <div className="border-l border-black/[0.08] dark:border-white/[0.07] grid grid-rows-2">
              <div className="px-[14px] py-3 flex items-center justify-between gap-2 border-b border-black/[0.08] dark:border-white/[0.07]">
                <span
                  className="text-xs tracking-[0.18em] text-gray-500 dark:text-[#a1a1aa] uppercase"
                  style={{ fontFamily: MONO }}
                >
                  Intern
                </span>
                <span className="font-semibold text-[14px] text-gray-900 dark:text-[#ededee] tabular-nums">
                  {_fmtDur(animIntern)}
                </span>
              </div>
              <div className="px-[14px] py-3 flex items-center justify-between gap-2">
                <span
                  className="text-xs tracking-[0.18em] text-gray-500 dark:text-[#a1a1aa] uppercase"
                  style={{ fontFamily: MONO }}
                >
                  Certs
                </span>
                <span className="font-semibold text-[14px] text-gray-900 dark:text-[#ededee] tabular-nums">
                  {animCerts}
                </span>
              </div>
            </div>
          </div>

          {/* Tech chips */}
          <div className="flex flex-wrap gap-[6px] pt-[6px]">
            <span
              className="text-xs text-gray-500 dark:text-[#a1a1aa] tracking-[0.22em] uppercase pr-1"
              style={{ fontFamily: MONO }}
            >
              Now Stack
            </span>
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="text-xs text-gray-600 dark:text-[#d8d8de] tracking-[0.02em] px-[10px] py-[5px] border border-black/[0.08] dark:border-white/[0.07] rounded-full bg-white dark:bg-white/[0.015]"
                style={{ fontFamily: MONO }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

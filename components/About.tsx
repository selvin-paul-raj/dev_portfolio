"use client";

import { useSectionInView } from "@/lib/hooks";
import { projectsData, certificationsData, experienceMetrics } from "@/lib/data";
import AgentMeshCanvas from "./ui/AgentMeshCanvas";
import SectionHeading from "./SectionHeading";
import NumberTicker from "./ui/NumberTicker";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const STACK_NOW = ["LangGraph", "MCP", "RAG", "Next.js", "Python", "FastAPI"];

const fmtMonths = (n: number) => {
  const y = Math.floor(n / 12);
  const m = n % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
};

// Every figure is computed from lib/data; internships are counted apart from full-time work.
const STATS = [
  { value: projectsData.length, label: "Projects shipped", format: (n: number) => `${n}+` },
  { value: experienceMetrics.workRoleMonths, label: "Full-time", format: fmtMonths },
  { value: experienceMetrics.internMonths, label: "Internships", format: fmtMonths },
  { value: certificationsData.length, label: "Certificates", format: String },
];

const STRONG = "font-semibold text-gray-900 dark:text-white";
const BODY = "text-base leading-[1.7] text-gray-600 dark:text-[#c9c9cf] max-w-[65ch]";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <section ref={ref} id="about" className="mb-28 w-full max-w-[1240px] mx-auto px-4 sm:px-10 scroll-mt-28">
      <SectionHeading>About</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-14 items-start">
        {/* Left: the claim, then the story behind it */}
        <div>
          <blockquote
            className="mb-8 text-[clamp(1.5rem,1.2rem+1vw,1.875rem)] leading-[1.3] text-gray-900 dark:text-white"
            style={{ fontFamily: SERIF, fontStyle: "italic" }}
          >
            &ldquo;My agent pipeline took analyst turnaround from hours to under a minute.&rdquo;
          </blockquote>

          <div className="space-y-5">
            <p className={BODY}>
              I&apos;m an <strong className={STRONG}>AI engineer</strong> in Chennai, doing a Master&apos;s in Computer
              Science (AI specialisation) at Kings Engineering College after a{" "}
              <strong className={STRONG}>B.Tech in Information Technology</strong>.
            </p>
            <p className={BODY}>
              I specialise in <span className="font-semibold text-amber-700 dark:text-accent">agentic AI</span>: LangGraph
              multi&#8209;agent pipelines, MCP servers, RAG systems and LLM&#8209;powered automation. I test them like
              production code, with test suites, retrieval metrics and red&#8209;team cases, and the full&#8209;stack side
              (Next.js, React, Node.js, Python) lets me ship the API and interface around the agent too.
            </p>
            <p className={BODY}>
              At <strong className={STRONG}>Zinnov (Draup)</strong> I build AI automation for workforce intelligence: a
              LangGraph multi&#8209;agent system that turns plain&#8209;English requests into validated SQL reports, hybrid
              FAISS&nbsp;+&nbsp;BM25 search over 2.6M company records, and LLM&#8209;driven role&#8209;mapping pipelines.
              Outside work I ship open&#8209;source MCP servers, CLI agents and full&#8209;stack apps.
            </p>
          </div>

          <p className="mt-8 text-sm text-gray-600 dark:text-[#a1a1aa]">
            <span className="font-medium text-green-700 dark:text-green-400/85">Open to AI Engineer roles.</span>{" "}
            Chennai, India (GMT+5:30).
          </p>
        </div>

        {/* Right: the agent mesh, then the numbers */}
        <div className="flex flex-col gap-5">
          <figure
            className="relative rounded-[18px] overflow-hidden border border-black/[0.08] dark:border-white/[0.07]"
            style={{
              aspectRatio: "16/11",
              background: "radial-gradient(120% 100% at 50% 50%, #0c0c12 0%, #050507 80%)",
            }}
          >
            <AgentMeshCanvas />
            <figcaption className="sr-only">Decorative animation of agents passing messages across a mesh.</figcaption>
          </figure>

          <dl className="grid grid-cols-2 border border-black/[0.08] dark:border-white/[0.07] rounded-[14px] overflow-hidden bg-gray-50 dark:bg-[#101015]">
            {STATS.map(({ value, label, format }, i) => (
              <div
                key={label}
                className={`min-w-0 px-4 sm:px-5 py-4 flex flex-col-reverse gap-1.5
                  ${i % 2 === 1 ? "border-l border-black/[0.08] dark:border-white/[0.07]" : ""}
                  ${i >= 2 ? "border-t border-black/[0.08] dark:border-white/[0.07]" : ""}`}
              >
                <dt className="text-sm text-gray-600 dark:text-[#a1a1aa]">{label}</dt>
                <dd className="m-0 whitespace-nowrap text-2xl sm:text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-gray-900 dark:text-[#ededee]">
                  <NumberTicker value={value} format={format} duration={1.6} className="!text-left" />
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-2.5">
            <span className="text-sm text-gray-600 dark:text-[#a1a1aa]">Working with now</span>
            <ul className="flex flex-wrap gap-2">
              {STACK_NOW.map((tech) => (
                <li
                  key={tech}
                  className="font-mono text-xs text-gray-700 dark:text-[#d8d8de] px-2.5 py-1 border border-black/[0.08] dark:border-white/[0.07] rounded-full bg-white dark:bg-white/[0.015]"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

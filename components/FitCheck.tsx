"use client";

import { useState } from "react";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { matchJob } from "@/lib/fit/matchJob";
import type { FitData, FitReport, RequirementMatch } from "@/lib/fit/matchJob";
import projectsData from "@/lib/data/projects.json";
import experiencesData from "@/lib/data/experiences.json";
import certificationsData from "@/lib/data/certifications.json";

const DATA: FitData = {
  projects: projectsData,
  experiences: experiencesData,
  certifications: certificationsData,
};

const SAMPLE_JD = `AI Engineer, Agentic Systems
We're looking for an engineer to build LLM-powered agents in production.
- 2+ years with Python and FastAPI
- Experience with LangGraph or LangChain, tool calling, and multi-agent orchestration
- RAG: vector databases, embeddings, hybrid search, re-ranking
- Evaluation of LLM systems and guardrails against prompt injection
- Nice to have: MCP, AWS, Docker, Kubernetes, fine-tuning`;

const STRENGTH_LABEL: Record<RequirementMatch["strength"], string> = {
  production: "Production work",
  project: "Shipped project",
  certified: "Certified",
};

const STRENGTH_STYLE: Record<RequirementMatch["strength"], string> = {
  production: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/25",
  project: "bg-accent/10 text-accent-ink dark:text-accent/85 border-accent/30",
  certified: "bg-black/[0.04] dark:bg-white/[0.06] text-gray-600 dark:text-white/55 border-black/10 dark:border-white/10",
};

export default function FitCheck() {
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<FitReport | null>(null);

  const run = (text: string) => setReport(matchJob(text, DATA));

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(jd);
        }}
        className="flex flex-col gap-3"
      >
        <label htmlFor="jd" className="font-mono text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-white/40">
          Job description
        </label>
        <textarea
          id="jd"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          maxLength={20000}
          rows={10}
          placeholder="Paste the full job description here…"
          className="w-full rounded-xl p-4 text-sm leading-relaxed resize-y
            bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10
            text-gray-900 dark:text-white/85 placeholder:text-gray-400 dark:placeholder:text-white/25
            outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="submit"
            disabled={jd.trim().length < 40}
            className="group flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full
              bg-gray-900 dark:bg-accent text-white dark:text-black text-sm font-semibold
              disabled:opacity-40 active:scale-[0.97]
              outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            style={{ transition: "opacity 150ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
          >
            Check fit
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 dark:bg-black/15">
              <BsArrowRight size={13} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setJd(SAMPLE_JD);
              run(SAMPLE_JD);
            }}
            className="px-4 py-2.5 rounded-full text-sm font-medium
              border border-black/10 dark:border-white/10 text-gray-700 dark:text-white/65
              hover:bg-black/[0.04] dark:hover:bg-white/[0.06]
              outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Try a sample JD
          </button>
          <span className="text-xs text-gray-500 dark:text-white/35">
            Runs in your browser. Nothing is sent or stored.
          </span>
        </div>
      </form>

      {report && <FitResult report={report} />}
    </div>
  );
}

function FitResult({ report }: { report: FitReport }) {
  return (
    <section aria-live="polite" className="mt-10 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl p-6
        bg-black/[0.03] dark:bg-white/[0.04] border border-black/8 dark:border-white/10">
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-5xl font-bold tabular-nums text-gray-900 dark:text-white">{report.score}</span>
          <span className="text-lg text-gray-400 dark:text-white/30">/100</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white/90">{report.verdict}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-white/50">
            {report.matched.length} requirement{report.matched.length === 1 ? "" : "s"} backed by evidence ·{" "}
            {report.gaps.length} gap{report.gaps.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {report.matched.length > 0 && (
        <div>
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-white/40">
            Matched, with evidence
          </h2>
          <ul className="flex flex-col gap-3">
            {report.matched.map((m) => (
              <li key={m.requirement} className="rounded-xl p-4 border border-black/8 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white/90">{m.requirement}</span>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${STRENGTH_STYLE[m.strength]}`}>
                    {STRENGTH_LABEL[m.strength]}
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {m.evidence.map((ev, i) => (
                    <li key={i} className="text-sm leading-relaxed text-gray-600 dark:text-white/55">
                      <span className="text-gray-800 dark:text-white/75 font-medium">
                        {ev.url ? (
                          <a href={ev.url} target="_blank" rel="noopener noreferrer" className="underline decoration-accent/60 underline-offset-2 hover:decoration-accent">
                            {ev.source}
                          </a>
                        ) : (
                          ev.source
                        )}
                      </span>
                      {": "}
                      {ev.text.length > 220 ? `${ev.text.slice(0, 220)}…` : ev.text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.gaps.length > 0 && (
        <div>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-white/40">
            No evidence yet
          </h2>
          <div className="flex flex-wrap gap-2">
            {report.gaps.map((g) => (
              <span key={g} className="text-sm px-3 py-1 rounded-full border border-dashed border-black/15 dark:border-white/15 text-gray-600 dark:text-white/50">
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-gray-500 dark:text-white/35">{report.method}</p>

      <div className="flex flex-wrap gap-2.5">
        <Link
          href="/#contact"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-accent text-white dark:text-black text-sm font-semibold
            outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Talk to Selvin <BsArrowRight size={13} />
        </Link>
        <a
          href="/view/Selvin_Resume.pdf"
          download
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 dark:border-white/10 text-sm font-semibold text-gray-800 dark:text-white/75
            hover:bg-black/[0.04] dark:hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Resume <HiDownload size={13} />
        </a>
      </div>
    </section>
  );
}

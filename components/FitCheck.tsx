"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { matchJob } from "@/lib/fit/matchJob";
import type { FitData, FitReport } from "@/lib/fit/matchJob";
import { FIELD, FOCUS, GHOST_BTN, LABEL, PANEL, PRIMARY_BTN } from "@/components/tools/styles";
import FitReportPanel from "@/components/fit/FitReportPanel";
import JdMarkup from "@/components/fit/JdMarkup";
import { reqId } from "@/components/fit/labels";
import { readInitialJd, shareUrl } from "@/components/fit/share";

const MIN_CHARS = 40;
const MAX_CHARS = 20_000;

const SAMPLE_JD = `AI Engineer, Agentic Systems
We're looking for an engineer to build LLM-powered agents in production.
- 2+ years with Python and FastAPI
- Experience with LangGraph or LangChain, tool calling, and multi-agent orchestration
- RAG: vector databases, embeddings, hybrid search, re-ranking
- Evaluation of LLM systems and guardrails against prompt injection
- Nice to have: MCP, AWS, Docker, Kubernetes, fine-tuning`;

// Hides the site chrome when the report is printed; the page's own controls use print:hidden.
interface Run {
  /** Bumps on every check, so the score and breakdown replay their reveal for each new report. */
  id: number;
  jd: string;
  report: FitReport;
}

type View = "edit" | "markup";


const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function EmptyState() {
  return (
    <div className={`${PANEL} p-5 sm:p-6`}>
      <h2 className={LABEL}>What the report shows</h2>
      <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-fg-2 marker:text-muted">
        <li>A score out of 100 and a one line verdict.</li>
        <li>Your job description with every recognised requirement highlighted. Select one to jump to its evidence.</li>
        <li>For each match, the work, project or certification that backs it.</li>
        <li>Gaps, split into must have and nice to have, each with a link to ask about it.</li>
        <li>How every requirement moved the score.</li>
      </ul>
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const btn = (v: View, label: string) => (
    <button
      type="button"
      aria-pressed={view === v}
      onClick={() => onChange(v)}
      className={`h-8 rounded-full px-3 text-xs font-medium transition-colors duration-150 ${FOCUS} ${
        view === v ? "bg-surface-3 text-fg" : "text-muted hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Job description view" className="flex rounded-full border border-line p-0.5">
      {btn("edit", "Edit")}
      {btn("markup", "Marked up")}
    </div>
  );
}

/** `data` is the trimmed evidence and `samples` the golden JDs by name, both built on the server in app/fit/page.tsx. */
export default function FitCheck({ data, samples }: { data: FitData; samples: Record<string, string> }) {
  const [jd, setJd] = useState("");
  const [run, setRun] = useState<Run | null>(null);
  const [view, setView] = useState<View>("edit");
  const [notice, setNotice] = useState<string | null>(null);
  const [share, setShare] = useState<{ jd: string; url: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusReport = useRef(false);
  const runCount = useRef(0);

  const analyse = useCallback(
    (text: string): Run => ({ id: ++runCount.current, jd: text, report: matchJob(text, data, { maxEvidence: Infinity }) }),
    [data],
  );

  const check = (text: string) => {
    focusReport.current = true;
    setRun(analyse(text));
    setView("markup");
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const initial = await readInitialJd(window.location, samples);
      if (cancelled || !initial) return;
      if ("error" in initial) {
        setNotice(initial.error);
        return;
      }
      setJd(initial.jd);
      setRun(analyse(initial.jd));
      setView("markup");
    })();
    return () => {
      cancelled = true;
    };
  }, [analyse, samples]);

  useEffect(() => {
    if (!run) return;
    if (focusReport.current) headingRef.current?.focus();
    focusReport.current = false;
    let cancelled = false;
    void shareUrl(run.jd)
      .then((url) => {
        if (!cancelled) setShare({ jd: run.jd, url });
      })
      .catch((err: unknown) => console.warn("fit: could not build share link", err));
    return () => {
      cancelled = true;
    };
  }, [run]);

  const jump = (requirement: string) => {
    const el = document.getElementById(reqId(requirement));
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    el.focus({ preventScroll: true });
  };

  const length = jd.trim().length;
  const short = length < MIN_CHARS;
  const stale = run !== null && run.jd !== jd;

  return (
    <div className="grid w-full items-start gap-8 lg:grid-cols-2 lg:gap-10">
      <section aria-labelledby="jd-label" className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-24 print:hidden">
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
          {view === "edit" ? (
            <label id="jd-label" htmlFor="jd" className={LABEL}>
              Job description
            </label>
          ) : (
            <h2 id="jd-label" className={LABEL}>
              Job description, marked up
            </h2>
          )}
          {run && <ViewToggle view={view} onChange={setView} />}
        </div>

        {view === "markup" && run ? (
          <>
            <div className={`${PANEL} max-h-[32rem] overflow-y-auto p-4`}>
              <JdMarkup jd={run.jd} report={run.report} onJump={jump} />
            </div>
            <p className="text-xs leading-relaxed text-muted">
              <span className="rounded-sm bg-accent/15 px-0.5 text-fg underline decoration-accent decoration-2 underline-offset-4">Solid gold</span> is backed by
              evidence,{" "}
              <span className="text-fg underline decoration-danger decoration-dashed decoration-2 underline-offset-4">dashed red</span> is a gap. Select a phrase to
              jump to it in the report.
            </p>
          </>
        ) : (
          <textarea
            id="jd"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            maxLength={MAX_CHARS}
            rows={14}
            aria-describedby="jd-hint"
            placeholder="Paste the full job description here"
            className={`${FIELD} resize-y rounded-xl p-4 leading-relaxed`}
          />
        )}

        {stale && (
          <p className="text-xs text-warn" role="status">
            The report is for the earlier text. Check fit again to update it.
          </p>
        )}
        {notice && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-fg">
            {notice}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (short) return;
            setNotice(null);
            if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
            check(jd);
          }}
          className="flex flex-wrap items-center gap-2.5"
        >
          <button type="submit" disabled={short} aria-describedby="jd-hint" className={PRIMARY_BTN}>
            Check fit <LuArrowRight size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setNotice(null);
              setJd(SAMPLE_JD);
              check(SAMPLE_JD);
            }}
            className={GHOST_BTN}
          >
            Try a sample JD
          </button>
        </form>
        <p id="jd-hint" className="text-xs text-muted">
          {short
            ? `Paste at least ${MIN_CHARS} characters (${length} so far).`
            : `${length.toLocaleString("en")} characters. Runs in your browser; nothing is sent or stored.`}
        </p>
      </section>

      <div className="min-w-0">
        {run ? (
          <FitReportPanel key={run.id} report={run.report} shareLink={share?.jd === run.jd ? share.url : null} headingRef={headingRef} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

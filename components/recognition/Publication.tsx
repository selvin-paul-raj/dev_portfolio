"use client";

import { useId, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { MdArrowOutward } from "react-icons/md";
import { recognitionData } from "@/lib/data";

type Paper = (typeof recognitionData.publications)[number];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtMonth = (d: string) => {
  const [y, m] = d.split("-");
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
};

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-accent";

/** A paper, led by its venue and what it does; the abstract waits behind a disclosure. */
export default function Publication({ paper }: { paper: Paper }) {
  const [open, setOpen] = useState(false);
  const abstractId = useId();

  return (
    <article className="flex flex-col gap-5">
      <p className="text-sm text-gray-600 dark:text-white/55">
        <span className="font-medium text-green-700 dark:text-green-400/85">{paper.status}</span> in{" "}
        <span className="font-medium text-amber-700 dark:text-accent">{paper.publisher}</span>,{" "}
        <time dateTime={paper.publication_date} className="font-mono text-xs tabular-nums">{fmtMonth(paper.publication_date)}</time>
      </p>
      <h3 className="text-2xl sm:text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] text-gray-900 dark:text-white text-balance">
        {paper.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-white/55">{paper.publisherFull}</p>
      <p className="max-w-[65ch] text-base leading-relaxed text-gray-700 dark:text-[#c9c9cf]">{paper.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 border-t border-black/[0.08] dark:border-white/[0.07] pt-5">
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-white/55">What it does</h4>
          <ul className="mt-2 flex flex-col gap-1.5 pl-4 list-disc marker:text-gray-400 dark:marker:text-white/30 text-sm text-gray-700 dark:text-[#d5d5db]">
            {paper.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-white/55">Built with</h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-[#d5d5db]">{paper.technologies.join(", ")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={abstractId}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-white/85 rounded-sm ${FOCUS}`}
        >
          {open ? "Hide the abstract" : "Read the abstract"}
          <LuChevronDown size={15} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        {paper.research_link && (
          <a
            href={paper.research_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-accent hover:underline underline-offset-4 rounded-sm ${FOCUS}`}
          >
            Read the paper <MdArrowOutward size={14} aria-hidden="true" />
          </a>
        )}
        <span className="text-xs text-gray-500 dark:text-white/45">
          Paper ID <span className="font-mono">{paper.paperId}</span>
        </span>
      </div>
      <p
        id={abstractId}
        hidden={!open}
        className="anim-detail-in max-w-[65ch] border-l-0 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] p-5 text-[1.0625rem] leading-relaxed text-gray-700 dark:text-[#e0e0e6]"
        style={{ fontFamily: "var(--font-instrument-serif), ui-serif, Georgia, serif", fontStyle: "italic" }}
      >
        {paper.abstract}
      </p>
    </article>
  );
}

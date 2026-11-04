"use client";

import { useState } from "react";
import { LuExternalLink } from "react-icons/lu";
import { FOCUS } from "@/components/tools/styles";
import { isExternal, KINDS, sourceId } from "./model";
import type { Citation } from "./model";

const CLAMP_FROM = 180;

function SourceCard({ turnId, citation, highlighted }: { turnId: string; citation: Citation; highlighted: boolean }) {
  const [open, setOpen] = useState(false);
  const { label, Icon } = KINDS[citation.kind];
  const long = citation.text.length > CLAMP_FROM;
  return (
    <li
      id={sourceId(turnId, citation.n)}
      tabIndex={-1}
      className={`scroll-mt-28 rounded-xl border bg-surface-2 p-3.5 outline-none ring-2 transition-[border-color,box-shadow] ease-out motion-reduce:transition-none ${
        highlighted ? "border-accent ring-accent/40 duration-150" : "border-line ring-accent/0 duration-[400ms]"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md border border-accent/50 bg-accent/10 px-1 font-mono text-[0.7rem] font-semibold text-accent-fg">
          {citation.n}
        </span>
        <div className="min-w-0 flex-1">
          <a
            href={citation.url}
            {...(isExternal(citation.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`inline-flex items-start gap-1 rounded text-sm font-medium leading-snug text-fg underline decoration-accent/50 underline-offset-2 hover:decoration-accent ${FOCUS}`}
          >
            <span>{citation.title}</span>
            {isExternal(citation.url) && <LuExternalLink size={12} aria-label="(opens in a new tab)" className="mt-1 shrink-0 text-muted" />}
          </a>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <Icon size={12} aria-hidden="true" />
            {label}
          </p>
          <p className={`mt-2 text-sm leading-relaxed text-fg-2 ${long && !open ? "line-clamp-3" : ""}`}>{citation.text}</p>
          {long && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className={`mt-1 rounded text-xs font-medium text-accent-fg underline-offset-2 hover:underline ${FOCUS}`}
            >
              {open ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/** The cited snippets as cards; a chip in the answer scrolls to and highlights its card. */
export default function Sources({ turnId, citations, highlighted }: { turnId: string; citations: Citation[]; highlighted: number | null }) {
  if (citations.length === 0) return null;
  return (
    <section aria-label="Sources" className="flex flex-col gap-2">
      <p className="text-sm font-medium text-fg-2">Sources</p>
      <ol className="flex flex-col gap-2">
        {citations.map((c) => (
          <SourceCard key={c.n} turnId={turnId} citation={c} highlighted={highlighted === c.n} />
        ))}
      </ol>
    </section>
  );
}

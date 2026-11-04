"use client";

import { useState } from "react";
import { LuAward, LuBriefcase, LuFolderGit2 } from "react-icons/lu";
import type { Evidence, EvidenceKind, RequirementMatch } from "@/lib/fit/matchJob";
import { FOCUS } from "@/components/tools/styles";
import { PRIORITY_LABEL, STRENGTH_LABEL, STRENGTH_PILL, reqId } from "./labels";

const SHOWN = 3;
const CLIP = 220;

const KIND: Record<EvidenceKind, { Icon: typeof LuBriefcase; label: string }> = {
  work: { Icon: LuBriefcase, label: "Work" },
  project: { Icon: LuFolderGit2, label: "Project" },
  certification: { Icon: LuAward, label: "Certification" },
};

const TEXT_BTN = `rounded-sm text-xs font-medium text-accent-fg underline decoration-accent/50 underline-offset-4 hover:decoration-accent print:hidden ${FOCUS}`;

function EvidenceLine({ ev }: { ev: Evidence }) {
  const [open, setOpen] = useState(false);
  const { Icon, label } = KIND[ev.kind];
  const long = ev.text.length > CLIP;
  return (
    <li className="flex gap-2.5 text-sm leading-relaxed text-fg-2">
      <Icon size={15} aria-hidden="true" className="mt-1 shrink-0 text-muted" />
      <p className="min-w-0 [overflow-wrap:anywhere]">
        <span className="sr-only">{label}: </span>
        <span className="font-medium text-fg">
          {ev.url ? (
            <a href={ev.url} target="_blank" rel="noopener noreferrer" className={`rounded-sm underline decoration-accent/60 underline-offset-2 hover:decoration-accent ${FOCUS}`}>
              {ev.source}
            </a>
          ) : (
            ev.source
          )}
        </span>
        {": "}
        {long && !open ? `${ev.text.slice(0, CLIP).trimEnd()}…` : ev.text}
        {long && (
          <>
            {" "}
            <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={TEXT_BTN}>
              {open ? "Show less" : "Show all"}
            </button>
          </>
        )}
      </p>
    </li>
  );
}

/** One backed requirement: priority, strength and every evidence line behind it. */
export default function RequirementCard({ match }: { match: RequirementMatch }) {
  const [all, setAll] = useState(false);
  const extra = match.evidence.length - SHOWN;
  const shown = all ? match.evidence : match.evidence.slice(0, SHOWN);
  return (
    <li
      id={reqId(match.requirement)}
      tabIndex={-1}
      className="scroll-mt-28 rounded-xl border border-line bg-surface-2 p-4 outline-none focus:ring-2 focus:ring-accent print:break-inside-avoid"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h4 className="mr-auto font-semibold text-fg">{match.requirement}</h4>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${match.priority === "must" ? "border-line-strong text-fg-2" : "border-dashed border-line-strong text-muted"}`}>
          {PRIORITY_LABEL[match.priority]}
        </span>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STRENGTH_PILL[match.strength]}`}>{STRENGTH_LABEL[match.strength]}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {shown.map((ev, i) => (
          <EvidenceLine key={`${ev.source}-${i}`} ev={ev} />
        ))}
      </ul>
      {extra > 0 && (
        <button type="button" aria-expanded={all} onClick={() => setAll((a) => !a)} className={`mt-3 ${TEXT_BTN}`}>
          {all ? "Show fewer" : `+${extra} more`}
        </button>
      )}
    </li>
  );
}

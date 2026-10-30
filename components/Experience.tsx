"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { experienceMetrics } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { commits, graph, LANES, shortHash, type Entry, type GraphRow } from "./experience/gitLog";

const STACK_PREFIX = /^(stack|technologies)\s*:\s*/i;

/** Split a raw description into bullet lines plus an optional trailing stack list. */
function parseDescription(raw: string | undefined): { bullets: string[]; stack: string[] } {
  const lines = (raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-•]+/, "").trim())
    .filter(Boolean);
  const stack: string[] = [];
  const bullets = lines.filter((line) => {
    if (!STACK_PREFIX.test(line)) return true;
    stack.push(...line.replace(STACK_PREFIX, "").replace(/\.$/, "").split(",").map((s) => s.trim()).filter(Boolean));
    return false;
  });
  return { bullets, stack };
}

const fmtMonths = (n: number) => {
  const y = Math.floor(n / 12);
  const m = n % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
};

const LANE_W = 18; // px per lane in the graph column

/** The graph cell for one row: lane lines above and below, and this commit's dot. */
function GraphCell({ row }: { row: GraphRow }) {
  return (
    <div aria-hidden="true" className="relative shrink-0 self-stretch" style={{ width: LANE_W * LANES.length }}>
      {LANES.map((l, lane) => (
        <span key={l.name} className="absolute inset-y-0" style={{ left: lane * LANE_W + LANE_W / 2 - 0.5, width: 1 }}>
          {row.up[lane] && <span className={`absolute left-0 top-0 h-[22px] w-px ${l.line}`} />}
          {row.down[lane] && <span className={`absolute left-0 top-[22px] bottom-0 w-px ${l.line}`} />}
        </span>
      ))}
      <span
        className={`absolute top-[17px] h-[11px] w-[11px] rounded-full ring-4 ring-white dark:ring-[#0c0c10] ${LANES[row.lane].dot}`}
        style={{ left: row.lane * LANE_W + LANE_W / 2 - 5.5 }}
      />
    </div>
  );
}

/** `git show` for one entry: who, when, where, then the diff of what it added. */
function CommitDetail({ entry }: { entry: Entry }) {
  const { bullets, stack } = parseDescription(entry.description);
  return (
    <div className="pb-5 pt-1 font-mono text-[13px] leading-relaxed">
      <p className="text-muted">Author: Selvin PaulRaj K</p>
      <p className="text-muted" suppressHydrationWarning>
        Date:   {entry.dateStart} to {entry.dateEnd} ({entry.duration})
      </p>
      {entry.location && <p className="text-muted">Where:  {entry.location}</p>}
      {bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5 font-sans text-sm">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-fg-2">
              <span aria-hidden="true" className="font-mono text-ok">+</span>
              <span className="max-w-[72ch]">{b}</span>
            </li>
          ))}
        </ul>
      )}
      {stack.length > 0 && <p className="mt-3 text-muted">stack: {stack.join(", ")}</p>}
    </div>
  );
}

function CommitRow({ entry, row, open, onToggle }: { entry: Entry; row: GraphRow; open: boolean; onToggle: () => void }) {
  const lane = LANES[row.lane];
  const ref = entry.isCurrent && row.lane === 0 ? "HEAD -> work" : row.lane === 0 ? null : lane.name;
  const panelId = `commit-${entry.id}`;
  return (
    <li className="flex gap-3">
      <GraphCell row={row} />
      <div className="min-w-0 flex-1 border-b border-line">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full min-h-11 flex-wrap items-baseline gap-x-3 gap-y-1 py-3 text-left rounded-sm
            outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        >
          <span aria-hidden="true" className="font-mono text-[13px] text-accent-fg">{shortHash(entry)}</span>
          {ref && <span className={`font-mono text-[13px] ${lane.text}`}>({ref})</span>}
          <span className="font-mono text-[13px] text-muted">{entry.dateStart}</span>
          <span className="basis-full sm:basis-auto text-[15px] font-semibold text-fg group-hover:underline underline-offset-4 decoration-black/20 dark:decoration-white/25">
            {entry.title}
          </span>
          <span className="text-sm text-fg-2">{entry.company}</span>
          <span aria-hidden="true" className="ml-auto font-mono text-xs text-muted">{open ? "−" : "+"}</span>
        </button>
        <div id={panelId} hidden={!open}>
          <CommitDetail entry={entry} />
        </div>
      </div>
    </li>
  );
}

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.15);
  // The current role opens by default, the way `git show` lands on HEAD.
  const [open, setOpen] = useState<Set<string>>(() => new Set(commits.filter((c) => c.isCurrent && c.iconType === "work").map((c) => c.id)));
  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section ref={ref} id="experience" className="mx-auto mb-28 w-full max-w-5xl scroll-mt-28 px-4">
      <SectionHeading kicker="My career as a git log: work, study and founding run as parallel branches. Open any commit.">
        Experience
      </SectionHeading>

      <div className="rounded-2xl border border-line bg-surface-2 overflow-hidden">
        {/* Terminal header: the command, then a legend of the branches */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 sm:px-6 py-3">
          <p className="font-mono text-[13px] text-fg-2">
            <span aria-hidden="true" className="text-muted">$ </span>git log --graph career
          </p>
          <ul aria-label="Branches" className="flex flex-wrap gap-x-4 gap-y-1">
            {LANES.map((l) => (
              <li key={l.name} className="flex items-center gap-1.5 font-mono text-[13px] text-fg-2">
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${l.dot}`} />
                {l.name}
              </li>
            ))}
          </ul>
        </div>

        <ol className="px-4 sm:px-6 pt-1">
          {commits.map((c, i) => (
            <CommitRow key={c.id} entry={c} row={graph[i]} open={open.has(c.id)} onToggle={() => toggle(c.id)} />
          ))}
        </ol>

        {/* Like `git shortlog -s`: totals computed from the entries */}
        <dl className="flex flex-wrap gap-x-8 gap-y-2 border-t border-line px-4 sm:px-6 py-4 font-mono text-[13px]">
          <div className="flex gap-2">
            <dt className="text-muted">full-time</dt>
            <dd className="m-0 text-fg" suppressHydrationWarning>{fmtMonths(experienceMetrics.workRoleMonths)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">internships</dt>
            <dd className="m-0 text-fg" suppressHydrationWarning>{fmtMonths(experienceMetrics.internMonths)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">commits</dt>
            <dd className="m-0 text-fg">{commits.length}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

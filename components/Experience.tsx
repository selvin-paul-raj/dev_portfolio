"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { useInView } from "react-intersection-observer";
import { LuChevronDown } from "react-icons/lu";
import SectionHeading from "./SectionHeading";
import { useSectionInView } from "@/lib/hooks";
import { barPosition, parseDescription, studyEntries, workEntries, yearTicks, type Entry } from "./experience/timeline";

const TICKS = yearTicks();
const entryId = (e: Entry) => `exp-${e.id ?? e.title.replace(/\W+/g, "-").toLowerCase()}`;

/** Faint January lines behind every track, so the rows read as one chart. */
function Gridlines() {
  return (
    <>
      {TICKS.map((t) => (
        <span key={t.year} aria-hidden="true" className="absolute inset-y-0 w-px bg-black/[0.06] dark:bg-white/[0.06]" style={{ left: t.left }} />
      ))}
    </>
  );
}

function Bar({ entry, index, open }: { entry: Entry; index: number; open: boolean }) {
  const study = entry.iconType === "graduation";
  const tone = study
    ? `border ${open ? "border-gray-700 dark:border-white/80" : "border-gray-400 dark:border-white/40"} bg-transparent`
    : entry.isCurrent
      ? "bg-amber-500 dark:bg-accent"
      : open
        ? "bg-gray-700 dark:bg-white/75"
        : "bg-gray-400 dark:bg-white/35";
  return (
    <span
      aria-hidden="true"
      className={`exp-bar absolute top-[calc(50%-5px)] h-2.5 min-w-[6px] rounded-full ${tone}`}
      style={{ ...barPosition(entry), "--i": index } as CSSProperties}
    />
  );
}

function Detail({ entry }: { entry: Entry }) {
  const { bullets, stack } = parseDescription(entry.description);
  return (
    <div className="anim-detail-in px-3 pb-7 pt-1 md:pl-[calc(15rem+1.5rem)]">
      {entry.location && <p className="text-sm text-gray-600 dark:text-white/55">{entry.location}</p>}
      {bullets.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2 pl-4 list-disc marker:text-gray-400 dark:marker:text-white/30">
          {bullets.map((b) => (
            <li key={b} className="max-w-[70ch] text-[0.95rem] leading-[1.6] text-gray-700 dark:text-[#c9c9cf]">
              {b}
            </li>
          ))}
        </ul>
      )}
      {stack.length > 0 && (
        <ul aria-label="Stack" className="mt-4 flex flex-wrap gap-1.5">
          {stack.map((tech) => (
            <li key={tech} className="rounded-full border border-black/[0.08] dark:border-white/[0.1] px-2.5 py-1 font-mono text-xs text-gray-600 dark:text-[#a1a1aa]">
              {tech}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ entry, index, open, onToggle }: { entry: Entry; index: number; open: boolean; onToggle: () => void }) {
  const panel = `${entryId(entry)}-detail`;
  return (
    <li className="border-b border-black/[0.08] dark:border-white/[0.07]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={onToggle}
        className={`group grid w-full grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)] gap-x-6 gap-y-3 py-4 text-left rounded-lg
          transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent
          ${open ? "bg-black/[0.03] dark:bg-white/[0.04]" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.025]"}`}
      >
        <span className="min-w-0 px-3 flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block font-medium leading-snug text-gray-900 dark:text-white">
              {entry.title}
              {entry.isCurrent && <span className="sr-only"> (current)</span>}
            </span>
            <span className={`block text-sm ${entry.isCurrent ? "text-amber-700 dark:text-accent" : "text-gray-600 dark:text-white/55"}`}>{entry.company}</span>
            <span className="block mt-1 font-mono text-xs leading-relaxed text-gray-500 dark:text-white/45" suppressHydrationWarning>
              {entry.dateStart} to {entry.dateEnd}
              <span className="block">{entry.duration}</span>
            </span>
          </span>
          <LuChevronDown
            size={16}
            aria-hidden="true"
            className={`mt-1 shrink-0 text-gray-400 dark:text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
        <span className="relative block h-6 md:h-auto md:self-stretch mx-3 md:mx-0 md:mr-3">
          <Gridlines />
          <Bar entry={entry} index={index} open={open} />
        </span>
      </button>
      <div id={panel} hidden={!open}>
        {open && <Detail entry={entry} />}
      </div>
    </li>
  );
}

function Group({ label, entries, offset, openId, setOpenId }: {
  label: string;
  entries: Entry[];
  offset: number;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  return (
    <div>
      <h3 className="px-3 pb-2 text-sm font-medium text-gray-600 dark:text-white/55">{label}</h3>
      <ol className="border-t border-black/[0.08] dark:border-white/[0.07]">
        {entries.map((e, i) => {
          const id = entryId(e);
          return (
            <Row key={id} entry={e} index={offset + i} open={openId === id} onToggle={() => setOpenId(openId === id ? null : id)} />
          );
        })}
      </ol>
    </div>
  );
}

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.15);
  // Bars grow in once, the first time the chart is on screen; without JS they are simply drawn.
  const { ref: chartRef, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [openId, setOpenId] = useState<string | null>(() => {
    const current = workEntries.find((e) => e.isCurrent);
    return current ? entryId(current) : null;
  });

  return (
    <section ref={ref} id="experience" className="mx-auto mb-28 w-full max-w-5xl scroll-mt-28 px-4">
      <SectionHeading kicker="Full-time AI automation work, internships and study, drawn to scale. Pick a row for the details.">
        Experience
      </SectionHeading>

      <div ref={chartRef} data-armed={inView || undefined} className="flex flex-col gap-10">
        {/* Year axis and legend */}
        <div className="grid grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)] gap-x-6 gap-y-3 items-end">
          <ul className="px-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-white/55" aria-label="Legend">
            <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2 w-4 rounded-full bg-amber-500 dark:bg-accent" />Ongoing</li>
            <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2 w-4 rounded-full bg-gray-400 dark:bg-white/35" />Finished</li>
            <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2 w-4 rounded-full border border-gray-400 dark:border-white/40" />Study</li>
          </ul>
          <div aria-hidden="true" className="relative h-5 mx-3 md:mx-0 md:mr-3">
            {TICKS.map((t) => (
              <span key={t.year} className="absolute bottom-0 -translate-x-1/2 font-mono text-xs tabular-nums text-gray-500 dark:text-white/45" style={{ left: t.left }}>
                {t.year}
              </span>
            ))}
          </div>
        </div>

        <Group label="Work" entries={workEntries} offset={0} openId={openId} setOpenId={setOpenId} />
        <Group label="Education" entries={studyEntries} offset={workEntries.length} openId={openId} setOpenId={setOpenId} />
      </div>
    </section>
  );
}

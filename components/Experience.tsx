"use client";

import { useState } from "react";
import { LuArrowUp, LuBriefcase, LuGraduationCap, LuRocket } from "react-icons/lu";
import SectionHeading from "./SectionHeading";
import { experiencesData, experienceMetrics } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

type Entry = (typeof experiencesData)[number];

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

const KIND = {
  work: { Icon: LuBriefcase, label: "Work" },
  graduation: { Icon: LuGraduationCap, label: "Study" },
  laptop: { Icon: LuRocket, label: "Founder" },
} as const;

const startTime = (e: Entry) => Date.parse(`1 ${e.dateStart}`);
const nowWork = experiencesData.find((e) => e.isCurrent && e.iconType === "work");
const nowStudy = experiencesData.find((e) => e.isCurrent && e.iconType === "graduation");
// Everything that isn't "now", oldest first, so the path reads as the road to the current role.
const path = experiencesData.filter((e) => e !== nowWork && e !== nowStudy).sort((a, b) => startTime(a) - startTime(b));

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#09090b]";
const MORE_BTN = `mt-3 inline-flex min-h-11 [@media(pointer:fine)]:min-h-0 items-center rounded-sm text-sm font-medium text-amber-700 dark:text-accent underline underline-offset-4 decoration-dotted ${FOCUS}`;

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="m-0 list-none space-y-2 p-0">
      {items.map((item) => (
        <li key={item} className="relative max-w-[70ch] pl-4 text-[0.95rem] leading-[1.6] text-gray-600 dark:text-[#c9c9cf] before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-1 before:rounded-full before:bg-gray-400 dark:before:bg-white/35 before:content-['']">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Bullets with the first `shown` always visible and the rest behind a toggle. */
function MoreBullets({ id, bullets, shown }: { id: string; bullets: string[]; shown: number }) {
  const [open, setOpen] = useState(false);
  const rest = bullets.slice(shown);
  return (
    <div className="mt-4">
      <Bullets items={bullets.slice(0, shown)} />
      {rest.length > 0 && (
        <>
          <div id={id} hidden={!open} className="mt-2">
            <Bullets items={rest} />
          </div>
          <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className={MORE_BTN}>
            {open ? "Show less" : `Show ${rest.length} more`}
          </button>
        </>
      )}
    </div>
  );
}

function NowCard({ entry, primary }: { entry: Entry; primary: boolean }) {
  const { bullets, stack } = parseDescription(entry.description);
  const { Icon, label } = KIND[entry.iconType];
  return (
    <article
      className={`rounded-2xl border p-6 sm:p-7 ${primary
        ? "border-amber-600/30 dark:border-accent/25 bg-white dark:bg-[#101015]"
        : "border-black/[0.08] dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.02]"}`}
    >
      <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-accent">
        <Icon size={15} aria-hidden="true" />
        {label}, now
      </p>
      <h4 className="mt-3 text-xl sm:text-2xl font-semibold leading-snug text-gray-900 dark:text-white text-balance">{entry.title}</h4>
      <p className="mt-1 text-base text-gray-700 dark:text-white/80">{entry.company}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-white/50" suppressHydrationWarning>
        Since {entry.dateStart}, {entry.duration}
        {entry.location ? `. ${entry.location}` : ""}
      </p>
      {bullets.length > 0 && <MoreBullets id={`now-more-${entry.id}`} bullets={bullets} shown={primary ? 4 : 2} />}
      {stack.length > 0 && <p className="mt-5 text-xs leading-relaxed text-gray-500 dark:text-white/45">{stack.join(", ")}</p>}
    </article>
  );
}

function PathStep({ entry, showYear }: { entry: Entry; showYear: boolean }) {
  const { bullets, stack } = parseDescription(entry.description);
  const { Icon, label } = KIND[entry.iconType];
  return (
    <li className="relative pl-12 pb-10 last:pb-0">
      {/* The node on the path, marked by the kind of step */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-[#FAFAF9] dark:bg-[#09090b] text-gray-600 dark:text-white/60"
      >
        <Icon size={15} />
      </span>
      {showYear && (
        <p aria-hidden="true" className="mb-1 text-3xl font-semibold tracking-[-0.03em] tabular-nums text-gray-400 dark:text-white/35">
          {entry.dateStart.slice(-4)}
        </p>
      )}
      <p className="text-sm text-gray-500 dark:text-white/50" suppressHydrationWarning>
        <span className="sr-only">{label}, </span>
        {entry.dateStart} to {entry.dateEnd}, {entry.duration}
      </p>
      <h4 className="mt-1 text-lg font-semibold leading-snug text-gray-900 dark:text-white">{entry.title}</h4>
      <p className="text-sm font-medium text-amber-700 dark:text-accent">{entry.company}</p>
      {bullets.length > 0 && <MoreBullets id={`path-more-${entry.id}`} bullets={bullets} shown={1} />}
      {stack.length > 0 && <p className="mt-3 text-xs text-gray-500 dark:text-white/45">{stack.join(", ")}</p>}
    </li>
  );
}

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.15);

  return (
    <section ref={ref} id="experience" className="mx-auto mb-28 w-full max-w-5xl scroll-mt-28 px-4">
      <SectionHeading kicker="Where I am now, and the road that led here.">Experience</SectionHeading>

      <dl className="mb-8 flex flex-wrap gap-x-10 gap-y-3">
        <div className="flex flex-col-reverse">
          <dt className="text-sm text-gray-600 dark:text-[#a1a1aa]">Full-time</dt>
          <dd className="m-0 text-2xl font-semibold tabular-nums text-gray-900 dark:text-white" suppressHydrationWarning>
            {fmtMonths(experienceMetrics.workRoleMonths)}
          </dd>
        </div>
        <div className="flex flex-col-reverse">
          <dt className="text-sm text-gray-600 dark:text-[#a1a1aa]">Internships</dt>
          <dd className="m-0 text-2xl font-semibold tabular-nums text-gray-900 dark:text-white" suppressHydrationWarning>
            {fmtMonths(experienceMetrics.internMonths)}
          </dd>
        </div>
      </dl>

      <h3 id="experience-now" className="sr-only">Now</h3>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5 items-start">
        {nowWork && <NowCard entry={nowWork} primary />}
        {nowStudy && <NowCard entry={nowStudy} primary={false} />}
      </div>

      {path.length > 0 && (
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-12 gap-y-8">
          <div className="lg:sticky lg:top-24 self-start">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">How I got here</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#a1a1aa]">Oldest first, from the first degree to the current role.</p>
          </div>

          <div>
          <ol className="relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-black/[0.1] dark:before:bg-white/[0.1] before:content-['']">
            {path.map((e, i) => (
              <PathStep key={e.id} entry={e} showYear={i === 0 || path[i - 1].dateStart.slice(-4) !== e.dateStart.slice(-4)} />
            ))}
          </ol>

          <a href="#experience" className={`mt-8 ml-12 inline-flex min-h-11 [@media(pointer:fine)]:min-h-0 items-center gap-2 rounded-sm text-sm font-medium text-gray-700 dark:text-white/75 hover:text-gray-950 dark:hover:text-white ${FOCUS}`}>
            <LuArrowUp size={14} aria-hidden="true" /> Which led to now
          </a>
          </div>
        </div>
      )}
    </section>
  );
}

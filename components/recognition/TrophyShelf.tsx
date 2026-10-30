"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { FaLinkedin } from "react-icons/fa";
import { LuAward, LuBadgeCheck } from "react-icons/lu";
import { MdArrowOutward } from "react-icons/md";

export type Achievement = {
  title: string;
  issuer: string;
  date: string;
  category: string;
  associated_with: string;
  certificate_available: boolean;
  rank?: number;
  ordinal?: string;
  description?: string;
  links?: { linkedin?: string };
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d: string) => {
  const [y, m] = d.split("-");
  return `${MONTHS[+m - 1]} ${y}`;
};
// "1st Place: Hackathon" reads as "Hackathon" on the shelf; the medal already says 1st.
const shortName = (a: Achievement) => a.title.replace(/^\d+(st|nd|rd|th) Place:\s*/i, "");

// Polished-metal faces, lit from the upper left. One hue ramp each.
const METAL: Record<number, { face: string; rim: string; ink: string; name: string }> = {
  1: { face: "radial-gradient(circle at 32% 28%, #fff4c2 0%, #f5c518 45%, #a07a06 100%)", rim: "#8a6a05", ink: "#3b2c00", name: "Gold" },
  2: { face: "radial-gradient(circle at 32% 28%, #ffffff 0%, #cfd4dc 45%, #7c8594 100%)", rim: "#6b7380", ink: "#1f2430", name: "Silver" },
  3: { face: "radial-gradient(circle at 32% 28%, #ffe1c4 0%, #d99565 45%, #8a4b22 100%)", rim: "#7a4220", ink: "#331a08", name: "Bronze" },
};

function Medal({ rank }: { rank: number }) {
  const m = METAL[rank];
  return (
    <span aria-hidden="true" className="relative flex flex-col items-center">
      {/* Ribbon: two bands meeting behind the medal */}
      <span className="flex h-5 sm:h-7 gap-0.5">
        <span className="h-full w-2.5 sm:w-3 -skew-x-12 rounded-sm bg-[#1d4ed8] dark:bg-[#3b5bdb]" />
        <span className="h-full w-2.5 sm:w-3 skew-x-12 rounded-sm bg-[#b91c1c] dark:bg-[#c92a2a]" />
      </span>
      <span
        className="-mt-1 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)]"
        style={{ background: m.face, boxShadow: `inset 0 0 0 3px ${m.rim}55, inset 0 0 0 6px #ffffff22, 0 6px 14px -6px rgba(0,0,0,0.6)` }}
      >
        <span className="text-base sm:text-xl font-bold leading-none" style={{ color: m.ink, fontFamily: "var(--font-instrument-serif), ui-serif, Georgia, serif" }}>
          {rank}
          <sup className="text-[10px] font-semibold">{rank === 1 ? "st" : rank === 2 ? "nd" : "rd"}</sup>
        </span>
      </span>
    </span>
  );
}

function Plaque() {
  return (
    <span aria-hidden="true" className="flex flex-col items-center">
      <span className="mt-3 sm:mt-5 flex h-[3.25rem] w-11 sm:h-[4.25rem] sm:w-14 flex-col items-center justify-center gap-1 rounded-md border-2 border-[#a07a06] bg-[#1a1408] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)]">
        <LuAward size={18} className="text-[#f5c518]" />
        <span className="text-[9px] font-bold tracking-wide text-[#f5c518]">SPOT</span>
      </span>
    </span>
  );
}

function Story({ a }: { a: Achievement }) {
  return (
    <div className="anim-detail-in">
      <p className="text-sm text-fg-2">
        <span className="font-medium text-accent-fg">{a.rank ? `${METAL[a.rank].name}, ${a.category}` : a.category}</span>, {fmtDate(a.date)}
      </p>
      <h4 className="mt-2 text-xl font-semibold leading-snug text-fg">{a.title}</h4>
      <dl className="mt-3 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
        <dt className="text-muted">Awarded by</dt>
        <dd className="m-0 text-fg">{a.issuer}</dd>
        <dt className="text-muted">Represented</dt>
        <dd className="m-0 text-fg">{a.associated_with}</dd>
      </dl>
      {a.description && <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-fg-2">{a.description}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {a.certificate_available && (
          <span className="inline-flex items-center gap-1.5 text-sm text-ok">
            <LuBadgeCheck size={15} aria-hidden="true" /> Certificate on file
          </span>
        )}
        {a.links?.linkedin && (
          <a
            href={a.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/15 dark:border-white/15 px-4 text-sm font-medium text-gray-800 dark:text-white/85
              hover:border-black/30 dark:hover:border-white/35 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <FaLinkedin size={14} aria-hidden="true" /> See the post <MdArrowOutward size={13} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

/** Awards as objects on a shelf: medals for placings, a plaque for the workplace award. */
export default function TrophyShelf({ items }: { items: Achievement[] }) {
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (next === undefined || next < 0 || next >= items.length) return;
    e.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-6">
      <h3 className="text-base font-semibold text-fg">Trophy shelf</h3>
      <p className="mt-0.5 text-sm text-fg-2">Pick one to read its story.</p>

      {/* The shelf: objects stand on a ledge; the picked one lifts off it */}
      <div className="relative mt-4">
        <div role="group" aria-label="Awards" className="relative grid grid-cols-5 items-start gap-1 sm:gap-4 sm:px-2 pt-2">
          {items.map((a, i) => {
            const on = i === active;
            return (
              <button
                key={a.title}
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                aria-pressed={on}
                aria-label={`${a.title}, ${a.issuer}, ${fmtDate(a.date)}`}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className="group flex min-w-0 flex-col items-center rounded-xl pb-3 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span
                  className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${on ? "-translate-y-2" : "group-hover:-translate-y-1"}`}
                >
                  {a.rank ? <Medal rank={a.rank} /> : <Plaque />}
                </span>
                <span className={`mt-2 text-center text-[10.5px] sm:text-xs leading-tight [hyphens:auto] ${on ? "font-semibold text-fg " : "text-fg-2 "}`}>
                  {shortName(a)}
                </span>
                <span className="mt-0.5 font-mono text-[11px] text-muted">{a.date.slice(0, 4)}</span>
              </button>
            );
          })}
        </div>
        {/* The ledge */}
        <div aria-hidden="true" className="mx-2 h-2 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 dark:from-white/[0.12] dark:to-white/[0.05] shadow-[0_8px_16px_-8px_rgba(0,0,0,0.5)]" />
      </div>

      <div aria-live="polite" className="mt-6 border-t border-line pt-5">
        <Story key={active} a={items[active]} />
      </div>
    </div>
  );
}

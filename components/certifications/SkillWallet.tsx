"use client";

import { useState } from "react";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import CertRow from "./CertRow";
import { fmtDate, type Cert } from "./data";
import { tracks, type Track } from "./tracks";
import { kindOf, yearOf } from "../projects/meta";

const SHOWN = 5;
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-accent";

function TrackPicker({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  return (
    <div role="group" aria-label="Skills" className="-mx-4 px-4 scroll-px-4 flex gap-2 overflow-x-auto scrollbar-hide snap-x sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
      {tracks.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(t.id)}
            className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm transition-colors duration-150 ${FOCUS}
              ${on
                ? "border-amber-600/60 bg-amber-500/10 text-gray-950 dark:border-accent/60 dark:bg-accent/10 dark:text-white"
                : "border-black/10 text-gray-700 hover:border-black/25 dark:border-white/10 dark:text-white/70 dark:hover:border-white/30"}`}
          >
            {t.label}
            <span className={`tabular-nums text-xs ${on ? "text-amber-700 dark:text-accent" : "text-gray-500 dark:text-white/45"}`}>{t.certs.length}</span>
          </button>
        );
      })}
    </div>
  );
}

function VerifiedBy({ track, onDetails }: { track: Track; onDetails: (c: Cert) => void }) {
  const [all, setAll] = useState(false);
  const list = all ? track.certs : track.certs.slice(0, SHOWN);
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-600 dark:text-white/55">Verified by {track.certs.length} certificates</h4>
      <ul className="mt-2 border-t border-black/[0.08] dark:border-white/[0.07]">
        {list.map((c) => (
          <CertRow key={c.id} cert={c} compact onDetails={() => onDetails(c)} />
        ))}
      </ul>
      {track.certs.length > SHOWN && (
        <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className={`mt-3 text-sm font-medium text-amber-700 dark:text-accent hover:underline underline-offset-4 rounded-sm ${FOCUS}`}>
          {all ? "Show fewer" : `Show all ${track.certs.length}`}
        </button>
      )}
    </div>
  );
}

function UsedIn({ track }: { track: Track }) {
  if (track.projects.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-600 dark:text-white/55">Used in {track.projects.length} projects</h4>
      <ul className="mt-2 border-t border-black/[0.08] dark:border-white/[0.07]">
        {track.projects.map((p) => (
          <li key={p.title} className="border-b border-black/[0.08] dark:border-white/[0.07]">
            <Link href={p.href} className={`group flex items-center justify-between gap-3 py-3 rounded-sm ${FOCUS}`}>
              <span className="min-w-0">
                <span className="block text-[0.95rem] font-medium leading-snug text-gray-900 dark:text-white group-hover:underline underline-offset-4">{p.title}</span>
                <span className="block text-sm text-gray-500 dark:text-white/45">
                  {kindOf(p)}, {yearOf(p)}
                </span>
              </span>
              <LuArrowRight size={15} aria-hidden="true" className="shrink-0 text-gray-400 dark:text-white/35 group-hover:text-amber-700 dark:group-hover:text-accent transition-colors duration-150" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Skills first, each backed by the certificates that verify it and the projects that use it. */
export default function SkillWallet({ onDetails }: { onDetails: (c: Cert) => void }) {
  const [active, setActive] = useState(tracks[0]?.id ?? "");
  const track = tracks.find((t) => t.id === active) ?? tracks[0];
  if (!track) return null;

  return (
    <div className="flex flex-col gap-6">
      <TrackPicker active={active} onPick={setActive} />
      <div aria-live="polite" className="rounded-2xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#101015] p-5 sm:p-8">
        <div key={track.id} className="anim-detail-in">
          <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.01em] text-gray-900 dark:text-white">{track.label}</h3>
          <p className="mt-1.5 text-sm text-gray-600 dark:text-white/55">
            {track.certs.length} certificates, most recently {fmtDate(track.latest)}
            {track.projects.length > 0 ? `, and ${track.projects.length} projects where it was put to work.` : "."}
          </p>
          <div className={`mt-6 grid grid-cols-1 gap-8 ${track.projects.length > 0 ? "lg:grid-cols-2 lg:gap-12" : ""}`}>
            <VerifiedBy key={track.id} track={track} onDetails={onDetails} />
            <UsedIn track={track} />
          </div>
        </div>
      </div>
    </div>
  );
}

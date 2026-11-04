"use client";

import { useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuTrophy } from "react-icons/lu";
import CopyButton from "@/components/tools/CopyButton";
import { PANEL, PRIMARY_BTN } from "@/components/tools/styles";
import { statsFor, type Progress } from "./store";
import type { Level } from "./types";

// The card celebrates only when the last level was just cleared, not on every later visit.
const FRESH_WIN_MS = 15_000;

function duration(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60_000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${min % 60} min`;
}

/** Shown once level 5 is cleared: the run in numbers, shareable as text (never the passwords). */
export default function WinCard({ levels, progress }: { levels: Level[]; progress: Progress }) {
  const rows = levels.map((l) => {
    const s = statsFor(progress, l.level);
    return { level: l.level, name: l.name, attempts: s.best ?? s.attempts, cleared: Boolean(s.cleared) };
  });
  const cleared = rows.filter((r) => r.cleared).length;
  const total = rows.reduce((sum, r) => sum + r.attempts, 0);
  const took = progress.startedAt && progress.finishedAt ? duration(progress.finishedAt - progress.startedAt) : null;

  const summary = () =>
    [
      `I cleared ${cleared} of ${levels.length} levels of Selvin's prompt-injection challenge in ${total} messages${took ? ` (${took})` : ""}.`,
      rows.map((r) => `Level ${r.level} (${r.name}): ${r.attempts}`).join(", "),
      `Try it: ${window.location.origin}/challenge`,
    ].join("\n");

  const [fresh] = useState(() => progress.finishedAt !== undefined && Date.now() - progress.finishedAt < FRESH_WIN_MS);

  return (
    <section aria-labelledby="challenge-win" className={`${PANEL} relative flex flex-col gap-5 p-5 sm:p-6 ${fresh ? "win-in win-ring" : ""}`}>
      <div className="flex items-start gap-3">
        <LuTrophy size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-fg" />
        <div>
          <h2 id="challenge-win" className="text-lg font-semibold text-fg">
            You broke all five levels
          </h2>
          <p className="mt-1 text-sm text-fg-2">
            Every defense here is one I use in production, so the way you got through is worth patching.
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Levels cleared</dt>
          <dd className="font-mono text-xl tabular-nums text-fg">
            {cleared}/{levels.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Messages sent</dt>
          <dd className="font-mono text-xl tabular-nums text-fg">{total}</dd>
        </div>
        {took && (
          <div>
            <dt className="text-xs text-muted">Time taken</dt>
            <dd className="font-mono text-xl tabular-nums text-fg">{took}</dd>
          </div>
        )}
      </dl>

      <ol aria-label="Messages per level" className="flex flex-col divide-y divide-line border-y border-line text-sm">
        {rows.map((r) => (
          <li key={r.level} className="flex items-baseline justify-between gap-3 py-2">
            <span className="min-w-0 text-fg-2">
              Level {r.level}, {r.name}
            </span>
            <span className="shrink-0 font-mono tabular-nums text-fg">
              {r.attempts} {r.attempts === 1 ? "message" : "messages"}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/#contact" className={PRIMARY_BTN}>
          Tell Selvin
          <LuArrowRight size={15} aria-hidden="true" />
        </Link>
        <CopyButton text={summary} label="Copy result" />
      </div>
    </section>
  );
}

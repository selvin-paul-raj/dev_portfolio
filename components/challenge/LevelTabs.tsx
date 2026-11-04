"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { LuCheck, LuLock } from "react-icons/lu";
import { FOCUS } from "@/components/tools/styles";
import type { Level } from "./types";

export const tabId = (level: number) => `challenge-tab-${level}`;
export const PANEL_ID = "challenge-panel";

const GRID = "grid grid-cols-2 gap-2 sm:grid-cols-5";

/** Placeholder with the same footprint as the tabs while the levels load. */
export function LevelTabsSkeleton() {
  return (
    <div className={GRID}>
      <span className="sr-only" role="status">Loading levels</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" className="h-[4.75rem] rounded-xl bg-surface-3 animate-pulse motion-reduce:animate-none" />
      ))}
    </div>
  );
}

/** Level tabs with roving tabindex; Left/Right/Home/End move between the unlocked ones. */
export default function LevelTabs({
  levels,
  selected,
  unlocked,
  isCleared,
  onSelect,
}: {
  levels: Level[];
  selected: number;
  unlocked: number;
  isCleared: (level: number) => boolean;
  onSelect: (level: number) => void;
}) {
  const refs = useRef(new Map<number, HTMLButtonElement>());
  const open = levels.filter((l) => l.level <= unlocked).map((l) => l.level);

  function onKeyDown(e: KeyboardEvent) {
    const i = open.indexOf(selected);
    const target =
      e.key === "ArrowRight" ? open[(i + 1) % open.length]
      : e.key === "ArrowLeft" ? open[(i - 1 + open.length) % open.length]
      : e.key === "Home" ? open[0]
      : e.key === "End" ? open[open.length - 1]
      : undefined;
    if (target === undefined) return;
    e.preventDefault();
    onSelect(target);
    refs.current.get(target)?.focus();
  }

  return (
    <div role="tablist" aria-label="Levels" onKeyDown={onKeyDown} className={GRID}>
      {levels.map((l) => {
        const locked = l.level > unlocked;
        const on = l.level === selected;
        const cleared = isCleared(l.level);
        return (
          <button
            key={l.level}
            ref={(el) => {
              if (el) refs.current.set(l.level, el);
              else refs.current.delete(l.level);
            }}
            id={tabId(l.level)}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={PANEL_ID}
            aria-disabled={locked || undefined}
            tabIndex={on ? 0 : -1}
            onClick={() => !locked && onSelect(l.level)}
            className={`flex min-h-11 flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors duration-150 ${FOCUS} ${
              on
                ? "border-accent/60 bg-accent/10"
                : locked
                  ? "cursor-not-allowed border-dashed border-line"
                  : "border-line hover:border-line-strong hover:bg-surface-3"
            }`}
          >
            <span className="text-xs text-muted">Level {l.level}</span>
            <span className={`text-sm font-medium ${locked ? "text-fg-2" : "text-fg"}`}>{l.name}</span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-fg-2">
              {locked ? (
                <>
                  <LuLock size={12} aria-hidden="true" className="shrink-0" />
                  Clear level {l.level - 1} first
                </>
              ) : cleared ? (
                <>
                  <LuCheck size={12} aria-hidden="true" className="shrink-0 text-ok" />
                  Cleared
                </>
              ) : (
                "Not cleared yet"
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

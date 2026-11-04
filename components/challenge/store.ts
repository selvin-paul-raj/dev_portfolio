"use client";

// Progress (localStorage) and per-level chat logs (sessionStorage), read through
// useSyncExternalStore so the server render (nothing stored) and hydration agree.
// Every storage call is wrapped: in private mode the game keeps working from an
// in-memory copy, it just won't survive a reload.
import { useMemo, useSyncExternalStore } from "react";
import { GUESS_WINDOW_MS, type Msg } from "./types";

type Area = "local" | "session";

function createStore(area: Area, key: string, legacy?: () => string | null) {
  let memory: string | null = null;
  const listeners = new Set<() => void>();
  const storage = () => (area === "local" ? window.localStorage : window.sessionStorage);

  function get(): string | null {
    try {
      return storage().getItem(key) ?? memory ?? legacy?.() ?? null;
    } catch {
      return memory;
    }
  }

  function set(value: string) {
    memory = value;
    try {
      storage().setItem(key, value);
    } catch {
      // Storage unavailable or full: the in-memory copy carries this session.
    }
    listeners.forEach((l) => l());
  }

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) onChange();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { get, set, subscribe };
}

function parseJson<T>(raw: string | null): Partial<T> {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" ? (value as Partial<T>) : {};
  } catch {
    return {};
  }
}

// ── Progress ────────────────────────────────────────────────────────────────

export type LevelStats = {
  /** Messages sent at this level, all time. */
  attempts: number;
  /** Messages sent since the level was last cleared (becomes `best` on a clear). */
  run: number;
  guesses: number;
  /** Fewest messages it took to clear the level. */
  best?: number;
  cleared?: boolean;
};

export type Progress = {
  /** Highest level that can be played (6 once all five are cleared). */
  unlocked: number;
  levels: Record<string, LevelStats>;
  startedAt?: number;
  finishedAt?: number;
  /** Recent guess times, to estimate how many of the server's guesses are left. */
  guessTimes: number[];
};

// Before stats existed, progress was a bare level number under this key.
const LEGACY_KEY = "spr-challenge-level";

function legacyProgress(): string | null {
  const saved = Number(window.localStorage.getItem(LEGACY_KEY));
  return saved >= 1 ? JSON.stringify({ unlocked: saved, levels: {}, guessTimes: [] }) : null;
}

const progressStore = createStore("local", "spr-challenge-progress", legacyProgress);

function parseProgress(raw: string | null): Progress {
  const p = parseJson<Progress>(raw);
  return {
    unlocked: typeof p.unlocked === "number" && p.unlocked >= 1 ? p.unlocked : 1,
    levels: p.levels && typeof p.levels === "object" ? p.levels : {},
    startedAt: p.startedAt,
    finishedAt: p.finishedAt,
    guessTimes: Array.isArray(p.guessTimes) ? p.guessTimes : [],
  };
}

export const statsFor = (p: Progress, level: number): LevelStats => p.levels[level] ?? { attempts: 0, run: 0, guesses: 0 };

export function useProgress(): Progress {
  const raw = useSyncExternalStore(progressStore.subscribe, progressStore.get, () => null);
  return useMemo(() => parseProgress(raw), [raw]);
}

function updateProgress(fn: (p: Progress) => Progress) {
  progressStore.set(JSON.stringify(fn(parseProgress(progressStore.get()))));
}

function updateLevel(level: number, fn: (s: LevelStats) => LevelStats, extra: (p: Progress) => Partial<Progress> = () => ({})) {
  updateProgress((p) => ({ ...p, ...extra(p), levels: { ...p.levels, [level]: fn(statsFor(p, level)) } }));
}

export function recordAttempt(level: number, now: number) {
  updateLevel(level, (s) => ({ ...s, attempts: s.attempts + 1, run: s.run + 1 }), (p) => ({ startedAt: p.startedAt ?? now }));
}

/** Records a guess and returns how many guess timestamps fall inside the server's window. */
export function recordGuess(level: number, now: number): number {
  let recent = 0;
  updateLevel(
    level,
    (s) => ({ ...s, guesses: s.guesses + 1 }),
    (p) => {
      const guessTimes = [...p.guessTimes.filter((t) => now - t < GUESS_WINDOW_MS), now];
      recent = guessTimes.length;
      return { guessTimes, startedAt: p.startedAt ?? now };
    }
  );
  return recent;
}

export function recordClear(level: number, now: number, lastLevel: number) {
  updateLevel(
    level,
    (s) => ({ ...s, cleared: true, best: s.best === undefined ? s.run : Math.min(s.best, s.run), run: 0 }),
    (p) => ({
      unlocked: Math.max(p.unlocked, level + 1),
      finishedAt: level === lastLevel ? (p.finishedAt ?? now) : p.finishedAt,
    })
  );
}

// ── Chat logs, one per level, for this tab only ─────────────────────────────

const MAX_LOG = 40;
const logStore = createStore("session", "spr-challenge-log");

export function useLog(level: number): Msg[] {
  const raw = useSyncExternalStore(logStore.subscribe, logStore.get, () => null);
  return useMemo(() => {
    const log = parseJson<Record<string, Msg[]>>(raw)[level];
    return Array.isArray(log) ? log : [];
  }, [raw, level]);
}

export function appendLog(level: number, msg: Msg) {
  const logs = parseJson<Record<string, Msg[]>>(logStore.get());
  const current = Array.isArray(logs[level]) ? logs[level] : [];
  logStore.set(JSON.stringify({ ...logs, [level]: [...current, msg].slice(-MAX_LOG) }));
}

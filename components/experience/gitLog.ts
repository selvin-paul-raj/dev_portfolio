import { experiencesData } from "@/lib/data";

export type Entry = (typeof experiencesData)[number];
export type Lane = 0 | 1 | 2;

export const LANES = [
  { name: "work", dot: "bg-amber-500 dark:bg-accent", line: "bg-amber-500/60 dark:bg-accent/60", text: "text-amber-700 dark:text-accent" },
  { name: "study", dot: "bg-sky-500 dark:bg-sky-400", line: "bg-sky-500/50 dark:bg-sky-400/50", text: "text-sky-700 dark:text-sky-300" },
  { name: "founder", dot: "bg-emerald-500 dark:bg-emerald-400", line: "bg-emerald-500/50 dark:bg-emerald-400/50", text: "text-emerald-700 dark:text-emerald-300" },
] as const;

export const laneOf = (e: Entry): Lane => (e.iconType === "graduation" ? 1 : e.iconType === "laptop" ? 2 : 0);

const monthTime = (s: string) => (s === "Present" ? Date.now() : Date.parse(`1 ${s}`));
export const startOf = (e: Entry) => monthTime(e.dateStart);

/** A short, stable "commit hash" for an entry: FNV-1a over its id, as 7 hex digits. Decorative. */
export function shortHash(e: Entry): string {
  let h = 0x811c9dc5;
  for (const ch of `${e.id}:${e.title}:${e.dateStart}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 7);
}

/** Newest first, like `git log`. */
export const commits: Entry[] = [...experiencesData].sort((a, b) => startOf(b) - startOf(a));

export type GraphRow = { lane: Lane; up: boolean[]; down: boolean[] };

// Each lane is a branch: its line runs from its newest commit down to its oldest, and on up
// past the top when that newest commit is still running (HEAD).
const span = ([0, 1, 2] as Lane[]).map((lane) => {
  const rows = commits.flatMap((c, i) => (laneOf(c) === lane ? [i] : []));
  return { first: rows[0] ?? -1, last: rows[rows.length - 1] ?? -1, live: rows.length > 0 && commits[rows[0]].isCurrent };
});

/** Per row: its own lane, and which lanes run above and below its dot. */
export const graph: GraphRow[] = commits.map((e, i) => ({
  lane: laneOf(e),
  up: span.map((s) => s.first >= 0 && ((i > s.first && i <= s.last) || (i <= s.first && s.live))),
  down: span.map((s) => s.first >= 0 && ((i >= s.first && i < s.last) || (i < s.first && s.live))),
}));

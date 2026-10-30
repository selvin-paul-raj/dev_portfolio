import { experiencesData } from "@/lib/data";
import { monthsBetween } from "@/utils/calculateDuration";

export type Entry = (typeof experiencesData)[number];

const STACK_PREFIX = /^(stack|technologies)\s*:\s*/i;

/** Split a raw description into bullet lines plus an optional trailing stack list. */
export function parseDescription(raw: string | undefined): { bullets: string[]; stack: string[] } {
  const lines = (raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-•]+/, "").trim())
    .filter(Boolean);

  const stack: string[] = [];
  const bullets = lines.filter((line) => {
    if (!STACK_PREFIX.test(line)) return true;
    stack.push(
      ...line
        .replace(STACK_PREFIX, "")
        .replace(/\.$/, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    return false;
  });

  return { bullets, stack };
}

// The axis runs from the January of the earliest start to two months past today.
const earliestYear = Math.min(...experiencesData.map((e) => parseInt(e.dateStart.split(" ")[1], 10)));
const AXIS_START = `Jan ${earliestYear}`;
const AXIS_MONTHS = monthsBetween(AXIS_START, "Present") + 2;

const pct = (months: number) => `${(Math.max(0, months) / AXIS_MONTHS) * 100}%`;

/** Where an entry's bar sits on the axis, as CSS left/width percentages. End month is inclusive. */
export function barPosition(e: Entry): { left: string; width: string } {
  return {
    left: pct(monthsBetween(AXIS_START, e.dateStart)),
    width: pct(monthsBetween(e.dateStart, e.dateEnd) + 1),
  };
}

/** One tick per January on the axis. */
export function yearTicks(): Array<{ year: number; left: string }> {
  const last = new Date().getFullYear();
  const ticks = [];
  for (let y = earliestYear; y <= last; y++) ticks.push({ year: y, left: pct(monthsBetween(AXIS_START, `Jan ${y}`)) });
  return ticks;
}

const startKey = (e: Entry) => -monthsBetween(AXIS_START, e.dateStart);

/** Newest start first, work and study apart. */
export const workEntries = experiencesData.filter((e) => e.iconType !== "graduation").sort((a, b) => startKey(a) - startKey(b));
export const studyEntries = experiencesData.filter((e) => e.iconType === "graduation").sort((a, b) => startKey(a) - startKey(b));

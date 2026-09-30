// utils/calculateDuration.ts
// Duration helpers for "Mon YYYY" date strings (e.g. "Mar 2024"). An end of
// "Present" means the current month. Kept free of "@/" aliases so the
// standalone MCP build (tsconfig.server.json) can compile it with plain tsc.

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type MonthYear = { monthIndex: number; year: number };

function parseMonthYear(value: string): MonthYear {
  if (value === "Present") {
    const now = new Date();
    return { monthIndex: now.getMonth(), year: now.getFullYear() };
  }
  const [month = "", year = ""] = value.trim().split(/\s+/);
  return { monthIndex: MONTH_NAMES.indexOf(month), year: parseInt(year, 10) };
}

/**
 * Whole months elapsed from `start` to `end` (end-exclusive, so
 * "Jan 2024" → "Mar 2024" is 2). Returns 0 for unparseable or reversed ranges.
 */
export function monthsBetween(start: string, end: string): number {
  const s = parseMonthYear(start);
  const e = parseMonthYear(end);
  if (s.monthIndex < 0 || e.monthIndex < 0 || Number.isNaN(s.year) || Number.isNaN(e.year)) return 0;
  return Math.max(0, (e.year - s.year) * 12 + (e.monthIndex - s.monthIndex));
}

const plural = (n: number, unit: string): string => `${n} ${unit}${n === 1 ? "" : "s"}`;

/** Formats a month count, e.g. "1 yr", "2 yrs 3 months", "1 month", "0 months". */
export function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(plural(years, "yr"));
  if (months > 0 || years === 0) parts.push(plural(months, "month"));
  return parts.join(" ");
}

const calculateDuration = (start: string, end: string): string => formatDuration(monthsBetween(start, end));

export default calculateDuration;

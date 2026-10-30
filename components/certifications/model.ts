import rawCerts from "@/lib/data/certifications.json";

export type Cert = (typeof rawCerts)[number];

export const certs: Cert[] = rawCerts.filter((c) => c.show).sort((a, b) => b.date.localeCompare(a.date));
export const featured = certs.filter((c) => c.featured);
export const issuers = [...new Set(certs.map((c) => c.issuer))];

// The categories that count as AI on the heatmap; everything else is web and other.
const AI_CATEGORIES = new Set(["AI Engineering", "Agentic AI", "Generative AI", "Data Science"]);
export const isAI = (c: Cert) => AI_CATEGORIES.has(c.category);

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthKey = (c: Cert) => c.date.slice(0, 7); // "2026-06"
export const yearOf = (c: Cert) => c.date.slice(0, 4);

/** "Jun 2026" from "2026-06" or "2026-06-14"; no Date objects, so server and client agree. */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[+m - 1]} ${y}`;
}

export type Cell = { key: string; total: number; ai: number };

/** Year rows (newest first) by twelve month cells, counted from the certificate dates. */
export const years = [...new Set(certs.map(yearOf))].sort().reverse();
export const grid: Record<string, Cell[]> = Object.fromEntries(
  years.map((y) => [
    y,
    MONTHS.map((_, i) => {
      const key = `${y}-${String(i + 1).padStart(2, "0")}`;
      const inMonth = certs.filter((c) => monthKey(c) === key);
      return { key, total: inMonth.length, ai: inMonth.filter(isAI).length };
    }),
  ])
);

const allCells = Object.values(grid).flat();
export const busiest = allCells.reduce((best, c) => (c.total > best.total ? c : best), allCells[0]);
export const aiTotal = certs.filter(isAI).length;

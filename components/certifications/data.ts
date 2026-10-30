import rawCertsAll from "@/lib/data/certifications.json";

export type Cert = (typeof rawCertsAll)[number];

export const certs = rawCertsAll.filter((c) => c.show);
export const featuredCerts = certs.filter((c) => c.featured).sort((a, b) => b.date.localeCompare(a.date));
export const issuers = [...new Set(certs.map((c) => c.issuer))].sort();
export const categories = [...new Set(certs.map((c) => c.category))].sort();
export const years = [...new Set(certs.map((c) => String(+c.date.split("-")[0])))].sort();

const MONTHS_S = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_L = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* Deterministic date helpers: no new Date() to avoid SSR/client hydration mismatch */
export function fmtDate(d: string): string {
  const [y, m] = d.split("-");
  return `${MONTHS_S[+m - 1]} ${y}`;
}
export function fmtDateLong(d: string): string {
  const [y, m, day] = d.split("-");
  return `${MONTHS_L[+m - 1]} ${+day}, ${y}`;
}
export function yearOf(d: string): number { return +d.split("-")[0]; }

const ISSUER_COLORS: Record<string, string> = {
  /* AI platforms */
  "Anthropic":          "#e8966e",
  "DeepLearning.AI":    "#ff6b9d",
  "Hugging Face":       "#ffb84d",
  /* Cloud / tech giants */
  "AWS":                "#ff9900",
  "IBM":                "#5fa0ff",
  "Microsoft":          "#5ec4eb",
  "Google":             "#ea7e6a",
  "Meta":               "#5d8bf0",
  /* Learning platforms */
  "Coursera":           "#4f7df0",
  "LinkedIn":           "#0a66c2",
  "LinkedIn Learning":  "#0a66c2",
  "Udemy":              "#a435f0",
  "Simplilearn":        "#f94f4f",
  "Cognitive Class":    "#be6ef5",
  /* Regional / niche */
  "HackerRank":         "#2ec866",
  "GUVI":               "#00C896",
  "HCL GUVI":           "#00b89c",
  "NPTEL":              "#f47b20",
  "Edunet Foundation":  "#34c98a",
};

function hashIssuerColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return `hsl(${(h % 300) + 30}, 62%, 60%)`;
}
export function issuerColor(name: string): string {
  return ISSUER_COLORS[name] ?? hashIssuerColor(name);
}

/** Two-letter issuer mark: word initials ("HF"), or the first two letters of a one-word name ("An", "AM"). */
export function initials(s: string) {
  const words = s.split(/\s+/).filter(Boolean);
  return words.length > 1 ? words.map((w) => w[0]).slice(0, 2).join("").toUpperCase() : s.slice(0, 2);
}


/** The chart folds the seven categories into three groups so its colour stays restrained. */
export type Group = "ai" | "web" | "other";
const AI_CATEGORIES = new Set(["AI Engineering", "Agentic AI", "Generative AI"]);
export const groupOf = (c: Cert): Group => (AI_CATEGORIES.has(c.category) ? "ai" : c.category === "Web Development" ? "web" : "other");
export const GROUP_LABEL: Record<Group, string> = { ai: "AI and agents", web: "Web development", other: "Other" };

export type YearStat = { year: string; total: number } & Record<Group, number>;

export const yearStats: YearStat[] = years.map((year) => {
  const row: YearStat = { year, total: 0, ai: 0, web: 0, other: 0 };
  for (const c of certs) {
    if (!c.date.startsWith(year)) continue;
    row.total++;
    row[groupOf(c)]++;
  }
  return row;
});

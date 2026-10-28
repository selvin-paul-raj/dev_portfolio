// lib/ask/retrieve.ts
// Builds a citable document set from the portfolio data and ranks it with
// BM25. Powers "Ask Selvin" (/ask, /api/ask) and its offline evals
// (scripts/evals.ts). Pure and data-injected like lib/mcp/dispatch.ts — no
// "@/" aliases or JSON imports, so plain tsc can compile it.

export interface AskData {
  projects: Array<{ show: boolean; title: string; description: string; tags: string[]; code?: string | null; live?: string | null; private?: boolean }>;
  experiences: Array<{ title: string; company: string; description: string; dateStart: string; dateEnd: string; icon: string }>;
  certifications: Array<{ show: boolean; title: string; issuer: string; date?: string | null; skills?: string[] | null; verifyUrl?: string | null }>;
  recognition: {
    achievements: Array<{ title: string; issuer: string; date: string; description?: string }>;
    publications: Array<{ title: string; publisher: string; publication_date: string; description: string }>;
  };
  skills: { skills: Record<string, string[]> };
  profile: { name: string; summary: string; roleNote: string; location: string; email: string; openTo: readonly string[]; currentCompany: string; currentRole: string; education: string };
}

export interface Doc {
  id: string;
  kind: "profile" | "work" | "education" | "project" | "certification" | "award" | "publication" | "skills";
  title: string;
  text: string;
  /** Where a reader can verify it: an external link or an on-site anchor. */
  url: string;
}

export interface Hit extends Doc {
  score: number;
  /** Share of the query's terms that appear in this doc (0–1). */
  coverage: number;
}

const bullets = (text: string) =>
  text
    .split(/\n+/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

export function buildDocs(data: AskData): Doc[] {
  const docs: Doc[] = [];
  const p = data.profile;

  docs.push({
    id: "profile",
    kind: "profile",
    title: `${p.name} — profile`,
    text: `${p.summary} ${p.roleNote} Current role: ${p.currentRole} at ${p.currentCompany}. Based in ${p.location}. Open to ${p.openTo.join(", ")} roles. Email ${p.email}. Education: ${p.education}.`,
    url: "/#about",
  });

  data.experiences.forEach((e, i) => {
    const kind = e.icon === "graduation" ? "education" : "work";
    const lines = bullets(e.description);
    const source = `${e.title} · ${e.company} (${e.dateStart} – ${e.dateEnd})`;
    // One doc per bullet keeps citations precise; education stays whole.
    (kind === "work" ? lines : [lines.join(" ")]).forEach((line, j) => {
      docs.push({ id: `exp-${i}-${j}`, kind, title: source, text: line, url: "/#experience" });
    });
  });

  data.projects
    .filter((pr) => pr.show)
    .forEach((pr, i) => {
      docs.push({
        id: `project-${i}`,
        kind: "project",
        title: pr.private ? `${pr.title} (work project, private)` : pr.title,
        text: `${pr.description} Tech: ${pr.tags.join(", ")}.`,
        url: pr.live || pr.code || "/#projects",
      });
    });

  data.certifications
    .filter((c) => c.show)
    .forEach((c, i) => {
      docs.push({
        id: `cert-${i}`,
        kind: "certification",
        title: `${c.title} — ${c.issuer}`,
        text: `Certification: ${c.title} from ${c.issuer}${c.date ? ` (${c.date})` : ""}. Skills: ${(c.skills ?? []).join(", ")}.`,
        url: c.verifyUrl || "/#certifications",
      });
    });

  data.recognition.achievements.forEach((a, i) => {
    docs.push({ id: `award-${i}`, kind: "award", title: `${a.title} — ${a.issuer}`, text: `Award / recognition: ${a.title} from ${a.issuer}. ${a.description ?? ""} (${a.date})`, url: "/#recognition" });
  });
  data.recognition.publications.forEach((pub, i) => {
    docs.push({ id: `pub-${i}`, kind: "publication", title: `${pub.title} — ${pub.publisher}`, text: `Published research paper: ${pub.description} (${pub.publication_date})`, url: "/#recognition" });
  });

  for (const [group, items] of Object.entries(data.skills.skills)) {
    if (group === "all" || !items.length) continue;
    docs.push({ id: `skills-${group}`, kind: "skills", title: `Skills — ${group.replace(/_/g, " ")}`, text: items.join(", "), url: "/#skills" });
  }

  return docs;
}

const STOPWORDS = new Set(
  "a an and are as at be by does did do for from has have he him his how i in is it its me my of on or selvin selvin's paulraj s tell that the their them to was what when where which who why with you your about any can".split(" ")
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/[\s/-]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t));
}

export interface Index {
  docs: Doc[];
  tf: Map<string, number>[];
  len: number[];
  avgLen: number;
  df: Map<string, number>;
}

export function buildIndex(docs: Doc[]): Index {
  const tf = docs.map((d) => {
    const m = new Map<string, number>();
    // Titles carry the entity name (project, company); weight them double.
    for (const t of [...tokenize(d.title), ...tokenize(d.title), ...tokenize(d.text)]) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  });
  const len = tf.map((m) => [...m.values()].reduce((a, b) => a + b, 0));
  const df = new Map<string, number>();
  for (const m of tf) for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  return { docs, tf, len, avgLen: len.reduce((a, b) => a + b, 0) / Math.max(docs.length, 1), df };
}

/** Okapi BM25 (k1 = 1.2, b = 0.75). Returns hits with score > 0, best first. */
export function search(index: Index, query: string, k = 5): Hit[] {
  const terms = [...new Set(tokenize(query))];
  const N = index.docs.length;
  const scored = index.docs.map((doc, i) => {
    let score = 0;
    let matched = 0;
    for (const t of terms) {
      const f = index.tf[i].get(t);
      if (!f) continue;
      matched++;
      const n = index.df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * ((f * 2.2) / (f + 1.2 * (1 - 0.75 + (0.75 * index.len[i]) / index.avgLen)));
    }
    return { ...doc, score: Math.round(score * 100) / 100, coverage: terms.length ? matched / terms.length : 0 };
  });
  return scored.filter((h) => h.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
}

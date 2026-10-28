// lib/ask/retrieve.ts
// Builds a citable document set from the portfolio data and ranks it with
// BM25 via bm25s (Lucene variant) with Porter stemming. Powers "Ask Selvin"
// (/ask, /api/ask) and its evals (evals/run.ts). Data-injected like lib/mcp/dispatch.ts: no
// "@/" aliases or JSON imports, so plain tsc can compile it.

import { BM25 } from "bm25s";
import { stemmer } from "stemmer";

export interface AskData {
  projects: Array<{ show: boolean; title: string; description: string; tags: string[]; code?: string | null; live?: string | null; private?: boolean }>;
  experiences: Array<{ title: string; company: string; description: string; dateStart: string; dateEnd: string; icon: string }>;
  certifications: Array<{ show: boolean; title: string; issuer: string; date?: string | null; skills?: string[] | null; verifyUrl?: string | null }>;
  recognition: {
    achievements: Array<{ title: string; issuer: string; date: string; description?: string }>;
    publications: Array<{ title: string; publisher: string; publication_date: string; description: string }>;
  };
  skills: { skills: Record<string, string[]> };
  caseStudies?: Array<{ slug: string; title: string; problem: string; steps: Array<{ title: string; body: string }>; deepDive?: Array<{ heading: string; body: string }>; results: Array<{ value: string; label: string }> }>;
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

  for (const c of data.caseStudies ?? []) {
    const url = `/work/${c.slug}`;
    docs.push({ id: `case-${c.slug}`, kind: "project", title: `${c.title} — case study`, text: `${c.problem} Results: ${c.results.map((r) => `${r.value} ${r.label}`).join("; ")}.`, url });
    c.steps.forEach((s, i) => docs.push({ id: `case-${c.slug}-${i}`, kind: "project", title: `${c.title}: ${s.title}`, text: s.body, url }));
    (c.deepDive ?? []).forEach((s, i) => docs.push({ id: `case-${c.slug}-d${i}`, kind: "project", title: `${c.title}: ${s.heading}`, text: s.body, url }));
  }

  for (const [group, items] of Object.entries(data.skills.skills)) {
    if (group === "all" || !items.length) continue;
    docs.push({ id: `skills-${group}`, kind: "skills", title: `Skills — ${group.replace(/_/g, " ")}`, text: items.join(", "), url: "/#skills" });
  }

  return docs;
}

const STOPWORDS = new Set(
  "a an and are as at be by does did do for from has have he him his how i in is it its me my of on or selvin selvin's paulraj s tell that the their them to was what when where which who why with you your about any can".split(" ")
);

/** Lowercase, split, drop stopwords, Porter-stem (as bm25s does with PyStemmer). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/[\s/-]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => (/^[a-z]+$/.test(t) ? stemmer(t) : t));
}

export interface Index {
  docs: Doc[];
  bm25: BM25;
  vocab: Map<string, number>;
  /** Distinct tokens per doc, for query-term coverage. */
  termSets: Set<string>[];
}

// bm25s defaults (Lucene variant, k1 = 1.5, b = 0.75), matching upstream bm25s.
const BM25_OPTIONS = { method: "lucene", k1: 1.5, b: 0.75 } as const;

export function buildIndex(docs: Doc[]): Index {
  const vocab = new Map<string, number>();
  const idOf = (t: string) => {
    let id = vocab.get(t);
    if (id === undefined) {
      id = vocab.size;
      vocab.set(t, id);
    }
    return id;
  };
  // Titles carry the entity name (project, company); repeat them to weight them double.
  const tokens = docs.map((d) => [...tokenize(d.title), ...tokenize(d.title), ...tokenize(d.text)]);
  const bm25 = new BM25(BM25_OPTIONS);
  bm25.index(tokens.map((ts) => ts.map(idOf)));
  return { docs, bm25, vocab, termSets: tokens.map((ts) => new Set(ts)) };
}

/** BM25 (via bm25s) over the portfolio docs. Returns hits with score > 0, best first. */
export function search(index: Index, query: string, k = 5): Hit[] {
  const terms = [...new Set(tokenize(query))];
  const ids = terms.map((t) => index.vocab.get(t)).filter((id): id is number => id !== undefined);
  if (ids.length === 0) return [];

  const { documents, scores } = index.bm25.retrieve([ids], { k: Math.min(k, index.docs.length) });
  const hits: Hit[] = [];
  documents[0].forEach((docIndex, rank) => {
    const score = scores[0][rank];
    if (!(score > 0)) return;
    const matched = terms.filter((t) => index.termSets[docIndex].has(t)).length;
    hits.push({ ...index.docs[docIndex], score: Math.round(score * 100) / 100, coverage: matched / terms.length });
  });
  return hits;
}

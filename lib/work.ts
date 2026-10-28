// lib/work.ts
// Case studies for /work. Content lives in lib/data/caseStudies.json; every
// number there is copied from projects.json, experiences.json, the public
// repo's README/tests, or (for private work) the owner's own repo docs, never
// estimated. Private work is described at architecture level only.
import caseStudiesData from "@/lib/data/caseStudies.json";

export type EdgeKind = "normal" | "conditional" | "hitl" | "fanout" | "retry" | "bypass";
/** [from, to] or [from, to, kind] or [from, to, kind, label]. */
export type Edge = [string, string] | [string, string, EdgeKind] | [string, string, EdgeKind, string];

export type NodeKind = "io" | "process" | "llm" | "gate" | "hitl" | "store" | "fanout" | "tool";

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  /** Width override; defaults depend on kind. */
  w?: number;
  kind?: NodeKind;
  /** Legacy: narrower side node. */
  side?: boolean;
}

export interface DiagramCluster {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CaseStudy {
  slug: string;
  projectTitle: string;
  title: string;
  subtitle: string;
  role: string;
  org: string;
  period: string;
  visibility: string;
  stack: string[];
  keywords?: string[];
  problem: string;
  diagram: { width: number; height: number; clusters?: DiagramCluster[]; nodes: DiagramNode[]; edges: Edge[] };
  steps: Array<{ title: string; body: string; nodes: string[]; edges: Edge[] }>;
  results: Array<{ value: string; label: string }>;
  /** In-depth sections below the walkthrough (state, failure handling, evaluation...). */
  deepDive?: Array<{ heading: string; body: string; points?: string[] }>;
  decisions: string[];
  links: Array<{ label: string; href: string }>;
}

export const caseStudies = caseStudiesData as CaseStudy[];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

/** Maps a projects.json title to its case-study slug, if it has one. */
export const caseStudySlugByProject: Record<string, string> = Object.fromEntries(
  caseStudies.map((c) => [c.projectTitle, c.slug])
);

export const edgeKey = (e: Edge) => `${e[0]}>${e[1]}`;
export const edgeKind = (e: Edge): EdgeKind => e[2] ?? "normal";

// lib/work.ts
// Case studies for /work. Content lives in lib/data/caseStudies.json; every
// number there is copied from projects.json, experiences.json, or the public
// repo's README, never estimated.
import caseStudiesData from "@/lib/data/caseStudies.json";

export type Edge = [string, string];

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  side?: boolean;
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
  problem: string;
  diagram: { width: number; height: number; nodes: DiagramNode[]; edges: Edge[] };
  steps: Array<{ title: string; body: string; nodes: string[]; edges: Edge[] }>;
  results: Array<{ value: string; label: string }>;
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

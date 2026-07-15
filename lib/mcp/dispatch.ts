// lib/mcp/dispatch.ts
// Pure data-driven MCP tool/resource logic. Takes already-loaded data as
// parameters instead of importing JSON directly, so this one implementation
// can serve both the Next.js route (JSON imported via "@/lib/data/*") and the
// standalone Alpic server (JSON loaded via readFileSync). No "@/" aliases or
// JSON imports here — required for the plain-tsc build (tsconfig.server.json).
import { PROFILE } from "./definitions";

export interface Project {
  show: boolean;
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  [key: string]: unknown;
}

export interface Certification {
  show: boolean;
  category: string;
  issuer: string;
  [key: string]: unknown;
}

export interface ResourceData {
  projects: Project[];
  skills: unknown;
  experiences: unknown;
  certifications: Certification[];
  recognition: unknown;
}

export function searchProjects(
  allProjects: Project[],
  args: { query?: string; category?: string; tech?: string }
): string {
  const query = args.query?.toLowerCase() ?? "";
  const category = args.category;
  const tech = args.tech?.toLowerCase();

  let results = allProjects.filter((p) => p.show);
  if (query) {
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }
  if (category && category !== "all") {
    results = results.filter((p) => p.categories.includes(category));
  }
  if (tech) {
    results = results.filter((p) => p.tags.some((t) => t.toLowerCase().includes(tech)));
  }
  return JSON.stringify({ count: results.length, projects: results }, null, 2);
}

export function getProjectByTitle(allProjects: Project[], title: string | undefined): string {
  const query = (title ?? "").toLowerCase();
  const project = allProjects.find((p) => p.show && p.title.toLowerCase().includes(query));
  if (!project) return JSON.stringify({ error: `No project found matching "${title}"` });
  return JSON.stringify(project, null, 2);
}

export function filterCertifications(
  allCertifications: Certification[],
  args: { category?: string; issuer?: string }
): string {
  let certs = allCertifications.filter((c) => c.show);
  if (args.category) {
    const cat = args.category.toLowerCase();
    certs = certs.filter((c) => c.category.toLowerCase().includes(cat));
  }
  if (args.issuer) {
    const iss = args.issuer.toLowerCase();
    certs = certs.filter((c) => c.issuer.toLowerCase().includes(iss));
  }
  return JSON.stringify({ count: certs.length, certifications: certs }, null, 2);
}

export function getProfileSummary(allProjects: Project[], allCertifications: Certification[]): string {
  const visibleProjects = allProjects.filter((p) => p.show);
  const visibleCerts = allCertifications.filter((c) => c.show);
  return JSON.stringify(
    {
      ...PROFILE,
      totalVisibleProjects: visibleProjects.length,
      totalCertifications: visibleCerts.length,
      topTechnologies: [
        "LangGraph",
        "MCP",
        "RAG",
        "Next.js",
        "Python",
        "FastAPI",
        "LangChain",
        "Claude",
        "GPT-4",
      ],
    },
    null,
    2
  );
}

export function buildResourceText(uri: string, data: ResourceData): string {
  switch (uri) {
    case "selvin://profile":
      return JSON.stringify(PROFILE, null, 2);
    case "selvin://projects":
      return JSON.stringify(data.projects.filter((p) => p.show), null, 2);
    case "selvin://skills":
      return JSON.stringify(data.skills, null, 2);
    case "selvin://experience":
      return JSON.stringify(data.experiences, null, 2);
    case "selvin://certifications":
      return JSON.stringify(data.certifications.filter((c) => c.show), null, 2);
    case "selvin://recognition":
      return JSON.stringify(data.recognition, null, 2);
    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}

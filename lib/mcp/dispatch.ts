// lib/mcp/dispatch.ts
// Pure data-driven MCP tool/resource logic. Takes already-loaded data as
// parameters instead of importing JSON directly, so this one implementation
// can serve both the Next.js route (JSON imported via "@/lib/data/*") and the
// standalone Alpic server (JSON loaded via readFileSync). No "@/" aliases or
// JSON imports here — required for the plain-tsc build (tsconfig.server.json).
import { PROFILE } from "./definitions";
import { McpError, MCP_RESOURCE_NOT_FOUND } from "./errors";
import { monthsBetween, formatDuration } from "../../utils/calculateDuration";

export interface Project {
  show: boolean;
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  /** Source URL; null for private/closed-source projects. */
  code?: string | null;
  live?: string | null;
  featured?: boolean;
  private?: boolean;
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

export interface ExperienceEntry {
  title: string;
  company: string;
  dateStart: string;
  dateEnd: string;
  icon: "graduation" | "work" | "laptop" | string;
  [key: string]: unknown;
}

function isInternship(title: string): boolean {
  return title.toLowerCase().includes("intern");
}

export function computeExperienceStats(allExperiences: ExperienceEntry[]) {
  const roles = allExperiences.filter((e) => e.icon === "work");
  const education = allExperiences.filter((e) => e.icon === "graduation");
  const ventures = allExperiences.filter((e) => e.icon !== "work" && e.icon !== "graduation");

  const roleBreakdown = roles.map((r) => {
    const durationMonths = monthsBetween(r.dateStart, r.dateEnd);
    return {
      title: r.title,
      company: r.company,
      type: isInternship(r.title) ? "internship" : "full-time",
      dateStart: r.dateStart,
      dateEnd: r.dateEnd,
      durationMonths,
      durationLabel: formatDuration(durationMonths),
    };
  });

  const internshipMonths = roleBreakdown
    .filter((r) => r.type === "internship")
    .reduce((sum, r) => sum + r.durationMonths, 0);
  const fullTimeMonths = roleBreakdown
    .filter((r) => r.type === "full-time")
    .reduce((sum, r) => sum + r.durationMonths, 0);
  const totalProfessionalMonths = internshipMonths + fullTimeMonths;

  return {
    totalProfessionalMonths,
    totalProfessionalLabel: formatDuration(totalProfessionalMonths),
    internshipMonths,
    internshipLabel: formatDuration(internshipMonths),
    fullTimeMonths,
    fullTimeLabel: formatDuration(fullTimeMonths),
    roles: roleBreakdown,
    education: education.map((e) => ({
      title: e.title,
      company: e.company,
      dateStart: e.dateStart,
      dateEnd: e.dateEnd,
    })),
    concurrentVentures: ventures.map((v) => ({
      title: v.title,
      company: v.company,
      dateStart: v.dateStart,
      dateEnd: v.dateEnd,
      note: "Runs alongside the roles above — not counted in totalProfessionalMonths to avoid double-counting.",
    })),
  };
}

export function searchProjects(
  allProjects: Project[],
  args: { query?: string; category?: string; tech?: string; featured?: unknown }
): string {
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const query = str(args.query)?.toLowerCase() ?? "";
  const category = str(args.category);
  const tech = str(args.tech)?.toLowerCase();

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
  if (args.featured === true) {
    results = results.filter((p) => p.featured === true);
  }
  return JSON.stringify({ count: results.length, projects: results }, null, 2);
}

export function getProjectByTitle(allProjects: Project[], title: unknown): string {
  if (typeof title !== "string" || !title.trim()) return JSON.stringify({ error: "title is required" });
  const query = title.trim().toLowerCase();
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

export function getProfileSummary(
  allProjects: Project[],
  allCertifications: Certification[],
  allExperiences: ExperienceEntry[]
): string {
  const visibleProjects = allProjects.filter((p) => p.show);
  const visibleCerts = allCertifications.filter((c) => c.show);
  return JSON.stringify(
    {
      ...PROFILE,
      totalVisibleProjects: visibleProjects.length,
      featuredProjects: visibleProjects.filter((p) => p.featured === true).map((p) => p.title),
      totalCertifications: visibleCerts.length,
      experience: computeExperienceStats(allExperiences),
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
      throw new McpError(MCP_RESOURCE_NOT_FOUND, `Resource not found: ${uri}`);
  }
}

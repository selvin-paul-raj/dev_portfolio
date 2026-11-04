// lib/mcp/dispatch.ts
// Pure data-driven MCP tool/resource logic. Takes already-loaded data as
// parameters instead of importing JSON directly, so this one implementation
// can serve both the Next.js route (JSON imported via "@/lib/data/*") and the
// standalone Alpic server (JSON loaded via readFileSync). No "@/" aliases or
// JSON imports here: required for the plain-tsc build (tsconfig.server.json).
// Failures a caller can fix throw ToolError (reported as an isError result).
import { PROFILE } from "./definitions";
import { McpError, MCP_RESOURCE_NOT_FOUND, ToolError } from "./errors";
import { evalResults } from "./insights";
import { monthsBetween, formatDuration } from "../../utils/calculateDuration";
import { matchJob } from "../fit/matchJob";
import type { FitData } from "../fit/matchJob";
import type { AskData } from "../ask/retrieve";
import type { EvalsReport, HistoryEntry } from "../../evals/report";

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
  title: string;
  category: string;
  issuer: string;
  [key: string]: unknown;
}

/** Subset of lib/data/caseStudies.json the MCP server exposes (diagram layout is omitted). */
export interface CaseStudyData {
  slug: string;
  title: string;
  subtitle: string;
  role: string;
  org: string;
  period: string;
  visibility: string;
  stack: string[];
  problem: string;
  steps: Array<{ title: string; body: string }>;
  results: Array<{ value: string; label: string }>;
  deepDive?: Array<{ heading: string; body: string; points?: string[] }>;
  assurance?: Partial<Record<"harness" | "evals" | "guardrails" | "testing", string>>;
  decisions: string[];
  links: Array<{ label: string; href: string }>;
}

function caseStudyView(c: CaseStudyData) {
  return {
    slug: c.slug,
    title: c.title,
    summary: c.subtitle,
    role: c.role,
    org: c.org,
    period: c.period,
    access: c.visibility,
    stack: c.stack,
    problem: c.problem,
    flow: c.steps.map((s, i) => ({ step: i + 1, title: s.title, detail: s.body })),
    results: c.results,
    verifiedBy: c.assurance ?? {},
    inDepth: c.deepDive ?? [],
    decisions: c.decisions,
    links: c.links,
    url: `${PROFILE.portfolio}/work/${c.slug}`,
  };
}

/** Lists every case study when `slug` is empty, else the one matching it (slug, then title). */
export function getCaseStudy(all: CaseStudyData[], slug: string | undefined): Record<string, unknown> {
  if (!slug) {
    return {
      count: all.length,
      caseStudies: all.map((c) => ({ slug: c.slug, title: c.title, summary: c.subtitle, url: `${PROFILE.portfolio}/work/${c.slug}` })),
    };
  }
  const q = slug.toLowerCase();
  const study = all.find((c) => c.slug === q) ?? all.find((c) => c.title.toLowerCase().includes(q));
  if (!study) throw new ToolError(`No case study "${slug}". Available slugs: ${all.map((c) => c.slug).join(", ")}`);
  return caseStudyView(study);
}

interface ResourceData {
  projects: Project[];
  certifications: Certification[];
  recognition: AskData["recognition"];
  caseStudies: CaseStudyData[];
}

export interface ExperienceEntry {
  title: string;
  company: string;
  description: string;
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

/** Everything the MCP server and A2A agent read, injected so both builds share one implementation. */
export interface PortfolioData extends ResourceData {
  experiences: ExperienceEntry[];
  skills: SkillsData;
  evals: EvalsReport;
  evalsHistory: HistoryEntry[];
}

export interface SkillsData {
  skills: Record<string, string[]>;
}

function page<T>(items: T[], offset: number, limit: number) {
  const slice = items.slice(offset, offset + limit);
  const hasMore = offset + slice.length < items.length;
  return { total: items.length, count: slice.length, offset, has_more: hasMore, ...(hasMore ? { next_offset: offset + slice.length } : {}), slice };
}

export function searchProjects(
  allProjects: Project[],
  args: { query?: string; category?: string; tech?: string; featured?: boolean; limit: number; offset: number }
): Record<string, unknown> {
  const query = args.query?.trim().toLowerCase() ?? "";
  const tech = args.tech?.trim().toLowerCase();
  const category = args.category;

  let results = allProjects.filter((p) => p.show);
  if (query) {
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }
  if (category) results = results.filter((p) => p.categories.includes(category));
  if (tech) results = results.filter((p) => p.tags.some((t) => t.toLowerCase().includes(tech)));
  if (args.featured === true) results = results.filter((p) => p.featured === true);
  const { slice, ...meta } = page(results, args.offset, args.limit);
  return { ...meta, projects: slice };
}

/** Exact title first, then the first partial match, among visible projects. */
export function findProject(allProjects: Project[], title: string): Project {
  const query = title.trim().toLowerCase();
  const visible = allProjects.filter((p) => p.show);
  const project = visible.find((p) => p.title.toLowerCase() === query) ?? visible.find((p) => p.title.toLowerCase().includes(query));
  if (!project) throw new ToolError(`No project found matching "${title}". Use search_projects to list titles.`);
  return project;
}

export function filterCertifications(
  allCertifications: Certification[],
  args: { category?: string; issuer?: string; limit: number; offset: number }
): Record<string, unknown> {
  let certs = allCertifications.filter((c) => c.show);
  if (args.category) {
    const cat = args.category.toLowerCase();
    certs = certs.filter((c) => c.category.toLowerCase() === cat);
  }
  if (args.issuer) {
    const iss = args.issuer.toLowerCase();
    certs = certs.filter((c) => c.issuer.toLowerCase().includes(iss));
  }
  const { slice, ...meta } = page(certs, args.offset, args.limit);
  return { ...meta, certifications: slice };
}

const TECH_PER_GROUP = 2;

/** The leading skills of each skills.json group (each group lists its strongest first). */
export function topTechnologies(skills: SkillsData): string[] {
  return Object.entries(skills.skills)
    .filter(([group]) => group !== "all")
    .flatMap(([, list]) => list.slice(0, TECH_PER_GROUP));
}

export function getProfileSummary(
  data: Pick<PortfolioData, "projects" | "certifications" | "experiences" | "skills">
): Record<string, unknown> {
  const visibleProjects = data.projects.filter((p) => p.show);
  return {
    ...PROFILE,
    totalVisibleProjects: visibleProjects.length,
    featuredProjects: visibleProjects.filter((p) => p.featured === true).map((p) => p.title),
    totalCertifications: data.certifications.filter((c) => c.show).length,
    experience: computeExperienceStats(data.experiences),
    topTechnologies: topTechnologies(data.skills),
  };
}

export function matchJobTool(
  args: { job_description: string; max_evidence: number; only?: "matched" | "gaps" },
  data: FitData
): Record<string, unknown> {
  const { matched, gaps, gapDetails, ...rest } = matchJob(args.job_description, data, { maxEvidence: args.max_evidence });
  return {
    ...rest,
    ...(args.only === "gaps" ? {} : { matched }),
    ...(args.only === "matched" ? {} : { gaps, gapDetails }),
    fullReport: PROFILE.fitCheckUrl,
    resume: PROFILE.resumeUrl,
  };
}

const json = (value: unknown) => JSON.stringify(value, null, 2);

export function buildResourceText(uri: string, data: PortfolioData): string {
  switch (uri) {
    case "selvin://profile":
      return json(PROFILE);
    case "selvin://projects":
      return json(data.projects.filter((p) => p.show));
    case "selvin://skills":
      return json(data.skills);
    case "selvin://experience":
      return json(data.experiences);
    case "selvin://certifications":
      return json(data.certifications.filter((c) => c.show));
    case "selvin://recognition":
      return json(data.recognition);
    case "selvin://case-studies":
      return json(data.caseStudies.map(caseStudyView));
    case "selvin://evals":
      return json(evalResults(data.evals, data.evalsHistory, { include_cases: false, history: false }));
    default:
      return readTemplatedResource(uri, data);
  }
}

const TEMPLATED_URI = /^selvin:\/\/(case-studies|projects)\/(.+)$/;

/** selvin://case-studies/{slug} and selvin://projects/{title} (URL-encoded). */
function readTemplatedResource(uri: string, data: PortfolioData): string {
  const notFound = (detail?: string) => new McpError(MCP_RESOURCE_NOT_FOUND, detail ?? `Resource not found: ${uri}`);
  const match = TEMPLATED_URI.exec(uri);
  if (!match) throw notFound();
  let key: string;
  try {
    key = decodeURIComponent(match[2]);
  } catch {
    throw notFound();
  }
  try {
    return json(match[1] === "projects" ? findProject(data.projects, key) : getCaseStudy(data.caseStudies, key));
  } catch (err) {
    if (err instanceof ToolError) throw notFound(err.message);
    throw err;
  }
}

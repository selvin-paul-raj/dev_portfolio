// lib/mcp/catalog.ts
// The tool catalog: one zod schema per tool validates arguments at call time
// and generates the advertised JSON Schema, so the two cannot drift. Handlers
// live in tools.ts, keyed by ToolName. Server-only (zod); no "@/" aliases or
// JSON imports, so the plain-tsc Alpic build compiles it too.
import { z } from "zod";
import { CONTACT_LIMITS } from "../validation/contactLimits";
import type { JsonSchema, McpTool, ToolAnnotations } from "./types";

/** Categories present in lib/data/projects.json ("all" is a UI bucket, not a filter). */
export const PROJECT_CATEGORIES = ["ai", "automation", "web", "evaluation", "tool", "app"] as const;
/** Categories present in lib/data/certifications.json. */
export const CERT_CATEGORIES = [
  "AI Engineering",
  "Generative AI",
  "Agentic AI",
  "Technology",
  "Web Development",
  "Cloud Computing",
  "Data Science",
] as const;
export const REPO_SORTS = ["updated", "created", "pushed", "full_name"] as const;
export const EVAL_SUITES = ["retrieval", "off-topic", "fit", "gate", "scope", "llm"] as const;
export const MAX_JD_CHARS = 20_000;

const offset = z.number().int().min(0).default(0).describe("Results to skip, for paging (default 0)");

export const INPUT_SCHEMAS = {
  search_projects: z.object({
    query: z.string().max(200).optional().describe("Keyword matched against title, description, and tags"),
    category: z.enum(PROJECT_CATEGORIES).optional().describe("Project category"),
    tech: z.string().max(100).optional().describe("Technology tag, e.g. 'LangGraph', 'Python', 'Next.js'"),
    featured: z.boolean().optional().describe("If true, only featured projects"),
    limit: z.number().int().min(1).max(50).default(20).describe("Max projects to return, 1-50 (default 20)"),
    offset,
  }),
  get_project_by_title: z.object({
    title: z.string().trim().min(1).max(200).describe("Project title; partial, case-insensitive match"),
  }),
  list_github_repos: z.object({
    per_page: z.number().int().min(1).max(100).default(20).describe("Results per page, 1-100 (default 20)"),
    page: z.number().int().min(1).max(1000).default(1).describe("Page number (default 1)"),
    sort: z.enum(REPO_SORTS).default("updated").describe("Sort order (default 'updated')"),
  }),
  get_github_repo: z.object({
    repo: z
      .string()
      .regex(/^[A-Za-z0-9._-]{1,100}$/, "repo must be a repository name: letters, digits, '.', '_', '-' (max 100 chars)")
      .describe("Repository name, e.g. 'Linkedin-MCP-Server'"),
  }),
  filter_certifications: z.object({
    category: z.enum(CERT_CATEGORIES).optional().describe("Certification category"),
    issuer: z.string().max(100).optional().describe("Issuer name, partial match (e.g. 'Anthropic', 'Hugging Face', 'IBM')"),
    limit: z.number().int().min(1).max(100).default(50).describe("Max certifications to return, 1-100 (default 50)"),
    offset,
  }),
  get_profile_summary: z.object({}),
  get_case_study: z.object({
    slug: z.string().trim().max(100).optional().describe("Case study slug, e.g. 'dri-mas'. Omit to list all."),
  }),
  match_job: z.object({
    job_description: z
      .string()
      .trim()
      .min(40, "job_description is too short: paste the full job description (at least 40 characters)")
      .max(MAX_JD_CHARS, `job_description is too long (max ${MAX_JD_CHARS} characters)`)
      .describe(`Full job description text (40-${MAX_JD_CHARS} chars)`),
    max_evidence: z.number().int().min(1).max(20).default(3).describe("Evidence lines kept per requirement, 1-20 (default 3)"),
    only: z.enum(["matched", "gaps"]).optional().describe("Return only the matched requirements or only the gaps"),
  }),
  ask_selvin: z.object({
    question: z.string().trim().min(3).max(500).describe("A question about Selvin's work, skills, projects, or experience (3-500 chars)"),
    include_trace: z.boolean().default(false).describe("Include the full ranked retrieval trace (default false)"),
  }),
  get_eval_results: z.object({
    suite: z.enum(EVAL_SUITES).optional().describe("Only this suite (default: all)"),
    include_cases: z.boolean().default(false).describe("Include every graded case (default false)"),
    history: z.boolean().default(false).describe("Include the per-run history (default false)"),
  }),
  get_challenge_info: z.object({}),
  contact_selvin: z.object({
    name: z.string().max(CONTACT_LIMITS.nameMax).describe(`Sender's full name (max ${CONTACT_LIMITS.nameMax} chars)`),
    email: z.string().max(CONTACT_LIMITS.emailMax).describe("Sender's email address, for Selvin's reply"),
    message: z
      .string()
      .min(CONTACT_LIMITS.messageMin)
      .max(CONTACT_LIMITS.messageMax)
      .describe(`The message to Selvin (max ${CONTACT_LIMITS.messageMax} chars)`),
  }),
} as const;

export type ToolName = keyof typeof INPUT_SCHEMAS;
export type ToolArgs<N extends ToolName> = z.output<(typeof INPUT_SCHEMAS)[N]>;

const obj = (properties: Record<string, JsonSchema>, required: string[] = []) =>
  ({ type: "object", properties, ...(required.length ? { required } : {}) }) as JsonSchema & { type: "object" };
const str = { type: "string" };
const num = { type: "number" };
const bool = { type: "boolean" };
const arr = (items: JsonSchema = { type: "object" }) => ({ type: "array", items });

const OUTPUT_SCHEMAS: Partial<Record<ToolName, JsonSchema & { type: "object" }>> = {
  match_job: obj(
    {
      score: num,
      verdict: str,
      matched: arr(obj({ requirement: str, strength: str, priority: str, points: num, maxPoints: num, evidence: arr(), evidenceTotal: num, spans: arr() })),
      gaps: arr(str),
      gapDetails: arr(obj({ requirement: str, priority: str, maxPoints: num, spans: arr() })),
      method: str,
      fullReport: str,
      resume: str,
    },
    ["score", "verdict", "method"],
  ),
  ask_selvin: obj(
    {
      answer: str,
      mode: { type: "string", enum: ["llm", "retrieval"] },
      refused: bool,
      refusal: { type: "string", enum: ["off-topic", "injection", "off-scope", "no-citations"] },
      citations: arr(obj({ n: num, title: str, url: str, kind: str, score: num }, ["n", "title", "url"])),
      trace: arr(),
      thresholds: obj({ minScore: num, minCoverage: num, probability: num }),
      timings: obj({ retrievalMs: num, gateMs: num, llmMs: num, totalMs: num }),
      llm: obj({ provider: str, model: str }),
    },
    ["answer", "mode", "refused", "citations", "thresholds", "timings"],
  ),
  get_eval_results: obj(
    {
      generatedAt: str,
      corpusDocs: num,
      totals: obj({ passed: num, total: num }, ["passed", "total"]),
      suites: arr(obj({ id: str, passed: num, total: num, rate: num, stale: bool, trend: arr(num) }, ["id", "passed", "total", "rate", "trend"])),
      mrr: num,
      hitAtK: num,
      cases: { type: "object" },
      history: arr(),
      url: str,
    },
    ["generatedAt", "corpusDocs", "totals", "suites", "mrr", "hitAtK", "url"],
  ),
  get_challenge_info: obj(
    {
      levels: arr(obj({ level: num, name: str, defense: str, layers: arr(str) }, ["level", "name", "defense", "layers"])),
      stack: arr(str),
      enabled: bool,
      url: str,
    },
    ["levels", "stack", "enabled", "url"],
  ),
};

const READ_ONLY: ToolAnnotations = { readOnlyHint: true, openWorldHint: false };
const READ_ONLY_REMOTE: ToolAnnotations = { readOnlyHint: true, openWorldHint: true };

const META: Record<ToolName, { title: string; description: string; annotations: ToolAnnotations }> = {
  search_projects: {
    title: "Search projects",
    description:
      "Search Selvin's visible projects by keyword, technology tag, category, or featured flag, with limit/offset paging. Returns {total, count, offset, has_more, next_offset?, projects}; `code` is null for private (closed-source) work projects.",
    annotations: READ_ONLY,
  },
  get_project_by_title: {
    title: "Get project by title",
    description: "Get one project by its title (partial, case-insensitive match).",
    annotations: READ_ONLY,
  },
  list_github_repos: {
    title: "List GitHub repositories",
    description:
      "List Selvin's public GitHub repositories with live stats (stars, forks, language, topics, last updated). Calls the GitHub REST API, so results can be rate-limited by GitHub.",
    annotations: READ_ONLY_REMOTE,
  },
  get_github_repo: {
    title: "Get GitHub repository",
    description: "Get live details for one of Selvin's GitHub repositories by name. Calls the GitHub REST API.",
    annotations: READ_ONLY_REMOTE,
  },
  filter_certifications: {
    title: "Filter certifications",
    description: "Filter Selvin's certifications by category and/or issuer, with limit/offset paging.",
    annotations: READ_ONLY,
  },
  get_profile_summary: {
    title: "Profile summary",
    description:
      "Selvin's full professional profile: contact links, resume URL, exact total experience (years/months, internship vs full-time), per-role durations, education, top technologies, and portfolio stats. Quote the numeric fields exactly; never summarise them into estimates.",
    annotations: READ_ONLY,
  },
  get_case_study: {
    title: "Get case study",
    description:
      "An in-depth case study of one of Selvin's systems: the problem, each pipeline stage in order, measured results with exact numbers, deeper notes, and design decisions. Call without a slug to list the available case studies. Quote numbers exactly as returned.",
    annotations: READ_ONLY,
  },
  match_job: {
    title: "Match a job description",
    description:
      "Score how well Selvin fits a job description (deterministic, no LLM, nothing inferred). Returns a 0-100 `score` and `verdict`; `matched[]` lists each recognised requirement with `strength` (production > project > certified), `priority` ('must', or 'nice' when it only appears under a Preferred/Nice-to-have heading or is marked 'a plus'), cited `evidence`, `points` earned out of `maxPoints`, and `spans` (character offsets of the phrase in the JD). `gaps[]`/`gapDetails[]` are requirements with no evidence. Use `max_evidence` to trade detail for size and `only` to return just matched or just gaps. Quote evidence and gaps as returned.",
    annotations: READ_ONLY,
  },
  ask_selvin: {
    title: "Ask about Selvin",
    description:
      "Answer a free-form question about Selvin from his portfolio only. BM25 retrieves numbered snippets, a gate refuses off-topic or injection attempts before any LLM call, and every [n] in `answer` is validated against `citations` (each with a source URL). `mode` is 'llm' (grounded generation) or 'retrieval' (extractive, no LLM). When `refused` is true the portfolio has no answer: say so instead of guessing. Rate-limited per IP.",
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  get_eval_results: {
    title: "Get eval results",
    description:
      "How the Ask Selvin and Fit Check pipelines score on their golden test sets: per-suite pass counts and rates (retrieval, off-topic, fit, gate, scope, llm), retrieval MRR and hit@k, and each suite's pass-rate trend across runs. `stale` marks a suite carried over from an earlier run.",
    annotations: READ_ONLY,
  },
  get_challenge_info: {
    title: "Get challenge info",
    description:
      "Describe the prompt-injection challenge on Selvin's site: each level's name, defense, and the stacked defense layers it runs, plus whether the challenge is live. Never includes passwords or prompts.",
    annotations: READ_ONLY,
  },
  contact_selvin: {
    title: "Contact Selvin",
    description:
      "Send Selvin one email on the user's behalf (no bulk sending; rate-limited). Only call this when the user explicitly asks to contact, hire, or message him, with their real name and email.",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
};

function inputJsonSchema(schema: z.ZodType): JsonSchema & { type: "object" } {
  const { $schema: _ignored, ...json } = z.toJSONSchema(schema, { io: "input" }) as JsonSchema;
  return { ...json, type: "object" };
}

export const TOOL_NAMES = Object.keys(INPUT_SCHEMAS) as ToolName[];

export const TOOLS: McpTool[] = TOOL_NAMES.map((name) => {
  const outputSchema = OUTPUT_SCHEMAS[name];
  return {
    name,
    ...META[name],
    inputSchema: inputJsonSchema(INPUT_SCHEMAS[name]),
    ...(outputSchema ? { outputSchema } : {}),
  };
});

export function isToolName(name: string): name is ToolName {
  return Object.prototype.hasOwnProperty.call(INPUT_SCHEMAS, name);
}

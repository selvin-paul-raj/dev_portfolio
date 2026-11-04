// lib/mcp/tools.ts
// The one tool registry: a handler per ToolName (the compiler enforces that
// every catalog entry has one), argument validation against the catalog's zod
// schemas, and the mapping of failures to isError results. Data-injected, so
// the Next.js route and the standalone Alpic server share it unchanged.
import { INPUT_SCHEMAS, isToolName } from "./catalog";
import type { ToolArgs, ToolName } from "./catalog";
import { McpError, JSONRPC_INVALID_PARAMS, ToolError } from "./errors";
import { listRepos, getRepo } from "./github";
import { sendContactMessage } from "./contact";
import { challengeInfo, evalResults } from "./insights";
import { filterCertifications, findProject, getCaseStudy, getProfileSummary, matchJobTool, searchProjects } from "./dispatch";
import type { PortfolioData } from "./dispatch";
import { checkLlmRateLimit } from "../rateLimit";
import type { Index } from "../ask/retrieve";
import type { McpRequestContext, ToolResult } from "./types";

type Output = Record<string, unknown>;
type Handler<N extends ToolName> = (args: ToolArgs<N>, ctx: McpRequestContext) => Output | Promise<Output>;
export type ToolCaller = (name: string, args: Record<string, unknown>, ctx: McpRequestContext) => Promise<ToolResult>;

export function errorResult(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

function formatIssues(issues: Array<{ path: PropertyKey[]; message: string }>): string {
  return issues.map((i) => (i.path.length ? `${i.path.map(String).join(".")}: ${i.message}` : i.message)).join("; ");
}

export interface ToolOptions {
  /** A prebuilt ask index (the Next.js side shares /ask's); otherwise built on first use. */
  askIndex?: Index;
}

export function createToolCaller(data: PortfolioData, options: ToolOptions = {}): ToolCaller {
  let index = options.askIndex;

  const registry: { [N in ToolName]: Handler<N> } = {
    search_projects: (a) => searchProjects(data.projects, a),
    get_project_by_title: (a) => findProject(data.projects, a.title),
    list_github_repos: async (a) => {
      const repos = await listRepos(a);
      return { count: repos.length, page: a.page, repos };
    },
    get_github_repo: (a) => getRepo(a.repo),
    filter_certifications: (a) => filterCertifications(data.certifications, a),
    get_profile_summary: () => getProfileSummary(data),
    get_case_study: (a) => getCaseStudy(data.caseStudies, a.slug || undefined),
    match_job: (a) => matchJobTool(a, data),
    ask_selvin: async (a, ctx) => {
      const limited = checkLlmRateLimit(ctx.ip, "ask");
      if (limited) throw new ToolError(`${limited.error} Retry in ${Math.ceil(limited.retryAfterMs / 1000)}s.`);
      // Loaded on first use: the BM25 deps are ESM-only, so on a runtime without
      // require(esm) only this tool fails (as an isError result), not the server.
      const { askSelvin, buildPortfolioIndex } = await import("./ask");
      index ??= buildPortfolioIndex(data);
      return askSelvin(a.question, index, a.include_trace);
    },
    get_eval_results: (a) => evalResults(data.evals, data.evalsHistory, a),
    get_challenge_info: () => challengeInfo(),
    contact_selvin: (a, ctx) => sendContactMessage(a, ctx),
  };

  return async function callTool(name, args, ctx) {
    // An unknown tool is a protocol error; everything after this is a tool result.
    if (!isToolName(name)) throw new McpError(JSONRPC_INVALID_PARAMS, `Unknown tool: ${name}. Call tools/list for the available tools.`);
    const parsed = INPUT_SCHEMAS[name].safeParse(args);
    if (!parsed.success) return errorResult(`Invalid arguments for ${name}: ${formatIssues(parsed.error.issues)}`);
    try {
      const handler = registry[name] as Handler<ToolName>;
      const output = await handler(parsed.data as ToolArgs<ToolName>, ctx);
      return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }], structuredContent: output };
    } catch (err) {
      if (err instanceof ToolError) return errorResult(err.message);
      console.error(`[mcp] tool ${name} failed:`, err);
      return errorResult(`${name} failed unexpectedly. Please try again later.`);
    }
  };
}

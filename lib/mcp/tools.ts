// lib/mcp/tools.ts
import type { McpTool, McpRequestContext } from "./types";
import { McpError, JSONRPC_INVALID_PARAMS } from "./errors";
import { listRepos, getRepo } from "./github";
import { sendContactMessage } from "./contact";
import { TOOLS } from "./definitions";
import { searchProjects, getProjectByTitle, filterCertifications, getProfileSummary } from "./dispatch";
import type { Project, Certification, ExperienceEntry } from "./dispatch";
import projectsData from "@/lib/data/projects.json";
import certificationsData from "@/lib/data/certifications.json";
import experiencesData from "@/lib/data/experiences.json";

// JSON imports — typed loosely since lib/data/*.json has no strict schema
const projects = projectsData as unknown as Project[];
const certifications = certificationsData as unknown as Certification[];
const experiences = experiencesData as unknown as ExperienceEntry[];

export function listTools(): McpTool[] {
  return TOOLS;
}

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  ctx: McpRequestContext
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const text = await dispatch(name, args, ctx);
  return { content: [{ type: "text", text }] };
}

async function dispatch(name: string, args: Record<string, unknown>, ctx: McpRequestContext): Promise<string> {
  switch (name) {
    case "search_projects":
      return searchProjects(projects, args as { query?: string; category?: string; tech?: string; featured?: unknown });

    case "get_project_by_title":
      return getProjectByTitle(projects, args.title);

    case "list_github_repos": {
      const repos = await listRepos({ per_page: args.per_page, page: args.page, sort: args.sort });
      return JSON.stringify({ count: repos.length, repos }, null, 2);
    }

    case "get_github_repo": {
      const repo = await getRepo(args.repo);
      return JSON.stringify(repo, null, 2);
    }

    case "filter_certifications":
      return filterCertifications(certifications, args as { category?: string; issuer?: string });

    case "get_profile_summary":
      return getProfileSummary(projects, certifications, experiences);

    case "contact_selvin":
      return sendContactMessage(args, ctx);

    default:
      throw new McpError(JSONRPC_INVALID_PARAMS, `Unknown tool: ${name}`);
  }
}

// lib/mcp/tools.ts
import type { McpTool } from "./types";
import { listRepos, getRepo } from "./github";
import { sendContactMessage } from "./contact";
import { TOOLS } from "./definitions";
import { searchProjects, getProjectByTitle, filterCertifications, getProfileSummary } from "./dispatch";
import type { Project, Certification } from "./dispatch";
import projectsData from "@/lib/data/projects.json";
import certificationsData from "@/lib/data/certifications.json";

// JSON imports — typed loosely since lib/data/*.json has no strict schema
const projects = projectsData as unknown as Project[];
const certifications = certificationsData as unknown as Certification[];

export function listTools(): McpTool[] {
  return TOOLS;
}

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const text = await dispatch(name, args);
  return { content: [{ type: "text", text }] };
}

async function dispatch(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "search_projects":
      return searchProjects(projects, args as { query?: string; category?: string; tech?: string });

    case "get_project_by_title":
      return getProjectByTitle(projects, args.title as string | undefined);

    case "list_github_repos": {
      const repos = await listRepos({
        per_page: (args.per_page as number) ?? 20,
        page: (args.page as number) ?? 1,
        sort: (args.sort as "updated" | "created" | "pushed" | "full_name") ?? "updated",
      });
      return JSON.stringify({ count: repos.length, repos }, null, 2);
    }

    case "get_github_repo": {
      const repo = await getRepo(args.repo as string);
      return JSON.stringify(repo, null, 2);
    }

    case "filter_certifications":
      return filterCertifications(certifications, args as { category?: string; issuer?: string });

    case "get_profile_summary":
      return getProfileSummary(projects, certifications);

    case "contact_selvin":
      return sendContactMessage(args);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

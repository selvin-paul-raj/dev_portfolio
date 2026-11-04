// lib/mcp/github.ts
// Live GitHub data for list_github_repos / get_github_repo. Failures throw
// ToolError, so clients get an isError result rather than a protocol error.
import { ToolError } from "./errors";

const API = "https://api.github.com";
const OWNER = "selvin-paul-raj";

interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at: string;
  created_at: string;
  topics: string[];
  homepage: string | null;
  open_issues_count: number;
  watchers_count: number;
  default_branch: string;
  license: { name: string } | null;
}

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Next.js augments the global `fetch`'s RequestInit with a `next` cache-control
// option; plain `tsc` (the standalone Alpic build) doesn't know about it. This
// type lets both targets compile — Next.js honors `next.revalidate`, and
// Node's native fetch (used by the standalone server) just ignores the extra key.
type FetchInitWithNext = RequestInit & { next?: { revalidate?: number } };

function shape(r: GithubRepo) {
  return {
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.watchers_count,
    openIssues: r.open_issues_count,
    url: r.html_url,
    homepage: r.homepage,
    topics: r.topics,
    defaultBranch: r.default_branch,
    license: r.license?.name ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const TIMEOUT_MS = 10_000;

async function githubGet<T>(path: string, notFoundMessage: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      headers: headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 3600 },
    } as FetchInitWithNext);
  } catch (err) {
    console.error(`[mcp/github] GET ${path} failed:`, err);
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new ToolError(timedOut ? "GitHub did not respond within 10s. Please try again." : "Could not reach GitHub. Please try again later.");
  }
  if (res.status === 404) throw new ToolError(notFoundMessage);
  if (!res.ok) {
    // Log upstream details server-side only; clients get a generic message.
    console.error(`[mcp/github] GET ${path} -> ${res.status}: ${(await res.text()).slice(0, 500)}`);
    const limited = res.status === 403 || res.status === 429;
    throw new ToolError(limited ? "GitHub rate limit reached. Please try again later." : "GitHub API request failed. Please try again later.");
  }
  return (await res.json()) as T;
}

/** Lists public repos; arguments are already validated by the tool schema. */
export async function listRepos(args: { per_page: number; page: number; sort: string }): Promise<ReturnType<typeof shape>[]> {
  const query = new URLSearchParams({ per_page: String(args.per_page), page: String(args.page), sort: args.sort, type: "public" });
  const data = await githubGet<GithubRepo[]>(`/users/${OWNER}/repos?${query}`, "GitHub user not found");
  return data.map(shape);
}

export async function getRepo(repo: string): Promise<ReturnType<typeof shape>> {
  const data = await githubGet<GithubRepo>(
    `/repos/${OWNER}/${encodeURIComponent(repo)}`,
    `Repository not found: ${repo}. Use list_github_repos to see repository names.`
  );
  return shape(data);
}

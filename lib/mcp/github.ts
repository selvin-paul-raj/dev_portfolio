// lib/mcp/github.ts
import { McpError, JSONRPC_INTERNAL_ERROR, JSONRPC_INVALID_PARAMS } from "./errors";

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

const SORT_VALUES = ["created", "updated", "pushed", "full_name"] as const;
type RepoSort = (typeof SORT_VALUES)[number];
const REPO_NAME_RE = /^[A-Za-z0-9._-]{1,100}$/;

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

async function githubGet<T>(path: string, notFoundMessage: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  } as FetchInitWithNext);
  if (res.status === 404) throw new McpError(JSONRPC_INVALID_PARAMS, notFoundMessage);
  if (!res.ok) {
    // Log upstream details server-side only; clients get a generic message.
    console.error(`[mcp/github] GET ${path} -> ${res.status}: ${(await res.text()).slice(0, 500)}`);
    throw new McpError(JSONRPC_INTERNAL_ERROR, "GitHub API request failed. Please try again later.");
  }
  return (await res.json()) as T;
}

/** Lists public repos. Accepts raw tool arguments and normalises them. */
export async function listRepos(
  args: { per_page?: unknown; page?: unknown; sort?: unknown } = {},
): Promise<ReturnType<typeof shape>[]> {
  const sort: RepoSort = SORT_VALUES.includes(args.sort as RepoSort) ? (args.sort as RepoSort) : "updated";
  const query = new URLSearchParams({
    per_page: String(clampInt(args.per_page, 1, 100, 20)),
    page: String(clampInt(args.page, 1, 1000, 1)),
    sort,
    type: "public",
  });
  const data = await githubGet<GithubRepo[]>(`/users/${OWNER}/repos?${query}`, "GitHub user not found");
  return data.map(shape);
}

export async function getRepo(repo: unknown): Promise<ReturnType<typeof shape>> {
  if (typeof repo !== "string" || !REPO_NAME_RE.test(repo)) {
    throw new McpError(JSONRPC_INVALID_PARAMS, "repo must be a repository name (letters, digits, '.', '_', '-'; max 100 chars)");
  }
  const data = await githubGet<GithubRepo>(`/repos/${OWNER}/${encodeURIComponent(repo)}`, `Repository not found: ${repo}`);
  return shape(data);
}

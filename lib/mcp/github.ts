// lib/mcp/github.ts
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

export async function listRepos({
  per_page = 20,
  page = 1,
  sort = "updated",
}: {
  per_page?: number;
  page?: number;
  sort?: "created" | "updated" | "pushed" | "full_name";
} = {}): Promise<ReturnType<typeof shape>[]> {
  const url = `${API}/users/${OWNER}/repos?per_page=${per_page}&page=${page}&sort=${sort}&type=public`;
  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const data: GithubRepo[] = await res.json();
  return data.map(shape);
}

export async function getRepo(repo: string): Promise<ReturnType<typeof shape>> {
  const url = `${API}/repos/${OWNER}/${repo}`;
  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Repo not found: ${repo} (${res.status})`);
  const data: GithubRepo = await res.json();
  return shape(data);
}

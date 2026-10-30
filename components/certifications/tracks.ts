import { projectsData } from "@/lib/data";
import { caseStudySlugByProject } from "@/lib/work";
import { certs, type Cert } from "./data";

/**
 * Skill tracks: each groups the certificate skills that verify it and the project tags
 * that show it used. Aliases are lowercase; a certificate or project joins a track when
 * any of its skills or tags matches. Certificates in no track still appear in the full list.
 */
const TRACKS = [
  {
    id: "agents",
    label: "AI agents",
    cert: ["ai agents", "agentic ai", "multi-agent systems", "agent workflows", "agent2agent", "agent communication protocol", "agent skills", "google agent development kit (adk)", "pydantic ai", "tool calling", "tool use", "tool integration", "claude agent sdk", "agentic coding"],
    project: ["langgraph", "multi-agent systems", "ai agents", "tool calling", "google adk", "langchain", "human-in-the-loop"],
  },
  {
    id: "mcp",
    label: "MCP servers",
    cert: ["mcp", "model context protocol", "model context protocol (mcp)"],
    project: ["mcp", "fastmcp"],
  },
  {
    id: "llmapps",
    label: "LLM apps and guardrails",
    cert: ["llms", "llm applications", "llm integration", "generative ai", "prompt engineering", "prompt design", "foundation models", "chain of thought", "ai system design", "ai architecture"],
    project: ["llms", "guardrails", "llm evaluation", "llm-as-judge", "prompt injection testing", "llm guardrails", "structured output", "evidence grounding", "llm classification"],
  },
  {
    id: "rag",
    label: "RAG and retrieval",
    cert: ["rag", "retrieval-augmented generation (rag)", "embeddings", "vector databases", "knowledge graphs", "graph databases"],
    project: ["rag", "faiss", "bm25", "pgvector", "hybrid search", "re-ranking", "retrieval evaluation", "chonkie"],
  },
  {
    id: "serving",
    label: "LLM serving and fine-tuning",
    cert: ["llm inference", "inference", "ai inference", "vllm", "gpu serving", "gpu optimization", "quantization techniques", "llm fine-tuning", "supervised fine-tuning", "lora", "peft", "unsloth", "rlhf", "model alignment", "transformers", "hugging face", "open-source llms", "reasoning models", "triton"],
    project: ["sentence-transformers", "llm routing"],
  },
  {
    id: "claude",
    label: "Claude and the Anthropic API",
    cert: ["claude", "anthropic api", "claude code", "claude agent sdk"],
    project: ["claude api"],
  },
  {
    id: "python",
    label: "Python, SQL and data",
    cert: ["python", "sql", "databases", "data querying", "queries", "joins", "query optimization", "data modeling", "nosql", "mongodb", "data analytics", "machine learning", "statistics"],
    project: ["python", "fastapi", "sqlite", "postgresql", "trino", "supabase", "streamlit"],
  },
  {
    id: "web",
    label: "Web and full stack",
    cert: ["javascript", "react", "node.js", "frontend", "backend", "full-stack", "rest apis", "rest api", "web development", "typescript", "next.js", "css", "express", "express.js", "ssr", "api design", "api development"],
    project: ["javascript", "typescript", "react.js", "next.js", "next.js 15", "node.js", "tailwind css", "express.js", "html", "css"],
  },
] as const;

type Project = (typeof projectsData)[number];

export type Track = {
  id: string;
  label: string;
  certs: Cert[];
  projects: Array<Project & { href: string }>;
  latest: string;
};

const has = (values: readonly string[], aliases: readonly string[]) => values.some((v) => aliases.includes(v.toLowerCase()));

// Certificates newest first; featured projects first, then by their order.
export const tracks: Track[] = TRACKS.map((t) => {
  const matched = certs
    .filter((c) => has(c.skills, t.cert))
    .sort((a, b) => b.date.localeCompare(a.date));
  const projects = projectsData
    .filter((p) => has(p.tags, t.project))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || (a.order ?? 0) - (b.order ?? 0))
    .map((p) => {
      const slug = caseStudySlugByProject[p.title];
      return { ...p, href: slug ? `/work/${slug}` : "#projects" };
    });
  return { id: t.id, label: t.label, certs: matched, projects, latest: matched.map((c) => c.date).sort().at(-1) ?? "" };
}).filter((t) => t.certs.length > 0);

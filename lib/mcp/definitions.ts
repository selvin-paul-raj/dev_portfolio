// lib/mcp/definitions.ts
// Server identity, resource/prompt definitions, and static profile data (tool
// schemas live in catalog.ts). Shared by both MCP entry points and imported by
// client components (PROFILE), so keep it free of zod, "@/" aliases, and JSON
// imports: plain `tsc` (tsconfig.server.json) compiles it without a bundler.
import { SITE_URL } from "../site";
import type { McpPrompt, McpResource, McpResourceTemplate } from "./types";

/** Newest first. Initialize echoes the client's version when listed here, else the first entry. */
export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"] as const;
export const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];
export const SERVER_NAME = "selvin-portfolio-mcp";
export const SERVER_TITLE = "Selvin PaulRaj K: Portfolio MCP Server";
export const SERVER_VERSION = "2.0.0";
export const SERVER_INSTRUCTIONS =
  "Selvin PaulRaj K's professional portfolio (AI Engineer, Chennai, India: MCP, LangGraph, RAG, agentic systems). " +
  "For a job description, call match_job: a deterministic 0-100 fit score with cited evidence and gaps. " +
  "For a free-form question, call ask_selvin: a grounded answer whose [n] markers cite portfolio snippets; quote it with its citations, and treat refused=true as 'not in the portfolio'. " +
  "get_case_study (or selvin://case-studies/{slug}) gives architecture walkthroughs with exact measured results. " +
  "get_eval_results reports how the Ask/Fit pipelines score on their golden test sets; get_challenge_info describes the prompt-injection challenge's defense layers. " +
  "get_profile_summary has exact experience totals: quote numbers as returned, never estimate. contact_selvin sends a real email, so only call it when the user explicitly asks to contact him.";

export const RESOURCE_DEFS: McpResource[] = [
  { uri: "selvin://profile", name: "profile", title: "Professional Profile", description: "Bio, contact info, social links, and expertise areas", mimeType: "application/json" },
  { uri: "selvin://projects", name: "projects", title: "Projects", description: "Every visible project: AI agents, MCP servers, web apps, and tools", mimeType: "application/json" },
  { uri: "selvin://skills", name: "skills", title: "Technical Skills", description: "Skills grouped by layer (agentic AI, LLMs, retrieval, evaluation, ...)", mimeType: "application/json" },
  { uri: "selvin://experience", name: "experience", title: "Work & Education", description: "Professional history and educational background", mimeType: "application/json" },
  { uri: "selvin://certifications", name: "certifications", title: "Certifications", description: "Professional certifications from Anthropic, Hugging Face, IBM, LinkedIn, and more", mimeType: "application/json" },
  { uri: "selvin://recognition", name: "recognition", title: "Recognition & Awards", description: "Publications, awards, and achievements", mimeType: "application/json" },
  { uri: "selvin://case-studies", name: "case-studies", title: "Case Studies", description: "In-depth architecture walkthroughs of Selvin's main systems: problem, stage-by-stage flow, measured results, design decisions", mimeType: "application/json" },
  { uri: "selvin://evals", name: "evals", title: "Eval Results", description: "Latest pass rates of the Ask Selvin and Fit Check eval suites, with run-over-run trend", mimeType: "application/json" },
];

export const RESOURCE_TEMPLATES: McpResourceTemplate[] = [
  { uriTemplate: "selvin://case-studies/{slug}", name: "case-study", title: "Case Study", description: "One case study by slug (list slugs via selvin://case-studies or get_case_study)", mimeType: "application/json" },
  { uriTemplate: "selvin://projects/{title}", name: "project", title: "Project", description: "One project by URL-encoded title (partial, case-insensitive match)", mimeType: "application/json" },
];

export const PROMPT_DEFS: McpPrompt[] = [
  {
    name: "evaluate_fit",
    title: "Evaluate fit for a job",
    description: "Assess how well Selvin fits a job description, using match_job evidence and gaps.",
    arguments: [{ name: "job_description", description: "The full job description text", required: true }],
  },
  {
    name: "summarize_for_role",
    title: "Summarize for a role",
    description: "Write a short, evidence-backed summary of Selvin tailored to a target role.",
    arguments: [{ name: "role", description: "Target role, e.g. 'GenAI Engineer'", required: true }],
  },
];

export const PROFILE = {
  name: "Selvin PaulRaj K",
  role: "AI Engineer",
  location: "Chennai, Tamil Nadu, India",
  email: "selvinpaulgomathi@gmail.com",
  phone: "+91 91762 99049",
  whatsapp: "https://wa.me/+919176299049",
  portfolio: SITE_URL,
  resumeUrl: `${SITE_URL}/view/Selvin_Resume.pdf`,
  github: "https://github.com/selvin-paul-raj",
  linkedin: "https://linkedin.com/in/selvinpaulraj",
  socialLinks: {
    linkedin: "https://linkedin.com/in/selvinpaulraj",
    github: "https://github.com/selvin-paul-raj",
    hackerrank: "https://www.hackerrank.com/profile/selvinpaulraj",
    leetcode: "https://leetcode.com/u/selvinpaulraj/",
    kaggle: "https://www.kaggle.com/selvinpaulrajk",
    deepml: "https://www.deep-ml.com/profile/fdmYEE5bBFgqLwHxlBFW1lgLUR22",
  },
  summary:
    "AI Engineer specializing in intelligent AI Agents, MCP servers, RAG systems, LangGraph multi-agent pipelines, and agentic workflows. Full-stack MERN/Next.js expertise.",
  currentCompany: "Zinnov / Draup",
  currentRole: "Associate Data Analyst, AI Automation",
  roleNote:
    "Official title is Associate Data Analyst; the day-to-day work is AI engineering — LangGraph multi-agent systems, hybrid retrieval over 2.6M records, MCP integrations, and LLM evaluation (see the Zinnov/Draup experience entries).",
  openTo: ["AI Engineer", "GenAI / LLM Engineer", "Agentic AI Engineer", "Applied AI Engineer"],
  fitCheckUrl: `${SITE_URL}/fit`,
  a2aAgentCard: `${SITE_URL}/.well-known/agent-card.json`,
  education: "M.E Computer Science with AI, Kings Engineering College",
  expertise: [
    "AI Agents & Agentic Systems",
    "Model Context Protocol (MCP)",
    "LangGraph / LangChain",
    "Retrieval-Augmented Generation (RAG)",
    "LLM Engineering (Claude, GPT-4, Gemini)",
    "Vector Databases (FAISS, Chroma)",
    "Next.js / React",
    "Python / FastAPI",
    "Node.js",
  ],
  mcpEndpoint: `${SITE_URL}/api/mcp`,
} as const;

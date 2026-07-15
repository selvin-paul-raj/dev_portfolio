// lib/mcp/definitions.ts
// Single source of truth for tool/resource schemas and static profile data.
// Shared by both MCP entry points (Next.js route + standalone Alpic server) —
// keep this file free of "@/" aliases and JSON imports so plain `tsc` (see
// tsconfig.server.json) can compile it without a bundler.
import type { McpTool, McpResource } from "./types";

export const PROTOCOL_VERSION = "2024-11-05";
export const SERVER_NAME = "selvin-portfolio-mcp";
export const SERVER_VERSION = "1.0.0";
export const SERVER_INSTRUCTIONS =
  "You have access to Selvin PaulRaj K's professional portfolio. Use resources to read structured data and tools to search, filter, or send contact messages. Selvin is an AI Engineer specializing in MCP, LangGraph, RAG, and agentic systems based in Chennai, India.";

export const TOOLS: McpTool[] = [
  {
    name: "search_projects",
    description:
      "Search and filter Selvin's projects by keyword, technology, or category. Returns matching visible projects.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword to match in title, description, or tags" },
        category: { type: "string", description: "Category filter: 'web', 'ai', 'tool', 'android'" },
        tech: { type: "string", description: "Technology tag to match (e.g. 'LangGraph', 'Python', 'Next.js')" },
      },
    },
  },
  {
    name: "get_project_by_title",
    description: "Get a specific project by its title. Accepts partial matches.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Project title (partial match supported)" },
      },
      required: ["title"],
    },
  },
  {
    name: "list_github_repos",
    description:
      "List Selvin's public GitHub repositories with live stats: stars, forks, language, topics, last updated. Calls the GitHub REST API (subject to GitHub's rate limits — 60/hr unauthenticated, 5000/hr with GITHUB_TOKEN).",
    inputSchema: {
      type: "object",
      properties: {
        per_page: { type: "number", description: "Results per page, max 100 (default: 20)" },
        page: { type: "number", description: "Page number (default: 1)" },
        sort: { type: "string", description: "Sort by 'updated', 'created', or 'pushed' (default: 'updated')" },
      },
    },
  },
  {
    name: "get_github_repo",
    description:
      "Get full details for a specific GitHub repository by name. Calls the GitHub REST API (subject to GitHub's rate limits).",
    inputSchema: {
      type: "object",
      properties: {
        repo: { type: "string", description: "Repository name, e.g. 'Linkedin-MCP-Server'" },
      },
      required: ["repo"],
    },
  },
  {
    name: "filter_certifications",
    description: "Filter Selvin's certifications by category and/or issuer.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "'AI Engineering', 'Web Development', 'Technology', 'Cloud Computing', 'Data Science'",
        },
        issuer: {
          type: "string",
          description: "Issuer name (e.g. 'Anthropic', 'Hugging Face', 'LinkedIn', 'IBM')",
        },
      },
    },
  },
  {
    name: "get_profile_summary",
    description: "Get a comprehensive summary of Selvin's professional profile, expertise, and portfolio stats.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "contact_selvin",
    description:
      "Send a contact message to Selvin via email (one email per call — no bulk sending). Use when the user wants to hire, collaborate, or ask a question.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Sender's full name (max 200 chars)" },
        email: { type: "string", description: "Sender's email address" },
        message: { type: "string", description: "The message to send to Selvin (max 5000 chars)" },
      },
      required: ["name", "email", "message"],
    },
  },
];

export const RESOURCE_DEFS: McpResource[] = [
  {
    uri: "selvin://profile",
    name: "Professional Profile",
    description: "Bio, contact info, social links, and expertise areas",
    mimeType: "application/json",
  },
  {
    uri: "selvin://projects",
    name: "Projects",
    description: "44+ projects including AI agents, MCP servers, web apps, and tools",
    mimeType: "application/json",
  },
  {
    uri: "selvin://skills",
    name: "Technical Skills",
    description: "Complete list of technical skills and technologies",
    mimeType: "application/json",
  },
  {
    uri: "selvin://experience",
    name: "Work & Education",
    description: "Professional history and educational background",
    mimeType: "application/json",
  },
  {
    uri: "selvin://certifications",
    name: "Certifications",
    description: "20+ professional certifications from Anthropic, Hugging Face, IBM, LinkedIn, and more",
    mimeType: "application/json",
  },
  {
    uri: "selvin://recognition",
    name: "Recognition & Awards",
    description: "Awards, recognition, and achievements",
    mimeType: "application/json",
  },
];

export const PROFILE = {
  name: "Selvin PaulRaj K",
  role: "AI Engineer",
  location: "Chennai, Tamil Nadu, India",
  email: "selvinpaulgomathi@gmail.com",
  portfolio: "https://selvinpaulraj.vercel.app",
  github: "https://github.com/selvin-paul-raj",
  linkedin: "https://linkedin.com/in/selvinpaulraj",
  summary:
    "AI Engineer specializing in intelligent AI Agents, MCP servers, RAG systems, LangGraph multi-agent pipelines, and agentic workflows. Full-stack MERN/Next.js expertise.",
  currentCompany: "Zinnov / Draup",
  currentRole: "Associate Data Analyst — AI Automation",
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
  mcpEndpoint: "https://selvinpaulraj.vercel.app/api/mcp",
} as const;

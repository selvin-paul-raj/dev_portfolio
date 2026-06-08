// lib/mcp/resources.ts
import type { McpResource, McpContent } from "./types";
import projects from "@/lib/data/projects.json";
import skills from "@/lib/data/skills.json";
import experiences from "@/lib/data/experiences.json";
import certifications from "@/lib/data/certifications.json";
import recognition from "@/lib/data/recognition.json";

const PROFILE = {
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
};

export function listResources(): McpResource[] {
  return [
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
}

export function readResource(uri: string): McpContent[] {
  return [{ uri, mimeType: "application/json", type: "text", text: getResourceText(uri) }];
}

function getResourceText(uri: string): string {
  switch (uri) {
    case "selvin://profile":
      return JSON.stringify(PROFILE, null, 2);
    case "selvin://projects":
      return JSON.stringify(
        (projects as Array<{ show: boolean } & Record<string, unknown>>).filter((p) => p.show),
        null,
        2
      );
    case "selvin://skills":
      return JSON.stringify(skills, null, 2);
    case "selvin://experience":
      return JSON.stringify(experiences, null, 2);
    case "selvin://certifications":
      return JSON.stringify(
        (certifications as Array<{ show: boolean } & Record<string, unknown>>).filter((c) => c.show),
        null,
        2
      );
    case "selvin://recognition":
      return JSON.stringify(recognition, null, 2);
    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}

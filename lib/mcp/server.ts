// lib/mcp/server.ts
// Next.js-side wiring: bundles lib/data JSON into PortfolioData and binds the
// shared MCP handlers to it (the ask index is the same instance /ask uses).
import projects from "@/lib/data/projects.json";
import skills from "@/lib/data/skills.json";
import experiences from "@/lib/data/experiences.json";
import certifications from "@/lib/data/certifications.json";
import recognition from "@/lib/data/recognition.json";
import caseStudies from "@/lib/data/caseStudies.json";
import evals from "@/lib/data/evals.json";
import evalsHistory from "@/lib/data/evals-history.json";
import type { EvalsReport, HistoryEntry } from "@/evals/report";
import { portfolioIndex } from "@/lib/ask/portfolioIndex";
import { createPortfolioHandlers } from "./portfolio";
import { createMcpHttpHandler } from "./router";
import type { PortfolioData } from "./dispatch";

export const portfolioData: PortfolioData = {
  projects,
  skills,
  experiences,
  certifications,
  recognition,
  caseStudies,
  evals: evals as EvalsReport,
  evalsHistory: evalsHistory as HistoryEntry[],
};

export const mcpHandlers = createPortfolioHandlers(portfolioData, { askIndex: portfolioIndex });
export const handleMcpPost = createMcpHttpHandler(mcpHandlers);

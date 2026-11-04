// lib/ask/portfolioIndex.ts
// Next.js-side wiring: loads lib/data JSON into the BM25 index once per
// server instance. The builder is data-injected (lib/mcp/ask.ts) so the
// standalone MCP server builds the same index from files it reads itself.
import projectsData from "@/lib/data/projects.json";
import experiencesData from "@/lib/data/experiences.json";
import certificationsData from "@/lib/data/certifications.json";
import recognitionData from "@/lib/data/recognition.json";
import skillsData from "@/lib/data/skills.json";
import caseStudiesData from "@/lib/data/caseStudies.json";
import { buildPortfolioIndex } from "@/lib/mcp/ask";

export const portfolioIndex = buildPortfolioIndex({
  projects: projectsData,
  experiences: experiencesData,
  certifications: certificationsData,
  recognition: recognitionData,
  skills: skillsData,
  caseStudies: caseStudiesData,
});

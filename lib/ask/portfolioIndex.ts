// lib/ask/portfolioIndex.ts
// Next.js-side wiring: loads lib/data JSON into the BM25 index once per
// server instance. (The standalone eval script loads the same files itself.)
import projectsData from "@/lib/data/projects.json";
import experiencesData from "@/lib/data/experiences.json";
import certificationsData from "@/lib/data/certifications.json";
import recognitionData from "@/lib/data/recognition.json";
import skillsData from "@/lib/data/skills.json";
import { PROFILE } from "@/lib/mcp/definitions";
import { buildDocs, buildIndex } from "./retrieve";
import type { AskData } from "./retrieve";

const data: AskData = {
  projects: projectsData,
  experiences: experiencesData,
  certifications: certificationsData,
  recognition: recognitionData,
  skills: skillsData,
  profile: PROFILE,
};

export const portfolioIndex = buildIndex(buildDocs(data));

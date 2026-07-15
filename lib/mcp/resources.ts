// lib/mcp/resources.ts
import type { McpResource, McpContent } from "./types";
import { RESOURCE_DEFS } from "./definitions";
import { buildResourceText } from "./dispatch";
import type { Project, Certification, ResourceData } from "./dispatch";
import projects from "@/lib/data/projects.json";
import skills from "@/lib/data/skills.json";
import experiences from "@/lib/data/experiences.json";
import certifications from "@/lib/data/certifications.json";
import recognition from "@/lib/data/recognition.json";

const RESOURCE_DATA: ResourceData = {
  projects: projects as unknown as Project[],
  skills,
  experiences,
  certifications: certifications as unknown as Certification[],
  recognition,
};

export function listResources(): McpResource[] {
  return RESOURCE_DEFS;
}

export function readResource(uri: string): McpContent[] {
  return [{ uri, mimeType: "application/json", type: "text", text: buildResourceText(uri, RESOURCE_DATA) }];
}

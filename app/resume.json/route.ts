// app/resume.json/route.ts
// Machine-readable resume in the JSON Resume schema (https://jsonresume.org),
// generated from lib/data so it never drifts from the site. Phone is omitted
// on purpose — this endpoint is public and crawlable.
import { NextResponse } from "next/server";
import projectsData from "@/lib/data/projects.json";
import experiencesData from "@/lib/data/experiences.json";
import certificationsData from "@/lib/data/certifications.json";
import recognitionData from "@/lib/data/recognition.json";
import skillsData from "@/lib/data/skills.json";
import { PROFILE } from "@/lib/mcp/definitions";

export const dynamic = "force-static";
export const revalidate = 86400;

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Sep 2025" → "2025-09"; "Present" → undefined (JSON Resume: omit endDate). */
function isoMonth(label: string): string | undefined {
  const [mon, year] = label.trim().split(/\s+/);
  const idx = MONTHS.indexOf(mon?.slice(0, 3).toLowerCase() ?? "");
  if (idx === -1 || !year) return undefined;
  return `${year}-${String(idx + 1).padStart(2, "0")}`;
}

const SKILL_LABELS: Record<string, string> = {
  agentic_ai: "Agentic AI",
  llms: "LLMs",
  retrieval: "RAG & Search",
  evaluation_and_reliability: "Evaluation",
  ai_security: "AI Security",
  languages: "Languages",
  backend_and_data: "Backend & Data",
  frontend: "Frontend",
  tooling: "Cloud & Tooling",
};

const bullets = (text: string) =>
  text
    .split(/\n+/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

export function GET() {
  const byOrder = [...experiencesData].sort((a, b) => a.order - b.order);
  const skills = skillsData.skills as Record<string, string[]>;

  const resume = {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: PROFILE.name,
      label: "AI Engineer — Agentic Systems, MCP, RAG",
      email: PROFILE.email,
      url: PROFILE.portfolio,
      summary: `${PROFILE.summary} ${PROFILE.roleNote}`,
      location: { city: "Chennai", region: "Tamil Nadu", countryCode: "IN" },
      profiles: [
        { network: "GitHub", username: "selvin-paul-raj", url: PROFILE.github },
        { network: "LinkedIn", username: "selvinpaulraj", url: PROFILE.linkedin },
      ],
    },
    work: byOrder
      .filter((e) => e.icon !== "graduation")
      .map((e) => ({
        name: e.company,
        position: e.title,
        location: e.location,
        startDate: isoMonth(e.dateStart),
        endDate: isoMonth(e.dateEnd),
        highlights: bullets(e.description),
      })),
    education: byOrder
      .filter((e) => e.icon === "graduation")
      .map((e) => ({
        institution: e.company,
        studyType: e.title,
        startDate: isoMonth(e.dateStart),
        endDate: isoMonth(e.dateEnd),
      })),
    awards: recognitionData.achievements.map((a) => ({
      title: a.title,
      date: a.date,
      awarder: a.issuer,
      summary: a.description,
    })),
    publications: recognitionData.publications.map((p) => ({
      name: p.title,
      publisher: p.publisher,
      releaseDate: p.publication_date,
      summary: p.description,
    })),
    certificates: certificationsData
      .filter((c) => c.show)
      .map((c) => ({ name: c.title, date: c.date ?? undefined, issuer: c.issuer, url: c.verifyUrl ?? undefined })),
    skills: Object.entries(SKILL_LABELS)
      .filter(([key]) => skills[key]?.length)
      .map(([key, name]) => ({ name, keywords: skills[key] })),
    projects: projectsData
      .filter((p) => p.show)
      .sort((a, b) => a.order - b.order)
      .map((p) => ({
        name: p.title,
        description: p.description,
        keywords: p.tags,
        url: p.live || p.code || undefined,
      })),
    meta: {
      canonical: `${PROFILE.portfolio}/resume.json`,
      lastModified: new Date().toISOString(),
      pdf: PROFILE.resumeUrl,
    },
  };

  return NextResponse.json(resume, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

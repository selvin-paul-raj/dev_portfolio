// Server only (imported by app/fit/page.tsx): trims the portfolio JSON to the fields matchJob reads, so /fit ships a few KB
// of evidence to the browser instead of the full project, experience and certification files.
import golden from "@/evals/golden.json";
import projectsData from "@/lib/data/projects.json";
import experiencesData from "@/lib/data/experiences.json";
import certificationsData from "@/lib/data/certifications.json";
import type { FitData } from "@/lib/fit/matchJob";

export function fitData(): FitData {
  return {
    projects: projectsData
      .filter((p) => p.show)
      .map((p) => ({
        show: true,
        title: p.title,
        description: p.description,
        tags: p.tags,
        code: p.code ?? null,
        live: p.live ?? null,
        featured: p.featured,
        private: p.private,
        personal: p.personal,
      })),
    experiences: experiencesData
      .filter((e) => e.icon === "work")
      .map((e) => ({ title: e.title, company: e.company, description: e.description, icon: e.icon, order: e.order })),
    certifications: certificationsData
      .filter((c) => c.show)
      .map((c) => ({ show: true, title: c.title, issuer: c.issuer, skills: c.skills ?? null, verifyUrl: c.verifyUrl ?? null })),
  };
}

/** Golden fit cases by name, for `/fit?sample=<name>` links from /evals. */
export function fitSamples(): Record<string, string> {
  return Object.fromEntries(golden.fit.map((c) => [c.name, c.jd]));
}

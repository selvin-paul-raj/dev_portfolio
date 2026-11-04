import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { caseStudies } from "@/lib/work";
import { report } from "@/lib/evalsSummary";
import { DATA_UPDATED } from "@/lib/seo";

// Stable dates only: a per-request `new Date()` tells crawlers every URL changed on every fetch.
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, lastModified: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  });

  return [
    { ...page("", DATA_UPDATED, 1), changeFrequency: "weekly", images: [`${SITE_URL}/Selvin_PaulRaj.webp`] },
    page("/work", DATA_UPDATED, 0.8),
    ...caseStudies.map((c) => page(`/work/${c.slug}`, DATA_UPDATED, 0.7)),
    page("/fit", DATA_UPDATED, 0.7),
    page("/ask", DATA_UPDATED, 0.7),
    page("/evals", report.generatedAt, 0.7),
    page("/challenge", DATA_UPDATED, 0.6),
    page("/view/Selvin_Resume.pdf", DATA_UPDATED, 0.6),
    page("/resume.json", DATA_UPDATED, 0.5),
  ];
}

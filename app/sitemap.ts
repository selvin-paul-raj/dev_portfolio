import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { caseStudies } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [`${SITE_URL}/Selvin_PaulRaj.webp`],
    },
    ...["/work", ...caseStudies.map((c) => `/work/${c.slug}`), "/fit", "/ask", "/evals", "/challenge"].map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/view/Selvin_Resume.pdf`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}

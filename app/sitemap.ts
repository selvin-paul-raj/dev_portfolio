import type { MetadataRoute } from "next";

const SITE_URL = "https://selvinpaulraj.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [`${SITE_URL}/Selvin_PaulRaj.webp`],
    },
    {
      url: `${SITE_URL}/Selvin_Resume.pdf`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}

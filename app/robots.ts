import type { MetadataRoute } from "next";

const SITE_URL = "https://selvinpaulraj.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    // One group for every crawler (search and AI alike): the whole public site is open.
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

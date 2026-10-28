// lib/site.ts
// Canonical public origin of the portfolio. Every absolute self-URL (metadata,
// JSON-LD, sitemap, robots, MCP/A2A discovery) derives from this one value.
// Kept free of "@/" aliases so the plain-tsc MCP/evals builds can import it.
export const SITE_URL = "https://selvinpaulraj.vercel.app";

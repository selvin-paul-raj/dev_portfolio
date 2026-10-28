// React's dev build uses eval() for debugging features (callstack reconstruction).
// Allow it only in development; production keeps the stricter policy.
const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 90],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn-uploads.huggingface.co",
      },
    ],
  },

  async redirects() {
    // Old resume URLs that may already be shared; the single source is /view/Selvin_Resume.pdf.
    return [
      ...["/Selvin_Resume.pdf", "/view/SPR_Resume.pdf"].map((source) => ({
        source,
        destination: "/view/Selvin_Resume.pdf",
        permanent: true,
      })),
      // A2A renamed agent.json → agent-card.json in v0.3; keep the legacy path working.
      { source: "/.well-known/agent.json", destination: "/.well-known/agent-card.json", permanent: true },
    ];
  },

  async rewrites() {
    return {
      // Same URL, different representation: terminals get an ANSI resume card,
      // agents asking for markdown get llms-full.txt. Browsers are unaffected.
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
          destination: "/llms-full.txt",
        },
        {
          source: "/",
          has: [{ type: "header", key: "user-agent", value: "(curl|Wget|wget|HTTPie|httpie|xh)/.*" }],
          destination: "/api/cli",
        },
      ],
    };
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Microsoft Clarity: loader on www.clarity.ms pulls its runtime from
              // scripts.clarity.ms, beacons to *.clarity.ms and pixels via c.bing.com.
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.clarity.ms https://*.clarity.ms https://va.vercel-scripts.com`,
              "style-src 'self' 'unsafe-inline'",
              // Hugging Face certificate images redirect from huggingface.co to its *.hf.co CDN.
              "img-src 'self' data: https://images.unsplash.com https://huggingface.co https://*.huggingface.co https://*.hf.co https://*.clarity.ms https://c.bing.com",
              "font-src 'self' data:",
              "connect-src 'self' https://www.clarity.ms https://*.clarity.ms https://c.bing.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/view/Selvin_Resume.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: "inline; filename=\"Selvin_Resume.pdf\"",
          },
        ],
      },
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|webp|avif|svg|gif|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/",
        has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
        headers: [{ key: "Content-Type", value: "text/markdown; charset=utf-8" }],
      },
      {
        // "/" varies by representation (see rewrites); keep caches from mixing them.
        source: "/",
        headers: [{ key: "Vary", value: "Accept, User-Agent" }],
      },
      {
        source: "/llms-full.txt",
        headers: [{ key: "Content-Type", value: "text/markdown; charset=utf-8" }],
      },
      {
        source: "/(robots\\.txt|sitemap\\.xml|manifest\\.json|feed\\.xml|llms\\.txt|llms-full\\.txt|ai\\.txt|humans\\.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

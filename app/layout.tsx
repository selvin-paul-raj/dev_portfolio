import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeSwitch from "@/components/ThemeSwitch";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

import ActiveSectionContextProvider from "@/context/active-section-context";
import ThemeContextProvider from "@/context/theme-context";
import { projectsData } from "@/lib/data";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const featuredProjectsItemList = projectsData.slice(0, 6).map((p, i) => ({
  "@type": "ListItem",
  position: i + 1,
  item: {
    "@type": "SoftwareApplication",
    name: p.title,
    description: p.description,
    author: { "@type": "Person", name: "Selvin PaulRaj K" },
    programmingLanguage: p.tags,
    url: p.live ?? p.code,
    applicationCategory: p.categories.includes("app")
      ? "MobileApplication"
      : p.categories.includes("tool")
        ? "DeveloperApplication"
        : "WebApplication",
  },
}));

export const metadata: Metadata = {
  metadataBase: new URL("https://selvinpaulraj.vercel.app"),
  title: {
    default: "Selvin PaulRaj K | AI Engineer — AI Agents, MCP & Agentic Systems",
    template: "%s | Selvin PaulRaj K",
  },
  description:
    "Selvin PaulRaj K is an AI Engineer from Chennai, India. SPOT Recognition awardee at Zinnov/Draup. Builds AI Agents, MCP servers, RAG systems, LangGraph multi-agent pipelines, and agentic workflows. Anthropic-certified MCP developer. Full-stack MERN/Next.js.",
  keywords: [
    "Selvin PaulRaj",
    "Selvin PaulRaj K",
    "AI Engineer",
    "AI Agents",
    "Agentic AI",
    "Agentic Systems",
    "MCP",
    "Model Context Protocol",
    "LangGraph",
    "LangChain",
    "RAG",
    "Retrieval Augmented Generation",
    "LLM Engineer",
    "Prompt Engineering",
    "Multi-Agent Systems",
    "AI Agent Developer",
    "Autonomous Agents",
    "Full-Stack Developer",
    "Next.js",
    "MERN Stack",
    "React Developer",
    "Node.js Developer",
    "Python Developer",
    "Chennai Developer",
    "Tamil Nadu Developer",
    "India AI Engineer",
    "Portfolio",
    "Web Developer",
    "FastAPI",
    "Vector Database",
    "FAISS",
    "Zinnov",
    "Draup",
    "LLM Engineer",
    "AI Automation",
    "Intelligence Automation",
    "Embedding Models",
    "selvinpaulrajK",
    "selvinpaulraj",
    "Anthropic Claude",
    "Claude Code",
    "AMD AI Certification",
    "BM25 Retrieval",
    "Hybrid Retrieval",
    "Trino SQL",
    "Workforce Intelligence",
    "Entity Resolution",
    "SPOT Recognition",
    "DRI Agent",
    "Associate Data Analyst AI",
    "Semantic Search Engineer",
  ],
  authors: [{ name: "Selvin PaulRaj K", url: "https://selvinpaulraj.vercel.app" }],
  creator: "Selvin PaulRaj K",
  publisher: "Selvin PaulRaj K",
  applicationName: "Selvin PaulRaj K Portfolio",
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "https://selvinpaulraj.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://selvinpaulraj.vercel.app",
    siteName: "Selvin PaulRaj K",
    title: "Selvin PaulRaj K | AI Engineer — AI Agents & Agentic Systems",
    description:
      "AI Engineer from Chennai, India building intelligent AI Agents, MCP servers, RAG systems, and LLM-powered agentic workflows. Full-stack MERN/Next.js expertise.",
    images: [
      {
        url: "/Selvin_PaulRaj.webp",
        width: 1200,
        height: 630,
        alt: "Selvin PaulRaj K — AI Engineer & Agentic AI Developer",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selvin PaulRaj K | AI Engineer — AI Agents & MCP",
    description:
      "Building AI Agents, MCP servers, RAG pipelines, and agentic workflows. Full-stack MERN/Next.js expertise. Based in Chennai, India.",
    creator: "@selvinpaulrajk",
    images: ["/Selvin_PaulRaj.webp"],
  },
  verification: {
    google: "y8_t3SKugG2qZzqDFrgclLRNRh5m62dhX-OTUWKlthc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        {/* Dark-first: runs before paint, no FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(!t||t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />
        {/* Geo meta tags — helps local/regional SEO */}
        <meta name="geo.region" content="IN-TN" />
        <meta name="geo.placename" content="Chennai, Tamil Nadu, India" />
        <meta name="geo.position" content="13.0827;80.2707" />
        <meta name="ICBM" content="13.0827, 80.2707" />

        {/* OpenSearch + Feed discovery */}
        <link rel="search" type="application/opensearchdescription+xml" title="Selvin PaulRaj K" href="/opensearch.xml" />
        <link rel="alternate" type="application/rss+xml" title="Selvin PaulRaj K — Projects Feed" href="/feed.xml" />
        {/* SVG favicon — scales perfectly, modern browsers prefer it */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://linkedin.com" />
        <link rel="dns-prefetch" href="https://leetcode.com" />
        <link rel="dns-prefetch" href="https://www.hackerrank.com" />

        {/* Preconnect for analytics CDN */}
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />

        {/* AI/LLM discovery link-rels */}
        <link rel="llms-txt" href="/llms.txt" />
        <link rel="ai-plugin" type="application/json" href="/.well-known/ai-plugin.json" />
        <link rel="mcp-server" type="application/json" href="/.well-known/mcp.json" />

        {/* Person structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "@id": "https://selvinpaulraj.vercel.app/#person",
              name: "Selvin PaulRaj K",
              url: "https://selvinpaulraj.vercel.app",
              image: "https://selvinpaulraj.vercel.app/Selvin_PaulRaj.webp",
              sameAs: [
                "https://github.com/selvin-paul-raj",
                "https://linkedin.com/in/selvinpaulraj",
                "https://www.hackerrank.com/profile/selvinpaulraj",
                "https://leetcode.com/u/selvinpaulraj/",
              ],
              jobTitle: "AI Engineer | Associate Data Analyst",
              description:
                "AI Engineer specializing in agentic AI systems, MCP servers, LangGraph multi-agent pipelines, RAG systems, and enterprise AI automation. SPOT Recognition awardee at Zinnov/Draup. Anthropic-certified MCP developer.",
              award:
                "SPOT Recognition — Automation CoE, Zinnov/Draup (June 2026) — for designing AI agents and automation solutions that improved operational efficiency and drove cross-team innovation.",
              knowsAbout: [
                "AI Agents",
                "Agentic AI Systems",
                "Model Context Protocol",
                "LangGraph",
                "LangChain",
                "RAG",
                "LLM Engineering",
                "Multi-Agent Systems",
                "Next.js",
                "Python",
                "FastAPI",
                "Vector Databases",
                "FAISS",
                "BM25 Retrieval",
                "Hybrid Retrieval",
                "Anthropic Claude",
                "Trino SQL",
                "Workforce Intelligence",
                "Entity Resolution",
                "Semantic Search",
                "Enterprise Data Automation",
              ],
              hasCredential: [
                {
                  "@type": "EducationalOccupationalCredential",
                  credentialCategory: "certification",
                  name: "Claude Certified Architect - Foundations",
                  description:
                    "Credential for solution architects who can design and build production-grade applications with Claude using Claude Code, the Claude Agent SDK, the Claude API, and MCP.",
                  recognizedBy: { "@type": "Organization", name: "Anthropic" },
                  dateCreated: "2026",
                },
                {
                  "@type": "EducationalOccupationalCredential",
                  credentialCategory: "certificate",
                  name: "Introduction to Model Context Protocol",
                  recognizedBy: { "@type": "Organization", name: "Anthropic" },
                  dateCreated: "2026",
                },
                {
                  "@type": "EducationalOccupationalCredential",
                  credentialCategory: "certificate",
                  name: "Claude Code in Action",
                  recognizedBy: { "@type": "Organization", name: "Anthropic" },
                  dateCreated: "2026",
                },
                {
                  "@type": "EducationalOccupationalCredential",
                  credentialCategory: "certificate",
                  name: "Claude with the Anthropic API",
                  recognizedBy: { "@type": "Organization", name: "Anthropic" },
                  dateCreated: "2026",
                },
                {
                  "@type": "EducationalOccupationalCredential",
                  credentialCategory: "certificate",
                  name: "AI Agents Fundamentals",
                  recognizedBy: { "@type": "Organization", name: "Hugging Face" },
                  dateCreated: "2025",
                },
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Chennai",
                addressRegion: "Tamil Nadu",
                addressCountry: "IN",
              },
              worksFor: {
                "@type": "Organization",
                name: "Zinnov (Draup)",
                url: "https://draup.com",
              },
              alumniOf: [
                {
                  "@type": "EducationalOrganization",
                  name: "Kings Engineering College",
                  description: "M.E Computer Science with AI specialization (2025–Present)",
                },
                {
                  "@type": "EducationalOrganization",
                  name: "DMI College of Engineering",
                  description: "B.Tech Information Technology, CGPA 8.4 (2021–2025)",
                },
              ],
            }),
          }}
        />

        {/* ProfilePage structured data — key for AI Overviews (AIO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              "@id": "https://selvinpaulraj.vercel.app/#profile",
              name: "Selvin PaulRaj K — AI Engineer Portfolio",
              url: "https://selvinpaulraj.vercel.app",
              description:
                "Portfolio of Selvin PaulRaj K, AI Engineer and Associate Data Analyst at Zinnov/Draup. Specializes in agentic AI, MCP servers, LangGraph pipelines, hybrid retrieval, and enterprise AI automation. SPOT Recognition awardee.",
              dateCreated: "2024",
              dateModified: "2026",
              author: {
                "@type": "Person",
                "@id": "https://selvinpaulraj.vercel.app/#person",
                name: "Selvin PaulRaj K",
              },
              mainEntity: {
                "@type": "Person",
                "@id": "https://selvinpaulraj.vercel.app/#person",
                name: "Selvin PaulRaj K",
                image: "https://selvinpaulraj.vercel.app/Selvin_PaulRaj.webp",
                url: "https://selvinpaulraj.vercel.app",
              },
            }),
          }}
        />

        {/* WebSite structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Selvin PaulRaj K — AI Engineer Portfolio",
              url: "https://selvinpaulraj.vercel.app",
              author: {
                "@type": "Person",
                name: "Selvin PaulRaj K",
              },
              description:
                "Portfolio of Selvin PaulRaj K — AI Engineer building AI Agents, MCP servers, RAG systems, and agentic workflows.",
            }),
          }}
        />

        {/* FAQ structured data for AI-related search queries */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What does Selvin PaulRaj K specialise in?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Selvin PaulRaj K specialises in AI Engineering — building intelligent AI Agents, Model Context Protocol (MCP) servers, Retrieval-Augmented Generation (RAG) systems, LangGraph multi-agent pipelines, and full-stack web applications with Next.js and Python.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What AI technologies does Selvin PaulRaj K work with?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Selvin works with LangChain, LangGraph, OpenAI APIs, Anthropic Claude, Google Gemini, FAISS, vector databases, FastAPI, and various MCP-compatible tooling for building agentic AI systems.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Where is Selvin PaulRaj K based?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Selvin PaulRaj K is based in Chennai, Tamil Nadu, India, and works at Zinnov/Draup as an AI Engineer while pursuing an M.E in Computer Science with AI specialisation.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What has Selvin PaulRaj K built at Zinnov/Draup?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "At Zinnov/Draup, Selvin built DRI-MAS — a LangGraph v3 multi-agent system that converts natural-language requests into validated Trino SQL and structured Excel reports, reducing analyst turnaround from hours to under 1 minute. He also built a Company Synonym Agent using FAISS+BM25 hybrid retrieval across 2.4M company records, the Deal Origination Framework for monitoring 537 enterprise accounts, and the RMS Agent for AI-powered role mapping.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What awards and recognition has Selvin PaulRaj K received?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Selvin received the SPOT Recognition award at Zinnov/Draup Automation CoE in June 2026 for designing AI agents and automation solutions that improved operational efficiency and drove cross-team innovation. He also won 1st place at the Alpha College Hackathon, 1st place in Website Development at Alpha College, and 3rd place at the SheInnovates Hackathon by Women Techmakers Chennai.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What certifications does Selvin PaulRaj K hold?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Selvin holds 20+ verified certifications including Anthropic certifications for Introduction to MCP, Claude Code in Action, Introduction to Agentic AI Skills, and Claude with the Anthropic API; Hugging Face certifications for AI Agents Fundamentals and MCP Course; DeepLearning.AI certifications for Agentic Knowledge Graph Construction and Agent Communication Protocol; and AMD AI engineering certifications.",
                  },
                },
              ],
            }),
          }}
        />

        {/* Top AI projects structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Selvin PaulRaj K — Featured AI Engineering Projects",
              itemListElement: featuredProjectsItemList,
            }),
          }}
        />
      </head>
      <body className="bg-[#FAFAF9] text-gray-950 relative pt-20 pb-16 md:pb-0 dark:bg-[#09090b] dark:text-white/90">
        {/* Microsoft Clarity Analytics — deferred until page is idle */}
        <Script
          id="clarity-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "oo7sqjfgyt");`,
          }}
        />

        {/* Background Effects */}
        <div className="bg-[#e8d89e] absolute top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#000]" />
        <div className="bg-[#CDECFF] absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#000]" />

        <ThemeContextProvider>
          <ActiveSectionContextProvider>
            <main>
              <Header />
              {children}
              <SpeedInsights />
              <Toaster position="top-right" />
              <Footer />
              <ThemeSwitch />
            </main>
          </ActiveSectionContextProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}

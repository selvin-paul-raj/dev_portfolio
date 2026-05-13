import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeSwitch from "@/components/ThemeSwitch";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

import ActiveSectionContextProvider from "@/context/active-section-context";
import ThemeContextProvider from "@/context/theme-context";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://selvinpaulraj.vercel.app"),
  title: {
    default: "Selvin PaulRaj K | AI Engineer — AI Agents, MCP & Agentic Systems",
    template: "%s | Selvin PaulRaj K",
  },
  description:
    "Selvin PaulRaj K is an AI Engineer from Chennai, India building intelligent AI Agents, MCP servers, RAG systems, LangGraph pipelines, and agentic workflows. Full-stack MERN/Next.js expertise.",
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
    "selvinpaulraj.tech",
    "selvinpaulrajK",
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
    <html lang="en" dir="ltr" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
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
        {/* Alternate domain association */}
        <link rel="me" href="https://selvinpaulraj.tech" />

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

        {/* Person structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Selvin PaulRaj K",
              url: "https://selvinpaulraj.vercel.app",
              image: "https://selvinpaulraj.vercel.app/Selvin_PaulRaj.webp",
              sameAs: [
                "https://selvinpaulraj.tech",
                "https://github.com/selvin-paul-raj",
                "https://linkedin.com/in/selvinpaulraj",
                "https://www.hackerrank.com/profile/selvinpaulraj",
                "https://leetcode.com/u/selvinpaulraj/",
              ],
              jobTitle: "AI Engineer",
              description:
                "AI Engineer specialising in AI Agents, MCP servers, RAG systems, LangGraph pipelines, and agentic AI workflows.",
              knowsAbout: [
                "AI Agents",
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
              alumniOf: {
                "@type": "EducationalOrganization",
                name: "M.E Computer Science with AI",
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
              potentialAction: {
                "@type": "SearchAction",
                target: "https://selvinpaulraj.vercel.app/#projects",
              },
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
              ],
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

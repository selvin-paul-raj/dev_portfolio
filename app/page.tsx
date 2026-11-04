import dynamic from "next/dynamic";
import About from "@/components/About";
import ConsoleGreeting from "@/components/ConsoleGreeting";
import HashScroll from "@/components/HashScroll";
import Intro from "@/components/Intro";
import SectionDivider from "@/components/SectionDivider";
import SocialLinks from "@/components/SocialLinks";
import {
  ProjectsSkeleton,
  SkillsSkeleton,
  ExperienceSkeleton,
  RecognitionSkeleton,
  CertificationsSkeleton,
  ContactSkeleton,
} from "@/components/Skeletons";
import { projectsData } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { DATA_UPDATED, JsonLd, PERSON_ID, WEBSITE_ID } from "@/lib/seo";

// Re-render daily so "Present" role durations in the static HTML stay current.
export const revalidate = 86400;

const PROFILE_PAGE = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profile`,
  name: "Selvin PaulRaj K — AI Engineer Portfolio",
  url: SITE_URL,
  description:
    "Portfolio of Selvin PaulRaj K, AI Engineer and Associate Data Analyst at Zinnov/Draup. Specializes in agentic AI, MCP servers, LangGraph pipelines, hybrid retrieval, and enterprise AI automation. SPOT Recognition awardee.",
  dateCreated: "2024",
  dateModified: DATA_UPDATED,
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: { "@id": PERSON_ID },
};

// Open-source featured projects only: private work projects have no public URL to point at.
const FEATURED_PROJECTS = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Selvin PaulRaj K: Featured AI Engineering Projects",
  itemListElement: projectsData
    .filter((p) => p.featured && p.code)
    .map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: p.title,
        description: p.description,
        author: { "@id": PERSON_ID },
        programmingLanguage: p.tags,
        codeRepository: p.code,
        ...(p.live ? { url: p.live } : {}),
      },
    })),
};

const DynamicProjects = dynamic(() => import("@/components/Projects"), {
  loading: () => <ProjectsSkeleton />,
});
const DynamicSkills = dynamic(() => import("@/components/Skills"), {
  loading: () => <SkillsSkeleton />,
});
const DynamicExperience = dynamic(() => import("@/components/Experience"), {
  loading: () => <ExperienceSkeleton />,
});
const DynamicRecognition = dynamic(() => import("@/components/Recognition"), {
  loading: () => <RecognitionSkeleton />,
});
const DynamicCertifications = dynamic(() => import("@/components/Certifications"), {
  loading: () => <CertificationsSkeleton />,
});
const DynamicContact = dynamic(() => import("@/components/Contact"), {
  loading: () => <ContactSkeleton />,
});

export default function Home() {
  return (
    <main id="content" className="flex flex-col items-center px-4">
      <JsonLd data={PROFILE_PAGE} />
      <JsonLd data={FEATURED_PROJECTS} />
      <HashScroll />
      <ConsoleGreeting />
      <Intro />
      <SocialLinks />
      <SectionDivider />
      <About />
      <SectionDivider />
      <DynamicSkills />
      <DynamicProjects />
      <DynamicExperience />
      <DynamicRecognition />
      <DynamicCertifications />
      <DynamicContact />
    </main>
  );
}

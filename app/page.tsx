import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";
import About from "@/components/About";
import ConsoleGreeting from "@/components/ConsoleGreeting";
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

// Re-render daily so "Present" role durations in the static HTML stay current.
export const revalidate = 86400;

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
      <Analytics />
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

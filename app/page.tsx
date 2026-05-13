"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import About from "@/components/About";
import Intro from "@/components/Intro";
import SectionDivider from "@/components/SectionDivider";
import SocialLinks from "@/components/SocialLinks";
import { Analytics } from "@vercel/analytics/react";
import {
  ProjectsSkeleton,
  SkillsSkeleton,
  ExperienceSkeleton,
  RecognitionSkeleton,
  CertificationsSkeleton,
  ContactSkeleton,
} from "@/components/Skeletons";

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

interface ClearAndLogMessageProps {
  message: string;
  styles: string;
}

const clearAndLogMessage = ({ message, styles }: ClearAndLogMessageProps) => {
  console.clear();
  console.log(`%c${message}`, styles);
};

export default function Home() {
  useEffect(() => {
    const customMessage = `
      Welcome to Selvin PaulRaj K's Portfolio

      AI Engineer — AI Agents, MCP Servers, RAG Systems, LangGraph Pipelines.
      Based in Chennai, India.

      Portfolio: https://selvinpaulraj.vercel.app
      GitHub: https://github.com/selvin-paul-raj
    `;

    const styles = `
      color: #bada55;
      font-size: 14px;
    `;

    clearAndLogMessage({ message: customMessage, styles });
  }, []);

  return (
    <main className="flex flex-col items-center px-4 ">
      <Analytics/>
      <Intro />
      <SocialLinks />
      <SectionDivider />
      <About />
      <SectionDivider/>
      <DynamicSkills />
      <DynamicProjects />
      <DynamicExperience />
      <DynamicRecognition />
      <DynamicCertifications />
      <DynamicContact />
    </main>
  );
}

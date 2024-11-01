"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import About from "@/components/About";
import Intro from "@/components/Intro";
import SectionDivider from "@/components/SectionDivider";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import SocialLinks from "@/components/SocialLinks";
import { Analytics } from "@vercel/analytics/react"


const DynamicProjects = dynamic(() => import("@/components/Projects"));
const DynamicSkills = dynamic(() => import("@/components/Skills"));

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
      🚀 Welcome to My Portfolio! 🚀

      Thanks for stopping by. I'm here to bring your ideas to life and create something extraordinary.

      Let's build something amazing together!

      Cheers,
      Selvin PaulRaj
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
      <DynamicProjects />
      <DynamicSkills />
      <Experience />
      <Contact />
    </main>
  );
}

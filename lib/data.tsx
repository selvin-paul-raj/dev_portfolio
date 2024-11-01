import React from "react";

import aicalculator from "@/public/aicalculator.png"
import troothview from "@/public/troothview.png"
import speedtyping from "@/public/speedtype.png"

import { GoHome } from "react-icons/go";
import { RxPerson } from "react-icons/rx";

import { CgWorkAlt } from "react-icons/cg";
import { MdOutlineWorkOutline, MdOutlineEmail } from "react-icons/md";
import { SiPolywork } from "react-icons/si";
import { FaCode, FaLinkedin, FaLaptopCode, FaNetworkWired } from "react-icons/fa";
import { StaticImageData } from "next/image";

import { LuGraduationCap } from "react-icons/lu";
import calculateDuration from "@/utils/calculateDuration";

interface Link {
  name: string;
  hash: string;
  icon: JSX.Element;
}



interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  date: string;
  icon: JSX.Element;
}

// Define the array of links with type annotations
export const links: Link[] = [
  {
    name: "Home",
    hash: "#home",
    icon: <GoHome />,
  },
  {
    name: "About",
    hash: "#about",
    icon: <RxPerson />,
  },
  {
    name: "Projects",
    hash: "#projects",
    icon: <SiPolywork />,
  },
  {
    name: "Skills",
    hash: "#skills",
    icon: <MdOutlineWorkOutline />,
  },
  {
    name: "Contact",
    hash: "#contact",
    icon: <MdOutlineEmail />,
  },
];

interface Project {
  title: string;
  description: string;
  tags: string[];
  imageUrl: StaticImageData;
  live: string;
  code: string;
}
// Define the array of projects with type annotations
export const projectsData: Project[] = [
  {
    title: "AI Calculator",
    description: "Developed a full-stack AI calculator with FastAPI and Vite-React, enabling natural language math input via Google AI for responsive calculations.",
    tags: ["React Js", "TypeScript", "Tailwind css", "fastapi", "Gemini ai", "lazy-brush"],
    imageUrl: aicalculator,
    code: "https://github.com/selvin-paul-raj/AI-Calculator",
    live: "https://spr-ai-calculator.vercel.app",
  },
  {
    title: "TroothView",
    description: "Created a React project that allows users to input photos, uses a Gradio AI model to confirm their trustworthiness, and displays the results in a doughnut chart.",
    tags: ["React Js", "framer-motion", "Tailwind css", "chart.js", "Gradio AI", "dropzone"],
    imageUrl: troothview,
    code: "https://github.com/selvin-paul-raj/TroothView",
    live: "https://trooth-view.vercel.app",
  },{
    title: "Speed Typing",
    description: "created an Animation-rich React and TypeScript Application. Testing and styling were done using Framer-motion, Jest, and Tailwind CSS.",
    tags: ["React Js", "framer-motion", "Tailwind css", "Typescript", "Jest", "custom Hooks"],
    imageUrl: speedtyping,
    code: "https://github.com/selvin-paul-raj/Speed-Typing",
    live: "https://spr-speed-typing.vercel.app",
  }



];

// Define the array of experiences with type annotations
export const experiencesData: Experience[] = [
  {
    id: "exp-1",
    title: "B.Tech Information Technology",
    company: "DMI College of Engineering",
    location: "Chennai, Tamil Nadu, India",
    description: "CGPA: 8.4",
    date: `May 2021 - Present`,
    icon: React.createElement(LuGraduationCap),
  },
  {
    id: "exp-2",
    title: "Full Stack Intern",
    company: "SERVIMOS TECHNOLOGIES PVT LTD",
    location: "Chennai, Tamil Nadu, India (On-site)",
    description: `
      • Developed a scalable MERN stack Library Management System.\n
      • Enhanced software quality through collaboration and teamwork.\n
    `,
    date: `Jul 2023 - Aug 2023 (${calculateDuration("Jul 2023", "Aug 2023")})`,
    icon: React.createElement(CgWorkAlt),
  },
  {
    id: "exp-3",
    title: "Web Development Intern",
    company: "VERITECH SOFTWARE IT SERVICES",
    location: "Chennai, Tamil Nadu, India (Remote)",
    description: `
      • Created a responsive React portfolio site, boosting engagement by 35%.\n
      • Integrated a Generative-AI chatbot, increasing interactions by 40%.\n
      • Developed 3D landing page using Next.js and React-Spline.\n
      • Built a MERN stack Expense Tracker with dynamic charts.
    `,
    date: `Mar 2024 - May 2024 (${calculateDuration("Mar 2024", "May 2024")})`,
    icon: React.createElement(CgWorkAlt),
  },
  {
    id: "exp-4",
    title: "Python Development Intern",
    company: "OCTANET SERVICES PVT LTD",
    location: "Bhubaneswar, Odisha, India (Remote)",
    description: `
      • Built a Flask-based predictive model for 1,000+ users.\n
      • Optimized FutureFunds using Python, NumPy, pandas, TensorFlow.\n
      • Developed frontend with HTML5, JavaScript, and Firebase.
    `,
    date: `May 2024 - Jul 2024 (${calculateDuration("May 2024", "Jul 2024")})`,
    icon: React.createElement(FaLaptopCode),
  },
  {
    id: "exp-5",
    title: "Founder & CEO",
    company: "GenXRverse",
    location: "Chennai, Tamil Nadu, India (Hybrid)",
    description: ``,
    date: `Mar 2024 - Present (${calculateDuration("Mar 2024", "Present")})`,
    icon: React.createElement(FaLaptopCode),
  }
];

// Define the array of skills with type annotations
export const skillsData: readonly string[] = [
  "HTML",
  "CSS",
  "Tailwind CSS",
  "SCSS",
  "JavaScript",
  "React",
  "Redux",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Express.js",
  "MongoDB",
  "MySQL",
  "Postman",
  "Frame motion",
  "Java",
  "Python",
  "Git",
  "VsCode",
  "Vercel",
];

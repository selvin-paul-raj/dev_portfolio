import React from "react";
import luxehaven from "@/public/luxehaven.png";
import filmagic from "@/public/filmagic.png";
import vocalize from "@/public/vocalize.png";
import portfolio from "@/public/portfolio.png";
import chat from "@/public/chat.png";

import { GoHome } from "react-icons/go";
import { RxPerson } from "react-icons/rx";
import { MdOutlineWorkOutline, MdOutlineEmail } from "react-icons/md";
import { SiPolywork } from "react-icons/si";
import { FaCode, FaLinkedin, FaLaptopCode, FaNetworkWired } from "react-icons/fa";
import { StaticImageData } from "next/image";

interface Link {
  name: string;
  hash: string;
  icon: JSX.Element;
}

interface Project {
  title: string;
  description: string;
  tags: string[];
  imageUrl: StaticImageData;
  live: string;
  code: string;
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

// Define the array of projects with type annotations
export const projectsData: Project[] = [


];

// Define the array of experiences with type annotations
export const experiencesData: Experience[] = [
  {
    id: "exp-1",
    title: "Python Development Intern",
    company: "OCTANET SERVICES PVT LTD",
    location: "Bhubaneswar, Odisha, India (Remote)",
    description: `
      • Built a Flask-based predictive model for 1,000+ users.
      • Optimized FutureFunds using Python, NumPy, pandas, TensorFlow.
      • Developed frontend with HTML5, JavaScript, and Firebase.
    `,
    date: "May 2024 - Jul 2024",
    icon: <FaLaptopCode />,
  },
  {
    id: "exp-2",
    title: "Web Development Intern",
    company: "VERITECH SOFTWARE IT SERVICES",
    location: "Chennai, Tamil Nadu, India (Remote)",
    description: `
      • Created a responsive React portfolio site, boosting engagement by 35%.
      • Integrated a Generative-AI chatbot, increasing interactions by 40%.
      • Developed 3D landing page using Next.js and React-Spline.
      • Built a MERN stack Expense Tracker with dynamic charts.
    `,
    date: "Mar 2024 - May 2024",
    icon: <FaNetworkWired />,
  },
  {
    id: "exp-3",
    title: "Full Stack Intern",
    company: "SERVIMOS TECHNOLOGIES PVT LTD",
    location: "Chennai, Tamil Nadu, India (On-site)",
    description: `
      • Developed a scalable MERN stack Library Management System.
      • Enhanced software quality through collaboration and teamwork.
    `,
    date: "Jul 2023 - Aug 2023",
    icon: <FaCode />,
  },
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
  "Docker",
  "Java",
  "Python",
  "Git",
  "VsCode",
  "Vercel",
];

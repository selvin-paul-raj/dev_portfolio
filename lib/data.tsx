import React from "react";

import { CgWorkAlt } from "react-icons/cg";
import { FaLaptopCode } from "react-icons/fa";
import {
  LuGraduationCap,
  LuHouse,
  LuUser,
  LuBrain,
  LuLayoutGrid,
  LuMail,
  LuTrophy,
  LuAward,
  LuBriefcase,
} from "react-icons/lu";

import rawProjects from "./data/projects.json";
import rawExperiences from "./data/experiences.json";
import rawSkillsJson from "./data/skills.json";
import rawRecognition from "./data/recognition.json";
import rawCertifications from "./data/certifications.json";
import calculateDuration, { monthsBetween } from "@/utils/calculateDuration";

interface Link {
  readonly name: string;
  readonly hash: `#${string}`;
  readonly icon: React.ReactElement;
}

export const links = [
  {
    name: "Home",
    hash: "#home",
    icon: <LuHouse />,
  },
  {
    name: "About",
    hash: "#about",
    icon: <LuUser />,
  },
  {
    name: "Skills",
    hash: "#skills",
    icon: <LuBrain />,
  },
  {
    name: "Projects",
    hash: "#projects",
    icon: <LuLayoutGrid />,
  },
  {
    name: "Experience",
    hash: "#experience",
    icon: <LuBriefcase />,
  },
  {
    name: "Recognition",
    hash: "#recognition",
    icon: <LuTrophy />,
  },
  {
    name: "Certifications",
    hash: "#certifications",
    icon: <LuAward />,
  },
  {
    name: "Contact",
    hash: "#contact",
    icon: <LuMail />,
  },
] as const satisfies readonly Link[];

const iconMap: Record<string, React.ReactElement> = {
  graduation: React.createElement(LuGraduationCap),
  work: React.createElement(CgWorkAlt),
  laptop: React.createElement(FaLaptopCode),
};

export const experiencesData = [...rawExperiences]
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map((exp) => ({
    id: exp.id,
    title: exp.title,
    company: exp.company,
    location: exp.location,
    description: exp.description,
    date: `${exp.dateStart} - ${exp.dateEnd} (${calculateDuration(exp.dateStart, exp.dateEnd)})`,
    icon: iconMap[exp.icon] ?? React.createElement(CgWorkAlt),
    iconType: exp.icon as "graduation" | "work" | "laptop",
    isCurrent: exp.dateEnd === "Present",
  }));

export const projectsData = [...rawProjects]
  .filter((p) => p.show)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const skillsData: Record<string, string[]> =
  rawSkillsJson.skills as Record<string, string[]>;

export const skillsFlat: readonly string[] = Object.values(skillsData).flat();

const professionalRoles = rawExperiences.filter(
  (e) => e.icon !== "graduation" && e.icon !== "laptop"
);
const isInternship = (title: string) => /\bintern\b/i.test(title);
const sumMonths = (roles: typeof rawExperiences) =>
  roles.reduce((total, e) => total + monthsBetween(e.dateStart, e.dateEnd), 0);

const _internMonths = sumMonths(professionalRoles.filter((e) => isInternship(e.title)));
const _workRoleMonths = sumMonths(professionalRoles.filter((e) => !isInternship(e.title)));

export const experienceMetrics = {
  internMonths: _internMonths,
  workRoleMonths: _workRoleMonths,
  totalMonths: _internMonths + _workRoleMonths,
};

export const recognitionData = rawRecognition;
export const certificationsData = rawCertifications.filter((c) => c.show);

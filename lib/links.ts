import { createElement, type ReactElement } from "react";
import { LuHouse, LuUser, LuBrain, LuLayoutGrid, LuMail, LuTrophy, LuAward, LuBriefcase } from "react-icons/lu";

// Kept apart from lib/data so the header and command palette don't pull every content JSON into each route.
interface Link {
  readonly name: string;
  readonly hash: `#${string}`;
  readonly icon: ReactElement;
}

export const links = [
  { name: "Home", hash: "#home", icon: createElement(LuHouse) },
  { name: "About", hash: "#about", icon: createElement(LuUser) },
  { name: "Skills", hash: "#skills", icon: createElement(LuBrain) },
  { name: "Projects", hash: "#projects", icon: createElement(LuLayoutGrid) },
  { name: "Experience", hash: "#experience", icon: createElement(LuBriefcase) },
  { name: "Recognition", hash: "#recognition", icon: createElement(LuTrophy) },
  { name: "Certifications", hash: "#certifications", icon: createElement(LuAward) },
  { name: "Contact", hash: "#contact", icon: createElement(LuMail) },
] as const satisfies readonly Link[];

export type SectionName = (typeof links)[number]["name"];

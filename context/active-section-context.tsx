"use client";

import { createContext, useContext, useState } from "react";
import type { SectionName } from "@/lib/links";
type activeSectionContextProps = { children: React.ReactNode };
type activeSectionContextType = {
  activeSection: SectionName;
  setActiveSection: React.Dispatch<React.SetStateAction<SectionName>>;
  timeOfLastClick: number;
  setTimeOfLastClick: React.Dispatch<React.SetStateAction<number>>;
};

export const ActiveSectionContext =
  createContext<activeSectionContextType | null>(null);

const ActiveSectionContextProvider = ({
  children,
}: activeSectionContextProps) => {
  const [activeSection, setActiveSection] = useState<SectionName>("Home");
  // Set on nav clicks so useSectionInView ignores the observer for a second while the page scrolls.
  const [timeOfLastClick, setTimeOfLastClick] = useState(0);
  return (
    <ActiveSectionContext.Provider
      value={{
        activeSection,
        setActiveSection,
        timeOfLastClick,
        setTimeOfLastClick,
      }}
    >
      {children}
    </ActiveSectionContext.Provider>
  );
};
export default ActiveSectionContextProvider;

export function useActiveSectionContext() {
  const context = useContext(ActiveSectionContext);

  if (context === null) {
    throw new Error(
      "useActiveSectionContext must be used within a ActiveSectionContextProvider"
    );
  }
  return context;
}

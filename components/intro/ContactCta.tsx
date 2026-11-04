"use client";

import type { ReactNode } from "react";
import { useActiveSectionContext } from "@/context/active-section-context";

/** "Get in touch" link: marks Contact active right away so the nav doesn't flicker through the sections in between. */
export default function ContactCta({ className, children }: { className: string; children: ReactNode }) {
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  return (
    <a
      href="#contact"
      onClick={() => {
        setActiveSection("Contact");
        setTimeOfLastClick(Date.now());
      }}
      className={className}
      style={{ transition: "opacity 150ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
    >
      {children}
    </a>
  );
}

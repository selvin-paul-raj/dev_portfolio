"use client";

import type { ReactNode } from "react";
import { useSectionInView } from "@/lib/hooks";

/** The About <section>: client only for the nav's in-view tracking, so its content can render on the server. */
export default function AboutSection({ children }: { children: ReactNode }) {
  const { ref } = useSectionInView("About");
  return (
    <section ref={ref} id="about" className="mb-28 w-full max-w-[1240px] mx-auto px-4 sm:px-10 scroll-mt-28">
      {children}
    </section>
  );
}

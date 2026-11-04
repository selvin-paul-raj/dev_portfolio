"use client";

import type { ReactNode } from "react";
import { useSectionInView } from "@/lib/hooks";

/** The hero <section>: client only for the nav's in-view tracking, so the hero itself renders on the server. */
export default function IntroSection({ children }: { children: ReactNode }) {
  const { ref } = useSectionInView("Home", 0.5);
  return (
    <section ref={ref} id="home" className="w-full max-w-5xl mx-auto px-0 sm:px-4 mb-16 scroll-mt-[100rem] md:pt-8">
      {children}
    </section>
  );
}

"use client";

import { useEffect } from "react";

/**
 * Renders nothing. Sparklines are server-rendered fully drawn; this arms the ones still below
 * the fold and draws each in once it scrolls into view. Skipped under reduced motion.
 */
export default function SparkReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.spark = "play";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    for (const el of document.querySelectorAll<HTMLElement>("[data-spark]")) {
      // Already on screen at hydration: it was painted drawn, so leave it.
      if (el.getBoundingClientRect().top < window.innerHeight) continue;
      el.dataset.spark = "armed";
      io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return null;
}

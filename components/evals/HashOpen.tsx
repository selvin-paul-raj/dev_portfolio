"use client";

import { useEffect } from "react";

/**
 * Renders nothing. When the URL hash names an element inside a closed <details>, opens it and
 * brings the element into view, so links into collapsed case tables work.
 */
export default function HashOpen() {
  useEffect(() => {
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      const details = el?.closest("details");
      if (!el || !details) return;
      details.open = true;
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
      el.focus({ preventScroll: true });
    };
    // A second tap on the same cell does not change the hash, so clicks on hash links reveal too.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (link && link.getAttribute("href") === window.location.hash) reveal();
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", reveal);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}

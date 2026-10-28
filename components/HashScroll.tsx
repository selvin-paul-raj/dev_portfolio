"use client";

import { useEffect } from "react";

// Sections below About are code-split (next/dynamic), so when another route
// links to "/#experience" the target doesn't exist yet when the browser tries
// to scroll. Wait for it to mount, then scroll once.
const MAX_WAIT_MS = 4000;

function scrollToHash(): () => void {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const started = performance.now();
  let frame = 0;

  const tick = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    if (performance.now() - started < MAX_WAIT_MS) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

export default function HashScroll() {
  useEffect(() => {
    let cancel = scrollToHash();
    const onHash = () => {
      cancel();
      cancel = scrollToHash();
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      cancel();
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
  return null;
}

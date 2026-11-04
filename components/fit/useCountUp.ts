"use client";

import { useEffect, useRef } from "react";

const DURATION_MS = 600;
// Matches --ease-out-expo closely enough for a number: fast start, long settle.
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Counts the element's text from 0 to `value` once, on mount. The markup already holds the
 * final value, so reduced motion (or no animation frame) simply shows it. Writes textContent
 * directly, so there is no re-render per frame.
 */
export function useCountUp<T extends HTMLElement>(value: number) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      el.textContent = String(Math.round(value * easeOutExpo(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    el.textContent = "0";
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      el.textContent = String(value);
    };
  }, [value]);

  return ref;
}

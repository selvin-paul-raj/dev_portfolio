"use client";

import React, { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type NumberTickerProps = {
  value: number;
  /** Turns the (rounded) current value into display text. Defaults to String. */
  format?: (n: number) => string;
  /** Seconds. */
  duration?: number;
  className?: string;
};

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

/**
 * Counts up from 0 to `value` the first time it scrolls into view.
 *
 * - SSR markup already contains the final value, so there is no layout shift and
 *   no-JS / crawler output is correct.
 * - Updates `textContent` directly from Framer Motion's `animate()` — no React
 *   re-render per frame.
 * - Screen readers get the final value once (the animated digits are aria-hidden).
 * - Under prefers-reduced-motion the final value is shown and never animated.
 */
export default function NumberTicker({
  value,
  format = String,
  duration = 1.4,
  className,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduceMotion = useReducedMotion();
  const started = useRef(false);
  // Keep the latest formatter without re-triggering the effect when a parent
  // re-renders with a new inline function.
  const formatRef = useRef(format);
  useEffect(() => {
    formatRef.current = format;
  });

  const finalText = format(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || started.current) return;
    started.current = true;
    if (reduceMotion || value <= 0) return;

    el.textContent = formatRef.current(0);
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => {
        el.textContent = formatRef.current(Math.round(v));
      },
    });
    return () => {
      controls.stop();
      started.current = false;
      el.textContent = formatRef.current(value);
    };
  }, [inView, reduceMotion, value, duration]);

  return (
    <>
      <span
        ref={ref}
        aria-hidden="true"
        className={`inline-block tabular-nums text-right${className ? ` ${className}` : ""}`}
        // Reserve the final width (tabular digits are 1ch each) so the count-up never reflows.
        style={{ minWidth: `${finalText.length}ch` }}
        suppressHydrationWarning
      >
        {finalText}
      </span>
      <span className="sr-only">{finalText}</span>
    </>
  );
}

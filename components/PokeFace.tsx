"use client";

import { useEffect, useRef } from "react";
import { mountPokeFace } from "./poke-face/engine";
import "./poke-face/poke-face.css";

type Props = {
  /** Folder in /public holding the face .webp files */
  base?: string;
  /** Circle colour behind the head */
  circleColor?: string;
  className?: string;
  label?: string;
};

/** Interactive, stretchy portrait. Drag, poke, and leave it idle to see it whistle and sleep. */
export default function PokeFace({
  base = "/poke-face/faces",
  circleColor = "#ff2d0a",
  className = "",
  label = "Selvin, smiling. Grab and stretch his face.",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountPokeFace(ref.current, { base });
  }, [base]);

  return (
    <div
      ref={ref}
      data-pf="stage"
      className={`pf-stage ${className}`}
      style={{ ["--pf-circle" as string]: circleColor }}
    >
      <div className="circle" />
      <canvas data-pf="cv" role="img" aria-label={label} />
      <button data-pf="hit" className="hit" aria-label="Poke the face" />
      <div data-pf="notes" className="notes" aria-hidden="true"><span>♪</span><span>♫</span><span>♪</span></div>
      <div data-pf="zzz" className="zzz" aria-hidden="true"><span>z</span><span>Z</span><span>Z</span></div>
      <div data-pf="bubble" className="bubble" aria-hidden="true" />
      <svg data-pf="ghost" className="ghost" viewBox="0 0 32 32" aria-hidden="true">
        <path className="open" d="M10.5 16.5V8.2a1.8 1.8 0 0 1 3.6 0V14v-8a1.8 1.8 0 0 1 3.6 0V14 7a1.8 1.8 0 0 1 3.6 0v8-5a1.8 1.8 0 0 1 3.6 0v10.5c0 5-3.4 8.5-8.4 8.5-3.6 0-5.7-1.6-7.6-4.6l-3.5-5.6c-.6-1 .1-2.2 1.2-2.4 1-.2 1.9.2 2.6 1z" />
        <path className="grab" d="M10.5 17v-3.3a1.8 1.8 0 0 1 3.6 0V14v-1.8a1.8 1.8 0 0 1 3.6 0V14v-1.3a1.8 1.8 0 0 1 3.6 0V14v-.3a1.8 1.8 0 0 1 3.6 0v6.8c0 5-3.4 8.5-8.4 8.5-3.6 0-5.7-1.6-7.6-4.6l-2.3-3.7c-.6-1 .1-2.2 1.2-2.4 1-.2 1.9.2 2.7 1z" />
      </svg>
    </div>
  );
}

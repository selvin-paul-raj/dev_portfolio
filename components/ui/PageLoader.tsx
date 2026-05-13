"use client";

import { useEffect, useState } from "react";
import { ParticleTextEffect } from "./particle-text-effect";

const LOADER_WORDS = ["SELVIN", "AI ENGINEER", "AGENTIC AI", "MCP BUILDER", "MULTI-AGENT"];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const MIN_MS = 900;
    const start = Date.now();

    const dismiss = () => {
      const wait = Math.max(0, MIN_MS - (Date.now() - start));
      setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 650);
      }, wait);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
      return () => window.removeEventListener("load", dismiss);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#07070a] flex flex-col items-center justify-center"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 650ms ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="w-full max-w-3xl px-4">
        <ParticleTextEffect
          words={LOADER_WORDS}
          className="w-full flex items-center justify-center"
        />
      </div>
      <div className="mt-6 flex items-center gap-2.5 font-mono text-[11px] text-white/25 tracking-[0.35em] uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-ping" />
        Loading
      </div>
    </div>
  );
}

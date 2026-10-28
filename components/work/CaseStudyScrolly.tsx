"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import PipelineDiagram, { DiagramLegend } from "./PipelineDiagram";
import type { CaseStudy } from "@/lib/work";

const pad = (n: number) => String(n).padStart(2, "0");

export default function CaseStudyScrolly({ study }: { study: CaseStudy }) {
  const { steps, diagram } = study;
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    // The step crossing the reading band drives the diagram. On small screens the
    // diagram docks over the top 40% of the viewport, so the band sits lower.
    const docked = !window.matchMedia("(min-width: 1024px)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: docked ? "-58% 0px -37% 0px" : "-45% 0px -50% 0px" }
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // The diagram renders full width and pans so the active stage stays centred:
  // node y as a fraction of the SVG's rendered height (100cqw * H/W).
  const focusY = useMemo(() => {
    const ys = diagram.nodes.filter((n) => steps[active].nodes.includes(n.id)).map((n) => n.y);
    return ys.reduce((a, b) => a + b, 0) / Math.max(ys.length, 1);
  }, [diagram.nodes, steps, active]);

  const visited = useMemo(() => new Set(steps.slice(0, active + 1).flatMap((s) => s.nodes)), [steps, active]);

  const jumpToNode = (id: string) => {
    const index = steps.findIndex((s) => s.nodes.includes(id));
    const el = stepRefs.current[index];
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    el.focus({ preventScroll: true });
  };

  return (
    <div className="relative grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-x-14">
      {/* Diagram: pinned beside the steps on desktop, docked at the top on small screens */}
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 h-[40vh] lg:top-16 lg:mx-0 lg:px-0 lg:py-0 lg:h-[calc(100vh-8rem)] flex items-center
        bg-[#FAFAF9]/90 dark:bg-[#09090b]/90 backdrop-blur-sm lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none
        border-b border-black/5 dark:border-white/5 lg:border-0">
        <figure className="w-full h-full flex flex-col">
          <figcaption className="flex justify-between font-mono text-[0.7rem] uppercase tracking-[0.14em] text-gray-500 dark:text-white/50 mb-2">
            <span>System</span>
            <span aria-live="polite">
              Step {pad(active + 1)} / {pad(steps.length)}
            </span>
          </figcaption>
          <div className="pipeline-viewport flex-1 min-h-0 overflow-hidden [container-type:inline-size]">
            <div
              className="pipeline-pan"
              style={{ "--focus": `${(focusY / diagram.width) * 100}cqw` } as CSSProperties}
            >
            <PipelineDiagram
              title={study.title}
              width={diagram.width}
              height={diagram.height}
              nodes={diagram.nodes}
              edges={diagram.edges}
              activeNodes={steps[active].nodes}
              activeEdges={steps[active].edges}
              clusters={diagram.clusters}
              visitedNodes={visited}
              activeStep={active}
              onSelectNode={jumpToNode}
            />
            </div>
          </div>
          <div className="pt-2 hidden sm:block">
            <DiagramLegend nodes={diagram.nodes} edges={diagram.edges} />
          </div>
        </figure>
      </div>

      <ol className="relative">
        {steps.map((step, i) => (
          <li
            key={step.title}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            data-index={i}
            tabIndex={-1}
            className="min-h-[55vh] lg:min-h-[70vh] flex flex-col justify-center py-10 outline-none first:pt-6 last:min-h-[45vh]"
          >
            <div
              className={i === active ? "opacity-100" : "opacity-50"}
              style={{ transition: "opacity 400ms cubic-bezier(0.25,1,0.5,1)" }}
            >
              <p className="font-mono text-xs tabular-nums text-accent-ink dark:text-accent mb-3">{pad(i + 1)}</p>
              <h3 className="text-[1.35rem] sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white leading-snug mb-3">
                {step.title}
              </h3>
              <p className="text-base leading-[1.7] text-gray-600 dark:text-white/65 max-w-[52ch]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

"use client";

import type { KeyboardEvent } from "react";
import type { DiagramNode, Edge } from "@/lib/work";

const MAIN_W = 150;
const SIDE_W = 116;
const H = 40;
const H_SUB = 50;

const widthOf = (n: DiagramNode) => (n.side ? SIDE_W : MAIN_W);
const heightOf = (n: DiagramNode) => (n.sub ? H_SUB : H);
const edgeKey = ([a, b]: Edge) => `${a}>${b}`;

/** Border-to-border path between two nodes: straight when horizontal, an S-curve when vertical. */
function edgePath(a: DiagramNode, b: DiagramNode): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    const x1 = a.x + Math.sign(dx) * (widthOf(a) / 2);
    const x2 = b.x - Math.sign(dx) * (widthOf(b) / 2);
    return `M ${x1} ${a.y} L ${x2} ${b.y}`;
  }
  const y1 = a.y + Math.sign(dy) * (heightOf(a) / 2);
  const y2 = b.y - Math.sign(dy) * (heightOf(b) / 2);
  const mid = (y1 + y2) / 2;
  return dx === 0 ? `M ${a.x} ${y1} L ${b.x} ${y2}` : `M ${a.x} ${y1} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${y2}`;
}

interface Props {
  title: string;
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: Edge[];
  activeNodes: string[];
  activeEdges: Edge[];
  visitedNodes: Set<string>;
  activeStep: number;
  onSelectNode: (id: string) => void;
}

export default function PipelineDiagram({
  title,
  width,
  height,
  nodes,
  edges,
  activeNodes,
  activeEdges,
  visitedNodes,
  activeStep,
  onSelectNode,
}: Props) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const active = new Set(activeNodes);
  const hot = new Set(activeEdges.map(edgeKey));

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectNode(id);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto lg:h-full lg:max-h-full"
      aria-label={`${title} pipeline: ${nodes.map((n) => n.label).join(", ")}`}
    >
      <defs>
        <pattern id="dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" className="fill-black/[0.09] dark:fill-white/[0.07]" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#dot-grid)" />

      {edges.map((edge) => {
        const [a, b] = [byId.get(edge[0]), byId.get(edge[1])];
        if (!a || !b) return null;
        const d = edgePath(a, b);
        const isHot = hot.has(edgeKey(edge));
        const visited = visitedNodes.has(edge[0]) && visitedNodes.has(edge[1]);
        return (
          <g key={edgeKey(edge)}>
            <path
              d={d}
              fill="none"
              strokeWidth={1}
              className={visited ? "stroke-black/30 dark:stroke-white/30" : "stroke-black/15 dark:stroke-white/[0.12]"}
              strokeDasharray={visited ? undefined : "3 4"}
            />
            {isHot && (
              <g key={`hot-${activeStep}`}>
                <path d={d} fill="none" strokeWidth={1.5} pathLength={1} className="stroke-accent pipeline-draw" />
                <circle r={3} className="fill-accent pipeline-packet" style={{ offsetPath: `path("${d}")` }} />
              </g>
            )}
          </g>
        );
      })}

      {nodes.map((n) => {
        const w = widthOf(n);
        const h = heightOf(n);
        const isActive = active.has(n.id);
        const isVisited = visitedNodes.has(n.id);
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-label={`${n.label}${n.sub ? `, ${n.sub}` : ""}: jump to this step`}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onSelectNode(n.id)}
            onKeyDown={(e) => onKey(e, n.id)}
            className="cursor-pointer outline-none group"
          >
            <rect
              x={n.x - w / 2}
              y={n.y - h / 2}
              width={w}
              height={h}
              rx={6}
              strokeWidth={isActive ? 1.5 : 1}
              className={
                isActive
                  ? "fill-accent/[0.12] stroke-accent"
                  : isVisited
                    ? "fill-white dark:fill-[#111113] stroke-black/30 dark:stroke-white/30"
                    : "fill-white dark:fill-[#0d0d0f] stroke-black/15 dark:stroke-white/[0.14] group-hover:stroke-black/40 dark:group-hover:stroke-white/40"
              }
              style={{ transition: "fill 300ms cubic-bezier(0.25,1,0.5,1), stroke 300ms cubic-bezier(0.25,1,0.5,1)" }}
            />
            <rect
              x={n.x - w / 2 - 3}
              y={n.y - h / 2 - 3}
              width={w + 6}
              height={h + 6}
              rx={8}
              fill="none"
              strokeWidth={2}
              className="stroke-accent opacity-0 group-focus-visible:opacity-100"
            />
            <text
              x={n.x}
              y={n.sub ? n.y - 5 : n.y + 4}
              textAnchor="middle"
              className={`font-sans text-[11.5px] font-medium ${
                isActive ? "fill-gray-950 dark:fill-white" : isVisited ? "fill-gray-700 dark:fill-white/75" : "fill-gray-500 dark:fill-white/55"
              }`}
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                x={n.x}
                y={n.y + 12}
                textAnchor="middle"
                className={`font-mono text-[9px] ${isActive ? "fill-accent-ink dark:fill-accent" : "fill-gray-500 dark:fill-white/45"}`}
              >
                {n.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

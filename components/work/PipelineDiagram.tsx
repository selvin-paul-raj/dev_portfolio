"use client";

import type { KeyboardEvent } from "react";
import { edgeKey, edgeKind } from "@/lib/work";
import type { DiagramCluster, DiagramNode, Edge, EdgeKind } from "@/lib/work";

const H = 40;
const H_SUB = 50;

const widthOf = (n: DiagramNode) => n.w ?? (n.side ? 116 : n.kind === "gate" ? 124 : 150);
const heightOf = (n: DiagramNode) => (n.kind === "gate" ? 46 : n.sub ? H_SUB : H);

/** Border-to-border path: straight within a row, an S-curve between rows, a side loop for retries/bypasses. */
function edgePath(a: DiagramNode, b: DiagramNode, kind: EdgeKind): string {
  if (kind === "retry" || kind === "bypass") {
    const x1 = a.x + widthOf(a) / 2;
    const x2 = b.x + widthOf(b) / 2;
    const bulge = Math.max(x1, x2) + 34;
    return `M ${x1} ${a.y} C ${bulge} ${a.y}, ${bulge} ${b.y}, ${x2} ${b.y}`;
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Same row: straight horizontal link. Otherwise leave from the bottom/top edge.
  if (Math.abs(dy) < 24) {
    const x1 = a.x + Math.sign(dx) * (widthOf(a) / 2);
    const x2 = b.x - Math.sign(dx) * (widthOf(b) / 2);
    return `M ${x1} ${a.y} L ${x2} ${b.y}`;
  }
  const y1 = a.y + Math.sign(dy) * (heightOf(a) / 2);
  const y2 = b.y - Math.sign(dy) * (heightOf(b) / 2);
  const mid = (y1 + y2) / 2;
  return dx === 0 ? `M ${a.x} ${y1} L ${b.x} ${y2}` : `M ${a.x} ${y1} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${y2}`;
}

/** Label anchor: midpoint of the drawn segment, or the apex of a side loop. */
function edgeMid(d: string, kind: EdgeKind): [number, number] {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const [x1, y1] = [nums[0], nums[1]];
  const [x2, y2] = [nums[nums.length - 2], nums[nums.length - 1]];
  if (kind === "retry" || kind === "bypass") {
    // Cubic with both control points at x = bulge: the apex sits at 1/8·x1 + 3/4·bulge + 1/8·x2.
    return [x1 / 8 + (3 * nums[2]) / 4 + x2 / 8, (y1 + y2) / 2];
  }
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}

const EDGE_STYLE: Record<EdgeKind, { dash?: string; cls: string; visitedCls: string }> = {
  normal: { cls: "stroke-black/15 dark:stroke-white/[0.13]", visitedCls: "stroke-black/35 dark:stroke-white/35" },
  conditional: { dash: "5 4", cls: "stroke-black/15 dark:stroke-white/[0.13]", visitedCls: "stroke-black/35 dark:stroke-white/35" },
  fanout: { cls: "stroke-black/15 dark:stroke-white/[0.13]", visitedCls: "stroke-black/35 dark:stroke-white/35" },
  bypass: { dash: "7 4", cls: "stroke-black/15 dark:stroke-white/[0.13]", visitedCls: "stroke-black/35 dark:stroke-white/35" },
  retry: { dash: "3 4", cls: "stroke-black/15 dark:stroke-white/[0.13]", visitedCls: "stroke-black/35 dark:stroke-white/35" },
  hitl: { dash: "2 3", cls: "stroke-orange-500/35", visitedCls: "stroke-orange-500/70" },
};

function NodeShape({ n, active, visited }: { n: DiagramNode; active: boolean; visited: boolean }) {
  const w = widthOf(n);
  const h = heightOf(n);
  const x = n.x - w / 2;
  const y = n.y - h / 2;
  const hitl = n.kind === "hitl";
  const tone = active
    ? hitl
      ? "fill-orange-500/[0.14] stroke-orange-500"
      : "fill-accent/[0.12] stroke-accent"
    : visited
      ? "fill-white dark:fill-[#111113] stroke-black/35 dark:stroke-white/30"
      : "fill-white dark:fill-[#0d0d0f] stroke-black/15 dark:stroke-white/[0.14] group-hover:stroke-black/40 dark:group-hover:stroke-white/40";
  const common = {
    strokeWidth: active ? 1.5 : 1,
    className: tone,
    style: { transition: "fill 300ms cubic-bezier(0.25,1,0.5,1), stroke 300ms cubic-bezier(0.25,1,0.5,1)" },
  };

  if (n.kind === "gate") {
    const pts = `${n.x},${y} ${x + w},${n.y} ${n.x},${y + h} ${x},${n.y}`;
    return <polygon points={pts} {...common} />;
  }
  if (n.kind === "store") {
    const r = 5;
    return (
      <g>
        <path d={`M ${x} ${y + r} V ${y + h - r} A ${w / 2} ${r} 0 0 0 ${x + w} ${y + h - r} V ${y + r}`} {...common} />
        <ellipse cx={n.x} cy={y + r} rx={w / 2} ry={r} {...common} />
      </g>
    );
  }
  return (
    <g>
      {n.kind === "fanout" && (
        <rect x={x + 4} y={y - 4} width={w} height={h} rx={6} strokeWidth={1} className="fill-transparent stroke-black/15 dark:stroke-white/[0.14]" />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={n.kind === "io" ? h / 2 : 6}
        strokeDasharray={hitl ? "4 3" : undefined}
        {...common}
      />
    </g>
  );
}

interface Props {
  title: string;
  width: number;
  height: number;
  clusters?: DiagramCluster[];
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
  clusters = [],
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
  const inCluster = (c: DiagramCluster, n: DiagramNode) => n.x >= c.x && n.x <= c.x + c.w && n.y >= c.y && n.y <= c.y + c.h;

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectNode(id);
    }
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label={`${title} architecture: ${nodes.map((n) => n.label).join(", ")}`}>
      <defs>
        <pattern id="dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" className="fill-black/[0.08] dark:fill-white/[0.06]" />
        </pattern>
        <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" className="fill-black/40 dark:fill-white/40" />
        </marker>
        <marker id="arrow-hot" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" className="fill-accent" />
        </marker>
      </defs>
      <rect width={width} height={height} fill="url(#dot-grid)" />

      {clusters.map((c) => {
        const lit = nodes.some((n) => active.has(n.id) && inCluster(c, n));
        return (
          <g key={c.id}>
            <rect
              x={c.x}
              y={c.y}
              width={c.w}
              height={c.h}
              rx={12}
              strokeWidth={1}
              className={lit ? "fill-accent/[0.035] stroke-accent/50" : "fill-black/[0.015] dark:fill-white/[0.02] stroke-black/10 dark:stroke-white/10"}
              style={{ transition: "fill 400ms ease, stroke 400ms ease" }}
            />
            <text x={c.x + 12} y={c.y + 17} className={`font-mono text-[9px] uppercase tracking-[0.12em] ${lit ? "fill-accent-ink dark:fill-accent" : "fill-gray-500 dark:fill-white/45"}`}>
              {c.label}
            </text>
            {c.sub && (
              <text x={c.x + c.w - 12} y={c.y + 17} textAnchor="end" className="font-mono text-[8px] fill-gray-400 dark:fill-white/30">
                {c.sub}
              </text>
            )}
          </g>
        );
      })}

      {edges.map((edge) => {
        const [a, b] = [byId.get(edge[0]), byId.get(edge[1])];
        if (!a || !b) return null;
        const kind = edgeKind(edge);
        const d = edgePath(a, b, kind);
        const isHot = hot.has(edgeKey(edge));
        const visited = visitedNodes.has(edge[0]) && visitedNodes.has(edge[1]);
        const style = EDGE_STYLE[kind];
        const [mx, my] = edgeMid(d, kind);
        const label = edge[3] ?? (kind === "fanout" ? "× n" : undefined);
        return (
          <g key={edgeKey(edge)}>
            <path
              d={d}
              fill="none"
              strokeWidth={kind === "fanout" ? 2.25 : 1}
              strokeDasharray={style.dash}
              markerEnd="url(#arrow)"
              className={visited ? style.visitedCls : style.cls}
            />
            {isHot && (
              <g key={`hot-${activeStep}`}>
                <path d={d} fill="none" strokeWidth={1.6} pathLength={1} markerEnd="url(#arrow-hot)" className="stroke-accent pipeline-draw" />
                <circle r={3} className="fill-accent pipeline-packet" style={{ offsetPath: `path("${d}")` }} />
              </g>
            )}
            {label && (
              <text
                x={mx}
                y={my + 3}
                textAnchor="middle"
                className={`font-mono text-[8.5px] ${kind === "hitl" ? "fill-orange-600 dark:fill-orange-400" : "fill-gray-500 dark:fill-white/50"}`}
                style={{ paintOrder: "stroke", stroke: "var(--diagram-bg)", strokeWidth: 4 }}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}

      {nodes.map((n) => {
        const isActive = active.has(n.id);
        const isVisited = visitedNodes.has(n.id);
        const w = widthOf(n);
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-label={`${n.label}${n.sub ? `, ${n.sub}` : ""}${n.kind === "hitl" ? " (human review)" : ""}: jump to this step`}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onSelectNode(n.id)}
            onKeyDown={(e) => onKey(e, n.id)}
            className="cursor-pointer outline-none group"
          >
            <NodeShape n={n} active={isActive} visited={isVisited} />
            <rect
              x={n.x - w / 2 - 4}
              y={n.y - heightOf(n) / 2 - 4}
              width={w + 8}
              height={heightOf(n) + 8}
              rx={8}
              fill="none"
              strokeWidth={2}
              className="stroke-accent opacity-0 group-focus-visible:opacity-100"
            />
            {n.kind === "llm" && (
              <text x={n.x + w / 2 - 6} y={n.y - heightOf(n) / 2 + 9} textAnchor="end" className="font-mono text-[7px] tracking-[0.08em] fill-accent-ink dark:fill-accent/80">
                LLM
              </text>
            )}
            {n.kind === "hitl" && (
              <text x={n.x + w / 2 - 6} y={n.y - heightOf(n) / 2 + 9} textAnchor="end" className="font-mono text-[7px] tracking-[0.08em] fill-orange-600 dark:fill-orange-400">
                HITL
              </text>
            )}
            <text
              x={n.x}
              y={n.sub ? n.y - 4 : n.y + 4}
              textAnchor="middle"
              className={`font-sans text-[11px] font-medium ${
                isActive ? "fill-gray-950 dark:fill-white" : isVisited ? "fill-gray-700 dark:fill-white/80" : "fill-gray-500 dark:fill-white/55"
              }`}
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                x={n.x}
                y={n.y + 12}
                textAnchor="middle"
                className={`font-mono text-[8.5px] ${isActive ? "fill-accent-ink dark:fill-accent" : "fill-gray-500 dark:fill-white/45"}`}
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

/** Legend for the node/edge kinds a diagram actually uses. */
export function DiagramLegend({ nodes, edges }: { nodes: DiagramNode[]; edges: Edge[] }) {
  const kinds = new Set(nodes.map((n) => n.kind ?? "process"));
  const edgeKinds = new Set(edges.map(edgeKind));
  const items: Array<[boolean, string, string]> = [
    [kinds.has("llm"), "LLM", "model call"],
    [kinds.has("gate"), "◇", "routing gate"],
    [kinds.has("hitl") || edgeKinds.has("hitl"), "HITL", "human review interrupt"],
    [kinds.has("fanout") || edgeKinds.has("fanout"), "× n", "parallel fan-out"],
    [kinds.has("store"), "▭", "store / memory"],
    [edgeKinds.has("conditional"), "- - -", "conditional path"],
    [edgeKinds.has("retry"), "↺", "retry loop"],
    [edgeKinds.has("bypass"), "⤳", "skip path"],
  ];
  const shown = items.filter(([on]) => on);
  if (shown.length === 0) return null;
  return (
    <ul aria-label="Diagram legend" className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.65rem] text-gray-500 dark:text-white/45">
      {shown.map(([, mark, label]) => (
        <li key={label}>
          <span className={mark === "HITL" ? "text-orange-600 dark:text-orange-400" : "text-accent-ink dark:text-accent"}>{mark}</span> {label}
        </li>
      ))}
    </ul>
  );
}

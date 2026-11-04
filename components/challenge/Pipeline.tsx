"use client";

import { m, useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import { LuArrowDown, LuArrowRight, LuCheck, LuEyeOff, LuFilter, LuScanSearch, LuScrollText, LuShieldCheck, LuShieldX } from "react-icons/lu";
import Meter from "@/components/tools/Meter";
import { layerLabel, type Layer, type TraceStep } from "./types";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

type NodeState = "off" | "idle" | "pass" | "block" | "unreached";

const ICONS: Record<string, IconType> = {
  "scope filter": LuScanSearch,
  "input filter": LuFilter,
  "system prompt": LuScrollText,
  "output filter": LuEyeOff,
  "guard model": LuShieldCheck,
};

const JUDGES: Record<NonNullable<TraceStep["judge"]>, string> = {
  typesafe: "TypeSafe model",
  fallback: "Chat model fallback",
  rule: "Keyword rule",
};

const SCORE_LABELS: Record<string, string> = {
  "scope filter": "Scope filter: chance this is a free-chat request",
  "guard model": "Guard model: chance the reply leaks the password",
};

const STATE_TEXT: Record<NodeState, string> = {
  off: "Off at this level",
  idle: "On at this level",
  pass: "Passed",
  block: "Blocked",
  unreached: "Not reached",
};

const NODE_STYLE: Record<NodeState, string> = {
  off: "border-dashed border-line bg-transparent",
  idle: "border-line-strong bg-surface",
  pass: "border-ok/50 bg-ok/10",
  block: "border-danger/60 bg-danger/10",
  unreached: "border-line bg-surface",
};

const ICON_TONE: Record<NodeState, string> = {
  off: "text-muted",
  idle: "text-accent-fg",
  pass: "text-ok",
  block: "text-danger",
  unreached: "text-muted",
};

/** Each layer's state after an attack: the last trace entry for it wins (the scope filter also checks the reply). */
function nodeStates(stack: readonly string[], active: readonly Layer[], trace?: TraceStep[]) {
  return stack.map((layer) => {
    const steps = trace?.filter((s) => s.layer === layer) ?? [];
    const last = steps[steps.length - 1];
    const scored = steps.find((s) => s.score !== undefined);
    let state: NodeState;
    if (!active.includes(layer as Layer)) state = "off";
    else if (!trace) state = "idle";
    else if (!last) state = "unreached";
    else state = last.verdict === "block" ? "block" : last.verdict === "pass" ? "pass" : "off";
    const onReply = state === "block" && layer === "scope filter" && steps.length > 1;
    return { layer, state, judge: last?.judge, score: scored?.score, onReply };
  });
}

/**
 * The defense stack for one level, drawn left to right (top to bottom on phones).
 * Pass the latest attack's `trace` to light up the path it took; `runId` replays the
 * staggered reveal for each new attack.
 */
export default function Pipeline({
  stack,
  active,
  trace,
  runId,
  compact = false,
}: {
  stack: readonly string[];
  active: readonly Layer[];
  trace?: TraceStep[];
  runId?: string;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const nodes = nodeStates(stack, active, trace);
  const scores = nodes.filter((n) => n.score !== undefined);
  const blocked = nodes.find((n) => n.state === "block");

  return (
    <div className="flex flex-col gap-4">
      <ol aria-label="Defense pipeline" className="flex flex-col gap-1 md:flex-row md:items-stretch md:gap-0">
        {nodes.map((n, i) => {
          const Icon = n.state === "block" ? LuShieldX : ICONS[n.layer] ?? LuShieldCheck;
          return (
            <li key={n.layer} className="flex flex-col items-stretch md:flex-1 md:flex-row md:items-center md:min-w-0">
              {i > 0 && (
                <span aria-hidden="true" className="flex justify-center py-0.5 text-muted md:px-1 md:py-0">
                  <LuArrowDown size={14} className="md:hidden" />
                  <LuArrowRight size={14} className="hidden md:block" />
                </span>
              )}
              <m.div
                key={`${runId ?? "idle"}-${n.layer}`}
                initial={reduce || !trace ? false : { opacity: 0.35, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.14, duration: 0.24, ease: EASE_OUT }}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 md:flex-col md:items-start md:gap-1.5 ${NODE_STYLE[n.state]} ${
                  compact ? "md:py-2" : "md:min-h-[6.5rem]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon size={16} aria-hidden="true" className={`shrink-0 ${ICON_TONE[n.state]}`} />
                  {n.state === "pass" && <LuCheck size={12} aria-hidden="true" className="text-ok" />}
                </span>
                <span className="min-w-0 flex-1 md:flex-none">
                  <span className={`block text-sm font-medium ${n.state === "off" ? "text-muted" : "text-fg"}`}>{layerLabel(n.layer)}</span>
                  <span className="block text-xs text-fg-2">
                    {n.onReply ? "Blocked the reply" : STATE_TEXT[n.state]}
                    {n.judge && n.state !== "off" && !compact && <span className="block text-muted">{JUDGES[n.judge]}</span>}
                  </span>
                </span>
              </m.div>
            </li>
          );
        })}
      </ol>

      {trace && (
        <p className="text-sm text-fg-2">
          {blocked ? (
            <>
              Stopped at the <span className="font-medium text-fg">{blocked.layer}</span>
              {blocked.onReply ? ", which dropped the model's reply." : "."}
            </>
          ) : (
            "Every layer let the last message through, and the gatekeeper replied."
          )}
        </p>
      )}

      {scores.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {scores.map((n) => (
            <Meter
              key={n.layer}
              label={SCORE_LABELS[n.layer] ?? layerLabel(n.layer)}
              value={n.score ?? 0}
              display={`${Math.round((n.score ?? 0) * 100)}%`}
              tone={(n.score ?? 0) >= 0.5 ? "danger" : "ok"}
              threshold={0.5}
            />
          ))}
          <p className="text-xs text-muted sm:col-span-2">The tick marks the 50% line. At or above it, the layer blocks.</p>
        </div>
      )}
    </div>
  );
}

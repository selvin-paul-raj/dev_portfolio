import type { AttackResult, Layer, TraceStep } from "@/lib/ask/challenge";

export type { Layer, TraceStep };

export type Level = { level: number; name: string; defense: string; clues: readonly string[]; layers: Layer[] };

export type BlockedBy = AttackResult["blockedBy"];

export type Msg = {
  id: string;
  role: "you" | "gate";
  text: string;
  blockedBy?: BlockedBy;
  trace?: TraceStep[];
  /** The request failed (network, rate limit, model down): no gatekeeper reply. */
  error?: boolean;
};

export const LAST_LEVEL = 5;
export const GUESS_LIMIT = 8;
export const GUESS_WINDOW_MS = 10 * 60_000;

export const layerLabel = (layer: string) => layer.charAt(0).toUpperCase() + layer.slice(1);

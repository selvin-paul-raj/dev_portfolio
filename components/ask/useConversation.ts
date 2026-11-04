"use client";

// Conversation state for /ask: streaming turns, sessionStorage persistence, rate-limit wait, and the live status line.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AskStreamEvent } from "@/lib/ask/answer";
import { askStream } from "./stream";
import type { Turn } from "./model";

const STORAGE_KEY = "ask-selvin:v2";
const NETWORK_ERROR = "Network error. Please try again.";

function load(): Turn[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as Turn[];
    if (!Array.isArray(saved)) return [];
    // A reload mid-answer leaves the turn unfinished; offer a retry instead.
    return saved.map((t) => (t.status === "done" || t.status === "error" ? t : { ...t, status: "error", draft: undefined, error: "Interrupted. Please retry." }));
  } catch {
    return [];
  }
}

function save(turns: Turn[]) {
  try {
    if (turns.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode, blocked): the conversation still works for this visit.
  }
}

function applyEvent(t: Turn, e: AskStreamEvent): Turn {
  switch (e.type) {
    case "meta":
      return { ...t, status: "streaming", meta: { mode: e.mode, gate: e.gate, trace: e.trace, thresholds: e.thresholds } };
    case "delta":
      return { ...t, status: "streaming", draft: (t.draft ?? "") + e.text };
    case "reset":
      return { ...t, draft: "" };
    case "done":
      return { ...t, status: "done", draft: undefined, result: e.result };
    case "error":
      return { ...t, status: "error", draft: undefined, error: e.error };
  }
}

function announce(t: Turn): string {
  if (t.status === "error") return t.error ?? "Something went wrong.";
  if (!t.result) return "";
  if (t.result.refused) return "Not answered: I only answer from this portfolio.";
  const n = t.result.citations.length;
  return `Answer ready with ${n} source${n === 1 ? "" : "s"}.`;
}

const subscribeNever = () => () => undefined;

/** False while hydrating server HTML, true on the client: storage can only be read after that switch. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}

/** Pass useHydrated() and remount on its change (key), so the client instance starts from sessionStorage. */
export function useConversation(restored: boolean) {
  const [turns, setTurns] = useState<Turn[]>(() => (restored ? load() : []));
  const [busy, setBusy] = useState(false);
  const [limit, setLimit] = useState<{ message: string; until: number } | null>(null);
  const [status, setStatus] = useState("");
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (restored && !busy) save(turns);
  }, [turns, busy, restored]);

  const update = (id: string, fn: (t: Turn) => Turn) => setTurns((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));

  const ask = useCallback(async (raw: string, retryId?: string) => {
    const question = raw.trim();
    if (question.length < 3 || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const id = retryId ?? (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : String(Date.now()));
    const fresh: Turn = { id, question, status: "pending" };
    setTurns((ts) => (retryId ? ts.map((t) => (t.id === retryId ? fresh : t)) : [...ts, fresh]));
    setStatus("Searching the portfolio.");
    const controller = new AbortController();
    abortRef.current = controller;

    let last: Turn = fresh;
    const apply = (fn: (t: Turn) => Turn) => {
      last = fn(last);
      update(id, fn);
    };
    try {
      const outcome = await askStream(question, controller.signal, (e) => apply((t) => applyEvent(t, e)));
      if (outcome.kind === "limited") setLimit({ message: outcome.error, until: Date.now() + outcome.retryAfterMs });
      if (outcome.kind !== "ok") apply((t) => ({ ...t, status: "error", draft: undefined, error: outcome.error }));
    } catch {
      if (!controller.signal.aborted) apply((t) => ({ ...t, status: "error", draft: undefined, error: NETWORK_ERROR }));
    }
    // After "New conversation" this request is stale; the next one owns the busy flag.
    if (abortRef.current !== controller) return;
    setStatus(announce(last));
    busyRef.current = false;
    setBusy(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    busyRef.current = false;
    setBusy(false);
    setTurns([]);
    setStatus("Started a new conversation.");
  }, []);

  const clearLimit = useCallback(() => setLimit(null), []);

  return { turns, busy, limit, status, ask, reset, clearLimit };
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";

type Level = { level: number; name: string; defense: string; clues: readonly string[] };
type Msg = { role: "you" | "gate"; text: string; blocked?: boolean };

const STORAGE_KEY = "spr-challenge-level";

// Saved progress lives in localStorage; read it as an external store so the
// server render (no storage → 0) and hydration agree, with no setState-in-effect.
function readSavedLevel(): number {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved >= 1 ? saved : 0;
  } catch {
    // Storage unavailable (private mode): progress just won't persist.
    return 0;
  }
}

function subscribeSavedLevel(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function Challenge() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const savedLevel = useSyncExternalStore(subscribeSavedLevel, readSavedLevel, () => 0);
  const [unlockedState, setUnlocked] = useState(1);
  const [levelState, setLevel] = useState<number | null>(null);
  const unlocked = Math.max(unlockedState, savedLevel);
  const level = levelState ?? (savedLevel >= 1 ? Math.min(savedLevel, 5) : 1);
  const [log, setLog] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cluesShown, setCluesShown] = useState(0);

  useEffect(() => {
    fetch("/api/challenge")
      .then((r) => r.json())
      .then((j) => {
        setLevels(j.levels);
        setEnabled(j.enabled);
      })
      .catch(() => setEnabled(false));
  }, []);

  async function post(body: object) {
    const res = await fetch("/api/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
    return json;
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput("");
    setLog((l) => [...l, { role: "you", text }]);
    try {
      const r = await post({ action: "attack", level, input: text });
      setLog((l) => [...l, { role: "gate", text: r.reply, blocked: Boolean(r.blockedBy) }]);
    } catch (err) {
      setLog((l) => [...l, { role: "gate", text: (err as Error).message, blocked: true }]);
    }
    setBusy(false);
  }

  async function submitGuess(e: FormEvent) {
    e.preventDefault();
    if (!guess.trim()) return;
    try {
      const r = await post({ action: "guess", level, input: guess });
      if (r.correct) {
        const next = Math.max(unlocked, level + 1);
        setUnlocked(next);
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // Storage unavailable (private mode): the unlock still applies for this session.
        }
        setStatus(level === 5 ? "You beat all five levels. Tell Selvin how; he'd like to patch it." : `Correct! Level ${level + 1} unlocked.`);
        setGuess("");
        if (level < 5) {
          setLevel(level + 1);
          setLog([]);
          setCluesShown(0);
        }
      } else {
        setStatus("Not quite. Keep probing.");
      }
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  if (enabled === false) {
    return (
      <p className="text-center text-sm text-gray-600 dark:text-white/55">
        The challenge is offline right now (no model configured). Check back soon.
      </p>
    );
  }

  const current = levels.find((l) => l.level === level);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div role="tablist" aria-label="Levels" className="flex flex-wrap gap-2">
        {levels.map((l) => (
          <button
            key={l.level}
            role="tab"
            aria-selected={l.level === level}
            disabled={l.level > unlocked}
            onClick={() => {
              setLevel(l.level);
              setLog([]);
              setStatus(null);
              setCluesShown(0);
            }}
            className={`font-mono text-xs px-3 py-1.5 rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-35
              ${l.level === level ? "bg-gray-900 dark:bg-accent text-white dark:text-black border-transparent" : "border-black/10 dark:border-white/15 text-gray-700 dark:text-white/65"}`}
          >
            {l.level <= unlocked - 1 ? "✓ " : ""}L{l.level} · {l.name}
          </button>
        ))}
      </div>

      {current && (
        <p className="text-sm text-gray-600 dark:text-white/55">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">Defense · </span>
          {current.defense}
        </p>
      )}

      {current && current.clues.length > 0 && (
        <div className="flex flex-col gap-2">
          {cluesShown > 0 && (
            <ol aria-label="Clues" className="list-decimal pl-5 flex flex-col gap-1.5 text-sm text-gray-700 dark:text-white/70">
              {current.clues.slice(0, cluesShown).map((clue) => (
                <li key={clue}>{clue}</li>
              ))}
            </ol>
          )}
          {cluesShown < current.clues.length && (
            <button
              type="button"
              onClick={() => setCluesShown((n) => n + 1)}
              className="self-start rounded text-sm font-medium text-amber-700 dark:text-accent underline underline-offset-4 decoration-dotted
                outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {cluesShown === 0 ? "Stuck? Show a clue" : `Show clue ${cluesShown + 1} of ${current.clues.length}`}
            </button>
          )}
        </div>
      )}

      <ol aria-live="polite" className="flex flex-col gap-3 min-h-[6rem]">
        {log.map((m, i) => (
          <li
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "you"
                ? "self-end rounded-br-sm bg-gray-900 dark:bg-white/[0.08] text-white dark:text-white/90"
                : `self-start rounded-bl-sm border ${m.blocked ? "border-red-500/30 text-red-700 dark:text-red-300" : "border-black/10 dark:border-white/10 text-gray-800 dark:text-white/80"}`
            }`}
          >
            {m.text}
          </li>
        ))}
      </ol>

      <form onSubmit={send} className="flex gap-2">
        <label htmlFor="attack" className="sr-only">Message the gatekeeper</label>
        <input
          id="attack"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={400}
          placeholder="Convince the gatekeeper…"
          className="flex-1 rounded-full px-5 py-3 text-sm bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10
            text-gray-900 dark:text-white/85 placeholder:text-gray-500 dark:placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="px-5 rounded-full bg-gray-900 dark:bg-accent text-white dark:text-black text-sm font-semibold disabled:opacity-40
            outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {busy ? "…" : "Send"}
        </button>
      </form>

      <form onSubmit={submitGuess} className="flex flex-wrap items-center gap-2">
        <label htmlFor="guess" className="font-mono text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-white/45">
          Password
        </label>
        <input
          id="guess"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          maxLength={40}
          autoComplete="off"
          className="w-48 rounded-full px-4 py-2 text-sm font-mono uppercase bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10
            text-gray-900 dark:text-white/85 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button type="submit" className="px-4 py-2 rounded-full border border-black/10 dark:border-white/15 text-sm font-medium text-gray-800 dark:text-white/75 outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Check
        </button>
        {status && <span role="status" className="text-sm text-gray-700 dark:text-white/70">{status}</span>}
      </form>
    </div>
  );
}

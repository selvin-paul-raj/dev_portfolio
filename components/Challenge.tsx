"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { LuSend } from "react-icons/lu";
import RateLimitNotice, { retryAfterFrom } from "@/components/tools/RateLimitNotice";
import { FIELD, GHOST_BTN, LABEL, PRIMARY_BTN, FOCUS } from "@/components/tools/styles";
import ChatLog from "./challenge/ChatLog";
import LevelTabs, { LevelTabsSkeleton, PANEL_ID, tabId } from "./challenge/LevelTabs";
import Offline from "./challenge/Offline";
import Pipeline from "./challenge/Pipeline";
import { appendLog, recordAttempt, recordClear, recordGuess, statsFor, useLog, useProgress } from "./challenge/store";
import { GUESS_LIMIT, LAST_LEVEL, type Level, type Msg } from "./challenge/types";
import WinCard from "./challenge/WinCard";

type Limit = { message: string; until: number };
type Config = { enabled: boolean; stack: string[]; levels: Level[] };

const MAX_ATTACK = 400;
const msgId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

async function post(body: object): Promise<Response> {
  return fetch("/api/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

async function errorText(res: Response): Promise<string> {
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  return json.error ?? "Something went wrong.";
}

export default function Challenge() {
  const [config, setConfig] = useState<Config | null>(null);
  const progress = useProgress();
  const [selectedState, setSelected] = useState<number | null>(null);
  const level = selectedState ?? Math.min(progress.unlocked, LAST_LEVEL);
  const log = useLog(level);
  const [input, setInput] = useState("");
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [guessBusy, setGuessBusy] = useState(false);
  const [cluesShown, setCluesShown] = useState<Record<number, number>>({});
  const [guessesLeft, setGuessesLeft] = useState<number | null>(null);
  const [attackLimit, setAttackLimit] = useState<Limit | null>(null);
  const [guessLimit, setGuessLimit] = useState<Limit | null>(null);
  const clearAttackLimit = useCallback(() => setAttackLimit(null), []);
  const clearGuessLimit = useCallback(() => {
    setGuessLimit(null);
    setGuessesLeft(null);
  }, []);

  useEffect(() => {
    fetch("/api/challenge")
      .then((r) => r.json())
      .then((j: Config) => setConfig({ enabled: Boolean(j.enabled), stack: j.stack ?? [], levels: j.levels ?? [] }))
      .catch(() => setConfig({ enabled: false, stack: [], levels: [] }));
  }, []);

  if (!config) return <div className="w-full max-w-3xl"><LevelTabsSkeleton /></div>;
  if (!config.enabled) {
    return (
      <div className="w-full max-w-3xl">
        <Offline levels={config.levels} stack={config.stack} />
      </div>
    );
  }

  const { levels, stack } = config;
  const current = levels.find((l) => l.level === level);
  const stats = statsFor(progress, level);
  const won = Boolean(statsFor(progress, LAST_LEVEL).cleared);
  const lastTraced = [...log].reverse().find((m) => m.trace);
  const shown = cluesShown[level] ?? 0;

  function select(next: number) {
    setSelected(next);
    setStatus(null);
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy || attackLimit) return;
    const at = level;
    setBusy(true);
    setInput("");
    appendLog(at, { id: msgId(), role: "you", text });
    try {
      const res = await post({ action: "attack", level: at, input: text });
      if (res.status === 429) {
        const { error, retryAfterMs } = await retryAfterFrom(res);
        setAttackLimit({ message: error, until: Date.now() + retryAfterMs });
        setInput(text);
        appendLog(at, { id: msgId(), role: "gate", text: "Not sent: you hit the message limit.", error: true });
      } else if (!res.ok) {
        appendLog(at, { id: msgId(), role: "gate", text: await errorText(res), error: true });
      } else {
        const r = (await res.json()) as Pick<Msg, "blockedBy" | "trace"> & { reply: string };
        recordAttempt(at, Date.now());
        appendLog(at, { id: msgId(), role: "gate", text: r.reply, blockedBy: r.blockedBy ?? null, trace: r.trace });
      }
    } catch {
      appendLog(at, { id: msgId(), role: "gate", text: "Couldn't reach the gatekeeper. Check your connection and try again.", error: true });
    }
    setBusy(false);
  }

  async function submitGuess(e: FormEvent) {
    e.preventDefault();
    if (!guess.trim() || guessBusy || guessLimit) return;
    const at = level;
    setGuessBusy(true);
    try {
      const res = await post({ action: "guess", level: at, input: guess });
      if (res.status === 429) {
        const { error, retryAfterMs } = await retryAfterFrom(res);
        setGuessLimit({ message: error, until: Date.now() + retryAfterMs });
        setGuessesLeft(0);
        setStatus(null);
      } else if (!res.ok) {
        setStatus(await errorText(res));
      } else {
        const { correct } = (await res.json()) as { correct: boolean };
        const now = Date.now();
        setGuessesLeft(Math.max(0, GUESS_LIMIT - recordGuess(at, now)));
        if (correct) {
          recordClear(at, now, LAST_LEVEL);
          setGuess("");
          if (at < LAST_LEVEL) {
            setSelected(at + 1);
            setStatus(`Correct. Level ${at + 1} is open.`);
          } else {
            setStatus("Correct. That was the last level.");
          }
        } else {
          setStatus("Not quite. Keep probing.");
        }
      }
    } catch {
      setStatus("Couldn't check that guess. Check your connection and try again.");
    }
    setGuessBusy(false);
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <LevelTabs
        levels={levels}
        selected={level}
        unlocked={progress.unlocked}
        isCleared={(n) => Boolean(statsFor(progress, n).cleared)}
        onSelect={select}
      />

      {won && <WinCard levels={levels} progress={progress} />}

      {current && (
        <div id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(level)} className="flex flex-col gap-6">
          <section aria-labelledby="challenge-defense" className="flex flex-col gap-3">
            <h2 id="challenge-defense" className={LABEL}>
              How level {level} defends
            </h2>
            <p className="text-sm text-fg">{current.defense}</p>
            <Pipeline stack={stack} active={current.layers} trace={lastTraced?.trace} runId={lastTraced?.id} />
          </section>

          {current.clues.length > 0 && (
            <div className="flex flex-col gap-2">
              {shown > 0 && (
                <ol aria-label="Clues" className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-fg-2">
                  {current.clues.slice(0, shown).map((clue) => (
                    <li key={clue}>{clue}</li>
                  ))}
                </ol>
              )}
              {shown < current.clues.length && (
                <button
                  type="button"
                  onClick={() => setCluesShown((c) => ({ ...c, [level]: shown + 1 }))}
                  className={`self-start rounded text-sm font-medium text-accent-fg underline decoration-dotted underline-offset-4 min-h-11 [@media(pointer:fine)]:min-h-0 ${FOCUS}`}
                >
                  {shown === 0 ? "Stuck? Show a clue" : `Show clue ${shown + 1} of ${current.clues.length}`}
                </button>
              )}
            </div>
          )}

          <ChatLog messages={log} />

          <form onSubmit={send} className="flex flex-col gap-2">
            <label htmlFor="attack" className={LABEL}>
              Message the gatekeeper
            </label>
            <div className="flex gap-2">
              <input
                id="attack"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_ATTACK}
                autoComplete="off"
                placeholder="Convince it to talk"
                disabled={Boolean(attackLimit)}
                className={`${FIELD} h-11 min-w-0 flex-1 rounded-full px-5 disabled:opacity-60`}
              />
              <button type="submit" disabled={busy || !input.trim() || Boolean(attackLimit)} aria-busy={busy} className={PRIMARY_BTN}>
                <LuSend size={15} aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">{busy ? "Sending" : "Send"}</span>
              </button>
            </div>
            <p className="text-xs text-muted">
              {stats.attempts} {stats.attempts === 1 ? "message" : "messages"} at this level
              {stats.best !== undefined && `, best clear in ${stats.best}`}
              {stats.guesses > 0 && `, ${stats.guesses} ${stats.guesses === 1 ? "guess" : "guesses"}`}
            </p>
          </form>
          {attackLimit && <RateLimitNotice message={attackLimit.message} until={attackLimit.until} onDone={clearAttackLimit} />}

          <form onSubmit={submitGuess} className="flex flex-col gap-2">
            <label htmlFor="guess" className={LABEL}>
              Think you have it? Enter the password
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                maxLength={40}
                autoComplete="off"
                spellCheck={false}
                disabled={Boolean(guessLimit)}
                className={`${FIELD} h-11 rounded-full px-5 font-mono uppercase sm:w-64 disabled:opacity-60`}
              />
              <button type="submit" disabled={guessBusy || !guess.trim() || Boolean(guessLimit)} aria-busy={guessBusy} className={GHOST_BTN}>
                {guessBusy ? "Checking" : "Check"}
              </button>
            </div>
            {guessesLeft !== null && !guessLimit && (
              <p className="text-xs text-muted">
                About {guessesLeft} of {GUESS_LIMIT} guesses left in this 10 minute window.
              </p>
            )}
            <p role="status" className="min-h-5 text-sm text-fg-2">
              {status}
            </p>
          </form>
          {guessLimit && <RateLimitNotice message={guessLimit.message} until={guessLimit.until} onDone={clearGuessLimit} />}
        </div>
      )}
    </div>
  );
}

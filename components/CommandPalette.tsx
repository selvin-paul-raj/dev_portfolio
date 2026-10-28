"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/theme-context";
import { links } from "@/lib/data";
import { PROFILE } from "@/lib/mcp/definitions";

type Command = { id: string; label: string; group: string; hint?: string; run: () => void | Promise<void> };

/** Subsequence match: every query character appears in order. Lower score = better. */
function score(text: string, query: string): number | null {
  const t = text.toLowerCase();
  let pos = -1;
  let gaps = 0;
  for (const ch of query.toLowerCase()) {
    const next = t.indexOf(ch, pos + 1);
    if (next === -1) return null;
    gaps += next - pos - 1;
    pos = next;
  }
  return gaps + (t.startsWith(query.toLowerCase()) ? -100 : 0);
}

export type PaletteStudy = { slug: string; title: string; headline: string };

export default function CommandPalette({ studies }: { studies: PaletteStudy[] }) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const close = useCallback(() => dialogRef.current?.close(), []);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      ...studies.map((c) => ({ id: `work-${c.slug}`, label: c.title, group: "Case studies", hint: c.headline, run: go(`/work/${c.slug}`) })),
      { id: "fit", label: "Check fit against a job description", group: "For recruiters", run: go("/fit") },
      { id: "ask", label: "Ask about my work", group: "For recruiters", run: go("/ask") },
      { id: "evals", label: "See evals", group: "For recruiters", run: go("/evals") },
      { id: "challenge", label: "Prompt-injection challenge", group: "For recruiters", run: go("/challenge") },
      { id: "work", label: "All case studies", group: "Pages", run: go("/work") },
      ...links.map((l) => ({ id: `section-${l.hash}`, label: l.name, group: "Sections", run: go(`/${l.hash}`) })),
      {
        id: "email",
        label: "Copy email address",
        group: "Actions",
        hint: PROFILE.email,
        run: async () => {
          await navigator.clipboard.writeText(PROFILE.email);
          setNotice("Email copied");
        },
      },
      { id: "resume", label: "Download resume (PDF)", group: "Actions", run: () => void window.open(PROFILE.resumeUrl, "_blank", "noopener") },
      { id: "theme", label: "Toggle light / dark theme", group: "Actions", run: toggleTheme },
      { id: "github", label: "Open GitHub", group: "Actions", run: () => void window.open(PROFILE.github, "_blank", "noopener") },
    ];
  }, [router, toggleTheme, studies]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return commands;
    const matches = commands
      .map((c) => ({ c, s: score(`${c.label} ${c.group}`, q) }))
      .filter((r): r is { c: Command; s: number } => r.s !== null);
    // Keep groups together, ordered by their best match, then by score within a group.
    const best = new Map<string, number>();
    for (const m of matches) best.set(m.c.group, Math.min(best.get(m.c.group) ?? Infinity, m.s));
    return matches
      .sort((a, b) => best.get(a.c.group)! - best.get(b.c.group)! || a.c.group.localeCompare(b.c.group) || a.s - b.s)
      .map((r) => r.c);
  }, [commands, query]);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setIndex(0);
    setNotice(null);
    dialog.showModal();
    inputRef.current?.focus();
    // Warm the routes the palette can jump to so Enter navigates instantly.
    ["/work", "/fit", "/ask", "/evals", "/challenge", ...studies.map((s) => `/work/${s.slug}`)].forEach((href) => router.prefetch(href));
  }, [router, studies]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    const onRequest = () => open();
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onRequest);
    };
  }, [open, close]);

  const execute = async (cmd: Command | undefined) => {
    if (!cmd) return;
    try {
      await cmd.run();
    } catch (err) {
      console.error("Command failed:", err);
      setNotice("That didn't work. Try again.");
      return;
    }
    if (cmd.id !== "email") close();
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(results[index]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClick={(e) => e.target === dialogRef.current && close()}
      className="command-palette w-[min(36rem,calc(100vw-2rem))] p-0 rounded-xl border border-black/10 dark:border-white/12
        bg-[#FAFAF9] dark:bg-[#111113] text-gray-900 dark:text-white shadow-2xl backdrop:bg-black/40 dark:backdrop:bg-black/60 mt-[12vh]"
    >
      <div className="flex items-center gap-3 px-4 border-b border-black/10 dark:border-white/10">
        <span aria-hidden="true" className="font-mono text-xs text-accent-ink dark:text-accent">⌘K</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={onInputKey}
          placeholder="Jump to a case study, page, or action…"
          aria-label="Search commands"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-list"
          aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
          className="flex-1 py-4 bg-transparent text-[0.95rem] outline-none placeholder:text-gray-500 dark:placeholder:text-white/40"
        />
        <kbd className="font-mono text-[0.65rem] px-1.5 py-0.5 rounded border border-black/10 dark:border-white/15 text-gray-500 dark:text-white/50">esc</kbd>
      </div>

      <div id="command-list" role="listbox" aria-label="Commands" className="max-h-[min(24rem,55vh)] overflow-y-auto py-2">
        {results.length === 0 && <p className="px-4 py-6 text-sm text-gray-500 dark:text-white/50">No matches for &ldquo;{query}&rdquo;.</p>}
        {results.map((cmd, i) => {
          const header = i === 0 || results[i - 1].group !== cmd.group ? cmd.group : null;
          return (
            <div key={cmd.id} role="presentation">
              {header && (
                <p role="presentation" className="px-4 pt-3 pb-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-white/45">
                  {header}
                </p>
              )}
              <div
                id={`cmd-${cmd.id}`}
                role="option"
                tabIndex={-1}
                aria-selected={i === index}
                onMouseMove={() => setIndex(i)}
                onClick={() => execute(cmd)}
                className={`mx-2 px-3 py-2.5 rounded-lg flex items-center justify-between gap-4 cursor-pointer text-sm ${
                  i === index ? "bg-black/[0.05] dark:bg-white/[0.07] text-gray-950 dark:text-white" : "text-gray-700 dark:text-white/70"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span aria-hidden="true" className={`w-1 h-1 rounded-full ${i === index ? "bg-accent" : "bg-transparent"}`} />
                  {cmd.label}
                </span>
                {cmd.hint && <span className="font-mono text-xs text-gray-500 dark:text-white/45 truncate">{cmd.hint}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <output className="block px-4 py-2.5 border-t border-black/10 dark:border-white/10 font-mono text-[0.65rem] text-gray-500 dark:text-white/45 flex justify-between">
        <span>↑↓ to move · enter to run</span>
        <span className="text-accent-ink dark:text-accent">{notice}</span>
      </output>
    </dialog>
  );
}

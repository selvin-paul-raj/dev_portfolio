"use client";

import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";

type Entry = { label: string; command: string; note: string };

/** One endpoint the site serves to terminals and agents, with a copy button. */
function CommandRow({ label, command, note }: Entry) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <li className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <code className="mt-1 block break-all font-mono text-xs leading-relaxed text-amber-800 dark:text-accent/90">{command}</code>
        <p className="mt-1 text-sm text-gray-600 dark:text-white/55">{note}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
        title="Copy"
        className="shrink-0 inline-flex h-11 w-11 [@media(pointer:fine)]:h-9 [@media(pointer:fine)]:w-9 items-center justify-center rounded-full
          border border-black/10 dark:border-white/15 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white
          hover:border-black/25 dark:hover:border-white/30 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {copied ? <LuCheck size={15} aria-hidden="true" className="text-green-600 dark:text-green-400" /> : <LuCopy size={15} aria-hidden="true" />}
      </button>
    </li>
  );
}

export default function MachineAccess({ entries }: { entries: Entry[] }) {
  return (
    <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#101015] p-5 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">For terminals and agents</h2>
      <p className="mt-1 mb-5 text-sm text-gray-600 dark:text-white/55">This site also answers machines. Try one.</p>
      <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
        {entries.map((e) => (
          <CommandRow key={e.label} {...e} />
        ))}
      </ul>
    </div>
  );
}

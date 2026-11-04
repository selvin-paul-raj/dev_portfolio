"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { ICON_BTN } from "./styles";

/** Copies `text` (or the result of `getText`) and confirms for two seconds. */
export default function CopyButton({ text, label = "Copy", className = "" }: { text: string | (() => string); label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(typeof text === "function" ? text() : text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className={`${ICON_BTN} ${className}`}>
      {copied ? <LuCheck size={14} aria-hidden="true" className="text-ok" /> : <LuCopy size={14} aria-hidden="true" />}
      <span>{copied ? "Copied" : label}</span>
      <span role="status" className="sr-only">{copied ? "Copied to clipboard" : ""}</span>
    </button>
  );
}

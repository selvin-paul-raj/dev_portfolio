// components/McpBadge.tsx
"use client";
import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

const ENDPOINT = "https://selvinpaulraj.vercel.app/api/mcp";

export default function McpBadge() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(ENDPOINT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard denied — do not show false confirmation
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
      <div className="group relative flex flex-col items-end gap-2">
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 hidden w-72 rounded-xl border border-white/10 bg-gray-900 p-4 text-xs text-white shadow-2xl group-hover:block dark:bg-zinc-900">
          <p className="mb-1 font-semibold text-violet-400">Connect via MCP</p>
          <p className="mb-2 text-gray-400">
            Add this endpoint to your AI assistant (Claude, Cursor, Zed…):
          </p>
          <code className="block break-all rounded bg-black/60 p-2 font-mono text-green-400">
            {ENDPOINT}
          </code>
          <p className="mt-2 text-gray-500">Protocol: MCP 2024-11-05 · HTTP JSON-RPC</p>
        </div>

        {/* Badge button */}
        <button
          onClick={copy}
          aria-label="Copy MCP endpoint"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10 transition-all hover:shadow-violet-500/40 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          MCP Enabled
          {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { LuShieldX, LuTriangleAlert } from "react-icons/lu";
import { FOCUS } from "@/components/tools/styles";
import { layerLabel, type Msg } from "./types";

/** One message; `.chat-row` (app/globals.css) fades and lifts it in when it is added. */
function Bubble({ m }: { m: Msg }) {
  if (m.role === "you") {
    return (
      <li className="chat-row max-w-[85%] self-end break-words rounded-2xl rounded-br-sm bg-surface-3 px-4 py-2.5 text-sm text-fg">
        <span className="sr-only">You: </span>
        {m.text}
      </li>
    );
  }
  const flagged = Boolean(m.blockedBy) || m.error;
  return (
    <li
      className={`chat-row max-w-[85%] self-start break-words rounded-2xl rounded-bl-sm border px-4 py-2.5 text-sm ${
        m.blockedBy ? "border-danger/50 bg-danger/5" : m.error ? "border-warn/50 bg-warn/5" : "border-line bg-surface"
      }`}
    >
      {flagged ? (
        <span className="mb-1 flex items-center gap-1.5 font-medium text-fg">
          {m.blockedBy ? (
            <LuShieldX size={15} aria-hidden="true" className="shrink-0 text-danger" />
          ) : (
            <LuTriangleAlert size={15} aria-hidden="true" className="shrink-0 text-warn" />
          )}
          {m.blockedBy ? `Blocked by ${layerLabel(m.blockedBy).toLowerCase()}` : "Not delivered"}
        </span>
      ) : (
        <span className="sr-only">Gatekeeper: </span>
      )}
      <span className={flagged ? "text-fg-2" : "text-fg"}>{m.text}</span>
    </li>
  );
}

/** The conversation for one level; scrolls to the newest message (instantly under reduced motion). */
export default function ChatLog({ messages }: { messages: Msg[] }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages.length]);

  return (
    <div
      ref={box}
      role="log"
      aria-label="Conversation with the gatekeeper"
      tabIndex={0}
      className={`max-h-[26rem] min-h-[7rem] overflow-y-auto rounded-2xl border border-line p-3 sm:p-4 ${FOCUS}`}
    >
      {messages.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No messages at this level yet. Say something to the gatekeeper.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
        </ol>
      )}
    </div>
  );
}

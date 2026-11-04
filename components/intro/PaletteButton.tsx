"use client";

import type { ReactNode } from "react";

/** Opens the layout's command palette through its window event. */
export default function PaletteButton({ className, children }: { className: string; children: ReactNode }) {
  return (
    <button
      type="button"
      title="Open the command palette"
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className={className}
    >
      {children}
    </button>
  );
}

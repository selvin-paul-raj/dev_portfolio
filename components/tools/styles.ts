// Shared class strings for the recruiter tools (/fit, /ask, /evals, /challenge), so all four
// pages use one button style, one field style and one focus ring.

export const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/** The one solid action per form: ink in light mode, gold in dark (the `primary` token). */
export const PRIMARY_BTN = `inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary
 transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.98] motion-reduce:active:scale-100
 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

/** Secondary actions: outlined pill. */
export const GHOST_BTN = `inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium text-fg-2
 transition-colors duration-150 hover:border-fg/40 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

/** Small icon-sized ghost button (copy, retry, clear). */
export const ICON_BTN = `inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted
 transition-colors duration-150 hover:bg-surface-3 hover:text-fg ${FOCUS}`;

/** Text inputs and textareas. text-base on phones so iOS does not zoom on focus. */
export const FIELD = `w-full border border-line-strong bg-surface text-base sm:text-sm text-fg placeholder:text-muted
 transition-colors duration-150 hover:border-fg/30 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40`;

/** Panels on the tool pages. */
export const PANEL = "rounded-2xl border border-line bg-surface-2";

/** Small labels above fields and panels: body face, one step smaller, sentence case. */
export const LABEL = "text-sm font-medium text-fg-2";

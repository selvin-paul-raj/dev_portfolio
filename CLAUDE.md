# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build (Next.js 16 Turbopack)
npm run lint      # ESLint 9 check (flat config in eslint.config.mjs)
npm run start     # Start production server
```

Requires `.env.local` with:
```
RESEND_API_KEY=your_key_here
```

## Stack

Next.js 16.2.6, React 19, TypeScript 5, Tailwind CSS 3, Framer Motion 12, Resend 6, ESLint 9.

## Architecture

Single-page Next.js 16 (App Router) portfolio. All sections render in `app/page.tsx` as a vertical stack: Intro → About → Projects → Skills → Experience → Contact.

### Data Layer

All content is driven from `lib/data/*.json` — do not edit `lib/data.tsx` for content changes.

- **`lib/data/projects.json`** — 44 projects. Fields: `show` (bool), `order` (int, ascending = first), `categories`, `live` (nullable), `imageUrl` (string path or `""`).
- **`lib/data/experiences.json`** — 8 entries. Fields: `dateStart`, `dateEnd` ("Present" supported), `icon` ("graduation"/"work"/"laptop"), `order`.
- **`lib/data/skills.json`** — flat string array.
- **`lib/data.tsx`** — imports the JSON, transforms it (icon string → JSX, computes date string via `utils/calculateDuration.js`), and re-exports typed arrays consumed by components.

### Navigation & Active Section

`ActiveSectionContext` (`context/active-section-context.tsx`) tracks which nav section is visible. The custom hook `useSectionInView(sectionName, threshold)` in `lib/hooks.ts` wires IntersectionObserver to this context. Every section component calls this hook and passes its `ref` to the section element.

`timeOfLastClick` prevents the observer from overriding the active section within 1 second of a nav click.

### Contact Form

`actions/sendEmails.ts` is a Next.js Server Action using [Resend](https://resend.com). It sends to `selvinpaulgomathi@gmail.com` using a React Email template at `email/custom-email.tsx`.

### Theme

`ThemeContext` (`context/theme-context.tsx`) manages light/dark mode. Dark mode uses Tailwind's `dark:` variant. The `ThemeSwitch` component toggles it.

### Utilities

`utils/calculateDuration.js` — computes human-readable duration between two date strings (e.g., `"Mar 2024"` → `"2 mos"`). Used inline in `lib/data.tsx` experience entries.

### Performance

`Projects` and `Skills` components are lazy-loaded via `next/dynamic` in `app/page.tsx` to reduce initial bundle size.

## Key Patterns

- Section components call `useSectionInView` and spread the returned `ref` onto the `<section>` element with `id` matching the nav hash.
- `SectionName` type is derived from the `links` array in `lib/data.tsx` — adding a nav item requires updating `links` there.
- Public assets: profile images are in `public/` root; project screenshots go in `public/projects/`; skill icons go in `public/skills/`.

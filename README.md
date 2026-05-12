# Selvin PaulRaj K — AI Engineer Portfolio

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

Personal portfolio for **Selvin PaulRaj K** — AI Engineer at Zinnov (Draup), specialising in AI Agents, MCP servers, RAG pipelines, LangGraph multi-agent systems, and full-stack Next.js/Python applications.

**Live:** [selvinpaulraj.vercel.app](https://selvinpaulraj.vercel.app)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| UI | React 19, TypeScript 5, Tailwind CSS 3 |
| Animation | Framer Motion 12 |
| Email | Resend 6, React Email |
| Icons | React Icons 5 |
| Analytics | Vercel Analytics, Vercel Speed Insights, Microsoft Clarity |
| Linting | ESLint 9 (flat config) |
| Deployment | Vercel |

---

## Architecture

Single-page portfolio. All sections render in `app/page.tsx` as a vertical stack:

```
Intro → About → Projects → Skills → Experience → Contact
```

### Data layer

All content lives in `lib/data/*.json` — never in component files.

| File | Contents |
|---|---|
| `lib/data/projects.json` | 44 projects. Fields: `show`, `order`, `categories`, `live`, `imageUrl` |
| `lib/data/experiences.json` | 8 entries. Fields: `dateStart`, `dateEnd`, `icon`, `order` |
| `lib/data/skills.json` | Flat string array |

`lib/data.tsx` imports JSON, transforms it (icon string to JSX, computes duration via `utils/calculateDuration.js`), and re-exports typed arrays consumed by components.

### Navigation

`ActiveSectionContext` tracks the visible section. `useSectionInView(sectionName, threshold)` in `lib/hooks.ts` wires `IntersectionObserver` to the context. Every section component calls this hook and passes the returned `ref` to its `<section>` element.

`timeOfLastClick` prevents the observer from overriding the active section within 1 second of a nav click.

### Contact form

`actions/sendEmails.ts` is a Next.js Server Action using Resend. It sends to `selvinpaulgomathi@gmail.com` using a React Email template at `email/custom-email.tsx`.

### Theme

`ThemeContext` manages light/dark mode. Dark mode uses Tailwind's `dark:` variant. The `ThemeSwitch` component toggles it. A blocking inline script in `<head>` applies the saved theme before first paint to prevent FOUC.

### Performance

`Projects` and `Skills` are lazy-loaded via `next/dynamic` to reduce initial bundle.

---

## Project structure

```
dev_portfolio/
├── actions/            # Next.js Server Actions
│   └── sendEmails.ts
├── app/                # App Router
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx      # Root layout, metadata, structured data
│   ├── page.tsx        # Page composition
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx
├── components/         # Section and UI components
│   ├── Intro.tsx       # Hero with stats strip and particle canvas
│   ├── About.tsx
│   ├── Projects.tsx    # Filterable, paginated project grid
│   ├── Project.tsx     # Single project card
│   ├── Skills.tsx
│   ├── Experience.tsx
│   ├── Contact.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ui/             # Low-level UI primitives
├── context/
│   ├── active-section-context.tsx
│   └── theme-context.tsx
├── email/
│   └── custom-email.tsx
├── lib/
│   ├── data/           # JSON content files
│   │   ├── projects.json
│   │   ├── experiences.json
│   │   └── skills.json
│   ├── data.tsx        # Transform + re-export
│   ├── hooks.ts        # useSectionInView
│   └── types.ts
├── public/
│   ├── favicon.svg     # SVG favicon (gold S on dark, scales perfectly)
│   ├── projects/       # Project screenshots
│   ├── resume.pdf
│   └── *.png           # Profile images
├── utils/
│   └── calculateDuration.js
├── next.config.js
├── tailwind.config.ts
├── eslint.config.mjs   # ESLint 9 flat config
└── tsconfig.json
```

---

## Getting started

**Requirements:** Node.js 18+, an `.env.local` file with `RESEND_API_KEY`.

```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

`.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## Key patterns

- **Content changes** go in `lib/data/*.json`, not in component files.
- **Adding a nav item** requires updating the `links` array in `lib/data.tsx` — `SectionName` is derived from it.
- **Project images** go in `public/projects/`; skill icons in `public/skills/`.
- **Adding a section** requires: a component calling `useSectionInView`, an entry in `links`, and an import in `app/page.tsx`.

---

## Deployment

Deployed on Vercel. Any push to `main` triggers a production build automatically.

Set the `RESEND_API_KEY` environment variable in the Vercel dashboard under Project Settings > Environment Variables.

---

Built by [Selvin PaulRaj K](https://selvinpaulraj.vercel.app)

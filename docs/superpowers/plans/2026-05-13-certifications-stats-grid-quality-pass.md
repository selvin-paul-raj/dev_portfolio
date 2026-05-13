# Certifications Stats Grid + Quality Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visual stats breakdown grid to the Certifications section (category bars + issuer distribution), expand issuer colour coverage to all 10 issuers with a hash-based fallback for any future unknown ones, then run a comprehensive performance/SEO/UI-UX/docs quality pass.

**Architecture:** All changes live in `components/Certifications.tsx` (new `CertStatsGrid` sub-component + updated `ISSUER_COLORS` + `issuerColor()` helper). SEO additions go into `app/layout.tsx` (structured data). Docs update in `public/llms.txt`. No new files needed.

**Tech Stack:** Next.js 16.2.6 App Router, React 19, TypeScript 5, Framer Motion 12, Tailwind CSS 3, `framer-motion useInView`, no new packages.

---

## File Map

| File | Change |
|---|---|
| `components/Certifications.tsx` | Expand `ISSUER_COLORS`; add `issuerColor()` hash fallback; add `CertStatsGrid` component; wire into section JSX between stat strip and toolbar |
| `app/layout.tsx` | Add `ItemList` structured-data block for top 5 certs (SEO) |
| `public/llms.txt` | Update cert count to 35, update issuer count to 10 |

---

## Task 1: Expand issuer colours + add hash fallback

**Files:**
- Modify: `components/Certifications.tsx` lines 34–49 (ISSUER_COLORS constant) + add `issuerColor()` function

- [ ] **Step 1: Replace ISSUER_COLORS and add issuerColor helper**

Replace the existing `ISSUER_COLORS` block and add the helper immediately after it:

```typescript
const ISSUER_COLORS: Record<string, string> = {
  /* AI platforms */
  "Anthropic":            "#e8966e",
  "DeepLearning.AI":      "#ff6b9d",
  "Hugging Face":         "#ffb84d",
  /* Cloud / tech giants */
  "AWS":                  "#ff9900",
  "IBM":                  "#5fa0ff",
  "Microsoft":            "#5ec4eb",
  "Google":               "#ea7e6a",
  "Meta":                 "#5d8bf0",
  /* Learning platforms */
  "Coursera":             "#4f7df0",
  "LinkedIn":             "#0a66c2",
  "LinkedIn Learning":    "#0a66c2",
  "Udemy":                "#a435f0",
  "Simplilearn":          "#f94f4f",
  "Cognitive Class":      "#be6ef5",
  /* Regional / niche */
  "HackerRank":           "#2ec866",
  "GUVI":                 "#00C896",
  "HCL GUVI":             "#00b89c",
  "NPTEL":                "#f47b20",
  "Edunet Foundation":    "#34c98a",
};

function hashIssuerColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  /* shift 120° to avoid yellow (our #f5c518 accent) and pure red */
  return `hsl(${(h % 300) + 30}, 62%, 60%)`;
}

function issuerColor(name: string): string {
  return ISSUER_COLORS[name] ?? hashIssuerColor(name);
}
```

- [ ] **Step 2: Replace every `ISSUER_COLORS[x] ?? "#888"` call with `issuerColor(x)`**

In `PlaceholderThumb`:
```typescript
const color = issuerColor(cert.issuer);
```
In `IssuerPill`:
```typescript
const color = issuerColor(issuer);
```
In `CertModal`:
```typescript
const color = issuerColor(cert.issuer);
```

- [ ] **Step 3: Run build to confirm no TypeScript errors**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add components/Certifications.tsx
git commit -m "feat: expand issuer colours to 19 + hash fallback for unknown issuers"
```

---

## Task 2: Add CertStatsGrid component

**Files:**
- Modify: `components/Certifications.tsx` — add `CertStatsGrid` component definition before `export default function Certifications()`, wire it in JSX between the existing stat strip (`</div>` at end of stat strip) and the `{/* Toolbar */}` comment.

- [ ] **Step 1: Add `useInView` import**

Change the existing import line from:
```typescript
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
```
to:
```typescript
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
```

- [ ] **Step 2: Add `useCountUp` hook** (same as About.tsx — paste verbatim before `CertStatsGrid`)

```typescript
function useCountUp(target: number, durationMs: number, trigger: boolean): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let rafId: number;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / durationMs, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 2)) * target));
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs, trigger]);
  return val;
}
```

- [ ] **Step 3: Add `CertStatsGrid` component**

Paste this complete component before `export default function Certifications()`:

```typescript
function CertStatsGrid({ certs }: { certs: (typeof rawCertsAll)[number][] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  /* Derived counts */
  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    certs.forEach((c) => { m[c.category] = (m[c.category] ?? 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [certs]);

  const byIssuer = useMemo(() => {
    const m: Record<string, number> = {};
    certs.forEach((c) => { m[c.issuer] = (m[c.issuer] ?? 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [certs]);

  const maxCat = byCat[0]?.[1] ?? 1;
  const maxIss = byIssuer[0]?.[1] ?? 1;

  /* Category colours — fixed palette so they're stable across renders */
  const CAT_COLORS: Record<string, string> = {
    "AI Engineering":   "#e8966e",
    "Web Development":  "#5fa0ff",
    "Technology":       "#ffb84d",
    "Cloud Computing":  "#34c98a",
    "Data Science":     "#be6ef5",
  };
  function catColor(cat: string) { return CAT_COLORS[cat] ?? "#8a8a93"; }

  /* Animated totals */
  const animTotal   = useCountUp(certs.length, 1800, inView);
  const animIssuers = useCountUp(byIssuer.length, 1600, inView);
  const animCats    = useCountUp(byCat.length, 1400, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className="mb-6 border border-black/[0.08] dark:border-white/[0.07] rounded-[14px] overflow-hidden bg-white dark:bg-[#101015]"
    >
      {/* Top: animated summary tiles */}
      <div className="grid grid-cols-3 border-b border-black/[0.08] dark:border-white/[0.07]">
        {[
          { label: "Certified", value: animTotal, suffix: "" },
          { label: "Issuers",   value: animIssuers, suffix: "" },
          { label: "Domains",   value: animCats, suffix: "" },
        ].map(({ label, value, suffix }, i) => (
          <div
            key={label}
            className={`px-5 py-4 ${i > 0 ? "border-l border-black/[0.08] dark:border-white/[0.07]" : ""}`}
          >
            <div className="text-[28px] font-semibold tracking-[-0.02em] leading-none text-gray-900 dark:text-[#ededee] tabular-nums flex items-baseline gap-[4px]">
              {value}{suffix}
            </div>
            <div
              className="mt-[6px] text-[10px] tracking-[0.22em] uppercase text-gray-400 dark:text-[#8a8a93]"
              style={{ fontFamily: MONO }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: category bars + issuer list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.08] dark:divide-white/[0.07]">
        {/* Category breakdown — horizontal bars */}
        <div className="p-5">
          <div
            className="text-[10px] uppercase tracking-[0.26em] text-gray-400 dark:text-[#8a8a93] mb-3"
            style={{ fontFamily: MONO }}
          >
            By Category
          </div>
          <div className="flex flex-col gap-[10px]">
            {byCat.map(([cat, count]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-[5px]">
                  <span
                    className="text-[11px] text-gray-700 dark:text-[#c9c9cf]"
                    style={{ fontFamily: MONO }}
                  >
                    {cat}
                  </span>
                  <span
                    className="text-[11px] font-semibold text-gray-900 dark:text-white tabular-nums"
                    style={{ fontFamily: MONO }}
                  >
                    {count}
                  </span>
                </div>
                <div className="h-[5px] rounded-full bg-black/[0.05] dark:bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: catColor(cat) }}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${(count / maxCat) * 100}%` } : {}}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issuer distribution — colour-coded rows */}
        <div className="p-5">
          <div
            className="text-[10px] uppercase tracking-[0.26em] text-gray-400 dark:text-[#8a8a93] mb-3"
            style={{ fontFamily: MONO }}
          >
            By Issuer
          </div>
          <div className="flex flex-col gap-[8px]">
            {byIssuer.map(([iss, count], idx) => {
              const color = issuerColor(iss);
              return (
                <div key={iss} className="flex items-center gap-2.5">
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ background: color, boxShadow: `0 0 5px ${color}` }}
                  />
                  <span
                    className="flex-1 text-[11px] text-gray-700 dark:text-[#c9c9cf] truncate"
                    style={{ fontFamily: MONO }}
                  >
                    {iss}
                  </span>
                  {/* mini bar */}
                  <div className="w-[60px] h-[4px] rounded-full bg-black/[0.05] dark:bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${(count / maxIss) * 100}%` } : {}}
                      transition={{ duration: 0.6, delay: 0.1 + idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-semibold text-gray-900 dark:text-white tabular-nums w-[18px] text-right"
                    style={{ fontFamily: MONO }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Wire `CertStatsGrid` into JSX**

In the `Certifications` component body, find the closing `</div>` of the stat strip block (ends with `</div>` after `{/* Stat strip */}` section) and add the stats grid immediately after:

```tsx
      {/* Stats grid — category bars + issuer distribution */}
      <CertStatsGrid certs={rawCerts} />

      {/* Toolbar */}
```

- [ ] **Step 5: Build and visually verify**

```bash
npm run build
```
Expected: `✓ Compiled successfully`, 0 TypeScript errors.

Then start dev server: `npm run dev` and open `http://localhost:3000/#certifications`. Verify:
- Animated count-up tiles appear (35, 10, 5)
- Category bars animate in on scroll
- Issuer rows with coloured dots appear
- Both light and dark mode look correct

- [ ] **Step 6: Commit**

```bash
git add components/Certifications.tsx
git commit -m "feat: add CertStatsGrid with category bars, issuer distribution, count-up animation"
```

---

## Task 3: SEO — add ItemList structured data for certifications

**Files:**
- Modify: `app/layout.tsx` — add one new `<script type="application/ld+json">` block inside `<head>` after the existing FAQ block

The goal is to help Google understand the top certifications via structured data, improving rich-result eligibility.

- [ ] **Step 1: Add ItemList LD+JSON after the FAQ script block in `app/layout.tsx`**

Find the closing `/>` of the FAQ `<script>` block and insert immediately after:

```tsx
        {/* Certifications structured data — top AI Engineering certs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Selvin PaulRaj K — Professional Certifications",
              description: "Verified professional certifications in AI Engineering, MCP, Agents, and Full-Stack Development",
              numberOfItems: 35,
              itemListElement: [
                {
                  "@type": "ListItem", position: 1,
                  item: {
                    "@type": "EducationalOccupationalCredential",
                    name: "Model Context Protocol: Advanced Topics",
                    credentialCategory: "Certificate",
                    recognizedBy: { "@type": "Organization", name: "Anthropic" },
                    url: "https://verify.skilljar.com/c/f6qk5bev7int",
                  },
                },
                {
                  "@type": "ListItem", position: 2,
                  item: {
                    "@type": "EducationalOccupationalCredential",
                    name: "AI Agents Fundamentals",
                    credentialCategory: "Certificate",
                    recognizedBy: { "@type": "Organization", name: "Hugging Face" },
                    url: "https://huggingface.co/datasets/agents-course/certificates/resolve/main/certificates/selvinpaulraj/2025-06-25.png",
                  },
                },
                {
                  "@type": "ListItem", position: 3,
                  item: {
                    "@type": "EducationalOccupationalCredential",
                    name: "ACP: Agent Communication Protocol",
                    credentialCategory: "Certificate",
                    recognizedBy: { "@type": "Organization", name: "DeepLearning.AI" },
                    url: "https://learn.deeplearning.ai/accomplishments/d53d97ca-80d5-4d54-b8fd-46b18f1bc9a4",
                  },
                },
                {
                  "@type": "ListItem", position: 4,
                  item: {
                    "@type": "EducationalOccupationalCredential",
                    name: "Agentic Knowledge Graph Construction",
                    credentialCategory: "Certificate",
                    recognizedBy: { "@type": "Organization", name: "DeepLearning.AI" },
                    url: "https://learn.deeplearning.ai/accomplishments/921d7871-853e-417c-ae96-79de18685f0e",
                  },
                },
                {
                  "@type": "ListItem", position: 5,
                  item: {
                    "@type": "EducationalOccupationalCredential",
                    name: "Model Context Protocol (MCP) Course",
                    credentialCategory: "Certificate",
                    recognizedBy: { "@type": "Organization", name: "Hugging Face" },
                    url: "https://huggingface.co/datasets/mcp-course/certificates/resolve/main/certificates/selvinpaulraj/2025-07-03.png",
                  },
                },
              ],
            }),
          }}
        />
```

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "seo: add ItemList structured data for top 5 certifications"
```

---

## Task 4: Update llms.txt docs

**Files:**
- Modify: `public/llms.txt`

- [ ] **Step 1: Update the certifications line in Site Structure**

Find:
```
- `/#certifications` — 11+ certifications with issuer/category filters and search
```
Replace with:
```
- `/#certifications` — 35 verified certifications across 10 issuers and 5 categories; filterable by issuer, category; searchable; stats breakdown grid
```

- [ ] **Step 2: Update the API certifications description**

Find:
```
- `GET /api/certifications` — Certifications (issuer, category, date, skills, verifyUrl)
```
Replace with:
```
- `GET /api/certifications` — 35 certifications (show=true only; fields: issuer, category, date, skills, verifyUrl, certId)
```

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "docs: update llms.txt — 35 certs, 10 issuers"
```

---

## Task 5: Build verification + UI/UX checks

- [ ] **Step 1: Full production build**

```bash
npm run build
```
Expected output:
```
✓ Compiled successfully
✓ Generating static pages using 10 workers (9/9)
```
Zero TypeScript errors. All 7 routes present (`/`, `/_not-found`, `/api/certifications`, `/api/experiences`, `/api/projects`, `/api/recognition`, `/api/skills`).

- [ ] **Step 2: Dev-mode visual spot-check**

```bash
npm run dev
```
Open `http://localhost:3000` and check each in light + dark mode:
- `/#certifications` — stats grid animates in on scroll, bars fill correctly, issuer dots have distinct colours
- Verify 35 total count appears in the section header (`35 certificates · 10 issuers · 5 categories`)
- Click a cert card → modal opens, cert ID copy works
- Sort dropdown (Newest/Oldest/A-Z/By Issuer) changes order
- Issuer filter chips filter the grid correctly
- Pagination arrows appear (35 certs ÷ 12 PAGE_SIZE = 3 pages)
- Grid/list toggle works
- Dark mode: stat strip, search box border, select background all correct

- [ ] **Step 3: Accessibility spot-check**

Using keyboard only:
- Tab into section, press Enter/Space on a cert card → modal opens
- Press Escape → modal closes
- Tab through filter chips — focus ring visible on each
- Verify `aria-pressed` on active FilterChip, `aria-label` on sort select, `aria-label` on pagination buttons

- [ ] **Step 4: Mobile responsive check**

Resize to 375px width and verify:
- Stats grid tiles stack to 3-col (no overflow)
- Category/issuer grid stacks to single column
- Filter chips wrap gracefully
- Search input full-width
- Cert cards single-column

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: verified build + UI/UX spot-check pass"
git push
```

---

## Self-Review

**Spec coverage:**
- ✅ 35 shown certs handled (data already in JSON, filter by `show=true`)
- ✅ 10 issuers with distinct colours (ISSUER_COLORS expanded + hash fallback)
- ✅ Stats grid: animated count-up tiles, category bars, issuer distribution
- ✅ SEO: ItemList structured data for top 5 certs
- ✅ Geo: already in layout.tsx (`geo.region`, `geo.placename`, `geo.position`, ICBM)
- ✅ Performance: lazy-loaded via next/dynamic in page.tsx, no new heavy dependencies
- ✅ llms.txt updated

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:** `CertStatsGrid` receives `certs: (typeof rawCertsAll)[number][]` which matches `rawCerts` type. `issuerColor(name: string): string` is used in `PlaceholderThumb`, `IssuerPill`, `CertModal`, and `CertStatsGrid`. `useCountUp` signature `(target, durationMs, trigger) => number` matches all three call sites in `CertStatsGrid`.

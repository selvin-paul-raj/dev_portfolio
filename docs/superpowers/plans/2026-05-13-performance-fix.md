# Performance Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix PageSpeed Real Experience Score from 63 (desktop) / 85 (mobile) to 90+ by eliminating the root causes of FCP 3.88s and LCP 5.47s.

**Architecture:** Three independent fix layers — (1) framer-motion SSR opacity issue causing invisible content during JS parse, (2) unoptimized 2.53MB PNG hero image slowing LCP, (3) analytics/icon resource bloat adding unnecessary load weight.

**Tech Stack:** Next.js 16, Framer Motion 12, Tailwind CSS, Vercel Image Optimizer, `next/script`.

---

## Root Cause Analysis

| Metric | Root Cause | Expected Fix |
|--------|-----------|-------------|
| **FCP 3.88s** | framer-motion renders all above-fold content with `initial={{ opacity: 0 }}` during SSR — browser paints nothing until JS loads & animations start | Replace with CSS keyframe entry animations → FCP ~1.2–1.8s |
| **LCP 5.47s** | Hero image source is `selvinpaulraj_profile.png` (2.53 MB PNG). Vercel optimizer processes this on each cache miss; `quality={90}` produces large output | Switch to `Selvin_PaulRaj.webp` (328 KB) + quality 75 → optimizer ~5× faster, output ~40 KB |
| **Resource bloat** | Apple-touch-icon serves the raw 2.53 MB PNG. Clarity script is a synchronous `dangerouslySetInnerHTML` in `<body>` | Fix icon + use `next/script` strategy="lazyOnload" |

---

## Files to Modify

| File | What Changes |
|------|-------------|
| `components/Intro.tsx` | Remove `initial={{ opacity: 0 }}` on all above-fold motion elements; switch hero img source to WebP; lower quality to 75 |
| `app/globals.css` | Add CSS keyframe entry animations (`@keyframes fadeUp`, `@keyframes fadeIn`) |
| `app/layout.tsx` | Fix apple-touch-icon; move Clarity to `<Script strategy="lazyOnload">`; add `preconnect` for Clarity CDN |

---

## Task 1: Fix CSS Entry Animations (FCP — Highest Impact)

**Files:**
- Modify: `app/globals.css`
- Modify: `components/Intro.tsx`

### Background

Framer-motion propagates `initial` styles to the server-rendered HTML. Every element with `initial={{ opacity: 0 }}` is invisible in the initial HTML. FCP can't record a paint because there is nothing visible. Content only appears after framer-motion's JS hydrates (part of the ~200 KB+ app bundle). Fix: remove the `initial` opacity-0 states from above-fold motion elements and replace them with CSS keyframe animations — CSS runs before any JS.

- [ ] **Step 1: Add CSS keyframe utilities to globals.css**

Append to the end of `app/globals.css`:

```css
/* Entry animations — CSS-driven so they fire before JS hydrates */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.anim-fade-up   { animation: fadeUp 0.45s cubic-bezier(0.23,1,0.32,1) both; }
.anim-fade-in   { animation: fadeIn 0.45s cubic-bezier(0.23,1,0.32,1) both; }

/* Stagger delays — apply alongside .anim-fade-up / .anim-fade-in */
.anim-d0   { animation-delay: 0.05s; }
.anim-d1   { animation-delay: 0.15s; }
.anim-d2   { animation-delay: 0.22s; }
.anim-d3   { animation-delay: 0.30s; }
.anim-d4   { animation-delay: 0.36s; }
.anim-d5   { animation-delay: 0.42s; }
.anim-d6   { animation-delay: 0.50s; }
.anim-d7   { animation-delay: 0.58s; }
.anim-d8   { animation-delay: 0.66s; }
.anim-d9   { animation-delay: 0.80s; }
```

- [ ] **Step 2: Replace motion entry animations in Intro.tsx with CSS classes**

In `components/Intro.tsx`, replace every `motion.div` / `motion.h1` / `motion.p` that uses `initial={{ opacity: 0, y: N }} animate={{ opacity: 1, y: 0 }}` for the above-fold entry with a plain HTML element + CSS class. Keep `motion.*` only where it adds value (floating image, interactive hover states).

**Mobile status pill (lg:hidden, line ~141)** — replace:
```tsx
// BEFORE
<motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.38, ease: EASE_OUT, delay: 0.05 }}
  className="lg:hidden flex items-center justify-center gap-2 mb-5 font-mono text-xs
    text-gray-400 dark:text-white/30"
>
```
with:
```tsx
// AFTER
<div className="anim-fade-up anim-d0 lg:hidden flex items-center justify-center gap-2 mb-5 font-mono text-xs
  text-gray-400 dark:text-white/30">
```

**Desktop status pill (hidden lg:flex, line ~165)** — replace:
```tsx
// BEFORE
<motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.38, ease: EASE_OUT, delay: 0.05 }}
  className="hidden lg:flex items-center gap-2 mb-5 font-mono text-xs text-gray-400 dark:text-white/30
    bg-black/[0.04] dark:bg-white/[0.05] border border-black/6 dark:border-white/8
    rounded-full px-4 py-1.5"
>
```
with:
```tsx
// AFTER
<div className="anim-fade-up anim-d0 hidden lg:flex items-center gap-2 mb-5 font-mono text-xs text-gray-400 dark:text-white/30
  bg-black/[0.04] dark:bg-white/[0.05] border border-black/6 dark:border-white/8
  rounded-full px-4 py-1.5">
```

**Name h1 (line ~181)** — replace:
```tsx
// BEFORE
<motion.h1
  initial={{ opacity: 0, y: 22 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.46, ease: EASE_OUT, delay: 0.15 }}
  className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-3"
>
```
with:
```tsx
// AFTER
<h1 className="anim-fade-up anim-d1 text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-3">
```

**Role p (line ~192)** — replace:
```tsx
// BEFORE
<motion.p
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.22 }}
  className="font-mono text-sm sm:text-[0.9rem] text-[#9a7d2a] dark:text-[#FFD700]/65 mb-4 tracking-wide"
>
```
with:
```tsx
// AFTER
<p className="anim-fade-up anim-d2 font-mono text-sm sm:text-[0.9rem] text-[#9a7d2a] dark:text-[#FFD700]/65 mb-4 tracking-wide">
```

**Mobile stats strip (line ~201)** — replace:
```tsx
// BEFORE
<motion.div
  ref={mobileStatsRef}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.36, ease: EASE_OUT, delay: 0.28 }}
  className="lg:hidden flex items-center justify-center gap-3 mt-1 mb-5 font-mono"
>
```
with:
```tsx
// AFTER
<div
  ref={mobileStatsRef}
  className="anim-fade-up anim-d3 lg:hidden flex items-center justify-center gap-3 mt-1 mb-5 font-mono"
>
```

**Bio p (line ~225)** — replace:
```tsx
// BEFORE
<motion.p
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.3 }}
  className="text-base text-gray-600 dark:text-white/50 leading-relaxed max-w-xl mb-3"
>
```
with:
```tsx
// AFTER
<p className="anim-fade-up anim-d3 text-base text-gray-600 dark:text-white/50 leading-relaxed max-w-xl mb-3">
```

**Secondary bio p (line ~240)** — replace:
```tsx
// BEFORE
<motion.p
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.38, ease: EASE_OUT, delay: 0.36 }}
  className="text-sm text-gray-500 dark:text-white/40 leading-relaxed max-w-xl mb-7"
>
```
with:
```tsx
// AFTER
<p className="anim-fade-up anim-d4 text-sm text-gray-500 dark:text-white/40 leading-relaxed max-w-xl mb-7">
```

**CTAs div (line ~256)** — replace:
```tsx
// BEFORE
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.36, ease: EASE_OUT, delay: 0.42 }}
  className="flex flex-row gap-2.5 w-full sm:w-auto mb-7"
>
```
with:
```tsx
// AFTER
<div className="anim-fade-up anim-d5 flex flex-row gap-2.5 w-full sm:w-auto mb-7">
```

**Socials div (line ~307)** — replace:
```tsx
// BEFORE
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.34, ease: EASE_OUT, delay: 0.5 }}
  className="flex items-center gap-2.5"
>
```
with:
```tsx
// AFTER
<div className="anim-fade-up anim-d6 flex items-center gap-2.5">
```

**Profile image wrapper (line ~336)** — keep the outer motion.div for the float animation but remove the fade-in initial:
```tsx
// BEFORE
<motion.div
  initial={{ opacity: 0, scale: 0.94 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.2 }}
  className="shrink-0 "
>
```
with:
```tsx
// AFTER
<div className="anim-fade-in anim-d1 shrink-0">
```

**Stats strip motion.div (line ~365)** — replace:
```tsx
// BEFORE
<motion.div
  ref={statsRef}
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.58 }}
  className="hidden lg:flex items-stretch rounded-2xl overflow-hidden border border-black/6 dark:border-white/8 bg-white dark:bg-white/[0.04] mb-8"
>
```
with:
```tsx
// AFTER
<div
  ref={statsRef}
  className="anim-fade-up anim-d7 hidden lg:flex items-stretch rounded-2xl overflow-hidden border border-black/6 dark:border-white/8 bg-white dark:bg-white/[0.04] mb-8"
>
```

**Tech badges div (line ~422)** — replace:
```tsx
// BEFORE
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.38, ease: EASE_OUT, delay: 0.66 }}
  className="hidden lg:flex flex-wrap justify-start gap-2 mb-12"
>
```
with:
```tsx
// AFTER
<div className="anim-fade-up anim-d8 hidden lg:flex flex-wrap justify-start gap-2 mb-12">
```

**Particle canvas wrapper (line ~444)** — replace:
```tsx
// BEFORE
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.8 }}
  className="hidden sm:block w-full rounded-2xl overflow-hidden border border-black/6 dark:border-white/8"
>
```
with:
```tsx
// AFTER
<div className="anim-fade-in anim-d9 hidden sm:block w-full rounded-2xl overflow-hidden border border-black/6 dark:border-white/8">
```

- [ ] **Step 3: Remove now-unused framer-motion imports from Intro.tsx**

After the replacements, `motion` is still used for the floating image animation. Check that `EASE_OUT` is still used somewhere — if not, remove it. The import line should remain:
```tsx
import { useInView } from "framer-motion";
```
Remove `motion` from the import if the floating animation wrapper was also replaced (it was replaced with a plain `<div>` above). If you kept the floating animation as `motion.div`, keep the full import `import { motion, useInView } from "framer-motion"`.

Since the floating image was changed to a plain `<div>`, the inner `motion.div` for the float animation at line ~342 is the only remaining `motion.*` — keep it:
```tsx
<motion.div
  animate={{ y: [0, -8, 0] }}
  transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
>
```

So the final import is:
```tsx
import { motion, useInView } from "framer-motion";
```
(Keep `motion` for the float animation. Remove `EASE_OUT` constant if nothing uses it anymore.)

- [ ] **Step 4: Verify EASE_OUT usage and clean up**

Search `Intro.tsx` for remaining uses of `EASE_OUT`. If zero remain, delete the line:
```tsx
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
```

- [ ] **Step 5: Commit**

```bash
git add components/Intro.tsx app/globals.css
git commit -m "perf: replace framer-motion initial-opacity with CSS keyframe animations

Removes opacity:0 initial states from all above-fold elements in Intro.tsx.
Server-rendered HTML now has visible content immediately, fixing FCP regression
caused by framer-motion delaying first paint until JS hydration completes."
```

---

## Task 2: Optimize Hero Image Source (LCP — High Impact)

**Files:**
- Modify: `components/Intro.tsx`

### Background

The hero `<Image>` imports `selvinpaulraj_profile.png` (2.53 MB PNG). Even though Next.js converts it to AVIF/WebP, Vercel's image optimizer must process the 2.53 MB source on each cache miss, causing 3–5 s delays. `Selvin_PaulRaj.webp` (328 KB) already exists in `public/` — switching to it means the optimizer processes 87% less data per miss. Lowering `quality` from 90 to 75 further reduces the optimized output size.

- [ ] **Step 1: Change the hero image import in Intro.tsx**

Replace line 12:
```tsx
// BEFORE
import HeroImg from "../public/selvinpaulraj_profile.png";
```
with:
```tsx
// AFTER
import HeroImg from "../public/Selvin_PaulRaj.webp";
```

- [ ] **Step 2: Lower quality on the Image component**

In the `<Image>` component (around line 347 after Task 1 edits):
```tsx
// BEFORE
quality={90}
```
```tsx
// AFTER
quality={75}
```

- [ ] **Step 3: Commit**

```bash
git add components/Intro.tsx
git commit -m "perf: use 328KB WebP hero image source instead of 2.53MB PNG

Vercel image optimizer processes 87% less data per cache miss. quality 90→75
further reduces output size from ~100KB to ~30-40KB AVIF."
```

---

## Task 3: Fix Apple Icon & OG Image Metadata (Resource Bloat)

**Files:**
- Modify: `app/layout.tsx`

### Background

`icons.apple` in metadata currently points to `/selvinpaulraj_profile.png` — the raw 2.53 MB file served directly (no optimizer). Every Apple device visit downloads this. OG/Twitter card images also reference the full PNG. Neither of these go through `/_next/image`.

- [ ] **Step 1: Fix the apple icon in layout.tsx**

Find the `icons` block (around line 80):
```tsx
// BEFORE
icons: {
  icon: [
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon.ico", type: "image/x-icon" },
  ],
  shortcut: "/favicon.ico",
  apple: "/selvinpaulraj_profile.png",
},
```
Replace with:
```tsx
// AFTER
icons: {
  icon: [
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon.ico", type: "image/x-icon" },
  ],
  shortcut: "/favicon.ico",
  apple: "/favicon.svg",
},
```

- [ ] **Step 2: Fix OG and Twitter image references**

Find the `openGraph.images` array (around line 110):
```tsx
// BEFORE
images: [
  {
    url: "/selvinpaulraj_profile.png",
    width: 1200,
    height: 630,
    alt: "Selvin PaulRaj K — AI Engineer & Agentic AI Developer",
    type: "image/png",
  },
],
```
Replace with:
```tsx
// AFTER
images: [
  {
    url: "/Selvin_PaulRaj.webp",
    width: 1200,
    height: 630,
    alt: "Selvin PaulRaj K — AI Engineer & Agentic AI Developer",
    type: "image/webp",
  },
],
```

Find the `twitter.images` array (around line 126):
```tsx
// BEFORE
images: ["/selvinpaulraj_profile.png"],
```
Replace with:
```tsx
// AFTER
images: ["/Selvin_PaulRaj.webp"],
```

Also update the Person structured data `image` field (around line 177):
```tsx
// BEFORE
image: "https://selvinpaulraj.vercel.app/selvinpaulraj_profile.png",
```
```tsx
// AFTER
image: "https://selvinpaulraj.vercel.app/Selvin_PaulRaj.webp",
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "perf: stop serving 2.53MB PNG as apple-touch-icon and OG image

Raw PNG bypasses Next.js image optimizer. Switch apple icon to SVG favicon
and OG/Twitter images to the already-existing 328KB WebP variant."
```

---

## Task 4: Move Clarity Analytics to next/script (Parse Blocking)

**Files:**
- Modify: `app/layout.tsx`

### Background

Clarity is currently injected as an inline `dangerouslySetInnerHTML` block inside `<body>`. While the Clarity tag itself loads its script asynchronously, the inline script runs synchronously during HTML parsing — adding parser work at body start. Moving it to `next/script` with `strategy="lazyOnload"` defers it until the page is fully idle.

- [ ] **Step 1: Add Script import to layout.tsx**

At the top of `app/layout.tsx`, add:
```tsx
import Script from "next/script";
```

- [ ] **Step 2: Replace the inline Clarity block**

Find the Microsoft Clarity block inside `<body>` (around line 281):
```tsx
// BEFORE
{/* Microsoft Clarity Analytics */}
<script
  dangerouslySetInnerHTML={{
    __html: `(function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "oo7sqjfgyt");`,
  }}
/>
```
Replace with:
```tsx
// AFTER
<Script
  id="clarity-analytics"
  strategy="lazyOnload"
  dangerouslySetInnerHTML={{
    __html: `(function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "oo7sqjfgyt");`,
  }}
/>
```

- [ ] **Step 3: Add preconnect for Clarity CDN in `<head>`**

In the `<head>` section of layout.tsx, add after the existing dns-prefetch links (around line 166):
```tsx
{/* Preconnect for analytics CDN — reduces DNS + TCP + TLS for Clarity */}
<link rel="preconnect" href="https://www.clarity.ms" />
<link rel="dns-prefetch" href="https://www.clarity.ms" />
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "perf: defer Clarity analytics via next/script lazyOnload strategy

Inline script in body ran synchronously during HTML parse. next/script
lazyOnload fires after page load event, removing it from the critical path."
```

---

## Task 5: Build & Verify

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build completes with no errors. Check the output for any warnings about images or missing imports.

- [ ] **Step 2: Start production server and smoke-test**

```bash
npm run start
```

Open `http://localhost:3000` and verify:
- Hero section text is visible immediately (no invisible flash)
- Profile image loads
- Floating animation on profile image still works
- Dark/light toggle works
- All navigation links work

- [ ] **Step 3: Check bundle sizes haven't regressed**

In the build output, note the `/_app` bundle size. Should be similar or smaller (one fewer framer-motion animation feature used).

- [ ] **Step 4: Deploy to Vercel**

```bash
git push origin main
```

Wait for Vercel deployment to complete (check Vercel dashboard).

- [ ] **Step 5: Re-run PageSpeed**

Test both URLs:
- `https://pagespeed.web.dev/analysis?url=https://selvinpaulraj.tech&form_factor=desktop`
- `https://pagespeed.web.dev/analysis?url=https://selvinpaulraj.tech&form_factor=mobile`

Expected targets:
| Metric | Before | Expected After |
|--------|--------|---------------|
| FCP Desktop | 3.88s | < 1.8s |
| LCP Desktop | 5.47s | < 3.0s |
| FCP Mobile | 2.1s | < 1.5s |
| LCP Mobile | 3.69s | < 2.5s |
| RES Desktop | 63 | > 85 |
| RES Mobile | 85 | > 90 |

---

## Self-Review

**Spec coverage:**
- ✅ FCP root cause (framer-motion opacity) — Task 1
- ✅ LCP root cause (2.53 MB PNG) — Task 2
- ✅ Apple icon bloat (2.53 MB PNG raw) — Task 3
- ✅ OG/Twitter image bloat — Task 3
- ✅ Clarity parse blocking — Task 4
- ✅ Resource hints — Task 4

**Placeholder scan:** None. All steps contain exact code diffs.

**Type consistency:** No new types introduced. All motion → plain element swaps are structural only.

**Risk:** The profile image swap (PNG → WebP) changes which `src` hash Next.js image optimizer uses. The first Vercel deployment will process the WebP source fresh. Cache misses for the next 24 hours will be faster than before (328 KB vs 2.53 MB to process). No visual regression risk — same photograph, same dimensions.

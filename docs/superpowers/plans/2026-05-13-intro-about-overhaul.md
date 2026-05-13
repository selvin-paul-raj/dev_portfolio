# Intro + About Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Kaggle/deep-ml social links + rotating profile ring + personality tags to hero; fix About stats to use live data with count-up; remove hero stats strip + particle canvas; add particle page loader.

**Architecture:** Modify 5 files, create 1 new component. All changes isolated to UI layer — no data-layer changes. PageLoader mounts in page.tsx via dynamic import (ssr:false). Count-up hook duplicated locally in About (no shared util needed yet).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, Framer Motion 12, react-icons/si (SiKaggle), inline SVG (deep-ml)

---

## File Map

| File | Action |
|------|--------|
| `app/globals.css` | Add `@keyframes ring-spin` |
| `components/ui/PageLoader.tsx` | Create — particle page loader |
| `app/page.tsx` | Add dynamic PageLoader import |
| `components/Intro.tsx` | Add socials, rotating ring, tags; remove stats strip + particle canvas + dead hooks |
| `components/About.tsx` | Replace hardcoded split stats with live data + count-up animation |
| `components/SocialLinks.tsx` | Add Kaggle + deep-ml |

---

### Task 1: Add ring-spin keyframe to globals.css

**Files:** Modify `app/globals.css`

- [ ] Add after existing `@keyframes fadeIn` block:

```css
@keyframes ring-spin {
  to { transform: rotate(360deg); }
}
```

---

### Task 2: Create PageLoader component

**Files:** Create `components/ui/PageLoader.tsx`

- [ ] Write the file:

```tsx
"use client";

import { useEffect, useState } from "react";
import { ParticleTextEffect } from "./particle-text-effect";

const LOADER_WORDS = ["SELVIN", "AI ENGINEER", "AGENTIC AI", "MCP BUILDER", "MULTI-AGENT"];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const MIN_MS = 900;
    const start = Date.now();

    const dismiss = () => {
      const wait = Math.max(0, MIN_MS - (Date.now() - start));
      setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 650);
      }, wait);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
      return () => window.removeEventListener("load", dismiss);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#07070a] flex flex-col items-center justify-center"
      style={{ opacity: fading ? 0 : 1, transition: "opacity 650ms ease", pointerEvents: fading ? "none" : "auto" }}
    >
      <ParticleTextEffect
        words={LOADER_WORDS}
        className="w-full max-w-3xl flex items-center justify-center"
      />
      <div className="mt-6 flex items-center gap-2.5 font-mono text-[11px] text-white/25 tracking-[0.35em] uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-ping" />
        Loading
      </div>
    </div>
  );
}
```

---

### Task 3: Wire PageLoader into page.tsx

**Files:** Modify `app/page.tsx`

- [ ] Add dynamic import at top of file (after existing dynamic imports):

```tsx
const DynamicPageLoader = dynamic(() => import("@/components/ui/PageLoader"), { ssr: false });
```

- [ ] Add `<DynamicPageLoader />` as first child inside `<main>`:

```tsx
<main className="flex flex-col items-center px-4">
  <DynamicPageLoader />
  <Analytics />
  ...
```

---

### Task 4: Intro.tsx — remove Stats strip + Particle canvas + dead code

**Files:** Modify `components/Intro.tsx`

- [ ] Remove `ParticleTextEffect` dynamic import (lines ~18-24)
- [ ] Remove `statsRef`, `statsInView`, `animatedProjects`, `animatedTotal`, `animatedIntern`, `animatedRole` (lines ~107-112)
- [ ] Remove `mobileStatsRef`, `mobileStatsInView`, `mobileAnimProjects`, `mobileAnimTotal` (lines ~114-117)
- [ ] Remove the entire Stats strip `<div ref={statsRef} ...>` block (lines ~318-370)
- [ ] Remove the Particle canvas `<div className="anim-fade-in anim-d9 ...">` block (lines ~389-395)
- [ ] Remove `useInView` from framer-motion import (no longer needed after above removals)
- [ ] Keep: `useCountUp` fn, `_fmtDur`, TECH_BADGES, mobile inline stats block (it uses mobileStatsRef — keep those two refs for mobile stats only)

Revised import at top:
```tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
// ... rest stays
```

Mobile stats block: keep `mobileStatsRef` + `mobileAnimProjects` + `mobileAnimTotal`. Remove the desktop stat refs.

---

### Task 5: Intro.tsx — add Kaggle + deep-ml to SOCIAL_LINKS

**Files:** Modify `components/Intro.tsx`

- [ ] Add import at top:
```tsx
import { SiKaggle } from "react-icons/si";
```

- [ ] Add inline DeepMl SVG icon component (above SOCIAL_LINKS):
```tsx
const DeepMlIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
  </svg>
);
```

- [ ] Append to SOCIAL_LINKS array:
```tsx
{ href: "https://www.kaggle.com/selvinpaulrajk", icon: <SiKaggle size={17} />, label: "Kaggle" },
{ href: "https://www.deep-ml.com/profile/fdmYEE5bBFgqLwHxlBFW1lgLUR22", icon: <DeepMlIcon />, label: "deep-ml" },
```

---

### Task 6: Intro.tsx — rotating profile ring + personality tags

**Files:** Modify `components/Intro.tsx`

- [ ] Replace the profile image section `<div className="anim-fade-in anim-d1 shrink-0">` with:

```tsx
<div className="anim-fade-in anim-d1 shrink-0">
  <motion.div
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
  >
    {/* Rotating ring container */}
    <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
      {/* Conic gradient ring — rotates */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ animation: "ring-spin 5s linear infinite" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #FFD700 0deg, #FFA500 45deg, transparent 90deg, transparent 300deg, #FFD700 360deg)",
          }}
        />
      </div>
      {/* Mask: covers gradient center, creates ring gap */}
      <div className="absolute inset-[3px] rounded-full bg-[#FAFAF9] dark:bg-[#09090b]" />
      {/* Image */}
      <div className="absolute inset-[4px] rounded-full overflow-hidden shadow-2xl">
        <Image
          src={HeroImg}
          alt="Selvin PaulRaj K — AI Engineer"
          width={320}
          height={320}
          quality={75}
          priority
          sizes="(max-width: 640px) 208px, (max-width: 1024px) 256px, 320px"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Gold glow behind ring */}
      <div className="absolute inset-0 rounded-full bg-[#FFD700]/10 blur-2xl scale-110 -z-10" />
    </div>
  </motion.div>
</div>
```

- [ ] Add personality tags after the role `<p>` tag (below anim-d2), before mobile stats:

```tsx
{/* Personality tags */}
<div className="anim-fade-up anim-d2 flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
  {["Technical", "Precise", "Open Source", "Problem Solver"].map((tag) => (
    <span
      key={tag}
      className="font-mono text-[10px] px-3 py-1 rounded-full tracking-[0.12em] uppercase
        bg-[#FFD700]/8 dark:bg-[#FFD700]/10
        border border-[#FFD700]/20 dark:border-[#FFD700]/25
        text-[#9a7d2a] dark:text-[#FFD700]/60"
    >
      {tag}
    </span>
  ))}
</div>
```

---

### Task 7: About.tsx — fix split stats + add count-up

**Files:** Modify `components/About.tsx`

- [ ] Add imports:
```tsx
import { useRef } from "react";
import { useInView } from "framer-motion";
```

- [ ] Add `useCountUp` hook (above component):
```tsx
function useCountUp(target: number, durationMs: number, trigger: boolean) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!trigger) return;
    let rafId: number;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(eased * target));
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs, trigger]);
  return val;
}
```

- [ ] Inside `About()` component, add refs + animated values:
```tsx
const statsRef = useRef<HTMLDivElement>(null);
const statsInView = useInView(statsRef, { once: true, margin: "0px 0px -40px 0px" });
const animProjects = useCountUp(projectsData.length, 2000, statsInView);
const animTotalMonths = useCountUp(experienceMetrics.totalMonths, 2500, statsInView);
const animRole = useCountUp(experienceMetrics.workRoleMonths, 2200, statsInView);
const animIntern = useCountUp(experienceMetrics.internMonths, 2200, statsInView);
```

- [ ] Attach `ref={statsRef}` to the stats grid div.

- [ ] Replace stat 1 value `{projectsData.length}` → `{animProjects}`

- [ ] Replace stat 2 (YOE) value:
```tsx
const animYr = Math.floor(animTotalMonths / 12);
const animMo = animTotalMonths % 12;
// use animYr / animMo in JSX instead of yoe.yr / yoe.mo
```

- [ ] Replace split stat rows (Open Source / Clients) with Role / Intern:

```tsx
{/* Row 1: Role */}
<div className="px-[18px] py-3 flex items-center justify-between gap-3 border-b ...">
  <span className="..." style={{ fontFamily: MONO }}>Role</span>
  <span className="font-semibold text-[15px] text-gray-900 dark:text-[#ededee]">
    {_fmtDur(animRole)}
  </span>
</div>
{/* Row 2: Intern */}
<div className="px-[18px] py-3 flex items-center justify-between gap-3">
  <span className="..." style={{ fontFamily: MONO }}>Intern</span>
  <span className="font-semibold text-[15px] text-gray-900 dark:text-[#ededee]">
    {_fmtDur(animIntern)}
  </span>
</div>
```

- [ ] Add `_fmtDur` helper (above component):
```tsx
const _fmtDur = (n: number) => {
  const y = Math.floor(n / 12);
  const m = n % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
};
```

---

### Task 8: SocialLinks.tsx — add Kaggle + deep-ml

**Files:** Modify `components/SocialLinks.tsx`

- [ ] Add imports:
```tsx
import { SiKaggle } from "react-icons/si";
```

- [ ] Add DeepMlIcon component (same as Intro.tsx):
```tsx
const DeepMlIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
  </svg>
);
```

- [ ] Append to LINKS array:
```tsx
{ href: "https://www.kaggle.com/selvinpaulrajk", icon: <SiKaggle size={18} />, label: "Kaggle" },
{ href: "https://www.deep-ml.com/profile/fdmYEE5bBFgqLwHxlBFW1lgLUR22", icon: <DeepMlIcon />, label: "deep-ml" },
```

---

### Task 9: Build + verify

- [ ] `npm run build` — must compile with 0 TypeScript errors
- [ ] Check bundle size didn't regress
- [ ] Commit and push

```bash
git add -A
git commit -m "feat: intro/about overhaul — page loader, rotating ring, social links, dynamic stats"
git push
```

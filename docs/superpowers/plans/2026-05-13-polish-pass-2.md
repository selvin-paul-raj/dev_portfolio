# Polish Pass 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Remove PageLoader; upgrade deep-ml icon to neural-network SVG; fix rotating ring for light mode compatibility; slow count-up animation; audit light theme.

**Architecture:** 4 file edits, 1 file delete, no new files.

**Tech Stack:** Next.js 16, Tailwind CSS 3, SVG, RAF animation

---

## File Map

| File | Action |
|------|--------|
| `app/page.tsx` | Remove DynamicPageLoader import + JSX |
| `components/ui/PageLoader.tsx` | Delete |
| `components/Intro.tsx` | New neural-net deep-ml icon; fix ring (maskless approach) |
| `components/SocialLinks.tsx` | New neural-net deep-ml icon |
| `components/About.tsx` | Slower count-up (3500–4500ms, ease-out-quad), light-mode stat colors |

---

### Task 1: Remove PageLoader from page.tsx

**Files:** Modify `app/page.tsx`

- [ ] Remove: `const DynamicPageLoader = dynamic(() => import("@/components/ui/PageLoader"), { ssr: false });`
- [ ] Remove: `<DynamicPageLoader />` from JSX

---

### Task 2: Delete PageLoader file

**Files:** Delete `components/ui/PageLoader.tsx`

- [ ] Run: `rm components/ui/PageLoader.tsx`

---

### Task 3: Replace deep-ml icon with neural-network SVG

Neural network topology: 2 input nodes → 3 hidden nodes → 1 output node, with connecting lines.

- [ ] Replace `DeepMlIcon` in **Intro.tsx**:

```tsx
const DeepMlIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="2.5" cy="6.5"  r="1.7" fill="currentColor" opacity="0.75"/>
    <circle cx="2.5" cy="13.5" r="1.7" fill="currentColor" opacity="0.75"/>
    <circle cx="10"  cy="3.5"  r="1.7" fill="currentColor"/>
    <circle cx="10"  cy="10"   r="1.7" fill="currentColor"/>
    <circle cx="10"  cy="16.5" r="1.7" fill="currentColor"/>
    <circle cx="17.5" cy="10" r="1.7" fill="currentColor" opacity="0.9"/>
    <line x1="4.2"  y1="6.5"  x2="8.3" y2="3.5"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="6.5"  x2="8.3" y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="6.5"  x2="8.3" y2="16.5" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3" y2="3.5"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3" y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3" y2="16.5" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="3.5"  x2="15.8" y2="10"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="10"   x2="15.8" y2="10"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="16.5" x2="15.8" y2="10"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
  </svg>
);
```

- [ ] Same replacement in **SocialLinks.tsx** (size=18 variant)

---

### Task 4: Fix rotating ring (maskless, light-mode safe)

Current ring uses a mask `div` with hardcoded bg color → breaks on light/dark transitions and gradient backgrounds.

New approach: ring div at `inset: -2px` (slightly outside), image container at `inset: 0` clips the gradient center. No mask needed, works in any bg.

- [ ] Replace profile image block in **Intro.tsx**:

```tsx
<div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
  {/* Conic gradient ring — 2px arc showing outside image edge */}
  <div
    className="absolute rounded-full"
    style={{
      inset: "-2px",
      animation: "ring-spin 5s linear infinite",
      background:
        "conic-gradient(from 0deg, #FFD700 0deg, #FFA500 40deg, transparent 90deg, transparent 300deg, #FFD700 360deg)",
    }}
  />
  {/* Image covers gradient center — creates ring effect with no color matching */}
  <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl">
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
  {/* Glow behind */}
  <div className="absolute inset-0 rounded-full bg-[#FFD700]/10 blur-2xl scale-110 -z-10" />
</div>
```

---

### Task 5: Slow count-up + ease-out-quad in About.tsx

Current: 2000–2500ms, ease-out-quart → numbers jump fast, hard to watch.
Fix: 3500–4500ms, ease-out-quad (power 2) → slower, every number visible.

- [ ] In `useCountUp`, change easing line:
```tsx
// was: const eased = 1 - Math.pow(1 - p, 4);
const eased = 1 - Math.pow(1 - p, 2);  // ease-out-quad — more linear, readable
```

- [ ] Change durations:
```tsx
const animProjects     = useCountUp(projectsData.length,                 3500, statsInView);
const animTotalMonths  = useCountUp(experienceMetrics.totalMonths,        4500, statsInView);
const animRole         = useCountUp(experienceMetrics.workRoleMonths,     4000, statsInView);
const animIntern       = useCountUp(experienceMetrics.internMonths,       4000, statsInView);
```

---

### Task 6: Light theme audit — About stats panel

Stats grid currently `bg-gray-50 dark:bg-[#101015]` — fine. But border colors and text in light mode:

- [ ] Ensure stats grid border: `border border-black/[0.08] dark:border-white/[0.07]` (already correct, verify)
- [ ] Stats value text: `text-gray-900 dark:text-[#ededee]` — correct
- [ ] Stats label text: `text-gray-500 dark:text-[#8a8a93]` (currently `text-gray-400` — bump to `text-gray-500` for better contrast on gray-50)
- [ ] Chip border in light: `border-black/[0.08]` → bump to `border-black/[0.12]` for visibility

---

### Task 7: Build + commit

- [ ] `npm run build` — 0 errors
- [ ] `git add` + commit + push

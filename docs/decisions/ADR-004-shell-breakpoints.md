# ADR-004 — App-shell breakpoints (Desktop Sidebar · Tablet Rail · Mobile)

- **Status:** **PROPOSED.** Not approved and not implemented.
- **Date:** 2026-11-16
- **Source:** Roadmap Phase 05 acceptance ("Breakpoints are chosen by testing content space,
  recorded in an ADR, and not equal to artboard widths by assumption"); Handoff ("the breakpoints
  between them are a frontend decision to confirm at runtime"); Figma Dashboard frames (read-only,
  2026-11-16).
- **Related:** [phase-05-plan.md](../phases/phase-05-plan.md) §9

## Context

Figma gives three reference widths: Desktop 1440, Tablet 768, Mobile 390. These are artboards, not
breakpoints.

| Layout       | Shell                                                                            | Content column                                                                           |
| ------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Desktop 1440 | Sidebar 232 (padding 24/16, nav items 199 × 44, upgrade card 166 high)           | Main padding 24 → 1160. Top Bar 56 high: Controls **426** + Search **440**               |
| Tablet 768   | Rail 72 (12 controls of 40, gap 10, padding 20/16)                               | Main padding 24 → 648. Top Bar: Controls **295** (compact user trigger) + Search **353** |
| Mobile 390   | Top Bar 72 (fixed, blur 16) + bottom nav 84 (fixed, blur 16, 4 items of 76 × 60) | Padding 20 → 350; content padding 88 top / 108 bottom                                    |

## Content-space evidence (from verified Figma measurements)

1. **Desktop Sidebar with the full Top Bar** (user name visible, search 440):
   - needs 232 + 48 + 426 + 10 + 440 ≈ **1156 px** to match Figma;
   - with the search reduced to ~300, it needs ≈ **1016 px**.
   - At 1280 the content column is 1000, which is enough for the full Top Bar. At 1024 it is 744,
     where the search must shrink to ~300 and module grids designed for 1160 compress by 36%.
2. **Tablet Rail with the compact Top Bar:**
   - needs 72 + 48 + 295 + 10 + search ≥ 240 (placeholder still readable) ≈ **665 px**.
   - Below that, the Top Bar no longer fits in one row.
3. **Mobile:** the four-item bottom bar needs 4 × 76 + padding 32 = 336, so it fits from 320 up. The
   mobile Top Bar fits at 320 (logo 121 + actions 188 + padding 34 = 343). Its compression at 320 is
   checked at implementation.
4. **Device classes:**
   - Laptops at 1280/1366/1440 get the Sidebar.
   - iPad landscape (1024/1180) and portrait (744/768/820) get the Rail.
   - Phones (≤ 430) get the mobile shell.

## Decision (proposed)

| Shell                        | Range                 | Tailwind breakpoint (new, rem-based)       |
| ---------------------------- | --------------------- | ------------------------------------------ |
| Mobile: Top Bar + bottom nav | < **45rem** (720 px)  | base styles                                |
| Tablet: Rail + drawer        | 45rem – 79.99rem      | `rail:` → `--breakpoint-rail: 45rem`       |
| Desktop: Sidebar             | ≥ **80rem** (1280 px) | `sidebar:` → `--breakpoint-sidebar: 80rem` |

- **rem, not px.** Tailwind 4 breakpoints are rem-based, so a larger browser font size moves the
  thresholds up and switches to the more compact shell earlier. That is the desired behaviour for
  text scaling.
- **Zoom.** Page zoom shrinks the CSS viewport:
  - 1440 at 200% becomes 720 CSS px → Rail;
  - 400% becomes 360 → the mobile shell, which meets WCAG 1.4.10 reflow at 320 CSS px.
- **Short viewport heights:**
  - The Sidebar (≈ 700 px of content) and the Rail (≈ 640 px) are sticky at full viewport height
    with **internal vertical scrolling**, so nothing is cut off at, for example, 1280 × 600 or a
    phone in landscape (≈ 390 high, Rail range).
  - The upgrade card sits at the end of the scroll when space is short.
- **Mobile safe areas:**
  - The Top Bar adds `env(safe-area-inset-top)`.
  - The bottom nav adds `env(safe-area-inset-bottom)` to its 16 px bottom padding; content bottom
    padding becomes 84 + inset + 24 (Roadmap: "84px + inset bottom padding").
  - This needs `viewport-fit=cover` in the root viewport export.
- **Tokens.** The two `--breakpoint-*` theme variables go in `src/design-system` (new tokens,
  approved with this ADR). Nothing else changes.

## Alternatives considered

| Option                                    | Rejected because                                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Artboard widths (768 / 1440)              | The Roadmap forbids assuming them; 1280–1439 laptops would get the Rail despite enough space                    |
| Tailwind defaults `md` 48rem / `lg` 64rem | At 1024 the Sidebar leaves a 744 content column (Top Bar compressed, desktop grids squeezed)                    |
| Sidebar from 75rem (1200)                 | Content 920: workable, but the search still drops below the Figma 440. Kept as a fallback if testing favours it |
| A height query for phones in landscape    | More complexity; internal Rail scrolling covers it                                                              |

## Validation required at implementation (acceptance criteria)

The rendered shell must be tested at 320, 390, 719/720, 768, 1024, 1279/1280 and 1440, in RTL and
LTR. The checks are:

- no horizontal overflow;
- the Top Bar fits in one row;
- nav labels and the user name are not clipped;
- 200% zoom;
- a 20 px root font size;
- short heights (1280 × 600, 844 × 390).

If a threshold fails these checks, the ADR is updated before approval of the Phase 05 closure.

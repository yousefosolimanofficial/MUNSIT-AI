# ADR-004 — App-shell breakpoints (Desktop Sidebar · Tablet Rail · Mobile)

- **Status:** **Approved — initial strategy** (user, 2026-11-16). **The thresholds are subject to
  implementation validation** (§ Validation). If measurements show that a threshold is unsuitable,
  this ADR must be **revised and re-approved**. It is never silently changed in code.
- **Date:** 2026-11-16
- **Source:** Roadmap Phase 05 acceptance ("Breakpoints are chosen by testing content space,
  recorded in an ADR, and not equal to artboard widths by assumption"); Handoff ("the breakpoints
  between them are a frontend decision to confirm at runtime"); Figma Dashboard frames (read-only,
  2026-11-16).
- **Related:** [phase-05-plan.md](../phases/phase-05-plan.md) §9

## Context

Figma gives three **reference widths**: Desktop 1440, Tablet 768, Mobile 390. They stay the
reference for visual QA. They are artboards, not breakpoints.

| Reference    | Shell (FIGMA)                                                                    | Content column                                                                           |
| ------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Desktop 1440 | Sidebar 232 (padding 24/16, nav items 199 × 44, upgrade card 166 high)           | Main padding 24 → 1160. Top Bar: Controls **426** + Search **440**                       |
| Tablet 768   | Rail 72 (12 controls of 40, gap 10, padding 20/16)                               | Main padding 24 → 648. Top Bar: Controls **295** (compact user trigger) + Search **353** |
| Mobile 390   | Top Bar 72 (fixed, blur 16) + bottom nav 84 (fixed, blur 16, 4 items of 76 × 60) | Padding 20 → 350; content padding 88 top / 108 bottom                                    |

## Why 720 px and 1280 px (content-space evidence from verified Figma values)

1. **Desktop Sidebar at 1280:**
   - Sidebar 232 + Main padding 48 + the full Top Bar (Controls 426, gap 10, Search 440) ≈
     **1156 px**.
   - At 1280 the content column is 1000, so the Figma desktop Top Bar fits without compression.
   - At 1024 it would be 744: the search drops to ~300 and desktop grids designed for 1160 lose a
     third of their width. Below 1280, the Rail keeps 904–1159 px of content.
2. **Tablet Rail at 720:**
   - Rail 72 + padding 48 + compact Controls 295 + gap 10 + search ≥ 240 (placeholder still
     readable) ≈ **665 px**.
   - 720 leaves a margin, and covers iPad mini and iPad portrait (744/768/820).
3. **Mobile below 720:**
   - The bottom bar needs 4 × 76 + 32 = 336, and the mobile Top Bar needs ≈ 343 (logo 121 +
     actions 188 + padding 34). Both fit from 320 up; compression at 320 is checked during
     implementation.
4. **Device classes:**
   - Laptops at 1280/1366/1440 get the Sidebar.
   - iPads (744–1180) get the Rail.
   - Phones (≤ 430) get the mobile shell.

## Decision

| Shell                        | Range                 | Tailwind 4 breakpoint (the project's existing convention)                                          |
| ---------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| Mobile: Top Bar + bottom nav | < **45rem** (720 px)  | base styles                                                                                        |
| Tablet: Rail + drawer        | 45rem – < 80rem       | **`rail:`**: one new theme breakpoint `--breakpoint-rail: 45rem` in `src/design-system/tokens.css` |
| Desktop: Sidebar             | ≥ **80rem** (1280 px) | **`xl:`**: Tailwind's existing default (80rem); no new token                                       |

- **No parallel breakpoint system.**
  - Both thresholds are Tailwind 4 theme breakpoints, the mechanism the codebase already uses.
  - The Desktop threshold reuses the default `xl`. The only addition is `rail` (45rem), because no
    default sits at 45rem.
  - Tailwind's other defaults (`sm`, `md`, `lg`) stay available for module content layouts. Only
    the shell uses `rail:` and `xl:` to switch shells.
- **rem-based.**
  - A larger browser font size moves the thresholds up proportionally (for example 20 px root →
    900 / 1600 px), so the compact shell appears earlier. That is the intended behaviour for text
    scaling.
- **Zoom.**
  - 1440 at 200% → 720 CSS px → Rail.
  - At 400% → 360 → mobile shell (WCAG 1.4.10 reflow at 320 CSS px).
- **Short viewport heights.**
  - The Sidebar (≈ 700 px of content) and the Rail (≈ 640 px) are sticky at full viewport height
    with **internal vertical scrolling**, so no control is clipped (for example 1280 × 600, or a
    phone in landscape ≈ 390 high in the Rail range).
  - The upgrade card ends the scroll when space is short.
- **Mobile safe areas.**
  - The Top Bar adds `env(safe-area-inset-top)`.
  - The bottom nav adds `env(safe-area-inset-bottom)` to its 16 px bottom padding.
  - Content bottom padding = 84 + inset + 24 (Roadmap: "84px + inset bottom padding").
  - The root viewport export sets `viewportFit: "cover"`.

## Alternatives considered

| Option                                    | Rejected because                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Artboard widths (768 / 1440)              | Forbidden by the Roadmap; 1280–1439 laptops would get the Rail despite enough space                                 |
| Tailwind defaults `md` 48rem / `lg` 64rem | At 1024 the Sidebar leaves a 744 content column (Top Bar compressed, desktop grids squeezed)                        |
| Sidebar from 75rem (1200)                 | Content 920; the search still drops below 440. **Fallback** if validation favours it (needs a revision of this ADR) |
| Height-based queries for landscape phones | Extra complexity; the Rail's internal scrolling covers it                                                           |

## Validation (required during Phase 05 implementation)

The rendered shell must pass all of the following, and the results are recorded in the Phase 05
report.

- **Widths:** 320, 390, **719 / 720**, 768, 1024, **1279 / 1280**, 1440. The bold pairs are the
  regression tests on both transition boundaries.
- **Directions:** RTL and LTR.
- **Zoom:** **200% and 400%** (emulated by the CSS viewport width).
- **Larger font settings:** root font size 20 px (125%) and 24 px (150%).
- **Short heights:** 1280 × 600, 1024 × 600, 844 × 390.
- **Safe areas:** mobile insets applied (simulated insets).

Each case checks:

- no horizontal overflow;
- the Top Bar fits in one row;
- no nav label or control is clipped;
- every destination is reachable (by scrolling inside the Sidebar or Rail where needed);
- the main content scrolls independently of the sticky navigation.

**If any threshold fails**, Phase 05 stops for a documented revision of this ADR (new evidence,
new value, user approval) before the code changes.

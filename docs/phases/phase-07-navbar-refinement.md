# Phase 07 — Compact Landing navbar (owner visual refinement, 2026-11-21)

Status: **IN REVIEW** (branch `feat/phase-07-compact-navbar`). A narrowly scoped visual refinement
of the Landing header; nothing else on the page changes. The decision is to be added to the
Phase 07 owner-decision table (plan §2) once PR #61, which edits the same table, is merged.

## 1. Owner request

Turn the large, outlined Desktop navbar into a compact, premium top bar. The visual reference is a
third-party product's navbar, used for proportions and density only (no branding, content or
assets taken). Keep the MUNSIT logo unchanged, the four links and their destinations, the login
destination and the language switching.

## 2. Implementation

| Item                     | Before (Figma `27:2`)                           | After                                                                               |
| ------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| Desktop bar              | y 18; 1361 wide (viewport − 78); 67 high        | y 16; 32 from each edge (1376 at 1440); **58 high**                                 |
| Radius, border, fill     | 16; 1px `#363739`; Ink 20%, blur 48             | **14**; the same thin border, fill and blur                                         |
| Row                      | gap 39; padding 8 / start 12                    | gap 24; padding inline 10                                                           |
| Logo (unchanged artwork) | 49 high                                         | **30 high**, vertically centred with the links                                      |
| Links                    | `UI/Navigation` 20 / 400, gap 63                | **14 / 500** (line height 1.4), gap 32                                              |
| Login                    | 145 × 46, Mist 1px outline, radius 17, 20 / 500 | **solid white**, Ink label, 36 high, radius 10, 14 / 500, padding 14; Mist on hover |
| Language (EN / AR)       | 38 × 45, Mist outline, radius 10                | **solid white**, Ink label, 36 high (at least 38 wide), radius 10; Mist on hover    |
| Focus                    | Landing focus ring                              | unchanged (2 px Electric Sky outline, offset 2)                                     |

- **Tablet (720–1279):** the bar keeps its 78 height, menu and 39-high logo. The login and language
  controls use the same solid white style (36 high).
- **Mobile (< 720):** unchanged. The bar shows the logo and menu only. The menu sheet keeps its
  outlined login and language buttons (`variant="outline"`, the default), so the approved Mobile
  navigation is not redesigned.
- **Behaviour:** destinations, language switching (RTL / LTR), keyboard order and accessible
  names are unchanged. The values are Landing-local component constants (sizes, radius); colours
  use the existing tokens (Text/Primary white, Surface Ink, Neutral Mist).

Files: `src/features/landing/components/LandingHeader.tsx`, `LandingActions.tsx` (a `variant`
prop: `solid` for the bars, `outline` for the menu sheet); `tests/e2e/landing.spec.ts`.

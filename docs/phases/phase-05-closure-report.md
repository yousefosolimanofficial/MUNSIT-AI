# Phase 05 — Shared App Shell — Closure Report

- **Status:** **CLOSED** (2026-11-17). The product owner approved the closure on 2026-11-17, and
  this report was merged through the documentation-only closure PR #36. **Risks R-2 and R-3 stay
  OPEN** (§12).
- **Final code on `main`:** `6c47e35` (PR #35, rebase merge); post-merge CI green.
- **Plan:** [phase-05-plan.md](phase-05-plan.md), decisions D-S1 to D-S14 (all Approved);
  [ADR-004](../decisions/ADR-004-shell-breakpoints.md) (Approved, validated, §5);
  [O-8 contract](phase-05-navigation-icon-button-contract.md).
- **Risk R-2** stays **OPEN** (§12). Cross-browser verification is tracked separately (R-3).

## 1. Phase objectives

The shared app shell is built **once**, fed only by the Phase 04 navigation registry. Module
phases render content inside it (Roadmap Phase 05 DoD). It comprises:

- the Desktop Sidebar;
- the Tablet Rail and drawer;
- the Desktop/Tablet Top Bar;
- the Mobile Top Bar, bottom navigation and More sheet.

Each part uses `aria-current="page"`, the skip link and safe-area insets. The shell is absent
from the `(focus)`, `(auth)` and Landing routes.

## 2. Delivered components (`src/shared/layout/` unless stated)

| Component                                                                                                                       | Role                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/ui/NavigationIconButton.tsx` (O-8)                                                                                  | Icon-only link/button used by the Rail and Top Bars                                                                                                                                                            |
| `AppShell.tsx`, `AppShellView.tsx`, `shell-labels.ts`, `shell-model.ts`                                                         | Layout of the `(app)` group: skip link, inline-start navigation, content column, one `main#main-content`. Labels are resolved on the server                                                                    |
| `src/shared/a11y/SkipLink.tsx`                                                                                                  | First Tab stop; moves focus to `main`                                                                                                                                                                          |
| `Sidebar.tsx`, `SidebarItem.tsx`, `UpgradeCard.tsx`                                                                             | Desktop (≥ 80rem): 232, sticky full height, internal scroll, upgrade card pinned to the bottom                                                                                                                 |
| `TabletRail.tsx`, `TabletDrawer.tsx`                                                                                            | Tablet (45–80rem): 72 Rail; the drawer is a modal dialog with scrim, Esc and destination close, focus trap and return; it closes when the viewport leaves the Rail range                                       |
| `TopBar.tsx`, `MobileTopBar.tsx`                                                                                                | Desktop/Tablet Top Bar (56, scrolls with the page); fixed Mobile Top Bar (72 + inset, blur 16)                                                                                                                 |
| `SearchTrigger.tsx`, `NotificationsTrigger.tsx`, `ThemeMenu.tsx`, `LanguageSwitch.tsx`, `UserMenu.tsx`, `use-same-page-href.ts` | Top Bar controls. Search and notifications show availability messages (D-S4, D-S5); Dark is the only theme (D-S3); the language switch keeps page, params and query; the user menu opens Settings (D-S6, D-S9) |
| `MobileNavItem.tsx` (**Mariam**)                                                                                                | One bottom-bar item: a destination link or the More button                                                                                                                                                     |
| `BottomNav.tsx`                                                                                                                 | Mobile (< 45rem): four items from the registry, indicator from `mobileBarIndicator`; opens the More sheet                                                                                                      |
| `MoreSheet.tsx`                                                                                                                 | Phase 03 `Sheet` with the five More destinations, account settings, the language row (D-S10) and the upgrade row                                                                                               |

**Removed:** the Phase 04 `ActiveDestinationProbe`. E2E now reads the real `aria-current`
(§8).

## 3. Merged pull requests

| PR  | Content                                                                    | Merge on `main`               | CI                                              |
| --- | -------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------- |
| #29 | Phase 05 plan, O-8 contract, ADR-004                                       | `d226a84`                     | Green                                           |
| #30 | O-8 Navigation Icon Button                                                 | `0404c6e` (squash)            | Green, PR and `main`                            |
| #31 | Increment 1: AppShell, skip link, Sidebar, Rail, drawer, `rail` breakpoint | `330348e` (squash)            | Green, PR and `main`                            |
| #32 | Increment 2: Top Bars and controls                                         | `9abe1c0` (squash)            | Green, PR and `main`                            |
| #33 | More sheet with mobile language access                                     | `d57a809` (squash)            | Green, PR and `main`                            |
| #34 | Docs: `MobileNavItem` starter delivery recorded                            | `cf25da0` (squash)            | Green, PR and `main`                            |
| #35 | Mariam's `MobileNavItem` delivery and `BottomNav` integration              | `d364d58`, `6c47e35` (rebase) | Green on head `0004d73` and on `main` `6c47e35` |

## 4. Figma fidelity (file `Avyn9kL0drXepQyTXTLXXb`, read-only)

Values are checked as computed styles in Chromium E2E (sizes, radii, paddings, colour tints
composited and measured, blur, borders).

| Part                   | Figma                              | Result                                                                                       |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Sidebar, item, card    | `2211:81`, `2210:118`, `2211:158`  | Matched (232 wide; item geometry and states; card gradient contrast ≥ 4.5:1)                 |
| Rail and drawer        | `2224:379`, `2242:1272`            | Matched (72 Rail, O-8 `md` controls; drawer panel 232)                                       |
| Top Bars               | `2211:170`, `2224:399`, `2238:923` | Matched (desktop/tablet 56; mobile 72 + inset, Void 88%, blur 16)                            |
| More sheet             | `2236:972`                         | Matched (rows 56, radius 14, Sky tints, upgrade row)                                         |
| Mobile Navigation Item | `2210:302`                         | Matched (76 × 60, radius 14, padding 8, gap 4, icon 22, Active Sky 12%)                      |
| Bottom navigation      | `2238:1187` in `2238:741`          | Matched at 390 (84, Ink 94%, Sky 12% top border, blur 16, padding 8/16/16/16, space-between) |

**Approved deviations or additions (not in Figma):**

- **D-S1:** Settings never lights More.
- **D-S10:** the More-sheet language row.
- **D-S11:** visually hidden name parts (WCAG 2.5.3).
- **D-S13:** the 320 px bar padding.
- **No current-row visual** in the More sheet: Figma has none, so the current row is marked by
  semantics only.

**Reference screenshots** (production build of `main` `6c47e35`, Chromium) are in
[phase-05-screenshots/](phase-05-screenshots/), at 1440, 768 (with the drawer open), 390 (with
the More sheet open) and 320, in `ar` and `en`.

## 5. Responsive implementation (ADR-004)

- **Breakpoints:**

  | Shell   | Range             | Tailwind breakpoint |
  | ------- | ----------------- | ------------------- |
  | Mobile  | below 45rem       | base styles         |
  | Rail    | 45rem up to 80rem | `rail:`             |
  | Sidebar | from 80rem        | `xl:`               |

  They are in rem, so a larger browser font moves them proportionally.

- **No fixed artboard heights:**
  - the Sidebar and Rail are sticky at `h-dvh` with internal scrolling;
  - mobile content runs from 88 + top inset to 108 + bottom inset;
  - the document scroll padding keeps focus clear of both fixed bars on mobile.
- **320 px (D-S13):** the bar's inline padding is `min(16px, (100% − 304px) / 2)`. It is 16
  (Figma) from 336 px up and 8 at 320, as a continuous value, not a breakpoint. Items never
  shrink.
- **Validation matrix (ADR-004 §Validation), all passing in `ar` and `en`** (Chromium,
  `tests/e2e/bottom-nav.spec.ts` and `shell.spec.ts`):

  | Case                                  | Result                                                                              |
  | ------------------------------------- | ----------------------------------------------------------------------------------- |
  | 320 · 390 · 719                       | Mobile                                                                              |
  | 720 · 768 · 1024 · 1279               | Rail                                                                                |
  | 1280 · 1440                           | Sidebar                                                                             |
  | Zoom 200% (1440 → 720)                | Rail                                                                                |
  | Zoom 400% (1440 → 360, 1280 → 320)    | Mobile                                                                              |
  | Root font 20 px                       | 768 → mobile, 1024 → Rail, 1440 → Rail                                              |
  | Root font 24 px                       | 1024 → mobile, 1440 → Rail, 1920 → Sidebar                                          |
  | Short heights                         | 1280 × 600 Sidebar, 1024 × 600 Rail, 844 × 390 Rail, 700 × 390 and 390 × 500 mobile |
  | Safe areas (simulated insets 47 / 34) | Bar 118, content padding 135 / 142, scroll padding 119 / 118                        |

  Each case checks:
  - no horizontal overflow;
  - the Top Bar on one row;
  - no clipped item;
  - every destination reachable.

  **No threshold failed, so ADR-004 needs no revision.**

- **1920 px at the default font size** (Roadmap responsive method) is not part of the automated
  matrix. It was checked ad hoc on the production build of `main` `6c47e35`, in `ar` and `en`:
  - the Sidebar is shown, and the Rail and bottom bar are hidden;
  - the Top Bar is 56 high;
  - there is no horizontal overflow;
  - the Dashboard link is current.
- **Direction:** the shell is on the inline start (right in RTL, left in LTR), and the logo is
  never mirrored.
- **Emulation:** the larger root fonts (Chromium default font size) and the safe-area insets
  were emulated through CDP, not on real devices.

## 6. Accessibility (WCAG 2.2 AA target)

- **Landmarks:**
  - one `main`;
  - named navigation landmarks: "التنقل الرئيسي" and "التنقل السفلي";
  - a skip link that is the first Tab stop and visible on focus.
- **Current page:**
  - `aria-current="page"` only on the current destination;
  - none on Settings (D-R6, D-S1);
  - More is never `aria-current`, and only shows the Active look for its five destinations.
- **Overlays:**
  - the drawer and the More sheet are native modal dialogs with a focus trap;
  - Esc, scrim and destination selection close them;
  - focus returns to the opener;
  - the scroll lock is released;
  - they close when the viewport leaves their range.
- **Keyboard:** full traversal, Enter and Space on More, and the Top Bar menus' arrow keys.
- **Focus not obscured (2.4.11):** checked over 40 Tab and Shift+Tab stops at 390.
- **Label in name (2.5.3):** D-S11.
- **Reduced motion:** the drawer and sheet fade only, and the bar has no motion.
- **axe (wcag2a/aa, 21a/aa, 22aa):** zero violations:
  - on the shell at every breakpoint;
  - with the drawer and the sheet open;
  - on bar, More and Settings routes;
  - in `ar` and `en`.

  jest-axe passes for every part.

## 7. Unit tests

`corepack pnpm check` on `main` `6c47e35` passes all of typecheck, ESLint, dependency-cruiser
(168 modules, 490 dependencies, no violations), Prettier, Vitest and build.

| Point           | Unit tests               |
| --------------- | ------------------------ |
| End of Phase 04 | 907                      |
| After PR #33    | 989                      |
| End of Phase 05 | **1020/1020** (29 files) |

The final count includes 18 `MobileNavItem` tests (Mariam), 73 shell tests and the registry and
resolver tests.

## 8. E2E tests (Playwright, Chromium)

The final run is **637/637**.

| Point           | E2E tests                                  |
| --------------- | ------------------------------------------ |
| End of Phase 04 | 382                                        |
| Before PR #35   | 545                                        |
| End of Phase 05 | **637** (92 added in `bottom-nav.spec.ts`) |

Specs:

- **`shell.spec.ts`:** Sidebar, Rail, drawer and thresholds.
- **`top-bars.spec.ts`:** the Top Bars.
- **`more-sheet.spec.ts`:** the More sheet.
- **`bottom-nav.spec.ts`:** the bar, the More wiring and the ADR-004 matrix.
- **`routing.spec.ts`:** now asserts the real active link.

The shared console guard fails on any hydration warning or console error.

## 9. CI results

The `check` job was green on every Phase 05 PR head and after every merge on `main`. Last run:
`main` `6c47e35`, success.

## 10. Mariam's contribution

- **Delegated work (D-S12):** `MobileNavItem.tsx` and `MobileNavItem.test.tsx`, built offline
  from starter v5 (baseline `9abe1c0`).
- **Delivered:** 2026-11-17 (`munsit-delivery-mobile-nav-item-20261117-v1.zip`).
- **Review:**
  - two files only;
  - frozen API;
  - no dependencies;
  - tokens reused;
  - D-R6 semantics kept.
- **Her three additions, accepted:**
  - `"aria-current"?: never`, which makes `aria-current` on More a type error;
  - `whitespace-nowrap`, which keeps English labels on one line;
  - `cursor-pointer`.
- **Integrated without source changes** through PR #35 on 2026-11-17: both files are
  byte-identical to her delivery. Her delivery is its own commit, `d364d58`.
- **Authorship, stated accurately:** Mariam wrote the code. The Git author of the commit is
  Yousef, the integrator: Mariam has no repository access, and earlier deliveries were committed
  the same way. The commit message names the delivery.
- **Status:** **ACCEPTED / INTEGRATED.**
- **Her 320 px finding** (304 > 288) led to D-S13.

## 11. Approved decisions

| ID    | Decision                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------ |
| D-S1  | D-R6 kept: Settings has no destination and never lights More; More may show "contains active" visually |
| D-S2  | Sticky Sidebar and Rail with internal scrolling; independent main scroll                               |
| D-S3  | Dark only; Light and System shown as "coming soon"                                                     |
| D-S4  | Search: trigger and availability message only                                                          |
| D-S5  | Notifications: trigger and availability message only                                                   |
| D-S6  | User menu uses existing routes only; no logout                                                         |
| D-S7  | All upgrade entries → `/settings/subscription`; no billing                                             |
| D-S8  | Drawer motion, scrim, Esc, destination close, focus return, scroll lock, focus trap                    |
| D-S9  | User menu "الإعدادات" → `/settings`                                                                    |
| D-S10 | Mobile language access in the More sheet; no mobile theme control                                      |
| D-S11 | WCAG 2.5.3 names (search, language links)                                                              |
| D-S12 | `MobileNavItem` delegated to Mariam (two files)                                                        |
| D-S13 | 320 px bottom-bar padding, continuous, no breakpoint (approved 2026-11-17)                             |
| D-S14 | `devIndicators: false` (approved 2026-11-17)                                                           |

ADR-004, O-8 (D-NIB1 to D-NIB6) and all shell copy (§14 of the plan) are approved.

**D-S14 verification (2026-11-17):**

- **Dev overlay:** in `next dev`, no overlay element is visible on a normal page, and More
  receives the click.
- **Runtime errors:** a thrown error still raises the Next.js issue badge and overlay.
- **Build diagnostics:** `next build` output is unchanged.
- **Production:** `next start` HTML contains no dev portal, and dev-only routes return 404.

## 12. Remaining risks

| ID  | Risk                                                                                                                      | Status                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| R-2 | Blank first HTML for HTTP 404 without JavaScript (Next.js 16.4.6 `notFound()` under `[locale]`)                           | **OPEN**: development-stage acceptance only; resolve or re-accept before production (Phase 22 at the latest). Unrelated to browser coverage |
| R-3 | Cross-browser coverage: every Phase 05 check ran in **Chromium only**. Firefox, Safari (WebKit) and Edge are not verified | **OPEN**: a pre-production QA requirement (D-12: latest two majors), planned for Phase 22                                                   |
| QA  | Backdrop blur 16 performance on low-end phones (plan §19)                                                                 | Not measured; the Figma value is kept until a problem is measured                                                                           |
| QA  | No real-device or screen-reader pass (VoiceOver, TalkBack, NVDA)                                                          | Open; DOM, axe and unit checks only                                                                                                         |

## 13. Deferred work (unchanged, nothing invented)

- **Search:** results and backend (D-17).
- **Notifications:** notification center and unread state (D-17).
- **Authentication:** logout and user data (D-02).
- **Payments and plan limits:** D-18.
- **Themes:** Light and System, with a stored preference (D-16).
- **Tooltip primitive:** O-6.
- **Overlay content:** Notifications and User Menu content in Phase 06 and 09.
- **Settings secondary navigation UI:** Phase 20.
- **Earlier deferrals:** Tutor route (D-08) and quiz results/review (D-09).
- **Temporary dev routes:** `/dev/components` (including the More sheet sample) and
  `/dev/error-test` are removed before Phase 22.

## 14. Handoff readiness for Phase 06

- **The shell is complete and stable.** Module and Phase 06 work render inside `main#main-content`
  without touching navigation.
- **Mobile content area:** it already reserves the bottom-bar space (108 + inset). Overlays from
  Phase 06 can rely on the Phase 03 `Dialog` and `Sheet`, which share one scroll lock and focus
  stack with the drawer and the More sheet.
- **Trigger points for Phase 06 shells:** the notifications popover and the user menu (D-S5,
  D-S6).
- **Open blockers:** none. R-2 and R-3 are pre-production gates, not Phase 06 blockers.
- **Phase 06 has not started.**

## 15. Acceptance (Roadmap Phase 05)

| #   | Criterion                                                                                                         | Result                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Same registry in all five navigation shells                                                                       | **PASS**: Sidebar, Rail, drawer, bottom nav and More sheet read `DESTINATIONS` (Phase 04), with no copies |
| 2   | Breakpoints chosen by content space, recorded in an ADR, not artboard widths                                      | **PASS**: ADR-004, with the matrix passed (§5)                                                            |
| 3   | Sidebar sticky to viewport height with the upgrade card visible                                                   | **PASS** (D-S2; short-height tests)                                                                       |
| 4   | No fixed artboard heights                                                                                         | **PASS**                                                                                                  |
| 5   | More shows active for destinations inside it                                                                      | **PASS**: visual only, never `aria-current`; Settings excluded                                            |
| 6   | RTL right, LTR left, logo never flipped                                                                           | **PASS**                                                                                                  |
| 7   | 320 px without horizontal overflow                                                                                | **PASS** (D-S13)                                                                                          |
| 8   | Tests: component tests per part; Playwright 1440/768/390 navigation, drawer, More-sheet focus trap, axe, keyboard | **PASS**                                                                                                  |
| DoD | Shell implemented once; modules only render content; screenshots at the three reference widths                    | **PASS**                                                                                                  |
| —   | No shell on `(focus)`, `(auth)` and Landing; no temporary probe                                                   | **PASS**                                                                                                  |

**Result:** Phase 05 met its acceptance criteria and is **CLOSED** (product owner, 2026-11-17).
R-2, R-3 and the pre-production QA requirements in §12 are carried forward open.

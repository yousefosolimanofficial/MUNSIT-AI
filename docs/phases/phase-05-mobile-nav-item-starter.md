# Phase 05 — `MobileNavItem` starter package (proposal)

**Status:** PROPOSED. Waiting for product-owner approval. **Nothing is assigned yet.** There is no
branch, no starter archive and no delivery for Mariam until Yousef approves this document.

- **Source:** Phase 05 plan §21.1 (approved in principle) and Figma, re-checked read-only on 2026-11-17.
- **Procedure:** [TEAM_COLLABORATION.md](../TEAM_COLLABORATION.md) and
  [FEATURE_DELIVERY_CHECKLIST.md](../FEATURE_DELIVERY_CHECKLIST.md).

## 1. Scope

| Item                 | Value                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Component            | `MobileNavItem`: one item of the mobile bottom navigation                                                                               |
| Delegated files      | **Only** `src/shared/layout/MobileNavItem.tsx` and `src/shared/layout/MobileNavItem.test.tsx`                                           |
| Not delegated        | `BottomNav`, the More sheet, the registry, messages, routes, tokens, any other file. Write any other need as a request in `DELIVERY.md` |
| Claude               | Does not create or edit the two delegated files while they are delegated. Builds `BottomNav` **after** the delivery is integrated       |
| Dependencies         | None new. Never install packages                                                                                                        |
| Baseline (to record) | The `main` commit the starter is built from, once this proposal is approved. It goes in `DELIVERY.md`                                   |

**Start conditions (all must hold when the starter is built):**

- O-8 is merged. Done: PR #30, `0404c6e`.
- The Phase 04 registry contract (`DESTINATIONS`, `MORE_CONTROL`, `mobileBarIndicator`) is
  unchanged.
- This API is frozen by the approval.
- The starter is built with `git archive` from a pushed, verified `main` commit and logged in
  `TEAM_COLLABORATION.md`.

## 2. Approved API (frozen on approval)

```tsx
import type { IconName } from "@/design-system/icons/manifest";
import type { RoutePath } from "@/i18n/routes";

export type MobileNavItemProps =
  | { kind: "destination"; icon: IconName; label: string; href: RoutePath; active: boolean }
  | {
      kind: "more";
      icon: "more";
      label: string;
      onOpen: () => void;
      expanded: boolean;
      containsActive: boolean;
    };

export function MobileNavItem(props: MobileNavItemProps): JSX.Element;
```

- **`destination`** renders the locale-aware next-intl `Link` (`@/i18n/navigation`), with
  `aria-current="page"` only when `active`.
- **`more`** renders a `<button type="button">` with `aria-haspopup="dialog"` and
  `aria-expanded={expanded}`. It **never** has `aria-current`, because More is not a destination
  (D-R6). `containsActive` only switches the Active **visual**. `BottomNav` sets it from
  `mobileBarIndicator()`, so it is lit only for the five More-sheet destinations and not for
  Settings (D-S1).
- **Practical href type:** bottom-bar destinations are static roots, so `href` takes the same
  `DestinationPath` the Sidebar uses (`src/shared/layout/shell-model.ts`), not dynamic templates.
  This is a type-level narrowing of `RoutePath`; it is recorded here so the API is unambiguous.
- No `children`, `className`, `role`, `tabIndex`, `variant` or `size` props. Mixing the two kinds
  is a type error.

## 3. Figma references (read-only)

| Node                                | Use                                                                  |
| ----------------------------------- | -------------------------------------------------------------------- |
| `Mobile Navigation Item` `2210:302` | Component set: `State=Default` `2210:290`, `State=Active` `2210:296` |
| Dashboard Mobile `2238:741`         | `Bottom Navigation` `2238:1187`: four items, Active = الرئيسية       |
| More Menu Sheet `2236:972`          | Context only: what More opens. Not part of this task                 |

## 4. Exact states (FIGMA, verified 2026-11-17)

| Property | Default (`2210:290`)                                    | Active (`2210:296`)                 |
| -------- | ------------------------------------------------------- | ----------------------------------- |
| Box      | 76 × 60, radius 14, padding 8, vertical, gap 4, centred | same                                |
| Fill     | none                                                    | Electric Sky 12%                    |
| Border   | none                                                    | none                                |
| Icon     | 22, Text/Secondary `#9c9c9d`                            | 22, Electric Sky `#63a1ff`          |
| Label    | Cairo Regular 12 / 18, Text/Secondary                   | Cairo Regular 12 / 18, Electric Sky |

- **Hover and pressed:** not designed. Add none. No hover means no fine-pointer hover rule is
  needed.
- **Focus:** the D-B2 ring (2px solid Electric Sky, offset 2), keyboard only (`focus-visible`).
- **Motion:** colour transitions only, `duration-base ease-standard`. No transform.

## 5. Design tokens and local constants

| Need            | Use                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Colours         | `text-text-secondary`, `text-accent-electric-sky`, `bg-accent-electric-sky/12`                   |
| Gap 4           | `gap-xs` (token)                                                                                 |
| Label type      | `text-dashboard-caption` (12/18/400)                                                             |
| Icon            | `<Icon name={icon} size={22} />` (`ICON_SIZES.mobileNav`)                                        |
| Local constants | `w-[76px] h-[60px] rounded-[14px] p-[8px]`: component sizes, not tokens (CLAUDE.md design rules) |
| Focus ring      | The D-B2 classes, copied from `Button.tsx`                                                       |

No new tokens and no literal hex values.

## 6. Accessibility

- The visible label is the accessible name; the icon is `aria-hidden`.
- **Target:** 76 × 60 (above 24 × 24; WCAG 2.5.8).
- **Destination:** `aria-current="page"` only when active; never on More.
- **More:** a real `<button>` with `aria-haspopup="dialog"` and `aria-expanded`. Enter and Space
  activate it.
- **Colour is never the only signal:** Active pairs with `aria-current` (destination). More's lit
  state is visual only, by decision D-S1/D-R6, and the sheet's own `aria-current` row carries the
  semantics.
- **RTL and LTR:** identical layout (vertical stack), no physical `left`/`right`, the icon is not
  mirrored.
- Rendered contrast is measured at integration (Chromium).

## 7. Test requirements (`MobileNavItem.test.tsx`)

- **Setup:** jsdom, Testing Library, `NextIntlClientProvider` in `ar` and `en`, the same as
  `src/shared/ui/NavigationIconButton.test.tsx`.
- **Link vs button:** a destination renders `<a>` with the locale href (`/dashboard`,
  `/en/dashboard`); More renders `<button type="button">`.
- **`aria-current`:** present only on an active destination; never on More, even when
  `containsActive` is true.
- **More:** `aria-haspopup="dialog"`, `aria-expanded` passes through, and `onOpen` is called on
  click, Enter and Space.
- **Classes per state:**
  - Default: `text-text-secondary`, no fill.
  - Active destination, or More with `containsActive`: `bg-accent-electric-sky/12
text-accent-electric-sky`.
  - Box: `w-[76px] h-[60px] rounded-[14px] p-[8px] gap-xs`.
- **Icon:** 22, `aria-hidden`; label text rendered.
- **Compile-time API:** `@ts-expect-error` for mixing kinds, `aria-current` on More, a missing
  `label`, `children`, and an unknown icon.
- **jest-axe:** no violations in RTL and LTR (`color-contrast` off in jsdom), asserted as
  `expect((await axe(container, AXE_OPTIONS)).violations).toEqual([])`.
- **Gate:** `corepack pnpm check` passes on the starter.

## 8. Integration steps (Yousef, per TEAM_COLLABORATION.md)

1. Create `delivery/shell-mobile-nav-item-v1` from the recorded baseline commit.
2. Apply only the two files, from the patch or the manifest. Never unzip over the project root.
3. Check that `git status` lists exactly the two files.
4. Commit the delivery on its own; integration fixes go in separate commits.
5. Rebase onto `main`, then run `typecheck`, `lint`, `format:check`, `test` and `build`.
6. Open a PR, wait for CI to be green, and merge.
7. Claude then builds `BottomNav`, which consumes `MobileNavItem` without changing it, plus the
   E2E checks (390 and 320 in RTL and LTR, computed Figma values, contrast).

## 9. Definition of Done

- The two files are merged through a PR, with CI green.
- `pnpm check` passes.
- Every test in §7 is present and passing.
- `BottomNav` consumes the component unchanged.
- Screenshots at 390 and 320 in RTL and LTR are captured at integration.
- No other file was changed by the delivery.

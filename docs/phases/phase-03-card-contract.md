# Component contract — Card surfaces (Phase 03, Mariam delivery 3)

- **Status:** **Final draft — awaiting the user's approval** (2026-11-15). D-C1, D-C2, D-C4
  approved; D-C3 and D-C5 approved with conditions, now met (§12). Mariam starts only after this
  contract is approved, merged, and she has received the new starter (§10).
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read read-only via the Figma MCP on 2026-11-15 on
  Desktop, Tablet and Mobile. Every value labelled FIGMA was read from the node itself. Figma is
  not modified. There is **no Card component set** in Figma (a design-system search for "card"
  returns none): the surfaces are frames repeated across screens.
- **Implementer:** Mariam. **Reviewer and integrator:** Yousef.
- **Delivery name:** `munsit-delivery-shared-ui-card-<YYYYMMDD>-v1.zip`
- **Reference implementation:** `src/shared/ui/Button.tsx` and `src/shared/ui/Input.tsx` (class
  style, named local constants). Do not change them.

## 1. Source (FIGMA, all three breakpoints)

Frames: Dashboard Desktop `2211:74`, Tablet `2224:372`, Mobile `2238:741`; Settings Edit Profile
Desktop `2463:3109`, Tablet `2463:3548`, Mobile `2463:3954`.

| Surface              | Desktop     | Tablet      | Mobile      | Fill             | Border (1px, inside) | Radius | Padding | Gap between children                |
| -------------------- | ----------- | ----------- | ----------- | ---------------- | -------------------- | ------ | ------- | ----------------------------------- |
| Recent Activity Card | `2220:368`  | `2224:563`  | `2238:893`  | Obsidian 88%     | Electric Sky 14%     | 20     | 20      | 16                                  |
| Recent Lectures Card | `2482:1488` | `2482:1526` | `2482:1564` | Obsidian 88%     | Electric Sky 14%     | 20     | 16      | 10                                  |
| Settings Group       | `2463:3514` | `2463:3924` | `2463:4261` | Obsidian **90%** | Electric Sky **12%** | 20     | 20      | 14                                  |
| Recent Lecture Row   | `2482:1489` | `2482:1527` | `2482:1565` | White 3%         | Electric Sky 12%     | 14     | 12 / 16 | 16 inline; **10 stacked on Mobile** |

- **Desktop = Tablet = Mobile** for fill, border, radius and padding of every surface above. The
  only responsive change is inside the Recent Lecture Row on Mobile: its content stacks into two
  rows (gap 10) instead of one inline row (gap 16). That is the caller's content layout, not the
  surface.
- **Settings Group, all 43 instances** across the six Settings screens and three breakpoints:
  padding 20 and radius 20 everywhere; gap 14 in 42 of them. The exception is Mobile Profile
  Overview `2463:3044` (gap 8), which holds interactive shortcut links (§12, open item Q-1).
- Other Dashboard cards with the same geometry (content inset 21 = 1 border + 20): Performance
  Chart, Needs Attention, Upcoming Goals, on all three breakpoints (metadata geometry).
- Titles inside cards differ by screen (`Dashboard/Title M` on the Dashboard, `Dashboard/Card
Title` in Settings), so the title is **not** part of Card.
- Statistic Card `2210:187` (design-values §1.2: radius 18, hover lift) is **not** a Card variant
  (D-C4).

## 2. Variants and values (final, per D-C1 to D-C5)

| Variant   | Use                                               | Fill                                  | Border                                 | Radius                   | Padding                             |
| --------- | ------------------------------------------------- | ------------------------------------- | -------------------------------------- | ------------------------ | ----------------------------------- |
| `surface` | Dashboard content cards, Settings Group (default) | `bg-surface-obsidian/88`              | `border border-accent-electric-sky/14` | `rounded-xl` (20)        | `p-lg` (20, default) or `p-md` (16) |
| `inset`   | A row or block nested inside a `surface` card     | `bg-text-primary/3` (White = #ffffff) | `border border-accent-electric-sky/12` | `rounded-[14px]` (local) | `py-sm px-md` (12 / 16), fixed      |

- **Tokens used (all existing, none added):** colors `surface-obsidian`, `accent-electric-sky`,
  `text-primary`; spacing `sm` 12, `md` 16, `lg` 20; radius `xl` 20.
- **Local component constants (not tokens, per CLAUDE.md):** the opacity modifiers 88 / 14 / 12 /
  3, and radius 14. White has no token of its own; `text-primary` is `#ffffff` and is the only
  token-backed white.
- **Intentional deviations (approved):** the Settings Group is drawn with Obsidian **90%** and Sky
  **12%**; Card uses **88%** (D-C1) and **14%** (D-C2) on every `surface`. Rendered difference:
  `#101113` → `#0f1012` fill, border 1.26 → 1.31:1 on Void Black. Recorded in design-values §8.
- Card sets **no internal layout** (no flex, grid or gap). The gaps in §1 (16, 14, 10) are the
  caller's, through `className`; Card fills its container width.

## 3. Typography

None. Card renders no text. Callers use the existing `text-dashboard-*` utilities.

## 4. States

Static only (D-C4): no hover, pressed, focus, disabled, shadow, transition or animation. A
clickable card (for example the Settings shortcut links, Q-1) is decided with the component that
needs it.

## 5. Behavior

- Server Component, no `"use client"`, no state, no effects.
- Renders `div` by default; `as` allows only `section`, `article` or `li` (D-C5). Card adds no
  ARIA role and no label: semantics come from the element and the caller's heading
  (`aria-labelledby` passes through).
- Native attributes of the chosen element pass through, typed per element (§9). `className` is
  merged last, for layout only (margin, width, grid placement, `flex`/`grid`/`gap` inside), never
  color, radius, border or padding.

## 6. RTL / LTR

Direction-neutral: symmetric padding, no physical sides, logical utilities only. Content follows
the document direction.

## 7. Accessibility (WCAG 2.2 AA)

Contrast (WCAG arithmetic from token values, 2026-11-15). Surfaces composited over Void Black:
`surface` = `#0f1012`, `inset` (White 3% over `surface`) = `#161719`.

| Text color            | `surface` | `inset` | Result                                         |
| --------------------- | --------- | ------- | ---------------------------------------------- |
| Text / Primary        | 19.04     | 17.94   | AA                                             |
| Text / Secondary      | 6.94      | 6.54    | AA                                             |
| Text / Muted Readable | 5.75      | 5.41    | AA                                             |
| Electric Sky          | 7.32      | 6.90    | AA                                             |
| Coral Pulse           | 6.54      | 6.16    | AA                                             |
| Success Green         | 10.25     | 9.65    | AA                                             |
| Text / Muted          | 3.56      | 3.36    | **Fails for text**: not used for text on cards |

- **Boundary:** Sky 14% is 1.31:1 on Void Black and 1.22:1 against the fill; the fill is 1.07:1
  against Void. WCAG 1.4.11 covers UI components and meaningful graphics, not a static grouping
  container, so a non-interactive Card is exempt. An interactive card would need at least 3:1 or
  another visible cue (D-C4, Q-1).
- Rendered values are re-checked in Chromium at integration, as for Button and Input.

## 8. Motion

None.

## 9. Component API (type-safe per element)

```tsx
// src/shared/ui/Card.tsx — Server Component
import type { ComponentPropsWithRef, ReactNode } from "react";

type CardElement = "div" | "section" | "article" | "li";

/** `padding` exists only on `surface`; `inset` has fixed padding. */
type CardVariantProps =
  { variant?: "surface"; padding?: "lg" | "md" } | { variant: "inset"; padding?: never };

export type CardProps<E extends CardElement = "div"> = CardVariantProps & {
  /** Rendered element (D-C5). Default "div". */
  as?: E;
  /** Layout only, merged last. Never color, radius, border or padding. */
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithRef<E>, "as" | "className" | "children">;

export function Card<E extends CardElement = "div">(props: CardProps<E>): ReactNode;
```

- `ComponentPropsWithRef<E>` keeps each element's own attributes and ref type: `li` accepts
  `value` and an `HTMLLIElement` ref; `div` rejects `value`; `section`/`article` accept the global
  attributes. React 19 passes `ref` as a prop, so no `forwardRef`.
- Rejected at compile time: any other `as` (`"button"`, `"a"`, …), `padding` with `variant="inset"`,
  and unknown variants or paddings.
- No title, header, footer, media, `interactive`, `href` or `onClick`-specific props.

## 10. Delegation and instructions for Mariam

**Delegated files (only these two):** `src/shared/ui/Card.tsx`, `src/shared/ui/Card.test.tsx`.

Same rules as the Input delivery: no other file is edited (no `Button.tsx`, `Input.tsx`,
design-system, `src/app`, messages, config, `package.json` or lockfile), no packages are
installed, and any other need goes in the requests table of `DELIVERY.md`.

**Steps:** unzip the new starter (built from `main` after this contract is merged) into an empty
folder; `corepack pnpm install --frozen-lockfile`; `corepack pnpm check` must pass before any
change; implement §2–§9 with full class strings, named constants and no hex values; write the
tests in §11; deliver `files/`, `DELIVERY.md` (full baseline hash, real check results, known
issues), `screenshots/` and `evidence/` per
[FEATURE_DELIVERY_CHECKLIST.md](../FEATURE_DELIVERY_CHECKLIST.md). A local-only preview page is
allowed and deleted before packaging.

## 11. Required tests

**Component (`Card.test.tsx`, Vitest + Testing Library + jest-axe):**

1. Renders `div` by default; `as` renders `section`, `article` and `li` (the `li` inside a `ul`).
2. `surface` (default): `bg-surface-obsidian/88`, `border-accent-electric-sky/14`, `rounded-xl`,
   `p-lg`; `padding="md"` gives `p-md` and not `p-lg`.
3. `inset`: `bg-text-primary/3`, `border-accent-electric-sky/12`, `rounded-[14px]`, `py-sm`,
   `px-md`.
4. No hex, no left/right utilities, no `hover:`, `focus:`, `active:`, `shadow`, `transition`,
   `animate` or transform classes.
5. Native attributes (`id`, `aria-labelledby`, `data-*`, `li` `value`) and children pass through;
   `ref` reaches the element; no role is added.
6. `className` is merged last.
7. Type tests (checked by `pnpm typecheck`): `// @ts-expect-error` on `as="button"`, on
   `variant="inset" padding="md"`, and on `value` with `as="div"`.
8. jest-axe: `surface` and `inset` × `rtl`/`ltr` = 4 cases, no violations.

**Integration (Yousef, `/dev/components`):** computed fill, border, radius and padding per variant
and padding; rendered text contrast for every row of §7; axe; 1440/768/390/320 in RTL and LTR with
no overflow.

## 12. Decisions

| ID   | Decision (user, 2026-11-15)                                           | Condition and how it is met                                                                             |
| ---- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| D-C1 | **Approved:** Obsidian 88% as the one `surface` fill                  | Settings Group 90% recorded as an intentional deviation (§2, design-values §8)                          |
| D-C2 | **Approved:** Sky 14% for `surface`, Sky 12% for `inset`              | Settings Group 12% border also normalized to 14% on `surface` (same deviation record)                   |
| D-C3 | **Approved with condition:** padding `lg` 20 and `md` 16              | Tablet and Mobile inspected: padding identical on all breakpoints (§1); both are existing tokens        |
| D-C4 | **Approved:** static only                                             | No hover, motion or interactive behavior (§4, §8)                                                       |
| D-C5 | **Approved with condition:** `inset` and a restricted, type-safe `as` | `as` limited to four elements, attributes and ref typed per element, `inset` cannot take `padding` (§9) |

**Open items (not blocking V1):**

- **Q-1. Settings shortcut links** (Mobile Profile Overview `2463:3044`, e.g. `2463:3046`): `<a>`
  cards with Obsidian 90% fill, Sky 14% border, radius **16**, padding 16, gap 12, and a 16px
  chevron. They are interactive, so they are out of V1 (D-C4). Their boundary (≈1.3:1) would not
  meet 1.4.11 as a control. Decided with the Settings module (or a later interactive card), not
  now.
- **Q-2. Documentation fix:** design-values §1.1 and the typography table labelled `2224:372` as
  "Dashboard Mobile"; it is **Dashboard / Tablet**. The real Mobile frame is `2238:741`. Labels
  corrected in design-values; the read-only Design System Reference is unchanged.

## 13. Acceptance checklist (Yousef at intake)

- [ ] `DELIVERY.md` has the full baseline hash. Only `Card.tsx` and `Card.test.tsx` changed.
- [ ] Classes per §2 with tokens, opacity modifiers and named local constants. No hex.
- [ ] Types per §9: restricted `as`, per-element attributes and ref, no `padding` on `inset`.
- [ ] No hover, focus, shadow, motion, role or internal layout.
- [ ] Logical utilities only. RTL and LTR verified.
- [ ] No new dependencies. Real results for typecheck, lint, format:check, test and build.
- [ ] All tests in §11 present and passing.
- [ ] Screenshots: `surface` (both paddings) and `inset` inside `surface`, with sample content, ×
      RTL/LTR at 1440/768/390; no overflow at 320.

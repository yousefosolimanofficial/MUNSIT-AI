# Component contract — Card surfaces (Phase 03, Mariam delivery 3)

- **Status:** **Final — D-C1 to D-C5 approved by the user** (2026-11-15); API made
  non-interactive at the type level and the Recent Lecture Row interaction verified (§4, §9, §12).
  Pending only the documentation PR review and merge. Mariam starts only after that merge and a
  clean starter from the latest `main` (§10).
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

**Recent Lecture Row is not clickable as a whole (FIGMA evidence, read 2026-11-15 with the Plugin
API, read-only):**

- Component set `Dashboard / Recent Lecture Row` `2482:1484` has one variant property, `Size`
  (`Wide` `2482:1464`, 640×68; `Compact` `2482:1474`, 318×106). There is no Hover, Pressed or
  Focused variant.
- `reactions` are empty on the component set, on the instances `2482:1489` (Desktop),
  `2482:1527` (Tablet) and `2482:1565` (Mobile), on the three Recent Lectures Cards, and on every
  descendant of them. No prototype interaction exists anywhere in the row.
- The component description says: "Open action navigates to Lecture Details (cross-page, not
  linked in Figma)". The open action is the Secondary Button "فتح" inside the row (84×40), not the
  row.

So the row is an `inset` Card with a real `<a>` (Lecture Details link styled as the Secondary
Button) or `Button` inside it, owned by the Dashboard module. Card itself is never the
interactive control, and it never takes a click handler (§9).

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

/** Removes every React event handler (`onClick`, `onKeyDown`, `onPointerDown`, …). */
type WithoutEventHandlers<P> = { [K in keyof P as K extends `on${string}` ? never : K]: P[K] };

/** Attributes that would make the static Card focusable, editable or re-roled (D-C4). */
type InteractiveAttribute =
  "role" | "tabIndex" | "autoFocus" | "accessKey" | "contentEditable" | "draggable";

/**
 * Content-injection safety restriction, not an interaction rule: Card content comes only from
 * `children` (React-escaped). Raw HTML would bypass the sanitizing rule for rendered rich content
 * (CLAUDE.md, Security).
 */
type UnsafeContentAttribute = "dangerouslySetInnerHTML";

/** `padding` exists only on `surface`; `inset` has fixed padding. */
type CardVariantProps =
  { variant?: "surface"; padding?: "lg" | "md" } | { variant: "inset"; padding?: never };

export type CardProps<E extends CardElement = "div"> = CardVariantProps & {
  /** Rendered element (D-C5). Default "div". */
  as?: E;
  /** Layout only, merged last. Never color, radius, border or padding. */
  className?: string;
  children?: ReactNode;
} & Omit<
    WithoutEventHandlers<ComponentPropsWithRef<E>>,
    "as" | "className" | "children" | InteractiveAttribute | UnsafeContentAttribute
  >;

export function Card<E extends CardElement = "div">(props: CardProps<E>): ReactNode;
```

- **Kept, per element:** `ComponentPropsWithRef<E>` supplies each element's own attributes and
  ref type:

  | `as`      | Ref type         | Element-specific       |
  | --------- | ---------------- | ---------------------- |
  | `div`     | `HTMLDivElement` | rejects `value`        |
  | `section` | `HTMLElement`    | global attributes only |
  | `article` | `HTMLElement`    | global attributes only |
  | `li`      | `HTMLLIElement`  | accepts `value`        |

  There is **no `HTMLArticleElement`** (or `HTMLSectionElement`) in the DOM: the HTML standard and
  both `lib.dom.d.ts` and `@types/react` type `<article>` and `<section>` as `HTMLElement`. As a
  consequence of React's typings (not a Card choice), a ref to any `HTMLElement` subtype is
  assignable on `section`/`article`; a non-HTML ref (for example `SVGSVGElement`) is rejected. Global attributes (`id`,
  `lang`, `dir`, `title`, `hidden`, `style`), every `aria-*` and every `data-*` stay. React 19
  passes `ref` as a prop, so no `forwardRef`.

- **Rejected at compile time:** every `on*` event handler; the interactive attributes `role`,
  `tabIndex`, `autoFocus`, `accessKey`, `contentEditable`, `draggable` (static-only, D-C4);
  `dangerouslySetInnerHTML` (content-injection safety, separate from D-C4); any other `as`
  (`"button"`, `"a"`, …); `padding` with `variant="inset"`; unknown variants or paddings; a ref of
  the wrong element type (`div`/`li`) or a non-HTML ref (`section`/`article`).
- **Verified 2026-11-15:** this exact type was compiled with the project's `tsc` (TypeScript 6
  strict) in throwaway files (deleted, not committed): 7 accepted usages compiled (including an
  explicit ref for each of the four elements and a callback ref), 15 `@ts-expect-error`
  rejections held, and a deliberately unused `@ts-expect-error` failed with TS2578, proving the
  mechanism.
- No title, header, footer, media, `interactive` or `href` props.

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
   `ref` reaches the element (runtime: `ref.current` is an `HTMLLIElement` for `as="li"`); no role
   or tabindex is rendered.
6. `className` is merged last.
7. **Compile-time tests**, in `Card.test.tsx` as JSX inside a never-rendered function or a
   `const` (so they cost nothing at runtime). They run through `corepack pnpm typecheck`
   (`tsc --noEmit`; `tsconfig.json` includes `**/*.tsx`), which `corepack pnpm check` and the CI
   `check` job run. Each rejection uses `// @ts-expect-error`, so a rejection that stops failing
   breaks the build (TS2578). Required cases:
   - **Accepted (one explicit ref per element):**
     `<Card ref={createRef<HTMLDivElement>()} />`;
     `<Card as="section" ref={createRef<HTMLElement>()} aria-label="…" />`;
     `<Card as="article" ref={createRef<HTMLElement>()} />` (the article ref type; there is no
     `HTMLArticleElement`, §9); `<Card as="li" value={2} ref={createRef<HTMLLIElement>()} />`
     inside a `ul`; a callback ref `(node: HTMLDivElement | null) => …`; `aria-*`, `data-*`, `id`.
   - **Rejected:** `onClick`, `onKeyDown`, `onPointerDown` (one each, on different elements);
     `role="button"`; `tabIndex={0}`; `dangerouslySetInnerHTML`; `as="button"` and `as="a"`;
     `value` on the default `div`; `variant="inset" padding="md"`; `padding="sm"`; an
     `HTMLLIElement` ref on a `div`; an `HTMLDivElement` ref on an `li`; an `SVGSVGElement` ref on
     `article` and on `section`.
8. jest-axe: `surface` and `inset` × `rtl`/`ltr` = 4 cases, no violations.

**Integration (Yousef, `/dev/components`):** computed fill, border, radius and padding per variant
and padding; rendered text contrast for every row of §7; axe; 1440/768/390/320 in RTL and LTR with
no overflow.

## 12. Decisions

| ID   | Decision (user, 2026-11-15)                                           | Condition and how it is met                                                                                                                                                      |
| ---- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-C1 | **Approved:** Obsidian 88% as the one `surface` fill                  | Settings Group 90% recorded as an intentional deviation (§2, design-values §8)                                                                                                   |
| D-C2 | **Approved:** Sky 14% for `surface`, Sky 12% for `inset`              | Settings Group 12% border also normalized to 14% on `surface` (same deviation record)                                                                                            |
| D-C3 | **Approved with condition:** padding `lg` 20 and `md` 16              | Tablet and Mobile inspected: padding identical on all breakpoints (§1); both are existing tokens                                                                                 |
| D-C4 | **Approved:** static only                                             | No hover or motion (§4, §8); event handlers, `role` and `tabIndex` rejected by the type (§9); Recent Lecture Row verified non-interactive, action stays in its inner Button (§4) |
| D-C5 | **Approved with condition:** `inset` and a restricted, type-safe `as` | `as` limited to four elements, attributes and ref typed per element, `inset` cannot take `padding`; verified with `tsc` (§9)                                                     |

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
- [ ] Types per §9: restricted `as`, per-element attributes and ref, no `padding` on `inset`, no
      event handlers, `role` or `tabIndex`; the §11.7 compile-time tests pass in `pnpm typecheck`.
- [ ] No hover, focus, shadow, motion, role or internal layout.
- [ ] Logical utilities only. RTL and LTR verified.
- [ ] No new dependencies. Real results for typecheck, lint, format:check, test and build.
- [ ] All tests in §11 present and passing.
- [ ] Screenshots: `surface` (both paddings) and `inset` inside `surface`, with sample content, ×
      RTL/LTR at 1440/768/390; no overflow at 320.

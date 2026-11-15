# Component contract — Card surfaces (Phase 03, Mariam delivery 3)

- **Status:** **Draft — awaiting the user's decisions D-C1 to D-C5** (§12). Mariam starts only
  after this contract is approved, merged, and she has received the new starter (§10).
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read read-only via the Figma MCP on 2026-11-15. Every
  value labelled FIGMA was read from the node itself. Figma is not modified. There is **no Card
  component set** in Figma (a design-system search for "card" returns none): the surfaces below
  are frames repeated across screens.
- **Implementer:** Mariam. **Reviewer and integrator:** Yousef.
- **Delivery name:** `munsit-delivery-shared-ui-card-<YYYYMMDD>-v1.zip`
- **Reference implementation:** `src/shared/ui/Button.tsx` and `src/shared/ui/Input.tsx` (class
  style, named local constants). Do not change them.

## 1. Source (FIGMA)

| Surface                    | Node        | Screen                             | Fill                                  | Border                 | Radius | Padding | Gap |
| -------------------------- | ----------- | ---------------------------------- | ------------------------------------- | ---------------------- | ------ | ------- | --- |
| Recent Activity Card       | `2220:368`  | 03 Dashboard / Desktop `2211:74`   | Obsidian **88%** `rgba(17,18,20,.88)` | Electric Sky **14%**   | 20     | 20      | 16  |
| Recent Lectures Card       | `2482:1488` | 03 Dashboard / Desktop             | Obsidian 88%                          | Electric Sky 14%       | 20     | **16**  | 10  |
| Settings Group             | `2463:3514` | 14 Profile & Settings              | Obsidian **90%** `rgba(17,18,20,.9)`  | Electric Sky **12%**   | 20     | 20      | 14  |
| Statistic Card (reference) | `2210:187`  | Design System (design-values §1.2) | Obsidian 88%; hover Graphite 95%      | Sky 12%; hover Sky 42% | **18** | 16      | 10  |
| Recent Lecture Row (inset) | `2482:1484` | inside Recent Lectures Card        | White **3%** `rgba(255,255,255,.03)`  | Electric Sky 12%       | **14** | 12 / 16 | 16  |

All borders are 1px solid, inside. No shadow and no hover on the content cards and the Settings
Group. Other Dashboard cards with the same geometry (content inset 21 = 1 + 20): Performance Chart
`2220:271`, Needs Attention `2220:279`, Upcoming Goals `2220:339` (not read one by one; same layout
evidence). Titles inside cards differ by screen: `Dashboard/Title M` (Dashboard cards) and
`Dashboard/Card Title` (Settings Group), so the title is **not** part of Card (§9).

**Not verified:** Tablet and Mobile card padding (frames `2242:1272`, `2224:372` not re-read for
cards). Yousef reads them before this contract is final; a difference becomes a decision, never a
guess.

## 2. Variants (proposed, pending D-C1 to D-C5)

| Variant   | Use                                               | Fill         | Border           | Radius                  | Padding                      |
| --------- | ------------------------------------------------- | ------------ | ---------------- | ----------------------- | ---------------------------- |
| `surface` | Dashboard content cards, Settings Group (default) | Obsidian 88% | Electric Sky 14% | 20 (`rounded-xl` token) | `lg` 20 (default) or `md` 16 |
| `inset`   | A row or block nested inside a `surface` card     | White 3%     | Electric Sky 12% | 14 (local constant)     | 12 block / 16 inline         |

- Spacing comes from the existing tokens (`p-lg` = 20, `p-md` = 16). Radius 20 is the
  `--radius-xl` token. Radius 14, the translucent fills and the border tints are **local component
  constants**, never new tokens (CLAUDE.md design rules).
- The Statistic Card's hover (lift 4px, Graphite 95%, Sky 42%, shadow) and Intro fade belong to
  the Statistic Card itself (Dashboard, a later phase), not to this Card (D-C4).
- Card sets no layout inside (no flex or gap): children are laid out by the caller. Card fills
  its container width.

## 3. Typography

None. Card renders no text of its own. Callers use the existing `text-dashboard-*` utilities.

## 4. States

Static only in V1: no hover, pressed, focus or disabled state (D-C4). A clickable card is a
separate decision for the component that needs it (a link or button inside, or a future
interactive variant with its own focus and contrast rules).

## 5. Behavior

- Server Component, no `"use client"`, no state.
- Renders `div` by default. Prop `as` allows `section`, `article` or `li` for document structure
  (D-C5). Card adds no ARIA role and no label: semantics come from the element and the caller's
  heading.
- All other native attributes pass through to the element. `className` is merged last, for
  layout only (margin, width, grid placement, `flex`/`gap` inside), never color, radius or
  border.

## 6. RTL / LTR

Card is direction-neutral: symmetric padding, no physical sides. Content follows the document
direction. Logical utilities only.

## 7. Accessibility (WCAG 2.2 AA)

Contrast (WCAG arithmetic from token values, 2026-11-15). Surfaces composited over Void Black:
Obsidian 88% = `#0f1012`, Obsidian 90% = `#101113`, `inset` (White 3% over the 88% card) =
`#161719`.

| Text color on surface | 88% card | 90% card | inset | Result                                         |
| --------------------- | -------- | -------- | ----- | ---------------------------------------------- |
| Text / Primary        | 19.04    | 18.89    | 17.94 | AA                                             |
| Text / Secondary      | 6.94     | 6.89     | 6.54  | AA                                             |
| Text / Muted Readable | 5.75     | 5.70     | 5.41  | AA                                             |
| Electric Sky          | 7.32     | 7.26     | 6.90  | AA                                             |
| Coral Pulse           | 6.54     | 6.49     | 6.16  | AA                                             |
| Success Green         | 10.25    | 10.17    | 9.65  | AA                                             |
| Text / Muted          | 3.56     | 3.54     | 3.36  | **Fails for text**: not used for text on cards |

- **Card boundary:** Sky 12–14% on the 88% card is 1.18–1.31:1 and the fill vs Void is 1.07:1.
  WCAG 1.4.11 applies to UI components and meaningful graphics, not to a static grouping
  container, so a non-interactive Card is **exempt**. This is why V1 is static (D-C4): an
  interactive card would need a boundary of at least 3:1 or another visible cue.
- The gallery and the integration tests check these ratios as rendered (Chromium-composited), as
  for Button and Input.

## 8. Motion

None in V1.

## 9. Component API

```tsx
// src/shared/ui/Card.tsx — Server Component
export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Surface style (§2). Default "surface". */
  variant?: "surface" | "inset";
  /** Padding for `surface` only: "lg" = 20 (default), "md" = 16. Ignored for `inset`. */
  padding?: "lg" | "md";
  /** Rendered element. Default "div" (D-C5). */
  as?: "div" | "section" | "article" | "li";
  /** Layout only, merged last. Never color, radius or border. */
  className?: string;
  children?: ReactNode;
}
```

No title, header, footer or media slots in V1: composition stays with callers.

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

1. Renders `div` by default; `as` renders `section`, `article` and `li` (an `li` inside a `ul` in
   the test).
2. Default variant `surface`: classes for Obsidian 88%, Sky 14% border, `rounded-xl`, `p-lg`;
   `padding="md"` gives `p-md`.
3. `inset`: White 3% fill, Sky 12% border, radius 14, padding 12/16; `padding` is ignored.
4. No hex, no left/right utilities, no `hover:`, `focus:`, `shadow` or transform classes.
5. Native attributes (`id`, `aria-labelledby`, `data-*`) and children pass through; no role is
   added.
6. `className` is merged last.
7. jest-axe: `surface` and `inset` × `rtl`/`ltr` = 4 cases, no violations.

**Integration (Yousef, `/dev/components`):** computed fill, border, radius and padding per variant;
rendered text contrast for every row of §7; axe; 1440/768/390/320 in RTL and LTR with no
overflow.

## 12. Decisions (for the user)

| ID   | Question                                                                                       | Evidence                                                   | Recommendation                                                                            |
| ---- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| D-C1 | Fill: Obsidian **88%** (Dashboard cards, Stat Card) or **90%** (Settings Group)?               | 1 frame at 90%, 6+ at 88%; text contrast differs by ≤ 0.05 | **One value, 88%**: the majority, and visually identical (`#0f1012` vs `#101113`)         |
| D-C2 | Border: Electric Sky **14%** (Dashboard content cards) or **12%** (Settings Group, Stat Card)? | Both decorative (exempt); 1.31 vs 1.26 on Void             | **14%** for `surface` (the content cards Card mainly serves); `inset` keeps its Figma 12% |
| D-C3 | Padding: offer both 20 and 16?                                                                 | Recent Activity 20, Recent Lectures 16 (list card)         | **Yes**: `padding="lg"` (20, default) and `"md"` (16), both existing tokens               |
| D-C4 | Scope: static surface only, Statistic Card hover/lift and Intro fade left to the Stat Card?    | Hover exists only on the Stat Card; boundary < 3:1         | **Yes, static only.** Interactive cards are decided with the component that needs them    |
| D-C5 | Include `inset` and the `as` element prop in V1?                                               | Inset rows in Recent Lectures; cards hold sections         | **Yes, both**: small, and they avoid ad-hoc copies of the row surface and wrapper `div`s  |

## 13. Acceptance checklist (Yousef at intake)

- [ ] `DELIVERY.md` has the full baseline hash. Only `Card.tsx` and `Card.test.tsx` changed.
- [ ] Variants and padding per §2 and the approved decisions, with tokens, opacity modifiers and
      named local constants. No hex.
- [ ] No hover, focus, shadow, motion or role. `as` limited to the four elements.
- [ ] Logical utilities only. RTL and LTR verified.
- [ ] No new dependencies. Real results for typecheck, lint, format:check, test and build.
- [ ] All tests in §11 present and passing.
- [ ] Screenshots: both variants (and both paddings) with sample content × RTL/LTR at
      1440/768/390, no overflow at 320.

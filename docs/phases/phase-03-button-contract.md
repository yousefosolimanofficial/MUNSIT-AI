# Component contract — Button (Phase 03, Mariam delivery 1)

- **Status:** **Approved — final** (2026-11-13). Figma values verified; decisions D-B1 to
  D-B6 and the Ember Hush rule approved by the user (§12). Mariam starts coding only after she
  receives the approved starter v2 (see [phase-03-plan.md](phase-03-plan.md) §4).
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, component set `Button` `2210:89`. It was read
  read-only via the Figma MCP on 2026-11-13. Every value below labelled FIGMA was read from the
  node itself.
- **Implementer:** Mariam. **Reviewer and integrator:** Yousef.
- **Delivery name:** `munsit-delivery-shared-ui-button-<YYYYMMDD>-v1.zip`

## 1. Variants and states (FIGMA)

The component set has 8 variants: `Type` = Primary | Secondary × `State` = Default | Hover |
Pressed | Disabled. The text property is `Label`, with the default value "متابعة".

| Variant              | Node      |
| -------------------- | --------- |
| Primary / Default    | `2210:73` |
| Primary / Hover      | `2210:75` |
| Primary / Pressed    | `2210:77` |
| Primary / Disabled   | `2210:79` |
| Secondary / Default  | `2210:81` |
| Secondary / Hover    | `2210:83` |
| Secondary / Pressed  | `2210:85` |
| Secondary / Disabled | `2210:87` |

In code, `Type` becomes the `variant` prop. Hover and Pressed are **interaction states**
(`:hover`, `:active`), not props. Disabled is the native `disabled` prop.

## 2. Size and spacing (FIGMA, the same for all 8 variants)

| Property       | Value                                   | Implementation                                                   |
| -------------- | --------------------------------------- | ---------------------------------------------------------------- |
| Height         | 44 (fixed)                              | Local constant `h-[44px]` (component size, not a token)          |
| Width          | Hugs the label (auto)                   | No fixed width. Callers may add layout classes, such as `w-full` |
| Padding inline | 20 start and end; 0 top and bottom      | Token Space LG: `px-lg`                                          |
| Radius         | 12                                      | Token Radius MD: `rounded-md`                                    |
| Layout         | Horizontal, centered on both axes       | `inline-flex items-center justify-center`                        |
| Item gap       | 8 (no second child exists in Figma)     | Not used in v1 (see D-B4)                                        |
| Border         | 1px **inside**, Secondary variants only | `border` (1px) with box-sizing that keeps the height at 44       |

There is only one size. Figma has no small or large button.

## 3. Typography (FIGMA)

| Property   | Value                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Text style | `Dashboard/Button`: Cairo SemiBold 600, 14 / 20, letter spacing 0                                       |
| Utility    | `text-dashboard-button` (from `src/design-system/typography.css`; it sets size, line height and weight) |
| Alignment  | Centered, single line (the text box hugs its content)                                                   |

Arabic renders in Cairo. Latin labels render in Inter through the Phase 02 font stack. This is
expected and needs no extra code.

## 4. Colors per state (FIGMA, one approved exception)

Use the color tokens with opacity modifiers, such as `bg-accent-electric-sky/8`. Never use literal
hex values.

| Variant / State      | Fill                                   | Border (1px inside)  | Label                      | Effect                                                                  |
| -------------------- | -------------------------------------- | -------------------- | -------------------------- | ----------------------------------------------------------------------- |
| Primary / Default    | Electric Sky `#63a1ff`                 | none                 | Void Black `#040506`       | —                                                                       |
| Primary / Hover      | Info Blue `#56c2ff`                    | none                 | Void Black                 | Drop shadow `0 4px 9px rgba(99,161,255,0.35)` (D-B1; Figma raw blur 18) |
| Primary / Pressed    | Electric Sky **78%**                   | none                 | Void Black                 | —                                                                       |
| Primary / Disabled   | Slate `#2f3031`                        | none                 | Text / Muted `#6a6b6c`     | —                                                                       |
| Secondary / Default  | Electric Sky **8%**                    | Electric Sky **30%** | Electric Sky               | —                                                                       |
| Secondary / Hover    | Electric Sky **16%**                   | Electric Sky **55%** | Electric Sky               | —                                                                       |
| Secondary / Pressed  | Electric Sky **20%** (Figma 24%, D-B6) | Electric Sky **55%** | Electric Sky               | —                                                                       |
| Secondary / Disabled | **none** (transparent)                 | Electric Sky **20%** | **Text / Muted** `#6a6b6c` | —                                                                       |

The Secondary / Disabled label is Text / Muted in Figma, not Electric Sky. The Design System
Reference summary does not mention this.

Token utilities:

- `accent-electric-sky`
- `accent-info-blue`
- `neutral-slate`
- `surface-void-black`
- `text-muted`

## 5. Interaction behavior

- **Hover** applies only when the device can hover with a fine pointer:
  `(hover: hover) and (pointer: fine)`, as approved in `docs/design-values.md` §1.3. Tailwind's
  `hover:` only checks `(hover: hover)`, so use an arbitrary variant such as
  `[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:…`. Add no hover style on touch.
- **Pressed** is `:active`, and only when enabled.
- **Disabled** uses the native `disabled` attribute.
  - Disabled styles as in the table above.
  - No hover or pressed change.
  - Not focusable (browser default).
  - `onClick` never fires.
- **Loading:** not designed in Figma. **Out of scope for v1** (D-B3, decided).
- **Icons:** not designed in Figma (the gap of 8 exists but there is no icon layer). **Out of
  scope for v1**; label-only (D-B4, decided).

## 6. RTL / LTR

- The label is centered and the padding is symmetric, so the button looks the same in both
  directions. Use logical utilities only. Never use `left` or `right`.
- Text direction follows the document (`dir` on `<html>`). An English label inside an Arabic
  layout is wrapped by the caller with `Ltr` when needed. The Button itself adds no `dir`.
- Nothing in the button mirrors. If an icon is added later (D-B4), it follows the icon mirror
  whitelist.
- Verify both directions: `/` (ar) and `/en`.

## 7. Accessibility (WCAG 2.2 AA)

- Render a native `<button>`. Default `type="button"`, so the button never submits a form by
  accident. Callers pass `type="submit"` when they need it.
- The accessible name comes from the visible label. Icon-only buttons are out of scope (that is a
  separate Navigation Icon Button, NOT VERIFIED).
- Keyboard: Tab focuses the button. Enter and Space activate it (native). It works with the
  keyboard only.
- **Visible focus** with `:focus-visible` only (not on mouse click): outline 2px solid Electric
  Sky, outline offset 2px (D-B2, decided).
- Target size: 44 high, at least 80 wide in Figma. That meets WCAG 2.5.8 (24×24 minimum) and works
  well on touch.
- Disabled: native `disabled`, which removes the button from the tab order. Do not use
  `aria-disabled` in v1.
- Contrast, measured 2026-11-13 (WCAG; 14px SemiBold counts as normal text, so it needs 4.5):

| State             | Label on fill                                              | Ratio              | Result                                   |
| ----------------- | ---------------------------------------------------------- | ------------------ | ---------------------------------------- |
| Primary Default   | Void Black on Electric Sky                                 | 7.84               | AA                                       |
| Primary Hover     | Void Black on Info Blue                                    | 10.25              | AA                                       |
| Primary Pressed   | Void Black on Sky 78% (over Void / Obsidian / Graphite)    | 5.03 / 5.23 / 5.38 | AA                                       |
| Secondary Default | Sky on Sky 8% (over Void / Obsidian / Graphite)            | 7.27 / 6.49 / 5.78 | AA                                       |
| Secondary Hover   | Sky on Sky 16%                                             | 6.44 / 5.63 / 5.03 | AA                                       |
| Secondary Pressed | Sky on Sky **20%** (D-B6; over Void / Obsidian / Graphite) | 5.99 / 5.22 / 4.65 | AA (was 4.29 on Graphite at Figma's 24%) |
| Disabled (both)   | Muted on Slate / on Void                                   | 2.48 / 3.82        | Exempt (WCAG 1.4.3, disabled controls)   |

## 8. Motion

- Figma has no prototype reactions or keyframes on the Button set. The node's reactions list is
  empty.
- Use the approved motion tokens:
  - Color, border and shadow changes transition over `duration-base` (200 ms) with
    `ease-standard`.
  - The pressed state may use `duration-fast` (120 ms).
- Transition `background-color`, `border-color`, `color` and `box-shadow` only. **No transform or
  scale.** Figma shows no movement.
- Reduced motion: nothing extra. The Button has no movement, and the global Phase 02 rule keeps
  color transitions soft.

## 9. Component API (proposal for review)

```ts
// src/shared/ui/Button.tsx — no "use client" needed (no state or effects)
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const BUTTON_VARIANTS = ["primary", "secondary"] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma `Type`. Default "primary". */
  variant?: ButtonVariant;
  /** Visible label (Figma `Label`). */
  children: ReactNode;
}
```

- The default for `type` is `"button"`.
- `className` is merged after the component classes and is for **layout only**: margin, width and
  alignment. It never changes colors, size or typography.
- Other native attributes and `ref` (React 19) pass through to the `<button>`.
- Visual constants (the shadow and the 44 height) stay local inside `Button.tsx`, named. No
  changes in `src/design-system`.

## 10. Files

**Delivered by Mariam** (her delegated paths, in `files/`):

| Path                            | Purpose         |
| ------------------------------- | --------------- |
| `src/shared/ui/Button.tsx`      | Component       |
| `src/shared/ui/Button.test.tsx` | Component tests |

**Not edited by Mariam.** If she needs any of these, she lists it in the `DELIVERY.md` requests
table:

- `src/design-system/*`
- `src/app/*`, including the `/dev/components` gallery, which Yousef builds
- `package.json` and the lockfile
- Messages and config files

For screenshots, she may build a **local-only preview page** and must **not** include it in the
delivery. She mentions it in `DELIVERY.md`.

## 11. Required tests

Once P-1 adds Testing Library, jsdom and axe, `Button.test.tsx` covers:

1. It renders a native `<button>` with `type="button"` by default and passes `type="submit"`
   through.
2. Each variant applies its classes: Primary and Secondary, default `primary`.
3. The label is the accessible name (`getByRole("button", { name })`), in Arabic and English.
4. Click calls `onClick`. Enter and Space activate it with the keyboard only.
5. When disabled: the `disabled` attribute is set, a click does not call `onClick`, and the button
   is not focusable with Tab.
6. Focus: Tab reaches the button and `:focus-visible` styling exists (class present).
7. `className` is merged and the base classes are kept.
8. Native attributes (`aria-*`, `data-*`, `form`, `name`) and `ref` pass through.
9. `jest-axe`: no violations for each variant × enabled/disabled, in `dir="rtl"` and `dir="ltr"`
   (structure and ARIA only; contrast is not checked in jsdom).

**Already in the repository (Yousef):** `src/design-system/contrast.test.ts` proves, from the
token values with WCAG arithmetic (no DOM), that every Button label state is at least 4.5:1 on
every allowed surface, and that the original 24% and Ember Hush fail.

**Integration tests (Yousef, after the gallery exists):**

- Playwright checks the computed styles per state:
  - height 44, padding 20, radius 12
  - fill, border and label colors
  - the hover shadow
  - focus ring visible
- The same checks at 1440, 768, 390 and 320 (no overflow) in RTL and LTR.
- **Rendered contrast in the browser (not jsdom):** for every variant and state on every allowed
  surface (§12.2), read the computed label and fill colors in Chromium, composite the fill alpha
  over the surface, and assert at least 4.5:1. `jsdom` does not compute rendered colors and is
  never used for contrast.
- `@axe-core/playwright` scan of the gallery in RTL and LTR: no violations.
- Visual baselines approved by the user.

## 12. Decisions

### 12.1 Decided by the user (2026-11-13)

| ID   | Decision                                                                                                                                                                                                                                                                                                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-B1 | **Hover shadow is `0 4px 9px rgba(99,161,255,0.35)`** for the Button, per the Design System Reference. It is one named local constant in `Button.tsx`. This decision covers **only the Button**. The "halve the Figma blur" rule is **not** adopted project-wide. Every other shadow (for example the Statistic Card) is reviewed on its own before use. |
| D-B2 | **Focus ring:** `:focus-visible` only → outline 2px solid Electric Sky, outline offset 2px, the same for both variants. Electric Sky measures 7.84 / 7.20 / 6.56 against Void / Obsidian / Graphite, well above 3:1. This is the focus rule for every Phase 03 primitive.                                                                                |
| D-B3 | **Loading** is out of scope for v1.                                                                                                                                                                                                                                                                                                                      |
| D-B4 | **Icons inside the button** are out of scope for v1. The button is label-only.                                                                                                                                                                                                                                                                           |
| D-B5 | **Destructive variant** is deferred to Phase 06. It is verified in Figma then.                                                                                                                                                                                                                                                                           |

### 12.2 D-B6: Secondary Pressed contrast (approved by the user 2026-11-13)

The user did not accept 4.29:1 as AA. **Approved fix (option A):** Secondary **Pressed fill 24% →
20%**. Border stays Electric Sky 55%, label stays Electric Sky. This is the only color change. It
is a deliberate deviation from Figma for WCAG, recorded in `docs/design-values.md` §6. Figma is not
modified.

**Approved usage rule:** the Secondary Button is **not used on Ember Hush** (it fails in Hover and
Pressed there). Error-state actions are verified in Figma in Phase 06.

**Allowed surfaces** and label contrast after the fix (AA needs 4.5:1; 14px SemiBold is normal
text). Primary states use Void Black on Electric Sky / Info Blue / Sky 78%.

| Surface under the button                        | Secondary Default 8% | Hover 16% | Pressed **20%** | Primary Pressed 78% |
| ----------------------------------------------- | -------------------- | --------- | --------------- | ------------------- |
| Void Black `#040506`                            | 7.25                 | 6.44      | 5.99            | 5.03                |
| Ink `#07080a`                                   | 7.09                 | 6.26      | 5.81            | 5.08                |
| Obsidian `#111214`                              | 6.47                 | 5.64      | 5.22            | 5.23                |
| Obsidian 88% card (over Void)                   | 6.58                 | 5.74      | 5.31            | 5.21                |
| Graphite `#1b1c1e`                              | 5.80                 | 5.02      | **4.65**        | 5.38                |
| Graphite 95% card hover (over Void)             | 5.88                 | 5.09      | **4.71**        | 5.37                |
| ~~Ember Hush `#452324`~~: Secondary not allowed | 4.75                 | 4.18 ✗    | 3.91 ✗          | —                   |

Primary Default 7.84 and Primary Hover 10.25 do not depend on the surface. Disabled states are
exempt (WCAG 1.4.3).

**Proof:** `src/design-system/contrast.test.ts` (unit, from token values) and the rendered-browser
check at integration (§11). Options A′ (21%), B (white label) and C (usage rule only) were
considered and rejected.

## 13. Acceptance checklist (Yousef uses it at intake)

- [ ] `DELIVERY.md` has the exact full baseline commit hash. The baseline is a logged starter.
- [ ] Only `src/shared/ui/Button.tsx` and `Button.test.tsx` are changed. Any other need is in the
      requests table.
- [ ] There are 8 variants through `variant` × interaction state × `disabled`. No copies of the
      component.
- [ ] Height 44, padding-inline 20 (`px-lg`), radius 12 (`rounded-md`), `text-dashboard-button`.
- [ ] Colors match §4 exactly, using tokens and opacity modifiers, with no literal hex values. The
      Secondary Disabled label is Text / Muted.
- [ ] Hover only under `(hover: hover) and (pointer: fine)`, with no hover or pressed effect when
      disabled.
- [ ] Hover shadow `0 4px 9px rgba(99,161,255,0.35)` (D-B1). Focus ring: `:focus-visible`,
      2px Electric Sky, offset 2px (D-B2).
- [ ] Secondary Pressed fill **20%** (not Figma's 24%), border 55%, label Electric Sky (D-B6).
- [ ] No Secondary Button placed on Ember Hush (usage rule).
- [ ] `src/design-system/contrast.test.ts` still passes. The browser contrast check (§11) is at
      least 4.5:1 for every state on every allowed surface.
- [ ] No loading state, no icons and no destructive variant (D-B3, D-B4, D-B5).
- [ ] Transitions on color, border and shadow only, with the motion tokens. No transform.
- [ ] Native `<button>`, default `type="button"`, keyboard only works, disabled not focusable.
- [ ] RTL and LTR look identical. Logical utilities only.
- [ ] No new dependencies. `package.json` and the lockfile are unchanged.
- [ ] Real results for `typecheck`, `lint`, `format:check`, `test` and `build`. All tests in §11
      are present and pass.
- [ ] Screenshots: 8 states (hover and pressed captured live) × RTL/LTR at 1440, 768 and 390, and
      no overflow at 320.
- [ ] Known issues and NOT VERIFIED items listed. Integration instructions included.

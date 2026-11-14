# Component contract — Input (Phase 03, Mariam delivery 2)

- **Status:** **Draft — awaiting user approval** (2026-11-14). Mariam does not start until this
  contract is marked Approved and decisions D-I1 to D-I4 (§12) are decided.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, component set `Settings / Profile Input` frame
  `2461:591` (page `14 — Profile & Settings`), read read-only via the Figma MCP on 2026-11-14.
  Every value labelled FIGMA was read from the node itself.
- **Implementer:** Mariam. **Reviewer and integrator:** Yousef.
- **Delivery name:** `munsit-delivery-shared-ui-input-<YYYYMMDD>-v1.zip`
- **Reference implementation:** `src/shared/ui/Button.tsx` (class style, named local constants,
  hover/focus patterns). Do not change Button.

## 1. Source and states (FIGMA)

Figma has three text-field designs. V1 implements only the in-app one (D-I1):

| Figma set                                    | Node                  | Use                    | V1                  |
| -------------------------------------------- | --------------------- | ---------------------- | ------------------- |
| **Settings / Profile Input**                 | `2461:591`            | In-app forms (Profile) | **Yes**             |
| Settings / Password Input (Hidden/Shown/Err) | `2461:622`            | Change password        | No: later delivery  |
| Auth / Input, Auth / Password Input          | (instances on page 5) | Login/Register, 52 px  | No: Phase 08 (D-I1) |
| Search Input                                 | `2210:135`            | Top bar, with icon     | No: Phase 05 shell  |

`Settings / Profile Input` has 4 variants. The text properties are `Label` (default "الاسم الكامل"),
`Value` and `Message` (default "اكتب اسمك الكامل.").

| State    | Node       | In code                                  |
| -------- | ---------- | ---------------------------------------- |
| Default  | `2461:568` | resting                                  |
| Focused  | `2461:572` | `:focus` (interaction state, not a prop) |
| Error    | `2461:576` | `error` prop (non-empty string)          |
| Disabled | `2461:587` | native `disabled`                        |

Live use in Figma: `Settings / Form States` `2464:5195` (Edit Profile: Invalid email, Missing name).

## 2. Size and layout (FIGMA)

| Property             | Value                                | Implementation                             |
| -------------------- | ------------------------------------ | ------------------------------------------ |
| Field height         | 46 (fixed)                           | Local constant `h-[46px]` (component size) |
| Width                | Fills its container (320 in the set) | `w-full`; the caller sets the width        |
| Field padding inline | 14 start and end                     | Local constant `px-[14px]` (not a token)   |
| Field radius         | 12                                   | Token Radius MD: `rounded-md`              |
| Field border         | 1px inside                           | `border` with border-box (height stays 46) |
| Label → field gap    | 6                                    | Local constant `gap-[6px]` (not a token)   |
| Field → message gap  | 6                                    | Same container gap                         |
| Message row          | Icon 14 + gap 6 + text, one line     | `flex items-center gap-[6px]`              |
| Totals               | 70 (no message) / 94 (with message)  | Measured in the browser                    |

## 3. Typography (FIGMA, bound styles)

| Part          | Style                               | Utility                  | Color                          |
| ------------- | ----------------------------------- | ------------------------ | ------------------------------ |
| Label         | `Dashboard/Caption` Cairo 400 12/18 | `text-dashboard-caption` | Text / Secondary `#9c9c9d`     |
| Value         | `Dashboard/Body` Cairo 400 14/22    | `text-dashboard-body`    | Text / Primary `#ffffff`       |
| Placeholder   | not in this set (D-I4)              | same as value            | Text / Muted Readable (D-I4)   |
| Error message | `Dashboard/Caption` Cairo 400 12/18 | `text-dashboard-caption` | Accent / Coral Pulse `#ff6363` |

## 4. Colors per state (FIGMA)

Use tokens with opacity modifiers. Never use literal hex values.

| State    | Field fill                | Border (1px)         | Effect                                   | Whole block                              |
| -------- | ------------------------- | -------------------- | ---------------------------------------- | ---------------------------------------- |
| Default  | `#07080a` = Surface / Ink | Electric Sky **14%** | —                                        | —                                        |
| Focused  | Surface / Ink             | Electric Sky **70%** | Glow `0 0 6px 2px rgba(99,161,255,0.25)` | —                                        |
| Error    | Surface / Ink             | Coral Pulse **70%**  | —                                        | —                                        |
| Disabled | Surface / Ink             | Electric Sky **14%** | —                                        | opacity **60%** (label, field and value) |

- Figma fills the field with the unbound literal `#07080a`. It is exactly Surface / Ink, so use
  `bg-surface-ink`.
- Error + Focused is not designed. Proposed: keep the Coral 70% border and add the glow (the
  focus is still visible, and the error is not hidden).
- Glow: one named local constant, `INPUT_FOCUS_GLOW`, as in Button `PRIMARY_HOVER_SHADOW`.
- **Hover:** not designed. V1 has no hover style.

## 5. Behavior

- Native `<input>`, `type="text"` by default. `email`, `password`, `search`, `tel` and `url`
  pass through. Password visibility toggling is out of scope (separate Password Input).
- Controlled and uncontrolled both work (`value`/`onChange` or `defaultValue`), with all native
  attributes passed through (`name`, `autoComplete`, `required`, `maxLength`, `inputMode`, …).
- **Validation is not in the component.** The form decides when to set `error`, following the
  project rule: validate on blur, and clear the error as soon as the value is valid. The
  component only shows the state it is given.
- Disabled: native `disabled`. Not focusable, no focus style, value is not submitted.
- Server Component (no `"use client"`): no state or effects. `useId` is allowed.

## 6. RTL / LTR

- The label, value and message align to the inline start: right in `ar`, left in `en`. Use only
  logical utilities (`ps-`, `pe-`, `text-start`), never `left`/`right`.
- The error icon sits at the inline start of the message (right in RTL, as in Figma) and never
  mirrors (`alert` is not on the mirror whitelist).
- The input adds no `dir`. Callers may pass `dir="ltr"` for Latin-only values (for example code
  fields). Figma keeps emails right-aligned in RTL, so email has no default `dir`.

## 7. Accessibility (WCAG 2.2 AA)

- A visible `<label htmlFor>` is always present (`label` is required). The id comes from `id` or
  `useId()`.
- Error: `aria-invalid="true"` and `aria-describedby` pointing to the message id. Without an
  error, neither attribute is set. The message has no live region in v1, because the form owns
  announcements (Phase 08/20).
- `required` passes through natively. Required-marker styling is not designed and is out of scope.
- Focus: see D-I2. The focus indicator must be visible with keyboard **and** mouse (text fields
  always match `:focus-visible`).
- Target size: 46 high, which meets 2.5.8.
- Contrast (WCAG arithmetic from token values, 2026-11-14; text needs 4.5, non-text 3):

| Pair                                  | Void / Ink / Obsidian / Graphite | Result                 |
| ------------------------------------- | -------------------------------- | ---------------------- |
| Label Text / Secondary on surface     | 7.44 / 7.30 / 6.83 / 6.22        | AA                     |
| Error message Coral on surface        | 7.01 / 6.89 / 6.44 / 5.86        | AA                     |
| Value white on Ink field              | 20.04                            | AA                     |
| Placeholder Muted Readable on Ink     | 6.05                             | AA (D-I4)              |
| Focus border Sky 70% vs surface       | 4.21 / 4.19 / 4.09 / 3.88        | ≥ 3 (2.4.13 / 1.4.11)  |
| Error border Coral 70% vs surface     | 3.82 / 3.80 / 3.70 / 3.50        | ≥ 3                    |
| **Default border Sky 14% vs surface** | **1.18 / 1.18 / 1.23 / 1.26**    | **< 3: D-I3**          |
| Disabled (opacity 60%)                | —                                | Exempt (1.4.3, 1.4.11) |

## 8. Motion

Figma has no reactions. Transition `border-color` and `box-shadow` only, `duration-base`
`ease-standard`. No transform.

## 9. Component API (proposal)

```ts
// src/shared/ui/Input.tsx — Server Component
import type { InputHTMLAttributes, ReactNode, Ref } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children"> {
  /** Visible label (Figma `Label`). Required: it is also the accessible name. */
  label: ReactNode;
  /** Inline error (Figma `Message`). Non-empty → Error state, aria-invalid, aria-describedby. */
  error?: string;
  /** Forwarded to the native <input> (React 19 ref-as-prop). */
  ref?: Ref<HTMLInputElement>;
  /** Layout only, on the outer wrapper (margin, width). Never colors, size or typography. */
  className?: string;
}
```

- `type` defaults to `"text"`.
- `className` goes on the wrapper. Every other prop goes to the `<input>`.
- An existing `aria-describedby` from the caller is kept and the error id is appended.

## 10. Files

**Delivered by Mariam:** `src/shared/ui/Input.tsx` and `src/shared/ui/Input.test.tsx` only.

**Not edited by Mariam:** design-system, `src/app` (Yousef adds the gallery section),
`package.json`/lockfile, messages, config, `Button.tsx`, `Icon.tsx`. She imports the existing
`Icon` (`name="alert"`, `size={14}`) and does not change it.

## 11. Required tests

**Component (`Input.test.tsx`, Vitest + Testing Library + jest-axe):**

1. Renders a native `<input>`, `type="text"` by default; `email`/`password` pass through.
2. The label is linked: `getByLabelText(label)` works in Arabic and English. A caller `id` is
   respected, and otherwise ids are unique across two inputs.
3. Error: the message is rendered, `aria-invalid="true"`, and `aria-describedby` contains the
   message id (and keeps a caller value). With no error, neither attribute is present and the
   message is not rendered.
4. Classes per state: default border 14%, focus border 70% plus glow, error border Coral 70%,
   disabled opacity 60%. No hex values, no left/right utilities, no transform.
5. Typing updates an uncontrolled input; a controlled input calls `onChange`.
6. Disabled: the `disabled` attribute is set, the input is skipped by Tab, and typing does nothing.
7. Native attributes (`name`, `autoComplete`, `required`, `maxLength`, `placeholder`) and `ref`
   pass through.
8. `className` is on the wrapper, merged last.
9. jest-axe: default / error / disabled × `rtl`/`ltr` = 6 cases, no violations (contrast off in
   jsdom).

**Integration (Yousef, `/dev/components`):** computed height 46, padding 14, radius 12, colors
per state; focus by Tab and by click; rendered contrast for every row of §7 on the allowed
surfaces; axe; 1440/768/390/320 in RTL/LTR with no overflow.

## 12. Decisions for the user

| ID   | Question                                                                                                                                                                               | Recommendation                                                                                                                                                                                                                                          |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-I1 | Which Figma input is Input V1? The in-app `Settings / Profile Input` (46 px, Ink, Caption label) and the Auth input (52 px, Obsidian, 14 Medium white label, 15 px value) differ.      | **V1 = Settings / Profile Input.** Auth styling is added in Phase 08 as a `size`/`tone` prop on the same component, not as a copy. Password and Search inputs are later deliveries.                                                                     |
| D-I2 | Focus indicator. D-B2 says every Phase 03 primitive uses a 2px Electric Sky outline with a 2px offset. Figma designs an explicit Focused state for this input (border Sky 70% + glow). | **Use the Figma Focused state** (border 70% + glow, 4.19:1 on Ink) instead of the outline, for text fields only. D-B2 stays for buttons and other controls.                                                                                             |
| D-I3 | The default border (Sky 14%) is 1.18:1 against the surface, below the 3:1 non-text contrast. The field fill (Ink) is also about 1:1 with the page.                                     | **Keep Figma.** WCAG 1.4.11 does not require the boundary when the field is identified by its visible label and position, as here (label always required). Record this in `design-values.md`. Alternative: a stronger border, which changes the design. |
| D-I4 | Placeholder color is not in this set.                                                                                                                                                  | **Text / Muted Readable `#8d8d8f`** (Auth input and Figma audit 02C-04H; 6.05:1 on Ink). Placeholders never replace the label.                                                                                                                          |

## 13. Acceptance checklist (Yousef at intake)

- [ ] `DELIVERY.md` has the full baseline hash. Only `Input.tsx` and `Input.test.tsx` changed.
- [ ] Height 46, padding-inline 14, radius 12, gap 6, label `text-dashboard-caption` Text /
      Secondary, value `text-dashboard-body` Text / Primary.
- [ ] State colors match §4 with tokens and opacity modifiers. No hex. Fill `bg-surface-ink`.
- [ ] Focus per D-I2, error per §4 with the `alert` icon at 14 px, disabled opacity 60%.
- [ ] `label` required and linked. `aria-invalid` and `aria-describedby` only with an error.
- [ ] No validation logic inside the component. No hover, no password toggle, no icons other
      than the error icon.
- [ ] Logical utilities only. RTL and LTR verified.
- [ ] No new dependencies. Real results for typecheck, lint, format:check, test and build.
- [ ] All tests in §11 present and passing.
- [ ] Screenshots: 4 states (focus captured live) × RTL/LTR at 1440/768/390 and no overflow at 320.

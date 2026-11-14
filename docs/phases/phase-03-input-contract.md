# Component contract — Input (Phase 03, Mariam delivery 2)

- **Status:** **Draft v2 — D-I1, D-I2 and D-I4 approved by the user (2026-11-14). D-I3 open**
  (evidence in §12.2). The contract becomes final when D-I3 is decided. Mariam starts only after
  this contract is merged and she has received the new starter (§10).
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, component set `Settings / Profile Input` frame
  `2461:591` (page `14 — Profile & Settings`), read read-only via the Figma MCP on 2026-11-14.
  Every value labelled FIGMA was read from the node itself. Figma is not modified.
- **Implementer:** Mariam. **Reviewer and integrator:** Yousef.
- **Delivery name:** `munsit-delivery-shared-ui-input-<YYYYMMDD>-v1.zip`
- **Reference implementation:** `src/shared/ui/Button.tsx` (class style, named local constants,
  focus pattern). Do not change Button.

## 1. Source and states (FIGMA)

V1 implements only the in-app text field (D-I1):

| Figma set                                    | Node                  | Use                    | V1                      |
| -------------------------------------------- | --------------------- | ---------------------- | ----------------------- |
| **Settings / Profile Input**                 | `2461:591`            | In-app forms (Profile) | **Yes**                 |
| Settings / Password Input (Hidden/Shown/Err) | `2461:622`            | Change password        | **No**                  |
| Auth / Input, Auth / Password Input (52 px)  | (instances on page 5) | Login/Register         | **No**: Phase 08 (D-I1) |
| Search Input                                 | `2210:135`            | Top bar, with icon     | **No**                  |

The text properties are `Label` (default "الاسم الكامل"), `Value` and `Message` (default
"اكتب اسمك الكامل.").

| State    | Node       | In code                                          |
| -------- | ---------- | ------------------------------------------------ |
| Default  | `2461:568` | resting                                          |
| Focused  | `2461:572` | `:focus-visible` (interaction state, not a prop) |
| Error    | `2461:576` | `error` prop (non-empty string)                  |
| Disabled | `2461:587` | native `disabled`                                |

Real use: `Settings Group` `2463:3514` → `Edit Profile Form` (states board `2464:5195`: Default,
Editing, Invalid email, Missing name, …).

## 2. Size and layout (FIGMA)

| Property             | Value                               | Implementation                             |
| -------------------- | ----------------------------------- | ------------------------------------------ |
| Field height         | 46 (fixed)                          | Local constant `h-[46px]` (component size) |
| Width                | Fills its container                 | `w-full`; the caller sets the width        |
| Field padding inline | 14 start and end                    | Local constant `px-[14px]` (not a token)   |
| Field radius         | 12                                  | Token Radius MD: `rounded-md`              |
| Field border         | 1px inside                          | `border` with border-box (height stays 46) |
| Label/field/message  | gap 6                               | Local constant `gap-[6px]` (not a token)   |
| Message row          | alert icon 14 + gap 6 + text        | `flex items-center gap-[6px]`              |
| Totals               | 70 (no message) / 94 (with message) | Checked in the browser                     |

## 3. Typography (FIGMA, bound styles)

| Part          | Style                               | Utility                  | Color (token)                                 |
| ------------- | ----------------------------------- | ------------------------ | --------------------------------------------- |
| Label         | `Dashboard/Caption` Cairo 400 12/18 | `text-dashboard-caption` | `text-text-secondary`                         |
| Value         | `Dashboard/Body` Cairo 400 14/22    | `text-dashboard-body`    | `text-text-primary`                           |
| Placeholder   | as value                            | —                        | `placeholder:text-text-muted-readable` (D-I4) |
| Error message | `Dashboard/Caption` Cairo 400 12/18 | `text-dashboard-caption` | `text-accent-coral-pulse`                     |

## 4. Colors per state (FIGMA)

Tokens with opacity modifiers only. No literal hex values in the code.

| State         | Fill                         | Border (1px)         | Effect                                   | Whole block                           |
| ------------- | ---------------------------- | -------------------- | ---------------------------------------- | ------------------------------------- |
| Default       | `bg-surface-ink` (`#07080a`) | Electric Sky **14%** | —                                        | —                                     |
| Focused       | `bg-surface-ink`             | Electric Sky **70%** | Glow `0 0 6px 2px rgba(99,161,255,0.25)` | —                                     |
| Error         | `bg-surface-ink`             | Coral Pulse **70%**  | —                                        | —                                     |
| Error + focus | `bg-surface-ink`             | Coral Pulse **70%**  | same glow                                | — (not designed; keeps error visible) |
| Disabled      | `bg-surface-ink`             | Electric Sky **14%** | none, never focused                      | opacity **60%** (label, field, value) |

- Figma fills the field with the unbound literal `#07080a`, which is exactly Surface / Ink.
- Glow: one named local constant `INPUT_FOCUS_GLOW` (like Button `PRIMARY_HOVER_SHADOW`).
- The Default border is **subject to D-I3**. Implement 14% unless the user decides otherwise.
- **Hover:** not designed, so none in v1.

## 5. Behavior

- Native `<input>`, `type="text"` by default. `email`, `tel`, `url` and `number` pass through.
  **No Password Input and no Search Input in V1**, so no visibility toggle and no search icon.
- Controlled and uncontrolled both work. All native attributes pass through (`name`,
  `autoComplete`, `required`, `maxLength`, `inputMode`, `placeholder`, …).
- **Validation belongs to the parent form, not to Input.** The form decides when to set `error`
  (project rule: validate on blur, and clear the error as soon as the value is valid). Input only
  renders the state it is given and never validates on its own.
- Disabled: native `disabled`. Not focusable, no focus style, not submitted.
- Server Component (no `"use client"`). `useId` is allowed.

## 6. RTL / LTR

- The label, value and message align to the inline start (right in `ar`, left in `en`). Use only
  logical utilities, never `left`/`right`.
- The error icon sits at the inline start of the message (right in RTL, as in Figma) and does not
  mirror (`alert` is not on the mirror whitelist).
- Input adds no `dir`. Figma shows the in-app email value LTR and left-aligned, so callers pass
  `dir="ltr"` for email, URL and code fields. The gallery shows this case.

## 7. Accessibility (WCAG 2.2 AA)

- **Required label:** `label` is a required prop, rendered as `<label htmlFor>`. The id comes from
  `id` or `useId()`.
- **Error:** the message comes with the `alert` icon (`aria-hidden`, decorative; the text carries
  the meaning). It sets `aria-invalid="true"` and `aria-describedby` pointing to the message id,
  appended to any `aria-describedby` from the caller. Without an error, neither attribute is set
  and no message is rendered. No live region in v1, because the form owns announcements.
- **Focus (D-I2):** `:focus-visible`. It must be clearly visible with the keyboard. Text fields
  also match `:focus-visible` on mouse focus, which is expected.
- Target size 46 high (2.5.8).
- **Contrast** (WCAG arithmetic from tokens, 2026-11-14; text needs 4.5, non-text 3). The surfaces
  are the real ones: page Void Black and the Settings Group card (Obsidian 90% over Void =
  `#101113`), plus Obsidian and Graphite.

| Pair                                    | Void / Card / Obsidian / Graphite | Result                 |
| --------------------------------------- | --------------------------------- | ---------------------- |
| Label Text / Secondary on surface       | 7.44 / 6.89 / 6.83 / 6.22         | AA                     |
| Error message Coral on surface          | 7.01 / 6.49 / 6.44 / 5.86         | AA                     |
| Value white on Ink                      | 20.04                             | AA                     |
| Placeholder Muted Readable on Ink       | 6.05                              | AA (D-I4)              |
| Focus border Sky 70% vs surface / Ink   | 4.21 / 4.12 / 4.09 / 3.88; 4.19   | ≥ 3 (D-I2)             |
| Error border Coral 70% vs surface / Ink | 3.82 / 3.68 / 3.70 / 3.50; 3.80   | ≥ 3                    |
| Default border Sky 14%                  | 1.18 / 1.23 / 1.23 / 1.26         | **< 3: D-I3**          |
| Ink fill vs surface                     | 1.02 / 1.06 / 1.07 / 1.17         | **< 3: D-I3**          |
| Disabled (opacity 60%)                  | —                                 | Exempt (1.4.3, 1.4.11) |

## 8. Motion

No Figma reactions. Transition `border-color` and `box-shadow` only, `duration-base`
`ease-standard`. No transform.

## 9. Component API

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

`type` defaults to `"text"`. `className` goes on the wrapper; every other prop goes to the
`<input>`. The component imports the existing `Icon` (`name="alert"`, `size={14}`).

## 10. Delegation and instructions for Mariam

**Delegated files (only these two):**

- `src/shared/ui/Input.tsx`
- `src/shared/ui/Input.test.tsx`

Mariam does **not** edit any other file: no `Button.tsx`, `Icon.tsx`, design-system, `src/app`
(the gallery is Yousef's job), messages, config, `package.json` or the lockfile. She installs no
packages. Any other need goes in the requests table of `DELIVERY.md`.

**Steps:**

1. Unzip the new starter into an empty folder (it is built from `main` after this contract is
   merged and includes Button V1). Run `corepack pnpm install --frozen-lockfile` and then
   `corepack pnpm check`, which must pass before any change.
2. Implement §2–§9. Copy the patterns from `Button.tsx`: full class strings, named constants,
   no hex values.
3. Write the tests in §11.
4. For screenshots, she may use a local-only preview page and delete it before packaging, as with
   Button.
5. Deliver `files/src/shared/ui/Input.tsx`, `files/src/shared/ui/Input.test.tsx`, `DELIVERY.md`
   (with the full baseline hash from `BASELINE_COMMIT.txt`, real check results and known issues),
   `screenshots/` and `evidence/`. Follow
   [FEATURE_DELIVERY_CHECKLIST.md](../FEATURE_DELIVERY_CHECKLIST.md).

## 11. Required tests

**Component (`Input.test.tsx`, Vitest + Testing Library + jest-axe):**

1. A native `<input>`, `type="text"` by default; `email` passes through.
2. Label linked: `getByLabelText` works in Arabic and English. A caller `id` is respected; two
   inputs without ids get unique ids.
3. Error: message and icon rendered; `aria-invalid="true"`; `aria-describedby` has the message id
   and keeps a caller value. With no error, neither attribute is set and no message is rendered.
4. Classes per state: default border 14%, `focus-visible:` border 70% plus glow, error Coral 70%,
   disabled opacity 60%, placeholder `text-muted-readable`. No hex, no left/right utilities, no
   transform, and no plain `focus:` style.
5. Typing updates an uncontrolled input. A controlled input calls `onChange`.
6. Disabled: the attribute is set, Tab skips the input, and typing does nothing.
7. `name`, `autoComplete`, `required`, `maxLength`, `placeholder`, `dir` and `ref` pass through.
8. `className` is on the wrapper, merged last.
9. The component never sets `error` on its own (for example, on blur with an empty required value).
10. jest-axe: default / error / disabled × `rtl`/`ltr` = 6 cases, no violations (contrast off in
    jsdom).

**Integration (Yousef, `/dev/components`):** computed size and colors per state; focus by Tab;
rendered contrast for every row of §7 on the real surfaces; axe; 1440/768/390/320 in RTL and LTR
with no overflow.

## 12. Decisions

### 12.1 Decided by the user (2026-11-14)

| ID   | Decision                                                                                                                                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-I1 | **Approved:** V1 = the in-app Input (46 px). The Auth Input (52 px) is deferred to Phase 08. How it relates to this component (prop or separate) is **not decided** until Auth is fully inspected.                        |
| D-I2 | **Approved:** Figma Focused state: Electric Sky border 70% + glow `0 0 6px 2px` at 25%, on `:focus-visible`, clearly visible with the keyboard and contrast-tested against the surroundings (§7). D-B2 stays for buttons. |
| D-I4 | **Approved:** placeholder Text / Muted Readable through the existing token (`placeholder:text-text-muted-readable`), never hex. 6.05:1 on Ink, so it passes on every surface (the placeholder sits on the Ink fill).      |

### 12.2 D-I3: Default field identification (open, evidence below)

**Measurements** (token values, WCAG arithmetic, real surroundings from `Settings Group`
`2463:3514`: card `rgba(17,18,20,0.9)` over the page = `#101113`):

- The Ink fill against its surroundings is 1.02 (page), **1.06 (card, the real case)**, 1.07
  (Obsidian) and 1.17 (Graphite). The fill alone does not separate the field.
- The default border Sky 14% is 1.18–1.26, against both the surroundings and the Ink fill.
- **Result:** the field boundary does **not** meet the 3:1 non-text contrast (SC 1.4.11).

**Can the field be identified without the border?**

- Yes, when it shows text: the label (6.89 on the card) sits directly above it, and the value
  (20:1) or a placeholder (6.05:1) marks the input area. In every Figma use (Edit Profile form,
  states board `2464:5195`) the fields are labelled and filled.
- No, when it is empty and has no placeholder: the input area is visible only through the 14%
  border. Where to click and how wide the field is are not perceivable at 3:1.

**Smallest change if 3:1 is required** (Default border only; fill, Focus, Error and Disabled
unchanged; nothing applied without approval):

| Option | Default border                               | Worst contrast (all surfaces and Ink) | Trade-off                                                                  |
| ------ | -------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| A      | Electric Sky **58%** (`/58`)                 | 3.08                                  | Same hue. Close to Focus (70%), so Focus is told apart mostly by the glow. |
| B      | Text / Muted `#6a6b6c` (`border-text-muted`) | 3.19                                  | Neutral grey; blue stays reserved for Focus. Different hue from Figma.     |
| C      | Keep 14% and require placeholder or value    | 1.18 (border); identification by text | No visual change, but it cannot be guaranteed for every empty field.       |

**Recommendation:** **B.** It is the smallest token-only change that passes on every surface, and
it keeps Focus (blue + glow) clearly different from Default. If the Figma look must stay, C with a
rule that every Input has a placeholder is the fallback. Figma is not modified either way; the
deviation is recorded in `docs/design-values.md`, like D-B6.

## 13. Acceptance checklist (Yousef at intake)

- [ ] `DELIVERY.md` has the full baseline hash. Only `Input.tsx` and `Input.test.tsx` changed.
- [ ] Native `<input>`, required visible label linked by `htmlFor`/`id`.
- [ ] Height 46, padding-inline 14, radius 12, gap 6; label Caption / Text Secondary; value Body /
      Text Primary; placeholder token per D-I4.
- [ ] State colors per §4 (Default border per D-I3) with tokens and opacity modifiers. No hex.
- [ ] Focus per D-I2 on `:focus-visible`. Error: Coral 70% border, message with a 14px `alert`
      icon, `aria-invalid`, `aria-describedby`. Disabled: native, opacity 60%.
- [ ] No validation logic inside the component. No hover, no Password or Search input.
- [ ] Logical utilities only. RTL and LTR verified, email shown with `dir="ltr"`.
- [ ] No new dependencies. Real results for typecheck, lint, format:check, test and build.
- [ ] All tests in §11 present and passing.
- [ ] Screenshots: 4 states (focus captured live by Tab) × RTL/LTR at 1440/768/390 and no
      overflow at 320.

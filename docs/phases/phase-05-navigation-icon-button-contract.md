# Component contract — Navigation Icon Button (O-8, before Phase 05)

- **Status:** **PROPOSED.** This is not approved and not implemented. Open decisions are D-NIB1 to
  D-NIB6 (§13).
- **Obligation:** ADR-002 item 8. The component must be specified before Phase 05 starts.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read-only on 2026-11-16 (Plugin API). Figma is not
  modified.
- **Owner:** Yousef (`src/shared` is Yousef-owned). Implementation by Claude after approval.
- **Planned files (after approval):** `src/shared/ui/NavigationIconButton.tsx`, its test file, a
  gallery section and an E2E spec.

## 1. Purpose

A square, icon-only control used by the app shell for:

- the **Tablet Rail destinations** (8; the current destination uses the Active state);
- the **Rail menu** button, which opens the drawer;
- the **Rail plan-upgrade** button;
- the **Top Bar theme toggle** (moon);
- the **Top Bar notifications trigger** (bell).

It is either a navigation link or a button, never both.

## 2. Figma evidence

The component set is `Navigation Icon Button` `2210:134` (page 03). Its properties are
`State` = Default | Hover | Active, plus an icon instance swap.

| Property | Default                              | Hover                   | Active                  |
| -------- | ------------------------------------ | ----------------------- | ----------------------- |
| Size     | 40 × 40, no padding, icon centred    | same                    | same                    |
| Radius   | 12                                   | 12                      | 12                      |
| Fill     | White 4% (`255,255,255 @ 4%`)        | Electric Sky 10%        | Electric Sky 18%        |
| Border   | 1px inside, Electric Sky 12%         | 1px Electric Sky 30%    | 1px Electric Sky 45%    |
| Icon     | 20 × 20, Text / Secondary (variable) | 20 × 20, Text / Primary | 20 × 20, Text / Primary |
| Effects  | none                                 | none                    | none                    |

**Instances found on the Dashboard page:** 75 in total, all 40 × 40.

- **Tablet Rail:** 8 destinations (`home` Active on the Dashboard), the `menu` button (prototype
  link → "Overlay / Tablet / Navigation Expanded") and the `crown` upgrade button. On Settings
  (Tablet) **no** Rail item is Active.
- **Top Bar:** theme toggle `moon` (Default) and the notifications trigger `bell` (Default). The
  bell sits in a wrapper with a 9 px Coral Pulse "Unread Dot" (2px Void Black ring, absolute).

**Related but not instances:** the **mobile** Top Bar "Search Button" (a 44 × 44 frame, radius 12,
White 4%, Sky 12% border, `search` icon at 18) and the mobile notifications wrapper (44 × 44,
holding a 40 button). These are the same visual language at 44.

**Not designed in Figma:** pressed, focus-visible, disabled and motion. The component has no
prototype reactions and no description.

## 3. Reuse decision

**A new component**, not a Button variant:

- The Phase 03 Button is label-only (D-B4: no icons), 44 high, with different fills (Primary
  Electric Sky, Secondary Sky 16%/55% on hover).
- Its contract excludes icon-only buttons and names the Navigation Icon Button as separate.

Shared parts are **reused**, not copied: the D-B2 focus ring, the `Icon` component, the motion
tokens and the fine-pointer hover rule (M-1).

## 4. Component API (proposed)

```tsx
// Navigation (Rail destination): renders a locale-aware next-intl <Link>.
<NavigationIconButton icon="home" label={t("destinations.dashboard")} href={{ pathname: "/dashboard" }} active />

// Action (menu, theme, notifications, upgrade): renders <button type="button">.
<NavigationIconButton icon="menu" label={t("openMenu")} onClick={openDrawer} aria-expanded={open} aria-haspopup="dialog" />
```

- `icon: IconName` (required; the existing manifest).
- `label: string` (required): becomes the accessible name (`aria-label`). It is never visible.
- **Either** `href` (a typed next-intl pathname from `@/i18n/routes`) **or** `onClick`, enforced
  with a discriminated union.
- `active?: boolean`, for links only. It renders `aria-current="page"` together with the Active
  visual (D-R6: never used for More or for an action).
- For buttons only: `pressed?: boolean` → `aria-pressed`, `aria-expanded`, `aria-haspopup`,
  `aria-controls` (D-NIB4).
- `size?: "md" | "lg"` (D-NIB1): `md` = 40/icon 20 (Figma component); `lg` = 44/icon 18 (Figma
  mobile frames).
- `className?` (layout only), `ref`.
- **Rejected at type level:** `children`, `role`, `tabIndex`, `variant`, any colour or size override.

## 5. Tokens and classes (existing tokens only)

| Part                 | Classes                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Box `md`             | `size-[40px] rounded-md border` (radius 12 = `rounded-md`)                                                                                 |
| Box `lg`             | `size-[44px] rounded-md border`                                                                                                            |
| Default              | `bg-text-primary/4 border-accent-electric-sky/12 text-text-secondary`                                                                      |
| Hover (fine pointer) | `[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent-electric-sky/10 …:hover:border-accent-electric-sky/30 …:hover:text-text-primary` |
| Active               | `bg-accent-electric-sky/18 border-accent-electric-sky/45 text-text-primary`                                                                |
| Focus-visible        | D-B2: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky`       |
| Icon                 | `Icon` 20 (`md`) / 18 (`lg`), `aria-hidden`, colour `currentColor`                                                                         |
| Motion               | `transition-colors duration-base ease-standard` (D-NIB5)                                                                                   |

**Local constants, not tokens:** 40, 44, opacity modifiers.

## 6. Interaction states

| State               | Source                             | Proposed behaviour                                                                                   |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Default             | FIGMA                              | §2                                                                                                   |
| Hover               | FIGMA                              | Fine pointers only (`(hover: hover) and (pointer: fine)`, as Button, Menu and Tabs)                  |
| Active              | FIGMA                              | Current destination (`aria-current="page"`). For buttons: an open popover or menu (D-NIB4)           |
| Pressed (`:active`) | **Not designed** (D-NIB2)          | Proposal: Sky 14% fill with the hover border, 120 ms, like the Button pressed timing. Needs approval |
| Focus-visible       | Not designed; D-B2 is project-wide | D-B2 ring                                                                                            |
| Disabled            | **Not designed** (D-NIB3)          | Proposal: not supported in V1; no shell use needs it                                                 |

## 7. Accessibility

- **Name:** `label` is required; there is no visible text. The icon is decorative.
- **Links:** `aria-current="page"` only when `active`.
- **Buttons:** `aria-expanded` and `aria-haspopup` for the menu, theme and notifications triggers.
  `aria-pressed` only for a real toggle.
- **Contrast:** the icon against the composited fill, and the 1.4.11 boundary for the control, are
  measured in Chromium at integration. Text / Secondary 6.94 on Obsidian-level surfaces is
  expected; it is verified, not assumed.
- **Tooltip:** not designed (D-NIB6). The accessible name comes from `aria-label`. A visible
  tooltip is an optional enhancement and would consume deferred primitive O-6.
- **Target size:** 40 × 40 (`md`) passes WCAG 2.5.8 AA (24). `lg` 44 is used on mobile, following
  the Figma mobile frames.

## 8. RTL / LTR

- The box is symmetric. Icons mirror only from the existing whitelist; `menu`, `bell`, `moon`,
  `crown` and the destination icons do not mirror.
- The unread dot's position belongs to the notifications wrapper (Phase 05), not this component.

## 9. Motion

- `transition-colors` over `duration-base` with `ease-standard`: colour only, no transform.
- Reduced motion keeps colour fades only (project rule).

## 10. Keyboard

- Native semantics: Enter activates a link; Enter and Space activate a button.
- It is in the Tab order; there is no roving tabindex inside the Rail (each is a link in a `nav`).

## 11. Responsive

The component has no breakpoints. The shell chooses `md` (Rail, Top Bar) or `lg` (mobile Top Bar).

## 12. Acceptance and required tests

- **Unit:**
  - classes per state and size;
  - link vs button rendering;
  - `aria-current` only on active links;
  - `aria-expanded`/`aria-pressed` pass-through;
  - the label becomes the accessible name;
  - the icon is `aria-hidden`;
  - type-level rejections (`@ts-expect-error`: both `href` and `onClick`; `active` on a button;
    missing `label`; `children`; `role`; `tabIndex`);
  - axe in RTL and LTR.
- **Browser (gallery):**
  - computed size, fill, border and icon colour per state;
  - hover on fine pointers only (stylesheet check, as M-1);
  - focus ring;
  - rendered icon contrast;
  - keyboard activation;
  - 1440/768/390/320.

## 13. Open decisions

| ID     | Question                                                                                 | Recommendation                                                                      |
| ------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| D-NIB1 | Add a `lg` 44 / icon 18 size for mobile (Figma mobile frames), or use 40 everywhere?     | Add `lg`: it matches the Figma mobile Search Button and the 44 notification wrapper |
| D-NIB2 | Pressed state (not designed)                                                             | Sky 14% fill + hover border, 120 ms (consistent with Button pressed timing)         |
| D-NIB3 | Disabled state (not designed)                                                            | Not in V1                                                                           |
| D-NIB4 | Active on action buttons (for example the bell while the notifications popover is open)? | Yes: Active visual + `aria-expanded="true"`, never `aria-current`                   |
| D-NIB5 | Motion: colour transition 200 ms                                                         | Approve (no movement)                                                               |
| D-NIB6 | A visible tooltip on hover or focus for icon-only Rail items?                            | Not in V1 (not designed). Revisit with O-6 Tooltip if usability testing needs it    |

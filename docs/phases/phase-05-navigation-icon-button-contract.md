# Component contract — Navigation Icon Button (O-8, before Phase 05)

- **Status:** **Approved — final** (user, 2026-11-16). D-NIB1 to D-NIB6 are resolved (§13). Not
  implemented yet: implementation needs the separate Phase 05 authorization.
- **Obligation:** ADR-002 item 8. Specified before Phase 05 starts.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read-only on 2026-11-16 (Plugin API). Figma is not
  modified. **FIGMA** marks verified values; **APPROVED PROPOSAL** marks product-owner-approved
  values that Figma does not define.
- **Owner:** Yousef (`src/shared` is Yousef-owned). Implementation by Claude.
- **Planned files:** `src/shared/ui/NavigationIconButton.tsx`, `NavigationIconButton.test.tsx`, a
  gallery section and an E2E spec.

## 1. Purpose

A square, icon-only control used by the app shell for:

- the **Tablet Rail destinations** (8; the current destination is Active);
- the **Rail menu** button (opens the drawer);
- the **Rail plan-upgrade** button;
- the **Top Bar theme toggle**;
- the **Top Bar notifications trigger**;
- the **mobile search and notifications actions** (44 size).

It is a navigation link or a button, never both.

## 2. Figma evidence (FIGMA)

The component set is `Navigation Icon Button` `2210:134` (page 03), with properties `State` =
Default | Hover | Active, plus an icon swap.

| Property | Default                           | Hover                   | Active                  |
| -------- | --------------------------------- | ----------------------- | ----------------------- |
| Size     | 40 × 40, no padding, icon centred | same                    | same                    |
| Radius   | 12                                | 12                      | 12                      |
| Fill     | White 4%                          | Electric Sky 10%        | Electric Sky 18%        |
| Border   | 1px inside, Electric Sky 12%      | 1px Electric Sky 30%    | 1px Electric Sky 45%    |
| Icon     | 20 × 20, Text / Secondary         | 20 × 20, Text / Primary | 20 × 20, Text / Primary |

- **Instances:** 75, all 40 × 40.
  - Rail: 8 destinations (`home` Active on the Dashboard), `menu` (→ drawer) and `crown` (upgrade).
  - Top Bar: `moon` and `bell`; the bell wrapper holds a 9 px Coral "Unread Dot".
  - On Settings (Tablet), no Rail item is Active.
- **The 44 size:** the mobile "Search Button" is a 44 × 44 frame with the same fill, border and
  radius and an 18 px icon. The mobile notifications wrapper is 44 × 44 around a 40 button.
- **Not designed:** pressed, focus-visible, disabled, motion.

## 3. Reuse decision (APPROVED)

A distinct component, not a Button variant:

- The Phase 03 Button is label-only (D-B4) and 44 high, with other fills.
- It reuses the D-B2 focus ring, `Icon`, the motion tokens and the fine-pointer hover rule (M-1).

## 4. Component API

```tsx
// Navigation (Rail destination) → locale-aware next-intl <Link>
<NavigationIconButton icon="home" label={t("destinations.dashboard")} href="/dashboard" active />

// Action (menu, theme, notifications, search, upgrade) → <button type="button">
<NavigationIconButton icon="menu" label={t("shell.openMenu")} onClick={openDrawer} aria-expanded={open} aria-haspopup="dialog" />
```

- `icon: IconName` (required).
- `label: string` (required) → the accessible name (`aria-label`); never visible.
- A **discriminated union**:
  - **link:** `href` (a typed next-intl pathname from `@/i18n/routes`) and optional `active`;
  - **button:** `onClick`, plus optional `aria-expanded`, `aria-haspopup`, `aria-controls` and
    `aria-pressed`.
  - `active` exists **only** on links (D-NIB4).
- `size?: "md" | "lg"` (D-NIB1): `md` (default) = 40 / icon 20 (FIGMA); `lg` = 44 / icon 18
  (FIGMA mobile frames).
- `disabled?: boolean` (D-NIB3).
- `className?` (layout only), `ref`.
- **Rejected at type level:** `children`, `role`, `tabIndex`, `variant`, colour or size overrides,
  `active` on a button, both `href` and `onClick`, a missing `label`.

## 5. Tokens and classes (existing tokens only)

| Part                 | Classes                                                                                                                         | Source                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Box `md`             | `size-[40px] rounded-md border`                                                                                                 | FIGMA                                                                |
| Box `lg`             | `size-[44px] rounded-md border`                                                                                                 | FIGMA (mobile)                                                       |
| Default              | `bg-text-primary/4 border-accent-electric-sky/12 text-text-secondary`                                                           | FIGMA                                                                |
| Hover (fine pointer) | `[@media(hover:hover)_and_(pointer:fine)]:hover:` → `bg-accent-electric-sky/10 border-accent-electric-sky/30 text-text-primary` | FIGMA + M-1 rule                                                     |
| Pressed (`:active`)  | `active:bg-accent-electric-sky/14 active:border-accent-electric-sky/30 active:text-text-primary` + `active:duration-fast`       | **APPROVED PROPOSAL** (D-NIB2)                                       |
| Active (destination) | `bg-accent-electric-sky/18 border-accent-electric-sky/45 text-text-primary`                                                     | FIGMA                                                                |
| Focus-visible        | D-B2 ring (`outline-2`, offset 2, Electric Sky)                                                                                 | Project rule (D-B2)                                                  |
| Disabled             | `opacity-50 cursor-default`, with no hover or pressed styles                                                                    | **APPROVED PROPOSAL** (D-NIB3), as the Tabs and Menu disabled states |
| Icon                 | `Icon` 20 (`md`) / 18 (`lg`), `aria-hidden`, `currentColor`                                                                     | FIGMA                                                                |
| Motion               | `transition-colors duration-base ease-standard`                                                                                 | Existing tokens (D-NIB5)                                             |

**Local constants:** 40, 44 and the opacity modifiers. No new token.

## 6. Interaction states

| State              | Behaviour                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default            | FIGMA                                                                                                                                                        |
| Hover              | FIGMA, on fine pointers only                                                                                                                                 |
| Pressed            | **Transient** `:active` feedback only (APPROVED PROPOSAL). It never persists and is never used to show selection                                             |
| Active             | **Persistent selection of a navigation destination only**: a link with `active`, rendered with `aria-current="page"`. Never used for action buttons (D-NIB4) |
| Expanded (actions) | No Active visual. The open state is exposed with `aria-expanded="true"`; the visual stays Default or Hover                                                   |
| Focus-visible      | D-B2 ring                                                                                                                                                    |
| Disabled           | See §7                                                                                                                                                       |

## 7. Accessibility

- **Accessible name:** `label` is required for every variant, independent of any tooltip
  (D-NIB6). The icon is decorative.
- **Links:** `aria-current="page"` only when `active`.
- **Buttons:**
  - `aria-expanded` and `aria-haspopup` on triggers that open a menu, popover or dialog;
  - `aria-pressed` only for a true toggle.
- **Disabled (D-NIB3):**
  - **Button:** the native `disabled` attribute. It does not activate. It is removed from the Tab
    order by the browser, and screen readers announce it as dimmed or unavailable.
  - **Link:** anchors have no native disabled state. A disabled link renders a **non-interactive
    `<span role="link" aria-disabled="true" aria-label={label}>`** with no `href`, no `tabIndex`
    and no handlers. It cannot be activated or focused with Tab, and screen readers still announce
    it as an unavailable link.
  - Use disabled only where a design or a decision requires it. No Phase 05 shell control is
    disabled by default.
- **Target size (D-NIB1):**
  - The 40 × 40 visible box passes **WCAG 2.5.8 AA (24 × 24)** with room to spare, and the Rail's
    10 px gaps keep neighbouring targets apart.
  - Touch-first mobile actions use `lg` 44 × 44 (FIGMA), which also meets the 44 px AAA guidance.
  - The 40 px Figma size is kept wherever Figma uses it (Rail, desktop and tablet Top Bar). There
    is no invisible hit-area expansion, so layout stays exactly as designed.
- **Contrast:** the icon against the composited fill, and the control boundary, are measured in
  Chromium (gallery E2E). They are verified, not assumed.

## 8. RTL / LTR

- The box is symmetric. Icons mirror only from the existing whitelist; none of the shell icons
  (`menu`, `bell`, `moon`, `crown`, `search`, destinations) mirror.
- The unread-dot position belongs to the notifications wrapper, and no dot is shown without data
  (plan D-S5).

## 9. Motion (D-NIB5)

- Colour-state transitions only (`transition-colors`).
- `duration-base` (200 ms) for state changes and `duration-fast` (120 ms) for pressed, with
  `ease-standard`. These are existing tokens; no new durations.
- No transform or scale.
- Reduced motion: only colour fades remain, which is the project rule; no movement exists to
  remove.

## 10. Keyboard

- Links: Enter activates. Buttons: Enter and Space activate.
- In the Tab order, with no roving tabindex. Disabled controls are skipped (§7).

## 11. Responsive

No breakpoints inside the component. The shell picks `md` (Rail, desktop and tablet Top Bar) or
`lg` (mobile Top Bar actions).

## 12. Acceptance criteria and required tests

- **Unit tests (`NavigationIconButton.test.tsx`):**
  - classes per state and size;
  - link vs button vs disabled-link rendering;
  - `aria-current` only on active links, never on buttons;
  - `aria-expanded`, `aria-haspopup` and `aria-pressed` pass-through;
  - the label is the accessible name; the icon is `aria-hidden`;
  - disabled buttons do not fire `onClick`; disabled links have no `href` and are not focusable;
  - compile-time `@ts-expect-error`: both `href` and `onClick`; `active` on a button; missing
    `label`; `children`; `role`; `tabIndex`; `variant`; an unknown `size`;
  - jest-axe in RTL and LTR for every variant.
- **Browser tests (gallery):**
  - computed size, fill, border and icon colour for Default, Hover, Active, Pressed and Disabled;
  - hover limited to fine pointers (stylesheet check, as M-1);
  - D-B2 focus ring;
  - rendered icon contrast;
  - keyboard activation;
  - reduced motion (colour transitions only);
  - 1440/768/390/320.
- **Definition of Done:** `pnpm check` and the E2E suite pass; gallery screenshots are reviewed;
  ADR-002 O-8 is marked delivered in `PROGRESS.md` at the Phase 05 closure.

## 13. Decisions (user, 2026-11-16)

| ID     | Decision                                                                                                                                                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-NIB1 | **Approved:** a `lg` 44 × 44 / icon 18 size for mobile action buttons (FIGMA mobile frames). The 40 × 40 Figma size stays in the Rail and the desktop and tablet Top Bar. The touch target is satisfied as in §7                                    |
| D-NIB2 | **Approved proposal:** pressed = Sky 14% fill, Sky 30% border, white icon, 120 ms. Transient only; distinct from Active. Not a Figma value                                                                                                          |
| D-NIB3 | **Approved:** disabled is supported. Buttons use native `disabled` (no activation, skipped by Tab). Links render a non-interactive `span` with `role="link"` and `aria-disabled` (§7). Visual: 50% opacity, no hover or pressed (approved proposal) |
| D-NIB4 | **Approved:** Active only for a selected navigation destination (link + `aria-current="page"`). Action buttons never show a persistent Active state; open states use `aria-expanded`                                                                |
| D-NIB5 | **Approved:** colour-state transitions with the existing `duration-base`, `duration-fast` and `ease-standard` tokens; reduced motion respected; no new durations                                                                                    |
| D-NIB6 | **Approved:** no Tooltip primitive in Phase 05 unless a specific accessibility or usability requirement proves it necessary. Every icon-only control has an accessible name. **Tooltip stays deferred under ADR-002 (O-6)**                         |

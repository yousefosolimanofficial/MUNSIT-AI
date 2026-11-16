# Component contract — Popover and Menu (Phase 03, Popover/Menu V1)

- **Status:** **Approved — final** (2026-11-16). D-PM1 to D-PM9 resolved by the user (§12).
  Implemented on `feature/03-popover-menu-v1`, not yet committed.
- **Owner:** Yousef (architecture-sensitive: focus, positioning, top layer). Nothing delegated.
  Card, the Avatar assignment, Dialog and Sheet are not touched.
- **Baseline:** `main` at `404bc1b`. Branch `feature/03-popover-menu-v1`.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read-only with the Figma MCP and Plugin API on
  2026-11-16. Pages searched: Dashboard, My Lectures, My Summaries, My Notes (My Folders and
  Profile reuse the same menus). Figma is not modified.
- **Files:** `src/shared/ui/Popover.tsx`, `src/shared/ui/Menu.tsx`, their tests,
  `src/shared/ui/internal/useAnchoredOverlay.ts`, a gallery section,
  `tests/e2e/dev-components-popover-menu.spec.ts`, `docs/design-values.md` §13.

## 1. What Figma contains

No shared Popover or Menu exists on the Design System page. Three families:

| #   | Family                       | Figma                                                                                                                                                                                                                                                                                                                                           | Content                                                                                          | Role                                                           |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 1   | **Notification Dropdown**    | Component `2236:784` (Dashboard / Overlay Components); overlays Desktop `2242:1008`, Tablet `2242:1140`, Mobile `2242:1338`; trigger `Notifications Trigger` (40 × 40)                                                                                                                                                                          | Header ("الإشعارات" + "Mark all read"), divider, notification items, "عرض كل الإشعارات" button   | Panel with mixed content → **Popover**                         |
| 2   | **User Menu**                | Component `2236:813`; overlays Desktop `2242:1053`, Tablet `2242:1185`, Mobile `2242:1383`; trigger `User Menu Trigger` (219 × 54 Desktop, 88 × 54 Mobile)                                                                                                                                                                                      | Account header (Avatar + name + role), divider, 2 items, divider, Logout (Coral)                 | **Menu** (`account` variant)                                   |
| 3   | **Context and option menus** | `More Options Dropdown` `2261:1500` (overlay `2270:3332`); `Filter Menu` set `2261:1430` (`Kind=Course` `2261:1401`, `Status` `2261:1419`, `Sort` `2261:1429`; overlays `2270:3364`, `2270:3380`, `2270:3400`); `Summary Options Menu` `2392:3979`; Notes `Note Options Menu` (`2432:5951`) and Folders action/sort menus reuse the same values | Action items with icons, divider, destructive item; or single-choice options with a selected row | **Menu** (`context` variant), with radio items for Filter/Sort |

Notification and User Menu **content** (account header, notification items, data) belongs to the
Phase 05 shell and Phase 06 overlays. Popover/Menu V1 provides the primitives only.

## 2. Exact values (FIGMA)

### 2.1 Panels

| Property | Notification Dropdown `2236:784` | User Menu `2236:813`    | Context / option menus (`2261:1500`, `2261:1430`, `2392:3979`) |
| -------- | -------------------------------- | ----------------------- | -------------------------------------------------------------- |
| Width    | 380 (Mobile 350 = viewport − 40) | 256                     | 220                                                            |
| Fill     | Obsidian **97%**                 | Obsidian **97%**        | Graphite `#1b1c1e` **98%**                                     |
| Border   | 1px Electric Sky 18%             | 1px Electric Sky 18%    | 1px Electric Sky 18%                                           |
| Radius   | **20**                           | **18**                  | **14**                                                         |
| Padding  | 16                               | 8                       | 6                                                              |
| Gap      | 6                                | 2                       | 2                                                              |
| Shadow   | `0 24px 56px` black 55%          | `0 24px 56px` black 55% | `0 16px 40px` black 50%                                        |

### 2.2 Menu items

| Property       | User Menu (`account`)                   | Context menus (`context`)          | Option menus (Filter / Sort)                           |
| -------------- | --------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| Height         | **44**                                  | **40**                             | **38**                                                 |
| Radius         | 12                                      | 10                                 | 10                                                     |
| Padding-inline | 12, gap 12                              | 12, gap 10                         | 12, gap 10                                             |
| Label          | `Dashboard/Body Medium`, Text / Primary | `Dashboard/Body`, Text / Primary   | `Dashboard/Body`, Text / Primary                       |
| Icon           | 20, at inline-start                     | 18, at inline-start                | Selected row: check icon 16 at inline-end              |
| Destructive    | Label Coral Pulse ("تسجيل الخروج")      | Label and icon Coral Pulse ("حذف") | —                                                      |
| Divider        | 1px Electric Sky **10%**                | 1px White **8%**                   | —                                                      |
| Selected       | —                                       | —                                  | Fill Electric Sky **12%** + check (e.g. "الأحدث أولًا") |
| Hover / focus  | Not designed                            | Not designed                       | Not designed                                           |

The Status filter rows carry a status dot (content, from StatusBadge colors). The rename and
delete icons in the context menus are **raw vectors, not icon-set instances**; the icon manifest
has no `trash` or `edit` icon (D-PM9).

### 2.3 Placement (RTL frames; trigger geometry read from the screens)

| Overlay                           | Trigger                                      | Panel                                     | Offset | Alignment                                                      |
| --------------------------------- | -------------------------------------------- | ----------------------------------------- | ------ | -------------------------------------------------------------- |
| User Menu, Desktop                | `2211:172` x 24, y 25, 219 × 54              | x 24, y 88                                | 9      | Panel's left = trigger's left → **inline-end** edges align     |
| Notifications, Desktop            | `Notifications Trigger` x 410, y 32, 40 × 40 | x 70, y 88 (right edge 450)               | 16     | Panel's right = trigger's right → **inline-start** edges align |
| Card options, Desktop             | `More Button` x 836, y 291, 32 × 32          | x 836, y 329                              | 6      | inline-end edges align                                         |
| Sort / filters, Desktop           | `Sort Dropdown` 170 × 44, bottom y 241       | y 247                                     | 6      | near the trigger (frames not pixel-aligned)                    |
| User Menu / Notifications, Mobile | Top Bar                                      | x 14 / x 20, y 80; Notifications 350 wide | —      | kept inside the viewport (inset 14–20)                         |

All panels open **below** their trigger. Desktop and Tablet use the same panel sizes.

### 2.4 Backdrop and dismissal

| Overlay                                            | Backdrop                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| User Menu, Notifications (all sizes), Note Options | **Void Black 1%** "Backdrop (click outside to close)" — invisible click-catcher |
| My Lectures card options, filters, sort            | Void Black **62%** "Scrim (click to close)" — visibly dims the page             |

Prototype: trigger `ON_CLICK` → `OVERLAY` (User Menu `2242:1053`, Notifications `2242:1008`).
Handoff: overlays close on outside click; Esc closes overlays. Motion: not designed. LTR: no
frames.

## 3. Architecture

### 3.1 Two public components, one internal core

- **`Popover`** — a non-modal floating panel with arbitrary content (Notifications). ARIA: the
  panel is `role="dialog"` (non-modal), labelled by a visible title or `label`.
- **`Menu`** — WAI-ARIA APG **menu button**: `role="menu"` with `MenuItem` (`menuitem`),
  `MenuSeparator`, and `MenuRadioGroup` / `MenuItemRadio` (`menuitemradio`, `aria-checked`) for
  Filter/Sort (D-PM3).
- Both use `src/shared/ui/internal/useAnchoredOverlay.ts`: open/close lifecycle with exit
  motion, top-layer rendering, positioning, dismissal and focus return. Not a general overlay
  framework; it is not shared with Dialog/Sheet (they are modal; these are not).

### 3.2 Native APIs (D-PM2)

| Need          | Choice                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top layer     | **Popover API, `popover="manual"`** (`showPopover()` / `hidePopover()`): above every stacking context, no portal, no z-index. Rendered in place, so inside a Dialog or Sheet it stays in their subtree and is never inert.                                                                                                                                                                                             |
| Light dismiss | Implemented by the component (not `popover="auto"`): outside `pointerdown`, Esc, Tab out (Menu) and focus leaving (Popover). `auto` closes immediately and cannot run an exit transition reliably in every browser.                                                                                                                                                                                                    |
| Positioning   | **JavaScript** (`getBoundingClientRect`): below the trigger at the component's Figma offset (D-PM5), aligned `start` or `end` in the **inline** direction (RTL-aware), flipped above when there is no room below, clamped inside the viewport (menus 16, Popover 20). Recomputed on resize and scroll while open (rAF-throttled). CSS anchor positioning is not used: support in every target browser is NOT VERIFIED. |
| Radix         | Not added (D-PM2).                                                                                                                                                                                                                                                                                                                                                                                                     |

### 3.3 Focus and keyboard

**Menu (APG menu button):**

- Trigger: consumer's `<button>`; the component adds `aria-haspopup="menu"`, `aria-expanded`,
  `aria-controls`.
- Open: click, Enter, Space or ArrowDown → focus the first item; ArrowUp → the last item.
- In the menu: ArrowDown/ArrowUp move (wrap), Home/End, type-ahead by first letter (D-PM7);
  Enter/Space activate. Disabled items are skipped.
- Activation: the menu closes, **focus returns to the trigger, then** `onSelect` runs — so an
  action that opens a Dialog records the trigger as its focus-return target.
- Esc closes and returns focus to the trigger; Tab closes and lets focus move on; outside click
  closes without moving focus back.
- Roving `tabIndex` (only the active item is focusable).

**Popover (non-modal dialog):**

- Trigger gets `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
- Open → focus moves to the first focusable element inside (or the panel itself, `tabIndex=-1`).
- Tab moves through the content; focus leaving the panel closes it. Esc closes and returns focus
  to the trigger. Outside click closes.

**Inside Dialog / Sheet:** the menu or popover handles Esc itself (`preventDefault`), so only the
topmost layer closes; the modal stays open. No scroll lock (non-modal).

## 4. API (implemented)

```tsx
"use client";

// Menu: action menu (context) or account menu; the trigger is a render prop.
<Menu
  label="خيارات المحاضرة" // required accessible name of role="menu"
  variant="context" // "context" (default) | "account"
  align="end" // "end" (default) | "start": inline edge shared with the trigger, RTL-aware
  header={<AccountHeader />} // optional consumer content above the items, outside role="menu"
  trigger={(props) => <Button variant="secondary" {...props}>…</Button>}
  open={open} onOpenChange={setOpen} // optional controlled state; defaultOpen also supported
>
  <MenuItem icon="play" onSelect={openLecture}>فتح المحاضرة</MenuItem>
  <MenuItem onSelect={rename}>إعادة تسمية</MenuItem> {/* no icon in the set (D-PM9) */}
  <MenuSeparator />
  <MenuItem tone="danger" onSelect={askDelete}>حذف</MenuItem>
</Menu>

<Menu label="الترتيب" trigger={…}>
  <MenuRadioGroup value={sort} onValueChange={setSort} label="الترتيب">
    <MenuItemRadio value="newest">الأحدث أولًا</MenuItemRadio>
    <MenuItemRadio value="oldest">الأقدم أولًا</MenuItemRadio>
  </MenuRadioGroup>
</Menu>

// Popover: non-modal panel for arbitrary content (Notifications).
<Popover label="الإشعارات" align="start" trigger={(props) => <Button {...props}>…</Button>}>
  {/* header, list, footer: consumer content */}
</Popover>
```

- `trigger` receives `ref`, `aria-haspopup`, `aria-expanded`, `aria-controls`, `onClick` and
  `onKeyDown`; spread them on a focusable `<button>` (e.g. `Button`).
- `MenuItem`: `onSelect?`, `icon?` (existing icon set), `tone?: "danger"`, `disabled?`,
  `children`. `MenuItemRadio`: `value`, `disabled?`, `children`. `MenuRadioGroup`: `value`,
  `onValueChange`, `label?`.
- No `href` items, no `className` on panels, no width or offset props (offsets are fixed per
  component from Figma).

## 5. Implemented values (existing tokens only)

| Part            | Classes / values                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All panels      | `popover="manual"`; `inset-auto m-0 open:flex flex-col overflow-y-auto border border-accent-electric-sky/18`; position set inline (`top` / `left`) by the hook                    |
| Menu `context`  | `w-[220px] p-[6px] gap-[2px] rounded-[14px] bg-color-surface-graphite/98 shadow-[0_16px_40px_rgba(0,0,0,0.5)]`; offset **6**; viewport margin 16 (`max-w-[calc(100vw_-_32px)]`)   |
| Menu `account`  | `w-[256px] p-[8px] gap-[2px] rounded-[18px] bg-surface-obsidian/97 shadow-[0_24px_56px_rgba(0,0,0,0.55)]`; offset **9**; viewport margin 16                                       |
| Popover         | `w-[380px] max-w-[calc(100vw_-_40px)] p-md gap-[6px] rounded-xl bg-surface-obsidian/97 shadow-[0_24px_56px_rgba(0,0,0,0.55)]`; offset **16**; viewport margin **20** (350 at 390) |
| Item `context`  | `h-[40px] px-sm gap-[10px] rounded-[10px] text-dashboard-body`; icon 18 `text-text-secondary`                                                                                     |
| Item `account`  | `h-[44px] px-sm gap-[12px] rounded-md text-dashboard-body-medium`; icon 20 `text-accent-electric-sky`                                                                             |
| Radio item      | `h-[38px] px-sm gap-[10px] rounded-[10px] text-dashboard-body`; checked `aria-checked:bg-accent-electric-sky/12` + `check` 16 `text-accent-electric-sky` at inline-end            |
| Hover / focused | `hover:bg-text-primary/5` (fine pointer, enabled) and `focus:bg-text-primary/5`; keyboard focus adds the D-B2 ring, inset (`-outline-offset-2`)                                   |
| Danger item     | Label and icon `text-accent-coral-pulse`                                                                                                                                          |
| Disabled item   | Native `disabled` (skipped by arrows and type-ahead), `opacity-50`                                                                                                                |
| Separator       | `context`: `h-px bg-text-primary/8`; `account`: `h-px bg-accent-electric-sky/10`                                                                                                  |

Icon colors are Figma's (context Text / Secondary, account Electric Sky, danger Coral Pulse,
check Electric Sky). Radius 20 is `rounded-xl`, 12 `rounded-md`, padding 16 `p-md`, 12 `px-sm`;
other values are local constants. **No new token, no new dependency.**

## 6. Motion (D-PM6, approved)

| Phase    | Panel                                                                                                                                                            | Timing                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Entrance | `@starting-style`: opacity 0 → 1, `scale` 0.97 → 1, `translate` 4px from the trigger side → 0; `transform-origin` at the trigger-facing corner (set by the hook) | `duration-base` (200) `ease-standard` |
| Exit     | `data-state="closing"`: opacity → 0, `scale` → 0.97, no translate; `hidePopover()` after the panel's `opacity` `transitionend` or a fallback timer               | `duration-fast` (120) `ease-standard` |
| Flipped  | Slide direction and origin mirror when the panel opens above                                                                                                     | same                                  |
| Reduced  | `motion-reduce:transition-opacity`; distances × `--motion-distance` (0) → opacity only                                                                           | same                                  |

The panel is positioned in the same frame it is shown (before paint), so it never jumps and the
page does not shift. Focus moves on open and returns on close immediately. Reopening during the
exit cancels it.

## 7. Accessibility

- APG menu button and non-modal dialog patterns (§3.3); `aria-expanded` and `aria-controls` on
  the trigger; every menu and popover is named (`label`).
- Activation order: the close is committed (`flushSync`) and focus returns to the trigger before
  `onSelect` runs; an action that opens a Dialog therefore returns focus to the menu trigger.
- Esc is handled on the panel and cancelled (`preventDefault` + `stopPropagation`): inside a
  Dialog or Sheet only the menu or popover closes (verified in Chromium).
- Type-ahead (D-PM7): visible labels, 500 ms buffer, repeated characters cycle, disabled items
  skipped; text normalized with NFD and combining marks removed (Arabic harakat, hamza and madda
  on alef, Latin accents) plus tatweel, so "ا" matches "إعادة" and "e" matches "É".
- Keyboard focus is visibly different from the selected radio state (ring + White 5% vs Sky 12%
  - check). Danger items say what they do in text.
- Rendered contrast in Chromium: item labels, the danger item and popover text ≥ 4.5:1 on their
  panels.

## 8. Tests (implemented)

**Component:** `Menu.test.tsx` (18) — trigger wiring and roles; click, Enter, ArrowDown (first)
and ArrowUp (last); wrap, Home/End, disabled skipped; Arabic and English type-ahead (repeated
letters, multi-letter, timeout, disabled skipped, normalization); Enter/Space activation with
focus on the trigger and `aria-expanded="false"` before `onSelect`; Esc cancelled and not
propagated; Tab; outside pointerdown; controlled; radio `aria-checked`, selection and disabled;
`context` / `account` classes and the header slot outside `role="menu"`; no hex or left/right;
compile-time rejects; axe RTL/LTR. `Popover.test.tsx` (10) — non-modal dialog semantics and
trigger wiring; focus to the first focusable element or the panel; Tab inside and focus-out
closes; Esc; outside click; controlled and `defaultOpen`; classes; compile-time; axe RTL/LTR.

**Browser:** `dev-components-popover-menu.spec.ts` (26, Chromium, RTL + LTR) — context menu
values, offset 6, inline-end alignment with viewport clamping, rendered contrast (labels and
danger); account menu offset 9 and items 44, header outside the menu; popover offset 16,
inline-start alignment, values and contrast; real keyboard flows incl. Arabic type-ahead through
Chromium input; Esc and outside click; **Esc inside Dialog and inside Sheet closes only the
menu**; **Menu → Dialog → focus back on the menu trigger**; flip above near the viewport bottom
with no scroll or width change; 390 and 320: menus 16 and the popover 20 from the edges, popover
350 at 390, no horizontal overflow; entrance 200 (opacity, scale, translate) and exit 120 while
still shown; reduced motion opacity only; axe with each open. Dialog (26) and Sheet (24) browser
specs pass unchanged.

## 9. Acceptance criteria

All §8 tests pass; `corepack pnpm check` and `corepack pnpm test:e2e` pass; values per §5; APG
keyboard behavior; works inside Dialog and Sheet; no token, dependency or existing-component
change.

## 10. Explicit exclusions

Notification and User Menu content, data and navigation wiring (Phase 05 / 06); Select /
listbox form controls; submenus; right-click context menus; tooltips; link menu items;
left/right side placement; CSS anchor positioning; Radix; the My Lectures scrim (module
exception, §12 D-PM8); the project-wide motion audit.

## 11. Notes for consuming modules

- **My Lectures scrim (D-PM8):** Figma's card-options, course-filter, status-filter and sort
  overlays (`2270:3332`, `2270:3364`, `2270:3380`, `2270:3400`) dim the page with Void Black 62%.
  The shared primitives have no scrim. When the My Lectures module is built, this design must
  not be silently dropped: if the interaction needs to be modal, use Dialog or Sheet behavior
  there instead of making Menu modal.
- **Missing icons (D-PM9):** the rename and delete icons in the context menus (`2261:1500`,
  `2392:3979`) and the Status filter's check are raw vectors, not icon-set components. The
  manifest has no `edit` or `trash` icon. Consuming modules list these as icon-export requests;
  Menu items render without them meanwhile. The selected-row check uses the existing `check`
  icon (manifest usage "selected states").
- **Top Bar panels (D-PM5):** the User Menu (`account`, offset 9) and the Notifications popover
  (offset 16, margin 20) carry Figma's own offsets; the Top Bar composes them in Phase 05.

## 12. Decisions (user, 2026-11-16)

| ID    | Decision                                                                                                                                                                                                     | Applied  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| D-PM1 | **Approved:** two independent public components (Popover, Menu); Menu variants `context` and `account`; shared internal `useAnchoredOverlay`, separate from Dialog/Sheet; account header via a consumer slot | §3, §4   |
| D-PM2 | **Approved with conditions:** native Popover API `popover="manual"`, no Radix or dependency; behavior verified in the browser, including a Menu inside a modal                                               | §3.2, §8 |
| D-PM3 | **Approved:** `MenuItem`, `MenuSeparator`, `MenuRadioGroup`, `MenuItemRadio`; no Select                                                                                                                      | §4       |
| D-PM4 | **Approved:** White 5% hover/highlight, existing focus ring, focus distinct from the selected radio                                                                                                          | §5, §7   |
| D-PM5 | **Approved with modifications:** keep Figma offsets — context menus 6, User Menu 9, Notifications 16; Notifications Mobile margin 20 (350 at 390); flip; stay in viewport                                    | §5, §11  |
| D-PM6 | **Approved:** fade + scale 0.97 + 4px slide in 200 ms; fade + scale out 120 ms; tokens; reduced motion opacity only                                                                                          | §6       |
| D-PM7 | **Approved:** Arabic and English type-ahead on visible labels, diacritics handled, disabled skipped, repeated characters, short timeout, tested in both languages                                            | §7, §8   |
| D-PM8 | **Modified:** no visible scrim in the primitives; My Lectures' 62% scrim documented as a module-specific exception                                                                                           | §10, §11 |
| D-PM9 | **Approved with conditions:** icons optional; existing icons only, no substitutes; missing edit/trash assets documented for the modules                                                                      | §4, §11  |

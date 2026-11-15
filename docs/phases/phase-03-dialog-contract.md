# Component contract — Dialog (Phase 03, Dialog V1)

- **Status:** **Approved — final** (2026-11-15). D-DL1 to D-DL6 decided by the user (§12); D-DL4
  corrected the same day to professional entrance and exit motion (§5.1).
- **Owner:** Yousef (architecture-sensitive: focus and top layer, Phase 03 plan §5). Nothing
  delegated. Mariam's Card V1 files are not touched.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read-only with the Figma MCP and Plugin API on
  2026-11-15. Pages searched: Design System, My Lectures, Lecture Details, Live Recording,
  Summaries, Question Bank, My Notes, Flashcards, Favorites, My Folders, Profile & Settings.
  Figma is not modified.
- **Files (planned):** `src/shared/ui/Dialog.tsx`, `src/shared/ui/Dialog.test.tsx`, a Dialog
  section in `src/app/[locale]/dev/components/page.tsx`, `tests/e2e/dev-components-dialog.spec.ts`,
  an ADR-001 note (D-DL6) and `docs/design-values.md` §11.

## 1. What Figma contains

There is **no shared Dialog component** on the Design System page. Each module draws its own
dialog components, but they all use **one shell** with two header layouts.

| Module            | Components (node)                                                                                                                                                                                                                                                                                           | Header layout |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| My Lectures       | `Delete Confirmation Dialog` `2268:1824`; `Lecture / Upload Modal` `2268:1673` (File=Empty / Selected)                                                                                                                                                                                                      | A; B (Upload) |
| Live Recording    | `Recording Confirmation Modal` `2314:651` (Device=Desktop `2314:627` / Mobile `2314:639`); Leave guard frames `2744:5118`, `2591:3192`; annotation `2588:338`                                                                                                                                               | A             |
| My Notes          | `Notes / Delete Confirmation` `2432:4308` (also used as `Unsaved Changes Dialog` `2746:14333`); `Move To Folder Modal` `2432:4306`; `Link Lecture Dialog` `2432:4393`; `Notes Error Dialog` `2432:4491`                                                                                                     | A             |
| My Folders        | `Create Folder Modal` `2453:5287` (7 states); `Rename Folder Modal` `2453:5448`; `Change Color Modal` `2453:5464`; `Delete Confirmation` `2453:5502`; `Add Content Modal` `2453:6370`; `Move Content Modal` `2453:7339`; `Add To Folder Modal` `2453:7420`; `Folders / Error Dialog` `2453:7566` (10 types) | B; A (errors) |
| Profile/Settings  | `Account / Logout Confirmation` `2462:1490`; `Security / End Sessions Dialog` `2462:1551`; `Delete Account Flow`; `Profile / Avatar Modal` `2462:1736`; `Settings / Error Dialog` `2462:1926`                                                                                                               | B; A (errors) |
| Question Bank     | `Mode Select Dialog` `2416:7740`; `Exit Confirmation` `2412:4117`; `Submit Confirmation` `2412:4175`; `Quiz Error Dialog` `2407:2195`                                                                                                                                                                       | not re-read   |
| Summaries / Favs. | `Summary Dialog` `2389:4080`; `Create Summary Modal` `2391:4025`; `Favorites / Error Dialog` `2443:6225`                                                                                                                                                                                                    | not re-read   |

Dialog V1 is the **shell only**: container, scrim, header (title, description, optional icon
tile and close button), body slot and actions row. Module content (forms, option lists, upload
areas, states such as Saving or Failed) belongs to each module. Guard behavior
(`ConfirmGuardDialog`, navigation blocking) is Phase 06.

## 2. Exact values (FIGMA)

### 2.1 Container (majority, 20+ components)

| Property | Value                                                      | Source / token                                 |
| -------- | ---------------------------------------------------------- | ---------------------------------------------- |
| Fill     | Obsidian `#111214` at **98%**                              | Not variable-bound; `bg-surface-obsidian/98`   |
| Border   | 1px Electric Sky `#63a1ff` at **18%**, inside              | `border-accent-electric-sky/18`                |
| Radius   | **24**                                                     | `rounded-2xl` (`--radius-2xl`, existing token) |
| Padding  | **24** all sides                                           | Local constant (no 24 spacing token)           |
| Gap      | **14** between header, body and actions                    | Local constant                                 |
| Shadow   | Drop shadow `0 16px 40px` black at **50%**, spread 0       | Local constant                                 |
| Layout   | Vertical stack, children full width; text aligned to start | FIGMA                                          |

### 2.2 Outliers (My Lectures family only)

| Property | Outlier                                        | Where                       |
| -------- | ---------------------------------------------- | --------------------------- |
| Shadow   | `0 24px 64px` black 55%                        | `2268:1824`, `2268:1673`    |
| Border   | Coral Pulse 22% (destructive)                  | `2268:1824` only            |
| Gap      | 16 (`2268:1824`), 20 (`2268:1673`)             | My Lectures                 |
| Scrim    | Void Black **62%**                             | My Lectures overlays        |
| Close    | 40 × 40, radius 12, icon 18; title block gap 6 | `2268:1673` Upload only     |
| Actions  | gap 12 (also Recording `2314:627`)             | My Lectures, Live Recording |

→ D-DL1.

### 2.3 Header layout A — stacked (confirmations, guards, errors; no close button)

| Part        | Value                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Icon tile   | 48 × 48, radius 14, 1px border, icon 22, at **inline-start** (`Icon Row` aligned MAX in the RTL frame) |
| Tone accent | Electric Sky 12% fill, 30% border, icon Electric Sky (e.g. Move To Folder `2432:4266`)                 |
| Tone danger | Coral Pulse 12% fill, 30% border, icon Coral Pulse (`alert`; Lectures uses 28%)                        |
| Title       | `Dashboard/Title M` (Cairo Bold 20/30), Text / Primary                                                 |
| Description | `Dashboard/Body` (Cairo Regular 14/22), Text / Secondary                                               |
| Order       | Icon tile → title → description, each a direct child of the container (gap 14)                         |

### 2.4 Header layout B — row with close button (Folders, Profile, Upload)

| Part         | Value                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Row          | Horizontal, gap 12, top-aligned                                                                            |
| Icon tile    | 44 × 44, radius 14, icon 20, at **inline-start**; tones as in §2.3 (optional: Upload and Avatar have none) |
| Title block  | Fills the row; vertical, gap 4; title and description as §2.3                                              |
| Close button | 36 × 36, radius 10, White 4% fill, 1px Electric Sky 14% border, `Icon / x` 16, at **inline-end**           |

### 2.5 Actions row

Horizontal, gap **10**, buttons share the width equally (`Button` `Type=Primary/Secondary`,
existing component, height 44). The primary action is at **inline-start**, the secondary at
inline-end (RTL frames). Destructive confirmations use a Coral Pulse primary fill; that is the
Button's concern (D-B4/D-B5 kept Button V1 without a destructive variant) and is **not** part of
Dialog V1. The Upload modal sizes Cancel to its label (120) and the primary fills the rest.

### 2.6 Scrim, placement and sizes

| Item             | Value                                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scrim            | Full viewport, Void Black `#040506` at **66%**, no blur; layer named **"Scrim (click to close)"**                                                                                                         |
| Placement        | Centered horizontally; Handoff (Overlays): render against the viewport and center the dialog, ignore artboard heights                                                                                     |
| Desktop / Tablet | Same widths on both: **420** (Lectures, Recording), **440** (Notes, errors, Avatar), **480** (Folders, Logout, Move, Link), **520** (Create Folder), **560** (Upload, Mode Select), **640** (Add Content) |
| Mobile 390       | **350** wide = viewport − 20 per side (e.g. `2271:4157` at x 20); heights grow with wrapped text                                                                                                          |
| Mobile Upload    | Becomes `Lecture / Upload Sheet` (bottom sheet) — **Sheet**, not Dialog                                                                                                                                   |
| Tallest          | Add Content 920 — taller than the 844 Mobile and 768-wide Tablet viewports; no scroll behavior is drawn                                                                                                   |

### 2.7 Behavior written in Figma

- Scrim layer name: click to close.
- Leave Recording Guard annotation `2588:338`: `role=alertdialog`, focus trapped, focus restored
  on close; the safe action is primary and has default focus; **Esc and scrim = stay** (the safe
  path). Refresh/tab close use the native `beforeunload` prompt (Phase 06).
- Not in Figma: transitions, focus styles, LTR frames.

## 3. Implemented values (existing tokens only)

| Part            | Classes                                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<dialog>`      | `bg-surface-obsidian/98 border border-accent-electric-sky/18 rounded-2xl p-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.5)]`                                                                   |
| Stack           | `flex flex-col gap-[14px] text-start`                                                                                                                                                     |
| Size            | `w-[420px]`…`w-[640px]`, `max-w-[calc(100vw-40px)]`; wrapper `max-h-[calc(100dvh-42px)]` (outer box = viewport − 40 incl. the 1px borders); body `overflow-y-auto` (D-DL2)                |
| Backdrop        | `backdrop:bg-surface-void-black/66`                                                                                                                                                       |
| Title / desc.   | `<h2 class="text-dashboard-title-m text-text-primary">`, `<p class="text-dashboard-body text-text-secondary">`                                                                            |
| Icon tile A / B | `size-[48px]` icon 22 / `size-[44px]` icon 20; `rounded-[14px] border`; accent `bg-accent-electric-sky/12 border-accent-electric-sky/30 text-accent-electric-sky`; danger `…coral-pulse…` |
| Close button    | `size-[36px] rounded-[10px] bg-text-primary/4 border border-accent-electric-sky/14`, `Icon name="x" size={16}`, D-B2 focus ring                                                           |
| Actions         | `flex gap-[10px] *:flex-1`                                                                                                                                                                |
| Motion          | §5.1 (D-DL4)                                                                                                                                                                              |

Local constants only (padding 24, gaps 14/12/10/4, radius 14/10, sizes, shadow, opacity
modifiers). **No new token, no new dependency.** Logical properties only; the icon `x` is not
mirrored (manifest).

## 4. API

```tsx
"use client";

<Dialog
  open={open} // controlled only
  onOpenChange={setOpen} // called with false on Esc, scrim click and the close button
  title="حذف المحاضرة؟" // required; rendered as <h2>, the accessible name
  description="هل أنت متأكد إنك عايز تحذف المحاضرة دي؟" // optional; aria-describedby
  icon="alert" // optional IconName → icon tile
  tone="danger" // "accent" (default) | "danger"; icon tile only
  role="alertdialog" // "dialog" (default) | "alertdialog" (confirmations, guards)
  width={420} // 420 | 440 | 480 (default) | 520 | 560 | 640 (D-DL2)
  closeLabel="إغلاق" // optional; when set, header layout B with a close button (D-DL5)
  initialFocusRef={cancelRef} // optional; else the first focusable element
  actions={
    <>
      <Button ref={cancelRef} variant="secondary" onClick={() => setOpen(false)}>
        إلغاء
      </Button>
      …
    </>
  } // optional actions row (§2.5); DOM order = visual order
>
  {/* optional body: module content */}
</Dialog>;
```

- No `defaultOpen`, no trigger component: the trigger is any `Button`; the consumer owns state.
- No `className` on the panel: its size comes only from `width`.
- `Dialog` takes no `aria-*`, `onClose` or `onCancel` overrides; it owns the semantics.
- Children render only while open (form state resets on each open).

## 5. Architecture — native `<dialog>` with `showModal()`

| Concern           | Approach                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendering         | `<dialog>` rendered in place; `showModal()` puts it in the **top layer** (above every stacking context, no portal, no z-index). Closed in SSR (no `open` attribute).                                                                  |
| Controlled open   | `useEffect` on `open`: `true` → `showModal()` (if not already open); `false` → `close()`. The prop is the only source of truth.                                                                                                       |
| Esc               | `cancel` event → `preventDefault()` → `onOpenChange(false)`. Chromium may skip `cancel` on repeated Esc without user activation and close directly, so a `close` event while `open` is still `true` also calls `onOpenChange(false)`. |
| Scrim click       | Clicks on `::backdrop` target the `<dialog>` itself: close only when **both** `pointerdown` and `click` hit the dialog element outside its content box (a text drag that ends outside does not close).                                |
| Focus containment | `showModal()` makes everything outside the dialog **inert**: Tab and Shift+Tab cycle through the dialog and the browser UI only, never the page (D-DL3).                                                                              |
| Initial focus     | Native dialog focusing steps (first focusable) by default; `initialFocusRef` focused after `showModal()` when given. React's `autoFocus` is not used (it fires before the dialog is shown).                                           |
| Focus restoration | The element focused before opening is stored and re-focused after `close()` if focus is not already on it (browsers do this natively; the explicit step covers unmount and older engines).                                            |
| Semantics         | Native modal dialog role, plus explicit `aria-modal="true"` (Roadmap acceptance), `role="alertdialog"` when asked, `aria-labelledby` → title id, `aria-describedby` → description id (`useId`).                                       |
| Scroll lock       | While open: `<html>` gets `overflow: hidden` and `scrollbar-gutter: stable` (no layout shift); reference-counted for stacked dialogs; restored on close **and** on unmount. `overscroll-behavior: contain` on the dialog.             |
| Cleanup           | Unmount while open: `close()`, release the scroll lock, restore focus, remove listeners.                                                                                                                                              |
| Motion            | CSS transitions and `@starting-style` (§5.1); JavaScript only waits for the exit to finish before `close()`.                                                                                                                          |
| Not used          | Radix, `focus-trap`, animation libraries or any new package (D-DL6).                                                                                                                                                                  |

### 5.1 Motion (D-DL4, approved 2026-11-15)

Figma defines no motion; the approved motion tokens apply (`design-values.md` §1.3: Duration slow
for dialog entrance). Only `opacity` and `scale` animate (motion foundation rule).

| Phase    | Panel                                                         | Scrim (`::backdrop`) | Duration / easing                     |
| -------- | ------------------------------------------------------------- | -------------------- | ------------------------------------- |
| Entrance | opacity 0 → 1, scale 0.98 → 1 (`@starting-style` on `[open]`) | opacity 0 → 1        | `duration-slow` (320) `ease-standard` |
| Exit     | opacity 1 → 0, scale 1 → 0.98 (`data-state="closing"`)        | opacity 1 → 0        | `duration-base` (200) `ease-standard` |
| Reduced  | Scale distance × `--motion-distance` (0) → opacity fade only  | as above             | as above                              |

- **Exit before removal:** when `open` becomes `false` the dialog stays modal (page still inert,
  focus inside) with `data-state="closing"`; `close()` runs on the panel's own `opacity`
  `transitionend`, or after a fallback timer equal to the computed transition time (so a missed
  event never leaves it open). Children stay mounted until then.
- **One path for every close:** Esc, scrim click, the close button and consumer actions all call
  `onOpenChange(false)`; the prop change starts the exit. If Chromium closes the dialog natively
  (Esc without `cancel`), cleanup runs at once without the exit animation.
- **Rapid reopen:** `open` returning to `true` during the exit cancels the pending `close()` and
  transitions back to open; the dialog never leaves the top layer, so focus and the scroll lock are
  unchanged. Reopening after `close()` replays the entrance.
- **Accessibility:** motion never delays focus: initial focus is set right after `showModal()`,
  and focus is restored right after `close()`. Pointer input is ignored during the exit.

jsdom 30.1.3 implements `HTMLDialogElement` **without** `showModal`, `close`, inertness or the top
layer. Component tests therefore stub `showModal`/`close` per file (set/remove `open`, dispatch
`close`), and every real-browser behavior is tested in Playwright.

## 6. Accessibility contract (WAI-ARIA APG Dialog / Alert Dialog)

- Labelled by the visible title; described by the description when present.
- Esc closes (calls `onOpenChange(false)`); for guards the consumer treats close as the safe
  path (Figma annotation `2588:338`).
- Focus moves into the dialog on open, stays inside while open and returns to the trigger on
  close.
- The close button is a real `<button type="button">` with `aria-label={closeLabel}`, 36 px
  (meets WCAG 2.2 target size 24), visible D-B2 focus ring.
- Visible focus on every control inside (existing components).
- Contrast: Text / Primary and Text / Secondary on Obsidian are already measured as AA
  (`design-values.md` §5); the 98% fill over the scrim stays within that range. Re-measured on the
  rendered page in Chromium.
- RTL and LTR: logical properties only; icon tile at inline-start, close button at inline-end;
  numerals and Latin runs isolated by the consumer (`Ltr`).
- Reduced motion: no scale; opacity fades only (§5.1).
- **Keyboard scrolling (fix 2026-11-16, Sheet V1 branch):** while the body overflows it is
  focusable (`tabIndex=0`), a `region` named by the dialog title, with an inset D-B2 focus
  ring (`internal/useScrollableFocus`, WCAG 2.1.1, axe `scrollable-region-focusable`). A body
  that fits adds no Tab stop. Initial focus, API, styling, motion and layout are unchanged.
  Browser tests: overflowing body reached by Tab after the close button, scrolled with
  PageDown, focus back on the trigger after Esc; a fitting body is not a Tab stop.

## 7. Required tests

**Component (`Dialog.test.tsx`, jsdom, stubbed `showModal`/`close`):**

1. Closed: `<dialog>` without `open`, children not rendered. Open: `showModal` called once,
   children rendered.
2. Semantics: `aria-modal="true"`, `aria-labelledby` ↔ `<h2>` id, `aria-describedby` ↔
   description id (absent without description), `role="alertdialog"` when set.
3. Controlled: `cancel` event → `preventDefault` and `onOpenChange(false)` once; prop stays the
   source of truth (dialog remains open until the prop changes); native `close` while open →
   `onOpenChange(false)`.
4. Scrim: pointerdown + click on the dialog element outside the panel → `onOpenChange(false)`;
   click inside or drag from inside → nothing.
5. Close button: rendered only with `closeLabel`; accessible name; click → `onOpenChange(false)`.
6. `initialFocusRef` receives focus on open; focus returns to the trigger on close and on unmount.
7. Scroll lock applied on open, released on close and unmount, reference-counted for two dialogs.
8. Classes per §3 (container, both header layouts, both tones, widths); no hex in classes except
   the shadow constant; no left/right utilities.
9. Compile-time: `@ts-expect-error` on `width={500}`, `tone="success"`, missing `title`,
   `role="menu"`, `onClose`, `defaultOpen`, `className`. (TypeScript never checks hyphenated
   JSX props such as `aria-label`; the component simply does not forward them.)
10. jest-axe: layout A and B × RTL/LTR, no violations.
11. Motion: `data-state` `open` → `closing` on close; `close()` only after the panel's `opacity`
    `transitionend` (child transitions ignored) or the fallback timer; reopen during the exit
    cancels `close()`; motion classes per §5.1.

**Browser (`tests/e2e/dev-components-dialog.spec.ts`, gallery section, real `showModal`):**

1. Open from a trigger: focus inside (initial or first focusable); page behind is inert.
2. **Focus trap:** repeated Tab and Shift+Tab never focus an element outside the dialog.
3. Esc closes; scrim click closes; click inside does not; focus returns to the trigger.
4. Scroll lock: the page does not scroll while open; scroll position and layout width unchanged
   after close.
5. axe (`@axe-core/playwright`, WCAG 2.2 AA tags) with each dialog open, RTL and LTR. axe cannot
   resolve backgrounds in the top layer and reports `color-contrast` as incomplete, so contrast is
   measured directly: title and description against page → scrim → panel, composited by
   Chromium, ≥ 4.5:1. Any other incomplete result fails.
6. Layout at 1440, 768, 390 and a 320 overflow check (width = min(Figma width, viewport − 40),
   height ≤ viewport − 40, the long body scrolls, no horizontal overflow; 350 at 390).
7. Motion: entrance transitions `opacity` and `scale` at 320 ms; during the exit the dialog is
   still modal with `data-state="closing"` and transitions `opacity` at 200 ms; extra Esc and
   scrim input during the exit is ignored and cleanup completes; reopening replays the entrance
   and focuses the safe action; with `reducedMotion: "reduce"` no `scale` transition runs.
   (The page is inert during the exit, so a reopen mid-exit is only programmatic; it is covered
   by component test 11.)

## 8. Explicit exclusions

Sheet and bottom-sheet variants; Popover/Menu; `ConfirmGuardDialog`, `useNavigationGuard` and
`beforeunload` (Phase 06); module content and states (Saving, Failed, Success); a destructive
Button variant; a busy lock that disables Esc/scrim during saving (not designed; for the module
or Phase 06); nested dialog choreography beyond the reference-counted scroll lock; drag or
resize; animation libraries.

## 9. Acceptance criteria

All §7 tests pass; `corepack pnpm check` and `corepack pnpm test:e2e` pass; values per §3 after
D-DL1/D-DL2; Roadmap Phase 03: focus trap, Esc closes, focus returns to the trigger,
`aria-modal`, labelled; no token, dependency, Card, Button, Input, StatusBadge or Tabs change.

## 12. Decisions (user, 2026-11-15)

| ID    | Decision                                                                                                                                                         | Applied  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| D-DL1 | **Approved:** one shell with the majority values (shadow 16/40/50%, scrim 66%, border Sky 18%, gap 14, actions gap 10, close 36); My Lectures outliers not kept  | §2.1, §3 |
| D-DL2 | **Approved:** `width` = the six Figma widths, default 480; `max-width: 100vw − 40px`; `max-height: 100dvh − 40px` with the body scrolling                        | §3, §4   |
| D-DL3 | **Approved:** native inertness of `showModal()`; no JavaScript wrap-around trap                                                                                  | §5       |
| D-DL4 | **Approved (corrected 2026-11-15):** professional motion — scrim fade in/out, panel opacity + scale 0.98 → 1, exit before removal, motion tokens, reduced motion | §5.1     |
| D-DL5 | **Approved:** `closeLabel` prop supplied by the consumer; it selects header layout B                                                                             | §4, §6   |
| D-DL6 | **Approved:** native `<dialog>`, no Radix Dialog; recorded in ADR-001                                                                                            | ADR-001  |

**Project motion principle (user, 2026-11-15):** professional, purposeful motion is part of the
implementation quality standard and is added as each component and page is built, not at the end.
Figma stays the source of truth for the visual design; missing motion specs do not prohibit
motion. CSS first; no animation library without a technical need and approval; never at the cost
of accessibility or performance.

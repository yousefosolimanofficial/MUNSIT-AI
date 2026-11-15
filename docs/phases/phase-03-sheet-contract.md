# Component contract — Sheet (Phase 03, Sheet V1)

- **Status:** **Approved — final** (2026-11-16). D-SH1 to D-SH6 approved by the user (§12);
  intentional Figma normalizations N-1 to N-5 recorded in §11. Implemented on
  `feature/03-sheet-v1`, not yet committed.
- **Owner:** Yousef (architecture-sensitive; same family as Dialog). Nothing delegated. Mariam's
  Card V1 files are not touched.
- **Baseline:** `main` at `3f50973` (Dialog V1 merged). Branch `feature/03-sheet-v1`.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read-only with the Figma MCP and Plugin API on
  2026-11-16. Pages searched: Design System, Dashboard, My Lectures, My Notes, My Folders. Figma
  is not modified.
- **Files:** `src/shared/ui/Sheet.tsx`, `src/shared/ui/Sheet.test.tsx`,
  `src/shared/ui/internal/useModalDialog.ts` (shared with Dialog, D-SH6),
  `src/shared/ui/internal/useScrollableFocus.ts`, `src/shared/ui/Dialog.tsx` (adopts the hook
  only), `/dev/components` (`_components/SheetDemo.tsx`), `tests/e2e/dev-components-sheet.spec.ts`,
  `docs/design-values.md` §12.

## 1. What Figma contains

No shared Sheet component exists on the Design System page. Every sheet is a **Mobile-only,
bottom-anchored** panel: in all frames `y + height = 844` (the Mobile artboard). Tablet and
Desktop show the same flows as dialogs, drawers or menus, never as sheets.

| Sheet                               | Node (component / overlay frame)                                                                  | Size          | Header                      | Used in                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | ------------- | --------------------------- | ------------------------------ |
| **More Menu Sheet**                 | `2236:972` (Dashboard); overlays `2242:1472`, `2256:2050`, `2312:215`, `2467:75091`, `2467:75208` | 390 × 554     | Close + title "المزيد"      | Every Mobile screen (Phase 05) |
| **Upload Lecture Sheet**            | `2236:919` (Dashboard); `Lecture / Upload Sheet` `2268:1823` (File=Empty `2268:1674` / Selected)  | 390 × 663–710 | Close + title + description | Dashboard, My Lectures         |
| Mobile Filter Sheet                 | `2268:1863`; overlays `2271:4207`, `2509:881`, `2426:3643`, `2454:9221`                           | 390 × 422     | Title only                  | My Lectures, Notes, Folders    |
| More Options Sheet                  | `2268:1890`; overlay `2271:4172`                                                                  | 390 × 373     | Title only                  | My Lectures                    |
| Folder Actions / Sort Sheet         | frames `2454:9042`, `2454:9206` (overlays `2454:8988`, `2454:9152`)                               | 390 × 322     | Title only (`Card Title`)   | My Folders                     |
| Notes Assistant / Add Content Sheet | `2430:3924` (8 states), `2453:7247` (6 states); overlays `2431:4006`, `2454:8608`                 | 390 × 780     | Close + title block         | My Notes, My Folders           |
| Notes Metadata / Folder Selector    | overlays `2431:4135`, `2431:4237`                                                                 | —             | not re-read                 | My Notes                       |

Sheet V1 is the **shell**: panel, grabber, header (title, optional description, close button),
body slot and actions row. Sheet content (menu rows, filters, forms, AI states) belongs to its
module or to the Phase 05 More Sheet; navigation-registry wiring is Phase 05.

## 2. Exact values (FIGMA)

### 2.1 Panel (all sheets)

| Property | Value                                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Position | Bottom of the viewport, full width (390 of 390), `x 0`; height hugs content                                                                                           |
| Fill     | Obsidian `#111214` at **98%** (not variable-bound)                                                                                                                    |
| Border   | 1px Electric Sky at **18%**                                                                                                                                           |
| Radius   | **28 / 28 / 0 / 0** (top corners only)                                                                                                                                |
| Padding  | **12 / 20 / 28 / 20** (top / inline / bottom) on 7 of 9 sheets; Folders: 10 / 20 / 28 / 20 and Add Content 10 / 24 / 24 / 24                                          |
| Gap      | Content-defined: 16 (Upload, Filter), 18 (Dashboard Upload), 8 (More Menu, Folders), 4 (Options), 14 (Add Content)                                                    |
| Shadow   | `0 24px 64px` black 55% (Lectures: Upload, Filter, Options); `0 24px 56px` 55% (Dashboard More, Upload); `0 16px 40px` 50% (Add Content); none (Folder Actions, Sort) |
| Tallest  | 780 (Add Content, Notes Assistant) at `y 64` → top gap **64**; Upload 710 at `y 134`                                                                                  |

### 2.2 Grabber

40 × 4, radius 2, centered in a full-width row at the top.

| Color            | Where                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| White **20%**    | Lectures Upload, Filter, Options (the Filter sheet is reused in Notes and Folders) |
| White 22%        | Folders Actions, Sort                                                              |
| Text / Muted 60% | More Menu Sheet (`2236:922`)                                                       |

Row bottom padding: 0 (Upload, Filter, More), 8 (Options), 6 (Folders), 4 (Add Content).

### 2.3 Header

| Form                        | Sheets                            | Values                                                                                                                                      |
| --------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Title only                  | Filter, Options, Folders          | `Dashboard/Title M`, Text / Primary, inline-start (Folders frames use `Dashboard/Card Title`)                                               |
| Close + title               | More Menu (`2236:923`)            | Row 52, padding 8/4/4/4; close **40 × 40, radius 12, Sky 8% fill, Sky 16% border, `x` 18** at **inline-end**; title Title M at inline-start |
| Close + title + description | Upload (`2268:1677`), Add Content | Close 40 × 40, radius 12, **White 4%** fill, Sky 14% border; title block gap 6 (Title M + `Dashboard/Body` Text / Secondary)                |

### 2.4 Body and actions

- Menu rows (More Menu, Options, Folders) are content, not shell: e.g. More item 56 high, radius
  14, Sky 5% / 10%; Options item 52, radius 10, no fill; destructive rows Coral Pulse. They belong
  to the consumers (Phase 05 More Sheet, modules) and to a later menu-row pattern.
- Actions row (Upload, Filter): horizontal, gap **12**, `Button` Secondary at inline-end and
  Primary filling the rest (Cancel 110–120, Apply 216–226).

### 2.5 Scrim and behavior

| Item      | Value                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| Scrim     | Void Black **66%** (Dashboard, Folders) or **62%** (My Lectures); full viewport, no blur; "Scrim (click to close)" |
| Dismissal | Handoff (More Sheet): close on scrim click, Esc or destination change; focus trapped; portal with a viewport scrim |
| Grabber   | Drawn only. **No drag, swipe or snap behavior is specified** in Figma or the Handoff                               |
| Safe area | Handoff: "Unresolved. Proposed: apply the bottom device inset to … bottom sheets"                                  |
| RTL / LTR | Only RTL frames. Close at inline-end, title at inline-start; nothing else is directional                           |
| Motion    | Not designed                                                                                                       |

## 3. Implemented values (existing tokens only)

| Part       | Classes                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<dialog>` | `inset-x-0 top-auto bottom-0 m-0 w-full max-w-none max-h-none overflow-hidden p-0` · `rounded-t-[28px] border border-accent-electric-sky/18 bg-surface-obsidian/98` · `shadow-[0_24px_64px_rgba(0,0,0,0.55)]` · motion §6 |
| Wrapper    | `flex max-h-[calc(100dvh_-_66px)] flex-col gap-md px-lg pt-sm pb-[calc(28px_+_env(safe-area-inset-bottom))] text-start` (outer box = viewport − 64 including the 1px borders)                                             |
| Grabber    | Row `flex justify-center`, `aria-hidden="true"`; bar `h-[4px] w-[40px] rounded-[2px] bg-text-primary/20`                                                                                                                  |
| Header     | Row `flex gap-[12px]` (centered without description, top-aligned with it); title block `flex-1 gap-[6px]`; `<h2>` `text-dashboard-title-m text-text-primary`; description `text-dashboard-body text-text-secondary`       |
| Close      | `size-[40px] rounded-md border border-accent-electric-sky/16 bg-accent-electric-sky/8 text-text-secondary`, `Icon x` 18, D-B2 focus ring; at inline-end                                                                   |
| Body       | `min-h-0 flex-1 overflow-y-auto overscroll-contain`; while it overflows: `tabIndex=0`, `role="region"` named by the title, inset focus ring (N-5)                                                                         |
| Actions    | `flex gap-[12px]`; children decide widths (Figma: primary fills, secondary hugs)                                                                                                                                          |
| Scrim      | `backdrop:bg-surface-void-black/66`                                                                                                                                                                                       |

Radius 28 and 2, sizes and gaps 12/6 are local constants; padding 20/12 and gap 16 use `px-lg`,
`pt-sm`, `gap-md`. **No new token, no new dependency.**

## 4. API (implemented)

```tsx
"use client";

<Sheet
  open={open} // controlled only
  onOpenChange={setOpen} // false on Esc, scrim click, close button
  title="المزيد" // required; <h2>, accessible name
  closeLabel="إغلاق" // required: every sheet has a visible close button (N-2)
  description="…" // optional; aria-describedby
  initialFocusRef={ref} // optional; else the first focusable element (the close button)
  actions={<>…</>} // optional actions row
>
  {/* body: menu rows, filters, forms */}
</Sheet>;
```

- Same contract shape as `Dialog`; no `width`, `icon`, `tone`, `role` or `className`.
- No breakpoint logic (D-SH4): the page renders Sheet on Mobile and Dialog (or a drawer) on
  larger screens, as Figma does. At 768/1440 a sheet still renders full width at the bottom.

## 5. Architecture

### 5.1 Native `<dialog>`

Native `showModal()` gives the top layer, page inertness, Esc and the focus behavior; the bottom
placement is CSS only. Behavior is identical to Dialog V1 (Dialog contract §5).

### 5.2 Shared modal core `internal/useModalDialog.ts` (D-SH6)

Moved out of `Dialog.tsx` unchanged and used by Dialog and Sheet. Dialog's public API, markup,
classes, motion and durations are unchanged; it only passes `exitProperties: ["opacity"]`.

- **Lifecycle:** controlled `open`; `showModal()`; on close `data-state="closing"`, then
  `close()` after the element's own exit-property `transitionend` (Dialog: `opacity`; Sheet:
  `translate`, or `opacity` under reduced motion) or the computed-duration fallback timer;
  reopen during the exit cancels `close()`; native close reported; cleanup on unmount.
- **Scroll lock:** one module-level reference count for every modal. The first lock saves the
  document's `overflow` and `scrollbar-gutter`; only the last release restores them, so
  overlapping exits and entrances never restore stale styles.
- **Focus stack:** each open modal records its restore candidates: the element focused when it
  opened, then the candidates of the modal that contained that element. On release, focus is
  restored only if it would otherwise be lost (on `body` or inside the closing modal), only to a
  connected element inside the top remaining open modal (or anywhere when none is open), else
  to that modal's first focusable element. Sheet → Dialog therefore keeps focus in the dialog
  while the sheet finishes its exit, and returns to the sheet's trigger when the dialog closes
  (the sheet row that opened it no longer exists).

### 5.3 `internal/useScrollableFocus.ts`

Measures the body with a `ResizeObserver`; while it overflows, the body is focusable so keyboard
users can scroll it (axe `scrollable-region-focusable`, WCAG 2.1.1). No tab stop when the
content fits.

## 6. Motion (D-SH5, approved)

| Phase    | Panel                                                                                              | Scrim         | Timing                                |
| -------- | -------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------- |
| Entrance | `translate: 0 100%` → `0 0%` (`@starting-style`), opacity 1                                        | opacity 0 → 1 | `duration-slow` (320) `ease-standard` |
| Exit     | → `translate: 0 100%` on `data-state="closing"`, then `close()`                                    | opacity 1 → 0 | `duration-base` (200) `ease-standard` |
| Reduced  | `motion-reduce:transition-opacity`, distance × `--motion-distance` (0): no movement; opacity 0 ↔ 1 | as above      | as above                              |

- Only `translate` and `opacity` animate (compositor properties): no layout shift; the scroll
  lock keeps the scrollbar gutter.
- The sheet stays modal (page inert, focus inside) until the exit ends; input during the exit is
  ignored; rapid reopen transitions back without leaving the top layer.
- Focus is set right after `showModal()` and restored right after `close()`.

## 7. Accessibility

- Native modal semantics plus `aria-modal="true"`; labelled by the `<h2>` title; described by
  the description when present.
- **Dismissal without Esc:** every sheet has a visible, named 40 px close button (N-2), plus
  scrim click and Esc.
- Initial focus: `initialFocusRef`, otherwise the close button (first focusable).
- Focus containment by native inertness; restoration through the shared focus stack (§5.2).
- Grabber decorative: `aria-hidden`, not focusable, no gesture (D-SH2).
- Overflowing body is keyboard-scrollable (§5.3).
- Contrast measured on the rendered sheet (title ≥ 4.5:1); axe reports top-layer contrast as
  incomplete, as for Dialog.
- RTL/LTR: logical properties; close at inline-end, title at inline-start; `x` not mirrored.

## 8. Tests (implemented)

**Component — `Sheet.test.tsx` (20):** closed/open; semantics; no describedby without
description; close button always present and first focusable; grabber hidden; Esc; prop in
charge and native close; scrim press + release; close button and focus return; shell, wrapper,
grabber, close and motion classes; no hex or left/right utilities; exit waits for its own
`translate` or `opacity`; fallback timer and rapid reopen; **Sheet → Dialog with overlapping
exit** (lock held, focus stays in the dialog, then returns to the trigger, the page's own
`overflow` restored); **Dialog → Sheet nested** (focus back into the dialog); **unmount over an
open dialog**; compile-time rejects; axe RTL/LTR.

**Dialog regression:** `Dialog.test.tsx` (25) and `dev-components-dialog.spec.ts` (22) pass
unchanged.

**Browser — `dev-components-sheet.spec.ts` (24, Chromium, RTL + LTR):** shell values at 390
(bottom 844, full width, radius 28/28/0, fill, border, scrim, shadow, grabber 40 × 4 hidden,
close 40 at inline-end, measured contrast, initial focus on close); focus trap; Esc, scrim and
close button with focus return; slide up 320 / slide down 200 while still modal, rapid input,
reopen; reduced motion (opacity only, no `translate`); Sheet → Dialog → close with focus return
and the page scrolling again; scroll lock without layout shift; axe for both sheets; 390, 320,
768 and 1440: full width at the bottom, height ≤ viewport − 64, header and actions visible, body
scrolls by keyboard, no horizontal overflow.

## 9. Acceptance criteria

All §8 tests pass; `corepack pnpm check` and `corepack pnpm test:e2e` pass; values per §3;
Roadmap Phase 03: grabber and close button, focus trap, Esc closes, focus returns, `aria-modal`,
labelled; no token, dependency, Button, Input, StatusBadge, Tabs or Card change; Dialog changed
only to adopt the shared hook.

## 10. Explicit exclusions

Drag/swipe/snap (D-SH2); More Sheet content and navigation registry (Phase 05); menu-row
pattern; Popover/Menu; module content and states; side drawers; Tablet/Desktop sheet layouts
(not designed); new tokens or dependencies; the project-wide motion audit.

## 11. Intentional Figma normalizations

| ID  | Figma                                                                                                                        | Implemented                                                               | Basis                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------- |
| N-1 | Shadow 24/64/55%, 24/56/55%, 16/40/50% or none; scrim 66% or 62%; padding 12/20/28/20, 10/20/28/20 or 10/24/24/24; gaps 4–18 | One shell: shadow 24/64/55%, scrim 66%, padding 12/20/28/20, shell gap 16 | D-SH1 (majority)                        |
| N-2 | Filter, Options and Folders sheets have no close button                                                                      | Every sheet has the More Menu close button                                | User requirement: dismissal without Esc |
| N-3 | Grabber White 20%, White 22% or Text / Muted 60%; row bottom padding 0–8                                                     | White 20%; spacing from the shell gap                                     | D-SH3                                   |
| N-4 | Two close styles (More: Sky 8% / 16%; Upload: White 4% / Sky 14%); Folders title `Card Title`                                | More Menu close style; title `Title M`                                    | D-SH1, D-SH3                            |
| N-5 | Not designed                                                                                                                 | Overflowing body focusable (region named by the title)                    | WCAG 2.1.1 (axe finding)                |

## 12. Decisions (user, 2026-11-16)

| ID    | Decision                                                                                                                                                      | Applied     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| D-SH1 | **Approved:** one shell with the majority values                                                                                                              | §3, N-1     |
| D-SH2 | **Approved:** grabber decorative only; no swipe-to-dismiss in V1                                                                                              | §7          |
| D-SH3 | **Approved:** grabber White 20%; More Menu close-button style                                                                                                 | §3, N-3/N-4 |
| D-SH4 | **Approved:** max height viewport − 64, body scrolls, header and actions stay visible, bottom padding 28 + safe area, no breakpoint logic                     | §3, §4      |
| D-SH5 | **Approved:** slide up 320 / down 200, scrim fade, `ease-standard`, reduced motion without movement, rapid reopen, no layout shift; modal until the exit ends | §6          |
| D-SH6 | **Approved:** minimal behavior-preserving extraction of the modal lifecycle into `internal/useModalDialog.ts` with one shared scroll lock and focus stack     | §5.2        |

**Dialog (approved by the user 2026-11-16):** the scrollable-body finding (N-5) also applied to
Dialog's body; Dialog now uses `useScrollableFocus` too (Dialog contract §6).

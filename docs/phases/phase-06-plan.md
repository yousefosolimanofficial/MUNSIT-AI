# Phase 06 — Shared states & overlay/guard infrastructure — Plan

- **Status:** **APPROVED with conditions (user, 2026-11-18).** Every decision has a disposition
  (§6). The navigation guard is conditionally approved behind a technical proof (§7.1).
- **Baseline:** `main` at `300c828`. Phase 05 is CLOSED (2026-11-17), CI is green, and the tree is
  clean. Risks R-2 and R-3 stay OPEN.
- **Sources:**
  - [Roadmap Phase 06](../references/MUNSIT_AI_Development_Roadmap_v1.0.md) (read-only);
  - Frontend Handoff (Overlays, Guards, closeout issue P2);
  - Design System Reference (guard dialogs);
  - Phase 03 contracts (Dialog §8, Button D-B5, Popover/Menu D-PM3);
  - [Phase 05 closure report](phase-05-closure-report.md) §14.
- **Figma values:** recorded in [design-values.md §15](../design-values.md) (read-only audit,
  2026-11-17). They are not repeated here.

## 1. Official scope (Roadmap, verbatim intent)

**Phase 06 — Shared states & overlay/guard infrastructure.** The objective is to build once
everything modules reuse for state feedback and overlays.

| Roadmap scope item                                                                                                                                     | Phase 06 outcome                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Skeleton` primitives and the pattern for geometry-matched skeletons                                                                                   | **Build** (gap)                                                                                                                                                                               |
| `EmptyState` (single reusable component)                                                                                                               | **Build** (gap)                                                                                                                                                                               |
| `ErrorCard` with retry                                                                                                                                 | **Build** (gap): full card and inline section error                                                                                                                                           |
| `SectionBoundary` (per-section loading/error/retry; one failed section does not break the page)                                                        | **Build** (gap)                                                                                                                                                                               |
| Viewport-based portal overlay with scrim (renders over the active screen)                                                                              | **Already delivered** by the Phase 03 `Dialog` and `Sheet` (native modal `<dialog>`, top layer, viewport scrim, shared scroll lock and focus stack). Verified and documented; nothing rebuilt |
| `ConfirmGuardDialog`: safe = primary (focused on open), leave = secondary with red text (follows the Recording guard; resolves the Notes P2 inversion) | **Build** on the Phase 03 `Dialog`. Needs the deferred destructive Button variant (D-B5)                                                                                                      |
| `useNavigationGuard`: in-app navigation, `beforeunload`, browser back                                                                                  | **Build** (gap)                                                                                                                                                                               |
| Toast / inline success pattern **if Figma shows one (verify)**                                                                                         | **Verified:** `Settings / Toast` `2462:1771` exists (Success / Error / Info). **Build**                                                                                                       |
| Notifications / User Menu overlay frames (shells only; content static until data exists)                                                               | **Shells already delivered** in Phase 05 (D-S5, D-S6). Phase 06 verifies them against the frames and adds no sample data (D-U8)                                                               |

| Roadmap item     | Text                                                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dependencies** | Phase 03 (met)                                                                                                                                                                         |
| **Deliverables** | `shared/patterns/*`, `shared/hooks/useNavigationGuard`, dev gallery entries                                                                                                            |
| **Acceptance**   | The guard blocks every exit path while its condition is true and never when false. Approved copy is used verbatim (§9). Overlays scrim against the viewport, ignoring artboard heights |
| **Tests**        | Guard tests per exit path (link click, programmatic navigation, back, tab close); focus-on-safe-action test; error-isolation test (one section fails, the others render)               |
| **DoD**          | Documented in `docs/` so modules know which component to reuse                                                                                                                         |

## 2. Exclusions and deferred work (nothing invented)

- **Module screens and data:**
  - no Dashboard, Notes or Recording screens;
  - no real loading or fetch logic;
  - no API client (the guard's `when` and the boundary's status are supplied by modules later).
- **Guard rules per state:** which Recording states hold unsaved data is a backend dependency
  (Figma annotation `2588:338`). Phase 06 provides a generic `when` condition only.
- **Notification and user data:**
  - no sample notifications, unread state, "mark all read" or "view all" target (D-17, D-S5);
  - no account header data and no logout (D-02, D-S6).
- **Not designed:** skeleton shimmer, toast timing and stacking. These are §6 decisions, never
  invented values.
- **Unchanged deferrals:**
  - the remaining ADR-002 primitives (Textarea, Select, Checkbox, Radio, Switch, Tooltip, generic
    Badge) stay deferred until their first consuming feature;
  - Button loading and icons stay out of v1 (D-B3, D-B4);
  - cross-browser runs belong to R-3.
- **Not part of this phase:** Phase 07 (Landing) and later.

## 3. Reuse audit (existing code; genuine gaps only)

| Need                      | Existing                                                                                                                                  | Gap                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Modal overlay and scrim   | `Dialog` (alertdialog role, danger tone, 420/440 widths, `initialFocusRef`, Esc/scrim → `onOpenChange(false)`), `Sheet`, `useModalDialog` | None (scope item satisfied)                                                                                                       |
| Guard dialog              | `Dialog` + `Button`                                                                                                                       | `ConfirmGuardDialog` composition; Button **danger** variant (D-B5)                                                                |
| Buttons in states         | `Button` primary / secondary (D-B6 pressed fix)                                                                                           | Danger variant only                                                                                                               |
| Icons                     | `alert`, `check`, `upload`, `note`, … in the manifest                                                                                     | None                                                                                                                              |
| Cards                     | `Card` surfaces (Phase 03)                                                                                                                | Empty and error boxes differ from Card values (Obsidian 88/90%, Coral border), so they get local constants, not new Card variants |
| Notifications / User Menu | `NotificationsTrigger` (Popover 380, title + D-S5 message), `UserMenu` (account Menu 256, Profile and Settings)                           | None while no data exists (D-U8)                                                                                                  |
| Navigation                | next-intl `Link` / `useRouter`, `usePathname`; shell links in Sidebar, Rail, drawer, bottom bar, More sheet, LanguageSwitch               | Central guard interception (§7); `UserMenu` switches to the guarded router                                                        |
| Folders                   | `src/shared/patterns`, `src/shared/hooks` do not exist yet                                                                                | Created by this phase (Roadmap §3 layout)                                                                                         |
| Dev gallery               | `/dev/components` (outside the app shell)                                                                                                 | New sections; one dev-only route **inside** `(app)` for shell-level guard E2E (D-U9)                                              |

## 4. Figma audit summary

Every Phase 06 element has a verified node, except the behaviour that is marked NOT DESIGNED. All
values are in [design-values.md §15](../design-values.md).

| Element              | Nodes                                                                                                                     | Finding                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Skeleton             | `2495:1719`; Dashboard Loading `2495:1720` / `2495:2978` / `2495:4188`                                                    | One block: White 7%, radius 8, sized to the content. Static (motion NOT DESIGNED)           |
| Error card           | `2495:2424` (Mobile `2495:4794`)                                                                                          | Coral-bordered card, tile 56, primary retry                                                 |
| Section error        | `2495:2966`                                                                                                               | Inline row, tile 44, secondary retry. Copy example "تعذّر تحميل آخر المحاضرات" (module copy) |
| Empty state          | Dashboard First-Time `2482:2130` / `2482:2661` / `2482:3155`; Notes `2433:7748`–`2433:7796`                               | Same structure, **two box sizes** (D-U4)                                                    |
| Guards               | Recording `2744:5118` / `2744:5135` / `2591:3192`; Notes `2746:14333` / `2745:14318` / `2602:7896`; annotation `2588:338` | The Notes guard inverts the actions (P2). Recording is the reference (Roadmap)              |
| Toast                | `2462:1771`; placements `2464:3617` / `2464:3977` / `2464:4337`                                                           | 420 × 52 (350 on Mobile), three tones, centred at the bottom. Timing NOT DESIGNED           |
| Notifications / menu | `2236:784`, `2236:813` (+ overlay frames per breakpoint)                                                                  | Already implemented as shells (Phase 03/05). The remaining content is sample data           |

- **RTL/LTR:** Figma is Arabic-only. LTR mirrors through logical properties. Icons are not
  mirrored, because `alert`, `check` and `upload` are not on the whitelist.
- **Responsive:** every element has Desktop, Tablet and Mobile frames. Boxes are fluid (1160 →
  648 → 350). Dialogs follow the Phase 03 rule (viewport − 40), and toasts are 420 capped at
  viewport − 40.

## 5. Architecture (files)

```
src/shared/ui/Button.tsx                       + variant "danger" (D-U2), contract addendum
src/shared/patterns/Skeleton.tsx               Skeleton block + SkeletonText helpers
src/shared/patterns/ErrorCard.tsx              ErrorCard (layout "card" | "section")
src/shared/patterns/EmptyState.tsx             EmptyState (D-U4; Mariam assignment)
src/shared/patterns/SectionBoundary.tsx        status-driven boundary + render-error boundary
src/shared/patterns/ConfirmGuardDialog.tsx     guard dialog on Dialog
src/shared/patterns/NavigationGuardProvider.tsx interception (§7), mounted in [locale]/layout
src/shared/hooks/useNavigationGuard.ts         public hook (+ useGuardedRouter)
src/shared/patterns/Toast.tsx                  ToastProvider, useToast, Toast (D-U6)
docs/shared-patterns.md                        DoD: which component to reuse, and how
```

- Each file has a co-located `*.test.tsx`.
- Gallery sections live in `src/app/[locale]/dev/components`.
- Dependency rules are unchanged: `shared` never imports features.
- No new dependency, no new token. Translucent tints, radii and sizes are local component
  constants (CLAUDE.md).

## 6. Decisions (user, 2026-11-18)

| ID         | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Disposition                                                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-U1       | **ConfirmGuardDialog:** every guard follows the Recording guard. Stay is Primary and initially focused; Leave is the red-text secondary (D-U2); Esc and scrim keep the current page; `alertdialog` on the Phase 03 `Dialog`. The Notes guard keeps its copy and 440 width, and the Recording guard 420                                                                                                                                                                                                                                                                                                                                                                                    | **APPROVED**                                                                                                                                                                                                |
| D-U2       | **Red-text Button:** a minimal `danger` variant, the Secondary fill and border with a Coral Pulse label (Recording guard). Existing behaviour is unchanged and no other variant is added. Contrast is verified rendered at rest, hover, focus and pressed (calculated 5.79:1 and 4.66:1)                                                                                                                                                                                                                                                                                                                                                                                                  | **APPROVED**                                                                                                                                                                                                |
| D-U3       | **Skeleton:** content-shaped blocks with a subtle opacity pulse from the existing motion tokens. No pulse under `prefers-reduced-motion`. No dependency                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **APPROVED**                                                                                                                                                                                                |
| D-U4       | **EmptyState:** one shared component, `variant="default"` and `variant="compact"`. `default` = Figma `Shared / Empty State` `2389:4037` (the cross-module component used by Summaries and Notes). `compact` = Dashboard First-Time `2482:2130`, the tighter box (padding 48/32, radius 20); its icon tile is 72 against 64, as drawn. Values: design-values §15.3; assignment: [phase-06-empty-state-starter.md](phase-06-empty-state-starter.md)                                                                                                                                                                                                                                         | **APPROVED** (variant mapping recorded here)                                                                                                                                                                |
| D-U5       | **ErrorCard:** one component with `layout="card"` (Dashboard full error `2495:2424`, Primary retry) and `layout="section"` (inline `2495:2966`, Secondary retry), matching Figma. Copy comes from props; the retry label defaults to "إعادة المحاولة" (Figma). Notes error dialogs stay module `Dialog` usages                                                                                                                                                                                                                                                                                                                                                                            | **APPROVED** (user, 2026-11-18, PR #38 review)                                                                                                                                                              |
| D-U6       | **Toast:** Success, Error and Info; bottom-centre, clear of the mobile bottom bar (Figma gap 118; 78 elsewhere, plus the safe area). Success and Info auto-dismiss after **4 s**; Error persists until dismissed. The timer pauses while the toast is hovered or focused. Announcements use `role="status"` / `role="alert"`; the toast is keyboard reachable and never covers navigation controls                                                                                                                                                                                                                                                                                        | **APPROVED WITH IMPLEMENTATION VALIDATION** (Increment 4). Any deviation, for example a longer duration for long messages under WCAG 2.2.1, is documented in that PR                                        |
| D-U6 notes | **Implementation choices beyond the approved text (Increment 4), documented for review:**<ul><li>a close button on every toast (D-U6 requires one for Error; it also lets keyboard users dismiss the others), with copy "إغلاق" / "Close" (**APPROVED** by the product owner, 2026-11-18);</li><li>an optional inline action (the Figma Error retry) that dismisses the toast;</li><li>up to 3 visible, and a 4th removes the oldest Success/Info first;</li><li>the timer also pauses while the tab is hidden;</li><li>focus returns to where it was if a focused toast is dismissed;</li><li>announcements through persistent hidden live regions;</li><li>no exit animation.</li></ul> | Copy **APPROVED** (2026-11-18); design and behaviour provisionally approved, subject to final validation                                                                                                    |
| D-U7       | **Navigation guard (§7):** a provider in `[locale]/layout`; capture-phase interception of same-origin link activation; `useGuardedRouter` for programmatic navigation; a history sentinel for Back/Forward; `beforeunload` (native, browser-dependent prompt)                                                                                                                                                                                                                                                                                                                                                                                                                             | **CONDITIONALLY APPROVED:** a narrow technical proof comes first (Increment 1, §7.1). If it cannot reliably meet the Roadmap acceptance, Increment 1 stops and reports the evidence and a safer alternative |
| D-U8       | **Notifications / User Menu:** the Phase 05 shells stay unchanged: no sample user data, no notification content, no logout (D-02), no account header data                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **APPROVED** (user, 2026-11-18, PR #38 review)                                                                                                                                                              |
| D-U9       | **Dev-only guard test route** inside `(app)`: 404 in production, not linked from any navigation, no sensitive debugging information, **removed before Phase 06 closure**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | **APPROVED**                                                                                                                                                                                                |
| D-U10      | **English guard copy** (§9): Recording “Leave the recording?” / “Parts of the recording that haven't been saved yet may be lost if you leave the page.” / “Stay on page” / “Leave anyway”; Unsaved “You have unsaved changes” / “If you leave now, you may lose the edits you haven't saved.” / “Keep editing” / “Leave without saving”. Arabic unchanged (Figma)                                                                                                                                                                                                                                                                                                                         | **APPROVED** (product owner, 2026-11-18)                                                                                                                                                                    |

## 7. Navigation guard design (D-U7)

```ts
useNavigationGuard({
  when: boolean,                // the module's condition; false = never blocks
  dialog: "unsaved" | "recording",
  onLeave?: () => void,         // optional cleanup before leaving
}): void

useGuardedRouter()              // same API as next-intl useRouter; asks the active guard first
```

| Exit path                                                                                          | Mechanism                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link click or Enter (Sidebar, Rail, drawer, bottom bar, More sheet, language links, in-page links) | Document **capture-phase** `click` listener. It handles same-origin `<a>` elements only, and ignores modifier or middle clicks, `target`, `download` and same-URL hash links. It prevents the default and stops propagation before the React or Next handler, opens the dialog, and on "leave" navigates through the router                                                                   |
| Programmatic (`router.push`, for example the User Menu)                                            | `useGuardedRouter`. The shell's `UserMenu` switches to it                                                                                                                                                                                                                                                                                                                                     |
| Browser Back / Forward / history-menu jump                                                         | **Navigation API** (primary, Chromium and Edge): the `navigate` event of a same-document traversal is cancelled and the dialog asks. Leave calls `traverseTo` the exact chosen entry. History is never modified. A non-cancelable (cross-document) traversal is left to `beforeunload`. **Fallback** (no Navigation API): one sentinel entry + `popstate`, with documented limitations (§7.2) |
| Refresh / tab close / external URL                                                                 | `beforeunload` with `preventDefault()` while active (native prompt; browsers require prior user interaction)                                                                                                                                                                                                                                                                                  |
| Condition false                                                                                    | No listener, no sentinel, no prompt. The acceptance criterion is "never when false"                                                                                                                                                                                                                                                                                                           |

- **One guard at a time:** the most recent registration wins. It unregisters on unmount and
  removes the sentinel.
- **Dialog:** focus moves to the safe action on open and returns to the element that started the
  navigation.

### 7.1 Technical proof (condition of D-U7)

Increment 1 must demonstrate the following in Chromium E2E, each against the real URL and history:

1. internal link interception;
2. programmatic navigation;
3. browser Back;
4. Forward after a cancellation;
5. repeated Back attempts;
6. refresh and tab-close protection;
7. free navigation when inactive;
8. no stuck navigation or corrupted history;
9. no browser listeners left after unmount;
10. RTL/LTR and an accessible confirmation.

**App-controlled vs browser-controlled navigation:**

- **App-controlled** paths (links, the router, in-app history) show the custom dialog.
- **Browser-controlled** paths (refresh, tab close, typed URL, external links) can only use the
  native `beforeunload` prompt. That prompt cannot be styled, its look is browser-dependent, and
  it requires prior user interaction. No protection is claimed beyond what the browser allows.

### 7.2 Proof results (Increment 1, Chromium, revised 2026-11-18 after the PR #38 review)

`tests/e2e/navigation-guard.spec.ts`: 40 tests in `ar` and `en`. Each checks the real URL, history
and page state. The fallback suites remove `window.navigation` before any script runs.

| Exit path                                                                         | Navigation API path (Chromium)                                                                                                                                                                                                                                                                                         | Fallback (no Navigation API)                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Links in the shell and the page, language switch                                  | Supported: Stay keeps URL, state and focus; Leave navigates once                                                                                                                                                                                                                                                       | Supported                                                          |
| Programmatic (`useGuardedRouter`, user menu); raw routers are forbidden by ESLint | Supported                                                                                                                                                                                                                                                                                                              | Supported                                                          |
| Back and Forward, user-initiated, repeated, after Stay                            | Supported; history unchanged; **Forward entries kept**. **Exception (G-1, RISK ACCEPTED — BROWSER LIMITATION):** a second browser Back with no user interaction in between (for example Esc, then Back) is non-cancelable by browser rule and leaves; see [phase-06-g1-findings.md](phase-06-g1-findings.md)           | Back supported; **Forward entries discarded** (limitation)         |
| Several Back steps in one task, and a history-menu jump (`go(-2)`)                | Supported: every same-document step is cancelled; Leave lands on the chosen entry                                                                                                                                                                                                                                      | **Not stopped** (limitation); history stays consistent             |
| A step out of the app document (cross-document)                                   | Native `beforeunload` prompt only                                                                                                                                                                                                                                                                                      | Native `beforeunload` prompt only                                  |
| Refresh, tab close                                                                | Native `beforeunload` prompt only (after user interaction); dismiss keeps the page                                                                                                                                                                                                                                     | Same                                                               |
| Approved Leave (authorization)                                                    | Navigation-specific, no time window: only the approved click (replayed), router call or history entry (once) passes; at most one native prompt, only for a cross-document traversal; a failed traversal or a new activation clears it. Once the approved navigation has committed, the departing page swallows nothing | Same; the fallback bounds its single unload authorization to 1.5 s |
| Hash change on the guarded page                                                   | The guard stays on; a hash-only traversal is not asked                                                                                                                                                                                                                                                                 | Same                                                               |
| Guard off or toggled off                                                          | Never blocks; listeners fully removed (DevTools listener registry)                                                                                                                                                                                                                                                     | Same; the sentinel is dropped                                      |
| Not verified                                                                      | Firefox, Safari, Edge (R-3); real browser toolbar buttons (automation drives the same traversals); typed URLs                                                                                                                                                                                                          |                                                                    |

**Chromium detail:** a script-initiated repeat traversal right after a cancellation can be ignored
by the browser (no navigation and no event). User-initiated traversals (Playwright `goBack` and
`goForward`, as from the toolbar) are asked once per user interaction.

**Correction (2026-11-18, G-1):** the earlier sentence "always asked; nothing leaves without
confirmation" was wrong. The HTML Standard lets a page cancel a browser-UI traversal only with
history-action activation, and each cancellation consumes it. Esc does not grant it. A second Back
with no interaction in between therefore leaves. The test passed because Playwright's page calls
grant activation. Findings, the decision and the binding Notes/Recording data-protection criteria:
[phase-06-g1-findings.md](phase-06-g1-findings.md).

**G-1 decision (product owner, 2026-11-18): RISK ACCEPTED — BROWSER LIMITATION** (option A). This
is conditional: it is not approval of unrecoverable data loss in production. Notes and Recording
are not production-ready until the findings §6 criteria are implemented and tested.

## 8. Increments and PR boundaries

| #   | Increment (PR)                                                                                                                                                                                               | Files                                                                                                                         | Depends on                    | Tests                                                                                                                                                                                                                                                                                                             | Acceptance                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 0   | **This plan** (docs only)                                                                                                                                                                                    | this file, design-values §15, PROGRESS                                                                                        | —                             | format                                                                                                                                                                                                                                                                                                            | Approved plan and decisions                                                                          |
| 1   | **Guard slice** (vertical): Button `danger` + contract addendum, `ConfirmGuardDialog`, provider, `useNavigationGuard`, `useGuardedRouter`, `UserMenu` switch, guard copy, gallery section, dev harness route | Button, patterns/ConfirmGuardDialog, NavigationGuardProvider, hooks, `[locale]/layout`, UserMenu, messages, `(app)/dev/guard` | D-U1, D-U2, D-U7, D-U9, D-U10 | Unit: danger classes and contrast tokens; dialog roles, focus on the safe action, Esc and scrim = stay. Hook: every exit path true/false. E2E: Sidebar, Rail, drawer, bottom bar, More sheet, language switch, User Menu push, Back, Forward, reload (`dialog` event), RTL/LTR, 390/768/1440, axe, reduced motion | The guard blocks every exit path while true and never when false; safe action focused; copy verbatim |
| 2   | **States slice:** `Skeleton`, `ErrorCard` (card + section), `SectionBoundary`, gallery                                                                                                                       | patterns/Skeleton, ErrorCard, SectionBoundary                                                                                 | D-U3, D-U5                    | Unit: values and roles, `aria-busy`, retry callback, render-error capture. **Error isolation:** three sections, one throws or fails, the other two render and retry recovers. E2E: gallery 320/390/768/1440, RTL/LTR, axe, reduced motion                                                                         | One failed section never breaks the page; geometry-matched skeleton pattern documented               |
| 3   | **EmptyState** (Mariam candidate, §10)                                                                                                                                                                       | patterns/EmptyState(+test)                                                                                                    | D-U4                          | Unit: both sizes, 0/1/2 actions, footnote, axe ar/en. E2E (integration): gallery widths and directions                                                                                                                                                                                                            | One reusable component, both Figma sizes                                                             |
| 4   | **Toast**                                                                                                                                                                                                    | patterns/Toast                                                                                                                | D-U6                          | Unit: roles, timing with fake timers, pause on hover/focus, replace, close. E2E: placement at three breakpoints, above the bottom bar on mobile, safe area, RTL/LTR, axe, reduced motion                                                                                                                          | Figma placement and tones; WCAG 2.2.1 / 4.1.3                                                        |
| 5   | **Verification and docs:** Notifications / User Menu frame check (D-U8), `docs/shared-patterns.md`, Phase 06 closure report                                                                                  | docs; frame-check E2E                                                                                                         | 1–4                           | Full suite + build; ADR-004 widths on the gallery                                                                                                                                                                                                                                                                 | DoD: modules know which component to reuse                                                           |

**Recommended first increment: 1 (Guard slice).** It carries the most risk (navigation
interception across the shell and history), unblocks the Roadmap's per-exit-path acceptance
tests, and resolves the deferred D-B5. Increment 3 can run in parallel with it if delegated.

## 9. Bilingual copy

| Use                       | Arabic (approved, Roadmap / Figma)                          | English (APPROVED, D-U10)                                                             |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Unsaved guard: title      | لديك تغييرات غير محفوظة                                     | You have unsaved changes                                                              |
| Unsaved guard: body       | إذا غادرت الآن، قد تفقد التعديلات التي لم تحفظها.           | If you leave now, you may lose the edits you haven't saved.                           |
| Unsaved guard: safe       | متابعة التعديل                                              | Keep editing                                                                          |
| Unsaved guard: leave      | مغادرة بدون حفظ                                             | Leave without saving                                                                  |
| Recording guard: title    | هل تريد مغادرة التسجيل؟                                     | Leave the recording?                                                                  |
| Recording guard: body     | قد تفقد أجزاء من التسجيل لم يتم حفظها بعد إذا غادرت الصفحة. | Parts of the recording that haven't been saved yet may be lost if you leave the page. |
| Recording guard: safe     | البقاء في الصفحة                                            | Stay on page                                                                          |
| Recording guard: leave    | مغادرة على أي حال                                           | Leave anyway                                                                          |
| Retry (ErrorCard default) | إعادة المحاولة (Figma)                                      | Try again                                                                             |
| Skeleton status (D-U3)    | جارٍ التحميل… (PROPOSED)                                     | Loading…                                                                              |
| Toast close (D-U6)        | إغلاق (APPROVED 2026-11-18)                                 | Close                                                                                 |

- **Module copy:** empty-state, error and toast messages are module copy, passed as props.
- **Gallery samples:** dev-only, in the `dev` namespace (precedent: `errorTest`).

## 9a. Accessibility requirements

- **Guards:**
  - `alertdialog`, named by the title and described by the body;
  - focus on the safe action, trapped, and restored;
  - Esc = stay.
- **Skeleton:**
  - blocks are `aria-hidden`;
  - the region has `aria-busy="true"` and one polite status text;
  - no motion under reduced motion.
- **ErrorCard:** the title is a heading at the level the module passes. The retry button is
  named by its visible label.
- **Toast:**
  - status or alert role;
  - focus is not moved;
  - pause on hover or focus;
  - the error toast is dismissible (WCAG 2.2.1, 4.1.3).
- **Contrast:** every new text and tone is measured in Chromium (rendered), as in Phase 03.
- **Throughout:** keyboard-only operation and visible D-B2 focus.

## 10. Collaboration review (Mariam)

**`EmptyState` (increment 3): assignment authorized (user, 2026-11-18).** It is prepared: it needs the user's
authorization (given 2026-11-18), D-U4 (approved), and a starter package (prepared, not sent until the user confirms the handoff).

| Criterion        | Assessment                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| API frozen       | Yes: `{ variant?, icon, title, description?, actions?, footnote?, headingLevel? }` (starter §3) |
| Isolated files   | `src/shared/patterns/EmptyState.tsx` and `EmptyState.test.tsx` only                             |
| Dependencies     | Available on `main`: `Button`, `Icon`, tokens, Figma values (§15.3)                             |
| Integration risk | Low: no state, no routing, no overlay                                                           |

**Not suitable for delegation:**

- **The guard** has cross-cutting history and shell integration.
- **SectionBoundary** has error-boundary semantics tied to the states slice.
- **Toast** has provider and timing decisions.

## 11. Testing strategy

- **Baseline kept:**
  - 1020 unit and 637 E2E tests must still pass, with no assertion weakened;
  - each increment adds tests, and the totals only grow.
- **Unit (Vitest + jsdom):**
  - every component's classes against §15, roles, names, keyboard, and jest-axe in `ar` and
    `en`;
  - the hook per exit path, with the condition both true and false;
  - fake timers for the toast.
- **Integration:**
  - provider + dialog + router mocks: leave replays the original navigation, stay keeps the
    URL;
  - SectionBoundary error isolation.
- **E2E (Playwright, Chromium):**
  - the guard on every real exit path through the harness route;
  - the beforeunload `dialog` event;
  - gallery sections at 320, 390, 768, 1024 and 1440 with no overflow;
  - RTL and LTR;
  - reduced motion;
  - axe (WCAG 2.2 AA tags);
  - the console guard (no hydration warnings).
- **Regression:** the Phase 05 shell specs stay green. The guard must not change navigation when
  inactive, and this is asserted.
- **Not claimed:** Firefox, Safari and Edge (R-3); real devices; screen readers.

## 12. Risks

| ID   | Risk                                                                                                                                | Mitigation                                                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-2  | Blank no-JavaScript 404 (Phase 04)                                                                                                  | **OPEN**, unchanged; Phase 22 gate                                                                                                                                              |
| R-3  | Chromium-only coverage                                                                                                              | **OPEN**, unchanged; pre-production QA. Guard history behaviour differs most across browsers, so it is a priority item for R-3                                                  |
| QA   | Real devices, screen readers, blur performance                                                                                      | Unchanged pre-production obligations                                                                                                                                            |
| U-R1 | No router-level blocking in Next 16; the interception could miss a path or interfere with Next's own history handling               | One central layer; an E2E per exit path; inactive-guard regression tests; stop and report if a path cannot be covered reliably                                                  |
| U-R2 | `beforeunload` needs prior user interaction and shows an unstyled native prompt                                                     | Documented behaviour (annotation `2588:338`); E2E interacts first                                                                                                               |
| U-R3 | Danger Pressed contrast 4.66:1 (little margin)                                                                                      | Rendered measurement in E2E; fail the build below 4.5                                                                                                                           |
| U-R4 | Undesigned behaviour (skeleton motion, toast timing) could drift from the designers' intent                                         | Explicit decisions D-U3 and D-U6 before code                                                                                                                                    |
| U-R5 | Guard conditions depend on unconfirmed backend rules (Recording states)                                                             | Generic `when` only; modules decide later                                                                                                                                       |
| G-1  | A second browser Back with no user interaction in between leaves a guarded page (browser rule; [findings](phase-06-g1-findings.md)) | **RISK ACCEPTED — BROWSER LIMITATION** (2026-11-18), conditional: binding Notes/Recording data-protection criteria and release gate (findings §6); G-1 reproduction kept in E2E |

## 13. Definition of Done (Phase 06)

- **Increments:** 1–5 are merged through PRs with CI green.
- **Roadmap acceptance:** met, and its tests are present (per exit path, safe-action focus,
  error isolation).
- **Docs:** `docs/shared-patterns.md` tells modules which component to use for loading, empty,
  error, guard, overlay and toast.
- **Copy:** approved and used verbatim.
- **Records:** the phase closure report is written and `PROGRESS.md` is updated. Phase 07 has not
  started.

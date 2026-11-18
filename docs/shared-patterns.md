# Shared patterns — module integration guide (Phase 06)

Phase 06 builds these once, in `src/shared/patterns`, `src/shared/hooks` and `src/shared/ui`, for
every module to reuse.

- **Don't build module-specific copies,** and don't re-implement their behaviour (timers, focus,
  history handling) inside a feature.
- **Sources:**
  - values and Figma nodes: [design-values.md §15](design-values.md);
  - decisions: [phases/phase-06-plan.md](phases/phase-06-plan.md) §6;
  - guard limits: §7–§7.2 of the plan and [phases/phase-06-g1-findings.md](phases/phase-06-g1-findings.md).

| Situation                                                  | Use                                            |
| ---------------------------------------------------------- | ---------------------------------------------- |
| Content is loading                                         | `SkeletonRegion` + `Skeleton` / `SkeletonText` |
| A section failed to load (data) or crashed while rendering | `SectionBoundary` (shows `ErrorCard`)          |
| A whole page or panel failed                               | `ErrorCard layout="card"`                      |
| Nothing here yet / no results                              | `EmptyState`                                   |
| Leaving would lose unsaved work or stop a recording        | `useNavigationGuard` + `useGuardedRouter`      |
| Any programmatic navigation                                | `useGuardedRouter` (raw routers are banned)    |
| A short confirmation or failure message                    | `useToast()`                                   |
| A destructive or "leave" action in a dialog                | `Button variant="danger"`                      |
| A modal question, a sheet, a menu, a popover               | Phase 03 `Dialog`, `Sheet`, `Menu`, `Popover`  |

## Rules for every module

1. **All copy comes from the module, as props.** These components hold no copy of their own
   (the only exceptions are the guard dialog copy and the toast close label, which are app-wide
   and approved). Keep Arabic copy verbatim from Figma or the Handoff.
2. **No mock data.** Use these components with real module state. A screen fed with static data is
   "UI-complete, not functional".
3. **No new variants by copying.** If a component needs something it lacks, raise it as a shared
   change (Yousef owns `src/shared`); a feature never forks it.
4. **Direction:** all patterns use logical properties and need no `dir` prop. They mirror with the
   document direction (`ar` RTL, `en` LTR). Icons inside them are never mirrored.
5. **Motion:** every animation respects `prefers-reduced-motion` (opacity only, or none).
6. **Testing:** a module that uses a pattern tests its own states (loading, error, empty, guard
   on/off) with its real copy. It does not re-test the pattern's internals.

## Navigation guard: `useNavigationGuard`, `useGuardedRouter`

**Purpose:** ask before the user leaves a page that holds unsaved work or an active recording.

**API:**

```tsx
"use client";
import { useGuardedRouter, useNavigationGuard } from "@/shared/hooks/useNavigationGuard";

useNavigationGuard({
  when: hasUnsavedChanges, // the module's own condition; nothing is registered while false
  kind: "unsaved", // "unsaved" | "recording" — selects the approved dialog copy
  onLeave: () => discardDraftLocks(), // optional cleanup just before an approved Leave
});

const router = useGuardedRouter(); // push / replace pass through the guard
router.push(ROUTES.summaries);
```

`NavigationGuardProvider` is mounted once in `[locale]/layout`; modules never mount it.

**Behaviour:**

| Exit path                                                     | Result                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| Internal links (shell, page, language switch), guarded router | `ConfirmGuardDialog`: Stay keeps everything; Leave goes |
| Browser Back / Forward to an in-app entry                     | Dialog (Chromium Navigation API; sentinel fallback)     |
| Refresh, tab close, typed URL, external link, cross-document  | Browser's native `beforeunload` prompt only             |
| Guard off (`when` false)                                      | Nothing: no listener, history entry or prompt           |

**Rules:**

- Use `useGuardedRouter` for every programmatic navigation. ESLint (`no-restricted-imports`)
  rejects the raw Next.js router outside the guard.
- Keep `when` precise. A guard that is on without unsaved work trains users to press Leave.
- **The guard is a courtesy prompt, not storage.** Notes and Recording must persist drafts
  (findings §6, binding release gate).

**Accessibility:**

- The dialog is an `alertdialog` with the safe action (Stay) focused.
- Esc and the scrim act as Stay, and focus returns to where it was.
- Every path is keyboard operable.

**RTL/LTR:** the direction-neutral dialog follows the document direction. Stay sits first, at the
inline start.

**Responsive:** the dialog uses the Phase 03 `Dialog` (width 440 unsaved / 420 recording, viewport
− 40 on small screens). It works the same in the Sidebar, Rail, drawer, bottom bar and More sheet.

**Known limitations:**

- **G-1 (RISK ACCEPTED — BROWSER LIMITATION):** a second browser Back with no user interaction in
  between (for example Esc, then Back, or Back twice) is not cancelable by browser rule, and it
  leaves.
- **Native prompt:** it is unstyled, browser-dependent, and shown only after the user has
  interacted with the page.
- **Fallback (no Navigation API):** it discards Forward entries, and it does not stop multi-step
  jumps.
- **Browser coverage:** Chromium is fully covered. Firefox and WebKit are covered by the focused
  suite `navigation-guard.cross-browser.spec.ts`, with real devices still required (R-3, closure
  report).

**Test fixture:** the dev-only route `/dev/fixtures/navigation-guard` (`page.fixture.tsx`, not
built in production) mounts a guard inside the real shell for the E2E suite.

## Guard dialog: `ConfirmGuardDialog`

**Purpose:** the one confirmation used by the guard. **Modules do not render it directly.** The
provider shows it with the approved copy for the guard `kind`.

**API (internal to the provider):** `open`, `kind` (`"unsaved"` | `"recording"`), `copy`
(`title`, `description`, `stay`, `leave`), `onStay` (Stay, Esc, scrim) and `onLeave`.

| Kind        | Figma                             | Copy source                                          |
| ----------- | --------------------------------- | ---------------------------------------------------- |
| `unsaved`   | Unsaved changes guard             | `patterns.guard.unsaved` (Arabic verbatim, D-U10 en) |
| `recording` | Leave Recording Guard `2744:5127` | `patterns.guard.recording`                           |

**Accessibility:**

- `role="alertdialog"`, labelled and described.
- Focus goes to Stay on open, is trapped while open, and returns on close.
- Esc means Stay.

**RTL/LTR:** the actions sit in reading order, with Stay at the inline start (the right in RTL).

**Limitation:** no close button (none is drawn).

## Danger text button: `Button variant="danger"`

**Purpose:** the "leave / discard" action of a confirmation (D-U2), for example "مغادرة على أي
حال".

**API:** `<Button variant="danger" onClick={…}>{t("leave")}</Button>`. The props are the shared
`Button`'s (`variant`, native button attributes, layout-only `className`).

**Variants:** this is a variant of the one shared `Button` (`primary` | `secondary` | `danger`).
It uses the Secondary surface and border with a **Coral Pulse** label in every state. **There is
no solid red button.**

**Accessibility:**

- It is a native `<button>` 44 high, with the D-B2 focus ring.
- Rendered contrast is measured: Pressed is 4.66:1 (U-R3).

**RTL/LTR:** symmetric padding and a centred label; identical in both directions.

**Limitations:** label-only (no icon or loading state, D-B3/D-B4). Use it **only** for the
destructive or leave choice, next to a safe Primary or Secondary action.

## Loading: `Skeleton`, `SkeletonText`, `SkeletonRegion`

**Purpose:** show where content will appear while it loads, without layout shift.

**API:**

| Component        | Props                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| `SkeletonRegion` | `label` (module copy, read once by screen readers), `children`           |
| `Skeleton`       | `width` (default `"100%"`), `height` (default 12): pixels or CSS lengths |
| `SkeletonText`   | `lines` (default 2), `lastLineWidth` (default `"70%"`)                   |

```tsx
import { Skeleton, SkeletonRegion, SkeletonText } from "@/shared/patterns/Skeleton";

<SkeletonRegion label={t("loadingLectures")}>
  <Skeleton width={124} height={16} /> {/* the title */}
  <SkeletonText lines={2} /> {/* two 12px lines, the last one 70% */}
  <Skeleton height={96} /> {/* a full-width 96px block */}
</SkeletonRegion>;
```

**Rules:**

- **Shape it like the content.** Render the skeleton inside the real card, at the sizes of what
  will appear, so the layout does not shift when the data arrives.
- Use one region per loading area.

**Accessibility:**

- The region sets `aria-busy="true"` and reads its label once. It is not a live region, so it
  makes no repeated announcements.
- The blocks are hidden from assistive technology.

**Motion:** a subtle opacity pulse (D-U3), with none under reduced motion.

**RTL/LTR and responsive:** blocks use logical sizes, and percentage widths follow the container.

**Limitation:** no shimmer, and no automatic shape detection.

## Errors: `ErrorCard`

**Purpose:** a failed page, panel or section, with an optional retry.

**API:**

| Prop                     | Meaning                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `layout`                 | `"card"` (default): the full error surface. `"section"`: the inline error inside a section's own card      |
| `title`, `description`   | Module copy. The title is a heading (h2 for card, h3 for section; override with `headingLevel`)            |
| `onRetry` + `retryLabel` | Optional, always together. If `onRetry` returns a promise, repeat activations are ignored until it settles |

```tsx
import { ErrorCard } from "@/shared/patterns/ErrorCard";

<ErrorCard title={t("loadFailed")} description={t("tryAgain")} retryLabel={t("retry")} onRetry={refetch} />
<ErrorCard layout="section" title={t("lecturesFailed")} retryLabel={t("retry")} onRetry={refetch} />
```

**Variants:**

- `card`: Dashboard full error `2495:2424`, Primary retry.
- `section`: inline `2495:2966`, Secondary retry.

The default retry label in Figma is "إعادة المحاولة".

**Accessibility:**

- The text is a polite `status`, so a late failure is announced once.
- The retry button is marked `aria-disabled` while it is pending, and focus stays on it.

**Responsive:** the section layout is a row when its card is at least 28rem wide, and stacked and
centred below that. It is a container query, so it follows the card, not the viewport.

**Limitations:** don't put backend messages in it, and don't invent error copy. It has no error
codes or details.

## Sections: `SectionBoundary`

**Purpose:** one independently rendered section with its loading, error and retry states, so one
failed section never breaks the page.

**API:** `copy` (`title`, `description?`, `retryLabel`), `status` (`"ready"` | `"loading"` |
`"error"`, owned by the module, default `"ready"`), `loading`, `onRetry`, `onError`, `layout`,
`headingLevel`, `children`.

```tsx
"use client";
import { SectionBoundary } from "@/shared/patterns/SectionBoundary";

<SectionBoundary
  copy={{ title: t("lecturesFailed"), description: t("restWorks"), retryLabel: t("retry") }}
  status={query.status}
  loading={<LecturesSkeleton />}
  onRetry={query.refetch}
  onError={(error) => report(error)}
>
  <RecentLectures />
</SectionBoundary>;
```

**What is caught (Next.js 16 `catchError`):**

- **Caught:** errors thrown while rendering the children, including `use()` rejections, and in
  their lifecycle methods.
- **Not caught:** errors in event handlers, timers, or fetches awaited outside render. Report
  those with `status="error"`.
- **Passed through:** `redirect()` and `notFound()`. The error clears on client navigation.
- **Never silent:** React reports every caught error, and `onError` gives the module the error
  once.

**Retry:** `onRetry` runs first, then `retry()` re-fetches the route (a server round trip) and
re-renders the children.

**Focus after a retry started inside the section (accessibility):**

- **While pending:** focus stays on the retry button.
- **Recovered:** focus moves, without scrolling, to the first heading (made `tabindex="-1"`) or to
  the section wrapper.
- **Still failing:** focus moves to the new retry button.
- **User moved elsewhere:** nothing is moved.

There is no time limit, so a slow refresh never drops focus to the document (PR #44).

**RTL/LTR and responsive:** inherited from `ErrorCard` and the module's skeleton.

**Limitation:** recovery speed depends on the route refresh. With a slow network, the retry
pending state is visible for longer.

## Empty states: `EmptyState`

**Purpose:** "nothing here yet" and "no results" states, with clear next actions.

**Attribution:** written by **Mariam** (Frontend Developer) from the approved starter
([phases/phase-06-empty-state-starter.md](phases/phase-06-empty-state-starter.md)). It was
delivered offline and integrated verbatim by Yousef through PR #39 (delivery commit `b7cf1d9`).

**API:** `variant` (`"default"` | `"compact"`), `icon` (decorative), `title`, `description?`,
`actions?` (up to two, usually shared `Button`s, rendered in order), `footnote?`, `headingLevel?`
(2 | 3, default 2).

```tsx
import { EmptyState } from "@/shared/patterns/EmptyState";

<EmptyState
  icon="fileText"
  title={t("noSummaries")}
  description={t("noSummariesHint")}
  actions={<Button onClick={create}>{t("createSummary")}</Button>}
/>;
```

**Variants:**

- `default`: `Shared / Empty State` `2389:4037`, used by Summaries and Notes.
- `compact`: Dashboard first-time `2482:2130`; tighter box (padding 48/32, radius 20), tile 72.

**Accessibility:**

- It is static content (no role, no focus moves).
- The icon is hidden from assistive technology.
- The title is a real heading.

**RTL/LTR:** centred, with symmetric padding and no `dir`. The icon is never mirrored.

**Responsive:** the content wraps inside the box at every width from 320 up.

**Limitations:** no illustrations (icon tile only), and no more than two actions.

## Toasts: `useToast`

**Purpose:** short, non-blocking feedback after the module's own action succeeds or fails.

**API:** `ToastProvider` is mounted once in `[locale]/layout`. `useToast()` returns
`show({ kind, message, action? })`, which returns an id, and `dismiss(id)`.

```tsx
"use client";
import { useToast } from "@/shared/patterns/Toast";

const toast = useToast();
toast.show({ kind: "success", message: t("saved") });
toast.show({
  kind: "error",
  message: t("saveFailed"),
  action: { label: t("retry"), onAction: save },
});
```

| Kind              | Behaviour (D-U6)                                          | Announced as        |
| ----------------- | --------------------------------------------------------- | ------------------- |
| `success`, `info` | Leave after 4 s                                           | polite (`status`)   |
| `error`           | Stays until dismissed; may carry one action (Figma retry) | assertive (`alert`) |

**Timing and stacking:**

- The timer pauses while a toast is hovered or focused, or the tab is hidden, and resumes with the
  time left.
- Up to 3 are shown at once; a 4th removes the oldest success or info first.

**Accessibility:**

- Persistent hidden live regions announce each message once.
- Focus never moves to a toast.
- Each toast has a close button ("إغلاق" / "Close", approved), and focus returns when a focused
  toast closes.
- Under reduced motion it uses opacity only.

**RTL/LTR:** the mark sits at the inline start and close at the inline end, in both directions.

**Responsive:**

- **Width:** 420, or viewport − 40.
- **Position:** bottom-centre, 118 above the bottom on mobile (clear of the 84 bottom bar) and 78
  elsewhere, plus the safe area.
- **Pointer:** the stack never blocks controls beside it.

**Not for:** form validation (use the field error), page or section failures (`ErrorCard`,
`SectionBoundary`), or decisions (`Dialog`). It has no backend connection.

**Limitations:** no exit animation, and it renders behind an open modal dialog (`z-50`, not the
top layer).

## Shell overlays: Notifications and User Menu (D-U8)

These are the Phase 05 shells, verified against the Figma overlay frames in Increment 5
(`tests/e2e/overlay-frames.spec.ts`).

- **Notifications:** the title and the availability message (D-S5).
- **User Menu:** "الملف الشخصي" and "الإعدادات" (D-S6).
- **No sample data:** no notifications, account header or logout until real data and
  authentication exist.
- **Geometry:** follows the Phase 03 positioning contract (D-PM5); the differences from the
  frames are recorded in that spec and in the closure report.

# Shared patterns — which component to use

Phase 06 builds these once, in `src/shared/patterns` and `src/shared/hooks`, for every module to
reuse. Don't build module-specific copies. The values and Figma nodes are in
[design-values.md §15](design-values.md); the decisions are in
[phases/phase-06-plan.md](phases/phase-06-plan.md) §6.

| Situation                                                  | Use                                            | Status                      |
| ---------------------------------------------------------- | ---------------------------------------------- | --------------------------- |
| Content is loading                                         | `SkeletonRegion` + `Skeleton` / `SkeletonText` | Increment 2                 |
| A section failed to load (data) or crashed while rendering | `SectionBoundary` (shows `ErrorCard`)          | Increment 2                 |
| A whole page or panel failed                               | `ErrorCard layout="card"`                      | Increment 2                 |
| Nothing here yet / no results                              | `EmptyState`                                   | Integrated                  |
| Leaving would lose unsaved work                            | `useNavigationGuard` (+ `useGuardedRouter`)    | Increment 1                 |
| A modal question, a sheet                                  | Phase 03 `Dialog`, `Sheet`                     | Phase 03                    |
| A short confirmation message                               | Toast                                          | Increment 4 (not built yet) |

All copy comes from the module, as props. The components hold no copy of their own.

## Loading: `Skeleton`, `SkeletonText`, `SkeletonRegion`

```tsx
import { Skeleton, SkeletonRegion, SkeletonText } from "@/shared/patterns/Skeleton";

<SkeletonRegion label={t("loadingLectures")}>
  <Skeleton width={124} height={16} /> {/* the title */}
  <SkeletonText lines={2} /> {/* two 12px lines, the last one 70% */}
  <Skeleton height={96} /> {/* a full-width 96px block */}
</SkeletonRegion>;
```

- **Shape it like the content.** Render the skeleton inside the real card, at the sizes of what
  will appear (Figma draws each block at its content's size), so the layout does not shift when
  the data arrives. Lengths are pixels (numbers) or CSS lengths (`"40%"`).
- **Semantics:** `SkeletonRegion` sets `aria-busy="true"` and reads its `label` once. It is not a
  live region, so it makes no repeated announcements, and the blocks are hidden from assistive
  technology. Use one region per loading area.
- **Motion:** a subtle opacity pulse (D-U3); none under `prefers-reduced-motion`.

## Errors: `ErrorCard`

```tsx
import { ErrorCard } from "@/shared/patterns/ErrorCard";

<ErrorCard title={t("loadFailed")} description={t("tryAgain")} retryLabel={t("retry")} onRetry={refetch} />
<ErrorCard layout="section" title={t("lecturesFailed")} description={t("restWorks")} retryLabel={t("retry")} onRetry={refetch} />
```

| Prop                     | Meaning                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `layout`                 | `"card"` (default): the full error surface. `"section"`: the inline error inside a section's own card      |
| `title`, `description`   | Module copy. The title is a heading (h2 for card, h3 for section; override with `headingLevel`)            |
| `onRetry` + `retryLabel` | Optional, always together. If `onRetry` returns a promise, repeat activations are ignored until it settles |

- **Section layout:** it is a row when its card is at least 28rem wide, and stacked and centred
  below that (a container query, so it follows the card).
- **Announcements:** the text is a polite `status`, so a section that fails after loading is
  announced once.
- **No invented copy:** don't put backend messages in it, and don't invent error texts. Use the
  module's approved copy.

## Sections: `SectionBoundary`

```tsx
"use client";
import { SectionBoundary } from "@/shared/patterns/SectionBoundary";

<SectionBoundary
  copy={{ title: t("lecturesFailed"), description: t("restWorks"), retryLabel: t("retry") }}
  status={query.status} // "loading" | "error" | "ready" — owned by the module
  loading={<LecturesSkeleton />} // a SkeletonRegion shaped like the section
  onRetry={query.refetch} // runs before the section re-renders
  onError={(error) => report(error)}
>
  <RecentLectures />
</SectionBoundary>;
```

It is built on Next.js 16 `catchError`. One failed section never breaks the page: the other
sections keep rendering and stay interactive.

**What is caught, and what is not:**

- **Caught:** errors thrown while **rendering** the children, including a rejected promise read
  with `use()`, and in their lifecycle methods.
- **Not caught:** errors in **event handlers**, timers, or a fetch awaited outside render.
  Report those with `status="error"`, which shows the same ErrorCard.
- **Passed through:** `redirect()` and `notFound()` (Next.js), and the error clears on client
  navigation to another route.
- **Never silent:** React still reports every caught error (the development console, and the
  root's `onCaughtError` in production), and `onError` gives the module the error once.

**Retry:** `onRetry` runs first (re-fetch, or fix the state), then the boundary re-renders its
children (`retry()`). If they throw again, the ErrorCard comes back.

**Focus after a retry started from inside the section:**

- **While pending:** focus stays on the retry button.
- **Recovered:** focus moves, without scrolling, to the section's first heading (made focusable
  with `tabindex="-1"`, not in the Tab order), or to the section wrapper when there is no heading.
- **Still failing:** focus moves to the new retry button.
- **User moved elsewhere:** nothing is moved.

The watcher is scoped to the section and stops once it has decided. Edge case: retrying again
within about a second of a previous failure (while that re-render is still committing) can leave
focus on the new retry button rather than the heading. Nothing is lost.

## Navigation guard: `useNavigationGuard`, `useGuardedRouter`

```tsx
useNavigationGuard({ when: hasUnsavedChanges, kind: "unsaved" }); // or "recording"
const router = useGuardedRouter(); // the only router modules may use (ESLint enforces it)
```

- **Behaviour:** links, the guarded router and in-app Back/Forward open the approved dialog.
  Refresh, tab close and external links get only the browser's native prompt.
- **Details:** limits, browser support and the fallback are in the plan §7–§7.2.

## Empty states: `EmptyState`

`variant="default"` (the cross-module empty state) or `"compact"` (the Dashboard first-time
card). Pass the icon, title, description, up to two actions and an optional footnote. Contract:
[phases/phase-06-empty-state-starter.md](phases/phase-06-empty-state-starter.md).

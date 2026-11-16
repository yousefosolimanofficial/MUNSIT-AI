"use client";

import { useActiveDestination } from "@/shared/navigation/use-active-destination";

/**
 * Phase 04 test instrumentation (temporary; removed with the placeholders when the Phase 05 shell
 * consumes `useActiveDestination`).
 *
 * Why: Phase 04 has no visible navigation, so the active destination has no public, observable
 * behaviour yet. This exposes the client-side resolution of the current URL as data attributes,
 * so E2E tests prove — in a real browser — that next-intl's `usePathname()` output (with typed
 * `pathnames` it can be an internal template) resolves to the right destination on deep links and
 * refreshes.
 *
 * Isolation: rendered only outside production builds (`RoutePlaceholder`); `hidden` keeps it out
 * of layout and the accessibility tree. Production HTML never contains it (checked with
 * `next start`).
 */
export function ActiveDestinationProbe() {
  const { routeKey, destination } = useActiveDestination();
  return (
    <span
      hidden
      data-testid="active-destination"
      data-route-key={routeKey ?? ""}
      data-destination={destination ?? ""}
    />
  );
}

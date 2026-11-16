"use client";

import { useActiveDestination } from "@/shared/navigation/use-active-destination";

/**
 * Phase 04 verification hook (temporary, removed with the placeholders when the Phase 05 shell
 * consumes `useActiveDestination`): exposes the client-side resolution of the current URL as
 * hidden data attributes, so E2E tests can prove deep links and refreshes resolve the same active
 * destination in a real browser. Renders nothing visible and nothing for assistive technology.
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

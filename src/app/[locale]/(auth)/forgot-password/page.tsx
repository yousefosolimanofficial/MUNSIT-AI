import type { Metadata } from "next";

import { placeholderMetadata, RoutePlaceholder } from "@/app/[locale]/_components/RoutePlaceholder";

import { assertAuthRouteAvailable } from "../_lib/availability";

/** Phase 04 placeholder (route key `auth.forgotPassword`; path in `src/i18n/routes.ts`). Not implemented yet.
 * Production returns 404 until Authentication is available (P07-D25). */
export function generateMetadata(): Promise<Metadata> {
  assertAuthRouteAvailable();
  return placeholderMetadata("auth.forgotPassword");
}

export default function Page() {
  assertAuthRouteAvailable();
  return <RoutePlaceholder routeKey="auth.forgotPassword" />;
}

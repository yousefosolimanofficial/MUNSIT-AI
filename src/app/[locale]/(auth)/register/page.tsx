import type { Metadata } from "next";

import { placeholderMetadata } from "@/app/[locale]/_components/RoutePlaceholder";
import { RegisterScreen } from "@/features/auth";

import { assertAuthRouteAvailable } from "../_lib/availability";

/** Register (route key `auth.register`; Phase 08 Increment 3). "UI-complete, not functional": the
 * form uses the fail-closed placeholder adapter and always ends with "unavailable". Production
 * returns 404 until Authentication is available (P07-D25). The metadata keeps the route title and
 * `noindex, nofollow`. */
export function generateMetadata(): Promise<Metadata> {
  assertAuthRouteAvailable();
  return placeholderMetadata("auth.register");
}

export default function Page() {
  assertAuthRouteAvailable();
  return (
    <main>
      <RegisterScreen />
    </main>
  );
}

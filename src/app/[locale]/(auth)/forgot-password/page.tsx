import type { Metadata } from "next";

import { placeholderMetadata } from "@/app/[locale]/_components/RoutePlaceholder";
import { ForgotPasswordScreen } from "@/features/auth/components/ForgotPasswordScreen";

import { assertAuthRouteAvailable } from "../_lib/availability";

/** Forgot Password (route key `auth.forgotPassword`; Phase 08 Recovery UI). "UI-complete, not
 * functional": the form uses the fail-closed placeholder adapter and always ends with
 * "unavailable". Production returns 404 until Authentication is available (P07-D25). The metadata
 * keeps the route title and `noindex, nofollow`. The screen is imported by path; Yousef adds the
 * `src/features/auth/index.ts` export at integration. */
export function generateMetadata(): Promise<Metadata> {
  assertAuthRouteAvailable();
  return placeholderMetadata("auth.forgotPassword");
}

export default function Page() {
  assertAuthRouteAvailable();
  return (
    <main>
      <ForgotPasswordScreen />
    </main>
  );
}

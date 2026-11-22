import type { AppEnv } from "./env";

/*
 * Feature availability shared by every layer (single source of truth). Driven by
 * `NEXT_PUBLIC_APP_ENV` (./env.ts): a production deployment sets `production`; development and
 * preview keep `development` / `test`.
 */

/**
 * P07-D24 (owner, 2026-11-22): Authentication is not operational yet. The Auth routes are Phase 04
 * placeholders and Phase 08 (Authentication UI) has not started. Set to `true` only when the owner
 * confirms a working sign-in and registration flow.
 */
export const AUTHENTICATION_AVAILABLE = false;

/**
 * Whether Authentication may be offered: public entry points on the Landing (P07-D24) and the
 * Auth routes themselves (P07-D25). Production hides both until Authentication is operational;
 * development and preview keep them.
 */
export function isAuthenticationAvailable(
  appEnv: AppEnv,
  available: boolean = AUTHENTICATION_AVAILABLE,
): boolean {
  return available || appEnv !== "production";
}

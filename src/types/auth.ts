/*
 * Authentication domain types (Phase 08 Increment 1).
 *
 * Provider-agnostic: the provider, session model, token storage and route protection are gate
 * D-02 (Roadmap §5) and are not decided. Phase 08 is UI only (plan §1, D-08-4): no account, no
 * session, no stored credential and no endpoint. The functional integration is Phase 21.
 */

/** Why an Authentication operation did not succeed. The UI maps each one to a message key. */
export type AuthFailure =
  /** Authentication is not available yet (Phase 08 placeholder adapter). */
  | "unavailable"
  /** Sign-in rejected for the email and password given. */
  | "invalid-credentials"
  /** The operation failed for another reason (Register, Forgot, Reset "Failed" states). */
  | "rejected"
  /** The password-reset link is invalid or already used. */
  | "invalid-link"
  /** The password-reset link has expired. */
  | "expired-link";

export type AuthResult =
  { readonly ok: true } | { readonly ok: false; readonly failure: AuthFailure };

/**
 * The signed-in session. Its real shape is owned by D-02; Phase 08 never has one, so every
 * adapter in Phase 08 returns `null`.
 */
export type AuthSession = { readonly userId: string } | null;

/**
 * Route protection contract (D-08-6, owner 2026-11-23): types and documentation only.
 *
 * - `public`: anyone (the Landing).
 * - `guest-only`: meant for signed-out users (the `(auth)` route group).
 * - `protected`: requires a session (the `(app)` and `(focus)` route groups).
 *
 * No guard enforces this in Phase 08 and nothing redirects: the functional guard is a later
 * integration dependency, built with a real adapter after D-02.
 */
export type RouteAccess = "public" | "guest-only" | "protected";

/** The intended access level of each route group (contract only; not enforced). */
export const ROUTE_ACCESS = {
  public: "public",
  auth: "guest-only",
  app: "protected",
  focus: "protected",
} as const satisfies Record<string, RouteAccess>;

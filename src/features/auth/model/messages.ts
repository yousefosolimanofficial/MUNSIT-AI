import type { AuthFailure } from "@/types/auth";

/*
 * Message keys for Authentication results (Phase 08 Increment 1). Schemas and adapters produce
 * keys, never strings; components resolve them through `auth.json` (D-08-5: copy only in message
 * files). Keys are relative to the `auth` namespace.
 */

export type AuthOperation = "login" | "register" | "forgot" | "reset";

/**
 * The form-level message for a failed operation, or `null` when the failure is shown as a view
 * instead of a message (the Invalid and Expired reset-link views).
 *
 * `unavailable` uses the owner-approved, operation-specific wording (2026-11-23); it never says
 * that the credentials are wrong (risk R08-1).
 */
export function failureMessageKey(operation: AuthOperation, failure: AuthFailure): string | null {
  switch (failure) {
    case "unavailable":
      return `errors.unavailable.${operation}`;
    case "invalid-credentials":
      return "errors.invalidCredentials";
    case "rejected":
      return `errors.failed.${operation}`;
    case "invalid-link":
    case "expired-link":
      return null;
  }
}

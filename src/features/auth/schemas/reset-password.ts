import { z } from "zod";

import { confirmPasswordSchema, newPasswordSchema } from "./fields";

/*
 * Reset Password form schema (Phase 08 Recovery UI, START_HERE §2.3 and §5). Errors are message
 * keys relative to `authentication` (`validation.*`), resolved by the screen. Neither password is
 * trimmed or transformed.
 *
 * The match check lives here because it needs both fields. Its `when` condition runs it whenever
 * the confirmation itself is filled in (no issue on `confirmPassword`), even if the new password
 * is invalid: a confirmation that differs is reported as a mismatch at once (START_HERE §8,
 * "mismatch on confirm, also while the new password is invalid").
 */

const fieldsSchema = z.object({
  newPassword: newPasswordSchema("newPasswordRequired"),
  confirmPassword: confirmPasswordSchema("confirmNewRequired"),
});

function isFormShape(value: unknown): value is { newPassword: string; confirmPassword: string } {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.newPassword === "string" && typeof record.confirmPassword === "string";
}

export const resetPasswordSchema = fieldsSchema.refine(
  (values) => values.confirmPassword === values.newPassword,
  {
    path: ["confirmPassword"],
    error: "validation.mismatch",
    when: (payload) =>
      isFormShape(payload.value) &&
      !payload.issues.some((issue) => issue.path?.[0] === "confirmPassword"),
  },
);

export type ResetPasswordValues = z.input<typeof resetPasswordSchema>;
export type ResetPasswordOutput = z.output<typeof resetPasswordSchema>;

/** The `validation.*` keys the Reset Password form can show (resolved to copy by the screen). */
export const RESET_PASSWORD_VALIDATION_KEYS = [
  "validation.newPasswordRequired",
  "validation.passwordRules",
  "validation.confirmNewRequired",
  "validation.mismatch",
] as const;

export type ResetPasswordValidationKey = (typeof RESET_PASSWORD_VALIDATION_KEYS)[number];

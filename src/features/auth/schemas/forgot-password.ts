import { z } from "zod";

import { emailSchema } from "./fields";

/*
 * Forgot Password form schema (Phase 08 Recovery UI, START_HERE §2.3 and §5). Errors are message
 * keys relative to `authentication` (`validation.*`), resolved by the screen. The email is trimmed
 * on output, so the adapter receives the trimmed value.
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordValues = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordOutput = z.output<typeof forgotPasswordSchema>;

/** The `validation.*` keys the Forgot Password form can show (resolved to copy by the screen). */
export const FORGOT_PASSWORD_VALIDATION_KEYS = [
  "validation.emailRequired",
  "validation.emailInvalid",
] as const;

export type ForgotPasswordValidationKey = (typeof FORGOT_PASSWORD_VALIDATION_KEYS)[number];

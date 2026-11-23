import { z } from "zod";

import { currentPasswordSchema, emailSchema } from "./fields";

/*
 * Login form schema (Phase 08 Increment 2, contract §3). Errors are message keys relative to
 * `authentication` (`validation.*`), resolved by the screen. The email is trimmed on output; the
 * password is never trimmed or transformed.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: currentPasswordSchema,
});

export type LoginValues = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;

/** The `validation.*` keys the Login form can show (resolved to copy by the screen). */
export const LOGIN_VALIDATION_KEYS = [
  "validation.emailRequired",
  "validation.emailInvalid",
  "validation.passwordRequired",
] as const;

export type LoginValidationKey = (typeof LOGIN_VALIDATION_KEYS)[number];

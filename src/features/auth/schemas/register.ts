import { z } from "zod";

import { confirmPasswordSchema, emailSchema, fullNameSchema, newPasswordSchema } from "./fields";

/*
 * Register form schema (Phase 08 Increment 3, contract §4). Errors are message keys relative to
 * `authentication` (`validation.*`), resolved by the screen. The name and email are trimmed on
 * output; the passwords are never trimmed or transformed.
 *
 * The match check sits on `confirm` ("كلمتا المرور غير متطابقتين."). It runs whenever both
 * passwords are present, even if another field is still invalid, so a submit shows every error at
 * once.
 */
export const registerSchema = z
  .object({
    name: fullNameSchema,
    email: emailSchema,
    password: newPasswordSchema("passwordRequired"),
    confirm: confirmPasswordSchema("confirmRequired"),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    error: "validation.mismatch",
    when: ({ value }) => {
      const input = value as { password?: unknown; confirm?: unknown } | undefined;
      return (
        typeof input?.password === "string" &&
        typeof input.confirm === "string" &&
        input.password !== "" &&
        input.confirm !== ""
      );
    },
  });

export type RegisterValues = z.input<typeof registerSchema>;
export type RegisterOutput = z.output<typeof registerSchema>;

/** The `validation.*` keys the Register form can show (resolved to copy by the screen). */
export const REGISTER_VALIDATION_KEYS = [
  "validation.nameRequired",
  "validation.emailRequired",
  "validation.emailInvalid",
  "validation.passwordRequired",
  "validation.passwordRules",
  "validation.confirmRequired",
  "validation.mismatch",
] as const;

export type RegisterValidationKey = (typeof REGISTER_VALIDATION_KEYS)[number];

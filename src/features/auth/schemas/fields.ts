import { z } from "zod";

import { meetsAllPasswordRules } from "../model/password-rules";

/*
 * Field schemas (Phase 08 Increment 1). Error values are message KEYS relative to `auth`
 * (`validation.*`), never strings; the form resolves them through `auth.json`. Form schemas
 * (Login, Register, Forgot, Reset) compose these in Increments 2–4, including the "passwords
 * do not match" check, which needs both fields.
 *
 * Wording comes from Figma only (D-08-5): Register Required `2480:2004`, Invalid Email
 * `2480:2124`, Password Rules `2480:2226`; Reset Required `2480:461`.
 */

/** "اكتب اسمك الكامل." */
export const fullNameSchema = z.string().trim().min(1, { error: "validation.nameRequired" });

/** "اكتب بريدك الإلكتروني." / "اكتب بريد إلكتروني صحيح." */
export const emailSchema = z
  .string()
  .trim()
  .min(1, { error: "validation.emailRequired" })
  .pipe(z.email({ error: "validation.emailInvalid" }));

/** Sign-in password: required only (no rules are shown on Login). */
export const currentPasswordSchema = z.string().min(1, { error: "validation.passwordRequired" });

/** New password: required, then every rule (Register, Reset). */
export function newPasswordSchema(requiredKey: "passwordRequired" | "newPasswordRequired") {
  return z
    .string()
    .min(1, { error: `validation.${requiredKey}`, abort: true })
    .refine(meetsAllPasswordRules, { error: "validation.passwordRules" });
}

/** Confirmation: required (the match check lives in the form schema). */
export function confirmPasswordSchema(requiredKey: "confirmRequired" | "confirmNewRequired") {
  return z.string().min(1, { error: `validation.${requiredKey}` });
}

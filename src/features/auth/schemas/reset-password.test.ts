import { describe, expect, it } from "vitest";

import { RESET_PASSWORD_VALIDATION_KEYS, resetPasswordSchema } from "./reset-password";

const VALID = "Secret-123";

function issues(input: unknown) {
  const result = resetPasswordSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}:${i.message}`);
}

describe("resetPasswordSchema", () => {
  it("requires both fields, with the Reset wording", () => {
    expect(issues({ newPassword: "", confirmPassword: "" })).toEqual([
      "newPassword:validation.newPasswordRequired",
      "confirmPassword:validation.confirmNewRequired",
    ]);
  });

  it("rejects a new password that misses any rule", () => {
    for (const weak of ["short1A", "alllowercase1", "ALLUPPERCASE1", "NoDigitsHere"]) {
      expect(issues({ newPassword: weak, confirmPassword: weak })).toEqual([
        "newPassword:validation.passwordRules",
      ]);
    }
  });

  it("accepts a password that meets every rule (length, case, digit) when both match", () => {
    expect(issues({ newPassword: VALID, confirmPassword: VALID })).toEqual([]);
    expect(issues({ newPassword: "Abcdefg١", confirmPassword: "Abcdefg١" })).toEqual([]);
  });

  it("requires the confirmation", () => {
    expect(issues({ newPassword: VALID, confirmPassword: "" })).toEqual([
      "confirmPassword:validation.confirmNewRequired",
    ]);
  });

  it("reports a mismatch on the confirmation", () => {
    expect(issues({ newPassword: VALID, confirmPassword: "Secret-124" })).toEqual([
      "confirmPassword:validation.mismatch",
    ]);
  });

  it("reports a mismatch also while the new password itself is invalid", () => {
    expect(issues({ newPassword: "abc", confirmPassword: "abd" })).toEqual([
      "newPassword:validation.passwordRules",
      "confirmPassword:validation.mismatch",
    ]);
  });

  it("an empty new password reports only Required (the shared field schema aborts)", () => {
    // `newPasswordSchema` uses `abort: true` on its required check (schemas/fields.ts), so the
    // form-level match check does not run; the confirmation is re-checked once the new password
    // changes (the form re-validates the touched confirmation).
    expect(issues({ newPassword: "", confirmPassword: "abd" })).toEqual([
      "newPassword:validation.newPasswordRequired",
    ]);
  });

  it("never trims or changes the password values", () => {
    const value = ` ${VALID} `;
    const result = resetPasswordSchema.safeParse({ newPassword: value, confirmPassword: value });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ newPassword: value, confirmPassword: value });
    // Surrounding spaces count: a trimmed confirmation is a mismatch.
    expect(issues({ newPassword: value, confirmPassword: VALID })).toEqual([
      "confirmPassword:validation.mismatch",
    ]);
  });

  it("only produces the keys the screen resolves", () => {
    for (const input of [
      { newPassword: "", confirmPassword: "" },
      { newPassword: "abc", confirmPassword: "x" },
      { newPassword: VALID, confirmPassword: "" },
    ]) {
      const result = resetPasswordSchema.safeParse(input);
      for (const issue of result.error?.issues ?? []) {
        expect(RESET_PASSWORD_VALIDATION_KEYS).toContain(issue.message);
      }
    }
  });

  it("does not run the match check on malformed input", () => {
    expect(resetPasswordSchema.safeParse(null).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ newPassword: VALID }).success).toBe(false);
  });
});

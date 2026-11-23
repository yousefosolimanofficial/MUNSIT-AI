import { describe, expect, it } from "vitest";

import arAuth from "@/i18n/messages/ar/authentication.json";

import {
  confirmPasswordSchema,
  currentPasswordSchema,
  emailSchema,
  fullNameSchema,
  newPasswordSchema,
} from "../schemas/fields";
import { AUTH_IMAGES } from "./auth-images";
import { failureMessageKey } from "./messages";
import {
  evaluatePasswordRules,
  meetsAllPasswordRules,
  meetsPasswordRule,
  PASSWORD_RULE_IDS,
} from "./password-rules";

/** Resolves a key relative to `auth` in the Arabic catalog. */
function resolve(key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object") return (node as Record<string, unknown>)[part];
    return undefined;
  }, arAuth);
}

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? [] : (result.error?.issues.map((i) => i.message) ?? []);

describe("password rules (single source, Figma reading order)", () => {
  it("lists the three Figma rules in reading order", () => {
    expect(PASSWORD_RULE_IDS).toEqual(["length", "case", "digit"]);
  });

  it.each([
    ["", { digit: false, case: false, length: false }],
    ["abcdefg", { digit: false, case: false, length: false }],
    ["abcdefgh", { digit: false, case: false, length: true }],
    ["Abcdefg", { digit: false, case: true, length: false }],
    ["Abcdefg1", { digit: true, case: true, length: true }],
    ["ABCDEFG1", { digit: true, case: false, length: true }],
    ["abcdefg١", { digit: true, case: false, length: true }],
  ])("%j", (value, expected) => {
    for (const id of PASSWORD_RULE_IDS) expect(meetsPasswordRule(id, value)).toBe(expected[id]);
    expect(meetsAllPasswordRules(value)).toBe(Object.values(expected).every(Boolean));
  });

  it("evaluates every rule in display order", () => {
    expect(evaluatePasswordRules("Abcdefg1").map((r) => r.id)).toEqual(["length", "case", "digit"]);
  });

  it("each rule has Arabic copy", () => {
    for (const id of PASSWORD_RULE_IDS) expect(typeof resolve(`rules.${id}`)).toBe("string");
  });
});

describe("field schemas produce message keys that exist", () => {
  it("full name", () => {
    expect(messages(fullNameSchema.safeParse("  "))).toEqual(["validation.nameRequired"]);
    expect(fullNameSchema.safeParse("أحمد محمد").success).toBe(true);
  });

  it("email: required, then format", () => {
    expect(messages(emailSchema.safeParse(""))).toEqual(["validation.emailRequired"]);
    expect(messages(emailSchema.safeParse("ahmed@example"))).toEqual(["validation.emailInvalid"]);
    expect(emailSchema.safeParse(" ahmed@example.com ").success).toBe(true);
  });

  it("current password: required only", () => {
    expect(messages(currentPasswordSchema.safeParse(""))).toEqual(["validation.passwordRequired"]);
    expect(currentPasswordSchema.safeParse("x").success).toBe(true);
  });

  it("new password: required, then every rule", () => {
    const schema = newPasswordSchema("newPasswordRequired");
    expect(messages(schema.safeParse(""))).toEqual(["validation.newPasswordRequired"]);
    expect(messages(schema.safeParse("abcdefg1"))).toEqual(["validation.passwordRules"]);
    expect(schema.safeParse("Abcdefg1").success).toBe(true);
  });

  it("confirmation: required", () => {
    expect(messages(confirmPasswordSchema("confirmRequired").safeParse(""))).toEqual([
      "validation.confirmRequired",
    ]);
  });

  it("every validation key resolves to Arabic copy", () => {
    for (const key of [
      "validation.nameRequired",
      "validation.emailRequired",
      "validation.emailInvalid",
      "validation.passwordRequired",
      "validation.newPasswordRequired",
      "validation.confirmRequired",
      "validation.confirmNewRequired",
      "validation.passwordRules",
      "validation.mismatch",
    ]) {
      expect(typeof resolve(key), key).toBe("string");
    }
  });
});

describe("failure messages (D-08-4)", () => {
  it("unavailable uses the operation-specific wording and never blames the credentials", () => {
    expect(failureMessageKey("login", "unavailable")).toBe("errors.unavailable.login");
    expect(resolve("errors.unavailable.login")).toBe("تسجيل الدخول غير متاح حاليًا.");
    expect(resolve("errors.unavailable.register")).toBe("إنشاء الحساب غير متاح حاليًا.");
    expect(resolve("errors.unavailable.forgot")).toBe("استعادة كلمة المرور غير متاحة حاليًا.");
    expect(resolve("errors.unavailable.reset")).toBe("إعادة تعيين كلمة المرور غير متاحة حاليًا.");
  });

  it("maps the other failures", () => {
    expect(failureMessageKey("login", "invalid-credentials")).toBe("errors.invalidCredentials");
    expect(failureMessageKey("register", "rejected")).toBe("errors.failed.register");
    expect(failureMessageKey("reset", "invalid-link")).toBeNull();
    expect(failureMessageKey("reset", "expired-link")).toBeNull();
    for (const op of ["register", "forgot", "reset"] as const) {
      expect(typeof resolve(`errors.failed.${op}`), op).toBe("string");
    }
  });
});

describe("marketing photos (D-08-2)", () => {
  it("keep the Figma source size", () => {
    expect(AUTH_IMAGES.login).toMatchObject({ width: 1200, height: 896 });
    expect(AUTH_IMAGES.register).toMatchObject({ width: 1200, height: 896 });
    expect(AUTH_IMAGES.recovery).toMatchObject({ width: 1264, height: 848 });
  });
});

import { describe, expect, it } from "vitest";

import { REGISTER_VALIDATION_KEYS, registerSchema } from "./register";

const VALID = {
  name: "أحمد محمد",
  email: "ahmed@example.com",
  password: "Abcdefg1",
  confirm: "Abcdefg1",
};

function issues(input: unknown) {
  const result = registerSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}:${i.message}`);
}

describe("registerSchema", () => {
  it("accepts valid input, trims the name and email, never the passwords", () => {
    const result = registerSchema.safeParse({
      ...VALID,
      name: "  أحمد محمد ",
      email: " ahmed@example.com ",
      password: " Abcdefg1 ",
      confirm: " Abcdefg1 ",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: "أحمد محمد",
      email: "ahmed@example.com",
      password: " Abcdefg1 ",
      confirm: " Abcdefg1 ",
    });
  });

  it("Required: every empty field reports its own message, and no mismatch", () => {
    expect(issues({ name: "", email: "", password: "", confirm: "" })).toEqual([
      "name:validation.nameRequired",
      "email:validation.emailRequired",
      "password:validation.passwordRequired",
      "confirm:validation.confirmRequired",
    ]);
    expect(issues({ ...VALID, name: "   " })).toEqual(["name:validation.nameRequired"]);
  });

  it("Invalid email", () => {
    expect(issues({ ...VALID, email: "ahmed@example" })).toEqual(["email:validation.emailInvalid"]);
  });

  it("Password rules: each unmet rule gives the one rules message", () => {
    for (const password of ["Abcdefg", "abcdefg1", "ABCDEFG1", "Abcdefgh"]) {
      expect(issues({ ...VALID, password, confirm: password })).toEqual([
        "password:validation.passwordRules",
      ]);
    }
  });

  it("Mismatch sits on confirm, also while another field is invalid", () => {
    expect(issues({ ...VALID, confirm: "Abcdefg2" })).toEqual(["confirm:validation.mismatch"]);
    expect(issues({ ...VALID, name: "", confirm: "Abcdefg2" })).toEqual([
      "name:validation.nameRequired",
      "confirm:validation.mismatch",
    ]);
  });

  it("only produces the keys the screen resolves", () => {
    for (const input of [
      { name: "", email: "", password: "", confirm: "" },
      { ...VALID, email: "x", password: "short", confirm: "other" },
    ]) {
      for (const issue of registerSchema.safeParse(input).error?.issues ?? []) {
        expect(REGISTER_VALIDATION_KEYS).toContain(issue.message);
      }
    }
  });
});

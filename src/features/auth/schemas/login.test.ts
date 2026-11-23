import { describe, expect, it } from "vitest";

import { LOGIN_VALIDATION_KEYS, loginSchema } from "./login";

function issues(input: unknown) {
  const result = loginSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}:${i.message}`);
}

describe("loginSchema", () => {
  it("requires the email", () => {
    expect(issues({ email: "", password: "x" })).toEqual(["email:validation.emailRequired"]);
    expect(issues({ email: "   ", password: "x" })).toEqual(["email:validation.emailRequired"]);
  });

  it("rejects an invalid email", () => {
    expect(issues({ email: "ahmed@example", password: "x" })).toEqual([
      "email:validation.emailInvalid",
    ]);
  });

  it("trims a valid email with surrounding spaces", () => {
    const result = loginSchema.safeParse({ email: "  ahmed@example.com ", password: "x" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("ahmed@example.com");
  });

  it("requires the password, without rules and without trimming", () => {
    expect(issues({ email: "ahmed@example.com", password: "" })).toEqual([
      "password:validation.passwordRequired",
    ]);
    const result = loginSchema.safeParse({ email: "ahmed@example.com", password: " a " });
    expect(result.data?.password).toBe(" a ");
  });

  it("accepts valid input and reports both fields when both are empty", () => {
    expect(issues({ email: "ahmed@example.com", password: "secret" })).toEqual([]);
    expect(issues({ email: "", password: "" })).toEqual([
      "email:validation.emailRequired",
      "password:validation.passwordRequired",
    ]);
  });

  it("only produces the keys the screen resolves", () => {
    for (const input of [
      { email: "", password: "" },
      { email: "a@b", password: "" },
    ]) {
      const result = loginSchema.safeParse(input);
      for (const issue of result.error?.issues ?? []) {
        expect(LOGIN_VALIDATION_KEYS).toContain(issue.message);
      }
    }
  });
});

import { describe, expect, it } from "vitest";

import { FORGOT_PASSWORD_VALIDATION_KEYS, forgotPasswordSchema } from "./forgot-password";

function issues(input: unknown) {
  const result = forgotPasswordSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}:${i.message}`);
}

describe("forgotPasswordSchema", () => {
  it("requires the email (empty or only spaces)", () => {
    expect(issues({ email: "" })).toEqual(["email:validation.emailRequired"]);
    expect(issues({ email: "   " })).toEqual(["email:validation.emailRequired"]);
  });

  it("rejects an invalid email", () => {
    expect(issues({ email: "ahmed@example" })).toEqual(["email:validation.emailInvalid"]);
    expect(issues({ email: "ahmed" })).toEqual(["email:validation.emailInvalid"]);
  });

  it("accepts a valid email", () => {
    expect(issues({ email: "ahmed@example.com" })).toEqual([]);
  });

  it("trims a valid email with surrounding spaces", () => {
    const result = forgotPasswordSchema.safeParse({ email: "  ahmed@example.com " });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ email: "ahmed@example.com" });
  });

  it("only produces the keys the screen resolves", () => {
    for (const input of [{ email: "" }, { email: " " }, { email: "a@b" }, {}]) {
      const result = forgotPasswordSchema.safeParse(input);
      for (const issue of result.error?.issues ?? []) {
        if (issue.code === "invalid_type") continue;
        expect(FORGOT_PASSWORD_VALIDATION_KEYS).toContain(issue.message);
      }
    }
  });
});

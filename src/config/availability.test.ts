import { describe, expect, it } from "vitest";

import { AUTHENTICATION_AVAILABLE, isAuthenticationAvailable } from "./availability";

describe("Authentication availability (P07-D24, P07-D25)", () => {
  it("Authentication is not available yet (owner decision)", () => {
    expect(AUTHENTICATION_AVAILABLE).toBe(false);
  });

  it("production hides Authentication; development and test keep it", () => {
    expect(isAuthenticationAvailable("production")).toBe(false);
    expect(isAuthenticationAvailable("development")).toBe(true);
    expect(isAuthenticationAvailable("test")).toBe(true);
  });

  it("once the owner confirms a working flow, production offers it", () => {
    expect(isAuthenticationAvailable("production", true)).toBe(true);
  });
});

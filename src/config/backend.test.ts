import { describe, expect, it } from "vitest";

import { parseBackendEnv } from "./backend";

describe("parseBackendEnv (server-only backend configuration)", () => {
  it("is optional: unset or blank → null", () => {
    expect(parseBackendEnv({})).toBeNull();
    expect(parseBackendEnv({ MUNSIT_API_BASE_URL: "   " })).toBeNull();
  });

  it("normalizes an http(s) URL and the default timeout", () => {
    expect(parseBackendEnv({ MUNSIT_API_BASE_URL: "https://api.example.test/" })).toEqual({
      baseUrl: "https://api.example.test",
      timeoutMs: 10_000,
    });
    expect(
      parseBackendEnv({
        MUNSIT_API_BASE_URL: "http://localhost:8000/v1/",
        MUNSIT_API_TIMEOUT_MS: "5000",
      }),
    ).toEqual({ baseUrl: "http://localhost:8000/v1", timeoutMs: 5000 });
  });

  it("rejects invalid values", () => {
    for (const value of [
      "not a url",
      "ftp://api.example.test",
      "http://api.example.test",
      "https://user:pass@api.example.test",
      "https://api.example.test/?key=1",
    ]) {
      expect(() => parseBackendEnv({ MUNSIT_API_BASE_URL: value })).toThrow();
    }
    for (const timeout of ["0", "999", "60001", "abc", "1.5"]) {
      expect(() =>
        parseBackendEnv({ MUNSIT_API_BASE_URL: "https://a.test", MUNSIT_API_TIMEOUT_MS: timeout }),
      ).toThrow();
    }
  });
});

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import { getBackendConfig, parseBackendEnv } from "./backend";

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

describe("server-only protection (PR-3)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('imports "server-only" before any code, so a Client Component import fails the build', () => {
    const source = readFileSync(fileURLToPath(new URL("./backend.ts", import.meta.url)), "utf8");
    const firstStatement = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line !== "");
    expect(firstStatement).toBe('import "server-only";');
  });

  it("still refuses to run in a browser at runtime", () => {
    vi.stubGlobal("window", {});
    expect(() => getBackendConfig()).toThrow("server-only");
  });

  it("reads the server environment on the server", () => {
    vi.stubEnv("MUNSIT_API_BASE_URL", "https://api.example.test/");
    vi.stubEnv("MUNSIT_API_TIMEOUT_MS", "");
    expect(getBackendConfig()).toEqual({ baseUrl: "https://api.example.test", timeoutMs: 10_000 });
  });
});

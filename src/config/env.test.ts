import { describe, expect, it } from "vitest";

import { parsePublicEnv } from "@/config/env";

describe("parsePublicEnv", () => {
  it("defaults to development when unset", () => {
    expect(parsePublicEnv({})).toEqual({ appEnv: "development" });
  });

  it("accepts a known stage", () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_APP_ENV: "production" })).toEqual({
      appEnv: "production",
    });
  });

  it("rejects an unknown stage", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_APP_ENV: "staging" })).toThrow(
      /Invalid NEXT_PUBLIC_APP_ENV/,
    );
  });
});

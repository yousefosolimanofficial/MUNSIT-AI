import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTE_ACCESS } from "@/types/auth";

import { placeholderAuthAdapter } from "./auth";

/*
 * D-08-4 (owner 2026-11-23): the Phase 08 placeholder adapter fails closed and never creates an
 * account, a session or a stored credential, and calls no endpoint.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

const INPUTS = {
  signIn: { email: "ahmed@example.com", password: "Secret123" },
  register: { name: "أحمد محمد", email: "ahmed@example.com", password: "Secret123" },
  requestPasswordReset: { email: "ahmed@example.com" },
  resetPassword: { token: "opaque-token", password: "Secret123" },
} as const;

describe("placeholderAuthAdapter (fails closed)", () => {
  it("every operation resolves to `unavailable`", async () => {
    await expect(placeholderAuthAdapter.signIn(INPUTS.signIn)).resolves.toEqual({
      ok: false,
      failure: "unavailable",
    });
    await expect(placeholderAuthAdapter.register(INPUTS.register)).resolves.toEqual({
      ok: false,
      failure: "unavailable",
    });
    await expect(
      placeholderAuthAdapter.requestPasswordReset(INPUTS.requestPasswordReset),
    ).resolves.toEqual({ ok: false, failure: "unavailable" });
    await expect(placeholderAuthAdapter.resetPassword(INPUTS.resetPassword)).resolves.toEqual({
      ok: false,
      failure: "unavailable",
    });
  });

  it("there is never a session", async () => {
    await expect(placeholderAuthAdapter.getSession()).resolves.toBeNull();
  });

  it("makes no network request and touches no storage", async () => {
    const fetchSpy = vi.fn();
    const storage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("XMLHttpRequest", vi.fn());
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("sessionStorage", storage);

    await placeholderAuthAdapter.signIn(INPUTS.signIn);
    await placeholderAuthAdapter.register(INPUTS.register);
    await placeholderAuthAdapter.requestPasswordReset(INPUTS.requestPasswordReset);
    await placeholderAuthAdapter.resetPassword(INPUTS.resetPassword);
    await placeholderAuthAdapter.getSession();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.getItem).not.toHaveBeenCalled();
  });

  it("cannot be modified at runtime", () => {
    expect(Object.isFrozen(placeholderAuthAdapter)).toBe(true);
  });
});

describe("route protection contract (D-08-6: types only)", () => {
  it("assigns each route group an access level", () => {
    expect(ROUTE_ACCESS).toEqual({
      public: "public",
      auth: "guest-only",
      app: "protected",
      focus: "protected",
    });
  });
});

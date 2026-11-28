import { afterEach, describe, expect, it, vi } from "vitest";

import { BackendError, createBackendClient } from "./client";

/*
 * Backend client against the captured contract (docs/api/backend/v1.0.0-2026-11-26). Responses
 * mirror the sanitized smoke evidence; no network is used. Values are fixtures, not real users.
 */

const BASE = "https://backend.example.test/api";

function reply(status: number, body: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clientWith(impl: (url: URL, init: RequestInit) => Promise<Response> | Response) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
    Promise.resolve(impl(new URL(String(input)), init ?? {})),
  );
  return {
    fetchMock,
    client: createBackendClient({
      baseUrl: BASE,
      timeoutMs: 1000,
      fetch: fetchMock as typeof fetch,
    }),
  };
}

async function failure(promise: Promise<unknown>): Promise<BackendError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof BackendError) return error;
    throw error;
  }
  throw new Error("expected a BackendError");
}

const USER = { id: 7, full_name: "Fixture User", email: "fixture@example.test" };

afterEach(() => vi.useRealTimers());

describe("createBackendClient", () => {
  it("rejects a non-http base URL", () => {
    expect(() => createBackendClient({ baseUrl: "ftp://x.test" })).toThrow();
  });

  it("register: POST JSON to <base>/register with full_name, email, password; 201 → user", async () => {
    const { client, fetchMock } = clientWith(() => reply(201, USER));
    await expect(
      client.register({ full_name: USER.full_name, email: USER.email, password: "Fixture-1a" }),
    ).resolves.toEqual(USER);
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(String(url)).toBe(`${BASE}/register`);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect(JSON.parse(String(init.body))).toEqual({
      full_name: USER.full_name,
      email: USER.email,
      password: "Fixture-1a",
    });
    expect(init.cache).toBe("no-store");
    expect(init.redirect).toBe("error");
  });

  it("login: POST form-urlencoded username and password; 200 → token", async () => {
    const token = { access_token: "header.payload.signature", token_type: "bearer" };
    const { client, fetchMock } = clientWith(() => reply(200, token));
    await expect(client.login({ username: USER.email, password: "Fixture-1a" })).resolves.toEqual(
      token,
    );
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(String(url)).toBe(`${BASE}/login`);
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
    expect(Object.fromEntries(new URLSearchParams(String(init.body)))).toEqual({
      username: USER.email,
      password: "Fixture-1a",
    });
  });

  it("me: GET with the bearer token; 200 → user", async () => {
    const { client, fetchMock } = clientWith(() => reply(200, USER));
    await expect(client.me("header.payload.signature")).resolves.toEqual(USER);
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(String(url)).toBe(`${BASE}/me`);
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer header.payload.signature",
    );
  });

  it("normalizes the observed errors without exposing backend message text", async () => {
    const cases: [number, unknown, string, "register" | "login" | "me"][] = [
      [400, { detail: "البريد الإلكتروني مسجل بالفعل" }, "conflict", "register"],
      [401, { detail: "بيانات الدخول غير صحيحة" }, "unauthorized", "login"],
      [401, { detail: "Not authenticated" }, "unauthorized", "me"],
      [403, { detail: "x" }, "rejected", "me"],
      [500, null, "server", "login"],
    ];
    for (const [status, body, kind, op] of cases) {
      const { client } = clientWith(() => reply(status, body));
      const call =
        op === "register"
          ? client.register({ full_name: "a", email: "a@b.test", password: "p" })
          : op === "login"
            ? client.login({ username: "a@b.test", password: "p" })
            : client.me("t");
      const error = await failure(call);
      expect(error.kind).toBe(kind);
      expect(error.status).toBe(status);
      expect(error.message).not.toMatch(/مسجل|بيانات|Not authenticated/);
    }
  });

  it("422: kind validation with the failing fields (last loc segment)", async () => {
    const { client } = clientWith(() =>
      reply(422, {
        detail: [
          {
            loc: ["body", "email"],
            msg: "value is not a valid email address",
            type: "value_error",
          },
          { loc: ["body", "password"], msg: "Field required", type: "missing" },
        ],
      }),
    );
    const error = await failure(client.register({ full_name: "a", email: "x", password: "" }));
    expect(error.kind).toBe("validation");
    expect(error.fields).toEqual(["email", "password"]);
  });

  it("a 2xx that breaks the contract is unexpected (wrong status or shape)", async () => {
    expect(
      (await failure(clientWith(() => reply(200, USER)).client.register(USER as never))).kind,
    ).toBe("unexpected");
    expect(
      (
        await failure(
          clientWith(() => reply(200, { token: "x" })).client.login({
            username: "a",
            password: "b",
          }),
        )
      ).kind,
    ).toBe("unexpected");
  });

  it("network failure and timeout", async () => {
    const network = clientWith(() => Promise.reject(new TypeError("fetch failed")));
    expect((await failure(network.client.me("t"))).kind).toBe("network");

    const hanging = createBackendClient({
      baseUrl: BASE,
      timeoutMs: 20,
      fetch: ((_: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        })) as typeof fetch,
    });
    const error = await failure(hanging.me("t"));
    expect(error.kind).toBe("timeout");
    expect(error.status).toBeNull();
  });

  it("PR-1: the timeout still applies while the body is read (headers sent, body stalls)", async () => {
    const stalled = createBackendClient({
      baseUrl: BASE,
      timeoutMs: 20,
      fetch: ((_: RequestInfo | URL, init?: RequestInit) => {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            // Headers arrive at once; the body never does, until the client aborts.
            init?.signal?.addEventListener("abort", () =>
              controller.error(new DOMException("aborted", "AbortError")),
            );
          },
        });
        return Promise.resolve(
          new Response(stream, { status: 200, headers: { "Content-Type": "application/json" } }),
        );
      }) as typeof fetch,
    });
    const error = await failure(stalled.me("t"));
    expect(error.kind).toBe("timeout");
    expect(error.status).toBeNull();
  });

  it("PR-1: the timer is cleared once the body has been read", async () => {
    vi.useFakeTimers();
    try {
      const { client } = clientWith(() => reply(200, USER));
      await expect(client.me("t")).resolves.toEqual(USER);
      expect(vi.getTimerCount()).toBe(0);
      const failing = clientWith(() => reply(401, { detail: "x" }));
      expect((await failure(failing.client.me("t"))).kind).toBe("unauthorized");
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("PR-1: a non-JSON error body (no abort) still maps by status, not as a timeout", async () => {
    const { client } = clientWith(() => new Response("<html>Bad Gateway</html>", { status: 502 }));
    const error = await failure(client.me("t"));
    expect(error.kind).toBe("server");
    expect(error.status).toBe(502);
  });

  it("PR-2: token_type must be bearer (case-insensitive); anything else fails closed", async () => {
    for (const tokenType of ["bearer", "Bearer", "BEARER"]) {
      const token = { access_token: "header.payload.signature", token_type: tokenType };
      const { client } = clientWith(() => reply(200, token));
      await expect(client.login({ username: USER.email, password: "x" })).resolves.toEqual(token);
    }
    for (const tokenType of ["mac", "", " bearer", "bearer-x"]) {
      const { client } = clientWith(() =>
        reply(200, { access_token: "header.payload.signature", token_type: tokenType }),
      );
      const error = await failure(client.login({ username: USER.email, password: "x" }));
      expect(error.kind).toBe("unexpected");
      expect(error.status).toBe(200);
    }
  });
});

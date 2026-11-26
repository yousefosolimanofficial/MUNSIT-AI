import type {
  BackendLoginForm,
  BackendToken,
  BackendUserCreate,
  BackendUserResponse,
  BackendValidationError,
} from "@/types/backend";

/*
 * Typed client for the Munsit Backend API (captured contract v1.0.0, 2026-11-26; PROVISIONAL).
 * docs/api/backend/v1.0.0-2026-11-26/CONTRACT.md is the source for every path, body and status.
 *
 * Server-side use only (route handlers, server actions, a future BFF). It never reads or writes
 * browser storage or cookies, never logs request or response bodies, and never exposes backend
 * message text: callers get a normalized `BackendError` and choose their own approved copy.
 *
 * The base URL is injected (src/config/backend.ts reads it from the server environment); nothing
 * here hard-codes a server. It is not wired to any screen: Authentication stays disabled
 * (`AUTHENTICATION_AVAILABLE = false`) and the UI keeps the placeholder adapter.
 */

export type BackendErrorKind =
  /** 422: request body rejected; `fields` lists the failing locations. */
  | "validation"
  /** 400 from the register operation (observed: the email is already registered). */
  | "conflict"
  /** 401: wrong credentials, or a missing or invalid token. */
  | "unauthorized"
  /** Any other 4xx. */
  | "rejected"
  /** 5xx. */
  | "server"
  /** The request did not complete (DNS, TLS, connection). */
  | "network"
  /** No response within the timeout. */
  | "timeout"
  /** A 2xx body that does not match the contract. */
  | "unexpected";

export class BackendError extends Error {
  readonly kind: BackendErrorKind;
  readonly status: number | null;
  /** Failing body fields for `validation` (the last `loc` segment, e.g. "email"). No message text. */
  readonly fields: readonly string[];

  constructor(kind: BackendErrorKind, status: number | null, fields: readonly string[] = []) {
    super(`Backend request failed: ${kind}${status === null ? "" : ` (${status})`}`);
    this.name = "BackendError";
    this.kind = kind;
    this.status = status;
    this.fields = fields;
  }
}

export interface BackendClientConfig {
  /** Absolute base URL, without a trailing slash requirement. */
  readonly baseUrl: string;
  /** Per-request timeout. Default 10 000 ms (the development server answered in up to ~6 s). */
  readonly timeoutMs?: number;
  /** Injected for tests. Default: the global `fetch`. */
  readonly fetch?: typeof fetch;
}

export interface BackendClient {
  register(body: BackendUserCreate): Promise<BackendUserResponse>;
  login(form: BackendLoginForm): Promise<BackendToken>;
  me(accessToken: string): Promise<BackendUserResponse>;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Backend operation paths (contract §2: register, login, me at the API root), written relative to the base
 * URL so they resolve under a base path and are never mistaken for app routes.
 */
const PATHS = { register: "register", login: "login", me: "me" } as const;
type BackendPath = (typeof PATHS)[keyof typeof PATHS];

function statusKind(status: number, path: BackendPath): BackendErrorKind {
  if (status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 400 && path === PATHS.register) return "conflict";
  if (status >= 500) return "server";
  return "rejected";
}

function validationFields(body: unknown): string[] {
  if (typeof body !== "object" || body === null || !("detail" in body)) return [];
  const detail = (body as { detail: unknown }).detail;
  if (!Array.isArray(detail)) return [];
  return detail.flatMap((item: Partial<BackendValidationError>) => {
    const last = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : undefined;
    return last === undefined ? [] : [String(last)];
  });
}

function isUser(value: unknown): value is BackendUserResponse {
  const v = value as Partial<BackendUserResponse> | null;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "number" &&
    typeof v.full_name === "string" &&
    typeof v.email === "string"
  );
}

function isToken(value: unknown): value is BackendToken {
  const v = value as Partial<BackendToken> | null;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.access_token === "string" &&
    v.access_token !== "" &&
    typeof v.token_type === "string"
  );
}

export function createBackendClient(config: BackendClientConfig): BackendClient {
  const base = new URL(config.baseUrl);
  if (base.protocol !== "https:" && base.protocol !== "http:") {
    throw new Error("Backend base URL must be http(s).");
  }
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const doFetch = config.fetch ?? fetch;

  async function request<T>(
    path: BackendPath,
    init: RequestInit,
    expected: number,
    guard: (value: unknown) => value is T,
  ): Promise<T> {
    const url = new URL(path, base.href.endsWith("/") ? base : `${base.href}/`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await doFetch(url, {
        ...init,
        headers: { Accept: "application/json", ...init.headers },
        signal: controller.signal,
        cache: "no-store",
        redirect: "error",
      });
    } catch {
      throw new BackendError(controller.signal.aborted ? "timeout" : "network", null);
    } finally {
      clearTimeout(timer);
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (response.status !== expected) {
      if (response.ok) throw new BackendError("unexpected", response.status);
      const kind = statusKind(response.status, path);
      throw new BackendError(
        kind,
        response.status,
        kind === "validation" ? validationFields(body) : [],
      );
    }
    if (!guard(body)) throw new BackendError("unexpected", response.status);
    return body;
  }

  return {
    register: (body) =>
      request(
        PATHS.register,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: body.full_name,
            email: body.email,
            password: body.password,
          }),
        },
        201,
        isUser,
      ),
    login: (form) =>
      request(
        PATHS.login,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: form.username,
            password: form.password,
          }).toString(),
        },
        200,
        isToken,
      ),
    me: (accessToken) =>
      request(
        PATHS.me,
        { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } },
        200,
        isUser,
      ),
  };
}

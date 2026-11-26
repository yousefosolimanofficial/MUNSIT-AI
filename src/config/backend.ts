/**
 * Backend API configuration — SERVER ONLY.
 *
 * `MUNSIT_API_BASE_URL` has no `NEXT_PUBLIC_` prefix, so Next.js never inlines it into the browser
 * bundle; this module also refuses to run in a browser. It returns `null` when the variable is
 * unset: the backend is optional, and nothing in the app depends on it yet (the UI keeps the
 * placeholder adapter; `AUTHENTICATION_AVAILABLE` stays false). The value is a URL, not a secret,
 * but it is never hard-coded: each environment sets its own (docs/devops/HANDOFF.md §5).
 */

export interface BackendConfig {
  /** Normalized absolute URL without a trailing slash. */
  baseUrl: string;
  timeoutMs: number;
}

type RawBackendEnv = {
  MUNSIT_API_BASE_URL?: string | undefined;
  MUNSIT_API_TIMEOUT_MS?: string | undefined;
};

const DEFAULT_TIMEOUT_MS = 10_000;

export function parseBackendEnv(raw: RawBackendEnv): BackendConfig | null {
  const value = raw.MUNSIT_API_BASE_URL?.trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid MUNSIT_API_BASE_URL: expected an absolute http(s) URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Invalid MUNSIT_API_BASE_URL: expected an absolute http(s) URL.");
  }
  // Plain http only for a local backend; anything else must use https (credentials and tokens
  // travel in these requests).
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol === "http:" && !local) {
    throw new Error("Invalid MUNSIT_API_BASE_URL: https is required outside localhost.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("Invalid MUNSIT_API_BASE_URL: no credentials, query or fragment allowed.");
  }
  const timeout = Number(raw.MUNSIT_API_TIMEOUT_MS?.trim() || DEFAULT_TIMEOUT_MS);
  if (!Number.isInteger(timeout) || timeout < 1000 || timeout > 60_000) {
    throw new Error("Invalid MUNSIT_API_TIMEOUT_MS: expected an integer from 1000 to 60000.");
  }
  return { baseUrl: url.href.replace(/\/+$/, ""), timeoutMs: timeout };
}

/** Reads the server environment. Throws if called in a browser. */
export function getBackendConfig(): BackendConfig | null {
  if (typeof window !== "undefined") {
    throw new Error("getBackendConfig() is server-only.");
  }
  return parseBackendEnv({
    MUNSIT_API_BASE_URL: process.env.MUNSIT_API_BASE_URL,
    MUNSIT_API_TIMEOUT_MS: process.env.MUNSIT_API_TIMEOUT_MS,
  });
}

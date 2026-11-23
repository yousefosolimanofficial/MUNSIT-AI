import type { AuthResult, AuthSession } from "@/types/auth";

/*
 * Authentication adapter boundary (Phase 08 Increment 1; Roadmap §3 `api/adapters`).
 *
 * Every Authentication form calls this interface and nothing else. A real adapter is written in
 * Phase 21 against the backend contract once gate D-02 is decided; until then only the placeholder
 * below exists.
 */

export interface SignInInput {
  readonly email: string;
  readonly password: string;
}

export interface RegisterInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface PasswordResetRequestInput {
  readonly email: string;
}

export interface PasswordResetInput {
  /** Opaque value from the reset link; never parsed, logged or stored by the UI. */
  readonly token: string;
  readonly password: string;
}

export interface AuthAdapter {
  signIn(input: SignInInput): Promise<AuthResult>;
  register(input: RegisterInput): Promise<AuthResult>;
  requestPasswordReset(input: PasswordResetRequestInput): Promise<AuthResult>;
  resetPassword(input: PasswordResetInput): Promise<AuthResult>;
  getSession(): Promise<AuthSession>;
}

const UNAVAILABLE: AuthResult = Object.freeze({ ok: false, failure: "unavailable" });

/**
 * Placeholder adapter (D-08-4, owner 2026-11-23): it fails closed.
 *
 * Every operation resolves to `unavailable` and `getSession()` resolves to `null`. It makes no
 * network request, reads and writes no storage or cookie, and ignores its input: no account,
 * session or credential can ever be created through it.
 */
export const placeholderAuthAdapter: AuthAdapter = Object.freeze({
  signIn: () => Promise.resolve(UNAVAILABLE),
  register: () => Promise.resolve(UNAVAILABLE),
  requestPasswordReset: () => Promise.resolve(UNAVAILABLE),
  resetPassword: () => Promise.resolve(UNAVAILABLE),
  getSession: () => Promise.resolve(null),
});

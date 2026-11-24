"use client";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import { LoginForm, type LoginFormProps } from "@/features/auth";

/*
 * Preview-only adapter fixtures for `/dev/auth/login` (contract §3, L-3; D-08-4). They exist so
 * the Figma Loading and Error states can be reviewed: the real route can only show
 * "unavailable". Never imported outside this development route (404 in production). They make no
 * request and keep no value.
 */

export type LoginPreviewState = "default" | "loading" | "error";

/** Loading `2480:2916`: sign-in never settles, so the Loading button stays. */
const loadingAdapter: AuthAdapter = {
  ...placeholderAuthAdapter,
  signIn: () => new Promise(() => undefined),
};

/** Error `2467:75609`: sign-in answers `invalid-credentials` (the Figma Error banner copy). */
const errorAdapter: AuthAdapter = {
  ...placeholderAuthAdapter,
  signIn: () => Promise.resolve({ ok: false, failure: "invalid-credentials" }),
};

const ADAPTERS: Record<LoginPreviewState, AuthAdapter> = {
  default: placeholderAuthAdapter,
  loading: loadingAdapter,
  error: errorAdapter,
};

export function LoginPreviewForm({
  state,
  ...props
}: Omit<LoginFormProps, "adapter"> & { state: LoginPreviewState }) {
  return <LoginForm {...props} adapter={ADAPTERS[state]} />;
}

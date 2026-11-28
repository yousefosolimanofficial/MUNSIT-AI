"use client";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import {
  ResetPasswordForm,
  type ResetPasswordFormProps,
  type ResetPasswordInitialState,
} from "@/features/auth";
import type { AuthResult } from "@/types/auth";

/*
 * Preview-only adapter fixtures for `/dev/auth/reset-password` (START_HERE §5, RC-2; D-08-4). They
 * exist so the Figma Loading, Error, Invalid link, Expired link and Updated states can be reviewed:
 * the real route can only show "unavailable". Never imported outside this development route (404
 * in production). They make no request and keep no value; no token is passed (RC-4). The
 * prefilled passwords are fixtures, not user data.
 */

/** The preview states (the list of query values lives in `page.tsx`, a Server Component). */
export type ResetPreviewState =
  | "default"
  | "shown-both"
  | "shown-new"
  | "shown-confirm"
  | "required"
  | "mismatch"
  | "loading"
  | "error"
  | "invalid-link"
  | "expired-link"
  | "updated";

const SAMPLE_PASSWORD = "Secret-123";
const FILLED: ResetPasswordInitialState = {
  values: { newPassword: SAMPLE_PASSWORD, confirmPassword: SAMPLE_PASSWORD },
};

function answering(result: AuthResult): AuthAdapter {
  return { ...placeholderAuthAdapter, resetPassword: () => Promise.resolve(result) };
}

/** Loading `2480:601`: the reset never settles, so the Loading button stays. */
const loadingAdapter: AuthAdapter = {
  ...placeholderAuthAdapter,
  resetPassword: () => new Promise(() => undefined),
};

const FIXTURES: Record<
  ResetPreviewState,
  { adapter: AuthAdapter; initialState?: ResetPasswordInitialState }
> = {
  default: { adapter: placeholderAuthAdapter },
  "shown-both": {
    adapter: placeholderAuthAdapter,
    initialState: { visible: { newPassword: true, confirmPassword: true } },
  },
  "shown-new": {
    adapter: placeholderAuthAdapter,
    initialState: { visible: { newPassword: true } },
  },
  "shown-confirm": {
    adapter: placeholderAuthAdapter,
    initialState: { visible: { confirmPassword: true } },
  },
  /** Required `2480:461`: both fields checked at once while empty. */
  required: { adapter: placeholderAuthAdapter, initialState: { validate: true } },
  /** Mismatch `2480:535`: a valid new password and a different confirmation, checked at once. */
  mismatch: {
    adapter: placeholderAuthAdapter,
    initialState: {
      values: { newPassword: SAMPLE_PASSWORD, confirmPassword: "Secret-124" },
      validate: true,
    },
  },
  loading: { adapter: loadingAdapter, initialState: FILLED },
  /** Error `2480:659`: `rejected` (the Error banner and "إعادة المحاولة"). */
  error: { adapter: answering({ ok: false, failure: "rejected" }), initialState: FILLED },
  "invalid-link": {
    adapter: answering({ ok: false, failure: "invalid-link" }),
    initialState: FILLED,
  },
  "expired-link": {
    adapter: answering({ ok: false, failure: "expired-link" }),
    initialState: FILLED,
  },
  updated: { adapter: answering({ ok: true }), initialState: FILLED },
};

export function ResetPreviewForm({
  state,
  ...props
}: Omit<ResetPasswordFormProps, "adapter" | "initialState" | "token"> & {
  state: ResetPreviewState;
}) {
  const fixture = FIXTURES[state];
  return (
    <ResetPasswordForm {...props} adapter={fixture.adapter} initialState={fixture.initialState} />
  );
}

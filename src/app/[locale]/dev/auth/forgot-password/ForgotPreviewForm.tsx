"use client";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import {
  ForgotPasswordForm,
  type ForgotPasswordFormProps,
  type ForgotPasswordInitialState,
} from "@/features/auth/components/ForgotPasswordForm";

/*
 * Preview-only adapter fixtures for `/dev/auth/forgot-password` (START_HERE §5, RC-2; D-08-4).
 * They exist so the Figma Loading, Failed and Email sent states can be reviewed: the real route can
 * only show "unavailable". Never imported outside this development route (404 in production). They
 * make no request and keep no value. The prefilled email is a fixture, not user data.
 */

/** The preview states (the list of query values lives in `page.tsx`, a Server Component). */
export type ForgotPreviewState = "default" | "empty" | "invalid" | "loading" | "failed" | "sent";

const SAMPLE_EMAIL = "ahmed@example.com";

/** Loading `2480:2829`: the request never settles, so the Loading button stays. */
const loadingAdapter: AuthAdapter = {
  ...placeholderAuthAdapter,
  requestPasswordReset: () => new Promise(() => undefined),
};

/** Failed `2480:2869`: the request answers `rejected` (the Failed banner and "إعادة المحاولة"). */
const failedAdapter: AuthAdapter = {
  ...placeholderAuthAdapter,
  requestPasswordReset: () => Promise.resolve({ ok: false, failure: "rejected" }),
};

/** Email sent `2467:75582`: the request answers `ok`. */
const sentAdapter: AuthAdapter = {
  ...placeholderAuthAdapter,
  requestPasswordReset: () => Promise.resolve({ ok: true }),
};

const FIXTURES: Record<
  ForgotPreviewState,
  { adapter: AuthAdapter; initialState?: ForgotPasswordInitialState }
> = {
  default: { adapter: placeholderAuthAdapter },
  /** Empty `2480:2741`: checked at once with an empty email. */
  empty: { adapter: placeholderAuthAdapter, initialState: { validate: true } },
  /** Invalid email `2480:2785`: checked at once with an invalid email. */
  invalid: {
    adapter: placeholderAuthAdapter,
    initialState: { values: { email: "ahmed@example" }, validate: true },
  },
  loading: { adapter: loadingAdapter, initialState: { values: { email: SAMPLE_EMAIL } } },
  failed: { adapter: failedAdapter, initialState: { values: { email: SAMPLE_EMAIL } } },
  sent: { adapter: sentAdapter, initialState: { values: { email: SAMPLE_EMAIL } } },
};

export function ForgotPreviewForm({
  state,
  ...props
}: Omit<ForgotPasswordFormProps, "adapter" | "initialState"> & { state: ForgotPreviewState }) {
  const fixture = FIXTURES[state];
  return (
    <ForgotPasswordForm {...props} adapter={fixture.adapter} initialState={fixture.initialState} />
  );
}

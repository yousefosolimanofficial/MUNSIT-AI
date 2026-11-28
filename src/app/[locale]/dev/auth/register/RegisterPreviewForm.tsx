"use client";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import { RegisterForm, type RegisterFormProps } from "@/features/auth";

/*
 * Preview-only adapter fixtures for `/dev/auth/register` (Increment 3 contract §4, R-4; D-08-4).
 * They exist so the Figma Loading, Failed and Success states can be reviewed: the real route can
 * only show "unavailable". Never imported outside this development route (404 in production). They
 * make no request and keep no value; nothing is created.
 */

export type RegisterPreviewState = "default" | "loading" | "failed" | "success";

const ADAPTERS: Record<RegisterPreviewState, AuthAdapter> = {
  default: placeholderAuthAdapter,
  /** Loading `2480:2436`: registration never settles. */
  loading: { ...placeholderAuthAdapter, register: () => new Promise(() => undefined) },
  /** Failed `2480:2636`: registration answers `rejected`. */
  failed: {
    ...placeholderAuthAdapter,
    register: () => Promise.resolve({ ok: false, failure: "rejected" }),
  },
  /** Success `2480:2534`: a preview answer only; no account exists anywhere. */
  success: { ...placeholderAuthAdapter, register: () => Promise.resolve({ ok: true }) },
};

export function RegisterPreviewForm({
  state,
  ...props
}: Omit<RegisterFormProps, "adapter"> & { state: RegisterPreviewState }) {
  return <RegisterForm {...props} adapter={ADAPTERS[state]} />;
}

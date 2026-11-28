import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ResetPasswordScreen } from "@/features/auth";

import { ResetPreviewForm, type ResetPreviewState } from "./ResetPreviewForm";

/*
 * Development-only preview of the Reset Password states (Phase 08 Recovery UI, RC-2; D-08-4). Like
 * every `/dev/*` route it returns 404 in production builds. Query `state` = shown-both | shown-new
 * | shown-confirm | required | mismatch | loading | error | invalid-link | expired-link | updated
 * (default: the real placeholder behaviour). Visibility, Required and Mismatch show at once; for
 * the result states the fields are prefilled with fixtures: submit to see the state. No token is
 * passed (RC-4). It is not evidence of working authentication. Preview labels are development
 * fixtures, kept here (not product copy).
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Kept here, not in the client module: a Server Component cannot read its plain exports. */
const RESET_PREVIEW_STATES: readonly ResetPreviewState[] = [
  "default",
  "shown-both",
  "shown-new",
  "shown-confirm",
  "required",
  "mismatch",
  "loading",
  "error",
  "invalid-link",
  "expired-link",
  "updated",
];

const BANNER = {
  ar: "معاينة تطوير فقط — ليست مصادقة فعّالة. لا يتم إنشاء حسابات أو جلسات.",
  en: "Development preview only — not functional authentication. No accounts or sessions are created.",
} as const;

export default async function DevAuthResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const [{ state: stateParam }, locale] = await Promise.all([searchParams, getLocale()]);
  const state: ResetPreviewState = RESET_PREVIEW_STATES.find((s) => s === stateParam) ?? "default";

  return (
    <main data-reset-preview={state}>
      <p
        role="note"
        data-auth-preview-banner=""
        className="sticky top-0 z-10 bg-semantic-warning px-md py-xs text-center text-dashboard-button text-surface-void-black"
      >
        {locale === "en" ? BANNER.en : BANNER.ar}
      </p>
      <ResetPasswordScreen
        renderForm={(props) => <ResetPreviewForm {...props} key={state} state={state} />}
      />
    </main>
  );
}

import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ForgotPasswordScreen } from "@/features/auth";

import { ForgotPreviewForm, type ForgotPreviewState } from "./ForgotPreviewForm";

/*
 * Development-only preview of the Forgot Password states (Phase 08 Recovery UI, RC-2; D-08-4).
 * Like every `/dev/*` route it returns 404 in production builds. Query `state` = empty | invalid |
 * loading | failed | sent (default: the real placeholder behaviour). Empty and Invalid email show
 * at once; for Loading, Failed and Email sent the email is prefilled with a fixture: submit to see
 * the state. It is not evidence of working authentication. Preview labels are development
 * fixtures, kept here (not product copy).
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Kept here, not in the client module: a Server Component cannot read its plain exports. */
const FORGOT_PREVIEW_STATES: readonly ForgotPreviewState[] = [
  "default",
  "empty",
  "invalid",
  "loading",
  "failed",
  "sent",
];

const BANNER = {
  ar: "معاينة تطوير فقط — ليست مصادقة فعّالة. لا يتم إنشاء حسابات أو جلسات.",
  en: "Development preview only — not functional authentication. No accounts or sessions are created.",
} as const;

export default async function DevAuthForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const [{ state: stateParam }, locale] = await Promise.all([searchParams, getLocale()]);
  const state: ForgotPreviewState =
    FORGOT_PREVIEW_STATES.find((s) => s === stateParam) ?? "default";

  return (
    <main data-forgot-preview={state}>
      <p
        role="note"
        data-auth-preview-banner=""
        className="sticky top-0 z-10 bg-semantic-warning px-md py-xs text-center text-dashboard-button text-surface-void-black"
      >
        {locale === "en" ? BANNER.en : BANNER.ar}
      </p>
      <ForgotPasswordScreen
        renderForm={(props) => <ForgotPreviewForm {...props} key={state} state={state} />}
      />
    </main>
  );
}

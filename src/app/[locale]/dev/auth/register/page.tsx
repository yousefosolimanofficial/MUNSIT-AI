import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { RegisterScreen } from "@/features/auth";

import { RegisterPreviewForm, type RegisterPreviewState } from "./RegisterPreviewForm";

/*
 * Development-only preview of the Register server-side states (Phase 08 Increment 3, R-4; D-08-4).
 * Like every `/dev/*` route it returns 404 in production builds. Query `state` = loading | failed |
 * success (default: the real placeholder behaviour). Fill the form and submit to see the state. It
 * is not evidence of working registration. Preview labels are development fixtures, kept here.
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

const STATES: readonly RegisterPreviewState[] = ["loading", "failed", "success"];

const BANNER = {
  ar: "معاينة تطوير فقط — ليست مصادقة فعّالة. لا يتم إنشاء حسابات أو جلسات.",
  en: "Development preview only — not functional authentication. No accounts or sessions are created.",
} as const;

export default async function DevAuthRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const [{ state: stateParam }, locale] = await Promise.all([searchParams, getLocale()]);
  const state = STATES.find((s) => s === stateParam) ?? "default";

  return (
    <main data-register-preview={state}>
      <p
        role="note"
        data-auth-preview-banner=""
        className="sticky top-0 z-10 bg-semantic-warning px-md py-xs text-center text-dashboard-button text-surface-void-black"
      >
        {locale === "en" ? BANNER.en : BANNER.ar}
      </p>
      <RegisterScreen renderForm={(props) => <RegisterPreviewForm {...props} state={state} />} />
    </main>
  );
}

import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { LoginScreen } from "@/features/auth";

import { LoginPreviewForm, type LoginPreviewState } from "./LoginPreviewForm";

/*
 * Development-only preview of the Login states (Phase 08 Increment 2, L-3; D-08-4). Like every
 * `/dev/*` route it returns 404 in production builds. Query `state` = loading | error (default:
 * the real placeholder behaviour). Fill the form and submit to see the state. It is not evidence
 * of working sign-in. Preview labels are development fixtures, kept here (not product copy).
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

const STATES: readonly LoginPreviewState[] = ["loading", "error"];

const BANNER = {
  ar: "معاينة تطوير فقط — ليست مصادقة فعّالة. لا يتم إنشاء حسابات أو جلسات.",
  en: "Development preview only — not functional authentication. No accounts or sessions are created.",
} as const;

export default async function DevAuthLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const [{ state: stateParam }, locale] = await Promise.all([searchParams, getLocale()]);
  const state = STATES.find((s) => s === stateParam) ?? "default";

  return (
    <main data-login-preview={state}>
      <p
        role="note"
        data-auth-preview-banner=""
        className="sticky top-0 z-10 bg-semantic-warning px-md py-xs text-center text-dashboard-button text-surface-void-black"
      >
        {locale === "en" ? BANNER.en : BANNER.ar}
      </p>
      <LoginScreen renderForm={(props) => <LoginPreviewForm {...props} state={state} />} />
    </main>
  );
}

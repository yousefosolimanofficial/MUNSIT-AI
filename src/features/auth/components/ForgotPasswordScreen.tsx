import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import type { AuthFailure } from "@/types/auth";

import { AuthLayout } from "./AuthLayout";
import { ForgotPasswordForm, type ForgotPasswordFormCopy } from "./ForgotPasswordForm";

/*
 * The Forgot Password screen (Phase 08 Recovery UI): the shared Auth layout (family `recovery`)
 * and the Forgot Password form, which owns the card (a result view replaces the whole card). Copy
 * comes from `authentication.json` and reaches the client form as resolved strings.
 *
 * `renderForm` exists for the development preview only, which wraps the same form with a preview
 * adapter fixture (a Server Component cannot pass an adapter object to a Client Component). The
 * route uses the default: the form with the fail-closed placeholder adapter.
 */

export async function ForgotPasswordScreen({
  renderForm,
}: {
  renderForm?: (props: { copy: ForgotPasswordFormCopy }) => ReactNode;
} = {}) {
  const t = await getTranslations("authentication");

  const unavailable = t("errors.unavailable.forgot");
  // Forgot has copy for `unavailable` and `rejected` only. Any other failure fails closed with
  // the "unavailable" wording: no message is invented (D-08-5).
  const failures: Record<AuthFailure, string> = {
    unavailable,
    rejected: t("errors.failed.forgot"),
    "invalid-credentials": unavailable,
    "invalid-link": unavailable,
    "expired-link": unavailable,
  };

  const copy: ForgotPasswordFormCopy = {
    heading: t("forgot.heading"),
    description: t("forgot.description"),
    email: t("forgot.email"),
    emailPlaceholder: t("placeholders.email"),
    submit: t("forgot.submit"),
    submitting: t("forgot.submitting"),
    retry: t("common.retry"),
    back: t("forgot.back"),
    sent: {
      heading: t("forgot.sent.heading"),
      body: t("forgot.sent.body"),
      resend: t("forgot.sent.resend"),
    },
    validation: {
      "validation.emailRequired": t("validation.emailRequired"),
      "validation.emailInvalid": t("validation.emailInvalid"),
    },
    failures,
  };

  const marketing = {
    heading: t.rich("marketing.recovery.heading", {
      highlight: (chunks: ReactNode) => <span className="text-accent-electric-sky">{chunks}</span>,
    }),
    lead: t("marketing.recovery.lead"),
    body: t.raw("marketing.recovery.body") as string[],
  };

  return (
    <AuthLayout family="recovery" marketing={marketing}>
      {renderForm ? renderForm({ copy }) : <ForgotPasswordForm copy={copy} />}
    </AuthLayout>
  );
}

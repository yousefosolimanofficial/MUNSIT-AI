import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Ltr } from "@/shared/ui/Ltr";
import type { AuthFailure } from "@/types/auth";

import { AuthLayout } from "./AuthLayout";
import { ResetPasswordForm, type ResetPasswordFormCopy } from "./ResetPasswordForm";

/*
 * The Reset Password screen (Phase 08 Recovery UI): the shared Auth layout (family `recovery`)
 * and the Reset Password form, which owns the card (a result view replaces the whole card). Copy
 * comes from `authentication.json` and reaches the client form as resolved strings (the length
 * rule keeps its isolated `8` run).
 *
 * RC-4: the route reads nothing from the URL, so no token reaches the form; `token` stays
 * undefined and the form passes "" to the adapter.
 *
 * `renderForm` exists for the development preview only, which wraps the same form with a preview
 * adapter fixture. The route uses the default: the form with the fail-closed placeholder adapter.
 */

export async function ResetPasswordScreen({
  renderForm,
}: {
  renderForm?: (props: { copy: ResetPasswordFormCopy }) => ReactNode;
} = {}) {
  const t = await getTranslations("authentication");

  const unavailable = t("errors.unavailable.reset");
  // Reset has banner copy for `unavailable` and `rejected`; the link failures are views. Any other
  // failure fails closed with the "unavailable" wording: no message is invented (D-08-5).
  const failures: Record<AuthFailure, string> = {
    unavailable,
    rejected: t("errors.failed.reset"),
    "invalid-credentials": unavailable,
    "invalid-link": unavailable,
    "expired-link": unavailable,
  };

  const copy: ResetPasswordFormCopy = {
    heading: t("reset.heading"),
    description: t("reset.description"),
    password: t("reset.password"),
    confirm: t("reset.confirm"),
    passwordPlaceholderHidden: t("placeholders.password"),
    passwordPlaceholderShown: t("placeholders.passwordShown"),
    showPassword: t("password.show"),
    submit: t("reset.submit"),
    submitting: t("reset.submitting"),
    retry: t("common.retry"),
    back: t("reset.back"),
    rules: {
      length: t.rich("rules.length", { ltr: (chunks: ReactNode) => <Ltr>{chunks}</Ltr> }),
      case: t("rules.case"),
      digit: t("rules.digit"),
    },
    ruleStatus: { met: t("status.met"), notMet: t("status.notMet") },
    updated: { heading: t("reset.updated.heading"), body: t("reset.updated.body") },
    invalidLink: {
      heading: t("reset.invalidLink.heading"),
      body: t("reset.invalidLink.body"),
      request: t("reset.invalidLink.request"),
    },
    expiredLink: {
      heading: t("reset.expiredLink.heading"),
      body: t("reset.expiredLink.body"),
      request: t("reset.expiredLink.request"),
    },
    validation: {
      "validation.newPasswordRequired": t("validation.newPasswordRequired"),
      "validation.passwordRules": t("validation.passwordRules"),
      "validation.confirmNewRequired": t("validation.confirmNewRequired"),
      "validation.mismatch": t("validation.mismatch"),
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
      {renderForm ? renderForm({ copy }) : <ResetPasswordForm copy={copy} />}
    </AuthLayout>
  );
}

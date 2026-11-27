import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Ltr } from "@/shared/ui/Ltr";

import { AuthLayout } from "./AuthLayout";
import { RegisterForm, type RegisterFormCopy } from "./RegisterForm";

/*
 * The Register screen (Phase 08 Increment 3): the shared Auth layout (family `register`) and the
 * Register form, which draws its own card because a result (Success) replaces the whole card. Copy
 * comes from `authentication.json` and reaches the client form as resolved strings and nodes.
 *
 * `renderForm` exists for the development preview only, which wraps the same form with a preview
 * adapter fixture (a Server Component cannot pass an adapter object to a Client Component). The
 * route uses the default: the form with the fail-closed placeholder adapter.
 */

export async function RegisterScreen({
  renderForm,
}: {
  renderForm?: (props: { copy: RegisterFormCopy }) => ReactNode;
} = {}) {
  const t = await getTranslations("authentication");

  const copy: RegisterFormCopy = {
    heading: t("register.heading"),
    description: t("register.description"),
    name: t("register.name"),
    email: t("register.email"),
    emailPlaceholder: t("placeholders.email"),
    password: t("register.password"),
    confirm: t("register.confirm"),
    passwordPlaceholderHidden: t("placeholders.password"),
    passwordPlaceholderShown: t("placeholders.passwordShown"),
    showPassword: t("password.show"),
    submit: t("register.submit"),
    submitting: t("register.submitting"),
    retry: t("common.retry"),
    hasAccount: t("register.hasAccount"),
    login: t("register.login"),
    rules: {
      length: t.rich("rules.length", { ltr: (chunks: ReactNode) => <Ltr>{chunks}</Ltr> }),
      case: t("rules.case"),
      digit: t("rules.digit"),
    },
    ruleStatus: { met: t("status.met"), notMet: t("status.notMet") },
    validation: {
      "validation.nameRequired": t("validation.nameRequired"),
      "validation.emailRequired": t("validation.emailRequired"),
      "validation.emailInvalid": t("validation.emailInvalid"),
      "validation.passwordRequired": t("validation.passwordRequired"),
      "validation.passwordRules": t("validation.passwordRules"),
      "validation.confirmRequired": t("validation.confirmRequired"),
      "validation.mismatch": t("validation.mismatch"),
    },
    unavailable: t("errors.unavailable.register"),
    failed: t("errors.failed.register"),
    success: { heading: t("register.success.heading"), body: t("register.success.body") },
  };

  const marketing = {
    heading: t.rich("marketing.register.heading", {
      highlight: (chunks: ReactNode) => <span className="text-accent-electric-sky">{chunks}</span>,
    }),
    lead: t("marketing.register.lead"),
    body: t.raw("marketing.register.body") as string[],
  };

  return (
    <AuthLayout family="register" marketing={marketing}>
      {renderForm ? renderForm({ copy }) : <RegisterForm copy={copy} />}
    </AuthLayout>
  );
}

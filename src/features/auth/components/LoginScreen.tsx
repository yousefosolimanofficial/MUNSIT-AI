import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ROUTES } from "@/i18n/routes";
import type { AuthFailure } from "@/types/auth";

import { AuthCardFooter, AuthFormCard } from "./AuthFormCard";
import { AuthLayout } from "./AuthLayout";
import { AuthTextLink } from "./AuthTextLink";
import { LoginForm, type LoginFormCopy } from "./LoginForm";

/*
 * The Login screen (Phase 08 Increment 2): the shared Auth layout (family `login`), the form card
 * (heading, description, form, footer "لسه معندكش حساب؟ إنشاء حساب") and the Login form. Copy
 * comes from `authentication.json` and reaches the client form as resolved strings.
 *
 * `renderForm` exists for the development preview only, which wraps the same form with a preview
 * adapter fixture (a Server Component cannot pass an adapter object to a Client Component). The
 * route uses the default: the form with the fail-closed placeholder adapter.
 */

const HEADING_ID = "login-heading";

export async function LoginScreen({
  renderForm,
}: {
  renderForm?: (props: { copy: LoginFormCopy; headingId: string }) => ReactNode;
} = {}) {
  const t = await getTranslations("authentication");

  const unavailable = t("errors.unavailable.login");
  // Login has copy for `unavailable` and `invalid-credentials` only (the same keys as
  // `failureMessageKey("login", …)`). Any other failure fails closed with the "unavailable"
  // wording: no message is invented (D-08-5).
  const failures: Record<AuthFailure, string> = {
    unavailable,
    "invalid-credentials": t("errors.invalidCredentials"),
    rejected: unavailable,
    "invalid-link": unavailable,
    "expired-link": unavailable,
  };

  const copy: LoginFormCopy = {
    email: t("login.email"),
    emailPlaceholder: t("placeholders.email"),
    password: t("login.password"),
    passwordPlaceholderHidden: t("placeholders.password"),
    passwordPlaceholderShown: t("placeholders.passwordShown"),
    showPassword: t("password.show"),
    forgot: t("login.forgot"),
    submit: t("login.submit"),
    submitting: t("login.submitting"),
    validation: {
      "validation.emailRequired": t("validation.emailRequired"),
      "validation.emailInvalid": t("validation.emailInvalid"),
      "validation.passwordRequired": t("validation.passwordRequired"),
    },
    failures,
  };

  const marketing = {
    heading: t.rich("marketing.login.heading", {
      highlight: (chunks: ReactNode) => <span className="text-accent-electric-sky">{chunks}</span>,
    }),
    lead: t("marketing.login.lead"),
    body: t.raw("marketing.login.body") as string[],
  };

  return (
    <AuthLayout family="login" marketing={marketing}>
      <AuthFormCard
        heading={t("login.heading")}
        description={t("login.description")}
        headingId={HEADING_ID}
        footer={
          <AuthCardFooter
            text={t("login.noAccount")}
            link={<AuthTextLink href={ROUTES["auth.register"]}>{t("login.register")}</AuthTextLink>}
          />
        }
      >
        {renderForm ? (
          renderForm({ copy, headingId: HEADING_ID })
        ) : (
          <LoginForm copy={copy} headingId={HEADING_ID} />
        )}
      </AuthFormCard>
    </AuthLayout>
  );
}

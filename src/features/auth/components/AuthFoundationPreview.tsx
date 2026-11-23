import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ROUTES } from "@/i18n/routes";
import { Ltr } from "@/shared/ui/Ltr";

import type { AuthFamily } from "../model/auth-images";
import { AuthCardFooter, AuthErrorBanner, AuthFormCard } from "./AuthFormCard";
import { AuthLayout } from "./AuthLayout";
import { AuthResultView } from "./AuthResultView";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthTextField } from "./AuthTextField";
import { AuthTextLink } from "./AuthTextLink";
import { PasswordFieldDemo } from "./PasswordFieldDemo";
import { PasswordRulesDemo } from "./PasswordRulesDemo";

/*
 * Development-only preview of the Authentication foundation (`/dev/auth`; D-08-4, owner
 * 2026-11-23). It shows the shared layout per family and every component state with the real
 * copy. It is NOT a screen: there is no form submission, no adapter call and no data, and the
 * route returns 404 in production. A visible banner says so. Success views appear here only as
 * labelled previews, never as evidence of working Authentication.
 */

export interface AuthPreviewLabels {
  banner: string;
  sections: { fields: string; actions: string; result: string };
}

export async function AuthFoundationPreview({
  family,
  view,
  labels,
}: {
  family: AuthFamily;
  view: "components" | "result";
  labels: AuthPreviewLabels;
}) {
  const t = await getTranslations("authentication");

  const marketing = {
    heading: t.rich(`marketing.${family}.heading`, {
      highlight: (chunks: ReactNode) => <span className="text-accent-electric-sky">{chunks}</span>,
    }),
    lead: t(`marketing.${family}.lead`),
    body: t.raw(`marketing.${family}.body`) as string[],
  };

  const footer = (
    <AuthCardFooter
      text={t("login.noAccount")}
      link={<AuthTextLink href={ROUTES["auth.register"]}>{t("login.register")}</AuthTextLink>}
    />
  );

  return (
    <>
      <p
        role="note"
        data-auth-preview-banner=""
        className="sticky top-0 z-10 bg-semantic-warning px-md py-xs text-center text-dashboard-button text-surface-void-black"
      >
        {labels.banner}
      </p>
      <AuthLayout family={family} marketing={marketing}>
        {view === "result" ? (
          <AuthResultView
            heading={t("register.success.heading")}
            body={t("register.success.body")}
            actions={
              <AuthSubmitButton type="button" loadingLabel={t("login.submitting")}>
                {t("register.login")}
              </AuthSubmitButton>
            }
            footer={
              <AuthCardFooter
                text={t("register.hasAccount")}
                link={
                  <AuthTextLink href={ROUTES["auth.login"]}>{t("register.login")}</AuthTextLink>
                }
              />
            }
          />
        ) : (
          <AuthFormCard
            heading={t("login.heading")}
            description={t("login.description")}
            footer={footer}
          >
            <div className="flex flex-col gap-5" aria-label={labels.sections.fields} role="group">
              <AuthTextField
                label={t("login.email")}
                type="email"
                ltr
                autoComplete="off"
                placeholder={t("placeholders.email")}
              />
              <AuthTextField
                label={t("login.email")}
                type="email"
                ltr
                autoComplete="off"
                defaultValue="ahmed@example"
                error={t("validation.emailInvalid")}
              />
              <AuthTextField
                label={t("register.name")}
                autoComplete="off"
                disabled
                placeholder={t("register.name")}
              />
              <PasswordFieldDemo label={t("login.password")} toggleLabel={t("password.show")} />
              <PasswordFieldDemo
                label={t("login.password")}
                toggleLabel={t("password.show")}
                error={t("validation.passwordRequired")}
                initiallyVisible
              />
              <PasswordRulesDemo
                label={t("register.password")}
                toggleLabel={t("password.show")}
                ruleLabels={{
                  length: t.rich("rules.length", {
                    ltr: (chunks: ReactNode) => <Ltr>{chunks}</Ltr>,
                  }),
                  case: t("rules.case"),
                  digit: t("rules.digit"),
                }}
                statusLabels={{ met: t("status.met"), notMet: t("status.notMet") }}
              />
              <p className="text-start">
                <AuthTextLink href={ROUTES["auth.forgotPassword"]}>
                  {t("login.forgot")}
                </AuthTextLink>
              </p>
            </div>
            <div className="flex flex-col gap-5" aria-label={labels.sections.actions} role="group">
              <AuthErrorBanner message={t("errors.unavailable.login")} />
              <AuthSubmitButton type="button" loadingLabel={t("login.submitting")}>
                {t("login.submit")}
              </AuthSubmitButton>
              <AuthSubmitButton type="button" loading loadingLabel={t("login.submitting")}>
                {t("login.submit")}
              </AuthSubmitButton>
              <AuthSubmitButton type="button" disabled loadingLabel={t("login.submitting")}>
                {t("login.submit")}
              </AuthSubmitButton>
            </div>
          </AuthFormCard>
        )}
      </AuthLayout>
    </>
  );
}

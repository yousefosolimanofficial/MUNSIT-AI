import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { fontVariables } from "@/design-system/fonts";
import { directionOf } from "@/i18n/direction";
import { routing } from "@/i18n/routing";
import type { GuardCopy, GuardKind } from "@/shared/patterns/ConfirmGuardDialog";
import { NavigationGuardProvider } from "@/shared/patterns/NavigationGuardProvider";

import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * `viewportFit: "cover"` (ADR-004, Phase 05) lets the page extend under device notches and home
 * indicators; the mobile shell adds `env(safe-area-inset-*)` padding. Next.js keeps its default
 * `width=device-width, initial-scale=1`.
 */
export const viewport: Viewport = { viewportFit: "cover" };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  const brand = t("brand.name");
  // Pages set only their screen title; the brand completes it (Phase 04 placeholders).
  return { title: { default: brand, template: `%s · ${brand}` } };
}

/**
 * Root layout (inside `[locale]`, so `next/root-params` can read the locale).
 * `<html lang dir>` follow the active locale: `ar` → rtl (default), `en` → ltr.
 */
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [messages, t] = await Promise.all([getMessages(), getTranslations("patterns")]);
  // Guard dialog copy (approved, Phase 06 plan §9), resolved on the server for the provider.
  const guardCopy = Object.fromEntries(
    (["unsaved", "recording"] as const).map((kind) => [
      kind,
      {
        title: t(`guard.${kind}.title`),
        description: t(`guard.${kind}.description`),
        stay: t(`guard.${kind}.stay`),
        leave: t(`guard.${kind}.leave`),
      },
    ]),
  ) as Record<GuardKind, GuardCopy>;

  return (
    <html lang={locale} dir={directionOf(locale)} className={fontVariables}>
      <body>
        {/* Locale for client navigation (locale-aware Link). Only the `errors` namespace is sent
            to the browser, for the client-side error boundary (Phase 04); everything else is
            translated on the server. */}
        <NextIntlClientProvider messages={{ errors: messages.errors }}>
          {/* Phase 06: one navigation guard for every route (D-U7). Inactive until a page
              registers a guard with useNavigationGuard. */}
          <NavigationGuardProvider copy={guardCopy}>{children}</NavigationGuardProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { fontVariables } from "@/design-system/fonts";
import { directionOf } from "@/i18n/direction";
import { routing } from "@/i18n/routing";

import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  const messages = await getMessages();

  return (
    <html lang={locale} dir={directionOf(locale)} className={fontVariables}>
      <body>
        {/* Locale for client navigation (locale-aware Link). Only the `errors` namespace is sent
            to the browser, for the client-side error boundary (Phase 04); everything else is
            translated on the server. */}
        <NextIntlClientProvider messages={{ errors: messages.errors }}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
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
  return { title: t("brand.name") };
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

  return (
    <html lang={locale} dir={directionOf(locale)} className={fontVariables}>
      <body>
        {/* Locale only for client navigation (locale-aware Link); messages={null} sends no
            translations to the browser — Server Components translate on the server. */}
        <NextIntlClientProvider messages={null}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

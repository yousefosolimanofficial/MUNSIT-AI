import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import { LandingPage, landingMetadata } from "@/features/landing";
import { routing } from "@/i18n/routing";

/** Landing (route key `landing`, Phase 07). Thin route: the page lives in `features/landing`. */
export function generateMetadata(): Promise<Metadata> {
  return landingMetadata();
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return <LandingPage locale={locale} />;
}

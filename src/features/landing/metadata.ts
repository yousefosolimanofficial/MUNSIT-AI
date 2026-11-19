import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/*
 * Landing metadata (Phase 07 Increment 1). Approved copy only:
 * - the title is the brand (the layout's default title);
 * - the description is the approved Hero description.
 *
 * Open Graph infrastructure: type, site name, title, description. Deliberately absent until
 * approved inputs exist:
 * - an OG image (no approved asset; plan §7);
 * - `url` and language alternates (they need the production domain, D-01).
 */
export async function landingMetadata(): Promise<Metadata> {
  const [t, common] = await Promise.all([getTranslations("landing"), getTranslations("common")]);
  const brand = common("brand.name");
  const description = t("hero.description");
  return {
    description,
    openGraph: { type: "website", siteName: brand, title: brand, description },
  };
}

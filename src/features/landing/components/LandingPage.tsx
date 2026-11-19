import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { publicEnv } from "@/config/env";
import type { AppLocale } from "@/i18n/routing";
import { SkipLink } from "@/shared/a11y/SkipLink";

import { isLandingEnglishPublished, isPlaceholderPricingVisible } from "../model/gates";
import { LANDING_ANCHORS, LANDING_SECTIONS } from "../model/sections";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { HERO_VIDEO } from "../model/hero-media";

/*
 * Landing page (Phase 07). Server Component, statically generated per locale.
 *
 * Increment 1 (foundation) renders the header, the footer and the section boundaries in the
 * approved order (model/sections.ts). The sections are empty landmarks with their anchors;
 * their content is built in later increments, from approved copy and assets only. Nothing in
 * them is production-ready yet.
 *
 * - Hero (Increment 2): the Figma Hero box (Desktop 900 at y 0 under the floating header; Tablet
 *   640 after a 32 gap; Mobile 538 after a 24 gap), with the page `h1`. See LandingHero.
 * - Pricing boundary: rendered only where placeholder pricing may appear (P07-D4).
 * - English: served only when published (P07-D1); otherwise 404.
 */

export const LANDING_MAIN_ID = "main-content";

export async function LandingPage({ locale }: { locale: AppLocale }) {
  const appEnv = publicEnv.appEnv;
  const englishPublished = isLandingEnglishPublished(appEnv);
  if (locale === "en" && !englishPublished) notFound();

  const [t, shell] = await Promise.all([getTranslations("landing"), getTranslations("shell")]);

  const navLinks = LANDING_ANCHORS.map((a) => ({
    key: a.key,
    href: a.href,
    label: t(`nav.${a.key}`),
  }));
  const footerLinks = LANDING_ANCHORS.map((a) => ({
    key: a.key,
    href: a.href,
    label: t(`footer.${a.key}`),
  }));
  const languageNames = { en: shell("languageNames.en"), ar: shell("languageNames.ar") };
  const showPricing = isPlaceholderPricingVisible(appEnv);

  return (
    <>
      <SkipLink targetId={LANDING_MAIN_ID} label={shell("skipToContent")} />
      <LandingHeader
        locale={locale}
        links={navLinks}
        showLanguage={englishPublished}
        labels={{
          navigation: shell("mainNavigation"),
          login: t("nav.login"),
          openMenu: shell("openMenu"),
          closeMenu: shell("closeMenu"),
          menuTitle: shell("drawerTitle"),
          languageNames,
        }}
      />
      {/* tabIndex −1: the skip link moves focus here; never a Tab stop itself. */}
      <main
        id={LANDING_MAIN_ID}
        tabIndex={-1}
        data-route-key="landing"
        className="focus-visible:outline-none"
      >
        {LANDING_SECTIONS.map(({ id, key }) => {
          if (key === "pricing" && !showPricing) return null;
          if (key === "hero") {
            return (
              <section
                key={key}
                id={id}
                aria-labelledby="landing-hero-heading"
                data-landing-section={key}
                className="relative isolate mt-[24px] min-h-[538px] overflow-hidden rail:mt-[32px] rail:min-h-[640px] xl:mt-0 xl:min-h-[900px]"
              >
                <LandingHero
                  video={HERO_VIDEO}
                  copy={{
                    heading: t("hero.heading"),
                    description: t("hero.description"),
                    ctaPrimary: t("hero.ctaPrimary"),
                    ctaSecondary: t("hero.ctaSecondary"),
                    videoPause: t("hero.videoPause"),
                    videoPlay: t("hero.videoPlay"),
                  }}
                />
              </section>
            );
          }
          return <section key={key} id={id} data-landing-section={key} />;
        })}
      </main>
      <LandingFooter
        links={footerLinks}
        labels={{
          brandText: t("footer.brandText"),
          platformTitle: t("footer.platformTitle"),
          accountTitle: t("footer.accountTitle"),
          login: t("footer.login"),
          register: t("footer.register"),
          terms: t("footer.terms"),
          privacy: t("footer.privacy"),
        }}
        copyright={t("footer.copyright")}
      />
    </>
  );
}

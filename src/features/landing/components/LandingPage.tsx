import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { publicEnv } from "@/config/env";
import type { AppLocale } from "@/i18n/routing";
import { SkipLink } from "@/shared/a11y/SkipLink";

import {
  isHeroVideoVisible,
  isLandingEnglishPublished,
  isPlaceholderPricingVisible,
} from "../model/gates";
import { LANDING_ANCHORS, LANDING_SECTIONS } from "../model/sections";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { LandingReveal } from "./LandingReveal";
import { LandingShowcase } from "./LandingShowcase";
import { LandingUseCases } from "./LandingUseCases";
import { HERO_VIDEO } from "../model/hero-media";
import { AMBIENT, AMBIENT_LAYER, REVEAL_FADE } from "./landing-styles";

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
 * - Showcase and Use Cases (Increment 3): see LandingShowcase and LandingUseCases. Static
 *   illustration and copy only; images from Figma (model/landing-images.ts).
 *   Gaps above them as in Figma: Showcase 35 (Desktop) / 32 (Tablet) / 24 (Mobile) below the
 *   Hero; Use Cases 0 / 32 / 24 below How It Works.
 * - Visual Refinement (P07-D17, plan §8e): restrained ambient glows (token colours only) behind
 *   the Hero, Showcase and Use Cases; scroll reveal (LandingReveal; off under reduced motion).
 *   The Hero video is provisional and hidden in production (gates.ts).
 * - Pricing boundary: rendered only where placeholder pricing may appear (P07-D4).
 * - English: served only when published (P07-D1); otherwise 404.
 */

export const LANDING_MAIN_ID = "main-content";

/** Showcase menu items, in Figma order (messages `landing.showcase.sidebar.*`). */
const SHOWCASE_SIDEBAR = [
  "dashboard",
  "lectures",
  "live",
  "summaries",
  "questions",
  "history",
] as const;
/** Use Case rows, in Figma order (messages `landing.useCases.items.*`). */
const USE_CASE_ITEMS = ["1", "2", "3"] as const;

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
  const heroVideo =
    HERO_VIDEO && isHeroVideoVisible(appEnv, HERO_VIDEO.provisional ?? false) ? HERO_VIDEO : null;

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
                  video={heroVideo}
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
          if (key === "showcase") {
            return (
              <section
                key={key}
                id={id}
                aria-labelledby="landing-showcase-heading"
                data-landing-section={key}
                className="relative isolate mt-[24px] rail:mt-[32px] xl:mt-[35px]"
              >
                <div
                  aria-hidden="true"
                  data-reveal=""
                  data-landing-ambient="showcase"
                  className={`${AMBIENT_LAYER} ${REVEAL_FADE}`}
                  style={AMBIENT.showcase}
                />
                <LandingShowcase
                  copy={{
                    heading: t("showcase.heading"),
                    description: t("showcase.description"),
                    recording: t("showcase.recording"),
                    timer: t("showcase.timer"),
                    lectureTitle: t("showcase.lectureTitle"),
                    sidebarTitle: t("showcase.sidebarTitle"),
                    sidebar: SHOWCASE_SIDEBAR.map((item) => t(`showcase.sidebar.${item}`)),
                    mobile: {
                      live: t("showcase.mobile.live"),
                      heading: t("showcase.mobile.heading"),
                      lines: [
                        { time: t("showcase.mobile.time1"), text: t("showcase.mobile.line1") },
                        { time: t("showcase.mobile.time2"), text: t("showcase.mobile.line2") },
                      ],
                      pause: t("showcase.mobile.pause"),
                    },
                  }}
                />
              </section>
            );
          }
          if (key === "useCases") {
            return (
              <section
                key={key}
                id={id}
                aria-labelledby="landing-use-cases-heading"
                data-landing-section={key}
                className="relative isolate mt-[24px] rail:mt-[32px] xl:mt-0"
              >
                <div
                  aria-hidden="true"
                  data-reveal=""
                  data-landing-ambient="use-cases"
                  className={`${AMBIENT_LAYER} ${REVEAL_FADE}`}
                  style={AMBIENT.useCases}
                />
                <LandingUseCases
                  copy={{
                    heading: t("useCases.heading"),
                    description: t("useCases.description"),
                    items: USE_CASE_ITEMS.map((n) => ({
                      eyebrow: t(`useCases.items.${n}.eyebrow`),
                      title: t(`useCases.items.${n}.title`),
                      text: t(`useCases.items.${n}.text`),
                    })),
                  }}
                />
              </section>
            );
          }
          return <section key={key} id={id} data-landing-section={key} />;
        })}
      </main>
      <LandingReveal />
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

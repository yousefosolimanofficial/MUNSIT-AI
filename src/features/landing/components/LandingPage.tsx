import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { publicEnv } from "@/config/env";
import type { AppLocale } from "@/i18n/routing";
import { SkipLink } from "@/shared/a11y/SkipLink";

import {
  isHeroImageVisible,
  isLandingEnglishPublished,
  isPlaceholderPricingVisible,
} from "../model/gates";
import { LANDING_ANCHORS, LANDING_SECTIONS } from "../model/sections";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { LandingFaq } from "./LandingFaq";
import { LandingFinalCta } from "./LandingFinalCta";
import { LandingHero } from "./LandingHero";
import { LandingPricing, type PricingPlan } from "./LandingPricing";
import { LandingReveal } from "./LandingReveal";
import { LandingShowcase } from "./LandingShowcase";
import { LandingUseCases } from "./LandingUseCases";
import { HERO_IMAGE } from "../model/hero-media";
import { FEATURE_IMAGES, STEP_IMAGES } from "../model/landing-images";
import {
  AMBIENT,
  AMBIENT_LAYER,
  REVEAL,
  REVEAL_FADE,
  SHOWCASE_GLOW_FALLOFF,
} from "./landing-styles";

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
 *   The Hero shows the static Figma image (P07-D21), hidden in production until verified
 *   (gates.ts).
 * - Features and How It Works (Increment 4): Mariam's FeaturesSection and HowItWorksSection
 *   (her delivered files, unchanged), with Figma images (model/landing-images.ts) and the page's
 *   landmark names and section gaps (Desktop 90 / 0, Tablet 32, Mobile 24).
 * - FAQ, Pricing and Final CTA (Increment 5): the P07-D18 accordion; Pricing as an approved
 *   development-only placeholder (P07-D19); the Final CTA panel. Figma gaps: FAQ 18 / 32 / 24 above,
 *   Desktop FAQ minimum height 989 (fixed Figma frame); Pricing 42 / 32 / 24 above; Final CTA frame
 *   padding 32 + 32 / 64 + 32 (Tablet), 24 + 24 / 48 + 24 (Mobile), and 86 to the footer on Desktop.
 * - Pricing boundary: rendered only where placeholder pricing may appear (P07-D4).
 * - English: served only when published (P07-D1); otherwise 404.
 */

export const LANDING_MAIN_ID = "main-content";

/** Use Case rows, in Figma order (messages `landing.useCases.items.*`). */
const USE_CASE_ITEMS = ["1", "2", "3"] as const;
/** Feature cards, in Figma order (messages `landing.features.items.*`). */
const FEATURE_ITEMS = ["1", "2", "3", "4", "5", "6"] as const;
/** How It Works steps, in reading order (messages `landing.howItWorks.steps.*`). */
const STEP_ITEMS = ["1", "2", "3", "4"] as const;
/** FAQ items, in Figma order (messages `landing.faq.items.*`). */
const FAQ_ITEMS = ["1", "2", "3", "4", "5", "6"] as const;
/** Pricing plans in reading order, with their Figma card styles (messages `landing.pricing.plans.*`). */
const PRICING_PLANS = [
  { key: "starter", style: "standard" },
  { key: "plus", style: "featured" },
  { key: "pro", style: "secondary" },
] as const satisfies readonly { key: string; style: PricingPlan["style"] }[];

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
  const heroImage = isHeroImageVisible(appEnv, HERO_IMAGE.provisional ?? false) ? HERO_IMAGE : null;

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
                  image={heroImage}
                  copy={{
                    heading: t("hero.heading"),
                    description: t("hero.description"),
                    ctaPrimary: t("hero.ctaPrimary"),
                    ctaSecondary: t("hero.ctaSecondary"),
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
                  className={`${AMBIENT_LAYER} ${REVEAL_FADE} ${SHOWCASE_GLOW_FALLOFF}`}
                  style={AMBIENT.showcase}
                />
                <LandingShowcase
                  copy={{
                    heading: t("showcase.heading"),
                    description: t("showcase.description"),
                    recording: t("showcase.recording"),
                    timer: t("showcase.timer"),
                    lectureTitle: t("showcase.lectureTitle"),
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
          if (key === "features") {
            // Mariam's FeaturesSection (Increment 4). The page owns the landmark: named from the
            // section heading (her delivery request), with the Figma gap above it. Desktop: Figma's
            // section frames are fixed-height (Features 1000, How It Works 820) with empty space
            // below the content, reproduced as minimum heights so the sections below keep their
            // Figma positions.
            return (
              <section
                key={key}
                id={id}
                aria-label={t("features.heading")}
                data-landing-section={key}
                className="mt-[24px] rail:mt-[32px] xl:mt-[90px] xl:min-h-[1000px]"
              >
                <div data-reveal="" className={REVEAL}>
                  <FeaturesSection
                    heading={t("features.heading")}
                    description={t("features.description")}
                    items={FEATURE_ITEMS.map((n, index) => ({
                      title: t(`features.items.${n}.title`),
                      text: t(`features.items.${n}.text`),
                      // Decorative: each visual sits beside its own title and text.
                      visual: { src: FEATURE_IMAGES[index]?.src ?? "", alt: "" },
                    }))}
                  />
                </div>
              </section>
            );
          }
          if (key === "howItWorks") {
            return (
              <section
                key={key}
                id={id}
                aria-label={t("howItWorks.heading")}
                data-landing-section={key}
                className="mt-[24px] rail:mt-[32px] xl:mt-0 xl:min-h-[820px]"
              >
                <div data-reveal="" className={REVEAL}>
                  <HowItWorksSection
                    heading={t("howItWorks.heading")}
                    description={t("howItWorks.description")}
                    steps={STEP_ITEMS.map((n, index) => ({
                      number: t(`howItWorks.steps.${n}.number`),
                      title: t(`howItWorks.steps.${n}.title`),
                      text: t(`howItWorks.steps.${n}.text`),
                      visual: { src: STEP_IMAGES[index]?.src ?? "", alt: "" },
                    }))}
                  />
                </div>
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
          if (key === "faq") {
            return (
              <section
                key={key}
                id={id}
                aria-labelledby="landing-faq-heading"
                data-landing-section={key}
                className="mt-[24px] rail:mt-[32px] xl:mt-[18px] xl:min-h-[989px]"
              >
                <div data-reveal="" className={REVEAL}>
                  <LandingFaq
                    copy={{
                      heading: t("faq.heading"),
                      description: t("faq.description"),
                      items: FAQ_ITEMS.map((n) => ({
                        question: t(`faq.items.${n}.question`),
                        answer: t(`faq.items.${n}.answer`),
                      })),
                    }}
                  />
                </div>
              </section>
            );
          }
          if (key === "pricing") {
            // Reached only where placeholder pricing is visible (P07-D4, P07-D19; see above).
            return (
              <section
                key={key}
                id={id}
                aria-labelledby="landing-pricing-heading"
                data-landing-section={key}
                className="mt-[24px] rail:mt-[32px] xl:mt-[42px]"
              >
                <div data-reveal="" className={REVEAL}>
                  <LandingPricing
                    copy={{
                      eyebrow: t("pricing.eyebrow"),
                      heading: t("pricing.heading"),
                      description: t("pricing.description"),
                      note: t("pricing.note"),
                      price: t("pricing.price"),
                      priceNote: t("pricing.priceNote"),
                      feature: t("pricing.feature"),
                      badge: t("pricing.badge"),
                      plans: PRICING_PLANS.map(({ key: plan, style }) => ({
                        style,
                        label: t(`pricing.plans.${plan}.label`),
                        name: t(`pricing.plans.${plan}.name`),
                        text: t(`pricing.plans.${plan}.text`),
                        cta: t(`pricing.plans.${plan}.cta`),
                      })),
                    }}
                  />
                </div>
              </section>
            );
          }
          if (key === "cta") {
            return (
              <section
                key={key}
                id={id}
                aria-labelledby="landing-cta-heading"
                data-landing-section={key}
                className="px-[20px] pt-[48px] pb-[72px] rail:px-[32px] rail:pt-[64px] rail:pb-[96px] xl:px-0 xl:pt-0 xl:pb-[86px]"
              >
                <div data-reveal="" className={REVEAL}>
                  <LandingFinalCta
                    copy={{
                      heading: t("cta.heading"),
                      description: t("cta.description"),
                      primary: t("cta.primary"),
                      secondary: t("cta.secondary"),
                    }}
                  />
                </div>
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

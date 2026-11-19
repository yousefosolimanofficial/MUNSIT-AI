import type { AppLocale } from "@/i18n/routing";

import {
  LandingBrand,
  LandingLanguageLink,
  LandingLoginLink,
  type LanguageNames,
} from "./LandingActions";
import { LandingMenu, type LandingMenuLink } from "./LandingMenu";
import { FOCUS_RING, INTERACTIVE_TRANSITION, NAV_BORDER } from "./landing-styles";

/*
 * Landing header (Phase 07 Increment 1). Figma: Desktop `27:2`, Tablet `200:543`, Mobile `200:697`
 * (design-values §16.2). Breakpoints follow ADR-004: Mobile < 720 (`rail`) ≤ Tablet < 1280
 * (`xl`) ≤ Desktop. At 1024 the Desktop bar does not fit its content, so the Tablet bar is used.
 *
 * - Desktop (xl+): a floating bar over the Hero, at y 18, 1361 wide (viewport − 78 when
 *   narrower), 67 high, radius 16, Ink 20% fill, background blur 48 (Figma's extra "glass" effect
 *   has no CSS equivalent), 1px `#363739` border (Landing-local). Padding block 8; inline start
 *   12 (the Figma content row ends 12 short of the border). Row gap 39: actions | links | logo.
 *   Links: `UI/Navigation` (Cairo 400, measured), gap 63, centred in the remaining width (861 at
 *   1440, as drawn). Actions: login, then language, gap 37.
 * - Tablet (rail–xl): in flow, 78 high, padding 16 / 32. Actions at the inline start (menu, login,
 *   language; gap 12); logo 150 × 39 at the end. The inline links are hidden layers in Figma.
 * - Mobile (< rail): 70 high, padding 14 / 20. Logo at the inline start, menu at the end.
 * - RTL / LTR: logical properties only. The Arabic layout is the Figma one; English mirrors it.
 *
 * DOM order = visual reading order on Desktop and Tablet. On Mobile the logo is moved to the
 * inline start with `order` (two items, no meaning lost).
 */

export interface LandingHeaderProps {
  locale: AppLocale;
  links: readonly LandingMenuLink[];
  labels: {
    navigation: string;
    login: string;
    openMenu: string;
    closeMenu: string;
    menuTitle: string;
    languageNames: LanguageNames;
  };
  showLanguage: boolean;
}

const DESKTOP_BAR = [
  "absolute inset-x-[39px] top-[18px] z-10 mx-auto hidden h-[67px] max-w-[1361px] items-center gap-[39px]",
  "rounded-lg border bg-surface-ink/20 py-[8px] ps-[12px] backdrop-blur-[48px] xl:flex",
  NAV_BORDER,
].join(" ");

const DESKTOP_LINK = [
  "rounded-sm whitespace-nowrap text-ui-navigation text-text-primary",
  // Hover (Visual Refinement): colour only, no movement.
  INTERACTIVE_TRANSITION,
  "hover:text-accent-electric-sky",
  FOCUS_RING,
].join(" ");

const COMPACT_BAR = [
  "flex h-[70px] items-center justify-between px-[20px] py-[14px] xl:hidden",
  "rail:h-[78px] rail:px-[32px] rail:py-[16px]",
].join(" ");

export function LandingHeader({ locale, links, labels, showLanguage }: LandingHeaderProps) {
  return (
    <header data-landing-header="" className="relative">
      {/* Desktop */}
      <div className={DESKTOP_BAR} data-landing-bar="desktop">
        <div className="flex shrink-0 items-center gap-[37px]">
          <LandingLoginLink label={labels.login} />
          {showLanguage ? (
            <LandingLanguageLink locale={locale} languageNames={labels.languageNames} />
          ) : null}
        </div>
        <nav aria-label={labels.navigation} className="flex min-w-0 flex-1 justify-center">
          <ul className="flex items-center gap-[63px] py-[10px]">
            {links.map((link) => (
              <li key={link.key}>
                <a href={link.href} className={DESKTOP_LINK}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <LandingBrand height={49} preload />
      </div>

      {/* Tablet and Mobile */}
      <div className={COMPACT_BAR} data-landing-bar="compact">
        <div className="flex items-center gap-[12px]">
          <LandingMenu
            locale={locale}
            links={links}
            showLanguage={showLanguage}
            labels={{
              openMenu: labels.openMenu,
              closeMenu: labels.closeMenu,
              title: labels.menuTitle,
              navigation: labels.navigation,
              login: labels.login,
              languageNames: labels.languageNames,
            }}
          />
          {/* Tablet only (hidden layers on Mobile in Figma); the wrapper owns the display. */}
          <div className="hidden items-center gap-[12px] rail:flex">
            <LandingLoginLink label={labels.login} />
            {showLanguage ? (
              <LandingLanguageLink locale={locale} languageNames={labels.languageNames} />
            ) : null}
          </div>
        </div>
        <LandingBrand height={39} className="order-first rail:order-none" />
      </div>
    </header>
  );
}

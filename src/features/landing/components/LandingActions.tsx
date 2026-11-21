import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";
import type { AppLocale } from "@/i18n/routing";
import { Logo } from "@/shared/ui/Logo";

import { FOCUS_RING, INTERACTIVE_TRANSITION } from "./landing-styles";

/*
 * Landing header actions (Phase 07 Increment 1). Figma: Desktop `27:2`, Tablet `200:543`,
 * Mobile `200:697` (design-values §16.2).
 *
 * Two looks (`variant`):
 * - `solid` (Desktop and Tablet bars; owner visual refinement 2026-11-21, compact navbar): white
 *   fill, Ink label, 36 high, radius 10, 14 / 500, Mist on hover, the Landing focus ring.
 * - `outline` (the Mobile menu sheet, unchanged): the Figma buttons below.
 *   - Login: "تسجيل الدخول", 145 × 46, Mist 1px border, radius 17, padding 8 / 12, `UI/Button`,
 *     white.
 *   - Language: 38 × 45, Mist 1px border, radius 10, padding 8 / 6, `UI/Button`.
 * Login links to the approved login route (`auth.login`). Language links to the Landing in the
 * other language. The visible code is "EN" on the Arabic page (Figma) and "AR" on the English page
 * (as the Phase 05 language switch). The link is named by the code plus the language in that
 * language, in a visually hidden span (WCAG 2.5.3): "EN English".
 * - Brand: the Horizontal logo, linking to the Landing.
 *
 * No hooks: these render in the server header and in the client menu sheet.
 * The primary "ابدأ الآن" CTA (P07-D24) is in the Hero, never in the navigation (owner decision).
 */

export type LandingActionVariant = "solid" | "outline";

/** Compact solid white control (Desktop and Tablet bars). */
const SOLID = [
  "inline-flex h-[36px] shrink-0 items-center justify-center rounded-[10px] bg-text-primary",
  "text-[14px] leading-[1.4] font-medium whitespace-nowrap text-surface-ink",
  INTERACTIVE_TRANSITION,
  "hover:bg-neutral-mist",
  FOCUS_RING,
].join(" ");

const LOGIN_CLASSES: Record<LandingActionVariant, string> = {
  solid: `${SOLID} px-[14px]`,
  outline: [
    "inline-flex h-[46px] shrink-0 items-center justify-center rounded-[17px] border border-neutral-mist px-[12px]",
    "text-ui-button whitespace-nowrap text-text-primary",
    INTERACTIVE_TRANSITION,
    "hover:border-accent-electric-sky hover:bg-accent-electric-sky/10",
    FOCUS_RING,
  ].join(" "),
};

const LANGUAGE_CLASSES: Record<LandingActionVariant, string> = {
  solid: `${SOLID} min-w-[38px] px-[10px]`,
  outline: [
    "inline-flex h-[45px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-neutral-mist",
    "text-ui-button text-text-primary",
    INTERACTIVE_TRANSITION,
    "hover:border-accent-electric-sky hover:bg-accent-electric-sky/10",
    FOCUS_RING,
  ].join(" "),
};

export function LandingLoginLink({
  label,
  variant = "outline",
  className = "",
}: {
  label: string;
  variant?: LandingActionVariant;
  className?: string;
}) {
  return (
    <Link
      href={ROUTES["auth.login"]}
      data-landing-action="login"
      className={`${LOGIN_CLASSES[variant]} ${className}`}
    >
      {label}
    </Link>
  );
}

export interface LanguageNames {
  en: string;
  ar: string;
}

export function LandingLanguageLink({
  locale,
  languageNames,
  variant = "outline",
  className = "",
}: {
  locale: AppLocale;
  languageNames: LanguageNames;
  variant?: LandingActionVariant;
  className?: string;
}) {
  const other: AppLocale = locale === "ar" ? "en" : "ar";
  const code = other === "en" ? "EN" : "AR";
  return (
    <Link
      href={ROUTES.landing}
      locale={other}
      hrefLang={other}
      data-landing-action="language"
      className={`${LANGUAGE_CLASSES[variant]} ${className}`}
    >
      <span lang="en">{code}</span>
      <span lang={other} className="sr-only">{` ${languageNames[other]}`}</span>
    </Link>
  );
}

/** Horizontal logo linking to the Landing (Desktop 30 in the compact bar; Tablet / Mobile 39). */
export function LandingBrand({
  height,
  preload = false,
  className = "",
}: {
  height: number;
  preload?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={ROUTES.landing}
      data-landing-brand=""
      className={`inline-flex shrink-0 items-center rounded-sm ${FOCUS_RING} ${className}`}
    >
      <Logo variant="horizontal" height={height} preload={preload} />
    </Link>
  );
}

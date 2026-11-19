import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";
import type { AppLocale } from "@/i18n/routing";
import { Logo } from "@/shared/ui/Logo";

import { FOCUS_RING } from "./landing-styles";

/*
 * Landing header actions (Phase 07 Increment 1). Figma: Desktop `27:2`, Tablet `200:543`,
 * Mobile `200:697` (design-values §16.2).
 *
 * - Login: "تسجيل الدخول", 145 × 46, Mist 1px border, radius 17, padding 8 / 12, `UI/Button`,
 *   white. Links to the approved login route (`auth.login`).
 * - Language: 38 × 45, Mist 1px border, radius 10, padding 8 / 6, `UI/Button`. It links to the
 *   Landing in the other language. The visible code is "EN" on the Arabic page (Figma) and "AR" on
 *   the English page (as the Phase 05 language switch). The link is named by the code plus the
 *   language in that language, in a visually hidden span (WCAG 2.5.3): "EN English".
 * - Brand: the Horizontal logo, linking to the Landing.
 *
 * No hooks: these render in the server header and in the client menu sheet.
 * The primary "ابدأ مجانًا" CTA is in the Hero, never in the navigation (owner decision).
 */

const LOGIN_CLASSES = [
  "inline-flex h-[46px] shrink-0 items-center justify-center rounded-[17px] border border-neutral-mist px-[12px]",
  "text-ui-button whitespace-nowrap text-text-primary",
  FOCUS_RING,
].join(" ");

const LANGUAGE_CLASSES = [
  "inline-flex h-[45px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-neutral-mist",
  "text-ui-button text-text-primary",
  FOCUS_RING,
].join(" ");

export function LandingLoginLink({ label, className = "" }: { label: string; className?: string }) {
  return (
    <Link
      href={ROUTES["auth.login"]}
      data-landing-action="login"
      className={`${LOGIN_CLASSES} ${className}`}
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
  className = "",
}: {
  locale: AppLocale;
  languageNames: LanguageNames;
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
      className={`${LANGUAGE_CLASSES} ${className}`}
    >
      <span lang="en">{code}</span>
      <span lang={other} className="sr-only">{` ${languageNames[other]}`}</span>
    </Link>
  );
}

/** Horizontal logo linking to the Landing; height from Figma (Desktop 49, Tablet / Mobile 39). */
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

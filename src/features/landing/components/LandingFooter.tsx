import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";
import { Logo } from "@/shared/ui/Logo";

import { FOCUS_RING } from "./landing-styles";

/*
 * Landing footer (Phase 07 Increment 1). Figma: Desktop `129:103`, Tablet `200:661`, Mobile
 * `200:810` (design-values §16.3).
 *
 * - Box: 1px Slate top border. Desktop: on the 1200 content width; Tablet / Mobile: full width.
 *   Padding top / bottom 64 / 32 (Mobile 48 / 28); inline 32 (Mobile 20); gap 48 / 40 / 28.
 * - Main: a row with space between (Desktop, Tablet) or a column with gap 28 (Mobile), every
 *   column aligned to the inline start. Columns in reading order: brand (logo 170 × 56 frame,
 *   description `Landing/Body/Lead` 360 wide, or `Landing/Body/Base` on Mobile), platform
 *   ("المنصة", `Heading/Medium`), account ("حسابك", `Landing/Label/Title`). Title to links gap 20,
 *   links gap 16, `Landing/Footer/Link`, Text/Secondary.
 * - Bottom: 1px Slate top border, padding top 14. Copyright (Text/Muted Readable, 16 / 140%, the
 *   `Landing/Footer/Link` metrics; it has no Figma style; LTR base direction as drawn) and legal text (`Landing/Footer/Legal`,
 *   gap 24, padding inline 5). Mobile stacks the legal text above the copyright, gap 10.
 * - Legal (P07-D2): "الشروط والأحكام" and "سياسة الخصوصية" are NON-INTERACTIVE text until approved
 *   legal routes and content exist. No placeholder links. Real legal pages are required before
 *   public launch.
 * - Links: anchors to the Landing sections; account links to the approved login and register routes
 *   (`auth.login`, `auth.register`).
 */

export interface LandingFooterProps {
  links: readonly { key: string; href: string; label: string }[];
  labels: {
    brandText: string;
    platformTitle: string;
    accountTitle: string;
    login: string;
    register: string;
    terms: string;
    privacy: string;
  };
  /** Copyright line, verbatim ("© 2026 Munsit AI. جميع الحقوق محفوظة."). */
  copyright: string;
}

const LINK = ["rounded-sm text-landing-footer-link text-text-secondary", FOCUS_RING].join(" ");

const COLUMN = "flex flex-col items-start gap-[20px]";
const LIST = "flex flex-col items-start gap-[16px]";

export function LandingFooter({ links, labels, copyright }: LandingFooterProps) {
  return (
    <footer
      data-landing-footer=""
      className="border-t border-neutral-slate px-[20px] rail:px-[32px] xl:border-t-0 xl:px-0"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[28px] pt-[48px] pb-[28px] rail:gap-[40px] rail:pt-[64px] rail:pb-[32px] xl:gap-[48px] xl:border-t xl:border-neutral-slate">
        <div className="flex flex-col items-start gap-[28px] rail:flex-row rail:justify-between">
          <div className={`${COLUMN} rail:w-[360px]`} data-landing-footer-column="brand">
            <div className="flex h-[56px] items-center">
              <Logo variant="horizontal" height={44} />
            </div>
            <p className="text-landing-body-base text-text-secondary rail:text-landing-body-lead">
              {labels.brandText}
            </p>
          </div>

          <nav
            aria-labelledby="landing-footer-platform"
            className={COLUMN}
            data-landing-footer-column="platform"
          >
            <h2 id="landing-footer-platform" className="text-heading-medium text-text-primary">
              {labels.platformTitle}
            </h2>
            <ul className={LIST}>
              {links.map((link) => (
                <li key={link.key}>
                  <a href={link.href} className={LINK}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="landing-footer-account"
            className={COLUMN}
            data-landing-footer-column="account"
          >
            <h2 id="landing-footer-account" className="text-landing-label-title text-text-primary">
              {labels.accountTitle}
            </h2>
            <ul className={LIST}>
              <li>
                <Link href={ROUTES["auth.login"]} className={LINK}>
                  {labels.login}
                </Link>
              </li>
              <li>
                <Link href={ROUTES["auth.register"]} className={LINK}>
                  {labels.register}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-start gap-[10px] border-t border-neutral-slate pt-[14px] rail:flex-row rail:items-center rail:justify-between">
          {/* Figma renders this line with a left-to-right base direction (the Latin run first);
              dir="ltr" reproduces it in both locales. */}
          <p dir="ltr" className="text-landing-footer-link text-text-muted-readable">
            {copyright}
          </p>
          {/* P07-D2: non-interactive until approved legal pages exist. */}
          <p
            className="order-first flex gap-[24px] px-[5px] text-landing-footer-legal text-text-secondary rail:order-none"
            data-landing-legal=""
          >
            {/* Figma reading order: privacy, then terms. */}
            <span>{labels.privacy}</span>
            <span>{labels.terms}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

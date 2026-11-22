"use client";

import { useState } from "react";

import type { AppLocale } from "@/i18n/routing";
import { Sheet } from "@/shared/ui/Sheet";

import { LandingLanguageLink, LandingLoginLink, type LanguageNames } from "./LandingActions";
import { FOCUS_RING } from "./landing-styles";

/*
 * Landing menu for Tablet and Mobile (Phase 07 Increment 1, P07-D12). Figma draws the menu
 * button (`Menu / Button`, 46 × 42, radius 12, padding 12, three 20 × 2 white bars, gap 5;
 * border Text/Muted on Tablet `200:543`, Slate on Mobile `200:697`), but not the open menu.
 *
 * Reuse decision (P07-D12, conditional): the shared Phase 03 `Sheet` is generic infrastructure
 * (native modal dialog, Esc / scrim / close button, focus trap, focus return, scroll lock) and
 * not product-specific, so its interaction contract fits. The product's `MoreSheet` is not
 * reused: it carries app-shell destinations. Inside the sheet:
 * - the four anchor links (`UI/Navigation`). Activating one closes the sheet and the browser
 *   follows the fragment to the section;
 * - the login and language actions, as drawn in the header.
 *
 * Copy is approved: the button uses shell "فتح القائمة", the title shell "القائمة" and the close
 * button shell "إغلاق القائمة". No new copy.
 */

export interface LandingMenuLink {
  key: string;
  href: string;
  label: string;
}

export interface LandingMenuProps {
  locale: AppLocale;
  links: readonly LandingMenuLink[];
  labels: {
    openMenu: string;
    closeMenu: string;
    title: string;
    navigation: string;
    login: string;
    languageNames: LanguageNames;
  };
  /** Whether the language link is shown (P07-D1 gate). */
  showLanguage: boolean;
  /** Whether the login link is shown (Authentication gate, P07-D24). */
  showLogin?: boolean;
}

const MENU_BUTTON = [
  "flex h-[42px] w-[46px] shrink-0 cursor-pointer flex-col items-start gap-[5px] rounded-md border p-[12px]",
  // Mobile Slate; Tablet Text/Muted (Figma).
  "border-neutral-slate rail:border-text-muted",
  FOCUS_RING,
].join(" ");

const BAR = "block h-[2px] w-[20px] shrink-0 bg-text-primary";

const MENU_LINK = [
  "flex min-h-[44px] items-center rounded-sm text-ui-navigation text-text-primary",
  FOCUS_RING,
].join(" ");

export function LandingMenu({
  locale,
  links,
  labels,
  showLanguage,
  showLogin = true,
}: LandingMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label={labels.openMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-landing-menu-button=""
        onClick={() => setOpen(true)}
        className={MENU_BUTTON}
      >
        <span aria-hidden="true" className={BAR} />
        <span aria-hidden="true" className={BAR} />
        <span aria-hidden="true" className={BAR} />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title={labels.title} closeLabel={labels.closeMenu}>
        <nav aria-label={labels.navigation} data-landing-menu="">
          <ul className="flex flex-col gap-xs">
            {links.map((link) => (
              <li key={link.key}>
                {/* The fragment is followed natively; the sheet closes on the same click. */}
                <a href={link.href} onClick={close} className={MENU_LINK}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          {showLogin || showLanguage ? (
            <div className="mt-lg flex items-center gap-sm">
              {showLogin ? <LandingLoginLink label={labels.login} /> : null}
              {showLanguage ? (
                <LandingLanguageLink locale={locale} languageNames={labels.languageNames} />
              ) : null}
            </div>
          ) : null}
        </nav>
      </Sheet>
    </>
  );
}

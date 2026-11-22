// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import { LandingFooter } from "./components/LandingFooter";
import { LandingHeader } from "./components/LandingHeader";
import { LandingHero } from "./components/LandingHero";
import { LandingMenu } from "./components/LandingMenu";
import {
  AUTHENTICATION_AVAILABLE,
  isAuthenticationAvailable,
  landingAuthEntryPoints,
} from "./model/gates";
import { LANDING_ANCHORS } from "./model/sections";

/*
 * P07-D24 (owner, 2026-11-22): public authentication entry points are hidden in production until
 * Authentication is operational, and kept in development. Covers the gate, the entry-point map the
 * page uses, and every entry point component (navbar Desktop and Tablet, Mobile menu sheet, Hero,
 * footer account column). The Final CTA section is skipped by the page from the same map.
 */

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(cleanup);

const AUTH_HREF = /\/(en\/)?(login|register)$/;
const { landing, shell } = MESSAGES.ar;

function wrap(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="ar" messages={null}>
      <div dir="rtl" lang="ar">
        {ui}
      </div>
    </NextIntlClientProvider>,
  );
}

const navLinks = LANDING_ANCHORS.map((a) => ({
  key: a.key,
  href: a.href,
  label: landing.nav[a.key],
}));
const footerLinks = LANDING_ANCHORS.map((a) => ({
  key: a.key,
  href: a.href,
  label: landing.footer[a.key],
}));
const headerLabels = {
  navigation: shell.mainNavigation,
  login: landing.nav.login,
  openMenu: shell.openMenu,
  closeMenu: shell.closeMenu,
  menuTitle: shell.drawerTitle,
  languageNames: shell.languageNames,
};
const footerLabels = {
  brandText: landing.footer.brandText,
  platformTitle: landing.footer.platformTitle,
  accountTitle: landing.footer.accountTitle,
  login: landing.footer.login,
  register: landing.footer.register,
  terms: landing.footer.terms,
  privacy: landing.footer.privacy,
};
const heroCopy = {
  heading: landing.hero.heading,
  description: landing.hero.description,
  ctaPrimary: landing.hero.ctaPrimary,
  ctaSecondary: landing.hero.ctaSecondary,
};

const authLinks = (root: ParentNode) =>
  [...root.querySelectorAll("a")].filter((a) => AUTH_HREF.test(a.getAttribute("href") ?? ""));

/** Renders every authentication entry point component with the page's flags for `appEnv`. */
function renderEntryPoints(appEnv: "production" | "development") {
  const auth = landingAuthEntryPoints(appEnv);
  const view = wrap(
    <>
      <LandingHeader
        locale="ar"
        links={navLinks}
        labels={headerLabels}
        showLanguage={false}
        showLogin={auth.navLogin}
      />
      <LandingHero copy={heroCopy} image={null} showPrimary={auth.heroPrimary} />
      <LandingFooter
        links={footerLinks}
        labels={footerLabels}
        copyright={landing.footer.copyright}
        showAccount={auth.footerAccount}
      />
    </>,
  );
  return { auth, view };
}

describe("Authentication availability gate (P07-D24)", () => {
  it("Authentication is not available yet (owner decision)", () => {
    expect(AUTHENTICATION_AVAILABLE).toBe(false);
  });

  it("production hides authentication entry points; development and test keep them", () => {
    expect(isAuthenticationAvailable("production")).toBe(false);
    expect(isAuthenticationAvailable("development")).toBe(true);
    expect(isAuthenticationAvailable("test")).toBe(true);
    // Once the owner confirms a working flow, production shows them.
    expect(isAuthenticationAvailable("production", true)).toBe(true);
  });

  it("entry-point map: every public entry point follows the gate, including the Final CTA", () => {
    expect(landingAuthEntryPoints("production")).toEqual({
      navLogin: false,
      heroPrimary: false,
      footerAccount: false,
      finalCta: false,
    });
    expect(landingAuthEntryPoints("development")).toEqual({
      navLogin: true,
      heroPrimary: true,
      footerAccount: true,
      finalCta: true,
    });
    expect(landingAuthEntryPoints("production", true).finalCta).toBe(true);
  });
});

describe("Production: no public authentication entry point renders", () => {
  it("navbar (Desktop and Tablet), Hero and footer render no login or register link", () => {
    const { view } = renderEntryPoints("production");
    expect(authLinks(view.container)).toHaveLength(0);
    expect(view.container.querySelector("[data-landing-action=login]")).toBeNull();
    expect(view.container.querySelector("[data-landing-hero-cta=primary]")).toBeNull();
    expect(view.container.querySelector("[data-landing-footer-column=account]")).toBeNull();
    // Unrelated content stays: the Hero's in-page action and the footer's section links.
    expect(
      view.container.querySelector("[data-landing-hero-cta=secondary]")?.getAttribute("href"),
    ).toBe("#how-it-works");
    expect(view.container.querySelector("[data-landing-footer-column=platform]")).not.toBeNull();
  });

  it("Mobile menu sheet: no login link (and no empty actions row)", () => {
    const auth = landingAuthEntryPoints("production");
    wrap(
      <LandingMenu
        locale="ar"
        links={navLinks}
        showLanguage={false}
        showLogin={auth.navLogin}
        labels={{
          openMenu: shell.openMenu,
          closeMenu: shell.closeMenu,
          title: shell.drawerTitle,
          navigation: shell.mainNavigation,
          login: landing.nav.login,
          languageNames: shell.languageNames,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: shell.openMenu }));
    const sheet = document.querySelector("[data-landing-menu]");
    expect(sheet).not.toBeNull();
    expect(authLinks(sheet as ParentNode)).toHaveLength(0);
    expect(sheet?.querySelector("[data-landing-action=login]")).toBeNull();
    // Section links remain.
    expect(sheet?.querySelectorAll("a[href^='#']").length).toBe(LANDING_ANCHORS.length);
  });
});

describe("Development: every public authentication entry point renders", () => {
  it("navbar login (Desktop and Tablet), Hero primary → Register, footer login and register", () => {
    const { view } = renderEntryPoints("development");
    const hrefs = authLinks(view.container).map((a) => a.getAttribute("href"));
    // Login twice (Desktop and Tablet bars), Hero → Register, footer login and register.
    expect(hrefs.filter((href) => href === "/login")).toHaveLength(3);
    expect(hrefs.filter((href) => href === "/register")).toHaveLength(2);
    expect(view.container.querySelector("[data-landing-hero-cta=primary]")?.textContent).toBe(
      "ابدأ الآن",
    );
  });

  it("Mobile menu sheet keeps the login link", () => {
    wrap(
      <LandingMenu
        locale="ar"
        links={navLinks}
        showLanguage={false}
        showLogin={landingAuthEntryPoints("development").navLogin}
        labels={{
          openMenu: shell.openMenu,
          closeMenu: shell.closeMenu,
          title: shell.drawerTitle,
          navigation: shell.mainNavigation,
          login: landing.nav.login,
          languageNames: shell.languageNames,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: shell.openMenu }));
    const sheet = document.querySelector("[data-landing-menu]");
    expect(sheet?.querySelector("[data-landing-action=login]")?.getAttribute("href")).toBe(
      "/login",
    );
  });
});

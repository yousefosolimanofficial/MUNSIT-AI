// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import { LandingFooter } from "./components/LandingFooter";
import { LandingHeader } from "./components/LandingHeader";
import { LandingMenu } from "./components/LandingMenu";
import {
  isHeroVideoVisible,
  isLandingEnglishPublished,
  isPlaceholderPricingVisible,
  LANDING_ENGLISH_APPROVED,
} from "./model/gates";
import { HERO_VIDEO } from "./model/hero-media";
import { LANDING_ANCHORS, LANDING_SECTIONS } from "./model/sections";

/*
 * Phase 07 Increment 1: Landing foundation units. Real message catalogs; jsdom has no
 * showModal/close, so they are stubbed as in Dialog.test.tsx.
 */

type Locale = "ar" | "en";

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

function inLocale(locale: Locale, ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale={locale} messages={null}>
      <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        {ui}
      </div>
    </NextIntlClientProvider>,
  );
}

function linksFor(locale: Locale, area: "nav" | "footer") {
  const m = MESSAGES[locale].landing;
  return LANDING_ANCHORS.map((a) => ({ key: a.key, href: a.href, label: m[area][a.key] }));
}

function headerLabels(locale: Locale) {
  const { landing, shell } = MESSAGES[locale];
  return {
    navigation: shell.mainNavigation,
    login: landing.nav.login,
    openMenu: shell.openMenu,
    closeMenu: shell.closeMenu,
    menuTitle: shell.drawerTitle,
    languageNames: shell.languageNames,
  };
}

describe("gates (P07-D1 English, P07-D4 placeholder pricing)", () => {
  it("English is not approved yet; production hides it, development and test show it", () => {
    expect(LANDING_ENGLISH_APPROVED).toBe(false);
    expect(isLandingEnglishPublished("production")).toBe(false);
    expect(isLandingEnglishPublished("development")).toBe(true);
    expect(isLandingEnglishPublished("test")).toBe(true);
    expect(isLandingEnglishPublished("production", true)).toBe(true);
  });

  it("the provisional Hero video never plays in production; an approved one would", () => {
    expect(HERO_VIDEO?.provisional).toBe(true);
    expect(isHeroVideoVisible("production", true)).toBe(false);
    expect(isHeroVideoVisible("development", true)).toBe(true);
    expect(isHeroVideoVisible("test", true)).toBe(true);
    expect(isHeroVideoVisible("production", false)).toBe(true);
  });

  it("placeholder pricing never renders in production", () => {
    expect(isPlaceholderPricingVisible("production")).toBe(false);
    expect(isPlaceholderPricingVisible("development")).toBe(true);
    expect(isPlaceholderPricingVisible("test")).toBe(true);
  });
});

describe("section order (plan §6)", () => {
  it("hero, showcase, features, how it works, use cases, FAQ, pricing, final CTA", () => {
    expect(LANDING_SECTIONS.map((s) => s.key)).toEqual([
      "hero",
      "showcase",
      "features",
      "howItWorks",
      "useCases",
      "faq",
      "pricing",
      "cta",
    ]);
  });

  it("every anchor points at a section", () => {
    const ids = new Set<string>(LANDING_SECTIONS.map((s) => s.id));
    for (const a of LANDING_ANCHORS) expect(ids.has(a.href.slice(1))).toBe(true);
  });
});

describe("Arabic copy is Figma verbatim (P07-D11)", () => {
  const ar = MESSAGES.ar.landing;
  it("keeps the navigation spacing and the footer form exactly", () => {
    expect(ar.nav.howItWorks).toBe("كيف يعمل ؟ ");
    expect(ar.footer.howItWorks).toBe("كيف يعمل؟");
  });
  it("keeps Figma's line separator (U+2028) in the Showcase heading", () => {
    expect(ar.showcase.heading).toContain(" ");
  });
  it("copyright is the exact Figma string (no markup)", () => {
    expect(ar.footer.copyright).toBe("© 2026 Munsit AI. جميع الحقوق محفوظة.");
  });
});

describe("LandingFooter", () => {
  function renderFooter(locale: Locale) {
    const f = MESSAGES[locale].landing.footer;
    return inLocale(
      locale,
      <LandingFooter
        links={linksFor(locale, "footer")}
        labels={{
          brandText: f.brandText,
          platformTitle: f.platformTitle,
          accountTitle: f.accountTitle,
          login: f.login,
          register: f.register,
          terms: f.terms,
          privacy: f.privacy,
        }}
        copyright={f.copyright}
      />,
    );
  }

  it.each<Locale>(["ar", "en"])(
    "legal items are non-interactive text, privacy first (%s)",
    (locale) => {
      const { container } = renderFooter(locale);
      const legal = container.querySelector("[data-landing-legal]");
      expect(legal?.querySelectorAll("a, button")).toHaveLength(0);
      const f = MESSAGES[locale].landing.footer;
      expect([...(legal?.querySelectorAll("span") ?? [])].map((s) => s.textContent)).toEqual([
        f.privacy,
        f.terms,
      ]);
    },
  );

  it("platform links are section anchors; account links use the approved Auth routes", () => {
    renderFooter("ar");
    const f = MESSAGES.ar.landing.footer;
    const platform = screen.getByRole("navigation", { name: f.platformTitle });
    expect(
      within(platform)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(["#top", "#features", "#how-it-works", "#faq"]);
    const account = screen.getByRole("navigation", { name: f.accountTitle });
    expect(
      within(account)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(["/login", "/register"]);
  });

  it("the copyright line keeps Figma's left-to-right base direction", () => {
    renderFooter("ar");
    const line = screen.getByText(MESSAGES.ar.landing.footer.copyright);
    expect(line.getAttribute("dir")).toBe("ltr");
  });
});

describe("LandingHeader", () => {
  it("desktop navigation: the four anchors in order, verbatim; login; language; logo link", () => {
    const { container } = inLocale(
      "ar",
      <LandingHeader
        locale="ar"
        links={linksFor("ar", "nav")}
        labels={headerLabels("ar")}
        showLanguage
      />,
    );
    const desktop = container.querySelector<HTMLElement>("[data-landing-bar=desktop]");
    if (!desktop) throw new Error("desktop bar missing");
    const nav = within(desktop).getByRole("navigation", { name: MESSAGES.ar.shell.mainNavigation });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(linksFor("ar", "nav").map((l) => l.label));
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#top",
      "#features",
      "#how-it-works",
      "#faq",
    ]);
    expect(desktop.querySelector("[data-landing-action=login]")?.getAttribute("href")).toBe(
      "/login",
    );
    expect(desktop.querySelector("[data-landing-action=language]")?.getAttribute("href")).toBe(
      "/en",
    );
    expect(desktop.querySelector("[data-landing-brand]")?.getAttribute("href")).toBe("/");
  });

  it("never places the Hero CTA in the navigation", () => {
    const { container } = inLocale(
      "ar",
      <LandingHeader
        locale="ar"
        links={linksFor("ar", "nav")}
        labels={headerLabels("ar")}
        showLanguage
      />,
    );
    expect(container.textContent).not.toContain(MESSAGES.ar.landing.hero.ctaPrimary);
  });

  it("the language link names its language (WCAG 2.5.3) and can be gated off (P07-D1)", () => {
    const { container, unmount } = inLocale(
      "en",
      <LandingHeader
        locale="en"
        links={linksFor("en", "nav")}
        labels={headerLabels("en")}
        showLanguage
      />,
    );
    const lang = container.querySelector("[data-landing-action=language]");
    // Switching locale: next-intl always prefixes (`/ar`), then redirects to the unprefixed `/`
    // (same as the Phase 05 language switch).
    expect(lang?.getAttribute("href")).toBe("/ar");
    expect(lang?.textContent).toBe("AR العربية");
    unmount();
    const gated = inLocale(
      "ar",
      <LandingHeader
        locale="ar"
        links={linksFor("ar", "nav")}
        labels={headerLabels("ar")}
        showLanguage={false}
      />,
    );
    expect(gated.container.querySelector("[data-landing-action=language]")).toBeNull();
  });
});

describe("LandingMenu (Tablet and Mobile)", () => {
  function renderMenu() {
    const { shell, landing } = MESSAGES.ar;
    return inLocale(
      "ar",
      <LandingMenu
        locale="ar"
        links={linksFor("ar", "nav")}
        showLanguage
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
  }

  it("the button opens the shared Sheet; a section link closes it", () => {
    renderMenu();
    const button = screen.getByRole("button", { name: MESSAGES.ar.shell.openMenu });
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const dialog = document.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(true);
    const link = within(dialog as HTMLElement).getByRole("link", {
      name: MESSAGES.ar.landing.nav.features,
    });
    expect(link.getAttribute("href")).toBe("#features");
    fireEvent.click(link);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });
});

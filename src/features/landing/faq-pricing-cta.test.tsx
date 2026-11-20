// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import { FaqAccordion } from "./components/FaqAccordion";
import { LandingFaq } from "./components/LandingFaq";
import { LandingFinalCta } from "./components/LandingFinalCta";
import { LandingPricing, type LandingPricingCopy } from "./components/LandingPricing";
import { isPlaceholderPricingVisible } from "./model/gates";
import { LANDING_ANCHORS } from "./model/sections";

/* Phase 07 Increment 5: FAQ (P07-D18), Pricing (P07-D4, P07-D19), Final CTA, with real messages. */

type Locale = "ar" | "en";
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

const faqItems = (locale: Locale) => Object.values(MESSAGES[locale].landing.faq.items);

function pricingCopy(locale: Locale): LandingPricingCopy {
  const p = MESSAGES[locale].landing.pricing;
  return {
    eyebrow: p.eyebrow,
    heading: p.heading,
    description: p.description,
    note: p.note,
    price: p.price,
    priceNote: p.priceNote,
    feature: p.feature,
    badge: p.badge,
    plans: [
      { style: "standard", ...p.plans.starter },
      { style: "featured", ...p.plans.plus },
      { style: "secondary", ...p.plans.pro },
    ],
  };
}

const expanded = () =>
  screen.getAllByRole("button").map((button) => button.getAttribute("aria-expanded"));

describe.each(["ar", "en"] as const)("FAQ accordion, P07-D18 (%s)", (locale) => {
  it("six verbatim questions as h3 buttons; item 01 expanded on load, the rest collapsed", () => {
    render(<FaqAccordion items={faqItems(locale)} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(faqItems(locale).map((i) => i.question));
    expect(expanded()).toEqual(["true", "false", "false", "false", "false", "false"]);
    const first = screen.getAllByRole("button")[0];
    const panel = document.getElementById(first?.getAttribute("aria-controls") ?? "");
    expect(panel?.getAttribute("role")).toBe("region");
    expect(panel?.getAttribute("aria-labelledby")).toBe(first?.id);
    expect(panel?.textContent).toBe(faqItems(locale)[0]?.answer);
  });

  it("only one item open: opening another closes the previous one", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={faqItems(locale)} />);
    await user.click(screen.getAllByRole("button")[2] as HTMLElement);
    expect(expanded()).toEqual(["false", "false", "true", "false", "false", "false"]);
  });

  it("activating the expanded item closes it: all may be collapsed", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={faqItems(locale)} />);
    await user.click(screen.getAllByRole("button")[0] as HTMLElement);
    expect(expanded().every((state) => state === "false")).toBe(true);
  });

  it("keyboard: Tab reaches each trigger; Enter and Space toggle", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={faqItems(locale)} />);
    const buttons = screen.getAllByRole("button");
    await user.tab();
    expect(document.activeElement).toBe(buttons[0]);
    await user.tab();
    expect(document.activeElement).toBe(buttons[1]);
    await user.keyboard("{Enter}");
    expect(expanded()[1]).toBe("true");
    expect(expanded()[0]).toBe("false");
    await user.keyboard(" ");
    expect(expanded()[1]).toBe("false");
  });

  it("collapsed answers are hidden from assistive technology (visibility: hidden)", () => {
    render(<FaqAccordion items={faqItems(locale)} />);
    const panels = document.querySelectorAll("[data-faq-panel]");
    expect(panels[0]?.className).toContain("visible");
    expect(panels[1]?.className).toContain("invisible");
  });

  it("section intro: h2 heading and description, verbatim", () => {
    const f = MESSAGES[locale].landing.faq;
    render(
      <LandingFaq
        copy={{ heading: f.heading, description: f.description, items: faqItems(locale) }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(f.heading);
    expect(screen.getByText(f.description)).toBeTruthy();
  });
});

describe.each(["ar", "en"] as const)("Pricing, development only (%s)", (locale) => {
  it("three Figma plans in reading order: Starter, Plus (Featured, badge), Pro", () => {
    const copy = pricingCopy(locale);
    const { container } = inLocale(locale, <LandingPricing copy={copy} />);
    const cards = [...container.querySelectorAll("[data-plan]")];
    expect(cards.map((card) => card.getAttribute("data-plan"))).toEqual([
      "standard",
      "featured",
      "secondary",
    ]);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(
      copy.plans.map((plan) => plan.name),
    );
    expect(container.querySelectorAll("[data-plan-badge]")).toHaveLength(1);
    expect(cards[1]?.querySelector("[data-plan-badge]")?.textContent).toBe(copy.badge);
  });

  it("placeholder content only: price '—', the 'to be decided' notes; no figures or periods", () => {
    const copy = pricingCopy(locale);
    const { container } = inLocale(locale, <LandingPricing copy={copy} />);
    expect(copy.price).toBe("—");
    for (const card of container.querySelectorAll("[data-plan]")) {
      expect(within(card as HTMLElement).getByText(copy.price)).toBeTruthy();
      expect(within(card as HTMLElement).getAllByText(copy.feature)).toHaveLength(4);
      // No digits anywhere in a card (no price, limit or period).
      expect(card.textContent).not.toMatch(/[0-9٠-٩]/);
    }
  });

  it("actions go to Register with no plan parameter and no checkout", () => {
    const { container } = inLocale(locale, <LandingPricing copy={pricingCopy(locale)} />);
    const links = [...container.querySelectorAll("a[data-plan-cta]")];
    expect(links).toHaveLength(3);
    const register = locale === "ar" ? "/register" : "/en/register";
    for (const link of links) expect(link.getAttribute("href")).toBe(register);
  });

  it("production gate (P07-D4): never visible in production; not in the navigation", () => {
    expect(isPlaceholderPricingVisible("production")).toBe(false);
    expect(LANDING_ANCHORS.map((anchor) => anchor.href)).not.toContain("#pricing");
  });
});

describe.each(["ar", "en"] as const)("Final CTA (%s)", (locale) => {
  it("verbatim copy; primary first → Register, outline → #features", () => {
    const c = MESSAGES[locale].landing.cta;
    inLocale(locale, <LandingFinalCta copy={c} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(c.heading);
    expect(screen.getByText(c.description)).toBeTruthy();
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([c.primary, c.secondary]);
    expect(links[0]?.getAttribute("href")).toBe(locale === "ar" ? "/register" : "/en/register");
    expect(links[1]?.getAttribute("href")).toBe("#features");
  });

  it("the glow is a decorative gradient layer (no blur filter)", () => {
    const { container } = inLocale(locale, <LandingFinalCta copy={MESSAGES[locale].landing.cta} />);
    const glow = container.querySelector<HTMLElement>("[data-cta-glow]");
    expect(glow?.getAttribute("aria-hidden")).toBe("true");
    expect(glow?.style.backgroundImage).toContain("radial-gradient");
    expect(glow?.className).not.toMatch(/blur/);
  });
});

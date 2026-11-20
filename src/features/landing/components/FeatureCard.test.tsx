// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import { FeatureCard, type FeatureCardProps } from "./FeatureCard";

/*
 * Feature Card units — contract docs/phases/phase-07-mariam-contract.md §4.1 and §5.
 * Props come from the real landing catalogs (the component holds no copy); image paths and alt
 * texts are test fixtures. jsdom applies no Tailwind CSS, so styles are checked as class names;
 * geometry and contrast are checked in Chromium at integration. axe's color-contrast rule is off
 * in jsdom.
 */

type Locale = "ar" | "en";

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const ARABIC = /[؀-ۿ]/;

afterEach(cleanup);

function propsFor(locale: Locale): FeatureCardProps {
  const item = MESSAGES[locale].landing.features.items["1"];
  return {
    title: item.title,
    text: item.text,
    visual: { src: "/landing/feature-1.webp", alt: `${locale} visual alt` },
  };
}

/** Renders the card as the section does: inside an `h2` context and a list item. */
function inLocale(locale: Locale, ui: ReactNode) {
  return render(
    <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <h2>Section</h2>
      <ul>
        <li>{ui}</li>
      </ul>
    </div>,
  );
}

function classesOf(element: Element | null | undefined): string[] {
  return (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function card(container: HTMLElement): HTMLElement {
  const element = container.querySelector('[data-landing-card="feature"]');
  if (!(element instanceof HTMLElement)) throw new Error("no card");
  return element;
}

describe("FeatureCard", () => {
  it("renders visual, title and description in Figma order", () => {
    const props = propsFor("ar");
    const { container } = inLocale("ar", <FeatureCard {...props} />);
    const children = Array.from(card(container).children);
    expect(children).toHaveLength(3);
    expect(children[0]?.querySelector("img")).not.toBeNull();
    expect(children[1]?.tagName).toBe("H3");
    expect(children[1]?.textContent).toBe(props.title);
    expect(children[2]?.tagName).toBe("P");
  });

  it("the title is an h3", () => {
    const props = propsFor("ar");
    inLocale("ar", <FeatureCard {...props} />);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(props.title);
  });

  it('keeps "\\n" in the description and renders it with white-space: pre-line', () => {
    const props = propsFor("ar");
    expect(props.text).toContain("\n");
    const { container } = inLocale("ar", <FeatureCard {...props} />);
    const text = card(container).querySelector("p");
    expect(text?.textContent).toBe(props.text);
    expect(classesOf(text)).toContain("whitespace-pre-line");
  });

  it("renders the image with the given alt, filling a radius-12 Obsidian box", () => {
    const props = propsFor("en");
    inLocale("en", <FeatureCard {...props} />);
    const img = screen.getByRole("img", { name: "en visual alt" });
    expect(classesOf(img)).toContain("object-cover");
    expect(img.getAttribute("sizes")).toContain("336px");
    expect(classesOf(img.parentElement)).toEqual(
      expect.arrayContaining(["relative", "h-[144px]", "rounded-md", "bg-surface-obsidian"]),
    );
  });

  it("supports a decorative image (empty alt)", () => {
    const props = { ...propsFor("ar"), visual: { src: "/landing/feature-1.webp", alt: "" } };
    const { container } = inLocale("ar", <FeatureCard {...props} />);
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("uses the specified tokens and responsive type styles", () => {
    const { container } = inLocale("ar", <FeatureCard {...propsFor("ar")} />);
    const root = card(container);
    expect(classesOf(root)).toEqual(
      expect.arrayContaining([
        "bg-surface-ink",
        "border",
        "border-[#363739]",
        "rounded-lg",
        "gap-[12px]",
        "min-h-[286px]",
        "rail:min-h-[288px]",
        "xl:min-h-[300px]",
      ]),
    );
    expect(classesOf(root.querySelector("h3"))).toEqual(
      expect.arrayContaining([
        "text-landing-card-title",
        "text-text-primary",
        "text-start",
        "text-balance",
      ]),
    );
    expect(classesOf(root.querySelector("p"))).toEqual(
      expect.arrayContaining([
        "text-text-secondary",
        "text-landing-body-feature-mobile",
        "text-pretty",
        "rail:text-landing-body-feature-tablet",
        "xl:text-landing-body-feature-desktop",
      ]),
    );
  });

  it("uses no physical left/right utilities", () => {
    const { container } = inLocale("ar", <FeatureCard {...propsFor("ar")} />);
    const all = Array.from(container.querySelectorAll("[class]")).flatMap((e) => classesOf(e));
    expect(all.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
  });

  it("holds no copy: English props render no Arabic", () => {
    const { container } = inLocale("en", <FeatureCard {...propsFor("en")} />);
    expect(container.textContent).not.toMatch(ARABIC);
    expect(container.querySelector("img")?.getAttribute("alt")).not.toMatch(ARABIC);
  });

  it.each(["ar", "en"] as const)("has no axe violations (%s)", async (locale) => {
    const { container } = inLocale(locale, <FeatureCard {...propsFor(locale)} />);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

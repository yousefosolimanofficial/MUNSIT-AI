// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import { FeaturesSection, type FeaturesSectionProps } from "./FeaturesSection";

/*
 * Features section units — contract docs/phases/phase-07-mariam-contract.md §4.3 and §5.
 * Props come from the real landing catalogs (the section holds no copy); image paths and alt
 * texts are test fixtures. jsdom applies no Tailwind CSS, so layout is checked as class names;
 * geometry at 1440 / 768 / 390 / 320 is checked in Chromium at integration. axe's color-contrast
 * rule is off in jsdom.
 */

type Locale = "ar" | "en";

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const ARABIC = /[؀-ۿ]/;
const KEYS = ["1", "2", "3", "4", "5", "6"] as const;

afterEach(cleanup);

function propsFor(locale: Locale): FeaturesSectionProps {
  const { features } = MESSAGES[locale].landing;
  return {
    heading: features.heading,
    description: features.description,
    items: KEYS.map((key) => ({
      title: features.items[key].title,
      text: features.items[key].text,
      visual: { src: `/landing/feature-${key}.webp`, alt: `${locale} feature ${key}` },
    })),
  };
}

function renderIn(locale: Locale, props = propsFor(locale)) {
  return render(
    <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <FeaturesSection {...props} />
    </div>,
  );
}

function classesOf(element: Element | null | undefined): string[] {
  return (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

describe("FeaturesSection", () => {
  it("renders the heading as the only h2 and the six card titles as h3, in order", () => {
    const props = propsFor("ar");
    renderIn("ar", props);
    const h2s = screen.getAllByRole("heading", { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual([props.heading]);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(
      props.items.map((i) => i.title),
    );
  });

  it("the cards are a list of six items, each with its own text and image, in order", () => {
    const props = propsFor("ar");
    renderIn("ar", props);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(6);
    items.forEach((li, index) => {
      const item = props.items[index];
      expect(within(li).getByRole("heading", { level: 3 }).textContent).toBe(item?.title);
      expect(li.querySelector("p")?.textContent).toBe(item?.text);
      expect(within(li).getByRole("img").getAttribute("alt")).toBe(item?.visual.alt);
    });
  });

  it('keeps "\\n" in the description (white-space: pre-line)', () => {
    const props = propsFor("ar");
    expect(props.description).toContain("\n");
    const { container } = renderIn("ar", props);
    const description = container.querySelector("h2 + p");
    expect(description?.textContent).toBe(props.description);
    expect(classesOf(description)).toContain("whitespace-pre-line");
  });

  it("sets no id and is not a section element (the page owns #features)", () => {
    const { container } = renderIn("ar");
    expect(container.querySelector("[id]")).toBeNull();
    expect(container.querySelector("section")).toBeNull();
  });

  it("lays out 1 / 2 / 3 columns with the specified gaps and paddings", () => {
    const { container } = renderIn("ar");
    const root = container.firstElementChild?.firstElementChild;
    expect(classesOf(root)).toEqual(
      expect.arrayContaining([
        "max-w-[1200px]",
        "px-[20px]",
        "py-[48px]",
        "gap-[28px]",
        "rail:px-[32px]",
        "rail:py-[64px]",
        "rail:gap-[32px]",
        "xl:px-0",
        "xl:gap-[40px]",
      ]),
    );
    expect(classesOf(screen.getByRole("list"))).toEqual(
      expect.arrayContaining([
        "grid-cols-1",
        "gap-[16px]",
        "rail:grid-cols-2",
        "rail:gap-[20px]",
        "xl:grid-cols-3",
        "xl:gap-[24px]",
      ]),
    );
  });

  it("uses the responsive intro type styles, white and centred", () => {
    const { container } = renderIn("ar");
    const intro = container.querySelector("h2")?.parentElement;
    expect(classesOf(intro)).toEqual(
      expect.arrayContaining([
        "text-center",
        "text-text-primary",
        "gap-[16px]",
        "rail:max-w-[704px]",
        "xl:max-w-[900px]",
      ]),
    );
    expect(classesOf(container.querySelector("h2"))).toEqual([
      "text-landing-heading-section-mobile",
      "text-balance",
      "rail:text-landing-heading-section-tablet",
      "xl:text-landing-heading-section-desktop",
    ]);
    expect(classesOf(container.querySelector("h2 + p"))).toEqual(
      expect.arrayContaining([
        "text-landing-body-base-mobile",
        "rail:text-landing-body-large",
        "xl:text-landing-body-intro",
        "text-pretty",
        "xl:text-balance",
      ]),
    );
  });

  it("holds no copy: English props render no Arabic", () => {
    const { container } = renderIn("en");
    expect(container.textContent).not.toMatch(ARABIC);
    container.querySelectorAll("img").forEach((img) => {
      expect(img.getAttribute("alt")).not.toMatch(ARABIC);
    });
  });

  it.each(["ar", "en"] as const)("has no axe violations (%s)", async (locale) => {
    const { container } = renderIn(locale);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import { StepCard, type StepCardProps } from "./StepCard";

/*
 * Step Card units — contract docs/phases/phase-07-mariam-contract.md §4.2 and §5.
 * Props come from the real landing catalogs (the component holds no copy); image paths and alt
 * texts are test fixtures. jsdom applies no Tailwind CSS, so styles are checked as class names;
 * geometry and contrast are checked in Chromium at integration. axe's color-contrast rule is off
 * in jsdom.
 */

type Locale = "ar" | "en";

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const ARABIC = /[؀-ۿ]/;

afterEach(cleanup);

function propsFor(locale: Locale, showConnector?: boolean): StepCardProps {
  const step = MESSAGES[locale].landing.howItWorks.steps["1"];
  return {
    number: step.number,
    title: step.title,
    text: step.text,
    visual: { src: "/landing/step-1.webp", alt: `${locale} step alt` },
    ...(showConnector === undefined ? {} : { showConnector }),
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
  const element = container.querySelector('[data-landing-card="step"]');
  if (!(element instanceof HTMLElement)) throw new Error("no card");
  return element;
}

describe("StepCard", () => {
  it("renders number row, visual, title and description in Figma order", () => {
    const props = propsFor("ar");
    const { container } = inLocale("ar", <StepCard {...props} />);
    const children = Array.from(card(container).children);
    expect(children).toHaveLength(4);
    expect(children[0]?.textContent).toBe(props.number);
    expect(children[1]?.querySelector("img")).not.toBeNull();
    expect(children[2]?.tagName).toBe("H3");
    expect(children[2]?.textContent).toBe(props.title);
    expect(children[3]?.tagName).toBe("P");
    expect(children[3]?.textContent).toBe(props.text);
  });

  it("the title is an h3", () => {
    const props = propsFor("ar");
    inLocale("ar", <StepCard {...props} />);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(props.title);
  });

  it("the number is an isolated LTR run in Geist Mono, Electric Sky, at the row start", () => {
    const { container } = inLocale("ar", <StepCard {...propsFor("ar")} />);
    const row = card(container).firstElementChild;
    const number = row?.firstElementChild;
    expect(number?.textContent).toBe("01");
    expect(classesOf(number)).toEqual(
      expect.arrayContaining(["font-mono", "text-landing-mono-step", "text-accent-electric-sky"]),
    );
    expect(number?.querySelector("bdi")?.getAttribute("dir")).toBe("ltr");
    expect(classesOf(row)).toEqual(expect.arrayContaining(["h-[14px]", "gap-[8px]", "w-full"]));
  });

  it("shows the connector line and dot by default, decorative, after the number", () => {
    const { container } = inLocale("ar", <StepCard {...propsFor("ar")} />);
    const row = card(container).firstElementChild;
    const parts = Array.from(row?.children ?? []);
    expect(parts.map((p) => p.getAttribute("data-step-connector"))).toEqual([null, "line", "dot"]);
    const [, line, dot] = parts;
    expect(line?.getAttribute("aria-hidden")).toBe("true");
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
    expect(classesOf(line)).toEqual(
      expect.arrayContaining(["h-px", "flex-1", "bg-accent-info-blue"]),
    );
    expect(classesOf(dot)).toEqual(
      expect.arrayContaining(["size-[6px]", "rounded-full", "bg-accent-info-blue"]),
    );
  });

  it("showConnector={true} matches the default", () => {
    const { container } = inLocale("ar", <StepCard {...propsFor("ar", true)} />);
    expect(container.querySelectorAll("[data-step-connector]")).toHaveLength(2);
  });

  it("hides the connector line and dot when showConnector is false", () => {
    const { container } = inLocale("ar", <StepCard {...propsFor("ar", false)} />);
    expect(container.querySelectorAll("[data-step-connector]")).toHaveLength(0);
    expect(card(container).firstElementChild?.children).toHaveLength(1);
    expect(card(container).firstElementChild?.textContent).toBe("01");
  });

  it("renders the image with the given alt, filling a radius-12 Obsidian box", () => {
    inLocale("en", <StepCard {...propsFor("en")} />);
    const img = screen.getByRole("img", { name: "en step alt" });
    expect(classesOf(img)).toContain("object-cover");
    expect(img.getAttribute("sizes")).toContain("240px");
    expect(classesOf(img.parentElement)).toEqual(
      expect.arrayContaining(["relative", "h-[136px]", "rounded-md", "bg-surface-obsidian"]),
    );
  });

  it("uses the specified tokens and responsive type styles", () => {
    const { container } = inLocale("ar", <StepCard {...propsFor("ar")} />);
    const root = card(container);
    expect(classesOf(root)).toEqual(
      expect.arrayContaining([
        "bg-surface-ink",
        "border",
        "border-neutral-slate",
        "rounded-lg",
        "p-[20px]",
        "gap-[12px]",
        "min-h-[300px]",
        "rail:min-h-[302px]",
        "xl:min-h-[440px]",
      ]),
    );
    expect(classesOf(root.querySelector("h3"))).toEqual(
      expect.arrayContaining(["text-landing-card-title", "text-text-primary", "text-balance"]),
    );
    expect(classesOf(root.querySelector("p"))).toEqual(
      expect.arrayContaining([
        "text-text-secondary",
        "text-landing-body-base-mobile",
        "text-pretty",
        "rail:text-landing-body-base",
        "xl:text-landing-body-large",
      ]),
    );
  });

  it("uses no physical left/right utilities", () => {
    const { container } = inLocale("ar", <StepCard {...propsFor("ar")} />);
    const all = Array.from(container.querySelectorAll("[class]")).flatMap((e) => classesOf(e));
    expect(all.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
  });

  it("holds no copy: English props render no Arabic", () => {
    const { container } = inLocale("en", <StepCard {...propsFor("en")} />);
    expect(container.textContent).not.toMatch(ARABIC);
  });

  it.each(["ar", "en"] as const)("has no axe violations (%s)", async (locale) => {
    const { container } = inLocale(
      locale,
      <>
        <StepCard {...propsFor(locale)} />
        <StepCard {...propsFor(locale, false)} />
      </>,
    );
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

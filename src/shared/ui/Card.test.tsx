// @vitest-environment jsdom
import { createRef } from "react";

import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";

import { Card } from "./Card";

/*
 * Card tests — contract docs/phases/phase-03-card-contract.md §11.
 * jsdom applies no Tailwind CSS: styles are checked as class names; computed values and rendered
 * contrast are checked in Chromium at gallery integration. axe's color-contrast rule is off in
 * jsdom.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

afterEach(cleanup);

function classesOf(element: Element | null): string[] {
  return (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function root(container: HTMLElement): HTMLElement {
  const element = container.firstElementChild;
  if (!(element instanceof HTMLElement)) throw new Error("no root");
  return element;
}

describe("Card — elements (§11.1, D-C5)", () => {
  it("renders a div by default", () => {
    const { container } = render(<Card>x</Card>);
    expect(root(container).tagName).toBe("DIV");
  });

  it.each(["section", "article"] as const)("as=%s renders that element", (as) => {
    const { container } = render(<Card as={as}>x</Card>);
    expect(root(container).tagName).toBe(as.toUpperCase());
  });

  it("as=li renders an li inside a ul", () => {
    const { container } = render(
      <ul>
        <Card as="li">x</Card>
      </ul>,
    );
    expect(container.querySelector("ul > li")).not.toBeNull();
  });
});

describe("Card — variants (§11.2, §11.3)", () => {
  it("surface is the default: Obsidian 88%, Sky 14% border, radius 20, padding lg", () => {
    const { container } = render(<Card>x</Card>);
    expect(classesOf(root(container))).toEqual(
      expect.arrayContaining([
        "bg-surface-obsidian/88",
        "border",
        "border-accent-electric-sky/14",
        "rounded-xl",
        "p-lg",
      ]),
    );
  });

  it('padding="md" gives p-md and not p-lg', () => {
    const { container } = render(<Card padding="md">x</Card>);
    const classes = classesOf(root(container));
    expect(classes).toContain("p-md");
    expect(classes).not.toContain("p-lg");
  });

  it("inset: White 3%, Sky 12% border, radius 14, padding 12 / 16", () => {
    const { container } = render(<Card variant="inset">x</Card>);
    const classes = classesOf(root(container));
    expect(classes).toEqual(
      expect.arrayContaining([
        "bg-text-primary/3",
        "border",
        "border-accent-electric-sky/12",
        "rounded-[14px]",
        "py-sm",
        "px-md",
      ]),
    );
    expect(classes.filter((c) => /^(bg-surface|rounded-xl|p-(lg|md)$)/.test(c))).toEqual([]);
  });
});

describe("Card — static and direction-neutral (§11.4)", () => {
  it.each([
    ["surface lg", <Card key="a">x</Card>],
    [
      "surface md",
      <Card key="b" padding="md">
        x
      </Card>,
    ],
    [
      "inset",
      <Card key="c" variant="inset">
        x
      </Card>,
    ],
  ])("%s: no hex, left/right, interaction, shadow, motion or transform classes", (_, card) => {
    const { container } = render(card);
    const classes = classesOf(root(container));
    expect(classes.filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
    expect(classes.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
    expect(classes.filter((c) => /(hover|focus|active):/.test(c))).toEqual([]);
    expect(
      classes.filter((c) => /shadow|transition|animate|transform|scale|rotate|translate/.test(c)),
    ).toEqual([]);
    expect(classes.filter((c) => /^(flex|grid|gap-)/.test(c))).toEqual([]); // no internal layout
  });
});

describe("Card — pass-through (§11.5, §11.6)", () => {
  it("native attributes and children pass through; no role or tabindex", () => {
    const { container } = render(
      <Card as="section" id="activity" aria-labelledby="activity-title" data-testid="card">
        <h2 id="activity-title">النشاط</h2>
      </Card>,
    );
    const el = root(container);
    expect(el.id).toBe("activity");
    expect(el.getAttribute("aria-labelledby")).toBe("activity-title");
    expect(el.dataset["testid"]).toBe("card");
    expect(el.querySelector("h2")?.textContent).toBe("النشاط");
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.hasAttribute("tabindex")).toBe(false);
  });

  it("li value and ref reach the element", () => {
    const ref = createRef<HTMLLIElement>();
    const { container } = render(
      <ul>
        <Card as="li" value={2} ref={ref}>
          x
        </Card>
      </ul>,
    );
    const li = container.querySelector("li");
    expect(ref.current).toBeInstanceOf(HTMLLIElement);
    expect(ref.current).toBe(li);
    expect(li?.getAttribute("value")).toBe("2");
  });

  it("a div ref reaches the default element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Card ref={ref}>x</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(root(container));
  });

  it("className is merged last", () => {
    const { container } = render(
      <Card variant="inset" className="flex gap-md">
        x
      </Card>,
    );
    expect(classesOf(root(container)).slice(-2)).toEqual(["flex", "gap-md"]);
  });
});

describe("Card — compile-time API (§11.7, §9)", () => {
  it("accepts the contract and rejects everything else (checked by pnpm typecheck)", () => {
    const divRef = createRef<HTMLDivElement>();
    const elementRef = createRef<HTMLElement>();
    const liRef = createRef<HTMLLIElement>();
    const svgRef = createRef<SVGSVGElement>();
    const callbackRef = (node: HTMLDivElement | null) => void node;

    const accepted = [
      <Card key="a1" ref={divRef} />,
      <Card key="a2" as="section" ref={elementRef} aria-label="نشاط" />,
      <Card key="a3" as="article" ref={elementRef} />, // no HTMLArticleElement exists (§9)
      <ul key="a4">
        <Card as="li" value={2} ref={liRef} />
      </ul>,
      <Card key="a5" ref={callbackRef} />,
      <Card key="a6" id="x" aria-describedby="y" data-state="z" />,
      <Card key="a7" variant="inset" className="flex gap-md" />,
      <Card key="a8" padding="md" />,
    ];

    const rejected = [
      // @ts-expect-error — no event handlers (D-C4)
      <Card key="r1" onClick={() => {}} />,
      // @ts-expect-error — no event handlers (D-C4)
      <Card key="r2" as="section" onKeyDown={() => {}} />,
      // @ts-expect-error — no event handlers (D-C4)
      <Card key="r3" as="article" onPointerDown={() => {}} />,
      // @ts-expect-error — the component owns its (absent) role
      <Card key="r4" role="button" />,
      // @ts-expect-error — never focusable
      <Card key="r5" tabIndex={0} />,
      // @ts-expect-error — content comes only from children
      <Card key="r6" dangerouslySetInnerHTML={{ __html: "x" }} />,
      // @ts-expect-error — only div, section, article, li
      <Card key="r7" as="button" />,
      // @ts-expect-error — only div, section, article, li
      <Card key="r8" as="a" />,
      // @ts-expect-error — value exists on li, not div
      <Card key="r9" value={2} />,
      // @ts-expect-error — inset has fixed padding
      <Card key="r10" variant="inset" padding="md" />,
      // @ts-expect-error — only lg and md
      <Card key="r11" padding="sm" />,
      // @ts-expect-error — an li ref on a div
      <Card key="r12" ref={liRef} />,
      // @ts-expect-error — a div ref on an li
      <Card key="r13" as="li" ref={divRef} />,
      // @ts-expect-error — a non-HTML ref on article
      <Card key="r14" as="article" ref={svgRef} />,
      // @ts-expect-error — a non-HTML ref on section
      <Card key="r15" as="section" ref={svgRef} />,
      // @ts-expect-error — never focusable (D-C4)
      <Card key="r16" autoFocus />,
      // @ts-expect-error — no access key (D-C4)
      <Card key="r17" accessKey="c" />,
      // @ts-expect-error — not editable (D-C4)
      <Card key="r18" contentEditable />,
      // @ts-expect-error — not draggable (D-C4)
      <Card key="r19" draggable />,
      // @ts-expect-error — unknown variant
      <Card key="r20" variant="raised" />,
    ];

    expect(accepted).toHaveLength(8);
    expect(rejected).toHaveLength(20);
  });
});

describe("Card — axe (§11.8)", () => {
  it.each([
    ["surface", "rtl"],
    ["surface", "ltr"],
    ["inset", "rtl"],
    ["inset", "ltr"],
  ] as const)("%s in %s has no violations", async (variant, dir) => {
    const { container } = render(
      <div dir={dir} lang={dir === "rtl" ? "ar" : "en"}>
        <Card as="section" variant={variant} aria-labelledby="t">
          <h2 id="t">{dir === "rtl" ? "النشاط الأخير" : "Recent activity"}</h2>
          <p>{dir === "rtl" ? "محتوى" : "Content"}</p>
        </Card>
      </div>,
    );
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

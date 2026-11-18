// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "@/shared/ui/Button";

import { EmptyState, type EmptyStateVariant } from "./EmptyState";

/*
 * EmptyState tests — assignment docs/phases/phase-06-empty-state-starter.md §7.
 * jsdom applies no Tailwind CSS: styles are checked as class names; computed values and rendered
 * contrast are checked in Chromium at gallery integration. axe's color-contrast rule is off in
 * jsdom. The texts below are test fixtures, not module copy.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

const TITLE = "لا توجد عناصر بعد";
const DESCRIPTION = "ستظهر العناصر هنا عند إضافتها.";
const FOOTNOTE = "يمكنك البدء في أي وقت.";

afterEach(cleanup);

function classesOf(element: Element | null | undefined): string[] {
  return (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function root(container: HTMLElement): HTMLElement {
  const element = container.firstElementChild;
  if (!(element instanceof HTMLElement)) throw new Error("no root");
  return element;
}

function tile(container: HTMLElement): HTMLElement {
  const element = root(container).firstElementChild;
  if (!(element instanceof HTMLElement)) throw new Error("no tile");
  return element;
}

function svg(container: HTMLElement): SVGSVGElement {
  const element = container.querySelector("svg");
  if (!element) throw new Error("no svg");
  return element;
}

/** The title heading (h2 or h3). */
function heading(container: HTMLElement): HTMLElement {
  const element = container.querySelector("h2, h3");
  if (!(element instanceof HTMLElement)) throw new Error("no heading");
  return element;
}

function full(variant?: EmptyStateVariant) {
  return (
    <EmptyState
      {...(variant ? { variant } : {})}
      icon="note"
      title={TITLE}
      description={DESCRIPTION}
      actions={
        <>
          <Button>الأول</Button>
          <Button variant="secondary">الثاني</Button>
        </>
      }
      footnote={FOOTNOTE}
    />
  );
}

const DEFAULT_ONLY = [
  "py-[56px]",
  "px-[40px]",
  "rounded-2xl",
  "border-accent-electric-sky/12",
  "size-[64px]",
  "rounded-[18px]",
  "border-accent-electric-sky/25",
];
const COMPACT_ONLY = [
  "py-[48px]",
  "px-xl",
  "border-accent-electric-sky/14",
  "size-[72px]",
  "border-accent-electric-sky/40",
];

/** Every class on the root and all its descendants. */
function allClasses(container: HTMLElement): string[] {
  return [root(container), ...root(container).querySelectorAll("*")].flatMap(classesOf);
}

describe("EmptyState — default variant (§7.1)", () => {
  it("is the default: box, surface, tile and text classes match §5", () => {
    const { container } = render(full());
    expect(classesOf(root(container))).toEqual(
      expect.arrayContaining([
        "flex",
        "w-full",
        "flex-col",
        "items-center",
        "gap-md",
        "py-[56px]",
        "px-[40px]",
        "rounded-2xl",
        "bg-surface-obsidian/88",
        "border",
        "border-accent-electric-sky/12",
      ]),
    );
    expect(classesOf(tile(container))).toEqual(
      expect.arrayContaining([
        "size-[64px]",
        "rounded-[18px]",
        "bg-accent-electric-sky/12",
        "border",
        "border-accent-electric-sky/25",
        "text-accent-electric-sky",
      ]),
    );
  });

  it('variant="default" renders the same classes as no variant', () => {
    const implicit = render(full()).container.innerHTML;
    cleanup();
    expect(render(full("default")).container.innerHTML).toBe(implicit);
  });

  it("does not carry compact-only values", () => {
    const { container } = render(full());
    expect(allClasses(container).filter((c) => COMPACT_ONLY.includes(c))).toEqual([]);
    expect(classesOf(tile(container))).not.toContain("rounded-xl");
  });
});

describe("EmptyState — compact variant (§7.2)", () => {
  it("box, surface and tile classes match §5", () => {
    const { container } = render(full("compact"));
    expect(classesOf(root(container))).toEqual(
      expect.arrayContaining([
        "flex",
        "w-full",
        "flex-col",
        "items-center",
        "gap-md",
        "py-[48px]",
        "px-xl",
        "rounded-xl",
        "bg-surface-obsidian/88",
        "border",
        "border-accent-electric-sky/14",
      ]),
    );
    expect(classesOf(tile(container))).toEqual(
      expect.arrayContaining([
        "size-[72px]",
        "rounded-xl",
        "bg-accent-electric-sky/12",
        "border",
        "border-accent-electric-sky/40",
        "text-accent-electric-sky",
      ]),
    );
  });

  it("does not carry default-only values", () => {
    const { container } = render(full("compact"));
    expect(allClasses(container).filter((c) => DEFAULT_ONLY.includes(c))).toEqual([]);
  });
});

describe.each([undefined, "compact"] as const)("EmptyState — text classes (%s)", (variant) => {
  it("title, description and footnote use the §5 type, color and centring", () => {
    const { container } = render(full(variant));
    const [, title, description, , footnote] = root(container).children;
    expect(classesOf(title)).toEqual(
      expect.arrayContaining(["text-dashboard-title-l", "text-text-primary", "text-center"]),
    );
    expect(classesOf(description)).toEqual(
      expect.arrayContaining(["text-dashboard-body", "text-text-secondary", "text-center"]),
    );
    expect(classesOf(footnote)).toEqual(
      expect.arrayContaining(["text-dashboard-caption", "text-text-secondary", "text-center"]),
    );
  });

  it("actions row: one row, centred, gap 12, wraps", () => {
    const { container } = render(full(variant));
    const actions = root(container).children[3];
    expect(classesOf(actions)).toEqual(
      expect.arrayContaining(["flex", "flex-wrap", "items-center", "justify-center", "gap-sm"]),
    );
    expect(classesOf(actions)).not.toContain("flex-col");
  });
});

describe("EmptyState — heading (§7.3)", () => {
  it("renders an h2 by default with the exact title", () => {
    const { container } = render(<EmptyState icon="note" title={TITLE} />);
    expect(heading(container).tagName).toBe("H2");
    expect(heading(container).textContent).toBe(TITLE);
    expect(container.querySelector("h3")).toBeNull();
  });

  it("renders an h3 with headingLevel={3}", () => {
    const { container } = render(<EmptyState icon="note" title={TITLE} headingLevel={3} />);
    expect(heading(container).tagName).toBe("H3");
    expect(heading(container).textContent).toBe(TITLE);
    expect(container.querySelector("h2")).toBeNull();
  });
});

describe("EmptyState — optional parts (§7.4)", () => {
  it("renders only the tile and the title when the optional parts are omitted", () => {
    const { container } = render(<EmptyState icon="note" title={TITLE} />);
    const children = [...root(container).children];
    expect(children.map((c) => c.tagName)).toEqual(["DIV", "H2"]);
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("empty strings render nothing for description and footnote", () => {
    const { container } = render(
      <EmptyState icon="note" title={TITLE} description="" footnote="" />,
    );
    expect(root(container).children).toHaveLength(2);
  });

  it("renders icon, title, description, actions, footnote in this order", () => {
    const { container } = render(full());
    const [iconTile, title, description, actions, footnote, extra] = root(container).children;
    expect(iconTile?.querySelector("svg")).not.toBeNull();
    expect(title?.textContent).toBe(TITLE);
    expect(description?.tagName).toBe("P");
    expect(description?.textContent).toBe(DESCRIPTION);
    expect(actions?.querySelectorAll("button")).toHaveLength(2);
    expect(footnote?.tagName).toBe("P");
    expect(footnote?.textContent).toBe(FOOTNOTE);
    expect(extra).toBeUndefined();
  });

  it("each optional part renders on its own, in place", () => {
    const withDescription = render(
      <EmptyState icon="note" title={TITLE} description={DESCRIPTION} />,
    );
    expect([...root(withDescription.container).children].map((c) => c.textContent)).toEqual([
      "",
      TITLE,
      DESCRIPTION,
    ]);
    cleanup();

    const withFootnote = render(<EmptyState icon="note" title={TITLE} footnote={FOOTNOTE} />);
    expect([...root(withFootnote.container).children].map((c) => c.textContent)).toEqual([
      "",
      TITLE,
      FOOTNOTE,
    ]);
  });
});

describe("EmptyState — actions (§7.5)", () => {
  it.each([
    [0, undefined],
    [1, <Button key="a">الأول</Button>],
    [
      2,
      <>
        <Button>الأول</Button>
        <Button variant="secondary">الثاني</Button>
      </>,
    ],
  ])("%i passed button(s) render in order inside the actions row", (count, actions) => {
    const { container } = render(<EmptyState icon="note" title={TITLE} actions={actions} />);
    const buttons = [...container.querySelectorAll("button")];
    expect(buttons).toHaveLength(count);
    expect(buttons.map((b) => b.textContent)).toEqual(["الأول", "الثاني"].slice(0, count));
    const row = root(container).children[2];
    for (const button of buttons) expect(button.parentElement).toBe(row);
  });
});

describe("EmptyState — icon (§7.6)", () => {
  it.each([
    [undefined, 28],
    ["default", 28],
    ["compact", 32],
  ] as const)("variant=%s: data-icon, size %i, aria-hidden", (variant, size) => {
    const { container } = render(
      <EmptyState {...(variant ? { variant } : {})} icon="folder" title={TITLE} />,
    );
    const icon = svg(container);
    expect(icon.dataset["icon"]).toBe("folder");
    expect(icon.getAttribute("width")).toBe(String(size));
    expect(icon.getAttribute("height")).toBe(String(size));
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.hasAttribute("role")).toBe(false);
    expect(icon.hasAttribute("aria-label")).toBe(false);
  });
});

describe("EmptyState — compile-time API (§7.7)", () => {
  it("rejects an unknown variant, a missing title, children, className and an unknown icon", () => {
    const rejected = [
      // @ts-expect-error — unknown variant
      <EmptyState key="1" variant="large" icon="note" title={TITLE} />,
      // @ts-expect-error — title is required
      <EmptyState key="2" icon="note" />,
      // @ts-expect-error — no children
      <EmptyState key="3" icon="note" title={TITLE}>
        x
      </EmptyState>,
      // @ts-expect-error — no className
      <EmptyState key="4" icon="note" title={TITLE} className="mt-md" />,
      // @ts-expect-error — unknown icon
      <EmptyState key="5" icon="not-an-icon" title={TITLE} />,
    ];
    expect(rejected).toHaveLength(5);
  });
});

describe("EmptyState — hygiene (§7.8)", () => {
  it.each([undefined, "compact"] as const)(
    "%s: no hover/pressed state, transform, motion, hex or physical left/right class",
    (variant) => {
      // The passed Buttons own their own states; only the component's elements are checked.
      const { container } = render(
        <EmptyState
          {...(variant ? { variant } : {})}
          icon="note"
          title={TITLE}
          description={DESCRIPTION}
          actions={<span>action</span>}
          footnote={FOOTNOTE}
        />,
      );
      const classes = allClasses(container);
      expect(classes.filter((c) => /(hover|active|focus|pressed):/.test(c))).toEqual([]);
      expect(
        classes.filter((c) => /transform|scale|rotate|translate|transition|animate/.test(c)),
      ).toEqual([]);
      expect(classes.filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
      expect(classes.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
      expect(classes.filter((c) => /(^|:)(text-left|text-right|float-)/.test(c))).toEqual([]);
    },
  );

  it("the box has no role, tabindex or dir and is not focusable", () => {
    const { container } = render(full());
    const box = root(container);
    expect(box.hasAttribute("role")).toBe(false);
    expect(box.hasAttribute("tabindex")).toBe(false);
    expect(box.hasAttribute("dir")).toBe(false);
  });
});

describe("EmptyState — accessibility (§7.9)", () => {
  it.each([
    ["ar", "rtl", undefined],
    ["ar", "rtl", "compact"],
    ["en", "ltr", undefined],
    ["en", "ltr", "compact"],
  ] as const)("lang=%s dir=%s variant=%s: no axe violations", async (lang, dir, variant) => {
    const { container } = render(
      <div lang={lang} dir={dir}>
        {full(variant)}
      </div>,
    );
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

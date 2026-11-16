// @vitest-environment jsdom
import { createRef } from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";

import { Avatar, avatarInitials } from "./Avatar";

/*
 * Avatar tests — contract docs/phases/phase-03-avatar-contract.md §8.
 * jsdom applies no Tailwind CSS: styles are checked as class names; rendered contrast across the
 * gradient is measured in Chromium (tests/e2e/dev-components-avatar.spec.ts). axe's
 * color-contrast rule is off in jsdom.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
/** Zero-width non-joiner, built at runtime so the source stays readable. */
const ZWNJ = String.fromCharCode(0x200c);
const NBSP = String.fromCharCode(0x00a0);
/** A valid 1×1 image (data URI) and a URL used only to fire `error` in the tests. */
const IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const OTHER_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

afterEach(cleanup);

function classesOf(element: Element | null): string[] {
  return (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function root(container: HTMLElement): HTMLElement {
  const element = container.firstElementChild;
  if (!(element instanceof HTMLElement)) throw new Error("no root");
  return element;
}

describe("Avatar — initials (D-AV3)", () => {
  it.each([
    ["أحمد محمود", 40, "أ"],
    ["أحمد محمود", 96, `أ${ZWNJ}م`],
    ["أحمد", 96, "أ"],
    ["sara ahmed", 40, "S"],
    ["sara ahmed", 96, `S${ZWNJ}A`],
    ["أَحمد محمود", 40, "أَ"],
    [`  أحمد   علي${NBSP}محمود  `, 96, `أ${ZWNJ}م`],
    ["(Sara) 2024 Ahmed", 96, `S${ZWNJ}A`],
    ["محمد ali", 96, `م${ZWNJ}A`],
    ["   ", 40, ""],
    ["2024 !!", 96, ""],
  ] as const)("%j at %i → %j", (name, size, expected) => {
    expect(avatarInitials(name, size)).toBe(expected);
  });

  it("renders the initials in a hidden dir=auto span", () => {
    const { container } = render(<Avatar name="أحمد محمود" size={96} />);
    const span = root(container).firstElementChild;
    expect(span?.textContent).toBe(`أ${ZWNJ}م`);
    expect(span?.getAttribute("dir")).toBe("auto");
    expect(span?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Avatar — image and fallbacks (D-AV4)", () => {
  it("renders the image covering the circle, decorative alt", () => {
    const { container } = render(<Avatar name="Sara Ahmed" src={IMAGE} />);
    const img = root(container).querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.getAttribute("decoding")).toBe("async");
    expect(img?.getAttribute("draggable")).toBe("false");
    expect(classesOf(img)).toEqual(["size-full", "object-cover"]);
    expect(screen.queryByText("S")).toBeNull();
  });

  it("falls back to the initials on error and retries a new src", () => {
    const { container, rerender } = render(<Avatar name="Sara Ahmed" src={IMAGE} />);
    const img = root(container).querySelector("img");
    if (!img) throw new Error("no img");
    fireEvent.error(img);
    expect(root(container).querySelector("img")).toBeNull();
    expect(root(container).textContent).toBe("S");
    rerender(<Avatar name="Sara Ahmed" src={OTHER_IMAGE} />);
    expect(root(container).querySelector("img")).not.toBeNull();
  });

  it("an image that already failed before hydration falls back on mount", () => {
    const proto = HTMLImageElement.prototype;
    const complete = Object.getOwnPropertyDescriptor(proto, "complete");
    const natural = Object.getOwnPropertyDescriptor(proto, "naturalWidth");
    Object.defineProperty(proto, "complete", { configurable: true, get: () => true });
    Object.defineProperty(proto, "naturalWidth", { configurable: true, get: () => 0 });
    try {
      const { container } = render(<Avatar name="Sara Ahmed" src={IMAGE} />);
      expect(root(container).querySelector("img")).toBeNull();
      expect(root(container).textContent).toBe("S");
    } finally {
      if (complete) Object.defineProperty(proto, "complete", complete);
      if (natural) Object.defineProperty(proto, "naturalWidth", natural);
    }
  });

  it("an empty src shows the initials", () => {
    const { container } = render(<Avatar name="Sara Ahmed" src="" />);
    expect(root(container).querySelector("img")).toBeNull();
    expect(root(container).textContent).toBe("S");
  });

  it.each([
    [40, 18],
    [96, 44],
  ] as const)("placeholder at %i: Graphite + user icon %i", (size, iconSize) => {
    const { container } = render(<Avatar decorative size={size} />);
    const el = root(container);
    expect(classesOf(el)).toEqual(
      expect.arrayContaining(["bg-color-surface-graphite", "text-text-secondary"]),
    );
    expect(classesOf(el).some((c) => c.startsWith("bg-[linear-gradient"))).toBe(false);
    const icon = el.querySelector('[data-icon="user"]');
    expect(icon?.getAttribute("width")).toBe(String(iconSize));
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("a broken image without a usable name falls back to the placeholder", () => {
    const { container } = render(<Avatar decorative src={IMAGE} />);
    const img = root(container).querySelector("img");
    if (!img) throw new Error("no img");
    fireEvent.error(img);
    expect(root(container).querySelector('[data-icon="user"]')).not.toBeNull();
  });
});

describe("Avatar — accessibility (D-AV5)", () => {
  it("meaningful: role img named by the trimmed name; content hidden", () => {
    render(<Avatar name="  أحمد محمود " src={IMAGE} />);
    const img = screen.getByRole("img", { name: "أحمد محمود" });
    expect(img.getAttribute("aria-hidden")).toBeNull();
    expect(img.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("decorative: hidden, no role, no label", () => {
    const { container } = render(<Avatar decorative name="أحمد محمود" />);
    const el = root(container);
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.hasAttribute("aria-label")).toBe(false);
    expect(el.textContent).toBe("أ"); // initials still drawn
  });

  it("a meaningful name without a letter renders decorative (never an empty label)", () => {
    const { container } = render(<Avatar name="   " />);
    const el = root(container);
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.hasAttribute("aria-label")).toBe(false);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("is never focusable", () => {
    const { container } = render(<Avatar name="Sara Ahmed" src={IMAGE} />);
    expect(container.querySelector("[tabindex]")).toBeNull();
  });
});

describe("Avatar — classes (§3)", () => {
  it("size 40 is the default: 40, 1px Sky 40%, Card Title, gradient", () => {
    const { container } = render(<Avatar name="أحمد محمود" />);
    const el = root(container);
    expect(classesOf(el)).toEqual(
      expect.arrayContaining([
        "inline-flex",
        "rounded-full",
        "overflow-hidden",
        "size-[40px]",
        "border",
        "border-accent-electric-sky/40",
        "bg-[linear-gradient(135deg,var(--color-accent-electric-sky)_-80%,var(--color-accent-cobalt-edge)_71%)]",
      ]),
    );
    expect(classesOf(el.firstElementChild)).toEqual([
      "text-dashboard-card-title",
      "text-text-primary",
    ]);
  });

  it("size 96: 96, 2px Sky 50%, Title L", () => {
    const { container } = render(<Avatar name="أحمد محمود" size={96} />);
    const el = root(container);
    expect(classesOf(el)).toEqual(
      expect.arrayContaining(["size-[96px]", "border-2", "border-accent-electric-sky/50"]),
    );
    expect(classesOf(el.firstElementChild)).toEqual([
      "text-dashboard-title-l",
      "text-text-primary",
    ]);
  });

  it("className is merged last; no hex, left/right, interaction or motion classes", () => {
    const { container } = render(<Avatar name="Sara" className="ms-sm" />);
    const el = root(container);
    expect(classesOf(el).at(-1)).toBe("ms-sm");
    const all = [el, ...el.querySelectorAll("*")].flatMap(classesOf);
    expect(all.filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
    expect(all.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
    expect(
      all.filter((c) => /(hover|focus|active):|transition|animate|shadow|scale/.test(c)),
    ).toEqual([]);
  });

  it("forwards ref to the root span", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<Avatar name="Sara" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(root(container));
  });
});

describe("Avatar — compile-time API (§8.7)", () => {
  it("accepts the contract and rejects everything else", () => {
    const samples = [
      <Avatar key="a" name="أحمد" />,
      <Avatar key="b" decorative />,
      <Avatar key="c" decorative name="أحمد" />,
      <Avatar key="d" name="أحمد" size={96} className="ms-sm" ref={createRef<HTMLSpanElement>()} />,
      // @ts-expect-error — a meaningful avatar needs a name
      <Avatar key="e" />,
      // @ts-expect-error — decorative={false} is meaningful: name required
      <Avatar key="f" decorative={false} />,
      // @ts-expect-error — only 40 and 96
      <Avatar key="g" name="x" size={32} />,
      // @ts-expect-error — not interactive
      <Avatar key="h" name="x" onClick={() => {}} />,
      // @ts-expect-error — the component owns its role
      <Avatar key="i" name="x" role="button" />,
      // @ts-expect-error — never focusable
      <Avatar key="j" name="x" tabIndex={0} />,
      // @ts-expect-error — the image is always decorative (alt="")
      <Avatar key="k" name="x" alt="x" />,
      // @ts-expect-error — no children
      <Avatar key="l" name="x">
        x
      </Avatar>,
      // @ts-expect-error — no variants
      <Avatar key="m" name="x" variant="x" />,
    ];
    expect(samples).toHaveLength(13);
  });
});

describe("Avatar — axe (§8.8)", () => {
  it.each(["rtl", "ltr"] as const)("all states have no violations (%s)", async (dir) => {
    const name = dir === "rtl" ? "أحمد محمود" : "Sara Ahmed";
    const { container } = render(
      <div dir={dir} lang={dir === "rtl" ? "ar" : "en"}>
        <Avatar name={name} />
        <Avatar name={name} size={96} />
        <Avatar name={name} src={IMAGE} />
        <Avatar decorative size={96} />
        <Avatar decorative name={name} />
      </div>,
    );
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

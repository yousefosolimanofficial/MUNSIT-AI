// @vitest-environment jsdom
import type { ReactNode } from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MobileNavItem } from "./MobileNavItem";

/*
 * Mobile Navigation Item — START_HERE.md §7 acceptance criteria.
 * jsdom applies no Tailwind CSS: styles are checked as class names; computed values and rendered
 * contrast are checked in Chromium by the BottomNav E2E after integration.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

const BOX_CLASSES = [
  "w-[76px]",
  "h-[60px]",
  "rounded-[14px]",
  "p-[8px]",
  "flex",
  "flex-col",
  "items-center",
  "justify-center",
  "gap-xs",
];
const ACTIVE_CLASSES = ["bg-accent-electric-sky/12", "text-accent-electric-sky"];

afterEach(cleanup);

function inLocale(locale: "ar" | "en", ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale={locale} messages={null}>
      <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        {ui}
      </div>
    </NextIntlClientProvider>,
  );
}

function classesOf(element: Element | null): string[] {
  return (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function renderMore(
  overrides: Partial<{ expanded: boolean; containsActive: boolean; onOpen: () => void }> = {},
) {
  return inLocale(
    "ar",
    <MobileNavItem
      kind="more"
      icon="more"
      label="المزيد"
      onOpen={overrides.onOpen ?? (() => {})}
      expanded={overrides.expanded ?? false}
      containsActive={overrides.containsActive ?? false}
    />,
  );
}

describe("destination (criterion 1, 2)", () => {
  it.each([
    ["ar", "الرئيسية", "/dashboard"],
    ["en", "Dashboard", "/en/dashboard"],
  ] as const)("%s: renders <a> named by its label with href %s", (locale, label, expected) => {
    inLocale(
      locale,
      <MobileNavItem
        kind="destination"
        icon="home"
        label={label}
        href="/dashboard"
        active={false}
      />,
    );
    const link = screen.getByRole("link", { name: label });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe(expected);
    expect(link.hasAttribute("aria-current")).toBe(false);
    expect(link.querySelector("a, button")).toBeNull(); // no nested interactive element
  });

  it("active: aria-current=page", () => {
    inLocale(
      "ar",
      <MobileNavItem kind="destination" icon="home" label="الرئيسية" href="/dashboard" active />,
    );
    expect(screen.getByRole("link", { name: "الرئيسية" }).getAttribute("aria-current")).toBe(
      "page",
    );
  });
});

describe("more (criterion 1, 2, 3)", () => {
  it("renders <button type=button> with aria-haspopup=dialog, never aria-current", () => {
    renderMore({ containsActive: true });
    const button = screen.getByRole("button", { name: "المزيد" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.hasAttribute("aria-current")).toBe(false);
    expect(button.querySelector("a, button")).toBeNull();
  });

  it.each([false, true])("aria-expanded follows expanded (%s)", (expanded) => {
    renderMore({ expanded });
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(String(expanded));
  });

  it("calls onOpen on click, Enter and Space", async () => {
    const onOpen = vi.fn();
    renderMore({ onOpen });
    const button = screen.getByRole("button", { name: "المزيد" });
    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
    button.focus();
    const user = userEvent.setup();
    await user.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledTimes(2);
    await user.keyboard(" ");
    expect(onOpen).toHaveBeenCalledTimes(3);
  });
});

describe("classes (criterion 4)", () => {
  it("default destination and default More: box, Text/Secondary, no fill", () => {
    inLocale(
      "en",
      <>
        <MobileNavItem
          kind="destination"
          icon="book"
          label="My Lectures"
          href="/lectures"
          active={false}
        />
        <MobileNavItem
          kind="more"
          icon="more"
          label="More"
          onOpen={() => {}}
          expanded={false}
          containsActive={false}
        />
      </>,
    );
    for (const element of [screen.getByRole("link"), screen.getByRole("button")]) {
      const classes = classesOf(element);
      expect(classes).toEqual(expect.arrayContaining([...BOX_CLASSES, "text-text-secondary"]));
      expect(classes.filter((c) => c.startsWith("bg-"))).toEqual([]);
      expect(classes).not.toContain("text-accent-electric-sky");
    }
  });

  it("an expanded More without containsActive keeps the Default look", () => {
    renderMore({ expanded: true });
    const classes = classesOf(screen.getByRole("button"));
    expect(classes).toContain("text-text-secondary");
    expect(classes).not.toContain("bg-accent-electric-sky/12");
  });

  it("active destination and More with containsActive: Electric Sky 12% fill and colour", () => {
    inLocale(
      "ar",
      <>
        <MobileNavItem kind="destination" icon="home" label="الرئيسية" href="/dashboard" active />
        <MobileNavItem
          kind="more"
          icon="more"
          label="المزيد"
          onOpen={() => {}}
          expanded={false}
          containsActive
        />
      </>,
    );
    for (const element of [screen.getByRole("link"), screen.getByRole("button")]) {
      const classes = classesOf(element);
      expect(classes).toEqual(expect.arrayContaining([...BOX_CLASSES, ...ACTIVE_CLASSES]));
      expect(classes).not.toContain("text-text-secondary");
    }
  });

  it("label type, focus ring, colour-only motion; no hover, pressed, transform, hex or left/right", () => {
    renderMore();
    const classes = classesOf(screen.getByRole("button"));
    expect(classes).toEqual(
      expect.arrayContaining([
        "text-dashboard-caption",
        "transition-colors",
        "duration-base",
        "ease-standard",
        "focus-visible:outline-2",
        "focus-visible:outline-offset-2",
        "focus-visible:outline-solid",
        "focus-visible:outline-accent-electric-sky",
      ]),
    );
    expect(classes.filter((c) => c.includes("hover:") || c.startsWith("active:"))).toEqual([]);
    expect(
      classes.filter((c) => /transform|scale|rotate|translate|shadow|animate/.test(c)),
    ).toEqual([]);
    expect(classes.filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
    expect(classes.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
  });
});

describe("icon and label (criterion 5)", () => {
  it.each(["ar", "en"] as const)(
    "%s: 22px decorative icon, unmirrored, label text renders",
    (locale) => {
      inLocale(
        locale,
        <MobileNavItem kind="destination" icon="home" label="الرئيسية" href="/dashboard" active />,
      );
      const link = screen.getByRole("link", { name: "الرئيسية" });
      const svg = link.querySelector("svg");
      expect(svg?.getAttribute("data-icon")).toBe("home");
      expect(svg?.getAttribute("width")).toBe("22");
      expect(svg?.getAttribute("height")).toBe("22");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
      expect(classesOf(svg).filter((c) => c.includes("scale"))).toEqual([]);
      expect(link.textContent).toBe("الرئيسية");
    },
  );

  it("the label stays on one line (long English labels must not wrap past the 60px height)", () => {
    inLocale(
      "en",
      <MobileNavItem
        kind="destination"
        icon="book"
        label="My Lectures"
        href="/lectures"
        active={false}
      />,
    );
    const label = screen.getByText("My Lectures");
    expect(label.tagName).toBe("SPAN");
    expect(classesOf(label)).toContain("whitespace-nowrap");
  });

  it("More: 22px decorative more icon", () => {
    renderMore();
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg?.getAttribute("data-icon")).toBe("more");
    expect(svg?.getAttribute("width")).toBe("22");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("compile-time API (criterion 6)", () => {
  it("accepts the contract and rejects everything else", () => {
    const noop = () => {};
    const samples = [
      <MobileNavItem key="a" kind="destination" icon="home" label="x" href="/dashboard" active />,
      <MobileNavItem
        key="b"
        kind="more"
        icon="more"
        label="x"
        onOpen={noop}
        expanded={false}
        containsActive={false}
      />,
      <MobileNavItem
        key="c"
        kind="destination"
        icon="home"
        label="x"
        href="/dashboard"
        active
        // @ts-expect-error — mixing the kinds: a destination has no onOpen / expanded
        onOpen={noop}
        expanded={false}
        containsActive={false}
      />,
      <MobileNavItem
        key="d"
        kind="more"
        icon="more"
        label="x"
        // @ts-expect-error — mixing the kinds: More has no href / active
        href="/dashboard"
        active
        onOpen={noop}
        expanded={false}
        containsActive={false}
      />,
      // @ts-expect-error — More is not a destination (D-R6): no aria-current
      <MobileNavItem
        key="e"
        kind="more"
        icon="more"
        label="x"
        onOpen={noop}
        expanded={false}
        containsActive
        aria-current="page"
      />,
      // @ts-expect-error — label is required
      <MobileNavItem key="f" kind="destination" icon="home" href="/dashboard" active />,
      // @ts-expect-error — no children
      <MobileNavItem key="g" kind="destination" icon="home" label="x" href="/dashboard" active>
        x
      </MobileNavItem>,
      // @ts-expect-error — unknown icon
      <MobileNavItem key="h" kind="destination" icon="rocket" label="x" href="/dashboard" active />,
      // @ts-expect-error — More always uses the `more` icon
      <MobileNavItem
        key="i"
        kind="more"
        icon="home"
        label="x"
        onOpen={noop}
        expanded={false}
        containsActive={false}
      />,
      <MobileNavItem
        key="j"
        kind="destination"
        icon="home"
        label="x"
        href="/dashboard"
        active
        // @ts-expect-error — no className
        className="ms-sm"
      />,
    ];
    expect(samples).toHaveLength(10);
  });
});

describe("axe (criterion 7)", () => {
  it.each(["ar", "en"] as const)("all states have no violations (%s)", async (locale) => {
    const { container } = inLocale(
      locale,
      <nav aria-label="nav">
        <MobileNavItem kind="destination" icon="home" label="Dashboard" href="/dashboard" active />
        <MobileNavItem
          kind="destination"
          icon="book"
          label="My Lectures"
          href="/lectures"
          active={false}
        />
        <MobileNavItem
          kind="more"
          icon="more"
          label="More"
          onOpen={() => {}}
          expanded={false}
          containsActive
        />
      </nav>,
    );
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

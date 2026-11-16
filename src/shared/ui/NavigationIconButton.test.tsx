// @vitest-environment jsdom
import { createRef, type ReactNode } from "react";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NavigationIconButton } from "./NavigationIconButton";

/*
 * Navigation Icon Button — contract docs/phases/phase-05-navigation-icon-button-contract.md §12.
 * jsdom applies no Tailwind CSS: styles are checked as class names; computed values, hover on
 * fine pointers, pressed, contrast and reduced motion are checked in Chromium (gallery E2E).
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const HOVER = "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:";

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

describe("button mode", () => {
  it("renders <button type=button> named by label, with a decorative 20px icon", () => {
    inLocale("ar", <NavigationIconButton icon="menu" label="فتح القائمة" onClick={() => {}} />);
    const button = screen.getByRole("button", { name: "فتح القائمة" });
    expect(button.getAttribute("type")).toBe("button");
    const svg = button.querySelector("svg");
    expect(svg?.getAttribute("data-icon")).toBe("menu");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("width")).toBe("20");
    expect(button.querySelector("a, button")).toBeNull(); // no nested interactive element
  });

  it("calls onClick on click and on Enter / Space", async () => {
    const onClick = vi.fn();
    inLocale("en", <NavigationIconButton icon="bell" label="Notifications" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Notifications" });
    fireEvent.click(button);
    button.focus();
    const user = userEvent.setup();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("passes aria-expanded, aria-haspopup, aria-controls and aria-pressed; never aria-current", () => {
    inLocale(
      "en",
      <>
        <NavigationIconButton
          icon="menu"
          label="Open menu"
          onClick={() => {}}
          aria-expanded
          aria-haspopup="dialog"
          aria-controls="drawer"
        />
        <NavigationIconButton icon="moon" label="Toggle" onClick={() => {}} aria-pressed={false} />
      </>,
    );
    const menu = screen.getByRole("button", { name: "Open menu" });
    expect(menu.getAttribute("aria-expanded")).toBe("true");
    expect(menu.getAttribute("aria-haspopup")).toBe("dialog");
    expect(menu.getAttribute("aria-controls")).toBe("drawer");
    expect(menu.hasAttribute("aria-current")).toBe(false);
    expect(screen.getByRole("button", { name: "Toggle" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("an open (expanded) action keeps the Default visual — no persistent Active (D-NIB4)", () => {
    inLocale(
      "en",
      <NavigationIconButton icon="bell" label="Notifications" onClick={() => {}} aria-expanded />,
    );
    const classes = classesOf(screen.getByRole("button"));
    expect(classes).toContain("bg-text-primary/4");
    expect(classes).not.toContain("bg-accent-electric-sky/18");
  });

  it("disabled: native disabled, does not activate, no hover or pressed classes", () => {
    const onClick = vi.fn();
    inLocale(
      "en",
      <NavigationIconButton icon="bell" label="Notifications" onClick={onClick} disabled />,
    );
    const button = screen.getByRole("button", { name: "Notifications" });
    expect(button).toHaveProperty("disabled", true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    const classes = classesOf(button);
    expect(classes).toEqual(expect.arrayContaining(["opacity-50", "cursor-default"]));
    expect(classes.filter((c) => c.includes("hover:") || c.startsWith("active:"))).toEqual([]);
  });
});

describe("link mode (locale-aware)", () => {
  it.each([
    ["ar", "/dashboard"],
    ["en", "/en/dashboard"],
  ] as const)("%s: renders a link to %s named by label", (locale, expected) => {
    inLocale(locale, <NavigationIconButton icon="home" label="Dashboard" href="/dashboard" />);
    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link.getAttribute("href")).toBe(expected);
    expect(link.hasAttribute("aria-current")).toBe(false);
    expect(link.querySelector("a, button")).toBeNull();
  });

  it("typed params are filled", () => {
    inLocale(
      "en",
      <NavigationIconButton
        icon="folder"
        label="Folder"
        href={{ pathname: "/folders/[folderId]", params: { folderId: "f2" } }}
      />,
    );
    expect(screen.getByRole("link", { name: "Folder" }).getAttribute("href")).toBe(
      "/en/folders/f2",
    );
  });

  it("active: aria-current=page and the Figma Active visual, without hover or pressed", () => {
    inLocale("ar", <NavigationIconButton icon="home" label="الرئيسية" href="/dashboard" active />);
    const link = screen.getByRole("link", { name: "الرئيسية" });
    expect(link.getAttribute("aria-current")).toBe("page");
    const classes = classesOf(link);
    expect(classes).toEqual(
      expect.arrayContaining([
        "bg-accent-electric-sky/18",
        "border-accent-electric-sky/45",
        "text-text-primary",
      ]),
    );
    expect(classes.filter((c) => c.includes("hover:") || c.startsWith("active:"))).toEqual([]);
  });

  it("disabled link: non-interactive span announced as an unavailable link (D-NIB3)", () => {
    inLocale(
      "en",
      <NavigationIconButton
        icon="crown"
        label="Upgrade plan"
        href="/settings/subscription"
        disabled
      />,
    );
    const el = screen.getByRole("link", { name: "Upgrade plan" });
    expect(el.tagName).toBe("SPAN");
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.hasAttribute("href")).toBe(false);
    expect(el.hasAttribute("tabindex")).toBe(false);
    el.focus();
    expect(document.activeElement).not.toBe(el);
  });

  it("forwards ref to the anchor", () => {
    const ref = createRef<HTMLAnchorElement>();
    inLocale(
      "en",
      <NavigationIconButton icon="home" label="Dashboard" href="/dashboard" ref={ref} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});

describe("classes (contract §5)", () => {
  it("md: 40px box, radius 12, Figma Default, fine-pointer hover, pressed, focus ring, colour motion", () => {
    inLocale("en", <NavigationIconButton icon="menu" label="Open menu" onClick={() => {}} />);
    const classes = classesOf(screen.getByRole("button"));
    expect(classes).toEqual(
      expect.arrayContaining([
        "size-[40px]",
        "rounded-md",
        "border",
        "bg-text-primary/4",
        "border-accent-electric-sky/12",
        "text-text-secondary",
        `${HOVER}bg-accent-electric-sky/10`,
        `${HOVER}border-accent-electric-sky/30`,
        `${HOVER}text-text-primary`,
        "active:bg-accent-electric-sky/14",
        "active:border-accent-electric-sky/30",
        "active:text-text-primary",
        "active:duration-fast",
        "transition-colors",
        "duration-base",
        "ease-standard",
        "focus-visible:outline-2",
        "focus-visible:outline-accent-electric-sky",
      ]),
    );
  });

  it("lg: 44px box with an 18px icon (D-NIB1)", () => {
    inLocale(
      "en",
      <NavigationIconButton icon="search" label="Search" size="lg" onClick={() => {}} />,
    );
    const button = screen.getByRole("button");
    expect(classesOf(button)).toContain("size-[44px]");
    expect(button.querySelector("svg")?.getAttribute("width")).toBe("18");
  });

  it("hover only through the fine-pointer media query; no transform, scale, shadow, hex or left/right", () => {
    inLocale(
      "en",
      <NavigationIconButton icon="menu" label="Open menu" onClick={() => {}} className="ms-sm" />,
    );
    const classes = classesOf(screen.getByRole("button"));
    expect(
      classes.filter((c) => c.includes("hover:") && !c.startsWith("[@media(hover:hover)")),
    ).toEqual([]);
    expect(
      classes.filter((c) => /transform|scale|rotate|translate|shadow|animate/.test(c)),
    ).toEqual([]);
    expect(classes.filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
    expect(classes.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
    expect(classes.at(-1)).toBe("ms-sm");
  });

  it("data-* attributes pass through", () => {
    inLocale(
      "en",
      <NavigationIconButton icon="menu" label="Open menu" onClick={() => {}} data-testid="nib" />,
    );
    expect(screen.getByTestId("nib").tagName).toBe("BUTTON");
  });
});

describe("compile-time API (§4)", () => {
  it("accepts the contract and rejects everything else", () => {
    const samples = [
      <NavigationIconButton key="a" icon="home" label="x" href="/dashboard" active />,
      <NavigationIconButton key="b" icon="menu" label="x" onClick={() => {}} aria-expanded />,
      <NavigationIconButton
        key="c"
        icon="search"
        label="x"
        size="lg"
        onClick={() => {}}
        disabled
      />,
      // @ts-expect-error — a link or a button, never both
      <NavigationIconButton key="d" icon="home" label="x" href="/dashboard" onClick={() => {}} />,
      // @ts-expect-error — Active is for navigation links only (D-NIB4)
      <NavigationIconButton key="e" icon="bell" label="x" onClick={() => {}} active />,
      // @ts-expect-error — label is required
      <NavigationIconButton key="f" icon="bell" onClick={() => {}} />,
      // @ts-expect-error — no children
      <NavigationIconButton key="g" icon="bell" label="x" onClick={() => {}}>
        x
      </NavigationIconButton>,
      // @ts-expect-error — the component owns its role
      <NavigationIconButton key="h" icon="bell" label="x" onClick={() => {}} role="link" />,
      // @ts-expect-error — no tabIndex override
      <NavigationIconButton key="i" icon="bell" label="x" onClick={() => {}} tabIndex={-1} />,
      // @ts-expect-error — no variants
      <NavigationIconButton key="j" icon="bell" label="x" onClick={() => {}} variant="primary" />,
      // @ts-expect-error — only md and lg
      <NavigationIconButton key="k" icon="bell" label="x" onClick={() => {}} size="sm" />,
      // @ts-expect-error — unknown path (typed pathnames)
      <NavigationIconButton key="l" icon="home" label="x" href="/unknown" />,
      // @ts-expect-error — unknown icon
      <NavigationIconButton key="m" icon="rocket" label="x" onClick={() => {}} />,
    ];
    expect(samples).toHaveLength(13);
  });
});

describe("axe (§12)", () => {
  it.each(["ar", "en"] as const)("all variants have no violations (%s)", async (locale) => {
    const { container } = inLocale(
      locale,
      <nav aria-label="nav">
        <NavigationIconButton icon="home" label="Dashboard" href="/dashboard" active />
        <NavigationIconButton icon="book" label="My Lectures" href="/lectures" />
        <NavigationIconButton icon="crown" label="Upgrade" href="/settings/subscription" disabled />
        <NavigationIconButton
          icon="menu"
          label="Open menu"
          onClick={() => {}}
          aria-expanded={false}
        />
        <NavigationIconButton icon="search" label="Search" size="lg" onClick={() => {}} />
        <NavigationIconButton icon="bell" label="Notifications" onClick={() => {}} disabled />
      </nav>,
    );
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

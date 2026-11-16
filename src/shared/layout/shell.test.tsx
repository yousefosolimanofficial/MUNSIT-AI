// @vitest-environment jsdom
import type { ReactNode } from "react";

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { MESSAGES } from "@/i18n/messages";
import { ROUTES } from "@/i18n/routes";
import { DESTINATIONS, type DestinationId } from "@/shared/navigation/nav-registry";

import { AppShellView } from "./AppShellView";
import { MAIN_CONTENT_ID, RAIL_RANGE_QUERY, type ShellLabels } from "./shell-model";
import { Sidebar, SidebarPanel } from "./Sidebar";
import { SidebarItem } from "./SidebarItem";
import { TabletRail } from "./TabletRail";
import { UpgradeCard } from "./UpgradeCard";

/*
 * App shell, first increment (Phase 05 plan §16): Sidebar, Sidebar Item, Upgrade Card, Tablet
 * Rail, Tablet drawer and the shell layout. jsdom applies no Tailwind CSS, so styles are class
 * names; geometry, breakpoints, motion, contrast and real focus behaviour are checked in Chromium
 * (tests/e2e/shell.spec.ts). jsdom has no `showModal`/`close` or `matchMedia`; both are stubbed.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const HOVER = "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:";

type Locale = "ar" | "en";

/** The active destination returned by the mocked `useActiveDestination()`. */
const active = vi.hoisted(() => ({ destination: "dashboard" as string | null }));

vi.mock("@/shared/navigation/use-active-destination", () => ({
  useActiveDestination: () => ({ routeKey: null, destination: active.destination }),
}));

/** Same mapping as `getShellLabels()`, from the real message catalogs. */
function labelsFor(locale: Locale): ShellLabels {
  const { nav, shell } = MESSAGES[locale];
  return {
    mainNavigation: shell.mainNavigation,
    skipToContent: shell.skipToContent,
    openMenu: shell.openMenu,
    drawerTitle: shell.drawerTitle,
    upgrade: {
      title: nav.moreExtras.upgradePlan,
      description: shell.upgradeCard.description,
      action: shell.upgradeCard.action,
    },
    destinations: DESTINATIONS.map((d) => ({
      id: d.id,
      label: nav.destinations[d.id],
      icon: d.icon,
      href: ROUTES[d.routeKey],
    })),
  };
}

function inLocale(locale: Locale, ui: ReactNode) {
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

const prefixOf = (locale: Locale) => (locale === "ar" ? "" : "/en");

/* --------------------------------------------------------------- stubs: dialog, matchMedia */

const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});

let mediaMatches = true;
const mediaListeners = new Set<() => void>();

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = showModal;
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  window.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return query === RAIL_RANGE_QUERY ? mediaMatches : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => mediaListeners.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  active.destination = "dashboard";
  mediaMatches = true;
});

afterEach(() => {
  cleanup();
  showModal.mockClear();
  mediaListeners.clear();
});

/* ------------------------------------------------------------------------- Sidebar Item */

describe("SidebarItem (Figma 2210:118)", () => {
  it.each<Locale>(["ar", "en"])(
    "is a locale-aware link named by its label (%s), icon 20 decorative",
    (locale) => {
      inLocale(
        locale,
        <SidebarItem icon="book" label="محاضراتي" href="/lectures" active={false} />,
      );
      const link = screen.getByRole("link", { name: "محاضراتي" });
      expect(link.getAttribute("href")).toBe(`${prefixOf(locale)}/lectures`);
      const svg = link.querySelector("svg");
      expect(svg?.getAttribute("data-icon")).toBe("book");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
      expect(svg?.getAttribute("width")).toBe("20");
    },
  );

  it("Default: no aria-current, no accent bar; hover only on fine pointers; pressed = :active", () => {
    inLocale("ar", <SidebarItem icon="book" label="محاضراتي" href="/lectures" active={false} />);
    const link = screen.getByRole("link");
    expect(link.hasAttribute("aria-current")).toBe(false);
    expect(link.querySelector("[data-accent]")).toBeNull();
    const classes = classesOf(link);
    expect(classes).toEqual(
      expect.arrayContaining([
        "min-h-[44px]",
        "rounded-md",
        "px-[14px]",
        "gap-sm",
        "border-transparent",
        "text-text-secondary",
        "text-dashboard-body-medium",
        `${HOVER}bg-accent-electric-sky/7`,
        `${HOVER}text-text-primary`,
        "active:bg-accent-electric-sky/14",
        "transition-colors",
        "duration-base",
      ]),
    );
    // Hover never applies outside the fine-pointer media rule.
    expect(classes.filter((c) => c.startsWith("hover:"))).toEqual([]);
    expect(classesOf(link.querySelector("svg"))).toContain("text-text-secondary");
  });

  it("Active: aria-current=page, Sky 12% + Sky 22% border, SemiBold, Sky icon, 3 × 22 accent at inline end", () => {
    inLocale("ar", <SidebarItem icon="home" label="الرئيسية" href="/dashboard" active />);
    const link = screen.getByRole("link", { name: "الرئيسية" });
    expect(link.getAttribute("aria-current")).toBe("page");
    const classes = classesOf(link);
    expect(classes).toEqual(
      expect.arrayContaining([
        "bg-accent-electric-sky/12",
        "border-accent-electric-sky/22",
        "text-text-primary",
        "text-dashboard-button",
      ]),
    );
    expect(classes.some((c) => c.includes("hover:"))).toBe(false); // no hover visual on Active
    expect(classesOf(link.querySelector("svg"))).toContain("text-accent-electric-sky");
    const accent = link.querySelector("[data-accent]");
    expect(accent?.getAttribute("aria-hidden")).toBe("true");
    expect(classesOf(accent)).toEqual(
      expect.arrayContaining([
        "h-[22px]",
        "w-[3px]",
        "rounded-[2px]",
        "-end-px",
        "bg-accent-electric-sky",
      ]),
    );
    // Logical placement only: never a physical side.
    expect(classesOf(accent).some((c) => /(^|:)-?(left|right)-/.test(c))).toBe(false);
  });

  it("calls onClick when activated", async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    inLocale(
      "ar",
      <SidebarItem
        icon="book"
        label="محاضراتي"
        href="/lectures"
        active={false}
        onClick={onClick}
      />,
    );
    await userEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------------- Upgrade Card */

describe("UpgradeCard (Figma 2211:158)", () => {
  it.each<Locale>(["ar", "en"])(
    "title, description and an action link to /settings/subscription (%s)",
    (locale) => {
      const labels = labelsFor(locale);
      inLocale(locale, <UpgradeCard {...labels.upgrade} />);
      expect(screen.getByText(labels.upgrade.title)).toBeTruthy();
      expect(screen.getByText(labels.upgrade.description)).toBeTruthy();
      const link = screen.getByRole("link", { name: labels.upgrade.action });
      expect(link.getAttribute("href")).toBe(`${prefixOf(locale)}/settings/subscription`);
      expect(screen.queryByRole("button")).toBeNull(); // navigation only, no payment action
    },
  );

  it("uses the Figma shell values and the Primary Button visual", () => {
    inLocale("ar", <UpgradeCard {...labelsFor("ar").upgrade} />);
    const card = screen.getByTestId("upgrade-card");
    expect(classesOf(card)).toEqual(
      expect.arrayContaining([
        "rounded-[18px]",
        "p-md",
        "gap-[10px]",
        "border-accent-electric-sky/30",
        "from-accent-cobalt-edge/85",
        "to-accent-deep-space/95",
        "rtl:bg-linear-to-r",
        "ltr:bg-linear-to-l",
      ]),
    );
    const tileIcon = card.querySelector("svg");
    expect(tileIcon?.getAttribute("data-icon")).toBe("crown");
    expect(tileIcon?.getAttribute("width")).toBe("18");
    expect(classesOf(tileIcon?.parentElement ?? null)).toContain("text-accent-info-blue");
    expect(classesOf(screen.getByRole("link"))).toEqual(
      expect.arrayContaining([
        "h-[44px]",
        "bg-accent-electric-sky",
        "text-surface-void-black",
        "text-dashboard-button",
        `${HOVER}bg-accent-info-blue`,
        "active:bg-accent-electric-sky/78",
      ]),
    );
  });
});

/* -------------------------------------------------------------------------- Sidebar */

describe("Sidebar and SidebarPanel (Figma 2211:81)", () => {
  it.each<Locale>(["ar", "en"])(
    "renders the registry destinations, in order, inside the named landmark (%s)",
    (locale) => {
      const labels = labelsFor(locale);
      inLocale(locale, <SidebarPanel labels={labels} />);
      const nav = screen.getByRole("navigation", { name: labels.mainNavigation });
      const links = within(nav).getAllByRole("link");
      expect(links.map((l) => l.textContent)).toEqual(
        DESTINATIONS.map((d) => MESSAGES[locale].nav.destinations[d.id]),
      );
      expect(links.map((l) => l.getAttribute("href"))).toEqual(
        DESTINATIONS.map((d) => `${prefixOf(locale)}${ROUTES[d.routeKey]}`),
      );
      expect(screen.getByRole("img", { name: "MUNSIT AI" }).getAttribute("data-logo")).toBe(
        "horizontal",
      );
    },
  );

  it.each<DestinationId>(["dashboard", "questions", "folders"])(
    "exactly one item is current on %s",
    (id) => {
      active.destination = id;
      inLocale("ar", <SidebarPanel labels={labelsFor("ar")} />);
      const current = document.querySelectorAll("[aria-current]");
      expect(current).toHaveLength(1);
      expect(current[0]?.textContent).toBe(MESSAGES.ar.nav.destinations[id]);
    },
  );

  it("no item is current when there is no destination (Settings, D-R6)", () => {
    active.destination = null;
    inLocale("ar", <SidebarPanel labels={labelsFor("ar")} />);
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  it("the Desktop placement is sticky, full height, 232, scrolls internally, only from xl", () => {
    const { container } = inLocale("ar", <Sidebar labels={labelsFor("ar")} />);
    const sidebar = container.querySelector('[data-shell="sidebar"]');
    expect(classesOf(sidebar)).toEqual(
      expect.arrayContaining([
        "hidden",
        "xl:block",
        "sticky",
        "top-0",
        "h-dvh",
        "w-[232px]",
        "overflow-y-auto",
        "border-e",
        "border-accent-electric-sky/10",
        "bg-surface-ink/88",
      ]),
    );
  });

  it.each<Locale>(["ar", "en"])("has no axe violations (%s)", async (locale) => {
    const { container } = inLocale(locale, <SidebarPanel labels={labelsFor(locale)} />);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

/* ------------------------------------------------------------------- Rail and drawer */

describe("TabletRail and TabletDrawer (Figma 2224:379, 2242:1272)", () => {
  function renderRail(locale: Locale = "ar") {
    const labels = labelsFor(locale);
    const view = inLocale(locale, <TabletRail labels={labels} />);
    const rail = view.container.querySelector('[data-shell="rail"]') as HTMLElement;
    const menu = within(rail).getByRole("button", { name: labels.openMenu });
    const dialog = view.container.querySelector("dialog") as HTMLDialogElement;
    return { ...view, labels, rail, menu, dialog };
  }

  it("is visible only in the Rail range (rail: to xl:), sticky, 72 wide", () => {
    const { rail } = renderRail();
    expect(classesOf(rail)).toEqual(
      expect.arrayContaining([
        "hidden",
        "rail:block",
        "xl:hidden",
        "sticky",
        "h-dvh",
        "w-[72px]",
        "overflow-y-auto",
        "border-e",
      ]),
    );
  });

  it.each<Locale>(["ar", "en"])(
    "menu, 8 destination links and the upgrade link are O-8 controls (%s)",
    (locale) => {
      const { rail, labels, menu } = renderRail(locale);
      expect(menu.getAttribute("aria-haspopup")).toBe("dialog");
      expect(menu.getAttribute("aria-expanded")).toBe("false");
      const nav = within(rail).getByRole("navigation", { name: labels.mainNavigation });
      const links = within(nav).getAllByRole("link");
      expect(links.map((l) => l.getAttribute("aria-label"))).toEqual(
        DESTINATIONS.map((d) => MESSAGES[locale].nav.destinations[d.id]),
      );
      expect(links.every((l) => classesOf(l).includes("size-[40px]"))).toBe(true);
      const upgrade = within(rail).getByRole("link", { name: labels.upgrade.title });
      expect(upgrade.getAttribute("href")).toBe(`${prefixOf(locale)}/settings/subscription`);
      expect(upgrade.querySelector("svg")?.getAttribute("data-icon")).toBe("crown");
      expect(within(rail).getByRole("img", { name: "MUNSIT AI" }).getAttribute("data-logo")).toBe(
        "symbol",
      );
    },
  );

  it("exactly one Rail link is current; none on Settings", () => {
    active.destination = "notes";
    const first = renderRail();
    const current = first.rail.querySelectorAll("[aria-current]");
    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute("aria-label")).toBe(MESSAGES.ar.nav.destinations.notes);
    cleanup();
    active.destination = null;
    const second = renderRail();
    expect(second.rail.querySelectorAll("[aria-current]")).toHaveLength(0);
  });

  it("the menu button opens the drawer: modal dialog named «القائمة», aria-expanded, aria-controls", async () => {
    const { menu, dialog, labels } = renderRail();
    expect(menu.getAttribute("aria-controls")).toBe(dialog.id);
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(dialog.childElementCount).toBe(0); // content mounts only while open

    await userEvent.click(menu);
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(menu.getAttribute("aria-expanded")).toBe("true");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe(labels.drawerTitle);
    // The drawer is the Sidebar panel: same landmark, destinations, current item and upgrade card.
    const nav = within(dialog).getByRole("navigation", { name: labels.mainNavigation });
    expect(within(nav).getAllByRole("link")).toHaveLength(DESTINATIONS.length);
    expect(within(nav).getByRole("link", { current: "page" }).textContent).toBe(
      MESSAGES.ar.nav.destinations.dashboard,
    );
    expect(within(dialog).getByRole("link", { name: labels.upgrade.action })).toBeTruthy();
    expect(within(dialog).queryByRole("button")).toBeNull(); // Figma: no close button
  });

  it("Esc (cancel) closes the drawer and collapses the menu button", async () => {
    const { menu, dialog } = renderRail();
    await userEvent.click(menu);
    const cancel = new Event("cancel", { cancelable: true });
    act(() => {
      dialog.dispatchEvent(cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    expect(menu.getAttribute("aria-expanded")).toBe("false");
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  it("a click on the scrim closes the drawer", async () => {
    const { menu, dialog } = renderRail();
    await userEvent.click(menu);
    // Outside the panel's rect (jsdom rects are 0 × 0 at the origin).
    fireEvent.pointerDown(dialog, { clientX: 500, clientY: 500 });
    fireEvent.click(dialog, { clientX: 500, clientY: 500 });
    expect(menu.getAttribute("aria-expanded")).toBe("false");
  });

  it("activating a destination or the upgrade link closes the drawer", async () => {
    const { menu, dialog, labels } = renderRail();
    const preventNavigation = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("click", preventNavigation);
    try {
      await userEvent.click(menu);
      await userEvent.click(within(dialog).getByRole("link", { name: "الملاحظات" }));
      expect(menu.getAttribute("aria-expanded")).toBe("false");

      await userEvent.click(menu);
      await userEvent.click(within(dialog).getByRole("link", { name: labels.upgrade.action }));
      expect(menu.getAttribute("aria-expanded")).toBe("false");
    } finally {
      document.removeEventListener("click", preventNavigation);
    }
  });

  it("closes when the viewport leaves the Rail range", async () => {
    const { menu } = renderRail();
    await userEvent.click(menu);
    expect(menu.getAttribute("aria-expanded")).toBe("true");
    mediaMatches = false;
    act(() => {
      for (const listener of mediaListeners) listener();
    });
    expect(menu.getAttribute("aria-expanded")).toBe("false");
  });

  it("drawer: inline-start placement, Figma panel, slide/opacity motion with reduced-motion fallback", () => {
    const { dialog } = renderRail();
    expect(classesOf(dialog)).toEqual(
      expect.arrayContaining([
        "start-0",
        "end-auto",
        "h-dvh",
        "w-[232px]",
        "border-e",
        "bg-surface-ink/88",
        "backdrop:bg-surface-void-black/66",
        "duration-slow",
        "data-[state=closing]:duration-base",
        "ease-standard",
        "motion-reduce:transition-opacity",
        "starting:open:[translate:calc(-100%_*_var(--motion-dir)_*_var(--motion-distance))_0]",
      ]),
    );
    expect(classesOf(dialog).some((c) => /(^|:)(left|right)-/.test(c))).toBe(false);
  });

  it.each<Locale>(["ar", "en"])("has no axe violations, closed and open (%s)", async (locale) => {
    const { container, menu } = renderRail(locale);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
    await userEvent.click(menu);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

/* ----------------------------------------------------------------------- Shell layout */

describe("AppShellView", () => {
  it.each<Locale>(["ar", "en"])(
    "skip link first, then the navigation, then the one main (%s)",
    (locale) => {
      const labels = labelsFor(locale);
      inLocale(
        locale,
        <AppShellView labels={labels}>
          <h1>المحتوى</h1>
        </AppShellView>,
      );
      const skip = screen.getByRole("link", { name: labels.skipToContent });
      expect(skip.getAttribute("href")).toBe(`#${MAIN_CONTENT_ID}`);
      const mains = screen.getAllByRole("main");
      expect(mains).toHaveLength(1);
      const main = mains[0] as HTMLElement;
      expect(main.id).toBe(MAIN_CONTENT_ID);
      expect(main.getAttribute("tabindex")).toBe("-1");
      expect(within(main).getByRole("heading", { level: 1 })).toBeTruthy();
      expect(within(main).queryByRole("navigation")).toBeNull();

      // Document order: skip link → Sidebar → Rail → main (inline start comes first).
      const order = [
        skip,
        document.querySelector('[data-shell="sidebar"]'),
        document.querySelector('[data-shell="rail"]'),
        main,
      ];
      for (let i = 1; i < order.length; i += 1) {
        const previous = order[i - 1] as Node;
        const next = order[i] as Node;
        expect(previous.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
          Node.DOCUMENT_POSITION_FOLLOWING,
        );
      }
      expect(classesOf(skip)).toContain("not-focus:sr-only");
    },
  );

  it("main padding follows the page-padding variables per breakpoint", () => {
    inLocale("ar", <AppShellView labels={labelsFor("ar")}>x</AppShellView>);
    expect(classesOf(screen.getByRole("main"))).toEqual(
      expect.arrayContaining([
        "p-[var(--page-padding-mobile)]",
        "rail:p-[var(--page-padding-tablet)]",
        "xl:p-[var(--page-padding-desktop)]",
        "min-w-0",
        "flex-1",
      ]),
    );
  });

  it.each<Locale>(["ar", "en"])("has no axe violations (%s)", async (locale) => {
    const { container } = inLocale(
      locale,
      <AppShellView labels={labelsFor(locale)}>
        <h1>Content</h1>
      </AppShellView>,
    );
    // jsdom applies no Tailwind CSS, so the Sidebar and the Rail would both be exposed. A real
    // browser shows one of them per breakpoint; emulate `xl:` (Rail `display: none`). Each width
    // is checked with axe in Chromium (tests/e2e/shell.spec.ts).
    const rail = container.querySelector<HTMLElement>('[data-shell="rail"]');
    if (rail) rail.style.display = "none";
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

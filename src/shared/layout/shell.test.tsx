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
import { BottomNav } from "./BottomNav";
import { MobileTopBar } from "./MobileTopBar";
import { MoreSheet } from "./MoreSheet";
import {
  MAIN_CONTENT_ID,
  MOBILE_RANGE_QUERY,
  RAIL_RANGE_QUERY,
  type ShellLabels,
} from "./shell-model";
import { Sidebar, SidebarPanel } from "./Sidebar";
import { SidebarItem } from "./SidebarItem";
import { TabletRail } from "./TabletRail";
import { TopBar } from "./TopBar";
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

/** Router, pathname and params for the Top Bar controls (no Next.js app router in jsdom). */
const routerState = vi.hoisted(() => ({
  push: (() => {}) as (href: string) => void,
  pathname: "/dashboard",
  params: { locale: "ar" } as Record<string, string>,
  search: "",
}));

vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => ({ push: (href: string) => routerState.push(href) }),
  usePathname: () => routerState.pathname,
}));

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useParams: () => routerState.params,
  useSearchParams: () => new URLSearchParams(routerState.search),
}));

/** Same mapping as `getShellLabels()`, from the real message catalogs. */
function labelsFor(locale: Locale): ShellLabels {
  const { nav, shell } = MESSAGES[locale];
  return {
    mainNavigation: shell.mainNavigation,
    bottomNavigation: shell.bottomNavigation,
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
    more: {
      title: nav.more,
      close: shell.closeMenu,
      accountSettings: nav.moreExtras.accountSettings,
    },
    topBar: {
      search: shell.search,
      searchPlaceholder: shell.searchPlaceholder,
      searchSoon: shell.searchSoon,
      notifications: shell.notifications,
      notificationsSoon: shell.notificationsSoon,
      appearance: shell.appearance,
      theme: shell.theme,
      accountMenu: shell.accountMenu,
      profile: nav.settingsNav.profile,
      settings: shell.settings,
      language: shell.language,
      languageNames: shell.languageNames,
    },
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

/**
 * Accessible name made of two spans. jsdom's name computation drops the space between them;
 * Chromium keeps it, and the exact names are asserted there (tests/e2e/top-bars.spec.ts).
 */
function joinedName(first: string, second: string): RegExp {
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escape(first)}\\s*${escape(second)}$`);
}

/* --------------------------------------------------------------- stubs: dialog, matchMedia */

const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});

let mediaMatches = true;
const mediaListeners = new Set<() => void>();

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = showModal;
  // jsdom has no Popover API (same stub as the Phase 03 Popover and Menu tests).
  if (!("showPopover" in HTMLElement.prototype)) {
    Object.assign(HTMLElement.prototype, {
      showPopover(this: HTMLElement) {
        this.style.display = "flex";
      },
      hidePopover(this: HTMLElement) {
        this.style.display = "";
      },
    });
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  window.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return query === RAIL_RANGE_QUERY || query === MOBILE_RANGE_QUERY ? mediaMatches : false;
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

/** Emulates one breakpoint in jsdom (no Tailwind CSS): hide the shell parts it does not show. */
function showOnly(container: HTMLElement, visible: "desktop" | "mobile") {
  const hidden =
    visible === "desktop"
      ? ["rail", "mobile-top-bar", "bottom-nav"]
      : ["sidebar", "rail", "top-bar"];
  for (const part of hidden) {
    const element = container.querySelector<HTMLElement>(`[data-shell="${part}"]`);
    if (element) element.style.display = "none";
  }
}

describe("AppShellView", () => {
  it.each<Locale>(["ar", "en"])(
    "skip link first, then the navigation, the Top Bars, then the one main (%s)",
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
      expect(main.querySelector("header")).toBeNull(); // the Top Bars sit outside main

      // Document order: skip link → Sidebar → Rail → Mobile Top Bar → Top Bar → main.
      const order = [
        skip,
        document.querySelector('[data-shell="sidebar"]'),
        document.querySelector('[data-shell="rail"]'),
        document.querySelector('[data-shell="mobile-top-bar"]'),
        document.querySelector('[data-shell="top-bar"]'),
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
      for (const part of ["top-bar", "mobile-top-bar"]) {
        expect(document.querySelector(`[data-shell="${part}"]`)?.tagName).toBe("HEADER");
      }
    },
  );

  it("content padding follows the page-padding variables; mobile 88 + top inset, 108 + bottom inset", () => {
    const { container } = inLocale("ar", <AppShellView labels={labelsFor("ar")}>x</AppShellView>);
    expect(classesOf(container.querySelector('[data-shell="content"]'))).toEqual(
      expect.arrayContaining([
        "px-[var(--page-padding-mobile)]",
        "pt-[calc(88px_+_env(safe-area-inset-top))]",
        "pb-[calc(108px_+_env(safe-area-inset-bottom))]",
        "rail:p-[var(--page-padding-tablet)]",
        "xl:p-[var(--page-padding-desktop)]",
        "rail:gap-[24px]",
        "min-w-0",
        "flex-1",
      ]),
    );
    expect(classesOf(screen.getByRole("main"))).toEqual(
      expect.arrayContaining(["min-w-0", "flex-1"]),
    );
  });

  it.each<Locale>(["ar", "en"])(
    "has no axe violations, desktop and mobile (%s)",
    async (locale) => {
      // jsdom applies no Tailwind CSS, so every shell part would be exposed at once. A real browser
      // shows one navigation and one Top Bar per breakpoint; emulate them. Each width is checked
      // with axe in Chromium (tests/e2e/shell.spec.ts, tests/e2e/top-bars.spec.ts).
      for (const visible of ["desktop", "mobile"] as const) {
        const { container } = inLocale(
          locale,
          <AppShellView labels={labelsFor(locale)}>
            <h1>Content</h1>
          </AppShellView>,
        );
        showOnly(container, visible);
        expect((await axe(container, AXE_OPTIONS)).violations, visible).toEqual([]);
        cleanup();
      }
    },
  );
});

/* ------------------------------------------------------------------------- Top Bars */

describe("Top Bar controls (Figma 2211:170, 2224:399, 2238:923)", () => {
  function renderBar(locale: Locale, bar: "desktop" | "mobile" = "desktop") {
    const labels = labelsFor(locale);
    const view = inLocale(
      locale,
      bar === "desktop" ? (
        <TopBar labels={labels.topBar} />
      ) : (
        <MobileTopBar labels={labels.topBar} />
      ),
    );
    return { ...view, labels, t: labels.topBar };
  }

  beforeEach(() => {
    routerState.pathname = "/dashboard";
    routerState.params = { locale: "ar" };
    routerState.search = "";
    routerState.push = vi.fn();
  });

  it.each<Locale>(["ar", "en"])(
    "Desktop/Tablet bar: one header, Figma order, every control named (%s)",
    (locale) => {
      const { t, container } = renderBar(locale);
      const header = screen.getByRole("banner");
      expect(header.getAttribute("data-shell")).toBe("top-bar");
      expect(classesOf(header)).toEqual(
        expect.arrayContaining(["hidden", "rail:flex", "h-[56px]", "justify-between"]),
      );
      // Exact accessible names, in document order. The search field's name is the approved label
      // followed by its visible text (WCAG 2.5.3 Label in Name).
      const searchName = joinedName(`${t.search}:`, t.searchPlaceholder);
      expect(within(header).getAllByRole("button")).toEqual(
        [searchName, t.notifications, t.appearance, t.accountMenu].map((name) =>
          within(header).getByRole("button", { name }),
        ),
      );
      const languages = within(header).getByRole("group", { name: t.language });
      expect(
        within(languages)
          .getAllByRole("link")
          .map((l) => l.firstElementChild?.textContent),
      ).toEqual(["EN", "AR"]);
      // The search wrapper grows up to the Figma 440 and may shrink (Tablet 353 at 768).
      expect(classesOf(screen.getByRole("button", { name: searchName }).parentElement)).toEqual(
        expect.arrayContaining(["flex-1", "min-w-0", "max-w-[440px]"]),
      );
      // No nested interactive elements anywhere in the bar.
      for (const control of container.querySelectorAll("a, button")) {
        expect(control.querySelector("a, button")).toBeNull();
      }
    },
  );

  it.each<Locale>(["ar", "en"])(
    "Mobile bar: fixed, 72 + inset, logo then search, notifications (O-8 lg) and the user menu (%s)",
    (locale) => {
      const { t } = renderBar(locale, "mobile");
      const header = screen.getByRole("banner");
      expect(classesOf(header)).toEqual(
        expect.arrayContaining([
          "fixed",
          "top-0",
          "rail:hidden",
          "h-[calc(72px_+_env(safe-area-inset-top))]",
          "pt-[env(safe-area-inset-top)]",
          "bg-surface-void-black/88",
          "backdrop-blur-[16px]",
          "border-b",
          "ps-lg",
          "pe-[14px]",
        ]),
      );
      expect(within(header).getByRole("img", { name: "MUNSIT AI" }).getAttribute("data-logo")).toBe(
        "horizontal",
      );
      const buttons = within(header).getAllByRole("button");
      expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual([
        t.search,
        t.notifications,
        t.accountMenu,
      ]);
      for (const button of buttons.slice(0, 2)) {
        expect(classesOf(button)).toContain("size-[44px]");
        expect(button.querySelector("svg")?.getAttribute("width")).toBe("18");
      }
      // Figma: no language switch and no theme control on the mobile bar.
      expect(within(header).queryByRole("group", { name: t.language })).toBeNull();
      expect(within(header).queryByRole("button", { name: t.appearance })).toBeNull();
    },
  );

  it("search: a button styled as the Figma field (no text input) opening «coming soon»", async () => {
    const { t, container } = renderBar("ar");
    expect(container.querySelector("input, textarea, [role=searchbox]")).toBeNull();
    // Name = approved label + the visible text (WCAG 2.5.3); the visible text is the placeholder.
    const search = screen.getByRole("button", {
      name: joinedName(`${t.search}:`, t.searchPlaceholder),
    });
    expect(search.querySelector(".sr-only")?.textContent).toBe(`${t.search}: `);
    expect(search.querySelector(".truncate")?.textContent).toBe(t.searchPlaceholder);
    expect(search.getAttribute("aria-haspopup")).toBe("dialog");
    expect(search.querySelector("svg")?.getAttribute("width")).toBe("18");
    expect(classesOf(search)).toEqual(
      expect.arrayContaining([
        "h-[44px]",
        "rounded-md",
        "px-md",
        "gap-sm",
        "border-accent-electric-sky/12",
        "bg-text-primary/4",
      ]),
    );
    await userEvent.click(search);
    expect(search.getAttribute("aria-expanded")).toBe("true");
    const panel = screen.getByRole("dialog", { name: t.search });
    expect(panel.textContent).toBe(t.searchSoon);
  });

  it("notifications: O-8 bell, no unread dot or count, «coming soon» popover titled «الإشعارات»", async () => {
    const { t, container } = renderBar("ar");
    const bell = screen.getByRole("button", { name: t.notifications });
    expect(bell.querySelector("svg")?.getAttribute("data-icon")).toBe("bell");
    expect(classesOf(bell)).toContain("size-[40px]");
    expect(container.querySelector(".bg-accent-coral-pulse")).toBeNull(); // no unread dot
    await userEvent.click(bell);
    const panel = screen.getByRole("dialog", { name: t.notifications });
    expect(within(panel).getByText(t.notifications)).toBeTruthy();
    expect(within(panel).getByText(t.notificationsSoon)).toBeTruthy();
    expect(within(panel).queryAllByRole("listitem")).toHaveLength(0); // no fabricated items
  });

  it("theme: Dark checked; Light and System disabled; selecting stores nothing", async () => {
    const { t } = renderBar("ar");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const trigger = screen.getByRole("button", { name: t.appearance });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.querySelector("svg")?.getAttribute("data-icon")).toBe("moon");
    await userEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: t.appearance });
    const options = within(menu).getAllByRole("menuitemradio");
    expect(options.map((o) => o.textContent)).toEqual([
      t.theme.dark,
      t.theme.light,
      t.theme.system,
    ]);
    expect(options.map((o) => o.getAttribute("aria-checked"))).toEqual(["true", "false", "false"]);
    expect(options.map((o) => (o as HTMLButtonElement).disabled)).toEqual([false, true, true]);
    await userEvent.click(options[0] as HTMLElement);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(setItem).not.toHaveBeenCalled();
    expect(document.cookie).toBe("");
    setItem.mockRestore();
  });

  it.each<Locale>(["ar", "en"])(
    "language switch: links to the same page in each language, current marked (%s)",
    (locale) => {
      routerState.params = { locale };
      const { t } = renderBar(locale);
      const group = screen.getByRole("group", { name: t.language });
      // Exact names: the visible code, then the language named in itself (WCAG 2.5.3).
      const en = within(group).getByRole("link", { name: joinedName("EN", "English") });
      const ar = within(group).getByRole("link", { name: joinedName("AR", "العربية") });
      // The current language links without `locale` (clean URL). The other language passes
      // `locale`, which next-intl always prefixes; `/ar/...` then redirects to the unprefixed
      // Arabic URL (as-needed prefix, checked in Chromium).
      expect(en.getAttribute("href")).toBe("/en/dashboard");
      expect(ar.getAttribute("href")).toBe(locale === "ar" ? "/dashboard" : "/ar/dashboard");
      expect(en.querySelector(".sr-only")?.getAttribute("lang")).toBe("en");
      expect(ar.querySelector(".sr-only")?.getAttribute("lang")).toBe("ar");
      expect([en.firstElementChild?.textContent, ar.firstElementChild?.textContent]).toEqual([
        "EN",
        "AR",
      ]);
      const current = locale === "en" ? en : ar;
      const other = locale === "en" ? ar : en;
      expect(current?.getAttribute("aria-current")).toBe("true");
      expect(other?.hasAttribute("aria-current")).toBe(false);
      expect(classesOf(current ?? null)).toContain("bg-accent-electric-sky/20");
      expect(group.getAttribute("dir")).toBe("ltr");
    },
  );

  it("language switch keeps the query string (repeated keys too)", () => {
    routerState.pathname = "/folders/[folderId]";
    routerState.params = { locale: "ar", folderId: "f2" };
    routerState.search = "tab=notes&tag=a&tag=b";
    const { t } = renderBar("ar");
    const group = screen.getByRole("group", { name: t.language });
    const en = within(group).getByRole("link", { name: joinedName("EN", "English") });
    const ar = within(group).getByRole("link", { name: joinedName("AR", "العربية") });
    expect(en.getAttribute("href")).toBe("/en/folders/f2?tab=notes&tag=a&tag=b");
    expect(ar.getAttribute("href")).toBe("/folders/f2?tab=notes&tag=a&tag=b");
  });

  it("theme trigger: ArrowDown opens on the first available item, ArrowUp on the last (Menu §3.3)", async () => {
    const { t } = renderBar("ar");
    const trigger = screen.getByRole("button", { name: t.appearance });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = screen.getByRole("menu", { name: t.appearance });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const [dark] = within(menu).getAllByRole("menuitemradio");
    expect(document.activeElement).toBe(dark);
    await userEvent.keyboard("{Escape}");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.focus();
    await userEvent.keyboard("{ArrowUp}");
    // Light and System are disabled, so the last available item is Dark.
    expect(document.activeElement).toBe(
      within(screen.getByRole("menu", { name: t.appearance })).getAllByRole("menuitemradio")[0],
    );
    // The key-handler wrapper adds no box, role or tab stop.
    const wrapper = trigger.parentElement;
    expect(wrapper?.tagName).toBe("SPAN");
    expect(wrapper?.className).toBe("contents");
    expect(wrapper?.hasAttribute("role")).toBe(false);
    expect(wrapper?.hasAttribute("tabindex")).toBe(false);
  });

  it("language switch keeps dynamic route params", () => {
    routerState.pathname = "/folders/[folderId]";
    routerState.params = { locale: "ar", folderId: "f2" };
    const { t } = renderBar("ar");
    const [en, ar] = within(screen.getByRole("group", { name: t.language })).getAllByRole("link");
    expect(en?.getAttribute("href")).toBe("/en/folders/f2");
    expect(ar?.getAttribute("href")).toBe("/folders/f2");
  });

  it("user menu: decorative avatar trigger; Profile and Settings open /settings; no logout", async () => {
    const { t } = renderBar("ar");
    const trigger = screen.getByRole("button", { name: t.accountMenu });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.textContent).toBe(""); // no name or role (no user data)
    expect(trigger.querySelector('[aria-hidden="true"]')).not.toBeNull(); // decorative avatar
    expect(classesOf(trigger)).toEqual(
      expect.arrayContaining(["h-[54px]", "rounded-[14px]", "px-[10px]", "gap-[10px]"]),
    );
    await userEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: t.accountMenu });
    const items = within(menu).getAllByRole("menuitem");
    expect(items.map((i) => i.textContent)).toEqual([t.profile, t.settings]);
    expect(menu.textContent).not.toContain("تسجيل الخروج");
    await userEvent.click(items[0] as HTMLElement);
    expect(routerState.push).toHaveBeenLastCalledWith("/settings");
    await userEvent.click(trigger);
    const again = within(screen.getByRole("menu", { name: t.accountMenu }));
    await userEvent.click(again.getAllByRole("menuitem")[1] as HTMLElement);
    expect(routerState.push).toHaveBeenLastCalledWith("/settings");
  });

  it.each<Locale>(["ar", "en"])(
    "has no axe violations, menus closed and open (%s)",
    async (locale) => {
      const { container, t } = renderBar(locale);
      expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
      await userEvent.click(screen.getByRole("button", { name: t.accountMenu }));
      expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
    },
  );
});

/* ------------------------------------------------------------------------- More sheet */

describe("MoreSheet (Figma 2236:972)", () => {
  function renderSheet(locale: Locale, onOpenChange = vi.fn()) {
    const labels = labelsFor(locale);
    const view = inLocale(locale, <MoreSheet open onOpenChange={onOpenChange} labels={labels} />);
    const dialog = screen.getByRole("dialog", { name: labels.more.title });
    return { ...view, labels, dialog, onOpenChange };
  }

  beforeEach(() => {
    routerState.pathname = "/dashboard";
    routerState.params = { locale: "ar" };
    routerState.search = "";
  });

  it.each<Locale>(["ar", "en"])(
    "Phase 03 Sheet titled «المزيد» with «إغلاق القائمة»; registry rows in Figma order (%s)",
    (locale) => {
      routerState.params = { locale };
      const { labels, dialog } = renderSheet(locale);
      expect(showModal).toHaveBeenCalled();
      expect(within(dialog).getByRole("button", { name: labels.more.close })).toBeTruthy();
      const rows = within(screen.getByTestId("more-sheet-rows")).getAllByRole("link");
      const prefix = prefixOf(locale);
      const more = DESTINATIONS.filter((d) => d.mobile === "more");
      // 5 destinations, account settings, the two language links, upgrade.
      expect(rows.map((r) => r.getAttribute("href"))).toEqual([
        ...more.map((d) => `${prefix}${ROUTES[d.routeKey]}`),
        `${prefix}/settings`,
        "/en/dashboard",
        locale === "ar" ? "/dashboard" : "/ar/dashboard",
        `${prefix}/settings/subscription`,
      ]);
      expect(rows.slice(0, 5).map((r) => r.textContent)).toEqual(
        more.map((d) => MESSAGES[locale].nav.destinations[d.id]),
      );
      expect(rows[5]?.textContent).toBe(labels.more.accountSettings);
      expect(rows.at(-1)?.textContent).toBe(labels.upgrade.title);
      expect(within(dialog).getByRole("group", { name: labels.topBar.language })).toBeTruthy();
      // The bar destinations are not in the sheet.
      for (const bar of DESTINATIONS.filter((d) => d.mobile === "bar")) {
        expect(within(dialog).queryByText(MESSAGES[locale].nav.destinations[bar.id])).toBeNull();
      }
    },
  );

  it.each<[string | null, string | null]>([
    ["questions", MESSAGES.ar.nav.destinations.questions],
    ["folders", MESSAGES.ar.nav.destinations.folders],
    ["dashboard", null], // a bar destination: nothing in the sheet is current
    [null, null], // Settings (D-R6): no current row, not even account settings
  ])("current row for destination %s", (id, expected) => {
    active.destination = id;
    renderSheet("ar");
    const current = within(screen.getByTestId("more-sheet-rows")).queryAllByRole("link", {
      current: "page",
    });
    expect(current.map((c) => c.textContent)).toEqual(expected === null ? [] : [expected]);
  });

  it("Figma row values; upgrade row Sky 12% / 30% with a Sky label", () => {
    renderSheet("ar");
    const rows = within(screen.getByTestId("more-sheet-rows")).getAllByRole("link");
    const first = rows[0] ?? null;
    expect(classesOf(first)).toEqual(
      expect.arrayContaining([
        "min-h-[56px]",
        "rounded-[14px]",
        "px-sm",
        "gap-[14px]",
        "bg-accent-electric-sky/5",
        "border-accent-electric-sky/10",
        "text-dashboard-body-medium",
      ]),
    );
    const tile = first?.querySelector("span");
    expect(classesOf(tile ?? null)).toEqual(
      expect.arrayContaining([
        "size-[36px]",
        "bg-accent-electric-sky/14",
        "text-accent-electric-sky",
      ]),
    );
    expect(tile?.querySelector("svg")?.getAttribute("width")).toBe("18");
    const upgrade = rows.at(-1) ?? null;
    expect(classesOf(upgrade)).toEqual(
      expect.arrayContaining([
        "bg-accent-electric-sky/12",
        "border-accent-electric-sky/30",
        "text-accent-electric-sky",
        "px-[14px]",
      ]),
    );
    expect(upgrade?.querySelector("svg")?.getAttribute("data-icon")).toBe("crown");
  });

  it("a destination, the upgrade row or a language link closes the sheet", async () => {
    const { onOpenChange, labels, dialog } = renderSheet("ar");
    const block = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("click", block);
    try {
      await userEvent.click(within(dialog).getByRole("link", { name: "الملاحظات" }));
      await userEvent.click(within(dialog).getByRole("link", { name: labels.upgrade.title }));
      await userEvent.click(
        within(dialog).getByRole("link", { name: joinedName("EN", "English") }),
      );
    } finally {
      document.removeEventListener("click", block);
    }
    expect(onOpenChange.mock.calls).toEqual([[false], [false], [false]]);
  });

  it("the close button requests closing (Esc and scrim: Chromium)", async () => {
    const { onOpenChange, labels, dialog } = renderSheet("ar");
    await userEvent.click(within(dialog).getByRole("button", { name: labels.more.close }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it.each<Locale>(["ar", "en"])("has no axe violations (%s)", async (locale) => {
    routerState.params = { locale };
    const { container } = renderSheet(locale);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

/* ------------------------------------------------------------------------- Bottom navigation */

describe("BottomNav (Figma 2238:1187)", () => {
  function renderNav(locale: Locale = "ar") {
    const labels = labelsFor(locale);
    const view = inLocale(locale, <BottomNav labels={labels} />);
    const nav = screen.getByRole("navigation", { name: labels.bottomNavigation });
    const more = within(nav).getByRole("button", { name: labels.more.title });
    return { ...view, labels, nav, more };
  }

  const ACTIVE = "bg-accent-electric-sky/12";

  beforeEach(() => {
    routerState.pathname = "/dashboard";
    routerState.params = { locale: "ar" };
    routerState.search = "";
  });

  it.each<Locale>(["ar", "en"])(
    "named landmark; the three bar destinations in registry order, then More (%s)",
    (locale) => {
      routerState.params = { locale };
      const { nav, labels } = renderNav(locale);
      const items = within(nav).getAllByRole("listitem");
      expect(items).toHaveLength(4);
      const bar = DESTINATIONS.filter((d) => d.mobile === "bar");
      const links = within(nav).getAllByRole("link");
      expect(links.map((l) => l.textContent)).toEqual(
        bar.map((d) => MESSAGES[locale].nav.destinations[d.id]),
      );
      expect(links.map((l) => l.getAttribute("href"))).toEqual(
        bar.map((d) => `${prefixOf(locale)}${ROUTES[d.routeKey]}`),
      );
      expect(items[3]?.textContent).toBe(labels.more.title);
      expect(within(items[3] as HTMLElement).getByRole("button")).toBeTruthy();
    },
  );

  it.each<[DestinationId | null, string | null, boolean]>([
    ["dashboard", "/dashboard", false],
    ["summaries", "/summaries", false],
    ["questions", null, true], // a More-sheet destination: More looks Active, no aria-current
    ["folders", null, true],
    [null, null, false], // Settings and other routes without a destination: nothing (D-R6)
  ])("indicator for %s (mobileBarIndicator)", (destination, currentHref, moreActive) => {
    active.destination = destination;
    const { nav, more } = renderNav();
    const current = nav.querySelectorAll("[aria-current]");
    expect([...current].map((el) => el.getAttribute("href"))).toEqual(
      currentHref ? [currentHref] : [],
    );
    expect(current[0]?.getAttribute("aria-current") ?? "page").toBe("page");
    expect(more.hasAttribute("aria-current")).toBe(false);
    expect(classesOf(more).includes(ACTIVE)).toBe(moreActive);
  });

  it("More opens the More sheet; Esc closes it and aria-expanded follows", async () => {
    const { more, labels } = renderNav();
    expect(more.getAttribute("aria-haspopup")).toBe("dialog");
    expect(more.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(more);
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(more.getAttribute("aria-expanded")).toBe("true");
    const dialog = screen.getByRole("dialog", { name: labels.more.title });
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    expect(more.getAttribute("aria-expanded")).toBe("false");
  });

  it("an open sheet does not change the indicator; selecting a destination closes it", async () => {
    active.destination = "dashboard";
    const { more, labels } = renderNav();
    await userEvent.click(more);
    expect(classesOf(more)).not.toContain(ACTIVE); // open/closed is separate UI state (D-R6)
    const dialog = screen.getByRole("dialog", { name: labels.more.title });
    fireEvent.click(within(dialog).getByRole("link", { name: MESSAGES.ar.nav.destinations.notes }));
    expect(more.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes the sheet when the viewport leaves the mobile range", async () => {
    const { more } = renderNav();
    await userEvent.click(more);
    expect(more.getAttribute("aria-expanded")).toBe("true");
    mediaMatches = false;
    act(() => {
      for (const listener of mediaListeners) listener();
    });
    expect(more.getAttribute("aria-expanded")).toBe("false");
  });

  it("Figma bar: fixed, mobile only, Ink 94%, Sky 12% top border, blur 16, safe-area, 320 fit", () => {
    const { nav } = renderNav();
    expect(classesOf(nav)).toEqual(
      expect.arrayContaining([
        "fixed",
        "inset-x-0",
        "bottom-0",
        "rail:hidden",
        "h-[calc(84px_+_env(safe-area-inset-bottom))]",
        "border-t",
        "border-accent-electric-sky/12",
        "bg-surface-ink/94",
        "backdrop-blur-[16px]",
        "pt-[8px]",
        "pb-[calc(16px_+_env(safe-area-inset-bottom))]",
        "px-[max(0px,min(16px,calc((100%_-_304px)/2)))]",
      ]),
    );
    expect(classesOf(nav.querySelector("ul"))).toEqual(
      expect.arrayContaining(["flex", "justify-between", "items-start"]),
    );
    for (const item of within(nav).getAllByRole("listitem")) {
      expect(classesOf(item)).toContain("shrink-0");
    }
  });

  it.each<Locale>(["ar", "en"])("has no axe violations (%s)", async (locale) => {
    routerState.params = { locale };
    active.destination = "questions";
    const { container } = renderNav(locale);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

import AxeBuilder from "@axe-core/playwright";
import type { Dialog, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arNav from "../../src/i18n/messages/ar/nav.json" with { type: "json" };
import arPatterns from "../../src/i18n/messages/ar/patterns.json" with { type: "json" };
import arShell from "../../src/i18n/messages/ar/shell.json" with { type: "json" };
import enNav from "../../src/i18n/messages/en/nav.json" with { type: "json" };
import enPatterns from "../../src/i18n/messages/en/patterns.json" with { type: "json" };
import enShell from "../../src/i18n/messages/en/shell.json" with { type: "json" };

/**
 * Phase 06 Increment 1 — navigation guard technical proof (plan §7.1–§7.2, D-U7), on the dev-only
 * harness route inside the real app shell (D-U9). Every test checks the real URL, history and
 * page state, not only the dialog.
 *
 * - App-controlled paths (links, router, in-app history traversal) use the custom dialog.
 * - Browser-controlled paths (refresh, tab close) can only use the native `beforeunload` prompt,
 *   observed as a Playwright `dialog` event of type "beforeunload" (needs prior interaction).
 * - History: the default suites run Chromium's **Navigation API** path (history never modified).
 *   The "fallback" suites remove `window.navigation` before any script runs, to prove the
 *   sentinel path used by browsers without the Navigation API, including its known limitations.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", prefix: "", nav: arNav, shell: arShell, guard: arPatterns.guard },
  { locale: "en", dir: "ltr", prefix: "/en", nav: enNav, shell: enShell, guard: enPatterns.guard },
] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const status = (page: Page) => page.getByTestId("guard-status");
const guardDialog = (page: Page) => page.getByRole("alertdialog");
const path = (page: Page) => new URL(page.url()).pathname;

async function openHarness(page: Page, prefix: string) {
  await page.goto(`${prefix}/dev/fixtures/navigation-guard`);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("guard-toggle"));
}

/** Listeners of the types the guard may add (Chromium DevTools protocol listener registry). */
async function guardListenerCounts(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const listenersOf = async (expression: string) => {
    const { result } = await cdp.send("Runtime.evaluate", { expression });
    if (!result.objectId) return [];
    return (await cdp.send("DOMDebugger.getEventListeners", { objectId: result.objectId }))
      .listeners;
  };
  const onWindow = await listenersOf("window");
  const onNavigation = await listenersOf("window.navigation ?? null");
  await cdp.detach();
  const count = (type: string, capture: boolean) =>
    onWindow.filter((l) => l.type === type && l.useCapture === capture).length;
  return {
    clickCapture: count("click", true),
    popstate: count("popstate", false),
    beforeunload: count("beforeunload", false),
    navigate: onNavigation.filter((l) => l.type === "navigate").length,
  };
}

/** Turns the guard on and waits until its listeners are attached (both history paths). */
async function guardOn(page: Page) {
  const before = (await guardListenerCounts(page)).beforeunload;
  await page.getByTestId("guard-toggle").click();
  await expect(status(page)).toHaveAttribute("data-guard", "on");
  await expect.poll(async () => (await guardListenerCounts(page)).beforeunload).toBe(before + 1);
}

/**
 * Opens the harness after /dashboard through a client-side (same-document) navigation, as a user
 * arriving from the app would. Uses the Next.js dev router (`window.next.router`), so no product
 * link to the dev-only route is needed.
 */
async function harnessAfterDashboard(page: Page, prefix: string) {
  await page.goto(`${prefix}/dashboard`);
  await page.evaluate(() => document.fonts.ready);
  // The router must be initialized (hydrated) before a client navigation.
  await waitForHydration(page, page.locator('[data-shell="sidebar"] a').first());
  await clientNavigate(page, `${prefix}/dev/fixtures/navigation-guard`);
}

async function clientNavigate(page: Page, href: string) {
  // The app router initializes after hydration; push only once the page is idle.
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  await expect
    .poll(() =>
      page.evaluate(() => typeof (window as { next?: { router?: unknown } }).next?.router),
    )
    .toBe("object");
  await page.evaluate((target) => {
    (window as unknown as { next: { router: { push: (h: string) => void } } }).next.router.push(
      target,
    );
  }, href);
  await page.waitForURL((url) => url.pathname === href);
  await waitForHydration(page, page.getByTestId("guard-toggle"));
}

const NO_NAVIGATION_API = () => {
  Object.defineProperty(window, "navigation", { value: undefined, configurable: true });
};

for (const { locale, dir, prefix, nav, shell, guard } of LOCALES) {
  const harness = `${prefix}/dev/fixtures/navigation-guard`;
  const stay = (page: Page) => guardDialog(page).getByRole("button", { name: guard.unsaved.stay });
  const leave = (page: Page) =>
    guardDialog(page).getByRole("button", { name: guard.unsaved.leave });

  test.describe(`Navigation guard (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
    });

    test("guard OFF: links, router and Back navigate normally; no dialog, no history entry", async ({
      page,
    }) => {
      await harnessAfterDashboard(page, prefix);
      const length = await page.evaluate(() => history.length);
      await page.getByTestId("guard-in-page-link").click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await expect(guardDialog(page)).toHaveCount(0);
      expect(await page.evaluate(() => history.length)).toBe(length + 1);
      await page.goBack();
      await expect(page).toHaveURL((url) => url.pathname === harness);
      await page.goBack();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
    });

    test("toggle ON then OFF: history untouched, listeners added then fully removed; Back leaves in one press", async ({
      page,
    }) => {
      await harnessAfterDashboard(page, prefix);
      const length = await page.evaluate(() => history.length);
      const before = await guardListenerCounts(page);
      await guardOn(page);
      expect(await guardListenerCounts(page)).toEqual({
        ...before,
        clickCapture: before.clickCapture + 1,
        beforeunload: before.beforeunload + 1,
        navigate: before.navigate + 1,
      });
      expect(await page.evaluate(() => history.length)).toBe(length); // no entry pushed
      await page.getByTestId("guard-toggle").click();
      await expect(status(page)).toHaveAttribute("data-guard", "off");
      await expect.poll(() => guardListenerCounts(page)).toEqual(before);
      expect(await page.evaluate(() => history.length)).toBe(length);
      await page.evaluate(() => history.back());
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
    });

    test("Sidebar link: Stay keeps the page, state and focus; Leave navigates once", async ({
      page,
    }) => {
      await openHarness(page, prefix);
      await guardOn(page);
      const link = page
        .locator('[data-shell="sidebar"]')
        .getByRole("link", { name: nav.destinations.lectures });
      await link.click();
      const dialog = guardDialog(page);
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleName(guard.unsaved.title);
      await expect(dialog).toHaveAccessibleDescription(guard.unsaved.description);
      await expect(stay(page)).toBeFocused();
      expect(path(page)).toBe(harness);
      expect(await page.evaluate(() => document.dir)).toBe(dir);

      await stay(page).click();
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
      await expect(link).toBeFocused();

      await link.click();
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await expect(guardDialog(page)).toHaveCount(0);
      await page.evaluate(() => history.back());
      await expect(page).toHaveURL((url) => url.pathname === harness);
    });

    test("Esc and the scrim mean Stay", async ({ page }) => {
      await openHarness(page, prefix);
      await guardOn(page);
      const link = page
        .locator('[data-shell="sidebar"]')
        .getByRole("link", { name: nav.destinations.notes });
      await link.click();
      await expect(guardDialog(page)).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
      await link.click();
      await expect(guardDialog(page)).toBeVisible();
      await page.mouse.click(10, 10);
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
    });

    test("in-page link, programmatic navigation and the user menu are guarded", async ({
      page,
    }) => {
      await openHarness(page, prefix);
      await guardOn(page);

      await page.getByTestId("guard-in-page-link").click();
      await expect(guardDialog(page)).toBeVisible();
      await stay(page).click();
      expect(path(page)).toBe(harness);

      await page.getByTestId("guard-programmatic").click();
      await expect(guardDialog(page)).toBeVisible();
      await stay(page).click();
      expect(path(page)).toBe(harness);
      await expect(page.getByTestId("guard-programmatic")).toBeFocused();

      await page.getByRole("button", { name: shell.accountMenu }).click();
      await page.getByRole("menuitem", { name: shell.settings }).click();
      await expect(guardDialog(page)).toBeVisible();
      expect(path(page)).toBe(harness);
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/settings`);

      await page.evaluate(() => history.back());
      await expect(page).toHaveURL((url) => url.pathname === harness);
      await waitForHydration(page, page.getByTestId("guard-toggle"));
      await guardOn(page);
      await page.getByTestId("guard-programmatic").click();
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/summaries`);
    });

    test("language switch link is guarded and Leave switches the language", async ({ page }) => {
      await openHarness(page, prefix);
      await guardOn(page);
      const other = locale === "ar" ? "en" : "ar";
      await page
        .locator('[data-shell="top-bar"]')
        .getByRole("group", { name: shell.language })
        .getByRole("link", { name: shell.languageNames[other] })
        .click();
      await expect(guardDialog(page)).toBeVisible();
      expect(path(page)).toBe(harness);
      await leave(page).click();
      await expect(page.locator("html")).toHaveAttribute("lang", other);
      await expect(page).toHaveURL(
        (url) => url.pathname === `${other === "en" ? "/en" : ""}/dev/fixtures/navigation-guard`,
      );
    });

    test("1024 Rail and drawer links: Stay closes only the guard; Leave closes the drawer and navigates", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await openHarness(page, prefix);
      await guardOn(page);
      const rail = page.locator('[data-shell="rail"]');
      await rail.getByRole("link", { name: nav.destinations.summaries }).click();
      await expect(guardDialog(page)).toBeVisible();
      await stay(page).click();
      expect(path(page)).toBe(harness);

      await rail.getByRole("button", { name: shell.openMenu }).click();
      const drawer = page.locator('dialog[data-shell="drawer"]');
      await expect(drawer).toHaveAttribute("data-state", "open");
      const drawerLink = drawer.getByRole("link", { name: nav.destinations.folders });
      await drawerLink.click();
      await expect(guardDialog(page)).toBeVisible();
      await stay(page).click();
      await expect(guardDialog(page)).toHaveCount(0);
      await expect(drawer).toHaveAttribute("data-state", "open");
      await expect(drawerLink).toBeFocused();
      expect(path(page)).toBe(harness);

      await drawerLink.click();
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/folders`);
      await expect(page.locator("dialog[open]")).toHaveCount(0);
    });

    test("390 bottom bar and More sheet links are guarded", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openHarness(page, prefix);
      await guardOn(page);
      const bar = page.locator('[data-shell="bottom-nav"]');
      await bar.getByRole("link", { name: nav.destinations.lectures }).click();
      await expect(guardDialog(page)).toBeVisible();
      await stay(page).click();
      expect(path(page)).toBe(harness);

      await bar.getByRole("button", { name: nav.more }).click();
      const sheet = page.locator('dialog[open]:not([role="alertdialog"])');
      await expect(sheet).toHaveAttribute("data-state", "open");
      await sheet.getByRole("link", { name: nav.destinations.notes }).click();
      await expect(guardDialog(page)).toBeVisible();
      await stay(page).click();
      await expect(sheet).toHaveAttribute("data-state", "open");
      expect(path(page)).toBe(harness);

      await sheet.getByRole("link", { name: nav.destinations.notes }).click();
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/notes`);
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    });

    /*
     * Browser Back contract (G-1, RISK ACCEPTED — BROWSER LIMITATION, 2026-11-18; see
     * docs/phases/phase-06-g1-findings.md). The HTML Standard lets a page cancel a Back started
     * from the browser UI only while it holds history-action user activation, and each
     * cancellation consumes it; Esc never grants it. So:
     * - guaranteed: a browser Back after a user interaction is asked; Stay (click or Enter) or
     *   any key other than Esc, or a click, makes the next Back asked again;
     * - browser-controlled: a second Back with no interaction in between (Esc, then Back; or
     *   Back twice) is not cancelable and leaves. The last test reproduces it on purpose.
     * Test contract change: the former test expected repeated Backs dismissed with Esc to be
     * asked every time, and passed only when Playwright page calls (which run with a user
     * gesture) happened to grant activation. Its script-driven `history.back()` loop is not a
     * user path (app code navigates through useGuardedRouter) and is covered by the rapid-Back
     * tests below.
     */
    test("browser Back (user-initiated): Stay keeps page, state and history; after Stay the next Back is asked again; Leave goes back", async ({
      page,
    }) => {
      await harnessAfterDashboard(page, prefix);
      await guardOn(page); // a click: user activation
      const length = await page.evaluate(() => history.length);

      // User-initiated Back (as the browser button): cancelled, so it never completes.
      await page.goBack({ timeout: 1500 }).catch(() => {});
      await expect(guardDialog(page)).toBeVisible();
      expect(path(page)).toBe(harness);
      await stay(page).click(); // a click: new user activation
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on"); // not remounted
      expect(await page.evaluate(() => history.length)).toBe(length);

      // Enter on Stay is a keyboard activation too: the next Back is asked again.
      await page.goBack({ timeout: 1500 }).catch(() => {});
      await expect(guardDialog(page)).toBeVisible();
      await expect(stay(page)).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);

      await page.goBack({ timeout: 1500 }).catch(() => {});
      await expect(guardDialog(page)).toBeVisible();
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
      await expect(guardDialog(page)).toHaveCount(0);
    });

    test("browser Back, then Esc: Esc is Stay (focus restored); after a later key press Back is asked again", async ({
      page,
    }) => {
      await harnessAfterDashboard(page, prefix);
      await guardOn(page);
      await page.getByTestId("guard-programmatic").focus();

      await page.goBack({ timeout: 1500 }).catch(() => {});
      await expect(guardDialog(page)).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
      await expect(page.getByTestId("guard-programmatic")).toBeFocused();

      // Tab is an activation-triggering key (Esc is not): the next Back is cancelable again.
      await page.keyboard.press("Tab");
      await page.goBack({ timeout: 1500 }).catch(() => {});
      await expect(guardDialog(page)).toBeVisible();
      expect(path(page)).toBe(harness);
      await page.keyboard.press("Escape");
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
    });

    for (const [name, between] of [
      ["Esc, then Back", "escape"],
      ["Back twice, no interaction", "none"],
    ] as const) {
      test(`G-1 reproduction (RISK ACCEPTED — browser limitation): ${name} leaves; the browser marks it non-cancelable`, async ({
        page,
      }) => {
        await harnessAfterDashboard(page, prefix);
        await guardOn(page);
        await page.evaluate(() => {
          const log: string[] = [];
          (window as unknown as { g1Log: string[] }).g1Log = log;
          window.navigation?.addEventListener(
            "navigate",
            (event) => log.push(`${event.navigationType}:${event.cancelable}`),
            { capture: true },
          );
        });

        // From here until the assertions, nothing may touch the page: Playwright page calls and
        // locator polling run with a user gesture and would grant the activation G-1 lacks.
        await page.goBack({ timeout: 1500 }).catch(() => {}); // cancelled; activation consumed
        await page.waitForTimeout(500); // dialog open; no page call (see above)
        if (between === "escape") {
          await page.keyboard.press("Escape"); // closes the dialog; grants no activation
          await page.waitForTimeout(500);
        }
        await page.goBack({ timeout: 1500 }).catch(() => {});

        await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
        const log = await page.evaluate(() => (window as unknown as { g1Log?: string[] }).g1Log);
        // Same-document traversal: the log survives (the router's own follow-up `replace` is not
        // a traversal). First Back cancelable, second not.
        expect(log?.filter((entry) => entry.startsWith("traverse:"))).toEqual([
          "traverse:true",
          "traverse:false",
        ]);
      });
    }

    test("rapid Back: two steps in the same task, and 120 ms apart, never leave or stack dialogs", async ({
      page,
    }) => {
      // Two same-document entries before the harness, so every step stays inside the app.
      await page.goto(`${prefix}/dashboard`);
      await page
        .locator('[data-shell="sidebar"]')
        .getByRole("link", { name: nav.destinations.lectures })
        .click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await waitForHydration(page, page.locator('[data-shell="sidebar"] a').first());
      await clientNavigate(page, harness);
      await guardOn(page);
      const native: string[] = [];
      page.on("dialog", (dialog: Dialog) => {
        native.push(dialog.type());
        void dialog.dismiss();
      });

      await page.evaluate(() => {
        history.back();
        history.back();
      });
      await expect(guardDialog(page)).toBeVisible();
      await page.waitForTimeout(400);
      expect(path(page)).toBe(harness);
      await expect(guardDialog(page)).toHaveCount(1);
      await expect(status(page)).toHaveAttribute("data-guard", "on"); // same document, state kept
      expect(native).toEqual([]); // both steps were same-document: custom dialog only
      await page.keyboard.press("Escape");

      await page.evaluate(async () => {
        history.back();
        await new Promise((resolve) => setTimeout(resolve, 120));
        history.back();
      });
      await expect(guardDialog(page)).toBeVisible();
      await page.waitForTimeout(400);
      expect(path(page)).toBe(harness);
      await expect(guardDialog(page)).toHaveCount(1);
      await page.keyboard.press("Escape");

      const link = page
        .locator('[data-shell="sidebar"]')
        .getByRole("link", { name: nav.destinations.favorites });
      await link.dblclick();
      await expect(guardDialog(page)).toHaveCount(1);
      await page.keyboard.press("Escape");
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
    });

    test("multi-entry jump (as from the browser's history menu) is asked; Leave lands on the chosen entry", async ({
      page,
    }) => {
      await page.goto(`${prefix}/dashboard`);
      await page
        .locator('[data-shell="sidebar"]')
        .getByRole("link", { name: nav.destinations.lectures })
        .click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await waitForHydration(page, page.locator('[data-shell="sidebar"] a').first());
      await clientNavigate(page, `${prefix}/dev/fixtures/navigation-guard`);
      await guardOn(page);
      await page.evaluate(() => history.go(-2));
      await expect(guardDialog(page)).toBeVisible();
      await page.waitForTimeout(300);
      expect(path(page)).toBe(harness);
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
    });

    test("Forward entries are kept; Forward is asked; Stay keeps it available, Leave goes forward", async ({
      page,
    }) => {
      await openHarness(page, prefix);
      await page.getByTestId("guard-in-page-link").click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await page.goBack();
      await expect(page).toHaveURL((url) => url.pathname === harness);
      await waitForHydration(page, page.getByTestId("guard-toggle"));
      await guardOn(page);

      // User-initiated Forward (as the browser button): cancelled, so it never completes.
      await page.goForward({ timeout: 1500 }).catch(() => {});
      await expect(guardDialog(page)).toBeVisible();
      expect(path(page)).toBe(harness);
      await stay(page).click();
      expect(path(page)).toBe(harness);
      expect(await page.evaluate(() => window.navigation.canGoForward)).toBe(true);

      // Asked again after Stay (user-initiated); Leave goes forward to the kept entry.
      await page.goForward({ timeout: 1500 }).catch(() => {});
      await expect(guardDialog(page)).toBeVisible();
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
    });

    test("hash change on the guarded page: the guard stays on; a hash-only Back is not asked", async ({
      page,
    }) => {
      await harnessAfterDashboard(page, prefix);
      await guardOn(page);
      await page.evaluate(() => {
        location.hash = "section";
      });
      await expect(page).toHaveURL((url) => url.hash === "#section");
      // Links are still guarded after the hash change.
      await page.getByTestId("guard-in-page-link").click();
      await expect(guardDialog(page)).toBeVisible();
      await stay(page).click();
      // Back to the same page without the hash: stays on the page, no dialog.
      await page.evaluate(() => history.back());
      await expect(page).toHaveURL((url) => url.pathname === harness && url.hash === "");
      await page.waitForTimeout(300);
      await expect(guardDialog(page)).toHaveCount(0);
      // Back to another page: asked.
      await page.evaluate(() => history.back());
      await expect(guardDialog(page)).toBeVisible();
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
    });

    test("refresh: native beforeunload prompt; dismiss keeps the page, accept reloads", async ({
      page,
    }) => {
      await openHarness(page, prefix);
      await guardOn(page); // the click is the user interaction browsers require
      const seen: string[] = [];
      let decision: "dismiss" | "accept" = "dismiss";
      page.on("dialog", (dialog: Dialog) => {
        seen.push(dialog.type());
        void (decision === "dismiss" ? dialog.dismiss() : dialog.accept());
      });
      await page.evaluate(() => {
        setTimeout(() => location.reload(), 0);
      });
      await expect.poll(() => seen.length).toBe(1);
      expect(seen[0]).toBe("beforeunload");
      await page.waitForTimeout(300);
      await expect(status(page)).toHaveAttribute("data-guard", "on"); // not reloaded

      decision = "accept";
      const reloaded = page.waitForEvent("load");
      await page.evaluate(() => {
        setTimeout(() => location.reload(), 0);
      });
      await reloaded;
      await expect.poll(() => seen.length).toBe(2);
      await waitForHydration(page, page.getByTestId("guard-toggle"));
      await expect(status(page)).toHaveAttribute("data-guard", "off");
    });

    test("tab close: native beforeunload prompt; dismiss keeps the tab open", async ({ page }) => {
      await openHarness(page, prefix);
      await guardOn(page);
      const seen: string[] = [];
      page.on("dialog", (dialog: Dialog) => {
        seen.push(dialog.type());
        void dialog.dismiss();
      });
      await page.close({ runBeforeUnload: true });
      await expect.poll(() => seen).toEqual(["beforeunload"]);
      expect(page.isClosed()).toBe(false);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
      page.removeAllListeners("dialog");
      page.on("dialog", (dialog: Dialog) => void dialog.accept());
    });

    test("leaving the page removes every guard listener; no prompt afterwards", async ({
      page,
    }) => {
      await openHarness(page, prefix);
      const before = await guardListenerCounts(page);
      await guardOn(page);
      await page.getByTestId("guard-in-page-link").click();
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await expect.poll(() => guardListenerCounts(page)).toEqual(before);
      const seen: string[] = [];
      page.on("dialog", (dialog: Dialog) => {
        seen.push(dialog.type());
        void dialog.accept();
      });
      await page.reload();
      expect(seen).toEqual([]);
    });

    test("recording guard copy, 420 wide; Stay first; axe", async ({ page }) => {
      await openHarness(page, prefix);
      await page.getByTestId("guard-kind").click();
      await expect(status(page)).toHaveAttribute("data-kind", "recording");
      await guardOn(page);
      await page.getByTestId("guard-in-page-link").click();
      const dialog = guardDialog(page);
      await expect(dialog).toHaveAccessibleName(guard.recording.title);
      await expect(dialog.getByRole("button", { name: guard.recording.stay })).toBeFocused();
      await page.waitForTimeout(400);
      expect(await dialog.evaluate((el) => Math.round(el.getBoundingClientRect().width))).toBe(420);
      const order = await dialog
        .locator("[data-guard-action]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-guard-action")));
      expect(order).toEqual(["stay", "leave"]);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .include('[role="alertdialog"]')
        .analyze();
      expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual([]);
    });
  });

  test.describe(`Navigation guard — fallback without the Navigation API (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(NO_NAVIGATION_API);
      await page.setViewportSize({ width: 1440, height: 900 });
    });

    test("the fallback is active: no window.navigation; a link is still guarded", async ({
      page,
    }) => {
      await openHarness(page, prefix);
      expect(await page.evaluate(() => window.navigation === undefined)).toBe(true);
      await guardOn(page);
      await page.getByTestId("guard-in-page-link").click();
      await expect(guardDialog(page)).toBeVisible();
      await leave(page).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await page.goBack();
      await expect(page).toHaveURL((url) => url.pathname === harness);
      expect(await page.evaluate(() => history.state?.__munsitGuardSentinel)).toBeUndefined();
    });

    test("Back: Stay keeps the page and state; Leave goes back; toggling off drops the sentinel", async ({
      page,
    }) => {
      await harnessAfterDashboard(page, prefix);
      await guardOn(page);
      await expect
        .poll(() => page.evaluate(() => history.state?.__munsitGuardSentinel !== undefined))
        .toBe(true);
      await page.evaluate(() => history.back());
      await expect(guardDialog(page)).toBeVisible();
      await stay(page).click();
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on");

      await page.getByTestId("guard-toggle").click();
      await expect
        .poll(() => page.evaluate(() => history.state?.__munsitGuardSentinel))
        .toBeUndefined();
      await page.evaluate(() => history.back());
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
    });

    test("LIMITATION: a multi-entry jump passes the guard, without corrupting history", async ({
      page,
    }) => {
      await harnessAfterDashboard(page, prefix);
      await guardOn(page);
      await expect
        .poll(() => page.evaluate(() => history.state?.__munsitGuardSentinel !== undefined))
        .toBe(true);
      await page.evaluate(() => history.go(-2));
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
      await page.waitForTimeout(400);
      await expect(guardDialog(page)).toHaveCount(0);
      expect(await page.evaluate(() => history.state?.__munsitGuardSentinel)).toBeUndefined();
    });

    test("LIMITATION: Forward entries are discarded while the guard is active", async ({
      page,
    }) => {
      await openHarness(page, prefix);
      await page.getByTestId("guard-in-page-link").click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await page.goBack();
      await waitForHydration(page, page.getByTestId("guard-toggle"));
      await guardOn(page);
      await expect
        .poll(() => page.evaluate(() => history.state?.__munsitGuardSentinel !== undefined))
        .toBe(true);
      await page.evaluate(() => history.forward());
      await page.waitForTimeout(400);
      expect(path(page)).toBe(harness);
      await expect(guardDialog(page)).toHaveCount(0);
    });
  });
}

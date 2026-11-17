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
 * Phase 06 Increment 1 — navigation guard technical proof (plan §7.1, D-U7), on the dev-only
 * harness route inside the real app shell (D-U9). Every test checks the real URL, history and
 * page state, not only the dialog.
 *
 * App-controlled paths (links, router, in-app Back) use the custom dialog. Browser-controlled paths
 * (refresh, tab close) can only use the native `beforeunload` prompt, observed here as a Playwright
 * `dialog` event of type "beforeunload" (Chromium; needs prior user interaction).
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", prefix: "", nav: arNav, shell: arShell, guard: arPatterns.guard },
  { locale: "en", dir: "ltr", prefix: "/en", nav: enNav, shell: enShell, guard: enPatterns.guard },
] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const status = (page: Page) => page.getByTestId("guard-status");
const guardDialog = (page: Page) => page.getByRole("alertdialog");

async function openHarness(page: Page, prefix: string) {
  await page.goto(`${prefix}/dev/guard`);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("guard-toggle"));
}

async function guardOn(page: Page) {
  await page.getByTestId("guard-toggle").click();
  await expect(status(page)).toHaveAttribute("data-guard", "on");
  // The sentinel entry is pushed one task after activation (Strict Mode safe).
  await expect
    .poll(() => page.evaluate(() => history.state?.__munsitGuardSentinel !== undefined))
    .toBe(true);
}

/** Window listeners of the three types the guard may add (Chromium DevTools protocol). */
async function guardListenerCounts(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const { result } = await cdp.send("Runtime.evaluate", { expression: "window" });
  const { listeners } = await cdp.send("DOMDebugger.getEventListeners", {
    objectId: result.objectId ?? "",
  });
  await cdp.detach();
  const count = (type: string, capture: boolean) =>
    listeners.filter((l) => l.type === type && l.useCapture === capture).length;
  return {
    clickCapture: count("click", true),
    popstate: count("popstate", false),
    beforeunload: count("beforeunload", false),
  };
}

const path = (page: Page) => new URL(page.url()).pathname;

for (const { locale, dir, prefix, nav, shell, guard } of LOCALES) {
  const harness = `${prefix}/dev/guard`;

  test.describe(`Navigation guard (${locale})`, () => {
    test("guard OFF: links, router and Back navigate normally; no dialog, no history entry", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${prefix}/dashboard`);
      await openHarness(page, prefix);
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

    test("toggle ON then OFF on the same page: listeners added then fully removed; Back is not stuck", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${prefix}/dashboard`);
      await openHarness(page, prefix);
      const before = await guardListenerCounts(page);
      await guardOn(page);
      const during = await guardListenerCounts(page);
      expect(during).toEqual({
        clickCapture: before.clickCapture + 1,
        popstate: before.popstate + 1,
        beforeunload: before.beforeunload + 1,
      });
      await page.getByTestId("guard-toggle").click();
      await expect(status(page)).toHaveAttribute("data-guard", "off");
      await expect
        .poll(() => page.evaluate(() => history.state?.__munsitGuardSentinel))
        .toBeUndefined();
      expect(await guardListenerCounts(page)).toEqual(before);
      // One Back press leaves the page (the sentinel entry was dropped).
      await page.evaluate(() => history.back());
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
    });

    test("1440 Sidebar link: Stay keeps the page, state and focus; Leave navigates", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openHarness(page, prefix);
      await guardOn(page);
      const sidebar = page.locator('[data-shell="sidebar"]');
      const link = sidebar.getByRole("link", { name: nav.destinations.lectures });
      await link.click();
      const dialog = guardDialog(page);
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleName(guard.unsaved.title);
      await expect(dialog).toHaveAccessibleDescription(guard.unsaved.description);
      await expect(dialog.getByRole("button", { name: guard.unsaved.stay })).toBeFocused();
      expect(path(page)).toBe(harness);
      expect(await page.evaluate(() => document.dir)).toBe(dir);

      await dialog.getByRole("button", { name: guard.unsaved.stay }).click();
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
      await expect(link).toBeFocused();

      await link.click();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.leave }).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await expect(guardDialog(page)).toHaveCount(0);
      // Leaving removed the sentinel first: one Back returns to the harness, not a duplicate.
      await page.goBack();
      await expect(page).toHaveURL((url) => url.pathname === harness);
      expect(await page.evaluate(() => history.state?.__munsitGuardSentinel)).toBeUndefined();
    });

    test("Esc and the scrim mean Stay", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
      await page.setViewportSize({ width: 1440, height: 900 });
      await openHarness(page, prefix);
      await guardOn(page);

      await page.getByTestId("guard-in-page-link").click();
      await expect(guardDialog(page)).toBeVisible();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.stay }).click();
      expect(path(page)).toBe(harness);

      await page.getByTestId("guard-programmatic").click();
      await expect(guardDialog(page)).toBeVisible();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.stay }).click();
      expect(path(page)).toBe(harness);
      await expect(page.getByTestId("guard-programmatic")).toBeFocused();

      await page.getByRole("button", { name: shell.accountMenu }).click();
      await page.getByRole("menuitem", { name: shell.settings }).click();
      await expect(guardDialog(page)).toBeVisible();
      expect(path(page)).toBe(harness);
      await guardDialog(page).getByRole("button", { name: guard.unsaved.leave }).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/settings`);

      await page.goBack();
      await expect(page).toHaveURL((url) => url.pathname === harness);
      await waitForHydration(page, page.getByTestId("guard-toggle"));
      await guardOn(page);
      await page.getByTestId("guard-programmatic").click();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.leave }).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/summaries`);
    });

    test("language switch link is guarded and Leave switches the language", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
      await guardDialog(page).getByRole("button", { name: guard.unsaved.leave }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", other);
      await expect(page).toHaveURL(
        (url) => url.pathname === `${other === "en" ? "/en" : ""}/dev/guard`,
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
      await guardDialog(page).getByRole("button", { name: guard.unsaved.stay }).click();
      expect(path(page)).toBe(harness);

      await rail.getByRole("button", { name: shell.openMenu }).click();
      const drawer = page.locator('dialog[data-shell="drawer"]');
      await expect(drawer).toHaveAttribute("data-state", "open");
      const drawerLink = drawer.getByRole("link", { name: nav.destinations.folders });
      await drawerLink.click();
      await expect(guardDialog(page)).toBeVisible();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.stay }).click();
      await expect(guardDialog(page)).toHaveCount(0);
      await expect(drawer).toHaveAttribute("data-state", "open"); // the drawer stays
      await expect(drawerLink).toBeFocused();
      expect(path(page)).toBe(harness);

      await drawerLink.click();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.leave }).click();
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
      await guardDialog(page).getByRole("button", { name: guard.unsaved.stay }).click();
      expect(path(page)).toBe(harness);

      await bar.getByRole("button", { name: nav.more }).click();
      const sheet = page.locator('dialog[open]:not([role="alertdialog"])');
      await expect(sheet).toHaveAttribute("data-state", "open");
      await sheet.getByRole("link", { name: nav.destinations.notes }).click();
      await expect(guardDialog(page)).toBeVisible();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.stay }).click();
      await expect(sheet).toHaveAttribute("data-state", "open");
      expect(path(page)).toBe(harness);

      await sheet.getByRole("link", { name: nav.destinations.notes }).click();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.leave }).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/notes`);
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    });

    test("browser Back: Stay keeps the page and state; repeated Back asks again; Leave goes back", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${prefix}/dashboard`);
      await openHarness(page, prefix);
      await guardOn(page);

      await page.evaluate(() => history.back());
      await expect(guardDialog(page)).toBeVisible();
      expect(path(page)).toBe(harness);
      await guardDialog(page).getByRole("button", { name: guard.unsaved.stay }).click();
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on"); // not remounted

      // Repeated Back attempts.
      for (let i = 0; i < 3; i += 1) {
        await page.evaluate(() => history.back());
        await expect(guardDialog(page)).toBeVisible();
        expect(path(page)).toBe(harness);
        await page.keyboard.press("Escape");
        await expect(guardDialog(page)).toHaveCount(0);
      }

      // Forward after a cancellation: nothing to go forward to, nothing happens.
      await page.evaluate(() => history.forward());
      await page.waitForTimeout(300);
      expect(path(page)).toBe(harness);
      await expect(guardDialog(page)).toHaveCount(0);

      await page.evaluate(() => history.back());
      await guardDialog(page).getByRole("button", { name: guard.unsaved.leave }).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
      await expect(guardDialog(page)).toHaveCount(0);
    });

    test("rapid repeated attempts at human speed: Back twice 120 ms apart and a double click never leave or stack dialogs", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${prefix}/dashboard`);
      await openHarness(page, prefix);
      await guardOn(page);
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
      await expect(status(page)).toHaveAttribute("data-guard", "on");

      const link = page
        .locator('[data-shell="sidebar"]')
        .getByRole("link", { name: nav.destinations.favorites });
      await link.dblclick();
      await expect(guardDialog(page)).toHaveCount(1);
      expect(path(page)).toBe(harness);
      await page.keyboard.press("Escape");
      await expect(guardDialog(page)).toHaveCount(0);
      expect(path(page)).toBe(harness);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
    });

    test("LIMITATION: two Back steps queued in the same task pass the guard, without corrupting history", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${prefix}/dashboard`);
      await openHarness(page, prefix);
      await guardOn(page);
      await page.evaluate(() => {
        history.back();
        history.back();
      });
      // The committed traversal cannot be cancelled: the page leaves without the dialog...
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/dashboard`);
      await page.waitForTimeout(400);
      await expect(guardDialog(page)).toHaveCount(0);
      // ...and history stays consistent: no sentinel on this entry, Forward returns to the page.
      expect(await page.evaluate(() => history.state?.__munsitGuardSentinel)).toBeUndefined();
      await page.goForward();
      await expect(page).toHaveURL((url) => url.pathname === harness);
    });

    test("Forward entries: activating the guard discards them (documented limitation)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openHarness(page, prefix);
      await page.getByTestId("guard-in-page-link").click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await page.goBack();
      await expect(page).toHaveURL((url) => url.pathname === harness);
      await waitForHydration(page, page.getByTestId("guard-toggle"));
      await guardOn(page);
      await page.evaluate(() => history.forward());
      await page.waitForTimeout(400);
      // The Forward entry was replaced by the sentinel: no navigation, no dialog, page intact.
      expect(path(page)).toBe(harness);
      await expect(guardDialog(page)).toHaveCount(0);
      await expect(status(page)).toHaveAttribute("data-guard", "on");
    });

    test("refresh: native beforeunload prompt; dismiss keeps the page, accept reloads", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
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
      await page.setViewportSize({ width: 1440, height: 900 });
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

    test("leaving the page removes every guard listener", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openHarness(page, prefix);
      const before = await guardListenerCounts(page);
      await guardOn(page);
      await page.getByTestId("guard-in-page-link").click();
      await guardDialog(page).getByRole("button", { name: guard.unsaved.leave }).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/lectures`);
      await expect.poll(() => guardListenerCounts(page)).toEqual(before);
      // No prompt any more: a reload happens without a beforeunload dialog.
      const seen: string[] = [];
      page.on("dialog", (dialog: Dialog) => {
        seen.push(dialog.type());
        void dialog.accept();
      });
      await page.reload();
      expect(seen).toEqual([]);
    });

    test("recording guard copy, 420 wide; danger action contrast; axe", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openHarness(page, prefix);
      await page.getByTestId("guard-kind").click();
      await expect(status(page)).toHaveAttribute("data-kind", "recording");
      await guardOn(page);
      await page.getByTestId("guard-in-page-link").click();
      const dialog = guardDialog(page);
      await expect(dialog).toHaveAccessibleName(guard.recording.title);
      await expect(dialog.getByRole("button", { name: guard.recording.stay })).toBeFocused();
      await page.waitForTimeout(400); // settled entrance
      expect(await dialog.evaluate((el) => Math.round(el.getBoundingClientRect().width))).toBe(420);
      // Stay before Leave in reading order (inline start).
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
}

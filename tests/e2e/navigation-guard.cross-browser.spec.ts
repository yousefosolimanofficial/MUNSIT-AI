import type { Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import enPatterns from "../../src/i18n/messages/en/patterns.json" with { type: "json" };

/*
 * R-3 (Phase 06 Increment 5): focused cross-browser coverage of the navigation guard. It runs in
 * Chromium, Firefox and WebKit (playwright.config.ts projects). The full guard suite
 * (navigation-guard.spec.ts) stays Chromium; this file checks the contract every engine must
 * meet, plus the documented engine-specific behaviour of a second browser Back (G-1).
 *
 * Evidence limits: these are Playwright's engine builds driven by automation. Playwright WebKit
 * is not Safari on macOS/iOS, `goBack()` is not the real toolbar button, and no real device is
 * involved. Real-device QA stays an R-3 obligation (Phase 06 closure report).
 */

const FIXTURE = "/en/dev/fixtures/navigation-guard";
const COPY = enPatterns.guard.unsaved;

const dialog = (page: Page) => page.getByRole("alertdialog");
const stay = (page: Page) => dialog(page).getByRole("button", { name: COPY.stay });
const leave = (page: Page) => dialog(page).getByRole("button", { name: COPY.leave });
const path = (page: Page) => new URL(page.url()).pathname;
const status = (page: Page) => page.getByTestId("guard-status");

/** The same-document entry before the fixture; Back / Leave return here. */
const PREVIOUS = "/en/lectures";

/**
 * /en/dashboard → /en/lectures through a real Sidebar link (a client navigation: it also proves
 * the app router is mounted) → the fixture through the router (a same-document entry).
 */
async function openFixture(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/dashboard");
  const lectures = page.locator(`[data-shell="sidebar"] a[href="${PREVIOUS}"]`);
  await waitForHydration(page, lectures);
  await lectures.click();
  await page.waitForURL((url) => url.pathname === PREVIOUS);
  await page.evaluate((href) => {
    (window as unknown as { next: { router: { push: (h: string) => void } } }).next.router.push(
      href,
    );
  }, FIXTURE);
  await page.waitForURL((url) => url.pathname === FIXTURE);
  await waitForHydration(page, page.getByTestId("guard-toggle"));
}

/**
 * Whether the provider's listeners are attached: a synthetic, cancelable `beforeunload` is
 * prevented only by the guard's handler (which is added in the same effect as its `navigate` and
 * click listeners). It triggers no navigation. Works in every engine (the Chromium-only suite
 * uses DevTools listener counts instead).
 */
const guardListening = (page: Page) =>
  page.evaluate(() => {
    const probe = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(probe);
    return probe.defaultPrevented;
  });

/** Turns the guard on and waits until its listeners are attached (the status renders earlier). */
async function guardOn(page: Page) {
  await page.getByTestId("guard-toggle").click();
  await expect(status(page)).toHaveAttribute("data-guard", "on");
  await expect.poll(() => guardListening(page)).toBe(true);
}

/** A user-initiated Back that the guard may cancel (the promise then never resolves). */
const userBack = (page: Page) => page.goBack({ timeout: 1500 }).catch(() => {});

test.describe("navigation guard · cross-browser contract", () => {
  test("link: Stay keeps page and state; Esc is Stay; Leave navigates once", async ({ page }) => {
    await openFixture(page);
    await guardOn(page);
    await page.getByTestId("guard-in-page-link").click();
    await expect(dialog(page)).toBeVisible();
    await expect(stay(page)).toBeFocused();
    await stay(page).click();
    await expect(dialog(page)).toHaveCount(0);
    expect(path(page)).toBe(FIXTURE);
    await expect(status(page)).toHaveAttribute("data-guard", "on");

    await page.getByTestId("guard-in-page-link").click();
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
    expect(path(page)).toBe(FIXTURE);

    await page.getByTestId("guard-in-page-link").click();
    await leave(page).click();
    await expect(page).toHaveURL((url) => url.pathname === "/en/lectures");
  });

  test("guarded router: Stay keeps the page; Leave navigates", async ({ page }) => {
    await openFixture(page);
    await guardOn(page);
    await page.getByTestId("guard-programmatic").click();
    await expect(dialog(page)).toBeVisible();
    await stay(page).click();
    expect(path(page)).toBe(FIXTURE);
    await page.getByTestId("guard-programmatic").click();
    await leave(page).click();
    await expect(page).toHaveURL((url) => url.pathname === "/en/summaries");
  });

  test("browser Back: asked; Stay keeps page, state and history", async ({ page }) => {
    await openFixture(page);
    await guardOn(page);
    const length = await page.evaluate(() => history.length);
    await userBack(page);
    await expect(dialog(page)).toBeVisible();
    await expect(stay(page)).toBeFocused();
    await stay(page).click();
    await expect(dialog(page)).toHaveCount(0);
    expect(path(page)).toBe(FIXTURE);
    expect(await page.evaluate(() => history.length)).toBe(length);
    await expect(status(page)).toHaveAttribute("data-guard", "on");
  });

  test("browser Back: Leave goes back once", async ({ page, browserName }) => {
    /*
     * W-1 (Phase 06 closure report, R-3): in Playwright's WebKit build, Leave after a cancelled
     * Back (`navigation.traverseTo`) triggers a native beforeunload prompt; accepting it reloads
     * the guarded page instead of going back, dismissing it aborts the traversal. Not encoded as
     * expected behaviour: kept as a visible fixme until verified on real Safari.
     */
    test.fixme(browserName === "webkit", "W-1: WebKit Leave after a cancelled Back (R-3)");
    await openFixture(page);
    await guardOn(page);
    await userBack(page);
    await expect(dialog(page)).toBeVisible();
    await leave(page).click();
    await expect(page).toHaveURL((url) => url.pathname === PREVIOUS);
    await expect(dialog(page)).toHaveCount(0);
  });

  test("browser Back again after Stay: asked again", async ({ page }) => {
    await openFixture(page);
    await guardOn(page);
    const native: string[] = [];
    page.on("dialog", (prompt) => {
      native.push(prompt.type());
      void prompt.dismiss();
    });
    await userBack(page);
    await expect(dialog(page)).toBeVisible();
    await stay(page).click(); // a click: new user activation
    await expect(dialog(page)).toHaveCount(0);
    await userBack(page);
    await expect(dialog(page)).toBeVisible();
    expect(native).toEqual([]);
    expect(path(page)).toBe(FIXTURE);
    await expect(status(page)).toHaveAttribute("data-guard", "on");
  });

  test("refresh: native beforeunload prompt; dismissing keeps the page and the guard", async ({
    page,
  }) => {
    await openFixture(page);
    await guardOn(page);
    const native: string[] = [];
    page.on("dialog", (prompt) => {
      native.push(prompt.type());
      void prompt.dismiss();
    });
    await page.reload({ timeout: 3000 }).catch(() => {});
    await expect.poll(() => native).toEqual(["beforeunload"]);
    expect(path(page)).toBe(FIXTURE);
    await expect(status(page)).toHaveAttribute("data-guard", "on");
  });

  test("guard off: history untouched; Back leaves in one press with no prompt", async ({
    page,
  }) => {
    await openFixture(page);
    const length = await page.evaluate(() => history.length);
    await guardOn(page);
    await page.getByTestId("guard-toggle").click();
    await expect(status(page)).toHaveAttribute("data-guard", "off");
    await expect.poll(() => guardListening(page)).toBe(false); // listeners removed
    expect(await page.evaluate(() => history.length)).toBe(length);
    const native: string[] = [];
    page.on("dialog", (prompt) => {
      native.push(prompt.type());
      void prompt.dismiss();
    });
    await page.goBack();
    await expect(page).toHaveURL((url) => url.pathname === PREVIOUS);
    await expect(dialog(page)).toHaveCount(0);
    expect(native).toEqual([]);
  });

  /*
   * G-1 per engine (documented in docs/phases/phase-06-g1-findings.md §3a). No page calls between
   * the two Backs: Playwright page calls can grant user activation and hide the behaviour.
   */
  test("G-1 · second browser Back after Esc: engine-specific outcome (documented)", async ({
    page,
    browserName,
  }) => {
    await openFixture(page);
    await guardOn(page);
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { g1Log: string[] }).g1Log = log;
      window.navigation?.addEventListener("navigate", (event) =>
        log.push(`${event.navigationType}:${event.cancelable}`),
      );
    });
    const native: string[] = [];
    page.on("dialog", (prompt) => {
      native.push(prompt.type());
      void prompt.dismiss();
    });

    await userBack(page); // cancelled: the app dialog opens
    await page.waitForTimeout(500); // no page call (see above)
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    await userBack(page);
    await page.waitForTimeout(800);

    if (browserName === "chromium") {
      // Chromium: non-cancelable without new user activation → leaves (G-1, RISK ACCEPTED).
      await expect(page).toHaveURL((url) => url.pathname === PREVIOUS);
      const log = await page.evaluate(
        () => (window as unknown as { g1Log?: string[] }).g1Log ?? [],
      );
      expect(log.filter((entry) => entry.startsWith("traverse:"))).toEqual([
        "traverse:true",
        "traverse:false",
      ]);
    } else {
      // Firefox and WebKit (Playwright builds): the second traversal stays cancelable → asked
      // again. (WebKit, when the previous entry is the document's initial load entry, asks with
      // the native beforeunload prompt instead: findings §3a.)
      await expect(dialog(page)).toBeVisible();
      expect(path(page)).toBe(FIXTURE);
      expect(native).toEqual([]);
    }
  });
});

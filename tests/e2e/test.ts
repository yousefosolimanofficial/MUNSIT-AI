import { test as base, expect, type Locator, type Page } from "@playwright/test";

/**
 * Shared Playwright `test` for every E2E spec (issue #3).
 *
 * The auto fixture only listens: it never intercepts, filters or silences console output. It
 * fails a test when the browser reports
 * - a React hydration warning (any console message mentioning hydration), or
 * - any other `console.error`, or an uncaught page error.
 * A test that changes server-rendered markup before React has hydrated it causes a hydration
 * warning; the guard keeps that, and any other browser error, from passing silently.
 */
export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use) => {
      const hydration: string[] = [];
      const errors: string[] = [];
      page.on("console", (message) => {
        const text = message.text().slice(0, 300);
        if (/hydrat/i.test(text)) hydration.push(text);
        else if (message.type() === "error") errors.push(text);
      });
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message.slice(0, 300)}`));
      await use();
      expect(hydration, "React hydration warnings in the browser console").toEqual([]);
      expect(errors, "console errors / uncaught page errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/**
 * Waits until React has hydrated every element matched by `target`: React attaches a
 * `__reactFiber$…` property to each DOM node it hydrates. Call it before a test changes
 * server-rendered markup (attributes, inline styles), so React never sees the change as a
 * server/client mismatch.
 */
export async function waitForHydration(page: Page, target: Locator): Promise<void> {
  await expect
    .poll(() =>
      target.evaluateAll((elements) =>
        elements.every((element) =>
          Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
        ),
      ),
    )
    .toBe(true);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
}

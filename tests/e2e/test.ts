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
        // `console.timeStamp()` markers are performance-track labels, not messages: React DOM's
        // development build emits `timeStamp("Hydrated")`, which Firefox reports (Chromium does
        // not). Real hydration warnings arrive as `console.error` and are still caught.
        // (Not in Playwright's type union, but returned at runtime.)
        if ((message.type() as string) === "timeStamp") return;
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

/**
 * Waits until no CSS transition or animation is still running on the element (or, with
 * `subtree`, inside it). A transition that a later state change cancels (for example the end of
 * a tap's brief :active state while its transition runs) rejects its `finished` promise with an
 * AbortError, per the Web Animations specification. That is not a product failure: that
 * cancellation (AbortError only) is ignored and the replacement transition is awaited in the next
 * round. Any other rejection is re-thrown and fails the test.
 * Animations that have finished but hold their end state (fill: forwards) are not waited for.
 * Bounded: it fails explicitly if animations keep restarting.
 */
export async function settleAnimations(
  target: Locator,
  options: { subtree?: boolean } = {},
): Promise<void> {
  await target.evaluate(async (element, subtree) => {
    for (let round = 0; round < 20; round += 1) {
      const running = element
        .getAnimations({ subtree })
        .filter((animation) => animation.playState === "running" || animation.pending);
      if (running.length === 0) return;
      await Promise.all(
        running.map((animation) =>
          animation.finished.catch((error: unknown) => {
            // Only the expected cancellation is tolerated; any other failure is reported.
            if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
          }),
        ),
      );
    }
    throw new Error("settleAnimations: animations kept restarting for 20 rounds");
  }, options.subtree ?? false);
}

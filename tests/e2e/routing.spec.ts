import AxeBuilder from "@axe-core/playwright";
import { test as baseTest, type Page } from "@playwright/test";

import arCommon from "../../src/i18n/messages/ar/common.json" with { type: "json" };
import arErrors from "../../src/i18n/messages/ar/errors.json" with { type: "json" };
import arNav from "../../src/i18n/messages/ar/nav.json" with { type: "json" };
import arPages from "../../src/i18n/messages/ar/pages.json" with { type: "json" };
import enCommon from "../../src/i18n/messages/en/common.json" with { type: "json" };
import enErrors from "../../src/i18n/messages/en/errors.json" with { type: "json" };
import enNav from "../../src/i18n/messages/en/nav.json" with { type: "json" };
import enPages from "../../src/i18n/messages/en/pages.json" with { type: "json" };
import { ROUTES } from "../../src/i18n/routes";
import { expect, test } from "./test";

/**
 * Phase 04 routing and navigation registry in a real browser (plan §14; Roadmap Phase 04
 * acceptance 2 and 4): every approved placeholder route in Arabic and English (deep link,
 * title, lang/dir, active destination resolved client-side, refresh), unknown and deferred
 * routes (localized 404 with HTTP 404), the route-error boundary, keyboard, axe, and
 * 1440 / 768 / 390 / 320 without horizontal overflow.
 *
 * Known limitation (documented in the Phase 04 report): Next.js 16 answers `notFound()` under
 * the `[locale]` root layout with its error document and renders the localized not-found page on
 * hydration. The 404 checks therefore wait for the hydrated `lang`/`dir` (auto-retrying
 * assertions) instead of reading the first HTML response.
 */

const MESSAGES = {
  ar: { common: arCommon, nav: arNav, pages: arPages, errors: arErrors },
  en: { common: enCommon, nav: enNav, pages: enPages, errors: enErrors },
} as const;
type Locale = keyof typeof MESSAGES;
const LOCALES: readonly { locale: Locale; dir: "rtl" | "ltr"; prefix: string }[] = [
  { locale: "ar", dir: "rtl", prefix: "" },
  { locale: "en", dir: "ltr", prefix: "/en" },
];
const DESTINATIONS = Object.keys(arNav.destinations);
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Approved placeholder routes with a concrete sample URL (dynamic ids filled). */
const PLACEHOLDERS = Object.entries(ROUTES)
  .filter(([key]) => !key.startsWith("dev."))
  .map(([key, path]) => ({ key, url: path.replace(/\[[^\]]+\]/g, "sample-1") }));

function expectedTitle(locale: Locale, key: string): string {
  const m = MESSAGES[locale];
  if (key === "landing") return m.common.brand.name;
  if (DESTINATIONS.includes(key)) return m.nav.destinations[key as keyof typeof m.nav.destinations];
  return m.pages.titles[key.replaceAll(".", "_") as keyof typeof m.pages.titles];
}

function expectedDestination(key: string): string {
  const root = key.split(".")[0] ?? "";
  return DESTINATIONS.includes(root) ? root : "";
}

/** Routes rendered without the app shell (Landing, Auth, Focus): no navigation at all. */
function isOutsideShell(key: string): boolean {
  return key === "landing" || key.startsWith("auth.") || key === "flashcards.study";
}

/**
 * The visible navigation marks exactly the expected destination with `aria-current="page"`
 * (its root link), and nothing on routes without a destination such as Settings (D-R6).
 * Shell-less routes render no navigation; their resolution is covered by the unit tests of
 * `resolveActiveDestination`.
 */
async function expectActiveDestination(page: Page, prefix: string, key: string): Promise<void> {
  if (isOutsideShell(key)) {
    await expect(page.getByRole("navigation")).toHaveCount(0);
    return;
  }
  const current = page.locator("nav a[aria-current='page']:visible");
  const destination = expectedDestination(key);
  if (destination === "") {
    await expect(page.locator("nav a:visible").first()).toBeVisible();
    await expect(current).toHaveCount(0);
    return;
  }
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute(
    "href",
    `${prefix}${ROUTES[destination as keyof typeof ROUTES]}`,
  );
}

function localized(prefix: string, url: string): string {
  return url === "/" ? prefix || "/" : `${prefix}${url}`;
}

async function htmlLangDir(page: Page) {
  return page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
  }));
}

/**
 * 404 suites: plain Playwright with a strict console check. A 404 document always makes the
 * browser log "Failed to load resource: … 404"; that exact message is the only one allowed —
 * any other console error or page error fails the test (same rigor as the shared guard).
 */
const DOCUMENT_404 =
  "Failed to load resource: the server responded with a status of 404 (Not Found)";
const notFoundTest = baseTest.extend<{ strictConsole: void }>({
  strictConsole: [
    async ({ page }, use) => {
      const unexpected: string[] = [];
      page.on("console", (message) => {
        const text = message.text();
        if (/hydrat/i.test(text)) unexpected.push(text.slice(0, 300));
        else if (message.type() === "error" && text !== DOCUMENT_404) {
          unexpected.push(text.slice(0, 300));
        }
      });
      page.on("pageerror", (error) => unexpected.push(`pageerror: ${error.message.slice(0, 300)}`));
      await use();
      baseTest.expect(unexpected, "unexpected console / page errors").toEqual([]);
    },
    { auto: true },
  ],
});

const UNKNOWN_AND_DEFERRED = [
  "/does-not-exist",
  "/lectures/sample-1/tutor",
  "/questions/sample-1/results",
  "/questions/sample-1/review",
  "/folders/sample-1/manage",
  "/dashboard/extra/segments",
];

async function expectCardInside(page: Page, width: number): Promise<void> {
  const card = await page.locator("main > section, [data-route-key] > section").boundingBox();
  baseTest.expect(card).not.toBeNull();
  baseTest.expect(card?.x ?? -1).toBeGreaterThanOrEqual(0);
  baseTest.expect((card?.x ?? 0) + (card?.width ?? 0)).toBeLessThanOrEqual(width);
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  baseTest.expect(fits).toBe(true);
}

for (const { locale, dir, prefix } of LOCALES) {
  test.describe(`placeholders (${locale})`, () => {
    for (const { key, url } of PLACEHOLDERS) {
      const path = localized(prefix, url);

      test(`${path}: deep link, title, ${dir}, active destination, refresh`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        expect(await htmlLangDir(page)).toEqual({ lang: locale, dir });

        const title = expectedTitle(locale, key);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
        await expect(page.getByText(MESSAGES[locale].pages.notImplemented)).toBeVisible();
        const brand = MESSAGES[locale].common.brand.name;
        await expect(page).toHaveTitle(key === "landing" ? brand : `${title} · ${brand}`);
        // The placeholder is the page's `<main>` outside the app shell, and content inside the
        // shell's one `<main>` on `(app)` routes (Phase 05). Either way: exactly one main.
        await expect(page.locator("[data-route-key]:has(> section)")).toHaveAttribute(
          "data-route-key",
          key,
        );
        await expect(page.getByRole("main")).toHaveCount(1);

        // Client-side resolution through useActiveDestination (next-intl usePathname), read from
        // the real navigation that renders it (the Sidebar at this 1280 viewport).
        await expectActiveDestination(page, prefix, key);

        await page.reload();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
        await expectActiveDestination(page, prefix, key);
      });
    }
  });

  test.describe(`placeholders: accessibility and keyboard (${locale})`, () => {
    const AXE_URLS = [
      "/",
      "/login",
      "/dashboard",
      "/lectures/sample-1",
      "/flashcards/sample-1/study",
      "/settings/security",
    ];
    for (const url of AXE_URLS) {
      const path = localized(prefix, url);
      test(`axe: ${path}`, async ({ page }) => {
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .exclude("nextjs-portal")
          .analyze();
        expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual(
          [],
        );
      });
    }

    test("a placeholder has no interactive elements (no stray tab stops)", async ({ page }) => {
      await page.goto(localized(prefix, "/dashboard"));
      const focusable = await page
        .locator("main")
        .locator("a, button, input, select, textarea, [tabindex]")
        .count();
      expect(focusable).toBe(0);
    });
  });

  test.describe(`placeholders: viewports (${locale})`, () => {
    for (const width of [1440, 768, 390, 320]) {
      for (const url of [
        "/",
        "/dashboard",
        "/settings/subscription",
        "/flashcards/sample-1/study",
      ]) {
        const path = localized(prefix, url);
        test(`${width}px ${path}: no horizontal overflow, card inside the viewport`, async ({
          page,
        }) => {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(path);
          await expectCardInside(page, width);
        });
      }
    }
  });

  notFoundTest.describe(`unknown and deferred routes (${locale})`, () => {
    for (const url of UNKNOWN_AND_DEFERRED) {
      const path = `${prefix}${url}`;
      notFoundTest(`${path} → HTTP 404, localized not-found, ${dir}`, async ({ page }) => {
        const response = await page.goto(path);
        baseTest.expect(response?.status()).toBe(404);
        await baseTest.expect(page.locator("html")).toHaveAttribute("lang", locale);
        await baseTest.expect(page.locator("html")).toHaveAttribute("dir", dir);
        await baseTest.expect(page.getByTestId("not-found")).toBeVisible();
        await baseTest
          .expect(page.getByRole("heading", { level: 1 }))
          .toHaveText(MESSAGES[locale].errors.notFound.title);
        // Descriptive document title (WCAG 2.4.2), set by the page's React <title>.
        await baseTest
          .expect(page)
          .toHaveTitle(
            `${MESSAGES[locale].errors.notFound.title} · ${MESSAGES[locale].common.brand.name}`,
          );
      });
    }

    notFoundTest(
      "keyboard: Tab reaches the back link with a visible ring; Enter opens the home page",
      async ({ page }) => {
        await page.goto(`${prefix}/does-not-exist`);
        const link = page.getByRole("link", { name: MESSAGES[locale].errors.notFound.backHome });
        await baseTest.expect(link).toBeVisible();
        // Tab until the link is focused (in `next dev` the dev-tools button may come first).
        let reached = false;
        for (let i = 0; i < 5 && !reached; i += 1) {
          await page.keyboard.press("Tab");
          reached = await link.evaluate((el) => el === document.activeElement);
        }
        baseTest.expect(reached, "back link reachable with Tab").toBe(true);
        const ring = await link.evaluate((el) => {
          const s = getComputedStyle(el);
          return [s.outlineStyle, s.outlineWidth];
        });
        baseTest.expect(ring).toEqual(["solid", "2px"]);
        await page.keyboard.press("Enter");
        await baseTest.expect(page.locator("main")).toHaveAttribute("data-route-key", "landing");
        baseTest.expect(new URL(page.url()).pathname).toBe(prefix || "/");
      },
    );

    notFoundTest("axe on the localized 404", async ({ page }) => {
      await page.goto(`${prefix}/does-not-exist`);
      await baseTest.expect(page.getByTestId("not-found")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .exclude("nextjs-portal")
        .analyze();
      baseTest
        .expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target })))
        .toEqual([]);
    });

    for (const width of [1440, 768, 390, 320]) {
      notFoundTest(`${width}px: the 404 has no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${prefix}/does-not-exist`);
        await baseTest.expect(page.getByTestId("not-found")).toBeVisible();
        await expectCardInside(page, width);
      });
    }
  });
}

/*
 * The route-error boundary. Throwing on purpose makes React and Next.js log the error, so this
 * suite allows only messages that carry the intentional error text; anything else fails.
 */
const INTENTIONAL = "MUNSIT dev error-test: intentional render error";

for (const { locale, dir, prefix } of LOCALES) {
  baseTest(`error boundary (${locale}): localized, keyboard retry recovers`, async ({ page }) => {
    const unexpected: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      if (message.type() === "error" && !text.includes(INTENTIONAL)) {
        unexpected.push(text.slice(0, 300));
      }
    });
    page.on("pageerror", (error) => {
      if (!error.message.includes(INTENTIONAL)) unexpected.push(`pageerror: ${error.message}`);
    });

    await page.goto(`${prefix}/dev/error-test`);
    await page.getByTestId("trigger-error").click();

    const boundary = page.getByTestId("route-error");
    await baseTest.expect(boundary).toBeVisible();
    baseTest.expect(await htmlLangDir(page)).toEqual({ lang: locale, dir });
    await baseTest
      .expect(boundary.getByRole("alert"))
      .toContainText(MESSAGES[locale].errors.error.title);

    const retry = page.getByRole("button", { name: MESSAGES[locale].errors.error.retry });
    await retry.focus();
    await baseTest.expect(retry).toBeFocused();
    await page.keyboard.press("Enter");
    await baseTest.expect(page.getByTestId("trigger-error")).toBeVisible();
    await baseTest.expect(boundary).toHaveCount(0);

    baseTest.expect(unexpected).toEqual([]);
  });
}

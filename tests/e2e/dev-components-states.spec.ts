import AxeBuilder from "@axe-core/playwright";
import { test as baseTest, type Locator, type Page } from "@playwright/test";

import { waitForHydration } from "./test";

/**
 * Phase 06 Increment 2 — Skeleton, ErrorCard and SectionBoundary on /dev/components.
 * Values from docs/design-values.md §15.1–§15.2 (Figma `2495:1719`, `2495:2424`, `2495:2966`).
 *
 * Breaking section B throws during render on purpose. React reports a caught error to the console
 * (development diagnostics stay on), so these tests allow exactly that fixture error and fail on
 * any other console error or page error (the same rule as the routing error-boundary test).
 */

const INTENTIONAL = "MUNSIT dev states-demo: intentional section render error";
const LOCALES = [
  {
    locale: "ar",
    dir: "rtl",
    prefix: "",
    title: "تعذّر تحميل آخر المحاضرات",
    retry: "إعادة المحاولة",
  },
  {
    locale: "en",
    dir: "ltr",
    prefix: "/en",
    title: "Couldn't load the latest lectures",
    retry: "Try again",
  },
] as const;
const WIDTHS = [320, 390, 719, 720, 768, 1024, 1280, 1440] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const CORAL: [number, number, number] = [255, 99, 99];
const OBSIDIAN: [number, number, number] = [17, 18, 20];

/** Console rule: only the intentional fixture error (and React's report of it) is allowed. */
const test = baseTest.extend<{ guard: string[] }>({
  guard: [
    async ({ page }, use) => {
      const unexpected: string[] = [];
      let lastWasIntentional = false;
      page.on("console", (message) => {
        const text = message.text();
        if (/hydrat/i.test(text)) unexpected.push(text.slice(0, 300));
        else if (message.type() === "error") {
          const intentional =
            text.includes(INTENTIONAL) ||
            (lastWasIntentional && /error boundary|above error occurred/i.test(text));
          if (!intentional) unexpected.push(text.slice(0, 300));
          lastWasIntentional = intentional;
        }
      });
      page.on("pageerror", (error) => {
        if (!error.message.includes(INTENTIONAL)) unexpected.push(`pageerror: ${error.message}`);
      });
      await use(unexpected);
      baseTest.expect(unexpected, "unexpected console / page errors").toEqual([]);
    },
    { auto: true },
  ],
});
const { expect } = baseTest;

async function openGallery(page: Page, prefix: string) {
  await page.goto(`${prefix}/dev/components`);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("break-section-b"));
}

/** A colour property composited over black. */
async function onBlack(locator: Locator, property: "backgroundColor" | "borderTopColor" | "color") {
  return locator.evaluate((el, prop) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = getComputedStyle(el)[prop];
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, property);
}

function expectTint(actual: number[], rgb: [number, number, number], alpha: number, label: string) {
  rgb.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel * alpha), label).toBeLessThanOrEqual(1.5);
  });
}

/** WCAG contrast of the element's text over all its ancestors' backgrounds, on black. */
async function renderedContrast(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    const chain: Element[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) chain.unshift(node);
    for (const node of chain) {
      ctx.fillStyle = getComputedStyle(node).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
    }
    const bg = [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    ctx.fillStyle = getComputedStyle(el).color;
    ctx.fillRect(0, 0, 1, 1);
    const fg = [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    const lin = (c: number) => {
      const v = c / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r = 0, g = 0, b = 0]: number[]) =>
      0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const [hi = 0, lo = 0] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  });
}

async function noOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
}

for (const { locale, dir, prefix, title, retry } of LOCALES) {
  test.describe(`Loading and error states (${locale})`, () => {
    test("skeleton: White 7%, radius 8, approved pulse; busy region with one hidden label", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      const region = page.getByTestId("skeleton-card").locator("[data-skeleton-region]");
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region.locator(".sr-only")).toHaveCount(1);
      const block = region.locator("[data-skeleton]").first();
      const style = await block.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          radius: s.borderTopLeftRadius,
          name: s.animationName,
          duration: s.animationDuration,
          count: s.animationIterationCount,
          hidden: el.getAttribute("aria-hidden"),
          h: el.getBoundingClientRect().height,
        };
      });
      expect(style).toEqual({
        radius: "8px",
        name: "skeleton-pulse",
        duration: "1.6s",
        count: "infinite",
        hidden: "true",
        h: 16,
      });
      // The fill is White 7% (sampled while the pulse is at full opacity is not guaranteed, so
      // read the declared colour, not the animated pixel).
      expectTint(await onBlack(block, "backgroundColor"), [255, 255, 255], 0.07, "block fill");
    });

    test("skeleton under reduced motion: no pulse", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 390, height: 844 });
      await openGallery(page, prefix);
      const name = await page
        .getByTestId("skeleton-card")
        .locator("[data-skeleton]")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName);
      expect(name).toBe("none");
    });

    test("ErrorCard card: Figma values (2495:2424); section: row in a wide card, stacked in a narrow one", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      const card = page.getByTestId("error-full").locator("[data-error-card]");
      const geo = await card.evaluate((el) => {
        const s = getComputedStyle(el);
        const tile = el.firstElementChild as HTMLElement;
        const h = el.querySelector("h3") as HTMLElement;
        const p = el.querySelector("p") as HTMLElement;
        return {
          padding: [s.paddingTop, s.paddingInlineEnd, s.paddingBottom, s.paddingInlineStart],
          radius: s.borderTopLeftRadius,
          border: s.borderTopWidth,
          gap: s.rowGap,
          tile: [tile.getBoundingClientRect().width, getComputedStyle(tile).borderTopLeftRadius],
          icon: tile.querySelector("svg")?.getBoundingClientRect().width,
          title: [
            getComputedStyle(h).fontSize,
            getComputedStyle(h).lineHeight,
            getComputedStyle(h).fontWeight,
          ],
          body: [getComputedStyle(p).fontSize, getComputedStyle(p).lineHeight],
        };
      });
      expect(geo).toEqual({
        padding: ["32px", "24px", "32px", "24px"],
        radius: "20px",
        border: "1px",
        gap: "14px",
        tile: [56, "14px"],
        icon: 25,
        title: ["20px", "30px", "700"],
        body: ["14px", "22px"],
      });
      expectTint(await onBlack(card, "backgroundColor"), OBSIDIAN, 0.9, "card fill");
      expectTint(await onBlack(card, "borderTopColor"), CORAL, 0.25, "card border");
      const tile = card.locator(":scope > span").first();
      expectTint(await onBlack(tile, "backgroundColor"), CORAL, 0.12, "tile fill");
      expectTint(await onBlack(tile, "borderTopColor"), CORAL, 0.3, "tile border");
      expect(await renderedContrast(card.locator("h3"))).toBeGreaterThanOrEqual(4.5);
      expect(await renderedContrast(card.locator("p"))).toBeGreaterThanOrEqual(4.5);

      const section = page.getByTestId("error-section").locator("[data-error-card]");
      const row = section.locator(":scope > div");
      const layoutWide = await row.evaluate((el) => {
        const [tile, text, button] = [...el.children].map((c) => c.getBoundingClientRect());
        return {
          direction: getComputedStyle(el).flexDirection,
          tile: tile?.width,
          sameRow:
            Math.abs(
              (tile?.top ?? 0) +
                (tile?.height ?? 0) / 2 -
                ((button?.top ?? 0) + (button?.height ?? 0) / 2),
            ) < 2,
          tileAtStart:
            getComputedStyle(el).direction === "rtl"
              ? (tile?.right ?? 0) > (text?.right ?? 0)
              : (tile?.left ?? 0) < (text?.left ?? 0),
        };
      });
      expect(layoutWide).toEqual({ direction: "row", tile: 44, sameRow: true, tileAtStart: true });
      expect(await renderedContrast(section.locator("h3"))).toBeGreaterThanOrEqual(4.5);
      expect(await renderedContrast(section.locator("p"))).toBeGreaterThanOrEqual(4.5);

      await page.setViewportSize({ width: 320, height: 900 });
      await expect
        .poll(() => row.evaluate((el) => getComputedStyle(el).flexDirection))
        .toBe("column");
      expect(await row.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
      expect(await page.evaluate(() => document.dir)).toBe(dir);
    });

    test("isolation: section B fails, A and C stay interactive, D keeps rendering; the failure is announced politely", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("break-section-b").click();
      const b = page.getByTestId("section-b");
      await expect(b.getByRole("heading", { name: title })).toBeVisible();
      await expect(b.locator('[role="status"]')).toHaveCount(1);
      for (const id of ["a", "c"]) {
        const counter = page.getByTestId(`section-${id}-counter`);
        await counter.click();
        await expect(counter).toContainText("1");
      }
      await expect(page.getByTestId("section-d-content")).toBeVisible();
      await expect(page.getByTestId("break-section-b")).toBeEnabled();
    });

    test("keyboard retry: pending ignores repeats, focus stays, then the section recovers; A keeps its state", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("section-a-counter").click();
      await page.getByTestId("break-section-b").click();
      const button = page.getByTestId("section-b").getByRole("button", { name: retry });
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(button).toHaveAttribute("aria-disabled", "true");
      await page.keyboard.press("Enter");
      await page.keyboard.press(" ");
      await expect(button).toBeFocused();
      await expect(page.getByTestId("section-b-content")).toBeVisible();
      await expect(page.getByTestId("retry-count")).toHaveText("Retries: 1");
      await expect(page.getByTestId("section-a-counter")).toContainText("1"); // not remounted
    });

    test("persistent failure: retry shows the ErrorCard again; a later successful retry recovers", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("retry-mode").click(); // keeps failing
      await page.getByTestId("break-section-b").click();
      const b = page.getByTestId("section-b");
      await b.getByRole("button", { name: retry }).click();
      await expect(page.getByTestId("retry-count")).toHaveText("Retries: 1");
      await expect(b.getByRole("heading", { name: title })).toBeVisible();
      await expect(page.getByTestId("section-b-content")).toHaveCount(0);
      await page.getByTestId("retry-mode").click(); // fixes the cause
      await b.getByRole("button", { name: retry }).click();
      await expect(page.getByTestId("section-b-content")).toBeVisible();
      await expect(page.getByTestId("retry-count")).toHaveText("Retries: 2");
    });

    test("data failure (status): ErrorCard, then retry shows the skeleton, then the content", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("section-d-fail").click();
      const d = page.getByTestId("section-d");
      await expect(d.getByRole("heading", { name: title })).toBeVisible();
      await d.getByRole("button", { name: retry }).click();
      await expect(d.locator('[aria-busy="true"]')).toBeVisible();
      await expect(page.getByTestId("section-d-content")).toBeVisible();
      await expect(d.locator('[aria-busy="true"]')).toHaveCount(0);
    });

    for (const width of WIDTHS) {
      test(`${width}px: no overflow; error cards and skeletons stay inside their hosts`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await openGallery(page, prefix);
        await page.getByTestId("break-section-b").click();
        await expect(page.getByTestId("section-b").getByRole("heading")).toBeVisible();
        expect(await noOverflow(page)).toBe(true);
        for (const id of ["error-full", "error-section", "skeleton-card", "section-b"]) {
          const inside = await page.getByTestId(id).evaluate((el) => {
            const b = el.getBoundingClientRect();
            return [...el.querySelectorAll("*")].every((child) => {
              const r = child.getBoundingClientRect();
              if (r.width === 0 && r.height === 0) return true;
              if (child.classList.contains("sr-only")) return true;
              return r.left >= b.left - 0.5 && r.right <= b.right + 0.5;
            });
          });
          expect(inside, id).toBe(true);
        }
        // Retry buttons never overlap the text.
        const overlap = await page.getByTestId("error-section").evaluate((el) => {
          const text = el.querySelector('[role="status"]')?.getBoundingClientRect();
          const button = el.querySelector("button")?.getBoundingClientRect();
          if (!text || !button) return true;
          return !(
            text.left < button.right &&
            button.left < text.right &&
            text.top < button.bottom &&
            button.top < text.bottom
          );
        });
        expect(overlap).toBe(true);
      });
    }

    test("axe (WCAG 2.2 AA, contrast on) with a failed section, the error cards and the skeletons", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("break-section-b").click();
      await expect(page.getByTestId("section-b").getByRole("heading")).toBeVisible();
      for (const selector of [
        '[data-testid="gallery-states"]',
        '[data-testid="gallery-error-card"]',
        '[data-testid="gallery-skeleton"]',
      ]) {
        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .include(selector)
          .analyze();
        expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual(
          [],
        );
      }
    });
  });
}

import { expect, test, type Page } from "@playwright/test";

/**
 * i18n / RTL-LTR foundation (Phase 02 step 6). Arabic `/` (default, RTL, unprefixed), English
 * `/en` (LTR). Samples come from the DEV-ONLY `dev` namespace on the temporary /dev/tokens route.
 */

async function htmlLangDir(page: Page): Promise<{ lang: string | null; dir: string | null }> {
  return page.evaluate(() => ({
    lang: document.documentElement.getAttribute("lang"),
    dir: document.documentElement.getAttribute("dir"),
  }));
}

async function platformFamilies(page: Page, selector: string): Promise<string> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  await cdp.detach();
  return fonts.map((f) => f.familyName).join(" | ");
}

/** Horizontal position (px) of a substring inside an element's text. */
async function substringX(page: Page, testId: string, needle: string): Promise<number> {
  return page.getByTestId(testId).evaluate((el, text) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const index = node.textContent?.indexOf(text) ?? -1;
      if (index >= 0) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + text.length);
        return range.getBoundingClientRect().left;
      }
    }
    throw new Error(`"${text}" not found`);
  }, needle);
}

test.describe("locale routing", () => {
  test("Arabic is the default at / (RTL); English at /en (LTR)", async ({ page }) => {
    await page.goto("/");
    expect(await htmlLangDir(page)).toEqual({ lang: "ar", dir: "rtl" });
    await page.goto("/en");
    expect(await htmlLangDir(page)).toEqual({ lang: "en", dir: "ltr" });
  });

  test("/ar redirects to the unprefixed Arabic URL; existing URLs unchanged", async ({ page }) => {
    await page.goto("/ar");
    expect(new URL(page.url()).pathname).toBe("/");
    await page.goto("/ar/dev/tokens");
    expect(new URL(page.url()).pathname).toBe("/dev/tokens");
    expect(await htmlLangDir(page)).toEqual({ lang: "ar", dir: "rtl" });
  });

  test("no locale detection: an English browser still gets Arabic at /", async ({ browser }) => {
    const context = await browser.newContext({
      locale: "en-US",
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    });
    const page = await context.newPage();
    await page.goto("/");
    expect(new URL(page.url()).pathname).toBe("/");
    expect(await htmlLangDir(page)).toEqual({ lang: "ar", dir: "rtl" });
    expect(await context.cookies()).toEqual([]);
    await context.close();
  });

  test("dev language control switches locale and direction, keeping the route", async ({
    page,
  }) => {
    await page.goto("/dev/tokens");
    await page.getByTestId("switch-en").click();
    await page.waitForURL((url) => url.pathname === "/en/dev/tokens");
    expect(await htmlLangDir(page)).toEqual({ lang: "en", dir: "ltr" });
    await page.getByTestId("switch-ar").click();
    await page.waitForURL((url) => url.pathname === "/dev/tokens");
    expect(new URL(page.url()).pathname).toBe("/dev/tokens");
    expect(await htmlLangDir(page)).toEqual({ lang: "ar", dir: "rtl" });
  });

  test("translations render per locale, numbers keep Latin digits", async ({ page }) => {
    await page.goto("/dev/tokens");
    await expect(page.getByTestId("i18n-number")).toHaveText("لديك 1,234 محاضرة جديدة");
    await page.goto("/en/dev/tokens");
    await expect(page.getByTestId("i18n-number")).toHaveText("You have 1,234 new lectures");
  });
});

test.describe("typography per locale", () => {
  test("Arabic text renders in Cairo, English in Inter — no fallback fonts", async ({ page }) => {
    await page.goto("/dev/tokens");
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() => platformFamilies(page, '[data-testid="i18n-stat-label"]'), { timeout: 15_000 })
      .toMatch(/cairo/i);
    expect(await platformFamilies(page, '[data-testid="i18n-stat-label"]')).not.toMatch(
      /arial|segoe|tahoma|times/i,
    );

    await page.goto("/en/dev/tokens");
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() => platformFamilies(page, '[data-testid="i18n-stat-label"]'), { timeout: 15_000 })
      .toMatch(/inter/i);
    expect(await platformFamilies(page, '[data-testid="i18n-stat-label"]')).not.toMatch(
      /cairo|arial|segoe|tahoma|times/i,
    );
  });

  test("mixed Arabic + English renders Arabic in Cairo and Latin in Inter", async ({ page }) => {
    await page.goto("/dev/tokens");
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() => platformFamilies(page, '[data-testid="i18n-goal"] bdi'), { timeout: 15_000 })
      .toMatch(/inter/i);
    expect(await platformFamilies(page, '[data-testid="i18n-goal"] bdi')).not.toMatch(
      /cairo|arial/i,
    );
    await expect
      .poll(() => platformFamilies(page, '[data-testid="i18n-goal"]'), { timeout: 15_000 })
      .toMatch(/cairo/i);
  });
});

test.describe("direction isolation", () => {
  test("an isolated LTR run keeps its order inside Arabic; the control shows why", async ({
    page,
  }) => {
    await page.goto("/dev/tokens");
    // Isolated: "74% · 92 · 12/30" reads left to right inside the RTL sentence.
    expect(await substringX(page, "i18n-stats", "74%")).toBeLessThan(
      await substringX(page, "i18n-stats", "12/30"),
    );
    // Control without isolation: the RTL paragraph reorders the runs (74% ends up on the right).
    expect(await substringX(page, "i18n-stats-control", "74%")).toBeGreaterThan(
      await substringX(page, "i18n-stats-control", "12/30"),
    );
  });

  test("the isolated element is a <bdi dir=ltr>", async ({ page }) => {
    await page.goto("/dev/tokens");
    const bdi = page.getByTestId("i18n-stats").locator("bdi");
    await expect(bdi).toHaveAttribute("dir", "ltr");
    expect(await bdi.evaluate((el) => getComputedStyle(el).unicodeBidi)).toBe("isolate");
  });
});

test.describe("layout direction", () => {
  for (const [path, dir] of [
    ["/dev/tokens", "rtl"],
    ["/en/dev/tokens", "ltr"],
  ] as const) {
    test(`${dir}: logical properties, flex order and form fields follow the locale (${path})`, async ({
      page,
    }) => {
      await page.goto(path);
      const info = await page.evaluate(() => {
        const first = document.querySelector('[data-testid="i18n-first"]') as HTMLElement;
        const second = document.querySelector('[data-testid="i18n-second"]') as HTMLElement;
        const input = document.querySelector('[data-testid="i18n-input"]') as HTMLElement;
        const cs = getComputedStyle(first);
        return {
          firstX: first.getBoundingClientRect().left,
          secondX: second.getBoundingClientRect().left,
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          inputDirection: getComputedStyle(input).direction,
          inputAlign: getComputedStyle(input).textAlign,
        };
      });
      if (dir === "rtl") {
        expect(info.firstX).toBeGreaterThan(info.secondX); // first item on the right
        expect(info.paddingRight).toBe("4px"); // ps-xs = padding-inline-start
        expect(info.paddingLeft).toBe("0px");
      } else {
        expect(info.firstX).toBeLessThan(info.secondX);
        expect(info.paddingLeft).toBe("4px");
        expect(info.paddingRight).toBe("0px");
      }
      expect(info.inputDirection).toBe(dir);
      expect(info.inputAlign).toBe("start");
    });
  }
});

test.describe("logo and icons in English (LTR)", () => {
  test("logo never mirrors; only arrowLeft flips in LTR; logout and play never flip", async ({
    page,
  }) => {
    await page.goto("/en/dev/tokens");
    expect(await htmlLangDir(page)).toEqual({ lang: "en", dir: "ltr" });
    const logoTransforms = await page
      .locator("img[data-logo]")
      .evaluateAll((els) =>
        els.map((el) => [getComputedStyle(el).transform, getComputedStyle(el).scale]),
      );
    for (const [transform, scale] of logoTransforms) {
      expect(transform).toBe("none");
      expect(scale).toBe("none");
    }
    const scaleOf = (testId: string) =>
      page
        .getByTestId(testId)
        .locator("svg")
        .evaluate((el) => getComputedStyle(el).scale);
    expect((await scaleOf("icon-ltr-arrowLeft")).startsWith("-1")).toBe(true);
    // Nearest dir="rtl" wins over <html dir="ltr">: not flipped.
    expect((await scaleOf("icon-rtl-arrowLeft")).startsWith("-1")).toBe(false);
    for (const name of ["logout", "play"]) {
      expect(await scaleOf(`icon-ltr-${name}`)).toBe("none");
      expect(await scaleOf(`icon-rtl-${name}`)).toBe("none");
    }
  });
});

test.describe("reduced motion", () => {
  for (const path of ["/", "/en"]) {
    test(`removes movement in ${path}`, async ({ page }) => {
      await page.goto(path);
      const normal = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--motion-distance").trim(),
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      const reduced = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--motion-distance").trim(),
      );
      expect([normal, reduced]).toEqual(["1", "0"]);
    });
  }
});

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow-320", width: 320, height: 700 },
] as const;

for (const viewport of VIEWPORTS) {
  for (const path of ["/", "/en", "/dev/tokens", "/en/dev/tokens"]) {
    test(`${path} @ ${viewport.name} ${viewport.width}px: no horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

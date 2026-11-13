import { expect, test, type Page } from "@playwright/test";

/**
 * Typography foundation (Phase 02 step 3). No component or page exists yet, so samples are
 * injected into the placeholder route and styled only through design-system CSS variables.
 * The rendered font per glyph is read from Chromium (CDP `CSS.getPlatformFontsForNode`).
 */

type PlatformFont = { familyName: string; glyphCount: number };

const SAMPLES = `
  <div id="typography-samples">
    <p id="ar" dir="rtl" lang="ar">محاضرة تمت دراستها</p>
    <p id="en" dir="ltr" lang="en">Dashboard Overview</p>
    <p id="mixed" dir="rtl" lang="ar">لديك 12 محاضرة في AI</p>
    <p id="mono" style="font-family: var(--font-mono)">00:12:45</p>
    <p id="mono-ar" style="font-family: var(--font-mono)">منذ 5 دقائق</p>
    <p id="title" style="font-size: var(--text-dashboard-title-l);
      line-height: var(--text-dashboard-title-l--line-height);
      font-weight: var(--text-dashboard-title-l--font-weight)">الرئيسية</p>
  </div>`;

async function injectSamples(page: Page): Promise<void> {
  await page.evaluate(async (html) => {
    document.body.insertAdjacentHTML("beforeend", html);
    await document.fonts.ready;
  }, SAMPLES);
}

async function platformFonts(page: Page, selector: string): Promise<PlatformFont[]> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  await cdp.detach();
  return fonts.map(({ familyName, glyphCount }) => ({ familyName, glyphCount }));
}

/** Font families used for a node, polled until web fonts have finished swapping in. */
async function expectFamilies(page: Page, selector: string, expected: RegExp[]): Promise<void> {
  await expect
    .poll(async () => (await platformFonts(page, selector)).map((f) => f.familyName).join(" | "), {
      timeout: 15_000,
    })
    .toMatch(new RegExp(expected.map((re) => `(?=.*${re.source})`).join(""), "i"));
}

test.describe("typography foundation", () => {
  test("fonts are self-hosted: no request reaches Google", async ({ page }) => {
    const external: string[] = [];
    const fontFiles: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (/fonts\.(googleapis|gstatic)\.com/.test(url)) external.push(url);
      if (request.resourceType() === "font") fontFiles.push(url);
    });
    await page.goto("/");
    await injectSamples(page);
    await expectFamilies(page, "#ar", [/cairo/i]);

    expect(external).toEqual([]);
    expect(fontFiles.length).toBeGreaterThan(0);
    const origin = new URL(page.url()).origin;
    for (const url of fontFiles) expect(url.startsWith(origin)).toBe(true);
  });

  test("Arabic renders in Cairo, English in Inter, metadata in Geist Mono", async ({ page }) => {
    await page.goto("/");
    await injectSamples(page);

    await expectFamilies(page, "#ar", [/cairo/i]);
    const arFonts = await platformFonts(page, "#ar");
    expect(arFonts.map((f) => f.familyName).join()).not.toMatch(/arial|segoe|tahoma/i);
    // "محاضرة تمت دراستها": every letter in Cairo; Inter may draw only the 2 spaces.
    const interGlyphs = arFonts.find((f) => /inter/i.test(f.familyName))?.glyphCount ?? 0;
    expect(interGlyphs).toBeLessThanOrEqual(2);

    await expectFamilies(page, "#en", [/inter/i]);
    expect((await platformFonts(page, "#en")).map((f) => f.familyName).join()).not.toMatch(
      /cairo/i,
    );

    await expectFamilies(page, "#mono", [/geist mono/i]);
  });

  test("numerals and Latin inside Arabic render in Inter, Arabic glyphs in Cairo", async ({
    page,
  }) => {
    await page.goto("/");
    await injectSamples(page);

    await expectFamilies(page, "#mixed", [/cairo/i, /inter/i]);
    const fonts = await platformFonts(page, "#mixed");
    expect(fonts.map((f) => f.familyName).join()).not.toMatch(/arial|segoe|tahoma/i);

    await expectFamilies(page, "#mono-ar", [/geist mono/i, /cairo/i]);
  });

  test("tokens resolve in the browser; Dashboard/Body is the document default", async ({
    page,
  }) => {
    await page.goto("/");
    await injectSamples(page);

    const result = await page.evaluate(() => {
      const rootStyle = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      const title = getComputedStyle(document.getElementById("title") as HTMLElement);
      return {
        token: rootStyle.getPropertyValue("--text-dashboard-title-l").trim(),
        bodySize: body.fontSize,
        bodyLineHeight: body.lineHeight,
        bodyWeight: body.fontWeight,
        titleSize: title.fontSize,
        titleLineHeight: title.lineHeight,
        titleWeight: title.fontWeight,
      };
    });

    expect(result).toEqual({
      token: "28px",
      bodySize: "14px",
      bodyLineHeight: "22px",
      bodyWeight: "400",
      titleSize: "28px",
      titleLineHeight: "40px",
      titleWeight: "700",
    });
  });

  test("direction: document is RTL, an LTR block stays LTR", async ({ page }) => {
    await page.goto("/");
    await injectSamples(page);

    const directions = await page.evaluate(() => ({
      document: getComputedStyle(document.documentElement).direction,
      ar: getComputedStyle(document.getElementById("ar") as HTMLElement).direction,
      en: getComputedStyle(document.getElementById("en") as HTMLElement).direction,
    }));
    expect(directions).toEqual({ document: "rtl", ar: "rtl", en: "ltr" });
  });
});

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`typography @ ${viewport.name} ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("RTL and LTR render with the approved families from local files", async ({ page }) => {
      const fontRequests: string[] = [];
      page.on("request", (request) => {
        const path = new URL(request.url()).pathname;
        // `/__nextjs*` = the Next.js dev overlay's own UI font (dev server only), not app fonts.
        if (request.resourceType() === "font" && !path.startsWith("/__nextjs"))
          fontRequests.push(path);
      });
      await page.goto("/");
      await injectSamples(page);

      await expectFamilies(page, "#ar", [/cairo/i]);
      await expectFamilies(page, "#en", [/inter/i]);
      await expectFamilies(page, "#mixed", [/cairo/i, /inter/i]);
      await expectFamilies(page, "#mono", [/geist mono/i]);
      for (const selector of ["#ar", "#en", "#mixed", "#mono", "#mono-ar"]) {
        const families = (await platformFonts(page, selector)).map((f) => f.familyName).join();
        expect(families, selector).not.toMatch(/arial|segoe|tahoma|times/i);
      }

      const alignment = await page.evaluate(() => ({
        ar: getComputedStyle(document.getElementById("ar") as HTMLElement).direction,
        en: getComputedStyle(document.getElementById("en") as HTMLElement).direction,
      }));
      expect(alignment).toEqual({ ar: "rtl", en: "ltr" });

      // Self-hosted WOFF2 from the build output, same origin.
      expect(fontRequests.length).toBeGreaterThan(0);
      for (const path of fontRequests) expect(path).toMatch(/^\/_next\/static\/media\/.+\.woff2$/);
    });
  });
}

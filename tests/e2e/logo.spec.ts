import { createHash } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

/**
 * Official logo (Phase 02 step 4) on the temporary /dev/tokens route.
 * Checks: original bytes served, ratio kept, never mirrored (RTL pixels === LTR pixels),
 * accessible name, no horizontal overflow at the three reference widths plus 320.
 */

const VARIANTS = {
  full: { src: "/brand/Munsit_Logo_Full.png", width: 1228, height: 236 },
  horizontal: { src: "/brand/Munsit_Logo_Horizontal.png", width: 908, height: 236 },
  symbol: { src: "/brand/Munsit_Logo_Symbol.png", width: 372, height: 236 },
} as const;

const ORIGINAL_SHA256 = {
  full: "282e7f28ab0c98e803a781cc97810120002964e8d93f144788fedabf18363e81",
  horizontal: "199f6a1353b508bb3f464f730e426750eb29ccdc1823532df93a4785a9665c81",
  symbol: "3792279dabfab348000071b1527e142278f27fdf31aa94e1c86a352d41836147",
} as const;

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow-320", width: 320, height: 700 },
] as const;

const variantNames = Object.keys(VARIANTS) as (keyof typeof VARIANTS)[];

/**
 * Mean absolute RGB difference (0–255) between two PNG screenshots, directly and with the
 * second one mirrored horizontally. Decoded in the browser canvas — no image library needed.
 */
async function pixelDiff(
  page: Page,
  a: Buffer,
  b: Buffer,
): Promise<{ direct: number; mirrored: number }> {
  return page.evaluate(
    async ([aData, bData]) => {
      const load = async (base64: string): Promise<ImageData> => {
        const img = new Image();
        img.src = `data:image/png;base64,${base64}`;
        await img.decode();
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No 2D context");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, img.width, img.height);
      };
      const [x, y] = await Promise.all([load(aData), load(bData)]);
      if (x.width !== y.width || x.height !== y.height) return { direct: 255, mirrored: 255 };
      let direct = 0;
      let mirrored = 0;
      for (let row = 0; row < x.height; row++) {
        for (let col = 0; col < x.width; col++) {
          const i = (row * x.width + col) * 4;
          const m = (row * x.width + (x.width - 1 - col)) * 4;
          for (let c = 0; c < 3; c++) {
            direct += Math.abs((x.data[i + c] ?? 0) - (y.data[i + c] ?? 0));
            mirrored += Math.abs((x.data[i + c] ?? 0) - (y.data[m + c] ?? 0));
          }
        }
      }
      const n = x.width * x.height * 3;
      return { direct: direct / n, mirrored: mirrored / n };
    },
    [a.toString("base64"), b.toString("base64")] as const,
  );
}

test("logo files are served unmodified from /brand", async ({ request }) => {
  for (const variant of variantNames) {
    const response = await request.get(VARIANTS[variant].src);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
    const hash = createHash("sha256")
      .update(await response.body())
      .digest("hex");
    expect(hash, variant).toBe(ORIGINAL_SHA256[variant]);
  }
});

for (const viewport of VIEWPORTS) {
  test.describe(`logo @ ${viewport.name} ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("renders every variant, keeps its ratio, never mirrored", async ({ page }) => {
      await page.goto("/dev/tokens");

      for (const dir of ["rtl", "ltr"] as const) {
        for (const variant of variantNames) {
          const img = page.getByTestId(`logo-${dir}-${variant}`).locator("img");
          await expect(img).toBeVisible();
          // Logos are lazy-loaded (next/image default); below the fold they load when scrolled to.
          await img.scrollIntoViewIfNeeded();
          await expect
            .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
            .toBe(true);

          const info = await img.evaluate((el: HTMLImageElement) => {
            const style = getComputedStyle(el);
            const box = el.getBoundingClientRect();
            return {
              complete: el.complete,
              naturalWidth: el.naturalWidth,
              naturalHeight: el.naturalHeight,
              currentSrc: new URL(el.currentSrc).pathname,
              transform: style.transform,
              scale: style.scale,
              rotate: style.rotate,
              objectFit: style.objectFit,
              boxWidth: box.width,
              boxHeight: box.height,
            };
          });
          const asset = VARIANTS[variant];
          const label = `${dir}/${variant}`;

          expect(info.complete, label).toBe(true);
          expect([info.naturalWidth, info.naturalHeight], label).toEqual([
            asset.width,
            asset.height,
          ]);
          expect(info.currentSrc, label).toBe(asset.src);
          expect(info.transform, label).toBe("none");
          expect(info.scale, label).toBe("none");
          expect(info.rotate, label).toBe("none");
          expect(info.objectFit, label).toBe("contain");

          // Either the box has the original ratio, or it was narrowed by its container and
          // object-fit: contain letterboxes it (no distortion).
          const ratio = info.boxWidth / info.boxHeight;
          const original = asset.width / asset.height;
          if (Math.abs(ratio - original) > 0.03) {
            expect(ratio, `${label} narrowed`).toBeLessThan(original);
          }
        }
      }

      // Not mirrored: RTL pixels match LTR pixels, and are far from a mirrored LTR image.
      // Exact equality is not expected: in RTL the image sits at a fractional x position, so
      // sub-pixel resampling differs slightly (measured mean ≈ 0–0.02 / 255; mirrored ≈ 34–76).
      // The Next.js dev indicator (bottom corner, dev server only) can overlap a capture near
      // the page bottom; hide it, and centre each logo before capturing.
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      const capture = async (testId: string): Promise<Buffer> => {
        const img = page.getByTestId(testId).locator("img");
        await img.evaluate((el) => el.scrollIntoView({ block: "center", inline: "center" }));
        return img.screenshot();
      };
      for (const variant of variantNames) {
        const rtl = await capture(`logo-rtl-${variant}`);
        const ltr = await capture(`logo-ltr-${variant}`);
        const diff = await pixelDiff(page, rtl, ltr);
        expect(diff.direct, `${variant} RTL vs LTR mean pixel diff`).toBeLessThan(1);
        expect(diff.mirrored, `${variant} RTL vs mirrored LTR`).toBeGreaterThan(10);
      }
    });

    test("accessible name and no horizontal overflow", async ({ page }) => {
      await page.goto("/dev/tokens");
      await expect(page.getByRole("img", { name: "MUNSIT AI", exact: true })).toHaveCount(6);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arShell from "../../src/i18n/messages/ar/shell.json" with { type: "json" };
import enShell from "../../src/i18n/messages/en/shell.json" with { type: "json" };

/*
 * Phase 06 Increment 5 — Notifications and User Menu frame check (D-U8). Geometry of the Phase 05
 * shells against the Figma overlay frames (read-only, 2026-11-18):
 *   Notifications  Desktop 2242:1008 · Tablet 2242:1140 · Mobile 2242:1338
 *   User Menu      Desktop 2242:1053 · Tablet 2242:1185 · Mobile 2242:1383
 * `edge` is the panel's distance from the inline-end edge of the viewport (left in RTL, right in
 * LTR), `top` its distance from the top. The test asserts the APPROVED contract (`app`); `figma`
 * records the frame value. Where they differ, the reason is an approved decision:
 * - Notifications Desktop/Tablet edge 20 (Figma 70 / 24): with no user name or role (Phase 05
 *   D-02) the user trigger is the compact 88 (Figma desktop 219), so the bell sits further
 *   inline-end; the popover keeps its inline-start alignment to the bell and clamps at the
 *   20 px viewport margin (Phase 03 D-PM5).
 * - Mobile tops (Figma 80 for both panels, 8 below the 72 bar): the app keeps the D-PM5
 *   per-component offsets below the trigger — Notifications 16 below the 44 bell (74), User Menu
 *   9 below the 54 trigger (72). OV-1: APPROVED as implemented (owner, 2026-11-18).
 * - User Menu Mobile edge 16 (Figma 14): D-PM5 menu viewport margin 16.
 * Content is out of scope: the frames show sample notifications, an account header and Logout,
 * which D-U8 / D-S5 / D-S6 exclude until real data exists, so heights are not compared.
 */

const LOCALES = [
  { name: "ar", dir: "rtl", shell: arShell },
  { name: "en", dir: "ltr", shell: enShell },
] as const;

const FRAMES = [
  {
    name: "Desktop",
    width: 1440,
    height: 900,
    notifications: { app: { w: 380, edge: 20, top: 88 }, figma: { w: 380, edge: 70, top: 88 } },
    user: { app: { w: 256, edge: 24, top: 88 }, figma: { w: 256, edge: 24, top: 88 } },
  },
  {
    name: "Tablet",
    width: 768,
    height: 1024,
    notifications: { app: { w: 380, edge: 20, top: 88 }, figma: { w: 380, edge: 24, top: 88 } },
    user: { app: { w: 256, edge: 24, top: 88 }, figma: { w: 256, edge: 24, top: 88 } },
  },
  {
    name: "Mobile",
    width: 390,
    height: 844,
    notifications: { app: { w: 350, edge: 20, top: 74 }, figma: { w: 350, edge: 20, top: 80 } },
    user: { app: { w: 256, edge: 16, top: 72 }, figma: { w: 256, edge: 14, top: 80 } },
  },
] as const;

const bar = (page: Page, width: number) =>
  page.locator(width < 720 ? '[data-shell="mobile-top-bar"]' : '[data-shell="top-bar"]');

async function geometry(panel: Locator, viewport: number, dir: "rtl" | "ltr") {
  // Measure the settled panel: the entrance transition (scale, slide) is in the bounding box.
  await panel.evaluate((element) =>
    Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)),
  );
  const box = await panel.boundingBox();
  if (!box) throw new Error("panel not rendered");
  const edge = dir === "rtl" ? box.x : viewport - (box.x + box.width);
  return { w: Math.round(box.width), edge: Math.round(edge), top: Math.round(box.y) };
}

for (const { name: locale, dir, shell } of LOCALES) {
  for (const frame of FRAMES) {
    test.describe(`overlay frames · ${locale} · ${frame.name} ${frame.width}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: frame.width, height: frame.height });
        await page.emulateMedia({ reducedMotion: "reduce" }); // measure the settled geometry
        await page.goto(`/${locale}/dashboard`);
        await waitForHydration(page, bar(page, frame.width).getByRole("button").first());
      });

      test("Notifications popover: width, inline-end edge and top per the approved contract; no sample content", async ({
        page,
      }) => {
        await bar(page, frame.width).getByRole("button", { name: shell.notifications }).click();
        const panel = page.getByRole("dialog", { name: shell.notifications });
        await expect(panel).toBeVisible();
        expect(await geometry(panel, frame.width, dir)).toEqual(frame.notifications.app);
        // D-U8 / D-S5: title and the availability message only.
        await expect(panel).toContainText(shell.notificationsSoon);
        await expect(panel.getByRole("listitem")).toHaveCount(0);
      });

      test("User Menu: width, inline-end edge and top per the approved contract; existing routes only, no logout", async ({
        page,
      }) => {
        await bar(page, frame.width).getByRole("button", { name: shell.accountMenu }).click();
        const menu = page.getByRole("menu", { name: shell.accountMenu });
        await expect(menu).toBeVisible();
        // `role="menu"` is the item list inside the panel (padding 8, border 1): measure the panel.
        const panel = menu.locator("xpath=ancestor-or-self::*[@popover][1]");
        expect(await geometry(panel, frame.width, dir)).toEqual(frame.user.app);
        // D-U8 / D-S6: no account header data, no logout (D-02).
        await expect(menu.getByRole("menuitem")).toHaveCount(2);
      });
    });
  }
}

import type { Page } from "@playwright/test";

import arAuth from "../../src/i18n/messages/ar/authentication.json" with { type: "json" };
import { expect, test, waitForHydration } from "./test";

/**
 * Phase 08 Increment 5, item 1: Authentication visual baselines.
 *
 * The 9 views of the Phase 08 plan §2, each in its Figma default state, Arabic, at 1440, 768 and
 * 390 (27 baselines per platform). Every other state, the English layout and the card geometry
 * stay covered by the assertions in auth-login, auth-register and auth-recovery; this spec adds
 * images only.
 *
 * Capture environment (as landing-visual.spec.ts):
 * - Build: `next dev` (the E2E web server). The forms use the real routes; Register Success,
 *   Email sent and the three Reset result views use the development previews (D-08-4), so their
 *   images include the yellow development-preview banner. **Not a production rendering**: every
 *   Auth route returns 404 in production.
 * - Browser: Playwright bundled Chromium; per-platform baselines (`-chromium-win32` from Windows,
 *   `-chromium-linux` from the CI runner).
 * - deviceScaleFactor 1; reduced motion; fonts and images loaded; the Next.js dev overlay hidden.
 * Baselines are reviewed and approved by the owner, never auto-accepted (Roadmap §8).
 */

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
] as const;

const SHOT = {
  animations: "disabled",
  caret: "hide",
  scale: "css",
  fullPage: true,
  // Tolerates sub-pixel anti-aliasing noise only (0.1% of pixels), as landing-visual.spec.ts.
  maxDiffPixelRatio: 0.001,
  timeout: 20_000,
} as const;

type View = {
  name: string;
  path: string;
  /** Hydration anchor: the first input of the form on the page. */
  form: "login" | "register" | "forgot" | "reset";
  /** Preview result views are reached by submitting the preview form. */
  reach?: (page: Page) => Promise<void>;
  heading: string;
};

const submit = (form: View["form"]) => (page: Page) =>
  page.locator(`[data-${form}-form] button[type="submit"]`).click();

const VIEWS: readonly View[] = [
  { name: "01-login", path: "/login", form: "login", heading: arAuth.login.heading },
  { name: "02-register", path: "/register", form: "register", heading: arAuth.register.heading },
  {
    name: "03-register-success",
    path: "/dev/auth/register?state=success",
    form: "register",
    reach: async (page) => {
      const field = (label: string) => page.getByLabel(label, { exact: true });
      await field(arAuth.register.name).fill("أحمد محمد");
      await field(arAuth.register.email).fill("ahmed@example.com");
      await field(arAuth.register.password).fill("Abcdefg1");
      await field(arAuth.register.confirm).fill("Abcdefg1");
      await submit("register")(page);
    },
    heading: arAuth.register.success.heading,
  },
  { name: "04-forgot", path: "/forgot-password", form: "forgot", heading: arAuth.forgot.heading },
  {
    name: "05-email-sent",
    path: "/dev/auth/forgot-password?state=sent",
    form: "forgot",
    reach: submit("forgot"),
    heading: arAuth.forgot.sent.heading,
  },
  { name: "06-reset", path: "/reset-password", form: "reset", heading: arAuth.reset.heading },
  {
    name: "07-invalid-link",
    path: "/dev/auth/reset-password?state=invalid-link",
    form: "reset",
    reach: submit("reset"),
    heading: arAuth.reset.invalidLink.heading,
  },
  {
    name: "08-expired-link",
    path: "/dev/auth/reset-password?state=expired-link",
    form: "reset",
    reach: submit("reset"),
    heading: arAuth.reset.expiredLink.heading,
  },
  {
    name: "09-updated",
    path: "/dev/auth/reset-password?state=updated",
    form: "reset",
    reach: submit("reset"),
    heading: arAuth.reset.updated.heading,
  },
];

test.use({ deviceScaleFactor: 1, reducedMotion: "reduce" });

for (const view of VIEWS) {
  for (const viewport of VIEWPORTS) {
    test(`auth · ar · ${view.name} · ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(view.path);
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      await waitForHydration(page, page.locator(`[data-${view.form}-form] input`).first());
      if (view.reach) await view.reach(page);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(view.heading);
      await page.evaluate(() => document.fonts.ready);
      // Hydrated above, so changing `loading` cannot cause a hydration mismatch (#3).
      await page.evaluate(() =>
        document.querySelectorAll("img").forEach((img) => {
          img.loading = "eager";
        }),
      );
      await page.waitForFunction(() =>
        [...document.images].every((img) => img.complete && img.naturalWidth > 0),
      );
      // A result view focuses its heading; blur it so no focus ring is captured.
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.mouse.move(0, 0);
      await expect(page).toHaveScreenshot(`auth-ar-${view.name}-${viewport.name}.png`, SHOT);
    });
  }
}

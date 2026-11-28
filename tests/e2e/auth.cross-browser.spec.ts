import type { Page } from "@playwright/test";

import arAuth from "../../src/i18n/messages/ar/authentication.json" with { type: "json" };
import { expect, test, waitForHydration } from "./test";

/**
 * Phase 08 Increment 5, item 4 (I5-2): focused cross-browser smoke of the Authentication UI.
 *
 * Runs in the Firefox and WebKit projects (`*.cross-browser.spec.ts`, playwright.config.ts) as well
 * as Chromium. One test per Auth route, Arabic, 390 wide: the form renders right-to-left, the
 * show/hide toggle works, a keyboard-only valid submit ends with the "unavailable" banner (the
 * placeholder adapter, "UI-complete, not functional"), and nothing overflows. States, geometry,
 * axe and images stay in the Chromium-only specs and are not repeated here.
 *
 * Playwright WebKit is not Safari on a real device: physical Safari (macOS, iOS) testing stays a
 * release-readiness item.
 */

const EMAIL = "ahmed@example.com";
const PASSWORD = "Abcdefg1";

type Route = {
  path: string;
  form: "login" | "register" | "forgot" | "reset";
  heading: string;
  /** Fields in order: label and value, typed from the keyboard. */
  fields: readonly (readonly [label: string, value: string])[];
  /** The password field that owns the first show/hide toggle, if any. */
  password?: string;
  unavailable: string;
};

const ROUTES: readonly Route[] = [
  {
    path: "/login",
    form: "login",
    heading: arAuth.login.heading,
    fields: [
      [arAuth.login.email, EMAIL],
      [arAuth.login.password, PASSWORD],
    ],
    password: arAuth.login.password,
    unavailable: arAuth.errors.unavailable.login,
  },
  {
    path: "/register",
    form: "register",
    heading: arAuth.register.heading,
    fields: [
      [arAuth.register.name, "أحمد محمد"],
      [arAuth.register.email, EMAIL],
      [arAuth.register.password, PASSWORD],
      [arAuth.register.confirm, PASSWORD],
    ],
    password: arAuth.register.password,
    unavailable: arAuth.errors.unavailable.register,
  },
  {
    path: "/forgot-password",
    form: "forgot",
    heading: arAuth.forgot.heading,
    fields: [[arAuth.forgot.email, EMAIL]],
    unavailable: arAuth.errors.unavailable.forgot,
  },
  {
    path: "/reset-password",
    form: "reset",
    heading: arAuth.reset.heading,
    fields: [
      [arAuth.reset.password, PASSWORD],
      [arAuth.reset.confirm, PASSWORD],
    ],
    password: arAuth.reset.password,
    unavailable: arAuth.errors.unavailable.reset,
  },
];

const field = (page: Page, label: string) => page.getByLabel(label, { exact: true });

test.describe("Auth smoke · cross-browser", () => {
  for (const route of ROUTES) {
    test(`${route.path} · 390: renders RTL, show/hide, keyboard submit, no overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route.path);
      await waitForHydration(page, page.locator(`[data-${route.form}-form] input`).first());
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.heading);

      if (route.password) {
        const input = field(page, route.password);
        const toggle = page
          .getByRole("button", { name: arAuth.password.show, exact: true })
          .first();
        await expect(input).toHaveAttribute("type", "password");
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-pressed", "true");
        await expect(input).toHaveAttribute("type", "text");
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await expect(input).toHaveAttribute("type", "password");
      }

      // Keyboard only: focus each field, type, then Enter in the last one submits the form.
      for (const [label, value] of route.fields) {
        await field(page, label).focus();
        await page.keyboard.type(value);
      }
      await page.keyboard.press("Enter");
      await expect(
        page.locator("[data-auth-status-banner], [data-auth-error-banner]").first(),
      ).toHaveText(route.unavailable);
      await expect(page).toHaveURL(new RegExp(`${route.path}$`));

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }
});

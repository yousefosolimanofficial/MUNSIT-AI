import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import arAuth from "../../src/i18n/messages/ar/authentication.json" with { type: "json" };
import enAuth from "../../src/i18n/messages/en/authentication.json" with { type: "json" };
import { expect, test, waitForHydration } from "./test";

/**
 * Phase 08 Increment 5, items 2 and 3: navigation between the Authentication pages, and the
 * accessibility checks the per-screen specs do not already make.
 *
 * Flows (plan §3.6, journeys 1, 3, 4 and 5): every link between the Auth pages, followed by a
 * real click, in Arabic and English. The result views are reached through the development
 * previews (D-08-4). Out of scope: journey 2 (prototype test frame), journey 6 (Dashboard,
 * Phase 09), timed transitions and the demo link (D-08-7).
 *
 * Accessibility at 320 (the per-screen specs run axe at 1440, 768 and 390 and check overflow at
 * 320 in Arabic only): axe, overflow, landmarks, one h1, the decorative marketing photo and a
 * visible keyboard focus indicator, for each Auth route in both languages.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const LOCALES = [
  { lang: "ar", prefix: "", auth: arAuth },
  { lang: "en", prefix: "/en", auth: enAuth },
] as const;

type Auth = typeof arAuth;
type Form = "login" | "register" | "forgot" | "reset";

async function open(page: Page, path: string, form: Form, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await waitForHydration(page, page.locator(`[data-${form}-form] input`).first());
}

const submit = (page: Page, form: Form) =>
  page.locator(`[data-${form}-form] button[type="submit"]`).click();

type Flow = {
  name: string;
  from: string;
  form: Form;
  /** Optional: reach a preview result view before following the link. */
  reach?: (page: Page, auth: Auth) => Promise<void>;
  link: (auth: Auth) => string;
  /** Scope of the link: the form card or the result view. */
  within: string;
  to: string;
  toForm: Form;
  heading: (auth: Auth) => string;
};

const FLOWS: readonly Flow[] = [
  {
    name: "Login → Forgot password",
    from: "/login",
    form: "login",
    link: (a) => a.login.forgot,
    within: "[data-auth-card]",
    to: "/forgot-password",
    toForm: "forgot",
    heading: (a) => a.forgot.heading,
  },
  {
    name: "Login → Register",
    from: "/login",
    form: "login",
    link: (a) => a.login.register,
    within: "[data-auth-card]",
    to: "/register",
    toForm: "register",
    heading: (a) => a.register.heading,
  },
  {
    name: "Register → Login",
    from: "/register",
    form: "register",
    link: (a) => a.register.login,
    within: "[data-auth-card]",
    to: "/login",
    toForm: "login",
    heading: (a) => a.login.heading,
  },
  {
    name: "Forgot password → Login",
    from: "/forgot-password",
    form: "forgot",
    link: (a) => a.forgot.back,
    within: "[data-auth-card]",
    to: "/login",
    toForm: "login",
    heading: (a) => a.login.heading,
  },
  {
    name: "Email sent → Login",
    from: "/dev/auth/forgot-password?state=sent",
    form: "forgot",
    reach: (page) => submit(page, "forgot"),
    link: (a) => a.forgot.back,
    within: "[data-auth-result]",
    to: "/login",
    toForm: "login",
    heading: (a) => a.login.heading,
  },
  {
    name: "Register Success → Login",
    from: "/dev/auth/register?state=success",
    form: "register",
    reach: async (page, a) => {
      const field = (label: string) => page.getByLabel(label, { exact: true });
      await field(a.register.name).fill("Ahmed Mohamed");
      await field(a.register.email).fill("ahmed@example.com");
      await field(a.register.password).fill("Abcdefg1");
      await field(a.register.confirm).fill("Abcdefg1");
      await submit(page, "register");
    },
    link: (a) => a.register.login,
    within: "[data-auth-result]",
    to: "/login",
    toForm: "login",
    heading: (a) => a.login.heading,
  },
  ...(["invalid-link", "expired-link"] as const).flatMap((state): Flow[] => [
    {
      name: `Reset ${state} → Forgot password`,
      from: `/dev/auth/reset-password?state=${state}`,
      form: "reset",
      reach: (page) => submit(page, "reset"),
      link: (a) => (state === "invalid-link" ? a.reset.invalidLink : a.reset.expiredLink).request,
      within: "[data-auth-result]",
      to: "/forgot-password",
      toForm: "forgot",
      heading: (a) => a.forgot.heading,
    },
    {
      name: `Reset ${state} → Login`,
      from: `/dev/auth/reset-password?state=${state}`,
      form: "reset",
      reach: (page) => submit(page, "reset"),
      link: (a) => a.reset.back,
      within: "[data-auth-result]",
      to: "/login",
      toForm: "login",
      heading: (a) => a.login.heading,
    },
  ]),
  {
    name: "Reset Updated → Login",
    from: "/dev/auth/reset-password?state=updated",
    form: "reset",
    reach: (page) => submit(page, "reset"),
    link: (a) => a.reset.back,
    within: "[data-auth-result]",
    to: "/login",
    toForm: "login",
    heading: (a) => a.login.heading,
  },
];

test.describe("Auth flows · links between the Authentication pages", () => {
  for (const { lang, prefix, auth } of LOCALES) {
    for (const flow of FLOWS) {
      test(`${lang} · ${flow.name}`, async ({ page }) => {
        await open(page, `${prefix}${flow.from}`, flow.form);
        if (flow.reach) {
          await flow.reach(page, auth);
          await expect(page.locator("[data-auth-result]")).toBeVisible();
        }
        await page
          .locator(flow.within)
          .getByRole("link", { name: flow.link(auth), exact: true })
          // Register Success has two "Login" links (button and footer); both go to /login.
          .first()
          .click();
        await expect(page).toHaveURL(new RegExp(`${prefix}${flow.to}$`));
        await waitForHydration(page, page.locator(`[data-${flow.toForm}-form] input`).first());
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(flow.heading(auth));
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        // The destination starts at the top, not at the scroll position of the previous page.
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
      });
    }
  }
});

const ROUTES = [
  { path: "/login", form: "login" },
  { path: "/register", form: "register" },
  { path: "/forgot-password", form: "forgot" },
  { path: "/reset-password", form: "reset" },
] as const;

test.describe("Auth accessibility · 320 and structure", () => {
  for (const { lang, prefix } of LOCALES) {
    for (const route of ROUTES) {
      test(`${lang} · ${route.path} · 320: axe, overflow, landmarks, one h1, focus visible`, async ({
        page,
      }) => {
        await open(page, `${prefix}${route.path}`, route.form, 320);
        const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(axe.violations).toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
        await expect(page.locator("main")).toHaveCount(1);
        await expect(page.locator("h1")).toHaveCount(1);
        // The marketing photo is decorative (D-08-9), whether or not the panel shows at 320.
        const alts = await page
          .locator("[data-auth-marketing] img")
          .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt")));
        for (const alt of alts) expect(alt).toBe("");
        // Every keyboard stop in the form shows a focus indicator (outline or glow).
        const stops = page.locator(
          `[data-${route.form}-form] :is(input, button, a), [data-auth-card] a`,
        );
        const count = await stops.count();
        expect(count).toBeGreaterThan(0);
        await stops.first().focus();
        for (let i = 0; i < count; i += 1) {
          // The field glow fades in (box-shadow transition), so poll rather than read once.
          await expect
            .poll(
              () =>
                page.evaluate(() => {
                  const el = document.activeElement;
                  if (!el || el === document.body) return "none";
                  // Auth fields draw the ring on their wrapper (`focus-within`), so check both.
                  for (const node of [el, el.parentElement]) {
                    if (!node) continue;
                    const s = getComputedStyle(node);
                    if (s.outlineStyle !== "none" && s.outlineWidth !== "0px") return "outline";
                    if (s.boxShadow !== "none") return "ring";
                  }
                  return "none";
                }),
              { message: `focus indicator on stop ${i + 1}` },
            )
            .not.toBe("none");
          await page.keyboard.press("Tab");
          const inside = await page.evaluate(
            () => !!document.activeElement?.closest("[data-auth-card]"),
          );
          if (!inside) break;
        }
      });
    }
  }
});

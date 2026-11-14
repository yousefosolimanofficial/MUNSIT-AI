import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./test";

/**
 * Automated accessibility scan in a real browser (Roadmap §4 universal check; closes G-3).
 * WCAG 2.0 / 2.1 / 2.2 A and AA rules, including color contrast, which only a real browser can
 * compute. The Next.js development overlay is excluded: it is not part of the application.
 */

const PAGES = [
  "/",
  "/en",
  "/dev/tokens",
  "/en/dev/tokens",
  "/dev/components",
  "/en/dev/components",
] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const path of PAGES) {
  test(`axe: no WCAG A/AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .exclude("nextjs-portal")
      .analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      sample: v.nodes[0]?.target.join(" "),
    }));
    expect(summary).toEqual([]);
    // The scan really ran: rules were evaluated, including color contrast.
    expect(results.passes.length).toBeGreaterThan(0);
    expect(results.passes.map((r) => r.id)).toContain("color-contrast");
  });
}

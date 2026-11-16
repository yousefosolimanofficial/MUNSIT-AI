// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";

import { SkipLink } from "./SkipLink";

/* Skip link (Phase 05 plan §12). Visibility on focus and the focus move are checked in Chromium. */

afterEach(cleanup);

describe("SkipLink", () => {
  it("is a same-page link to the target, named by its label", () => {
    render(<SkipLink targetId="main-content" label="الانتقال إلى المحتوى الرئيسي" />);
    const link = screen.getByRole("link", { name: "الانتقال إلى المحتوى الرئيسي" });
    expect(link.getAttribute("href")).toBe("#main-content");
  });

  it("is visually hidden until focused, then shown at the inline-start top corner", () => {
    render(<SkipLink targetId="main-content" label="Skip to main content" />);
    const classes = (screen.getByRole("link").getAttribute("class") ?? "").split(/\s+/);
    expect(classes).toEqual(
      expect.arrayContaining(["not-focus:sr-only", "fixed", "start-sm", "top-sm", "h-[44px]"]),
    );
    expect(classes.some((c) => /(^|:)(left|right)-/.test(c))).toBe(false);
  });

  it("has no axe violations", async () => {
    const { container } = render(<SkipLink targetId="main-content" label="Skip to main content" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});

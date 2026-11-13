// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Icon } from "./Icon";

/*
 * Component-test stack check (Phase 03 dev dependencies): jsdom environment per file,
 * Testing Library queries, user-event keyboard input and jest-axe. It uses the existing Icon
 * component and a plain native <button>; it is not a Button component.
 *
 * jsdom does not compute rendered colors, so axe's color-contrast rule is disabled here.
 * Contrast is checked from tokens (src/design-system/contrast.test.ts) and in a real browser.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

afterEach(cleanup);

describe("component-test stack (jsdom + Testing Library + user-event + jest-axe)", () => {
  it("a labelled Icon is exposed as an image with its accessible name", async () => {
    const { container } = render(<Icon name="search" label="بحث" />);
    expect(screen.getByRole("img", { name: "بحث" })).toBeTruthy();
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });

  it("a decorative Icon is hidden from assistive technology", async () => {
    const { container } = render(
      <p>
        <Icon name="home" /> الرئيسية
      </p>,
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });

  it("user-event drives the keyboard: Tab focuses, Enter and Space activate a native button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <button type="button" onClick={onClick}>
        <Icon name="upload" /> رفع
      </button>,
    );
    await user.tab();
    const button = screen.getByRole("button", { name: "رفع" });
    expect(document.activeElement).toBe(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("axe reports a real violation (the check is not a no-op)", async () => {
    const { container } = render(
      <button type="button">
        <Icon name="x" />
      </button>,
    );
    const ids = (await axe(container, AXE_OPTIONS)).violations.map((v) => v.id);
    expect(ids).toContain("button-name");
  });
});

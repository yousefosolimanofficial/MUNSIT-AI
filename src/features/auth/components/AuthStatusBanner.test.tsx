// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";

import arAuth from "@/i18n/messages/ar/authentication.json";

import { AuthButtonLink } from "./AuthButtonLink";
import { AuthResultView } from "./AuthResultView";
import { AuthStatusBanner } from "./AuthStatusBanner";

/*
 * Shared Auth states added for Register (Increment 3) and Recovery (Forgot, Reset): the Failed
 * status banner and the result-view tones. jsdom applies no CSS, so styles are class names and
 * axe's colour-contrast rule is off; geometry is checked in the screens' E2E specs.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const classes = (el: Element | null) => (el?.getAttribute("class") ?? "").split(/\s+/);

afterEach(cleanup);

describe("AuthStatusBanner", () => {
  it("renders nothing without a message", () => {
    const { container } = render(<AuthStatusBanner message={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("an alert with the Figma Failed style: alert icon first, then the message", async () => {
    const { container } = render(
      <AuthStatusBanner id="status" message={arAuth.errors.failed.register} />,
    );
    const banner = screen.getByRole("alert");
    expect(banner.id).toBe("status");
    expect(banner.textContent).toBe(arAuth.errors.failed.register);
    expect(banner.hasAttribute("data-auth-status-banner")).toBe(true);
    for (const c of [
      "rounded-[14px]",
      "border-accent-coral-pulse/35",
      "bg-accent-coral-pulse/8",
      "px-3.5",
      "py-3",
      "gap-2.5",
      "text-dashboard-body-medium",
      "text-accent-coral-pulse",
    ]) {
      expect(classes(banner)).toContain(c);
    }
    const icon = banner.firstElementChild;
    expect(icon?.getAttribute("data-icon")).toBe("alert");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(icon?.getAttribute("width")).toBe("18");
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

describe("AuthResultView tones", () => {
  const view = (tone?: "success" | "danger" | "warning" | null) =>
    render(
      <AuthResultView
        heading={arAuth.register.success.heading}
        body={arAuth.register.success.body}
        actions={<button type="button">{arAuth.register.login}</button>}
        tone={tone}
      />,
    );

  it("defaults to success: check in Success Green", () => {
    const { container } = view();
    const box = container.querySelector("[data-auth-result-icon]");
    expect(box?.getAttribute("data-auth-result-icon")).toBe("success");
    expect(classes(box)).toContain("text-accent-success-green");
    expect(box?.querySelector('[data-icon="check"]')).not.toBeNull();
  });

  it("danger: alert in Coral Pulse; warning: alert in Semantic Warning", () => {
    const danger = view("danger");
    const dangerBox = danger.container.querySelector("[data-auth-result-icon]");
    expect(classes(dangerBox)).toContain("bg-accent-coral-pulse/12");
    expect(classes(dangerBox)).toContain("border-accent-coral-pulse/40");
    expect(dangerBox?.querySelector('[data-icon="alert"]')).not.toBeNull();
    danger.unmount();

    const warning = view("warning");
    const warningBox = warning.container.querySelector("[data-auth-result-icon]");
    expect(classes(warningBox)).toContain("bg-semantic-warning/12");
    expect(classes(warningBox)).toContain("text-semantic-warning");
    expect(warningBox?.querySelector('[data-icon="alert"]')).not.toBeNull();
  });

  it("null draws no icon and keeps one h1", async () => {
    const { container } = view(null);
    expect(container.querySelector("[data-auth-result-icon]")).toBeNull();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

describe("AuthButtonLink", () => {
  it("a localized link with the primary button surface", () => {
    render(
      <NextIntlClientProvider locale="ar" messages={null}>
        <AuthButtonLink href="/login">{arAuth.register.login}</AuthButtonLink>
      </NextIntlClientProvider>,
    );
    const link = screen.getByRole("link", { name: arAuth.register.login });
    expect(link.getAttribute("href")).toBe("/login");
    expect(classes(link)).toContain("h-[52px]");
    expect(classes(link)).toContain("bg-neutral-mist");
    expect(classes(link)).toContain("text-neutral-iron");
  });
});

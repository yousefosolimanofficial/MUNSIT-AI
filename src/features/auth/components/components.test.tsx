// @vitest-environment jsdom
import { useState } from "react";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import arAuth from "@/i18n/messages/ar/authentication.json";
import { ROUTES } from "@/i18n/routes";

import { AuthCardFooter, AuthErrorBanner, AuthFormCard } from "./AuthFormCard";
import { AuthLayout } from "./AuthLayout";
import { AuthPasswordField } from "./AuthPasswordField";
import { AuthResultView } from "./AuthResultView";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthTextField } from "./AuthTextField";
import { AuthTextLink } from "./AuthTextLink";

/*
 * Authentication foundation components (Phase 08 Increment 1, contract §4 and §11).
 *
 * jsdom applies no Tailwind CSS, so styles are checked as class names; geometry, colours and
 * breakpoint visibility are checked in Chromium (tests/e2e/auth-foundation.spec.ts). axe's
 * colour-contrast rule is disabled here for the same reason.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

afterEach(cleanup);

const classes = (el: Element) => (el.getAttribute("class") ?? "").split(/\s+/);

function withIntl(node: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="ar" messages={null}>
      {node}
    </NextIntlClientProvider>
  );
}

describe("AuthTextField (Auth / Input)", () => {
  it("labels the input and shows Default state without an error", () => {
    render(<AuthTextField label={arAuth.login.email} type="email" ltr />);
    const input = screen.getByLabelText(arAuth.login.email);
    expect(input).toHaveProperty("type", "email");
    expect(input.getAttribute("dir")).toBe("ltr");
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.parentElement && classes(input.parentElement)).toContain("border-neutral-slate");
  });

  it("Error: aria-invalid, the message is linked and announced by its id", () => {
    render(<AuthTextField label={arAuth.login.email} error={arAuth.validation.emailInvalid} />);
    const input = screen.getByLabelText(arAuth.login.email);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)?.textContent).toBe(arAuth.validation.emailInvalid);
    expect(input.parentElement && classes(input.parentElement)).toContain(
      "border-accent-coral-pulse",
    );
  });

  it("keeps a caller's aria-describedby next to the error", () => {
    render(
      <>
        <p id="hint">hint</p>
        <AuthTextField label="x" aria-describedby="hint" error="e" />
      </>,
    );
    expect(screen.getByLabelText("x").getAttribute("aria-describedby")).toMatch(/^hint .+-error$/);
  });

  it("Disabled: native attribute and the disabled field styles", () => {
    render(<AuthTextField label={arAuth.register.name} disabled />);
    const input = screen.getByLabelText(arAuth.register.name);
    expect(input).toHaveProperty("disabled", true);
    expect(input.parentElement && classes(input.parentElement)).toContain("opacity-50");
  });

  it("has no axe violations in every state", async () => {
    const { container } = render(
      <>
        <AuthTextField label="a" />
        <AuthTextField label="b" error="e" />
        <AuthTextField label="c" disabled />
      </>,
    );
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

describe("AuthPasswordField (Auth / Password Input)", () => {
  function Controlled({ onChange }: { onChange?: (value: string) => void }) {
    const [visible, setVisible] = useState(false);
    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <AuthPasswordField
          label={arAuth.login.password}
          toggleLabel={arAuth.password.show}
          visible={visible}
          onVisibleChange={setVisible}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </form>
    );
  }

  it("Hidden by default; the toggle is a named button that shows and hides the value", async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByLabelText(arAuth.login.password);
    const toggle = screen.getByRole("button", { name: arAuth.password.show });
    expect(input).toHaveProperty("type", "password");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(toggle).toHaveProperty("type", "button");

    await user.click(toggle);
    expect(input).toHaveProperty("type", "text");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.querySelector("svg")?.getAttribute("data-icon")).toBe("eye-slashed");

    await user.click(toggle);
    expect(input).toHaveProperty("type", "password");
  });

  it("is keyboard operable and never submits the form", async () => {
    const user = userEvent.setup();
    const submit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={submit}>
        <ControlledField />
      </form>,
    );
    await user.tab();
    await user.tab();
    expect(document.activeElement?.getAttribute("aria-pressed")).toBe("false");
    await user.keyboard("{Enter}");
    expect(document.activeElement?.getAttribute("aria-pressed")).toBe("true");
    await user.keyboard(" ");
    expect(document.activeElement?.getAttribute("aria-pressed")).toBe("false");
    expect(submit).not.toHaveBeenCalled();
  });

  function ControlledField() {
    const [visible, setVisible] = useState(false);
    return (
      <AuthPasswordField
        label="p"
        toggleLabel="show"
        visible={visible}
        onVisibleChange={setVisible}
      />
    );
  }

  it("does not log the typed value", async () => {
    const user = userEvent.setup();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.type(screen.getByLabelText(arAuth.login.password), "Secret123");
    expect(onChange).toHaveBeenLastCalledWith("Secret123");
    expect(log).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    log.mockRestore();
    info.mockRestore();
  });

  it("Error and Disabled states; no axe violations", async () => {
    const { container } = render(
      <>
        <AuthPasswordField
          label="a"
          toggleLabel="show"
          visible={false}
          onVisibleChange={() => {}}
          error={arAuth.validation.passwordRequired}
        />
        <AuthPasswordField
          label="b"
          toggleLabel="show b"
          visible
          onVisibleChange={() => {}}
          disabled
        />
      </>,
    );
    expect(screen.getByLabelText("a").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("button", { name: "show b" })).toHaveProperty("disabled", true);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

describe("AuthSubmitButton (Auth / Primary Button)", () => {
  it("Default: a submit button with the label", () => {
    render(
      <AuthSubmitButton loadingLabel={arAuth.login.submitting}>
        {arAuth.login.submit}
      </AuthSubmitButton>,
    );
    const button = screen.getByRole("button", { name: arAuth.login.submit });
    expect(button).toHaveProperty("type", "submit");
    expect(button.hasAttribute("aria-busy")).toBe(false);
  });

  it("Loading: busy, disabled against double submit, loading label, spinner hidden", () => {
    render(
      <AuthSubmitButton loading loadingLabel={arAuth.login.submitting}>
        {arAuth.login.submit}
      </AuthSubmitButton>,
    );
    const button = screen.getByRole("button", { name: arAuth.login.submitting });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button).toHaveProperty("disabled", true);
    expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("Disabled: native attribute and 40% opacity", () => {
    render(
      <AuthSubmitButton disabled loadingLabel="…">
        x
      </AuthSubmitButton>,
    );
    const button = screen.getByRole("button", { name: "x" });
    expect(button).toHaveProperty("disabled", true);
    expect(classes(button)).toContain("opacity-40");
  });
});

describe("AuthFormCard, AuthErrorBanner, AuthTextLink", () => {
  it("renders one h1, the description, content and footer link", async () => {
    const { container } = render(
      withIntl(
        <AuthFormCard
          heading={arAuth.login.heading}
          description={arAuth.login.description}
          footer={
            <AuthCardFooter
              text={arAuth.login.noAccount}
              link={
                <AuthTextLink href={ROUTES["auth.register"]}>{arAuth.login.register}</AuthTextLink>
              }
            />
          }
        >
          <AuthErrorBanner message={arAuth.errors.unavailable.login} />
        </AuthFormCard>,
      ),
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(arAuth.login.heading);
    expect(screen.getByRole("link", { name: arAuth.login.register }).getAttribute("href")).toBe(
      "/register",
    );
    expect(screen.getByRole("alert").textContent).toBe(arAuth.errors.unavailable.login);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });

  it("the error banner renders nothing without a message", () => {
    const { container } = render(<AuthErrorBanner message={null} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("AuthResultView", () => {
  it("status icon, one h1, actions; no axe violations", async () => {
    const { container } = render(
      <AuthResultView
        heading={arAuth.register.success.heading}
        body={arAuth.register.success.body}
        actions={<button type="button">{arAuth.register.login}</button>}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      arAuth.register.success.heading,
    );
    expect(container.querySelector('[data-icon="check"]')).not.toBeNull();
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

describe("AuthLayout (shared layout)", () => {
  const marketing = {
    heading: arAuth.marketing.login.lead,
    lead: arAuth.marketing.login.lead,
    body: arAuth.marketing.login.body,
  };

  function renderLayout() {
    return render(
      <AuthLayout family="login" marketing={marketing}>
        <AuthFormCard heading={arAuth.login.heading} description={arAuth.login.description}>
          <span />
        </AuthFormCard>
      </AuthLayout>,
    );
  }

  it("DOM order: top logo, Tablet panel slot, form column, Mobile/Desktop panel slot", () => {
    const { container } = renderLayout();
    const root = container.querySelector("[data-auth-layout]");
    const order = [...(root?.children ?? [])].map(
      (el) =>
        el.getAttribute("data-auth-logo") ??
        (el.hasAttribute("data-auth-form-column") ? "form" : "panel"),
    );
    expect(order).toEqual(["top", "panel", "form", "panel"]);
  });

  it("exactly one panel slot is displayed per breakpoint (class contract)", () => {
    const { container } = renderLayout();
    const [tabletSlot, otherSlot] = [...container.querySelectorAll("[data-auth-marketing]")];
    expect(tabletSlot && classes(tabletSlot)).toEqual(
      expect.arrayContaining(["hidden", "rail:block", "xl:hidden"]),
    );
    expect(otherSlot && classes(otherSlot)).toEqual(
      expect.arrayContaining(["rail:hidden", "xl:block"]),
    );
  });

  it("the marketing photo is decorative and the panel heading is not a heading", () => {
    const { container } = renderLayout();
    for (const img of container.querySelectorAll("[data-auth-marketing] img")) {
      expect(img.getAttribute("alt")).toBe("");
    }
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    const panel = container.querySelectorAll("[data-auth-marketing]")[1] as HTMLElement;
    // The Login body keeps the Figma line break ("\n", `whitespace-pre-line`); the text matcher
    // collapses whitespace, so compare the collapsed copy.
    const firstParagraph = (arAuth.marketing.login.body[0] ?? "").replace(/\s+/g, " ");
    expect(within(panel).getByText(firstParagraph)).toBeTruthy();
    expect(within(panel).getByText(firstParagraph).classList).toContain("whitespace-pre-line");
  });
});

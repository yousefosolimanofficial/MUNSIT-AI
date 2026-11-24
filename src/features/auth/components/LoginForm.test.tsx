// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import arAuth from "@/i18n/messages/ar/authentication.json";
import type { AuthResult } from "@/types/auth";

import { LoginForm, type LoginFormCopy } from "./LoginForm";

/*
 * Login form (Phase 08 Increment 2, contract §7 "Component"). Geometry and Figma visuals are
 * checked in Chromium (tests/e2e/auth-login.spec.ts); axe's colour-contrast rule is disabled in
 * jsdom (no CSS).
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const UNAVAILABLE = arAuth.errors.unavailable.login;

const COPY: LoginFormCopy = {
  email: arAuth.login.email,
  emailPlaceholder: arAuth.placeholders.email,
  password: arAuth.login.password,
  passwordPlaceholderHidden: arAuth.placeholders.password,
  passwordPlaceholderShown: arAuth.placeholders.passwordShown,
  showPassword: arAuth.password.show,
  forgot: arAuth.login.forgot,
  submit: arAuth.login.submit,
  submitting: arAuth.login.submitting,
  validation: {
    "validation.emailRequired": arAuth.validation.emailRequired,
    "validation.emailInvalid": arAuth.validation.emailInvalid,
    "validation.passwordRequired": arAuth.validation.passwordRequired,
  },
  failures: {
    unavailable: UNAVAILABLE,
    "invalid-credentials": arAuth.errors.invalidCredentials,
    rejected: UNAVAILABLE,
    "invalid-link": UNAVAILABLE,
    "expired-link": UNAVAILABLE,
  },
};

function renderForm(adapter?: AuthAdapter) {
  const user = userEvent.setup();
  const view = render(
    <NextIntlClientProvider locale="ar" messages={null}>
      <h1 id="login-heading">{arAuth.login.heading}</h1>
      <LoginForm copy={COPY} headingId="login-heading" adapter={adapter} />
    </NextIntlClientProvider>,
  );
  const email = screen.getByLabelText(COPY.email);
  const password = screen.getByLabelText(COPY.password);
  const submit = screen.getByRole("button", { name: COPY.submit });
  return { user, view, email, password, submit };
}

function adapterWith(signIn: AuthAdapter["signIn"]): AuthAdapter {
  return { ...placeholderAuthAdapter, signIn };
}

describe("LoginForm", () => {
  it("renders the Figma fields, the inline-end forgot link and the submit button", () => {
    const { email, password, submit } = renderForm();
    expect(screen.getByRole("form", { name: arAuth.login.heading })).toBeTruthy();
    expect(email.getAttribute("type")).toBe("email");
    expect(email.getAttribute("autocomplete")).toBe("email");
    expect(email.getAttribute("dir")).toBe("ltr");
    expect(email.getAttribute("placeholder")).toBe(COPY.emailPlaceholder);
    expect(password.getAttribute("type")).toBe("password");
    expect(password.getAttribute("autocomplete")).toBe("current-password");
    expect(password.getAttribute("placeholder")).toBe(COPY.passwordPlaceholderHidden);
    const forgot = screen.getByRole("link", { name: COPY.forgot });
    expect(forgot.getAttribute("href")).toBe("/forgot-password");
    expect(forgot.parentElement?.className).toContain("justify-end");
    expect(submit.getAttribute("type")).toBe("submit");
    expect(submit.hasAttribute("disabled")).toBe(false);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("Password shown: the toggle shows the value and the shown placeholder, never submits", async () => {
    const signIn = vi.fn(placeholderAuthAdapter.signIn);
    const { user, password } = renderForm(adapterWith(signIn));
    const toggle = screen.getByRole("button", { name: COPY.showPassword });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    await user.click(toggle);
    expect(password.getAttribute("type")).toBe("text");
    expect(password.getAttribute("placeholder")).toBe(COPY.passwordPlaceholderShown);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: COPY.showPassword })).toBe(toggle);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("validates on blur, then clears the error as soon as the value is valid", async () => {
    const { user, email, password } = renderForm();
    await user.click(email);
    await user.tab();
    expect(await screen.findByText(COPY.validation["validation.emailRequired"])).toBeTruthy();
    expect(email.getAttribute("aria-invalid")).toBe("true");

    await user.click(email);
    await user.type(email, "ahmed@example");
    expect(await screen.findByText(COPY.validation["validation.emailInvalid"])).toBeTruthy();
    await user.type(email, ".com");
    expect(screen.queryByText(COPY.validation["validation.emailInvalid"])).toBeNull();
    expect(email.hasAttribute("aria-invalid")).toBe(false);

    await user.click(password);
    await user.tab();
    expect(await screen.findByText(COPY.validation["validation.passwordRequired"])).toBeTruthy();
    await user.click(password);
    await user.type(password, "x");
    expect(screen.queryByText(COPY.validation["validation.passwordRequired"])).toBeNull();
  });

  it("submit with errors shows them, focuses the first invalid field and calls nothing (L-2)", async () => {
    const signIn = vi.fn(placeholderAuthAdapter.signIn);
    const { user, email, submit } = renderForm(adapterWith(signIn));
    await user.click(submit);
    expect(await screen.findByText(COPY.validation["validation.emailRequired"])).toBeTruthy();
    expect(screen.getByText(COPY.validation["validation.passwordRequired"])).toBeTruthy();
    expect(document.activeElement).toBe(email);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("valid submit with the placeholder adapter: Loading, then the unavailable banner", async () => {
    const log = vi.spyOn(console, "log");
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user, email, password, submit } = renderForm();
    await user.type(email, "  ahmed@example.com ");
    await user.type(password, "Secret-123");
    await user.click(submit);
    const banner = await screen.findByRole("alert");
    expect(banner.textContent).toBe(UNAVAILABLE);
    expect(banner.textContent).not.toBe(arAuth.errors.invalidCredentials);
    expect(document.activeElement).not.toBe(banner);
    expect(submit.hasAttribute("disabled")).toBe(false);
    for (const spy of [log, warn, error]) {
      for (const call of spy.mock.calls) {
        expect(JSON.stringify(call)).not.toMatch(/ahmed@example\.com|Secret-123/);
      }
    }
  });

  it("calls the adapter once with the trimmed email and the untouched password", async () => {
    const signIn = vi.fn((): Promise<AuthResult> =>
      Promise.resolve({ ok: false, failure: "unavailable" }),
    );
    const { user, email, password, submit } = renderForm(adapterWith(signIn));
    await user.type(email, "  ahmed@example.com ");
    await user.type(password, " Secret-123 ");
    await user.click(submit);
    await screen.findByRole("alert");
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith({ email: "ahmed@example.com", password: " Secret-123 " });
  });

  it("Loading: the Figma Loading button, aria-busy, and no second submit", async () => {
    let settle: (result: AuthResult) => void = () => undefined;
    const signIn = vi.fn(
      () =>
        new Promise<AuthResult>((resolve) => {
          settle = resolve;
        }),
    );
    const { user, email, password, submit } = renderForm(adapterWith(signIn));
    await user.type(email, "ahmed@example.com");
    await user.type(password, "Secret-123");
    await user.click(submit);
    const loading = await screen.findByRole("button", { name: COPY.submitting });
    expect(loading).toBe(submit);
    expect(loading.getAttribute("aria-busy")).toBe("true");
    expect(loading.hasAttribute("disabled")).toBe(true);
    expect(loading.hasAttribute("data-loading")).toBe(true);
    await user.type(password, "{Enter}");
    await user.click(loading);
    expect(signIn).toHaveBeenCalledTimes(1);
    await act(async () => settle({ ok: false, failure: "unavailable" }));
    expect((await screen.findByRole("alert")).textContent).toBe(UNAVAILABLE);
    expect(screen.getByRole("button", { name: COPY.submit }).hasAttribute("disabled")).toBe(false);
  });

  it("maps each failure to its banner and fails closed on an adapter error", async () => {
    const cases: [AuthAdapter["signIn"], string][] = [
      [
        () => Promise.resolve({ ok: false, failure: "invalid-credentials" }),
        arAuth.errors.invalidCredentials,
      ],
      [() => Promise.resolve({ ok: false, failure: "rejected" }), UNAVAILABLE],
      [() => Promise.reject(new Error("network")), UNAVAILABLE],
    ];
    for (const [signIn, expected] of cases) {
      const { user, email, password, submit, view } = renderForm(adapterWith(signIn));
      await user.type(email, "ahmed@example.com");
      await user.type(password, "x");
      await user.click(submit);
      expect((await screen.findByRole("alert")).textContent).toBe(expected);
      view.unmount();
    }
  });

  it("rejected credentials mark both fields (Figma Error); unavailable leaves them Default", async () => {
    const rejected = renderForm(
      adapterWith(() => Promise.resolve({ ok: false, failure: "invalid-credentials" })),
    );
    await rejected.user.type(rejected.email, "ahmed@example.com");
    await rejected.user.type(rejected.password, "x");
    await rejected.user.click(rejected.submit);
    const banner = await screen.findByRole("alert");
    for (const input of [rejected.email, rejected.password]) {
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.getAttribute("aria-describedby")).toContain(banner.id);
      expect(input.parentElement?.className).toContain("border-accent-coral-pulse/70");
    }
    rejected.view.unmount();

    const unavailable = renderForm();
    await unavailable.user.type(unavailable.email, "ahmed@example.com");
    await unavailable.user.type(unavailable.password, "x");
    await unavailable.user.click(unavailable.submit);
    await screen.findByRole("alert");
    for (const input of [unavailable.email, unavailable.password]) {
      expect(input.hasAttribute("aria-invalid")).toBe(false);
      expect(input.parentElement?.className).toContain("border-neutral-slate");
    }
  });

  it("a success result shows nothing that suggests a signed-in user", async () => {
    const { user, email, password, submit } = renderForm(
      adapterWith(() => Promise.resolve({ ok: true })),
    );
    await user.type(email, "ahmed@example.com");
    await user.type(password, "x");
    await user.click(submit);
    expect(await screen.findByRole("button", { name: COPY.submit })).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("has no axe violations in Default and with errors", async () => {
    const { user, view, submit } = renderForm();
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
    await user.click(submit);
    await screen.findByText(COPY.validation["validation.emailRequired"]);
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

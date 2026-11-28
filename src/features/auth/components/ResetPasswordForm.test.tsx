// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import arAuth from "@/i18n/messages/ar/authentication.json";
import type { AuthResult } from "@/types/auth";

import {
  ResetPasswordForm,
  type ResetPasswordFormCopy,
  type ResetPasswordInitialState,
} from "./ResetPasswordForm";

/*
 * Reset Password form (Phase 08 Recovery UI, START_HERE §8 "Component"). Geometry and Figma
 * visuals are checked in Chromium (tests/e2e/auth-recovery.spec.ts); axe's colour-contrast rule is
 * disabled in jsdom (no CSS).
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const PASSWORD = "Secret-123";
const TOKEN = "opaque-token-value";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const UNAVAILABLE = arAuth.errors.unavailable.reset;
const FAILED = arAuth.errors.failed.reset;

const COPY: ResetPasswordFormCopy = {
  heading: arAuth.reset.heading,
  description: arAuth.reset.description,
  password: arAuth.reset.password,
  confirm: arAuth.reset.confirm,
  passwordPlaceholderHidden: arAuth.placeholders.password,
  passwordPlaceholderShown: arAuth.placeholders.passwordShown,
  showPassword: arAuth.password.show,
  submit: arAuth.reset.submit,
  submitting: arAuth.reset.submitting,
  retry: arAuth.common.retry,
  back: arAuth.reset.back,
  rules: { length: "8 أحرف على الأقل", case: arAuth.rules.case, digit: arAuth.rules.digit },
  ruleStatus: arAuth.status,
  updated: arAuth.reset.updated,
  invalidLink: arAuth.reset.invalidLink,
  expiredLink: arAuth.reset.expiredLink,
  validation: {
    "validation.newPasswordRequired": arAuth.validation.newPasswordRequired,
    "validation.passwordRules": arAuth.validation.passwordRules,
    "validation.confirmNewRequired": arAuth.validation.confirmNewRequired,
    "validation.mismatch": arAuth.validation.mismatch,
  },
  failures: {
    unavailable: UNAVAILABLE,
    rejected: FAILED,
    "invalid-credentials": UNAVAILABLE,
    "invalid-link": UNAVAILABLE,
    "expired-link": UNAVAILABLE,
  },
};

function renderForm(
  options: { adapter?: AuthAdapter; token?: string; initialState?: ResetPasswordInitialState } = {},
) {
  const user = userEvent.setup();
  const view = render(
    <NextIntlClientProvider locale="ar" messages={null}>
      <ResetPasswordForm copy={COPY} {...options} />
    </NextIntlClientProvider>,
  );
  const password = screen.getByLabelText(COPY.password);
  const confirm = screen.getByLabelText(COPY.confirm);
  const submit = screen.getByRole("button", { name: COPY.submit });
  const [newToggle, confirmToggle] = screen.getAllByRole("button", { name: COPY.showPassword });
  if (!newToggle || !confirmToggle) throw new Error("both toggles must render");
  return { user, view, password, confirm, submit, newToggle, confirmToggle };
}

function adapterWith(resetPassword: AuthAdapter["resetPassword"]): AuthAdapter {
  return { ...placeholderAuthAdapter, resetPassword };
}

function ruleStates() {
  return [...document.querySelectorAll("[data-password-rule]")].map((li) =>
    li.getAttribute("data-password-rule"),
  );
}

async function fillValid(user: ReturnType<typeof userEvent.setup>, a: HTMLElement, b: HTMLElement) {
  await user.type(a, PASSWORD);
  await user.type(b, PASSWORD);
}

describe("ResetPasswordForm", () => {
  it("Default: heading, two new-password fields, neutral rules, button and back link", () => {
    const { password, confirm, submit, newToggle, confirmToggle } = renderForm();
    expect(screen.getByRole("heading", { level: 1, name: COPY.heading })).toBeTruthy();
    expect(screen.getByRole("form", { name: COPY.heading })).toBeTruthy();
    for (const input of [password, confirm]) {
      expect(input.getAttribute("type")).toBe("password");
      expect(input.getAttribute("autocomplete")).toBe("new-password");
      expect(input.getAttribute("placeholder")).toBe(COPY.passwordPlaceholderHidden);
    }
    // The new-password field is described by the rules list.
    const rules = document.querySelector("[data-password-rules]");
    expect(password.getAttribute("aria-describedby")).toContain(rules?.id ?? "missing");
    expect(ruleStates()).toEqual(["neutral", "neutral", "neutral"]);
    // Each toggle is described by its own field label (told apart without new copy).
    expect(newToggle.getAttribute("aria-describedby")).not.toBe(
      confirmToggle.getAttribute("aria-describedby"),
    );
    expect(newToggle.getAttribute("type")).toBe("button");
    expect(submit.getAttribute("type")).toBe("submit");
    expect(screen.getByRole("link", { name: COPY.back }).getAttribute("href")).toBe("/login");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("toggles are independent, show the shown placeholder, and never submit", async () => {
    const reset = vi.fn(placeholderAuthAdapter.resetPassword);
    const { user, password, confirm, newToggle, confirmToggle } = renderForm({
      adapter: adapterWith(reset),
    });
    await user.click(newToggle);
    expect(password.getAttribute("type")).toBe("text");
    expect(password.getAttribute("placeholder")).toBe(COPY.passwordPlaceholderShown);
    expect(confirm.getAttribute("type")).toBe("password");
    expect(newToggle.getAttribute("aria-pressed")).toBe("true");
    expect(confirmToggle.getAttribute("aria-pressed")).toBe("false");

    await user.click(confirmToggle);
    expect(confirm.getAttribute("type")).toBe("text");
    await user.click(newToggle);
    expect(password.getAttribute("type")).toBe("password");
    expect(confirm.getAttribute("type")).toBe("text");
    expect(reset).not.toHaveBeenCalled();
    expect(screen.queryByText(COPY.validation["validation.newPasswordRequired"])).toBeNull();
  });

  it("rules: neutral while empty, met rules Valid while typing, unmet Error after blur", async () => {
    const { user, password, confirm } = renderForm();
    await user.type(password, "abc");
    // length unmet, case unmet (no upper), digit unmet: all stay Neutral before the check.
    expect(ruleStates()).toEqual(["neutral", "neutral", "neutral"]);
    await user.type(password, "D");
    expect(ruleStates()).toEqual(["neutral", "valid", "neutral"]);
    await user.click(confirm);
    // Blurred with unmet rules: those turn Error, with the rules helper.
    expect(await screen.findByText(COPY.validation["validation.passwordRules"])).toBeTruthy();
    expect(ruleStates()).toEqual(["error", "valid", "error"]);
    await user.type(password, "1234");
    expect(ruleStates()).toEqual(["valid", "valid", "valid"]);
    expect(screen.queryByText(COPY.validation["validation.passwordRules"])).toBeNull();
    await user.clear(password);
    expect(ruleStates()).toEqual(["neutral", "neutral", "neutral"]);
  });

  it("Required: blur then change on each field", async () => {
    const { user, password, confirm } = renderForm();
    await user.click(password);
    await user.tab(); // to the new-password toggle
    expect(await screen.findByText(COPY.validation["validation.newPasswordRequired"])).toBeTruthy();
    expect(password.getAttribute("aria-invalid")).toBe("true");
    await user.click(confirm);
    await user.tab();
    expect(await screen.findByText(COPY.validation["validation.confirmNewRequired"])).toBeTruthy();
    await user.type(confirm, "x");
    expect(screen.queryByText(COPY.validation["validation.confirmNewRequired"])).toBeNull();
  });

  it("Mismatch on confirm blur, and re-checked when the new password changes (R-9)", async () => {
    const { user, password, confirm } = renderForm();
    await user.type(password, PASSWORD);
    await user.type(confirm, "Secret-12");
    await user.tab();
    expect(await screen.findByText(COPY.validation["validation.mismatch"])).toBeTruthy();
    expect(confirm.getAttribute("aria-invalid")).toBe("true");
    // Changing the confirmation re-checks on every change.
    await user.type(confirm, "3");
    expect(screen.queryByText(COPY.validation["validation.mismatch"])).toBeNull();
    // Changing the new password after confirm was touched re-checks the match.
    await user.type(password, "4");
    expect(await screen.findByText(COPY.validation["validation.mismatch"])).toBeTruthy();
    await user.type(password, "{Backspace}");
    expect(screen.queryByText(COPY.validation["validation.mismatch"])).toBeNull();
  });

  it("does not check the confirmation before it is touched", async () => {
    const { user, password } = renderForm();
    await user.type(password, PASSWORD);
    expect(screen.queryByText(COPY.validation["validation.confirmNewRequired"])).toBeNull();
    expect(screen.queryByText(COPY.validation["validation.mismatch"])).toBeNull();
  });

  it("submit with errors: both shown, focus on the first invalid field, button enabled", async () => {
    const reset = vi.fn(placeholderAuthAdapter.resetPassword);
    const { user, password, confirm, submit } = renderForm({ adapter: adapterWith(reset) });
    await user.click(submit);
    expect(await screen.findByText(COPY.validation["validation.newPasswordRequired"])).toBeTruthy();
    expect(screen.getByText(COPY.validation["validation.confirmNewRequired"])).toBeTruthy();
    expect(document.activeElement).toBe(password);
    expect(submit.hasAttribute("disabled")).toBe(false);
    expect(ruleStates()).toEqual(["neutral", "neutral", "neutral"]);

    await user.type(password, PASSWORD);
    await user.click(submit);
    expect(document.activeElement).toBe(confirm);
    expect(reset).not.toHaveBeenCalled();
  });

  it("calls the adapter once with { token ?? '', password }, never the confirmation", async () => {
    const reset = vi.fn((): Promise<AuthResult> =>
      Promise.resolve({ ok: false, failure: "unavailable" }),
    );
    const spaced = ` ${PASSWORD} `;
    const noToken = renderForm({ adapter: adapterWith(reset) });
    await fillValid(noToken.user, noToken.password, noToken.confirm);
    await noToken.user.clear(noToken.password);
    await noToken.user.clear(noToken.confirm);
    await noToken.user.type(noToken.password, spaced);
    await noToken.user.type(noToken.confirm, spaced);
    await noToken.user.click(noToken.submit);
    await screen.findByRole("alert");
    expect(reset).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledWith({ token: "", password: spaced });
    noToken.view.unmount();

    const withToken = renderForm({ adapter: adapterWith(reset), token: TOKEN });
    await fillValid(withToken.user, withToken.password, withToken.confirm);
    await withToken.user.click(withToken.submit);
    await screen.findByRole("alert");
    expect(reset).toHaveBeenLastCalledWith({ token: TOKEN, password: PASSWORD });
    const [input] = reset.mock.lastCall as unknown as [Record<string, unknown>];
    expect(Object.keys(input).sort()).toEqual(["password", "token"]);
    // RC-4: the token is never shown.
    expect(withToken.view.container.innerHTML).not.toContain(TOKEN);
  });

  it("placeholder adapter: the unavailable banner above the fields, label unchanged, nothing logged", async () => {
    const spies = [vi.spyOn(console, "log"), vi.spyOn(console, "warn"), vi.spyOn(console, "error")];
    const { user, password, confirm, submit, view } = renderForm({ token: TOKEN });
    await fillValid(user, password, confirm);
    await user.click(submit);
    const banner = await screen.findByRole("alert");
    expect(banner.textContent).toBe(UNAVAILABLE);
    expect(
      banner.compareDocumentPosition(password) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(document.activeElement).not.toBe(banner);
    expect(password.hasAttribute("aria-invalid")).toBe(false);
    expect(screen.getByRole("button", { name: COPY.submit })).toBe(submit);
    for (const spy of spies) {
      for (const call of spy.mock.calls) {
        expect(JSON.stringify(call)).not.toMatch(/Secret-123|opaque-token-value/);
      }
    }
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(view.container.innerHTML).not.toContain(TOKEN);
  });

  it("Loading: the Loading label, aria-busy, and no second submit", async () => {
    let settle: (result: AuthResult) => void = () => undefined;
    const reset = vi.fn(
      () =>
        new Promise<AuthResult>((resolve) => {
          settle = resolve;
        }),
    );
    const { user, password, confirm, submit } = renderForm({ adapter: adapterWith(reset) });
    await fillValid(user, password, confirm);
    await user.click(submit);
    const loading = await screen.findByRole("button", { name: COPY.submitting });
    expect(loading).toBe(submit);
    expect(loading.getAttribute("aria-busy")).toBe("true");
    expect(loading.hasAttribute("disabled")).toBe(true);
    await user.type(confirm, "{Enter}");
    await user.click(loading);
    expect(reset).toHaveBeenCalledTimes(1);
    await act(async () => settle({ ok: false, failure: "unavailable" }));
    expect((await screen.findByRole("alert")).textContent).toBe(UNAVAILABLE);
  });

  it("Error (preview `rejected`): the Error banner and the retry label", async () => {
    const { user, password, confirm, submit } = renderForm({
      adapter: adapterWith(() => Promise.resolve({ ok: false, failure: "rejected" })),
    });
    await fillValid(user, password, confirm);
    await user.click(submit);
    expect((await screen.findByRole("alert")).textContent).toBe(FAILED);
    expect(screen.getByRole("button", { name: COPY.retry })).toBe(submit);
  });

  it("fails closed with the unavailable banner when the adapter throws", async () => {
    const { user, password, confirm, submit } = renderForm({
      adapter: adapterWith(() => Promise.reject(new Error("network"))),
    });
    await fillValid(user, password, confirm);
    await user.click(submit);
    expect((await screen.findByRole("alert")).textContent).toBe(UNAVAILABLE);
    expect(screen.queryByText(COPY.updated.heading)).toBeNull();
  });

  const views = [
    {
      result: { ok: true } as const,
      tone: "success",
      heading: COPY.updated.heading,
      body: COPY.updated.body,
      primary: { name: COPY.back, href: "/login" },
      footer: false,
    },
    {
      result: { ok: false, failure: "invalid-link" } as const,
      tone: "danger",
      heading: COPY.invalidLink.heading,
      body: COPY.invalidLink.body,
      primary: { name: COPY.invalidLink.request, href: "/forgot-password" },
      footer: true,
    },
    {
      result: { ok: false, failure: "expired-link" } as const,
      tone: "warning",
      heading: COPY.expiredLink.heading,
      body: COPY.expiredLink.body,
      primary: { name: COPY.expiredLink.request, href: "/forgot-password" },
      footer: true,
    },
  ];

  for (const v of views) {
    it(`preview result ${v.tone}: the view replaces the card and its heading takes focus`, async () => {
      const { user, password, confirm, submit, view } = renderForm({
        adapter: adapterWith(() => Promise.resolve(v.result)),
      });
      await fillValid(user, password, confirm);
      await user.click(submit);
      const heading = await screen.findByRole("heading", { level: 1, name: v.heading });
      expect(document.activeElement).toBe(heading);
      expect(view.container.querySelectorAll("h1")).toHaveLength(1);
      expect(screen.getByText(v.body)).toBeTruthy();
      expect(screen.queryByRole("form")).toBeNull();
      expect(
        view.container
          .querySelector("[data-auth-result-icon]")
          ?.getAttribute("data-auth-result-icon"),
      ).toBe(v.tone);
      const links = screen.getAllByRole("link");
      expect(links[0]?.textContent).toBe(v.primary.name);
      expect(links[0]?.getAttribute("href")).toBe(v.primary.href);
      expect(links[0]?.hasAttribute("data-auth-button-link")).toBe(true);
      if (v.footer) {
        expect(links).toHaveLength(2);
        expect(links[1]?.textContent).toBe(COPY.back);
        expect(links[1]?.getAttribute("href")).toBe("/login");
      } else {
        expect(links).toHaveLength(1);
      }
      expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
    });
  }

  it("preview initial state: visibility, Required and Mismatch at once, without focus", async () => {
    const shown = renderForm({ initialState: { visible: { confirmPassword: true } } });
    expect(shown.password.getAttribute("type")).toBe("password");
    expect(shown.confirm.getAttribute("type")).toBe("text");
    shown.view.unmount();

    const required = renderForm({ initialState: { validate: true } });
    expect(await screen.findByText(COPY.validation["validation.newPasswordRequired"])).toBeTruthy();
    expect(screen.getByText(COPY.validation["validation.confirmNewRequired"])).toBeTruthy();
    expect(ruleStates()).toEqual(["neutral", "neutral", "neutral"]);
    expect(document.activeElement).not.toBe(required.password);
    required.view.unmount();

    renderForm({
      initialState: {
        values: { newPassword: PASSWORD, confirmPassword: "Secret-124" },
        validate: true,
      },
    });
    expect(await screen.findByText(COPY.validation["validation.mismatch"])).toBeTruthy();
    expect(ruleStates()).toEqual(["valid", "valid", "valid"]);
  });

  it("has no axe violations in Default, Required, Mismatch and Error", async () => {
    const { user, view, password, confirm, submit } = renderForm({
      adapter: adapterWith(() => Promise.resolve({ ok: false, failure: "rejected" })),
    });
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
    await user.click(submit);
    await screen.findByText(COPY.validation["validation.newPasswordRequired"]);
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
    await user.type(password, PASSWORD);
    await user.type(confirm, "other");
    await screen.findByText(COPY.validation["validation.mismatch"]);
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
    await user.clear(confirm);
    await user.type(confirm, PASSWORD);
    await user.click(submit);
    await screen.findByRole("alert");
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

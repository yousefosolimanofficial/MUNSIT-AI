// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { placeholderAuthAdapter, type AuthAdapter } from "@/api/adapters/auth";
import arAuth from "@/i18n/messages/ar/authentication.json";
import type { AuthResult } from "@/types/auth";

import { RegisterForm, type RegisterFormCopy } from "./RegisterForm";

/*
 * Register form (Phase 08 Increment 3, contract §8 "Component"). Geometry and Figma visuals are
 * checked in Chromium (tests/e2e/auth-register.spec.ts); axe's colour-contrast rule is disabled in
 * jsdom (no CSS).
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const PASSWORD = "Abcdefg1";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const COPY: RegisterFormCopy = {
  heading: arAuth.register.heading,
  description: arAuth.register.description,
  name: arAuth.register.name,
  email: arAuth.register.email,
  emailPlaceholder: arAuth.placeholders.email,
  password: arAuth.register.password,
  confirm: arAuth.register.confirm,
  passwordPlaceholderHidden: arAuth.placeholders.password,
  passwordPlaceholderShown: arAuth.placeholders.passwordShown,
  showPassword: arAuth.password.show,
  submit: arAuth.register.submit,
  submitting: arAuth.register.submitting,
  retry: arAuth.common.retry,
  hasAccount: arAuth.register.hasAccount,
  login: arAuth.register.login,
  rules: { length: "8 أحرف على الأقل", case: arAuth.rules.case, digit: arAuth.rules.digit },
  ruleStatus: { met: arAuth.status.met, notMet: arAuth.status.notMet },
  validation: {
    "validation.nameRequired": arAuth.validation.nameRequired,
    "validation.emailRequired": arAuth.validation.emailRequired,
    "validation.emailInvalid": arAuth.validation.emailInvalid,
    "validation.passwordRequired": arAuth.validation.passwordRequired,
    "validation.passwordRules": arAuth.validation.passwordRules,
    "validation.confirmRequired": arAuth.validation.confirmRequired,
    "validation.mismatch": arAuth.validation.mismatch,
  },
  unavailable: arAuth.errors.unavailable.register,
  failed: arAuth.errors.failed.register,
  success: arAuth.register.success,
};

function adapterWith(registerFn: AuthAdapter["register"]): AuthAdapter {
  return { ...placeholderAuthAdapter, register: registerFn };
}

function renderForm(adapter?: AuthAdapter) {
  const user = userEvent.setup();
  const view = render(
    <NextIntlClientProvider locale="ar" messages={null}>
      <RegisterForm copy={COPY} adapter={adapter} />
    </NextIntlClientProvider>,
  );
  const field = (label: string) => screen.getByLabelText(label, { selector: "input" });
  return {
    user,
    view,
    name: field(COPY.name),
    email: field(COPY.email),
    password: field(COPY.password),
    confirm: field(COPY.confirm),
    submit: () => screen.getByRole("button", { name: /إنشاء حساب|إعادة المحاولة/ }),
  };
}

async function fillValid(f: ReturnType<typeof renderForm>, password = PASSWORD) {
  await f.user.type(f.name, "  أحمد محمد ");
  await f.user.type(f.email, " ahmed@example.com ");
  await f.user.type(f.password, password);
  await f.user.type(f.confirm, password);
}

const ruleStates = () =>
  [...document.querySelectorAll("[data-password-rule]")].map((el) =>
    el.getAttribute("data-password-rule"),
  );

describe("RegisterForm", () => {
  it("renders the Figma fields, the rules row and the footer link; one h1 names the form", () => {
    const f = renderForm();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("form", { name: COPY.heading })).toBeTruthy();
    expect(f.name.getAttribute("autocomplete")).toBe("name");
    expect(f.name.getAttribute("placeholder")).toBe(COPY.name);
    expect(f.name.hasAttribute("dir")).toBe(false);
    expect(f.email.getAttribute("type")).toBe("email");
    expect(f.email.getAttribute("dir")).toBe("ltr");
    for (const input of [f.password, f.confirm]) {
      expect(input.getAttribute("type")).toBe("password");
      expect(input.getAttribute("autocomplete")).toBe("new-password");
      expect(input.getAttribute("placeholder")).toBe(COPY.passwordPlaceholderHidden);
    }
    const rules = document.querySelector("[data-password-rules]");
    expect(f.password.getAttribute("aria-describedby")).toContain(rules?.id);
    expect(ruleStates()).toEqual(["neutral", "neutral", "neutral"]);
    expect(screen.getByRole("link", { name: COPY.login }).getAttribute("href")).toBe("/login");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("two independent toggles with the approved name, each described by its field (R-6)", async () => {
    const f = renderForm();
    const toggles = screen.getAllByRole("button", { name: COPY.showPassword });
    expect(toggles).toHaveLength(2);
    const described = toggles.map(
      (t) => document.getElementById(t.getAttribute("aria-describedby") ?? "")?.textContent,
    );
    expect(described).toEqual([COPY.password, COPY.confirm]);
    await f.user.click(toggles[1] as HTMLElement);
    expect(f.confirm.getAttribute("type")).toBe("text");
    expect(f.confirm.getAttribute("placeholder")).toBe(COPY.passwordPlaceholderShown);
    expect(f.password.getAttribute("type")).toBe("password");
    await f.user.click(toggles[0] as HTMLElement);
    expect(f.password.getAttribute("type")).toBe("text");
  });

  it("rules (R-2): neutral while empty, met → valid while typing, unmet → error once checked", async () => {
    const f = renderForm();
    await f.user.type(f.password, "abcdefgh");
    // length met; case and digit unmet but not yet checked
    expect(ruleStates()).toEqual(["valid", "neutral", "neutral"]);
    await f.user.tab();
    expect(await screen.findByText(COPY.validation["validation.passwordRules"])).toBeTruthy();
    expect(ruleStates()).toEqual(["valid", "error", "error"]);
    await f.user.click(f.password);
    await f.user.clear(f.password);
    await f.user.type(f.password, PASSWORD);
    expect(ruleStates()).toEqual(["valid", "valid", "valid"]);
    expect(screen.queryByText(COPY.validation["validation.passwordRules"])).toBeNull();
  });

  it("blur validation per field and clearing on change", async () => {
    const f = renderForm();
    for (const [input, key] of [
      [f.name, "validation.nameRequired"],
      [f.email, "validation.emailRequired"],
      [f.confirm, "validation.confirmRequired"],
    ] as const) {
      await f.user.click(input);
      await f.user.tab();
      expect(await screen.findByText(COPY.validation[key])).toBeTruthy();
    }
    await f.user.type(f.name, "أحمد");
    expect(screen.queryByText(COPY.validation["validation.nameRequired"])).toBeNull();
    await f.user.type(f.email, "ahmed@example");
    expect(await screen.findByText(COPY.validation["validation.emailInvalid"])).toBeTruthy();
  });

  it("mismatch on confirm, re-checked when the password changes (R-9)", async () => {
    const f = renderForm();
    await f.user.type(f.password, PASSWORD);
    await f.user.type(f.confirm, "Abcdefg2");
    await f.user.tab();
    expect(await screen.findByText(COPY.validation["validation.mismatch"])).toBeTruthy();
    await f.user.click(f.password);
    await f.user.clear(f.password);
    await f.user.type(f.password, "Abcdefg2");
    expect(screen.queryByText(COPY.validation["validation.mismatch"])).toBeNull();
  });

  it("submit with errors shows Required for all, focuses the first field and calls nothing", async () => {
    const registerFn = vi.fn(placeholderAuthAdapter.register);
    const f = renderForm(adapterWith(registerFn));
    await f.user.click(f.submit());
    for (const key of [
      "validation.nameRequired",
      "validation.emailRequired",
      "validation.passwordRequired",
      "validation.confirmRequired",
    ] as const) {
      expect(await screen.findByText(COPY.validation[key])).toBeTruthy();
    }
    expect(document.activeElement).toBe(f.name);
    expect(registerFn).not.toHaveBeenCalled();
  });

  it("valid submit with the placeholder adapter: the unavailable status banner, button unchanged (R-3)", async () => {
    const spies = [vi.spyOn(console, "log"), vi.spyOn(console, "warn"), vi.spyOn(console, "error")];
    const f = renderForm();
    await fillValid(f);
    await f.user.click(f.submit());
    const banner = await screen.findByRole("alert");
    expect(banner.textContent).toBe(COPY.unavailable);
    expect(banner.hasAttribute("data-auth-status-banner")).toBe(true);
    expect(f.submit().textContent).toBe(COPY.submit);
    for (const input of [f.name, f.email, f.password, f.confirm]) {
      expect(input.hasAttribute("aria-invalid")).toBe(false);
    }
    // The banner sits before the fields, inside the form (Figma Failed layout).
    const form = screen.getByRole("form");
    expect(form.firstElementChild).toBe(banner);
    for (const spy of spies) {
      for (const call of spy.mock.calls) {
        expect(JSON.stringify(call)).not.toMatch(/ahmed@example\.com|Abcdefg1/);
      }
    }
  });

  it("calls the adapter once with the trimmed name and email and the password, never the confirmation", async () => {
    const registerFn = vi.fn((): Promise<AuthResult> =>
      Promise.resolve({ ok: false, failure: "unavailable" }),
    );
    const f = renderForm(adapterWith(registerFn));
    await fillValid(f);
    await f.user.click(f.submit());
    await screen.findByRole("alert");
    expect(registerFn).toHaveBeenCalledTimes(1);
    expect(registerFn).toHaveBeenCalledWith({
      name: "أحمد محمد",
      email: "ahmed@example.com",
      password: PASSWORD,
    });
  });

  it("Loading: the State=Loading button, aria-busy, and no second submit", async () => {
    let settle: (r: AuthResult) => void = () => undefined;
    const registerFn = vi.fn(
      () =>
        new Promise<AuthResult>((resolve) => {
          settle = resolve;
        }),
    );
    const f = renderForm(adapterWith(registerFn));
    await fillValid(f);
    await f.user.click(f.submit());
    const loading = await screen.findByRole("button", { name: COPY.submitting });
    expect(loading.getAttribute("aria-busy")).toBe("true");
    expect(loading.hasAttribute("disabled")).toBe(true);
    await f.user.click(loading);
    await f.user.type(f.confirm, "{Enter}");
    expect(registerFn).toHaveBeenCalledTimes(1);
    await act(async () => settle({ ok: false, failure: "unavailable" }));
    expect((await screen.findByRole("alert")).textContent).toBe(COPY.unavailable);
  });

  it("rejected → the Failed banner and the retry label; other failures fail closed", async () => {
    const rejected = renderForm(
      adapterWith(() => Promise.resolve({ ok: false, failure: "rejected" })),
    );
    await fillValid(rejected);
    await rejected.user.click(rejected.submit());
    expect((await screen.findByRole("alert")).textContent).toBe(COPY.failed);
    expect(rejected.submit().textContent).toBe(COPY.retry);
    rejected.view.unmount();

    for (const signIn of [
      () => Promise.resolve({ ok: false as const, failure: "invalid-credentials" as const }),
      () => Promise.reject(new Error("network")),
    ]) {
      const f = renderForm(adapterWith(signIn));
      await fillValid(f);
      await f.user.click(f.submit());
      expect((await screen.findByRole("alert")).textContent).toBe(COPY.unavailable);
      expect(f.submit().textContent).toBe(COPY.submit);
      f.view.unmount();
    }
  });

  it("ok (preview only) → the Success view, focus on its heading, a link to Login", async () => {
    const f = renderForm(adapterWith(() => Promise.resolve({ ok: true })));
    await fillValid(f);
    await f.user.click(f.submit());
    const heading = await screen.findByRole("heading", { level: 1, name: COPY.success.heading });
    expect(document.activeElement).toBe(heading);
    expect(screen.queryByRole("form")).toBeNull();
    const result = document.querySelector("[data-auth-result]") as HTMLElement;
    const links = within(result).getAllByRole("link", { name: COPY.login });
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/login", "/login"]);
    expect(links[0]?.hasAttribute("data-auth-button-link")).toBe(true);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("has no axe violations in Default, with errors, and with the banner", async () => {
    const f = renderForm();
    expect((await axe(f.view.container, AXE_OPTIONS)).violations).toEqual([]);
    await f.user.click(f.submit());
    await screen.findByText(COPY.validation["validation.nameRequired"]);
    expect((await axe(f.view.container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

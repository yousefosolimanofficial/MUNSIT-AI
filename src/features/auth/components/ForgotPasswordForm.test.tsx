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
  ForgotPasswordForm,
  type ForgotPasswordFormCopy,
  type ForgotPasswordInitialState,
} from "./ForgotPasswordForm";

/*
 * Forgot Password form (Phase 08 Recovery UI, START_HERE §8 "Component"). Geometry and Figma
 * visuals are checked in Chromium (tests/e2e/auth-recovery.spec.ts); axe's colour-contrast rule is
 * disabled in jsdom (no CSS).
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const EMAIL = "ahmed@example.com";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const UNAVAILABLE = arAuth.errors.unavailable.forgot;
const FAILED = arAuth.errors.failed.forgot;

const COPY: ForgotPasswordFormCopy = {
  heading: arAuth.forgot.heading,
  description: arAuth.forgot.description,
  email: arAuth.forgot.email,
  emailPlaceholder: arAuth.placeholders.email,
  submit: arAuth.forgot.submit,
  submitting: arAuth.forgot.submitting,
  retry: arAuth.common.retry,
  back: arAuth.forgot.back,
  sent: arAuth.forgot.sent,
  validation: {
    "validation.emailRequired": arAuth.validation.emailRequired,
    "validation.emailInvalid": arAuth.validation.emailInvalid,
  },
  failures: {
    unavailable: UNAVAILABLE,
    rejected: FAILED,
    "invalid-credentials": UNAVAILABLE,
    "invalid-link": UNAVAILABLE,
    "expired-link": UNAVAILABLE,
  },
};

function renderForm(adapter?: AuthAdapter, initialState?: ForgotPasswordInitialState) {
  const user = userEvent.setup();
  const view = render(
    <NextIntlClientProvider locale="ar" messages={null}>
      <ForgotPasswordForm copy={COPY} adapter={adapter} initialState={initialState} />
    </NextIntlClientProvider>,
  );
  const email = screen.getByLabelText(COPY.email);
  const submit = screen.getByRole("button", { name: COPY.submit });
  return { user, view, email, submit };
}

function adapterWith(requestPasswordReset: AuthAdapter["requestPasswordReset"]): AuthAdapter {
  return { ...placeholderAuthAdapter, requestPasswordReset };
}

function spyConsole() {
  return [vi.spyOn(console, "log"), vi.spyOn(console, "warn"), vi.spyOn(console, "error")];
}

describe("ForgotPasswordForm", () => {
  it("Default: the heading names the form; email field, button and back link", () => {
    const { email, submit } = renderForm();
    expect(screen.getByRole("heading", { level: 1, name: COPY.heading })).toBeTruthy();
    expect(screen.getByText(COPY.description)).toBeTruthy();
    expect(screen.getByRole("form", { name: COPY.heading })).toBeTruthy();
    expect(email.getAttribute("type")).toBe("email");
    expect(email.getAttribute("autocomplete")).toBe("email");
    expect(email.getAttribute("dir")).toBe("ltr");
    expect(email.getAttribute("placeholder")).toBe("name@example.com");
    expect(submit.getAttribute("type")).toBe("submit");
    expect(submit.hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("link", { name: COPY.back }).getAttribute("href")).toBe("/login");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("validates on blur (Empty), then on every change (Invalid email, then cleared)", async () => {
    const { user, email } = renderForm();
    await user.click(email);
    await user.tab();
    expect(await screen.findByText(COPY.validation["validation.emailRequired"])).toBeTruthy();
    expect(email.getAttribute("aria-invalid")).toBe("true");
    const errorId = email.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(errorId)?.textContent).toBe(arAuth.validation.emailRequired);

    await user.type(email, "ahmed@example");
    expect(await screen.findByText(COPY.validation["validation.emailInvalid"])).toBeTruthy();
    await user.type(email, ".com");
    expect(screen.queryByText(COPY.validation["validation.emailInvalid"])).toBeNull();
    expect(email.hasAttribute("aria-invalid")).toBe(false);
  });

  it("submit with an error keeps the button enabled, focuses the field and calls nothing", async () => {
    const request = vi.fn(placeholderAuthAdapter.requestPasswordReset);
    const { user, email, submit } = renderForm(adapterWith(request));
    await user.click(submit);
    expect(await screen.findByText(COPY.validation["validation.emailRequired"])).toBeTruthy();
    expect(document.activeElement).toBe(email);
    expect(submit.hasAttribute("disabled")).toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  it("calls the adapter once with only the trimmed email", async () => {
    const request = vi.fn((): Promise<AuthResult> =>
      Promise.resolve({ ok: false, failure: "unavailable" }),
    );
    const { user, email, submit } = renderForm(adapterWith(request));
    await user.type(email, `  ${EMAIL} `);
    await user.click(submit);
    await screen.findByRole("alert");
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith({ email: EMAIL });
  });

  it("placeholder adapter: the unavailable banner above the field, label unchanged, nothing logged", async () => {
    const spies = spyConsole();
    const { user, email, submit } = renderForm();
    await user.type(email, EMAIL);
    await user.click(submit);
    const banner = await screen.findByRole("alert");
    expect(banner.textContent).toBe(UNAVAILABLE);
    expect(banner.hasAttribute("data-auth-status-banner")).toBe(true);
    // Above the field: the banner precedes the email input in document order.
    expect(banner.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.activeElement).not.toBe(banner);
    expect(email.hasAttribute("aria-invalid")).toBe(false);
    expect(screen.getByRole("button", { name: COPY.submit })).toBe(submit);
    for (const spy of spies) {
      for (const call of spy.mock.calls) expect(JSON.stringify(call)).not.toContain(EMAIL);
    }
  });

  it("Loading: the Loading label, aria-busy, and no second submit", async () => {
    let settle: (result: AuthResult) => void = () => undefined;
    const request = vi.fn(
      () =>
        new Promise<AuthResult>((resolve) => {
          settle = resolve;
        }),
    );
    const { user, email, submit } = renderForm(adapterWith(request));
    await user.type(email, EMAIL);
    await user.click(submit);
    const loading = await screen.findByRole("button", { name: COPY.submitting });
    expect(loading).toBe(submit);
    expect(loading.getAttribute("aria-busy")).toBe("true");
    expect(loading.hasAttribute("disabled")).toBe(true);
    await user.type(email, "{Enter}");
    await user.click(loading);
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => settle({ ok: false, failure: "unavailable" }));
    expect((await screen.findByRole("alert")).textContent).toBe(UNAVAILABLE);
    expect(screen.getByRole("button", { name: COPY.submit }).hasAttribute("disabled")).toBe(false);
  });

  it("Failed (preview `rejected`): the Failed banner and the retry label; retry clears it", async () => {
    const request = vi
      .fn<AuthAdapter["requestPasswordReset"]>()
      .mockResolvedValueOnce({ ok: false, failure: "rejected" })
      .mockReturnValueOnce(new Promise(() => undefined));
    const { user, email, submit } = renderForm(adapterWith(request));
    await user.type(email, EMAIL);
    await user.click(submit);
    expect((await screen.findByRole("alert")).textContent).toBe(FAILED);
    const retry = screen.getByRole("button", { name: COPY.retry });
    expect(retry).toBe(submit);
    await user.click(retry);
    expect(await screen.findByRole("button", { name: COPY.submitting })).toBe(submit);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("fails closed with the unavailable banner when the adapter throws", async () => {
    const { user, email, submit } = renderForm(
      adapterWith(() => Promise.reject(new Error("network"))),
    );
    await user.type(email, EMAIL);
    await user.click(submit);
    expect((await screen.findByRole("alert")).textContent).toBe(UNAVAILABLE);
    expect(screen.queryByText(COPY.sent.heading)).toBeNull();
  });

  it("Email sent (preview `ok`): the view replaces the card, its heading takes focus", async () => {
    const { user, email, submit, view } = renderForm(
      adapterWith(() => Promise.resolve({ ok: true })),
    );
    await user.type(email, EMAIL);
    await user.click(submit);
    const heading = await screen.findByRole("heading", { level: 1, name: COPY.sent.heading });
    expect(document.activeElement).toBe(heading);
    expect(view.container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByText(COPY.sent.body)).toBeTruthy();
    expect(screen.queryByRole("form")).toBeNull();
    expect(view.container.querySelector("[data-auth-result-icon]")).toBeNull();
    expect(
      view.container.querySelector("[data-auth-result]")?.getAttribute("data-auth-result"),
    ).toBe("plain");
    expect(screen.getByRole("link", { name: COPY.back }).getAttribute("href")).toBe("/login");
    expect(view.container.textContent).not.toContain(EMAIL);
  });

  it("RC-3: resend is shown, focusable and aria-disabled, and does nothing", async () => {
    const request = vi.fn((): Promise<AuthResult> => Promise.resolve({ ok: true }));
    const { user, email, submit } = renderForm(adapterWith(request));
    await user.type(email, EMAIL);
    await user.click(submit);
    const resend = await screen.findByRole("button", { name: COPY.sent.resend });
    expect(resend.getAttribute("aria-disabled")).toBe("true");
    expect(resend.getAttribute("type")).toBe("button");
    expect(resend.hasAttribute("disabled")).toBe(false);
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(resend);
    await user.click(resend);
    await user.keyboard("{Enter}");
    expect(request).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(resend.hasAttribute("aria-busy")).toBe(false);
    expect(screen.getByRole("heading", { level: 1, name: COPY.sent.heading })).toBeTruthy();
  });

  it("preview initial state: Empty and Invalid email are shown at once without focus", async () => {
    const empty = renderForm(undefined, { validate: true });
    expect(await screen.findByText(COPY.validation["validation.emailRequired"])).toBeTruthy();
    expect(document.activeElement).not.toBe(empty.email);
    empty.view.unmount();

    const invalid = renderForm(undefined, { values: { email: "ahmed@example" }, validate: true });
    expect(await screen.findByText(COPY.validation["validation.emailInvalid"])).toBeTruthy();
    expect((invalid.email as HTMLInputElement).value).toBe("ahmed@example");
  });

  it("stores nothing in web storage", async () => {
    const { user, email, submit } = renderForm();
    await user.type(email, EMAIL);
    await user.click(submit);
    await screen.findByRole("alert");
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it("has no axe violations in Default, with an error, Failed and Email sent", async () => {
    const { user, view, email, submit } = renderForm(
      adapterWith(
        vi
          .fn<AuthAdapter["requestPasswordReset"]>()
          .mockResolvedValueOnce({ ok: false, failure: "rejected" })
          .mockResolvedValueOnce({ ok: true }),
      ),
    );
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
    await user.click(submit);
    await screen.findByText(COPY.validation["validation.emailRequired"]);
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
    await user.type(email, EMAIL);
    await user.click(submit);
    await screen.findByRole("alert");
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
    await user.click(screen.getByRole("button", { name: COPY.retry }));
    await screen.findByRole("heading", { name: COPY.sent.heading });
    expect((await axe(view.container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

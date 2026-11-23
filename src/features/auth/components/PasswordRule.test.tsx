// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";

import arAuth from "@/i18n/messages/ar/authentication.json";

import { evaluatePasswordRules } from "../model/password-rules";
import { PasswordRule, PasswordRuleList, type PasswordRuleState } from "./PasswordRule";

/*
 * `Auth / Validation Rule` (Figma `191:72`). jsdom applies no Tailwind CSS, so colours are checked
 * as token class names; geometry is checked in Chromium (tests/e2e/auth-foundation.spec.ts).
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const { met, notMet } = arAuth.status;

afterEach(cleanup);

const classes = (el: Element | null) => (el?.getAttribute("class") ?? "").split(/\s+/);

function renderRule(state: PasswordRuleState, dir: "rtl" | "ltr" = "rtl") {
  return render(
    <ul dir={dir}>
      <PasswordRule
        label={arAuth.rules.case}
        state={state}
        statusLabel={state === "valid" ? met : notMet}
      />
    </ul>,
  );
}

describe("PasswordRule (Auth / Validation Rule)", () => {
  it.each([
    ["neutral", "text-text-muted-readable", "text-text-muted"],
    ["valid", "text-accent-success-green", "text-accent-success-green"],
    ["error", "text-accent-coral-pulse", "text-accent-coral-pulse"],
  ] as const)("%s: label and marker use the Figma tokens", (state, label, marker) => {
    const { container } = renderRule(state);
    const row = container.querySelector("li");
    expect(classes(row)).toEqual(expect.arrayContaining([label, "text-auth-form-helper"]));
    expect(classes(row?.querySelector("[aria-hidden]") ?? null)).toContain(marker);
    expect(row?.getAttribute("data-password-rule")).toBe(state);
  });

  it("renders the label and a visually hidden status word after it", () => {
    const { container } = renderRule("valid");
    const row = container.querySelector("li");
    expect(row?.textContent).toBe(`${arAuth.rules.case} ${met}`);
    const status = screen.getByText(met, { exact: false });
    expect(classes(status)).toContain("sr-only");
  });

  it("never by colour alone: each state has its own marker shape", () => {
    const shape = (state: PasswordRuleState) => {
      const { container, unmount } = renderRule(state);
      const marker = container.querySelector("li > [aria-hidden]");
      const result = marker?.querySelector("svg")?.getAttribute("data-icon") ?? "dot";
      expect(marker?.querySelector("[data-password-rule-dot]") !== null).toBe(result === "dot");
      unmount();
      return result;
    };
    expect([shape("neutral"), shape("valid"), shape("error")]).toEqual(["dot", "check", "x"]);
  });

  it("the marker is decorative; the row is atomic for announcements", () => {
    const { container } = renderRule("error");
    const marker = container.querySelector("li > [aria-hidden]");
    expect(marker?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("li")?.getAttribute("aria-atomic")).toBe("true");
  });

  it.each(["rtl", "ltr"] as const)("renders in %s with logical alignment", (dir) => {
    const { container } = renderRule("neutral", dir);
    expect(classes(container.querySelector("li"))).toContain("text-start");
    expect(container.querySelector("li")?.closest("[dir]")?.getAttribute("dir")).toBe(dir);
  });

  it("holds no copy of its own", () => {
    const { container } = render(
      <ul>
        <PasswordRule label="L" state="valid" statusLabel="S" />
      </ul>,
    );
    expect(container.textContent).toBe("L S");
  });
});

describe("PasswordRuleList", () => {
  function list(value: string, live?: boolean) {
    const rules = evaluatePasswordRules(value).map(({ id, met: isMet }) => ({
      id,
      label: arAuth.rules[id].replace(/<\/?ltr>/g, ""),
      state: (value === "" ? "neutral" : isMet ? "valid" : "error") as PasswordRuleState,
      statusLabel: isMet ? met : notMet,
    }));
    return render(<PasswordRuleList id="pw-rules" rules={rules} live={live} />);
  }

  it("lists the rules in reading order (length, case, digit), gap 16, wrapping", () => {
    const { container } = list("");
    const ul = container.querySelector("ul");
    expect(ul?.id).toBe("pw-rules");
    expect(classes(ul)).toEqual(expect.arrayContaining(["flex", "flex-wrap", "gap-x-md"]));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      [...container.querySelectorAll("li")].map((li) => li.getAttribute("data-password-rule")),
    ).toEqual(["neutral", "neutral", "neutral"]);
  });

  it("is a polite live region by default, and can be turned off", () => {
    expect(list("Abc").container.querySelector("ul")?.getAttribute("aria-live")).toBe("polite");
    cleanup();
    expect(list("Abc", false).container.querySelector("ul")?.hasAttribute("aria-live")).toBe(false);
  });

  it("reflects the shared password rules: met rows say so in text", () => {
    const { container } = list("abcdefg1");
    const rows = [...container.querySelectorAll("li")];
    expect(rows.map((li) => li.getAttribute("data-password-rule"))).toEqual([
      "valid",
      "error",
      "valid",
    ]);
    expect(rows.map((li) => li.querySelector(".sr-only")?.textContent?.trim())).toEqual([
      met,
      notMet,
      met,
    ]);
  });

  it("has no axe violations in every state", async () => {
    const { container } = list("abcdefg1");
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

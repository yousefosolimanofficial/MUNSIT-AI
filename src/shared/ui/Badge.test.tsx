// @vitest-environment jsdom
import { createRef } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";

import { StatusBadge, type StatusBadgeStatus } from "./Badge";

/*
 * Status Badge tests — contract docs/phases/phase-03-badge-contract.md §9.
 *
 * jsdom does not apply Tailwind CSS, so styles are checked as class names. Rendered contrast is
 * checked in Chromium at integration. axe's color-contrast rule is disabled here for that reason.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

/** Figma labels (contract §1) and English counterparts used only as test copy. */
const LABELS: Record<StatusBadgeStatus, { ar: string; en: string }> = {
  ready: { ar: "جاهزة", en: "Ready" },
  processing: { ar: "قيد المعالجة", en: "Processing" },
  pending: { ar: "في الانتظار", en: "Pending" },
  failed: { ar: "فشلت المعالجة", en: "Failed" },
};
const STATUSES = Object.keys(LABELS) as StatusBadgeStatus[];

const EXPECTED_STATUS_CLASSES: Record<StatusBadgeStatus, string[]> = {
  ready: [
    "bg-accent-success-green/12",
    "border-accent-success-green/26",
    "text-accent-success-green",
  ],
  processing: [
    "bg-accent-electric-sky/12",
    "border-accent-electric-sky/26",
    "text-accent-electric-sky",
  ],
  pending: ["bg-text-primary/6", "border-text-primary/12", "text-text-secondary"],
  failed: ["bg-accent-coral-pulse/12", "border-accent-coral-pulse/26", "text-accent-coral-pulse"],
};

afterEach(cleanup);

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function renderBadge(status: StatusBadgeStatus, extra: Record<string, unknown> = {}) {
  const { container } = render(
    <StatusBadge status={status} data-testid="badge" {...extra}>
      {LABELS[status].ar}
    </StatusBadge>,
  );
  return { container, badge: screen.getByTestId("badge") };
}

describe("StatusBadge — structure (§9.1)", () => {
  it.each(STATUSES)("%s renders a span with the label and a decorative dot first", (status) => {
    const { badge } = renderBadge(status);
    expect(badge.tagName).toBe("SPAN");
    expect(badge.textContent).toBe(LABELS[status].ar);
    const [dot, label] = Array.from(badge.children);
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
    expect(dot?.textContent).toBe("");
    expect(label?.textContent).toBe(LABELS[status].ar);
  });
});

describe("StatusBadge — classes (§9.2–§9.4)", () => {
  it.each(STATUSES)("%s has the shared and status classes", (status) => {
    const { badge } = renderBadge(status);
    const classes = classesOf(badge);
    for (const cls of [
      "inline-flex",
      "items-center",
      "gap-[6px]",
      "rounded-sm",
      "border",
      "px-[10px]",
      "py-[5px]",
      "whitespace-nowrap",
      "text-dashboard-caption",
      ...EXPECTED_STATUS_CLASSES[status],
    ]) {
      expect(classes, cls).toContain(cls);
    }
    // No class of another status leaks in.
    for (const other of STATUSES.filter((s) => s !== status)) {
      for (const cls of EXPECTED_STATUS_CLASSES[other]) expect(classes).not.toContain(cls);
    }
    const dot = badge.firstElementChild;
    expect(dot && classesOf(dot)).toEqual(
      expect.arrayContaining(["size-[6px]", "rounded-full", "bg-current"]),
    );
  });

  it.each(STATUSES)("%s has no hex, physical-side, interaction or motion classes", (status) => {
    const { badge } = renderBadge(status);
    const all = [badge, ...Array.from(badge.querySelectorAll("*"))].flatMap(classesOf);
    for (const cls of all) {
      expect(cls).not.toMatch(/#[0-9a-f]{3,8}/i);
      expect(cls).not.toMatch(/(^|:)(ml|mr|pl|pr|left|right|rounded-[lr])-/);
      expect(cls).not.toMatch(/^(hover|focus|focus-visible|active):/);
      expect(cls).not.toMatch(/^(shadow|transition|animate|transform|scale|translate|rotate)/);
    }
  });
});

describe("StatusBadge — attributes (§9.5–§9.6)", () => {
  it("passes aria-*, data-*, id and ref through; renders no role or tabindex", () => {
    const ref = createRef<HTMLSpanElement>();
    const { badge } = renderBadge("ready", {
      id: "status-1",
      "aria-describedby": "hint",
      "data-lecture": "42",
      ref,
    });
    expect(badge.id).toBe("status-1");
    expect(badge.getAttribute("aria-describedby")).toBe("hint");
    expect(badge.getAttribute("data-lecture")).toBe("42");
    expect(ref.current).toBe(badge);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(badge.hasAttribute("role")).toBe(false);
    expect(badge.hasAttribute("tabindex")).toBe(false);
  });

  it("merges className last", () => {
    const { badge } = renderBadge("pending", { className: "ms-2 self-start" });
    const classes = classesOf(badge);
    expect(classes.slice(-2)).toEqual(["ms-2", "self-start"]);
  });
});

describe("StatusBadge — accessibility (§9.7)", () => {
  for (const dir of ["rtl", "ltr"] as const) {
    it.each(STATUSES)(`%s has no axe violations (${dir})`, async (status) => {
      const { container } = render(
        <div dir={dir} lang={dir === "rtl" ? "ar" : "en"}>
          <StatusBadge status={status}>{LABELS[status][dir === "rtl" ? "ar" : "en"]}</StatusBadge>
        </div>,
      );
      expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
    });
  }
});

/*
 * Compile-time tests (§9.8): checked by `corepack pnpm typecheck` (tsconfig includes **\/*.tsx),
 * never executed. Each rejection is marked with @ts-expect-error, so a rejection that stops
 * failing breaks the typecheck (TS2578).
 */
export function statusBadgeTypeTests() {
  const spanRef = createRef<HTMLSpanElement>();
  return (
    <>
      <StatusBadge status="ready" ref={spanRef} aria-label="x" data-x="1" id="a">
        ok
      </StatusBadge>
      {/* @ts-expect-error status is required */}
      <StatusBadge>missing status</StatusBadge>
      {/* @ts-expect-error unknown status */}
      <StatusBadge status="done">unknown</StatusBadge>
      <StatusBadge status="failed">failed (D-BG1)</StatusBadge>
      {/* @ts-expect-error static: no event handlers */}
      <StatusBadge status="ready" onClick={() => undefined}>
        click
      </StatusBadge>
      {/* @ts-expect-error static: no role */}
      <StatusBadge status="ready" role="status">
        role
      </StatusBadge>
      {/* @ts-expect-error static: no tabIndex */}
      <StatusBadge status="ready" tabIndex={0}>
        tab
      </StatusBadge>
      {/* @ts-expect-error content-injection safety */}
      <StatusBadge status="ready" dangerouslySetInnerHTML={{ __html: "x" }} />
    </>
  );
}

// @vitest-environment jsdom
import { useState } from "react";

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ErrorCard } from "./ErrorCard";
import { SectionBoundary, type SectionErrorCopy } from "./SectionBoundary";
import { Skeleton, SkeletonRegion, SkeletonText } from "./Skeleton";

/*
 * Phase 06 Increment 2 — Skeleton, ErrorCard, SectionBoundary (plan §8 #2). jsdom applies no
 * Tailwind CSS: styles are class names; computed values, motion and contrast are checked in
 * Chromium (tests/e2e/dev-components-states.spec.ts). Texts are test fixtures, not module copy.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const COPY: SectionErrorCopy = {
  title: "تعذّر تحميل القسم",
  description: "باقي الصفحة شغالة.",
  retryLabel: "إعادة المحاولة",
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function classesOf(element: Element | null | undefined): string[] {
  return (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/* ------------------------------------------------------------------ Skeleton */

describe("Skeleton (D-U3; Figma 2495:1719)", () => {
  it("block: White 7%, radius 8, pulse with a reduced-motion opt-out, decorative, sized", () => {
    const { container } = render(<Skeleton width={124} height={16} />);
    const block = container.firstElementChild as HTMLElement;
    expect(classesOf(block)).toEqual(
      expect.arrayContaining([
        "rounded-sm",
        "bg-text-primary/7",
        "animate-skeleton-pulse",
        "motion-reduce:animate-none",
        "max-w-full",
      ]),
    );
    expect(block.getAttribute("aria-hidden")).toBe("true");
    expect(block.style.inlineSize).toBe("124px");
    expect(block.style.blockSize).toBe("16px");
  });

  it("defaults to a full-width 12px line; string lengths pass through", () => {
    const { container } = render(
      <>
        <Skeleton />
        <Skeleton width="60%" height="6rem" />
      </>,
    );
    const [line, block] = [...container.children] as HTMLElement[];
    expect([line?.style.inlineSize, line?.style.blockSize]).toEqual(["100%", "12px"]);
    expect([block?.style.inlineSize, block?.style.blockSize]).toEqual(["60%", "6rem"]);
  });

  it("text: N lines, the last one shorter; at least one line", () => {
    const three = render(<SkeletonText lines={3} lastLineWidth="40%" />);
    const lines = three.container.querySelectorAll("[data-skeleton]");
    expect([...lines].map((l) => (l as HTMLElement).style.inlineSize)).toEqual([
      "100%",
      "100%",
      "40%",
    ]);
    cleanup();
    const none = render(<SkeletonText lines={0} />);
    expect(none.container.querySelectorAll("[data-skeleton]")).toHaveLength(1);
  });

  it("region: aria-busy, one visually hidden label, no live region; axe", async () => {
    const { container } = render(
      <div lang="ar" dir="rtl">
        <SkeletonRegion label="جارٍ تحميل آخر المحاضرات">
          <Skeleton width={124} height={16} />
          <SkeletonText />
        </SkeletonRegion>
      </div>,
    );
    const region = container.querySelector("[data-skeleton-region]");
    expect(region?.getAttribute("aria-busy")).toBe("true");
    expect(region?.getAttribute("role")).toBeNull();
    expect(region?.getAttribute("aria-live")).toBeNull();
    expect(region?.querySelector(".sr-only")?.textContent).toBe("جارٍ تحميل آخر المحاضرات");
    expect(region?.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

/* ------------------------------------------------------------------ ErrorCard */

describe("ErrorCard (D-U5; Figma 2495:2424 / 2495:2966)", () => {
  it("card: full error surface, tile 56 / icon 25, Title M, Primary retry, h2 by default", () => {
    const { container } = render(
      <ErrorCard title="خطأ" description="وصف" retryLabel="إعادة المحاولة" onRetry={() => {}} />,
    );
    const root = container.firstElementChild;
    expect(classesOf(root)).toEqual(
      expect.arrayContaining([
        "flex-col",
        "items-center",
        "gap-[14px]",
        "rounded-xl",
        "border",
        "border-accent-coral-pulse/25",
        "bg-surface-obsidian/90",
        "px-[24px]",
        "py-xl",
        "text-center",
      ]),
    );
    const tile = root?.firstElementChild;
    expect(classesOf(tile)).toEqual(
      expect.arrayContaining([
        "size-[56px]",
        "rounded-[14px]",
        "bg-accent-coral-pulse/12",
        "border-accent-coral-pulse/30",
        "text-accent-coral-pulse",
      ]),
    );
    expect(tile?.querySelector("svg")?.getAttribute("width")).toBe("25");
    expect(tile?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("heading", { level: 2, name: "خطأ" }).className).toContain(
      "text-dashboard-title-m",
    );
    const button = screen.getByRole("button", { name: "إعادة المحاولة" });
    expect(button.className).toContain("bg-accent-electric-sky"); // Primary
  });

  it("section: no surface, container-query row, tile 44 / icon 20, Card Title, Secondary retry, h3", () => {
    const { container } = render(
      <ErrorCard
        layout="section"
        title="تعذّر تحميل آخر المحاضرات"
        description="جرّب تاني."
        retryLabel="إعادة المحاولة"
        onRetry={() => {}}
      />,
    );
    const root = container.firstElementChild;
    expect(classesOf(root)).toContain("@container");
    expect(classesOf(root).filter((c) => c.startsWith("bg-") || c === "border")).toEqual([]);
    const row = root?.firstElementChild;
    expect(classesOf(row)).toEqual(
      expect.arrayContaining([
        "flex-col",
        "gap-[14px]",
        "px-md",
        "@min-[28rem]:flex-row",
        "@min-[28rem]:text-start",
      ]),
    );
    const [tile, text, button] = [...(row?.children ?? [])];
    expect(classesOf(tile)).toContain("size-[44px]");
    expect(tile?.querySelector("svg")?.getAttribute("width")).toBe("20");
    expect(text?.getAttribute("role")).toBe("status");
    expect(screen.getByRole("heading", { level: 3 }).className).toContain(
      "text-dashboard-card-title",
    );
    expect(text?.querySelector("p")?.className).toContain("text-dashboard-caption");
    expect(button?.className).toContain("bg-accent-electric-sky/8"); // Secondary
  });

  it("no retry button without onRetry; no description element without description", () => {
    const { container } = render(<ErrorCard title="خطأ" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("p")).toBeNull();
  });

  it("retry: calls onRetry; a pending promise ignores duplicates and marks aria-disabled; focus stays", async () => {
    let resolve = () => {};
    const onRetry = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    render(<ErrorCard title="خطأ" retryLabel="إعادة المحاولة" onRetry={onRetry} />);
    const button = screen.getByRole("button", { name: "إعادة المحاولة" });
    button.focus();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(button);
    await act(async () => {
      resolve();
      await Promise.resolve();
    });
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it("retry: a rejected promise ends the pending state too", async () => {
    const onRetry = vi.fn(() => Promise.reject(new Error("still failing")));
    render(<ErrorCard title="خطأ" retryLabel="إعادة المحاولة" onRetry={onRetry} />);
    const button = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(button.hasAttribute("aria-disabled")).toBe(false);
  });

  it.each([
    ["ar", "rtl", "card"],
    ["en", "ltr", "section"],
  ] as const)("axe (%s, %s, %s)", async (lang, dir, layout) => {
    const { container } = render(
      <div lang={lang} dir={dir}>
        <ErrorCard
          layout={layout}
          title="Title"
          description="Description"
          retryLabel="Retry"
          onRetry={() => {}}
        />
      </div>,
    );
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

/* ------------------------------------------------------------------ SectionBoundary */

function Healthy({ id }: { id: string }) {
  const [count, setCount] = useState(0);
  return (
    <button type="button" data-testid={`healthy-${id}`} onClick={() => setCount((c) => c + 1)}>
      {id}:{count}
    </button>
  );
}

function Fragile({ broken }: { broken: boolean }) {
  if (broken) throw new Error("fixture: section render failure");
  return <p data-testid="fragile-ok">ok</p>;
}

function Page({ persistent = false, onError }: { persistent?: boolean; onError?: () => void }) {
  const [broken, setBroken] = useState(true);
  return (
    <>
      <section data-testid="a">
        <SectionBoundary copy={COPY}>
          <Healthy id="a" />
        </SectionBoundary>
      </section>
      <section data-testid="b">
        <SectionBoundary
          copy={COPY}
          onError={onError}
          onRetry={() => {
            if (!persistent) setBroken(false);
          }}
        >
          <Fragile broken={broken} />
        </SectionBoundary>
      </section>
      <section data-testid="c">
        <SectionBoundary copy={COPY}>
          <Healthy id="c" />
        </SectionBoundary>
      </section>
    </>
  );
}

describe("SectionBoundary", () => {
  it("isolation: one section fails, the others render and stay interactive; not silent", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn();
    render(<Page onError={onError} />);
    const failed = screen.getByTestId("b");
    expect(within(failed).getByRole("heading", { name: COPY.title })).toBeTruthy();
    expect(within(failed).getByRole("button", { name: COPY.retryLabel })).toBeTruthy();
    fireEvent.click(screen.getByTestId("healthy-a"));
    fireEvent.click(screen.getByTestId("healthy-c"));
    expect(screen.getByTestId("healthy-a").textContent).toBe("a:1");
    expect(screen.getByTestId("healthy-c").textContent).toBe("c:1");
    // Reported, not swallowed: React logs the caught error, and the module gets it once.
    expect(consoleError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0]?.[0] as Error).message).toBe("fixture: section render failure");
  });

  it("retry recovers once the cause is fixed; the healthy sections keep their state", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Page />);
    fireEvent.click(screen.getByTestId("healthy-a"));
    await act(async () => {
      fireEvent.click(within(screen.getByTestId("b")).getByRole("button"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByTestId("fragile-ok")).toBeTruthy();
    expect(within(screen.getByTestId("b")).queryByRole("heading")).toBeNull();
    expect(screen.getByTestId("healthy-a").textContent).toBe("a:1"); // not remounted
  });

  it("a persistent failure shows the ErrorCard again after retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Page persistent />);
    await act(async () => {
      fireEvent.click(within(screen.getByTestId("b")).getByRole("button"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(within(screen.getByTestId("b")).getByRole("heading", { name: COPY.title })).toBeTruthy();
    expect(screen.queryByTestId("fragile-ok")).toBeNull();
  });

  it("status: loading shows the skeleton, error the ErrorCard (retry only with onRetry), ready the content", () => {
    const view = render(
      <SectionBoundary copy={COPY} status="loading" loading={<span data-testid="sk" />}>
        <p>content</p>
      </SectionBoundary>,
    );
    expect(screen.getByTestId("sk")).toBeTruthy();
    expect(screen.queryByText("content")).toBeNull();

    view.rerender(
      <SectionBoundary copy={COPY} status="error">
        <p>content</p>
      </SectionBoundary>,
    );
    expect(screen.getByRole("heading", { name: COPY.title })).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();

    const onRetry = vi.fn();
    view.rerender(
      <SectionBoundary copy={COPY} status="error" onRetry={onRetry} layout="card">
        <p>content</p>
      </SectionBoundary>,
    );
    fireEvent.click(screen.getByRole("button", { name: COPY.retryLabel }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 2 })).toBeTruthy(); // card layout

    view.rerender(
      <SectionBoundary copy={COPY} status="ready">
        <p>content</p>
      </SectionBoundary>,
    );
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("errors in event handlers are not caught (documented scope)", () => {
    function Clicker() {
      return (
        <button
          type="button"
          onClick={() => {
            throw new Error("fixture: handler error");
          }}
        >
          click
        </button>
      );
    }
    render(
      <SectionBoundary copy={COPY}>
        <Clicker />
      </SectionBoundary>,
    );
    const errors: unknown[] = [];
    const onWindowError = (event: ErrorEvent) => {
      errors.push(event.error);
      event.preventDefault();
    };
    window.addEventListener("error", onWindowError);
    vi.spyOn(console, "error").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: "click" }));
    window.removeEventListener("error", onWindowError);
    expect(screen.queryByRole("heading")).toBeNull(); // no fallback
    expect(screen.getByRole("button", { name: "click" })).toBeTruthy();
  });
});

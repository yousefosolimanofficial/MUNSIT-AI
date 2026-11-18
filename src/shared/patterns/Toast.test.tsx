// @vitest-environment jsdom
import { useEffect } from "react";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TOAST_DURATION_MS, ToastProvider, useToast, type ToastApi } from "./Toast";

/*
 * Toast system — Phase 06 Increment 4 (D-U6). Fake timers drive the 4 s timing; jsdom applies no
 * Tailwind CSS, so styles are class names. Placement, motion and contrast are checked in Chromium
 * (tests/e2e/dev-components-toast.spec.ts). Texts are fixtures, not module copy.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
/** The toast API captured from inside the provider (a holder, so render does not reassign). */
const holder: { api: ToastApi | null } = { api: null };
const api = {
  show: (...args: Parameters<ToastApi["show"]>) => holder.api?.show(...args) ?? "",
  dismiss: (id: string) => holder.api?.dismiss(id),
};

function Capture() {
  const toast = useToast();
  useEffect(() => {
    holder.api = toast;
  }, [toast]);
  return (
    <button type="button" data-testid="outside">
      outside
    </button>
  );
}

function renderToasts() {
  return render(
    <ToastProvider labels={{ close: "إغلاق" }}>
      <Capture />
    </ToastProvider>,
  );
}

function toasts() {
  return [...document.querySelectorAll<HTMLElement>("[data-toast]")];
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function show(kind: "success" | "error" | "info", message: string, withAction = false) {
  let id = "";
  act(() => {
    id = api.show({
      kind,
      message,
      ...(withAction ? { action: { label: "إعادة المحاولة", onAction: vi.fn() } } : {}),
    });
  });
  return id;
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Toast — variants (Figma 2462:1771)", () => {
  it.each([
    ["success", "border-accent-success-green/40", "bg-accent-success-green", "check"],
    ["error", "border-accent-coral-pulse/40", "bg-accent-coral-pulse", "alert"],
    ["info", "border-accent-info-blue/40", "bg-accent-info-blue", "check"],
  ] as const)(
    "%s: box, tone border, solid mark with a Void Black %s icon",
    (kind, border, mark, icon) => {
      renderToasts();
      show(kind, "رسالة");
      const [toast] = toasts();
      expect(toast?.className).toContain(border);
      expect(toast?.className).toEqual(expect.stringContaining("bg-color-surface-graphite/98"));
      expect(toast?.className).toContain("rounded-[14px]");
      expect(toast?.className).toContain("max-w-[420px]");
      const markEl = toast?.querySelector("span");
      expect(markEl?.className).toContain(mark);
      expect(markEl?.className).toContain("text-surface-void-black");
      expect(markEl?.getAttribute("aria-hidden")).toBe("true");
      expect(markEl?.querySelector("svg")?.getAttribute("data-icon")).toBe(icon);
      expect(markEl?.querySelector("svg")?.getAttribute("width")).toBe("13");
      expect(toast?.querySelector("p")?.textContent).toBe("رسالة");
      expect(screen.getByRole("button", { name: "إغلاق" })).toBeTruthy();
    },
  );

  it("error action (Figma retry): coral button; activating it runs the action and dismisses", () => {
    renderToasts();
    const onAction = vi.fn();
    act(() => {
      api.show({
        kind: "error",
        message: "فشل الحفظ",
        action: { label: "إعادة المحاولة", onAction },
      });
    });
    const button = screen.getByRole("button", { name: "إعادة المحاولة" });
    expect(button.className).toContain("bg-accent-coral-pulse/14");
    expect(button.className).toContain("text-accent-coral-pulse");
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(toasts()).toHaveLength(0);
  });
});

describe("Toast — timing (D-U6)", () => {
  it("success and info dismiss after 4 s, not before", async () => {
    renderToasts();
    show("success", "تم");
    show("info", "معلومة");
    await advance(TOAST_DURATION_MS - 1);
    expect(toasts()).toHaveLength(2);
    await advance(1);
    expect(toasts()).toHaveLength(0);
  });

  it("an error stays until dismissed", async () => {
    renderToasts();
    show("error", "خطأ");
    await advance(TOAST_DURATION_MS * 10);
    expect(toasts()).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(toasts()).toHaveLength(0);
  });

  it("hover pauses the timer; leaving resumes it with the time that was left", async () => {
    renderToasts();
    show("success", "تم");
    await advance(3000);
    const [toast] = toasts();
    fireEvent.pointerEnter(toast as HTMLElement);
    await advance(10_000);
    expect(toasts()).toHaveLength(1);
    fireEvent.pointerLeave(toast as HTMLElement);
    await advance(999);
    expect(toasts()).toHaveLength(1);
    await advance(1);
    expect(toasts()).toHaveLength(0);
  });

  it("focus inside pauses the timer; focus leaving resumes it", async () => {
    renderToasts();
    show("info", "معلومة");
    await advance(1000);
    const close = screen.getByRole("button", { name: "إغلاق" });
    act(() => close.focus());
    await advance(20_000);
    expect(toasts()).toHaveLength(1);
    act(() => screen.getByTestId("outside").focus());
    await advance(TOAST_DURATION_MS - 1000);
    expect(toasts()).toHaveLength(0);
  });

  it("a hidden tab pauses the timer", async () => {
    renderToasts();
    show("success", "تم");
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await advance(20_000);
    expect(toasts()).toHaveLength(1);
    hidden.mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await advance(TOAST_DURATION_MS);
    expect(toasts()).toHaveLength(0);
  });
});

describe("Toast — stacking and dismissal", () => {
  it("up to 3 visible; a 4th removes the oldest success/info first, never an error before them", () => {
    renderToasts();
    show("error", "خطأ ١");
    show("success", "تم ١");
    show("info", "معلومة ١");
    show("success", "تم ٢");
    expect(toasts().map((t) => t.querySelector("p")?.textContent)).toEqual([
      "خطأ ١",
      "معلومة ١",
      "تم ٢",
    ]);
  });

  it("when all three are errors, the oldest error makes room", () => {
    renderToasts();
    show("error", "١");
    show("error", "٢");
    show("error", "٣");
    show("error", "٤");
    expect(toasts().map((t) => t.querySelector("p")?.textContent)).toEqual(["٢", "٣", "٤"]);
  });

  it("dismiss(id) removes exactly that toast", () => {
    renderToasts();
    const first = show("error", "أول");
    show("error", "ثاني");
    act(() => api.dismiss(first));
    expect(toasts().map((t) => t.querySelector("p")?.textContent)).toEqual(["ثاني"]);
  });

  it("closing a focused toast returns focus to where it was before entering the stack", async () => {
    renderToasts();
    show("error", "خطأ");
    const outside = screen.getByTestId("outside");
    act(() => outside.focus());
    const close = screen.getByRole("button", { name: "إغلاق" });
    act(() => {
      close.focus();
    });
    fireEvent.click(close);
    await advance(20);
    expect(document.activeElement).toBe(outside);
  });

  it("focus is never moved to a new toast", () => {
    renderToasts();
    const outside = screen.getByTestId("outside");
    act(() => outside.focus());
    show("error", "خطأ");
    expect(document.activeElement).toBe(outside);
  });
});

describe("Toast — announcements and accessibility", () => {
  it("success/info go to the polite region, errors to the assertive one, once; toasts are not live", async () => {
    renderToasts();
    show("success", "تم الحفظ");
    await advance(20);
    const status = document.querySelector('[role="status"]');
    const alert = document.querySelector('[role="alert"]');
    expect(status?.textContent).toBe("تم الحفظ");
    expect(alert?.textContent).toBe("");
    show("error", "فشل الحفظ");
    await advance(20);
    expect(alert?.textContent).toBe("فشل الحفظ");
    for (const toast of toasts()) {
      expect(toast.getAttribute("role")).toBeNull();
      expect(toast.getAttribute("aria-live")).toBeNull();
    }
  });

  it("useToast throws without the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Bare() {
      useToast();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/ToastProvider/);
  });

  it.each([
    ["ar", "rtl"],
    ["en", "ltr"],
  ] as const)("axe with all three variants (%s)", async (lang, dir) => {
    const { container } = render(
      <div lang={lang} dir={dir}>
        <ToastProvider labels={{ close: "Close" }}>
          <Capture />
        </ToastProvider>
      </div>,
    );
    show("success", "Saved");
    show("info", "Info");
    show("error", "Failed", true);
    await advance(20);
    vi.useRealTimers(); // axe schedules its own timers
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

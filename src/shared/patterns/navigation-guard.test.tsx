// @vitest-environment jsdom
import { StrictMode, useState, type ReactNode } from "react";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { MESSAGES } from "@/i18n/messages";
import { useGuardedRouter, useNavigationGuard } from "@/shared/hooks/useNavigationGuard";

import { ConfirmGuardDialog, type GuardCopy, type GuardKind } from "./ConfirmGuardDialog";
import { NavigationGuardProvider } from "./NavigationGuardProvider";

/*
 * Navigation guard — unit and integration tests (Phase 06 Increment 1, plan §7, §11).
 * jsdom has no `showModal`/`close` (stubbed as in the Dialog tests) and no real navigation, so
 * these tests check interception, the dialog and listener bookkeeping; real URLs and history are
 * proven in Chromium (tests/e2e/navigation-guard.spec.ts).
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

const pushNext = vi.fn();
const pushIntl = vi.fn();
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: () => ({ push: pushNext }),
}));
vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => ({ push: pushIntl, replace: vi.fn(), back: vi.fn(), forward: vi.fn() }),
}));

function copyFor(locale: "ar" | "en"): Record<GuardKind, GuardCopy> {
  return MESSAGES[locale].patterns.guard;
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  pushNext.mockReset();
  pushIntl.mockReset();
  window.history.replaceState(null, "", "/dev/guard");
});

/* ------------------------------------------------------------------ ConfirmGuardDialog */

describe("ConfirmGuardDialog (D-U1)", () => {
  it.each(["ar", "en"] as const)(
    "%s: alertdialog named and described by the copy; Stay focused and first; axe",
    async (locale) => {
      const copy = copyFor(locale).recording;
      const { container } = render(
        <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
          <ConfirmGuardDialog
            open
            kind="recording"
            copy={copy}
            onStay={vi.fn()}
            onLeave={vi.fn()}
          />
        </div>,
      );
      const dialog = screen.getByRole("alertdialog", { name: copy.title });
      const describedBy = dialog.getAttribute("aria-describedby") ?? "";
      expect(document.getElementById(describedBy)?.textContent).toBe(copy.description);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      const buttons = [...dialog.querySelectorAll("button")];
      expect(buttons.map((b) => b.textContent)).toEqual([copy.stay, copy.leave]);
      expect(document.activeElement).toBe(buttons[0]);
      expect(buttons[1]?.className).toContain("text-accent-coral-pulse");
      expect(buttons[0]?.className).toContain("bg-accent-electric-sky");
      expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
    },
  );

  it("widths: 420 for the recording guard, 440 for the unsaved guard; danger tone; no close button", () => {
    const copy = copyFor("ar");
    const { rerender } = render(
      <ConfirmGuardDialog
        open
        kind="recording"
        copy={copy.recording}
        onStay={vi.fn()}
        onLeave={vi.fn()}
      />,
    );
    expect(screen.getByRole("alertdialog").className).toContain("w-[420px]");
    rerender(
      <ConfirmGuardDialog
        open
        kind="unsaved"
        copy={copy.unsaved}
        onStay={vi.fn()}
        onLeave={vi.fn()}
      />,
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog.className).toContain("w-[440px]");
    expect(dialog.querySelectorAll("button")).toHaveLength(2);
    expect(dialog.querySelector('[data-icon="alert"]')).not.toBeNull();
  });

  it("Stay, Esc (cancel) call onStay; Leave calls onLeave only", () => {
    const onStay = vi.fn();
    const onLeave = vi.fn();
    const copy = copyFor("ar").unsaved;
    render(
      <ConfirmGuardDialog open kind="unsaved" copy={copy} onStay={onStay} onLeave={onLeave} />,
    );
    fireEvent.click(screen.getByRole("button", { name: copy.stay }));
    expect(onStay).toHaveBeenCalledTimes(1);
    fireEvent(screen.getByRole("alertdialog"), new Event("cancel", { cancelable: true }));
    expect(onStay).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: copy.leave }));
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(onStay).toHaveBeenCalledTimes(2);
  });
});

/* ------------------------------------------------------------------ provider and hooks */

function Harness({ initial = false, kind = "unsaved" as GuardKind }) {
  const [on, setOn] = useState(initial);
  useNavigationGuard({ when: on, kind });
  const router = useGuardedRouter();
  return (
    <>
      <button type="button" data-testid="toggle" onClick={() => setOn((v) => !v)}>
        toggle
      </button>
      {/* Fixture: a raw same-origin <a>, which the guard must catch like any link (next/link needs the app router, absent in jsdom). */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/lectures" data-testid="link" onClick={(e) => e.preventDefault()}>
        lectures
      </a>
      <a href="https://example.com/x" data-testid="external" onClick={(e) => e.preventDefault()}>
        external
      </a>
      {/* Fixture: a raw same-origin <a>, which the guard must catch like any link (next/link needs the app router, absent in jsdom). */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/dev/guard#part" data-testid="hash" onClick={(e) => e.preventDefault()}>
        hash
      </a>
      <a href="/notes" target="_blank" data-testid="blank" onClick={(e) => e.preventDefault()}>
        blank
      </a>
      <button type="button" data-testid="push" onClick={() => router.push("/summaries")}>
        push
      </button>
    </>
  );
}

function renderGuard(ui: ReactNode, locale: "ar" | "en" = "ar") {
  return render(
    <NextIntlClientProvider locale={locale} messages={null}>
      <NavigationGuardProvider copy={copyFor(locale)}>{ui}</NavigationGuardProvider>
    </NextIntlClientProvider>,
  );
}

/** A real click event as the browser would dispatch it (cancelable, bubbling). */
function click(element: Element, init: MouseEventInit = {}) {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  act(() => {
    element.dispatchEvent(event);
  });
  return event;
}

async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
}

describe("NavigationGuardProvider — guard OFF (never blocks when false)", () => {
  it("links, router and unload pass through; no listener is added", async () => {
    const add = vi.spyOn(window, "addEventListener");
    renderGuard(<Harness />);
    await flush();
    expect(click(screen.getByTestId("link")).defaultPrevented).toBe(true); // the link's own handler only
    expect(screen.queryByRole("alertdialog")).toBeNull();
    fireEvent.click(screen.getByTestId("push"));
    expect(pushIntl).toHaveBeenCalledWith("/summaries");
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(false);
    const types = add.mock.calls.map(([type]) => type);
    expect(types).not.toContain("popstate");
    expect(types).not.toContain("beforeunload");
  });
});

describe("NavigationGuardProvider — guard ON", () => {
  it("same-origin link: stopped before the page's handlers; dialog; Stay keeps it; Leave replays it", async () => {
    renderGuard(<Harness initial />);
    await flush();
    const link = screen.getByTestId("link");
    const pageHandler = vi.fn();
    link.addEventListener("click", pageHandler);

    click(link);
    expect(pageHandler).not.toHaveBeenCalled();
    const copy = copyFor("ar").unsaved;
    expect(screen.getByRole("alertdialog", { name: copy.title })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: copy.stay }));
    await flush();
    expect(pageHandler).not.toHaveBeenCalled();
    expect(document.querySelector("dialog[open]")).toBeNull();

    click(link);
    fireEvent.click(screen.getByRole("button", { name: copy.leave }));
    await flush();
    expect(pageHandler).toHaveBeenCalledTimes(1); // the original click, replayed once
  });

  it("not intercepted: modifier and middle clicks, other origins, same-page hash, target=_blank", async () => {
    renderGuard(<Harness initial />);
    await flush();
    const link = screen.getByTestId("link");
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
      click(link, init);
      expect(
        screen.queryByRole("alertdialog", { hidden: false })?.hasAttribute("open") ?? false,
      ).toBe(false);
    }
    for (const id of ["external", "hash", "blank"]) {
      click(screen.getByTestId(id));
      expect(screen.queryByRole("alertdialog")?.hasAttribute("open") ?? false).toBe(false);
    }
  });

  it("programmatic navigation waits for Leave; Stay never navigates", async () => {
    renderGuard(<Harness initial />);
    await flush();
    const copy = copyFor("ar").unsaved;
    fireEvent.click(screen.getByTestId("push"));
    expect(pushIntl).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: copy.stay }));
    await flush();
    expect(pushIntl).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("push"));
    fireEvent.click(screen.getByRole("button", { name: copy.leave }));
    await flush();
    expect(pushIntl).toHaveBeenCalledWith("/summaries");
  });

  it("beforeunload is prevented while active", async () => {
    renderGuard(<Harness initial />);
    await flush();
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
  });

  it("history: one sentinel entry on activation; leaving it (popstate) restores it and asks", async () => {
    const pushState = vi.spyOn(window.history, "pushState");
    renderGuard(<Harness initial />);
    await flush();
    expect(pushState).toHaveBeenCalledTimes(1);
    // Simulate Back onto the guarded entry (same URL, no sentinel in the state).
    window.history.replaceState({ page: "guarded" }, "", window.location.href);
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: { page: "guarded" } }));
    });
    expect(pushState).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("alertdialog").hasAttribute("open")).toBe(true);
  });

  it("history: a traversal that already left the page URL is not touched (no sentinel elsewhere)", async () => {
    const pushState = vi.spyOn(window.history, "pushState");
    renderGuard(<Harness initial />);
    await flush();
    window.history.replaceState(null, "", "/dashboard");
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    });
    expect(pushState).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")?.hasAttribute("open") ?? false).toBe(false);
  });

  it("Strict Mode mounts push the sentinel only once", async () => {
    const pushState = vi.spyOn(window.history, "pushState");
    render(
      <StrictMode>
        <NextIntlClientProvider locale="ar" messages={null}>
          <NavigationGuardProvider copy={copyFor("ar")}>
            <Harness initial />
          </NavigationGuardProvider>
        </NextIntlClientProvider>
      </StrictMode>,
    );
    await flush();
    expect(pushState).toHaveBeenCalledTimes(1);
  });

  it("turning the guard off or unmounting removes exactly the listeners it added", async () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const view = renderGuard(<Harness />);
    await flush();
    fireEvent.click(screen.getByTestId("toggle"));
    await flush();
    const added = add.mock.calls.filter(([t]) =>
      ["click", "popstate", "beforeunload"].includes(t as string),
    );
    expect(added.map(([t, , o]) => [t, o === true])).toEqual([
      ["click", true],
      ["popstate", false],
      ["beforeunload", false],
    ]);
    fireEvent.click(screen.getByTestId("toggle"));
    await flush();
    for (const [type, listener, options] of added) {
      expect(remove).toHaveBeenCalledWith(
        type,
        listener,
        ...(options === undefined ? [] : [options]),
      );
    }
    fireEvent.click(screen.getByTestId("toggle"));
    await flush();
    view.unmount();
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(false);
  });

  it("the latest registered guard's copy is used", async () => {
    renderGuard(<Harness initial kind="recording" />, "en");
    await flush();
    click(screen.getByTestId("link"));
    expect(screen.getByRole("alertdialog", { name: copyFor("en").recording.title })).toBeTruthy();
  });
});

describe("hooks without a provider", () => {
  it("useNavigationGuard throws; useGuardedRouter falls back to the plain router", () => {
    function Bare() {
      useNavigationGuard({ when: true, kind: "unsaved" });
      return null;
    }
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bare />)).toThrow(/NavigationGuardProvider/);
    function PlainRouter() {
      const router = useGuardedRouter();
      return (
        <button type="button" onClick={() => router.push("/notes")}>
          go
        </button>
      );
    }
    render(<PlainRouter />);
    fireEvent.click(screen.getByRole("button", { name: "go" }));
    expect(pushIntl).toHaveBeenCalledWith("/notes");
  });
});

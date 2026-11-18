// @vitest-environment jsdom
import { useRef, useState, type ReactNode } from "react";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Button } from "./Button";
import { Dialog, type DialogProps } from "./Dialog";

/*
 * Dialog tests — contract docs/phases/phase-03-dialog-contract.md §7 (component part).
 *
 * jsdom 30 has `HTMLDialogElement` but no `showModal`/`close`, top layer or inertness, so both
 * methods are stubbed below (set/remove `open`, dispatch `close`). The real behavior (focus
 * containment, Esc, scrim, motion, scroll lock) is tested in Chromium:
 * tests/e2e/dev-components-dialog.spec.ts. jsdom applies no Tailwind CSS: styles are checked as
 * class names, and axe's color-contrast rule is off.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

/** Figma copy: Notes delete (`2432:4308`) and Logout (`2462:1490`); English test counterparts. */
const COPY = {
  ar: {
    title: "حذف الملاحظة؟",
    description: "هل أنت متأكد إنك عايز تحذف الملاحظة دي؟",
    cancel: "إلغاء",
    confirm: "حذف الملاحظة",
    close: "إغلاق",
  },
  en: {
    title: "Delete the note?",
    description: "Are you sure you want to delete this note?",
    cancel: "Cancel",
    confirm: "Delete note",
    close: "Close",
  },
} as const;

const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = showModal;
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(() => {
  cleanup();
  showModal.mockClear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function dialogEl(): HTMLDialogElement {
  const element = document.querySelector("dialog");
  if (!element) throw new Error("no <dialog>");
  return element;
}

type HarnessProps = Partial<Omit<DialogProps, "open" | "onOpenChange">> & {
  dir?: "rtl" | "ltr";
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, the harness ignores close requests (tests that the prop stays in charge). */
  locked?: boolean;
  withInitialFocus?: boolean;
};

function Harness({
  dir = "rtl",
  initialOpen = false,
  onOpenChange,
  locked = false,
  withInitialFocus = false,
  ...props
}: HarnessProps) {
  const lang = dir === "rtl" ? "ar" : "en";
  const copy = COPY[lang];
  const [open, setOpen] = useState(initialOpen);
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <div dir={dir} lang={lang}>
      <Button onClick={() => setOpen(true)}>trigger</Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange?.(next);
          if (!locked) setOpen(next);
        }}
        title={copy.title}
        description={copy.description}
        {...(withInitialFocus ? { initialFocusRef: cancelRef } : {})}
        actions={
          <>
            <Button>{copy.confirm}</Button>
            <Button ref={cancelRef} variant="secondary" onClick={() => setOpen(false)}>
              {copy.cancel}
            </Button>
          </>
        }
        {...props}
      />
    </div>
  );
}

async function openHarness(props: HarnessProps = {}) {
  const user = userEvent.setup();
  const view = render(<Harness {...props} />);
  await user.click(screen.getByRole("button", { name: "trigger" }));
  return { user, view };
}

function cancelEvent(): Event {
  const event = new Event("cancel", { cancelable: true });
  fireEvent(dialogEl(), event);
  return event;
}

describe("Dialog — open state and semantics (§7.1, §7.2)", () => {
  it("is closed with no content until opened", () => {
    render(<Harness />);
    expect(dialogEl().hasAttribute("open")).toBe(false);
    expect(dialogEl().children).toHaveLength(0);
    expect(dialogEl().hasAttribute("aria-labelledby")).toBe(false);
    expect(showModal).not.toHaveBeenCalled();
  });

  it("opens with showModal once and renders its content", async () => {
    await openHarness();
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(dialogEl().hasAttribute("open")).toBe(true);
    expect(dialogEl().dataset.state).toBe("open");
    expect(screen.getByRole("heading", { level: 2, name: COPY.ar.title })).toBeTruthy();
  });

  it("is modal, labelled by the title and described by the description", async () => {
    await openHarness();
    const dialog = dialogEl();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.hasAttribute("role")).toBe(false);
    const title = screen.getByRole("heading", { level: 2 });
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(
      document.getElementById(dialog.getAttribute("aria-describedby") ?? "")?.textContent,
    ).toBe(COPY.ar.description);
  });

  it("has no aria-describedby without a description; role alertdialog when asked", async () => {
    await openHarness({ description: undefined, role: "alertdialog" });
    expect(dialogEl().hasAttribute("aria-describedby")).toBe(false);
    expect(dialogEl().getAttribute("role")).toBe("alertdialog");
  });
});

describe("Dialog — controlled close paths (§7.3–§7.5)", () => {
  it("Esc (cancel) is prevented and calls onOpenChange(false) once", async () => {
    const onOpenChange = vi.fn();
    await openHarness({ onOpenChange });
    const event = cancelEvent();
    expect(event.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(dialogEl().hasAttribute("open")).toBe(false);
  });

  it("stays open while the prop stays true", async () => {
    const onOpenChange = vi.fn();
    await openHarness({ onOpenChange, locked: true });
    cancelEvent();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(dialogEl().hasAttribute("open")).toBe(true);
  });

  it("reports a native close (browser closed it without cancel)", async () => {
    const onOpenChange = vi.fn();
    await openHarness({ onOpenChange, locked: true });
    act(() => dialogEl().close());
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("closes on a press and release on the scrim only", async () => {
    const onOpenChange = vi.fn();
    await openHarness({ onOpenChange, locked: true });
    const dialog = dialogEl();
    const title = screen.getByRole("heading", { level: 2 });
    const outside = { clientX: 900, clientY: 900 };

    fireEvent.click(title);
    fireEvent.pointerDown(title, outside);
    fireEvent.click(dialog, outside); // drag from inside to the scrim
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(dialog, outside);
    fireEvent.click(dialog, outside);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders the close button only with closeLabel, named by it", async () => {
    await openHarness();
    expect(screen.queryByRole("button", { name: COPY.ar.close })).toBeNull();
    cleanup();

    const onOpenChange = vi.fn();
    const { user } = await openHarness({ closeLabel: COPY.ar.close, onOpenChange });
    await user.click(screen.getByRole("button", { name: COPY.ar.close }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(dialogEl().hasAttribute("open")).toBe(false);
  });
});

describe("Dialog — focus and scroll lock (§7.6, §7.7)", () => {
  it("focuses initialFocusRef on open and returns focus to the trigger on close", async () => {
    await openHarness({ withInitialFocus: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: COPY.ar.cancel }));
    cancelEvent();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "trigger" }));
  });

  it("returns focus to the trigger and releases the lock when unmounted while open", async () => {
    const user = userEvent.setup();
    function Host({ show }: { show: boolean }) {
      const [open, setOpen] = useState(false);
      return (
        <div dir="rtl" lang="ar">
          <Button onClick={() => setOpen(true)}>trigger</Button>
          {show ? (
            <Dialog open={open} onOpenChange={setOpen} title={COPY.ar.title}>
              <Button>{COPY.ar.confirm}</Button>
            </Dialog>
          ) : null}
        </div>
      );
    }
    const view = render(<Host show />);
    const trigger = screen.getByRole("button", { name: "trigger" });
    await user.click(trigger);
    screen.getByRole("button", { name: COPY.ar.confirm }).focus();
    expect(document.documentElement.style.overflow).toBe("hidden");
    view.rerender(<Host show={false} />);
    expect(document.activeElement).toBe(trigger);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("locks page scroll while open, counted across two dialogs", () => {
    function Two({ a, b }: { a: boolean; b: boolean }) {
      return (
        <>
          <Dialog open={a} onOpenChange={() => {}} title="A" />
          <Dialog open={b} onOpenChange={() => {}} title="B" />
        </>
      );
    }
    const html = document.documentElement;
    const view = render(<Two a={false} b={false} />);
    expect(html.style.overflow).toBe("");
    view.rerender(<Two a b={false} />);
    expect(html.style.overflow).toBe("hidden");
    view.rerender(<Two a b />);
    view.rerender(<Two a={false} b />);
    expect(html.style.overflow).toBe("hidden");
    view.rerender(<Two a={false} b={false} />);
    expect(html.style.overflow).toBe("");
  });
});

describe("Dialog — classes (§3, §5.1)", () => {
  it("has the shell, width, scrim and motion classes", async () => {
    await openHarness({ width: 420 });
    const classes = classesOf(dialogEl());
    for (const expected of [
      "rounded-2xl",
      "border",
      "border-accent-electric-sky/18",
      "bg-surface-obsidian/98",
      "shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
      "w-[420px]",
      "max-w-[calc(100vw_-_40px)]",
      "backdrop:bg-surface-void-black/66",
      "[scale:1]",
      "transition-[opacity,scale]",
      "duration-slow",
      "ease-standard",
      "starting:open:opacity-0",
      "starting:open:[scale:calc(1_-_0.02_*_var(--motion-distance))]",
      "starting:open:backdrop:opacity-0",
      "data-[state=closing]:opacity-0",
      "data-[state=closing]:duration-base",
      "data-[state=closing]:[scale:calc(1_-_0.02_*_var(--motion-distance))]",
      "data-[state=closing]:backdrop:opacity-0",
    ]) {
      expect(classes, expected).toContain(expected);
    }
    const wrapper = dialogEl().firstElementChild;
    expect(classesOf(wrapper as Element)).toEqual(
      expect.arrayContaining(["p-[24px]", "gap-[14px]", "max-h-[calc(100dvh_-_42px)]"]),
    );
  });

  it("defaults to width 480", async () => {
    await openHarness();
    expect(classesOf(dialogEl())).toContain("w-[480px]");
  });

  it.each([
    ["accent", "bg-accent-electric-sky/12", "border-accent-electric-sky/30"],
    ["danger", "bg-accent-coral-pulse/12", "border-accent-coral-pulse/30"],
  ] as const)("icon tile tone %s, layout A 48 and layout B 44", async (tone, fill, border) => {
    await openHarness({ icon: "alert", tone });
    let tile = dialogEl().querySelector("[data-icon]")?.parentElement as Element;
    expect(classesOf(tile)).toEqual(expect.arrayContaining(["size-[48px]", fill, border]));
    cleanup();
    await openHarness({ icon: "alert", tone, closeLabel: COPY.ar.close });
    tile = dialogEl().querySelector('[data-icon="alert"]')?.parentElement as Element;
    expect(classesOf(tile)).toEqual(expect.arrayContaining(["size-[44px]", fill, border]));
  });

  it("close button: 36, radius 10, focus ring, x icon 16", async () => {
    await openHarness({ closeLabel: COPY.ar.close });
    const close = screen.getByRole("button", { name: COPY.ar.close });
    expect(classesOf(close)).toEqual(
      expect.arrayContaining([
        "size-[36px]",
        "rounded-[10px]",
        "bg-text-primary/4",
        "border-accent-electric-sky/14",
        "focus-visible:outline-accent-electric-sky",
      ]),
    );
    expect(close.querySelector('[data-icon="x"]')).not.toBeNull();
  });

  it("uses no hex colors and no physical left/right utilities", async () => {
    await openHarness({ icon: "alert", closeLabel: COPY.ar.close });
    const all = [dialogEl(), ...dialogEl().querySelectorAll("*")].flatMap(classesOf);
    expect(all.filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
    expect(all.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
  });
});

describe("Dialog — motion lifecycle (§5.1, §7.11)", () => {
  /** Gives the dialog a 200ms computed transition, as in the browser. */
  function withTransition() {
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
      const style = real(element, pseudo);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === "transitionDuration") return "0.32s, 200ms";
          if (prop === "transitionDelay") return "0s";
          const value: unknown = Reflect.get(target, prop, target);
          return typeof value === "function" ? (value as () => unknown).bind(target) : value;
        },
      });
    });
  }

  function transitionEnd(target: Element, propertyName: string) {
    const event = new Event("transitionend", { bubbles: true });
    Object.defineProperty(event, "propertyName", { value: propertyName });
    act(() => {
      target.dispatchEvent(event);
    });
  }

  function Controlled({ open, children }: { open: boolean; children?: ReactNode }) {
    return (
      <Dialog open={open} onOpenChange={() => {}} title={COPY.ar.title}>
        {children ?? <Button>{COPY.ar.confirm}</Button>}
      </Dialog>
    );
  }

  it("runs the exit before close(): only the panel's own opacity transition ends it", () => {
    withTransition();
    const view = render(<Controlled open />);
    view.rerender(<Controlled open={false} />);
    const dialog = dialogEl();
    expect(dialog.dataset.state).toBe("closing");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(screen.getByRole("button", { name: COPY.ar.confirm })).toBeTruthy();

    transitionEnd(screen.getByRole("button", { name: COPY.ar.confirm }), "opacity");
    transitionEnd(dialog, "scale");
    expect(dialog.hasAttribute("open")).toBe(true);

    transitionEnd(dialog, "opacity");
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(dialog.dataset.state).toBe("closed");
    expect(dialog.children).toHaveLength(0);
  });

  it("closes from the fallback timer if transitionend never fires", () => {
    vi.useFakeTimers();
    withTransition();
    const view = render(<Controlled open />);
    view.rerender(<Controlled open={false} />);
    expect(dialogEl().hasAttribute("open")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(369); // 320 (longest) + 50 margin = 370
    });
    expect(dialogEl().hasAttribute("open")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(dialogEl().hasAttribute("open")).toBe(false);
  });

  it("rapid reopen during the exit cancels close() and keeps the dialog modal", () => {
    vi.useFakeTimers();
    withTransition();
    const view = render(<Controlled open />);
    view.rerender(<Controlled open={false} />);
    view.rerender(<Controlled open />);
    const dialog = dialogEl();
    expect(dialog.dataset.state).toBe("open");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    transitionEnd(dialog, "opacity");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("a stale close event after a fast reopen does not close the reopened dialog", () => {
    // The browser dispatches `close` in a later task. Reproduce: close() with the event held
    // back, reopen, then deliver the late event.
    const held: Event[] = [];
    const realClose = HTMLDialogElement.prototype.close;
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      if (!this.hasAttribute("open")) return;
      this.removeAttribute("open");
      held.push(new Event("close"));
    };
    try {
      const onOpenChange = vi.fn();
      const view = render(<Dialog open onOpenChange={onOpenChange} title={COPY.ar.title} />);
      view.rerender(<Dialog open={false} onOpenChange={onOpenChange} title={COPY.ar.title} />);
      expect(dialogEl().hasAttribute("open")).toBe(false); // no transition in jsdom: closed
      view.rerender(<Dialog open onOpenChange={onOpenChange} title={COPY.ar.title} />);
      expect(dialogEl().hasAttribute("open")).toBe(true);
      expect(held).toHaveLength(1);
      act(() => {
        for (const event of held) dialogEl().dispatchEvent(event);
      });
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(dialogEl().hasAttribute("open")).toBe(true);
      expect(dialogEl().dataset.state).toBe("open");
      expect(screen.getByRole("heading", { name: COPY.ar.title })).toBeTruthy();
    } finally {
      HTMLDialogElement.prototype.close = realClose;
    }
  });

  it("ignores Esc and scrim clicks during the exit", () => {
    withTransition();
    const onOpenChange = vi.fn();
    const view = render(<Dialog open onOpenChange={onOpenChange} title={COPY.ar.title} />);
    view.rerender(<Dialog open={false} onOpenChange={onOpenChange} title={COPY.ar.title} />);
    const event = cancelEvent();
    expect(event.defaultPrevented).toBe(true);
    fireEvent.pointerDown(dialogEl(), { clientX: 900, clientY: 900 });
    fireEvent.click(dialogEl(), { clientX: 900, clientY: 900 });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("Dialog — compile-time API (§7.9)", () => {
  it("rejects values outside the contract", () => {
    const noop = () => {};
    const samples = [
      // @ts-expect-error — width is one of the six Figma widths
      <Dialog key="w" open onOpenChange={noop} title="t" width={500} />,
      // @ts-expect-error — tone is accent | danger
      <Dialog key="t" open onOpenChange={noop} title="t" tone="success" />,
      // @ts-expect-error — title is required
      <Dialog key="n" open onOpenChange={noop} />,
      // @ts-expect-error — role is dialog | alertdialog (TS never checks hyphenated aria-* props)
      <Dialog key="a" open onOpenChange={noop} title="t" role="menu" />,
      // @ts-expect-error — close goes through onOpenChange
      <Dialog key="c" open onOpenChange={noop} title="t" onClose={noop} />,
      // @ts-expect-error — controlled only
      <Dialog key="d" defaultOpen onOpenChange={noop} title="t" />,
      // @ts-expect-error — size comes only from width
      <Dialog key="k" open onOpenChange={noop} title="t" className="w-full" />,
    ];
    expect(samples).toHaveLength(7);
  });
});

describe("Dialog — axe (§7.10)", () => {
  it.each(["rtl", "ltr"] as const)("layout A and B have no violations (%s)", async (dir) => {
    const copy = COPY[dir === "rtl" ? "ar" : "en"];
    const view = await openHarness({ dir, icon: "alert", tone: "danger", role: "alertdialog" });
    expect((await axe(view.view.container, AXE_OPTIONS)).violations).toEqual([]);
    cleanup();
    const second = await openHarness({ dir, icon: "logout", closeLabel: copy.close });
    expect((await axe(second.view.container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

// @vitest-environment jsdom
import { useRef, useState } from "react";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Sheet, type SheetProps } from "./Sheet";

/*
 * Sheet tests — contract docs/phases/phase-03-sheet-contract.md §8 (component part), including
 * the cross-modal lifecycle shared with Dialog (D-SH6).
 *
 * jsdom 30 has `HTMLDialogElement` but no `showModal`/`close`, so both are stubbed (set/remove
 * `open`, dispatch `close`). Real behavior is tested in Chromium:
 * tests/e2e/dev-components-sheet.spec.ts. Styles are checked as class names; axe's
 * color-contrast rule is off in jsdom.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

/** Figma copy: More Menu `2236:972`, Upload `2268:1674`, Options `2268:1890`; English test copy. */
const COPY = {
  ar: {
    title: "المزيد",
    description: "ارفع محاضرتك، وسيب مُنصت يساعدك تحولها لمحتوى أسهل في الفهم والمراجعة.",
    item: "الأسئلة",
    close: "إغلاق",
    delete: "حذف",
  },
  en: {
    title: "More",
    description: "Upload your lecture and let Munsit turn it into easier study material.",
    item: "Questions",
    close: "Close",
    delete: "Delete",
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
  document.documentElement.style.overflow = "";
});

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function sheetEl(): HTMLDialogElement {
  const element = document.querySelector("dialog");
  if (!element) throw new Error("no <dialog>");
  return element;
}

type HarnessProps = Partial<Omit<SheetProps, "open" | "onOpenChange">> & {
  dir?: "rtl" | "ltr";
  onOpenChange?: (open: boolean) => void;
  locked?: boolean;
  withInitialFocus?: boolean;
};

function Harness({
  dir = "rtl",
  onOpenChange,
  locked = false,
  withInitialFocus = false,
  ...props
}: HarnessProps) {
  const lang = dir === "rtl" ? "ar" : "en";
  const copy = COPY[lang];
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);
  return (
    <div dir={dir} lang={lang}>
      <Button onClick={() => setOpen(true)}>trigger</Button>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          onOpenChange?.(next);
          if (!locked) setOpen(next);
        }}
        title={copy.title}
        closeLabel={copy.close}
        {...(withInitialFocus ? { initialFocusRef: itemRef } : {})}
        {...props}
      >
        <Button ref={itemRef} variant="secondary">
          {copy.item}
        </Button>
      </Sheet>
    </div>
  );
}

async function openHarness(props: HarnessProps = {}) {
  const user = userEvent.setup();
  const view = render(<Harness {...props} />);
  await user.click(screen.getByRole("button", { name: "trigger" }));
  return { user, view };
}

function cancelEvent(target: Element = sheetEl()): Event {
  const event = new Event("cancel", { cancelable: true });
  fireEvent(target, event);
  return event;
}

/** Gives every modal a 320/200ms computed transition, as in the browser. */
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

describe("Sheet — open state and semantics", () => {
  it("is closed with no content until opened", () => {
    render(<Harness />);
    expect(sheetEl().hasAttribute("open")).toBe(false);
    expect(sheetEl().children).toHaveLength(0);
    expect(showModal).not.toHaveBeenCalled();
  });

  it("opens modal, labelled by the title, described by the description", async () => {
    await openHarness({ description: COPY.ar.description });
    const sheet = sheetEl();
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(sheet.getAttribute("aria-modal")).toBe("true");
    expect(sheet.hasAttribute("role")).toBe(false);
    const title = screen.getByRole("heading", { level: 2, name: COPY.ar.title });
    expect(sheet.getAttribute("aria-labelledby")).toBe(title.id);
    expect(document.getElementById(sheet.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
      COPY.ar.description,
    );
  });

  it("has no aria-describedby without a description", async () => {
    await openHarness();
    expect(sheetEl().hasAttribute("aria-describedby")).toBe(false);
  });

  it("always has a named close button, the first focusable element (native initial focus)", async () => {
    await openHarness();
    const close = screen.getByRole("button", { name: COPY.ar.close });
    expect(sheetEl().querySelector("button, [href], input, select, textarea, [tabindex]")).toBe(
      close,
    );
    expect(close.querySelector('[data-icon="x"]')).not.toBeNull();
  });

  it("hides the decorative grabber from assistive technology", async () => {
    await openHarness();
    const grabberRow = sheetEl().firstElementChild?.firstElementChild;
    expect(grabberRow?.getAttribute("aria-hidden")).toBe("true");
    expect(grabberRow?.querySelector("button, [tabindex]")).toBeNull();
  });
});

describe("Sheet — close paths", () => {
  it("Esc is prevented and calls onOpenChange(false) once", async () => {
    const onOpenChange = vi.fn();
    await openHarness({ onOpenChange });
    const event = cancelEvent();
    expect(event.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(sheetEl().hasAttribute("open")).toBe(false);
  });

  it("stays open while the prop stays true; reports a native close", async () => {
    const onOpenChange = vi.fn();
    await openHarness({ onOpenChange, locked: true });
    cancelEvent();
    expect(sheetEl().hasAttribute("open")).toBe(true);
    act(() => sheetEl().close());
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("closes on a press and release on the scrim only", async () => {
    const onOpenChange = vi.fn();
    await openHarness({ onOpenChange, locked: true });
    const title = screen.getByRole("heading", { level: 2 });
    const outside = { clientX: 900, clientY: 900 };
    fireEvent.pointerDown(title, outside);
    fireEvent.click(sheetEl(), outside);
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.pointerDown(sheetEl(), outside);
    fireEvent.click(sheetEl(), outside);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("the close button closes and focus returns to the trigger", async () => {
    const { user } = await openHarness({ withInitialFocus: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: COPY.ar.item }));
    await user.click(screen.getByRole("button", { name: COPY.ar.close }));
    expect(sheetEl().hasAttribute("open")).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "trigger" }));
    expect(document.documentElement.style.overflow).toBe("");
  });
});

describe("Sheet — classes and motion classes", () => {
  it("has the bottom shell, scrim and motion classes", async () => {
    await openHarness();
    const classes = classesOf(sheetEl());
    for (const expected of [
      "inset-x-0",
      "bottom-0",
      "top-auto",
      "w-full",
      "rounded-t-[28px]",
      "border-accent-electric-sky/18",
      "bg-surface-obsidian/98",
      "shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
      "backdrop:bg-surface-void-black/66",
      "[translate:0_0%]",
      "transition-[translate,opacity]",
      "motion-reduce:transition-opacity",
      "duration-slow",
      "ease-standard",
      "starting:open:[translate:0_calc(100%_*_var(--motion-distance))]",
      "starting:open:[opacity:var(--motion-distance)]",
      "starting:open:backdrop:opacity-0",
      "data-[state=closing]:[translate:0_calc(100%_*_var(--motion-distance))]",
      "data-[state=closing]:[opacity:var(--motion-distance)]",
      "data-[state=closing]:duration-base",
      "data-[state=closing]:backdrop:opacity-0",
    ]) {
      expect(classes, expected).toContain(expected);
    }
    const wrapper = sheetEl().firstElementChild as Element;
    expect(classesOf(wrapper)).toEqual(
      expect.arrayContaining([
        "max-h-[calc(100dvh_-_66px)]",
        "gap-md",
        "px-lg",
        "pt-sm",
        "pb-[calc(28px_+_env(safe-area-inset-bottom))]",
      ]),
    );
    const grabber = wrapper.querySelector("span");
    expect(classesOf(grabber as Element)).toEqual(
      expect.arrayContaining(["h-[4px]", "w-[40px]", "rounded-[2px]", "bg-text-primary/20"]),
    );
  });

  it("close button: 40, radius 12, Sky 8% / 16%, focus ring", async () => {
    await openHarness();
    expect(classesOf(screen.getByRole("button", { name: COPY.ar.close }))).toEqual(
      expect.arrayContaining([
        "size-[40px]",
        "rounded-md",
        "bg-accent-electric-sky/8",
        "border-accent-electric-sky/16",
        "focus-visible:outline-accent-electric-sky",
      ]),
    );
  });

  it("uses no hex colors and no physical left/right utilities", async () => {
    await openHarness({ description: COPY.ar.description });
    const all = [sheetEl(), ...sheetEl().querySelectorAll("*")].flatMap(classesOf);
    expect(all.filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
    expect(all.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
  });
});

describe("Sheet — motion lifecycle", () => {
  function Controlled({ open }: { open: boolean }) {
    return (
      <Sheet open={open} onOpenChange={() => {}} title={COPY.ar.title} closeLabel={COPY.ar.close}>
        <Button>{COPY.ar.item}</Button>
      </Sheet>
    );
  }

  it("stays modal until its own translate (or opacity) transition ends", () => {
    withTransition();
    const view = render(<Controlled open />);
    view.rerender(<Controlled open={false} />);
    const sheet = sheetEl();
    expect(sheet.dataset.state).toBe("closing");
    transitionEnd(screen.getByRole("button", { name: COPY.ar.item }), "translate");
    transitionEnd(sheet, "scale");
    expect(sheet.hasAttribute("open")).toBe(true);
    transitionEnd(sheet, "translate");
    expect(sheet.hasAttribute("open")).toBe(false);

    view.rerender(<Controlled open />);
    view.rerender(<Controlled open={false} />);
    transitionEnd(sheetEl(), "opacity"); // reduced motion ends on opacity
    expect(sheetEl().hasAttribute("open")).toBe(false);
  });

  it("falls back to the timer; rapid reopen cancels close()", () => {
    vi.useFakeTimers();
    withTransition();
    const view = render(<Controlled open />);
    view.rerender(<Controlled open={false} />);
    view.rerender(<Controlled open />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(sheetEl().hasAttribute("open")).toBe(true);
    expect(sheetEl().dataset.state).toBe("open");
    expect(showModal).toHaveBeenCalledTimes(1);
    view.rerender(<Controlled open={false} />);
    act(() => {
      vi.advanceTimersByTime(371);
    });
    expect(sheetEl().hasAttribute("open")).toBe(false);
  });
});

describe("Sheet ↔ Dialog — shared lifecycle (D-SH6)", () => {
  /** Options sheet → delete confirmation, as in My Lectures (`2268:1890` → `2268:1824`). */
  function OptionsFlow() {
    const [sheet, setSheet] = useState(false);
    const [dialog, setDialog] = useState(false);
    return (
      <div dir="rtl" lang="ar">
        <Button onClick={() => setSheet(true)}>trigger</Button>
        <Sheet open={sheet} onOpenChange={setSheet} title="خيارات المحاضرة" closeLabel="إغلاق">
          <Button
            variant="secondary"
            onClick={() => {
              setSheet(false);
              setDialog(true);
            }}
          >
            {COPY.ar.delete}
          </Button>
        </Sheet>
        <Dialog
          open={dialog}
          onOpenChange={setDialog}
          role="alertdialog"
          title="حذف المحاضرة؟"
          actions={<Button onClick={() => setDialog(false)}>إلغاء</Button>}
        />
      </div>
    );
  }

  it("Sheet → Dialog with overlapping exit: lock held, focus stays in the dialog, then returns to the trigger", () => {
    vi.useFakeTimers();
    withTransition();
    document.documentElement.style.overflow = "scroll"; // the page's own style, restored at the end
    render(<OptionsFlow />);
    const trigger = screen.getByRole("button", { name: "trigger" });
    trigger.focus();
    fireEvent.click(trigger);
    const [sheet, dialog] = [...document.querySelectorAll("dialog")];
    expect(sheet?.hasAttribute("open")).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");

    const del = screen.getByRole("button", { name: COPY.ar.delete });
    del.focus();
    fireEvent.click(del);
    // Sheet is exiting, dialog is open on top.
    expect(sheet?.dataset.state).toBe("closing");
    expect(dialog?.hasAttribute("open")).toBe(true);
    const cancel = screen.getByRole("button", { name: "إلغاء" });
    cancel.focus();

    act(() => {
      vi.advanceTimersByTime(400); // sheet exit finishes
    });
    expect(sheet?.hasAttribute("open")).toBe(false);
    expect(document.activeElement).toBe(cancel); // not pulled out of the open dialog
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(cancel);
    act(() => {
      vi.advanceTimersByTime(400); // dialog exit finishes
    });
    expect(dialog?.hasAttribute("open")).toBe(false);
    expect(document.activeElement).toBe(trigger); // falls back past the unmounted sheet row
    expect(document.documentElement.style.overflow).toBe("scroll");
  });

  it("Dialog → Sheet nested: closing the sheet returns focus into the open dialog", async () => {
    const user = userEvent.setup();
    function Nested() {
      const [dialog, setDialog] = useState(false);
      const [sheet, setSheet] = useState(false);
      return (
        <div dir="rtl" lang="ar">
          <Button onClick={() => setDialog(true)}>trigger</Button>
          <Dialog
            open={dialog}
            onOpenChange={setDialog}
            title="نقل الملاحظة"
            actions={<Button onClick={() => setSheet(true)}>open sheet</Button>}
          />
          <Sheet open={sheet} onOpenChange={setSheet} title="المجلدات" closeLabel="إغلاق" />
        </div>
      );
    }
    render(<Nested />);
    await user.click(screen.getByRole("button", { name: "trigger" }));
    const opener = screen.getByRole("button", { name: "open sheet" });
    await user.click(opener);
    expect(document.querySelectorAll("dialog[open]")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(document.querySelectorAll("dialog[open]")).toHaveLength(1);
    expect(document.activeElement).toBe(opener);
    expect(document.documentElement.style.overflow).toBe("hidden");
    cancelEvent(document.querySelector("dialog[open]") as Element);
    expect(document.querySelectorAll("dialog[open]")).toHaveLength(0);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "trigger" }));
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("unmounting an open sheet over an open dialog keeps the lock and focus in the dialog", async () => {
    const user = userEvent.setup();
    function Host({ showSheet }: { showSheet: boolean }) {
      return (
        <div dir="rtl" lang="ar">
          <Dialog
            open
            onOpenChange={() => {}}
            title="نقل الملاحظة"
            actions={<Button>stay</Button>}
          />
          {showSheet ? (
            <Sheet open onOpenChange={() => {}} title="المجلدات" closeLabel="إغلاق" />
          ) : null}
        </div>
      );
    }
    const view = render(<Host showSheet={false} />);
    const stay = screen.getByRole("button", { name: "stay" });
    await user.click(stay);
    view.rerender(<Host showSheet />);
    screen.getByRole("button", { name: "إغلاق" }).focus();
    view.rerender(<Host showSheet={false} />);
    expect(document.activeElement).toBe(stay);
    expect(document.documentElement.style.overflow).toBe("hidden");
  });
});

describe("Sheet — compile-time API", () => {
  it("rejects values outside the contract", () => {
    const noop = () => {};
    const samples = [
      // @ts-expect-error — no width: a sheet is always full width
      <Sheet key="w" open onOpenChange={noop} title="t" closeLabel="c" width={480} />,
      // @ts-expect-error — no icon tile tone on sheets
      <Sheet key="t" open onOpenChange={noop} title="t" closeLabel="c" tone="danger" />,
      // @ts-expect-error — title is required
      <Sheet key="n" open onOpenChange={noop} closeLabel="c" />,
      // @ts-expect-error — closeLabel is required (N-2)
      <Sheet key="l" open onOpenChange={noop} title="t" />,
      // @ts-expect-error — controlled only
      <Sheet key="d" defaultOpen onOpenChange={noop} title="t" closeLabel="c" />,
      // @ts-expect-error — no className
      <Sheet key="k" open onOpenChange={noop} title="t" closeLabel="c" className="x" />,
    ];
    expect(samples).toHaveLength(6);
  });
});

describe("Sheet — axe", () => {
  it.each(["rtl", "ltr"] as const)("title-only and with description (%s)", async (dir) => {
    const copy = COPY[dir === "rtl" ? "ar" : "en"];
    const first = await openHarness({ dir });
    expect((await axe(first.view.container, AXE_OPTIONS)).violations).toEqual([]);
    cleanup();
    const second = await openHarness({ dir, description: copy.description });
    expect((await axe(second.view.container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

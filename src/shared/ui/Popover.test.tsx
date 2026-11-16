// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Button } from "./Button";
import { Popover, type PopoverProps } from "./Popover";

/*
 * Popover tests — contract docs/phases/phase-03-popover-menu-contract.md §8 (component part).
 * jsdom hides a closed [popover] but has no Popover API: the stub reveals it inline. Positioning,
 * top layer and motion are tested in Chromium. axe's color-contrast rule is off in jsdom.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

/** Figma copy (`2236:784`): "الإشعارات", "عرض كل الإشعارات"; the mark-all label and English are test copy. */
const COPY = {
  ar: { label: "الإشعارات", mark: "تحديد الكل كمقروء", all: "عرض كل الإشعارات" },
  en: { label: "Notifications", mark: "Mark all as read", all: "View all notifications" },
} as const;

beforeAll(() => {
  if (!("showPopover" in HTMLElement.prototype)) {
    Object.assign(HTMLElement.prototype, {
      showPopover(this: HTMLElement) {
        this.style.display = "flex";
      },
      hidePopover(this: HTMLElement) {
        this.style.display = "";
      },
    });
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function classesOf(element: Element | null): string[] {
  return (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

type HarnessProps = Partial<PopoverProps> & { dir?: "rtl" | "ltr"; empty?: boolean };

function Harness({ dir = "rtl", empty = false, ...props }: HarnessProps) {
  const copy = COPY[dir === "rtl" ? "ar" : "en"];
  return (
    <div dir={dir} lang={dir === "rtl" ? "ar" : "en"}>
      <Popover
        label={copy.label}
        trigger={(triggerProps) => (
          <Button variant="secondary" {...triggerProps}>
            trigger
          </Button>
        )}
        {...props}
      >
        {empty ? (
          <p>{copy.label}</p>
        ) : (
          <>
            <Button variant="secondary">{copy.mark}</Button>
            <Button variant="secondary">{copy.all}</Button>
          </>
        )}
      </Popover>
      <button type="button">outside</button>
    </div>
  );
}

const trigger = () => screen.getByRole("button", { name: "trigger" });

describe("Popover", () => {
  it("is a named non-modal dialog wired to its trigger", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    await user.click(trigger());
    const panel = screen.getByRole("dialog", { name: COPY.ar.label });
    expect(panel.hasAttribute("aria-modal")).toBe(false);
    expect(panel.getAttribute("popover")).toBe("manual");
    expect(trigger().getAttribute("aria-controls")).toBe(panel.id);
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
  });

  it("moves focus to the first focusable element, or to the panel when there is none", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    expect(document.activeElement).toBe(screen.getByRole("button", { name: COPY.ar.mark }));
    cleanup();
    render(<Harness empty />);
    await user.click(trigger());
    expect(document.activeElement).toBe(screen.getByRole("dialog"));
  });

  it("Tab moves inside; focus leaving the panel closes it", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: COPY.ar.all }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    await user.tab(); // to "outside"
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  it("Esc closes, is cancelled and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <Harness />
      </div>,
    );
    await user.click(trigger());
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    act(() => {
      document.activeElement?.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(outer).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("outside click closes without moving focus back; the trigger toggles", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "outside" }));
    await user.click(trigger());
    await user.click(trigger());
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("controlled and defaultOpen", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const view = render(<Harness open={false} onOpenChange={onOpenChange} />);
    await user.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    view.rerender(<Harness open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    cleanup();
    render(<Harness defaultOpen />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("Figma values (2236:784) and motion classes; no hex, no left/right", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    const panel = screen.getByRole("dialog");
    expect(classesOf(panel)).toEqual(
      expect.arrayContaining([
        "w-[380px]",
        "max-w-[calc(100vw_-_40px)]",
        "p-md",
        "gap-[6px]",
        "rounded-xl",
        "bg-surface-obsidian/97",
        "border-accent-electric-sky/18",
        "shadow-[0_24px_56px_rgba(0,0,0,0.55)]",
        "open:flex",
        "duration-base",
        "data-[state=closing]:duration-fast",
        "motion-reduce:transition-opacity",
        "starting:open:opacity-0",
        "starting:open:[scale:calc(1_-_0.03_*_var(--motion-distance))]",
        "starting:open:[translate:0_calc(var(--overlay-slide)_*_var(--motion-distance))]",
      ]),
    );
    const all = [panel, ...panel.querySelectorAll("*")].flatMap(classesOf);
    expect(all.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
    expect(classesOf(panel).filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
  });

  it("compile-time: label required; no width or variant props", () => {
    const t = () => null;
    const samples = [
      // @ts-expect-error — label is required
      <Popover key="l" trigger={t}>
        x
      </Popover>,
      // @ts-expect-error — width is fixed by Figma (380)
      <Popover key="w" trigger={t} label="p" width={300}>
        x
      </Popover>,
      // @ts-expect-error — align is start | end
      <Popover key="a" trigger={t} label="p" align="right">
        x
      </Popover>,
    ];
    expect(samples).toHaveLength(3);
  });

  it.each(["rtl", "ltr"] as const)("axe with the popover open (%s)", async (dir) => {
    const user = userEvent.setup();
    const { container } = render(<Harness dir={dir} />);
    await user.click(trigger());
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

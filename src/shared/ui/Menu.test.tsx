// @vitest-environment jsdom
import { useState } from "react";

import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Button } from "./Button";
import {
  Menu,
  MenuItem,
  MenuItemRadio,
  MenuRadioGroup,
  MenuSeparator,
  normalizeForTypeahead,
  type MenuProps,
} from "./Menu";

/*
 * Menu tests — contract docs/phases/phase-03-popover-menu-contract.md §8 (component part).
 * jsdom has no Popover API, so `showPopover` / `hidePopover` are stubbed. Positioning, top layer,
 * motion and Esc inside a real modal are tested in Chromium
 * (tests/e2e/dev-components-popover-menu.spec.ts). axe's color-contrast rule is off in jsdom.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

/** Figma copy: More Options `2261:1500` (Arabic) and English test counterparts. */
const COPY = {
  ar: {
    label: "خيارات المحاضرة",
    items: ["فتح المحاضرة", "إعادة تسمية", "إضافة إلى المفضلة", "حذف"],
  },
  en: { label: "Lecture options", items: ["Open lecture", "Rename", "Remove", "Delete"] },
} as const;

beforeAll(() => {
  if (!("showPopover" in HTMLElement.prototype)) {
    Object.assign(HTMLElement.prototype, {
      // jsdom hides a closed [popover] (UA rule) but has no showPopover: reveal it inline.
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

type HarnessProps = Partial<MenuProps> & {
  dir?: "rtl" | "ltr";
  onAction?: (label: string, focused: Element | null, expanded: string | null) => void;
  disabledIndex?: number;
};

function Harness({ dir = "rtl", onAction, disabledIndex, ...props }: HarnessProps) {
  const copy = COPY[dir === "rtl" ? "ar" : "en"];
  return (
    <div dir={dir} lang={dir === "rtl" ? "ar" : "en"}>
      <Menu
        label={copy.label}
        trigger={(triggerProps) => (
          <Button variant="secondary" {...triggerProps}>
            trigger
          </Button>
        )}
        {...props}
      >
        {copy.items.slice(0, 3).map((item, index) => (
          <MenuItem
            key={item}
            icon={index === 0 ? "play" : index === 2 ? "star" : undefined}
            disabled={index === disabledIndex}
            onSelect={() => {
              const trigger = screen.getByRole("button", { name: "trigger" });
              onAction?.(item, document.activeElement, trigger.getAttribute("aria-expanded"));
            }}
          >
            {item}
          </MenuItem>
        ))}
        <MenuSeparator />
        <MenuItem tone="danger" onSelect={() => onAction?.(copy.items[3], null, null)}>
          {copy.items[3]}
        </MenuItem>
      </Menu>
      <button type="button">outside</button>
    </div>
  );
}

const trigger = () => screen.getByRole("button", { name: "trigger" });
const menuItems = () => screen.getAllByRole("menuitem");

function keyDown(target: Element, key: string, timeStamp?: number): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  if (timeStamp !== undefined) Object.defineProperty(event, "timeStamp", { value: timeStamp });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

describe("Menu — trigger and roles", () => {
  it("wires the trigger to the menu", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(trigger().getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menu")).toBeNull();
    await user.click(trigger());
    const menu = screen.getByRole("menu", { name: COPY.ar.label });
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-controls")).toBe(menu.parentElement?.id);
    expect(menu.parentElement?.getAttribute("popover")).toBe("manual");
    expect(screen.getByRole("separator")).toBeTruthy();
    expect(menuItems()).toHaveLength(4);
  });

  it("click and Enter focus the first item; ArrowDown first, ArrowUp last", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    expect(document.activeElement).toBe(menuItems()[0]);
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger());
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(menuItems()[0]);
    await user.keyboard("{Escape}");
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(menuItems()[3]);
    await user.keyboard("{Escape}");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(menuItems()[0]);
  });
});

describe("Menu — keyboard navigation", () => {
  it("arrows wrap; Home and End; disabled items are skipped", async () => {
    const user = userEvent.setup();
    render(<Harness disabledIndex={1} />);
    await user.click(trigger());
    const list = menuItems();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(list[2]); // index 1 disabled → skipped
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(list[0]);
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(list[3]); // wrap
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(list[0]); // wrap
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(list[3]);
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(list[0]);
    expect(list[1]?.hasAttribute("disabled")).toBe(true);
  });

  it("Arabic type-ahead ignores hamza/madda and harakat; repeated letters cycle", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    const list = menuItems();
    const panel = screen.getByRole("menu").parentElement as HTMLElement;
    keyDown(panel, "ا", 1000); // "إعادة" (alef with hamza below)
    expect(document.activeElement).toBe(list[1]);
    keyDown(panel, "ا", 1100); // repeated → next alef item "إضافة"
    expect(document.activeElement).toBe(list[2]);
    keyDown(panel, "ح", 2000); // after the timeout: new search → "حذف"
    expect(document.activeElement).toBe(list[3]);
    expect(normalizeForTypeahead("أَحْمَد")).toBe("احمد");
    expect(normalizeForTypeahead("آمـال")).toBe("امال");
  });

  it("English type-ahead: case-insensitive, multi-letter, repeated letters, timeout", async () => {
    const user = userEvent.setup();
    render(<Harness dir="ltr" />);
    await user.click(trigger());
    const list = menuItems();
    const panel = screen.getByRole("menu").parentElement as HTMLElement;
    keyDown(panel, "R", 1000);
    expect(document.activeElement).toBe(list[1]); // Rename
    keyDown(panel, "r", 1100);
    expect(document.activeElement).toBe(list[2]); // repeated "rr" → next "r…": Remove
    keyDown(panel, "d", 3000);
    expect(document.activeElement).toBe(list[3]); // new search after timeout: Delete
    keyDown(panel, "r", 4000);
    keyDown(panel, "e", 4100);
    keyDown(panel, "m", 4200);
    expect(document.activeElement).toBe(list[2]); // "rem" → Remove
    expect(normalizeForTypeahead("Éclair")).toBe("eclair");
  });

  it("type-ahead skips disabled items", async () => {
    const user = userEvent.setup();
    render(<Harness dir="ltr" disabledIndex={1} />);
    await user.click(trigger());
    keyDown(screen.getByRole("menu").parentElement as HTMLElement, "r", 1000);
    expect(document.activeElement).toBe(menuItems()[2]); // Rename disabled → Remove
  });
});

describe("Menu — activation and dismissal", () => {
  it("Enter and Space activate: menu closes and focus is on the trigger before onSelect", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Harness onAction={onAction} />);
    await user.click(trigger());
    await user.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledWith(COPY.ar.items[0], trigger(), "false");
    await user.click(trigger());
    await user.keyboard("{ArrowDown}{ArrowDown} ");
    expect(onAction).toHaveBeenLastCalledWith(COPY.ar.items[2], trigger(), "false");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Esc closes, is cancelled and does not propagate; focus returns to the trigger", async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <Harness />
      </div>,
    );
    await user.click(trigger());
    const event = keyDown(menuItems()[0] as HTMLElement, "Escape");
    expect(event.defaultPrevented).toBe(true);
    expect(outer).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("Tab closes the menu", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    await user.keyboard("{Tab}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  it("outside pointerdown closes without moving focus to the trigger; trigger toggles", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "outside" }));
    await user.click(trigger());
    await user.click(trigger());
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("controlled: the prop decides; onOpenChange reports requests", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const view = render(<Harness open={false} onOpenChange={onOpenChange} />);
    await user.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("menu")).toBeNull();
    view.rerender(<Harness open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("menu")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("menu")).toBeTruthy();
  });
});

describe("Menu — radio items", () => {
  function Sort() {
    const [value, setValue] = useState("newest");
    return (
      <div dir="rtl" lang="ar">
        <Menu
          label="الترتيب"
          trigger={(p) => (
            <Button variant="secondary" {...p}>
              trigger
            </Button>
          )}
        >
          <MenuRadioGroup value={value} onValueChange={setValue} label="الترتيب">
            <MenuItemRadio value="newest">الأحدث أولًا</MenuItemRadio>
            <MenuItemRadio value="oldest">الأقدم أولًا</MenuItemRadio>
            <MenuItemRadio value="name" disabled>
              الاسم
            </MenuItemRadio>
          </MenuRadioGroup>
        </Menu>
        <output>{value}</output>
      </div>
    );
  }

  it("exposes aria-checked, selects by keyboard and closes", async () => {
    const user = userEvent.setup();
    render(<Sort />);
    await user.click(trigger());
    const radios = screen.getAllByRole("menuitemradio");
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["true", "false", "false"]);
    expect(radios[0]?.querySelector('[data-icon="check"]')).not.toBeNull();
    expect(classesOf(radios[0] ?? null)).toContain("aria-checked:bg-accent-electric-sky/12");
    expect(screen.getByRole("group", { name: "الترتيب" })).toBeTruthy();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByRole("status").textContent).toBe("oldest");
    expect(document.activeElement).toBe(trigger());
    await user.click(trigger());
    const updated = screen.getAllByRole("menuitemradio");
    expect(updated[1]?.getAttribute("aria-checked")).toBe("true");
    expect(updated[2]?.hasAttribute("disabled")).toBe(true);
  });
});

describe("Menu — variants and classes", () => {
  it("context variant values (Figma 2261:1500)", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    const panel = screen.getByRole("menu").parentElement;
    expect(classesOf(panel)).toEqual(
      expect.arrayContaining([
        "w-[220px]",
        "p-[6px]",
        "rounded-[14px]",
        "bg-color-surface-graphite/98",
        "border-accent-electric-sky/18",
        "shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
        "open:flex",
        "inset-auto",
        "duration-base",
        "data-[state=closing]:duration-fast",
        "motion-reduce:transition-opacity",
        "starting:open:opacity-0",
      ]),
    );
    expect(classesOf(menuItems()[0] ?? null)).toEqual(
      expect.arrayContaining([
        "h-[40px]",
        "rounded-[10px]",
        "text-dashboard-body",
        "focus:bg-text-primary/5",
        "focus-visible:outline-accent-electric-sky",
      ]),
    );
    expect(classesOf(menuItems()[3] ?? null)).toContain("text-accent-coral-pulse");
    expect(classesOf(screen.getByRole("separator"))).toContain("bg-text-primary/8");
  });

  it("account variant values (Figma 2236:813) and the header slot outside role=menu", async () => {
    const user = userEvent.setup();
    render(<Harness variant="account" header={<p>header content</p>} />);
    await user.click(trigger());
    const menu = screen.getByRole("menu");
    const panel = menu.parentElement;
    expect(classesOf(panel)).toEqual(
      expect.arrayContaining([
        "w-[256px]",
        "p-[8px]",
        "rounded-[18px]",
        "bg-surface-obsidian/97",
        "shadow-[0_24px_56px_rgba(0,0,0,0.55)]",
      ]),
    );
    expect(classesOf(menuItems()[0] ?? null)).toEqual(
      expect.arrayContaining(["h-[44px]", "rounded-md", "text-dashboard-body-medium"]),
    );
    expect(classesOf(screen.getByRole("separator"))).toContain("bg-accent-electric-sky/10");
    const header = screen.getByText("header content");
    expect(menu.contains(header)).toBe(false);
    expect(panel?.contains(header)).toBe(true);
  });

  it("no hex colors and no physical left/right utilities", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(trigger());
    const panel = screen.getByRole("menu").parentElement as HTMLElement;
    const all = [panel, ...panel.querySelectorAll("*")].flatMap(classesOf);
    expect(all.filter((c) => /#[0-9a-f]{3,8}/i.test(c))).toEqual([]);
    expect(all.filter((c) => /(^|:)-?(ml|mr|pl|pr|left|right)-/.test(c))).toEqual([]);
  });
});

describe("Menu — compile-time API", () => {
  it("rejects values outside the contract", () => {
    const t = () => null;
    const samples = [
      // @ts-expect-error — label is required
      <Menu key="l" trigger={t}>
        x
      </Menu>,
      // @ts-expect-error — only context | account
      <Menu key="v" trigger={t} label="m" variant="large">
        x
      </Menu>,
      // @ts-expect-error — align is start | end
      <Menu key="a" trigger={t} label="m" align="left">
        x
      </Menu>,
      // @ts-expect-error — tone is danger only
      <MenuItem key="t" tone="success">
        x
      </MenuItem>,
      // @ts-expect-error — no href on items in V1
      <MenuItem key="h" href="/x">
        x
      </MenuItem>,
      // @ts-expect-error — radio items need a value
      <MenuItemRadio key="r">x</MenuItemRadio>,
    ];
    expect(samples).toHaveLength(6);
  });
});

describe("Menu — axe", () => {
  it.each(["rtl", "ltr"] as const)("context and account menus open (%s)", async (dir) => {
    const user = userEvent.setup();
    const first = render(<Harness dir={dir} />);
    await user.click(trigger());
    expect((await axe(first.container, AXE_OPTIONS)).violations).toEqual([]);
    cleanup();
    const second = render(<Harness dir={dir} variant="account" header={<p>header</p>} />);
    await user.click(trigger());
    expect((await axe(second.container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

// @vitest-environment jsdom
import { useState } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Tab, TabList, TabPanel, Tabs, type TabsSize } from "./Tabs";

/*
 * Tabs tests — contract docs/phases/phase-03-tabs-contract.md §6.
 *
 * jsdom does not apply Tailwind CSS, so styles are checked as class names. Rendered contrast and
 * sizes are checked in Chromium at integration. axe's color-contrast rule is off here.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

/** Figma tool labels (Lecture Details) and English counterparts used only as test copy. */
const TOOLS = [
  { value: "transcript", ar: "التفريغ النصي", en: "Transcript", icon: "fileText" },
  { value: "summary", ar: "الملخص", en: "Summary", icon: "note" },
  { value: "questions", ar: "الأسئلة", en: "Questions", icon: "help" },
] as const;

afterEach(cleanup);

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

interface Options {
  dir?: "rtl" | "ltr";
  size?: TabsSize;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  value?: string;
}

function renderTabs({ dir = "rtl", size, disabled, onValueChange, value }: Options = {}) {
  const lang = dir === "rtl" ? "ar" : "en";
  return render(
    <div dir={dir} lang={lang}>
      <Tabs
        label={dir === "rtl" ? "أدوات المحاضرة" : "Lecture tools"}
        size={size}
        disabled={disabled}
        onValueChange={onValueChange}
        {...(value === undefined ? { defaultValue: "transcript" } : { value })}
      >
        <TabList>
          {TOOLS.map((tool) => (
            <Tab key={tool.value} value={tool.value} icon={tool.icon}>
              {tool[lang]}
            </Tab>
          ))}
        </TabList>
        {TOOLS.map((tool) => (
          <TabPanel key={tool.value} value={tool.value}>
            {`${tool.en} panel`}
          </TabPanel>
        ))}
      </Tabs>
    </div>,
  );
}

const tabs = () => screen.getAllByRole("tab");
const selectedTab = () => tabs().find((t) => t.getAttribute("aria-selected") === "true");

describe("Tabs — roles and relationships (§6.1)", () => {
  it("links tablist, tabs and panels with ARIA and roving tabIndex", () => {
    renderTabs();
    const list = screen.getByRole("tablist");
    expect(list.getAttribute("aria-label")).toBe("أدوات المحاضرة");
    expect(list.getAttribute("aria-orientation")).toBe("horizontal");
    expect(tabs()).toHaveLength(3);

    for (const tab of tabs()) {
      expect(tab.tagName).toBe("BUTTON");
      expect(tab.getAttribute("type")).toBe("button");
      const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
      expect(panel?.getAttribute("role")).toBe("tabpanel");
      expect(panel?.getAttribute("aria-labelledby")).toBe(tab.id);
      expect(panel?.getAttribute("tabindex")).toBe("0");
      const isSelected = tab.getAttribute("aria-selected") === "true";
      expect(tab.getAttribute("tabindex")).toBe(isSelected ? "0" : "-1");
      expect(panel?.hidden).toBe(!isSelected);
    }
    expect(selectedTab()?.textContent).toBe("التفريغ النصي");
    expect(screen.getByRole("tabpanel").textContent).toBe("Transcript panel");
  });

  it("makes ids safe for values with spaces and Arabic text", () => {
    render(
      <Tabs label="x" defaultValue="أ ب">
        <TabList>
          <Tab value="أ ب">one</Tab>
        </TabList>
        <TabPanel value="أ ب">panel</TabPanel>
      </Tabs>,
    );
    const tab = screen.getByRole("tab");
    expect(tab.id).toMatch(/^[^\s]+$/);
    expect(document.getElementById(tab.getAttribute("aria-controls") ?? "")?.textContent).toBe(
      "panel",
    );
  });

  it("throws a clear error when parts are used outside <Tabs>", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Tab value="x">x</Tab>)).toThrow("<Tab> must be used inside <Tabs>.");
    vi.restoreAllMocks();
  });
});

describe("Tabs — selection (§6.2)", () => {
  it("uncontrolled: a click selects the tab and shows its panel", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderTabs({ onValueChange });
    await user.click(screen.getByRole("tab", { name: "الأسئلة" }));
    expect(selectedTab()?.textContent).toBe("الأسئلة");
    expect(screen.getByRole("tabpanel").textContent).toBe("Questions panel");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("questions");
    // Re-selecting the current tab does not fire again.
    await user.click(screen.getByRole("tab", { name: "الأسئلة" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("controlled: selection follows the value prop only", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderTabs({ value: "summary", onValueChange });
    expect(selectedTab()?.textContent).toBe("الملخص");

    await user.click(screen.getByRole("tab", { name: "الأسئلة" }));
    expect(onValueChange).toHaveBeenCalledWith("questions");
    expect(selectedTab()?.textContent).toBe("الملخص"); // the parent has not updated value

    rerender(
      <div dir="rtl" lang="ar">
        <Tabs label="أدوات المحاضرة" value="questions" onValueChange={onValueChange}>
          <TabList>
            {TOOLS.map((tool) => (
              <Tab key={tool.value} value={tool.value}>
                {tool.ar}
              </Tab>
            ))}
          </TabList>
          {TOOLS.map((tool) => (
            <TabPanel key={tool.value} value={tool.value}>
              {tool.en}
            </TabPanel>
          ))}
        </Tabs>
      </div>,
    );
    expect(selectedTab()?.textContent).toBe("الأسئلة");
  });

  it("controlled with a parent state updates on click", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("transcript");
      return (
        <Tabs label="tools" value={value} onValueChange={setValue}>
          <TabList>
            <Tab value="transcript">a</Tab>
            <Tab value="summary">b</Tab>
          </TabList>
          <TabPanel value="transcript">A</TabPanel>
          <TabPanel value="summary">B</TabPanel>
        </Tabs>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("tab", { name: "b" }));
    expect(screen.getByRole("tabpanel").textContent).toBe("B");
  });
});

describe("Tabs — keyboard and focus (§6.3)", () => {
  it("RTL: ArrowLeft goes to the next tab, ArrowRight to the previous, with wrap", async () => {
    const user = userEvent.setup();
    renderTabs({ dir: "rtl" });
    await user.tab();
    expect(document.activeElement).toBe(tabs()[0]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tabs()[1]);
    expect(selectedTab()).toBe(tabs()[1]); // automatic activation
    expect(screen.getByRole("tabpanel").textContent).toBe("Summary panel");

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(tabs()[2]); // wrapped from the first to the last
    expect(selectedTab()).toBe(tabs()[2]);
  });

  it("LTR: ArrowRight goes to the next tab, ArrowLeft to the previous, with wrap", async () => {
    const user = userEvent.setup();
    renderTabs({ dir: "ltr" });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(selectedTab()).toBe(tabs()[1]);
    expect(document.activeElement).toBe(tabs()[1]);
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(selectedTab()).toBe(tabs()[2]);
  });

  it("Home and End select the first and last tab", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.tab();
    await user.keyboard("{End}");
    expect(selectedTab()).toBe(tabs()[2]);
    expect(document.activeElement).toBe(tabs()[2]);
    await user.keyboard("{Home}");
    expect(selectedTab()).toBe(tabs()[0]);
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it("Tab moves from the selected tab to its panel, skipping the other tabs", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.tab();
    expect(document.activeElement).toBe(tabs()[0]);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("tabpanel"));
  });

  it("other keys are ignored", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.tab();
    await user.keyboard("{ArrowDown}{ArrowUp}a");
    expect(selectedTab()).toBe(tabs()[0]);
  });
});

describe("Tabs — disabled list (§6.4)", () => {
  it("disables every tab, marks the tablist and dims it; nothing can be selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderTabs({ disabled: true, onValueChange });
    const list = screen.getByRole("tablist");
    expect(list.getAttribute("aria-disabled")).toBe("true");
    expect(classesOf(list)).toContain("opacity-50");
    for (const tab of tabs()) expect((tab as HTMLButtonElement).disabled).toBe(true);

    await user.click(tabs()[1] as HTMLElement);
    await user.tab();
    expect(tabs()).not.toContain(document.activeElement);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(selectedTab()).toBe(tabs()[0]);
    // The selected panel stays visible.
    expect(screen.getByRole("tabpanel").textContent).toBe("Transcript panel");
  });

  it("an enabled list has no aria-disabled and no opacity class", () => {
    renderTabs();
    const list = screen.getByRole("tablist");
    expect(list.hasAttribute("aria-disabled")).toBe(false);
    expect(classesOf(list)).not.toContain("opacity-50");
  });
});

describe("Tabs — classes (§6.5)", () => {
  const FOCUS = [
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-solid",
    "focus-visible:outline-accent-electric-sky",
  ];

  it("size default: layout, inactive (with hover) and active classes; icon and underline", () => {
    renderTabs({ size: "default" });
    const [active, inactive] = tabs() as [HTMLElement, HTMLElement];
    for (const tab of [active, inactive]) {
      expect(classesOf(tab)).toEqual(
        expect.arrayContaining([
          "h-[44px]",
          "gap-[8px]",
          "px-md",
          "text-dashboard-body-medium",
          "rounded-md",
          "border",
          ...FOCUS,
        ]),
      );
    }
    expect(classesOf(active)).toEqual(
      expect.arrayContaining([
        "bg-accent-electric-sky/12",
        "border-accent-electric-sky/32",
        "text-text-primary",
      ]),
    );
    expect(classesOf(inactive)).toEqual(
      expect.arrayContaining([
        "border-transparent",
        "text-text-secondary",
        "[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:bg-text-primary/5",
        "[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:text-text-primary",
      ]),
    );
    // M-1: hover applies only to fine pointers that can hover (motion.css rule), never on touch.
    expect(
      classesOf(inactive).filter(
        (c) => c.includes("hover:") && !c.startsWith("[@media(hover:hover)"),
      ),
    ).toEqual([]);
    expect(classesOf(active).some((c) => c.includes("hover:"))).toBe(false);
    expect(classesOf(active.querySelector("svg") as Element)).toContain("text-accent-electric-sky");
    expect(classesOf(inactive.querySelector("svg") as Element)).not.toContain(
      "text-accent-electric-sky",
    );
    expect(active.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(classesOf(active.querySelector("span") as Element)).toEqual([
      "underline",
      "underline-offset-4",
    ]);
    expect(inactive.querySelector("span")?.getAttribute("class")).toBeNull();
    expect(classesOf(screen.getByRole("tablist"))).toContain("gap-[8px]");
  });

  it("size compact: layout and states, no hover, underline on the active label", () => {
    renderTabs({ size: "compact" });
    const [active, inactive] = tabs() as [HTMLElement, HTMLElement];
    for (const tab of [active, inactive]) {
      expect(classesOf(tab)).toEqual(
        expect.arrayContaining([
          "min-h-[58px]",
          "flex-col",
          "gap-[4px]",
          "px-[6px]",
          "py-[8px]",
          "text-dashboard-caption",
          ...FOCUS,
        ]),
      );
      expect(classesOf(tab).some((c) => c.includes("hover:"))).toBe(false);
    }
    expect(classesOf(active)).toEqual(
      expect.arrayContaining([
        "bg-accent-electric-sky/12",
        "border-accent-electric-sky/50",
        "text-accent-electric-sky",
      ]),
    );
    expect(classesOf(inactive)).toEqual(
      expect.arrayContaining([
        "bg-text-primary/3",
        "border-accent-electric-sky/12",
        "text-text-secondary",
      ]),
    );
    expect(classesOf(active.querySelector("span") as Element)).toContain("underline");
    expect(classesOf(screen.getByRole("tablist"))).toContain("gap-xs");
  });

  it("TabList className adds layout (e.g. the Mobile 2 × 3 grid)", () => {
    render(
      <Tabs label="x" size="compact" defaultValue="a">
        <TabList className="grid grid-cols-3 gap-[8px]">
          <Tab value="a">a</Tab>
        </TabList>
        <TabPanel value="a">A</TabPanel>
      </Tabs>,
    );
    expect(classesOf(screen.getByRole("tablist")).slice(-3)).toEqual([
      "grid",
      "grid-cols-3",
      "gap-[8px]",
    ]);
  });

  it.each(["default", "compact"] as const)(
    "%s: no hex, physical-side or transform classes",
    (size) => {
      const { container } = renderTabs({ size });
      const all = Array.from(container.querySelectorAll("*")).flatMap(classesOf);
      for (const cls of all) {
        expect(cls).not.toMatch(/#[0-9a-f]{3,8}/i);
        expect(cls).not.toMatch(/(^|:)(ml|mr|pl|pr|left|right|rounded-[lr])-/);
        expect(cls).not.toMatch(/(^|:)(transform|scale|translate|rotate)/);
      }
    },
  );
});

describe("Tabs — accessibility (§6.7)", () => {
  for (const dir of ["rtl", "ltr"] as const) {
    it.each(["default", "compact"] as const)(`%s has no axe violations (${dir})`, async (size) => {
      const { container } = renderTabs({ dir, size });
      expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
    });
  }

  it("disabled list has no axe violations", async () => {
    const { container } = renderTabs({ disabled: true });
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });
});

/*
 * Compile-time tests (§6.6): checked by `corepack pnpm typecheck` (tsconfig includes **\/*.tsx),
 * never executed. A rejection that stops failing breaks the typecheck (TS2578).
 */
export function tabsTypeTests() {
  return (
    <>
      <Tabs label="ok" variant="tool" size="compact" defaultValue="a" disabled>
        <TabList className="grid grid-cols-3">
          <Tab value="a" icon="fileText" className="x">
            a
          </Tab>
        </TabList>
        <TabPanel value="a">A</TabPanel>
      </Tabs>
      {/* @ts-expect-error no filter variant: filter rows belong to their modules (contract §1.1) */}
      <Tabs label="x" variant="filter">
        x
      </Tabs>
      {/* @ts-expect-error unknown size */}
      <Tabs label="x" size="large">
        x
      </Tabs>
      {/* @ts-expect-error label is required */}
      <Tabs>x</Tabs>
      {/* @ts-expect-error the component owns click handling */}
      <Tab value="a" onClick={() => undefined}>
        a
      </Tab>
      {/* @ts-expect-error the component owns the role */}
      <Tab value="a" role="link">
        a
      </Tab>
      {/* @ts-expect-error no count: filter rows belong to their modules */}
      <Tab value="a" count={3}>
        a
      </Tab>
      {/* @ts-expect-error unknown icon */}
      <Tab value="a" icon="not-an-icon">
        a
      </Tab>
    </>
  );
}

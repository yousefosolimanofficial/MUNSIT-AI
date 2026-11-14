// @vitest-environment jsdom
import { createRef } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BUTTON_VARIANTS, Button } from "./Button";

/*
 * Button component tests — contract docs/phases/phase-03-button-contract.md §11.
 *
 * jsdom does not apply Tailwind CSS or compute colors, so styles are checked as class names.
 * Computed styles and rendered contrast are checked in Chromium at integration (§11), and label
 * contrast from token values in src/design-system/contrast.test.ts. axe's color-contrast rule is
 * disabled here for the same reason.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };
const HOVER = "[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:not-active:";

afterEach(cleanup);

function classesOf(element: HTMLElement): string[] {
  return element.className.split(/\s+/).filter(Boolean);
}

describe("Button — native element and type (§11.1)", () => {
  it('renders a native <button> with type="button" by default', () => {
    render(<Button>متابعة</Button>);
    const button = screen.getByRole("button", { name: "متابعة" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
  });

  it('passes type="submit" through', () => {
    render(<Button type="submit">إرسال</Button>);
    expect(screen.getByRole("button", { name: "إرسال" }).getAttribute("type")).toBe("submit");
  });

  it("does not submit a surrounding form by default", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Button>متابعة</Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "متابعة" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("adds no dir attribute (direction follows the document)", () => {
    render(<Button>متابعة</Button>);
    expect(screen.getByRole("button").hasAttribute("dir")).toBe(false);
  });
});

describe("Button — base classes shared by both variants (§2, §3, §8)", () => {
  it.each(BUTTON_VARIANTS)("%s: size, spacing, radius, type, layout", (variant) => {
    render(<Button variant={variant}>متابعة</Button>);
    const classes = classesOf(screen.getByRole("button"));
    for (const expected of [
      "inline-flex",
      "items-center",
      "justify-center",
      "h-[44px]",
      "px-lg",
      "rounded-md",
      "text-dashboard-button",
      "whitespace-nowrap",
    ]) {
      expect(classes).toContain(expected);
    }
  });

  it.each(BUTTON_VARIANTS)(
    "%s: transitions only color, border and shadow with motion tokens; no transform",
    (variant) => {
      render(<Button variant={variant}>متابعة</Button>);
      const classes = classesOf(screen.getByRole("button"));
      expect(classes).toContain("transition-[background-color,border-color,color,box-shadow]");
      expect(classes).toContain("duration-base");
      expect(classes).toContain("ease-standard");
      expect(classes).toContain("enabled:active:duration-fast");
      expect(classes.some((c) => /(^|:)(scale|translate|rotate|transform)/.test(c))).toBe(false);
    },
  );

  it.each(BUTTON_VARIANTS)("%s: uses logical spacing only (no left/right)", (variant) => {
    render(<Button variant={variant}>متابعة</Button>);
    const classes = classesOf(screen.getByRole("button"));
    expect(classes.some((c) => /(^|:)-?(pl|pr|ml|mr|left|right)-/.test(c))).toBe(false);
  });
});

describe("Button — variants (§11.2, §4)", () => {
  it("defaults to primary", () => {
    render(<Button>متابعة</Button>);
    const classes = classesOf(screen.getByRole("button"));
    expect(classes).toContain("bg-accent-electric-sky");
    expect(classes).toContain("text-surface-void-black");
  });

  it("primary: default, hover (fine pointer only), pressed and disabled colors", () => {
    render(<Button variant="primary">متابعة</Button>);
    const classes = classesOf(screen.getByRole("button"));
    expect(classes).toEqual(
      expect.arrayContaining([
        "bg-accent-electric-sky",
        "text-surface-void-black",
        `${HOVER}bg-accent-info-blue`,
        `${HOVER}shadow-[0_4px_9px_rgba(99,161,255,0.35)]`,
        "enabled:active:bg-accent-electric-sky/78",
        "disabled:bg-neutral-slate",
        "disabled:text-text-muted",
      ]),
    );
    // Primary has no border.
    expect(classes).not.toContain("border");
  });

  it("secondary: default, hover (fine pointer only), pressed 20% and disabled colors", () => {
    render(<Button variant="secondary">متابعة</Button>);
    const classes = classesOf(screen.getByRole("button"));
    expect(classes).toEqual(
      expect.arrayContaining([
        "border",
        "bg-accent-electric-sky/8",
        "border-accent-electric-sky/30",
        "text-accent-electric-sky",
        `${HOVER}bg-accent-electric-sky/16`,
        `${HOVER}border-accent-electric-sky/55`,
        "enabled:active:bg-accent-electric-sky/20",
        "enabled:active:border-accent-electric-sky/55",
        "disabled:bg-transparent",
        "disabled:border-accent-electric-sky/20",
        "disabled:text-text-muted",
      ]),
    );
    // D-B6: Pressed is 20%, never Figma's 24%. Secondary has no hover shadow.
    expect(classes.some((c) => c.includes("/24"))).toBe(false);
    expect(classes.some((c) => c.includes("shadow-"))).toBe(false);
  });

  it.each(BUTTON_VARIANTS)(
    "%s: hover only under (hover: hover) and (pointer: fine); hover and pressed only when enabled",
    (variant) => {
      render(<Button variant={variant}>متابعة</Button>);
      const classes = classesOf(screen.getByRole("button"));
      const hover = classes.filter((c) => c.includes("hover:"));
      const pressed = classes.filter((c) => c.includes("active:"));
      expect(hover.length).toBeGreaterThan(0);
      expect(hover.every((c) => c.startsWith(HOVER))).toBe(true);
      expect(pressed.every((c) => c.includes("enabled:"))).toBe(true);
    },
  );

  it.each(BUTTON_VARIANTS)("%s: no literal hex colors", (variant) => {
    render(<Button variant={variant}>متابعة</Button>);
    expect(screen.getByRole("button").className).not.toMatch(/#[0-9a-f]{3,8}/i);
  });
});

describe("Button — accessible name (§11.3)", () => {
  it.each([
    ["ar", "متابعة"],
    ["en", "Continue"],
  ])("the visible label is the accessible name (%s)", (_locale, label) => {
    render(<Button>{label}</Button>);
    expect(screen.getByRole("button", { name: label })).toBeTruthy();
  });
});

describe("Button — activation (§11.4)", () => {
  it("click calls onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>متابعة</Button>);
    await user.click(screen.getByRole("button", { name: "متابعة" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keyboard only: Tab focuses, Enter and Space activate", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>متابعة</Button>);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "متابعة" }));
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe("Button — disabled (§11.5)", () => {
  it.each(BUTTON_VARIANTS)(
    "%s: sets disabled, ignores click and keyboard, is not focusable",
    async (variant) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button variant={variant} disabled onClick={onClick}>
          متابعة
        </Button>,
      );
      const button = screen.getByRole("button", { name: "متابعة" });
      expect(button.hasAttribute("disabled")).toBe(true);
      expect(button.hasAttribute("aria-disabled")).toBe(false);

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();

      await user.tab();
      expect(document.activeElement).not.toBe(button);
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  it("Tab skips a disabled button and reaches the next enabled one", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button disabled>معطل</Button>
        <Button variant="secondary">متابعة</Button>
      </>,
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "متابعة" }));
  });
});

describe("Button — focus (§11.6, D-B2)", () => {
  it.each(BUTTON_VARIANTS)(
    "%s: Tab reaches the button and the :focus-visible ring classes are present",
    async (variant) => {
      const user = userEvent.setup();
      render(<Button variant={variant}>متابعة</Button>);
      await user.tab();
      const button = screen.getByRole("button", { name: "متابعة" });
      expect(document.activeElement).toBe(button);
      expect(classesOf(button)).toEqual(
        expect.arrayContaining([
          "focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-solid",
          "focus-visible:outline-accent-electric-sky",
        ]),
      );
      // The ring is keyboard-only: no plain `focus:` styles.
      expect(classesOf(button).some((c) => c.startsWith("focus:"))).toBe(false);
    },
  );
});

describe("Button — className merge (§11.7)", () => {
  it("appends className after the component classes and keeps the base classes", () => {
    render(
      <Button variant="secondary" className="w-full ms-md">
        متابعة
      </Button>,
    );
    const classes = classesOf(screen.getByRole("button"));
    expect(classes).toEqual(
      expect.arrayContaining(["h-[44px]", "px-lg", "rounded-md", "text-dashboard-button"]),
    );
    expect(classes.slice(-2)).toEqual(["w-full", "ms-md"]);
  });
});

describe("Button — native attributes and ref (§11.8)", () => {
  it("passes aria-*, data-*, form, name, value and id through", () => {
    render(
      <>
        <form id="f1" />
        <p id="hint">تلميح</p>
        <Button
          id="b1"
          aria-describedby="hint"
          data-testid="cta"
          form="f1"
          name="action"
          value="next"
        >
          متابعة
        </Button>
      </>,
    );
    const button = screen.getByTestId("cta");
    expect(button.id).toBe("b1");
    expect(button.getAttribute("aria-describedby")).toBe("hint");
    expect(button.getAttribute("form")).toBe("f1");
    expect(button.getAttribute("name")).toBe("action");
    expect(button.getAttribute("value")).toBe("next");
    expect(screen.getByRole("button", { description: "تلميح" })).toBe(button);
  });

  it("forwards ref to the native <button>", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>متابعة</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByRole("button", { name: "متابعة" }));
  });
});

describe("Button — axe (§11.9)", () => {
  const cases = BUTTON_VARIANTS.flatMap((variant) =>
    [false, true].flatMap((disabled) =>
      (
        [
          ["rtl", "ar", "متابعة"],
          ["ltr", "en", "Continue"],
        ] as const
      ).map(([dir, lang, label]) => ({ variant, disabled, dir, lang, label })),
    ),
  );

  it.each(cases)(
    "$variant, disabled=$disabled, dir=$dir: no violations",
    async ({ variant, disabled, dir, lang, label }) => {
      const { container } = render(
        <div dir={dir} lang={lang}>
          <Button variant={variant} disabled={disabled}>
            {label}
          </Button>
        </div>,
      );
      expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
    },
  );
});

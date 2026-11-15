// @vitest-environment jsdom
import { createRef, useState } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Input } from "./Input";

/*
 * Input component tests — contract docs/phases/phase-03-input-contract.md §11.
 *
 * jsdom does not apply Tailwind CSS or compute colors, so styles are checked as class names.
 * Computed size, colors and rendered contrast are checked in Chromium at integration (§11), and
 * token contrast in src/design-system/contrast.test.ts. axe's color-contrast rule is disabled
 * here for the same reason.
 */

const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

const LABEL_AR = "الاسم الكامل";
const LABEL_EN = "Full name";
const MESSAGE_AR = "اكتب اسمك الكامل.";

afterEach(cleanup);

function classesOf(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/** Every class used by the component: wrapper, label, field, message and icon. */
function allClasses(container: HTMLElement): string[] {
  return [...container.querySelectorAll("[class]")].flatMap(classesOf);
}

function wrapperOf(input: HTMLElement): HTMLElement {
  const wrapper = input.parentElement;
  if (!wrapper) throw new Error("Input has no wrapper");
  return wrapper;
}

describe("Input — native element and type (§11.1)", () => {
  it('renders a native <input> with type="text" by default', () => {
    render(<Input label={LABEL_AR} />);
    const input = screen.getByRole("textbox", { name: LABEL_AR });
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("type")).toBe("text");
  });

  it.each(["email", "tel", "url", "number"] as const)("passes type=%s through", (type) => {
    render(<Input label={LABEL_EN} type={type} />);
    expect(screen.getByLabelText(LABEL_EN).getAttribute("type")).toBe(type);
  });

  it("adds no dir attribute (direction follows the document)", () => {
    const { container } = render(<Input label={LABEL_AR} error={MESSAGE_AR} />);
    expect(container.querySelector("[dir]")).toBeNull();
  });
});

describe("Input — label (§11.2)", () => {
  it.each([
    ["ar", LABEL_AR],
    ["en", LABEL_EN],
  ])("the visible label is linked and is the accessible name (%s)", (_locale, label) => {
    render(<Input label={label} />);
    const input = screen.getByLabelText(label);
    expect(input.tagName).toBe("INPUT");
    expect(screen.getByRole("textbox", { name: label })).toBe(input);
    const labelElement = screen.getByText(label);
    expect(labelElement.tagName).toBe("LABEL");
    expect(labelElement.getAttribute("for")).toBe(input.id);
  });

  it("respects a caller id", () => {
    render(<Input id="full-name" label={LABEL_AR} />);
    expect(screen.getByLabelText(LABEL_AR).id).toBe("full-name");
    expect(screen.getByText(LABEL_AR).getAttribute("for")).toBe("full-name");
  });

  it("gives two inputs without ids unique ids", () => {
    render(
      <>
        <Input label={LABEL_AR} />
        <Input label={LABEL_EN} />
      </>,
    );
    const first = screen.getByLabelText(LABEL_AR);
    const second = screen.getByLabelText(LABEL_EN);
    expect(first.id).not.toBe("");
    expect(second.id).not.toBe("");
    expect(first.id).not.toBe(second.id);
  });
});

describe("Input — error (§11.3)", () => {
  it("renders the message with the alert icon, aria-invalid and aria-describedby", () => {
    render(<Input label={LABEL_AR} error={MESSAGE_AR} />);
    const input = screen.getByLabelText(LABEL_AR);
    const message = screen.getByText(MESSAGE_AR).closest("p");
    expect(message).not.toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(message?.id);
    expect(screen.getByRole("textbox", { description: MESSAGE_AR })).toBe(input);

    const icon = message?.querySelector("svg");
    expect(icon?.getAttribute("data-icon")).toBe("alert");
    expect(icon?.getAttribute("width")).toBe("14");
    expect(icon?.getAttribute("height")).toBe("14");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    // The icon is the first child: inline start of the message (right in RTL), never mirrored.
    expect(message?.firstElementChild).toBe(icon);
    expect(classesOf(icon as SVGElement).some((c) => c.includes("scale"))).toBe(false);
  });

  it("appends the message id to a caller aria-describedby", () => {
    render(
      <>
        <p id="hint">تلميح</p>
        <Input label={LABEL_AR} error={MESSAGE_AR} aria-describedby="hint" />
      </>,
    );
    const input = screen.getByLabelText(LABEL_AR);
    const messageId = screen.getByText(MESSAGE_AR).closest("p")?.id;
    expect(input.getAttribute("aria-describedby")).toBe(`hint ${messageId}`);
  });

  it("without an error: no aria-invalid, no aria-describedby and no message", () => {
    const { container } = render(<Input label={LABEL_AR} />);
    const input = screen.getByLabelText(LABEL_AR);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(container.querySelector("p")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("without an error: keeps a caller aria-describedby unchanged", () => {
    render(
      <>
        <p id="hint">تلميح</p>
        <Input label={LABEL_AR} aria-describedby="hint" />
      </>,
    );
    expect(screen.getByLabelText(LABEL_AR).getAttribute("aria-describedby")).toBe("hint");
  });

  it.each(["", "   "])("an empty error (%j) is not an error", (error) => {
    const { container } = render(<Input label={LABEL_AR} error={error} />);
    const input = screen.getByLabelText(LABEL_AR);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(container.querySelector("p")).toBeNull();
  });
});

describe("Input — size, typography and layout (§2, §3, §8)", () => {
  it("field: 46 high, full width, padding-inline 14, radius MD, 1px border, Ink fill, body text", () => {
    render(<Input label={LABEL_AR} />);
    const classes = classesOf(screen.getByLabelText(LABEL_AR));
    for (const expected of [
      "w-full",
      "h-[46px]",
      "px-[14px]",
      "rounded-md",
      "border",
      "bg-surface-ink",
      "text-dashboard-body",
      "text-text-primary",
    ]) {
      expect(classes).toContain(expected);
    }
  });

  it("label: Dashboard/Caption in Text / Secondary", () => {
    render(<Input label={LABEL_AR} />);
    expect(classesOf(screen.getByText(LABEL_AR))).toEqual(
      expect.arrayContaining(["text-dashboard-caption", "text-text-secondary"]),
    );
  });

  it("wrapper: label / field / message stacked with gap 6", () => {
    render(<Input label={LABEL_AR} />);
    expect(classesOf(wrapperOf(screen.getByLabelText(LABEL_AR)))).toEqual(
      expect.arrayContaining(["flex", "flex-col", "gap-[6px]"]),
    );
  });

  it("message: icon + gap 6 + Dashboard/Caption in Coral Pulse", () => {
    render(<Input label={LABEL_AR} error={MESSAGE_AR} />);
    const message = screen.getByText(MESSAGE_AR).closest("p");
    expect(classesOf(message as HTMLElement)).toEqual(
      expect.arrayContaining([
        "flex",
        "items-center",
        "gap-[6px]",
        "text-dashboard-caption",
        "text-accent-coral-pulse",
      ]),
    );
  });

  it("transitions only border and shadow with motion tokens; no transform", () => {
    const { container } = render(<Input label={LABEL_AR} error={MESSAGE_AR} />);
    const classes = classesOf(screen.getByLabelText(LABEL_AR));
    expect(classes).toContain("transition-[border-color,box-shadow]");
    expect(classes).toContain("duration-base");
    expect(classes).toContain("ease-standard");
    expect(
      allClasses(container).some((c) => /(^|:)-?(scale|translate|rotate|transform)/.test(c)),
    ).toBe(false);
  });
});

describe("Input — classes per state (§11.4, §4)", () => {
  it("default: Text / Muted border (D-I3), never Sky 14% at rest", () => {
    render(<Input label={LABEL_AR} />);
    const classes = classesOf(screen.getByLabelText(LABEL_AR));
    expect(classes).toContain("border-text-muted");
    // Sky 14% is only the disabled border, never the resting one.
    expect(classes).not.toContain("border-accent-electric-sky/14");
    expect(classes.filter((c) => c.endsWith("border-accent-electric-sky/14"))).toEqual([
      "disabled:border-accent-electric-sky/14",
    ]);
  });

  it("focused: :focus-visible border Electric Sky 70% plus the glow (D-I2)", () => {
    render(<Input label={LABEL_AR} />);
    expect(classesOf(screen.getByLabelText(LABEL_AR))).toEqual(
      expect.arrayContaining([
        "focus-visible:border-accent-electric-sky/70",
        "focus-visible:shadow-[0_0_6px_2px_rgba(99,161,255,0.25)]",
        "focus-visible:outline-hidden",
      ]),
    );
  });

  it("error: Coral Pulse 70% border, also while focused, with the same glow", () => {
    render(<Input label={LABEL_AR} error={MESSAGE_AR} />);
    const classes = classesOf(screen.getByLabelText(LABEL_AR));
    expect(classes).toEqual(
      expect.arrayContaining([
        "border-accent-coral-pulse/70",
        "focus-visible:border-accent-coral-pulse/70",
        "focus-visible:shadow-[0_0_6px_2px_rgba(99,161,255,0.25)]",
      ]),
    );
    expect(classes).not.toContain("border-text-muted");
    expect(classes).not.toContain("focus-visible:border-accent-electric-sky/70");
  });

  it("disabled: Sky 14% border and the whole block at 60% opacity", () => {
    render(<Input label={LABEL_AR} disabled />);
    const input = screen.getByLabelText(LABEL_AR);
    expect(classesOf(input)).toContain("disabled:border-accent-electric-sky/14");
    expect(classesOf(wrapperOf(input))).toContain("has-disabled:opacity-60");
  });

  it("placeholder: Text / Muted Readable token (D-I4)", () => {
    render(<Input label={LABEL_AR} placeholder="مثال" />);
    expect(classesOf(screen.getByLabelText(LABEL_AR))).toContain(
      "placeholder:text-text-muted-readable",
    );
  });

  it.each([
    ["default", {}],
    ["error", { error: MESSAGE_AR }],
    ["disabled", { disabled: true }],
  ] as const)("%s: no hex, no left/right, no hover and no plain focus: styles", (_state, props) => {
    const { container } = render(<Input label={LABEL_AR} {...props} />);
    const classes = allClasses(container);
    expect(classes.join(" ")).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(classes.some((c) => /(^|:)-?(pl|pr|ml|mr|left|right)-/.test(c))).toBe(false);
    expect(
      classes.some((c) => /(^|:)(text-(left|right)|rounded-[lr]|border-[lr])($|-)/.test(c)),
    ).toBe(false);
    expect(classes.some((c) => c.includes("hover:"))).toBe(false);
    expect(classes.some((c) => /(^|:)focus:/.test(c))).toBe(false);
  });
});

describe("Input — typing (§11.5)", () => {
  it("typing updates an uncontrolled input", async () => {
    const user = userEvent.setup();
    render(<Input label={LABEL_AR} defaultValue="" />);
    const input = screen.getByLabelText(LABEL_AR) as HTMLInputElement;
    await user.type(input, "مريم");
    expect(input.value).toBe("مريم");
  });

  it("a controlled input calls onChange and shows the parent value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <Input
          label={LABEL_EN}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setValue(event.target.value);
          }}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByLabelText(LABEL_EN) as HTMLInputElement;
    await user.type(input, "Ali");
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith("Ali");
    expect(input.value).toBe("Ali");
  });

  it("Tab reaches the input", async () => {
    const user = userEvent.setup();
    render(<Input label={LABEL_AR} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText(LABEL_AR));
  });
});

describe("Input — disabled (§11.6)", () => {
  it("sets the native attribute, is skipped by Tab and ignores typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Input label={LABEL_AR} disabled defaultValue="قيمة" onChange={onChange} />
        <Input label={LABEL_EN} />
      </>,
    );
    const disabled = screen.getByLabelText(LABEL_AR) as HTMLInputElement;
    expect(disabled.hasAttribute("disabled")).toBe(true);
    expect(disabled.hasAttribute("aria-disabled")).toBe(false);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText(LABEL_EN));

    await user.type(disabled, "abc");
    expect(disabled.value).toBe("قيمة");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is not submitted with its form", () => {
    render(
      <form data-testid="form">
        <Input label={LABEL_AR} name="fullName" defaultValue="قيمة" disabled />
      </form>,
    );
    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(new FormData(form).has("fullName")).toBe(false);
  });
});

describe("Input — native attributes and ref (§11.7)", () => {
  it("passes name, autoComplete, required, maxLength, placeholder, inputMode, dir and data-* through", () => {
    render(
      <Input
        label="البريد الإلكتروني"
        type="email"
        name="email"
        autoComplete="email"
        required
        maxLength={80}
        placeholder="name@example.com"
        inputMode="email"
        dir="ltr"
        data-testid="email"
      />,
    );
    const input = screen.getByTestId("email");
    expect(input.getAttribute("name")).toBe("email");
    expect(input.getAttribute("autocomplete")).toBe("email");
    expect(input.hasAttribute("required")).toBe(true);
    expect(input.getAttribute("maxlength")).toBe("80");
    expect(input.getAttribute("placeholder")).toBe("name@example.com");
    expect(input.getAttribute("inputmode")).toBe("email");
    expect(input.getAttribute("dir")).toBe("ltr");
    // `dir` goes to the field only; label and wrapper keep the document direction.
    expect(wrapperOf(input).hasAttribute("dir")).toBe(false);
  });

  it("forwards ref to the native <input>", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} label={LABEL_AR} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByLabelText(LABEL_AR));
  });
});

describe("Input — className (§11.8)", () => {
  it("goes on the wrapper, merged last, never on the field", () => {
    render(<Input label={LABEL_AR} className="w-80 mt-md" />);
    const input = screen.getByLabelText(LABEL_AR);
    const wrapperClasses = classesOf(wrapperOf(input));
    expect(wrapperClasses).toEqual(expect.arrayContaining(["flex", "flex-col", "gap-[6px]"]));
    expect(wrapperClasses.slice(-2)).toEqual(["w-80", "mt-md"]);
    expect(classesOf(input)).not.toContain("w-80");
    expect(classesOf(input)).not.toContain("mt-md");
  });
});

describe("Input — no validation of its own (§11.9)", () => {
  it("never sets an error on blur, even when required and empty", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Input label={LABEL_AR} required />
        <Input label={LABEL_EN} />
      </>,
    );
    const input = screen.getByLabelText(LABEL_AR);
    await user.click(input);
    await user.tab();
    expect(document.activeElement).not.toBe(input);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(classesOf(input)).toContain("border-text-muted");
    expect(container.querySelector("p")).toBeNull();
  });

  it("shows only the error the parent gives, and clears it when the parent does", () => {
    const { rerender } = render(<Input label={LABEL_AR} error={MESSAGE_AR} />);
    expect(screen.getByText(MESSAGE_AR)).toBeTruthy();
    rerender(<Input label={LABEL_AR} />);
    expect(screen.queryByText(MESSAGE_AR)).toBeNull();
    expect(screen.getByLabelText(LABEL_AR).hasAttribute("aria-invalid")).toBe(false);
  });
});

describe("Input — axe (§11.10)", () => {
  const states = [
    ["default", {}],
    ["error", { error: "error" }],
    ["disabled", { disabled: true }],
  ] as const;
  const directions = [
    ["rtl", "ar", LABEL_AR, MESSAGE_AR],
    ["ltr", "en", LABEL_EN, "Enter your full name."],
  ] as const;
  const cases = states.flatMap(([state, props]) =>
    directions.map(([dir, lang, label, message]) => ({ state, props, dir, lang, label, message })),
  );

  it.each(cases)(
    "$state, dir=$dir: no violations",
    async ({ props, dir, lang, label, message }) => {
      const { container } = render(
        <div dir={dir} lang={lang}>
          <Input label={label} {...props} {...("error" in props ? { error: message } : {})} />
        </div>,
      );
      expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
    },
  );
});

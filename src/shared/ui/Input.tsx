import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";

import { Icon } from "./Icon";

/*
 * MUNSIT AI — Input (Phase 03). Contract: docs/phases/phase-03-input-contract.md.
 * Figma: component set `Settings / Profile Input` 2461:591 — State
 * (Default | Focused | Error | Disabled).
 *
 * - Server Component: no state or effects, so no "use client". `useId` is allowed.
 * - Focused is an interaction state (`:focus-visible`), Error is the `error` prop, Disabled is the
 *   native `disabled` attribute. Nothing here is a prop copy of a state.
 * - Validation belongs to the parent form. Input only renders the `error` it is given and never
 *   sets or clears it on its own (contract §5).
 * - Colors come only from tokens and opacity modifiers. No literal hex values.
 * - Logical utilities only, no `dir`: label, value and message follow the document direction.
 *   Callers pass `dir="ltr"` for email, URL and code fields (contract §6).
 * - V1 is the in-app text field only: no Password Input, no Search Input, no hover (D-I1).
 *
 * Tailwind reads class names from source text, so every class below is written in full
 * (never built from pieces at runtime).
 */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children"> {
  /** Visible label (Figma `Label`). Required: it is also the accessible name. */
  label: ReactNode;
  /** Inline error (Figma `Message`). Non-empty → Error state, aria-invalid, aria-describedby. */
  error?: string;
  /** Forwarded to the native `<input>` (React 19 passes `ref` as a prop). */
  ref?: Ref<HTMLInputElement>;
  /** Layout only, on the outer wrapper (margin, width). Never colors, size or typography. */
  className?: string;
}

/** Component size, not a token (contract §2): fixed height 46. */
const INPUT_HEIGHT = "h-[46px]";

/** Component padding, not a token (contract §2): 14 at the inline start and end. */
const INPUT_PADDING_INLINE = "px-[14px]";

/** Component gap, not a token (contract §2): label / field / message, and icon / message text. */
const INPUT_GAP = "gap-[6px]";

/**
 * Focus glow, D-I2 (Input only): `0 0 6px 2px rgba(99,161,255,0.25)`, which is Electric Sky at
 * 25%. Keyboard focus only (`:focus-visible`); text fields also match it on mouse focus.
 */
const INPUT_FOCUS_GLOW = "focus-visible:shadow-[0_0_6px_2px_rgba(99,161,255,0.25)]";

/**
 * Wrapper (contract §2, §4): label, field and message stacked with gap 6. Disabled dims the whole
 * block (label, field, value) to 60%. `has-disabled:` also covers an input disabled by a
 * surrounding `<fieldset disabled>`.
 */
const WRAPPER_CLASSES = ["flex flex-col", INPUT_GAP, "has-disabled:opacity-60"].join(" ");

/** Label: Dashboard/Caption, Text / Secondary (contract §3). */
const LABEL_CLASSES = "text-dashboard-caption text-text-secondary";

/**
 * Field, shared by every state (contract §2, §3, §8):
 * 46 high, fills its container, padding-inline 14, radius 12 (Radius MD), 1px border inside
 * (border-box keeps 46), Surface / Ink fill, Dashboard/Body value in Text / Primary, placeholder
 * Text / Muted Readable (D-I4). The browser outline is replaced by the border + glow of D-I2
 * (`outline-hidden` keeps a transparent outline for forced-colors mode). Transitions border and
 * shadow only, with the motion tokens. No transform.
 */
const FIELD_BASE_CLASSES = [
  "block w-full min-w-0",
  INPUT_HEIGHT,
  INPUT_PADDING_INLINE,
  "rounded-md border",
  "bg-surface-ink",
  "text-dashboard-body text-text-primary text-start",
  "placeholder:text-text-muted-readable",
  "focus-visible:outline-hidden",
  INPUT_FOCUS_GLOW,
  "transition-[border-color,box-shadow] duration-base ease-standard",
  // Disabled: Figma Sky 14% border (disabled controls are exempt from contrast); never focused.
  "disabled:border-accent-electric-sky/14",
].join(" ");

/*
 * Border per state (contract §4).
 * - Default: Text / Muted (D-I3 Option B, approved accessibility deviation from Figma Sky 14%).
 *   Focused: Electric Sky 70% + glow.
 * - Error: Coral Pulse 70%, also while focused (not designed; keeps the error visible) + glow.
 */
const FIELD_STATE_CLASSES = {
  default: "border-text-muted focus-visible:border-accent-electric-sky/70",
  error: "border-accent-coral-pulse/70 focus-visible:border-accent-coral-pulse/70",
} as const;

/** Message row: alert icon 14 + gap 6 + text, Dashboard/Caption in Coral Pulse (contract §2, §3). */
const MESSAGE_CLASSES = [
  "flex items-center",
  INPUT_GAP,
  "text-dashboard-caption text-accent-coral-pulse",
].join(" ");

export function Input({
  label,
  error,
  id,
  type = "text",
  className,
  ref,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  // Error state only for a non-empty message (a whitespace-only string would show nothing).
  const hasError = error !== undefined && error.trim() !== "";

  const describedBy = hasError
    ? [ariaDescribedBy, messageId].filter(Boolean).join(" ")
    : ariaDescribedBy;

  const wrapperClasses = [WRAPPER_CLASSES, className].filter(Boolean).join(" ");
  const fieldClasses = [
    FIELD_BASE_CLASSES,
    hasError ? FIELD_STATE_CLASSES.error : FIELD_STATE_CLASSES.default,
  ].join(" ");

  return (
    <div className={wrapperClasses}>
      <label htmlFor={inputId} className={LABEL_CLASSES}>
        {label}
      </label>
      <input
        {...rest}
        ref={ref}
        id={inputId}
        type={type}
        className={fieldClasses}
        aria-describedby={describedBy}
        aria-invalid={hasError ? true : ariaInvalid}
      />
      {hasError ? (
        <p id={messageId} className={MESSAGE_CLASSES}>
          {/* Decorative: the text carries the meaning. `alert` does not mirror. */}
          <Icon name="alert" size={14} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

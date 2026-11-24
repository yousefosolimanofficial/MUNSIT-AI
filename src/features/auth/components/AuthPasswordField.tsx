"use client";

import { useId, type InputHTMLAttributes, type Ref } from "react";

import { AuthEyeIcon } from "./AuthEyeIcon";
import {
  FIELD_BOX,
  FIELD_DEFAULT,
  FIELD_DISABLED,
  FIELD_ERROR,
  FIELD_FOCUS,
  FIELD_INPUT,
  FIELD_INVALID,
  FOCUS_RING,
  LTR_VALUE_IN_RTL,
} from "./auth-styles";

/*
 * `Auth / Password Input` (Figma component set `191:50`): State Default, Focus, Error, Disabled ×
 * Visibility Hidden, Visible (8 variants). Visibility is controlled by the parent form (`visible`,
 * `onVisibleChange`). The toggle is a real button: keyboard operable, never submits the form,
 * named by `toggleLabel` with `aria-pressed` for the state. The value is never logged or stored
 * here.
 *
 * Layout from Figma: the eye sits at the inline end of the field (left in RTL), 20 × 20, Text
 * Secondary; the value is `dir="ltr"` and aligned to the page start.
 */

export interface AuthPasswordFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "type"
> {
  label: string;
  error?: string;
  /**
   * Rejected as a whole (Login Error): Coral Pulse 70% border and `aria-invalid`, no helper. The
   * message is elsewhere (pass its id in `aria-describedby`). `error` takes precedence.
   */
  invalid?: boolean;
  /** Whether the password is shown as text. */
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  /** Accessible name of the toggle, e.g. "إظهار كلمة المرور"; `aria-pressed` gives the state. */
  toggleLabel: string;
  ref?: Ref<HTMLInputElement>;
}

export function AuthPasswordField({
  label,
  error,
  invalid = false,
  visible,
  onVisibleChange,
  toggleLabel,
  id,
  disabled,
  className,
  ref,
  "aria-describedby": describedBy,
  ...inputProps
}: AuthPasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);
  const describedByIds = [describedBy, hasError ? errorId : undefined].filter(Boolean).join(" ");

  const state = disabled
    ? FIELD_DISABLED
    : hasError
      ? FIELD_ERROR
      : invalid
        ? FIELD_INVALID
        : FIELD_DEFAULT;

  return (
    <div
      data-auth-field=""
      className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}
    >
      <label htmlFor={inputId} className="text-auth-form-label text-text-primary text-start">
        {label}
      </label>
      <div className={`${FIELD_BOX} ${disabled ? "" : FIELD_FOCUS} ${state}`}>
        <input
          {...inputProps}
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          disabled={disabled}
          dir="ltr"
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={hasError || invalid || undefined}
          aria-describedby={describedByIds || undefined}
          className={`${FIELD_INPUT} ${LTR_VALUE_IN_RTL}`}
        />
        <button
          type="button"
          aria-label={toggleLabel}
          aria-pressed={visible}
          aria-controls={inputId}
          disabled={disabled}
          onClick={() => onVisibleChange(!visible)}
          className={`flex size-6 shrink-0 items-center justify-center rounded-sm text-text-secondary enabled:cursor-pointer enabled:hover:text-text-primary disabled:cursor-not-allowed ${FOCUS_RING}`}
        >
          <AuthEyeIcon slashed={visible} />
        </button>
      </div>
      {hasError ? (
        <p id={errorId} className="text-auth-form-helper text-accent-coral-pulse text-start">
          {error}
        </p>
      ) : null}
    </div>
  );
}

import { useId, type InputHTMLAttributes, type Ref } from "react";

import {
  FIELD_BOX,
  FIELD_DEFAULT,
  FIELD_DISABLED,
  FIELD_ERROR,
  FIELD_FOCUS,
  FIELD_INPUT,
  FIELD_INVALID,
  LTR_VALUE_IN_RTL,
} from "./auth-styles";

/*
 * `Auth / Input` (Figma component set `191:20`: Default `191:3`, Focus `191:7`, Error `191:11`,
 * Disabled `191:16`). Presentational: it renders the error it is given and never validates
 * (validation belongs to the form, plan §7). Focus is an interaction state (`:focus-within`), Error
 * is the `error` prop, Disabled is the native attribute.
 *
 * Label `Auth/Form/Label` Text Primary, gap 8; helper `Auth/Form/Helper` Coral Pulse.
 */

export interface AuthTextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children"
> {
  /** Visible label; it is also the accessible name. */
  label: string;
  /** Inline error. Non-empty → Error state, `aria-invalid`, `aria-describedby`. */
  error?: string;
  /**
   * Rejected as a whole (Login Error): Coral Pulse 70% border and `aria-invalid`, no helper. The
   * message is elsewhere (pass its id in `aria-describedby`). `error` takes precedence.
   */
  invalid?: boolean;
  /** The value reads left to right (email): `dir="ltr"`, aligned to the page start. */
  ltr?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function AuthTextField({
  label,
  error,
  invalid = false,
  ltr = false,
  id,
  disabled,
  className,
  ref,
  "aria-describedby": describedBy,
  ...inputProps
}: AuthTextFieldProps) {
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
          disabled={disabled}
          dir={ltr ? "ltr" : undefined}
          aria-invalid={hasError || invalid || undefined}
          aria-describedby={describedByIds || undefined}
          className={`${FIELD_INPUT} ${ltr ? LTR_VALUE_IN_RTL : "text-start"}`}
        />
      </div>
      {hasError ? (
        <p id={errorId} className="text-auth-form-helper text-accent-coral-pulse text-start">
          {error}
        </p>
      ) : null}
    </div>
  );
}

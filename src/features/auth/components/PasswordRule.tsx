import type { ReactNode } from "react";

import { Icon } from "@/shared/ui/Icon";

/*
 * `Auth / Validation Rule` (Figma component set `191:72`): State Neutral `191:63`, Valid `191:66`,
 * Error `191:69`. One row: a marker, gap 6, then the label in `Auth/Form/Helper` (Cairo 12 / 150 %).
 *
 * Colours (tokens only): Neutral label Muted Readable with a Muted marker; Valid Success Green;
 * Error Coral Pulse.
 *
 * State is never shown by colour alone (WCAG 1.4.1; owner, 2026-11-23):
 * - visually, the marker changes shape: Neutral keeps the Figma 6 × 6 dot, Valid shows `check` and
 *   Error shows `x` (official icons, 12 px). Recorded as a deviation (contract §16.2);
 * - for assistive technology, each row ends with a visually hidden status word (`statusLabel`,
 *   e.g. "متحقق" / "غير متحقق") and is `aria-atomic`, so a change is read as the whole row.
 *
 * The component holds no copy: labels and status words come from the caller.
 */

export type PasswordRuleState = "neutral" | "valid" | "error";

const STATE_CLASSES: Readonly<Record<PasswordRuleState, { label: string; marker: string }>> = {
  neutral: { label: "text-text-muted-readable", marker: "text-text-muted" },
  valid: { label: "text-accent-success-green", marker: "text-accent-success-green" },
  error: { label: "text-accent-coral-pulse", marker: "text-accent-coral-pulse" },
};

/** Marker box: the 12 px line-box of `Auth/Form/Helper` holds the 6 × 6 dot or a 12 px icon. */
const MARKER_BOX = "flex size-3 shrink-0 items-center justify-center";

export interface PasswordRuleProps {
  /** The rule text, e.g. "8 أحرف على الأقل" (may hold an `Ltr` run). */
  label: ReactNode;
  state: PasswordRuleState;
  /** Visually hidden status word read after the label, e.g. "متحقق" or "غير متحقق". */
  statusLabel: string;
}

/** One rule row. Renders an `li`: use it inside `PasswordRuleList` (or another `ul`). */
export function PasswordRule({ label, state, statusLabel }: PasswordRuleProps) {
  const colours = STATE_CLASSES[state];
  return (
    <li
      data-password-rule={state}
      aria-atomic="true"
      className={`flex items-center gap-1.5 text-auth-form-helper text-start ${colours.label}`}
    >
      <span aria-hidden="true" className={`${MARKER_BOX} ${colours.marker}`}>
        {state === "valid" ? (
          <Icon name="check" size={12} />
        ) : state === "error" ? (
          <Icon name="x" size={12} />
        ) : (
          <span data-password-rule-dot="" className="size-1.5 rounded-full bg-current" />
        )}
      </span>
      <span>{label}</span>
      <span className="sr-only">{` ${statusLabel}`}</span>
    </li>
  );
}

export interface PasswordRuleListProps {
  rules: readonly ({ id: string } & PasswordRuleProps)[];
  /** Id for the password field's `aria-describedby`. */
  id?: string;
  /**
   * Announce state changes politely while the user types (default true). Each row is atomic, so
   * only the rows that changed are read, with their label.
   */
  live?: boolean;
}

/** The rule list: one row per rule, in reading order, gap 16 and wrapping on narrow screens. */
export function PasswordRuleList({ rules, id, live = true }: PasswordRuleListProps) {
  return (
    <ul
      id={id}
      data-password-rules=""
      aria-live={live ? "polite" : undefined}
      className="flex flex-wrap gap-x-md gap-y-xs"
    >
      {rules.map(({ id: ruleId, ...rule }) => (
        <PasswordRule key={ruleId} {...rule} />
      ))}
    </ul>
  );
}

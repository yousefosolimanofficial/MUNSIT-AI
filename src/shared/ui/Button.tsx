import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

/*
 * MUNSIT AI — Button (Phase 03). Contract: docs/phases/phase-03-button-contract.md.
 * Figma: component set `Button` 2210:89 — Type (Primary | Secondary) × State
 * (Default | Hover | Pressed | Disabled).
 *
 * - Server Component: no state or effects, so no "use client".
 * - `variant` is Figma `Type`. Hover and Pressed are interaction states (`:hover`, `:active`),
 *   Disabled is the native `disabled` attribute. Nothing here is a prop copy of a state.
 * - Colors come only from tokens and opacity modifiers. No literal hex values.
 * - Symmetric padding, centered label, no `dir`: identical in RTL and LTR.
 * - v1 is label-only: no loading, no icons, no destructive variant (D-B3, D-B4, D-B5).
 *
 * Tailwind reads class names from source text, so every class below is written in full
 * (never built from pieces at runtime).
 */

export const BUTTON_VARIANTS = ["primary", "secondary"] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma `Type`. Default "primary". */
  variant?: ButtonVariant;
  /** Visible label (Figma `Label`). It is also the accessible name. */
  children: ReactNode;
  /** Forwarded to the native `<button>` (React 19 passes `ref` as a prop). */
  ref?: Ref<HTMLButtonElement>;
  /** Layout only (margin, width, alignment). Never colors, size or typography. */
  className?: string;
}

/** Component size, not a token (contract §2): fixed height 44. */
const BUTTON_HEIGHT = "h-[44px]";

/**
 * Primary hover shadow, D-B1 (Button only): `0 4px 9px rgba(99,161,255,0.35)`, which is
 * Electric Sky at 35%. Applied only under the fine-pointer hover media query.
 */
const PRIMARY_HOVER_SHADOW =
  "[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:not-active:shadow-[0_4px_9px_rgba(99,161,255,0.35)]";

/** Focus ring, D-B2: keyboard focus only, 2px solid Electric Sky, offset 2px. */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/**
 * Shared by both variants (contract §2, §3, §8):
 * 44 high, hugs the label, padding-inline 20 (Space LG), radius 12 (Radius MD),
 * Dashboard/Button text, single line. Transitions color, border and shadow only, with the
 * motion tokens; the pressed state uses the fast duration. No transform.
 */
const BASE_CLASSES = [
  "inline-flex items-center justify-center",
  BUTTON_HEIGHT,
  "px-lg rounded-md",
  "text-dashboard-button whitespace-nowrap",
  "transition-[background-color,border-color,color,box-shadow] duration-base ease-standard",
  "enabled:active:duration-fast",
  FOCUS_RING,
].join(" ");

/*
 * Colors per state (contract §4).
 * - Hover: only `(hover: hover) and (pointer: fine)`, only when enabled, and not while pressed
 *   (so Pressed always wins over Hover on desktop).
 * - Pressed: `:active`, only when enabled.
 * - Disabled: native `:disabled`; hover and pressed never match because they require `:enabled`.
 */
const VARIANT_CLASSES = {
  primary: [
    // Default: Electric Sky fill, Void Black label, no border.
    "bg-accent-electric-sky text-surface-void-black",
    // Hover: Info Blue fill + shadow.
    "[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:not-active:bg-accent-info-blue",
    PRIMARY_HOVER_SHADOW,
    // Pressed: Electric Sky 78%.
    "enabled:active:bg-accent-electric-sky/78",
    // Disabled: Slate fill, Muted label.
    "disabled:bg-neutral-slate disabled:text-text-muted",
  ].join(" "),
  secondary: [
    // Default: 1px border (inside, border-box keeps 44), Sky 8% fill, Sky 30% border, Sky label.
    "border bg-accent-electric-sky/8 border-accent-electric-sky/30 text-accent-electric-sky",
    // Hover: Sky 16% fill, Sky 55% border.
    "[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:not-active:bg-accent-electric-sky/16",
    "[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:not-active:border-accent-electric-sky/55",
    // Pressed: Sky 20% fill (approved exception D-B6; Figma 24%), Sky 55% border.
    "enabled:active:bg-accent-electric-sky/20 enabled:active:border-accent-electric-sky/55",
    // Disabled: no fill, Sky 20% border, Muted label (Figma; not Electric Sky).
    "disabled:bg-transparent disabled:border-accent-electric-sky/20 disabled:text-text-muted",
  ].join(" "),
} as const satisfies Record<ButtonVariant, string>;

export function Button({
  variant = "primary",
  type = "button",
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], className].filter(Boolean).join(" ");

  return (
    // `type` defaults to "button" so the button never submits a form by accident.
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

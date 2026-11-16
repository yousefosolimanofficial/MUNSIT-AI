import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

/*
 * MUNSIT AI — Card surfaces (Phase 03). Contract: docs/phases/phase-03-card-contract.md.
 * Figma: no Card component set; the surfaces are repeated frames (contract §1), e.g. Recent
 * Activity Card 2220:368, Recent Lectures Card 2482:1488, Recent Lecture Row 2482:1489.
 *
 * - Server Component: no state or effects, so no "use client".
 * - Static container (D-C4): no hover, focus, shadow, motion or interaction. Event handlers and
 *   the interactive attributes are rejected by the type.
 * - No internal layout: flex, grid and gap belong to the caller, through `className`.
 * - Colors come only from tokens and opacity modifiers. No literal hex values.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

/** Rendered elements (D-C5). */
type CardElement = "div" | "section" | "article" | "li";

/** Removes every React event handler (`onClick`, `onKeyDown`, `onPointerDown`, …). */
type WithoutEventHandlers<P> = { [K in keyof P as K extends `on${string}` ? never : K]: P[K] };

/** Attributes that would make the static Card focusable, editable or re-roled (D-C4). */
type InteractiveAttribute =
  "role" | "tabIndex" | "autoFocus" | "accessKey" | "contentEditable" | "draggable";

/**
 * Content-injection safety restriction, not an interaction rule: Card content comes only from
 * `children` (React-escaped). Raw HTML would bypass the sanitizing rule for rendered rich content
 * (CLAUDE.md, Security).
 */
type UnsafeContentAttribute = "dangerouslySetInnerHTML";

/** `padding` exists only on `surface`; `inset` has fixed padding. */
type CardVariantProps =
  { variant?: "surface"; padding?: "lg" | "md" } | { variant: "inset"; padding?: never };

export type CardProps<E extends CardElement = "div"> = CardVariantProps & {
  /** Rendered element (D-C5). Default "div". */
  as?: E;
  /** Layout only, merged last. Never color, radius, border or padding. */
  className?: string;
  children?: ReactNode;
} & Omit<
    WithoutEventHandlers<ComponentPropsWithRef<E>>,
    "as" | "className" | "children" | InteractiveAttribute | UnsafeContentAttribute
  >;

/** `surface` (contract §2): Obsidian 88% (D-C1), 1px Sky 14% (D-C2), radius 20. */
const SURFACE_CLASSES = "bg-surface-obsidian/88 border border-accent-electric-sky/14 rounded-xl";

/** `surface` padding (D-C3): 20 by default, 16 for the Recent Lectures Card. */
const SURFACE_PADDING: Record<"lg" | "md", string> = { lg: "p-lg", md: "p-md" };

/** `inset` (contract §2): White 3% (`text-primary` is the token white), 1px Sky 12%, local
 * radius 14 (not a token), fixed padding 12 block / 16 inline. */
const INSET_CLASSES =
  "bg-text-primary/3 border border-accent-electric-sky/12 rounded-[14px] py-sm px-md";

export function Card<E extends CardElement = "div">({
  as,
  variant,
  padding,
  className,
  ...rest
}: CardProps<E>): ReactNode {
  // The restricted `as` is checked by CardProps; here it is only an element tag.
  const Element: ElementType = as ?? "div";
  const surface =
    variant === "inset" ? INSET_CLASSES : `${SURFACE_CLASSES} ${SURFACE_PADDING[padding ?? "lg"]}`;
  const classes = [surface, className].filter(Boolean).join(" ");

  return <Element {...rest} className={classes} />;
}

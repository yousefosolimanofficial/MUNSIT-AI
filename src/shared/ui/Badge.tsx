import type { ComponentPropsWithRef, ReactNode } from "react";

/*
 * MUNSIT AI — Status Badge (Phase 03). Contract: docs/phases/phase-03-badge-contract.md.
 * Figma: component set `Status Badge` 2258:1026 — Status (Ready | Processing | Pending | Failed).
 *
 * - Server Component: no state or effects, so no "use client".
 * - Static label: no hover, focus, motion or interaction (event handlers, role and tabIndex are
 *   rejected by the type). The caller passes the localized label as children.
 * - Colors come only from tokens and opacity modifiers. No literal hex values.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

/** Figma `Status` variants (contract §1; Failed approved in D-BG1). */
export type StatusBadgeStatus = "ready" | "processing" | "pending" | "failed";

/** Removes every React event handler (`onClick`, `onKeyDown`, …): the badge is static. */
type WithoutEventHandlers<P> = { [K in keyof P as K extends `on${string}` ? never : K]: P[K] };

export type StatusBadgeProps = {
  /** Figma `Status` variant. */
  status: StatusBadgeStatus;
  /** Visible label, localized by the caller. */
  children: ReactNode;
  /** Layout only (margin, alignment), merged last. Never color, size or radius. */
  className?: string;
} & Omit<
  WithoutEventHandlers<ComponentPropsWithRef<"span">>,
  "className" | "children" | "role" | "tabIndex" | "dangerouslySetInnerHTML"
>;

/** Component padding, not a token (contract §2): 5 block, 10 inline. With the 1px border and the
 * 18px caption line height this gives the Figma height of 30. */
const BADGE_PADDING = "px-[10px] py-[5px]";

/** Component gap, not a token (contract §2): dot / label. */
const BADGE_GAP = "gap-[6px]";

/** Dot, not a token (contract §2): 6×6 in the label color. */
const DOT_CLASSES = "size-[6px] shrink-0 rounded-full bg-current";

const BASE_CLASSES = [
  "inline-flex items-center",
  BADGE_GAP,
  BADGE_PADDING,
  "rounded-sm border whitespace-nowrap",
  "text-dashboard-caption",
].join(" ");

/** Fill, border and text color per status (contract §2). */
const STATUS_CLASSES: Record<StatusBadgeStatus, string> = {
  ready: "bg-accent-success-green/12 border-accent-success-green/26 text-accent-success-green",
  processing: "bg-accent-electric-sky/12 border-accent-electric-sky/26 text-accent-electric-sky",
  pending: "bg-text-primary/6 border-text-primary/12 text-text-secondary",
  failed: "bg-accent-coral-pulse/12 border-accent-coral-pulse/26 text-accent-coral-pulse",
};

export function StatusBadge({ status, children, className, ...rest }: StatusBadgeProps) {
  const classes = [BASE_CLASSES, STATUS_CLASSES[status], className].filter(Boolean).join(" ");

  return (
    <span {...rest} className={classes}>
      {/* Decorative: the label carries the meaning. First child = inline start (right in RTL). */}
      <span aria-hidden="true" className={DOT_CLASSES} />
      <span>{children}</span>
    </span>
  );
}

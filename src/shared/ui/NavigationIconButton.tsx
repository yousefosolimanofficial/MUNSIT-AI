import type { ComponentProps, MouseEventHandler, Ref } from "react";

import type { IconName } from "@/design-system/icons/manifest";
import { Link } from "@/i18n/navigation";

import { Icon } from "./Icon";

/*
 * MUNSIT AI — Navigation Icon Button (O-8, Phase 05).
 * Contract: docs/phases/phase-05-navigation-icon-button-contract.md (Approved, D-NIB1–D-NIB6).
 * Figma: component set `Navigation Icon Button` 2210:134 — State = Default | Hover | Active.
 *
 * - A square, icon-only control: a locale-aware next-intl `<Link>` (navigation) or a
 *   `<button type="button">` (action), never both (discriminated union).
 * - `label` is the accessible name; the icon is decorative (`aria-hidden`). No tooltip (D-NIB6).
 * - Active = the current navigation destination only: links with `active` get the Active visual
 *   and `aria-current="page"`. Buttons never show a persistent Active state; open states are
 *   exposed with `aria-expanded` (D-NIB4).
 * - Hover only on fine pointers (`(hover: hover) and (pointer: fine)`, as Button, Menu, Tabs) and
 *   not while pressed. Pressed (`:active`) is transient feedback (D-NIB2, approved proposal).
 * - Disabled (D-NIB3): native `disabled` for buttons; a non-interactive `<span role="link">` with
 *   `aria-disabled` for links (anchors have no native disabled state).
 * - Motion: colour-state transitions with existing tokens only (D-NIB5).
 * - Server-safe (no state or effects); `onClick` comes from Client Component parents.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

export const NAVIGATION_ICON_BUTTON_SIZES = ["md", "lg"] as const;
export type NavigationIconButtonSize = (typeof NAVIGATION_ICON_BUTTON_SIZES)[number];

/** Typed, locale-aware href (next-intl `pathnames`, Phase 04). */
type LinkHref = ComponentProps<typeof Link>["href"];

/** `data-*` attributes pass through (tests, analytics hooks); nothing else does. */
type DataAttributes = { [key: `data-${string}`]: string | undefined };

interface CommonProps extends DataAttributes {
  /** Icon from the approved manifest. Decorative: the control is named by `label`. */
  icon: IconName;
  /** Accessible name (`aria-label`). Never visible. Required (D-NIB6). */
  label: string;
  /** `md` 40 / icon 20 (Figma component), `lg` 44 / icon 18 (Figma mobile frames). D-NIB1. */
  size?: NavigationIconButtonSize;
  /** Not activatable (D-NIB3). */
  disabled?: boolean;
  /** Layout only (margin, alignment). Never colours or size. */
  className?: string;
}

export interface NavigationIconButtonLinkProps extends CommonProps {
  /** Navigation target (typed next-intl pathname). Renders a locale-aware link. */
  href: LinkHref;
  /** Current destination: Active visual + `aria-current="page"` (links only, D-NIB4). */
  active?: boolean;
  ref?: Ref<HTMLAnchorElement>;
  onClick?: never;
}

export interface NavigationIconButtonActionProps extends CommonProps {
  /** Action handler. Renders `<button type="button">`. */
  onClick: MouseEventHandler<HTMLButtonElement>;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "menu" | "dialog" | "listbox" | "true";
  "aria-controls"?: string;
  /** Only for a true toggle. */
  "aria-pressed"?: boolean;
  ref?: Ref<HTMLButtonElement>;
  href?: never;
  active?: never;
}

export type NavigationIconButtonProps =
  NavigationIconButtonLinkProps | NavigationIconButtonActionProps;

/** Component sizes, not tokens (contract §5): box and icon per size. */
const SIZE_CLASSES: Record<NavigationIconButtonSize, string> = {
  md: "size-[40px]",
  lg: "size-[44px]",
};
const ICON_SIZE: Record<NavigationIconButtonSize, number> = { md: 20, lg: 18 };

/** Focus ring, D-B2 (identical to Button and Tabs). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/** Radius 12 (`rounded-md`), 1px border inside; colour-state transitions only (D-NIB5). */
const BASE_CLASSES = [
  "inline-flex shrink-0 items-center justify-center rounded-md border",
  "transition-colors duration-base ease-standard",
  FOCUS_RING,
].join(" ");

/** FIGMA Default: White 4% fill, 1px Sky 12% border, Text / Secondary icon. */
const DEFAULT_CLASSES = "bg-text-primary/4 border-accent-electric-sky/12 text-text-secondary";

/** FIGMA Hover: Sky 10% fill, Sky 30% border, white icon — fine pointers only, never while pressed. */
const HOVER_CLASSES = [
  "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:bg-accent-electric-sky/10",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:border-accent-electric-sky/30",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:text-text-primary",
].join(" ");

/** APPROVED PROPOSAL Pressed (D-NIB2): Sky 14% fill, Sky 30% border, white icon, 120 ms. */
const PRESSED_CLASSES = [
  "active:bg-accent-electric-sky/14 active:border-accent-electric-sky/30 active:text-text-primary",
  "active:duration-fast",
].join(" ");

/** FIGMA Active (current destination): Sky 18% fill, Sky 45% border, white icon. */
const ACTIVE_CLASSES = "bg-accent-electric-sky/18 border-accent-electric-sky/45 text-text-primary";

/** APPROVED PROPOSAL Disabled (D-NIB3): 50% opacity, no hover or pressed feedback. */
const DISABLED_CLASSES = "opacity-50 cursor-default";

function classesFor(
  size: NavigationIconButtonSize,
  state: "default" | "active" | "disabled",
  className: string | undefined,
): string {
  const stateClasses =
    state === "active"
      ? ACTIVE_CLASSES
      : state === "disabled"
        ? `${DEFAULT_CLASSES} ${DISABLED_CLASSES}`
        : `${DEFAULT_CLASSES} ${HOVER_CLASSES} ${PRESSED_CLASSES} cursor-pointer`;
  return [BASE_CLASSES, SIZE_CLASSES[size], stateClasses, className].filter(Boolean).join(" ");
}

function dataAttributes(props: object): DataAttributes {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith("data-")),
  ) as DataAttributes;
}

export function NavigationIconButton({ ref, ...props }: NavigationIconButtonProps) {
  const { icon, label, size = "md", disabled = false, className } = props;
  const glyph = <Icon name={icon} size={ICON_SIZE[size]} />;
  const data = dataAttributes(props);

  if ("href" in props && props.href !== undefined) {
    if (disabled) {
      // Anchors have no native disabled state: a non-interactive element announced as an
      // unavailable link — no href, not focusable, no handlers (D-NIB3).
      return (
        <span
          {...data}
          role="link"
          aria-disabled="true"
          aria-label={label}
          className={classesFor(size, "disabled", className)}
        >
          {glyph}
        </span>
      );
    }
    const active = props.active === true;
    return (
      <Link
        {...data}
        ref={ref as Ref<HTMLAnchorElement> | undefined}
        href={props.href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={classesFor(size, active ? "active" : "default", className)}
      >
        {glyph}
      </Link>
    );
  }

  const action = props as Omit<NavigationIconButtonActionProps, "ref">;
  return (
    <button
      {...data}
      ref={ref as Ref<HTMLButtonElement> | undefined}
      type="button"
      aria-label={label}
      aria-expanded={action["aria-expanded"]}
      aria-haspopup={action["aria-haspopup"]}
      aria-controls={action["aria-controls"]}
      aria-pressed={action["aria-pressed"]}
      disabled={disabled}
      onClick={action.onClick}
      className={classesFor(size, disabled ? "disabled" : "default", className)}
    >
      {glyph}
    </button>
  );
}

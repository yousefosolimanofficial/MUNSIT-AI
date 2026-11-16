import type { MouseEventHandler } from "react";

import { Link } from "@/i18n/navigation";
import { Icon } from "@/shared/ui/Icon";

import { UPGRADE_HREF } from "./shell-model";

/*
 * MUNSIT AI — Upgrade Plan Card (Phase 05). Figma: `Upgrade Plan Card` `2211:158` (Desktop
 * Sidebar) and `2242:1287` (Tablet drawer), pinned at the bottom of the Sidebar.
 *
 * - The action navigates to the subscription settings route (D-S7) through the locale-aware `Link`.
 *   No payment, checkout or subscription logic.
 * - The action has the Primary Button visual (Figma instance of `Button` 2210:89, 44 high) on a
 *   link: Button v1 is a `<button>` only (D-B4) and its states use `:enabled`, which never
 *   matches an `<a>`. The values below are the Primary values from the Button contract.
 * - Gradient Cobalt Edge 85% → Deep Space 95% (Figma, left → right in the RTL design), mirrored
 *   in LTR with the layout. Radius 18 is a local constant (not a token).
 * - Server-safe.
 */

export interface UpgradeCardProps {
  title: string;
  description: string;
  /** Visible label of the action link. */
  action: string;
  /** Called on activation (the drawer closes itself on a destination change). */
  onNavigate?: MouseEventHandler<HTMLAnchorElement>;
}

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/** 199 wide (fills), radius 18, padding 16, gap 10, 1px Sky 30%. */
const CARD = [
  "flex w-full flex-col gap-[10px] rounded-[18px] border border-accent-electric-sky/30 p-md",
  "from-accent-cobalt-edge/85 to-accent-deep-space/95 rtl:bg-linear-to-r ltr:bg-linear-to-l",
].join(" ");

/** Icon tile 32, radius 10, Sky 20%; `crown` 18 in Info Blue. Decorative. */
const TILE =
  "flex size-[32px] shrink-0 items-center justify-center rounded-[10px] bg-accent-electric-sky/20 text-accent-info-blue";

/** Primary Button values (Button contract §4) on a link: Default, Hover (fine pointer), Pressed. */
const ACTION = [
  "inline-flex h-[44px] w-full cursor-pointer items-center justify-center rounded-md px-lg",
  "text-dashboard-button whitespace-nowrap bg-accent-electric-sky text-surface-void-black",
  "transition-[background-color,box-shadow] duration-base ease-standard active:duration-fast",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:bg-accent-info-blue",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:shadow-[0_4px_9px_rgba(99,161,255,0.35)]",
  "active:bg-accent-electric-sky/78",
  FOCUS_RING,
].join(" ");

export function UpgradeCard({ title, description, action, onNavigate }: UpgradeCardProps) {
  return (
    <div data-testid="upgrade-card" className={CARD}>
      <div className="flex items-center gap-[10px]">
        <span aria-hidden="true" className={TILE}>
          <Icon name="crown" size={18} />
        </span>
        <p className="min-w-0 text-dashboard-card-title text-text-primary">{title}</p>
      </div>
      <p className="text-dashboard-caption text-text-secondary">{description}</p>
      <Link href={UPGRADE_HREF} onClick={onNavigate} className={ACTION}>
        {action}
      </Link>
    </div>
  );
}

"use client";

import type { IconName } from "@/design-system/icons/manifest";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";
import { MORE_SHEET_DESTINATIONS, MORE_SHEET_EXTRAS } from "@/shared/navigation/nav-registry";
import { useActiveDestination } from "@/shared/navigation/use-active-destination";
import { Icon } from "@/shared/ui/Icon";
import { Sheet } from "@/shared/ui/Sheet";

import { LanguageSwitch } from "./LanguageSwitch";
import { UPGRADE_HREF, type DestinationPath, type ShellLabels } from "./shell-model";

/*
 * MUNSIT AI — mobile More sheet (Phase 05, plan §10 and §11.3). Figma: `More Menu Sheet`
 * `2236:972`.
 *
 * - The Phase 03 `Sheet` (native modal dialog, D-SH3 is this sheet): title "المزيد", close
 *   button "إغلاق القائمة", grabber, focus trap, Esc / scrim / close, shared scroll lock, focus
 *   returns to the opener, slide-up motion (opacity only under reduced motion).
 * - Rows from the Phase 04 registry, in Figma order: the five More destinations
 *   (`MORE_SHEET_DESTINATIONS`), account settings (`MORE_SHEET_EXTRAS`) → the Settings root,
 *   then the plan upgrade → the subscription route (D-S7). The current destination's row has
 *   `aria-current="page"`; on Settings no row is current (D-R6). No current-row visual is
 *   designed, so none is added.
 * - **Language (product decision 2026-11-17):** mobile users can change the language here. The
 *   row reuses the Top Bar `LanguageSwitch` (same page, params and query kept). The Mobile Top
 *   Bar layout is unchanged. No theme control on mobile (Dark only).
 * - Any destination, the upgrade row or a language link closes the sheet.
 * - Controlled: the mobile bottom navigation's More control opens it (integration with
 *   `BottomNav`, after `MobileNavItem`).
 *
 * Row (FIGMA): 56 high, radius 14, padding 0 / 12, gap 14, Sky 5% fill, 1px Sky 10%; icon tile
 * 36, radius 12, Sky 14%, icon 18 Electric Sky; label Cairo Medium 14 white. Upgrade row: Sky 12%,
 * Sky 30%, padding 0 / 14, gap 12, Sky label, tile Sky 20%. Rows gap 8.
 */

export interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: ShellLabels;
}

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

const ROW_BASE = "flex min-h-[56px] items-center rounded-[14px] border text-dashboard-body-medium";
const ROW_DEFAULT = `${ROW_BASE} gap-[14px] px-sm border-accent-electric-sky/10 bg-accent-electric-sky/5 text-text-primary`;
const ROW_UPGRADE = `${ROW_BASE} gap-sm px-[14px] border-accent-electric-sky/30 bg-accent-electric-sky/12 text-accent-electric-sky`;
const ROW_LINK = `cursor-pointer transition-colors duration-base ease-standard ${FOCUS_RING}`;

const TILE_BASE =
  "flex size-[36px] shrink-0 items-center justify-center rounded-md text-accent-electric-sky";
const TILE_DEFAULT = `${TILE_BASE} bg-accent-electric-sky/14`;
const TILE_UPGRADE = `${TILE_BASE} bg-accent-electric-sky/20`;

const ACCOUNT_SETTINGS = MORE_SHEET_EXTRAS.find((extra) => extra.id === "accountSettings");
const UPGRADE = MORE_SHEET_EXTRAS.find((extra) => extra.id === "upgradePlan");

interface RowProps {
  icon: IconName;
  label: string;
  href: DestinationPath | typeof ROUTES.settings | typeof UPGRADE_HREF;
  current?: boolean;
  upgrade?: boolean;
  onNavigate: () => void;
}

function MoreRow({ icon, label, href, current = false, upgrade = false, onNavigate }: RowProps) {
  return (
    <li>
      <Link
        href={href}
        aria-current={current ? "page" : undefined}
        onClick={onNavigate}
        className={`${upgrade ? ROW_UPGRADE : ROW_DEFAULT} ${ROW_LINK}`}
      >
        <span className={upgrade ? TILE_UPGRADE : TILE_DEFAULT}>
          <Icon name={icon} size={18} />
        </span>
        <span className="min-w-0 flex-1">{label}</span>
      </Link>
    </li>
  );
}

export function MoreSheet({ open, onOpenChange, labels }: MoreSheetProps) {
  const { destination } = useActiveDestination();
  const close = () => onOpenChange(false);
  const destinations = labels.destinations.filter((item) =>
    MORE_SHEET_DESTINATIONS.some((more) => more.id === item.id),
  );

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={labels.more.title}
      closeLabel={labels.more.close}
    >
      <ul className="flex flex-col gap-[8px]" data-testid="more-sheet-rows">
        {destinations.map((item) => (
          <MoreRow
            key={item.id}
            icon={item.icon}
            label={item.label}
            href={item.href}
            current={item.id === destination}
            onNavigate={close}
          />
        ))}
        <MoreRow
          icon={ACCOUNT_SETTINGS?.icon ?? "settings"}
          label={labels.more.accountSettings}
          href={ROUTES.settings}
          onNavigate={close}
        />
        <li className={`${ROW_DEFAULT} justify-between`}>
          {/* The group below carries the same name ("اللغة"); this text is visual only. */}
          <span aria-hidden="true">{labels.topBar.language}</span>
          <LanguageSwitch labels={labels.topBar} onNavigate={close} />
        </li>
        <MoreRow
          icon={UPGRADE?.icon ?? "crown"}
          label={labels.upgrade.title}
          href={UPGRADE_HREF}
          upgrade
          onNavigate={close}
        />
      </ul>
    </Sheet>
  );
}

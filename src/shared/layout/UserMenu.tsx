"use client";

import { useGuardedRouter } from "@/shared/hooks/useNavigationGuard";
import { Avatar } from "@/shared/ui/Avatar";
import { Icon } from "@/shared/ui/Icon";
import { Menu, MenuItem } from "@/shared/ui/Menu";

import { SETTINGS_HREF } from "./shell-model";

/*
 * MUNSIT AI — user menu (Phase 05, D-S6, D-S9). Figma: `User Menu Trigger` (compact, 88 × 54:
 * Tablet `2224:401`, Mobile `2238:750`) and `User Menu` `2236:813`.
 *
 * - No user data exists (D-02): the trigger shows only the decorative Avatar placeholder and
 *   the chevron (the compact Figma trigger, on every breakpoint); no name or role, and the menu
 *   has no header.
 * - Trigger: radius 14, padding 6 / 10, gap 10, White 4% fill, 1px Sky 12%; Avatar 40;
 *   `chevDown` 16. No hover or pressed state is designed, so none is added (focus ring only).
 * - Menu (Phase 03 `account` variant): "الملف الشخصي" and "الإعدادات" both open the Settings root
 *   (D-S9) through the locale-aware router. **No logout** (D-02).
 */

export interface UserMenuProps {
  labels: { accountMenu: string; profile: string; settings: string };
}

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

const TRIGGER = [
  "flex h-[54px] shrink-0 cursor-pointer items-center gap-[10px] rounded-[14px] border px-[10px] py-[6px]",
  "border-accent-electric-sky/12 bg-text-primary/4 text-text-secondary",
  FOCUS_RING,
].join(" ");

export function UserMenu({ labels }: UserMenuProps) {
  // Guarded (Phase 06): an active navigation guard asks before leaving.
  const router = useGuardedRouter();
  const openSettings = () => router.push(SETTINGS_HREF);

  return (
    <Menu
      label={labels.accountMenu}
      variant="account"
      trigger={(props) => (
        <button {...props} type="button" aria-label={labels.accountMenu} className={TRIGGER}>
          <Avatar decorative size={40} />
          <Icon name="chevDown" size={16} className="shrink-0" />
        </button>
      )}
    >
      <MenuItem icon="user" onSelect={openSettings}>
        {labels.profile}
      </MenuItem>
      <MenuItem icon="settings" onSelect={openSettings}>
        {labels.settings}
      </MenuItem>
    </Menu>
  );
}

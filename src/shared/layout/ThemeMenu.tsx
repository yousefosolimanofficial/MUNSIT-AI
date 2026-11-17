"use client";

import { Menu, MenuItemRadio, MenuRadioGroup } from "@/shared/ui/Menu";
import { NavigationIconButton } from "@/shared/ui/NavigationIconButton";

/*
 * MUNSIT AI — appearance (theme) menu (Phase 05, D-S3). Figma: `Theme Toggle` `2211:187`.
 *
 * - O-8 `NavigationIconButton` (`moon`, 40) opens a Phase 03 `Menu` with radio items.
 * - **Dark is the only theme** (Design System: dark-only): it is checked; Light and System are
 *   disabled items labelled "coming soon". Nothing switches and nothing is stored.
 * - Keyboard: Enter / Space open the menu and focus the first available item. ArrowDown-to-open
 *   on the trigger is not available: the O-8 API (approved) takes no key handler.
 */

export interface ThemeMenuProps {
  labels: {
    appearance: string;
    theme: { dark: string; light: string; system: string };
  };
}

const DARK = "dark";

export function ThemeMenu({ labels }: ThemeMenuProps) {
  return (
    <Menu
      label={labels.appearance}
      trigger={(props) => (
        <NavigationIconButton
          ref={props.ref}
          icon="moon"
          label={labels.appearance}
          aria-haspopup={props["aria-haspopup"]}
          aria-expanded={props["aria-expanded"]}
          aria-controls={props["aria-controls"]}
          onClick={props.onClick}
        />
      )}
    >
      {/* Single supported value: selecting Dark only closes the menu. */}
      <MenuRadioGroup value={DARK} onValueChange={() => {}}>
        <MenuItemRadio value={DARK}>{labels.theme.dark}</MenuItemRadio>
        <MenuItemRadio value="light" disabled>
          {labels.theme.light}
        </MenuItemRadio>
        <MenuItemRadio value="system" disabled>
          {labels.theme.system}
        </MenuItemRadio>
      </MenuRadioGroup>
    </Menu>
  );
}

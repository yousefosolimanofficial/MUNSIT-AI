"use client";

import { Menu, MenuItemRadio, MenuRadioGroup } from "@/shared/ui/Menu";
import { NavigationIconButton } from "@/shared/ui/NavigationIconButton";

/*
 * MUNSIT AI — appearance (theme) menu (Phase 05, D-S3). Figma: `Theme Toggle` `2211:187`.
 *
 * - O-8 `NavigationIconButton` (`moon`, 40) opens a Phase 03 `Menu` with radio items.
 * - **Dark is the only theme** (Design System: dark-only): it is checked; Light and System are
 *   disabled items labelled "coming soon". Nothing switches and nothing is stored.
 * - Keyboard (Phase 03 Menu contract §3.3): Enter, Space or ArrowDown open the menu on the first
 *   available item; ArrowUp opens it on the last. The O-8 API takes no key handler, so the
 *   Menu's trigger `onKeyDown` sits on a `display: contents` wrapper: key events bubble to it from
 *   the button. The wrapper adds no box, role or tab stop (layout and semantics unchanged).
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
        <span className="contents" onKeyDown={props.onKeyDown}>
          <NavigationIconButton
            ref={props.ref}
            icon="moon"
            label={labels.appearance}
            aria-haspopup={props["aria-haspopup"]}
            aria-expanded={props["aria-expanded"]}
            aria-controls={props["aria-controls"]}
            onClick={props.onClick}
          />
        </span>
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

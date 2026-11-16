"use client";

import { createContext, useContext, useRef, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";

import type { IconName } from "@/design-system/icons/manifest";

import { Icon } from "./Icon";
import {
  useAnchoredOverlay,
  type FocusIntent,
  type OverlayAlign,
  type OverlayTriggerProps,
} from "./internal/useAnchoredOverlay";

/*
 * MUNSIT AI — Menu (Phase 03, Popover/Menu V1). Contract:
 * docs/phases/phase-03-popover-menu-contract.md.
 * Figma: context / option menus `2261:1500`, `2261:1430`, `2392:3979`; User Menu `2236:813`.
 *
 * - WAI-ARIA APG menu button: `role="menu"` with `menuitem` / `menuitemradio`, focus inside the
 *   menu, ArrowUp/Down (wrap), Home/End, type-ahead (Arabic and English), Enter/Space activate,
 *   Esc and Tab close. Disabled items are skipped.
 * - Activation closes the menu and returns focus to the trigger **before** the callback runs, so
 *   an action that opens a Dialog records the trigger as its focus-return target.
 * - Variants `context` (default) and `account` with exact Figma values (D-PM1). The optional
 *   `header` slot holds consumer content (e.g. the account header) outside `role="menu"`.
 * - Non-modal: no scrim (D-PM8), no scroll lock. Lifecycle in `internal/useAnchoredOverlay`.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

export const MENU_VARIANTS = ["context", "account"] as const;
export type MenuVariant = (typeof MENU_VARIANTS)[number];

export interface MenuProps {
  /** Renders the trigger; spread the props on a focusable `<button>` (e.g. `Button`). */
  trigger: (props: OverlayTriggerProps) => ReactNode;
  /** Accessible name of the menu. */
  label: string;
  /** Figma style. Default "context". */
  variant?: MenuVariant;
  /** Inline-direction edge shared with the trigger. Default "end". */
  align?: OverlayAlign;
  /** Optional non-interactive content above the items (e.g. the account header). */
  header?: ReactNode;
  /** Controlled open state (optional). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `MenuItem`, `MenuSeparator`, `MenuRadioGroup`. */
  children: ReactNode;
}

/** Figma offsets (D-PM5): context menus 6 (`2270:3332`), User Menu 9 (`2242:1053`). */
const OFFSETS = { context: 6, account: 9 } as const satisfies Record<MenuVariant, number>;
/** Viewport margin for menus (contract §3.2). */
const VIEWPORT_MARGIN = 16;
/** Type-ahead buffer timeout, ms (D-PM7). */
const TYPEAHEAD_TIMEOUT_MS = 500;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/** Shared panel motion (D-PM6); the `--overlay-slide` and origin are set by the overlay hook. */
const PANEL_MOTION = [
  "[scale:1] [translate:0_0] transition-[opacity,scale,translate] duration-base ease-standard motion-reduce:transition-opacity",
  "starting:open:opacity-0 starting:open:[scale:calc(1_-_0.03_*_var(--motion-distance))]",
  "starting:open:[translate:0_calc(var(--overlay-slide)_*_var(--motion-distance))]",
  "data-[state=closing]:pointer-events-none data-[state=closing]:opacity-0 data-[state=closing]:duration-fast",
  "data-[state=closing]:[scale:calc(1_-_0.03_*_var(--motion-distance))]",
].join(" ");

/** UA popover reset; `open:flex` so the hidden popover keeps `display: none`. */
const PANEL_BASE = `inset-auto m-0 max-w-[calc(100vw_-_32px)] flex-col overflow-y-auto overscroll-contain border border-accent-electric-sky/18 text-text-primary open:flex ${PANEL_MOTION}`;

const PANEL_VARIANT = {
  context:
    "w-[220px] gap-[2px] rounded-[14px] bg-color-surface-graphite/98 p-[6px] shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
  account:
    "w-[256px] gap-[2px] rounded-[18px] bg-surface-obsidian/97 p-[8px] shadow-[0_24px_56px_rgba(0,0,0,0.55)]",
} as const satisfies Record<MenuVariant, string>;

const LIST_CLASSES = "flex flex-col gap-[2px]";

/** White 5% highlight for hover and the focused item (D-PM4); D-B2 ring on keyboard focus. */
const ITEM_BASE = [
  "flex w-full shrink-0 cursor-pointer items-center px-sm text-start outline-none",
  "transition-colors duration-fast ease-standard",
  "[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:bg-text-primary/5 focus:bg-text-primary/5",
  FOCUS_RING,
  "disabled:cursor-default disabled:opacity-50",
].join(" ");

const ITEM_VARIANT = {
  context: "h-[40px] gap-[10px] rounded-[10px] text-dashboard-body",
  account: "h-[44px] gap-[12px] rounded-md text-dashboard-body-medium",
} as const satisfies Record<MenuVariant, string>;

/** Option rows (Filter / Sort): 38 high; selected Sky 12% + check (Figma `2261:1429`). */
const RADIO_CLASSES =
  "h-[38px] gap-[10px] rounded-[10px] text-dashboard-body aria-checked:bg-accent-electric-sky/12";

const ICON_SIZE = { context: 18, account: 20 } as const satisfies Record<MenuVariant, number>;
/** Figma icon colors: context Text / Secondary, account Electric Sky; danger Coral Pulse. */
const ICON_COLOR = {
  context: "text-text-secondary",
  account: "text-accent-electric-sky",
} as const satisfies Record<MenuVariant, string>;

const SEPARATOR_VARIANT = {
  context: "h-px shrink-0 bg-text-primary/8",
  account: "h-px shrink-0 bg-accent-electric-sky/10",
} as const satisfies Record<MenuVariant, string>;

const ITEM_SELECTOR = '[role="menuitem"]:not(:disabled), [role="menuitemradio"]:not(:disabled)';

/**
 * Type-ahead normalization: decomposes and drops combining marks (Arabic harakat, hamza and
 * madda on alef, Latin accents) and tatweel, so "ا" matches "أحمد" and "e" matches "é".
 */
export function normalizeForTypeahead(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/ـ/g, "").toLowerCase().trim();
}

interface MenuContextValue {
  variant: MenuVariant;
  select: (callback?: () => void) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(component: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`${component} must be used inside <Menu>.`);
  return context;
}

function items(panel: HTMLElement): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
}

function focusItem(panel: HTMLElement, intent: FocusIntent): void {
  const list = items(panel);
  (intent === "last" ? list.at(-1) : list[0])?.focus();
}

export function Menu({
  trigger,
  label,
  variant = "context",
  align = "end",
  header,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: MenuProps) {
  const { panelId, panelRef, present, close, onPanelKeyDown, triggerProps } = useAnchoredOverlay({
    open,
    defaultOpen,
    onOpenChange,
    align,
    offset: OFFSETS[variant],
    viewportMargin: VIEWPORT_MARGIN,
    haspopup: "menu",
    onShown: focusItem,
  });
  const typeaheadRef = useRef({ buffer: "", time: 0 });

  const context: MenuContextValue = {
    variant,
    select: (callback) => {
      // Commit the close (aria-expanded=false, exit started) and focus the trigger first, so a
      // callback that opens a Dialog records the trigger as its focus-return target.
      flushSync(() => close({ focusTrigger: true }));
      callback?.();
    },
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const panel = event.currentTarget;
    const list = items(panel);
    const index = list.indexOf(document.activeElement as HTMLElement);
    const move = (next: number) => {
      event.preventDefault();
      list[(next + list.length) % list.length]?.focus();
    };
    switch (event.key) {
      case "ArrowDown":
        return move(index + 1);
      case "ArrowUp":
        return move(index < 0 ? list.length - 1 : index - 1);
      case "Home":
        return move(0);
      case "End":
        return move(list.length - 1);
      case "Tab":
        close(); // focus moves on naturally
        return;
      case "Escape":
        return onPanelKeyDown(event);
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === " ") return; // Space activates the focused item
    const now = event.timeStamp;
    const state = typeaheadRef.current;
    state.buffer = (now - state.time < TYPEAHEAD_TIMEOUT_MS ? state.buffer : "") + event.key;
    state.time = now;
    const query = normalizeForTypeahead(state.buffer);
    const repeated = query.length > 1 && [...query].every((char) => char === query[0]);
    const needle = repeated ? query.slice(0, 1) : query;
    // A new or repeated character searches after the current item; a longer query includes it.
    const start = repeated || query.length === 1 ? index + 1 : Math.max(index, 0);
    for (let step = 0; step < list.length; step += 1) {
      const candidate = list[(start + step) % list.length];
      if (candidate && normalizeForTypeahead(candidate.textContent ?? "").startsWith(needle)) {
        event.preventDefault();
        candidate.focus();
        return;
      }
    }
  };

  return (
    <>
      {trigger(triggerProps)}
      <div
        ref={panelRef}
        id={panelId}
        popover="manual"
        className={`${PANEL_BASE} ${PANEL_VARIANT[variant]}`}
        onKeyDown={onKeyDown}
      >
        {present ? (
          <MenuContext.Provider value={context}>
            {header}
            <div role="menu" aria-label={label} className={LIST_CLASSES}>
              {children}
            </div>
          </MenuContext.Provider>
        ) : null}
      </div>
    </>
  );
}

export interface MenuItemProps {
  /** Runs after the menu has closed and focus has returned to the trigger. */
  onSelect?: () => void;
  /** Optional icon at inline-start (existing icon set only, D-PM9). */
  icon?: IconName;
  /** Destructive action: Coral Pulse label and icon. */
  tone?: "danger";
  disabled?: boolean;
  children: ReactNode;
}

export function MenuItem({ onSelect, icon, tone, disabled, children }: MenuItemProps) {
  const { variant, select } = useMenuContext("MenuItem");
  const color = tone === "danger" ? "text-accent-coral-pulse" : "text-text-primary";
  const iconColor = tone === "danger" ? "text-accent-coral-pulse" : ICON_COLOR[variant];
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={disabled}
      className={`${ITEM_BASE} ${ITEM_VARIANT[variant]} ${color}`}
      onClick={() => select(onSelect)}
    >
      {icon ? (
        <span className={`flex shrink-0 ${iconColor}`}>
          <Icon name={icon} size={ICON_SIZE[variant]} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

export function MenuSeparator() {
  const { variant } = useMenuContext("MenuSeparator");
  return <div role="separator" className={SEPARATOR_VARIANT[variant]} />;
}

interface RadioContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export interface MenuRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Optional accessible name of the group. */
  label?: string;
  children: ReactNode;
}

export function MenuRadioGroup({ value, onValueChange, label, children }: MenuRadioGroupProps) {
  useMenuContext("MenuRadioGroup");
  return (
    <RadioContext.Provider value={{ value, onValueChange }}>
      <div role="group" aria-label={label} className={LIST_CLASSES}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export interface MenuItemRadioProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export function MenuItemRadio({ value, disabled, children }: MenuItemRadioProps) {
  const { select } = useMenuContext("MenuItemRadio");
  const radio = useContext(RadioContext);
  if (!radio) throw new Error("MenuItemRadio must be used inside <MenuRadioGroup>.");
  const checked = radio.value === value;
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      disabled={disabled}
      className={`${ITEM_BASE} ${RADIO_CLASSES} text-text-primary`}
      onClick={() => select(() => radio.onValueChange(value))}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {checked ? (
        <span className="flex shrink-0 text-accent-electric-sky">
          <Icon name="check" size={16} />
        </span>
      ) : null}
    </button>
  );
}

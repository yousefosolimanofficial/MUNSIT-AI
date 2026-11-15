"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import type { IconName } from "@/design-system/icons/manifest";

import { Icon } from "./Icon";

/*
 * MUNSIT AI — Tabs (Phase 03). Contract: docs/phases/phase-03-tabs-contract.md.
 * Figma: `Lecture Tab` 2278:322 (size "default") and `Lecture Tab Compact` 2293:679 ("compact").
 *
 * - WAI-ARIA APG tabs with automatic activation (D-T4): arrows follow the visual direction (RTL
 *   aware), wrap around, Home/End; roving tabIndex; every tab controls its own tabpanel.
 * - Client Component: selection state and keyboard handling.
 * - V1 ships the "tool" variant only. Filter rows are deferred to their modules (contract §1.1).
 * - No breakpoints (D-T3): the page chooses `size` and the TabList layout.
 * - Approved deviations: focus-visible ring (D-T2, = Button D-B2) and an underlined active label
 *   (D-T6, a non-color cue). Colors only from tokens and opacity modifiers; no hex.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

export type TabsSize = "default" | "compact";

export interface TabsProps {
  /** Accessible name of the tab list (required). */
  label: string;
  /** Visual variant. V1 has only "tool" (contract §1). */
  variant?: "tool";
  /** "default" (Desktop) or "compact" (Tablet / Mobile); chosen by the page (D-T3). */
  size?: TabsSize;
  /** Controlled selected value. Use with `onValueChange`. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called once when the user selects another tab. */
  onValueChange?: (value: string) => void;
  /** Disables the whole list (contract §2.5): no focus, no selection, 50% opacity. */
  disabled?: boolean;
  /** Layout only, on the wrapper. */
  className?: string;
  children: ReactNode;
}

export interface TabListProps {
  /** Layout only (e.g. the Mobile 2 × 3 grid). Never colors or sizes. */
  className?: string;
  children: ReactNode;
}

export interface TabProps {
  value: string;
  /** Decorative icon (18px), from the approved icon set. */
  icon?: IconName;
  /** Visible label. */
  children: ReactNode;
  /** Layout only. */
  className?: string;
}

export interface TabPanelProps {
  value: string;
  /** Layout only. */
  className?: string;
  children: ReactNode;
}

interface TabsContextValue {
  label: string;
  size: TabsSize;
  selected: string | undefined;
  select: (value: string) => void;
  disabled: boolean;
  tabId: (value: string) => string;
  panelId: (value: string) => string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${component}> must be used inside <Tabs>.`);
  return context;
}

/** Focus ring, D-T2 = Button D-B2: keyboard focus only, 2px solid Electric Sky, offset 2px. */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/** Shared by every tab: radius 12, 1px border inside (border-box keeps the Figma height). */
const TAB_BASE = [
  "inline-flex min-w-0 flex-1 items-center justify-center rounded-md border",
  "transition-colors duration-base ease-standard",
  "disabled:cursor-default enabled:cursor-pointer",
  FOCUS_RING,
].join(" ");

/** Size layouts (contract §2.1, §2.2). Heights, paddings and gaps are component constants. */
const TAB_SIZE: Record<TabsSize, string> = {
  default: "h-[44px] gap-[8px] px-md text-dashboard-body-medium",
  compact: "h-[58px] flex-col gap-[4px] px-[6px] py-[8px] text-dashboard-caption",
};

/** States per size (contract §3). Hover only where Figma designs it (size "default"). */
const TAB_STATE: Record<TabsSize, { inactive: string; active: string }> = {
  default: {
    inactive:
      "border-transparent text-text-secondary enabled:hover:bg-text-primary/5 enabled:hover:text-text-primary",
    active: "bg-accent-electric-sky/12 border-accent-electric-sky/32 text-text-primary",
  },
  compact: {
    inactive: "bg-text-primary/3 border-accent-electric-sky/12 text-text-secondary",
    active: "bg-accent-electric-sky/12 border-accent-electric-sky/50 text-accent-electric-sky",
  },
};

/** Active icon color for size "default" (the label stays Text / Primary there). */
const ACTIVE_ICON = "text-accent-electric-sky";

/** D-T6: a non-color cue for the selected tab. Does not change the tab's size. */
const ACTIVE_LABEL = "underline underline-offset-4";

/** Tab list gap: 8 (default), 4 (compact, Tablet row). */
const LIST_GAP: Record<TabsSize, string> = { default: "gap-[8px]", compact: "gap-xs" };

const ICON_SIZE = 18;

/** Ids must be valid and unique; values may contain any characters. */
function idSafe(value: string): string {
  return Array.from(value, (char) =>
    /[A-Za-z0-9_-]/.test(char) ? char : `_${char.codePointAt(0)?.toString(16) ?? ""}`,
  ).join("");
}

/** Rendered direction of the list; falls back to the nearest `dir` where CSS is not computed. */
function isRtl(element: HTMLElement): boolean {
  const computed = getComputedStyle(element).direction;
  if (computed === "rtl" || computed === "ltr") return computed === "rtl";
  return element.closest("[dir]")?.getAttribute("dir") === "rtl";
}

export function Tabs({
  label,
  size = "default",
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  children,
}: TabsProps) {
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolled;

  const select = (next: string) => {
    if (disabled || next === selected) return;
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  };

  const context: TabsContextValue = {
    label,
    size,
    selected,
    select,
    disabled,
    tabId: (v) => `${baseId}-tab-${idSafe(v)}`,
    panelId: (v) => `${baseId}-panel-${idSafe(v)}`,
  };

  return (
    <TabsContext.Provider value={context}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ className, children }: TabListProps) {
  const { label, size, disabled } = useTabsContext("TabList");

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const list = event.currentTarget;
    const tabs = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    if (tabs.length === 0) return;
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const rtl = isRtl(list);
    // Visual direction: the "next" tab is to the left in RTL and to the right in LTR.
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    let target: number;
    if (event.key === "Home") target = 0;
    else if (event.key === "End") target = tabs.length - 1;
    else {
      const step = event.key === forward ? 1 : -1;
      const from = current === -1 ? 0 : current;
      target = (from + step + tabs.length) % tabs.length;
    }
    event.preventDefault();
    const tab = tabs[target];
    tab?.focus();
    tab?.click(); // automatic activation (D-T4)
  };

  const classes = ["flex", LIST_GAP[size], disabled ? "opacity-50" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-disabled={disabled ? true : undefined}
      aria-orientation="horizontal"
      className={classes}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}

export function Tab({ value, icon, children, className }: TabProps) {
  const { size, selected, select, disabled, tabId, panelId } = useTabsContext("Tab");
  const isSelected = selected === value;
  const state = TAB_STATE[size];

  const classes = [TAB_BASE, TAB_SIZE[size], isSelected ? state.active : state.inactive, className]
    .filter(Boolean)
    .join(" ");
  const iconClasses = ["shrink-0", isSelected && size === "default" ? ACTIVE_ICON : null]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      role="tab"
      id={tabId(value)}
      aria-selected={isSelected}
      aria-controls={panelId(value)}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      className={classes}
      onClick={() => select(value)}
    >
      {icon ? <Icon name={icon} size={ICON_SIZE} className={iconClasses} /> : null}
      <span className={isSelected ? ACTIVE_LABEL : undefined}>{children}</span>
    </button>
  );
}

export function TabPanel({ value, className, children }: TabPanelProps) {
  const { selected, tabId, panelId } = useTabsContext("TabPanel");
  const isSelected = selected === value;

  return (
    <div
      role="tabpanel"
      id={panelId(value)}
      aria-labelledby={tabId(value)}
      tabIndex={0}
      hidden={!isSelected}
      className={[FOCUS_RING, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

"use client";

import type { FocusEvent, ReactNode } from "react";

import {
  useAnchoredOverlay,
  type OverlayAlign,
  type OverlayTriggerProps,
} from "./internal/useAnchoredOverlay";

/*
 * MUNSIT AI — Popover (Phase 03, Popover/Menu V1). Contract:
 * docs/phases/phase-03-popover-menu-contract.md.
 * Figma: `Notification Dropdown` `2236:784` (the only popover panel in the file).
 *
 * - Non-modal floating panel for arbitrary content: `role="dialog"` without `aria-modal`, named
 *   by `label`. Focus moves to the first focusable element inside (or the panel); Tab moves
 *   through the content and focus leaving the panel closes it; Esc closes and returns focus to
 *   the trigger; outside click closes.
 * - Exact Figma values; width 380 clamped to viewport − 40 (Mobile 350 at 390), viewport margin
 *   20 and offset 16 (Notifications `2242:1008`, D-PM5).
 * - No scrim, no scroll lock (D-PM8). Lifecycle in `internal/useAnchoredOverlay`.
 */

export interface PopoverProps {
  /** Renders the trigger; spread the props on a focusable `<button>`. */
  trigger: (props: OverlayTriggerProps) => ReactNode;
  /** Accessible name of the panel. */
  label: string;
  /** Inline-direction edge shared with the trigger. Default "start" (Figma Notifications). */
  align?: OverlayAlign;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Panel content (header, list, footer: owned by the consumer). */
  children: ReactNode;
}

/** Figma: Notifications sits 16 below its trigger; Mobile keeps 20 from the viewport edges. */
const OFFSET = 16;
const VIEWPORT_MARGIN = 20;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const PANEL_MOTION = [
  "[scale:1] [translate:0_0] transition-[opacity,scale,translate] duration-base ease-standard motion-reduce:transition-opacity",
  "starting:open:opacity-0 starting:open:[scale:calc(1_-_0.03_*_var(--motion-distance))]",
  "starting:open:[translate:0_calc(var(--overlay-slide)_*_var(--motion-distance))]",
  "data-[state=closing]:pointer-events-none data-[state=closing]:opacity-0 data-[state=closing]:duration-fast",
  "data-[state=closing]:[scale:calc(1_-_0.03_*_var(--motion-distance))]",
].join(" ");

const PANEL_CLASSES = [
  "inset-auto m-0 w-[380px] max-w-[calc(100vw_-_40px)] flex-col overflow-y-auto overscroll-contain open:flex",
  "gap-[6px] rounded-xl border border-accent-electric-sky/18 bg-surface-obsidian/97 p-md text-text-primary",
  "shadow-[0_24px_56px_rgba(0,0,0,0.55)] outline-none",
  PANEL_MOTION,
].join(" ");

function focusInside(panel: HTMLElement): void {
  (panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus();
}

export function Popover({
  trigger,
  label,
  align = "start",
  open,
  defaultOpen,
  onOpenChange,
  children,
}: PopoverProps) {
  const { panelId, panelRef, triggerRef, present, close, onPanelKeyDown, triggerProps } =
    useAnchoredOverlay({
      open,
      defaultOpen,
      onOpenChange,
      align,
      offset: OFFSET,
      viewportMargin: VIEWPORT_MARGIN,
      haspopup: "dialog",
      onShown: focusInside,
    });

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    // Only a move to another element closes it (not a window switch or a click on nothing).
    if (!(next instanceof Node)) return;
    if (event.currentTarget.contains(next) || triggerRef.current?.contains(next)) return;
    close();
  };

  return (
    <>
      {trigger(triggerProps)}
      <div
        ref={panelRef}
        id={panelId}
        popover="manual"
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        className={PANEL_CLASSES}
        onKeyDown={onPanelKeyDown}
        onBlur={onBlur}
      >
        {present ? children : null}
      </div>
    </>
  );
}

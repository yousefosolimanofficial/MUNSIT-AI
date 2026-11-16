"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

/*
 * MUNSIT AI — shared lifecycle of the non-modal anchored overlays (Popover and Menu). Contract:
 * docs/phases/phase-03-popover-menu-contract.md §3. Internal; separate from the modal
 * `useModalDialog` (Dialog, Sheet).
 *
 * - Native Popover API, `popover="manual"` (D-PM2): top layer without a portal; rendered in
 *   place, so inside a Dialog or Sheet it stays in their subtree and is never inert.
 * - Dismissal is owned here, not by `popover="auto"`: outside `pointerdown`, Esc (handled and
 *   cancelled so a surrounding modal stays open), plus Tab-out (Menu) and focus-out (Popover) in
 *   the components.
 * - Positioning in JS: below the trigger at a fixed offset, aligned `start` / `end` in the inline
 *   direction (RTL-aware), flipped above when there is no room, clamped inside the viewport.
 * - Motion: `data-state` (`open` | `closing` | `closed`) set imperatively; `hidePopover()` runs
 *   after the panel's own `opacity` transition (or a fallback timer). Reopen cancels the exit.
 */

export type OverlayAlign = "start" | "end";
export type FocusIntent = "first" | "last";

export interface AnchoredOverlayOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align: OverlayAlign;
  /** Gap between trigger and panel, in px (Figma value of the component). */
  offset: number;
  /** Minimum distance between panel and viewport edges, in px. */
  viewportMargin: number;
  haspopup: "menu" | "dialog";
  /** Moves focus into the panel once it is shown and positioned. */
  onShown: (panel: HTMLElement, intent: FocusIntent) => void;
}

/** Slide distance of the entrance, toward the trigger (D-PM6). */
const ENTRANCE_SLIDE_PX = 4;
/** Safety margin after the computed exit time, in case `transitionend` never fires. */
const EXIT_FALLBACK_MARGIN_MS = 50;

function transitionTimeMs(element: Element): number {
  const style = getComputedStyle(element);
  const toMs = (list: string) =>
    list.split(",").map((raw) => {
      const value = raw.trim();
      const n = parseFloat(value);
      if (!Number.isFinite(n)) return 0;
      return value.endsWith("ms") ? n : n * 1000;
    });
  const durations = toMs(style.transitionDuration);
  const delays = toMs(style.transitionDelay);
  return durations.reduce((max, d, i) => Math.max(max, d + (delays[i] ?? delays[0] ?? 0)), 0);
}

/** Positions the panel next to the trigger (viewport coordinates; the panel is `fixed`). */
function place(
  trigger: HTMLElement,
  panel: HTMLElement,
  align: OverlayAlign,
  offset: number,
  margin: number,
): void {
  panel.style.maxHeight = "";
  const r = trigger.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const width = panel.offsetWidth;
  const height = panel.offsetHeight;
  const rtl = getComputedStyle(trigger).direction === "rtl";
  // `end` in RTL and `start` in LTR share the trigger's left edge.
  const alignLeft = (align === "end") === rtl;
  const preferred = alignLeft ? r.left : r.right - width;
  const left = Math.min(
    Math.max(preferred, margin),
    Math.max(margin, viewportWidth - margin - width),
  );

  const below = r.bottom + offset;
  const above = r.top - offset - height;
  let side: "bottom" | "top" = "bottom";
  let top = below;
  if (below + height > viewportHeight - margin) {
    if (above >= margin) {
      side = "top";
      top = above;
    } else {
      panel.style.maxHeight = `${Math.max(0, viewportHeight - margin - below)}px`;
    }
  }
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.dataset.side = side;
  panel.style.transformOrigin = `${alignLeft ? "left" : "right"} ${side === "bottom" ? "top" : "bottom"}`;
  panel.style.setProperty(
    "--overlay-slide",
    `${side === "bottom" ? -ENTRANCE_SLIDE_PX : ENTRANCE_SLIDE_PX}px`,
  );
}

export function useAnchoredOverlay(options: AnchoredOverlayOptions) {
  const panelId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [internalOpen, setInternalOpen] = useState(options.defaultOpen ?? false);
  const isOpen = options.open ?? internalOpen;
  // Children stay mounted while open and during the exit.
  const [present, setPresent] = useState(isOpen);
  if (isOpen && !present) setPresent(true);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });
  const intentRef = useRef<FocusIntent>("first");
  const shownRef = useRef(false);
  const cancelExitRef = useRef<(() => void) | null>(null);

  const setOpen = useCallback((next: boolean) => {
    if (optionsRef.current.open === undefined) setInternalOpen(next);
    optionsRef.current.onOpenChange?.(next);
  }, []);

  /** Closes; with `focusTrigger`, focus returns to the trigger first (before any callback). */
  const close = useCallback(
    (closeOptions?: { focusTrigger?: boolean }) => {
      if (closeOptions?.focusTrigger) triggerRef.current?.focus();
      setOpen(false);
    },
    [setOpen],
  );

  const hide = useCallback(() => {
    cancelExitRef.current?.();
    cancelExitRef.current = null;
    const panel = panelRef.current;
    if (panel) panel.dataset.state = "closed";
    if (panel && shownRef.current) panel.hidePopover();
    shownRef.current = false;
    setPresent(false);
  }, []);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;

    if (isOpen) {
      cancelExitRef.current?.();
      cancelExitRef.current = null;
      panel.dataset.state = "open";
      if (shownRef.current) return; // reopened during the exit
      panel.showPopover();
      shownRef.current = true;
      const { align, offset, viewportMargin, onShown } = optionsRef.current;
      place(trigger, panel, align, offset, viewportMargin);
      onShown(panel, intentRef.current);
      return;
    }

    if (!shownRef.current || panel.dataset.state === "closing") return;
    panel.dataset.state = "closing";
    const exitMs = transitionTimeMs(panel);
    if (exitMs === 0) {
      hide();
      return;
    }
    const onEnd = (event: TransitionEvent) => {
      if (event.target === panel && event.propertyName === "opacity") hide();
    };
    panel.addEventListener("transitionend", onEnd);
    const timer = window.setTimeout(hide, exitMs + EXIT_FALLBACK_MARGIN_MS);
    cancelExitRef.current = () => {
      panel.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
    };
  }, [isOpen, hide]);

  // While open: outside pointerdown closes; resize and scroll re-position.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    let frame = 0;
    const reposition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const panel = panelRef.current;
        const trigger = triggerRef.current;
        if (!panel || !trigger || panel.dataset.state !== "open") return;
        const { align, offset, viewportMargin } = optionsRef.current;
        place(trigger, panel, align, offset, viewportMargin);
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [isOpen, setOpen]);

  // Unmount while shown: leave the top layer.
  useEffect(() => {
    const panel = panelRef.current;
    return () => {
      cancelExitRef.current?.();
      if (panel && shownRef.current) panel.hidePopover();
      shownRef.current = false;
    };
  }, []);

  /** Esc closes this layer only: cancelled so a surrounding Dialog/Sheet stays open. */
  const onPanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    close({ focusTrigger: true });
  };

  const openWith = (intent: FocusIntent) => {
    intentRef.current = intent;
    if (!isOpen) setOpen(true);
    else if (panelRef.current) optionsRef.current.onShown(panelRef.current, intent);
  };

  const triggerProps = {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    "aria-haspopup": options.haspopup,
    "aria-expanded": isOpen,
    "aria-controls": panelId,
    onClick: () => {
      intentRef.current = "first";
      setOpen(!isOpen);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (options.haspopup !== "menu") return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openWith(event.key === "ArrowUp" ? "last" : "first");
      }
    },
  };

  return {
    panelId,
    panelRef,
    triggerRef,
    isOpen,
    present,
    close,
    onPanelKeyDown,
    triggerProps,
  };
}

export type OverlayTriggerProps = ReturnType<typeof useAnchoredOverlay>["triggerProps"];

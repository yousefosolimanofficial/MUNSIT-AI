"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";

import type { IconName } from "@/design-system/icons/manifest";

import { Icon } from "./Icon";

/*
 * MUNSIT AI — Dialog (Phase 03, Dialog V1). Contract: docs/phases/phase-03-dialog-contract.md.
 * Figma: no shared component; one shell shared by 20+ module dialogs (contract §1, §2).
 *
 * - Native `<dialog>` + `showModal()` (D-DL6): top layer, page inert (D-DL3), no portal.
 * - Controlled only: `open` is the single source of truth. Esc, the scrim and the close button
 *   call `onOpenChange(false)`; the prop change runs the exit, then `close()` (§5.1).
 * - `data-state` (`open` | `closing` | `closed`) is set on the element imperatively, so a React
 *   re-render never interrupts a running transition.
 * - Motion: CSS only (`@starting-style` entrance, `data-state="closing"` exit), approved motion
 *   tokens, scale distance × `--motion-distance` (0 under reduced motion) (D-DL4).
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

export const DIALOG_WIDTHS = [420, 440, 480, 520, 560, 640] as const;
export type DialogWidth = (typeof DIALOG_WIDTHS)[number];

export const DIALOG_TONES = ["accent", "danger"] as const;
export type DialogTone = (typeof DIALOG_TONES)[number];

export interface DialogProps {
  /** Controlled open state. */
  open: boolean;
  /** Called with `false` on Esc, scrim click and the close button. */
  onOpenChange: (open: boolean) => void;
  /** Visible title (`Dashboard/Title M`); also the accessible name. */
  title: ReactNode;
  /** Optional description (`Dashboard/Body`, Text / Secondary); `aria-describedby`. */
  description?: ReactNode;
  /** Optional icon tile. */
  icon?: IconName;
  /** Icon tile tone. Default "accent". */
  tone?: DialogTone;
  /** "alertdialog" for confirmations and guards. Default "dialog". */
  role?: "dialog" | "alertdialog";
  /** One of the Figma widths (D-DL2). Default 480. */
  width?: DialogWidth;
  /** Accessible name of the close button; when set, header layout B with a close button (D-DL5). */
  closeLabel?: string;
  /** Element focused on open; default: the first focusable element (native). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Actions row (existing `Button`s); DOM order = visual order, primary first. */
  actions?: ReactNode;
  /** Optional body: module content. Scrolls when the dialog reaches the viewport height. */
  children?: ReactNode;
}

/* ------------------------------------------------------------------ scroll lock (§5) */

let lockCount = 0;
let savedHtmlStyle: { overflow: string; scrollbarGutter: string } | null = null;

function lockScroll(): void {
  lockCount += 1;
  if (lockCount > 1) return;
  const html = document.documentElement;
  savedHtmlStyle = { overflow: html.style.overflow, scrollbarGutter: html.style.scrollbarGutter };
  // Keep the scrollbar's space only if the page has one, so the layout never shifts.
  const hasScrollbar = window.innerWidth > html.clientWidth;
  html.style.overflow = "hidden";
  if (hasScrollbar) html.style.scrollbarGutter = "stable";
}

function unlockScroll(): void {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0 || !savedHtmlStyle) return;
  const html = document.documentElement;
  html.style.overflow = savedHtmlStyle.overflow;
  html.style.scrollbarGutter = savedHtmlStyle.scrollbarGutter;
  savedHtmlStyle = null;
}

/** Longest computed transition (duration + delay) in ms; 0 when there is none (e.g. jsdom). */
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

/** Safety margin after the computed exit time, in case `transitionend` never fires. */
const EXIT_FALLBACK_MARGIN_MS = 50;

function isInsideRect(element: Element, x: number, y: number): boolean {
  const rect = element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

/* ------------------------------------------------------------------ classes (§3, §5.1) */

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/** 0.98 at full motion, 1 under reduced motion (`--motion-distance: 0`). */
const DIALOG_CLASSES = [
  // UA reset: the inner wrapper owns padding and max height.
  "m-auto max-h-none overflow-hidden p-0",
  "max-w-[calc(100vw_-_40px)]",
  // Shell (§2.1, D-DL1).
  "rounded-2xl border border-accent-electric-sky/18 bg-surface-obsidian/98 text-text-primary",
  "shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
  // Motion: entrance (slow) from @starting-style, exit (base) on data-state="closing".
  // Explicit resting scale: under reduced motion start and end are both 1, so no transition runs.
  "[scale:1] transition-[opacity,scale] duration-slow ease-standard",
  "starting:open:opacity-0 starting:open:[scale:calc(1_-_0.02_*_var(--motion-distance))]",
  "data-[state=closing]:pointer-events-none data-[state=closing]:opacity-0 data-[state=closing]:duration-base",
  "data-[state=closing]:[scale:calc(1_-_0.02_*_var(--motion-distance))]",
  // Scrim (§2.6) with the same timing.
  "backdrop:bg-surface-void-black/66 backdrop:transition-opacity backdrop:duration-slow backdrop:ease-standard",
  "starting:open:backdrop:opacity-0",
  "data-[state=closing]:backdrop:opacity-0 data-[state=closing]:backdrop:duration-base",
].join(" ");

const WIDTH_CLASSES = {
  420: "w-[420px]",
  440: "w-[440px]",
  480: "w-[480px]",
  520: "w-[520px]",
  560: "w-[560px]",
  640: "w-[640px]",
} as const satisfies Record<DialogWidth, string>;

/**
 * Padding 24, gap 14 (local constants, §2.1). Height: the dialog's outer box is capped at
 * viewport − 40 (D-DL2); the wrapper sits inside the 1px top and bottom borders, hence − 42.
 */
const WRAPPER_CLASSES = "flex max-h-[calc(100dvh_-_42px)] flex-col gap-[14px] p-[24px] text-start";

const TONE_CLASSES = {
  accent: "border-accent-electric-sky/30 bg-accent-electric-sky/12 text-accent-electric-sky",
  danger: "border-accent-coral-pulse/30 bg-accent-coral-pulse/12 text-accent-coral-pulse",
} as const satisfies Record<DialogTone, string>;

const TILE_BASE = "flex shrink-0 items-center justify-center rounded-[14px] border";
const TILE_A = "size-[48px] self-start";
const TILE_B = "size-[44px]";

const TITLE_CLASSES = "text-dashboard-title-m text-text-primary";
const DESCRIPTION_CLASSES = "text-dashboard-body text-text-secondary";

const CLOSE_CLASSES = [
  "flex size-[36px] shrink-0 cursor-pointer items-center justify-center rounded-[10px]",
  "border border-accent-electric-sky/14 bg-text-primary/4 text-text-secondary",
  FOCUS_RING,
].join(" ");

const BODY_CLASSES = "min-h-0 flex-1 overflow-y-auto overscroll-contain";
const ACTIONS_CLASSES = "flex shrink-0 gap-[10px] *:min-w-0 *:flex-1";

/* ------------------------------------------------------------------ component */

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  tone = "accent",
  role = "dialog",
  width = 480,
  closeLabel,
  initialFocusRef,
  actions,
  children,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Children stay mounted while open and during the exit.
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  const openRef = useRef(open);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    openRef.current = open;
    onOpenChangeRef.current = onOpenChange;
  });

  const lockedRef = useRef(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const cancelExitRef = useRef<(() => void) | null>(null);
  const pointerDownOnScrimRef = useRef(false);

  /** Scroll lock off, focus back to the trigger, children unmounted. */
  const release = useCallback(() => {
    cancelExitRef.current?.();
    cancelExitRef.current = null;
    if (lockedRef.current) {
      unlockScroll();
      lockedRef.current = false;
    }
    const target = restoreFocusRef.current;
    restoreFocusRef.current = null;
    const active = document.activeElement;
    const focusLost =
      active === null || active === document.body || dialogRef.current?.contains(active) === true;
    if (target?.isConnected && focusLost) target.focus();
    setPresent(false);
  }, []);

  /** End of the exit: leave the top layer, then release. */
  const finishExit = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      // Marked first: the `close` event (queued by the browser) is then known to be ours.
      dialog.dataset.state = "closed";
      if (dialog.open) dialog.close();
    }
    release();
  }, [release]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      // Rapid reopen during the exit: cancel the pending close() and transition back.
      cancelExitRef.current?.();
      cancelExitRef.current = null;
      dialog.dataset.state = "open";
      if (dialog.open) return;
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      lockScroll();
      lockedRef.current = true;
      dialog.showModal();
      initialFocusRef?.current?.focus();
      return;
    }

    if (!dialog.open || dialog.dataset.state === "closing") return;
    dialog.dataset.state = "closing";
    const exitMs = transitionTimeMs(dialog);
    if (exitMs === 0) {
      finishExit();
      return;
    }
    const onEnd = (event: TransitionEvent) => {
      // Only the panel's own opacity; transitions of children bubble here too.
      if (event.target === dialog && event.propertyName === "opacity") finishExit();
    };
    dialog.addEventListener("transitionend", onEnd);
    const timer = window.setTimeout(finishExit, exitMs + EXIT_FALLBACK_MARGIN_MS);
    cancelExitRef.current = () => {
      dialog.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
    };
  }, [open, initialFocusRef, finishExit]);

  // Unmount while open: leave the top layer, release the lock, restore focus.
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog) {
        dialog.dataset.state = "closed";
        if (dialog.open) dialog.close();
      }
      release();
    };
  }, [release]);

  const requestClose = useCallback(() => {
    if (dialogRef.current?.dataset.state === "closing") return;
    onOpenChangeRef.current(false);
  }, []);

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // Esc: never let the browser close it; the prop decides (and the exit runs).
    event.preventDefault();
    requestClose();
  };

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.dataset.state === "closed") return;
    // Closed by the browser itself (e.g. Chromium Esc without `cancel`): no exit, clean up now.
    dialog.dataset.state = "closed";
    release();
    if (openRef.current) onOpenChangeRef.current(false);
  };

  const isScrimEvent = (event: PointerEvent<HTMLDialogElement> | MouseEvent<HTMLDialogElement>) =>
    event.target === event.currentTarget &&
    !isInsideRect(event.currentTarget, event.clientX, event.clientY);

  const handlePointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    pointerDownOnScrimRef.current = isScrimEvent(event);
  };

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    const startedOnScrim = pointerDownOnScrimRef.current;
    pointerDownOnScrimRef.current = false;
    if (startedOnScrim && isScrimEvent(event)) requestClose();
  };

  const tile = (layoutClass: string, size: number) =>
    icon ? (
      <span className={`${TILE_BASE} ${layoutClass} ${TONE_CLASSES[tone]}`}>
        <Icon name={icon} size={size} />
      </span>
    ) : null;

  const heading = (
    <h2 id={titleId} className={TITLE_CLASSES}>
      {title}
    </h2>
  );
  const describe =
    description === undefined ? null : (
      <p id={descriptionId} className={DESCRIPTION_CLASSES}>
        {description}
      </p>
    );

  return (
    <dialog
      ref={dialogRef}
      role={role === "alertdialog" ? "alertdialog" : undefined}
      aria-modal="true"
      aria-labelledby={present ? titleId : undefined}
      aria-describedby={present && description !== undefined ? descriptionId : undefined}
      className={`${DIALOG_CLASSES} ${WIDTH_CLASSES[width]}`}
      onCancel={handleCancel}
      onClose={handleClose}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      {present ? (
        <div className={WRAPPER_CLASSES}>
          {closeLabel === undefined ? (
            // Layout A (§2.3): icon tile, title, description stacked.
            <>
              {tile(TILE_A, 22)}
              {heading}
              {describe}
            </>
          ) : (
            // Layout B (§2.4): icon tile (start), title block, close button (end).
            <div className="flex shrink-0 items-start gap-[12px]">
              {tile(TILE_B, 20)}
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                {heading}
                {describe}
              </div>
              <button
                type="button"
                className={CLOSE_CLASSES}
                aria-label={closeLabel}
                onClick={requestClose}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          )}
          {children === undefined ? null : <div className={BODY_CLASSES}>{children}</div>}
          {actions === undefined ? null : <div className={ACTIONS_CLASSES}>{actions}</div>}
        </div>
      ) : null}
    </dialog>
  );
}

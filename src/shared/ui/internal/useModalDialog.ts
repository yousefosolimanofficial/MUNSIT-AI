"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  type SyntheticEvent,
} from "react";

/*
 * MUNSIT AI — shared lifecycle of the native modal `<dialog>` used by Dialog and Sheet
 * (Sheet contract D-SH6; behavior identical to Dialog contract §5 / §5.1). Internal: not exported
 * from `src/shared/ui` for features.
 *
 * - Controlled `open`; `showModal()` on open; on close `data-state="closing"`, wait for one of
 *   the caller's exit properties to finish on the element itself (or a fallback timer), then
 *   `close()`. Reopen during the exit cancels the pending `close()`.
 * - Esc (`cancel`) and scrim (press + release outside the panel) call `onOpenChange(false)`.
 * - One reference-counted scroll lock for every modal: the document's styles are saved by the
 *   first lock and restored only by the last release.
 * - One modal stack for focus: a closing modal restores focus only when focus would otherwise be
 *   lost, never outside another modal that is still open, and falls back to the opener's trigger
 *   when its own trigger is gone (Sheet → Dialog).
 */

/* ------------------------------------------------------------------ scroll lock */

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

/* ------------------------------------------------------------------ modal stack (focus) */

interface ModalEntry {
  dialog: HTMLDialogElement;
  /** Restore candidates in priority order: own trigger, then the opener modal's candidates. */
  restore: HTMLElement[];
}

const modalStack: ModalEntry[] = [];

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function topOpenModal(): ModalEntry | undefined {
  for (let i = modalStack.length - 1; i >= 0; i -= 1) {
    const entry = modalStack[i];
    if (entry?.dialog.open) return entry;
  }
  return undefined;
}

function pushModal(dialog: HTMLDialogElement): ModalEntry {
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  let opener: ModalEntry | undefined;
  for (let i = modalStack.length - 1; i >= 0 && active; i -= 1) {
    const entry = modalStack[i];
    if (entry?.dialog.contains(active)) {
      opener = entry;
      break;
    }
  }
  const entry: ModalEntry = {
    dialog,
    restore: [...(active ? [active] : []), ...(opener ? opener.restore : [])],
  };
  modalStack.push(entry);
  return entry;
}

function popModal(entry: ModalEntry): void {
  const index = modalStack.indexOf(entry);
  if (index >= 0) modalStack.splice(index, 1);
  const active = document.activeElement;
  const focusLost = active === null || active === document.body || entry.dialog.contains(active);
  if (!focusLost) return;
  const top = topOpenModal();
  const target = entry.restore.find(
    (el) => el.isConnected && !entry.dialog.contains(el) && (!top || top.dialog.contains(el)),
  );
  if (target) target.focus();
  else top?.dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();
}

/* ------------------------------------------------------------------ helpers */

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

/* ------------------------------------------------------------------ hook */

export interface ModalDialogOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** CSS properties whose `transitionend` on the element itself ends the exit. Stable constant. */
  exitProperties: readonly string[];
}

export function useModalDialog({
  open,
  onOpenChange,
  initialFocusRef,
  exitProperties,
}: ModalDialogOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Children stay mounted while open and during the exit.
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  const openRef = useRef(open);
  const onOpenChangeRef = useRef(onOpenChange);
  const exitPropertiesRef = useRef(exitProperties);
  useEffect(() => {
    openRef.current = open;
    onOpenChangeRef.current = onOpenChange;
    exitPropertiesRef.current = exitProperties;
  });

  const lockedRef = useRef(false);
  const entryRef = useRef<ModalEntry | null>(null);
  const cancelExitRef = useRef<(() => void) | null>(null);
  const pointerDownOnScrimRef = useRef(false);

  /** Scroll lock off, focus restored (per the modal stack), children unmounted. */
  const release = useCallback(() => {
    cancelExitRef.current?.();
    cancelExitRef.current = null;
    if (lockedRef.current) {
      unlockScroll();
      lockedRef.current = false;
    }
    const entry = entryRef.current;
    entryRef.current = null;
    if (entry) popModal(entry);
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
      entryRef.current = pushModal(dialog);
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
      // Only the element's own exit properties; transitions of children bubble here too.
      if (event.target === dialog && exitPropertiesRef.current.includes(event.propertyName)) {
        finishExit();
      }
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

  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // Esc: never let the browser close it; the prop decides (and the exit runs).
    event.preventDefault();
    requestClose();
  };

  const onClose = () => {
    const dialog = dialogRef.current;
    // `close` is dispatched in a later task. If the dialog was reopened (`showModal()`) before
    // the event of our own earlier `close()` arrived, the event is stale: the dialog is open
    // again, so it must not be treated as a browser close.
    if (!dialog || dialog.dataset.state === "closed" || dialog.open) return;
    // Closed by the browser itself (e.g. Chromium Esc without `cancel`): no exit, clean up now.
    dialog.dataset.state = "closed";
    release();
    if (openRef.current) onOpenChangeRef.current(false);
  };

  const isScrimEvent = (event: PointerEvent<HTMLDialogElement> | MouseEvent<HTMLDialogElement>) =>
    event.target === event.currentTarget &&
    !isInsideRect(event.currentTarget, event.clientX, event.clientY);

  const onPointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    pointerDownOnScrimRef.current = isScrimEvent(event);
  };

  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    const startedOnScrim = pointerDownOnScrimRef.current;
    pointerDownOnScrimRef.current = false;
    if (startedOnScrim && isScrimEvent(event)) requestClose();
  };

  return {
    present,
    requestClose,
    dialogProps: { ref: dialogRef, onCancel, onClose, onPointerDown, onClick },
  };
}

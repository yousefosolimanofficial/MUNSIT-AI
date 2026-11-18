"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { IconName } from "@/design-system/icons/manifest";
import { Icon } from "@/shared/ui/Icon";

/*
 * MUNSIT AI — toast system (Phase 06, Increment 4; D-U6 approved). Figma: `Settings / Toast`
 * `2462:1771` (Kind = Success / Error / Info), placements `2464:3617` / `2464:3977` / `2464:4337`.
 * Values: docs/design-values.md §15.5.
 *
 * API: `ToastProvider` (mounted once in `[locale]/layout`) and `useToast()` →
 * `{ show({ kind, message, action? }), dismiss(id) }`. All copy comes from the module.
 *
 * Behaviour (D-U6, plus the documented implementation choices marked *):
 * - Success and Info auto-dismiss after 4 s; Error stays until dismissed.
 * - The timer pauses while the toast is hovered or has focus, and *while the tab is hidden; it
 *   resumes with the time that was left.
 * - *Every toast has a close button (D-U6 requires one for Error; it also gives keyboard users a
 *   way to dismiss the others). Figma draws none; it reuses the Dialog close-button look at 32.
 * - *Stacking: up to 3 visible, newest nearest the bottom. A 4th removes the oldest Success/Info
 *   first (an Error only when all three are errors).
 * - Announcements: two persistent visually hidden live regions (polite for Success/Info,
 *   assertive for Error) receive each message once; the visible toasts are not live regions, so
 *   nothing is announced twice and timer updates announce nothing.
 * - Focus is never moved to a toast. *If a toast is dismissed while it has focus (its close or
 *   action button, or its timer), focus returns to where it was before entering the stack. The stack is fixed bottom-centre (Mobile 118 above the
 *   bottom, clear of the 84 bottom bar; 78 elsewhere; plus the safe area), and *it lets pointer
 *   events pass outside the toasts, so it never blocks controls beside them.
 * - Motion: fade + 8px rise on entry (existing tokens); opacity only under reduced motion.
 *   *No exit animation.
 */

export type ToastKind = "success" | "error" | "info";

export interface ToastAction {
  /** Visible label and accessible name (module copy). */
  label: string;
  onAction: () => void;
}

export interface ToastOptions {
  kind: ToastKind;
  /** The message (module copy). */
  message: string;
  /** Optional inline action, as the Figma Error toast's retry. Activating it dismisses the toast. */
  action?: ToastAction;
}

interface ToastEntry extends ToastOptions {
  id: string;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

/** D-U6: Success and Info auto-dismiss after 4 s. */
export const TOAST_DURATION_MS = 4000;
/** Visible at once (implementation choice, documented). */
export const TOAST_LIMIT = 3;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api === null) throw new Error("useToast needs ToastProvider (mounted in [locale]/layout)");
  return api;
}

const TONE = {
  success: {
    border: "border-accent-success-green/40",
    mark: "bg-accent-success-green",
    icon: "check",
  },
  error: { border: "border-accent-coral-pulse/40", mark: "bg-accent-coral-pulse", icon: "alert" },
  info: { border: "border-accent-info-blue/40", mark: "bg-accent-info-blue", icon: "check" },
} as const satisfies Record<ToastKind, { border: string; mark: string; icon: IconName }>;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

const STACK = [
  "pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-sm px-lg",
  "bottom-[calc(118px_+_env(safe-area-inset-bottom))] rail:bottom-[calc(78px_+_env(safe-area-inset-bottom))]",
].join(" ");

const BOX = [
  "pointer-events-auto flex min-h-[52px] w-full max-w-[420px] items-center gap-[14px]",
  "rounded-[14px] border bg-color-surface-graphite/98 px-[14px] py-[10px]",
  "shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
  "transition-[opacity,translate] duration-base ease-standard",
  "starting:opacity-0 starting:translate-y-[calc(8px*var(--motion-distance))]",
].join(" ");

const MARK =
  "flex size-[22px] shrink-0 items-center justify-center rounded-full text-surface-void-black";
const TEXT = "min-w-0 flex-1 break-words text-dashboard-body text-text-primary";
const ACTION = `shrink-0 cursor-pointer rounded-[10px] border border-accent-coral-pulse/40 bg-accent-coral-pulse/14 px-sm py-[6px] text-dashboard-body-medium text-accent-coral-pulse ${FOCUS_RING}`;
const CLOSE = `flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-accent-electric-sky/14 bg-text-primary/4 text-text-secondary ${FOCUS_RING}`;

function ToastItem({
  toast,
  closeLabel,
  onDismiss,
}: {
  toast: ToastEntry;
  closeLabel: string;
  onDismiss: (id: string, hadFocus: boolean) => void;
}) {
  const { id, kind, message, action } = toast;
  const tone = TONE[kind];
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (kind === "error") return; // persistent until dismissed (D-U6)
    const element = ref.current;
    let remaining = TOAST_DURATION_MS;
    let startedAt = 0;
    let timer: number | undefined;
    let hovered = false;
    let focused = false;

    const run = () => {
      if (timer !== undefined || hovered || focused || document.hidden) return;
      startedAt = Date.now();
      timer = window.setTimeout(
        () => onDismiss(id, element?.contains(document.activeElement) ?? false),
        remaining,
      );
    };
    const pause = () => {
      if (timer === undefined) return;
      window.clearTimeout(timer);
      timer = undefined;
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
    };
    const enter = () => {
      hovered = true;
      pause();
    };
    const leave = () => {
      hovered = false;
      run();
    };
    const focusIn = () => {
      focused = true;
      pause();
    };
    const focusOut = (event: FocusEvent) => {
      if (element?.contains(event.relatedTarget as Node | null)) return;
      focused = false;
      run();
    };
    const visibility = () => (document.hidden ? pause() : run());

    element?.addEventListener("pointerenter", enter);
    element?.addEventListener("pointerleave", leave);
    element?.addEventListener("focusin", focusIn);
    element?.addEventListener("focusout", focusOut);
    document.addEventListener("visibilitychange", visibility);
    run();
    return () => {
      window.clearTimeout(timer);
      element?.removeEventListener("pointerenter", enter);
      element?.removeEventListener("pointerleave", leave);
      element?.removeEventListener("focusin", focusIn);
      element?.removeEventListener("focusout", focusOut);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [id, kind, onDismiss]);

  return (
    <li ref={ref} data-toast={kind} className={`${BOX} ${tone.border}`}>
      <span aria-hidden="true" className={`${MARK} ${tone.mark}`}>
        <Icon name={tone.icon} size={13} />
      </span>
      <p className={TEXT}>{message}</p>
      {action ? (
        <button
          type="button"
          className={ACTION}
          onClick={() => {
            onDismiss(id, true);
            action.onAction();
          }}
        >
          {action.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label={closeLabel}
        className={CLOSE}
        onClick={() => onDismiss(id, true)}
      >
        <Icon name="x" size={16} />
      </button>
    </li>
  );
}

/** Persistent visually hidden live regions: each new message is announced exactly once. */
function Announcer({ polite, assertive }: { polite: string; assertive: string }) {
  return (
    <>
      <div
        data-toast-announcer="polite"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {polite}
      </div>
      <div
        data-toast-announcer="assertive"
        className="sr-only"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {assertive}
      </div>
    </>
  );
}

export interface ToastProviderProps {
  labels: { close: string };
  children: ReactNode;
}

export function ToastProvider({ labels, children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [announcement, setAnnouncement] = useState({ polite: "", assertive: "" });
  const nextId = useRef(0);
  /** Where focus was before it entered the stack, to return it after a focused dismissal. */
  const returnFocus = useRef<HTMLElement | null>(null);

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissFromToast = useCallback(
    (id: string, hadFocus: boolean) => {
      remove(id);
      if (!hadFocus) return;
      window.requestAnimationFrame(() => {
        const target = returnFocus.current;
        const active = document.activeElement;
        // Only if focus was lost with the toast (not if the user already moved on).
        if (active !== null && active !== document.body && active.isConnected) return;
        if (target?.isConnected) target.focus({ preventScroll: true });
      });
    },
    [remove],
  );

  const dismiss = useCallback((id: string) => remove(id), [remove]);

  const show = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    const id = `toast-${nextId.current}`;
    setToasts((current) => {
      const next = [...current, { ...options, id }];
      while (next.length > TOAST_LIMIT) {
        const index = next.findIndex((toast) => toast.kind !== "error");
        next.splice(index === -1 ? 0 : index, 1);
      }
      return next;
    });
    // Clear, then set on the next frame, so a repeated identical message is announced again.
    const key = options.kind === "error" ? "assertive" : "polite";
    setAnnouncement((current) => ({ ...current, [key]: "" }));
    window.requestAnimationFrame(() =>
      setAnnouncement((current) => ({ ...current, [key]: options.message })),
    );
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Announcer polite={announcement.polite} assertive={announcement.assertive} />
      {toasts.length > 0 ? (
        <ol
          data-toast-stack=""
          className={STACK}
          onFocus={(event) => {
            const from = event.relatedTarget;
            if (from instanceof HTMLElement && !event.currentTarget.contains(from)) {
              returnFocus.current = from;
            }
          }}
        >
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              closeLabel={labels.close}
              onDismiss={dismissFromToast}
            />
          ))}
        </ol>
      ) : null}
    </ToastContext.Provider>
  );
}

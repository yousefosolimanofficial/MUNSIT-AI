"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  NavigationGuardContext,
  type GuardRegistration,
  type NavigationGuardContextValue,
} from "@/shared/hooks/navigation-guard-context";

import { ConfirmGuardDialog, type GuardCopy, type GuardKind } from "./ConfirmGuardDialog";

/*
 * MUNSIT AI — navigation guard provider (Phase 06, D-U7; technical proof §7.1 of the plan).
 * Mounted once in `[locale]/layout`, so it covers the `(app)` and `(focus)` groups.
 *
 * Next.js 16 can cancel a navigation per `Link` (`onNavigate`), but it has no router-level block.
 * While a guard is registered, this provider therefore adds three window listeners, and removes
 * all of them when no guard is registered:
 *
 * 1. `click` (capture phase, before React and Next.js): an activation of a same-origin `<a href>`
 *    that would change the page is stopped and the dialog asks. On Leave the original click is
 *    replayed, so the link's own handlers run (for example the More sheet and drawer close
 *    themselves). Ignored: modifier and middle clicks, `target` other than `_self`, `download`,
 *    other origins (left to `beforeunload`), and links to the current page or a hash on it.
 * 2. `popstate` + one sentinel history entry (same URL, pushed through the History API, which
 *    Next.js supports): Back leaves the sentinel, so the sentinel is restored and the dialog asks.
 *    Leave goes back past the guarded entry. While the sentinel exists, Forward entries of the tab
 *    are discarded (History API semantics): a documented limitation.
 * 3. `beforeunload`: refresh, tab close, typed URLs and external links get the browser's native,
 *    unstyled prompt, only after user interaction (browser rule). No custom UI is possible.
 *
 * Programmatic navigation goes through `useGuardedRouter` → `requestNavigation`.
 */

const SENTINEL_KEY = "__munsitGuardSentinel";

type Pending =
  | { type: "link"; anchor: HTMLAnchorElement; href: string }
  | { type: "router"; navigate: () => void }
  | { type: "history" };

export interface NavigationGuardProviderProps {
  copy: Record<GuardKind, GuardCopy>;
  children: ReactNode;
}

function historyState(): Record<string, unknown> {
  const state: unknown = window.history.state;
  return state !== null && typeof state === "object" ? (state as Record<string, unknown>) : {};
}

/** A same-origin link activation that would leave the current page, or null. */
function guardedAnchor(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const target = event.target;
  const anchor = target instanceof Element ? target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target !== "" && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return null;
  }
  return anchor;
}

export function NavigationGuardProvider({ copy, children }: NavigationGuardProviderProps) {
  const router = useRouter();
  const stack = useRef<{ id: number; registration: GuardRegistration }[]>([]);
  const nextId = useRef(0);
  const [activeKind, setActiveKind] = useState<GuardKind | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  /** Token of this activation's sentinel entry (null when none). */
  const sentinel = useRef<string | null>(null);
  /** popstate events caused by the provider itself, to ignore. */
  const ownPops = useRef(0);
  /** True while the provider replays an approved link click. */
  const replaying = useRef(false);

  const sync = useCallback(() => {
    const top = stack.current.at(-1);
    setActiveKind(top ? top.registration.kind : null);
  }, []);

  const ask = useCallback((next: Pending) => {
    pendingRef.current = next;
    setPending(next);
  }, []);

  const register = useCallback(
    (registration: GuardRegistration) => {
      nextId.current += 1;
      const id = nextId.current;
      stack.current.push({ id, registration });
      sync();
      return () => {
        stack.current = stack.current.filter((entry) => entry.id !== id);
        sync();
      };
    },
    [sync],
  );

  const requestNavigation = useCallback(
    (navigate: () => void) => {
      if (stack.current.length === 0) navigate();
      else ask({ type: "router", navigate });
    },
    [ask],
  );

  const active = activeKind !== null;

  useEffect(() => {
    if (!active) return;
    const token = `${Date.now()}-${Math.random()}`;
    const onSentinel = () => historyState()[SENTINEL_KEY] === token;
    /** URL of the guarded page (where the sentinel lives). */
    let guardedHref = window.location.href;
    const pushSentinel = () => {
      guardedHref = window.location.href;
      window.history.pushState(
        { ...historyState(), [SENTINEL_KEY]: token },
        "",
        window.location.href,
      );
      sentinel.current = token;
    };

    const onClick = (event: MouseEvent) => {
      if (replaying.current) return;
      const anchor = guardedAnchor(event);
      if (anchor === null) return;
      event.preventDefault();
      event.stopPropagation();
      ask({ type: "link", anchor, href: anchor.href });
    };
    const onPopState = () => {
      if (ownPops.current > 0) {
        ownPops.current -= 1;
        return;
      }
      if (onSentinel()) return;
      // The traversal already left the guarded page (several entries at once, for example two
      // Back steps queued before this handler ran). A committed traversal cannot be cancelled,
      // so history is left untouched and the page leaves (documented limitation).
      if (window.location.href !== guardedHref) return;
      // Back left the sentinel for the guarded entry (same URL): restore it and ask.
      pushSentinel();
      ask({ type: "history" });
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Legacy browsers need a returnValue to show the prompt.
      event.returnValue = "";
    };

    // Deferred so that a React Strict Mode mount/unmount/mount pushes the sentinel only once.
    const timer = window.setTimeout(pushSentinel, 0);
    window.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
      // Still on our entry (guard turned off on the same page): drop it, so Back is not "stuck".
      if (onSentinel()) window.history.back();
      sentinel.current = null;
      ownPops.current = 0;
    };
  }, [active, ask]);

  // A guard that unregisters while asking (for example its page unmounted) closes the dialog.
  useEffect(() => {
    if (!active && pendingRef.current !== null) {
      pendingRef.current = null;
      setPending(null);
    }
  }, [active]);

  /** Removes the sentinel entry before a forward navigation, so no duplicate entry remains. */
  const dropSentinel = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (sentinel.current === null || historyState()[SENTINEL_KEY] !== sentinel.current) {
          resolve();
          return;
        }
        const done = () => {
          window.removeEventListener("popstate", done);
          resolve();
        };
        ownPops.current += 1;
        window.addEventListener("popstate", done);
        window.history.back();
      }),
    [],
  );

  const stay = useCallback(() => {
    pendingRef.current = null;
    setPending(null);
  }, []);

  const leave = useCallback(async () => {
    const next = pendingRef.current;
    pendingRef.current = null;
    setPending(null);
    if (next === null) return;
    stack.current.at(-1)?.registration.onLeave?.();

    if (next.type === "history") {
      // At the restored sentinel: go back past it and the guarded entry.
      ownPops.current += 1;
      window.history.go(-2);
      return;
    }
    await dropSentinel();
    if (next.type === "router") {
      next.navigate();
      return;
    }
    if (next.anchor.isConnected) {
      replaying.current = true;
      try {
        next.anchor.click();
      } finally {
        replaying.current = false;
      }
    } else {
      const url = new URL(next.href);
      router.push(`${url.pathname}${url.search}${url.hash}`);
    }
  }, [dropSentinel, router]);

  const value = useMemo<NavigationGuardContextValue>(
    () => ({ register, requestNavigation }),
    [register, requestNavigation],
  );

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}
      {activeKind === null ? null : (
        <ConfirmGuardDialog
          open={pending !== null}
          kind={activeKind}
          copy={copy[activeKind]}
          onStay={stay}
          onLeave={() => void leave()}
        />
      )}
    </NavigationGuardContext.Provider>
  );
}

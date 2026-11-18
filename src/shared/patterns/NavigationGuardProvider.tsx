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
 * MUNSIT AI — navigation guard provider (Phase 06, D-U7; technical proof §7.1–§7.2 of the plan).
 * Mounted once in `[locale]/layout`, so it covers the `(app)` and `(focus)` groups.
 *
 * Next.js 16 can cancel a navigation per `Link` (`onNavigate`), but it has no router-level block.
 * While a guard is registered, the provider adds the listeners below, and removes all of them when
 * no guard is registered:
 *
 * 1. `click` (window, capture phase, before React and Next.js): an activation of a same-origin
 *    `<a href>` that would change the page is stopped and the dialog asks. On Leave the original
 *    click is replayed, so the link's own handlers run (the More sheet and drawer close
 *    themselves). Ignored: modifier and middle clicks, `target` other than `_self`, `download`,
 *    other origins (left to `beforeunload`), and links to the current page or a hash on it.
 * 2. History traversal (Back, Forward, a jump from the browser's history menu):
 *    - **Navigation API** (`window.navigation`, primary): the `navigate` event of a same-document
 *      traversal is cancelled and the dialog asks; Leave goes to the exact entry the user chose
 *      (`traverseTo`). **History is never modified**, so Forward entries are kept. A traversal
 *      that the browser marks non-cancelable (cross-document) is left to `beforeunload`.
 *    - **Fallback** (browsers without the Navigation API): one same-URL sentinel entry + `popstate`.
 *      Back leaves the sentinel, so it is restored and the dialog asks. Limitations (documented):
 *      Forward entries are discarded while active, and a multi-entry jump cannot be stopped.
 * 3. `beforeunload`: refresh, tab close, typed URLs and external links get the browser's native,
 *    unstyled prompt, only after user interaction (browser rule). No custom UI is possible. An approved
 *    Leave authorizes at most one prompt, and only for a traversal that leaves the document.
 *
 * Programmatic navigation goes through `useGuardedRouter` → `requestNavigation`; ESLint forbids a
 * raw `useRouter` elsewhere (eslint.config.mjs).
 */

const SENTINEL_KEY = "__munsitGuardSentinel";

/**
 * Fallback only (no Navigation API): how long an approved `history.go(-2)` may authorize one
 * `beforeunload`, in case that traversal leaves the document. The fallback cannot observe a
 * traversal that silently does nothing, so this bounds the authorization. App-controlled paths are
 * never affected by it.
 */
const FALLBACK_UNLOAD_AUTH_MS = 1500;

type Pending =
  | { type: "link"; anchor: HTMLAnchorElement; href: string }
  | { type: "router"; navigate: () => void }
  | { type: "traverse"; key: string }
  | { type: "history" };

export interface NavigationGuardProviderProps {
  copy: Record<GuardKind, GuardCopy>;
  children: ReactNode;
}

/** The page identity the guard protects: path and query (a hash change stays on the page). */
function pageOf(href: string): string {
  const url = new URL(href);
  return `${url.pathname}${url.search}`;
}

function historyState(): Record<string, unknown> {
  const state: unknown = window.history.state;
  return state !== null && typeof state === "object" ? (state as Record<string, unknown>) : {};
}

/** The Navigation API when the browser has it (Chromium, Edge; others vary), else null. */
function navigationApi(): Navigation | null {
  const candidate: unknown = (window as { navigation?: unknown }).navigation;
  return candidate instanceof EventTarget && "traverseTo" in candidate
    ? (candidate as Navigation)
    : null;
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
  /** Fallback only: token of this activation's sentinel entry (null when none). */
  const sentinel = useRef<string | null>(null);
  /** Fallback only: popstate events caused by the provider itself, to ignore. */
  const ownPops = useRef(0);
  /** True while the provider replays an approved link click. */
  const replaying = useRef(false);
  /*
   * Navigation-specific authorization after an approved Leave (no time window):
   * - `authorizedKey`: the one history entry the user approved; it passes once.
   * - `authorizedUnload`: one `beforeunload` may pass, only while the approved traversal can
   *   still unload the document (cross-document). Cleared when the traversal turns out to be
   *   same-document, settles, fails, or the activation ends.
   * Link and router Leaves need neither: the approved click is replayed synchronously
   * (`replaying`), and `navigate()` runs directly without passing the guard.
   */
  const authorizedKey = useRef<string | null>(null);
  const authorizedUnload = useRef(false);
  /** URL of the guarded page for the current activation. */
  const guardedHref = useRef("");

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
    guardedHref.current = pageOf(window.location.href);
    authorizedKey.current = null;
    authorizedUnload.current = false;
    /**
     * The approved navigation has committed (the URL is no longer the guarded page's), and this
     * page is only waiting to unmount: it must not swallow anything the user does next.
     */
    const departed = () => pageOf(window.location.href) !== guardedHref.current;

    const onClick = (event: MouseEvent) => {
      if (replaying.current || departed()) return;
      const anchor = guardedAnchor(event);
      if (anchor === null) return;
      event.preventDefault();
      event.stopPropagation();
      ask({ type: "link", anchor, href: anchor.href });
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (authorizedUnload.current) {
        authorizedUnload.current = false; // exactly one
        return;
      }
      if (departed()) return;
      event.preventDefault();
      // Legacy browsers need a returnValue to show the prompt.
      event.returnValue = "";
    };
    window.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    const removeCommon = () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      authorizedKey.current = null;
      authorizedUnload.current = false;
    };

    const navigation = navigationApi();
    if (navigation !== null) {
      const onNavigate = (event: NavigateEvent) => {
        if (event.navigationType !== "traverse") return;
        if (authorizedKey.current !== null && event.destination.key === authorizedKey.current) {
          authorizedKey.current = null; // exactly once
          // Same-document: no unload follows, so no prompt is authorized any more.
          if (event.cancelable) authorizedUnload.current = false;
          return;
        }
        if (departed()) return;
        // A traversal that only changes the hash stays on the guarded page: nothing to ask.
        if (pageOf(event.destination.url) === guardedHref.current) return;
        if (!event.cancelable) return; // cross-document: beforeunload's job
        event.preventDefault();
        ask({ type: "traverse", key: event.destination.key });
      };
      navigation.addEventListener("navigate", onNavigate);
      return () => {
        removeCommon();
        navigation.removeEventListener("navigate", onNavigate);
      };
    }

    // Fallback: sentinel history entry.
    const token = `${Date.now()}-${Math.random()}`;
    const onSentinel = () => historyState()[SENTINEL_KEY] === token;
    const pushSentinel = () => {
      guardedHref.current = pageOf(window.location.href);
      window.history.pushState(
        { ...historyState(), [SENTINEL_KEY]: token },
        "",
        window.location.href,
      );
      sentinel.current = token;
    };
    const onPopState = () => {
      if (ownPops.current > 0) {
        ownPops.current -= 1;
        authorizedUnload.current = false; // the approved traversal stayed in this document
        return;
      }
      if (onSentinel()) return;
      // The traversal already left the guarded page (a multi-entry jump). A committed traversal
      // cannot be cancelled, so history is left untouched and the page leaves (limitation).
      if (departed()) return;
      // Back left the sentinel for the guarded entry (same URL): restore it and ask.
      pushSentinel();
      ask({ type: "history" });
    };
    // Deferred so that a React Strict Mode mount/unmount/mount pushes the sentinel only once.
    const timer = window.setTimeout(pushSentinel, 0);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.clearTimeout(timer);
      removeCommon();
      window.removeEventListener("popstate", onPopState);
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

  /** Fallback only: removes the sentinel before a forward navigation (no duplicate entry). */
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

    if (next.type === "traverse") {
      const navigation = navigationApi();
      if (navigation === null) return;
      authorizedKey.current = next.key;
      authorizedUnload.current = true;
      const clear = () => {
        authorizedKey.current = null;
        authorizedUnload.current = false;
      };
      // A failed or completed traversal ends the authorization; the guard stays on.
      void navigation.traverseTo(next.key).finished?.then(clear, clear);
      return;
    }
    if (next.type === "history") {
      // Fallback, at the restored sentinel: go back past it and the guarded entry.
      authorizedUnload.current = true;
      window.setTimeout(() => {
        authorizedUnload.current = false;
      }, FALLBACK_UNLOAD_AUTH_MS);
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

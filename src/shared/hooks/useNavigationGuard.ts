"use client";

import { useContext, useEffect, useMemo, useRef } from "react";

import { useRouter } from "@/i18n/navigation";
import type { GuardKind } from "@/shared/patterns/ConfirmGuardDialog";

import { NavigationGuardContext } from "./navigation-guard-context";

/*
 * MUNSIT AI — navigation guard hooks (Phase 06, D-U7). Plan: docs/phases/phase-06-plan.md §7.
 *
 * `useNavigationGuard({ when, kind })`: while `when` is true, leaving the page asks first.
 * - App-controlled navigation (internal links, `useGuardedRouter`, browser Back within the app)
 *   opens the shared `ConfirmGuardDialog`.
 * - Browser-controlled navigation (refresh, tab close, typed URL, external links) can only use
 *   the browser's native `beforeunload` prompt: unstyled, browser-dependent, and shown only after
 *   the user has interacted with the page.
 * While `when` is false nothing is registered: no listener, no history entry, no prompt.
 */

export interface NavigationGuardOptions {
  /** The module's condition (for example "unsaved changes exist"). */
  when: boolean;
  kind: GuardKind;
  /** Optional cleanup just before an approved Leave. */
  onLeave?: () => void;
}

export function useNavigationGuard({ when, kind, onLeave }: NavigationGuardOptions): void {
  const context = useContext(NavigationGuardContext);
  if (context === null) {
    throw new Error(
      "useNavigationGuard needs NavigationGuardProvider (mounted in [locale]/layout)",
    );
  }
  const onLeaveRef = useRef(onLeave);
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  const { register } = context;
  useEffect(() => {
    if (!when) return;
    return register({ kind, onLeave: () => onLeaveRef.current?.() });
  }, [when, kind, register]);
}

type LocaleRouter = ReturnType<typeof useRouter>;

/**
 * The locale-aware router with `push` and `replace` routed through the active guard. Without a
 * provider (for example isolated component tests) it behaves exactly like the plain router.
 */
export function useGuardedRouter(): LocaleRouter {
  const router = useRouter();
  const context = useContext(NavigationGuardContext);
  return useMemo(() => {
    if (context === null) return router;
    const { requestNavigation } = context;
    return {
      ...router,
      push: (...args: Parameters<LocaleRouter["push"]>) =>
        requestNavigation(() => router.push(...args)),
      replace: (...args: Parameters<LocaleRouter["replace"]>) =>
        requestNavigation(() => router.replace(...args)),
    };
  }, [router, context]);
}

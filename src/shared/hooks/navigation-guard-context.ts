"use client";

import { createContext } from "react";

import type { GuardKind } from "@/shared/patterns/ConfirmGuardDialog";

/*
 * Navigation guard context (Phase 06, D-U7). The provider is `NavigationGuardProvider`
 * (src/shared/patterns), mounted once in the `[locale]` layout. Modules use the hooks in
 * `useNavigationGuard.ts`, never this context directly.
 */

export interface GuardRegistration {
  kind: GuardKind;
  /** Optional cleanup run just before an approved Leave. */
  onLeave?: () => void;
}

export interface NavigationGuardContextValue {
  /** Registers an active guard; returns its unregister function. The latest one wins. */
  register: (registration: GuardRegistration) => () => void;
  /**
   * Programmatic navigation through the guard: runs `navigate` at once when no guard is active,
   * otherwise asks first and runs it only after Leave.
   */
  requestNavigation: (navigate: () => void) => void;
}

export const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(null);

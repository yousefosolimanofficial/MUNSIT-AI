import type { ReactNode } from "react";

/**
 * `(focus)` route group (Phase 04): focused workflows without global navigation — Flashcards
 * Study Mode only (ADR-003: folder workflows are dialogs, not focus routes). Minimal by design;
 * the focus chrome (a working Exit control) comes with the module.
 */
export default function FocusGroupLayout({ children }: { children: ReactNode }) {
  return children;
}

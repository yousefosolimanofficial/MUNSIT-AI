import type { ReactNode } from "react";

/**
 * `(app)` route group (Phase 04): the module routes that will live inside the shared app shell.
 * Deliberately minimal — the shell (Sidebar, Rail, Drawer, bottom bar) replaces this in Phase 05.
 */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return children;
}

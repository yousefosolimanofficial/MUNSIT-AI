import type { ReactNode } from "react";

import { AppShell } from "@/shared/layout/AppShell";

/**
 * `(app)` route group: every module route renders inside the shared app shell (Phase 05).
 * `(focus)` and the other groups stay shell-less.
 */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

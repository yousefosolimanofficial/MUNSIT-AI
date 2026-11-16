import type { ReactNode } from "react";

import { AppShellView } from "./AppShellView";
import { getShellLabels } from "./shell-labels";

/**
 * MUNSIT AI app shell (Phase 05): the `(app)` route group layout renders this once, so module
 * phases only render content inside it. Resolves the shell copy on the server, then renders
 * the layout (`AppShellView`).
 */
export async function AppShell({ children }: { children: ReactNode }) {
  const labels = await getShellLabels();
  return <AppShellView labels={labels}>{children}</AppShellView>;
}

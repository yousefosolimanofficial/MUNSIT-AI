import type { ReactNode } from "react";

/**
 * Settings layout (Phase 04, plan §8.3): reserved for the Settings secondary navigation, whose
 * data already lives in `SETTINGS_NAV` (`src/shared/navigation/nav-registry.ts`). The navigation
 * UI itself is built later (Phase 05/20); for now the layout only renders its page.
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}

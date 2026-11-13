import type { ReactNode } from "react";

/**
 * Isolates a left-to-right run (numbers with separators, English terms, codes) inside RTL text,
 * so the surrounding Arabic cannot reorder it — e.g. `74% · 92 · 12/30` or `5: AVL Trees`.
 * Renders a native `<bdi dir="ltr">` (`unicode-bidi: isolate`): no styling, no client JS.
 * Use for every embedded LTR run in Arabic UI (user decision 2026-11-13). In next-intl messages,
 * map a rich-text tag to it: `t.rich("key", { ltr: (chunks) => <Ltr>{chunks}</Ltr> })`.
 */
export function Ltr({ children }: { children: ReactNode }) {
  return <bdi dir="ltr">{children}</bdi>;
}

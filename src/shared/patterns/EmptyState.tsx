import type { ReactNode } from "react";

import type { IconName } from "@/design-system/icons/manifest";
import { Icon } from "@/shared/ui/Icon";

/*
 * MUNSIT AI — EmptyState (Phase 06). Assignment: docs/phases/phase-06-empty-state-starter.md.
 * Figma (values in docs/design-values.md §15.3):
 * - `default`: `Shared / Empty State` 2389:4037 (NoSummaries 2389:4004, NoResults 2389:4017,
 *   NoLectures 2389:4027); used by Notes 2433:7748–2433:7796.
 * - `compact`: Dashboard `First-Time Empty State` 2482:2130 (Tablet 2482:2661, Mobile 2482:3155).
 *   Tighter box (padding 48/32, radius 20) but a larger icon tile (72) than `default` (64), as drawn.
 *
 * - Server Component: no state or effects, so no "use client".
 * - Static content: no hover, pressed, focus trap, auto-focus, motion or transform. No `role`.
 * - Every text comes from props; the component holds no copy of its own.
 * - Centred layout with symmetric padding and no `dir`: identical in RTL and LTR. The icon is
 *   never mirrored (none of the tile icons is in the mirror whitelist).
 * - Colors come only from tokens and opacity modifiers. No literal hex values.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

export type EmptyStateVariant = "default" | "compact";

export interface EmptyStateProps {
  /** Default "default". */
  variant?: EmptyStateVariant;
  /** Decorative icon in the tile (hidden from assistive technology). */
  icon: IconName;
  /** Visible heading text (module copy). */
  title: string;
  /** Optional supporting sentence (module copy). */
  description?: string;
  /** Up to two actions, passed by the module (for example shared `Button`s). Rendered in order. */
  actions?: ReactNode;
  /** Optional small note under the actions (module copy). */
  footnote?: string;
  /** Heading level of the title. Default 2. */
  headingLevel?: 2 | 3;
}

interface VariantStyle {
  box: string;
  tile: string;
  iconSize: number;
}

/** Shared box layout (§5): full width, vertical stack, centred, gap 16, Obsidian 88%. */
const BOX_BASE =
  "flex w-full min-w-0 flex-col items-center gap-md text-center bg-surface-obsidian/88 border";

/** Shared tile layout: centred icon, Sky 12% fill, Sky icon color. */
const TILE_BASE =
  "flex shrink-0 items-center justify-center bg-accent-electric-sky/12 border text-accent-electric-sky";

/** Local component constants (not tokens, CLAUDE.md): padding 56/40, radius 18, tile 64/72. */
const VARIANT_STYLES: Record<EmptyStateVariant, VariantStyle> = {
  /** Padding 56 block / 40 inline, radius 24, Sky 12% border; tile 64, radius 18, Sky 25%; icon 28. */
  default: {
    box: `${BOX_BASE} py-[56px] px-[40px] rounded-2xl border-accent-electric-sky/12`,
    tile: `${TILE_BASE} size-[64px] rounded-[18px] border-accent-electric-sky/25`,
    iconSize: 28,
  },
  /** Padding 48 block / 32 inline, radius 20, Sky 14% border; tile 72, radius 20, Sky 40%; icon 32. */
  compact: {
    box: `${BOX_BASE} py-[48px] px-xl rounded-xl border-accent-electric-sky/14`,
    tile: `${TILE_BASE} size-[72px] rounded-xl border-accent-electric-sky/40`,
    iconSize: 32,
  },
};

const TITLE_CLASSES = "text-dashboard-title-l text-text-primary text-center";
const DESCRIPTION_CLASSES = "text-dashboard-body text-text-secondary text-center";
const ACTIONS_CLASSES = "flex flex-wrap items-center justify-center gap-sm";
const FOOTNOTE_CLASSES = "text-dashboard-caption text-text-secondary text-center";

export function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  actions,
  footnote,
  headingLevel = 2,
}: EmptyStateProps) {
  const style = VARIANT_STYLES[variant];
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <div className={style.box}>
      <div className={style.tile}>
        <Icon name={icon} size={style.iconSize} />
      </div>
      <Heading className={TITLE_CLASSES}>{title}</Heading>
      {description ? <p className={DESCRIPTION_CLASSES}>{description}</p> : null}
      {actions ? <div className={ACTIONS_CLASSES}>{actions}</div> : null}
      {footnote ? <p className={FOOTNOTE_CLASSES}>{footnote}</p> : null}
    </div>
  );
}

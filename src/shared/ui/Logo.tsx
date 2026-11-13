import Image from "next/image";

import { LOGO_ASSETS, type LogoVariant } from "@/design-system/brand";

/**
 * Default alt text for every variant: the product name as written in the Frontend Handoff
 * (user decision 2026-11-13). Latin text, so the image is marked `lang="en"` inside Arabic
 * pages. When the name is already visible or announced next to the logo, pass `decorative`
 * so screen readers do not repeat it.
 */
const BRAND_NAME = "MUNSIT AI";

export interface LogoProps {
  /** full = roomy placements · horizontal = Sidebar, headers, Auth · symbol = Rail, compact. */
  variant: LogoVariant;
  /** Rendered height in px, taken from the Figma placement. Width follows the original ratio. */
  height: number;
  /**
   * `true` when the brand name is already conveyed nearby (visible text or a labelled parent),
   * so the image is hidden from assistive tech (`alt=""`) and the name is not read twice.
   * Default `false`: alt = "MUNSIT AI" — e.g. a logo that is the only content of a home link.
   */
  decorative?: boolean;
  /** Preload when the logo is above the fold on first paint (e.g. Landing header). */
  preload?: boolean;
  className?: string;
}

/**
 * Official MUNSIT AI logo — Server Component, no client JavaScript.
 *
 * - Serves the original PNG unmodified (`unoptimized`): no re-encoding, so gradients and colors
 *   stay exactly as exported.
 * - Intrinsic width/height attributes reserve space (no layout shift); CSS sets the height and
 *   lets width follow the ratio. If a container is narrower, `max-width: 100%` with
 *   `object-fit: contain` shrinks it without distortion (Design System Reference §6).
 * - Never mirrored: an image is not flipped by `dir="rtl"`, and the component applies no
 *   transform. Do not add glow, animation or effects without approval.
 */
export function Logo({
  variant,
  height,
  decorative = false,
  preload = false,
  className,
}: LogoProps) {
  const asset = LOGO_ASSETS[variant];
  const width = Math.round((height * asset.width) / asset.height);

  return (
    <Image
      src={asset.src}
      width={width}
      height={height}
      alt={decorative ? "" : BRAND_NAME}
      lang={decorative ? undefined : "en"}
      unoptimized
      preload={preload}
      draggable={false}
      data-logo={variant}
      className={className}
      style={{ height, width: "auto", maxWidth: "100%", objectFit: "contain" }}
    />
  );
}

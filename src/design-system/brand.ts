/**
 * MUNSIT AI — official logo assets (Phase 02).
 *
 * Source: Design System Reference §6. Files are the original exports, copied byte-for-byte to
 * public/brand/ (verified by brand.test.ts against the PNG headers). Never edit, redraw,
 * recolor, crop or mirror them.
 *
 * Placement (Design System Reference §6, Roadmap Phases 05 / 07 / 08):
 * - full:       roomy placements only; never in compact navigation.
 * - horizontal: Desktop Sidebar, Mobile header, Auth, Landing nav and footer.
 * - symbol:     Tablet Rail and other compact areas.
 */

export const LOGO_VARIANTS = ["full", "horizontal", "symbol"] as const;
export type LogoVariant = (typeof LOGO_VARIANTS)[number];

export interface LogoAsset {
  /** Public URL of the original PNG (transparent background). */
  src: string;
  /** Intrinsic size in px — the aspect ratio every placement must keep. */
  width: number;
  height: number;
  /** Figma component node (Design System Reference §6). */
  figmaNode: string;
}

export const LOGO_ASSETS: Readonly<Record<LogoVariant, LogoAsset>> = {
  full: { src: "/brand/Munsit_Logo_Full.png", width: 1228, height: 236, figmaNode: "2818:7240" },
  horizontal: {
    src: "/brand/Munsit_Logo_Horizontal.png",
    width: 908,
    height: 236,
    figmaNode: "2818:7242",
  },
  symbol: { src: "/brand/Munsit_Logo_Symbol.png", width: 372, height: 236, figmaNode: "2818:7244" },
};

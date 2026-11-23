/*
 * Authentication marketing photos (Phase 08 Increment 1, D-08-2 and owner decision 2026-11-23).
 *
 * Exported from the Figma originals (read-only) at their source size, matched by the Figma image
 * hash (the SHA-1 of the source bytes), and saved as PNG without regeneration, recolouring or
 * cropping (pixel-identical to the source). Served through `next/image`. Sources and checksums:
 * docs/design-values.md §17.
 */

export type AuthFamily = "login" | "register" | "recovery";

export interface AuthImage {
  src: string;
  width: number;
  height: number;
}

/** Marketing panel photo per screen family (Forgot and Reset share the recovery photo). */
export const AUTH_IMAGES: Readonly<Record<AuthFamily, AuthImage>> = {
  /** Figma image `10ec5a97e7…`, Login panel (`2175:285`). */
  login: { src: "/auth/login.png", width: 1200, height: 896 },
  /** Figma image `53cf19a01a…`, Register panel (`2175:400`). */
  register: { src: "/auth/register.png", width: 1200, height: 896 },
  /** Figma image `f246a9bb43…`, Forgot and Reset panels (`2175:408`). */
  recovery: { src: "/auth/recovery.png", width: 1264, height: 848 },
};

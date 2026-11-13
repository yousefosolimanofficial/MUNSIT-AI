import { createElement } from "react";

import { ICON_GEOMETRY } from "@/design-system/icons/geometry.generated";
import { ICON_MANIFEST, ICON_NATIVE_SIZE, type IconName } from "@/design-system/icons/manifest";

export interface IconProps {
  /** One of the 40 official icons (src/design-system/icons/manifest.ts). */
  name: IconName;
  /**
   * Rendered size in px, taken from the Figma placement: `ICON_SIZES.sidebar` / `.rail` (20),
   * `.mobileNav` (22), `.moreSheet` (18), or the placement's own size. Default 24 (native).
   */
  size?: number;
  /**
   * Accessible name when the icon carries meaning on its own (e.g. an icon-only button has no
   * other label). Omit for decorative icons next to visible text: they are hidden from
   * assistive technology.
   */
  label?: string;
  /** Color comes from `currentColor`: set it with a text color utility (e.g. `text-text-secondary`). */
  className?: string;
}

/**
 * Official MUNSIT AI icon — Server Component, no client JavaScript.
 *
 * - Geometry is the Figma export, unchanged (24×24 viewBox, paths, caps, joins).
 * - Stroke stays 1.75 px at every size (`vector-effect: non-scaling-stroke`), exactly like
 *   resized icon instances in Figma, which keep a 1.75 stroke while the drawing scales.
 * - Color is `currentColor`, so it always comes from a Design System color utility.
 * - Direction: rendered as drawn in RTL (the design is RTL-native). Icons with
 *   `mirrorInLtr` (only `arrowLeft`) flip horizontally when their nearest `dir` is LTR, via
 *   `scale: calc(var(--motion-dir) * -1) 1` — `--motion-dir` is 1 under `[dir=ltr]` and -1 under
 *   `[dir=rtl]` (motion.css) and inherits, so the nearest `dir` always wins. Not used:
 *   Tailwind `ltr:` (also matches `[dir="ltr"] *`, ignoring a nearer dir="rtl") and `:dir()`
 *   (the CSS toolchain down-levels it to a `:lang()` polyfill that judges by language).
 */
/** Flip horizontally only when the nearest `dir` is LTR (see component docs). */
const MIRROR_IN_LTR = "[scale:calc(var(--motion-dir)*-1)_1]";

export function Icon({ name, size = ICON_NATIVE_SIZE, label, className }: IconProps) {
  const mirror = ICON_MANIFEST[name].mirrorInLtr;
  const classes = [mirror ? MIRROR_IN_LTR : null, className].filter(Boolean).join(" ");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      data-icon={name}
      className={classes || undefined}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true, focusable: "false" })}
    >
      {ICON_GEOMETRY[name].map(([tag, props], index) =>
        createElement(tag, { key: index, ...props, vectorEffect: "non-scaling-stroke" }),
      )}
    </svg>
  );
}

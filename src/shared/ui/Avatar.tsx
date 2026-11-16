"use client";

import { useEffect, useRef, useState, type Ref } from "react";

import { Icon } from "./Icon";

/*
 * MUNSIT AI — Avatar (Phase 03, Avatar V1). Contract: docs/phases/phase-03-avatar-contract.md.
 * Figma: Top Bar avatar `2211:179`, User Menu avatar `2236:790`, `Profile / Avatar` `2461:651`.
 *
 * - Sizes 40 and 96 only (D-AV2). One fill for both: Electric Sky −80% → Cobalt Edge 71%, 135°,
 *   white initials (D-AV1, N-1/N-2: ≥ 5:1 everywhere in the circle).
 * - Real image → initials on error or without image → `user` placeholder (D-AV4).
 * - Initials from the name (D-AV3): 1 grapheme at 40, first + last word at 96, combining marks
 *   kept, joined with U+200C so Arabic letters never join.
 * - Meaningful avatars require a name and are announced once (`role="img"` + label);
 *   decorative avatars (or names without a letter) are hidden from assistive technology (D-AV5).
 * - Static and non-interactive: no hover, focus or motion (D-AV6).
 *
 * Client Component: the image error fallback needs state. Tailwind reads class names from source
 * text, so every class below is written in full.
 */

export const AVATAR_SIZES = [40, 96] as const;
export type AvatarSize = (typeof AVATAR_SIZES)[number];

interface AvatarBaseProps {
  /** Default 40. */
  size?: AvatarSize;
  /** Optional image; falls back to the initials when it fails to load. */
  src?: string;
  /** Forwarded to the root `<span>` (React 19 passes `ref` as a prop). */
  ref?: Ref<HTMLSpanElement>;
  /** Layout only (margin, alignment). Merged last. */
  className?: string;
}

/** Meaningful avatar: announced as an image named by `name`. */
export interface MeaningfulAvatarProps extends AvatarBaseProps {
  name: string;
  decorative?: false;
}

/** Decorative avatar: hidden from assistive technology; `name` only feeds the initials. */
export interface DecorativeAvatarProps extends AvatarBaseProps {
  decorative: true;
  name?: string;
}

export type AvatarProps = MeaningfulAvatarProps | DecorativeAvatarProps;

const ROOT_CLASSES =
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full select-none";

/** D-AV1: the stop at −80% keeps white initials ≥ 5:1 everywhere in the circle (contract §2.4). */
const GRADIENT_FILL =
  "bg-[linear-gradient(135deg,var(--color-accent-electric-sky)_-80%,var(--color-accent-cobalt-edge)_71%)]";

/** Figma Photo placeholder (`2461:628`): Graphite fill, `user` icon in Text / Secondary. */
const PLACEHOLDER_FILL = "bg-color-surface-graphite text-text-secondary";

const SIZE_CLASSES = {
  40: "size-[40px] border border-accent-electric-sky/40",
  96: "size-[96px] border-2 border-accent-electric-sky/50",
} as const satisfies Record<AvatarSize, string>;

const INITIALS_CLASSES = {
  40: "text-dashboard-card-title text-text-primary",
  96: "text-dashboard-title-l text-text-primary",
} as const satisfies Record<AvatarSize, string>;

/** Icon 44 at 96 (Figma); 18 at 40 (N-4, the project's small icon size). */
const PLACEHOLDER_ICON_SIZE = { 40: 18, 96: 44 } as const satisfies Record<AvatarSize, number>;

const IMAGE_CLASSES = "size-full object-cover";

/** Zero-width non-joiner: keeps two Arabic initials in their isolated forms. */
const ZWNJ = "\u200C";

const LETTER = /\p{L}/u;
const STARTS_WITH_LETTER = /^\p{L}/u;

const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function graphemes(word: string): string[] {
  return graphemeSegmenter
    ? [...graphemeSegmenter.segment(word)].map((part) => part.segment)
    : Array.from(word);
}

/** First grapheme that starts with a letter (combining marks stay with it). */
function firstLetter(word: string): string {
  const grapheme = graphemes(word).find((part) => STARTS_WITH_LETTER.test(part)) ?? "";
  return grapheme.toUpperCase(); // Latin upper-cased; Arabic has no case
}

/**
 * Initials (contract §5.3): words split on any whitespace, words without a letter skipped;
 * size 40 → first word; size 96 → first + last word. Empty string when the name has no letter.
 */
export function avatarInitials(name: string | undefined, size: AvatarSize): string {
  const words = (name ?? "")
    .trim()
    .split(/\s+/u)
    .filter((word) => LETTER.test(word));
  const first = words[0];
  if (first === undefined) return "";
  const last = words.at(-1);
  if (size === 40 || words.length === 1 || last === undefined) return firstLetter(first);
  return `${firstLetter(first)}${ZWNJ}${firstLetter(last)}`;
}

export function Avatar(props: AvatarProps) {
  const { size = 40, src, ref, className, name } = props;
  // Error state is keyed by `src`, so a new image is tried again without an effect.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const initials = avatarInitials(name, size);
  const showImage = typeof src === "string" && src !== "" && failedSrc !== src;
  const placeholder = !showImage && initials === "";
  const trimmedName = (name ?? "").trim();
  // A meaningful avatar needs a name with a letter; otherwise it is decorative (no empty label).
  const meaningful = props.decorative !== true && initials !== "";

  // A server-rendered image can fail before hydration attaches `onError`: detect it on mount.
  useEffect(() => {
    const image = imageRef.current;
    if (image && src && image.complete && image.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  const classes = [
    ROOT_CLASSES,
    SIZE_CLASSES[size],
    placeholder ? PLACEHOLDER_FILL : GRADIENT_FILL,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={ref}
      className={classes}
      {...(meaningful ? { role: "img", "aria-label": trimmedName } : { "aria-hidden": true })}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- image host not verified; next/image needs next.config (contract §5)
        <img
          ref={imageRef}
          src={src}
          alt=""
          decoding="async"
          draggable={false}
          className={IMAGE_CLASSES}
          onError={() => setFailedSrc(src)}
        />
      ) : placeholder ? (
        <Icon name="user" size={PLACEHOLDER_ICON_SIZE[size]} />
      ) : (
        <span dir="auto" aria-hidden="true" className={INITIALS_CLASSES[size]}>
          {initials}
        </span>
      )}
    </span>
  );
}

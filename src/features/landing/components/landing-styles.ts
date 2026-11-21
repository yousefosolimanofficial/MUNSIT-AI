import type { CSSProperties } from "react";

/*
 * Landing-local style constants (Phase 07). Values come from Figma (design-values §16); none is a
 * new design token.
 */

/** Focus ring, D-B2 (same as the shared Button). */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/**
 * Desktop navigation border `#363739`: a Landing-local Figma value, approved by the owner
 * (2026-11-19) as local, not a global token (design-values §16.5).
 */
export const NAV_BORDER = "border-[#363739]";

/*
 * Visual Refinement (P07-D17, plan §8e; owner approval 2026-11-20). Atmosphere over the approved
 * Near Black base: soft radial gradients built only from the colour tokens Cobalt Edge (#143ca3)
 * and Electric Sky (#63a1ff), at low strength. No cyan (P07-D9: video only), no blur filters (cost),
 * no continuous animation (motion foundation): glows fade in once, with their section.
 */

const sky = (percent: number) =>
  `color-mix(in srgb, var(--color-accent-electric-sky) ${percent}%, transparent)`;
const cobalt = (percent: number) =>
  `color-mix(in srgb, var(--color-accent-cobalt-edge) ${percent}%, transparent)`;

/** Decorative glow layer: fills its (relative, isolated) section, never overflows it. */
export const AMBIENT_LAYER = "pointer-events-none absolute inset-0 -z-10";

/** Showcase glow falloff band (see AMBIENT.showcase): the layer's `::after`, at its bottom edge. */
export const SHOWCASE_GLOW_FALLOFF = [
  "after:absolute after:inset-x-0 after:bottom-0 after:h-[48px] rail:after:h-[96px] xl:after:h-[160px]",
  "after:bg-linear-to-b after:from-transparent after:to-surface-void-black",
].join(" ");

export const AMBIENT = {
  /** Hero base (seen on Mobile, before playback and under reduced motion): a cobalt bloom from the
   *  top and a faint sky haze low behind the actions. */
  hero: {
    backgroundImage: [
      // Centred low enough to reach transparent before the Hero's top edge (no seam under the
      // Mobile and Tablet header, which sits outside the Hero).
      `radial-gradient(ellipse 85% 27% at 50% 30%, ${cobalt(42)}, transparent 100%)`,
      `radial-gradient(ellipse 60% 40% at 50% 92%, ${sky(9)}, transparent 70%)`,
    ].join(", "),
  },
  /*
   * Hero text contrast corrections over the static Figma image (owner-approved, P07-D21,
   * 2026-11-20). Soft, localized Void Black radial darkening behind the text only: flat in the
   * centre, transparent at the edges (no visible box, no blur). The image is not changed.
   * Strengths are the smallest steps that keep every pixel under the text's line boxes at or above
   * the WCAG threshold with a margin, measured on the composited page (phase-07-static-hero.md §5).
   */
  /** Description, Tablet (720–1279, 20 px, 4.5:1): 40%. 0.30 fails; 0.35 leaves 0.03. */
  heroTextScrim: {
    backgroundImage:
      "radial-gradient(closest-side, rgb(4 5 6 / 0.4) 0%, rgb(4 5 6 / 0.4) 65%, rgb(4 5 6 / 0) 100%)",
  },
  /** Description, Mobile (< 720, 16 px, 4.5:1): 30%. English at 320 needs it; 0.25 leaves 0.07. */
  heroTextScrimMobile: {
    backgroundImage:
      "radial-gradient(closest-side, rgb(4 5 6 / 0.3) 0%, rgb(4 5 6 / 0.3) 65%, rgb(4 5 6 / 0) 100%)",
  },
  /** Heading, every breakpoint (large text, 3:1): 20% with a wide flat core (75%), so the bright
   *  hologram glints near the heading's start are inside it. 0.15 and a narrower core fail. */
  heroHeadingScrim: {
    backgroundImage:
      "radial-gradient(closest-side, rgb(4 5 6 / 0.2) 0%, rgb(4 5 6 / 0.2) 75%, rgb(4 5 6 / 0) 100%)",
  },
  /** Hero bottom edge: fades the media into the page base, so the section boundary disappears. */
  heroFade: {
    backgroundImage: "linear-gradient(to bottom, transparent, var(--color-surface-void-black))",
  },
  /** Hero top edge: the same fade from the page base, so the media never starts on a hard line
   *  (Tablet: the header sits above the Hero; Desktop: it darkens under the floating bar). */
  heroFadeTop: {
    backgroundImage: "linear-gradient(to top, transparent, var(--color-surface-void-black))",
  },
  /** Showcase: light diffusing from behind the app window, plus a cobalt floor. */
  showcase: {
    backgroundImage: [
      // Centred low enough to reach transparent before the section's top edge (no seam).
      `radial-gradient(ellipse 60% 19% at 50% 21%, ${cobalt(34)}, transparent 100%)`,
      `radial-gradient(ellipse 66% 52% at 50% 66%, ${sky(17)}, transparent 72%)`,
      `radial-gradient(ellipse 98% 66% at 50% 88%, ${cobalt(40)}, transparent 76%)`,
    ].join(", "),
  },
  /*
   * Showcase glow falloff (2026-11-21): the cobalt floor is still strong at the section's bottom
   * edge, where the layer is clipped, so it ended in a hard line against Features. The layer's own
   * `::after` band (SHOWCASE_GLOW_FALLOFF) fades it into the page base over the space below the card
   * only: 48 Mobile, 96 Tablet, 160 Desktop. The glow around the card is unchanged; a band, not a
   * mask, so no other pixel of the layer is re-composited (the Mobile card stays pixel-identical).
   */
  /** Use Cases: two offset washes that give the stacked rows depth without competing with them. */
  useCases: {
    backgroundImage: [
      `radial-gradient(ellipse 50% 30% at 6% 20%, ${cobalt(36)}, transparent 74%)`,
      `radial-gradient(ellipse 50% 30% at 94% 62%, ${sky(11)}, transparent 74%)`,
      `radial-gradient(ellipse 55% 14% at 50% 7%, ${cobalt(24)}, transparent 100%)`,
    ].join(", "),
  },
  /** Final CTA panel glow (Figma `126:105`: ellipse 520 × 160, Cobalt Edge 20%, blur 120), as a
   *  radial gradient centred where Figma draws it (104 px from the panel top). No blur filter. */
  ctaGlow: {
    backgroundImage: `radial-gradient(ellipse 400px 170px at 50% 104px, ${cobalt(20)}, transparent 100%)`,
  },
  /** Featured plan card (Figma `131:127`): Cobalt Edge radial 28% → 0, centred, over Obsidian. */
  featuredPlan: {
    backgroundImage: `radial-gradient(closest-side, ${cobalt(28)}, transparent)`,
  },
} satisfies Record<string, CSSProperties>;

/**
 * Scroll reveal (LandingReveal): elements marked `data-reveal` that start below the fold get
 * `data-reveal="pending"` (hidden 12 px low) and `"shown"` once they enter the viewport. Only when
 * motion is allowed and JavaScript runs; otherwise the attribute stays empty and nothing is hidden.
 * Opacity and translate only (no layout shift).
 */
export const REVEAL = [
  // The transition applies only on the way in: entering "pending" is instant (no fade-out).
  "data-[reveal=shown]:transition-[opacity,translate] data-[reveal=shown]:duration-flip data-[reveal=shown]:ease-standard",
  "data-[reveal=pending]:translate-y-[12px] data-[reveal=pending]:opacity-0",
].join(" ");

/** Opacity-only reveal, for the ambient glow layers. */
export const REVEAL_FADE = [
  "data-[reveal=shown]:transition-opacity data-[reveal=shown]:duration-flip data-[reveal=shown]:ease-standard",
  "data-[reveal=pending]:opacity-0",
].join(" ");

/** Hover/press transitions for interactive controls (CTA, navigation). Colours, borders and
 *  shadow only; Tailwind's `hover:` applies on hover-capable pointers only. */
export const INTERACTIVE_TRANSITION =
  "transition-[background-color,border-color,color,box-shadow] duration-base ease-standard";

/** Soft Electric Sky glow for hovered CTAs. */
export const CTA_GLOW =
  "hover:shadow-[0_0_28px_color-mix(in_srgb,var(--color-accent-electric-sky)_30%,transparent)]";

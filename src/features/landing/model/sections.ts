/*
 * Landing page structure (Phase 07, plan §6). The order is approved and identical on Desktop,
 * Tablet and Mobile: Navigation (header), then these sections, then the footer. Pricing never
 * moves before FAQ.
 */

/** Sections inside `<main>`, in the approved order. `id` is the fragment used by anchors. */
export const LANDING_SECTIONS = [
  { id: "top", key: "hero" },
  { id: "showcase", key: "showcase" },
  { id: "features", key: "features" },
  { id: "how-it-works", key: "howItWorks" },
  { id: "use-cases", key: "useCases" },
  { id: "faq", key: "faq" },
  { id: "pricing", key: "pricing" },
  { id: "cta", key: "cta" },
] as const;

export type LandingSectionKey = (typeof LANDING_SECTIONS)[number]["key"];

/**
 * Header and footer anchor links (plan §4). The label key is the same in `landing.nav.*` and
 * `landing.footer.*`; the Arabic strings differ verbatim (P07-D11: "كيف يعمل ؟ " in the
 * navigation, "كيف يعمل؟" in the footer).
 */
export const LANDING_ANCHORS = [
  { key: "home", href: "#top" },
  { key: "features", href: "#features" },
  { key: "howItWorks", href: "#how-it-works" },
  { key: "faq", href: "#faq" },
] as const;

export type LandingAnchorKey = (typeof LANDING_ANCHORS)[number]["key"];

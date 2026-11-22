import { AUTHENTICATION_AVAILABLE, isAuthenticationAvailable } from "@/config/availability";
import type { AppEnv } from "@/config/env";

/*
 * Publication gates for content that is approved for development only (Phase 07 plan §6).
 * Driven by `NEXT_PUBLIC_APP_ENV` (src/config/env.ts): a production deployment must set
 * `production`; development and preview deployments keep `development` / `test`.
 */

/**
 * P07-D1: the English Landing copy is PROPOSED, PENDING FINAL APPROVAL. Set to `true` only
 * when the owner approves it (and update docs/phases/phase-07-landing-copy.md).
 */
export const LANDING_ENGLISH_APPROVED = false;

/**
 * Whether the English Landing may be served. Until P07-D1 is approved, production serves the
 * Arabic Landing only: `/en` returns 404 and the header shows no language link, so no
 * unapproved English copy reaches real visitors.
 */
export function isLandingEnglishPublished(
  appEnv: AppEnv,
  approved: boolean = LANDING_ENGLISH_APPROVED,
): boolean {
  return approved || appEnv !== "production";
}

/**
 * P07-D4: the Pricing section holds placeholder content (Figma "تُحدد لاحقًا"). It renders in
 * development and preview only, and never in production, until approved commercial content
 * exists (a public-launch blocker).
 */
export function isPlaceholderPricingVisible(appEnv: AppEnv): boolean {
  return appEnv !== "production";
}

/*
 * P07-D24: the Authentication availability gate lives in `@/config/availability` (shared with the
 * Auth routes, P07-D25); it is re-exported here for the Landing.
 */
export { AUTHENTICATION_AVAILABLE, isAuthenticationAvailable };

/** Every public authentication entry point on the Landing page. */
export interface LandingAuthEntryPoints {
  /** Navbar login: Desktop bar, Tablet bar and the Mobile menu sheet. */
  navLogin: boolean;
  /** Hero primary CTA "ابدأ الآن" → Register. */
  heroPrimary: boolean;
  /** Footer "حسابك" column (login and register). */
  footerAccount: boolean;
  /**
   * Final CTA section. Its meaningful action is registration; without it only a link back to
   * Features would remain, so the whole section is hidden.
   */
  finalCta: boolean;
}

export function landingAuthEntryPoints(
  appEnv: AppEnv,
  available: boolean = AUTHENTICATION_AVAILABLE,
): LandingAuthEntryPoints {
  const shown = isAuthenticationAvailable(appEnv, available);
  return { navLogin: shown, heroPrimary: shown, footerAccount: shown, finalCta: shown };
}

/**
 * Hero image (P07-D21): the original Figma image. While `provisional` (pending owner verification
 * of the implementation), it renders in development and preview only; production keeps the Near
 * Black Hero with its ambient glow.
 */
export function isHeroImageVisible(appEnv: AppEnv, provisional: boolean): boolean {
  return !provisional || appEnv !== "production";
}

/**
 * Hero video (superseded by P07-D21; the page no longer renders a video). Kept for history.
 * (D-P07-HERO-01, P07-D14): the current asset is a PROVISIONAL development asset, not
 * owner-approved for production. It plays in development and preview only; production keeps the
 * Near Black Hero until the owner approves a production video (then set the asset's
 * `provisional` to false).
 */
export function isHeroVideoVisible(appEnv: AppEnv, provisional: boolean): boolean {
  return !provisional || appEnv !== "production";
}

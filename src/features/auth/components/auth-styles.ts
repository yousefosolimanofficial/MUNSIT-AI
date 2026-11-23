/*
 * Authentication-local style constants (Phase 08 Increment 1). Every value is read from Figma
 * (page 02, component sets `Auth / *`; docs/design-values.md §17) and uses the design tokens
 * where one exists. Translucent tints, shadows and component sizes are local constants, not new
 * tokens (CLAUDE.md design-system rules).
 */

/** Focus ring, D-B2 (same as the shared Button). */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/** `Auth / Input` field: 52 high, radius 12 (`radius-md`), padding 0 / 16, gap 12. */
export const FIELD_BOX =
  "flex h-[52px] w-full items-center gap-sm rounded-md border border-solid px-md transition-[border-color,box-shadow] duration-150";

/** Focus glow on the field (Figma `Focus`): Electric Sky border plus a 3 px Electric Sky 22% ring. */
export const FIELD_FOCUS =
  "focus-within:border-accent-electric-sky focus-within:shadow-[0_0_0_3px_rgba(99,161,255,0.22)]";

/** Field colours per state (Figma `Default`, `Error`, `Disabled`). */
export const FIELD_DEFAULT = "border-neutral-slate bg-surface-obsidian";
export const FIELD_ERROR = "border-accent-coral-pulse bg-surface-obsidian";
export const FIELD_DISABLED = "border-neutral-slate bg-surface-ink opacity-50";

/**
 * The value and placeholder: `Auth/Form/Input`. Placeholder Muted Readable (Default and Error),
 * Muted while focused or disabled. The value is Text Primary.
 */
export const FIELD_INPUT =
  "min-w-0 flex-1 bg-transparent text-auth-form-input text-text-primary outline-none placeholder:text-text-muted-readable focus:placeholder:text-text-muted disabled:cursor-not-allowed disabled:placeholder:text-text-muted";

/**
 * Left-to-right values (email, password) inside an RTL page: the input is `dir="ltr"` so the value
 * reads correctly, and stays aligned to the page start like the Figma placeholder.
 */
export const LTR_VALUE_IN_RTL = "[[dir=rtl]_&]:text-right";

/** Form column and card widths: 480 (Desktop, Tablet), fluid to 350 on Mobile. */
export const CARD_WIDTH = "w-full max-w-[480px]";

/** Marketing panel shadow (Figma `DROP_SHADOW` 0 24 48 −12, black 40%). */
export const PANEL_SHADOW = "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)]";

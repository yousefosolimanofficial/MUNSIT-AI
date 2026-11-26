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
 * Rejected credentials (Login Error `2467:75609`, Increment 2): both fields keep their content and
 * get a Coral Pulse 70% border, without a helper (the form banner carries the message).
 */
export const FIELD_INVALID = "border-accent-coral-pulse/70 bg-surface-obsidian";

/**
 * The value and placeholder: `Auth/Form/Input`. Placeholder Muted Readable (Default and Error),
 * Muted while focused or disabled. The value is Text Primary.
 */
export const FIELD_INPUT =
  "min-w-0 flex-1 bg-transparent text-auth-form-input text-text-primary outline-none placeholder:text-text-muted-readable focus:placeholder:text-text-muted disabled:cursor-not-allowed disabled:placeholder:text-text-muted";

/**
 * Left-to-right values (email, password) inside an RTL page: the input is `dir="ltr"` so the value
 * reads correctly. A typed value aligns to its own start, the left (Figma Login Loading
 * `2480:2916` / `3880` / `4843`: "ahmed@example.com" LEFT), while the placeholder stays aligned to
 * the page start, the right (Figma Default and Error: "name@example.com" RIGHT). Phase 08
 * Increment 2 (contract §9).
 */
export const LTR_VALUE_IN_RTL = "[[dir=rtl]_&]:placeholder-shown:text-right";

/** Form column and card widths: 480 (Desktop, Tablet), fluid to 350 on Mobile. */
export const CARD_WIDTH = "w-full max-w-[480px]";

/** Marketing panel shadow (Figma `DROP_SHADOW` 0 24 48 −12, black 40%). */
export const PANEL_SHADOW = "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)]";

/**
 * `Auth / Primary Button` surface (Figma `191:57`): 52 high, full width, radius 12, Neutral Mist with
 * the Neutral Iron `Auth/Button/Primary` label; Focus: Electric Sky border plus a 3 px Electric Sky
 * 25% ring. Shared by the submit button and the primary-styled route link.
 */
export const PRIMARY_BUTTON =
  "flex h-[52px] w-full items-center justify-center gap-2 rounded-md border border-solid border-transparent bg-neutral-mist text-auth-button-primary text-neutral-iron transition-[box-shadow,border-color,opacity] duration-150 enabled:cursor-pointer focus-visible:border-accent-electric-sky focus-visible:shadow-[0_0_0_3px_rgba(99,161,255,0.25)] focus-visible:outline-none disabled:cursor-not-allowed";

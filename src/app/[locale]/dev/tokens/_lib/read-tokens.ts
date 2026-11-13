import { readFileSync } from "node:fs";
import { join } from "node:path";

/*
 * DEV-ONLY reader for the temporary /dev/tokens inspection route (Phase 02, G-1).
 *
 * Reads the design tokens straight from the source CSS files (single source of truth) and the
 * Figma names from the Design System Reference — no value is duplicated in TypeScript. The route
 * itself returns 404 in production, so these files are only read in development.
 */

/*
 * Literal paths (not a variable) so the bundler can trace exactly these four files; a dynamic
 * path makes Turbopack trace the whole project into the server output.
 */
const SOURCES = {
  tokens: () => readFileSync(join(process.cwd(), "src/design-system/tokens.css"), "utf8"),
  typography: () => readFileSync(join(process.cwd(), "src/design-system/typography.css"), "utf8"),
  motion: () => readFileSync(join(process.cwd(), "src/design-system/motion.css"), "utf8"),
  reference: () =>
    readFileSync(
      join(process.cwd(), "docs/references/MUNSIT_AI_Design_System_Reference_v1.0.md"),
      "utf8",
    ),
};

export interface Token {
  /** CSS custom property, e.g. `--color-surface-obsidian`. */
  name: string;
  value: string;
}

export interface ColorToken extends Token {
  /** Figma variable name from the Design System Reference, e.g. `Surface / Obsidian`. */
  figmaName: string;
}

export interface TextStyle {
  /** Figma style name, e.g. `Dashboard/Title L`. */
  figmaName: string;
  /** Family named by the Reference for this style. */
  family: string;
  /** Base token, e.g. `--text-dashboard-title-l`. */
  token: string;
  size: string;
  lineHeight: string;
  letterSpacing: string;
  weight: string;
}

export interface DesignTokens {
  colors: ColorToken[];
  spacing: Token[];
  radius: Token[];
  pagePadding: Token[];
  durations: Token[];
  easing: Token[];
  fontSans: string;
  fontMono: string;
  textStyles: TextStyle[];
}

/** `--prefix…: value;` declarations of a CSS string, in source order (`initial` resets skipped). */
function declarations(css: string, prefix: string): Token[] {
  return [...css.matchAll(new RegExp(`(${prefix}[a-z0-9-]*):\\s*([^;]+);`, "g"))]
    .map(([, name = "", value = ""]) => ({ name, value: value.replace(/\s+/g, " ").trim() }))
    .filter((token) => token.value !== "initial");
}

/** "ColorSurface / Ember Hush" → "color-surface-ember-hush" (same rule as tokens.test.ts). */
function toCssName(figmaName: string): string {
  return figmaName
    .split("/")
    .map((part) =>
      part
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .split(/\s+/)
        .join("-"),
    )
    .join("-");
}

export function readDesignTokens(): DesignTokens {
  const tokens = SOURCES.tokens();
  const typography = SOURCES.typography();
  const motion = SOURCES.motion();
  const reference = SOURCES.reference();

  const figmaColorNames = new Map(
    [...reference.matchAll(/^\|\s*([A-Za-z]+ \/ [A-Za-z ]+?)\s*\|\s*#[0-9a-fA-F]{6}\s*\|/gm)].map(
      ([, figmaName = ""]) => [`--color-${toCssName(figmaName)}`, figmaName],
    ),
  );
  const colors = declarations(tokens, "--color-").map((token) => ({
    ...token,
    figmaName: figmaColorNames.get(token.name) ?? "—",
  }));

  const families = new Map(
    [
      ...reference.matchAll(
        /^\|\s*([A-Za-z ]+?)\s*\|\s*(Cairo|Inter|Geist Mono)\s*\|\s*[A-Za-z]+ \d{3}\s*\|/gm,
      ),
    ].map(([, style = "", family = ""]) => [style.toLowerCase().split(" ").join("-"), family]),
  );
  const text = declarations(typography, "--text-dashboard-");
  const value = (name: string): string => text.find((t) => t.name === name)?.value ?? "—";
  const textStyles = text
    .filter((t) => !t.name.slice(2).includes("--"))
    .map((t) => {
      const key = t.name.replace("--text-dashboard-", "");
      const figmaKey = key
        .split("-")
        .map((w) => (w === "en" ? "EN" : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(" ");
      return {
        figmaName: `Dashboard/${figmaKey}`,
        family: families.get(key) ?? "—",
        token: t.name,
        size: t.value,
        lineHeight: value(`${t.name}--line-height`),
        letterSpacing: value(`${t.name}--letter-spacing`),
        weight: value(`${t.name}--font-weight`),
      };
    });

  return {
    colors,
    spacing: declarations(tokens, "--spacing-"),
    radius: declarations(tokens, "--radius-"),
    pagePadding: declarations(tokens, "--page-padding-"),
    durations: declarations(motion, "--transition-duration-"),
    easing: declarations(motion, "--ease-"),
    fontSans: declarations(typography, "--font-sans")[0]?.value ?? "—",
    fontMono: declarations(typography, "--font-mono")[0]?.value ?? "—",
    textStyles,
  };
}

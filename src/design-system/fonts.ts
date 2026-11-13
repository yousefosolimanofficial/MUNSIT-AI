/**
 * MUNSIT AI — font loading (Phase 02).
 *
 * Families (Design System Reference §2): Cairo = Arabic UI, Inter = Latin / numerals / English
 * labels, Geist Mono = metadata. All three are variable fonts (one file covers weights 400–700).
 *
 * Loaded with `next/font/local` from files committed in ./fonts (official Google Fonts WOFF2
 * files; source, version, checksum and OFL license: ./fonts/README.md). Builds, the dev server
 * and tests need no network access; the browser loads the fonts from this app's own origin.
 *
 * Script routing is done by the font stack in typography.css (`"Inter", "Cairo", …`): the Cairo
 * file contains only the Arabic subset and Inter has no Arabic glyphs, so Arabic renders in
 * Cairo while Latin letters and numerals inside Arabic render in Inter.
 *
 * The `font-family` declaration pins each face name, so typography.css can reference it
 * directly. Automatic "<Family> Fallback" faces (local Arial, which has Arabic glyphs) are
 * disabled for Inter and Geist Mono so they can never catch Arabic text before Cairo.
 */
import localFont from "next/font/local";

export const cairo = localFont({
  src: "./fonts/cairo-arabic.woff2",
  weight: "200 1000",
  style: "normal",
  display: "swap",
  variable: "--font-cairo",
  declarations: [{ prop: "font-family", value: "Cairo" }],
});

export const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-inter",
  declarations: [{ prop: "font-family", value: "Inter" }],
});

export const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  preload: false, // metadata only; not needed for first paint
  variable: "--font-geist-mono",
  declarations: [{ prop: "font-family", value: "Geist Mono" }],
});

/** Class names that register the three fonts; apply once on <html>. */
export const fontVariables = `${cairo.variable} ${inter.variable} ${geistMono.variable}`;

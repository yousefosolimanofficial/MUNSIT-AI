# MUNSIT AI — Design values read from Figma

Values that the Design System Reference marks **NOT VERIFIED** or does not cover, read from the
Figma file (read-only) before use, plus approved frontend decisions that have no Figma source.
The Design System Reference stays the primary source; this file only adds to it.

Figma file key: `Avyn9kL0drXepQyTXTLXXb`. Figma is never modified.

Labels: `FIGMA` = read via MCP on the date given · `HANDOFF` = stated in the approved Frontend
Handoff only · `APPROVED` = user decision, no Figma source · `NOT VERIFIED` = still unknown, do
not invent.

## 0. Token implementation map (Phase 02 step 2)

Implemented in `src/design-system/tokens.css` and `src/design-system/motion.css`; exact match
to the Design System Reference is enforced by `src/design-system/tokens.test.ts`, which parses
the Reference itself. Naming rule: `Group / Token Name` → `--color-group-token-name` (camelCase
split, lowercase, `-` joined); Tailwind utility = the name without `--color-` prefix, e.g.
`bg-surface-obsidian`, `text-text-secondary`.

### 0.1 Colors (19)

| Figma variable            | HEX     | CSS variable                       | Source                                       |
| ------------------------- | ------- | ---------------------------------- | -------------------------------------------- |
| Surface / Void Black      | #040506 | `--color-surface-void-black`       | FIGMA (DS page 10:4)                         |
| Surface / Ink             | #07080a | `--color-surface-ink`              | FIGMA (DS page 10:4)                         |
| Surface / Obsidian        | #111214 | `--color-surface-obsidian`         | FIGMA (DS page 10:4)                         |
| ColorSurface / Graphite   | #1b1c1e | `--color-color-surface-graphite`   | FIGMA (DS page 10:4); as-is naming exception |
| ColorSurface / Ember Hush | #452324 | `--color-color-surface-ember-hush` | FIGMA (DS page 10:4); as-is naming exception |
| Text / Primary            | #ffffff | `--color-text-primary`             | FIGMA (DS page 10:4)                         |
| Text / Secondary          | #9c9c9d | `--color-text-secondary`           | FIGMA (DS page 10:4)                         |
| Text / Muted              | #6a6b6c | `--color-text-muted`               | FIGMA (DS page 10:4)                         |
| Text / Muted Readable     | #8d8d8f | `--color-text-muted-readable`      | FIGMA (bound on 2211:74; not on swatch page) |
| Neutral / Mist            | #e6e6e6 | `--color-neutral-mist`             | FIGMA (DS page 10:4)                         |
| Neutral / Iron            | #454647 | `--color-neutral-iron`             | FIGMA (DS page 10:4)                         |
| Neutral / Slate           | #2f3031 | `--color-neutral-slate`            | FIGMA (DS page 10:4)                         |
| Accent / Electric Sky     | #63a1ff | `--color-accent-electric-sky`      | FIGMA (DS page 10:4)                         |
| Accent / Cobalt Edge      | #143ca3 | `--color-accent-cobalt-edge`       | FIGMA (DS page 10:4)                         |
| Accent / Deep Space       | #02193b | `--color-accent-deep-space`        | FIGMA (DS page 10:4)                         |
| Accent / Info Blue        | #56c2ff | `--color-accent-info-blue`         | FIGMA (DS page 10:4)                         |
| Accent / Success Green    | #59d499 | `--color-accent-success-green`     | FIGMA (DS page 10:4)                         |
| Accent / Coral Pulse      | #ff6363 | `--color-accent-coral-pulse`       | FIGMA (DS page 10:4)                         |
| Semantic / Warning        | #ffb020 | `--color-semantic-warning`         | FIGMA (bound on 2211:74; not on swatch page) |

Tailwind's default palette is removed (`--color-*: initial`): `bg-red-500`, `text-white`,
`bg-black` etc. do not exist. White text uses `text-text-primary`.

### 0.2 Spacing and radius

| Token                  | Value (px)            | CSS variables / utilities                           | Source                                                       |
| ---------------------- | --------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| Space XS/SM/MD/LG/XL   | 4 / 12 / 16 / 20 / 32 | `--spacing-xs…xl` → `p-md`, `gap-xl`, `ms-sm` …     | HANDOFF — **NOT VERIFIED** as Figma variables                |
| Radius SM/MD/LG/XL/2XL | 8 / 12 / 16 / 20 / 24 | `--radius-sm…2xl` → `rounded-md` …                  | HANDOFF — **NOT VERIFIED** as Figma variables                |
| Page padding D/T/M     | 24 / 24 / 20          | `--page-padding-desktop/tablet/mobile` (no utility) | HANDOFF local measurement; proposed token (Roadmap Phase 02) |

Tailwind's default radius scale is removed; `rounded-full` / `rounded-none` remain (built-in,
not tokens). Tailwind's numeric spacing scale stays for layout sizing (widths, heights);
component padding and gaps use the named tokens. Radius 14 and 18 stay local constants.

### 0.3 Motion

| Token                        | Value                          | CSS variable / utility                        | Source                         |
| ---------------------------- | ------------------------------ | --------------------------------------------- | ------------------------------ |
| Duration fast/base/slow/flip | 120 / 200 / 320 / 400ms        | `--transition-duration-*` → `duration-base` … | APPROVED                       |
| Easing standard              | `cubic-bezier(0.4, 0, 0.2, 1)` | `--ease-standard` → `ease-standard`           | APPROVED                       |
| Default `transition`         | base + standard                | `--default-transition-*`                      | APPROVED                       |
| Motion distance multiplier   | 1 (0 under reduced motion)     | `--motion-distance`                           | APPROVED rule (reduced motion) |
| Inline direction sign        | 1 LTR / −1 RTL                 | `--motion-dir`                                | Frontend (RTL rule)            |

Tailwind's default easings (`ease-in`, `ease-out`, `ease-in-out`) and keyframe animations
(`animate-spin`, `-ping`, `-pulse`, `-bounce`) are removed.

### 0.4 Typography (Phase 02 step 3)

**Fonts.** Cairo (Arabic), Inter (Latin, numerals, English), Geist Mono (metadata) — variable
fonts self-hosted with `next/font/local` from official Google Fonts WOFF2 files committed in
`src/design-system/fonts/` (source, version, SHA-256, OFL licenses: its `README.md`). Build, dev
server and tests need no network (verified with the network blocked, 2026-11-13). Until
2026-11-13 the fonts used `next/font/google`, replaced because builds failed on slow networks
(risk R-1). Implementation: `src/design-system/fonts.ts`, `src/design-system/typography.css`.

**Script routing (frontend implementation of the reference rule).** Stack
`"Inter", "Cairo", …`: Inter has no Arabic glyphs, so Arabic renders in Cairo, and Latin terms
and numerals inside Arabic render in Inter — no per-run markup. E2E-verified per glyph in
Chromium. Consequence: spaces and neutral punctuation inside Arabic also render in Inter.
Figma may render Latin inside a Cairo text layer in Cairo; the code follows the written rule
(Design System Reference §2: "numerals and Latin terms inside Arabic UI use Inter").

#### 0.4.1 Implemented as tokens — `Dashboard/*` (application default)

Read 2026-11-13 on Dashboard Desktop `2211:74`, Mobile `2224:372`, Tablet drawer `2242:1272`;
identical to Design System Reference §2.1. Utility = `text-dashboard-<name>`.

| Figma style           | Family     | Weight       | Size / LH (px) | Tracking | CSS token                             | Source |
| --------------------- | ---------- | ------------ | -------------- | -------- | ------------------------------------- | ------ |
| Dashboard/Title L     | Cairo      | Bold 700     | 28 / 40        | 0        | `--text-dashboard-title-l`            | FIGMA  |
| Dashboard/Title M     | Cairo      | Bold 700     | 20 / 30        | 0        | `--text-dashboard-title-m`            | FIGMA  |
| Dashboard/Card Title  | Cairo      | SemiBold 600 | 16 / 24        | 0        | `--text-dashboard-card-title`         | FIGMA  |
| Dashboard/Body        | Cairo      | Regular 400  | 14 / 22        | 0        | `--text-dashboard-body`               | FIGMA  |
| Dashboard/Body Medium | Cairo      | Medium 500   | 14 / 22        | 0        | `--text-dashboard-body-medium`        | FIGMA  |
| Dashboard/Button      | Cairo      | SemiBold 600 | 14 / 20        | 0        | `--text-dashboard-button`             | FIGMA  |
| Dashboard/Caption     | Cairo      | Regular 400  | 12 / 18        | 0        | `--text-dashboard-caption`            | FIGMA  |
| Dashboard/Label EN    | Inter      | Medium 500   | 12 / 16        | 0        | `--text-dashboard-label-en`           | FIGMA  |
| Dashboard/Stat        | Inter      | SemiBold 600 | 28 / 34        | 0        | `--text-dashboard-stat`               | FIGMA  |
| Dashboard/Stat Small  | Inter      | SemiBold 600 | 16 / 22        | 0        | `--text-dashboard-stat-small`         | FIGMA  |
| Dashboard/Meta        | Geist Mono | Regular 400  | 12 / 18        | 0        | `--text-dashboard-meta` + `font-mono` | FIGMA  |

Document default (`body`): `Dashboard/Body`. Tailwind's default `text-*`, `leading-*`,
`tracking-*` and font-family scales are removed.

#### 0.4.2 Extracted, NOT yet tokens — Foundation set (Inter, spaced names)

Design System Reference §2.2 (FIGMA, naming card). Bound occurrences found 2026-11-13:

| Figma style     | Family | Weight      | Size | LH   | Tracking | Bound on                                            |
| --------------- | ------ | ----------- | ---- | ---- | -------- | --------------------------------------------------- |
| Heading / Large | Inter  | Medium 500  | 56   | 117% | 0        | Design System page `10:4`                           |
| Heading / Small | Inter  | Medium 500  | 24   | 115% | 0        | Dashboard Desktop `2211:74`, Mobile `2224:372`      |
| Body / Small    | Inter  | Regular 400 | 14   | 140% | 0        | Design System page `10:4`                           |
| UI / Caption    | Inter  | Regular 400 | 12   | 140% | 0        | Design System page `10:4`, Landing Mobile `200:683` |

The other nine Foundation styles (Hero/Desktop, Heading / Display, Heading / Medium,
Body / Large, Body / Regular, UI / Navigation, UI / Button, UI / Eyebrow, Mono / Metadata) are
listed in the Reference but were not found bound on any frame inspected. Tokenized when a
consuming screen is built (Heading / Small: Phase 09).

#### 0.4.3 Extracted, NOT yet tokens — Cairo set with unspaced names (new finding)

Separate Figma styles from the spaced Inter set above, despite similar names. Bound on the
Design System page `10:4` and Landing frames.

| Figma style     | Family     | Weight                            | Size | LH   | Tracking | Label                                               |
| --------------- | ---------- | --------------------------------- | ---- | ---- | -------- | --------------------------------------------------- |
| Heading/Display | Cairo      | SemiBold 600                      | 56   | 120% | 0        | FIGMA                                               |
| Heading/Medium  | Cairo      | SemiBold 600                      | 24   | 140% | 0        | FIGMA                                               |
| Body/Regular    | Cairo      | Regular 400                       | 20   | 160% | 0        | FIGMA                                               |
| UI/Button       | Cairo      | Medium 500                        | 20   | 140% | 0        | FIGMA                                               |
| UI/Navigation   | Cairo      | style "ExtraBold", weight **400** | 20   | 140% | 0        | **NOT VERIFIED** — style name and weight conflict   |
| Mono/Metadata   | Geist Mono | Regular 400                       | 16   | 160% | 0.2px    | FIGMA (Reference's 12px is Mono / Metadata, spaced) |

#### 0.4.4 Extracted, NOT yet tokens — `Landing/*` (Phase 07)

Read on Landing Desktop `5:3`, Tablet `200:527`, Mobile `200:683`. All tracking 0.

| Figma style                     | Family     | Weight       | Size | LH   |
| ------------------------------- | ---------- | ------------ | ---- | ---- |
| Landing/Heading/Section Desktop | Cairo      | SemiBold 600 | 40   | 120% |
| Landing/Heading/Section Tablet  | Cairo      | SemiBold 600 | 32   | 120% |
| Landing/Heading/Section Mobile  | Cairo      | SemiBold 600 | 26   | 120% |
| Landing/Heading/Subsection      | Cairo      | SemiBold 600 | 28   | 140% |
| Landing/Body/Intro              | Cairo      | Regular 400  | 24   | 150% |
| Landing/Body/Lead               | Cairo      | Regular 400  | 20   | 150% |
| Landing/Body/Large              | Cairo      | Regular 400  | 18   | 150% |
| Landing/Body/Feature Desktop    | Cairo      | Regular 400  | 18   | 145% |
| Landing/Body/Feature Tablet     | Cairo      | Regular 400  | 16   | 145% |
| Landing/Body/Feature Mobile     | Cairo      | Regular 400  | 15   | 145% |
| Landing/Body/Reading            | Cairo      | Regular 400  | 16   | 160% |
| Landing/Body/Base               | Cairo      | Regular 400  | 16   | 150% |
| Landing/Body/Base Mobile        | Cairo      | Regular 400  | 15   | 150% |
| Landing/Body/Small              | Cairo      | Regular 400  | 14   | 150% |
| Landing/Card/Title              | Cairo      | SemiBold 600 | 20   | 130% |
| Landing/Label/Title             | Cairo      | SemiBold 600 | 20   | 140% |
| Landing/Label/Strong            | Cairo      | SemiBold 600 | 16   | 140% |
| Landing/Button/Default          | Cairo      | Medium 500   | 16   | 150% |
| Landing/Badge/Label             | Cairo      | Medium 500   | 12   | 140% |
| Landing/Pricing/Plan Title      | Cairo      | SemiBold 600 | 24   | 130% |
| Landing/Pricing/Plan Label      | Inter      | Medium 500   | 12   | 100% |
| Landing/Pricing/Price           | Inter      | SemiBold 600 | 48   | 100% |
| Landing/Mono/Step               | Geist Mono | Regular 400  | 14   | 100% |
| Landing/Footer/Link             | Cairo      | Regular 400  | 16   | 140% |
| Landing/Footer/Legal            | Cairo      | Regular 400  | 12   | 140% |

#### 0.4.5 Extracted, NOT yet tokens — `Auth/*` (Phase 08)

Read on Login Mobile `67:37`, Login Error Desktop `2467:75609`, Register Password Rules Desktop
`2480:2226`, Register Success Desktop `2480:2534` (4 of 108 frames). All Cairo, tracking 0.

| Figma style                | Weight       | Size | LH   |
| -------------------------- | ------------ | ---- | ---- |
| Auth/Heading/Form          | SemiBold 600 | 20   | 150% |
| Auth/Panel/Heading Relaxed | SemiBold 600 | 26   | 155% |
| Auth/Panel/Heading Compact | SemiBold 600 | 26   | 130% |
| Auth/Panel/Lead Relaxed    | SemiBold 600 | 18   | 155% |
| Auth/Panel/Lead Compact    | SemiBold 600 | 18   | 140% |
| Auth/Panel/Body            | Regular 400  | 16   | 155% |
| Auth/Form/Label            | Medium 500   | 14   | 150% |
| Auth/Form/Input            | Regular 400  | 15   | 150% |
| Auth/Form/Helper           | Regular 400  | 12   | 150% |
| Auth/Button/Primary        | SemiBold 600 | 16   | 150% |

Auth frames also bind `Landing/Body/Large`, `Landing/Body/Small` and `Dashboard/Body Medium`.

#### 0.4.6 Not inspected yet

Module pages 04–14 (My Lectures … Profile & Settings) and the remaining Auth frames. Their
bound styles are verified in each module's phase before use.

## 1. Motion

### 1.1 Figma inspection (2026-11-13, Phase 02 step 1)

| Check                                                        | Result                                                      | Label |
| ------------------------------------------------------------ | ----------------------------------------------------------- | ----- |
| Keyframe animations on Statistic Card set `2210:187`         | None                                                        | FIGMA |
| Keyframe animations on Dashboard Desktop `2211:74`           | None                                                        | FIGMA |
| Keyframe animations on Dashboard Tablet drawer `2242:1272`   | None                                                        | FIGMA |
| Keyframe animations on Dashboard Mobile `2224:372`           | None                                                        | FIGMA |
| Prototype transition durations / easing (Smart Animate etc.) | Not exposed by the read tools used; no durations in Figma   | FIGMA |
| Durations and easing used in code                            | Taken from the approved motion tokens below, not from Figma | —     |

### 1.2 Statistic Card states (`2210:187`)

| State              | Wrapper (272 wide, 144 tall)           | Card surface                       | Border           | Effect                                         | Label |
| ------------------ | -------------------------------------- | ---------------------------------- | ---------------- | ---------------------------------------------- | ----- |
| Default `2210:148` | card offset 4px from top (`pt 4`)      | Obsidian 88% `rgba(17,18,20,0.88)` | Electric Sky 12% | —                                              | FIGMA |
| Hover `2210:161`   | card offset 0 (`pb 4`) → **lifts 4px** | Graphite 95% `rgba(27,28,30,0.95)` | Electric Sky 42% | drop shadow `0 8px 12px rgba(99,161,255,0.16)` | FIGMA |
| Intro `2210:174`   | same geometry as Default               | as Default                         | as Default       | **opacity 0**                                  | FIGMA |

Interpretation for code: **Intro is the start state of an entrance — a pure fade from opacity 0
to 1 with no positional offset.** Hover is a 4px upward lift with surface, border and shadow
change. Card internals (identical across states): padding 16, gap 10, radius 18, 1px border;
Delta chip Success Green 12% fill, radius 8, padding 3/8, `Dashboard/Caption`; icon tile 40,
radius 12, Electric Sky 12% fill, icon 20; value `Dashboard/Stat`; label `Dashboard/Body`,
Text / Secondary.

### 1.3 Motion tokens (APPROVED by the user, 2026-11-13)

| Token           | Value                          | Use                                 |
| --------------- | ------------------------------ | ----------------------------------- |
| Duration fast   | 120ms                          | Press feedback, small color changes |
| Duration base   | 200ms                          | Hover, focus, nav indicator, fades  |
| Duration slow   | 320ms                          | Drawer, sheet, dialog, entrance     |
| Duration flip   | 400ms                          | Flashcard flip                      |
| Easing standard | `cubic-bezier(0.4, 0, 0.2, 1)` | Default for all transitions         |

Rules (APPROVED): CSS-first, no animation library; animate `transform` and `opacity` only;
`prefers-reduced-motion: reduce` removes movement (opacity-only or instant); hover effects only
under `(hover: hover) and (pointer: fine)`; glows and gradients only from the 19 color variables
(Electric Sky, Cobalt Edge, Deep Space for glows).

### 1.4 Elevation highlight (APPROVED by the user, 2026-11-13)

A white inset highlight is **rejected**. Where a surface highlight is needed, use Electric Sky
8% (an existing approved translucent value).

## 2. Layout tokens

| Check                                                       | Result                                                                 | Label        |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- | ------------ |
| Space / Radius variables bound on `2211:74` and `2242:1272` | None returned — only color and text-style variables are bound          | FIGMA        |
| Space XS–XL 4/12/16/20/32, Radius SM–2XL 8/12/16/20/24      | Used as tokens per the Handoff; still not confirmed as Figma variables | NOT VERIFIED |

## 2a. Official logo (Phase 02 step 4)

Files supplied by the Frontend Lead in `assets/`, copied byte-for-byte to `public/brand/`.
Served with `next/image` `unoptimized` — the original PNG, never re-encoded.

| Variant    | File                         | Size (px) | Ratio | Figma node | Placement (source)                                                              |
| ---------- | ---------------------------- | --------- | ----- | ---------- | ------------------------------------------------------------------------------- |
| Full       | `Munsit_Logo_Full.png`       | 1228×236  | 5.20  | 2818:7240  | Roomy placements only; never in compact nav (Design System Reference §6)        |
| Horizontal | `Munsit_Logo_Horizontal.png` | 908×236   | 3.85  | 2818:7242  | Desktop Sidebar, Mobile header, Auth, Landing nav/footer (§6, Roadmap 05/07/08) |
| Symbol     | `Munsit_Logo_Symbol.png`     | 372×236   | 1.58  | 2818:7244  | Tablet Rail, compact areas (§6, Roadmap 05)                                     |

All three: transparent RGBA PNG, white wordmark for the dark UI, never mirrored, `object-fit:
contain`. Rendered heights per placement: **NOT VERIFIED** — read from Figma in the phase that
builds each placement.

Alt text (user decision 2026-11-13, matches the Frontend Handoff): **"MUNSIT AI"** for every
variant, marked `lang="en"`. Use `decorative` (`alt=""`) when the name is already visible or
announced next to the logo, so screen readers do not repeat it.

Files: the original exports stay in the local, git-ignored `assets/` folder (never read by code
or tests); `public/brand/` holds the committed copies, verified against approved SHA-256
checksums in `brand.test.ts` and `logo.spec.ts`.

## 2b. Icons — inventory (Phase 02 step 5, read-only Figma, 2026-11-13)

Source: local components named `Icon / <name>` — 39 in `Dashboard / Components` (`2205:12`, page 03) plus `Icon / slides` (`2278:291`, page 05). All **24×24 outline icons, stroke 1.75, round caps
and joins, no fill**; the component stroke is Text / Secondary `#9c9c9d` and every placement
overrides the color (state colors below). No icon instance on any of the 15 pages is rotated or
flipped. Exported SVG paths keep the 24×24 coordinates (verified on `arrowLeft`).

**Direction (FIGMA):** the file is drawn natively for RTL — e.g. the Flashcards back control is a
right-pointing chevron, and `arrowLeft` is used un-flipped in RTL screens. Therefore icons render
**as drawn in Arabic (RTL)** and only direction-bearing icons are mirrored in **English (LTR)**.

### 2b.1 Shell and core components (needed from Phase 03/05)

| Icon     | Node      | Used for                                         | Sizes (px)                  | Colors / states                                       | Mirror in LTR |
| -------- | --------- | ------------------------------------------------ | --------------------------- | ----------------------------------------------------- | ------------- |
| home     | 2205:17   | Nav الرئيسية (Sidebar, Rail, Drawer, bottom bar) | 20 Sidebar/Rail · 22 mobile | Secondary default · Electric Sky active · white hover | No            |
| book     | 2205:22   | Nav محاضراتي; stat and activity icons            | 20 · 22 · 18                | as nav; Electric Sky in tiles                         | No            |
| fileText | 2205:30   | Nav الملخصات; notifications                      | 20 · 22 · 18                | as nav                                                | No            |
| help     | 2205:36   | Nav الأسئلة (Sidebar, Rail, More sheet)          | 20 · 18 More sheet          | as nav                                                | No            |
| cards    | 2749:4836 | Nav البطاقات التعليمية                           | 20 · 18                     | as nav                                                | No            |
| note     | 2205:41   | Nav الملاحظات                                    | 20 · 18                     | as nav                                                | No            |
| star     | 2205:45   | Nav المفضلة                                      | 20 · 18                     | as nav                                                | No            |
| folder   | 2205:49   | Nav المجلدات                                     | 20 · 18                     | as nav                                                | No            |
| more     | 2205:156  | Mobile bar المزيد; card menus                    | 22 · 18 · 16                | Secondary / Electric Sky                              | No            |
| crown    | 2205:123  | Plan upgrade (Sidebar card, Rail, More sheet)    | 20 · 18                     | Info Blue upgrade / Secondary / Electric Sky          | No            |
| menu     | 2205:129  | Tablet Rail menu button                          | 20                          | Secondary                                             | No            |
| search   | 2205:54   | Top Bar search input; module searches            | 18 · 28 empty states        | Secondary · Electric Sky on focus                     | No            |
| bell     | 2205:59   | Notifications (Navigation Icon Button)           | 20                          | Secondary default · white hover/active                | No            |
| moon     | 2205:63   | Theme toggle                                     | 20                          | Secondary                                             | No            |
| chevDown | 2205:67   | User menu trigger, selects                       | 16                          | Secondary                                             | No            |
| user     | 2205:139  | User menu, settings navigation                   | 20 · 18 · 44                | Electric Sky                                          | No            |
| settings | 2205:144  | User menu, More sheet, settings                  | 20 · 18                     | Electric Sky                                          | No            |
| logout   | 2205:150  | User menu, logout confirmation                   | 20                          | Coral Pulse                                           | No (approved) |
| x        | 2205:134  | Close: dialogs, sheets, panels                   | 18 · 16                     | Secondary                                             | No            |
| alert    | 2205:118  | Errors and warnings                              | 14–28                       | Coral Pulse · Warning                                 | No            |
| check    | 2205:87   | Success, selected states                         | 10–28                       | Success Green · Void Black on filled                  | No            |

### 2b.2 Module icons (same library, needed in later phases)

cloudUpload, upload, download, file, mic, play, clock, target, message, sparkles, network, box,
sigma, cpu, checkSquare, lightbulb, slides, **arrowLeft** (Summaries smart actions, 16 px —
**mirror in LTR**), trending (**not used on any page**). Sizes 12–32 px per placement. Media `play`
is never mirrored.

### 2b.3 Not in the library — custom vector layers (verify in their module phase)

| Page                                                                                        | Layers                                                                                                                | Note                                         |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 11 Flashcards                                                                               | Back Arrow 20 (21×, right-pointing), Search Icon 16, Chevron Wrap 16, Clear Icon Circle 28, Empty / No Results 96–120 | Back Arrow mirrors in LTR; not library icons |
| 05 Lecture Details, 10 Notes, 12 Favorites, 13 Folders, 14 Settings, 02 Auth prototype refs | Generic `icon` frames 12–22 px drawn inside module components; Settings `Device Icon` 48                              | Identify per layer in each module phase      |
| 01 Landing                                                                                  | `Icon 20` (20×, no vector children — content not identified)                                                          | Verify in Phase 07                           |

### 2b.4 Implementation (Phase 02 step 5, 2026-11-13)

**Export.** All 40 icons exported from Figma with the connector (`download_assets`, SVG,
read-only). `scripts/import-figma-icons.mjs` keeps only the shapes inside `Icon / <name>` (drops
the Figma frame backgrounds and layer ids) and writes:

- `src/design-system/icons/svg/<name>.svg` — original geometry and original color `#9C9C9D`.
- `src/design-system/icons/geometry.generated.ts` — same shapes, stroke `currentColor`.

**Verification.** Geometry fingerprints computed inside Figma from each component's own export
match all 40 files (unit test). Browser renders were compared with Figma renders (fixtures in
`tests/e2e/fixtures/figma-icons/`): mean RGB difference 0.1–6.4 per icon versus 11.5–34.8 to the
nearest other icon; each icon is identified as itself.

**Stroke at other sizes (FIGMA).** Resized icon instances in Figma keep a 1.75 stroke while the
drawing scales (checked at 14–32 px). The component reproduces this with
`vector-effect: non-scaling-stroke` — at 20 px it differs from Figma by 1.31 versus 8.21 for a
plain scaled stroke.

**Direction (APPROVED 2026-11-13).** RTL renders the Figma drawing unchanged. Only `arrowLeft`
mirrors, in LTR only, by the icon's **nearest** `dir`: `scale: calc(var(--motion-dir) * -1) 1`
(`--motion-dir` = 1 under `[dir=ltr]`, -1 under `[dir=rtl]`, inherited). Tailwind `ltr:`/`rtl:`
variants and `:dir()` are avoided — see §4.4. `logout` and `play` never mirror.
Any other directional icon is reviewed individually before being added to the manifest.

**Component API** — `src/shared/ui/Icon.tsx` (Server Component):

| Prop        | Type       | Default | Notes                                                                                                                |
| ----------- | ---------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `name`      | `IconName` | —       | One of the 40 names in `src/design-system/icons/manifest.ts`                                                         |
| `size`      | `number`   | `24`    | Figma placement size: `ICON_SIZES.sidebar`/`.rail` 20, `.mobileNav` 22, `.moreSheet` 18, or the placement's own size |
| `label`     | `string`   | —       | Meaningful icon → `role="img"` + `aria-label`; omitted → `aria-hidden`                                               |
| `className` | `string`   | —       | Color via a Design System text utility (`text-text-secondary`, …) — `currentColor`                                   |

**Licensing.** 38 of 40 icons are geometrically identical to open-source Lucide icons (several
also to Feather); `slides` and `cards` match no upstream icon checked; their source is **unconfirmed** (not claimed
as original MUNSIT artwork). Lucide
ISC and Feather MIT notices are kept in `src/design-system/icons/LICENSE-lucide.txt`; per-icon
results in `src/design-system/icons/LICENSES.md`. Lucide is not a dependency.

## 3. Naming notes

- Dashboard frames bind the color variable as `Surface/Void Black` (no spaces around `/`); the
  Design System Reference writes `Surface / Void Black`. Same value `#040506`. Code uses the
  Reference naming.
- `Heading / Small` (Inter Medium 24, line height 115%) is bound on Dashboard Desktop `2211:74`
  besides the `Dashboard/*` styles. Its use there is not yet located.

## 4. Localization (i18n) and direction (Phase 02 step 6, 2026-11-13)

### 4.1 Decisions (APPROVED by the user 2026-11-13)

| Topic     | Decision                                                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Library   | `next-intl` 4.15.1 (exact pin). Its build scripts (`@swc/core`, `@parcel/watcher`, used only by the unused message extractor) are denied in `pnpm-workspace.yaml` (`allowBuilds: false`) |
| Locales   | `ar` (default, RTL), `en` (LTR)                                                                                                                                                          |
| URLs      | `localePrefix: "as-needed"` — Arabic unprefixed (`/`, `/dev/tokens` unchanged), English `/en/...`; `/ar/...` → 307 to the unprefixed URL; unknown locale → 404                           |
| Detection | None (`localeDetection: false`): the URL alone decides; an English browser still gets Arabic at `/`                                                                                      |
| Cookie    | Disabled (`localeCookie: false`) — next-intl never reads it with detection off, so it is not written                                                                                     |
| Numbers   | Locale must stay exactly `ar` (Latin digits, as in Figma). `ar-EG` / `ar-SA` would format Arabic-Indic digits — never use regional Arabic tags                                           |

### 4.2 Architecture

| File                                          | Role                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/i18n/routing.ts`                         | `defineRouting` — locales, default, prefix, detection, cookie                   |
| `src/i18n/direction.ts`                       | `ar → rtl`, `en → ltr`                                                          |
| `src/i18n/request.ts`                         | `getRequestConfig`: locale from `next/root-params` (static rendering), messages |
| `src/i18n/navigation.ts`                      | Locale-aware `Link`, `redirect`, `useRouter`, `usePathname`, `getPathname`      |
| `src/i18n/messages/index.ts`                  | Registers catalogs; Arabic is the source of truth for keys and types            |
| `src/i18n/messages/<locale>/<namespace>.json` | Catalogs (Roadmap §3). Now: `common` (brand name), `dev` (DEV-ONLY fixtures)    |
| `src/i18n/next-intl.d.ts`                     | Type-safe keys and locales (`AppConfig`)                                        |
| `src/proxy.ts`                                | Next.js 16 Proxy (formerly `middleware.ts`) — `createMiddleware(routing)`       |
| `src/app/[locale]/layout.tsx`                 | Root layout: `<html lang dir>`, fonts, `NextIntlClientProvider messages={null}` |
| `next.config.ts`                              | `createNextIntlPlugin("./src/i18n/request.ts")`                                 |

Rendering: Server Components translate on the server (`getTranslations`); pages are statically
generated per locale (`generateStaticParams`). The client provider passes only the locale (needed
by the locale-aware `Link`); **no messages are sent to the browser**.

### 4.3 Adding translations (future modules)

1. Create `src/i18n/messages/ar/<namespace>.json` and `en/<namespace>.json` with the same keys
   (unit test fails otherwise). Namespace = module name (`dashboard`, `lectures`, …).
2. Register both in `src/i18n/messages/index.ts`.
3. Server Components: `const t = await getTranslations("<namespace>")`. Client Components that
   need text: pass only their namespaces to a nested `NextIntlClientProvider`.
4. Arabic copy verbatim from Figma / Handoff. English copy only from an approved source — Figma
   has no LTR frames, so English UI copy is **not verified** (open decision O-1 below).
5. Embedded LTR runs in Arabic (numbers with separators, English terms): rich-text tag mapped to
   `<Ltr>` (`src/shared/ui/Ltr.tsx`, native `<bdi dir="ltr">`), e.g.
   `t.rich("key", { ltr: (chunks) => <Ltr>{chunks}</Ltr> })`.
6. Links: import from `@/i18n/navigation`, never `next/link`.

### 4.4 RTL / LTR rules (verified in the browser)

- `<html dir>` follows the locale; nested `dir` attributes are respected.
- Layout: logical utilities only (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`) — verified
  that `ps-xs` is right padding in Arabic and left padding in English; flex rows reverse.
- Form fields inherit the direction; `text-align: start`.
- **Directional selectors — known toolchain issue (verified 2026-11-13, Next.js 16.4.6 /
  Turbopack / LightningCSS, no `browserslist` configured):**
  - LightningCSS down-levels `:dir(ltr)` to a polyfill based on `:lang()` (it emitted
    `:not(:lang(ar), :lang(he), …)`). That judges by **language**, not direction: an element
    inside a `dir="rtl"` block on an English page still matched "ltr".
  - Tailwind's `ltr:` / `rtl:` variants compile to `:where(:dir(ltr), [dir="ltr"], [dir="ltr"] *)`
    — the `[dir="ltr"] *` part also matches any descendant of an LTR ancestor, even when a
    nearer `dir="rtl"` exists. Found by `tests/e2e/i18n.spec.ts` (icon inside an RTL block on
    `/en/dev/tokens` was flipped); fixed in `src/shared/ui/Icon.tsx`.
  - Guidance (not a blanket ban): prefer **CSS logical properties** for layout. For a
    direction-dependent **transform** that must follow the _nearest_ `dir`, use the inherited
    `--motion-dir` variable (1 LTR / -1 RTL, `motion.css`), as the `Icon` mirror does. `ltr:` /
    `rtl:` / `:dir()` remain acceptable where only the page direction matters and nested
    opposite-direction blocks cannot occur — and must be covered by an RTL+LTR browser test.
    Revisit when `browserslist` targets are set (open decision O-4): with modern targets
    LightningCSS can keep `:dir()` native.
- Logo never mirrors; icons: only `arrowLeft` mirrors in LTR; `logout`, `play` never.

### 4.5 Language switching

- Mechanism: navigate to the same path in the other locale with the locale-aware `Link`
  (`<Link href={path} locale="en">`) or `useRouter().replace(path, { locale })`. The URL changes
  (`/dev/tokens` ↔ `/en/dev/tokens`) and `<html lang dir>` follow.
- Now: a DEV-ONLY control on the temporary `/dev/tokens` route (E2E-tested). The product language
  switcher is built in its roadmap phases (Top Bar toggle — Phase 05; Settings — Phase 20).

### 4.6 Future backend preference integration (`/me/preferences`) — plan only, not implemented

The backend identified `PATCH /me/preferences` for preference updates (user, 2026-11-13). The
exact request/response contract (field names, values, read endpoint, errors) is **not yet
confirmed** — nothing is assumed here and no API call is implemented. Integration plan (Phase 20 / Phase 21, through an adapter in `src/api/adapters`):

1. On sign-in / app entry (server side): read the preference; if it differs from the URL locale,
   `redirect({ href: currentPath, locale: preferred })` from `@/i18n/navigation`.
2. When the user switches language in Settings or the Top Bar: switch the URL immediately (UI
   never waits for the network), then persist through the adapter; on failure keep the URL
   locale and surface the error per the Settings design. Persist with `PATCH /me/preferences`
   once its contract is confirmed.
3. Signed-out visitors: URL only. No cookie and no automatic detection (user decision
   2026-11-13).

### 4.7 Open decisions

| ID  | Decision needed                                                            | Owner         |
| --- | -------------------------------------------------------------------------- | ------------- |
| O-1 | Source of English UI copy (Figma has no LTR frames)                        | Product       |
| O-2 | `/me/preferences` contract (method, field, values) — needed in Phase 20/21 | Backend       |
| O-3 | Cookie / detection for signed-out visitors (D-16)                          | Product       |
| O-4 | `browserslist` targets for the CSS toolchain (would keep `:dir()` native)  | Frontend lead |

## 5. Text contrast (Phase 02 DoD, measured 2026-11-13)

WCAG 2.2 contrast ratios computed from the approved HEX values (relative luminance formula).
AA = 4.5 normal text / 3.0 large text (≥ 24 px, or ≥ 18.66 px bold).

| Text \ Surface                   | Void Black #040506 | Ink #07080a     | Obsidian #111214 | Graphite #1b1c1e |
| -------------------------------- | ------------------ | --------------- | ---------------- | ---------------- |
| Text / Primary #ffffff           | 20.40 AA           | 20.04 AA        | 18.74 AA         | 17.05 AA         |
| Text / Secondary #9c9c9d         | 7.44 AA            | 7.30 AA         | 6.83 AA          | 6.22 AA          |
| Text / Muted Readable #8d8d8f    | 6.16 AA            | 6.05 AA         | 5.66 AA          | 5.15 AA          |
| Text / Muted #6a6b6c (reference) | 3.82 large only    | 3.75 large only | 3.51 large only  | 3.19 large only  |

Primary, Secondary and Muted Readable pass AA for normal text on every surface. Text / Muted
passes only for large text: acceptable for **disabled** text (exempt in WCAG 1.4.3), a risk if
used for small readable text (e.g. 12 px metadata) — use Muted Readable there. Translucent card
surfaces (Obsidian 88%, Graphite 95%) sit over Void Black, so their effective colors are within
the measured range. Not measured: text on accent fills (e.g. Void Black on Electric Sky buttons) —
measured with the components in Phase 03.

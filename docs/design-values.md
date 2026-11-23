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

Read 2026-11-13 on Dashboard Desktop `2211:74`, Tablet `2224:372`, Tablet drawer `2242:1272`;
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
| Heading / Small | Inter  | Medium 500  | 24   | 115% | 0        | Dashboard Desktop `2211:74`, Tablet `2224:372`      |
| Body / Small    | Inter  | Regular 400 | 14   | 140% | 0        | Design System page `10:4`                           |
| UI / Caption    | Inter  | Regular 400 | 12   | 140% | 0        | Design System page `10:4`, Landing Mobile `200:683` |

The other nine Foundation styles (Hero/Desktop, Heading / Display, Heading / Medium,
Body / Large, Body / Regular, UI / Navigation, UI / Button, UI / Eyebrow, Mono / Metadata) are
listed in the Reference but were not found bound on any frame inspected. Tokenized when a
consuming screen is built (Heading / Small: Phase 09).

#### 0.4.3 Extracted, NOT yet tokens — Cairo set with unspaced names (new finding)

Separate Figma styles from the spaced Inter set above, despite similar names. Bound on the
Design System page `10:4` and Landing frames.

| Figma style     | Family     | Weight                               | Size | LH   | Tracking | Label                                               |
| --------------- | ---------- | ------------------------------------ | ---- | ---- | -------- | --------------------------------------------------- |
| Heading/Display | Cairo      | SemiBold 600                         | 56   | 120% | 0        | FIGMA                                               |
| Heading/Medium  | Cairo      | SemiBold 600                         | 24   | 140% | 0        | FIGMA                                               |
| Body/Regular    | Cairo      | Regular 400                          | 20   | 160% | 0        | FIGMA                                               |
| UI/Button       | Cairo      | Medium 500                           | 20   | 140% | 0        | FIGMA                                               |
| UI/Navigation   | Cairo      | Regular 400 (face named "ExtraBold") | 20   | 140% | 0        | **VERIFIED** (measured, §16.5; Phase 07)            |
| Mono/Metadata   | Geist Mono | Regular 400                          | 16   | 160% | 0.2px    | FIGMA (Reference's 12px is Mono / Metadata, spaced) |

#### 0.4.4 `Landing/*` — tokens since Phase 07 Increment 1 (`src/design-system/typography-landing.css`)

Read on Landing Desktop `5:3`, Tablet `200:527`, Mobile `200:683`. All tracking 0.

| Figma style                     | Family     | Weight        | Size | LH   |
| ------------------------------- | ---------- | ------------- | ---- | ---- |
| Landing/Heading/Section Desktop | Cairo      | SemiBold 600  | 40   | 120% |
| Landing/Heading/Section Tablet  | Cairo      | SemiBold 600  | 32   | 120% |
| Landing/Heading/Section Mobile  | Cairo      | SemiBold 600  | 26   | 120% |
| Landing/Heading/Subsection      | Cairo      | SemiBold 600  | 28   | 140% |
| Landing/Body/Intro              | Cairo      | Regular 400   | 24   | 150% |
| Landing/Body/Lead               | Cairo      | Regular 400   | 20   | 150% |
| Landing/Body/Large              | Cairo      | Regular 400   | 18   | 150% |
| Landing/Body/Feature Desktop    | Cairo      | Regular 400   | 18   | 145% |
| Landing/Body/Feature Tablet     | Cairo      | Regular 400   | 16   | 145% |
| Landing/Body/Feature Mobile     | Cairo      | Regular 400   | 15   | 145% |
| Landing/Body/Reading            | Cairo      | Regular 400   | 16   | 160% |
| Landing/Body/Base               | Cairo      | Regular 400   | 16   | 150% |
| Landing/Body/Base Mobile        | Cairo      | Regular 400   | 15   | 150% |
| Landing/Body/Small              | Cairo      | Regular 400   | 14   | 150% |
| Landing/Card/Title              | Cairo      | SemiBold 600  | 20   | 130% |
| Landing/Label/Title             | Cairo      | SemiBold 600  | 20   | 140% |
| Landing/Label/Strong            | Cairo      | SemiBold 600  | 16   | 140% |
| Landing/Button/Default          | Cairo      | Medium 500    | 16   | 150% |
| Landing/Badge/Label             | Cairo      | Medium 500    | 12   | 140% |
| Landing/Pricing/Plan Title      | Cairo      | SemiBold 600  | 24   | 130% |
| Landing/Pricing/Plan Label      | Inter      | Medium 500    | 12   | 100% |
| Landing/Pricing/Price           | Inter      | SemiBold 600  | 48   | 100% |
| Landing/Mono/Step               | Geist Mono | Regular 400   | 14   | 100% |
| Landing/Footer/Link             | Cairo      | Regular 400   | 16   | 140% |
| Landing/Footer/Legal            | Cairo      | Regular 400   | 12   | 140% |
| Landing/Navigation/Tablet       | Cairo      | ExtraBold 800 | 15   | 140% |

#### 0.4.5 `Auth/*` (Phase 08) — tokens in `typography-auth.css`

Verified 2026-11-23 against the file's local text styles (`getLocalTextStylesAsync`; all 12
`Auth/*` styles). All Cairo, tracking 0. Usage per family: Login panel = Compact, Register = Relaxed,
Forgot and Reset = the plain `Auth/Panel/Heading` and `Auth/Panel/Lead`.

| Figma style                | Weight       | Size | LH   |
| -------------------------- | ------------ | ---- | ---- |
| Auth/Heading/Form          | SemiBold 600 | 20   | 150% |
| Auth/Panel/Heading Relaxed | SemiBold 600 | 26   | 155% |
| Auth/Panel/Heading Compact | SemiBold 600 | 26   | 130% |
| Auth/Panel/Heading         | SemiBold 600 | 26   | 140% |
| Auth/Panel/Lead Relaxed    | SemiBold 600 | 18   | 155% |
| Auth/Panel/Lead Compact    | SemiBold 600 | 18   | 140% |
| Auth/Panel/Lead            | SemiBold 600 | 18   | 150% |
| Auth/Panel/Body            | Regular 400  | 16   | 155% |
| Auth/Form/Label            | Medium 500   | 14   | 150% |
| Auth/Form/Input            | Regular 400  | 15   | 150% |
| Auth/Form/Helper           | Regular 400  | 12   | 150% |
| Auth/Button/Primary        | SemiBold 600 | 16   | 150% |

Auth frames also bind `Landing/Body/Large` (form description), `Landing/Body/Small` (footer text)
and `Dashboard/Body Medium` (form-level error banner). Text inside the `Auth / Input`, `Password
Input`, `Text Link` and `Validation Rule` components is unbound in Figma but has exactly the values
of `Auth/Form/Label` (label, link), `Auth/Form/Input` (value) and `Auth/Form/Helper` (helper, rule);
those utilities are used.

#### 0.4.6 Not inspected yet

Module pages 04–14 (My Lectures … Profile & Settings). Their
bound styles are verified in each module's phase before use.

## 1. Motion

### 1.1 Figma inspection (2026-11-13, Phase 02 step 1)

| Check                                                        | Result                                                      | Label |
| ------------------------------------------------------------ | ----------------------------------------------------------- | ----- |
| Keyframe animations on Statistic Card set `2210:187`         | None                                                        | FIGMA |
| Keyframe animations on Dashboard Desktop `2211:74`           | None                                                        | FIGMA |
| Keyframe animations on Dashboard Tablet drawer `2242:1272`   | None                                                        | FIGMA |
| Keyframe animations on Dashboard Tablet `2224:372`           | None                                                        | FIGMA |
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

**Favicon** (`src/app/favicon.ico`, owner-approved fix for QA finding F-1, 2026-11-22): an export
of the approved Symbol, not a new mark.

- **Source:** the unmodified `Munsit_Logo_Symbol.png` (SHA-256 `3792279d…41836147`).
- **Export:** the Symbol is centred on a transparent 372×372 square (68 px above and below), with
  no recolouring, cropping or redrawing.
- **Format:** ICO with 16, 32 and 48 px images, SHA-256 `29b0ac8d…686b2e1d`.
- **Tooling:** exported once with Pillow; no project dependency was added.
- **Head tag:** Next.js (app icon file convention) declares it as `<link rel="icon">`.
- **Not added:** an Apple touch icon. It needs an opaque background, which is an owner decision.

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

## 6. Button (Phase 03) — approved values and exceptions (2026-11-13)

Source: Figma `Button` set `2210:89`, read 2026-11-13. Full spec:
[phases/phase-03-button-contract.md](phases/phase-03-button-contract.md). Figma is not modified.

| Item                        | Figma                                                        | Implemented value                                                    | Status                                                                                                                                |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Hover shadow (Primary)      | Drop shadow `#63a1ff` 35%, offset 0/4, blur **18**, spread 0 | `0 4px 9px rgba(99,161,255,0.35)`, the Design System Reference value | APPROVED for the **Button only** (D-B1). Halving the Figma blur is **not** a project rule; every other shadow is reviewed on its own. |
| Focus ring                  | Not designed                                                 | `:focus-visible`: outline 2px solid Electric Sky, offset 2px         | APPROVED (D-B2); applies to every Phase 03 primitive                                                                                  |
| Secondary Pressed fill      | Electric Sky **24%**                                         | Electric Sky **20%** (border 55% and label Electric Sky unchanged)   | APPROVED **exception for WCAG AA** (D-B6). 24% gave 4.29:1 on Graphite; 20% gives at least 4.65:1 on every allowed surface            |
| Secondary on Ember Hush     | —                                                            | **Not allowed**                                                      | APPROVED usage rule. Hover 4.18:1 and Pressed 3.91:1 fail there                                                                       |
| Loading, icons, destructive | Not designed                                                 | Not in v1                                                            | D-B3, D-B4 out of v1; D-B5 deferred to Phase 06                                                                                       |

**Allowed surfaces for the Button:** Void Black, Ink, Obsidian, Graphite, Obsidian 88% card and
Graphite 95% card hover. Every label state measures at least 4.5:1 there (table in the contract,
§12.2). This is enforced by `src/design-system/contrast.test.ts`, which uses WCAG arithmetic from
the token values, no DOM. The rendered button is re-checked in Chromium at integration. Disabled
states are exempt (WCAG 1.4.3). This closes the §5 note "text on accent fills: measured with the
components in Phase 03" for the Button.

## 7. Input (Phase 03) — approved values and exceptions (2026-11-14)

Source: Figma `Settings / Profile Input` `2461:591`, read 2026-11-14. Full spec:
[phases/phase-03-input-contract.md](phases/phase-03-input-contract.md). Figma is not modified.

| Item           | Figma                                     | Implemented value                            | Status                                                                                                                     |
| -------------- | ----------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Default border | Electric Sky **14%** (1.19:1 on Ink)      | **Text / Muted** token (`border-text-muted`) | APPROVED **accessibility deviation** (D-I3 Option B): at least 3.19:1 against every surface and the Ink fill (WCAG 1.4.11) |
| Focus          | Border Sky 70% + glow `0 0 6px 2px` @ 25% | Same, on `:focus-visible`                    | APPROVED (D-I2): at least 3.57:1; replaces the D-B2 outline for text fields only                                           |
| Placeholder    | Not in the set                            | Text / Muted Readable token                  | APPROVED (D-I4): 6.05:1 on Ink                                                                                             |
| Field fill     | Unbound literal `#07080a`                 | Surface / Ink token (same value)             | FIGMA                                                                                                                      |
| Disabled       | Opacity 60%, border Sky 14%               | Same                                         | FIGMA; exempt from contrast                                                                                                |

Surfaces measured: Void Black, the Settings card (Obsidian 90% over Void), Obsidian and Graphite.
Enforced by `src/design-system/contrast.test.ts` (WCAG arithmetic from token values; translucent
borders composited on the Ink fill). Rendered values are re-checked in Chromium at integration.

## 8. Card surfaces (Phase 03) — final values and deviations (2026-11-15)

Source frames, read on Desktop / Tablet / Mobile (no Card component set exists): Recent Activity
Card `2220:368` / `2224:563` / `2238:893`, Recent Lectures Card `2482:1488` / `2482:1526` /
`2482:1564`, Settings Group `2463:3514` / `2463:3924` / `2463:4261`, Recent Lecture Row
`2482:1489` / `2482:1527` / `2482:1565`. Full spec:
[phases/phase-03-card-contract.md](phases/phase-03-card-contract.md). Figma is not modified.

| Item                     | Figma (identical on all three breakpoints)                                 | Implemented value                                     | Status                                              |
| ------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `surface` fill           | Obsidian 88% (Dashboard cards); Obsidian **90%** (Settings Group)          | `bg-surface-obsidian/88`                              | **Intentional deviation** for Settings Group (D-C1) |
| `surface` border         | 1px Sky 14% (Dashboard cards); Sky **12%** (Settings Group)                | `border-accent-electric-sky/14`                       | **Intentional deviation** for Settings Group (D-C2) |
| `surface` radius         | 20                                                                         | `rounded-xl` (`--radius-xl`)                          | FIGMA                                               |
| `surface` padding        | 20 (most cards, Settings Group); 16 (Recent Lectures Card)                 | `p-lg` (default) / `p-md`                             | FIGMA (D-C3)                                        |
| `inset` fill / border    | White 3% / 1px Sky 12%                                                     | `bg-text-primary/3` / `border-accent-electric-sky/12` | FIGMA (D-C2, D-C5); white = `text-primary`          |
| `inset` radius / padding | 14 / 12 block, 16 inline                                                   | `rounded-[14px]` (local) / `py-sm px-md`              | FIGMA                                               |
| Gaps inside cards        | 16 (Activity), 10 (Lectures), 14 (Settings), row 16 → 10 stacked on Mobile | Caller layout, not part of Card                       | FIGMA                                               |

Deviation effect: fill `#101113` → `#0f1012`; border 1.26 → 1.31:1 on Void Black. Both are
decorative boundaries of a static container (exempt from WCAG 1.4.11). Text contrast on the
`surface` and `inset` fills: contract §7 (Text / Muted fails for text and is not used there).
Recent Lecture Row (`2482:1484`, variants `Size=Wide|Compact` only): no prototype `reactions`
on the set, its instances or descendants on any breakpoint, and no hover/pressed variant; its
action is the inner Secondary Button "فتح". The row is a static `inset` surface (contract §4).
Open: Settings shortcut links (`2463:3046`, radius 16, interactive), contract Q-1.

## 9. Status Badge (Phase 03) — Figma values read 2026-11-15

Source: component set `Status Badge` `2258:1026` (page 04 — My Lectures), read with the Plugin API.
Full spec (D-BG1 and D-BG2 approved 2026-11-15):
[phases/phase-03-badge-contract.md](phases/phase-03-badge-contract.md). Figma is not modified.

| Item            | Figma                                                                | Implemented value                                | Status         |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------ | -------------- |
| Ready           | Success Green 12% fill, 26% border; label and dot Success Green      | `bg-accent-success-green/12` etc.                | FIGMA          |
| Processing      | Electric Sky 12% fill, 26% border; label and dot Electric Sky        | `bg-accent-electric-sky/12` etc.                 | FIGMA          |
| Pending         | White 6% fill, 12% border; label and dot Text / Secondary            | `bg-text-primary/6`, `border-text-primary/12`    | FIGMA          |
| Failed          | Coral Pulse 12% fill, 26% border; label and dot Coral Pulse          | `bg-accent-coral-pulse/12` etc.                  | FIGMA (D-BG1)  |
| Geometry        | Height 30, padding 5 / 10, gap 6, radius 8, 1px border, dot 6        | `py-[5px] px-[10px] gap-[6px] rounded-sm border` | FIGMA          |
| Label           | `Dashboard/Caption` (Cairo Regular 12/18), single line; dot at start | `text-dashboard-caption whitespace-nowrap`       | FIGMA          |
| Dashboard chips | Standalone frames (radius 8–10, height 24–28, no border)             | Not part of Badge V1                             | D-BG2 approved |

## 10. Tabs (Phase 03) — Figma values and approved deviations (2026-11-15)

Source: `Lecture Tab` `2278:322` and `Lecture Tab Compact` `2293:679` (page 05), read with the
Plugin API. Full spec and decisions D-T1 to D-T6:
[phases/phase-03-tabs-contract.md](phases/phase-03-tabs-contract.md). Figma is not modified.

| Item                                           | Figma                                                                   | Implemented value                                                                | Status                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| `default` size                                 | 44 high, padding-inline 16, gap 8, radius 12, Body Medium, icon 18      | `h-[44px] px-md gap-[8px] rounded-md`                                            | FIGMA                                   |
| `default` states                               | Default none / Text Secondary; Hover White 5%; Active Sky 12% + Sky 32% | as Figma; hover only on this size                                                | FIGMA                                   |
| `compact` size                                 | 58 high, icon over Caption, padding 8 / 6, gap 4, radius 12             | `min-h-[58px] flex-col py-[8px] px-[6px] gap-[4px]`                              | FIGMA                                   |
| `compact` states                               | Default White 3% + Sky 12%; Active Sky 12% + Sky 50%, Sky label         | as Figma                                                                         | FIGMA                                   |
| List layout                                    | Desktop 6 equal, gap 8; Tablet compact 6 equal, gap 4; Mobile 2 × 3     | `flex-1` tabs; page passes `size` and the grid (D-T3)                            | FIGMA                                   |
| Disabled                                       | Whole list at 50% while loading (`2584:1327`)                           | `opacity-50`, tabs `disabled`, `aria-disabled` on list                           | FIGMA                                   |
| Focus-visible                                  | Not designed                                                            | Button D-B2 ring                                                                 | **Deviation** (D-T2)                    |
| Selected-state cue                             | Color only                                                              | Active label `underline underline-offset-4`                                      | **Deviation** (D-T6)                    |
| Filter row (Favorites, Folders, Question Bank) | 42 high, count pill; active count Sky on Sky 20% (4.18:1 on card)       | Not implemented: one shared list, not tabs; active count white when built (D-T5) | Deferred to the modules (contract §1.1) |

## 11. Dialog (Phase 03) — Figma values and approved decisions (2026-11-15)

Source: 20+ module dialog components (no shared Figma component), e.g. `2268:1824`, `2432:4308`,
`2453:5502`, `2462:1490`, `2314:651`, read with the Plugin API. Full spec and decisions D-DL1 to
D-DL6: [phases/phase-03-dialog-contract.md](phases/phase-03-dialog-contract.md). Figma is not
modified.

| Item     | Figma                                                                               | Implemented value                                                                 | Status                        |
| -------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| Shell    | Obsidian 98%, 1px Sky 18%, radius 24, padding 24, gap 14, shadow 0/16/40 black 50%  | `bg-surface-obsidian/98 border-accent-electric-sky/18 rounded-2xl p-[24px]` …     | FIGMA (majority, D-DL1)       |
| Outliers | My Lectures: shadow 0/24/64 55%, scrim 62%, Coral 22% border, gaps 16/20, close 40  | Not kept                                                                          | D-DL1                         |
| Scrim    | Void Black 66%, full viewport, no blur, "click to close"                            | `backdrop:bg-surface-void-black/66`                                               | FIGMA                         |
| Header A | Icon tile 48 (radius 14, icon 22), title `Title M`, description `Body` Secondary    | as Figma; tones accent (Sky 12/30) and danger (Coral 12/30)                       | FIGMA                         |
| Header B | Icon tile 44 (icon 20) · title block gap 4 · close 36, radius 10, White 4%, Sky 14% | as Figma; close label from the consumer                                           | FIGMA (D-DL5)                 |
| Actions  | Row, gap 10, equal widths, primary at inline-start                                  | `flex gap-[10px] *:flex-1`                                                        | FIGMA                         |
| Widths   | 420 / 440 / 480 / 520 / 560 / 640 (Desktop = Tablet); Mobile 350 (viewport − 40)    | `width` prop, default 480; `max-w-[calc(100vw_-_40px)]`; height ≤ viewport − 40   | FIGMA + D-DL2                 |
| Motion   | Not designed                                                                        | Enter: opacity + scale 0.98 → 1, slow; exit: reverse, base; reduced: opacity only | **Approved addition** (D-DL4) |
| Focus    | Not designed (guard annotation `2588:338`: trapped, restored, safe action focused)  | Native `showModal()` inertness; D-B2 ring on the close button                     | D-DL3                         |

## 12. Sheet (Phase 03) — Figma values and normalizations (2026-11-16)

Source: Mobile sheets `2236:972` (More Menu), `2236:919` / `2268:1823` (Upload), `2268:1863`
(Filter), `2268:1890` (Options), `2454:9042` / `2454:9206` (Folders), `2453:7247` (Add Content),
read with the Plugin API. Full spec, decisions D-SH1 to D-SH6 and normalizations N-1 to N-5:
[phases/phase-03-sheet-contract.md](phases/phase-03-sheet-contract.md). Figma is not modified.

| Item      | Figma                                                                              | Implemented value                                                           | Status                        |
| --------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| Placement | Mobile only; bottom, full width (`y + h = 844`); tallest leaves 64 at the top      | `inset-x-0 bottom-0 w-full`; height ≤ viewport − 64; no breakpoint logic    | FIGMA + D-SH4                 |
| Shell     | Obsidian 98%, 1px Sky 18%, radius 28/28/0/0, padding 12/20/28/20, shadow 24/64/55% | as Figma (majority); bottom padding + safe-area inset                       | FIGMA (N-1) + D-SH4           |
| Scrim     | Void Black 66% (62% in My Lectures)                                                | `backdrop:bg-surface-void-black/66`                                         | N-1                           |
| Grabber   | 40 × 4, radius 2; White 20% (22% Folders, Muted 60% More Menu)                     | White 20%, `aria-hidden`, no gesture                                        | D-SH2, D-SH3 (N-3)            |
| Header    | Title M; More Menu close 40, radius 12, Sky 8% / 16%, `x` 18 at inline-end         | as More Menu; close button on every sheet                                   | D-SH3, N-2, N-4               |
| Actions   | Row gap 12; primary fills, secondary hugs                                          | `flex gap-[12px]`; widths from the children                                 | FIGMA                         |
| Motion    | Not designed                                                                       | Slide up 320 / down 200, scrim fade, `ease-standard`; reduced: opacity only | **Approved addition** (D-SH5) |
| Body      | Not designed                                                                       | Focusable region while it overflows                                         | N-5 (WCAG 2.1.1)              |

## 13. Popover and Menu (Phase 03) — Figma values and approved decisions (2026-11-16)

Source: `Notification Dropdown` `2236:784`, `User Menu` `2236:813`, `More Options Dropdown`
`2261:1500`, `Filter Menu` `2261:1430`, `Summary Options Menu` `2392:3979`, and their overlay
frames, read with the Plugin API. Full spec and decisions D-PM1 to D-PM9:
[phases/phase-03-popover-menu-contract.md](phases/phase-03-popover-menu-contract.md). Figma is
not modified.

| Item                | Figma                                                                                     | Implemented value                                                              | Status               |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| Menu `context`      | 220; Graphite 98%; Sky 18% border; radius 14; padding 6, gap 2; shadow 0/16/40 50%        | as Figma                                                                       | FIGMA                |
| Menu `account`      | 256; Obsidian 97%; Sky 18%; radius 18; padding 8, gap 2; shadow 0/24/56 55%               | as Figma; account header is a consumer slot                                    | FIGMA                |
| Popover             | 380 (Mobile 350); Obsidian 97%; Sky 18%; radius 20; padding 16, gap 6; shadow 0/24/56 55% | as Figma; width clamps to viewport − 40                                        | FIGMA                |
| Items               | context 40 / Body / icon 18 Secondary; account 44 / Body Medium / icon 20 Sky; option 38  | as Figma; danger Coral Pulse                                                   | FIGMA                |
| Selected option     | Sky 12% fill + check (vector, Sky)                                                        | `aria-checked:bg-accent-electric-sky/12` + existing `check` icon               | FIGMA (D-PM9)        |
| Dividers            | context White 8%; account Sky 10%                                                         | as Figma                                                                       | FIGMA                |
| Offsets             | context menus 6; User Menu 9; Notifications 16                                            | per component                                                                  | FIGMA (D-PM5)        |
| Viewport margin     | Mobile panels inset 14–20                                                                 | menus 16; Popover 20                                                           | D-PM5                |
| Hover / focus       | Not designed                                                                              | White 5% + D-B2 ring on keyboard focus                                         | **Addition** (D-PM4) |
| Scrim               | Top Bar / Notes 1% (invisible); My Lectures 62%                                           | None in the primitives; My Lectures 62% is a module exception                  | D-PM8                |
| Motion              | Not designed                                                                              | In 200: fade + scale 0.97 + 4px slide; out 120: fade + scale; reduced: opacity | **Addition** (D-PM6) |
| Rename/delete icons | Raw vectors, not in the icon set                                                          | Rendered without icons until exported                                          | D-PM9                |

## 14. Avatar (Phase 03) — approved values (2026-11-16)

Source: Top Bar `2211:179`, User Menu `2236:790`, `Profile / Avatar` `2461:651`. Full spec,
decisions D-AV1 to D-AV6 and normalizations N-1 to N-4:
[phases/phase-03-avatar-contract.md](phases/phase-03-avatar-contract.md). Figma is not modified.

| Item        | Figma                                                               | Implemented value                                         | Status           |
| ----------- | ------------------------------------------------------------------- | --------------------------------------------------------- | ---------------- |
| Sizes       | 40 (Top Bar, User Menu); 96 (Profile)                               | `size` 40 (default) or 96                                 | FIGMA (D-AV2)    |
| Fill        | Three gradients (Sky → Cobalt horizontal / 135°; Cobalt → Sky 135°) | Sky −80% → Cobalt 71%, 135° at both sizes; white initials | N-1, N-2 (D-AV1) |
| Border      | 40: 1px Sky 40% (User Menu none); 96: 2px Sky 50%                   | as Top Bar at 40; as Figma at 96                          | FIGMA + N-3      |
| Initials    | Card Title (40, 1 letter); Title L (96, 2 letters)                  | as Figma; ZWNJ between letters                            | FIGMA (D-AV3)    |
| Placeholder | Graphite + `user` 44 (96 only)                                      | Graphite + `user` 44 / 18                                 | FIGMA + N-4      |
| Contrast    | Figma styles 2.14–2.60 (fail)                                       | ≥ 5.01 calculated; rendered 5.69–5.85                     | D-AV1            |

## 15. Phase 06 shared states and guards — Figma values (read-only, 2026-11-17)

Source: file `Avyn9kL0drXepQyTXTLXXb`, read with the Plugin API (computed node values). Nothing
here is built yet. **FIGMA** = measured; **NOT DESIGNED** = absent from Figma (needs a decision,
never invented). Plan: [phases/phase-06-plan.md](phases/phase-06-plan.md).

### 15.1 Skeleton

| Item      | Figma                                                                                                                               | Status           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Component | `Skeleton / Block` `2495:1719`: 100 × 12, radius 8, fill White 7%                                                                   | FIGMA            |
| Use       | Instances sized to the content they replace (e.g. 124 × 16 title, 308 × 12 line, blocks 102–220 high) inside the real section cards | FIGMA            |
| Screens   | Dashboard Loading Desktop `2495:1720`, Tablet `2495:2978`, Mobile `2495:4188`                                                       | FIGMA            |
| Motion    | None drawn (static blocks)                                                                                                          | **NOT DESIGNED** |

### 15.2 Error card (full) and section error (inline)

| Item            | Figma                                                                                                                                                                       | Status |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Full card       | `Dashboard Error State` `2495:2424` (in `2495:2291`): 1160 wide (Mobile 350, `2495:4794`), vertical, gap 14, padding 32/24, radius 20, Obsidian 90%, 1px Coral 25%, centred | FIGMA  |
| Full: icon tile | 56, radius 14, Coral 12% fill, Coral 30% border, `alert` 25 Coral                                                                                                           | FIGMA  |
| Full: text      | Title Cairo Bold 20/30 Primary; body Regular 14/22 Secondary                                                                                                                | FIGMA  |
| Full: action    | Primary Button "إعادة المحاولة" (126 × 44)                                                                                                                                  | FIGMA  |
| Section error   | `Section Error` `2495:2966` (Partial Error `2495:2435`): horizontal, gap 14, padding 0/16, 46 high, centred                                                                 | FIGMA  |
| Section: parts  | Icon tile 44, radius 14, Coral 12/30, `alert` 20; title Cairo SemiBold 16/24 Primary; body Regular 12/18 Secondary; Secondary Button "إعادة المحاولة" (128 × 44)            | FIGMA  |
| Module dialogs  | Notes errors (`2433:7909`, 7 types, 440 wide) are Phase 03 `Dialog` instances, not error cards                                                                              | FIGMA  |

### 15.3 Empty state

| Item         | Dashboard First-Time `2482:2130` (Tablet `2482:2661`, Mobile `2482:3155`)      | Notes `NoNotes` `2433:7748` (+ NoResults, EmptyFolder, NoLinkedLecture) |
| ------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Box          | vertical, gap 16, padding 48/32, radius 20, Obsidian 88%, 1px Sky 14%, centred | vertical, gap 16, padding 56/40, radius 24, Obsidian 88%, 1px Sky 12%   |
| Icon tile    | 72, radius 20, Sky 12% fill, Sky 40% border, icon 32 Sky                       | 64, radius 18, Sky 12%, Sky 25%, icon 28                                |
| Title / body | Cairo Bold 28/40 Primary; Regular 14/22 Secondary                              | same                                                                    |
| Actions      | Primary + Secondary Buttons (gap 12); footnote Regular 12/18 Secondary         | one Primary Button                                                      |

Both are FIGMA. The two boxes differ (radius, padding, tile); a single component needs a decision
(plan D-U4).

### 15.4 Guard dialogs

| Item         | Leave Recording Guard `2744:5118` (Tablet `2744:5135`, Mobile `2591:3192`)                                                                                                                               | Unsaved Changes Guard `2746:14333` (Tablet `2745:14318`, Mobile `2602:7896`)    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Dialog       | 420 × 236 (Mobile 350); Phase 03 Dialog values (padding 24, gap 14, radius 24, Obsidian 98%, Sky 18%, shadow 0/16/40 50%)                                                                                | 440 × 236; same values                                                          |
| Icon tile    | 48, Coral 12/30 (danger tone)                                                                                                                                                                            | same                                                                            |
| Copy         | "هل تريد مغادرة التسجيل؟" / "قد تفقد أجزاء من التسجيل لم يتم حفظها بعد إذا غادرت الصفحة."                                                                                                                | "لديك تغييرات غير محفوظة" / "إذا غادرت الآن، قد تفقد التعديلات التي لم تحفظها." |
| Safe action  | "البقاء في الصفحة": **Primary** (Sky fill, Void label)                                                                                                                                                   | "متابعة التعديل": Secondary (Sky 8% / Sky 30%, Sky label)                       |
| Leave action | "مغادرة على أي حال": **Secondary fill and border with Coral Pulse label**                                                                                                                                | "مغادرة بدون حفظ": solid Coral fill, Void label (the Handoff P2 inversion)      |
| Behaviour    | Annotation `2588:338`: `alertdialog`, focus trapped and restored; safe action default focus; Esc/scrim = stay; refresh/tab close = native `beforeunload` only; shown while recording data may be unsaved | Frontend annotation `2602:7943`                                                 |

Roadmap Phase 06 and the Handoff (P2) resolve the conflict: every guard follows the Recording
guard (safe = primary, leave = secondary with red text).

**Leave action contrast (calculated):** Coral Pulse on Sky 8% over Obsidian = **5.79:1**. On the
Secondary Pressed fill (Sky 20%, D-B6) = **4.66:1**. Both pass AA; the second has little margin.

### 15.5 Toast

| Item                              | Figma `Settings / Toast` `2462:1771` (Kind = Success / Error / Info)                                                            | Status           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Box                               | 420 × 52 (Mobile 350), horizontal, gap 14, padding 10/14, radius 14, Graphite 98%, shadow 0/16/40 50%                           | FIGMA            |
| Tone                              | 1px border at 40%: Success Green / Coral Pulse / Info Blue; 22 round mark in the solid tone with `check` / `alert` / `check` 13 | FIGMA            |
| Text                              | Cairo Regular 14/22 Primary                                                                                                     | FIGMA            |
| Placement                         | Centred horizontally. Bottom gap 78 (Desktop `2464:3617`, Tablet `2464:3977`); Mobile `2464:4337` 118 (above the 84 bottom bar) | FIGMA            |
| Timing, dismiss, stacking, motion | Not drawn                                                                                                                       | **NOT DESIGNED** |

### 15.6 Danger Button — rendered contrast (Phase 06 Increment 1, 2026-11-18)

Measured in Chromium on the guard dialog (label over fill, dialog surface, scrim and page):
**rest 5.80, hover 5.04, keyboard focus 5.80, pressed 4.69**, matching the §15.4 calculation.
Contract addendum: [phases/phase-03-button-contract.md](phases/phase-03-button-contract.md) §14.

### 15.7 Section error at Tablet and Mobile (read-only, 2026-11-18)

- **Tablet `2495:3661`:** the same row as Desktop: tile, text, Secondary retry; 614 wide.
- **Mobile `2495:4805`:** the row becomes a vertical, centred stack, in this order: tile 44,
  text (centred, 284 wide), then retry 128 × 44. Gap 14, padding-inline 16.
- **Host card** (Recent Lectures): radius 20, padding 16, Obsidian 88%, Sky 14%.

**Implementation (Increment 2):** a container query on the section error. It is a row from 28rem
of card width, stacked below, so it follows the card (316 inner width on Mobile, 614 on Tablet),
not the viewport.

**Skeleton pulse (D-U3):** opacity 1 → 0.55 → 1 over four `flip` durations (1.6s), with the
approved curve; none under reduced motion. Defined once in `src/design-system/motion.css`.

### 15.8 Toast — details and a correction (read-only, 2026-11-18)

- **Correction to §15.5:** in `Kind=Error`, "إعادة المحاولة" is the label of an **inline action
  button**, not the message. The Error message drawn is "حصلت مشكلة أثناء حفظ التغييرات".
- **Error action** (`Retry Button`): 36 high, padding 6/12, radius 10, Coral 14% fill, 1px Coral
  40% border, label Cairo Medium 14/22 Coral.
- **Mark icon:** stroke Void Black, 1.75 (on the solid tone mark).
- **Order** (RTL): mark at the inline start, then the text, then the action at the inline end.
- **Figma frames:** each placement frame shows one toast; no stacking or close control is drawn.

**Implementation (Increment 4):**

- **Box:** `min-h-[52px]` (the 36 action makes the Error toast 56), width `min(420, viewport − 40)`.
- **Close:** a 32 close button, the Dialog close-button look; not designed (plan §6, D-U6 notes).

## 16. Landing (Phase 07) — Figma audit (read-only, 2026-11-19)

Frames: Desktop `5:3` (1440 × 7669), Tablet `200:527` (768 × 9332), Mobile `200:683`
(390 × 10992). All three use page fill Void Black `#040506`. Figma is not modified. The plan is
[phases/phase-07-plan.md](phases/phase-07-plan.md); the copy is
[phases/phase-07-landing-copy.md](phases/phase-07-landing-copy.md); the Hero video brief is
[phases/phase-07-hero-video-brief.md](phases/phase-07-hero-video-brief.md).

### 16.1 Hero

| Item            | Desktop `28:3`                                                                                                                                       | Tablet `200:559`                                       | Mobile `200:713`                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| Frame           | 1440 × 900 at y 0, under the floating navigation                                                                                                     | 768 × 640 at y 110 (nav 78, gap 32)                    | 390 × 538 at y 94 (nav 70, gap 24)                      |
| Video container | Full bleed (stretch), radius 0, clips                                                                                                                | As Desktop                                             | As Desktop, over a Void Black base fill                 |
| Placeholder     | 666 × 412 still, `FIT`                                                                                                                               | Same still, `FILL`                                     | Same still, `FILL`                                      |
| Treatment       | Image filters: exposure −0.27, saturation 0.79, highlights −1.0, shadows −0.12. No overlay layer                                                     | Same                                                   | Same                                                    |
| Layout          | Vertical; padding 344 / 340 / 126 / 340; gap 132; centred                                                                                            | Padding 200 / 32 / 100 / 32; gap 56                    | Padding 150 / 20 / 64 / 20; gap 40                      |
| Heading block   | 760 wide; gap 36                                                                                                                                     | 704 wide; gap 36                                       | 350 wide; gap 36                                        |
| Heading         | `Heading/Display`: Cairo SemiBold 56 / 120%, white, centred (text box 651)                                                                           | Cairo SemiBold 44 / 120% (**no text style**)           | `Landing/Heading/Section Tablet`: 32 / 120%             |
| Description     | `Heading/Medium`: SemiBold 24 / 140%, white, opacity 0.9                                                                                             | `Landing/Label/Title`: SemiBold 20 / 140%, opacity 0.9 | `Landing/Label/Strong`: SemiBold 16 / 140%, opacity 0.9 |
| Actions         | Row, gap 37 (padding 0 / 48), centred; 450 wide                                                                                                      | As Desktop                                             | Column, gap 12, full width 350; **primary first**       |
| Primary button  | "ابدأ مجانًا": 131 × 46; Mist `#e6e6e6` fill; Iron `#454647` 1px border; radius 16; padding 9 / 21; `UI/Button` Medium 20 / 140%; Ink `#07080a` label | As Desktop                                             | 350 × 46                                                |
| Outline button  | "اكتشف كيف يعمل": 186 × 48; no fill; Mist 1px border; radius 16; padding 9 / 13; white `UI/Button` label                                             | As Desktop                                             | 350 × 48                                                |
| Order (RTL)     | Primary at the inline start (right), outline at the end                                                                                              | As Desktop                                             | Primary above outline                                   |

**Desktop text boxes (read 2026-11-19):**

- **Heading:** a FIXED, top-aligned 651 × 143 box (two lines of 67.2 inside).
- **Description:** a FIXED, top-aligned 760 × 33 box. Figma renders the description on two lines
  that overflow the box; auto layout uses the box height, so the actions stay at y 688.
- **Tablet and Mobile:** both texts hug their content.

### 16.2 Navigation

| Item    | Desktop `27:2` (component)                                                                                                                                                                            | Tablet `200:543` / Mobile `200:697`                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Box     | 1361 × 67 at x 39, y 18, **floating over the Hero**. Radius 16; fill Ink 20%; background blur 48 plus a Figma "glass" effect; 1px border `#363739` (**not a token**)                                  | 768 × 78 / 390 × 70 at y 0; no fill or effects                                                                                                                    |
| Content | Logo (188 × 49); links "الرئيسية", "المميزات", "كيف يعمل ؟", "الأسئلة الشائعة" (`UI/Navigation`, Cairo "ExtraBold" 20 / 140%: weight **NOT VERIFIED**, §0.4.3); "EN" and "تسجيل الدخول" (`UI/Button`) | Logo 150 × 39; menu button 46 × 42 (three 20 × 2 bars); "EN" 38 × 45; login 145 × 46. The four links are in the frame, but the menu's open state is **not drawn** |

### 16.3 Section geometry (top-level, in page order)

| Section          | Desktop (x, y, w × h)                                                                          | Tablet (y, h) | Mobile (y, h) |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------- | ------------- |
| Product Showcase | `36:169` 54, 935, 1331 × 942                                                                   | 782, 786      | 656, 673      |
| Features         | `114:6` 120, 1967, 1200 × 1000                                                                 | 1600, 1172    | 1353, 2067    |
| How It Works     | `121:40` 120, 2967, 1200 × 820                                                                 | 2804, 892     | 3444, 1488    |
| Use Cases        | `123:64` 120, 3787, 1200 × 1410                                                                | 3728, 1859    | 4956, 1771    |
| FAQ              | `124:94` 124, 5215, 1200 × 989                                                                 | 5619, 870     | 6751, 1080    |
| Pricing          | `131:177`: the component set placed at 120, 6246, 1200 × 602 (**no section intro on Desktop**) | 6521, 1985    | 7855, 2019    |
| Final CTA        | Panel `126:104` 1200 × 366 (inside "Background Effects")                                       | 8538, 398     | 9898, 433     |
| Footer           | `129:103` 120, 7297, 1200 × 372                                                                | 8968, 364     | 10355, 637    |

**Content width:** 1200 on Desktop (the Showcase app window is 1171).

**Repeated cards:**

| Card                 | Desktop                                                        | Tablet (visual width) | Mobile (visual width) |
| -------------------- | -------------------------------------------------------------- | --------------------- | --------------------- |
| Feature Card `114:2` | 384 × 300, grid 3 × 2, gap 24; visual 336 × 144                | 294                   | 302                   |
| Step Card `121:32`   | 282 × 440, 4 in a row, gap 24; visual 240 × 136                | 300                   | 308                   |
| Use Case rows        | 1200 × 340; image 500 × 276 alternating with content 594 × 155 | Image 654 × 280       | Image 316 × 200       |

Tablet and Mobile column counts are read from the frames at implementation.

**FAQ item:**

- Collapsed and Hover are 900 × 72, radius 12. Collapsed: Ink fill, Slate `#2f3031` border. Hover:
  Obsidian fill, Iron border.
- **Expanded** is a separate component outside the set (FAQ 01, 900 × 152).

**Final CTA buttons:** radius **8** (the Hero buttons use 16).

- "اكتشف المميزات": 170 × 48, Slate border.
- "ابدأ مجانًا": 116 × 48, Mist fill.

### 16.4 Images (embedded in Figma; exported at implementation)

| Asset                                  | Source size | Used at (Desktop / Tablet / Mobile)      | Scale      |
| -------------------------------------- | ----------- | ---------------------------------------- | ---------- |
| Brand logo (`Munsit_Logo_Horizontal`)  | 908 × 236   | Nav 188 × 49 / 150 × 39; footer 170 × 56 | FIT        |
| Hero video placeholder                 | 666 × 412   | Full Hero                                | FIT / FILL |
| `App / Main Content` (Showcase screen) | 1376 × 768  | 918 × 470 (crop) / 702 × 360 / 348 × 250 | FILL       |
| Feature visuals × 6                    | 1376 × 768  | 336 × 144 / 294 × 144 / 302 × 144        | FILL       |
| `HOW_IT_WORKS_01…04`                   | 1376 × 768  | 240 × 136 / 300 × 136 / 308 × 136        | FILL       |
| `USE_CASE_01…03`                       | 1376 × 768  | 500 × 276 / 654 × 280 / 316 × 200        | FILL       |

**Exported (Phase 07 Increment 3, 2026-11-19).** The Figma originals were downloaded read-only
and matched to the image fills by the Figma image hash (the SHA-1 of the bytes). Each was then
converted to WebP (quality 82, source size kept, aspect ratio 1376 : 768 unchanged) with the
`sharp` build bundled with Next.js (no new dependency). Figma is not modified.

| File (`public/landing/…`)           | Figma node                              | Image hash (SHA-1)                         | Source          | WebP     | SHA-256 (WebP, first 16) |
| ----------------------------------- | --------------------------------------- | ------------------------------------------ | --------------- | -------- | ------------------------ |
| `showcase/app-live-transcript.webp` | `39:14` `App / Main Content` (Showcase) | `c7b2cd9842121b67de0dda38be9d7516eef763c5` | JPEG, 523,339 B | 46,650 B | `473769fc008f5047`       |
| `use-cases/during-lecture.webp`     | `123:69` `USE_CASE_01_LECTURE`          | `01b2eac60b2f6e2a36b6d8ec951d1f5a10906022` | JPEG, 653,151 B | 53,644 B | `8c531257ee093ba9`       |
| `use-cases/studying.webp`           | `123:75` `USE_CASE_02_STUDYING`         | `c3bea92a890daf188e946a33ba9e0332921bcc75` | JPEG, 683,877 B | 61,860 B | `1282bd876e9be202`       |
| `use-cases/exam-preparation.webp`   | `123:81` `USE_CASE_03_EXAM`             | `7a7e8eec82fa9b74d12fd856f307cd1adab5c496` | JPEG, 664,428 B | 52,514 B | `be7e7660843b51b7`       |

- All four are 1376 × 768 and are referenced once, from `src/features/landing/model/landing-images.ts`
  (a unit test checks each file's WebP size and that no source repeats).
- Figma also holds 344 × 192 thumbnails of the same images; they are not used.
- **Feature and How It Works visuals (Increment 4, 2026-11-20):** exported the same way
  (originals matched by image hash; opaque PNGs stored as RGB; WebP quality 82 at 1376 × 768),
  from `model/landing-images.ts`:

  | File (`public/landing/…`)          | Figma node (image hash, first 10)           | WebP     |
  | ---------------------------------- | ------------------------------------------- | -------- |
  | `features/live-transcription.webp` | `114:12` (`8cc8577743`)                     | 66,020 B |
  | `features/smart-highlights.webp`   | `114:16` (`8c8b5442de`)                     | 83,392 B |
  | `features/smart-summaries.webp`    | `114:20` (`e02277d86b`)                     | 58,538 B |
  | `features/question-bank.webp`      | `114:25` (`9a96787d5f`)                     | 66,726 B |
  | `features/ai-tutor.webp`           | `114:29` (`4131f36479`)                     | 64,342 B |
  | `features/lecture-slides.webp`     | `114:33` (`592481e3fd`)                     | 79,870 B |
  | `how-it-works/record.webp`         | `HOW_IT_WORKS_01_RECORD` (`e96873f2fa`)     | 57,974 B |
  | `how-it-works/processing.webp`     | `HOW_IT_WORKS_02_PROCESSING` (`48c4cbe507`) | 60,798 B |
  | `how-it-works/review.webp`         | `HOW_IT_WORKS_03_REVIEW` (`70c64b9a9c`)     | 74,910 B |
  | `how-it-works/practice.webp`       | `HOW_IT_WORKS_04_PRACTICE` (`59953bfae9`)   | 78,638 B |

  Feature visuals are mapped to `landing.features.items` 1–6 by their Figma card titles.

**Colours outside the 19 tokens:** the navigation border `#363739`, and the Cyan `#06B6D4` named
in the Hero video direction. All other colours read map to tokens: Void Black, Ink, Obsidian,
Slate, Iron, Mist, Electric Sky, Cobalt Edge.

### 16.5 Navigation font weight — measured (P07-D6, 2026-11-19)

Figma names both navigation faces "Cairo ExtraBold", but reports different numeric weights:

- `UI/Navigation` (Desktop, Mobile): **400**;
- `Landing/Navigation/Tablet`: **800**.

The weight was measured by rendering the same strings in the project's Cairo variable font, in
Chromium, and comparing the widths with Figma's auto-width text boxes:

| String @ size          | Figma width | 400   | 500   | 600   | 700   | 800   |
| ---------------------- | ----------- | ----- | ----- | ----- | ----- | ----- |
| "الأسئلة الشائعة" @ 20 | 127         | 126.4 | 128.1 | 129.9 | 139.1 | 143.5 |
| "كيف يعمل ؟" @ 20      | 103         | 102.8 | 103.8 | 104.8 | 110.2 | 112.8 |
| "المميزات" @ 20        | 71          | 71.0  | 71.9  | 72.9  | 78.0  | 80.4  |
| "الرئيسية" @ 20        | 63          | 62.8  | 64.3  | 65.8  | 74.0  | 77.9  |
| "الأسئلة الشائعة" @ 15 | 108         | 94.8  | 96.1  | 97.4  | 104.4 | 107.7 |
| "المميزات" @ 15        | 61          | 53.2  | 54.0  | 54.7  | 58.5  | 60.3  |
| "الرئيسية" @ 15        | 59          | 47.1  | 48.2  | 49.4  | 55.5  | 58.4  |

**Result:**

- `UI/Navigation` renders at **400** (tokens: `--text-ui-navigation`).
- `Landing/Navigation/Tablet` renders at **800** (tokens: `--text-landing-navigation-tablet`).

In Figma the Tablet and Mobile inline links are hidden layers (the menu button replaces them).

**Navigation border** `#363739` (Desktop bar): a Landing-local constant (owner approval,
2026-11-19), not a token.

### 16.6 Showcase and Use Cases — implementation (Phase 07 Increment 3, 2026-11-19)

Frames: Showcase Desktop `36:169`, Tablet `200:568`, Mobile `200:722`; Use Cases Desktop `123:64`,
Tablet `200:616`, Mobile `200:765`. Components: `LandingShowcase`, `LandingUseCases`.

**Showcase.**

| Item          | Desktop                                                                                                                                   | Tablet                                                | Mobile                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Section       | 1331 centred, padding 43 / 80, gap 39; 35 below the Hero                                                                                  | Padding 64 / 32, gap 32; 32 below the Hero            | Padding 48 / 20, gap 28; 24 below the Hero                                            |
| Heading       | 40 / 600, auto line height, fixed box 161 (min-height)                                                                                    | 32, box 120                                           | 26, box 98                                                                            |
| Description   | `Landing/Body/Intro` 24, box 80                                                                                                           | `Landing/Body/Large` 18, box 54                       | `Landing/Body/Base Mobile` 15, box 69                                                 |
| Window        | 1171 × 560; Ink, 1px `#363739`, radius 16, clips                                                                                          | Full width × 436                                      | 350 × 366 (minimum)                                                                   |
| Header        | 84, Obsidian, padding 10 / 24; pill at the inline end, the title 438 after it                                                             | 74; title at the inline start, pill at the inline end | 114, vertical, gap 6, padding 12 / 16; pill above the title, at the inline start      |
| Pill          | 254 × 54, Graphite, radius 6, padding 10 / 7, gap 8: label `Heading/Medium` Text/Secondary, time Geist Mono 16 / 160% LTR, 8 px coral dot | As Desktop                                            | 177 × 40: label 14 / 600, time 12 / 160%                                              |
| Lecture title | 20 / 160% regular, two lines: white, then Text/Secondary                                                                                  | `Landing/Body/Reading` 16 / 160%                      | 14 / 160%                                                                             |
| Body          | 470: screen 918 (cover at 50% 70.5%, Figma CROP) + menu 251 at the inline start                                                           | 360: screen only (cover, centred); menu hidden        | 250, Void Black, padding 12, gap 10: transcript card (no image; Figma hides its fill) |
| Menu          | Obsidian; title `Heading/Medium` white at y 6; list radius 8, padding 8 / 12, gap 25; six items `Heading/Medium` Text/Secondary, 40 high  | —                                                     | —                                                                                     |

Mobile transcript card (Figma values): heading row 24 (`Dashboard/Card Title` heading at the
inline start; live chip at the end: `#ff6b6b` 14%, radius 999, padding 3 / 8, gap 5, coral 6 px dot
and 12 / 140% coral label); card Obsidian, white 8% border, radius 12, padding 10, gap 10, two
snippets (`Dashboard/Body` line, `Dashboard/Meta` Muted Readable time, LTR, at the inline end);
controls 44, Graphite, radius 12, padding 8 / 12: pause glyph (28 px coral circle, two 3 × 10
white bars) with the 12 / 140% Muted Readable caption at the inline start, ten 3 px Electric Sky
bars (heights 8, 16, 24, 14, 20, 10, 18, 12, 22, 9; radius 2; gap 3) at the end.

**Use Cases.**

| Item    | Desktop                                                                                                                         | Tablet                                       | Mobile                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| Section | 1200, padding 72 / 80, gap 48; directly below How It Works                                                                      | Padding 64 / 32, gap 32; 32 below            | Padding 48 / 20, gap 24; 24 below            |
| Intro   | 900: `Section Desktop` 40 + `Body/Lead` 20, gap 16                                                                              | 704: 32 + `Body/Large` 18                    | 350: 26 + `Base Mobile` 15                   |
| Row     | 1200 × 340, Ink, 1px Slate, radius 20, padding 32, gap 40, centred; image 500 × 276 radius 16                                   | Stacked: padding 24, gap 24; image 654 × 280 | Stacked: padding 16, gap 20; image 316 × 200 |
| Content | Eyebrow `Label/Strong` Electric Sky; title `Heading/Subsection` 28 (h3); text `Body/Large` Text/Secondary; gap 20; inline start | As Desktop                                   | As Desktop                                   |
| Order   | Rows 1 and 3: image at the inline end; row 2: at the inline start                                                               | Image above the content                      | Image above the content                      |

**Justified differences from Figma (documented, not hidden):**

1. **Desktop header width.** Figma's header is 1161 inside a 1169 window, leaving an 8 px Ink
   strip at the inline-start edge. The header fills the window.
2. **Pill width.** It renders 252.5 wide against Figma's 254 (Geist Mono and Cairo glyph metrics),
   so the title sits 1.5 px off Figma's x 716. The rule (title 438 after the pill) is kept and
   tested.
3. **Fluid widths between the drawn frames.** Figma draws 1440, 768 and 390 only. Between 720 and
   1279, the window and cards fill the content width (the screen stays cover, centred). From 1280
   to 1439 the Desktop window narrows with the viewport (1120 at 1280).
4. **Minimum heights on Mobile** (window, header, transcript). At 390 they equal Figma; on
   narrower screens (320) the content grows instead of clipping.
5. **Fixed text boxes as minimum heights** (Showcase intro), so larger text pushes content down
   instead of overlapping it.
6. **Use Case row height.** Figma's fixed 340 row excludes the stroke from layout; the row uses a
   31 vertical padding plus the 1px border, so it is 340 with the image at y 32.
7. **U+2028 in the Showcase heading.** CSS does not break at U+2028; the character stays in the
   text and a `<br>` follows it.
8. **Motion (P07-D17, APPROVED).** None in these sections: the waveform and the recording dot
   stay still, because the Showcase is a static illustration, not an active recorder.
   Section-level ambient motion belongs to the separate Landing Visual Refinement increment
   (plan §8e), never to the recording UI.
9. **Mobile Showcase image.** Figma hides the image fill on Mobile; the image is not shown there
   (lazy-loaded and `display: none`, so it is not downloaded).

### 16.7 FAQ, Pricing and Final CTA — implementation (Phase 07 Increment 5, 2026-11-20)

Frames: FAQ Desktop `124:94` (fixed 989), Tablet `200:629`, Mobile `200:778`; Pricing component set
`131:177` (Desktop has no section frame), Tablet `200:640`, Mobile `200:789`; Final CTA panel
`126:104` (inside "Footer / Ambient Glow"), Tablet `200:651`, Mobile `200:800`.

| Item        | Desktop                                                                             | Tablet                                         | Mobile                                                         |
| ----------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| FAQ section | 18 below Use Cases; padding 80; gap 48; min-height 989                              | 32 below; padding 64 / 32; gap 32              | 24 below; padding 48 / 20; gap 28                              |
| FAQ item    | 900; padding 20 / 24; radius 12; gap 13; collapsed 76                               | 704                                            | 350; padding 20 / 16                                           |
| FAQ type    | question `Heading/Medium` 24 / 1.4; answer `Body/Regular` 20 / 1.6 (Text/Secondary) | same                                           | same                                                           |
| Pricing     | 42 below FAQ; padding 64; gap 40; 3 × 384, gap 24                                   | 32 below; one column 520, gap 32               | 24 below; padding 48 / 20 / 56; gap 32; one column 350, gap 28 |
| Plan card   | 384 × 520 (min); radius 20; padding 32; gap 24                                      | 520 × 520                                      | 350 × 520                                                      |
| CTA panel   | 1200 × 366; padding 80 / 64; gap 24; radius 24; 86 to footer                        | 704 × 302; padding 56 / 32; frame 32 / 64 + 32 | 350 × 361; padding 40 / 20; gap 20; frame 24 / 48 + 24         |

**Differences from Figma (documented):**

1. **Desktop Pricing intro (P07-D5):** Figma's Desktop has only the card set; the Tablet intro
   (eyebrow, heading, description, note) is reused on Desktop at the Desktop section scale (40 /
   20). The Desktop Pricing section is therefore taller than the 602 set.
2. **Desktop card height:** 532.8 instead of 520: at the 318 inner width the Plus and Pro
   descriptions wrap to two lines (Figma's Desktop set shows only the one-line Starter copy); the
   grid keeps the three cards equal.
3. **FAQ line boxes:** Figma rounds the 33.6 question line to 34, so items are 0.8 shorter (75.2 /
   151.2 vs 76 / 152).
4. **Font stack (known, non-blocking; ClickUp typography task):** Mobile FAQ answer 01 wraps to 6
   lines (Figma 5): item 01 is 279 instead of 248; FAQ Tablet section 866 vs 870.
5. **Centring:** Figma places the Desktop FAQ at x 124 and the CTA panel at x 102 (off-centre by 4
   and 18); both are centred.
6. **CTA glow:** the Figma ellipse sits off-centre on Tablet and Mobile (x 340 in 704 / 350 panels)
   and at 100% there; the owner-approved Cobalt Edge 20% glow is centred on every breakpoint.
7. **Featured card base:** the component uses `#000000`; the placed instances use Obsidian, which
   is used (a token).

### 16.8 Product Showcase — native card on every breakpoint (P07-D22, 2026-11-20)

Owner design decision **P07-D22**: replace only the Desktop and Tablet application screenshot with
the approved native Mobile live-transcription card. The heading, description, copy and section
order are unchanged.

| Item                | Desktop (≥ 1280)                                                                                                                                        | Tablet (720–1279)                    | Mobile (< 720)              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------- |
| Former illustration | window 1171 × 560: header, menu, screenshot                                                                                                             | window 704 × 436: header, screenshot | the native card (unchanged) |
| Stage (layout box)  | 1171 × 560 (the former window box)                                                                                                                      | 704 × 436                            | none (the card is in flow)  |
| Card                | 760 wide (owner-approved Candidate B, widened from 700 on 2026-11-21), height from content (304.8 Arabic), centred horizontally, 48 below the stage top | 520 wide (326.8 Arabic), centred     | 350 × 366 minimum (Figma)   |
| Card inside         | the Mobile card: header 114.8 (pill 40 above the two-tone title), transcript body, same type sizes                                                      | same                                 | Figma Mobile                |

**Differences from Figma (documented):**

1. On Desktop and Tablet the Figma app window (header row, 251 menu, screenshot) is replaced by the
   Mobile card. There is no Figma frame for a wider card: the 520 / 760 widths and the placement are
   implementation values (Desktop 48 from the stage top: owner-approved Candidate B, 2026-11-21,
   chosen over a centred 600 card; its 700 width was widened to 760 by the owner the same day).
2. The card has no 366 minimum height from Tablet up; it follows its content, so no empty band
   appears once the lines wrap less.
3. The stage keeps the former window's box, so the section heights (Desktop 942, Tablet 786) and
   the positions of every later section are unchanged. Desktop: about 99 from the description's
   last line to the card and about 250 from the card to the section end, over the ambient glow.
   Tablet: centred, about 55 above and below.

The Showcase screenshot file (`public/landing/showcase/app-live-transcript.webp`) and its model
entry are kept, unreferenced, as history.

## 17. Authentication (Phase 08 Increment 1) — Figma values (read-only, 2026-11-23)

The values were read from Figma page `5:5` "02 — Authentication" (Login `67:3` / `67:59` /
`67:37`, Login Error `2467:75609`, Register `67:14`, Register Success `2480:2534`, and component
sets `191:20`, `191:50`, `191:57`, `191:62`, `191:72`). Every colour maps to an existing token, so
no new token was added. Translucent tints, shadows and sizes are local constants
(`src/features/auth/components/auth-styles.ts`). Typography: §0.4.5.

### 17.1 Layout

Breakpoints follow ADR-004 (Mobile < 720 ≤ Tablet < 1280 ≤ Desktop).

| Part               | Desktop 1440                                    | Tablet 768                                | Mobile 390                                |
| ------------------ | ----------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| Frame              | Void Black, row centred, gap 96                 | Column, padding 40 / 48 / 48 / 48, gap 32 | Column, padding 24 / 20 / 32 / 20, gap 24 |
| Order              | Form column (Logo, card) · Marketing panel      | Logo · Panel · Card                       | Logo · Card · Panel                       |
| Form column        | 480, gap 40, Logo 188 × 49 aligned to the start | —                                         | —                                         |
| Marketing panel    | 520                                             | 672                                       | 350                                       |
| Panel photo        | 520 × 350, `FILL`                               | 672 × 350                                 | 350 × 200                                 |
| Panel copy padding | 28 / 32 / 32 / 32, gap 12, centred              | same                                      | 20 / 20 / 24 / 20                         |

**Panel:**

- Void Black fill, 1 px Neutral Slate border (inside), radius 24, drop shadow 0 24 48 −12 black 40%.
- Heading `Auth/Panel/Heading*`, with the highlighted word in Electric Sky. Lead `Auth/Panel/Lead*`
  in Text Primary. Body `Auth/Panel/Body` in Text Secondary.

**Background glow:** three radial ellipses, each fading to transparent.

| Glow      | Colour          | Desktop (offset from the panel) | Tablet                | Mobile                |
| --------- | --------------- | ------------------------------- | --------------------- | --------------------- |
| Cobalt    | Cobalt Edge 25% | 680 × 680 at −132, −68          | 691 × 500 at −48, −60 | 351 × 439 at −20, −68 |
| Cyan      | Info Blue 12%   | 460 × 400 at 58, −128           | 461 × 300 at 259, 0   | 234 × 300 at 136, −8  |
| Deep Blue | Deep Space 35%  | 650 × 500 at −92, 232           | 691 × 400 at −10, 170 | 351 × 400 at 0, 63    |

Offsets are measured from the panel's physical left edge in RTL and implemented with `end-*`.
Figma adds a layer blur of 140, 110 and 160; the implementation draws the gradients without blur
filters, for rendering cost, as the Landing does (P07-D17).

### 17.2 Components

| Part                       | Values                                                                                                                                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form card                  | Gap 28. Header gap 8: title `Auth/Heading/Form` Text Primary, description `Landing/Body/Large` Text Secondary. Fields gap 20. Footer centred, gap 6: `Landing/Body/Small` Text Secondary plus a link                                                 |
| Input (`191:20`)           | Label `Auth/Form/Label` Text Primary, gap 8. Field 52 high, radius 12, padding 0 / 16, gap 12, Obsidian fill, 1 px Neutral Slate border. Value `Auth/Form/Input` Text Primary; placeholder Muted Readable (Muted while focused or disabled)          |
| Input states               | Focus: Electric Sky border plus a 0 0 0 3 Electric Sky 22% ring. Error: Coral Pulse border, helper `Auth/Form/Helper` Coral Pulse. Disabled: Ink fill, field opacity 50%                                                                             |
| Password (`191:50`)        | Same as Input, with the eye at the inline end: 20 × 20, Text Secondary; Visible adds a 1.6 slash                                                                                                                                                     |
| Primary button (`191:57`)  | 52 high, radius 12, Neutral Mist fill, `Auth/Button/Primary` Neutral Iron. Focus: Electric Sky border plus a 3 px Electric Sky 25% ring. Disabled: opacity 40%. Loading: gap 8, 18 px spinner (track Iron 25%, arc Iron)                             |
| Text link (`191:62`)       | `Auth/Form/Label` Electric Sky, padding 2 / 0. Hover: Info Blue                                                                                                                                                                                      |
| Error banner               | Coral Pulse 8% fill, Coral Pulse 35% border, radius 12, padding 10 / 14, `Dashboard/Body Medium` Coral Pulse                                                                                                                                         |
| Result status icon         | 64 × 64, radius 20, Success Green 12% fill, Success Green 40% border, `check` 28 in Success Green                                                                                                                                                    |
| Validation rule (`191:72`) | Row gap 6: dot 6 × 6, then the label `Auth/Form/Helper`. Neutral: Muted Readable label, Muted dot. Valid: Success Green. Error: Coral Pulse. List gap 16, right-aligned in RTL, reading order length, case, digit (code adds a shape cue, see below) |

**Validation rule shape cue (code, not Figma; owner review pending):** the Figma variants differ
by colour only, so to meet WCAG 1.4.1 the marker also changes shape. Neutral keeps the 6 × 6 dot;
Valid shows the official `check` icon and Error the official `x` icon, both 12 px. Colours and
type are unchanged (contract §16.4).

### 17.3 Marketing photos (D-08-2)

The photos are the Figma originals, matched by image hash (the SHA-1 of the source bytes) and
saved as PNG at source size. They are pixel-identical to the source: no regeneration, recolouring
or cropping.

| File                       | Figma image  | Node       | Source size | PNG SHA-256 (prefix) |
| -------------------------- | ------------ | ---------- | ----------- | -------------------- |
| `public/auth/login.png`    | `10ec5a97e7` | `2175:285` | 1200 × 896  | `b454ed02aab416ec`   |
| `public/auth/register.png` | `53cf19a01a` | `2175:400` | 1200 × 896  | `79d62999fac89f85`   |
| `public/auth/recovery.png` | `f246a9bb43` | `2175:408` | 1264 × 848  | `894312843bd97b21`   |

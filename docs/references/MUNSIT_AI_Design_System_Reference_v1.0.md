# MUNSIT AI — Official Design System Reference v1.0

Figma file: `Avyn9kL0drXepQyTXTLXXb` · Status: design closed · Scope: documentation only.

**Source labels.** `FIGMA` = read from the Figma file via MCP (variable bindings, node properties, metadata). `HANDOFF` = approved project doc "MUNSIT AI — Official Frontend Handoff". `NOT VERIFIED` = not confirmed by either source; do not treat as a token.

---

## 0. Verification status

| Item | Status |
|---|---|
| 17 colors on the Design System page (10:4) | FIGMA verified |
| `Text / Muted Readable` #8d8d8f, `Semantic / Warning` #ffb020 | FIGMA verified (bound on Dashboard Desktop 2211:74); not shown on the swatch page |
| Variable count | Swatch page and naming card state **17**; Handoff states **19** colors + **10** layout tokens. 17 + the 2 above = 19, consistent. Layout collection **NOT VERIFIED in Figma** (no Space/Radius variable returned from any inspected node) |
| Dashboard text styles (Cairo/Inter/Geist Mono) | FIGMA verified (bound on 2211:74) |
| Naming card says "13 local text styles" (Heading/Body/UI/Mono, Inter) | FIGMA; total style inventory incl. `Dashboard/*`, Landing, Auth **NOT VERIFIED** |
| Shell dimensions (232 / 72 / 84), padding, safe areas | HANDOFF only (frame metadata not re-measured) |
| Modes | Single mode, dark-only (HANDOFF). No light palette exists. |

---

## 1. Color system

Collection `01 — Brand Colors`. Pattern `Group / Token Name`. Mode: Dark (only).

| Variable | HEX | Purpose |
|---|---|---|
| Surface / Void Black | #040506 | Page base, frame fill, dark text on primary button |
| Surface / Ink | #07080a | Sidebar, deep surfaces, documentation cards |
| Surface / Obsidian | #111214 | Cards, dialogs |
| ColorSurface / Graphite | #1b1c1e | Raised surfaces (name is an approved as-is exception) |
| ColorSurface / Ember Hush | #452324 | Error tint (as-is exception) |
| Text / Primary | #ffffff | Headings, body, active labels |
| Text / Secondary | #9c9c9d | Supporting text, inactive nav labels |
| Text / Muted | #6a6b6c | Disabled and meta text |
| Text / Muted Readable | #8d8d8f | Muted text that must stay readable |
| Neutral / Mist | #e6e6e6 | Light neutral |
| Neutral / Iron | #454647 | Neutral / border |
| Neutral / Slate | #2f3031 | Borders, disabled primary button fill |
| Accent / Electric Sky | #63a1ff | Primary action, active state, brand blue |
| Accent / Cobalt Edge | #143ca3 | Gradients, glows |
| Accent / Deep Space | #02193b | Gradients, glows |
| Accent / Info Blue | #56c2ff | Info; primary button hover fill |
| Accent / Success Green | #59d499 | Success |
| Accent / Coral Pulse | #ff6363 | Error, destructive |
| Semantic / Warning | #ffb020 | Warning |

Disabled states: no dedicated variable. Observed: Primary disabled fill = Slate, label = Text / Muted (FIGMA 2210:89).

**Local translucent values (not variables, do not promote to tokens)** — all FIGMA-observed: Electric Sky at 8% / 12% / 16% / 24% fills and 12% / 22% / 30% / 42% / 55% borders; Obsidian 88% and Graphite 95% for stat-card surfaces; Success Green 12% for the delta chip.

---

## 2. Typography

Families: **Cairo** (Arabic UI), **Inter** (Latin, numerals, English labels), **Geist Mono** (metadata, codes, timers). Pattern `Group / Variant`. Text styles live in two sets.

### 2.1 Application scale — `Dashboard/*` (FIGMA, application default)

| Style | Font | Weight | Size / LH (px) | Tracking | Use |
|---|---|---|---|---|---|
| Title L | Cairo | Bold 700 | 28 / 40 | 0 | Page title |
| Title M | Cairo | Bold 700 | 20 / 30 | 0 | Section title |
| Card Title | Cairo | SemiBold 600 | 16 / 24 | 0 | Card heading |
| Body | Cairo | Regular 400 | 14 / 22 | 0 | Body |
| Body Medium | Cairo | Medium 500 | 14 / 22 | 0 | Nav labels (default/hover) |
| Button | Cairo | SemiBold 600 | 14 / 20 | 0 | Buttons, active nav label |
| Caption | Cairo | Regular 400 | 12 / 18 | 0 | Captions, mobile nav labels |
| Label EN | Inter | Medium 500 | 12 / 16 | 0 | English labels |
| Stat | Inter | SemiBold 600 | 28 / 34 | 0 | Large numerals |
| Stat Small | Inter | SemiBold 600 | 16 / 22 | 0 | Small numerals |
| Meta | Geist Mono | Regular 400 | 12 / 18 | 0 | Metadata |

### 2.2 Foundation set — Design System page (FIGMA, Inter, used by Landing/docs)

| Style | Font | Weight | Size | Line height | Tracking |
|---|---|---|---|---|---|
| Typography/Hero/Desktop | Inter | Regular | 56 | 117% | 0.22px |
| Heading / Display | Inter | SemiBold | 64 | 110% | 0 |
| Heading / Large | Inter | Medium | 56 | 117% | 0 |
| Heading / Medium | Inter | Medium | 32 | 115% | 0 |
| Heading / Small | Inter | Medium | 24 | 115% | 0 |
| Body / Large | Inter | Regular | 18 | 115% | 0 |
| Body / Regular | Inter | Regular | 16 | 115% | 0 |
| Body / Small | Inter | Regular | 14 | 140% | 0 |
| UI / Navigation | Inter | Medium | 14 | 140% | 0.2px |
| UI / Button | Inter | Medium | 14 | 140% | 0 |
| UI / Caption | Inter | Regular | 12 | 140% | 0 |
| UI / Eyebrow | Inter | Medium | 11 | 91% | 0.8px |
| Mono / Metadata | Geist Mono | Regular | 12 (doc card shows 16 in its own label) | 160% | 0.2px |

`Body/Regular` also appears as Cairo Regular 20 / 160% in documentation frames (FIGMA). Landing and Auth styles (e.g. Landing Section 40 desktop / 26 mobile): **NOT VERIFIED** here (HANDOFF mention only).

Rule: Arabic text uses Cairo; numerals and Latin terms inside Arabic UI use Inter; metadata uses Geist Mono.

---

## 3. Spacing and layout

### 3.1 Official reusable tokens (collection `02 — Layout Tokens`, HANDOFF; **not independently verified in Figma**)

| Token | Values (px) |
|---|---|
| Space XS / SM / MD / LG / XL | 4 / 12 / 16 / 20 / 32 |
| Radius SM / MD / LG / XL / 2XL | 8 / 12 / 16 / 20 / 24 |

### 3.2 Local measurements (not tokens)

| Measurement | Value | Source |
|---|---|---|
| Page padding Desktop / Tablet / Mobile | 24 / 24 / 20 | HANDOFF |
| Section gaps | 24 and 20 | HANDOFF |
| Button | height 44, padding-x 20, radius 12 | FIGMA 2210:89 |
| Sidebar item | 200 wide, height 44, padding-x 14, gap 12, radius 12, icon 20 | FIGMA 2210:118 |
| Mobile nav item | 76 wide, padding 8, gap 4, radius 14, icon 22 | FIGMA 2210:302 |
| Statistic card | 272 wide, padding 16, gap 10, radius 18, icon tile 40 (radius 12), chip radius 8 | FIGMA 2210:187 |
| Design-system doc cards | radius 16, padding 20, 1px Slate border | FIGMA 12:8 |

Radius 14 and 18 are not in the radius scale; keep them as local component values.

### 3.3 Shadows (FIGMA, local)

| Use | Value |
|---|---|
| Primary button hover | `0 4px 9px rgba(99,161,255,0.35)` |
| Statistic card hover | `0 8px 12px rgba(99,161,255,0.16)` |

Borders: 1px solid; default card border Electric Sky 12%; hover 42%; docs use Slate #2f3031.

---

## 4. Responsive design

Reference artboards (not CSS breakpoints; breakpoints NOT VERIFIED/undefined by design).

| Target | Width | Shell | Content | Padding |
|---|---|---|---|---|
| Desktop | 1440 | 232 Sidebar on the right (RTL) | 1208 Main | 24 |
| Tablet | 768 | 72 Rail + drawer overlay | Remaining width | 24 |
| Mobile | 390 × 844 | 72 Top Bar, 84 bottom navigation | Full width, single scroll column | 20 |

- Desktop Top Bar: search, language toggle, theme, notifications, user menu.
- Sidebar/Rail stretch to page height; upgrade card pinned 24px (Desktop) / 20px (Tablet) above the bottom edge.
- Artboard heights (Dashboard Desktop 2316, overlays 900–1990) are drawing artifacts: do not hardcode.
- Overlays are drawn at fixed artboard heights; dialogs center over a viewport scrim.
- Card grid/stacking rules per breakpoint: **NOT VERIFIED** (no grid tokens defined).
- Safe areas: **not defined in design.**

---

## 5. Core components

Rule: one shared component per set; states/variants are props.

| Component | Node | Verified variants / spec |
|---|---|---|
| Button | 2210:89 | Type Primary/Secondary × State Default/Hover/Pressed/Disabled (8). Primary: fill Electric Sky; hover Info Blue + shadow; pressed Electric Sky 78%; disabled Slate fill, Muted label; label Void Black, Button style. Secondary: Electric Sky 8% fill/30% border; hover 16%/55%; pressed 24%/55%; disabled no fill, 20% border; label Electric Sky |
| Sidebar Item | 2210:118 | Default / Hover / Pressed / Active. Active: fill Electric Sky 12%, border 22%, 3×22 accent bar, SemiBold white label. Default label Secondary, Medium. Hover 7% / Pressed 14% fill |
| Navigation Icon Button | 2210:134 | Present; properties not re-read — **NOT VERIFIED** |
| Mobile Navigation Item | 2210:302 | Default / Active. Active: fill Electric Sky 12%, label and icon Electric Sky; Default label Secondary |
| Statistic Card | 2210:187 | Default / Hover / Intro (see 3.2, 3.3) |
| Course Card | 2210:251 | Present (Handoff: Lecture Card has 24 variants); props not re-read — **NOT VERIFIED** |
| Sidebar, Tablet Rail, Tablet Drawer (`Sidebar (expanded)` 2242:1275), Mobile Bottom Navigation, More Sheet | see Dashboard frames 2211:74 / 2224:372 / 2242:1272 | Dimensions per section 4; internal specs **NOT VERIFIED** |
| Inputs, Dialogs, Badges (Status Badge), Tabs, Loading / Empty / Error states | — | Exist per HANDOFF; exact property values **NOT VERIFIED** |

Status badge labels (HANDOFF): في الانتظار / قيد المعالجة / جاهزة. Dashboard states: loading skeleton, full error, partial error (per-section retry), first-time.

---

## 6. Official logo

| Component | Node | Size | Original asset | Use |
|---|---|---|---|---|
| Brand / Logo / Full | 2818:7240 | 1228×236 | 2815:90440 | Roomy placements; never in compact nav |
| Brand / Logo / Horizontal | 2818:7242 | 908×236 | 2815:90441 | Desktop Sidebar, Mobile header, Auth, Landing nav/footer |
| Brand / Logo / Symbol | 2818:7244 | 372×236 | 2815:90442 | Tablet Rail, compact areas |

Transparent PNGs. Placements use image fit (`object-fit: contain`). Preserve gradients and proportions. Never flip in RTL.

---

## 7. RTL and LTR

Approved behavior (HANDOFF/FIGMA):
- File is RTL throughout; Sidebar and Rail on the right; text right-aligned (`text-right`, `dir="auto"` on labels); icons mirror; numerals and Latin terms stay LTR inside Arabic text; logo never mirrored.
- Sidebar item: label first, icon on the inline-start side with active bar on the left edge.
- English LTR layouts, direction-sensitive icon list, form-control and dialog alignment: **NOT VERIFIED** (no LTR frames inspected).

Frontend recommendation (Proposed): use logical CSS properties, `dir` per language, isolate mixed-direction runs, whitelist icons that mirror.

---

## 8. Implementation notes

- **Tokens:** import the 19 colors as variables with names as-is; keep layout tokens as 5 spacing + 5 radius; do not tokenise rgba tints, radius 14/18 or component sizes.
- **Hardcoded values:** components use literal rgba and px values rather than variable bindings; map to local component constants.
- **Relationships:** navigation registry feeds Sidebar, Rail, Drawer, bottom bar, More Sheet; one Active item, none on Profile & Settings; Lecture Details / Recording / Tutor keep My Lectures active.
- **Navigation order:** الرئيسية، محاضراتي، الملخصات، الأسئلة، البطاقات التعليمية، الملاحظات، المفضلة، المجلدات. Mobile bar: الرئيسية، محاضراتي، الملخصات، المزيد.
- **Accessibility (Proposed, not in Figma):** `aria-current="page"`, visible focus, Esc closes overlays, focus trap in sheets/dialogs, safe action focused in guards. Contrast not measured.
- **Figma vs browser:** fixed artboard heights; overlays over flat gray; Menu→Drawer prototype links incomplete; More trigger absent on some mobile frames. Use registry and viewport scrim instead.
- **Guard dialogs:** safe action primary, leave action secondary with red text.
- **Out of scope / unresolved:** backend, auth, data rules (see Handoff).

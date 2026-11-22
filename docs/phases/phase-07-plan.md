# Phase 07 — Landing Page — Plan

- **Status:** **Increment 0 (planning) COMPLETE** once PR #49 is merged; owner decisions
  P07-D1 to P07-D13 recorded on 2026-11-19 (§6). Phase 07 is **IN PROGRESS**. Increment 1 has
  **not** started.
- **Still pending:**
  - English copy approval (P07-D1);
  - the Hero video asset;
  - approved commercial pricing content (P07-D4);
  - legal pages (P07-D2).
- **Baseline:** `main` `4d8cdb1`. Phase 06 is CLOSED (Development Complete — Production QA
  Outstanding). R-2 and R-3 stay OPEN.
- **Sources:**
  - [Roadmap Phase 07](../references/MUNSIT_AI_Development_Roadmap_v1.0.md) (read-only);
  - Figma Landing Desktop `5:3`, Tablet `200:527`, Mobile `200:683` (read-only audit, 2026-11-19);
  - Design System Reference;
  - ADR-001.
- **Companion documents:**
  - Figma values: [design-values.md §16](../design-values.md);
  - copy: [phase-07-landing-copy.md](phase-07-landing-copy.md);
  - Hero video: [phase-07-hero-video-brief.md](phase-07-hero-video-brief.md).

## 1. Official scope (Roadmap, verbatim intent)

| Item             | Text                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Objective**    | The public marketing page, faithful to Figma, in AR and EN                                                                                                                                                         |
| **Scope**        | Header/footer (Horizontal logo), sections per Figma page 01, Landing type styles, approved imagery from project files, responsive layouts, metadata and OG tags, language switch, CTA links to Auth routes         |
| **Dependencies** | 02, 03, 04 (all met)                                                                                                                                                                                               |
| **Deliverables** | `features/landing`, static-generated route                                                                                                                                                                         |
| **Acceptance**   | Visual parity at 1440/768/390 against Figma screenshots; no product claims beyond Figma copy; no horizontal overflow; headings in order; images with alt text; links keyboard reachable; Arabic copy not rewritten |
| **Tests**        | Playwright screenshots per breakpoint; axe; Lighthouse accessibility and SEO recorded as measurements (not targets until D-12)                                                                                     |
| **DoD**          | Landing text lives in message files, not in components                                                                                                                                                             |

## 2. Approved decisions carried in

| ID                | Decision                                                                                                                                                                                                                  | Status                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **D-P07-HERO-01** | **Product-focused Hero video.** The Hero uses a video, not a static image. The Figma Hero is not redesigned; text and buttons are real HTML above it. Brief: [phase-07-hero-video-brief.md](phase-07-hero-video-brief.md) | **APPROVED** (owner, 2026-11-19) |
| Step 3 (Phase 02) | `Landing/*` type styles become tokens in Phase 07 (values already read: design-values §0.4.4 and §16)                                                                                                                     | Approved (2026-11-13)            |
| D-01              | Next.js, deployable as Node. A statically generated `/` fits                                                                                                                                                              | Approved                         |
| D-12              | WCAG 2.2 AA; the last 2 versions of Chrome, Edge, Safari and Firefox. Lighthouse is recorded as a measurement only                                                                                                        | Draft (Roadmap)                  |

## 3. Section audit (order is the same on all three breakpoints)

| #   | Section          | Desktop                                                | Tablet / Mobile                        | Content                               |
| --- | ---------------- | ------------------------------------------------------ | -------------------------------------- | ------------------------------------- |
| 0   | Navigation       | Floating glass bar over the Hero                       | Top bar, menu button                   | Logo, 4 anchor links, EN, log in      |
| 1   | Hero             | 1440 × 900, video                                      | 768 × 640 / 390 × 538                  | Heading, description, 2 CTAs (§16.1)  |
| 2   | Product Showcase | Intro + app window mock (screen image)                 | Mobile: a live transcript card instead | Heading, description, illustrative UI |
| 3   | Features         | 6 cards, 3 × 2                                         | Cards stack                            | Title, text and a visual per card     |
| 4   | How It Works     | 4 step cards in a row, connectors                      | Cards stack                            | Number, title, text and a visual      |
| 5   | Use Cases        | 3 alternating image and content rows                   | Image above content                    | Eyebrow, title, text and an image     |
| 6   | FAQ              | 6 accordion items (Collapsed, Hover, Expanded)         | Same                                   | Question and answer                   |
| 7   | Pricing          | 3 plan cards (Standard, Featured, Secondary)           | Intro + 3 cards + note                 | **Placeholder copy** (P07-D4)         |
| 8   | Final CTA        | Panel with 2 buttons                                   | Same                                   | Heading, description, 2 CTAs          |
| 9   | Footer           | Brand, platform links, account links, legal, copyright | Same                                   | §10 of the copy                       |

**Background:** decorative ambient glows sit behind sections (ellipses with blur, "Background
Effects"). They are CSS decoration, `aria-hidden`.

## 4. Links (existing approved routes only; P07-D2, P07-D3)

| Element                                 | Target                                                            |
| --------------------------------------- | ----------------------------------------------------------------- |
| Nav and footer: الرئيسية                | `#top` (page start)                                               |
| Nav and footer: المميزات                | `#features`                                                       |
| Nav and footer: كيف يعمل؟               | `#how-it-works`                                                   |
| Nav and footer: الأسئلة الشائعة         | `#faq`                                                            |
| Nav: EN; footer: none                   | Existing language switch (keeps page and hash)                    |
| Nav and footer: تسجيل الدخول            | `/login` (`auth.login`)                                           |
| Footer: إنشاء حساب                      | `/register` (`auth.register`)                                     |
| Hero, Final CTA, plan cards: ابدأ مجانًا | `/register` (P07-D3 for the plan cards)                           |
| Hero: اكتشف كيف يعمل                    | `#how-it-works`                                                   |
| Final CTA: اكتشف المميزات               | `#features`                                                       |
| Footer: الشروط والأحكام, سياسة الخصوصية | **Non-interactive text** (P07-D2); real legal pages before launch |

The Auth screens are Phase 08 placeholders until then: the links resolve, and their pages are
placeholders.

## 5. Discrepancies found (Figma vs Figma, or vs approved decisions)

| #    | Finding                                                                                                    | Proposal                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| X-1  | Desktop Hero placeholder `FIT`; Tablet and Mobile `FILL`                                                   | **Resolved:** `cover` with responsive positioning (P07-D10)                                           |
| X-2  | Desktop navigation floats over the Hero; on Tablet and Mobile the Hero starts below the bar (gaps 32 / 24) | As drawn, per breakpoint                                                                              |
| X-3  | Desktop has **no Pricing section intro** (eyebrow, heading, description, note); Tablet and Mobile do       | **Resolved:** reuse the Tablet intro (P07-D5)                                                         |
| X-4  | **Pricing copy is placeholder** (same plan on all cards, price "—", "تُحدد لاحقًا")                          | **Resolved:** development only, not published (P07-D4)                                                |
| X-5  | Button radius: Hero 16, Final CTA 8. Hero primary has an Iron border; the CTA primary has none             | As drawn per section (no shared Landing button unless approved)                                       |
| X-6  | `UI/Navigation` "ExtraBold" with weight 400 (NOT VERIFIED since Phase 02)                                  | **Resolved:** measure in Increment 1 (P07-D6)                                                         |
| X-7  | The Tablet Hero heading 44 has no text style; Mobile reuses `Landing/Heading/Section Tablet`               | Record as Landing tokens: `hero` 56 / 44 / 32                                                         |
| X-8  | The Tablet and Mobile menu button's **open state is not drawn**                                            | **Resolved conditionally:** reuse only if the contract fits (P07-D12)                                 |
| X-9  | FAQ **Expanded** is a separate component outside the variant set; only Collapsed and Hover are in it       | Use the three drawn states                                                                            |
| X-10 | Colours outside the 19 tokens: the navigation border `#363739`; Cyan `#06B6D4` in the video direction      | Cyan: video only (P07-D9). `#363739`: **open**, proposed as a local component constant in Increment 1 |
| X-11 | A decorative video looping more than 5 s needs a pause mechanism (WCAG 2.2.2); none is drawn               | **Resolved:** accessible Pause/Play control (P07-D7)                                                  |
| X-12 | "كيف يعمل ؟ " (nav) vs "كيف يعمل؟" (footer); footer titles 24 vs 20                                        | **Resolved:** preserved exactly, including spacing (P07-D11)                                          |
| X-13 | The Showcase mock sidebar labels ("سجل المحادثات", "بنك الاسئلة") differ from the real app navigation      | Kept verbatim: an illustration, not product UI                                                        |

## 6. Owner decisions (2026-11-19)

| ID      | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Status                               |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| P07-D1  | **English copy.** The complete bilingual review table is [phase-07-landing-copy.md](phase-07-landing-copy.md), with ambiguous translations flagged. Arabic matches Figma exactly. English preserves meaning and adds no product claims. Proposed translations are **not** approved                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | **PENDING FINAL APPROVAL**           |
| P07-D2  | **Footer legal links.** "الشروط والأحكام" and "سياسة الخصوصية" are shown as **non-interactive text** until approved legal routes and content exist. No fake URLs or placeholder links. **Real legal pages are required before public launch**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | **APPROVED**                         |
| P07-D3  | **Pricing buttons.** Registration-oriented actions may link to the approved Register route (`/register`). **No** payments, subscriptions, checkout or automatic plan selection. Nothing may imply that clicking a registration button purchases a plan (no plan parameter, no plan wording in the link)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | **APPROVED WITH RESTRICTIONS**       |
| P07-D4  | **Placeholder pricing.** It is for **development only**. The approved Pricing structure is preserved, with no invented prices, plan benefits or commercial promises. **The placeholder pricing must not reach real visitors**: the section renders only in development and preview, and is excluded from production until approved commercial content exists. **Public-launch blocker**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | **APPROVED FOR DEVELOPMENT ONLY**    |
| P07-D5  | **Desktop Pricing intro.** Reuse the approved Tablet intro (eyebrow, heading, description, note) on Desktop, with the original Arabic copy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **APPROVED**                         |
| P07-D6  | **Navigation typography.** Measure the actual Figma font weight of `UI/Navigation` in Increment 1 and record it in design-values; no invented value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | **APPROVED** (action in Increment 1) |
| P07-D7  | **Hero video controls.** Include a small, accessible Pause/Play control (WCAG 2.2.2). The Hero composition is preserved, and the control must not obstruct the Hero text or CTAs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **APPROVED**                         |
| P07-D8  | **Hero overlay.** No overlay by default; the video grading in the production brief is used. A minimal overlay is added **only if** contrast validation on real frames shows it is necessary, and any visual adjustment is documented                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | **APPROVED CONDITIONALLY**           |
| P07-D9  | **Cyan `#06B6D4`.** Allowed **inside the generated video only**. It is **not** a new application-wide design token                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | **APPROVED**                         |
| P07-D10 | **Video cropping.** Fill-and-crop (`object-fit: cover`) with responsive positioning (`object-position` per breakpoint). Separate landscape (16:10) and portrait (Mobile) masters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **APPROVED**                         |
| P07-D11 | **Arabic copy and typography.** The exact Figma strings are preserved, **including their original punctuation and spacing** (for example "كيف يعمل ؟ " in the navigation and "كيف يعمل؟" in the footer). The approved responsive typography is preserved. **No silent normalization or rewriting**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | **APPROVED**                         |
| P07-D12 | **Mobile and Tablet navigation.** Reuse the existing shared navigation or `Sheet` infrastructure **only where its interaction contract fits** Landing navigation (anchor links close the menu and scroll to the section; Esc and focus return; no app-shell coupling). Do not reuse a product-specific sheet that would create incorrect Landing behaviour. The approved mobile Figma dimensions and interactions are preserved. The fit is evaluated in Increment 1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | **APPROVED CONDITIONALLY**           |
| P07-D13 | **Mariam delegation.** An isolated assignment for the Features Section, the How It Works Section and their focused tests (§8). No unrelated Landing architecture is delegated. **The starter is not sent** until the component contracts and the baseline (after Increment 1) are final                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | **APPROVED**                         |
| P07-D14 | **Hero temporary background:** Near Black `#040506` until the approved video exists; no invented image; not presented as the final visual ([hero contract](phase-07-hero-contract.md) §8)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | **APPROVED**                         |
| P07-D15 | **Pause/Play control:** 40 px dark circle; approved ar/en labels; Hero corner, never over the text or CTAs; hidden while no playable video exists                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **APPROVED**                         |
| P07-D16 | **Pause icon:** a minimal two-bar geometric SVG in the icon set's style; no dependency                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **APPROVED**                         |
| P07-D17 | **Showcase motion (2026-11-19).** The recording waveform and the recording indicator in the Product Showcase are **not animated**: the Showcase is a static illustration, not an active recorder, and must not imply that a recording session is live. Ambient glows, subtle animated gradients, smooth transitions, scroll reveals, hover interactions, the Hero background video integration and a navigation-centring check are **approved as planning** for a separate Landing Visual Refinement increment (§8e), after ClickUp project management is established; none of it is implemented                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **APPROVED**                         |
| P07-D18 | **FAQ accordion (2026-11-20).** Item 01 is expanded on load; only one item is expanded at a time; opening another closes the previous one; activating the expanded item closes it; all items may be collapsed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | **APPROVED**                         |
| P07-D19 | **Pricing, development and preview only (2026-11-20).** The three Figma plan cards (Starter; Plus, Featured; Pro) are implemented with the approved Figma placeholder content only (price "—", "to be decided" notes, four placeholder feature rows). No prices, periods, entitlements, limits, payment or checkout. Hidden in production by the existing P07-D4 gate; not in the navigation or metadata. Actions go to Register with no plan parameter (P07-D3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **APPROVED**                         |
| P07-D20 | **Pricing CTA labels, development preview only (2026-11-20).** The owner accepts the Figma labels "اختار بلس" and "اختار برو" for the development preview; they are not changed at Increment 5 closure. Before public pricing is enabled, review actual prices, plan entitlements, commercial claims, billing details, CTA wording and the registration and subscription flow. P07-D4 is preserved: Pricing stays hidden in production until explicitly approved. The existing "ابدأ مجانًا" claim (copy finding F-2) is flagged for commercial verification before launch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | **APPROVED**                         |
| P07-D21 | **Static Figma Hero Image Approved (2026-11-20).** The Hero uses the original approved Figma image (hash `0c56986f…`, the image fill of the Hero frames `28:3` / `200:559` / `200:713`, with its Figma filters and framing: Desktop FIT, Tablet and Mobile FILL) instead of a background video. It supersedes the Hero video production plan (brief, provisional asset, replacement requirements). No video, poster or Pause/Play control is rendered. The video files and component are kept unreferenced as history. The production gate stays closed until the owner verifies the implementation. Details: [phase-07-static-hero.md](phase-07-static-hero.md)                                                                                                                                                                                                                                                                                                                                                                                                                               | **APPROVED**                         |
| P07-D22 | **Product Showcase: native transcription card on every breakpoint (2026-11-20).** The Desktop and Tablet application screenshot (and the Desktop menu) is replaced by the approved native Mobile live-transcription card, in HTML and CSS on every breakpoint (no raster image, no scaling). The Mobile design is the reference and stays pixel-identical. The card stays a static, non-interactive illustration (P07-D17: no animated waveform or recording dot, no working controls, no fake recording). Layout (owner-approved **Candidate B**, 2026-11-21; Desktop card widened from 700 to **760** by the owner the same day): Desktop card **760** wide, **48** below the top of the former window area (about 99 from the description); Tablet card **520** wide, centred; Mobile visual design unchanged. Section heights and all later section positions are preserved. Values: [design-values §16.8](../design-values.md)                                                                                                                                                            | **APPROVED**                         |
| P07-D23 | **Compact Landing navbar (2026-11-21).** The Desktop navbar becomes a compact top bar (owner visual refinement; a third-party navbar used for proportions only): 58 high, 32 from each viewport edge (1376 wide at 1440), radius 14, the same thin border and translucent glass; logo 30 high (artwork unchanged); links 14 / 500, gap 32 (destinations unchanged). Login and the EN/AR switch become solid white controls with the Ink label (36 high, radius 10, Mist on hover, the Landing focus ring) on Desktop and Tablet. The Tablet bar keeps its layout; the Mobile bar and menu sheet are unchanged. Details: [phase-07-navbar-refinement.md](phase-07-navbar-refinement.md)                                                                                                                                                                                                                                                                                                                                                                                                         | **APPROVED**                         |
| P07-D24 | **Primary CTA label and Authentication gate (2026-11-21, final 2026-11-22; exception to the verbatim Figma copy).** "ابدأ مجانًا" ("start for free") is a commercial claim that has not been approved: the Hero and Final CTA primary label becomes "ابدأ الآن" (English, gated: "Get started"). Authentication is not operational (the Auth routes are Phase 04 placeholders; Phase 08 not started), so an explicit Authentication gate (`AUTHENTICATION_AVAILABLE = false`, `isAuthenticationAvailable`) **hides every public authentication entry point in production**: the navbar login (Desktop, Tablet, Mobile menu sheet), the Hero primary CTA, the footer account links (login, register) and the Final CTA section, whose only remaining action would be a link back to Features. Development and preview keep them all. The approved design and responsive layouts are otherwise unchanged; the Pricing Starter label (development only) is left to the pricing review. Details: [phase-07-cta-correction.md](phase-07-cta-correction.md). Linked to the commercial release blocker | **APPROVED**                         |
| P07-D25 | **Unfinished Authentication placeholders in production (owner, 2026-11-22).** Hiding the Landing entry points (P07-D24) left `/login`, `/register`, `/forgot-password`, `/reset-password` (and `/en/…`) reachable and indexable in production. With the same gate (`AUTHENTICATION_AVAILABLE`, now in `src/config/availability.ts`), production returns 404 for the four Auth routes until Authentication is operational; development keeps the Phase 04 placeholders. Every Phase 04 placeholder is `noindex, nofollow`; the Landing stays indexable. Availability gating, not route protection (D-02, D-R12 unchanged). PR in review. Details: [phase-07-auth-placeholders.md](phase-07-auth-placeholders.md)                                                                                                                                                                                                                                                                                                                                                                                | **APPROVED** (scope)                 |

**Section order (final, all breakpoints):**

1. Navigation
2. Hero
3. Product Showcase
4. Features
5. How It Works
6. Use Cases
7. FAQ
8. Pricing
9. Final CTA
10. Footer

Pricing never moves before FAQ.

**Public-launch blockers recorded by these decisions:**

- approved English copy (D1);
- real legal pages (D2);
- approved commercial pricing content (D4);
- the approved Hero video (D-P07-HERO-01).

The development work can proceed without them.

## 7. Assets

| Asset                                                                 | Status                                                                                                                                                            |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero video (landscape and portrait masters) + 2 posters               | **Pending:** production per the brief; owner approval                                                                                                             |
| Logo                                                                  | **Exists:** `public/brand/Munsit_Logo_Horizontal.png`, 908 × 236, the same size as the Figma brand image (design-values §6)                                       |
| Showcase screen, 6 feature visuals, 4 step visuals, 3 use-case images | **In Figma**, 1376 × 768 each. Showcase screen and 3 use-case images **exported** (Increment 3, WebP; design-values §16.4). Feature and step visuals: Increment 4 |
| OG image (metadata)                                                   | **Not in Figma:** owner to provide or approve (part of P07-D1 review)                                                                                             |

## 8. Mariam: Features and How It Works (P07-D13, APPROVED)

**Readiness:** the assignment is approved and its boundaries are below. It is **not ready to
send**. The starter package goes out only after both of these exist:

1. the Increment 1 baseline (Landing tokens, the `features/landing` skeleton and the `landing`
   namespace) merged on `main`;
2. the component contract for Feature Card `114:2` and Step Card `121:32`, with exact values per
   breakpoint, approved.

**Files (only these):**

- `src/features/landing/components/FeatureCard.tsx`, `FeaturesSection.tsx`, `StepCard.tsx`,
  `HowItWorksSection.tsx`;
- their tests, `*.test.tsx`.

**Inputs:**

- **Copy:** typed props filled by Yousef from `landing.json` (keys in the copy document §4–§5).
  The components hold no copy.
- **Images:** an asset map passed as props; Yousef exports the images.
- **Tokens:** the Landing type tokens added by Yousef in Increment 1.

**Not hers:**

- the page route, `messages/`, `design-system`, `shared/`, other sections, assets, dependencies,
  config;
- requests go into `DELIVERY.md`.

**Contract:** a component contract with the exact Figma values (Feature Card `114:2`, Step Card
`121:32` with its `Show Connector`, and the per-breakpoint widths in design-values §16.3). It is
prepared after Increment 1, from the starter package (offline procedure).

## 8a. Increment 1 outcome (Landing foundation, COMPLETE: PR #50, `60044cc`)

- **Built:**
  - `src/features/landing`: header (Desktop floating bar at `xl`+, the compact Tablet / Mobile
    bar), menu, footer, page with the section boundaries in the approved order, metadata;
  - the `landing` message namespace;
  - `typography-landing.css`, 30 tokens.
- **Static generation:** `/ar` and `/en` are SSG (`●`). Production gates verified with
  `NEXT_PUBLIC_APP_ENV=production`: `/en` is 404, and there is no language link and no Pricing
  boundary.
- **P07-D6 (done):** `UI/Navigation` renders at weight **400**, `Landing/Navigation/Tablet` at
  **800**, measured against Figma (design-values §16.5).
- **P07-D12 (evaluated, reused):** the shared Phase 03 `Sheet` fits Landing navigation:
  - a generic native modal dialog (Esc, scrim, close button, focus kept off the page behind,
    focus return, scroll lock);
  - the anchor links close the sheet and the browser follows the fragment;
  - the product's `MoreSheet` is not reused;
  - copy reuses the approved shell strings (open/close menu, "القائمة").
- **Verbatim Arabic (P07-D11):** all 109 values were checked against Figma, including instance
  overrides. Two exact details are kept:
  - the Showcase heading's U+2028 line separator;
  - the copyright line, which Figma renders with a left-to-right base direction.
- **Hero boundary:** it reserves the Figma Hero box and holds the visually hidden `h1`. Increment 2
  renders the Hero.
- **Breakpoints:** ADR-004, so 1024 uses the Tablet bar (the Desktop bar's content does not fit
  below about 1060 px).
- **Mariam:** draft contract in [phase-07-mariam-contract.md](phase-07-mariam-contract.md) (not
  sent).

## 8b. Increment 2 outcome (Hero, COMPLETE through PR #52)

- **Built:**
  - `LandingHero` (server): layout per breakpoint, typography, CTAs, poster layer;
  - `HeroVideo` (client): sources, cover, reduced motion, Pause/Play;
  - `PauseIcon` (P07-D16);
  - `model/hero-media.ts`: the one place to add the approved asset.
- **No video asset yet (P07-D14):** Near Black background, with no video, poster or control. The
  temporary background is not the final visual.
- **Figma evidence:**
  - **Desktop heading:** a fixed, top-aligned 651 × 143 text box (reproduced with min-height).
  - **Desktop description:** Figma lays out a fixed 760 × 33 box with a 132 gap, while the text
    renders on two lines (67.2) that overflow the box. Final review (owner request): the
    description stays in **normal flow** with a Desktop gap of **98** (33 + 132 = 67.2 + 97.8).
    Arabic is identical to Figma (actions at y 688, Hero 900). Enlarged text, as in text-only
    zoom (WCAG 1.4.4), now pushes the actions down instead of overlapping them, as the fixed box
    would have; regression tests cover it. At 200% browser zoom the Tablet layout applies, with no
    overlap and no overflow.
  - **Hero buttons:** 131 / 186 wide with the Arabic labels (the Figma label box is wider than the
    glyphs). Reproduced as minimum widths, so longer labels never clip.
- **Mariam starter:** prepared from the baseline `01453f4` and verified in an empty folder. Sent
  afterwards (§8c).

## 8c. Mariam starter (Features and How It Works)

- **Package:** `munsit-starter-01453f4.zip`, kept outside the repository.
  - SHA-256 `f93495ef5976516968262d044805a73b64d7809336261a35d7d930c26d49d496`.
  - Contents: 401 tracked files at `01453f4`, plus `BASELINE_COMMIT.txt` and `START_HERE.md` (the
    approved assignment).
- **Checks:** no forbidden paths, and none of the eight delegated files pre-created. Verified in an
  empty folder: frozen install, then `pnpm check` 1182/1182.
- **Status: SENT / AWAITING IMPLEMENTATION.** Approved for delivery by the owner on 2026-11-19
  (re-verified: SHA-256, baseline, contents). The owner confirmed on 2026-11-19 that it was sent;
  the exact send time is not recorded. No delivery has been received yet.

## 8d. Increment 3 outcome (Showcase and Use Cases, COMPLETE through PR #53)

- **Built:**
  - `LandingShowcase` (server): Desktop and Tablet app window, Mobile live-transcript card;
  - `LandingUseCases` (server): intro and three rows (alternating on Desktop, stacked below);
  - `model/landing-images.ts`: the four exported images.
- **Assets:** four Figma originals, matched by image hash and converted to WebP at the source size
  (design-values §16.4).
- **No fake functionality:** the app window is an `aria-hidden` illustration, with no control or
  focusable element. Its demo copy is the Figma copy from the `landing` messages.
- **Accessibility:**
  - `h2` per section, an `h3` per Use Case;
  - decorative images (`alt=""`): the Use Case photos sit beside their own title and text;
  - axe WCAG 2.2 AA clean at 390, 768 and 1440 in both locales;
  - no horizontal overflow from 320 to 1440;
  - nothing animates.
- **Figma match:** geometry is exact for Arabic at 1440, 768 and 390, within ±1 px. The
  documented differences are in design-values §16.6.
- **Approval:** approved for merge by the owner on 2026-11-19, with P07-D17: the Showcase
  recording waveform and indicator stay static (design-values §16.6, item 8).
- **Mariam:** her starter is SENT / AWAITING IMPLEMENTATION (§8c). Her delivery is not
  received, reviewed or accepted.

## 8e. Landing Visual Refinement (COMPLETE: PR #55)

Approved by the owner on 2026-11-19 (P07-D17) as planning; the go-ahead came on 2026-11-20 (after
the ClickUp setup). Implemented on `feat/phase-07-hero-media-visual-refinement` with the Hero
video as a **provisional development asset** (hidden in production). Details, measurements and
the open owner decisions: [phase-07-hero-media.md](phase-07-hero-media.md).

- Ambient glows and subtle animated gradients.
- Smooth transitions and scroll-reveal animations.
- Professional hover interactions (interactive elements only).
- Hero background video integration (needs the approved asset, P07-D14).
- Navigation bar centring verification.

Constraints: CSS first with the existing motion tokens, full `prefers-reduced-motion` support,
no new dependency without approval. The Showcase recording waveform and indicator stay static
(P07-D17).

## 8f. Increment 4 outcome (Features and How It Works, COMPLETE: PR #56, `b364cd5`)

- **Mariam's delivery** `munsit-delivery-landing-features-how-it-works-20261119-v1.zip` (SHA-256
  `5546d504…`; baseline `01453f4`): the eight contract files, applied verbatim (byte-identical)
  as their own commit. Code written by Mariam; the Git author is the integrator, as for earlier
  deliveries. Her 41 unit tests pass on current `main`.
- **Her open questions, checked in Figma:** the Feature Card stroke is `INSIDE` and outside the
  layout (padding 24 from the outer edge), so her `p-[23px]` + 1px border is correct; the Step Card
  stroke is inside the layout (20 + 1 = inner 240), correct; the connector dot is an `ELLIPSE`
  (round), correct.
- **Integration (Yousef):** the ten Figma visuals (matched by image hash, WebP at 1376 × 768,
  design-values §16.4); page wiring with landmark names from the section headings (her request);
  Figma section gaps (Desktop 90 / 0, Tablet 32, Mobile 24); Desktop minimum heights 1000 / 820,
  because Figma's Desktop section frames are fixed-height with empty space below the content; the
  approved scroll reveal on each section. Her files are unchanged.
- **Figma match:** Arabic exact at 1440 / 768 / 390 (cards, visuals, section positions: Features
  1967, How It Works 2967, Use Cases 3787 on Desktop), except:
  - **Typography (documented, not changed):** the shared stack `Inter, Cairo` draws spaces and
    Latin punctuation inside Arabic text with Inter (a deliberate Phase 02 rule for numerals and
    Latin), so Arabic lines are ~2% wider than Figma. Effects: the Features intro wraps to 3 lines
    on Desktop (Figma 2; absorbed by the 1000 minimum height), and steps 03–04 wrap to 3 lines at
    768 (How It Works 916 vs 892). Proposed fix for a separate, approved design-system PR: give the
    Inter face a `unicode-range` that excludes the space and Arabic-context punctuation, so Cairo
    draws them while Latin letters and numerals stay in Inter; it needs app-wide regression
    evidence.
  - **Owner decision (2026-11-20):** the typography differences are accepted as known,
    non-blocking discrepancies for Increment 4; the investigation is tracked separately and the
    `unicode-range` fix is not approved for implementation.
  - **Figma inconsistency:** the Desktop Features frame draws card 01 on the left (mirrored), while
    Figma Tablet and How It Works put 01 at the inline start. The approved contract (§4,
    "card or step 01 at the inline start") is followed.

## 8g. Increment 5 outcome (FAQ, Pricing, Final CTA, COMPLETE)

Merged as PR #58 (`5b17b27`), owner approved 2026-11-20; label decision P07-D20. The full
Landing and Hero video review that followed: [phase-07-landing-review.md](phase-07-landing-review.md).

- **FAQ (P07-D18):** six verbatim questions and answers; a client accordion with native buttons in
  `h3`s, `aria-expanded` / `aria-controls`, labelled answer regions, `visibility: hidden` when
  collapsed (out of the tab order and the accessibility tree), height via CSS grid rows (no fixed
  heights; instant under reduced motion). Figma states Collapsed, Hover (Obsidian / Iron),
  Expanded (minus in Electric Sky); focus ring D-B2.
- **Pricing (P07-D19, development only):** three cards in reading order Starter → Plus (Featured,
  badge) → Pro. **Copy finding:** the Figma Tablet and Mobile instances carry plan names,
  descriptions and buttons for Plus ("بلس", "اختار بلس") and Pro ("برو", "اختار برو") that the
  Increment 0 copy package had not captured (it read the component defaults). They were added
  verbatim (Arabic from Figma code points; English PROPOSED, P07-D1). Prices, notes and feature
  rows stay the approved placeholders. Owner note: the "اختار بلس" / "اختار برو" labels read as plan
  selection while the link carries no plan (P07-D3); kept verbatim for development review.
- **Final CTA:** the Figma panel; the Cobalt Edge 20% glow as a radial gradient (no blur filter);
  primary at the inline start → Register, outline → `#features`; Mobile stacks (primary first).
- **Figma match and differences:** design-values §16.7.

## 9. Increments and PR boundaries

| #   | Increment                     | Content                                                                                                                                                                                                                                                       | Depends on                       |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 0   | **Plan** (this PR, docs only) | Audit, copy, video brief, decisions                                                                                                                                                                                                                           | —                                |
| 1   | **Landing foundation**        | `Landing/*` and Hero type tokens; `features/landing` skeleton; `landing` message namespace (Arabic + approved English); public header (Desktop, Tablet, Mobile, menu per P07-D12) and footer; anchors; metadata and OG; static generation; screenshot harness | P07-D1 (EN), D2, D6, D12         |
| 2   | **Hero**                      | `HeroVideo` (poster, reduced motion, pause per P07-D7, `<source media>`), Hero text and CTAs. It ships with the poster until the video is approved                                                                                                            | D-P07-HERO-01; P07-D7–D10; asset |
| 3   | **Showcase + Use Cases**      | Showcase (Desktop and Tablet app window, Mobile transcript card), Use Case rows, image export                                                                                                                                                                 | 1                                |
| 4   | **Features + How It Works**   | Mariam delivery (§8), integrated by Yousef                                                                                                                                                                                                                    | 1; P07-D13                       |
| 5   | **FAQ + Pricing + Final CTA** | Accordion (keyboard, `aria-expanded`, three drawn states), plan cards per P07-D3–D5, CTA panel                                                                                                                                                                | 1                                |
| 6   | **Verification and closure**  | Screenshot parity at 1440/768/390 (ar and en), 320 overflow, axe, keyboard pass, Lighthouse measurements, closure report                                                                                                                                      | 1–5                              |

**Recommended first implementation increment: 1 (Landing foundation).** It unblocks every
section (tokens, namespace, header and footer, static route, screenshot harness) and carries the
layout risk. The Hero (2) can follow without waiting for the final video, because the poster
stands in.

## 10. Testing strategy

- **Unit:** section components with their props; accordion state; video element attributes
  (`muted`, `loop`, `playsinline`, reduced-motion branch); messages key parity for ar and en.
- **E2E:**
  - screenshots per section and full page at 1440/768/390, ar and en;
  - no horizontal overflow at 320;
  - heading order and one `h1`;
  - every image has alt text (decorative ones empty);
  - anchors and Auth links work;
  - keyboard reaches every link, button and accordion item;
  - reduced motion shows the poster;
  - axe (WCAG 2.2 AA, contrast on);
  - Lighthouse accessibility and SEO recorded.
- **Contrast:** white Hero text measured on real video frames (brief §6).

## 11. Risks

| ID   | Risk                                        | Mitigation                                                                                         |
| ---- | ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| L-R1 | English copy has no approved source         | P07-D1 before EN ships; Arabic first                                                               |
| L-R2 | The video asset is late or fails contrast   | The poster ships first; contrast is measured; the grade is fixed before any overlay                |
| L-R3 | Generated video invents UI or distorts text | No readable text; review every frame; composite real screens if text is needed                     |
| L-R4 | Placeholder pricing read as a product claim | P07-D4; keep the Figma "to be announced" note                                                      |
| L-R5 | Large images and video hurt load time       | Modern formats, responsive sizes, `preload="metadata"`, poster first; measured                     |
| L-R6 | Real-browser differences (R-3)              | The Chromium suite plus the existing cross-browser pattern; real-device QA stays an R-3 obligation |

## 12. Definition of Done (Phase 07)

- **Acceptance:** the Roadmap acceptance and tests are met at 1440/768/390 in ar and en (EN with
  approved copy).
- **Copy:** all Landing copy lives in `landing.json`; no component holds copy.
- **Hero:** it uses the approved video (or the approved poster fallback), with reduced motion and
  the pause behaviour per P07-D7.
- **Records:** the phase closure report is written and `PROGRESS.md` is updated. Phase 08 has not
  started.

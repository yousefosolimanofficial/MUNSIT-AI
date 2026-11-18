# Phase 07 — Landing Page — Plan

- **Status:** **DRAFT, Increment 0** (planning only; 2026-11-19). Awaiting the owner's review. No
  implementation has started.
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

## 4. Links (proposed; to the existing approved routes only)

| Element                                 | Target                                         |
| --------------------------------------- | ---------------------------------------------- |
| Nav and footer: الرئيسية                | `#top` (page start)                            |
| Nav and footer: المميزات                | `#features`                                    |
| Nav and footer: كيف يعمل؟               | `#how-it-works`                                |
| Nav and footer: الأسئلة الشائعة         | `#faq`                                         |
| Nav: EN; footer: none                   | Existing language switch (keeps page and hash) |
| Nav and footer: تسجيل الدخول            | `/login` (`auth.login`)                        |
| Footer: إنشاء حساب                      | `/register` (`auth.register`)                  |
| Hero, Final CTA, plan cards: ابدأ مجانًا | `/register` (P07-D3 for the plan cards)        |
| Hero: اكتشف كيف يعمل                    | `#how-it-works`                                |
| Final CTA: اكتشف المميزات               | `#features`                                    |
| Footer: الشروط والأحكام, سياسة الخصوصية | **No route exists** (P07-D2)                   |

The Auth screens are Phase 08 placeholders until then: the links resolve, and their pages are
placeholders.

## 5. Discrepancies found (Figma vs Figma, or vs approved decisions)

| #    | Finding                                                                                                    | Proposal                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| X-1  | Desktop Hero placeholder `FIT`; Tablet and Mobile `FILL`                                                   | `cover` everywhere: identical at 16:10, safer elsewhere (P07-D10)                    |
| X-2  | Desktop navigation floats over the Hero; on Tablet and Mobile the Hero starts below the bar (gaps 32 / 24) | As drawn, per breakpoint                                                             |
| X-3  | Desktop has **no Pricing section intro** (eyebrow, heading, description, note); Tablet and Mobile do       | Use the Tablet intro on Desktop (P07-D5)                                             |
| X-4  | **Pricing copy is placeholder** (same plan on all cards, price "—", "تُحدد لاحقًا")                          | Owner decision (P07-D4)                                                              |
| X-5  | Button radius: Hero 16, Final CTA 8. Hero primary has an Iron border; the CTA primary has none             | As drawn per section (no shared Landing button unless approved)                      |
| X-6  | `UI/Navigation` "ExtraBold" with weight 400 (NOT VERIFIED since Phase 02)                                  | Read the rendered weight in Increment 1 (P07-D6)                                     |
| X-7  | The Tablet Hero heading 44 has no text style; Mobile reuses `Landing/Heading/Section Tablet`               | Record as Landing tokens: `hero` 56 / 44 / 32                                        |
| X-8  | The Tablet and Mobile menu button's **open state is not drawn**                                            | Owner decision (P07-D12)                                                             |
| X-9  | FAQ **Expanded** is a separate component outside the variant set; only Collapsed and Hover are in it       | Use the three drawn states                                                           |
| X-10 | Colours outside the 19 tokens: the navigation border `#363739`; Cyan `#06B6D4` in the video direction      | `#363739` as a local component constant (like other translucent tints)? Cyan: P07-D9 |
| X-11 | A decorative video looping more than 5 s needs a pause mechanism (WCAG 2.2.2); none is drawn               | P07-D7                                                                               |
| X-12 | "كيف يعمل ؟ " (nav) vs "كيف يعمل؟" (footer); footer titles 24 vs 20                                        | Verbatim; owner to confirm (P07-D11)                                                 |
| X-13 | The Showcase mock sidebar labels ("سجل المحادثات", "بنك الاسئلة") differ from the real app navigation      | Kept verbatim: an illustration, not product UI                                       |

## 6. Decisions needed (owner)

| ID      | Decision                                                                                                                                  | Recommendation                                                                                             |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| P07-D1  | **English copy:** approve the proposed translations ([copy](phase-07-landing-copy.md)), or provide an approved source (design-values O-1) | Review and approve per section; EN ships only when approved                                                |
| P07-D2  | **Terms and Privacy** have no routes or content                                                                                           | Render them as plain text, not links, until pages exist (no new routes in Phase 07)                        |
| P07-D3  | **Plan card CTA "ابدأ مجانًا"** destination (plan upgrade is deferred, D-18)                                                               | `/register`, the same as the Hero                                                                          |
| P07-D4  | **Pricing placeholder copy:** show the section as drawn ("to be announced"), or hide it until plans exist                                 | Show as drawn: it is Figma copy and makes no claim, with the note "will be set before the official launch" |
| P07-D5  | **Desktop Pricing intro** is missing                                                                                                      | Reuse the Tablet intro copy and Landing styles on Desktop                                                  |
| P07-D6  | **Navigation font weight** (`UI/Navigation`)                                                                                              | Measure the rendered Figma weight in Increment 1, then record                                              |
| P07-D7  | **Hero video pause control** (WCAG 2.2.2): add a small, undrawn pause/play button, or stop the video within 5 s                           | Add an accessible pause/play button (visible on focus and hover, inline end of the Hero)                   |
| P07-D8  | **Legibility overlay** only if the graded video fails contrast                                                                            | Not needed if the grade is baked in (brief §6)                                                             |
| P07-D9  | **Cyan `#06B6D4`** in the video (not a design token)                                                                                      | Allow it inside the video asset only, or use Info Blue `#56c2ff`                                           |
| P07-D10 | **Video fit:** `cover` on every breakpoint (Figma Desktop shows `FIT`)                                                                    | `cover`                                                                                                    |
| P07-D11 | **Copy details:** nav "كيف يعمل ؟ " spacing; footer title sizes 24 / 20                                                                   | Keep verbatim; trim the trailing space                                                                     |
| P07-D12 | **Mobile and Tablet menu:** its open state is not drawn                                                                                   | Reuse the Phase 03 `Sheet`, with the four links, EN and log in (no new design); or show inline links       |
| P07-D13 | **Mariam assignment** (§8)                                                                                                                | Assign Features and How It Works cards to Mariam                                                           |

## 7. Assets

| Asset                                                                 | Status                                                                                                                      |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Hero video (landscape and portrait masters) + 2 posters               | **Pending:** production per the brief; owner approval                                                                       |
| Logo                                                                  | **Exists:** `public/brand/Munsit_Logo_Horizontal.png`, 908 × 236, the same size as the Figma brand image (design-values §6) |
| Showcase screen, 6 feature visuals, 4 step visuals, 3 use-case images | **In Figma**, 1376 × 768 each. Export at implementation (WebP/AVIF), with alt text per image                                |
| OG image (metadata)                                                   | **Not in Figma:** owner to provide or approve (part of P07-D1 review)                                                       |

## 8. Mariam: Features and How It Works (proposed boundaries, P07-D13)

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

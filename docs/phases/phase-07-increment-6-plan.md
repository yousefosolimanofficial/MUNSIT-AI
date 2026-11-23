# Phase 07 — Increment 6 readiness assessment and execution plan

Status: **APPROVED** (technical QA plan, owner 2026-11-21). Execution evidence:
[phase-07-qa-report.md](phase-07-qa-report.md). Phase 07 stays **IN PROGRESS** until the owner
reviews the evidence and approves closure. Assessed on `main` at `f215a91` (2026-11-21).

Increment 6 scope (plan §9): screenshot parity at 1440 / 768 / 390 (ar and en), 320 overflow, axe,
keyboard pass, Lighthouse measurements, closure report. Phase DoD: plan §12.

## 1. Requirement traceability

**1. Implemented and verified** (merged; automated tests in CI; post-merge CI green):

| Requirement (plan §1, §12; decisions)                                                                                         | Evidence                                                                |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `features/landing`, statically generated `/` and `/en`                                                                        | Increment 1 (PR #50); build output (SSG)                                |
| Sections per Figma in order: header, Hero, Showcase, Features, How It Works, Use Cases, FAQ, Pricing (dev), Final CTA, footer | `landing.spec.ts`, section specs; review captures 2026-11-21            |
| Landing copy in `landing.json` only (DoD)                                                                                     | Unit key-parity tests; components take copy props                       |
| Arabic copy verbatim (Figma code points)                                                                                      | Copy package; unit tests against messages                               |
| Headings in order, one `h1`; decorative images `alt=""`                                                                       | `landing.spec.ts`, section specs                                        |
| No horizontal overflow (320–1440)                                                                                             | E2E overflow tests per section and page                                 |
| Keyboard reachability, focus ring, FAQ accordion keyboard (P07-D18)                                                           | E2E keyboard tests; unit tests                                          |
| Automated a11y (axe WCAG 2.2 AA) at 390 / 768 / 1440                                                                          | axe E2E per section, both locales                                       |
| Reduced motion; no continuous animation (P07-D17)                                                                             | E2E motion audits                                                       |
| Static Figma Hero image (P07-D21) with contrast corrections                                                                   | `landing-hero`, `landing-visual-refinement` specs (composited contrast) |
| Native Showcase card (P07-D22: 760 / 520 / Mobile)                                                                            | `landing-showcase.spec.ts` geometry; Mobile pixel identity (review)     |
| Section transitions (glow falloff, Hero letterbox)                                                                            | Seam E2E tests                                                          |
| Compact navbar (P07-D23)                                                                                                      | `landing.spec.ts` geometry, colours, focus                              |
| Metadata (title, description, `og:*` text, Twitter card)                                                                      | Production HTML (2026-11-21)                                            |
| CTA links to approved Auth routes only (P07-D3)                                                                               | E2E link targets                                                        |

**2. Implemented, awaiting owner approval:**

| Item                                    | Gate / approval needed                                                     |
| --------------------------------------- | -------------------------------------------------------------------------- |
| Hero image in production (P07-D21)      | Owner visual approval → `HERO_IMAGE.provisional = false` (separate change) |
| Hero image sharpness (666 × 412 source) | Accept as is, or provide a higher-resolution original (no AI upscaling)    |
| English Landing copy (P07-D1)           | Copy approval → `LANDING_ENGLISH_APPROVED = true` (separate change)        |

**3. Blocked by business / legal decisions:**

| Item                                          | Current production behaviour                                  |
| --------------------------------------------- | ------------------------------------------------------------- |
| Commercial pricing (P07-D4, P07-D19, P07-D20) | Pricing not rendered in production                            |
| "ابدأ مجانًا" (copy finding F-2)               | **Shown in production** (Hero and Final CTA → `/register`)    |
| Legal pages (P07-D2)                          | Footer items are plain text (no links)                        |
| Open Graph image (`og:image`)                 | Not set; owner to provide or approve (ClickUp `pmj`, blocked) |

**4. Requiring technical QA (Increment 6):** see §3.

**5. Deferred and explicitly accepted:**

- Typography / font-fallback differences (known, non-blocking; investigation ClickUp `q27`).
- W-1 WebKit guard (accepted under R-3; one visible `fixme` E2E skip).
- G-1 (conditional risk acceptance), R-2 (no-JS 404), real-device QA (R-3): project-level,
  scheduled for the release phase.

## 2. Production gate audit (`NEXT_PUBLIC_APP_ENV=production` build, served and inspected)

| Gate       | Result                                                                                                    | Activation mechanism                                        |
| ---------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Hero       | No Hero image, no `<video>`, no `.mp4` / `.webm` / poster reference, no Pause/Play control; dark fallback | `HERO_IMAGE.provisional` in `model/hero-media.ts` → `false` |
| Pricing    | No Pricing section, plan cards, `#pricing` link or structured data; no "اختار بلس"                        | `isPlaceholderPricingVisible` (production → hidden)         |
| English    | `/en` → **404**; no language link in the header                                                           | `LANDING_ENGLISH_APPROVED` in `model/gates.ts` → `true`     |
| Legal      | "سياسة الخصوصية" and "الشروط والأحكام" are non-interactive text; no fabricated destinations               | Real pages + links (owner)                                  |
| Free claim | "ابدأ مجانًا" appears **in production** as the Hero and Final CTA label, linking to `/register`            | Owner commercial decision (keep, reword, or gate)           |

**Flag for the owner:** "ابدأ مجانًا" ("start for free") is a commercial statement shown in
production today, and it links to Register, whose backend is not verified. It is the approved
Figma copy (verbatim); it has been flagged since the copy review (F-2, P07-D20) and needs a
commercial decision before launch.

## 3. QA gap analysis

| Area                      | Status today                                                                 | Automatable? | Evidence needed for closure                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------- |
| Desktop browsers          | Full suite in Chromium only; Firefox / WebKit run the guard spec only        | Partly       | Landing smoke in Firefox and WebKit (Playwright); real Chrome, Edge, Firefox, Safari: manual |
| Tablet / Mobile browsers  | Emulated viewports in Chromium                                               | Partly       | Real iOS Safari and Android Chrome: manual (R-3)                                             |
| Physical devices          | **None performed**                                                           | No           | Device list, screenshots, notes                                                              |
| Screen readers            | **None performed** (axe only)                                                | No           | VoiceOver, TalkBack, NVDA pass notes (`pnw`)                                                 |
| Keyboard navigation       | E2E per component; no single end-to-end page pass                            | Yes          | One recorded full-page Tab order pass, ar and en                                             |
| Reduced motion            | E2E covered                                                                  | Yes          | Already automated                                                                            |
| Performance               | **No Lighthouse measurements recorded**                                      | Yes          | Lighthouse a11y / SEO / performance, recorded only (D-12)                                    |
| Image quality             | Hero soft (666 × 412 source); other images exported at source size           | No           | Owner visual decision                                                                        |
| Responsive layouts        | E2E geometry at 1440 / 1280 / 1024 / 768 / 390 / 320; manual parity captures | Yes          | **Landing visual baselines** (`toHaveScreenshot`) do not exist yet (`pn6`)                   |
| Figma parity (ar and en)  | Measured per increment; differences documented (design-values §16)           | Partly       | Final parity table at 1440 / 768 / 390                                                       |
| W-1 (WebKit)              | Accepted; `fixme` skip                                                       | —            | Keep documented                                                                              |
| Language-switch E2E flake | One unexplained failure; not reproduced (50/50 stress); unchanged            | Yes          | Monitor in CI; investigate with the CI trace if it recurs                                    |

**Superseded in part by §4a (P07-D26):** the real-browser, device and screen-reader rows above
are release-readiness evidence, not implementation-closure evidence. They stay NOT VERIFIED.

## 4. Proposed Increment 6 plan (execution only after owner approval)

**A. Technical QA and regression** (owner: Yousef; ClickUp `pn4`, `pn5`, `pn6`)

1. **A1 Landing visual baselines:** add `toHaveScreenshot` baselines for the full page and each
   section at 1440 / 768 / 390, ar and en, with Linux baselines for CI (existing pattern in
   `visual.spec.ts`). Acceptance: suite green in CI.
2. **A2 Figma parity table:** final measured comparison at 1440 / 768 / 390 against the Figma
   frames; every difference listed with its decision or reason.
3. **A3 Accessibility pass:** axe at all six widths in ar (and en in development); one end-to-end
   keyboard pass recorded; heading and landmark outline recorded.
4. **A4 Lighthouse:** accessibility, SEO, best practices and performance on the production build,
   Desktop and Mobile, **recorded as measurements only** (D-12).
5. **A5 Cross-browser smoke:** a Landing smoke spec in Playwright Firefox and WebKit (load,
   overflow, links, accordion). This is automation, not a real-browser claim.
6. **A6 Flake watch:** record CI flake history; investigate the language-switch test only with a
   real trace.
7. **A7 Production smoke suite** (added by the owner on 2026-11-22 after P07-D24): a separate
   Playwright config against a `NEXT_PUBLIC_APP_ENV=production` build served by `next start`,
   1440 / 768 / 390. It runs in CI. It checks the production gates (Authentication, Pricing,
   English), the Hero secondary CTA, navigation, overflow, RTL metadata and console errors.

Stop condition: any regression or new axe violation stops Increment 6 until it is fixed in a
separate PR.

**B. Owner visual approvals** (owner: product owner)

- B1 Hero image for production (and its sharpness).
- B2 Final parity table (A2) and the documented differences.

**C. Business and legal approvals** (owner: product owner)

- C1 English copy (P07-D1).
- C2 Commercial pricing content, plan wording, billing (P07-D4, P07-D19, P07-D20).
- C3 "ابدأ مجانًا" commercial claim (keep, reword or gate).
- C4 Legal pages (P07-D2).
- C5 Open Graph image.

**D. Production activation** (separate small PRs, each only after its approval)

- D1 `HERO_IMAGE.provisional = false` (after B1).
- D2 `LANDING_ENGLISH_APPROVED = true` (after C1).
- D3 Pricing content and gate change (after C2).
- D4 Legal links (after C4); `og:image` (after C5).

Each activation PR re-runs `corepack pnpm check` and `corepack pnpm test:e2e`, verifies the
production build, and records post-merge CI.

**E. Phase closure** (owner: Yousef; ClickUp `pmk`)

- E1 Closure report (`phase-07-closure-report.md`): scope, decisions P07-D1 to P07-D23, evidence
  from A, open items with owners, production state.
- E2 `PROGRESS.md` updated; Phase 07 marked COMPLETE only after owner sign-off.

**Release vs closure:** Phase 07 can close (Definition of Done met for the development build)
with C and D items still open, if the owner accepts them as recorded release blockers. Public
launch needs B, C and D complete, plus the project-level gates (R-3, screen readers,
performance).

## 4a. Closure versus release (P07-D26, owner, 2026-11-23)

§3 listed real browsers, devices and screen readers as "evidence needed for closure", while §4
allowed closure with release items open. The owner resolved the conflict in favour of §4.

- **Implementation closure** may occur with deferred release obligations, provided the owner
  accepts each one explicitly and it is recorded with a task
  ([phase-07-closure-report.md](phase-07-closure-report.md) §11).
- **Production launch** cannot occur while any mandatory release blocker is unresolved.
- **Deferred tests** (hands-on keyboard, real Firefox and Safari, physical iPhone and Android,
  NVDA, VoiceOver, TalkBack) remain **NOT VERIFIED**; they are not passes.
- **Deferred functionality** (Authentication, the production Hero image, Pricing, English, legal
  links, `og:image`) remains unavailable in production until its gate is approved.

## 5. Release blockers ranked by severity

1. **"ابدأ مجانًا" in production** — a live commercial claim without a commercial decision (C3).
2. **Legal pages missing** (C4) — no privacy policy or terms behind the footer items.
3. **No real-browser, device or screen-reader evidence** (R-3, `pnw`) — only automation so far.
4. **Hero image not activated** (B1) — production shows the dark fallback.
5. **English not approved** (C1) — production serves Arabic only.
6. **Pricing content** (C2) — hidden in production; no impact until activated.
7. **Open Graph image** (C5) — social previews have no image.
8. **No Landing visual baselines / Lighthouse records** (A1, A4) — Increment 6 work.

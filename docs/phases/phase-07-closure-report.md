# Phase 07 — Landing Page — Closure report (DRAFT)

- **Status:** **Implementation complete — closure pending owner sign-off.** Phase 07 is **not**
  closed. Production release is **blocked** (§10, §11).
- **Basis:** owner decision P07-D26 (2026-11-23, [phase-07-plan.md](phase-07-plan.md) §6). It
  defines how the phase closes and is not itself the sign-off.
- **Prepared on:** `main` `5cb1f6d` (2026-11-23). There are no open pull requests. CI `check` and
  `e2e` pass on that commit.
- **Evidence:** [phase-07-qa-report.md](phase-07-qa-report.md).
- **Plans:** [phase-07-plan.md](phase-07-plan.md) and
  [phase-07-increment-6-plan.md](phase-07-increment-6-plan.md).

## 1. Executive summary

The Arabic-first, RTL Landing Page is implemented and verified in automated testing. Its sections,
in order, are Hero, Product Showcase, Features, How It Works, Use Cases and FAQ, plus the
development-only Pricing preview and Final CTA. The Navbar, Footer, metadata and favicon are in
place.

- **Accepted by the owner:** the Arabic implementation, the English visual layout, the static Hero
  implementation and the screenshot baselines.
- **Production configuration:** shows only what is approved. Authentication entry points, the Hero
  image, Pricing and English are hidden behind gates that stay closed.
- **Recommendation:** close Phase 07 as **IMPLEMENTATION COMPLETE — PRODUCTION RELEASE BLOCKED**
  once the owner signs off (§13).
- **Deferred:** the release-readiness obligations in §11 stay open, and the tests in §7 stay
  **NOT VERIFIED**.

## 2. Implemented scope

| Area                   | Delivered                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Route and foundation   | Static Landing route, `features/landing`, public layout, metadata and Open Graph tags without an image                     |
| Navbar and Footer      | Compact navbar (P07-D23), mobile menu sheet (Esc closes it, focus is trapped), footer with plain-text legal items (P07-D2) |
| Hero                   | Static Figma image (development only, P07-D21), contrast scrims, primary and secondary CTA (primary gated, P07-D24)        |
| Product Showcase       | Native live-transcription card on every breakpoint (P07-D22)                                                               |
| Features, How It Works | Per Figma; delivered through the offline workflow (P07-D13)                                                                |
| Use Cases, FAQ         | Per Figma; FAQ accordion with `aria-expanded` and `aria-controls`                                                          |
| Pricing, Final CTA     | Development preview only (P07-D4, P07-D20); Final CTA hidden in production (P07-D24)                                       |
| English                | Full LTR layout as a development preview (P07-D1 copy pending); `/en` returns 404 in production                            |
| Production gates       | Authentication (P07-D24, P07-D25), Hero image, Pricing and English, driven by `NEXT_PUBLIC_APP_ENV`                        |
| Copy                   | All Landing text lives in `landing.json` (Phase 07 DoD), with Arabic and English key parity tested                         |
| Favicon                | `src/app/favicon.ico` exported from the approved Symbol (F-1); the Apple touch icon is deferred                            |

## 3. Approved design deviations

| ID      | Deviation                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------- |
| P07-D2  | Footer legal items are plain text until real legal pages exist                                      |
| P07-D4  | Pricing is a development preview only; no commercial content is published                           |
| P07-D20 | Pricing CTA labels follow Figma, in the development preview only                                    |
| P07-D21 | Static Figma Hero image instead of the Hero video; development only                                 |
| P07-D22 | Native Showcase card instead of the Figma application screenshots                                   |
| P07-D23 | Compact navbar instead of the Figma 67 px bar                                                       |
| P07-D24 | Primary label "ابدأ الآن" instead of "ابدأ مجانًا"; Authentication entry points hidden in production |
| P07-D25 | Auth placeholder routes return 404 in production; Phase 04 placeholders are `noindex`               |
| §8f     | Font-stack line-wrap differences from Figma (typography investigation)                              |

## 4. Merged pull requests

| PR  | Merge     | Content                                                          |
| --- | --------- | ---------------------------------------------------------------- |
| #49 | —         | Increment 0: plan and owner decisions P07-D1 to P07-D13          |
| #50 | `60044cc` | Increment 1: Landing foundation                                  |
| #52 | —         | Increment 2: Hero                                                |
| #53 | —         | Increment 3: Showcase and Use Cases                              |
| #55 | `0826ab1` | Visual refinement and Hero media                                 |
| #56 | `b364cd5` | Increment 4: Features and How It Works                           |
| #58 | `5b17b27` | Increment 5: FAQ, Pricing preview, Final CTA                     |
| #60 | `c712bd7` | Static Figma Hero image (P07-D21)                                |
| #61 | `715a4a7` | Showcase native card (P07-D22)                                   |
| #64 | `f215a91` | Compact navbar (P07-D23)                                         |
| #66 | `66df53c` | CTA label and Authentication gate (P07-D24)                      |
| #68 | `620e26f` | Auth placeholders 404 in production (P07-D25)                    |
| #67 | `6997d34` | Increment 6: visual baselines, production smoke suite, QA report |
| #69 | `51a562b` | Real Chrome and Edge evidence                                    |
| #70 | `76954ed` | Favicon (F-1)                                                    |
| #71 | `5cb1f6d` | QA records: F-1 resolved, O-1 investigation                      |

"—" means the merge SHA is recorded in [PROGRESS.md](../PROGRESS.md) and not repeated here.

## 5. Automated QA evidence

Final CI on `main` `5cb1f6d` (run 45081085228):

- `check` (types, lint, format, unit, build): passed. Unit tests: 1308 / 1308 at the last local
  run.
- `e2e`: development 1070 passed, 1 skipped (W-1); production smoke 29 passed.

| Evidence                                      | Result                                                                                                                              | Reference    |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Visual baselines (132; 66 Windows + 66 Linux) | Owner-approved on 2026-11-22; full page and 10 parts at 1440, 768 and 390, ar and en                                                | QA report A1 |
| Figma comparison                              | Per-section geometry assertions with documented differences (owner-accepted, P07-D26)                                               | A2           |
| axe WCAG 2.2 AA                               | No violations at 1440, 1280, 1024, 768, 390 and 320, ar and en                                                                      | A3           |
| Headings and keyboard                         | One `h1`, no skipped levels; automated full keyboard pass at 1440 and 390 (owner-accepted)                                          | A3           |
| Overflow                                      | None at 1440, 768, 390 and 320                                                                                                      | A1, A7       |
| Lighthouse (lab, recorded only)               | Desktop 100 / 100 / 96 / 100; Mobile 90–92 / 100 / 96 / 100. Best Practices 96 came from the favicon 404; not re-measured since F-1 | A4           |
| Playwright engines                            | Chromium, Firefox and WebKit automation (15 passed); not real browsers                                                              | A5           |
| Production smoke                              | 29 tests on a `NEXT_PUBLIC_APP_ENV=production` build, in the required `e2e` job                                                     | A7           |

The Lighthouse columns are Performance / Accessibility / Best Practices / SEO.

## 6. Real-browser evidence

- **Browsers:** the installed Chrome 157.0.8103.79 and Edge 158.0.4370.33 on Windows 11, run
  against the production build. 70 / 70 checks passed (QA report §7.3).
- **Method:** automated testing of real installed browsers, not a hands-on session
  (owner-accepted).
- **Since the favicon fix:** neither browser logs a console error on `/` or `/dashboard`.

## 7. Unverified environments (deferred to release readiness, P07-D26)

These checks were **not performed**. They stay **NOT VERIFIED** and are not passes.

- Firefox (real browser), Safari on macOS, a second major version of Chrome and Edge, and Chrome
  on macOS.
- iOS Safari on a physical iPhone, and Android Chrome on a physical device.
- NVDA, VoiceOver and TalkBack.
- A hands-on keyboard pass by a person.

## 8. Accepted technical risks

| ID         | Risk                                                                                                                   | Task                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| W-1        | WebKit (Playwright) navigation guard: Leave after a cancelled Back reloads; `fixme` kept                               | `123ru7v2pnp`              |
| G-1        | A second browser Back without interaction leaves a guarded page (conditional acceptance)                               | `123ru7v2pnn`              |
| R-2        | The 404 page's first HTML is empty until hydration                                                                     | `123ru7v2pnk`              |
| R-3        | Cross-browser coverage is engine automation plus Chrome and Edge on Windows only                                       | `123ru7v2pnm`              |
| Typography | Font-stack line-wrap differences from Figma (plan §8f)                                                                 | `123ru7v2q27`              |
| E2E flake  | One unexplained Landing language-switch failure; monitored                                                             | `123ru7v2uex`              |
| O-1        | Deployment limitation: `next start -H 127.0.0.1` loops on locale rewrites (QA report §7.4). Do not bind to `127.0.0.1` | `123ru7v2pn3` (deployment) |

## 9. Deferred commercial and legal decisions

- **English copy:** approval pending (P07-D1).
- **Commercial pricing:** content, plan wording and billing (P07-D4, P07-D19, P07-D20).
- **Legal pages:** P07-D2.
- **Open Graph image:** to be provided or approved by the owner.
- **Apple touch icon:** deferred by the owner; it needs an opaque background.

## 10. Production gate status (all unchanged; none activated)

| Gate                                                | Production state                                                      | Opens only when                                 |
| --------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| Authentication (`AUTHENTICATION_AVAILABLE = false`) | No Login, Register, Hero primary or Final CTA; Auth routes return 404 | Owner confirms working sign-in and registration |
| Hero image (`HERO_IMAGE.provisional = true`)        | Near-black Hero, secondary CTA only                                   | Owner approves the production Hero image        |
| Pricing                                             | Not rendered                                                          | Owner approves commercial pricing content       |
| English (`LANDING_ENGLISH_APPROVED = false`)        | `/en` returns 404, no language link                                   | Owner approves the English copy                 |

Each activation is a separate small PR, made only after its approval (Increment 6 plan, item D).

## 11. Release-readiness handoff

None of these block implementation closure. **Every one blocks production launch.**

| Obligation                                 | Task                                               | Approver                     | Status      | Gate or dependency                  | Evidence to complete                                                              |
| ------------------------------------------ | -------------------------------------------------- | ---------------------------- | ----------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| Hero image quality and production approval | `123ru7v2pnv`                                      | Product owner                | To do       | Opens the Hero image gate           | Sharper approved source (or acceptance); edge transition resolved; owner sign-off |
| English copy approval                      | `123ru7v2pmh`, `123ru7v2pnv`                       | Product owner                | To do       | Opens the English gate              | Signed-off copy table (phase-07-landing-copy.md)                                  |
| Commercial pricing                         | `123ru7v2pnu`                                      | Product owner                | To do       | Opens the Pricing gate              | Approved plans, prices, wording and billing terms                                 |
| Authentication readiness                   | `123ru7v2pmm` (Phase 08), `123ru7v2pn1` (Phase 21) | Product owner, Frontend Lead | Backlog     | Opens the Authentication gate; D-02 | Working sign-in and registration confirmed by the owner                           |
| Legal pages                                | `123ru7v2pnt`                                      | Product owner (legal)        | To do       | Legal links in the footer           | Approved legal texts and routes                                                   |
| Open Graph image                           | `123ru7v2pmj`                                      | Product owner                | Blocked     | `og:image` metadata                 | Approved image; social preview check                                              |
| Hands-on keyboard pass                     | `123ru7v2pn5`                                      | QA (Frontend Lead)           | In progress | None                                | Recorded full-page Tab pass by a person, ar and en, in a real browser             |
| Firefox and Safari validation              | `123ru7v2pnm`                                      | QA (Frontend Lead)           | In progress | None                                | Versions, screenshots and §7.3 checks in real Firefox and Safari                  |
| Physical iPhone and Android validation     | `123ru7v2pnm`, `123ru7v2pn4`                       | QA (Frontend Lead)           | In progress | None                                | Device model, OS, browser, screenshots, touch and safe-area notes                 |
| NVDA, VoiceOver and TalkBack               | `123ru7v2pnw`                                      | QA (Frontend Lead)           | Backlog     | None                                | Reading order, landmarks, headings, menu and FAQ state notes per reader           |
| Performance validation                     | `123ru7v2pnx`                                      | QA (Frontend Lead)           | Backlog     | D-12 targets                        | Lighthouse and low-end device measurements                                        |
| Accepted technical risks                   | §8 tasks                                           | Product owner                | Open        | Release decision                    | Fixed, or re-accepted at release                                                  |
| Deployment binding (O-1)                   | `123ru7v2pn3` (Phase 23)                           | Frontend Lead                | Backlog     | Deployment target                   | Server binding checked on the chosen host                                         |

## 12. Implementation closure recommendation

**Recommended:** close Phase 07 as **IMPLEMENTATION COMPLETE — PRODUCTION RELEASE BLOCKED**.

How each Definition of Done item stands (plan §12, Roadmap Phase 07, universal checks):

| Item                                                            | Status                                                                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Visual parity at 1440 / 768 / 390                               | **Met by owner decision** (P07-D26): per-section comparisons and approved baselines; no full-frame overlay |
| Arabic at 1440 / 768 / 390                                      | **Met**; accepted by the owner                                                                             |
| English with approved copy                                      | **Partly met:** layout accepted; **copy approval NOT met**, deferred to release readiness (P07-D26)        |
| Hero (approved video or poster)                                 | **Superseded** by P07-D21 (static image, accepted); **production activation NOT met**, deferred            |
| No product claims beyond Figma copy; Arabic not rewritten       | **Met**, with the approved exception P07-D24                                                               |
| No horizontal overflow; heading order; alt text; keyboard reach | **Met** (automated)                                                                                        |
| Manual keyboard pass (universal check)                          | **Met for closure by owner decision** (automated pass); **hands-on pass NOT VERIFIED**, deferred           |
| Playwright screenshots, axe, Lighthouse recorded                | **Met**                                                                                                    |
| Landing text in message files (DoD)                             | **Met**                                                                                                    |
| RTL and LTR, 320 overflow, universal checks                     | **Met**                                                                                                    |
| Closure report and PROGRESS.md                                  | **This draft**; finalised on sign-off                                                                      |
| Phase 08 not started                                            | **Met**                                                                                                    |

No incomplete criterion is reported as passed. Each one is either met, met by an explicit owner
decision, or deferred and still open.

## 13. Owner sign-off

| Field                                                                   | Value       |
| ----------------------------------------------------------------------- | ----------- |
| Phase 07 closed as IMPLEMENTATION COMPLETE — PRODUCTION RELEASE BLOCKED | **PENDING** |
| Signed by                                                               | —           |
| Date                                                                    | —           |

The sign-off accepts the deferred obligations in §7 and §11 as release-readiness work. It does
not activate any production gate and does not start Phase 08.

# Phase 02 — Design System implementation — Report

- **Date:** 2026-11-13
- **Branch:** `phase/02-design-system` (based on `e3d5e00`), merged to `main` via PR #2 (rebase)
- **Scope source:** Development Roadmap v1.0 §7 Phase 02; user approvals per step (2026-11-13).
- **Result:** **Completed (2026-11-13).** All Phase 02 acceptance criteria passed; G-1 and G-2
  and the six visual baselines approved by the user. Merged into `main` through PR #2; final
  commit `79685af` (`79685af190bdbc6e207b1bf0682e14ddab6b2184`). CI `check` green on the PR and on `main`;
  `pnpm check` and `pnpm test:e2e` (74/74) passed on the merged commit. Open follow-up: hydration
  warning, issue #3 (see F).

## A. Executive summary

Phase 02 delivers the single source of visual truth for MUNSIT AI: the 19 approved colors,
spacing/radius tokens, the approved motion foundation with reduced-motion support, the
`Dashboard/*` type scale with self-hosted Cairo / Inter / Geist Mono, the official logo
component, the official 40-icon system exported from Figma, and the Arabic-first i18n and
RTL/LTR foundation (`next-intl`, Arabic at `/`, English at `/en`). Every value is traced to the
Design System Reference or Figma (`docs/design-values.md`) and enforced by tests. No approved
design value was changed; Figma was only read.

## B. Completed scope

| Step | Deliverable                                                                                                                                                                                                                | Status               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1    | Read-only Figma check: no keyframe motion; Statistic Card Intro = opacity 0, Hover = 4 px lift; layout variables not bound in Figma                                                                                        | Done                 |
| 2    | Tokens: 19 colors, 5 spacing, 5 radius, page padding; motion tokens 120/200/320/400 ms + standard easing; reduced motion; `--motion-dir`                                                                                   | Done                 |
| 3    | Typography: 11 `Dashboard/*` styles as Tailwind tokens; families with script routing (Arabic → Cairo, Latin/numerals → Inter, metadata → Geist Mono); full style catalog recorded                                          | Done                 |
| 3b   | Fonts self-hosted with `next/font/local` (official Google Fonts WOFF2, OFL); build needs no network (R-1 resolved)                                                                                                         | Done                 |
| 4    | Official logo: 3 originals byte-identical in `public/brand/`, `Logo` component, alt "MUNSIT AI", never mirrored; `assets/` git-ignored                                                                                     | Done                 |
| 5    | Official icon system: 40 icons exported from Figma (geometry fingerprints match Figma 40/40), `Icon` component, `currentColor`, non-scaling 1.75 stroke, `arrowLeft` mirrors in LTR only; Lucide ISC / Feather MIT notices | Done                 |
| 6    | i18n / RTL-LTR: `next-intl` 4.15.1, `[locale]` routes, `as-needed` prefix, no detection, no cookie, `proxy.ts`, typed messages, `<html lang dir>`, `Ltr` isolation helper, dev language control                            | Done                 |
| 7    | Final audit, contrast measurement, this report                                                                                                                                                                             | Done (this document) |

## C. Design compliance

| Area             | Evidence                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Colors           | 19 variables, HEX identical to the Reference (unit test parses the Reference itself); Tailwind default palette removed; built CSS contains exactly 19 color variables                            |
| Spacing / radius | 4/12/16/20/32 and 8/12/16/20/24 (HANDOFF; not Figma variables — recorded); radius 14/18 and translucent tints are not tokens                                                                     |
| Typography       | 11 styles: size, line height, tracking, weight equal to the Reference (unit test); Arabic rendered in Cairo, Latin/numerals in Inter, metadata in Geist Mono (per-glyph browser check); no Arial |
| Contrast (DoD)   | Primary / Secondary / Muted Readable ≥ 5.15 on every surface (AA); Text / Muted large-text only (design-values §5)                                                                               |
| Logo             | Original PNGs byte-identical (SHA-256 test); ratio kept; never mirrored (RTL vs LTR pixels equal, mirrored image clearly different)                                                              |
| Icons            | Figma geometry fingerprints 40/40; browser render vs Figma render 0.1–6.4 mean diff vs ≥ 11.5 to any other icon; 20/22/18 px placements match Figma's 1.75 stroke                                |
| Motion           | Approved tokens only; Tailwind default easings/animations removed; reduced motion sets `--motion-distance: 0` and stops keyframe loops (tested in both locales)                                  |
| Direction        | `ar` → `rtl`, `en` → `ltr`; logical properties verified (`ps-*` flips); nested `dir` respected for icon mirroring; LTR runs isolated with `<bdi>`                                                |
| English layouts  | **Not claimed as Figma parity** — Figma has no LTR frames; English copy per module is reviewed in its phase                                                                                      |

## D. Technical architecture

```
src/design-system/        tokens.css · typography.css · motion.css · base.css
                          fonts.ts + fonts/ (3 WOFF2, OFL, README) · brand.ts
                          icons/ (manifest.ts, geometry.generated.ts, svg/ ×40, LICENSES)
src/shared/ui/            Logo.tsx · Icon.tsx · Ltr.tsx
src/i18n/                 routing.ts · direction.ts · request.ts · navigation.ts
                          messages/{ar,en}/{common,dev}.json · next-intl.d.ts
src/proxy.ts              Next.js 16 Proxy (locale from URL)
src/app/[locale]/         layout.tsx (<html lang dir>) · page.tsx
                          dev/tokens/page.tsx + _lib/read-tokens.ts (temporary, 404 in production)
scripts/                  import-figma-icons.mjs (Node built-ins only)
```

Boundaries (dependency-cruiser, 50 modules): `design-system` imports nothing; `shared` imports
`design-system`; `app` composes. Server Components throughout; client JS limited to next-intl's
locale-aware `Link` (provider with `messages={null}` — no translations shipped to the browser).

## E. Testing evidence (executed 2026-11-13, network blocked for build and tests)

| Command / check                                                                    | Result                                                                                                                     |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                   | exit 0; lockfile passes pnpm supply-chain policies                                                                         |
| `pnpm check` (tsc, ESLint, dependency-cruiser, Prettier, Vitest, build)            | exit 0 — **388 unit tests in 9 files**; build has no warnings                                                              |
| `pnpm test:e2e` (Chromium, cold start, 3 consecutive runs)                         | exit 0 — **74/74** each run, 0 browser console errors                                                                      |
| Same suite on installed **Microsoft Edge** and **Google Chrome**                   | **136/136 functional tests** (68 × 2); the 6 visual tests are Chromium-only by design (per-browser baselines do not exist) |
| Production build + `next start`: `/dev/tokens`, `/en/dev/tokens`, `/ar/dev/tokens` | **404** (route is development-only); `/` and `/en` 200                                                                     |
| `pnpm audit --prod`                                                                | No known vulnerabilities                                                                                                   |
| Viewports 1440 / 768 / 390 / 320, Arabic and English                               | No horizontal overflow (tested)                                                                                            |
| Keyboard pass on `/dev/tokens`                                                     | Links and field reachable, `:focus-visible` outline shown (browser default)                                                |
| Mutation checks (color, type weight, icon geometry, mirroring, logo mirroring)     | Each caught by the tests, restored                                                                                         |

Limitations: Firefox and WebKit/Safari not run (browsers not installed; full matrix is Phase 22).
No automated axe scan (tool not installed — deferred dependency). The designed focus style comes
with Phase 03 primitives.

**Visual baselines (G-2) — reproducibility.** Files:
`tests/e2e/visual.spec.ts-snapshots/dev-tokens-{ar,en}-{1440,768,390}-chromium-win32.png`.
Browser: Playwright-bundled Chromium (Playwright 1.65.0, project `chromium`, Desktop Chrome
device). OS: Windows 11 (`win32` suffix). Viewports 1440×900, 768×1024, 390×844, full-page,
`deviceScaleFactor: 1`, CSS scale. Fonts self-hosted, `document.fonts.ready` and every image
loaded (lazy images forced eager in the test), animations disabled, caret hidden, Next.js dev
overlay hidden, DEV-ONLY deterministic data. Tolerance: `maxDiffPixelRatio 0.001`. Not verified
to match Linux or other browsers — they need their own baselines. CI runs `pnpm check` only, not
E2E. **Status: approved by the user after visual review (2026-11-13)** — reviewed, not
auto-accepted (Roadmap §8).

## F. Open issues

**Previously blocking (Roadmap Phase 02 deliverables / tests) — now implemented:**

| ID  | Issue                                         | Affected files                                                | Smallest correction                                                                                                                                                                                                                                |
| --- | --------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-1 | `/dev/tokens` inspection of tokens and type   | `src/app/[locale]/dev/tokens/page.tsx`, `_lib/read-tokens.ts` | **Implemented 2026-11-13** — colors (19, Figma name + HEX + variable), spacing, radius, page padding, motion, fonts, 11 type styles; values read from the source CSS and the Reference (no duplicate source); `tests/e2e/dev-tokens.spec.ts` 10/10 |
| G-2 | Visual snapshots of the tokens route, AR + EN | `tests/e2e/visual.spec.ts` + 6 baselines                      | **Implemented 2026-11-13** — 6 baselines + 320 px overflow test, stable across repeated cold runs; **approved by the user 2026-11-13**                                                                                                             |

**Non-blocking (later phases / decisions):**

| ID  | Item                                                                                                     | When                                |
| --- | -------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| G-3 | Automated a11y scan (`@axe-core/playwright`, deferred in ADR-001)                                        | Phase 03, needs dependency approval |
| G-4 | `docs/phases/phase-02-plan.md` was not written (scope tracked in PROGRESS + this report)                 | Process note                        |
| O-1 | English UI copy reviewed per module (no copy invented)                                                   | Each module phase                   |
| O-2 | `PATCH /me/preferences` request/response contract                                                        | Backend, before Phase 20/21         |
| O-4 | `browserslist` targets (would keep `:dir()` native in LightningCSS)                                      | Phase 03 / Phase 22                 |
| I-1 | Phase 01 placeholder `/` heading has no size (`text-2xl` removed)                                        | Replaced in Phase 07                |
| I-2 | `UI/Navigation` style "ExtraBold" with weight 400 — NOT VERIFIED                                         | Before any use                      |
| —   | Firefox / WebKit run                                                                                     | Phase 22                            |
| —   | Space/Radius not Figma variables (HANDOFF values)                                                        | Recorded                            |
| —   | `slides` / `cards` icon source unconfirmed                                                               | Designer confirmation               |
| —   | Text / Muted only for large or disabled text                                                             | Phase 03 component rules            |
| I-3 | Dev-only React hydration mismatch during `pnpm test:e2e` on `/dev/tokens` — **not resolved**; tests pass | GitHub issue #3 (test-only fix)     |
| —   | Dev-only Next warnings on `/dev/tokens` (logo LCP, Full logo narrowed at 320)                            | Dev route only                      |

## G. Dependencies

| Type        | Change                                                                               |
| ----------- | ------------------------------------------------------------------------------------ |
| Runtime     | **+ `next-intl` 4.15.1** (exact pin; approved; ADR-001 updated)                      |
| Development | None                                                                                 |
| pnpm config | New `pnpm-workspace.yaml`: `allowBuilds` false for `@swc/core` and `@parcel/watcher` |

Why the denied build scripts are safe and reproducible: both packages are transitive
dependencies of `next-intl`'s optional message extractor, which MUNSIT does not use. Their
prebuilt platform binaries install as normal optional packages; only their install scripts are
skipped. Denying them explicitly makes pnpm 12 treat the decision as configured (no
`ERR_PNPM_IGNORED_BUILDS`), so `pnpm install --frozen-lockfile` succeeds identically on any
machine (verified), and no third-party script runs during installation.

Fonts: no external request at build or runtime (build verified with the network blocked).

## H. Phase 03 readiness

The Design System can be consumed safely by Shared UI components: tokens, type styles, fonts,
motion tokens, `Icon`, `Logo`, `Ltr`, locale-aware navigation and direction rules are in place
and tested. Phase 03 should: use only Tailwind token utilities (no default palette/scale exists),
logical properties for layout, `--motion-dir` for direction-dependent transforms (or `ltr:`/`rtl:`
only with an RTL+LTR browser test), Muted Readable for small readable text, and add the deferred
component-test dependencies (Testing Library, jsdom, axe) with approval. G-1 and G-2 are
implemented and approved; Phase 03 starts after Phase 02 is merged into `main`.

## I. Mariam starter readiness

**Done 2026-11-13.** Starter `munsit-starter-79685af.zip` built with `git archive` from `main` at
`79685af`, with `BASELINE_COMMIT.txt` and a `START_HERE.md` setup guide; verified on the zip
itself (contents = tracked files, binaries byte-identical, nothing excluded leaked, `pnpm install
--frozen-lockfile` + `pnpm check` passed in an empty folder). Logged in
`docs/TEAM_COLLABORATION.md` §8. Procedure followed:

1. User approves the six baselines and Phase 02 (G-1, G-2) — **done 2026-11-13**.
2. Commit Phase 02 on `phase/02-design-system` (sequence in J), push, open the PR.
3. CI `check` passes on a clean checkout; conversations resolved; merge to `main`.
4. Build the starter with `git archive` from that merge commit (`docs/TEAM_COLLABORATION.md` §4).
5. Verify the zip itself: list contents (fonts, `public/brand/`, icons, fixtures,
   `pnpm-workspace.yaml` present; `assets/`, `node_modules/`, `.next/` absent), extract to an
   empty folder, `pnpm install --frozen-lockfile`, `pnpm check`.
6. Record the package in the delivery log.

Git audit (2026-11-13): `git add --dry-run -A` lists **156 files to add (incl. this report and the 6 baselines) and 2 removals** (the moved
`src/app/layout.tsx` and `page.tsx`), including all 3 fonts + 3 licenses, 40 SVGs, 45 fixtures,
3 logos, `pnpm-workspace.yaml`. Ignored: `.next/`, `assets/`, `next-env.d.ts`, `node_modules/`,
`tsconfig.tsbuildinfo` only. PNG/WOFF2 are binary in `.gitattributes`. No secrets or local paths.

## J. Git integration checklist

1. `chore(deps): add next-intl 4.15.1` — `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`,
   ADR-001 (separate commit, reason in body — CLAUDE.md).
2. `feat(design-system): tokens, motion, typography and self-hosted fonts`
3. `feat(brand): official logo assets and Logo component` (+ `.gitignore` `/assets/`)
4. `feat(icons): official Figma icon system with license notices`
5. `feat(i18n): next-intl routing and RTL/LTR foundation` (`src/app/[locale]`, `src/proxy.ts`,
   `src/i18n`, `next.config.ts`, `Ltr`, dev route)
6. `test(e2e): typography, logo, icons and i18n browser tests` (+ fixtures, `global-setup.ts`,
   `playwright.config.ts`)
7. `docs(phase-02): design values, progress and phase report`
8. Run `pnpm check` + `pnpm test:e2e` on the final branch state; push; open the PR with the
   template (scope, acceptance checklist, results, screenshots at 3 widths AR/EN, known gaps).
9. Merge only with CI `check` green and conversations resolved (rebase merge keeps the separate
   `chore(deps)` commit); tag `phase-02-done`; update `PROGRESS.md` with the merge commit.

**Executed 2026-11-13:** steps 1–8 as listed (7 commits), PR #2, CI `check` green, rebase merge
into `main` → `c7455f2`..`79685af`; `PROGRESS.md` updated by the Phase 02 closure PR. The
`phase-02-done` tag was not created (not requested).

## Final acceptance checklist

| Criterion (Roadmap Phase 02)                                                                | Status                                                                                               |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 19 color variables, names as-is, HEX exact                                                  | PASS                                                                                                 |
| 5 spacing + 5 radius tokens                                                                 | PASS (values HANDOFF; not Figma variables)                                                           |
| Page padding 24/24/20 as proposed tokens                                                    | PASS                                                                                                 |
| Translucent tints, radius 14/18 not tokens                                                  | PASS                                                                                                 |
| `Dashboard/*` type scale as default                                                         | PASS                                                                                                 |
| Landing/Auth styles deferred to their phases                                                | PASS (catalogued)                                                                                    |
| Cairo / Inter / Geist Mono; Arabic → Cairo, numerals → Inter, metadata → Geist Mono         | PASS                                                                                                 |
| Local font loading, no network at build                                                     | PASS                                                                                                 |
| Logo Full/Horizontal/Symbol, `object-fit: contain`, renders unmodified AR + EN, not flipped | PASS                                                                                                 |
| `Icon` from Figma SVGs with explicit mirror whitelist (40 icons)                            | PASS                                                                                                 |
| Motion tokens + reduced motion                                                              | PASS                                                                                                 |
| `<html lang dir>` switching; `ar` default, `en`; message files structure                    | PASS                                                                                                 |
| Switching `ar`↔`en` flips `dir` with no layout duplication                                  | PASS                                                                                                 |
| Dark-only theme                                                                             | PASS                                                                                                 |
| `docs/design-values.md` entries; no invented values                                         | PASS                                                                                                 |
| Unit test: tokens equal the reference table                                                 | PASS                                                                                                 |
| Component tests: Logo (no transform in RTL), Icon mirror whitelist                          | PASS                                                                                                 |
| Temporary `/dev/tokens` route inspects tokens, type, logo, direction                        | PASS (G-1)                                                                                           |
| Visual snapshot of the tokens route in both directions                                      | PASS — six baselines **approved by the user** (G-2)                                                  |
| DoD: text contrast measured and logged                                                      | PASS (design-values §5)                                                                              |
| Universal: tsc, lint, import cycles, unit tests                                             | PASS                                                                                                 |
| Universal: RTL and LTR check; 1440/768/390 + 320 overflow                                   | PASS                                                                                                 |
| Universal: manual keyboard pass                                                             | PASS (automated keyboard traversal; default focus ring)                                              |
| Universal: automated a11y scan                                                              | NOT VERIFIED (G-3, tool not installed)                                                               |
| Browser matrix                                                                              | PARTIAL — Chromium 74/74; Edge and Chrome 136/136 functional; Firefox/WebKit NOT VERIFIED (Phase 22) |
| Phase report written, PROGRESS updated, nothing from later phases started                   | PASS                                                                                                 |

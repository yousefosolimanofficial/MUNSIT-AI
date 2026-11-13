# ADR-001 — Frontend stack

- **Status:** Approved (user, 2026-11-12, "Development Phase 01 — Approved Decisions & Execution Authorization")
- **Date:** 2026-11-12
- **Source:** Development Roadmap v1.0 §2 (proposal), gates D-01, D-12, D-20

## Context

MUNSIT AI needs one public marketing site plus an authenticated, Arabic-first (RTL), dark-only
application of 14 modules. Authentication is undefined (gate D-02) and secrets must never reach
the browser. The final cloud hosting provider is not selected.

## Decisions

| Gate                     | Decision                                                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 Framework & hosting | Next.js App Router, React, TypeScript strict. Node.js-capable hosting; provider not selected, no deployment configured in Phase 01.                                           |
| D-20 Node.js             | Node.js 24 LTS line. Installed and pinned: **v24.22.3** (security release, 2026-11-10). `.nvmrc` = `24.22.3`; `engines.node` = `>=24.22.3 <25`. No automatic move to Node 26. |
| D-20 Package manager     | pnpm via Corepack, pinned `packageManager: pnpm@12.18.0`. Single lockfile `pnpm-lock.yaml`.                                                                                   |
| D-12 Accessibility       | WCAG 2.2 AA.                                                                                                                                                                  |
| D-12 Browsers            | Latest two stable majors of Chrome, Edge, Firefox, Safari. Phase 01 smoke test runs on Chromium only.                                                                         |
| Git                      | Repository-local config, default branch `main`, line endings enforced by `.gitattributes` (LF). No remote.                                                                    |

## Installed dependencies (Phase 01)

Versions are the ones resolved into `pnpm-lock.yaml`.

### Runtime

| Package              | Version | Reason                         |
| -------------------- | ------- | ------------------------------ |
| `next`               | 16.4.6  | Framework (D-01)               |
| `react`, `react-dom` | 19.3.1  | UI runtime required by Next.js |

### Development

| Package                                           | Version                   | Reason                                                                                                                                                                                                         |
| ------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript`                                      | 6.0.3                     | Strict type checking. Pinned `~6.0` because typescript-eslint 8.x (used by eslint-config-next) supports `<6.1`; TypeScript 7 was rejected for that reason                                                      |
| `@types/node`, `@types/react`, `@types/react-dom` | 24.19.2 / 19.3.0 / 19.3.0 | Type definitions for Node 24 and React                                                                                                                                                                         |
| `tailwindcss`, `@tailwindcss/postcss`             | 4.3.5                     | Styling foundation (Roadmap §2.2); tokens arrive in Phase 02                                                                                                                                                   |
| `eslint`, `eslint-config-next`                    | 9.39.5 / 16.4.6           | Linting incl. React, hooks, jsx-a11y, import and Next.js core-web-vitals rules. ESLint pinned `^9` because eslint-plugin-import, -jsx-a11y and -react (inside eslint-config-next) do not yet support ESLint 10 |
| `prettier`                                        | 3.10.0                    | Formatting                                                                                                                                                                                                     |
| `vitest`                                          | 5.1.0                     | Unit tests                                                                                                                                                                                                     |
| `@playwright/test`                                | 1.65.0                    | E2E smoke test (Chromium)                                                                                                                                                                                      |
| `dependency-cruiser`                              | 18.7.2                    | Import-cycle and module-boundary enforcement (Roadmap §3)                                                                                                                                                      |

### Added in Phase 02

| Package     | Version | Reason                                                                                                                                                                                             |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next-intl` | 4.15.1  | i18n (Roadmap §2.2), approved by the user 2026-11-13. Exact pin. Build scripts of its transitive `@swc/core` and `@parcel/watcher` (message extractor, unused) are denied in `pnpm-workspace.yaml` |

### Added in Phase 03 (development only)

Approved by the user 2026-11-13. All are `devDependencies` with exact pins, never imported by
production code (enforced by dependency-cruiser). Each direct version is the newest release that is
at least 14 days old. The 59 transitive packages that are new were also resolved to releases at
least 14 days old (a one-time `minimumReleaseAge` resolution; no setting is kept in the
repository).

| Package                       | Version | Reason                                                                                                                                                                                                                                  |
| ----------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@testing-library/react`      | 16.3.3  | Component tests: render and query by role and accessible name (Roadmap §8)                                                                                                                                                              |
| `@testing-library/dom`        | 10.4.2  | Required peer of `@testing-library/react` 16                                                                                                                                                                                            |
| `@testing-library/user-event` | 14.6.8  | Real keyboard and pointer interaction in component tests (14.6.9 and 14.6.10 were younger than 14 days)                                                                                                                                 |
| `jsdom`                       | 30.1.3  | DOM environment for component tests, opted in per test file (`// @vitest-environment jsdom`); the global Vitest environment stays `node`. 31.0.1 was released on the day of review, so it was skipped. **Not used to measure contrast** |
| `jest-axe`                    | 11.0.0  | Automated accessibility check per primitive in component tests (Roadmap Phase 03). No bundled types: a local declaration is used, because `@types/jest-axe` would pull `@types/jest` and `axe-core` 3.x. Depends on `axe-core` 4.12.1   |
| `@axe-core/playwright`        | 4.14.0  | Accessibility scans of rendered pages in a real browser (E2E). Closes G-3. MPL-2.0. Peer `playwright-core` resolves to the installed 1.65.0. Depends on `axe-core` 4.14.0                                                               |

### Deferred to the phase that needs them (not installed)

Radix UI primitives, `class-variance-authority`, `tailwind-merge` (Phase 03); TanStack Query, Zustand (when server/session state appears); React Hook Form + Zod
(first form); MSW (only if mock data is authorized). Testing Library, jsdom, `jest-axe` and
`@axe-core/playwright` were added in Phase 03 (above).

Deliberately excluded (Roadmap §2.2): Redux, GraphQL clients, animation libraries, CSS-in-JS
runtimes, heavy component kits, charting libraries, rich-text engines, Storybook.

## Consequences

- Route handlers can later proxy a backend so secrets stay server-side.
- Hosting must support a Node.js runtime (or the app falls back to static export and loses
  middleware); revisit when the provider is chosen.
- Import cycles and boundary violations fail `pnpm lint` via dependency-cruiser rather than
  ESLint `import/no-cycle`, to avoid running two cycle detectors.
- On Windows, `corepack enable` needs an elevated terminal; without it, commands are run as
  `corepack pnpm …` (see README).

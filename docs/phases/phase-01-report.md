# Phase 01 — Project initialization & tooling — Report

- **Date:** 2026-11-12
- **Result:** Completed. All required checks executed and passed.
- **Scope source:** Development Roadmap v1.0 §7 Phase 01; user authorization "Development
  Phase 01 — Approved Decisions & Execution Authorization".

## Environment

| Item    | Before           | After                                                                                           |
| ------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| Node.js | v24.19.0         | **v24.22.3** (official MSI, SHA-256 and OpenJS signature verified, installed with UAC approval) |
| npm     | 11.17.0          | 11.19.1 (bundled with Node; not used)                                                           |
| pnpm    | not installed    | **12.18.0** via Corepack 0.36.0                                                                 |
| Git     | 2.55.0.windows.3 | unchanged                                                                                       |

`corepack enable pnpm` failed with `EPERM` (shims go into `C:\Program Files\nodejs`, which needs
admin). Workaround used: `corepack pnpm …` — same Corepack-managed pnpm, no system change.
Permanent fix (optional): run `corepack enable pnpm` once in an Administrator terminal.

## Implemented

- Git repository on `main`; repository-local config `core.autocrlf=false`, `core.eol=lf`,
  `core.longpaths=true`; `.gitattributes` enforces LF. Global Git config untouched. No remote.
- Reference documents copied (byte-identical, originals untouched) to `docs/references/`.
- Next.js 16.4.6 App Router + React 19.3.1, TypeScript 6.0.3 `strict` +
  `noUncheckedIndexedAccess`, `@/*` → `src/*`.
- Tailwind CSS 4.3.5 via `@tailwindcss/postcss` (foundation only, no tokens).
- ESLint 9 flat config with `eslint-config-next` (core-web-vitals + typescript).
- Prettier 3.10.0.
- dependency-cruiser 18.7.2 enforcing Roadmap §3 boundaries and no cycles (part of `pnpm lint`).
- Vitest 5.1.0 with one smoke unit suite (public env parsing).
- Playwright 1.65.0, Chromium project, smoke test for the root route.
- Public-only env parsing (`src/config/env.ts`, `NEXT_PUBLIC_APP_ENV`), `.env.example`.
- Placeholder root route (`<html lang="ar" dir="rtl">`, heading only). Not an application screen.
- `README.md`, ADR-001, this report, `PROGRESS.md`.

## Tested / Verified (commands actually run this session)

| #   | Check               | Command                                                         | Result                                                         |
| --- | ------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | Node.js version     | `node --version`                                                | v24.22.3                                                       |
| 2   | pnpm version        | `corepack pnpm --version`                                       | 12.18.0                                                        |
| 3   | Dependency install  | `corepack pnpm add …`                                           | OK; `pnpm peers check`: no issues                              |
| 4   | Type-check          | `pnpm typecheck`                                                | Pass                                                           |
| 5   | ESLint + boundaries | `pnpm lint`                                                     | Pass; 0 dependency violations                                  |
| 5b  | Boundary rules bite | temporary `shared→features`, cross-feature and circular imports | Fail as expected (4 errors), then removed                      |
| 6   | Prettier            | `pnpm format:check`                                             | Pass                                                           |
| 7   | Unit tests          | `pnpm test`                                                     | 1 file, 3 tests passed                                         |
| 8   | Production build    | `pnpm build`                                                    | Pass; `/` and `/_not-found` static                             |
| 9   | Dev server          | `pnpm dev --port 3200` + `curl /`                               | Ready in 1.8 s; HTTP 200, `lang="ar" dir="rtl"`                |
| 10  | E2E smoke           | `pnpm test:e2e` (Chromium headless shell v1254)                 | 1 passed                                                       |
| 11  | CI-equivalent       | `pnpm check`                                                    | Pass                                                           |
| 12  | Git status          | `git status`                                                    | Repository on `main`, all Phase 01 files untracked/uncommitted |

## Assumed

- `NEXT_PUBLIC_APP_ENV` (`development | test | production`) as the single public variable; no
  backend URL exists yet.
- Root layout uses `lang="ar" dir="rtl"` because the Handoff is RTL throughout; locale routing is
  Phase 02.

## Issues and decisions for the record

1. **TypeScript 7 / ESLint 10 rejected.** Latest tags failed peer ranges of typescript-eslint
   (`<6.1`) and eslint-plugin-import/-jsx-a11y/-react (`≤9`). Pinned TypeScript `~6.0.3` and
   ESLint `^9.39.5`. npm marks ESLint 9.39.5 "deprecated" because 10.x exists — revisit when
   `eslint-config-next` supports ESLint 10.
2. **Corepack shims need admin** (see Environment).
3. **Slow network** (~30–90 KiB/s): installs took ~40 minutes; the first install attempt was
   stopped and re-run non-interactively.
4. **pnpm store** is at `D:\.pnpm-store\v11` (pnpm default for drive D:), outside the project.
5. Folder skeleton from Roadmap §3 is documented in the README rather than created as empty
   folders (Git does not track empty directories; no placeholder files were requested).
6. ESLint `jsx-a11y` runs with the subset bundled in `eslint-config-next`; a stricter
   `jsx-a11y` preset can be added in Phase 03 when components exist.

## Not done (out of scope)

No screens, shell, navigation, design tokens, fonts, logo integration, i18n, mock data, backend,
hosting or deployment. Initial commit made after user approval (`chore: initialize project (Phase 01)`). No GitHub remote.

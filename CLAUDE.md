# MUNSIT AI — Project instructions for Claude Code

@AGENTS.md

These rules apply to every Claude Code session in this repository. The authoritative sources are
linked below; do not copy them here, read them when a task needs detail.

## Sources of truth (read before acting)

| Topic                         | File                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Current phase and next action | [docs/PROGRESS.md](docs/PROGRESS.md)                                                                       |
| Phase plan, acceptance, DoD   | [Development Roadmap v1.0](docs/references/MUNSIT_AI_Development_Roadmap_v1.0.md)                          |
| Screens, behavior, unresolved | [Frontend Handoff (PDF)](docs/references/MUNSIT%20AI%20%E2%80%94%20Frontend%20Handoff%20Specification.pdf) |
| Tokens, type, components      | [Design System Reference v1.0](docs/references/MUNSIT_AI_Design_System_Reference_v1.0.md)                  |
| Approved stack                | [ADR-001](docs/decisions/ADR-001-frontend-stack.md)                                                        |
| Team workflow                 | [README §15](README.md#15-team-collaboration), [PR template](.github/PULL_REQUEST_TEMPLATE.md)             |

Claude Project Knowledge is **not** available in Claude Code. Use only the local copies above.
Files in `docs/references/` are read-only — never edit or reformat them.

## Project overview

Arabic-first (RTL), dark-only AI educational platform; graduation project. 14 modules behind one
shared shell, designed for Desktop 1440 / Tablet 768 / Mobile 390. This repo is the frontend only.
Backend, AI services and deployment status are **not verified** — never assume an endpoint,
field, auth flow or behavior the Handoff lists as unresolved.

## Phase boundaries

- Work on **one roadmap phase at a time**. Check `docs/PROGRESS.md`, confirm the phase with the
  user, implement only its scope, run checks, write the phase report, update `PROGRESS.md`, stop.
- Never start the next phase, and never build later-phase screens "while you're there".
- No mock data unless the user authorizes it, and then only through an adapter. A screen with
  static data is "UI-complete, not functional", never "complete".

## Approved stack

Next.js 16 App Router · React 19 · TypeScript 6 strict (`noUncheckedIndexedAccess`) · Tailwind
CSS 4 · ESLint 9 + `eslint-config-next` · Prettier · Vitest · Playwright · dependency-cruiser ·
Node 24 LTS · pnpm 12.18.0 via Corepack.

- Run pnpm as `corepack pnpm …` (Corepack shims may not be enabled on Windows).
- `pnpm-lock.yaml` is the only lockfile. Never use npm or yarn.
- New dependencies need a stated reason, user approval, a separate `chore(deps)` commit, and an
  ADR-001 update. Deferred libraries are listed in ADR-001 — add them only in their phase.
- Next.js 16 differs from older versions: check `node_modules/next/dist/docs/` before using an API.

## Architecture boundaries (enforced by `corepack pnpm lint`)

```
app → features → shared / api / state / i18n / types / config / design-system
```

- `src/app`: routing only — thin route files composing features. Nothing imports `src/app`.
- `src/features/<module>`: self-contained; `{components,hooks,api,model,schemas,index.ts}`. A
  feature never imports another feature. Shared needs move to `src/shared/patterns`.
- `src/shared`: never imports features. `src/design-system`: imports nothing. `src/api`: imports
  only `src/types`. `src/types`: imports nothing.
- No circular imports. Production code never imports devDependencies.
- Create folders only when a phase needs them (layout in Roadmap §3). No empty placeholders.

## Folder ownership

| Area                                                                                                                                                            | Owner                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Tooling, config, `package.json`, lockfile, `src/app`, `src/design-system`, `src/shared`, `src/api`, `src/state`, `src/i18n`, `src/types`, `src/config`, `docs/` | Yousef (Frontend Lead)      |
| `src/features/<module>` assigned to Mariam (and its tests)                                                                                                      | Mariam (Frontend Developer) |
| Unassigned feature modules                                                                                                                                      | Yousef until assigned       |

Module assignments are recorded in `docs/PROGRESS.md` when made. Do not edit a module owned by
another developer without the user confirming coordination.

**Temporary delegation (Phase 03, agreed by the user 2026-11-13).** Mariam may implement shared
components, but only the exact files named in the approved component contract for each delivery.
For example, the Button delivery covers `src/shared/ui/Button.tsx` and
`src/shared/ui/Button.test.tsx`
([docs/phases/phase-03-button-contract.md](docs/phases/phase-03-button-contract.md)).

- **Ownership:** `src/shared` stays owned by Yousef. The delegation is per delivery, ends when that
  delivery is integrated, and never covers any other shared, design-system, route, config or
  dependency file.
- **Integration:** Yousef reviews and integrates every delegated delivery.
- **Feature modules:** ownership of feature modules is unchanged. They stay unassigned until the
  user decides.

Details are in [docs/phases/phase-03-plan.md](docs/phases/phase-03-plan.md) §3.

## Offline feature delivery

Yousef is the sole GitHub integrator. Mariam has no repository access and works offline from a
starter package. Full procedure: [docs/TEAM_COLLABORATION.md](docs/TEAM_COLLABORATION.md);
checklist: [docs/FEATURE_DELIVERY_CHECKLIST.md](docs/FEATURE_DELIVERY_CHECKLIST.md).

- **Working on Mariam's local copy:** change only her assigned module folders and their tests,
  or the exact files delegated by an approved component contract (see Folder ownership). Never
  edit any other shared, config, route or dependency file — write them as requests in
  `DELIVERY.md`.
  Never install packages. Keep the baseline commit hash in `DELIVERY.md`.
- **Integrating a delivery (Yousef):** branch `delivery/<module>-v<n>` from the recorded baseline
  commit; apply the patch or the manifest-listed files only — never unzip or copy over the project
  root; confirm `git status` matches the manifest; commit the delivery separately from integration
  fixes; rebase onto `main`; run all checks; merge only through a Pull Request.
- **Packages** (starter or delivery) never contain `node_modules`, build output, caches, `.env`
  files or credentials. Starter packages are made with `git archive` from a pushed, verified commit
  and logged in `docs/TEAM_COLLABORATION.md`.

## Coding conventions

- TypeScript strict; no `any`, no non-null `!` without a comment explaining why.
- Server Components by default; add `"use client"` only for interactivity, browser APIs or state.
- One shared component per Figma component set; variants and states are props, never copies.
- Reuse before creating: check `src/shared` first. Shell parts (Sidebar, Rail, Drawer, bottom bar,
  More sheet) are built once and fed by the navigation registry.
- Validate forms on blur, clear errors as soon as the value is valid.
- Prettier formatting; Conventional Commits.

## Design System rules

- Dark-only. Use only the 19 color variables and the 5 spacing + 5 radius tokens from the Design
  System Reference, with names as-is. Visual constants live only in `src/design-system`.
- Translucent tints, radius 14/18 and component sizes are local component constants, not tokens.
- Typography: Cairo (Arabic), Inter (Latin and numerals), Geist Mono (metadata); `Dashboard/*`
  scale is the default.
- Values marked **NOT VERIFIED** must be read from Figma (file key in the Design System
  Reference) and recorded in `docs/design-values.md` before use — never invent them.
- Do not modify Figma.

## RTL / LTR rules

- Arabic `ar` is the default locale, `dir="rtl"`; English `en` is LTR.
- Use logical properties and utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`), never
  `left`/`right` for layout.
- Sidebar and Rail sit on the inline-start side (right in RTL).
- Icons mirror only from an explicit whitelist. The logo is never mirrored.
- Numerals and Latin terms stay LTR inside Arabic text; isolate mixed-direction runs.
- Keep Arabic copy verbatim from Figma/Handoff.

## Accessibility and browsers

WCAG 2.2 AA: visible focus, full keyboard operation, Esc closes overlays, focus trap in dialogs
and sheets, `aria-current="page"` on the active nav item. Latest two stable majors of Chrome,
Edge, Firefox, Safari.

## Git workflow

- `main` is the stable integration branch — never commit or force-push to it directly.
- Branches: `phase/<nn>-<topic>`, `feature/<module>-<topic>`, `fix/<area>-<topic>`,
  `delivery/<module>-v<n>`.
- Only Yousef pushes and merges. Open a PR with the template; merge only when the CI `check` job
  (`.github/workflows/ci.yml`) passes and conversations are resolved, through the
  `main-protection` ruleset. Never use the admin bypass for normal merges, and never weaken the
  ruleset or CI without the user's decision.
- Commit or push only when the user asks.

## Testing requirements

Before declaring work done, run and report real results of:

```
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm format:check
corepack pnpm test
corepack pnpm build
corepack pnpm test:e2e   # when routes or UI change
```

Each phase also needs the Roadmap §4 universal checks (RTL and LTR, 1440/768/390 plus a 320
overflow check, keyboard pass, automated a11y). Never report a check as passing unless it ran.

## Security rules

- Never commit `.env*` files except `.env.example`; never read, print or request secrets.
- Only `NEXT_PUBLIC_*` variables in client code, and they must never hold secrets.
- Sanitize rendered rich content (AI output, notes). No tokens or PII in logs.
- Do not publish personal local file paths in committed files.

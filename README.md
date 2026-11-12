# MUNSIT AI — Frontend

Arabic-first (RTL), dark-only learning platform frontend built with Next.js App Router and
TypeScript (strict).

**Status:** Phase 01 — Project initialization & tooling. No application screens exist yet.
See [docs/PROGRESS.md](docs/PROGRESS.md).

## Requirements

| Tool    | Version                                         |
| ------- | ----------------------------------------------- |
| Node.js | 24 LTS, `>=24.22.3 <25` (pinned in `.nvmrc`)    |
| pnpm    | `12.18.0` via Corepack (`packageManager` field) |
| Git     | any recent version                              |

pnpm is the only package manager. `pnpm-lock.yaml` is the only lockfile — do not run
`npm install` or `yarn`.

### Enabling pnpm

Corepack ships with Node.js. The standard activation writes shims next to `node.exe`, which on
Windows (`C:\Program Files\nodejs`) needs an elevated terminal:

```powershell
# once, in an Administrator terminal
corepack enable pnpm
```

Without elevation, prefix every command with `corepack`, e.g. `corepack pnpm install`. Both
forms use the exact pnpm version pinned in `package.json`.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # optional; defaults are safe
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script              | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `pnpm dev`          | Start the development server                                    |
| `pnpm build`        | Production build                                                |
| `pnpm start`        | Serve the production build                                      |
| `pnpm typecheck`    | `tsc --noEmit`                                                  |
| `pnpm lint`         | ESLint + dependency-cruiser (import cycles, module boundaries)  |
| `pnpm lint:deps`    | dependency-cruiser only                                         |
| `pnpm format`       | Format with Prettier                                            |
| `pnpm format:check` | Verify formatting                                               |
| `pnpm test`         | Unit tests (Vitest)                                             |
| `pnpm test:e2e`     | Playwright smoke tests (Chromium)                               |
| `pnpm check`        | CI-equivalent: typecheck, lint, deps, format, unit tests, build |

First Playwright run on a new machine: `pnpm exec playwright install chromium`.

## Project structure

```
docs/
  references/      approved source documents (Handoff, Design System, Roadmap) — read-only
  decisions/       ADRs (ADR-001 frontend stack)
  phases/          per-phase reports
  PROGRESS.md      single resume point
src/
  app/             routing only: thin route files that compose features
  config/          public environment parsing (NEXT_PUBLIC_* only)
tests/
  e2e/             Playwright specs
```

Folders are created by the phase that first needs them, following the Roadmap §3 layout:
`src/features/<module>`, `src/shared/{ui,patterns,layout,navigation,a11y,hooks,lib,utils}`,
`src/design-system`, `src/api`, `src/state`, `src/i18n`, `src/types`.

### Module boundaries

Enforced by dependency-cruiser (`.dependency-cruiser.cjs`) as part of `pnpm lint`:

- `app → features → shared / api / state / i18n / types / config / design-system`
- nothing imports `src/app`; `shared` never imports `features`
- a feature never imports another feature
- `design-system` and `types` import nothing else from `src`; `api` imports only `types`
- no circular dependencies; production code never imports devDependencies

## Reference documents

The authoritative development references are the local copies in
[docs/references/](docs/references/):

- MUNSIT AI — Frontend Handoff Specification (PDF)
- MUNSIT AI — Official Design System Reference v1.0
- MUNSIT AI — Official Development Roadmap v1.0

## Accessibility and browser targets

- WCAG 2.2 AA
- Latest two stable major versions of Chrome, Edge, Firefox and Safari

## Security

- Never commit `.env*` files other than `.env.example`.
- `NEXT_PUBLIC_*` variables are shipped to the browser — never put secrets in them.

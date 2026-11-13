# MUNSIT AI

**AI-powered educational platform — graduation project.**

MUNSIT AI is an Arabic-first (RTL), dark-themed learning platform being developed as a graduation
project. This repository contains the **frontend application**, built with Next.js (App Router),
React and TypeScript.

> **Current status:** Frontend Phase 01 (project initialization & tooling) is complete. No
> application screens or AI features are implemented yet. Everything listed under
> [Main Features](#5-main-features) describes the **planned** product, not working functionality.
> See [Development Status](#14-development-status).

---

## Table of contents

1. [Project Name](#1-project-name)
2. [Project Overview](#2-project-overview)
3. [Problem Statement](#3-problem-statement)
4. [Proposed Solution](#4-proposed-solution)
5. [Main Features](#5-main-features)
6. [Technology Stack](#6-technology-stack)
7. [Project Architecture](#7-project-architecture)
8. [Getting Started](#8-getting-started)
9. [Installation](#9-installation)
10. [Development Commands](#10-development-commands)
11. [Project Structure](#11-project-structure)
12. [Design System](#12-design-system)
13. [Official Documentation](#13-official-documentation)
14. [Development Status](#14-development-status)
15. [Team Collaboration](#15-team-collaboration)
16. [Future Development](#16-future-development)

---

## 1. Project Name

**MUNSIT AI** (منصت) — an AI-powered educational platform for lecture transcription, intelligent
tutoring, automated summaries, question generation, flashcards and personalized learning.

## 2. Project Overview

MUNSIT AI is designed to help students turn lectures into structured, reviewable study material.
The platform is planned around 14 modules that share one application shell, are designed for
Desktop (1440), Tablet (768) and Mobile (390), and use Arabic as the default, right-to-left
language.

The UI/UX design is complete and documented in the official Frontend Handoff and Design System
Reference. Frontend development follows the official Development Roadmap, phase by phase.

## 3. Problem Statement

Students attending lectures — especially in Arabic — have few tools that help them capture what
was said and convert it into material they can actually study from. Recording, transcribing,
summarizing, writing practice questions and building flashcards are separate, manual and
time-consuming tasks, and most existing tools are designed for English and left-to-right layouts.

## 4. Proposed Solution

A single Arabic-first platform where a student can upload or record a lecture and then work with
it through AI-assisted tools: transcripts, summaries, an interactive virtual tutor, generated
question banks and flashcards, alongside personal notes, favorites and folders.

## 5. Main Features

**Planned modules** (designed in Figma; **not yet implemented** in this repository):

| #   | Module                         | Purpose (planned)                                                         |
| --- | ------------------------------ | ------------------------------------------------------------------------- |
| 01  | Landing Page                   | Public marketing site                                                     |
| 02  | Authentication                 | Sign-in, registration and recovery screens                                |
| 03  | Dashboard                      | Home destination with loading, error, partial-error and first-time states |
| 04  | My Lectures                    | Lecture library, filters and lecture upload                               |
| 05  | Lecture Details                | AI workspace: tabs, audio player, transcript, AI panel                    |
| 06  | Live Recording & Transcription | Recording workspace with live transcript status and a leave guard         |
| 07  | AI Virtual Tutor               | Avatar, step-by-step whiteboard and interaction panel                     |
| 08  | My Summaries                   | Summary library and reader                                                |
| 09  | AI Question Bank               | Question generation and quiz flows                                        |
| 10  | My Notes                       | Notes library and editor with an unsaved-changes guard                    |
| 11  | AI Flashcards                  | Flashcard decks and Study Mode                                            |
| 12  | Favorites                      | Saved items                                                               |
| 13  | My Folders                     | Folder contents and selection actions                                     |
| 14  | Profile & Settings             | Account settings                                                          |

## 6. Technology Stack

Approved in [ADR-001](docs/decisions/ADR-001-frontend-stack.md).

| Concern         | Choice                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19                                         |
| Language        | TypeScript 6, `strict` + `noUncheckedIndexedAccess`                       |
| Styling         | Tailwind CSS 4 (design tokens arrive in Phase 02)                         |
| Linting         | ESLint 9 (`eslint-config-next`), dependency-cruiser for module boundaries |
| Formatting      | Prettier                                                                  |
| Unit tests      | Vitest                                                                    |
| E2E tests       | Playwright (Chromium in Phase 01)                                         |
| Runtime         | Node.js 24 LTS (`>=24.22.3 <25`)                                          |
| Package manager | pnpm 12.18.0 via Corepack                                                 |

Targets: **WCAG 2.2 AA**; the latest two stable major versions of Chrome, Edge, Firefox and
Safari.

## 7. Project Architecture

- `src/app` is **routing only**: thin route files that compose feature modules.
- Each product module lives in its own folder under `src/features/<module>` and is
  self-contained.
- Reusable UI, layout, navigation and accessibility helpers live in `src/shared`; visual
  constants live only in `src/design-system`.
- One navigation registry drives the Sidebar, Tablet Rail, Drawer, Mobile bottom bar and More
  sheet — shell parts are built once and never copied per screen.

### Module boundaries

Enforced by dependency-cruiser (`.dependency-cruiser.cjs`) as part of `pnpm lint`:

- `app → features → shared / api / state / i18n / types / config / design-system`
- nothing imports `src/app`; `shared` never imports `features`
- a feature never imports another feature
- `design-system` and `types` import nothing else from `src`; `api` imports only `types`
- no circular dependencies; production code never imports devDependencies

## 8. Getting Started

### Requirements

| Tool    | Version                                         |
| ------- | ----------------------------------------------- |
| Node.js | 24 LTS, `>=24.22.3 <25` (pinned in `.nvmrc`)    |
| pnpm    | `12.18.0` via Corepack (`packageManager` field) |
| Git     | any recent version                              |

pnpm is the only package manager. `pnpm-lock.yaml` is the only lockfile — do not run
`npm install` or `yarn`.

### Enabling pnpm

Corepack ships with Node.js. The standard activation writes shims next to the Node.js binary,
which on Windows (`C:\Program Files\nodejs`) needs an elevated terminal:

```powershell
# once, in an Administrator terminal
corepack enable pnpm
```

Without elevation, prefix every command with `corepack`, e.g. `corepack pnpm install`. Both
forms use the exact pnpm version pinned in `package.json`.

## 9. Installation

```bash
git clone https://github.com/yousefosolimanofficial/MUNSIT-AI.git
cd MUNSIT-AI
corepack pnpm install
cp .env.example .env.local        # optional; defaults are safe
corepack pnpm dev                 # http://localhost:3000
```

First Playwright run on a new machine: `corepack pnpm exec playwright install chromium`.

## 10. Development Commands

Shown with the `corepack` prefix; drop it once `corepack enable pnpm` has been run.

| Command                      | What it does                                                    |
| ---------------------------- | --------------------------------------------------------------- |
| `corepack pnpm dev`          | Start the development server                                    |
| `corepack pnpm build`        | Production build                                                |
| `corepack pnpm start`        | Serve the production build                                      |
| `corepack pnpm typecheck`    | `tsc --noEmit`                                                  |
| `corepack pnpm lint`         | ESLint + dependency-cruiser (import cycles, module boundaries)  |
| `corepack pnpm lint:deps`    | dependency-cruiser only                                         |
| `corepack pnpm format`       | Format with Prettier                                            |
| `corepack pnpm format:check` | Verify formatting                                               |
| `corepack pnpm test`         | Unit tests (Vitest)                                             |
| `corepack pnpm test:e2e`     | Playwright smoke tests (Chromium)                               |
| `corepack pnpm check`        | CI-equivalent: typecheck, lint, deps, format, unit tests, build |

## 11. Project Structure

```
.github/           pull request template, CI workflow (workflows/ci.yml)
docs/
  references/      approved source documents (Handoff, Design System, Roadmap) — read-only
  decisions/       ADRs (ADR-001 frontend stack)
  phases/          per-phase reports
  PROGRESS.md      single resume point for development
src/
  app/             routing only: thin route files that compose features
  config/          public environment parsing (NEXT_PUBLIC_* only)
tests/
  e2e/             Playwright specs
CLAUDE.md          engineering rules for Claude Code sessions
AGENTS.md          Next.js notice for AI coding agents (generated by `next dev`)
```

Folders are created by the phase that first needs them, following the Roadmap §3 layout:
`src/features/<module>`, `src/shared/{ui,patterns,layout,navigation,a11y,hooks,lib,utils}`,
`src/design-system`, `src/api`, `src/state`, `src/i18n`, `src/types`.

## 12. Design System

The design is **dark-only** and **RTL-first**. Summary (full values in the
[Design System Reference](docs/references/MUNSIT_AI_Design_System_Reference_v1.0.md)):

- **Colors:** 19 variables in `01 — Brand Colors` (surfaces, text, neutrals, accents, semantic).
- **Layout tokens:** spacing 4 / 12 / 16 / 20 / 32 and radius 8 / 12 / 16 / 20 / 24.
- **Typography:** Cairo (Arabic UI), Inter (Latin text and numerals), Geist Mono (metadata);
  the `Dashboard/*` scale is the application default.
- **Logo:** Full, Horizontal and Symbol variants; never mirrored in RTL.
- **Direction:** Sidebar and Rail on the right; icons mirror from a whitelist; numerals and Latin
  terms stay LTR inside Arabic text.

The design system is implemented in code in Phase 02.

## 13. Official Documentation

The authoritative development references are the copies in
[docs/references/](docs/references/):

- [MUNSIT AI — Frontend Handoff Specification (PDF)](docs/references/MUNSIT%20AI%20%E2%80%94%20Frontend%20Handoff%20Specification.pdf)
- [MUNSIT AI — Official Design System Reference v1.0](docs/references/MUNSIT_AI_Design_System_Reference_v1.0.md)
- [MUNSIT AI — Official Development Roadmap v1.0](docs/references/MUNSIT_AI_Development_Roadmap_v1.0.md)

Project records:

- [Development progress](docs/PROGRESS.md)
- [ADR-001 — Frontend stack](docs/decisions/ADR-001-frontend-stack.md)
- [Phase 01 report](docs/phases/phase-01-report.md)

## 14. Development Status

| Area                   | Status              |
| ---------------------- | ------------------- |
| UI/UX Design           | Completed           |
| Frontend Phase 01      | Completed           |
| Frontend Phase 02      | Not Started         |
| Backend Implementation | Status Not Verified |
| AI Services            | Status Not Verified |
| DevOps Deployment      | Status Not Verified |

The full 23-phase frontend plan and its status are tracked in [docs/PROGRESS.md](docs/PROGRESS.md).

## 15. Team Collaboration

### Frontend team

| Developer | Role                                                                     |
| --------- | ------------------------------------------------------------------------ |
| Yousef    | Frontend Lead — architecture, shared foundation, integration, publishing |
| Mariam    | Frontend Developer — assigned feature modules (works offline)            |

### Offline feature delivery

Yousef is the **sole GitHub integrator and publisher**. Mariam is not a repository collaborator:
she works on a local copy and hands her work to Yousef as a delivery package.

1. Yousef issues a **starter package** (`git archive` of a recorded, verified commit).
2. Mariam implements only her assigned modules and delivers changed files, a change manifest,
   notes, real test results and screenshots. Shared, config and dependency needs are listed
   separately as requests.
3. Yousef reviews, integrates on a `delivery/<module>-v<n>` branch from the recorded baseline,
   runs all checks, and either returns the delivery or merges it through a Pull Request.

Full procedure: [docs/TEAM_COLLABORATION.md](docs/TEAM_COLLABORATION.md) · Checklist:
[docs/FEATURE_DELIVERY_CHECKLIST.md](docs/FEATURE_DELIVERY_CHECKLIST.md)

### Git workflow (repository)

- `main` is the stable integration branch, protected by a ruleset: no direct pushes, no
  force-push, no deletion; changes arrive only through Pull Requests (squash or rebase) with all
  conversations resolved and the CI `check` job passing.
- Branches, created from `main` (or from the delivery baseline for `delivery/…`):
  - `phase/<nn>-<topic>` — roadmap phases, e.g. `phase/02-design-system`
  - `feature/<module>-<topic>` — work inside one module, e.g. `feature/notes-editor`
  - `fix/<area>-<topic>` — bug fixes
  - `delivery/<module>-v<n>` — integration of a delivery package
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat(dashboard): …`, `fix(shell): …`, `test(notes): …`, `docs(progress): …`,
  `chore(deps): …`. Dependency additions are separate `chore(deps)` commits that state the reason.
- Pull Requests use the [template](.github/PULL_REQUEST_TEMPLATE.md) and are reviewed by Yousef.
- `corepack pnpm check` must pass before a PR is merged; GitHub Actions
  ([ci.yml](.github/workflows/ci.yml)) runs it on every PR and the result is a required check.
- Nobody overwrites another developer's assigned module or shared files without coordination.

## 16. Future Development

Following the [Development Roadmap](docs/references/MUNSIT_AI_Development_Roadmap_v1.0.md):

1. **Foundation (Phases 02–06):** design system, UI primitives, routing and navigation registry,
   shared app shell, shared states, overlays and guards.
2. **Public (07–08):** Landing Page and Authentication UI.
3. **Modules (09–20):** the twelve application modules, Dashboard through Profile & Settings.
4. **Integration and release (21–23):** API integration (gated on backend contracts), testing and
   hardening, deployment preparation.

Backend, AI services and hosting decisions are outside this repository's current scope.

## Security

- Never commit `.env*` files other than `.env.example`.
- `NEXT_PUBLIC_*` variables are shipped to the browser — never put secrets in them.

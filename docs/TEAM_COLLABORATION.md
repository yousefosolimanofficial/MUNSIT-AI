# MUNSIT AI — Team Collaboration & Offline Feature Delivery

- **Status:** Approved by the Frontend Lead (2026-11-13)
- **Applies to:** all frontend work in this repository
- **Checklist:** [FEATURE_DELIVERY_CHECKLIST.md](FEATURE_DELIVERY_CHECKLIST.md)

## 1. Roles

| Person | Role                                                         | GitHub access                     |
| ------ | ------------------------------------------------------------ | --------------------------------- |
| Yousef | Frontend Lead — architecture, shared foundation, integration | Sole owner, integrator, publisher |
| Mariam | Frontend Developer — assigned feature modules only           | **None** (works offline)          |

- Yousef is the **only** person who commits to, pushes to, or merges into the official repository.
- Mariam is **not** a GitHub collaborator, has no write access, and does not open Pull Requests.
  She works on a local copy and delivers packages to Yousef.
- There is **one** frontend architecture: this repository. No forks, parallel projects or
  alternative folder structures.

## 2. Ownership

| Area                                                                                                                                                                             | Owner  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Tooling and config files, `package.json`, `pnpm-lock.yaml`, `src/app`, `src/design-system`, `src/shared`, `src/api`, `src/state`, `src/i18n`, `src/types`, `src/config`, `docs/` | Yousef |
| `src/features/<module>` folders assigned to Mariam (plus their colocated tests and `tests/e2e/<module>*`)                                                                        | Mariam |
| Unassigned feature modules                                                                                                                                                       | Yousef |

Module assignments are recorded in [PROGRESS.md](PROGRESS.md). Neither developer edits the
other's area without agreement. Mariam **requests** changes to Yousef-owned areas (see §5.3); she
does not make them in her delivery.

## 3. Workflow overview

1. Yousef prepares and verifies the shared foundation on `main`.
2. Yousef creates a **starter package** from an identified commit and records it (§4).
3. Mariam implements only her assigned features on her local copy.
4. Mariam delivers a **delivery package** with changed files, manifest, notes, test results and
   screenshots (§5).
5. Shared-component, configuration and dependency needs are listed **separately** as requests.
6. Yousef reviews the delivery before integrating it.
7. Yousef integrates on a local `delivery/…` branch — never by overwriting the project (§6).
8. Yousef runs typecheck, lint, format, tests, build, and responsive/visual checks.
9. Failed deliveries are returned with written reasons.
10. Accepted deliveries are committed and go through the repository's Pull Request workflow.
11. Only reviewed and verified code reaches `main`.

## 4. Starter package (Yousef → Mariam)

Create it only from a **committed, pushed** state of `main` that passes `corepack pnpm check`.

```bash
git switch main && git pull
corepack pnpm check
SHA=$(git rev-parse --short HEAD)
git archive --format=zip \
  --add-virtual-file=BASELINE_COMMIT.txt:"$(git rev-parse HEAD)" \
  -o "munsit-starter-$SHA.zip" HEAD
```

`git archive` exports **tracked files only**, so `node_modules/`, `.next/`, `.env*` (except
`.env.example`), caches and credentials are never included. `BASELINE_COMMIT.txt` carries the full
commit hash inside the package.

Record every starter package in the [Delivery log](#8-delivery-log): date, short hash, assigned
module(s).

**Mariam's setup** (Node 24 and Corepack as in the README):

```bash
# unzip into an empty folder, then:
corepack pnpm install
git init -b baseline && git add -A && git commit -m "baseline <short hash>"
git switch -c work
```

Local Git is recommended (not required) so she can list and diff her own changes against the
baseline. It stays on her machine; nothing is pushed anywhere.

## 5. Delivery package (Mariam → Yousef)

### 5.1 Contents

Name: `munsit-delivery-<module>-<YYYYMMDD>-v<n>.zip`

```
DELIVERY.md             manifest + notes (template in §5.2)
files/                  every added or modified file, at its exact repo-relative path
delivery.patch          optional but preferred: git diff baseline..work
screenshots/            1440 / 768 / 390, RTL (and LTR if supported)
shared-requests/        optional: proposed changes to Yousef-owned files, kept separate
```

Never include: `node_modules/`, `.next/`, `out/`, `coverage/`, `test-results/`,
`playwright-report/`, `*.tsbuildinfo`, `next-env.d.ts`, `.env` / `.env.local`, tokens,
passwords or any credential.

With local Git, the file list and patch come from:

```bash
git diff --name-status baseline..work     # manifest file list (A / M / D)
git diff baseline..work > delivery.patch
```

### 5.2 `DELIVERY.md` template

```markdown
# Delivery — <module> — v<n>

- Baseline commit: <full hash from BASELINE_COMMIT.txt>
- Module(s): <assigned module(s)>
- Roadmap phase: <nn — name>
- Date: <YYYY-MM-DD>

## Changed files

| Status (A/M/D) | Path | Purpose |
| -------------- | ---- | ------- |

## Implementation notes

<what was built, decisions taken, anything NOT VERIFIED against Figma>

## Shared / config / dependency requests (not applied in files/)

| Type (shared component / config / dependency / route) | Proposed change | Reason |
| ----------------------------------------------------- | --------------- | ------ |

## Test results (real output)

- typecheck:
- lint:
- format:check:
- test:
- build:
- test:e2e (if run):

## Responsive and direction checks

- 1440 / 768 / 390 / 320 overflow:
- RTL / LTR:
- Keyboard pass:

## Known limitations
```

### 5.3 Shared changes and dependencies

- A delivery's `files/` may only contain paths inside Mariam's assigned module folders and their
  tests.
- Anything else — `src/shared`, `src/design-system`, `src/app` routes, config files,
  `package.json`, `pnpm-lock.yaml` — goes into the **requests** table (and optionally
  `shared-requests/`). Yousef decides, implements it on `main`, and issues a new starter if needed.
- New dependencies are never installed by the delivery. They are requested with a reason and, if
  approved, added by Yousef in a separate `chore(deps)` commit with an ADR-001 update.

## 6. Integration (Yousef)

1. **Intake:** check the package against the [checklist](FEATURE_DELIVERY_CHECKLIST.md). Reject
   early if the baseline is missing or excluded content is present.
2. **Branch from the baseline**, so the delivery applies to the code it was written against:
   ```bash
   git switch -c delivery/<module>-v<n> <baseline hash>
   ```
3. **Apply only the manifest:** `git apply --check delivery.patch && git apply delivery.patch`,
   or copy exactly the listed files from `files/`. Never unzip over the project root. Compare
   `git status` with the manifest — every changed path must be listed, nothing more.
4. **Commit** the delivery as received: `feat(<module>): <summary> (delivery v<n>, Mariam)`.
5. **Update to current `main`:** `git rebase main` (or merge), and resolve conflicts on the
   integration branch only.
6. **Verify:** `corepack pnpm check`, `corepack pnpm test:e2e` when UI changed, plus responsive
   (1440 / 768 / 390, 320 overflow), RTL/LTR, keyboard and visual comparison with Figma.
7. **Decide:**
   - **Rejected** → return the package with written reasons; delete the branch; log it.
   - **Accepted** → push `delivery/<module>-v<n>`, open a PR with the template, review it, and
     merge through the repository's branch rules (squash or rebase). Log the merge commit.

Fixes Yousef makes during integration go in separate commits on the same branch, so the delivery
and the integrator's changes stay distinguishable.

## 7. Repository rules

- `main` is protected by the `main-protection` ruleset: no deletion, no force-push, changes only
  through Pull Requests (squash or rebase merges), all review conversations resolved, and the
  **`check`** status check from GitHub Actions ([ci.yml](../.github/workflows/ci.yml)) passing.
- Required approvals are **0**: Yousef is the only collaborator and GitHub does not let a PR
  author approve their own PR. Review is still mandatory — Yousef reviews every PR against the
  template and checklist before merging. The administrator bypass is for emergencies only, never
  for normal merges.
- Branch names: `phase/<nn>-<topic>`, `feature/<module>-<topic>`, `fix/<area>-<topic>`,
  `delivery/<module>-v<n>`.
- Conventional Commits; dependency additions in separate `chore(deps)` commits.
- `corepack pnpm check` must pass locally before pushing; CI runs the same script on every PR.

## 8. Delivery log

| Date | Type (starter / delivery) | Module | Version | Baseline / commit | Result |
| ---- | ------------------------- | ------ | ------- | ----------------- | ------ |

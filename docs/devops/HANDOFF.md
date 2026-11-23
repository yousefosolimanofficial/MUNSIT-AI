# MUNSIT AI frontend — DevOps handoff v1 (initial testing package)

> **Status: initial testing package, NOT a release.** The frontend is still in development
> (Phase 08 of the roadmap). Authentication, the backend connection and English are switched off
> in production builds. Use this package to prepare and test hosting. Do not treat it as a
> launch candidate.

## 1. Source

| Item               | Value                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Application source | `main` at `581fc19a4fc6485d0961ee894d0896f995eb2791` (PR #75, 2026-11-23)                                                        |
| Package commit     | The commit that adds this file on `feature/devops-handoff-v1`. The exact hash is in the handoff PR and the package manifest      |
| Repository         | GitHub `yousefosolimanofficial/MUNSIT-AI` (access through the Frontend Lead)                                                     |
| Changes after this | Listed in §9. Frontend work continues on `main`; rebuild from a newer commit only when the Frontend Lead announces a new version |

## 2. Runtime versions

| Tool    | Version                                      | Source of truth                            |
| ------- | -------------------------------------------- | ------------------------------------------ |
| Node.js | **24.22.3** (allowed range `>=24.22.3 <25`)  | `.nvmrc`, `package.json` `engines`         |
| pnpm    | **12.18.0**, through Corepack (Node ≥ 24)    | `package.json` `packageManager`            |
| Next.js | 16.4.6 (`next start`, Node.js server)        | `pnpm-lock.yaml`                           |
| Image   | `node:24.22.3-bookworm-slim` (Debian, glibc) | `Dockerfile` (`NODE_IMAGE` build argument) |

- Use pnpm only. `pnpm-lock.yaml` is the only lockfile; do not run npm or yarn.
- On a machine without Corepack shims, call pnpm as `corepack pnpm …`.

## 3. Commands

| Step     | Command                                              | Notes                                                                                                                                    |
| -------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Install  | `corepack pnpm install --frozen-lockfile`            | Fails if the lockfile is out of date: report it, do not update it                                                                        |
| Build    | `NEXT_PUBLIC_APP_ENV=production corepack pnpm build` | `next build`. Type-checks the whole repository (including `tests/`)                                                                      |
| Start    | `corepack pnpm start -H 0.0.0.0`                     | `next start`. Port from `PORT` (default 3000) or `--port`. Pass flags without `--` (pnpm 12 forwards `--` literally and the start fails) |
| Optional | `corepack pnpm check`                                | The full CI gate: typecheck, lint, format, unit tests and build                                                                          |

**Bind to `0.0.0.0` (or leave the default), never to `127.0.0.1`.** With `-H 127.0.0.1` every page
answers `307` to itself in a loop (Next.js normalises loopback hosts in the locale rewrite; QA
report O-1, `docs/phases/phase-07-qa-report.md`).

## 4. Port and health

- **Port:** 3000 inside the container (`EXPOSE 3000`, `PORT=3000`). Override with `-e PORT=<n>`.
- **Health:** `GET /` returns `200` (Arabic home page). The image has a `HEALTHCHECK` on it.
- There is no dedicated health or readiness endpoint yet. If one is needed, request it (§8).

## 5. Environment variables

The frontend reads exactly **one** variable today (`src/config/env.ts`, `.env.example`):

| Variable              | Required | Values                                  | When it is read                                                                   |
| --------------------- | -------- | --------------------------------------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_ENV` | Yes      | `development`, `test`, **`production`** | **Build time.** Inlined into the browser bundle; a change needs a new build/image |

Set by the runtime, not by DevOps configuration: `NODE_ENV` (`production` under `next start`),
`PORT` (§4) and `NEXT_TELEMETRY_DISABLED=1` (set in the image).

- Anything named `NEXT_PUBLIC_*` is public. It must never hold a secret, token or key.
- There are **no secrets** in the frontend today. No `.env` file is needed for a production
  build; never bake one into an image.
- An unknown value of `NEXT_PUBLIC_APP_ENV` fails the build on purpose.

## 6. Backend API (`API_BASE_URL`): not configured yet

- The frontend has **no backend URL, no `API_BASE_URL` variable and no network calls** today.
  Every data source is a placeholder adapter in `src/api/adapters/` that answers "unavailable".
  Authentication is a placeholder that always fails closed.
- No backend endpoint, field, auth flow or URL is decided. **None is invented here.** The backend
  connection is a later roadmap phase.
- **How it will connect (planned shape, not built):**
  1. The backend team supplies the base URL per environment and the API contract.
  2. The Frontend Lead adds the variable to `src/config/env.ts` and `.env.example`. Its name, and
     whether it is public (`NEXT_PUBLIC_*`, build time) or server-only (runtime), are decided then.
     If it is public, each environment needs its own image build.
  3. The adapters in `src/api/adapters/` switch from the placeholders to real calls.
  4. This document gets a new version (§9) that lists the variable, its values and CORS or
     cookie needs.
- Until then, deploy the frontend alone. It does not need the backend to run.

## 7. Docker

Files at the repository root: `Dockerfile`, `.dockerignore`, `compose.yaml`.

```sh
docker build --build-arg NEXT_PUBLIC_APP_ENV=production -t munsit-ai-frontend .
docker run --rm -p 3000:3000 munsit-ai-frontend
# or
docker compose up --build
```

**Image design:**

- Three stages: `deps` (`pnpm install --frozen-lockfile`), `build` (`next build`), and `runtime`
  (production dependencies, `.next`, `public`, `next.config.ts` and `src/i18n`).
- Runs as the non-root `node` user, `next start -H 0.0.0.0`, port from `PORT`.
- `.dockerignore` keeps `.git`, `node_modules`, build output, `.env*` (except `.env.example`),
  docs and local folders out of the build context.

**Compatibility requirements:**

- `linux/amd64` was tested. Other platforms are NOT VERIFIED.
- Use a glibc base image (Debian). Alpine/musl is NOT VERIFIED.
- The build needs network access to the npm registry, and Corepack downloads pnpm 12.18.0.
- Image size: about 241 MB. The build runs `next build` with a full type check.
- The server keeps no local state, so it can be replaced or scaled freely. It holds no sessions
  and has no volumes.
- TLS, a domain, a CDN or reverse proxy, logging, and resource limits are the hosting platform's
  responsibility. None is configured here.

**Verified on 2026-11-23** (Docker 29.7.2, image from `581fc19`, `NEXT_PUBLIC_APP_ENV=production`):

| Check                                     | Result                                             |
| ----------------------------------------- | -------------------------------------------------- |
| `docker build`                            | Succeeded (includes the full type check)           |
| `GET /` and `GET /dashboard`              | 200, `<html lang="ar" dir="rtl">`                  |
| `GET /` with Host `127.0.0.1`             | 200 (no loop, because the server binds `0.0.0.0`)  |
| `/login`, `/register`, `/dev/auth`, `/en` | 404, as intended (production gates)                |
| `/favicon.ico`                            | 200                                                |
| Health check                              | `healthy`                                          |
| `-e PORT=8080`                            | Serves on 8080; health check `healthy`             |
| User, Node.js                             | `node`, v24.22.3                                   |
| Files in the image                        | No `.env*`, `.git`, docs or local research folders |
| `docker compose config`                   | Valid                                              |

CI does not build the Docker image. The CI `check` and `e2e` jobs verify the same commit with the
same Node.js and pnpm versions.

## 8. What is NOT in this package

- **Not included:** authentication, the backend connection, English pages, Pricing and the final
  Hero image. These are switched off in production builds on purpose.
- **Not set up:** a deployment target, a domain, TLS, monitoring and release readiness. These stay
  open; see `docs/phases/phase-07-closure-report.md` (deployment items, ClickUp `123ru7v2pn3`).
- **Questions and requests** go to the Frontend Lead, for example a health endpoint, a base path,
  `output: "standalone"` for a smaller image, or another platform. Do not change application
  files or the lockfile in a deployment repository.

## 9. Change log (communicated to DevOps)

The Frontend Lead updates this table, and notifies DevOps, whenever a dependency, the Node.js or
pnpm version, a port, an environment variable or the runtime configuration changes.

| Version | Date       | Source commit | Change                                                                       |
| ------- | ---------- | ------------- | ---------------------------------------------------------------------------- |
| v1      | 2026-11-23 | `581fc19`     | Initial testing package: Node 24.22.3, pnpm 12.18.0, port 3000, one variable |

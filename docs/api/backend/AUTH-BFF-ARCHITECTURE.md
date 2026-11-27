# Authentication BFF and session architecture — proposal

> **Status: PROPOSED, for owner approval (2026-11-27). Not implemented.**
>
> - Nothing here is wired. Login and Register keep the placeholder adapter, and
>   `AUTHENTICATION_AVAILABLE = false`.
> - Production authentication stays disabled until the release criteria in §10 are met.
> - Implementation belongs to Roadmap Phase 21 (API integration, auth resource) and gate D-02.
>   It starts only after the owner approves §11.

**Inputs:**

- The live contract: [CONTRACT.md](v1.0.0-2026-11-26/CONTRACT.md), with [openapi.json](v1.0.0-2026-11-26/openapi.json) (SHA-256 `0286070e…0eed`).
- The typed client on this branch: `src/api/backend/client.ts` and `src/config/backend.ts`.
- The Phase 08 adapter boundary: `src/api/adapters/auth.ts` and `src/types/auth.ts`.
- The Next.js 16 docs shipped in `node_modules/next/dist/docs`: authentication, data security, `cookies`, `serverActions` and `proxy`.

## 1. What the backend gives us today

| Endpoint         | Request                                         | Success                                           | Observed errors (undeclared in OpenAPI)                                |
| ---------------- | ----------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| `POST /register` | JSON `{ full_name, email, password }`           | 201 `{ id: int, full_name, email }`, **no token** | 400 duplicate email (string `detail`); 422 validation (array `detail`) |
| `POST /login`    | form-urlencoded `{ username: email, password }` | 200 `{ access_token: JWT, token_type: "bearer" }` | 401 wrong credentials (string `detail`); 422 for a JSON body           |
| `GET /me`        | `Authorization: Bearer <token>`                 | 200 `{ id: int, full_name, email }`               | 401 for a missing or invalid token                                     |
| `GET /`          | none                                            | 200, empty schema                                 | —                                                                      |

**What it does not give us:**

- the token lifetime: there is no `expires_in`, and the `exp` claim is not documented;
- a refresh, logout or revocation endpoint;
- a cookie;
- a password policy or rate limit;
- recovery endpoints;
- a stable host: it runs on a temporary GitHub Codespace, with 1.1 to 5.7 s latency.

These gaps are §9.

## 2. Architecture

```
Browser (same origin only)            Next.js server (BFF)                       Munsit Backend
──────────────────────────            ─────────────────────────────────          ──────────────
Login / Register form                 Server Action (POST, "use server")
  └─ AuthAdapter (real) ──── POST ──▶   1. same-origin check (§5)
                                        2. Zod input validation
                                        3. backend client ───────── HTTPS ──────▶ /login, /me, /register
                                        4. seal session (AES-256-GCM)  ◀──────────  token, user
  ◀── { ok } | { ok:false, failure } ─  5. Set-Cookie __Host-munsit_session
Server Components / pages             Session DAL (server-only)
  └─ reads session ◀───────────────── verifySession(): unseal, check expiry,
                                         revalidate with /me (§6)
proxy.ts (optimistic redirect only)   cookie present / unsealable → route group rules
```

**Principles:**

1. **The browser never sees the backend.**
   - The backend URL is server-only (`MUNSIT_API_BASE_URL`, already enforced).
   - The browser never calls the backend, so CORS is not needed.
2. **The browser never holds the token.**
   - The JWT is never returned in a response or the RSC payload, never passed as a prop, and never logged.
   - It never goes to `localStorage` or `sessionStorage`, or into a readable cookie.
   - It exists only inside the sealed `HttpOnly` cookie and in server memory during a request.
3. **One auth boundary.**
   - Forms keep calling `AuthAdapter`. The real adapter calls Server Actions, and the actions call the BFF.
   - The UI, copy and states approved in Phase 08 do not change.
4. **Fail closed.** Any unexpected error, missing configuration or malformed response gives `unavailable`. It never gives success, and never leaves a half-written session.

**Transport: Server Actions (recommended) over Route Handlers.**

- Server Actions are POST-only, fit the existing `AuthAdapter` promise shape and can set cookies.
- They also do Next's built-in Origin and Host comparison.
- That check lets a request **with no `Origin` header** through with a warning, so §5 adds an explicit check.
- Route Handlers under `/api/auth/*` stay the fallback if a non-React client ever needs the BFF. `proxy.ts` already excludes `/api`.

**Code placement:** decision S-3.

- `src/api` may import only `src/types`. It cannot read configuration or cookies.
- Proposed: a new **server-only layer `src/server/auth/`**:
  - `session.ts`: seal, unseal, cookie read and write;
  - `dal.ts`: `verifySession`, `getCurrentUser`;
  - `actions.ts`: the `"use server"` Server Actions.
- It may import `src/api`, `src/config` and `src/types`. Only `src/features/auth` and `src/app` may import it.
- Each file starts with `import "server-only"`, and dependency-cruiser rules are added for the layer.
- The real `AuthAdapter` lives in `src/features/auth/api/` and wraps the actions.

## 3. Session design

**Recommended: a stateless sealed cookie (option A).**

- **Contents:** the cookie holds an encrypted, authenticated envelope (`dir` + `A256GCM` JWE):

  ```
  { v: 1, token: <backend JWT>, user: { id, fullName, email }, iat, exp, checkedAt }
  ```

  The envelope is about 0.5 KB, well under the 4 KB cookie limit.

- **Why encrypt, and not just store the JWT in an `HttpOnly` cookie:**
  - the JWT payload stays unreadable even if the cookie leaks into logs;
  - a token the BFF did not issue is rejected;
  - the format can carry `exp` and `checkedAt`.
- **Fit for the current deployment:**
  - no database or Redis is needed, which suits the current single-container deployment (`docs/devops/HANDOFF.md`);
  - it also works across several instances that share the secret.
- **Library:** `jose` (S-4), which is zero-dependency and recommended by the Next.js authentication guide. It is a new dependency: a `chore(deps)` commit plus an ADR-001 update.
  - Alternative: Node WebCrypto AES-GCM written in-house. That means no dependency, but more security-critical code we own.
- **Secret:**
  - `MUNSIT_SESSION_SECRET`, server-only, at least 32 random bytes. It is never committed, and it is set per environment.
  - Key rotation: the BFF accepts `MUNSIT_SESSION_SECRET_PREVIOUS` for one session lifetime.
  - A missing or short secret disables the BFF, so actions return `unavailable` and the app does not crash.
  - This is a runtime change: the DevOps handoff gets a v2 row and a new package **when implemented**, not now.

**Option B: a server-side session store.** An opaque random ID goes in the cookie, and the token is stored in Redis or a database.

- **Gains:** instant server-side revocation, and logout everywhere.
- **Costs:** infrastructure the project does not have, and hosting is undecided.
- **Recommendation:** move to B only if the owner requires revocation before the backend offers a logout or revocation endpoint (S-2).

## 4. Cookie settings

| Attribute     | Value                                                                        | Reason                                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name          | `__Host-munsit_session` (production, https)                                  | The `__Host-` prefix forces `Secure`, `Path=/` and no `Domain`, so a subdomain cannot set or shadow it                                                                      |
| `HttpOnly`    | yes                                                                          | No JavaScript access (an XSS bug cannot read the token)                                                                                                                     |
| `Secure`      | yes; plain-http dev on `localhost` only uses the unprefixed `munsit_session` | The token travels over TLS only                                                                                                                                             |
| `SameSite`    | `Lax`                                                                        | The cookie is not sent on cross-site POST, iframes or sub-requests, but it is sent on top-level navigation from links (email links, bookmarks). `Strict` is an option (S-6) |
| `Path`        | `/`                                                                          | Required by `__Host-`                                                                                                                                                       |
| `Domain`      | not set                                                                      | Host-only                                                                                                                                                                   |
| `Max-Age`     | `min(token exp, absolute cap) − now`                                         | The cookie never outlives the token (§6)                                                                                                                                    |
| `Priority`    | `High`                                                                       | Not evicted before less important cookies                                                                                                                                   |
| `Partitioned` | no                                                                           | First-party only                                                                                                                                                            |

Responses that set or read the session send `Cache-Control: private, no-store`. Authenticated pages are rendered dynamically and never cached or shared.

## 5. CSRF protection

**Threats:**

- a cross-site form posting to an action as the signed-in user;
- **login CSRF**: signing the victim into the attacker's account;
- forced logout.

**Layers, all required:**

1. **`SameSite=Lax`** on the session cookie, so it is not sent on cross-site POST.
2. **POST only** for every state change: login, register, logout and any later mutation. GET never changes state. There is no `GET /logout`.
3. **Explicit same-origin check** in every action, before any other work, in `assertSameOrigin()`:
   - `Origin` must be present and equal to the app's public origin (`MUNSIT_PUBLIC_ORIGIN` at runtime, S-7). A **missing `Origin` is rejected**, which closes the gap in Next's built-in check.
   - If `Sec-Fetch-Site` is present, it must be `same-origin`.
   - A failure returns `unavailable` and logs a security event (no values).
4. **Next's built-in Server Action Origin/Host check** stays on. `serverActions.allowedOrigins` is not set: no extra origins are allowed.

**Synchronizer or double-submit token:** not proposed for now.

- With layers 1 to 3 on a same-origin, HTTPS-only app, a token adds complexity without closing a remaining path.
- Revisit it if the app is ever served from several origins or embedded (S-6).

## 6. Session lifecycle and expiry

| Event                       | Behaviour                                                                                                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Login**                   | Same-origin check → Zod → `POST /login` → `GET /me` (confirms the token and gets the user) → **delete any existing session cookie, then set a new one** (no session fixation) → return `{ ok: true }`. The redirect target comes from the route registry, never from raw user input (no open redirect) |
| **Register**                | `POST /register` → **no session** (Figma shows the Success view with "تسجيل الدخول"). Auto-login is a decision (S-9)                                                                                                                                                                                   |
| **Every protected request** | `verifySession()` in the DAL: unseal → reject if `exp` has passed → if `checkedAt` is older than the revalidation interval (proposed 5 min, S-8), call `GET /me`. On 200, refresh `checkedAt` and the user. On 401, end the session                                                                    |
| **Absolute expiry**         | `exp` = the backend token's expiry (from `expires_in` when the backend adds it, §9 Q1), capped by an absolute maximum (proposed 7 days, S-8)                                                                                                                                                           |
| **Idle expiry**             | Proposed 24 h without activity (S-8). It needs the cookie to be re-sealed on activity, at most once per revalidation interval. It can never extend beyond `exp`                                                                                                                                        |
| **Expiry or 401**           | Delete the cookie → redirect to Login with an allowlisted return path → show a "session ended" message. **No approved copy exists for that message** (S-10)                                                                                                                                            |
| **Refresh**                 | **Not possible today** (no endpoint). At `exp` the user signs in again. When the backend adds refresh (§9 Q2), the refresh token goes in the sealed envelope and is rotated on use                                                                                                                     |
| **Logout**                  | POST action → same-origin check → call backend logout or revocation **if it exists** (best effort, it never blocks) → delete the cookie (same name and attributes, `Max-Age=0`) → `revalidatePath` and redirect to Login. It works even when the backend is down                                       |
| **Secret rotation**         | Old-key sessions stay valid for one lifetime and are re-sealed with the new key on the next revalidation                                                                                                                                                                                               |

**Logout limitation in option A:** a stolen backend JWT stays valid at the backend until its `exp`, because there is no revocation. Two things keep that window small:

- a short backend token lifetime (§9 Q1);
- a revocation endpoint (§9 Q3).

**Route protection** (D-08-6 types already exist):

- `proxy.ts` makes an **optimistic** redirect only: cookie present or absent, and guest-only routes versus app routes.
- **The authoritative check is always `verifySession()`** in the page or layout and in every action. `proxy.ts` is never the only guard.

## 7. Token storage and lifecycle

| Stage     | Rule                                                                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Received  | Only in the Server Action from `POST /login`, over HTTPS (https is enforced outside localhost)                                                                                                                                       |
| Stored    | Only inside the sealed `HttpOnly` cookie. Not in the database, logs, the RSC payload, props, client state or web storage                                                                                                             |
| Used      | Only server-side, as `Authorization: Bearer` from the backend client                                                                                                                                                                 |
| Inspected | The BFF does not verify the JWT signature (it has no key). It trusts the token because it came directly from the backend over TLS. `exp` comes from `expires_in` (preferred) or the unverified `exp` claim, used for scheduling only |
| Discarded | On logout, expiry, any backend 401, an unseal failure or a secret change                                                                                                                                                             |
| Never     | Never logged (not in errors, analytics or traces), never in a URL, never in a redirect                                                                                                                                               |

**Data returned to the client:** `{ ok }`, a failure code, and for the shell at most `{ fullName, email }`. It never includes the token or the numeric ID. `AuthSession.userId` becomes `String(id)` server-side.

## 8. Error handling

**Backend error kind to UI outcome.** Every outcome uses the UI's own approved copy; backend text is never shown (BC-3).

| Client `BackendError` kind       | Login                                     | Register                                                              | Session / `me`                                                                     |
| -------------------------------- | ----------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `unauthorized` (401)             | `invalid-credentials` (approved copy)     | `rejected`                                                            | end the session → Login                                                            |
| `conflict` (400)                 | `rejected`                                | **duplicate email: copy missing (BC-7, S-10)**; until then `rejected` | —                                                                                  |
| `validation` (422)               | `rejected` (client validation runs first) | `rejected`; field mapping only for fields the UI owns                 | `unavailable`                                                                      |
| `rejected` (other 4xx)           | `rejected`                                | `rejected`                                                            | end the session                                                                    |
| `server` / `network` / `timeout` | `unavailable`                             | `unavailable`                                                         | keep the session; the page shows its error state; no logout on a transient failure |
| `unexpected` (bad 2xx shape)     | `unavailable`                             | `unavailable`                                                         | `unavailable`                                                                      |
| missing configuration or secret  | `unavailable`                             | `unavailable`                                                         | treated as signed out                                                              |

**Logging:**

- **What is logged:** action name, error kind, HTTP status, duration and a correlation ID (`X-Request-ID` forwarded to the backend, §9 Q12).
- **Never logged:** email, name, password, token, cookie or the backend `detail`.

**Retries:** none for login or register, because they are not idempotent from the user's view. Session revalidation does not retry either; a transient failure keeps the session.

**Enumeration:**

- Login: the backend already returns the same 401 for unknown email and wrong password, and this is kept.
- Register: the 400 duplicate reveals that an account exists, which is inherent to registration and is mitigated by rate limits (§9 Q7).

## 9. Missing backend requirements (questions for the Backend team)

| #   | Question                                                                                                                                                                                                  | Blocks              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Q1  | **Token expiry.** What is the access token's lifetime (`exp`)? Please add `expires_in` (seconds) to the `Token` response, as in OAuth2. Proposed: 15–60 min if Q2 adds refresh; otherwise state the value | Session expiry      |
| Q2  | **Refresh.** Will there be a refresh token and a `POST /refresh` (rotation on use, reuse detection)? If not, users sign in again at expiry                                                                | Session length, UX  |
| Q3  | **Logout and revocation.** Please add `POST /logout`, which invalidates the presented token (denylist by `jti` or a per-user token version). Is "log out of all devices" needed?                          | Logout security     |
| Q4  | **Stable hosting.** A stable HTTPS dev or staging URL (not a Codespace), its uptime, and later the production URL. Can production be reachable only from the frontend server (private network)?           | Integration testing |
| Q5  | **Declare actual responses in OpenAPI:** 400 duplicate email, 401 login, 401 `/me`, and the `GET /` health response                                                                                       | Contract accuracy   |
| Q6  | **Machine-readable errors.** A stable `code` (e.g. `email_taken`, `invalid_credentials`, `token_expired`) next to `detail`, instead of matching Arabic text                                               | Error mapping       |
| Q7  | **Rate limiting and lockout** on `/login` and `/register` (per IP and per account). What limits, and what status (429 with `Retry-After`)?                                                                | Brute force         |
| Q8  | **Password policy.** Will the backend enforce the UI rule (8+ characters, upper, lower, digit; BC-4)? What is the maximum length?                                                                         | Consistency         |
| Q9  | **Email handling.** Is email uniqueness case-insensitive? Is it normalized (trim, lowercase)? Is email verification required before login?                                                                | Login, Register     |
| Q10 | **JWT details.** The signing algorithm, the claims (`sub` = user id? `jti`?) and whether tokens are bound to anything. Confirm the token is opaque to clients                                             | Lifecycle           |
| Q11 | **CORS.** Since only the BFF calls the API, can CORS be closed to browsers (no `*`, no credentialed origins)?                                                                                             | Attack surface      |
| Q12 | **Correlation.** Will the backend accept and log an `X-Request-ID` header?                                                                                                                                | Support             |
| Q13 | **Recovery.** `forgot-password` and `reset-password` endpoints, token lifetime and single use (BC-6; for the Recovery UI)                                                                                 | Recovery            |
| Q14 | **Versioning.** A base path such as `/api/v1`, an OpenAPI `servers` entry, and a change notice before breaking changes. Is the earlier pack's `/api/v1/auth/*` planned?                                   | Stability           |
| Q15 | **Field limits.** Maximum lengths for `full_name`, `email` and `password`; Unicode handling for Arabic names                                                                                              | Validation          |
| Q16 | **Test data.** A way to create and delete test accounts on staging, and deletion of the 2026-11-26 smoke account                                                                                          | E2E                 |

## 10. Release criteria (before `AUTHENTICATION_AVAILABLE` may change)

All of the following, each verified:

1. Q1, Q3 and Q4 answered and delivered; Q2 decided.
2. Owner approval of §11.
3. The BFF implemented with unit tests (seal and unseal, tampering, expiry, rotation, same-origin rejection including a missing `Origin`) and E2E tests against a contract-shaped fake backend.
4. A real round trip on staging.
5. An independent security review: the `security-auditor` agent plus the owner.
6. A build-output search proving that no backend URL, token or secret is in the client bundle.
7. A new DevOps handoff row (new variables).
8. A separate PR that changes only the gate.

## 11. Decision checklist for owner approval

| ID   | Decision                                                                                                                                                                       | Recommendation                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| S-1  | BFF topology (§2): the browser talks only to Next.js; Server Actions call the backend                                                                                          | Approve                                           |
| S-2  | Session storage: sealed stateless cookie (A) or server session store (B)                                                                                                       | A now; B only if revocation is required before Q3 |
| S-3  | New server-only layer `src/server/auth` and its dependency-cruiser rules                                                                                                       | Approve                                           |
| S-4  | Crypto: `jose` (new dependency, ADR-001) or in-house WebCrypto                                                                                                                 | `jose`                                            |
| S-5  | Cookie settings (§4): `__Host-munsit_session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age` ≤ token expiry                                                        | Approve                                           |
| S-6  | CSRF (§5): `SameSite=Lax`, POST only, mandatory same-origin check (missing `Origin` rejected); no CSRF token for now                                                           | Approve (`Strict` and a token stay optional)      |
| S-7  | Roadmap Phase 21 says "API base URL via public env var". The BFF keeps it **server-only** (`MUNSIT_API_BASE_URL`), and adds `MUNSIT_SESSION_SECRET` and `MUNSIT_PUBLIC_ORIGIN` | Approve the deviation (it is more secure)         |
| S-8  | Lifetimes: absolute = token `exp`, capped at 7 days; idle 24 h; `/me` revalidation every 5 min                                                                                 | Approve as defaults; final after Q1 and Q2        |
| S-9  | Register does not sign the user in (matches the Figma Success view)                                                                                                            | Approve                                           |
| S-10 | New copy needed: duplicate email (BC-7) and "session ended". Figma or owner wording                                                                                            | Owner or design to provide                        |
| S-11 | Logout: POST only, cookie always cleared, backend revocation best effort; its UI location comes with the shell phase                                                           | Approve                                           |
| S-12 | Route protection: optimistic in `proxy.ts`, authoritative in the DAL                                                                                                           | Approve                                           |
| S-13 | Rate limiting: required from the backend (Q7); no BFF limiter in the first version                                                                                             | Approve                                           |
| S-14 | Release criteria (§10) for any change to `AUTHENTICATION_AVAILABLE`                                                                                                            | Approve                                           |
| S-15 | Send §9 (Q1–Q16) to the Backend team                                                                                                                                           | Approve                                           |

## 12. Implementation plan (after approval; not started)

1. **I-A, session core.** The `src/server/auth/session.ts` module and its unit tests, with no route using it.
2. **I-B, actions and DAL.** Login, logout and register actions; `verifySession`; the real adapter. The gate stays `false`, and the work is tested against a fake backend.
3. **I-C, route protection.** `proxy.ts` and layout guards.
4. **I-D, staging.** A round trip on staging (Q4), then the security review and the gate PR (§10).

Each step is its own PR with CI green, and none of them changes Mariam's Recovery files.

## 13. Review of PR #84 (client and configuration, 2026-11-27)

The client matches the captured contract for every path, body, status and field, and its guards are sound:

- no redirects and no cache;
- `https` required outside localhost;
- no backend text exposed;
- no logging.

**Findings (2026-11-27). Update: PR-1, PR-2 and PR-3 are fixed with tests, and PR-5 is done (`main` merged). See [INTEGRATION-MAPPING.md](v1.0.0-2026-11-26/INTEGRATION-MAPPING.md) §4:**

| ID   | Finding                                                                                                                                                                                   | Severity |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| PR-1 | The timeout is cleared in `finally` **before** `response.json()`, so a backend that sends headers and then stalls the body is never aborted. Clear the timer after the body has been read | Medium   |
| PR-2 | `isToken` accepts any `token_type`. Require `bearer` (case-insensitive), so a contract change fails closed                                                                                | Low      |
| PR-3 | `getBackendConfig()` guards with `typeof window` only. Add `import "server-only"` in the server layer (S-3), so a client import fails at build time                                       | Low      |
| PR-4 | No upper bound on response size. Acceptable for these small JSON bodies; revisit for later resources                                                                                      | Info     |
| PR-5 | The branch is **behind `main`** (after #82). Update it with a merge from `main` before any review for merge                                                                               | Process  |

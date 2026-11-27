# Integration mapping — Login, Register, `GET /me` (contract v1.0.0)

> **Status: PREPARATION ONLY (2026-11-27). Not wired.**
>
> - This maps the existing UI adapter (`src/api/adapters/auth.ts`) to the backend client (`src/api/backend/client.ts`) for the future BFF ([AUTH-BFF-ARCHITECTURE.md](../AUTH-BFF-ARCHITECTURE.md), awaiting owner approval).
> - No screen calls the backend.
> - `AUTHENTICATION_AVAILABLE = false`.
> - Source of every backend field and status: [CONTRACT.md](CONTRACT.md).

## 1. Login (`AuthAdapter.signIn` → `POST /login`)

**Request mapping**

| UI (`SignInInput`) | Backend (`Body_login_login_post`, form-urlencoded)  | Rule                                                                             |
| ------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `email`            | `username`                                          | Already trimmed by the Login schema. Lowercasing waits for Q9 (case sensitivity) |
| `password`         | `password`                                          | Sent unchanged (never trimmed, logged or stored)                                 |
| —                  | `grant_type`, `scope`, `client_id`, `client_secret` | Not sent (optional in the contract)                                              |

**Success:**

1. 200 `{ access_token, token_type: "bearer" }`.
2. The BFF calls `GET /me` with the token (§3).
3. It seals the session.
4. It returns `{ ok: true }`.

The token never leaves the server.

**Result mapping (`AuthResult`)**

| Backend result                                            | Client `BackendError.kind`     | `AuthResult`                                    | UI copy (approved)            |
| --------------------------------------------------------- | ------------------------------ | ----------------------------------------------- | ----------------------------- |
| 200 + valid bearer token, then `/me` 200                  | —                              | `{ ok: true }`                                  | — (redirect, later phase)     |
| 401 wrong credentials                                     | `unauthorized`                 | `{ ok: false, failure: "invalid-credentials" }` | `errors.invalidCredentials`   |
| 422 (should not happen after client validation)           | `validation`                   | `rejected`                                      | Login shows it as unavailable |
| other 4xx (incl. a future 429, Q7)                        | `rejected`                     | `rejected`                                      | as above                      |
| 5xx, network failure, timeout                             | `server`, `network`, `timeout` | `unavailable`                                   | `errors.unavailable.login`    |
| 200 with a bad shape, or a `token_type` other than bearer | `unexpected`                   | `unavailable`                                   | as above                      |
| `/me` fails right after login                             | any                            | `unavailable`, and no session is set            | as above                      |

## 2. Register (`AuthAdapter.register` → `POST /register`)

**Request mapping**

| UI (`RegisterInput`)  | Backend (`UserCreate`, JSON) | Rule                                                                                  |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| `name`                | `full_name`                  | Trimmed by the Register schema (BC-1). Length limit waits for Q15                     |
| `email`               | `email`                      | Trimmed. Lowercasing waits for Q9                                                     |
| `password`            | `password`                   | Unchanged. The UI policy (8+, upper, lower, digit) may differ from the backend's (Q8) |
| `confirm` (form only) | —                            | **Never sent**; it is checked in the form only                                        |

**Success:** 201 `{ id, full_name, email }` → `{ ok: true }`. **No session is created** (S-9): the UI shows the Success view with "تسجيل الدخول".

**Result mapping**

| Backend result                           | Client `BackendError.kind`                   | `AuthResult`   | UI copy                                                                                        |
| ---------------------------------------- | -------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| 201 + valid user                         | —                                            | `{ ok: true }` | Success view                                                                                   |
| 400 duplicate email                      | `conflict`                                   | `rejected`     | `errors.failed.register`. **Duplicate-email copy is missing (BC-7, S-10)**                     |
| 422 (e.g. email format)                  | `validation` (+ `fields`)                    | `rejected`     | `errors.failed.register`. Field errors are not shown: the backend `fields` are only diagnostic |
| other 4xx                                | `rejected`                                   | `rejected`     | `errors.failed.register`                                                                       |
| 5xx, network failure, timeout, bad shape | `server`, `network`, `timeout`, `unexpected` | `unavailable`  | `errors.unavailable.register` (R-3 banner)                                                     |

## 3. Current user (`AuthAdapter.getSession` and the session DAL → `GET /me`)

| Step                          | Mapping                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request                       | `Authorization: Bearer <token>`, read from the sealed session on the server only                                                                               |
| 200                           | `UserResponse { id, full_name, email }` → `AuthSession { userId: String(id) }`. The shell may receive `{ fullName, email }`, never the token or the numeric ID |
| 401                           | `unauthorized` → end the session (delete the cookie) → Login. "Session ended" copy is missing (S-10)                                                           |
| 5xx, network failure, timeout | Keep the session. The page shows its own error state; no logout on a transient failure                                                                         |
| Bad shape                     | `unexpected` → treated as signed out                                                                                                                           |

## 4. Client review (2026-11-27)

**Fixed in this PR:**

- **PR-1:** the timeout now covers the body read. A stalled body gives `timeout`, and the timer is cleared on every path.
- **PR-2:** `token_type` must be `bearer`, case-insensitive. Anything else gives `unexpected` and is treated as unavailable.
- **PR-3:** `src/config/backend.ts` imports `server-only`. Next.js 16 fails the build when a Client Component imports it; this was verified with a temporary probe build, now removed. Vitest maps the import to an empty stub, and dependency-cruiser allows this one unresolved import. No new dependency.

**Open notes:** not changed; decided with the backend answers.

| ID  | Note                                                                                                                                                                                                   | Depends on |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| N-1 | Every 400 from `/register` is read as `conflict`. If the backend adds other 400 cases (e.g. a weak password), they would look like "duplicate email". A machine-readable `code` would remove the guess | Q6         |
| N-2 | 429 maps to `rejected`. A dedicated `rate-limited` kind waits for the backend's rate-limit design                                                                                                      | Q7         |
| N-3 | `me("")` would send `Bearer ` with no token. The BFF must never call it without a session token; it will guard before calling                                                                          | BFF (I-B)  |
| N-4 | The client does not normalize email. Trimming happens in the UI schemas; lowercasing is a BFF decision once case sensitivity is known                                                                  | Q9         |
| N-5 | The default 10 s timeout fits the Codespace's latency (up to 5.7 s). Revisit on stable hosting                                                                                                         | Q4         |

**Types:** `src/types/backend.ts` matches the captured OpenAPI. No field is invented, and the optional OAuth2 form fields are deliberately omitted.

## 5. Backend answers required before implementation

| Needed for                      | Questions ([AUTH-BFF-ARCHITECTURE.md](../AUTH-BFF-ARCHITECTURE.md) §9) | Without an answer                                         |
| ------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| Session expiry                  | **Q1** token lifetime, `expires_in`                                    | The session lifetime is unknown: **blocks the BFF**       |
| Session length and UX           | **Q2** refresh                                                         | Users sign in again at expiry (acceptable if decided)     |
| Logout security                 | **Q3** logout or revocation                                            | Logout clears only the cookie; a stolen token stays valid |
| Integration testing             | **Q4** stable HTTPS host                                               | No reliable round trip: **blocks release** (§10)          |
| Accurate error mapping          | Q5 declared statuses, **Q6** error codes                               | Status-only mapping (N-1)                                 |
| Abuse protection                | Q7 rate limiting                                                       | No brute-force protection: **blocks release**             |
| Consistent validation           | Q8 password policy, Q9 email handling, Q15 field limits                | UI and backend rules may disagree                         |
| Lifecycle details               | Q10 JWT details, Q11 CORS, Q12 request ID                              | Defaults in the proposal stay                             |
| Recovery, versioning, test data | Q13, Q14, Q16                                                          | Recovery stays on the placeholder; contract drift risk    |

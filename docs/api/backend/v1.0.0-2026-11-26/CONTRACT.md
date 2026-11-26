# Munsit Backend API — captured contract (v1.0.0, 2026-11-26)

> **Status: PROVISIONAL.** This is a capture of the Backend team's development server. It is not an
> agreed production contract (gate D-02). Authentication stays disabled in production
> (`AUTHENTICATION_AVAILABLE = false`).

## 1. Source

| Item       | Value                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------- |
| Base URL   | `https://shiny-journey-5v9w55pjv5qvfp4q5-8000.app.github.dev` (GitHub Codespace, temporary) |
| Swagger UI | `<base>/docs` (HTTP 200 at capture)                                                         |
| OpenAPI    | `<base>/openapi.json`, HTTP 200, `application/json`, 3480 bytes                             |
| Retrieved  | **2026-11-26T20:49:56Z**                                                                    |
| File       | [`openapi.json`](openapi.json), byte-for-byte as retrieved (excluded from Prettier)         |
| SHA-256    | `0286070e39a811ce5e31ee3b520fa7b39a1cb705450a8e0d3440afa4967a0eed`                          |
| Spec       | OpenAPI 3.1.0, `info.title` "Munsit Backend API", `info.version` "1.0.0" (FastAPI)          |

The base URL belongs to a temporary development server. It is recorded for traceability only and
must never be hard-coded in application code.

## 2. Endpoints (exactly as declared)

| Method | Path        | Request                                                         | Declared responses                                | Auth                            |
| ------ | ----------- | --------------------------------------------------------------- | ------------------------------------------------- | ------------------------------- |
| GET    | `/`         | none                                                            | 200 (empty schema)                                | none                            |
| POST   | `/register` | `application/json` `UserCreate` (required)                      | **201** `UserResponse`; 422 `HTTPValidationError` | none                            |
| POST   | `/login`    | **`application/x-www-form-urlencoded`** `Body_login_login_post` | 200 `Token`; 422 `HTTPValidationError`            | none                            |
| GET    | `/me`       | none                                                            | 200 `UserResponse`                                | `OAuth2PasswordBearer` (Bearer) |

There are no `/auth/*` paths, no refresh, logout, password-reset, email-verification or
password-change endpoints.

## 3. Schemas (exactly as declared)

| Schema                  | Fields (required in **bold**)                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserCreate`            | **`full_name`** string · **`email`** string (`format: email`) · **`password`** string. No length or rule constraints declared                                         |
| `UserResponse`          | **`id`** integer · **`full_name`** string · **`email`** string (`format: email`)                                                                                      |
| `Body_login_login_post` | **`username`** string · **`password`** string · `grant_type` string `^password$` or null · `scope` string (default "") · `client_id` / `client_secret` string or null |
| `Token`                 | **`access_token`** string · **`token_type`** string                                                                                                                   |
| `HTTPValidationError`   | `detail`: array of `ValidationError`                                                                                                                                  |
| `ValidationError`       | **`loc`** array of string or integer · **`msg`** string · **`type`** string · `input` · `ctx` object                                                                  |

Security scheme: `OAuth2PasswordBearer`, OAuth2 password flow, `tokenUrl: "login"`, no scopes.

## 4. Observed behaviour (smoke test, 2026-11-26T20:51:03Z)

One disposable account (`munsit-frontend-smoke-<UTC timestamp>@example.com`, full name "Munsit
Frontend Smoke Test", a random password generated in memory and never stored or printed). Nine
requests in total. Sanitized evidence: [`smoke-evidence.json`](smoke-evidence.json) (no password, token,
cookie or full email).

| Step                             | Status               | Body (sanitized)                                                                 |
| -------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| Register, new account            | 201                  | `{ id: int, full_name, email }`; the email matches the request                   |
| Register, same email again       | **400** (undeclared) | `{ detail: "البريد الإلكتروني مسجل بالفعل" }` (a string, not the 422 array)      |
| Register, invalid email          | 422                  | `detail[]`: `loc ["body","email"]`, `type "value_error"`                         |
| Login, correct (form body)       | 200                  | `{ access_token: <181-char JWT, redacted>, token_type: "bearer" }`               |
| Login, wrong password            | **401** (undeclared) | `{ detail: "بيانات الدخول غير صحيحة" }`                                          |
| Login, JSON body instead of form | 422                  | `detail[]`: `username` and `password` "Field required"; JSON is **not** accepted |
| Me, with the bearer token        | 200                  | `{ id: int, full_name, email }`; the same account                                |
| Me, no token                     | **401** (undeclared) | `{ detail: "Not authenticated" }`                                                |
| Me, invalid token                | **401** (undeclared) | `{ detail: "توكن غير صالح" }`                                                    |

Latency was 1.1 to 5.7 s per request (a development Codespace). The test account remains on the
development server's database; the Backend team may delete it.

## 5. Differences from the earlier Backend Pack

**Owner decision (2026-11-26):** the live contract above is the **current working integration
reference**. The two contracts must not be mixed. The earlier pack's details below come from the
owner's review; they will be checked line by line when the original ZIP is placed in the workspace.

| Item               | Earlier Backend Pack (owner-reported) | Live contract (verified 2026-11-26)                                        | Impact       |
| ------------------ | ------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| Register path      | `/api/v1/auth/register`               | `POST /register` (no prefix)                                               | **Breaking** |
| Login path         | `/api/v1/auth/login`                  | `POST /login`                                                              | **Breaking** |
| Login body         | JSON credentials                      | `application/x-www-form-urlencoded`, `username` = email (JSON returns 422) | **Breaking** |
| Name field         | `name`                                | `full_name`                                                                | **Breaking** |
| User ID            | string                                | integer                                                                    | **Breaking** |
| Auth response      | user and token together               | Register 201 → user only; Login 200 → `{ access_token, token_type }` only  | **Breaking** |
| Current user       | (pack: session endpoint)              | `GET /me` with a bearer token                                              | Different    |
| Logout and session | present                               | **absent**                                                                 | **Missing**  |

**ZIP comparison: PENDING.** Field-by-field verification, plus anything else the pack defines, is
completed when the ZIP is available. Nothing from the earlier pack is used in code.

## 6. Gaps against the frontend (for the owner and the Backend team)

| ID   | Gap                                                                                                                                   | Frontend consequence                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| BC-1 | Field naming: `full_name` (API) vs the form's `name`; login uses `username` for the email                                             | The API client maps names; the UI does not change                                                        |
| BC-2 | Undeclared statuses (400 duplicate email, 401 wrong credentials, 401 no or invalid token) and `detail` as a **string** in those cases | The client normalizes both `detail` shapes; it maps 400 duplicate and 401 by status, not by message text |
| BC-3 | Error messages are hard-coded Arabic strings in the backend                                                                           | The UI keeps its own approved copy and never displays backend text                                       |
| BC-4 | No password policy is declared (the UI enforces 8+ characters, upper and lower case, a digit)                                         | Policy alignment is a backend decision (R08-2)                                                           |
| BC-5 | A bearer JWT is returned to the caller; there is no refresh, logout, cookie or expiry information                                     | Needs a server-side session (BFF) before any browser use; no token in browser storage                    |
| BC-6 | No Forgot or Reset endpoints                                                                                                          | The Recovery UI stays on the placeholder adapter                                                         |
| BC-7 | No Register "duplicate email" copy exists in Figma                                                                                    | A product decision is needed before a real 400 can be shown                                              |
| BC-8 | The server is a temporary Codespace                                                                                                   | A stable development URL is needed for integration testing                                               |

## 7. Frontend integration infrastructure (this branch, not wired)

| Piece                                | Role                                                                                                                                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/backend.ts`               | Types transcribed from §3, with the backend's field names                                                                                                                                                                                                                                                        |
| `src/api/backend/client.ts` (+ test) | `createBackendClient({ baseUrl, timeoutMs, fetch })`: `register`, `login` (form-urlencoded), `me` (bearer); timeout; `BackendError` kinds `validation`, `conflict`, `unauthorized`, `rejected`, `server`, `network`, `timeout`, `unexpected`; no backend message text exposed; `cache: "no-store"`, no redirects |
| `src/config/backend.ts` (+ test)     | Server-only `MUNSIT_API_BASE_URL` / `MUNSIT_API_TIMEOUT_MS`; `null` when unset; refuses to run in a browser                                                                                                                                                                                                      |

**Not done, on purpose (owner decisions first):**

- No screen uses the client. Login and Register keep the placeholder adapter, and
  `AUTHENTICATION_AVAILABLE` stays `false`.
- **Session architecture (BFF):** the browser must not hold the bearer token. The proposed shape is
  a set of server route handlers or server actions that call this client, keep the token in an
  `HttpOnly`, `Secure`, `SameSite=Lax` cookie (or a server session), and return only the user.
  This needs:
  - the token lifetime and refresh or logout behaviour from the backend (BC-5);
  - a stable backend URL (BC-8);
  - the duplicate-email copy (BC-7);
  - owner approval of the session design (gate D-02).

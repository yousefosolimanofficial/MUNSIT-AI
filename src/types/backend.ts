/*
 * Munsit Backend API types, transcribed from the captured OpenAPI document
 * (docs/api/backend/v1.0.0-2026-11-26/openapi.json, SHA-256 0286070e…0eed; PROVISIONAL, gate D-02).
 * Field names are the backend's, unchanged. Do not add fields that the document does not declare.
 */

/** `UserCreate`: body of `POST /register` (`application/json`). */
export interface BackendUserCreate {
  readonly full_name: string;
  /** `format: email`. */
  readonly email: string;
  readonly password: string;
}

/** `UserResponse`: `POST /register` 201 and `GET /me` 200. */
export interface BackendUserResponse {
  readonly id: number;
  readonly full_name: string;
  readonly email: string;
}

/**
 * `Body_login_login_post`: body of `POST /login` (`application/x-www-form-urlencoded`, OAuth2
 * password form). `username` carries the email. Optional OAuth2 fields are omitted by the client.
 */
export interface BackendLoginForm {
  readonly username: string;
  readonly password: string;
}

/** `Token`: `POST /login` 200. The access token is a bearer JWT; it must never reach browser storage. */
export interface BackendToken {
  readonly access_token: string;
  readonly token_type: string;
}

/** `ValidationError`: one item of a 422 `detail`. */
export interface BackendValidationError {
  readonly loc: readonly (string | number)[];
  readonly msg: string;
  readonly type: string;
}

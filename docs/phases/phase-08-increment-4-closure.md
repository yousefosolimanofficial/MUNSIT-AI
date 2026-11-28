# Phase 08 — Increment 4 (Forgot and Reset Password) — closure record

- **Status:** COMPLETE — "UI-complete, not functional".
- **Plan row:** [phase-08-plan.md](phase-08-plan.md) §8, Increment 4.
- **Implementation:** Eng. Mariam, offline Recovery delivery v1, integrated by Yousef through PR #86.
- **Production:** unchanged. `AUTHENTICATION_AVAILABLE = false`; `/forgot-password`, `/reset-password`
  and their `/en` variants return 404 in production.

## 1. Scope delivered

- **Screens:** Forgot Password (6 states) and Reset Password (11 states: 8 form states and the
  Invalid link, Expired link and Updated views).
- **Previews:** `/dev/auth/forgot-password` and `/dev/auth/reset-password`. They are
  development-only and return 404 in production.
- **Adapter:** both forms use the fail-closed placeholder adapter and always end with "unavailable".
- **Not included:**
  - backend endpoints;
  - reset-token handling (RC-4: the page reads nothing from the URL);
  - a working resend action (RC-3).

## 2. Delivery and integration

| Item            | Value                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Package         | `munsit-delivery-auth-recovery-20261127-v1.zip`, SHA-256 `84df1393e4e113318746b35ff0850f17d5761217c9472d9ac6f5562e5aa5f27a` |
| Patch           | `delivery.patch`, SHA-256 `848974e7a42f6f98a55af2b123af39cf8a002ead66536c9420c41a0240212292`                                |
| Baseline        | `c5a0290`                                                                                                                   |
| Delivery commit | `6aa37bf`: exactly the 17 delegated files, byte-identical to the package's `files/`                                         |
| Main merged in  | `d5e2789`: Register and the Increment 3 docs; no conflicts                                                                  |
| Integration     | `af39d36` (gap, exports, shared E2E); `f9f25fb` (`design-values.md` §17.7)                                                  |

**Integration fixes in `af39d36`:**

- **Reset form:** the Reset Fields gap is 14 px, as drawn in Figma.
- **Recovery E2E:** the card-height assertions now use the Figma values directly, without the +4
  compensation.
- **Shared E2E:** the 8 outdated placeholder expectations are fixed, and the 4 preview routes are
  warmed in the global setup.
- **Exports:** `@/features/auth` exports the Recovery forms, screens, types and schemas.

**Scope of the change:** no Login or Register behaviour, shared, design-system, config or dependency
file changed.

## 3. Owner visual approval (2026-11-28)

**Review package:** `munsit-recovery-visual-review-v1.zip`.

- 31 Reset form images were retaken from the integrated code.
- 34 of Mariam's images were reused unchanged: all Forgot states and the Reset result views.

**Measured Reset card heights:**

- **Arabic at 1440 and 768:** equal to Figma (Default, Shown and Loading 434; Required 486;
  Mismatch 460; Error 510).

**Accepted differences:**

- **Natural text wrapping:**
  - at 390, the Reset description and the rules row wrap (+49);
  - in English, the rules row wraps at 480;
  - two bodies break one word earlier at 480.
- **Password rules (RC-5):** they stay Neutral while the field is empty.
- **Resend link (RC-3):** "إعادة إرسال الرابط" is shown but inactive.
- **Reset Fields gap:** 14 px.

**Kept decisions:** RC-1, RC-3, RC-4 and RC-5 ([design-values.md](../design-values.md) §17.7).

The approval is recorded on PR #86.

## 4. Verification and merge evidence

| Item                           | Value                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Local `corepack pnpm check`    | Exit 0. Typecheck and lint pass, with no dependency violations; Prettier is clean; 60 test files and 1466 tests pass; build compiles |
| Local `corepack pnpm test:e2e` | 1264 passed, 1 skipped (existing WebKit skip), 0 failed                                                                              |
| Local `test:e2e:prod`          | 29 passed; the 4 Recovery routes return 404 in production, render no Auth UI and are not indexable                                   |
| Reviewed head                  | `f9f25fb`; CI run 46155277388: `check` and `e2e` green                                                                               |
| After the review               | `af39d36..f9f25fb` changes only `docs/design-values.md`; no implementation change                                                    |
| Merge                          | Squash, pinned to `f9f25fb`: `main` at `3ea0122` (2026-11-28)                                                                        |
| Post-merge CI                  | Run 46168746602 on `3ea0122`: `check` and `e2e` green                                                                                |
| Production after merge         | `AUTHENTICATION_AVAILABLE = false`; no gate changed                                                                                  |

## 5. Remaining for Phase 08

- **Increment 5 (Verification):**
  - route-protection contract review (no guard code);
  - visual baselines, axe and keyboard checks;
  - flow-navigation E2E;
  - a check that the production 404 still holds;
  - the Phase 08 closure report.
- **Cross-browser coverage:** Recovery, like Login and Register, is covered in Chromium only.
- **Backend contract:** PR #84 stays a draft, outside Phase 08 implementation.

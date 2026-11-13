# Feature Delivery & Acceptance Checklist

Process and details: [TEAM_COLLABORATION.md](TEAM_COLLABORATION.md).

## A. Before sending (Mariam)

- [ ] Built from the starter package; `DELIVERY.md` states the full baseline commit hash
- [ ] Only assigned module(s) changed; `files/` keeps exact repo-relative paths
- [ ] Manifest lists every added / modified / deleted file with its purpose
- [ ] Shared, config, route and dependency needs are in the **requests** table, not in `files/`
- [ ] No new packages installed; `package.json` and `pnpm-lock.yaml` unchanged
- [ ] Real results recorded for `typecheck`, `lint`, `format:check`, `test`, `build`
- [ ] Screenshots at 1440 / 768 / 390 in RTL (and LTR if supported)
- [ ] Known limitations and anything NOT VERIFIED against Figma written down
- [ ] Package contains no `node_modules`, `.next`, caches, test output, `.env` files or credentials

## B. Intake (Yousef)

- [ ] Baseline commit exists and matches a logged starter package
- [ ] Package structure complete (`DELIVERY.md`, `files/` or `delivery.patch`, `screenshots/`)
- [ ] No excluded content or secrets in the package
- [ ] Changed paths are inside the assigned module(s), or listed as requests

## C. Integration and verification (Yousef)

- [ ] `delivery/<module>-v<n>` branched from the baseline commit
- [ ] Applied by patch or listed files only — never unzipped over the project
- [ ] `git status` matches the manifest exactly
- [ ] Rebased / merged onto current `main`; conflicts resolved on the branch
- [ ] `corepack pnpm check` passes (typecheck, lint + boundaries, format, unit tests, build)
- [ ] `corepack pnpm test:e2e` passes when routes or UI changed
- [ ] Responsive 1440 / 768 / 390, no overflow at 320
- [ ] RTL / LTR correct; logo not mirrored; numerals stay LTR
- [ ] Keyboard pass: visible focus, Esc closes overlays, focus trap in dialogs/sheets
- [ ] Visual match with Figma and the Design System Reference; no invented values
- [ ] Shared components reused, not duplicated; no architecture changes

## D. Decision

- [ ] **Rejected:** written reasons returned to Mariam; branch deleted; delivery log updated
- [ ] **Accepted:** branch pushed, PR opened with the template, merged through branch rules;
      merge commit recorded in the delivery log

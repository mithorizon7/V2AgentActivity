# Full site production-readiness audit and hardening Checklist

Source of truth checklist for a large/intense task.

## Metadata
- Created: 2026-03-06T15:42:37
- Last Updated: 2026-03-06T15:55:03-0500
- Workspace: /Users/davedxn/Downloads/V2AgentActivity
- Checklist Doc: /Users/davedxn/Downloads/V2AgentActivity/docs/full-site-production-readiness-audit-and-hardening-production-checklist.md

## Scope
- [x] Q-000 [status:verified] Capture explicit scope, constraints, and success criteria for comprehensive production-readiness hardening.
  - Evidence: User requested full-site audit/hardening/security/edge-case pass, including regressions and production readiness.
  - Success Criteria: no critical regressions found unresolved; core API hardening in place; final validations rerun after last code edit; residual risks documented.

## Sign-off Gate
- [x] G-001 [status:verified] All queued work, findings, fixes, and validations are complete.
- [x] G-002 [status:verified] All findings are resolved or marked `accepted_risk` with rationale and owner.
- [x] G-003 [status:verified] Required validation suite has been rerun on the final code state.
- [x] G-004 [status:verified] Residual risks and follow-ups are documented.

## Rerun Matrix
- [x] G-010 [status:verified] If code changes after any checked `V-*`, reset affected validation items to unchecked.
- [x] G-011 [status:verified] Final sign-off only after a full validation pass completed after the last code edit.

## Audit Queue
- [x] Q-001 [status:verified] Create checklist and baseline scope.
- [x] Q-002 [status:verified] Complete discovery/audit across backend routes, runtime engine, frontend hooks, localization keys, and dependency posture.
- [x] Q-003 [status:verified] Implement hardening and correctness fixes for discovered issues.
- [x] Q-004 [status:verified] Add/expand repeatable validation coverage via API smoke matrix and localization integrity scan scripts.
- [x] Q-005 [status:verified] Run full validation suite on final code state.
- [x] Q-006 [status:verified] Final code-quality pass and sign-off review.

## Findings Log
- [x] F-001 [status:verified] [P1] [confidence:0.98] Server startup failed in some environments due `reusePort` unsupported (`ENOTSUP`) when listening.
  - Evidence: Reproduced startup failure before fix; `server/index.ts` had `reusePort: true` in `server.listen` path.
  - Owner: codex
  - Linked Fix: P-001
- [x] F-002 [status:verified] [P1] [confidence:0.97] `POST /api/simulate` accepted nonexistent sessions and returned `200`, bypassing session integrity.
  - Evidence: Smoke test showed `simulate_missing_session_status=200` before fix; route lacked early session existence guard.
  - Owner: codex
  - Linked Fix: P-002
- [x] F-003 [status:verified] [P2] [confidence:0.94] Simulation accepted block IDs whose `kind` did not match required process slot (e.g., planning block in perception slot).
  - Evidence: Route previously validated only block presence, not block-kind/process alignment.
  - Owner: codex
  - Linked Fix: P-003
- [x] F-004 [status:verified] [P2] [confidence:0.99] Runtime emitted misleading `END_*` success log entries after non-throwing block failures (`current.success=false`).
  - Evidence: Smoke test with `missingTool` produced `success=false` but still emitted `END_EXECUTION` success step before fix.
  - Owner: codex
  - Linked Fix: P-004
- [x] F-005 [status:verified] [P2] [confidence:0.96] Boundary/circuit APIs accepted malformed graphs (dangling references, duplicates/self-loop cases) and persisted invalid state.
  - Evidence: Prior route logic had no referential integrity checks for `elementId`, `from`, `to`, or duplicate IDs.
  - Owner: codex
  - Linked Fix: P-005
- [x] F-006 [status:verified] [P2] [confidence:0.93] Session ID and transport hardening gaps: weaker ID generation plus creation over GET.
  - Evidence: Pre-hardening route generated session IDs via timestamp/random substring and client used GET for side-effecting create.
  - Owner: codex
  - Linked Fix: P-006
- [x] F-007 [status:verified] [P3] [confidence:0.95] Missing localization key `classification.sortAllItems` caused fallback/missing-key behavior for incomplete submissions.
  - Evidence: i18n key integrity scan reported missing key in `client/src/components/ClassificationActivity.tsx`.
  - Owner: codex
  - Linked Fix: P-007

## Fix Log
- [x] P-001 [status:verified] Removed unsupported `reusePort`, added API 404 fallback, and hardened express baseline/security headers and parser limits.
  - Addresses: F-001
  - Evidence: `server/index.ts` updates; startup smoke now serves on API port without ENOTSUP.
- [x] P-002 [status:verified] Enforced session existence check before simulation execution.
  - Addresses: F-002
  - Evidence: `server/routes.ts` simulation handler now returns 404 for missing session; smoke: `simulate_missing_session_status=404`.
- [x] P-003 [status:verified] Added process-slot/block-kind mismatch validation in simulation route.
  - Addresses: F-003
  - Evidence: `server/routes.ts` now returns 400 with `mismatchedBlocks` for invalid process-slot mapping.
- [x] P-004 [status:verified] Updated runtime loop to halt on non-throwing failure and skip misleading `END_*` success log emission.
  - Addresses: F-004
  - Evidence: `shared/runtime/engine.ts` checks `current.success === false` after `block.run`; smoke now reports `END_EXECUTION` count `0` when missing tool failure occurs.
- [x] P-005 [status:verified] Added boundary/circuit graph integrity validation (duplicates, dangling refs, self-loop checks).
  - Addresses: F-005
  - Evidence: `server/routes.ts` graph validators return 400 with detailed errors for invalid maps/circuits; smoke reproduced both boundary and circuit rejections.
- [x] P-006 [status:verified] Hardened session handling with strict schema reuse, UUID-based IDs, and POST session creation (GET retained for compatibility).
  - Addresses: F-006
  - Evidence: `shared/schema.ts`, `server/routes.ts`, `client/src/hooks/useSession.ts`; smoke confirmed UUID-style session IDs and POST create success.
- [x] P-007 [status:verified] Added missing `classification.sortAllItems` translations across EN/RU/LV.
  - Addresses: F-007
  - Evidence: Locale files updated; i18n integrity scan now reports `missing_i18n_keys=0`.

## Validation Log
- [x] V-001 [status:verified] `npm run check`
  - Evidence: 2026-03-06 15:54 EST passed (`tsc` clean on final code state).
- [x] V-002 [status:verified] `npm run build`
  - Evidence: 2026-03-06 15:54 EST passed (Vite/esbuild succeeded; known non-blocking warnings: PostCSS `from` warning and large chunk warning).
- [x] V-003 [status:verified] `npm audit --omit=dev --audit-level=moderate`
  - Evidence: 2026-03-06 15:50 EST passed (`found 0 vulnerabilities` in production dependency set).
- [x] V-004 [status:verified] API smoke matrix (`tsx server/index.ts` + `curl` checks for create/progress/simulate/boundary/circuit edge paths)
  - Evidence: 2026-03-06 15:52 EST passed (`simulate_missing_session_status=404`, kind mismatch `400`, missing-tool run `success=false` with no `END_EXECUTION`, dangling graph submissions `400`).
- [x] V-005 [status:verified] Localization integrity scan (extracted `t()/i18n.t()` keys vs EN keyset)
  - Evidence: 2026-03-06 15:54 EST passed (`missing_i18n_keys=0` after locale patch).

## Residual Risks
- [x] R-001 [status:accepted_risk] Dev dependency vulnerabilities remain in full `npm audit` output and require major-version upgrades (not production runtime path).
  - Rationale: `npm audit --json` reports moderate issues tied to `vite`/`drizzle-kit` upgrade tracks; production audit is clean. Major upgrades should be handled in a dedicated upgrade cycle with regression testing.
  - Owner: repository maintainers
  - Follow-up trigger/date: Next dependency modernization sprint (target: 2026-03-31).
- [x] R-002 [status:accepted_risk] No formal unit/integration test suite exists (`npm test`/`npm run lint` scripts are absent), so current confidence relies on static checks and smoke coverage.
  - Rationale: Existing project scripts provide type/build checks only. This audit added repeatable smoke/scan evidence but not a full automated test harness.
  - Owner: repository maintainers
  - Follow-up trigger/date: Introduce baseline test runner and API integration tests before broader feature expansion (target: 2026-04-15).
- [x] R-003 [status:accepted_risk] Frontend bundle size warning remains (`~868kB` main JS chunk), which can impact initial load on low-bandwidth devices.
  - Rationale: Build currently succeeds and functionality is intact; chunking optimization is non-blocking for this hardening pass but should be addressed for performance readiness.
  - Owner: frontend maintainers
  - Follow-up trigger/date: Performance optimization pass (target: 2026-04-15).

## Change Log
- 2026-03-06T15:42:37: Checklist initialized.
- 2026-03-06T15:46:00-0500: Baseline hardening landed (`server/index.ts`, `shared/schema.ts`, `server/routes.ts`, `client/src/hooks/useSession.ts`) and initial production audit checks completed.
- 2026-03-06T15:52:00-0500: Deep audit findings reproduced; simulation/session/graph integrity and runtime log correctness fixes implemented.
- 2026-03-06T15:54:00-0500: Localization key-gap fixed and final validation suite rerun on final code state.
- 2026-03-06T15:55:03-0500: Gates reviewed, residual risks documented, checklist finalized for sign-off.

# Onboarding tutorial redesign for learner fluency Checklist

Source of truth checklist for a large/intense task.

## Metadata
- Created: 2026-03-06T15:23:11
- Last Updated: 2026-03-06T15:38:00
- Workspace: /Users/davedxn/Downloads/V2AgentActivity
- Checklist Doc: /Users/davedxn/Downloads/V2AgentActivity/docs/onboarding-tutorial-redesign-for-learner-fluency-production-checklist.md

## Scope
- [x] Q-000 [status:verified] Capture explicit scope, constraints, and success criteria.
  - Scope: Improve first-session learnability and guidance in the core learner flow without changing runtime/scenario behavior.
  - Success criteria: users can see current objective, cannot bypass core learning milestones, and get proactive completion guidance in high-friction phases.
  - Constraints: no edits in `shared/runtime/` or `shared/scenarios/health-coach/`.

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
- [x] Q-002 [status:verified] Complete discovery/audit of impacted systems.
- [x] Q-003 [status:verified] Implement required changes.
- [x] Q-004 [status:accepted_risk] Expand or update automated tests.
- [x] Q-005 [status:verified] Run full validation suite.
- [x] Q-006 [status:verified] Final code-quality pass and sign-off review.

## Findings Log
- [x] F-001 [status:verified] [P1] [confidence:0.97] Core phases could be bypassed before required learning actions were completed (bottom navigation and top stepper).
  - Evidence: phase progression now gated in `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx` at lines 348-363, 1315-1319, 1376-1379, 1504-1517, 1520-1524, and top stepper click handling at 970-975.
  - Owner: codex
  - Linked Fix: P-001
- [x] F-002 [status:verified] [P2] [confidence:0.92] Boundary mapping guidance was reactive-only and missing translated process labels in validation feedback.
  - Evidence: validation now centralized in `evaluateBoundaryRequirements` (`/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:95-135, 570-637) and process names are translated before rendering missing-process feedback.
  - Owner: codex
  - Linked Fix: P-002
- [x] F-003 [status:verified] [P2] [confidence:0.90] Learners lacked persistent orientation to current objective and path-to-value across stages.
  - Evidence: new journey guide card and progress tracker added at `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:963-1004 with stage-specific objective/next-action derivation at 803-885.
  - Owner: codex
  - Linked Fix: P-003
- [x] F-004 [status:verified] [P2] [confidence:0.90] Boundary requirements checklist would be stale without live canvas state updates.
  - Evidence: added optional `onChange` callback in `/Users/davedxn/Downloads/V2AgentActivity/client/src/components/BoundaryMapCanvas.tsx`:36-48 and 175-177; wired in `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:1290-1295.
  - Owner: codex
  - Linked Fix: P-004
- [x] F-005 [status:verified] [P2] [confidence:0.90] Locked phases in the stepper were visually clickable, creating affordance mismatch even when guarded in callback logic.
  - Evidence: `PhaseProgress` now supports `enabled` and disabled button state in `/Users/davedxn/Downloads/V2AgentActivity/client/src/components/PhaseProgress.tsx`:5-12 and 27-43; `enabled` wiring set in `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:365-405.
  - Owner: codex
  - Linked Fix: P-005

## Fix Log
- [x] P-001 [status:verified] Gate phase progression on actual completion milestones in phases 2, 3, and 4.
  - Addresses: F-001
  - Evidence: `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:1315-1319, 1376-1379, 1504-1517, 1520-1524.
- [x] P-002 [status:verified] Centralize boundary requirement evaluation and apply translated process labels for missing-core-process feedback.
  - Addresses: F-002
  - Evidence: `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:95-135, 570-609.
- [x] P-003 [status:verified] Add persistent onboarding guide block with current-stage objective, next action, and first-success progress tracking.
  - Addresses: F-003
  - Evidence: `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:803-885, 963-1004.
- [x] P-004 [status:verified] Add live boundary checklist with canvas-driven updates and clear stale-feedback behavior.
  - Addresses: F-004
  - Evidence: `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:631-637, 1266-1288, 1290-1295; `/Users/davedxn/Downloads/V2AgentActivity/client/src/components/BoundaryMapCanvas.tsx`:36-48, 175-177.
- [x] P-005 [status:verified] Add explicit phase-access gating + disabled locked-step visuals in phase progress navigation.
  - Addresses: F-005
  - Evidence: `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx`:348-405 and 970-975; `/Users/davedxn/Downloads/V2AgentActivity/client/src/components/PhaseProgress.tsx`:27-43.

## Validation Log
- [x] V-001 [status:verified] `npm run check`
  - Evidence: 2026-03-06 15:38 EST, pass (`tsc` clean).
- [x] V-002 [status:verified] `npm run build`
  - Evidence: 2026-03-06 15:38 EST, pass (vite + esbuild completed; non-blocking warnings only).
- [x] V-003 [status:verified] Manual state-flow verification by code inspection for onboarding gates and action prerequisites.
  - Evidence: 2026-03-06 15:38 EST, pass; reviewed phase 2/3/4 gating plus stepper-access control in `/Users/davedxn/Downloads/V2AgentActivity/client/src/pages/LearningPage.tsx` and `/Users/davedxn/Downloads/V2AgentActivity/client/src/components/PhaseProgress.tsx`.
- [x] V-004 [status:accepted_risk] Automated unit/e2e coverage not available in project scripts.
  - Evidence: 2026-03-06 15:31 EST + fail (command unavailable; accepted risk); `package.json` has no `test`/`lint` scripts.

## Residual Risks
- [x] R-001 [status:accepted_risk] Build warns about large client chunk and PostCSS plugin metadata warning.
  - Rationale: not introduced by this change set; does not block functionality but can affect performance/asset transforms.
  - Owner: frontend maintainer
  - Follow-up trigger/date: next performance/asset pipeline pass.
- [x] R-002 [status:accepted_risk] No automated regression suite currently validates learner flows end-to-end.
  - Rationale: manual + type/build validation passed, but flow regressions may reappear without tests.
  - Owner: engineering
  - Follow-up trigger/date: when test harness is introduced.

## Change Log
- 2026-03-06T15:23:11: Checklist initialized.
- 2026-03-06T15:27:00: Discovery complete; onboarding friction findings logged.
- 2026-03-06T15:31:00: Implemented onboarding interventions, reran validations, and completed sign-off.
- 2026-03-06T15:38:00: Follow-up deep pass fixed phase-stepper bypass/affordance issues and reran validation suite.

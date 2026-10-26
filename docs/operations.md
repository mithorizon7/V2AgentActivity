# Operations Runbook

Application: AgentFoundation, `https://HorizonAgentBuilder.replit.app`.
Replit project: `ea6b4183-b003-4ed6-9ca7-381a605a832d`.
Repository: `mithorizon7/V2AgentActivity`. Release evidence and outstanding provider-wide scope remain in `security-audit-2026-10-22.md`.

## Health And Alerts

- `GET /api/health` returns `200 {"status":"ok"}` only when the deployed session schema can be queried; failure or shutdown returns generic `503 {"status":"unavailable"}` with `Retry-After: 5`. No session token is needed or returned. Responses are `no-store`.
- Database probes read no learner records and make no writes. Concurrent probes share one query; success and failure are cached for five seconds per process. Existing pool connection/query deadlines bound the database operation. The shared API rate limiter still applies; this endpoint is not an unbounded load-test interface.
- An explicit `application ready after ...ms` log follows successful initialization/listening. Readiness queries log only state transitions, not private error details. A homepage `200` alone does not prove database health.
- Replit Publishing's **uptime email notifications** and **Monitoring alerts** are the native operational controls. Uptime-setting changes require publishing. Keep **Auto-fix OFF**: it can create unreviewed changes and incur usage costs. Do not run paid scans or change hosting resources as part of routine checks.
- After a reported outage, check the homepage and health endpoint once, then inspect the corresponding UTC startup/readiness/API logs and current build. Distinguish startup probes from actual request failures. Avoid repeated refreshes, stress tests or restarts that erase useful evidence.
- `429` means a request limit; `503` may also indicate exhausted session capacity or unavailable storage. Check the route and `Retry-After`. Limits use socket IP without trusting forwarded headers; proxy-shared limits and provider-edge protection remain hosting considerations.

## Data And Recovery

- Production uses its separate shared PostgreSQL database, never an implicit memory fallback. Active session capacity is 2,048; progress expires after 24 hours without an update. Consent controls browser persistence of the capability, not indefinite server retention. This is a learning tool, not a permanent records archive.
- October 26 readback: production PITR **ON, seven-day window**. Daily snapshots were enabled with **seven-day retention**. Their inventory initially reports **No backups yet**; the first successful snapshot is not claimed. [Provider recovery documentation](https://docs.replit.com/features/data-and-storage/data-recovery) describes scheduling near midnight at the browser's current UTC offset, separate from PITR. Current provider documentation discounts database storage by 100%; no plan/tier upgrade was made. Recheck pricing before extending retention.
- The exposed restore tools target production in place. No isolated target/clone or non-destructive production restore drill was verified. Do not click Restore merely to test backups. Ask Replit for an isolated recovery target before a drill; restrict access and avoid exporting learner records or secrets.
- For a real incident, preserve UTC evidence and the current release identity first. Confirm the recovery point and acceptable data-loss window with the operator. Restore database state only with explicit incident-specific approval, then separately select/redeploy compatible safe application code. Database restoration does not restore app code.
- Never select **Copy your development database to production database** in routine publishing. It overwrites production state. Never run test fixture cleanup, schema-push commands or development seed scripts against production.

## Release And Rollback

1. Work on a `codex/` branch and use the strict required `validate` pull-request check, including real PostgreSQL tests. Never bypass branch protection.
2. Validate typecheck, build, security/storage/schema/readiness/browser regressions and both full and production dependency audits after the last source edit. A past clean audit is not a current scan.
3. Synchronize reviewed application/configuration source to the identified Replit project. Preserve unrelated agent state; do not copy secrets or development data. Use the existing Autoscale resources and production database.
4. Publish with the checksum-verified packaged Node runtime and production-only locked dependencies. Keep production-data copying OFF. Record source/build identities and UTC promotion time.
5. Verify the public health response, restrictive security headers and actual Node/OpenSSL startup logs. Exercise one owned synthetic session through classification, boundary/circuit saves, normal/failing simulation and rehydration. Never print capability tokens or learner data into reports.
6. Verify the same synthetic record survives the real release. Compare served artifact hashes to the prepared build and check browser warnings/errors. Do not create a test-only production deployment.
7. Prefer rolling forward. A rollback candidate must retain patched runtimes/dependencies and current session/security protections. Do not restore a known-vulnerable artifact, re-enable arbitrary progress upserts or revert to volatile production storage. Source rollback and database restoration are separate, approval-gated operations.

## Verification Limits

Human learners are explicitly deferred by the operator. Automated checks do not establish human comprehension, accessibility across every assistive technology, real touch behavior, long-duration load performance, notification delivery during an actual outage, a tested production restore, or provider-internal infrastructure/incident attestation. These limits do not justify fabricating an application defect or claiming exhaustive safety. Reassess before a larger learner rollout or after a meaningful code, hosting, database, pricing or provider-security change.

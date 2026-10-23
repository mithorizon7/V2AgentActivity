# AgentFoundation: security release and verification

## Source and Preservation

The canonical repository is `mithorizon7/V2AgentActivity`. PR #1 merged the
reviewed security source through required CI to main
`bc6f410cbb874b2fb6409ae2969151a68e4b587c` on October 22, 2026.
Replit preserves its publication history and unrelated local state; retained
local agent-memory files are excluded from deployment and were not copied into
the canonical repository. Protected health-coach scenarios/runtime are unchanged.

The Replit GitHub OAuth connection could not push the security workflow change.
No additional OAuth scope was granted and no workflow was dropped. The verified
source-only patch was reviewed locally and pushed through existing authorized
SSH access, then merged without bypassing the required check. The earlier patch
download/push handoff is complete; do not repeat it or broaden OAuth permissions.

## Production Release

App: `AgentFoundation`, Repl `ea6b4183-b003-4ed6-9ca7-381a605a832d`.
Public site: https://HorizonAgentBuilder.replit.app.

On October 23, the user authorized finishing deployment after the production
database billing gate was explained. Existing public Autoscale resource settings
were preserved. Publishing created a separate production database with copying
of development/test data OFF and successfully promoted the declared schema.
Read-only production catalogs confirm `agent_learning_sessions`, its valid
updated-at index, and both timestamp-with-time-zone columns. No learner rows
were queried by that inspection.

Initial security publication succeeded at 18:33:26 UTC:

- Replit build: `3971a52c-1fa9-40d1-a919-75bfe80412f3`.
- Publication commit: `28309396b4e793188263fd3a0f44cda6a0bf221c`.
- Served client SHA-256:
  `050186330bde189a70a76dc86956ffdf2aa4ab8701ef55d71200fdfe7e489fe2`.

Eight bounded hosted API checks passed using one owned synthetic session:
security headers, request-method/origin guards, bearer-only private progress,
disabled full-record upsert, rejected invalid input, concurrent activity saves,
correct simulation success/failure status, and complete progress rehydration.
No rate/capacity stress tests ran against production. English entry, Russian
and Latvian primer feedback, completion and saved next-step restoration passed
in a real browser.

## Mobile Follow-up

Hosted mobile inspection found Latvian example navigation extending to 490px
in a 390px viewport. A 320px check also found Russian footer overflow and long
guided-practice prompt labels. PR #13 corrects these with wrapping/stacked
controls and mobile copyright flow, preserving learning behavior and security.
The rendered regression test covers all three locales. Final release evidence
is recorded in the authoritative security audit checklist.

An extra deployment solely for restart testing was rejected by safety review,
and explicit approval was requested. Do not bypass that rejection. The real
mobile correction is a separate requested fix; once authorized and released,
its traffic switch can also establish whether the pre-existing owned synthetic
progress survives a new revision, without an additional test-only deployment.

## Runtime and Storage Safeguards

- Replit's Node 24 module supplied 24.13.0, so the bootstrap verifies the official
  Linux x64 Node 24.22.1 archive before extraction. The build packages its actual
  validated executable; production starts that runtime and enforces the patch
  minimum. Unsupported architectures or checksum failures stop.
- Clean locked installations disable lifecycle scripts. Production builds prune
  development dependencies. No application or database secret is embedded in
  the client or published evidence.
- Remote PostgreSQL connections require TLS and certificate verification;
  connection-string parameters cannot disable it. The exact platform-local
  Helium endpoint has a narrowly scoped Replit-only non-TLS exception.
- Production refuses implicit in-memory fallback. Startup validates the existing
  schema without DDL. Publishing owns production schema promotion; test schema
  preparation targets isolated databases only.
- Sessions use hashed bearer lookup, 24-hour inactivity expiry, bounded capacity
  and connection pools, atomic independent-score merges and graceful shutdown.
- Consent wording in English, Russian and Latvian discloses server processing,
  local persistence and expiry. No account-based identity is claimed.

## Evidence and Limits

Final source CI covers typecheck/build, the security/storage/platform/retry/layout
suite, and two real-PostgreSQL cross-process/concurrency/expiry suites. Production
and full npm audits refreshed October 23 both report zero vulnerabilities.
GitHub withdrew GHSA-vfj7-8cjw-p6xm that day as not practically exploitable; the
earlier five high build-only entries are historical, not suppressed findings.

Public TLS certificate validation and served artifact identity are verified.
Replit logs show the configured production start script was invoked; its
packaged runtime was verified as Node 24.22.1 / OpenSSL 3.5.9. This is not direct
backend process or image attestation. Provider kernel/backport state, HTTP/3
termination, historical incident logs, backup/network policies and platform-
injected process settings remain explicit coverage gaps. Initial promotion logs
included transient readiness failures before later passing hosted requests;
their internal cause was not exposed. No universal safety claim is made.

Build warnings remain for a PostCSS plugin missing its `from` option and client
bundle size. These do not prevent the tested build and are not evidence of a
new exploitable vulnerability.

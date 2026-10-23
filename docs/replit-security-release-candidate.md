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

The completed follow-up promoted October 23 at 19:17:23 UTC:

- Reviewed source: `98a7d32d313edb9dc746372bb79e5a6ea477aaa7`.
- Prepared commit: `c5ce2716f1fbd88491ede6859a013f86a35f678e`.
- Publication: `710ad9446572f2e8afc820de0735ddba5f6eb0d3`.
- Build: `0bbd3185-3ce8-48cc-bc38-56c430a8a22e`.
- Served JavaScript SHA-256:
  `fcc58a9c51025e5d3f865a1d7751b1963746c1ba6f0e2775d59045660d7ca933`.

The actual process startup log confirms Node 24.22.1 / OpenSSL 3.5.9. Production
session schema remains unchanged. All owned pre-release activity data, scores,
history and timestamps survived the new deployment exactly; a fresh eight-check
hosted smoke passed. Deployed homepage/example layouts fit all three locales at
actual 320/390/768px widths. No browser warnings/errors were observed.

An extra deployment solely for restart testing was rejected by safety review,
and explicit approval was requested. Do not bypass that rejection. The real
mobile/runtime correction was a separately requested real fix release. Its
traffic switch established persistence of the pre-existing owned synthetic
progress without an additional test-only deployment. No rejection was bypassed.

## Runtime and Storage Safeguards

- Production always verifies the source-pinned official Linux x64 Node 24.22.1
  archive, even if Replit provides a compliant host runtime. Replit's subsequent
  Nix 24.22.1 update lacked independently verifiable store provenance; version
  equality alone is not artifact equality. The build packages the verified
  executable and production starts it. Development may use a compliant installed
  runtime. Unsupported production architectures or checksum failures stop.
- Production build/start clear inherited Node loaders, module paths, custom CA
  selection, OpenSSL configuration paths and TLS bypass overrides. Database TLS
  verification remains enforced. Private startup logs report only actual Node
  and OpenSSL versions, never environment values or credentials.
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

Final source CI 40009400356 passed typecheck/build, all 32 security/storage/
platform/retry/layout tests, and two real-PostgreSQL cross-process/concurrency/
expiry tests. The real clean Replit production build and runtime/trust checks
also passed. Production
and full npm audits refreshed October 23 both report zero vulnerabilities.
GitHub withdrew GHSA-vfj7-8cjw-p6xm that day as not practically exploitable; the
earlier five high build-only entries are historical, not suppressed findings.

Public TLS certificate validation and served artifact identity are verified.
Replit logs confirm the direct-shell start script and actual application process
versions. The official packaged binary is independently identified by SHA-256
`e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb`.
This is not complete provider process/image attestation. Provider kernel/backport state, HTTP/3
termination, historical incident logs, backup/network policies and platform-
injected process settings remain explicit coverage gaps. Initial promotion logs
included ten pre-promotion readiness failures ending before the process startup
line; none continued in the observed 19:17:24-19:19:09 UTC window. Their internal
cause was not exposed. This bounded observation does not guarantee long-term
availability, real-device/touch behavior or load capacity. No universal safety
claim is made.

Build warnings remain for a PostCSS plugin missing its `from` option and client
bundle size. These do not prevent the tested build and are not evidence of a
new exploitable vulnerability.

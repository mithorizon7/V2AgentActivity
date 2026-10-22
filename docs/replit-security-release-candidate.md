# AgentFoundation: unpublished security release candidate

## Source and preservation

The reviewed source is mithorizon7/V2AgentActivity,
branch codex/security-audit-2026-10-22, commit
9797ffe439491a2e90018a1aa88397371e8743d9.
It is merged into the local main history without resetting publication commits
or discarding the existing Python module. The application content, translations,
health-coach scenarios, and protected runtime behavior match the reviewed source.
The integration is prepared on codex/replit-security-integration for review.
GitHub main is not modified, and no publish is performed.
The updated review adds localized session-retry feedback and refreshed audit
evidence. The previously validated Replit portability changes are retained.

### Review delivery status

The push to the requested GitHub integration branch was rejected because the
current OAuth App lacks `workflow` scope for the retained security CI change.
No branch was created remotely and no main ref was pushed. The local branch
retains both the reviewed release and publication history. Do not drop the
workflow or force-push to bypass this restriction.

A source-only patch is exported under
generated-artifacts/replit-security-integration.patch (not committed).
It is generated from the reviewed base 9797ffe439491a2e90018a1aa88397371e8743d9
to this integration branch, and contains only tracked text changes, not runtime
archives, binaries, credentials, generated test output, or private evidence.
Download that single file from the Replit Files pane. In a clean clone:

```sh
git switch -c codex/replit-security-integration 9797ffe439491a2e90018a1aa88397371e8743d9
git apply --check /path/to/replit-security-integration.patch
git apply --index /path/to/replit-security-integration.patch
git diff --cached
```

This patch recreates the candidate's tracked source tree for review, not its
merge history. To preserve the exact history, grant the GitHub OAuth connection
the required workflow permission and push the existing local branch as-is;
do not reconstruct main from the patch.

## Replit-specific adaptations

- The platform Node 24 module actually supplies 24.13.0. Replit's nvm shim also
  selects the major module rather than installing the requested patch.
- Development/build bootstrap uses the official Linux x64 Node 24.22.1 archive,
  verified against a source-pinned SHA-256 checksum before extraction/execution.
  The production build copies its actual Node executable into dist; start uses
  that packaged runtime. Unsupported architectures or verification failures stop.
- Installation retains engine enforcement and disables lifecycle scripts. The
  production build removes development dependencies after compilation.
- The exact Replit-local Helium endpoint is permitted without TLS only inside
  Replit. Remote hosts still require TLS with certificate verification, regardless
  of connection-string SSL parameters.
- The session table and expiry index are declared in the Drizzle schema and were
  created additively in the existing development database. Startup validates the
  schema and expires old records, but performs no DDL. Production schema changes
  remain owned by Replit's Publish flow. CI prepares only its isolated test DB.
- Missing database configuration or failed database initialization stops
  production startup. No implicit memory fallback is used. The reviewed explicit
  ephemeral-mode opt-in remains available to isolated security tests.

## Verified locally

- Node 24.22.1, OpenSSL 3.5.9; the packaged executable passes the runtime gate.
- Clean locked installation with lifecycle scripts disabled.
- TypeScript check and production build passed.
- Security/storage/platform/session-retry suite: 26 tests passed, none skipped.
  The actual session hook is rendered with isolated service fixtures to verify
  creation retry, progress refetch without clearing saved work, unchanged 404
  recovery, healthy sessions, and privacy/retry wording in all three locales.
- Real development PostgreSQL suite: 2 tests passed, none skipped. Checks include
  independent pools, concurrent score merges, reconnection, hashed session keys,
  expiry/non-revival, and persistence across real process exits with concurrent
  separate-process writers. Tests delete only their own temporary session rows.
- Separate clean production-only installation: 12 HTTP security tests passed,
  without development tooling.
- Production dependency audit: zero vulnerabilities.
- Full dependency audit: five high-severity build-tool entries remain in the
  reviewed Tailwind 3 chain (tailwindcss, chokidar, fast-glob, micromatch, braces).
  This is not a clean full audit; no unrelated Tailwind major migration was made.
- English, Russian, and Latvian consent wording all disclose browser persistence,
  server processing of answers/scores, 24-hour inactivity expiry, and avoidance
  of personal/sensitive information. These translations match the reviewed commit.
- Development workflow runs successfully and the homepage/consent UI renders.

## Production blocker and publish handoff

The read-only production SQL service reports: "This project has no production
database." Secret metadata nevertheless reports DATABASE_URL present; presence
is not connection/schema verification. No credential values were retrieved or
displayed. Production database availability is therefore NOT verified.

Before the coordinated publish, open the existing app's Publishing settings
and enable "Create production database." Review promotion of the development
session schema, but do not choose to copy current development data or replace
production data with test data.
If the expected schema/database is unavailable, this candidate fails closed.

The existing public Autoscale deployment is unchanged. Its runtime and source
must not be inferred from this candidate. After the operator authorizes Publish,
verify the actual hosted build/runtime, promoted schema, security headers,
locales, and persistence through hosted instance changes before signing off.

Build warnings remain for a PostCSS plugin missing its `from` option and the
client bundle size; neither prevented the checked build.

# Security Audit: October 22, 2026

Repository remediation and verification record. Production sign-off remains withheld where access or provider evidence is missing.
Baseline: March 6 and March 10 audit records; existing uncommitted fixes preserved on `codex/security-audit-2026-10-22`.

## Scope

- [x] Q-000 [status:verified] Read request and prior audits; preserve current work.
  - Evidence: local branch and protected pre-edit patch in `/private/tmp/v2agent-security-2026-10-22` (directory 0700, files 0600).

## Audit Queue

- [x] Q-001 [status:verified] Inspect package metadata and compromise indicators before executing project code.
  - Evidence: isolated system Python `-I -S` static inspection, 635 lock entries, 695 installed manifests; no inspected LiteLLM indicators or non-npm artifact sources. Historical exposure not excluded.
- [x] Q-002 [status:verified] Refresh primary advisories; establish delivery and infrastructure coverage and gaps below.
- [x] Q-003 [status:verified] Correct locally repairable application and dependency weaknesses; retain the unresolved upstream advisory explicitly.
- [x] Q-004 [status:verified] Validate final changes under a verified patched runtime; rescan resolved dependencies.
- [x] Q-005 [status:verified] Document applicability, deployment steps, incident-response actions, and gaps.

## Sign-off Gate

- [ ] G-001 [status:in_progress] Finish authorized release, deployment and final evidence.
- [x] G-002 [status:verified] Remaining deployment and account actions have explicit owners and verification steps below.
- [ ] G-003 [status:in_progress] Rerun checks after database-backed persistence and release edits.
- [ ] G-004 [status:blocked] Verify deployed runtimes, provider infrastructure and deployment history before production sign-off.
  - Owner: application maintainer and Replit; verify AgentFoundation deployment and provider evidence.

## Authorized Completion

- [ ] Q-006 [status:in_progress] Complete approved shared-runtime updates, commit/push, live CI and branch protection.
- [ ] Q-007 [status:in_progress] Use Replit to synchronize the reviewed release, connect existing PostgreSQL storage and verify the published app.
- [ ] Q-008 [status:in_progress] Verify database concurrency/restart behavior and browser-level learner flows after final edits.

The user authorized completion and explicitly requested working with Replit. The repository homepage identified `AgentFoundation` at `https://replit.com/@mithorizon7/AgentFoundation`, Repl `ea6b4183-b003-4ed6-9ca7-381a605a832d`, serving `https://HorizonAgentBuilder.replit.app`. Replit confirmed the Git remote and learning features. Its checkout was at `fce07c88a82903184627703dc359956223601bfc`, behind GitHub main with a content-empty publication commit. Its workspace used Node 20.20.0 and per-process MemStorage despite DATABASE_URL being configured in development and production. The read-only Replit inspection auto-added a Python module; preserve unrelated changes when synchronizing. No secret value was requested.

## Rerun Matrix

- [x] G-010 [status:verified] Reset affected validations when code changes; rerun them before local sign-off.
- [x] G-011 [status:verified] Production sign-off requires actual deployed evidence, separate from successful local checks.

## Prior Work Reused

March API session existence, block-kind alignment, graph reference checks, request size limits, and UUID creation remain present by source inspection. Existing client hydration/localization changes remain uncommitted and are preserved. Prior onboarding and translation redesign is out of this security pass. March dependency/audit results and production claims are not current evidence.

## Findings Log

- [x] F-001 [status:verified] [P1] [confidence:1.0] Local Node 22.12.0 predates October fixes; `.replit` selects unsupported Node 20.
  - Evidence: binary path, `.replit`, Node October 21 advisory. Official Node 24.22.1 macOS arm64 archive hash verified before execution.
  - Owner: application maintainer for repository configuration; device/hosting operators for installed runtimes.
- [x] F-002 [status:verified] [P1] [confidence:1.0] Public progress upsert permits caller-chosen sessions, arbitrary scores, and overwriting existing progress without checking issued-session ownership.
  - Evidence: `POST /api/progress` directly calls `saveProgress` with the full client record.
  - Owner: application maintainer.
- [x] F-003 [status:verified] [P2] [confidence:1.0] API response logging can disclose session bearer IDs and learner text in development; no rate or session-retention bounds.
  - Evidence: `server/index.ts`, `server/storage.ts`, GET session creation alias.
  - Owner: application maintainer.

## Access Gaps

- Railway connector: UNAUTHORIZED, reauthentication required. No Railway association with this project established.
- Replit search: no `V2AgentActivity` match. An `AgenticPathway` result predates this repository and is not assumed to be the same app.
- Remote running runtime, trust stores, digests, database policies, build history, edge HTTP/3, host kernel and provider audit logs remain unverified.

## Urgent Results and Scope

No credible evidence of active compromise was found in inspected artifacts. This is not a finding that historical exposure or compromise is excluded. The initial audit made local changes only; the subsequently authorized completion and deployment work is recorded separately below.

After authorization, the verified official Node 24.22.1 archive was installed in nvm and selected as the default; Node 22.12.0 was preserved for rollback, not selected. Homebrew Python was upgraded through its supported path from 3.13.0_1 to 3.13.17, including its CA, OpenSSL and other required dependencies. Validation used an isolated official Node archive, SHA-256 `89c682593d76cd44233fa53b1563264e7de9cbb189cad169135c5b4fadfbc0a7`. No suspect Python environment or pip was started; initial static inspection used `/usr/bin/python3 -I -S` to bypass site startup hooks.

Checks began October 22 at 16:45 UTC (12:45 EDT). Primary incident guidance was refreshed during the run. The March dependency result was superseded: the current initial npm audit reported 27 affected entries (1 critical, 16 high, 8 moderate, 2 low).

## Asset Inventory

| Asset | Current evidence | Remaining coverage |
| --- | --- | --- |
| Public GitHub repository | `mithorizon7/V2AgentActivity`; remote main still `f4512a5cb2fecc8745ffab5145317a19533555b6`; existing local work preserved | New changes are not on remote main |
| Delivery configuration | Replit autoscale, npm build/start, Node module, PostgreSQL 16 module, Nix channel `stable-24_05` | Actual app identity, running instances, runtime patch, base digest and OS package backports unavailable |
| App | React 18 SPA, Express 4 JSON API, Zod validation; deterministic health-coach simulation | No LLM calls, gateway, arbitrary tool execution, webhooks, upload handlers or application SQL calls found in reachable code |
| Data | `MemStorage` holds anonymous learner sessions in one process; database schema/config exists but is not wired into runtime storage | Actual provisioned PostgreSQL exposure, roles, backup and RLS settings unknown |
| Sessions | Issued UUID bearer capabilities; browser persists ID only with consent; no account authentication | Possession of a session ID grants access. No separate tenant identity or login is claimed |
| Build/install | npm lock v3; 558 unique resolved package/version pairs after fixes; registry-only artifact sources | Old persistent remote caches and installation records inaccessible |
| Local host | macOS 26.6.2 / Darwin 25.6.0 arm64; shared pip metadata 24.2 | OS/background trust-update status and other apps require device-owner verification |
| CI | GitHub API returned zero Actions runs, no main protection and no rulesets | Local pinned, read-only CI workflow prepared; enabling required checks/protection remains an account change |
| Other environments | No Dockerfile, devcontainer, GitLab CI, Bun/Python/Java/.NET workspace, worker or scheduled-job definition found | This does not exclude those technologies inside managed hosting or separate supporting services |

## Compromise Precheck and Secrets

Static inspection covered the root manifest, lockfile, 695 installed package manifests before reinstall, project environment folders, relevant Python metadata locations, dependency history and loader markers. No LiteLLM distribution, `cook.pth`, `cook.py`, suspicious project `sitecustomize.py`, or `/tmp/remote_code_loader.lock` was observed. All 635 original lock entries used npm registry sources. Lifecycle scripts were inspected; all subsequent npm installs explicitly disabled scripts. The old installed tree differed from the lock; clean `npm ci` replaced it reproducibly.

An initial redacted pattern scan inspected 1,384 historical blobs. Gitleaks 8.30.1 then scanned all local Git history and the working directory, returning zero findings. Its official release archive was verified against the GitHub release artifact digest `b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5` before execution. An initial empty HTTP redirect download failed checksum verification and was not executed; the verified download followed HTTPS redirects.

Protected evidence, pre-edit patch, redacted scanner reports, dependency history, npm/OSV results and SBOM are in `/private/tmp/v2agent-security-2026-10-22`, outside Git. Root permissions are 0700; report files are 0600. This directory is temporary: preserve it in approved incident storage if needed for a longer investigation. No private source or credentials were uploaded to a scanning service. npm and OSV received public package names/versions only.

No accessible deployment/cloud/gateway logs established LiteLLM historical exposure or absence. The requested PHP exploitation review from October 17, and IAM/CloudTrail, provider usage/billing, gateway-response, coding-agent-session and remote image-history reviews could not be completed. Log retention for those systems is unknown.

## Fix Log

- [x] P-001 [status:verified] Enforce the patched Node line, update affected package resolution and isolate build tooling from production.
  - Addresses: F-001. Evidence: version pins, guards, lockfile, production-only installation, npm/OSV and runtime trust checks.
- [x] P-002 [status:verified] Remove full progress upsert; retain activity validation and move private progress reads to the Authorization header.
  - Addresses: F-002. Evidence: built API regression tests for refused writes, bearer reads, duplicate/unknown classification IDs and graphs.
- [x] P-003 [status:verified] Sanitize logs/errors; restrict request methods/origins/hosts/upgrades; bound request, rate and storage resources.
  - Addresses: F-003. Evidence: API, Host/CORS, storage expiry/capacity tests and sanitized-log assertions.

All application remediations below are verified locally, with deployment pending. Severity describes the issue; exposure is assessed separately.

| Priority / advisory | Affected asset / original version | Exposure and evidence | Remediation / status / owner |
| --- | --- | --- | --- |
| P1: Node October release | Local 22.12.0; configured Replit Node 20 | Runtime predates fixes; deployed binary unknown | Pin files, engine constraint, fail-closed dev/build/start guard, Replit Node 24 selector. Validated 24.22.1. Shared installation/provider still need operator action. [Vendor](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) |
| Critical dependency: CVE-2026-90711 | `proxy-addr` 2.0.7 | Requires affected proxy-trust subnet configuration; app does not enable proxy trust | Updated to 2.0.8; forwarded IPs remain untrusted. Local fix. [Advisory](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) |
| P1: Vite traversal/dev exposure | Vite 5.4.21 | Development previously allowed every Host; production startup also imported build tooling | Vite 7.3.7 + React plugin 5.2; explicit dev Host and WebSocket Origin restrictions; Vite imported lazily in development. Production-only install runs without it. [Advisory](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) |
| High dependency: ws | `ws` 8.18.0 | No app WebSocket API; development HMR/build dependencies use WebSockets | Updated to 8.22.0. [Memory exhaustion](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) |
| High dependency: ORM | `drizzle-orm` 0.39.1 | SQL identifier escaping flaw; no reachable SQL query path found | Updated to 0.45.4; removed unused `drizzle-zod` adapter to retain Zod 3 compatibility. No database push/migration performed. [Maintainer advisory](https://github.com/drizzle-team/drizzle-orm/security/advisories/GHSA-gpj5-g38j-94v9) |
| P1: arbitrary progress upsert | `POST /api/progress` | Could mint chosen keys and inject scores; known session IDs could be overwritten | Endpoint now 405; updates come through validated activity APIs. Local fix / application maintainer |
| P2: credential/content logging | Progress IDs in URL and development response bodies | Session IDs are bearer capabilities; learner explanations appeared in debug payloads | Progress reads use Authorization header; old URL route removed; logs contain route template/status/timing only. Local fix / application maintainer |
| P2: unbounded resource consumption | Session map, graph arrays, explanations, request lifetime | Anonymous callers could retain unlimited sessions or oversized aggregate data | Bounded arrays/text/coordinates; 128 KiB body ceiling; compressed API bodies rejected; rate limits; 24h idle session expiry; 2,048-session capacity; HTTP timeouts. Tests cover refusal without evicting active learners |
| P2: request/error controls | State-changing GET, form submissions, parser errors | Browser-triggered writes and excessive parser details | POST-only creation; custom same-origin request header; cross-site writes denied; generic errors; production CSP/HSTS and security headers. Local fix |
| P2: CI control gap | Remote main unprotected, zero rulesets/runs | No evidence of compromise; no enforced gate on sensitive source changes | Read-only workflow and pinned official actions prepared locally; Dependabot config added. Operator must enable protection and verify first CI run |
| High unresolved: CVE-2026-93687 | `braces` 3.0.3 through Tailwind 3.4.19 | Fixed project content globs only; no HTTP-to-glob input path found; upstream has no patch | Full audit retains five high entries (`braces`, `chokidar`, `fast-glob`, `micromatch`, `tailwindcss`). Compile-only animation plugin moved to dev so these are absent from production-only install. Build maintainer: monitor upstream or separately validate a Tailwind 4 migration. [Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) |
| Shared-tool trust compromise risk | pip 24.2, bundled CA set | Static certificate inspection found the compromised emSign G3 root in pip's actual bundle | Affected; not executed or modified. Device owner must bootstrap patched pip through the vendor's pinned wheel/hash. [Python guidance](https://discuss.python.org/t/information-for-python-users-regarding-emudhra-emsign-ca-certificate-security-incident/109576) |

Compatible updates also resolved the current npm findings for Babel, body-parser, brace-expansion, browserslist, lodash, nanoid, path-to-regexp, picomatch, PostCSS, postcss-selector-parser, qs, source-map-js, yaml and old esbuild loader copies. The existing lockfile was retained and updated; no forced audit fix or blanket major migration was used. Vite and ORM changes were specifically required by applicable advisories.

## Mandatory Baseline Applicability

“Not applicable” below is limited to the inspected repository. Managed infrastructure remains explicitly unverified where there is no inventory/attestation.

| Baseline | Repository/local assessment | Delivery assessment and exact closing evidence |
| --- | --- | --- |
| A: PHP CVE-2026-109618 / 109619 | Not applicable to inspected Node-only application; no PHP runtime/vendor payload identified | Unverified provider/appliances. Obtain actual runtime and vendor product matrix; PHP fixes 8.2.35/8.3.36/8.4.27/8.5.12 released Oct 21, 13:30 UTC. Review available history from Oct 17. [CERT-EU](https://cert.europa.eu/publications/security-advisories/2026-018), [AWS history](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/), [AWS bulletin](https://aws.amazon.com/security/security-bulletins/2026-143-aws/), [PAN product assessment](https://security.paloaltonetworks.com/CVE-2026-109618) |
| B: Node, all ten October issues | Affected original 22.12.0; local project remediation validated under 24.22.1 | Remediated locally, deployment pending. Record running `process.version`, linked libraries, effective CA stores and artifact identity per environment. See detailed table below. [Release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases), [support lines](https://nodejs.org/en/about/previous-releases) |
| C: Bun 1.4.4 | Not applicable: no Bun binary on PATH, lockfile, executable or build command in project | Unverified bundled/remote tooling. Official release page fetched with curl after browser fetch failed; broad network/TLS/HTTP3 summary does not independently establish emSign or QPACK fixes. Require explicit vendor confirmation if Bun is found. [Release](https://bun.com/blog/bun-v1.4.4) |
| D: Railway incident | Association unverified; repository points to Replit. Railway connector returned reauthentication required | Reconnect and match project/environment before acting. At status update Oct 22 17:00 UTC, Pro/Enterprise builds available; Hobby/Free/Trial restoration still pending. API/project tokens predating incident invalidated; third-party and registry secrets require separate action. [Disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st), [status](https://status.railway.com/) |
| E: LiteLLM 1.107.0 | Not applicable to current inspected application dependencies; no local indicators found; historical exposure unverified | Obtain pull/install logs and digests, including floating tags. Vendor wheel window Oct 21 11:39:51–13:23 UTC; Docker Hub 11:46:56–14:20; GHCR removed by 13:51. Compromised main index `sha256:1bbcb1443bc962e45f5aad53fe3d2c30600e0379715fb6c664cdd3ac126c339e`. Vendor currently recommends 1.106.2; this excludes that malware, not unrelated vulnerabilities. [Vendor](https://docs.litellm.ai/blog/security-incident-oct-21-2026), [StepSecurity](https://www.stepsecurity.io/blog/litellm-1-107-0-compromised-pypi-backdoored-wheels-credential-stealer), [Wiz](https://www.wiz.io/blog/litellm-compromised-steals-credentials) |
| F: eMudhra/emSign | Patched Node default/bundled stores checked: 118 roots, no compromised G3; no extra CA roots. Shared pip bundle still affected | Unverified deployed/custom/system stores. Obtain effective stores, not package names alone; Python guidance recommends pip 26.2.2, uv 0.13.4, certifi 2026.10.19. [Python](https://discuss.python.org/t/information-for-python-users-regarding-emudhra-emsign-ca-certificate-security-incident/109576), [uv](https://github.com/astral-sh/uv/security/advisories/GHSA-hq85-5cpj-mr62), [certifi](https://github.com/certifi/python-certifi/security/advisories/GHSA-6q48-6c7w-9gw2) |
| G: GitLab CVE-2026-110264 and release set | Not applicable to observed GitHub remote/CI definitions | Unverified separate supporting services/runners. If present, match exact branch to vendor patch and required upgrade stops. GitLab.com patching is not runner verification. [Full release](https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-5-1-released/) |
| H: Oracle CVE-2026-91403 / October CPU | Not applicable to inspected JS project; no Java/Graal/Oracle component identified | Unverified bundled JDK/services; obtain distribution/version and its vendor fixes. [Alert](https://www.oracle.com/security-alerts/alert-cve-2026-91403.html), [CPU index](https://www.oracle.com/security-alerts/) |
| I: BIND / Unbound | Not applicable to application; system/provider DNS not inspected | Obtain resolver inventory. BIND CVE-2026-19630/94300/96888/97313: vendor branch matrix; Unbound CVE-2026-97206/50106/96405/109125/35501: verify 1.26.2/vendor backport. [ISC](https://kb.isc.org/docs/aa-00913), [NLnet Labs](https://nlnetlabs.nl/projects/unbound/download/) |
| J: Cisco, Splunk, Fortinet | No products identified in project inventory | Unverified network/security infrastructure. Assess complete Oct 21 Cisco set (Snort 3, Expressway, UC, IOS XR, Secure Client), SOAR SVD-2026-1010/1011/1012; verify actual FortiOS/FortiManager/FortiAnalyzer hardening firmware and recent FortiMail/FortiAuthenticator fixes. This is separate from PHP impact and older Smart Install checks. [Cisco set](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-notice-QGwHnJ6k), [Splunk](https://advisory.splunk.com/), [Fortinet](https://www.fortinet.com/blog/ciso-collective/fortinet-releases-security-hardening-release-for-multiple-products) |
| K: Header Accordions/QPACK | Not applicable to Node HTTP/1 listener; no app QUIC library | Unverified CDN/edge termination. Obtain provider attestation and library/version or vendor-supported mitigation; do not infer all HTTP3 is affected. [Original research](https://foxio.io/blog/header-accordions-qpack-amplification-attacks-against-http-3-servers) |
| L: Linux PwnEscape / Atlassian / BeyondTrust | Linux issue not applicable to local macOS host; no corresponding app components | Provider kernel, backport/reboot state and appliances unverified. CVE-2026-99999, Atlassian Oct 20 set and CVE-2026-102764/BT26-05 need owner inventory and evidence. [Red Hat](https://access.redhat.com/security/cve/cve-2026-99999), [Atlassian](https://confluence.atlassian.com/security/security-bulletin-october-20-2026-1874690162.html), [BeyondTrust](https://www.beyondtrust.com/trust-center/security-advisories/bt26-05) |
| M: Cloud Shell CVE-2026-85267 / WebSockets | No Cloud Shell integration found. Own development upgrades now restrict Host/Origin; Vite token checks retained | Google records mitigation July 28 and no customer action; no blanket Google token rotation is indicated. Historical usage remains unknown. [Google release notes](https://docs.cloud.google.com/shell/docs/release-notes) |
| N: broader tools/OS/devices | Native/optional npm dependencies included in lock scan; no .NET, browser automation, Electron or RingRTC dependency in project | OS, browsers, Codex/Electron, MCP services and database hosts require owners' version/trust evidence. Local macOS 26.6.2 predates listed 26.7.1 update; no OS change made. CVE-2026-113380 record returned no usable NVD detail; no Signal/RingRTC inventory established. [Apple](https://support.apple.com/en-us/100100), [Chrome](https://chromereleases.googleblog.com/), [Mozilla](https://www.mozilla.org/en-US/security/advisories/), [Red Hat erratum](https://access.redhat.com/errata/RHSA-2026:86594), [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-113380) |

### Node October Issue Coverage

All rows use the October 21 vendor advisory; 24.22.1 was the selected fixed release. Applicability to 22.12.0 is distinct from demonstrated exploitability.

| CVE | Original local applicability / observed prerequisites |
| --- | --- |
| 2026-105482 | Affected 22.x DNS NUL handling; no app attacker-controlled resolver input found |
| 2026-105483 | Vendor lists 24/26, not original 22.x; selected 24 runtime includes fix |
| 2026-106069 | Affected TLS hostname handling; relevant to outbound tooling |
| 2026-111497 | Affected Brotli decoder; no Brotli app path found; compressed API requests now refused |
| 2026-105481 | Affected keep-alive client handling; no demonstrated app exploitation |
| 2026-106072 | Affected certificate validation; patched tooling runtime used |
| 2026-106074 | Affected entropy caches in snapshots/SEA; project creates neither |
| 2026-106070 | Vendor lists 26 only; not applicable to selected 24 runtime |
| 2026-106071 | Vendor lists 26 only; not applicable to selected 24 runtime |
| 2026-106073 | Affected permission-model bypass; project does not enable that model |

### Advisory Cross-checks and Dates

npm's current GitHub advisories were cross-checked against OSV's batch API using all 558 unique resolved versions: OSV returned one advisory, GHSA-vfj7-8cjw-p6xm, for braces 3.0.3. Five npm entries describe this same vulnerable dependency chain. No absence-of-CVE claim is used as evidence of safety.

CISA's catalog web page returned 403, so the official JSON feed was retrieved instead. It reported release `2026-10-21T14:04:39.8983Z`, 1,754 entries. Of the incident baseline CVEs, CVE-2026-102764 was present, added October 16. PHP publication/patch on October 21 and the reported October 17 exploitation attempt are separate dates. Node patches/publication were October 21; the emSign advisories were October 20. The remaining baseline entries were not in that catalog snapshot; that is not proof of safety. [Official feed](https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json)

## Application Review Coverage

Manual route/schema/storage review and source searches covered authorization boundaries, JSON parsing, graph references, simulation block allowlists, static serving, outbound requests, command execution, HTML sinks, environment use and logging. Dynamic tests exercised the actual built HTTP server. No standalone Semgrep/container scanner was available; no container manifests or runtime/container inventory was available to scan. This is a coverage gap, not a clean container result.

Classification, graph and simulation APIs require an issued session to mutate stored data. Anonymous UUID IDs are capabilities, not account identities. Learner-facing grades are educational feedback, not tamper-proof academic records. React escapes learner labels/explanations; the remaining HTML sinks use bundled, fixed translation content, with no user-controlled source identified. No shell execution, arbitrary URL fetch, upload/deserialization handler, admin endpoint or external webhook was found in reachable application code. Health-coach tools are fixed in-memory simulations. Auth/DB scaffold does not establish a live authentication or database/RLS implementation.

Request limits are per process, using socket IP and bounded limiter state. Behind a shared proxy, users can share limits; horizontally scaled deployments require provider-edge limits and capacity monitoring. The session store remains volatile: restarts lose data, and Replit autoscaling may route a session to a different process. No durable/multi-instance production claim is made. Operator must choose a durable store or validate a single-instance teaching deployment before rollout.

## Validation Log

- [x] V-001 [status:verified] Final typecheck and production build passed October 22 after the last server edit, under Node 24.22.1.
  - Evidence: 2026-10-22 PASS, `npm run check`, `npm run build`; Vite 7.3.7 and esbuild completed. Existing PostCSS and size warnings remain.
- [x] V-002 [status:verified] Final security/storage regression suite passed: 14 tests, zero failures.
  - Evidence: 2026-10-22 PASS, `npm run test:security`; includes development Host validation and 2,048-session capacity.
- [x] V-003 [status:verified] Production dependency scan: zero advisories; full dependency scan: five high build-tool entries, retained in R-001.
  - Evidence: 2026-10-22 PASS production scan, FAIL full scan with five retained advisories; private `npm-audit-production-final.json`, `npm-audit-final.json` and exposure analysis above.
- [x] V-004 [status:verified] OSV matched all 558 exact versions; CISA checked all 27 baseline/Node issue CVEs; SBOM produced.
  - Evidence: 2026-10-22 PASS inventory matching, with unresolved advisory retained; private batch request/results and official KEV JSON, plus `sbom.cdx.json`.
- [x] V-005 [status:verified] Gitleaks 8.30.1 redacted history and working-directory scans returned zero findings.
  - Evidence: 2026-10-22 PASS, 168 commits inspected; private Gitleaks reports, artifact digest verification; no source uploaded.
- [x] V-006 [status:verified] Built API passed 11 tests in a separate production-only installation with no Vite or braces installed.
  - Evidence: 2026-10-22 PASS, `SECURITY_TEST_APP_ROOT` targets private `production-install`; the test runner remains outside that installation.
- [x] V-007 [status:verified] Development raw HTTP requests: approved Host 200, foreign Host 403, foreign Origin no CORS permission.
  - Evidence: 2026-10-22 PASS, `node:http` smoke, preserving the Host header. Initial fetch-based Host probe was inconclusive because fetch can rewrite Host; it is not used as proof of a post-upgrade Vite flaw.

Use a trusted Node 24.22.1+ 24.x runtime first; no global tools were replaced by this audit.

```sh
nvm install
nvm use
node scripts/check-runtime.mjs
npm ci --ignore-scripts
npm run check
npm run build
npm run test:security
npm audit --omit=dev --audit-level=low
npm audit
```

The final full audit is expected to exit nonzero while the five build-tool entries remain. Do not disable or falsify that result. npm 11.19.1 / Node 24.22.1 / OpenSSL 3.5.9 were used. A CycloneDX SBOM was generated with `npm sbom --sbom-format cyclonedx --package-lock-only`. Private audit evidence includes exact package versions and advisory URLs. The `.npmrc` disables lifecycle scripts; native/optional esbuild artifacts worked from published platform packages without running installers.

The suite launches a temporary local server; do not point this rate/capacity test suite at production. A second clean installation with `npm ci --omit=dev --ignore-scripts` ran the built API tests without Vite or braces installed. Production CSP, cache/response headers, request guards, graph validation, simulation persistence and error status, rate limiting, and sensitive-log exclusion were exercised. Storage tests cover expiry and capacity refusal. Type/build and final test counts are recorded below after the last source edit. PostCSS `from` and main-chunk-size warnings persist; those warnings are not classified as newly demonstrated vulnerabilities.

Scanner reproduction, using verified binaries and a protected evidence directory:

```sh
AUDIT_EVIDENCE=/private/tmp/v2agent-security-2026-10-22
GITLEAKS_BIN="$AUDIT_EVIDENCE/gitleaks-tool/gitleaks"
"$GITLEAKS_BIN" git . --log-opts=--all --redact=100 --report-format=json --report-path="$AUDIT_EVIDENCE/gitleaks-history.json"
"$GITLEAKS_BIN" dir . --redact=100 --report-format=json --report-path="$AUDIT_EVIDENCE/gitleaks-working-tree.json"
curl --fail --proto '=https' -H 'Content-Type: application/json' --data-binary @"$AUDIT_EVIDENCE/osv-query.json" https://api.osv.dev/v1/querybatch
```

## Production / Delivery Checklist

Owner: project operator, with hosting/database administrators for their assets. These steps are prepared, not performed.

1. Identify the actual Replit app/service, public domain, repository source/ref, all environments, previews and active older deployments. Capture build/deployment IDs, running Node versions, base-image digests, effective CA overrides and OS/kernel/backport evidence. Reconnect Railway only if associated with this project; inspect environment names and credential identifiers without exporting values.
2. Review this branch together with the preserved March edits. Merge/publish only after local review and the first GitHub CI run. In GitHub Settings > Rules > Rulesets, target main, require pull requests and the `validate` status check, block force pushes/deletion, and restrict bypass. This changes account policy and is not enabled automatically.
3. Resolve the memory/autoscale decision above. Record exact provider limits, persistence/session routing and test a learner across instances and a restart. Do not declare saved progress durable from this implementation.
4. Set build and runtime Node to 24.22.1+ on the 24 line, including package installation and CI action/runner runtimes. A Replit `nodejs-24` selector alone is not exact-version evidence. If the provider cannot supply the patch, prepare a verified pinned Node distribution/base before publishing; the project guard intentionally refuses older versions.
5. Rebuild without old install/image-layer caches from this lock using `npm ci --ignore-scripts`; run checks/build/tests in the build stage, and ship `dist/` with production-only dependencies. Do not run `db:push`; no migration is required for these fixes.
6. Publish client and API together with operator approval. Existing API consumers must adopt `X-Requested-With: AgentLearning` on writes and `Authorization: Bearer <session ID>` on `GET /api/progress`; full progress upsert and GET session creation are intentionally removed. Tell open-browser users to reload. Review restart-related learner data loss before rollout.
7. Verify actual running version/digest and effective trust stores in every environment after restart. Check the real HTTPS site's CSP/HSTS/no-store headers, no dev endpoints, one fresh anonymous learning flow, supported locales, and sanitized logs. Record deployment IDs and results in this report. Obtain provider evidence for HTTP3 termination and host kernel remediation, rather than inferring it from the app build.
8. Monitor 4xx/429/503, capacity and startup failures. For rollback, retain the prior artifact/route configuration for review, but do not restore vulnerable runtimes/dependencies or re-enable arbitrary upsert/GET creation. If no verified safe rollback artifact exists, use the provider maintenance response while rolling forward to a corrected candidate. Preserve logs and learner-state evidence before any restart/traffic switch.

## Credential / Incident Response Checklist

No credential rotations are authorized or performed by this audit. No exposed credential identifier was found in the repository scans.

If Railway is confirmed in scope: inventory every production/staging/preview secret and its issuing service, permissions and consumers. Create replacement Railway API/project tokens, reinstall them in each integration, separately revoke/replace third-party database/provider/private-registry credentials, verify old credentials fail, pick up new bucket credentials, reconnect GitHub where required, and restart/redeploy consumers when the relevant tier allows. Verify live consumers actually use replacements and review provider access/usage/billing logs. [Railway credential reset guide](https://blog.railway.com/p/security-disclosure-recommendation-redeploy-buckets-and-reconnect-github-after-the-credential-reset)

If LiteLLM exposure is established: preserve wheel/container hashes, UTC pull/install records and gateway/coding-agent logs with restricted access. Do not start suspect Python/pip or run/delete malware. Isolate affected workload/network access with operator approval; assess all reachable cloud, provider, database, registry, GitHub CLI OAuth, master/virtual keys and temporary/session credentials. From a clean environment, revoke and coordinate replacements with other projects' owners; inspect AWS role identity/model/IAM activity and provider billing. Rebuild/reimage from trusted artifacts without contaminated caches. Removing a package or changing an environment value is not complete incident recovery. Never put replacement credentials on a suspect host.

## Separate Device / Account / Network Actions

Owner: device/account/network administrators; no system-wide change was made.

- Shared pip 24.2: follow the Python guidance's verified direct-wheel bootstrap. The published pip 26.2.2 wheel hash is `fd7f4dfa8190e014013b9f08f3e973f4e4c26ffd179a204895533a7254813a70`. Inspect the target environment for compromise before starting it, verify the artifact through a trusted channel, then follow the vendor's exact command. Inventory and update each pip bundle/venv; standalone certifi does not repair pip's vendored CA set. uv and certifi, if used elsewhere, require their own fixes.
- Update the shared Node installation and reopen shells/tools that retain the old path. Review OS Software Update, browser updates and Codex/other Electron runtimes against vendor advisories; macOS 26.6.2 is behind the listed 26.7.1 maintenance update. Do not treat an OS update as proof that bundled trust stores changed.
- Obtain supporting GitLab/JDK, DNS resolver, network/security appliance and Linux provider inventory; apply vendor-specific branch/backport/firmware guidance and verify reboot/livepatch state. Do not apply blanket Bluetooth instructions or blanket Google token revocation without relevant evidence.
- Verify coding-agent/MCP gateway routing and response logging configuration with the account administrator. No gateway is configured in this app, but external coding-session routing/history is not established by the repository. Redact credential values during review.

Python's pinned bootstrap command, only after the target environment has been established clean and the device owner authorizes it:

```sh
python -m pip install 'pip @ https://files.pythonhosted.org/packages/3f/06/3e4420302363fbb71be3c7f35ce042f54bfca330e3e66b3a2e3c4cca579f/pip-26.2.2-py3-none-any.whl#sha256=fd7f4dfa8190e014013b9f08f3e973f4e4c26ffd179a204895533a7254813a70'
```

For Homebrew's externally managed Python, use its supported package upgrade path (`brew update`, then `brew upgrade python@3.13`) and recheck the installed/vendored versions; do not bypass externally-managed safeguards with a forced global pip install. A clean separate environment is an alternative, not proof that the old shared installation was repaired.

## Residual Risks

- [x] R-001 [status:accepted_risk] Upstream braces advisory remains high in build dependencies; no patched version exists (registry/advisory rechecked during completion). Owner: build maintainer. It is absent from the production-only install and receives only repository-controlled build globs. CI runs with read-only permissions and no persisted checkout credential; untrusted dependency changes require review. Do not claim a zero-vulnerability full tree. A major Tailwind/browser-support migration is not bundled into this security release solely to remove a build-only advisory.
- [ ] R-002 [status:blocked] Deployed environment and historical incident exposure remain unverified. Owner: project operator. Close with confirmed app identity, read access and version/digest/log evidence, including the October 17 onward window and cloud/gateway records.
- [ ] R-003 [status:blocked] Shared pip/Node and device trust updates require device-owner action. Close with installed-version and effective-store checks after approved changes.
- [ ] R-004 [status:blocked] Main branch protection and live CI status need account changes. Close with enabled rules and successful required check on the reviewed candidate.
- [ ] R-005 [status:blocked] Volatile per-process storage with configured autoscaling prevents a durable production-resume claim. Close with an approved persistence/routing decision and cross-instance/restart validation.

Confidence is high in the reproduced local weaknesses, dependency versions and tested remediations. Confidence in production remediation and historical compromise coverage is limited by the explicit access gaps. No claim of complete safety or exhaustive vulnerability discovery is made.

## Change Log

- Completion follow-up: confirmed the matching live Replit app. Added PostgreSQL-backed sessions with SHA-256 capability lookup, verified TLS for remote databases, bounded connection pools, atomic independent-score updates, capacity serialization, expiry and fail-closed production startup. Existing memory mode remains available only for development and explicit local tests. Added real-PostgreSQL integration coverage to CI and corrected privacy notices in all three locales.
- Shared host: nvm now defaults to Node 24.22.1. Homebrew Python 3.13.17 supplies active pip 26.2.2; its actual vendored bundle contains 120 roots and zero compromised emSign G3 matches. Stale pip 24.2 distribution metadata remains on disk, but is not the active pip implementation. Device OS and unrelated environment inventories are separate remaining scope.
- Final local checks after completion edits: typecheck and production build passed; 17 security/storage tests passed with local socket permission. One sandbox-only rerun could not bind the test server and was repeated successfully with the needed permission. Redacted working-tree Gitleaks scan returned zero findings. Production audit is refreshed before publishing. PostgreSQL and hosted verification follow in live CI/Replit.

- October 22: Reused March source findings, preserved existing edits, performed compromise precheck, refreshed advisories, implemented local fixes and added regression coverage. Global/runtime/account/production changes withheld as specified by the request. Required deployment evidence is listed above; production sign-off remains open.
- 2026-10-22T17:32:42Z: Final source state validated. Lockfile SHA-256 `0ee2981ac4d8028311f6a0d9d47e0ad009e83ea238f9a62c18150d5d0faeadef`; built server SHA-256 `4731eb53a4a8ff20cb6c7d5b3c039e68f75f94b24b2dbd6bfae2332df54d3024`. Checklist structure is validated separately; production G-004 intentionally remains blocked.

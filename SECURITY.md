# VEKAID Security

## Current security model

VEKAID is a client-side PWA hosted on GitHub Pages. It has no application backend and no server-side user database.

### Protected by design
- HTTPS delivery through GitHub Pages.
- No production API keys are stored in the public frontend.
- No `eval()` is allowed by the Quality Gate.
- External links opened in a new tab must use `noopener`.
- A versioned Service Worker limits stale-cache regressions.
- Personal runtime data should remain local in IndexedDB/localStorage and must not be committed to GitHub.
- The public repository must contain application code, not personal secrets.

### Current limitations
- The legacy HTML still contains substantial inline CSS/JavaScript.
- The current CSP is transitional and still permits inline code.
- Browser storage is not encrypted at rest by VEKAID.
- There is no user authentication layer because VEKAID is currently a personal single-user PWA.
- No formal third-party penetration test has been performed.

## Security rules

Never commit:
- API keys
- OAuth tokens
- passwords
- private keys
- session cookies
- personal confidential documents

Any future connector requiring authentication must keep credentials outside the public frontend.

## Release requirements

Every main-branch change must pass the GitHub Actions **VEKAID Quality Gate** before being considered release-ready.

## Expanded security review (2026-11-25)
For each control record applicable / not applicable with reason / unverified / tested / remediated, evidence and residual risk.
37. Vulnerable dependencies: inventory and audit.
38. Malicious packages: provenance, pinned versions, review install scripts.
39. Prompt injection: treat external content as untrusted data.
40. Unpermissioned AI access: least privilege, approval for sensitive actions.
41. Excessive DB permissions: server-side least privilege if introduced.
42. Missing audit logs: useful events without secrets.
43. No monitoring: risk-based alerts, no invented telemetry.
44. No backups/restore: test export, restore and migrations.
45. Exposed dashboards: never publish private data or admin interfaces.
46. Missing headers: verify actual HTTP headers; meta CSP is not equivalent.
47. Insecure cookies: Secure, HttpOnly, SameSite where applicable.
48. Unencrypted data: HTTPS and appropriate at-rest protection; browser storage is not a vault.
49. Poor tenant isolation: server-side authorization if multi-user.
50. Unreviewed code: independent review and tests.
51. Mass assignment: explicit field allowlists.
52. Command injection: avoid shell execution and validate arguments.
53. Insecure deserialization: bounded JSON, schema and validation.
54. Misconfigured OAuth: PKCE, state, strict redirects, no frontend secrets.
Also review XSS, CSRF, SSRF, CORS, sessions, file imports, secrets and access controls. Backend-specific checks are conditional, not automatically passed. No claim of full security or penetration test.

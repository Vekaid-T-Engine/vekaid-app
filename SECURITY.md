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

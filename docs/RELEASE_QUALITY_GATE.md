# VEKAID Release Quality Gate

A release is ready only when the following are true.

## Build
- Required PWA files exist.
- Manifest is valid JSON.
- Service Worker references the current versioned assets.
- Size budgets pass.

## Security
- No recognized secret pattern is present.
- No `eval()`.
- CSP exists.
- `target="_blank"` links use `noopener`.
- No credential is embedded in frontend code.

## Product
- Main iPhone navigation works.
- Existing V22/V23 functions remain accessible.
- Motion respects `prefers-reduced-motion`.
- Important data is not silently deleted during migrations.

## Release & Discover
- Deployment corresponds to the intended commit.
- Mobile rendering is checked.
- Public pages use meaningful title/description.
- Sitemap/robots/canonical/Open Graph are added when relevant.
- External verification such as Google Search Console is never claimed without real verification.

## Evidence
- Git commit SHA.
- Quality Gate result.
- Published URL.
- Screenshots or test results when relevant.

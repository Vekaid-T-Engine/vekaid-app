# VEKAID — Product quality standard

Applies to every future change. Preserve the existing monochrome identity, V mark, particle field, launch motion and Intelligence/Missions navigation unless explicitly approved. No new paid services. No personal data or secrets in this public repository.

## Workflow
1. Research relevant professional references and verify claims.
2. Define the user problem, acceptance criteria and non-regression scenarios.
3. Compare alternatives; prefer the smallest effective change.
4. Implement maintainable code; remove superseded code only after checking dependencies.
5. Review motion, hierarchy, typography, spacing and mobile ergonomics.
6. Red-team security, imports, storage, error handling and data integrity.
7. Score the release using the rubric below, with evidence and unknowns.
8. Run tests, verify deployment and validate on real iPhone Safari/PWA.

## Rubric (50 points)
Score each criterion only with evidence; untested means unverified, not passed.
- Engineering (5 each): real functionality, responsive behavior, security/privacy, performance, accessibility/reliability.
- Aesthetics (2 each): composition/hierarchy, typography, art direction, visual assets, consistency/finish.
- Creativity (3 each): original useful concept, brand identity, meaningful motion, visual narrative, memorable experience.
Target 45/50; never invent a score or claim independent model comparison without performing it.

## Blocking checks
- Data loss, misleading metrics, critical security issues, broken essential actions or major mobile regressions block release regardless of score.
- Check safe areas, bottom dock, horizontal overflow, double-tap behavior, keyboard access, reduced motion, launch flash, scroll restoration and transitions.
- Preserve existing IndexedDB/localStorage data; test migrations and backups.
- Distinguish empty, loading, error and verified states; do not invent skills or missions.
- Check cache/version consistency, obsolete assets and duplicate handlers; no blind deletion.
- Record actual test commands/results, unresolved issues, commit and deployment status.
- Device-specific claims require device testing; distinguish automated checks from real-device checks.

## Release record
Change / rationale / evidence / rubric / blockers / deployment / rollback.

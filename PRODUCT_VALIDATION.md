# VEKAID — Product validation

Derived from visual review of six supplied videos; not a full transcription.

- Before building a feature, use an explicitly labeled concept or local opt-in interest test. Never pretend an unavailable feature works; no remote tracking by default.
- Prefer direct first-use guidance and optional contextual hints over mandatory onboarding slides.
- Keep all supported locales in scope, including RTL; verify actual rendered screens and localized store materials before publication.
- Native widgets: use WidgetKit only in the native target, with local shared data and appropriate entitlements; validate on a device before claiming support.
- App Store readiness: check privacy, accessibility, honest metadata, support and applicable review requirements against official Apple documentation before submission.
- Release gate: synchronized release manifest, cache, asset versions, automated checks and physical-device visual acceptance. Preserve existing data and features.

These are acceptance criteria, not claims that native widgets or App Store submission are implemented.

## Video-derived extension — 2026-11-28
Visual sampling of seven supplied clips; no complete audio transcript. Apply as an additive review checklist, not a claim of implementation.
- V1: seed useful first-party content, explicitly label demos; never fabricate users, reviews or traction.
- V2: agent loop: select registered tool, validate arguments, authorize scope, execute through a trusted adapter, observe actual output, test, retry within limits. Never interpret model text as execution evidence.
- V3: compare design variants and micro-interactions before replacing the accepted interface; preserve a stable baseline.
- V4: reserve layout space during loading, group long numbers, avoid needless motion, disclose secondary controls progressively, show actual progress when measurable. Include reduced motion and keyboard/touch checks. Earlier blur, five-second and removal tests remain applicable.
- V5: validate a real user problem, demand and organic distribution before investing; revenue claims are not forecasts.
- V6: research public resources (RevenueCat subscription report, Sub Club, Superwall Podcast, Hooked, $100M Offers, Interface Craft, Mobbin); verify access and license before adoption; no paid subscriptions or copied proprietary assets.
- V7: study audience language, demonstrate real value with short organic content, measure actual outcomes only with consent.
- Low-code and OpenAI/Codex adapters: reuse existing orchestration, prefer local deterministic tools; no paid API calls, no secret in browser, no implicit permissions. External adapter identity and results must be authenticated before execution. No connector is enabled by this checklist.
- Cross-project application: use these gates in future reviews; do not overwrite project-specific constraints or modify other repositories without scoped review.

## 2026-11-28 — iOS release, motion and AI governance
Visual review of three supplied videos; no audio transcription.
- Release checklist: icon, store screenshots, keywords, privacy policy, permission rationale, onboarding, paywall, restore purchases, subscription disclosures, haptics, dark mode, empty/offline/loading states, crash reporting, analytics, account deletion, accessibility, TestFlight and review guidelines. Commerce and native distribution gates apply only when relevant; no paid enrollment without approval.
- Motion: press scale 0.97, avoid scale-from-zero, rapid transitions (normally under 300ms), no repeated tooltip animation, origin-aware popovers, no animation for every keystroke or frequent action, child motion on parent hover only on hover-capable devices, 44px touch targets, suitable easing, optional stagger and icon transitions, stable layout and numeric updates, reduced motion, no blanket will-change. Preserve launch identity; verify physical touch and performance.
- AI governance: default extra budget zero; unknown billing or entitlement blocks provider dispatch. Enforce daily/weekly/monthly mission caps and concurrency atomically in trusted local dispatcher, not browser. Distinguish subscription usage, estimates and actual charges. Persistent stop flag prevents new dispatch; cancellation of running work requires acknowledgement. No automatic paid fallback. Test concurrent claims, restart persistence, limit expiry, unavailable providers and stop behavior. No claim of implementation until tests and actual integration exist.
- Apply to other projects through scoped review. Do not alter live bridge or active agent work for this documentation change.

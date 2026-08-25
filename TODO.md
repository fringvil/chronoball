# Chronoball TODO

## Priority 0: Prove the Core Game

- [ ] Playtest movement, slash timing, collisions, revive, restart, and the overall run length.
- [ ] Add browser-level tests for intro, start, game-over, revive, restart, and pause flows.
- [ ] Verify keyboard and touch controls across desktop and mobile viewport sizes.
- [ ] Handle app pause and resume when the browser loses focus, the phone locks, or a notification opens.
- [ ] Support portrait orientation, safe areas, reliable touch targets, and protection from browser gestures.
- [ ] Test first launch, returning players, offline mode, slow networks, interrupted loads, and storage failures.

## Priority 1: Make It Reliable

- [ ] Add high-score and settings persistence with `localStorage`.
- [ ] Version and validate saved data so future releases can migrate or recover corrupted settings and scores.
- [ ] Add loading, offline, error, and retry states for external assets and services.
- [ ] Test on representative iOS Safari and Android Chrome devices, including lower-end hardware.
- [ ] Set performance budgets for bundle size, load time, frame rate, memory, and battery usage.
- [ ] Review accessibility, focus behavior, readable UI states, color contrast, reduced motion, and keyboard navigation.
- [ ] Add CI checks for tests, production builds, dependency audits, and linting.
- [ ] Add pull-request checks, preview deployments, build artifacts, and protected main-branch merges.
- [ ] Choose and configure either Renovate or Dependabot for automated dependency updates.
- [ ] Add a restrictive Content Security Policy and security headers.
- [ ] Run secret scanning in CI and review third-party dependencies, browser storage, permissions, and external requests.

## Priority 2: Improve the Player Experience

- [ ] Add difficulty scaling and more obstacle patterns as the run continues.
- [ ] Add sound effects, music, vibration, and stronger visual hit feedback.
- [ ] Add settings for sound, music, vibration, and reduced motion.
- [ ] Add optional power-ups, daily challenges, or missions.
- [ ] Add unlockable colors, trails, or arenas.
- [ ] Consider adding an optional leaderboard with rate limits and server-side validation.
- [ ] Plan localization for UI text, dates, numbers, consent screens, and store metadata.

## Priority 3: Measure Before Monetizing

- [ ] Prepare a privacy policy, terms of use, support contact, and data-deletion process before collecting analytics or serving ads.
- [ ] Add privacy-conscious analytics with documented consent, data retention, and an opt-out path.
- [ ] Define player metrics: unique players, daily/monthly active players, sessions per player, retention, and completion rate.
- [ ] Track gameplay events such as game start, game over, revive, restart, score, and session duration.
- [ ] Track operational metrics: crashes, load time, frame rate, and asset-loading failures.
- [ ] Send application and deployment metrics to Grafana or Grafana Cloud.
- [ ] Create Grafana dashboards and alerts for JavaScript errors, availability, load performance, and deployment failures.
- [ ] Add release/version identifiers to telemetry so regressions can be traced to deployments.

## Priority 4: Add Monetization Carefully

- [ ] Choose an ad provider and define the monetization model.
- [ ] Define Chronoball Premium as a one-time entitlement that removes all ads and unlocks clearly listed content.
- [ ] Choose Premium unlocks such as cosmetics, arenas, game modes, or other non-essential content without making the free game unfair.
- [ ] Design the Premium purchase screen with localized pricing, benefits, restore-purchase access, and links to terms and privacy information.
- [ ] Integrate Google Play Billing for a non-consumable Premium product and keep entitlement checks separate from UI state.
- [ ] Restore and revalidate Premium purchases after reinstall, device changes, pending payments, cancellations, and refunds.
- [ ] Suppress every ad format for Premium players, including rewarded revive ads, and test the entitlement boundary.
- [ ] Add Premium purchase, restore, refund, and ad-suppression events to privacy-conscious analytics.
- [ ] Complete age rating, child-safety, and regional consent requirements before serving ads.
- [ ] Add a clearly optional rewarded ad for the existing revive flow.
- [ ] Use test ads during development and keep production ad identifiers out of source control.
- [ ] Add frequency caps and graceful fallbacks when an ad is unavailable or fails.
- [ ] Track ad requests, impressions, completions, rewards, failures, and estimated revenue without collecting unnecessary personal data.
- [ ] Monitor ad impact on retention, session length, performance, and crash rate in Grafana.
- [ ] Test Premium and ad flows with Google Play license testers before release.
- [ ] Add rate limits and server-side validation if ads, accounts, leaderboards, or a backend are introduced.

## Priority 5: Prepare and Operate the Release

- [ ] Profile the Phaser bundle and optimize loading if needed.
- [ ] Choose between an installable PWA and an Android wrapper such as Capacitor.
- [ ] If targeting Google Play, create the Android project, configure the package ID, app icon, splash screen, permissions, and signing key.
- [ ] Choose a production host such as GitHub Pages, Netlify, or Vercel.
- [ ] Automate production deployment after approved changes, with environment-specific configuration and rollback steps.
- [ ] Document release, rollback, and incident-response procedures.
- [ ] Prepare store metadata, screenshots, feature graphics, icons, and review notes.
- [ ] Create and verify a Google Play Console developer account.
- [ ] Complete Google Play listing, Data safety, content rating, target API, privacy policy, and advertising declarations.
- [ ] Build and sign a production Android App Bundle (`.aab`) and keep signing credentials out of source control.
- [ ] Release to internal and closed testing tracks, validate on real Android devices, and fix review issues.
- [ ] Submit the first production release for Google Play review, then use a staged rollout.
- [ ] Add an in-game way for players to report problems or provide feedback.
- [ ] Run a staged release or beta test, monitor the dashboards, and define a rollback threshold.
- [ ] Verify that analytics, ads, consent, and data deletion work correctly in every supported region.
- [ ] Complete platform content ratings and regional compliance requirements.
- [ ] Deploy a production build.

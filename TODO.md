# Chronoball TODO

## Immediate

- [ ] Playtest the core loop: movement, slash timing, collisions, revive, and restart.
- [ ] Verify keyboard and touch controls across desktop and mobile viewport sizes.
- [ ] Add browser-level tests for the intro, start, game-over, revive, restart, and pause flows.
- [ ] Handle app pause and resume when the browser loses focus, the phone locks, or a notification opens.
- [ ] Support portrait orientation, safe areas, and reliable touch targets.

## Progression

- [ ] Add difficulty scaling as the run continues.
- [ ] Add more obstacle patterns.
- [ ] Add high-score and settings persistence with `localStorage`.
- [ ] Add optional power-ups, daily challenges, or missions.
- [ ] Add unlockable colors, trails, or arenas.
- [ ] Consider adding an optional leaderboard.

## Polish

- [ ] Add sound effects, music, and stronger visual hit feedback.
- [ ] Add vibration feedback for slash, collision, and game over.
- [ ] Add settings for sound, music, vibration, and reduced motion.
- [ ] Review accessibility, focus behavior, readable UI states, and color contrast.
- [ ] Prevent accidental browser scrolling and gesture interference.
- [ ] Test frame rate and memory usage on a lower-end phone.

## Delivery

- [ ] Profile the Phaser bundle and optimize loading if needed.
- [ ] Add an app icon, splash screen, and installable PWA or native wrapper.
- [ ] Add error monitoring and basic analytics only with an appropriate privacy policy.
- [ ] Choose a production host such as GitHub Pages, Netlify, or Vercel.
- [ ] Add CI checks for `npm test` and `npm run build`.
- [ ] Deploy a production build.

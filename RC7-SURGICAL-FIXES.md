# RC7 Surgical Fixes

This package deliberately removes the broad RC8 stability layer and retains the RC7 public layout.

## Surgical fixes retained

- `home.js` checks optional `#year` and `#latestGrid` elements before updating them.
- Track catalogue Firebase reads time out and fall back to `tracks.json`, preventing indefinite track loading.
- Optional admin loader events/imports have bounded waits and fail without hiding the login screen.
- RC6/RC7 DJ database reads have bounded waits.
- `rc6-admin.js` observes `#moduleDjList` only when it exists.
- The shared header no longer creates Mixing & Mastering or Vinyl links, so they cannot appear in the hamburger menu.
- The RC7 cart/Checkout/account utility layout remains unchanged.

## Explicitly not changed

- Music Store columns, rows, buttons, BPM/price alignment and player layout.
- DJ Promo track layout.
- Let’s Work layout.
- Customer Portal layout.
- Global cache strategy or Firebase Hosting headers.

## Deployment

Deploy the complete package as a clean mirror. Do not copy the deleted RC8 files back into `public`, and do not merge this package with a separate RC8 folder.

## Live testing still required

- Firebase/Auth and admin account access.
- Buyer checkout, payment webhook and downloads.
- Storage MP3/WAV paths.
- Transactional email and DJ setup/reset links.
- End-to-end DJ approval and download workflow.


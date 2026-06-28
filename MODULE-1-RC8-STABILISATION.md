# Module 1 RC8 Stabilisation

RC8 is a reliability pass. It adds no new product features.

## Stability fixes

- `home.js` now guards both removed optional homepage targets (`#year` and `#latestGrid`).
- Track catalogue reads have 6.5-second Firebase timeouts and fall back to `tracks.json`.
- Track pages show a clear unavailable state after nine seconds instead of hanging on “Loading track”.
- Optional RC1/RC2 admin loader events and imports have five-second limits.
- RC6/RC7 DJ database reads have five-second limits and fail without blocking admin startup.
- Every new observer checks that its target exists.
- The admin portal is forced hidden while login is visible; moved navigation is hidden with it.
- Music rows initialise their Add button from the shared cart state.
- Disabled Module 2 navigation links are removed from both desktop and hamburger DOM.

## Referenced-file audit

- No service worker or Cache API logic exists.
- No duplicate static script tags were found.
- Public pages load their base CSS plus one versioned `current-ui.css` compatibility bundle.
- Historical CSS/behaviour files inside that bundle are still referenced deliberately because later RC layers depend on their component foundations. They should not be deleted individually from an existing deployment.
- Unreferenced files are harmless, but the safest deployment is a clean mirror: delete the old Firebase Hosting `public` deployment source folder and replace it with this package’s `public` folder before deploying.
- Do not merge only selected RC files into an older folder.

## Preview-ready

- Homepage, Music, DJ Promo and track pages fail gracefully when optional content/data is unavailable.
- Admin login remains isolated from dashboard navigation/content.
- Header utility alignment, text widths, filter parity and responsive portal rules remain active.
- Cart state remains consistent between Music and Track Detail.

## Live blockers

| Area | Required action |
| --- | --- |
| Firebase/Auth | Configure production project, authorised domains and admin record |
| Payments | Configure Stripe/PayPal and test webhooks/fulfilment |
| Downloads | Upload MP3/WAV assets and verify Storage paths |
| Email | Configure transactional provider and test setup/reset messages |
| Buyer journey | Test account, payment, order, download and re-download |
| DJ journey | Test application, decision, setup, login, reset and signed download |


# Module 1 RC6 Bug Fixes

## Root-cause fixes

### Old-version cycling

The HTML still contains safe fallback markup while the current UI is assembled by shared scripts. Historical design layers are also retained inside the ordered compatibility bundle. Browsers could paint that fallback before `current-ui.css` and the shared header/logo finished loading.

RC6 now holds the first visible paint with `html:not(.ui-ready)` and reveals the document only after the versioned current UI bundle has loaded. A 1.5-second safety fallback prevents a blank page if a stylesheet request fails. There is no service worker or Cache API logic.

### Desktop Music price

The price data was present. Desktop rows had no dedicated BPM cell while the header expected later columns, shifting Mood, Price and Actions into different grid tracks. RC6 inserts an explicit BPM cell and uses one matching desktop grid for:

`Artwork | Track | Genre | BPM | Mood | Price | Actions`

The working compact responsive layout remains unchanged.

## Other RC6 fixes

- The duplicate utility link is labelled Checkout and sits next to the cart summary.
- Disabled Module 2 links remain hidden in desktop/mobile navigation and admin filters.
- Green artwork overlays are forcibly disabled.
- Commercial Use is placed immediately before same-genre Related Music.
- DJ Promo mirrors the store grid with `Track | Genre | BPM | Mood | Downloads`.
- Let’s Work uses six equal-width settings-backed links and a right-aligned submit button.
- Portal format columns are centred and tables become labelled cards on narrow screens.
- Admin navigation remains at the top and System Setup Status restores a stable grid.
- DJ statuses are editable as Pending, Approved or Rejected and update visibly after changes.
- Settings retain the seven explicit RC5 sections and restrained save controls.

## Live setup still required

- Deploy to Firebase Preview and confirm the first-paint fix with hard refreshes.
- Configure production Auth and authorised domains.
- Configure/test Stripe and PayPal webhooks and fulfilment.
- Upload and verify sale/promo MP3 and WAV paths.
- Configure email delivery and test DJ setup/reset links.
- Complete real buyer and DJ end-to-end tests.


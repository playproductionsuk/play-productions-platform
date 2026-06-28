# Module 1 RC2 Review Fixes

## What now works in preview

- Compact footer respects disabled-module visibility and uses horizontal Navigation, Follow and Listen links.
- Responsive menu explicitly displays all active Module 1 navigation and utility links.
- Latest transparent lime logo is used across public, customer, DJ and admin headers.
- Music playback retains artwork visibility with white play/pause, white progress and an explicit Preview action.
- Music Store now exposes the bottom mini-player with title, artwork and controls.
- DJ Promo Pool now shares Music Store filters: search, genre, BPM, mood and sorting.
- DJ rows share store-style artwork playback, metadata, spacing and mini-player.
- Preview DJ downloads are disabled with clear configuration messaging rather than dead actions.
- Live DJ download requests select the correct protected MP3 or WAV Storage path.
- Let’s Work social links use labelled icons and the shared additive social-link input.
- Customer Portal tables use a wider layout and identify purchased music as its source.
- Dashboard and DJ KPI grids use more horizontal space.
- Missing metadata chips map to actual editor controls such as artwork, preview, WAV master and release date.
- DJ Database includes notes handling alongside approval/account status.

## Live workflow status

| Workflow | Status | Remaining requirement |
|---|---|---|
| Music browsing, preview and cart | Green | Final Firebase-preview/mobile visual test. |
| Account creation/login | Amber | Test against production Firebase Auth configuration. |
| Paid purchase and My Music ownership | Amber | Complete sandbox checkout/webhook/order ownership tests. |
| Customer re-downloads | Amber | Upload masters and validate signed fulfilment URLs. |
| DJ application and preview approval | Green | Preview/local status flow works. |
| Secure DJ invitation/password reset | Amber | Configure Trigger Email/SMTP and test live setup links. |
| Approved DJ portal login | Amber | Test against deployed Firebase Auth and rules. |
| Protected DJ MP3/WAV downloads | Amber | Populate `previewPath`/`mp3Path` and `masterPath`, then test signed downloads. |
| Enquiry status updates | Green | Preview storage and Firestore-ready updates implemented. |
| Legal launch content | Red | Privacy, terms, refund and download licence still required. |

## Asset replacement path

The current transparent logo is:

`public/assets/branding/play-headphones-logo.png`

Replace that file in place to update the mark everywhere.

## Chris to-do

- Finalise homepage, Let’s Work, customer-account and DJ confirmation wording.
- Provide final favicon, hero image, placeholder artwork and any replacement social icons.
- Confirm customer MP3/WAV entitlement and download licence.
- Configure Firebase/Auth/email and payment sandbox.
- Configure Analytics and Search Console later.

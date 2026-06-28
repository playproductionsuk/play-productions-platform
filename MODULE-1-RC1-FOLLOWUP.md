# Module 1 RC1 Review Follow-Up

## What now works in preview

- Responsive hamburger menu contains Home, Music, DJ Promo, Let’s Work, My Account, Cart and DJ Login.
- Disabled modules continue to disappear through the existing visibility settings.
- The supplied transparent lime logo is used from `public/assets/branding/play-headphones-logo.png`.
- DJ Promo now uses the same shared top-left header treatment as the public store.
- Public breadcrumbs link back through Home and relevant parent pages.
- Music artwork remains visible with white play/pause and white progress; explicit Preview uses the same player.
- Store-row playback excludes More Details, Add to Cart and cart controls.
- Track purchasing shares persistent cart logic and displays In Cart without duplicates.
- Let’s Work, DJ access and commercial enquiries use repeatable structured social-link rows.
- Customer Portal tables use the wider page area and keep important values/actions aligned.
- Dashboard attention items and track-attention rows open their relevant operational view.
- Missing metadata chips open track editing and jump toward the selected missing field.
- Enquiries export joins existing Music, DJ, Orders and Customers CSV exports.
- Release management now includes distribution ID/link, writer, producer, publisher, distribution date and copyright details.
- Preview DJ approval updates status without exposing a password.

## Secure live DJ approval

Live approval now:

1. Creates or enables the Firebase Auth user without a plaintext password.
2. Generates a Firebase password-setup/reset link.
3. Queues that invitation through the Firestore `mail` collection.
4. Stores the UID and invited account status.
5. Allows later password reset from DJ Login.

The dashboard never stores or displays plaintext passwords.

## Still requires external setup

| Area | Status | Requirement |
|---|---|---|
| Firebase/Auth | Amber | Configure the production Firebase app and test owner/customer/DJ accounts. |
| DJ invitation email | Amber | Configure Trigger Email/SMTP and verify password-setup delivery. |
| Protected DJ downloads | Amber | Upload MP3/WAV masters and test signed URLs with approved Auth users. |
| Customer re-downloads | Amber | Complete paid-order ownership and signed My Music download fulfilment. |
| Stripe/PayPal | Amber | Run sandbox payment, webhook, order and refund tests. |
| Legal content | Red | Publish privacy, terms, refund and download-licence pages. |
| Mobile QA | Amber | Complete final physical-device/Firebase-preview testing. |

## Chris to-do

- Finalise homepage and trust-strip wording.
- Confirm customer release-update wording.
- Confirm DJ approval email wording.
- Confirm MP3/WAV customer entitlement and licence wording.
- Provide final favicon, social icons, hero artwork and placeholder artwork.
- Configure Analytics and Search Console later.

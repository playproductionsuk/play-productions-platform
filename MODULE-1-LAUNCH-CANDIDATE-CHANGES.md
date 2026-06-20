# Module 1 Launch Candidate

## Working in Firebase preview without production deployment

- The Music Store loads the five bundled tracks, shows price, Preview, Add to Cart and More Details.
- Preview is a themed play/pause control with progress; only one store preview plays at once.
- Cart count, artwork, title, price, removal and the checkout-placeholder route work using browser storage.
- Track pages show the themed player, price, Add to Cart and Buy Now, with commercial use above Related Music.
- Related Music scores genre first, BPM proximity second and shared moods third.
- DJ applications are stored in browser storage when Firebase is not configured and appear in the interactive Business Dashboard preview.
- The Business Dashboard preview includes the enquiries inbox, dedicated DJ Access statuses/actions, public Music Library records, editor preview, correct Overview routes, private Vinyl placeholder and tabbed Settings.
- Music, DJ Promo and Let’s Work are enabled by default. Mixing, Vinyl and future modules are disabled by default but remain owner-switchable.

## Working when Firebase is configured

- Enquiries save to Firestore and appear in the dashboard inbox.
- DJ applications retain individual social fields, consent, application time and status.
- Approving a DJ calls the protected Admin function, creates/enables the Firebase Auth account, stores the approved UID and enables DJ downloads.
- Rejecting or changing status updates the Firestore enquiry.
- Music Library loads Firestore tracks, with bundled catalogue fallback if the collection is empty.
- Page visibility writes to `settings/site` for an authenticated owner.
- A new Firestore trigger writes notification messages for `chris@playproductions.co.uk` to the `mail` collection.

## Email notification setup

Dashboard storage does not depend on email. To send the queued notification:

1. In Firebase Console, install the official **Trigger Email from Firestore** extension.
2. Configure its watched collection as `mail`.
3. Supply a verified SMTP provider/sender and set the sender identity.
4. Deploy `notifyNewEnquiry` from the Functions project.
5. Submit a test enquiry and verify both the `enquiries` and `mail` documents before relying on delivery.

## Remaining Module 1 launch blockers

1. Replace placeholders in `public/firebase-config.js` and test Auth, Firestore and Storage rules against the real project.
2. Upload a private WAV/master for each sellable track and store its Storage path as `masterPath`; bundled files are preview MP3s only.
3. Migrate/confirm the five catalogue records in Firestore and complete required download metadata.
4. Configure and sandbox-test Stripe and PayPal secrets, webhook/capture handling and final customer/order ownership. The multi-item checkout UI remains a clearly marked placeholder.
5. Install/configure the Firestore email extension or another SMTP provider and verify notifications to `chris@playproductions.co.uk`.
6. Test owner Auth, DJ approval, temporary-password handoff and protected WAV downloads on a Firebase preview channel.
7. Add and approve privacy, terms, personal-download licence and refund policy pages before accepting payment.

Mixing, Vinyl, merch, producer tools and courses are not Module 1 blockers and remain off by default.

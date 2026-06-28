# Play Productions Platform — Phase 1

This is the modular Firebase foundation for Play Productions: public music store, artist enquiries, studio services, DJ promos, customer accounts and a business dashboard.

## Module 1 RC3 release candidate

RC3 is the final Module 1 refinement for the Music Store, track pages, DJ Promo, customer portal and business dashboard. See `MODULE-1-RC3-FINAL-FIXES.md` for preview capabilities, live setup requirements, asset replacement paths and the launch blocker table.

## Module 1 RC4 final polish

RC4 tightens initial rendering, responsive layouts, active-module visibility, Music/DJ playback, portal mapping and admin settings. See `MODULE-1-RC4-FINAL-POLISH.md` for the changelog, preview status, Chris’s content tasks and launch blockers.

## What is included

- Premium brand-led homepage with selected latest releases, service highlights, DJ promo and a Let’s Work callout.
- Dedicated multi-page public architecture rather than a single-page platform.
- Track pages for listener downloads, with a separate exclusive/commercial enquiry form for artists.
- Individual approved DJ accounts with protected WAV downloads and an admin approval workflow.
- Dedicated Mixing & Mastering page plus a separate Custom Vinyl Cutting service page.
- Live guide quote based on service, track count and stem count, plus demo upload, references and notes.
- Customer portal with My Music, My Projects and Order History modules.
- Admin dashboard with daily action counts, track health, expanded track editor, enquiries, projects, orders and case-study foundation.
- Draft, coming-soon, published and archived track states with visibility switches.
- Publishing checklist and completion score based on each track's intended use.
- Firestore and Storage rules for the Phase 1 collections and private files.
- Existing Stripe/PayPal server foundations preserved for Phase 2.

## Local preview

Serve the `public` directory from a local web server. ES modules will not run correctly by double-clicking the HTML files. Public demo catalogue pages use `public/tracks.json` until Firebase configuration is added. Account, admin, uploads, enquiries and secure downloads require Firebase.

## Page architecture

- `index.html` — premium landing page only
- `music.html` — latest releases, searchable/filterable public catalogue
- `track.html?id=...` — dynamic individual release page and artist enquiry
- `services.html` — stereo mixing, mastering, mix + master and case studies
- `vinyl.html` — 7, 10 and 12-inch custom vinyl cutting, FAQ and quote request
- `dj-access.html` — DJ access application and mailing consent
- `dj-login.html` / `dj-promo.html` — individual private DJ account and downloads
- `portal.html` — customer My Music, My Projects and orders
- `admin.html` — private business dashboard and management tools
- `contact.html` — general enquiry and contact route

Legacy `beat.html` and `account.html` links redirect to the new canonical pages so existing bookmarks remain usable.

## Firebase setup

1. Select the existing `play-productions` project in Firebase Console.
2. Enable Firestore, Storage, Hosting, Cloud Functions and Email/Password Authentication.
3. Copy the public web-app settings into `public/firebase-config.js`.
4. Add the owner as an Authentication user.
5. Create `admins/{OWNER_AUTH_UID}` in Firestore. A field such as `enabled: true` is sufficient.
6. Upgrade to a Firebase billing plan that supports the deployed Functions and Storage configuration.

Deploy rules, hosting and functions with:

```text
cd functions
npm install
cd ..
firebase deploy
```

## Required function secrets

```text
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set PAYPAL_CLIENT_ID
firebase functions:secrets:set PAYPAL_CLIENT_SECRET
```

DJ access now uses individual Firebase Authentication accounts rather than shared credentials. A DJ applies at `/dj-access.html`; the request appears in the admin Enquiries area. The admin approval control creates a Firebase user, marks `users/{uid}.djAccess` as approved and displays a one-time temporary password to send securely. Mailing consent is recorded on the user profile for later mailing-platform integration.

Stripe webhook endpoint: `https://www.playproductions.co.uk/api/stripe-webhook` with event `checkout.session.completed`.

## Track publishing workflow

Open `/admin.html`, choose Tracks and add or edit a track. A track is uploaded once, then visibility is controlled with switches:

- Public music store
- DJ promo pool
- Latest releases
- Featured
- Artist/exclusive enquiry
- Purchase enabled

Drafts only require a title. Coming-soon records require artwork/placeholder, teaser and a date or TBC. Store-ready published tracks require artwork, preview, private master, price, style, description, release date and slug. The dashboard blocks an incomplete store track from being published and shows its completion score.

Older Firestore track documents should be opened and re-saved in the new editor so they receive the Phase 1 fields and the `personal` digital-download product definition.

## Services pricing

Guide rates currently live in `public/services.js` and `seed-data/README.md`. They are deliberately estimates, not checkout prices:

- stereo mastering: £30 base, then £25 per additional track;
- stereo mixing: £35 base + £6 per stem per track;
- mix + master: £55 base + £6 per stem per track;
- custom vinyl: from £55, confirmed after format/duration review.

Audio Animals' live price pages could not be reliably retrieved during this build, so these should be compared and approved before launch rather than presented as exact Audio Animals matching. Move the confirmed figures into `settings/services` in Phase 2 so the owner can edit them without changing code.

## Firestore collections

- `tracks` — metadata, visibility, files and publication status
- `users` — customer profiles and CRM tags
- `orders` — digital, service and future physical orders
- `enquiries` — exclusive-rights and service quote requests
- `projects` — studio/vinyl workflow and customer-visible updates
- `tasks` — action/reminder foundation
- `caseStudies` — services testimonials and before/after media
- `settings` — future editable content, service rates and brand settings
- `auditLog` — server-written activity history foundation
- `admins` — admin permission records
- `purchases` — private payment/download fulfilment records

Example document shapes are in `seed-data/README.md`.

## Assumptions

- Standard store purchases are personal-listening digital downloads, not beat licences.
- Exclusive/commercial rights are enquiries only and are never sold automatically.
- Payments remain a Phase 2 priority; the safe existing backend is preserved, but full customer ownership linking, receipts and refunds need completing before live sales.
- Case studies can be added directly in Firestore in Phase 1; a full media editor is the next admin refinement.
- Anonymous service enquiries are allowed. Logged-in customers also receive a My Projects record.

## Phase 2 recommendations

1. Link Stripe/PayPal checkout to Firebase Auth users and create owned `orders` records after payment.
2. Add emailed receipts, secure re-download generation and refund/revocation handling.
3. Move service pricing and homepage copy into editable Settings screens.
4. Add project messages, revision submissions and final-file upload controls.
5. Add case-study media upload/editing in admin.
6. Add transactional email for new enquiries and project status changes.
7. Add App Check, rate limiting, spam protection and audit-log writes in Cloud Functions.
8. Add analytics/reporting and future product types: vinyl, samples, presets, CDs, cassettes, merch and courses.

## Module 1 RC2 Review Fixes

RC2 completes the active-only compact footer, hardened mobile menu, Music mini-player, full DJ filter/playback parity, wider customer tables, labelled contact icons, real MP3/WAV DJ file selection and reliable missing-field mapping.

See `MODULE-1-RC2-REVIEW-FIXES.md` for preview functionality, external setup requirements, launch blockers and the exact replace-in-place logo asset path.

## Module 1 RC1 Review Follow-Up

RC1 follow-up completes the responsive menu, shared DJ/public header, breadcrumbs, white playback treatment, explicit Preview action, wider portal tables, clickable dashboard attention workflow, enquiry export and secure DJ password-setup/reset flow.

The exact preview behaviour, secure DJ invitation design, remaining integrations and Chris to-do list are documented in `MODULE-1-RC1-FOLLOWUP.md`.

## Module 1 Polish Sprint 02

Sprint 02 installs the final transparent headphones/waveform logo, adds playback-responsive logo animation, aligns the DJ portal with the Music Store, improves store hierarchy, adds dashboard CSV exports and calculated KPIs, and adds required-field navigation to Music Library editing.

The current launch checklist and explicitly deferred future features are maintained in `MODULE-1-POLISH-SPRINT-02.md`.

## Module 1 Polish Sprint 01

The Module 1 customer journeys have received a focused polish pass: streamlined homepage, basket/subtotal utility, artwork playback, persistent In Cart state, account-aware checkout preview, table-based My Music/Orders, additive social links, approved-DJ portal preview, DJ Database metrics and traffic-light Music Library.

The current Green/Amber/Red launch dependency table is maintained in `MODULE-1-POLISH-SPRINT-01.md` and should be updated after every Module 1 sprint.

## Module 1 Launch Candidate

Module 1 now concentrates the preview and launch path on Music Store + DJ Promo. The buyer cart, themed previews, corrected track hierarchy, dashboard inbox, DJ approval states, Music Library fallback, tabbed Settings and preview-mode data flow are implemented. See `MODULE-1-LAUNCH-CANDIDATE-CHANGES.md` for exact preview behaviour, Firebase/email setup and the remaining launch blockers.

Mixing & Mastering and Vinyl Cutting now default to hidden in fresh settings. They remain available inside the Business Dashboard and can be switched on later without restoring files.

The notification function queues email for `chris@playproductions.co.uk` through the Firestore `mail` collection. Actual delivery requires the Firebase Trigger Email extension (or an equivalent SMTP integration) to be installed and configured.

## Design Sprint 01

The public site now uses a centred top header with a persistent cart foundation. The owner area is the full-width **Business Dashboard**, with Music Library, mixing/vinyl project routes, DJ Access and expanded Settings. Detailed changes are recorded in `DESIGN-SPRINT-01-CHANGES.md`.

Editable business values are stored in `settings/business` when an authenticated owner saves them; local preview values use `playBusinessSettings` in browser storage. Final replacement imagery belongs in the documented `public/assets/` folders.

The cart is deliberately a foundation in this sprint. Live service/vinyl checkout, mixed-product fulfilment and email/payment automation still require the payment workflow phase before launch.

## Phase 1.2 design preview and page visibility

The public site now uses a fixed left-hand navigation on desktop and a contained slide-in menu on mobile. The headphones-only mark is in `public/headphones.svg`; colours and responsive refinements are in `public/design-v3.css`.

If Firebase is not configured, open `/admin.html` and choose **Preview dashboard layout**, or open `/portal.html` and choose **Preview customer portal**. Both use labelled sample data and cannot perform live account or admin actions.

Page visibility is managed in Admin → Settings. In local preview it is stored in the browser; for a signed-in owner it is also saved to `settings/site` in Firestore. Hidden pages disappear from navigation and homepage paths, while direct visits show a polite unavailable screen.

To create the owner account, enable Email/Password Authentication, create the user in Firebase Authentication, copy its UID, and create an empty Firestore document at `admins/{uid}`. Customer and DJ accounts require Firebase Authentication; approved DJs are created from the admin enquiry action rather than sharing one password.

## Important launch checks

- Test all Firebase rules with the Emulator Suite.
- Run Stripe and PayPal sandbox purchases before live credentials are enabled.
- Confirm service pricing and terms.
- Add privacy, terms, download licence and refund pages.
- Test account access, DJ login, mobile layouts and every protected download path.

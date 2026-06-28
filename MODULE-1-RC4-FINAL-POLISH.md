# Module 1 RC4 Final Polish

RC4 removes the remaining visible Module 1 polish issues across the active public experience, customer account and business dashboard.

## Preview-ready

- RC4 layout rules now load with the base public/admin styles, reducing the old-layout flash caused by late override injection.
- Disabled Mixing, Vinyl and Case Study routes are hidden from active public and admin navigation while direct unavailable pages remain available.
- Current lime transparent branding is used in public, unavailable and admin contexts.
- Music’s optional Latest Releases block is disabled for Module 1, avoiding its stale loading state.
- Music and DJ playback use white controls/progress without a lime artwork wash.
- DJ Promo now has store-style column labels, a single-row desktop action area, More Details and commercial-use guidance.
- Track related music is restricted to same-genre results and commercial use remains above it.
- DJ and enquiry forms have restrained, aligned submit buttons.
- Let’s Work shows six settings-backed social/listening links with icons.
- Portal copy/mapping and narrow-screen table handling are refined.
- Checkout steps adapt from four columns to two and then one on narrow screens.
- Admin includes corrected missing-field targeting, settings-backed social links, saved-state feedback and visible expandable order notes.

## Settings source of truth

The Social Links settings section manages Instagram, Facebook, TikTok, Spotify, Apple Music and SoundCloud. Values save locally in preview and to `settings/site.socialLinks` when authenticated Firebase permissions are available. Footer and Let’s Work links consume these values.

## Chris to-do

- Rewrite final homepage copy.
- Supply/confirm the final `public/hero.jpg`.
- Confirm all social/listening URLs in Settings.
- Confirm download licence wording.
- Confirm DJ approval wording.
- Complete live Firebase/Auth, storage, payment, email and analytics setup.

## Live setup and launch blockers

| Priority | Item | State / action |
| --- | --- | --- |
| Launch | Firebase/Auth production project | Connect and test real customer/DJ accounts |
| Launch | Storage files | Upload MP3/WAV masters and verify all stored paths |
| Launch | Stripe/PayPal | Add live credentials, webhooks and fulfilment tests |
| Launch | Transactional email | Configure provider and test secure setup messages |
| Pre-launch | Responsive visual review | Test deployed preview on desktop, tablet and mobile |
| Content | Final copy/licence/DJ wording | Chris to confirm |
| Post-launch | Analytics/Search Console | Configure after public launch |


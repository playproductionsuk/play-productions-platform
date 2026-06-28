# Module 1 RC3 Final Fixes

RC3 concentrates the active launch experience on Music, DJ Promo, Let’s Work, customer accounts and the business dashboard.

## Preview-ready

- Module visibility is shared by public navigation, mobile navigation, footer, homepage cards and admin module routes.
- Footer destinations now use the supplied Facebook, Spotify, Apple Music and SoundCloud links.
- The responsive menu contains Home, Music, DJ Promo, Let’s Work, My Account, Cart and DJ Login.
- Homepage and application copy use wider readable containers. Trust items have restrained line icons.
- Music has one catalogue introduction, stable action sizing, white playback treatment and a commercial enquiry panel.
- Track pages have a standard footer and place commercial use before genuinely related music.
- DJ Promo shares store filters, playback and mini-player patterns, with More Details and clearly explained preview downloads.
- Customer portal preview uses corrected BPM/source mappings and separate MP3/WAV columns.
- Dashboard includes operational attention items, setup status, Module 1 visibility, key dropdown, comprehensive music export and DJ notes export.
- Checkout release-update consent remains on the customer record (`newsletterConsent`); DJ consent/access remains on DJ applications and `djAccess`.

## Simple asset replacement

The homepage hero image is `public/hero.jpg`. Replace it with another optimised wide JPG using the same filename.

The current brand logo is `public/assets/branding/play-headphones-logo.png`.

## Requires live setup/testing

| Area | RC3 state | Live requirement |
| --- | --- | --- |
| Firebase/Auth | Integration present | Confirm production project, domains and account emails |
| Storage/downloads | Signed download flow present | Upload MP3/WAV files and verify paths |
| Stripe/PayPal | Checkout foundation present | Add live credentials, webhooks and fulfilment testing |
| Email | Secure DJ invitation flow present | Configure provider and confirm delivery |
| DJ approval | Preview behaviour documented | Test approval, setup email, login and downloads after deployment |
| Analytics/Search Console | Deliberately deferred | Add after launch |

## Module 1 launch blockers

| Priority | Blocker | Owner/action |
| --- | --- | --- |
| Launch | Production Firebase/Auth configuration | Connect and test production project |
| Launch | Payment credentials and webhook fulfilment | Configure Stripe/PayPal and complete test orders |
| Launch | Storage master/MP3 paths | Upload sale and promo files |
| Launch | Transactional email delivery | Configure sender and test DJ/customer messages |
| Pre-launch QA | Responsive visual pass on deployed preview | Test desktop, tablet and mobile |
| Post-launch | Analytics and Search Console | Configure after the public launch |

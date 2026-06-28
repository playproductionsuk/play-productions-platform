# Module 1 RC5 Launch Blockers

RC5 is limited to the remaining buyer, DJ and visible launch blockers.

## What works in preview

- Public UI uses one ordered, versioned stylesheet bundle with Firebase revalidation headers.
- Header utility styling keeps the cart summary/count clear and separates account actions.
- Disabled Module 2 routes are hidden across active public/admin surfaces.
- Shared intro copy widths align more naturally with page content.
- Music/DJ artwork remains visible with white play/pause/progress treatment.
- Track Buy Digital Download adds the item to the shared cart, updates the header and prevents duplicates.
- Music, DJ Pool and promo detail commercial calls-to-action use the dedicated commercial enquiry modal.
- Commercial use appears above same-genre Related Music.
- DJ Promo uses the Music Store row, filter, player and responsive foundations with download controls replacing purchase controls.
- Let’s Work displays six restrained settings-backed social/listening links.
- The obsolete portal source-column enhancer was removed so BPM and Purchase Type map to their intended columns.
- Settings navigation now has seven explicit sections without the competing old Social Links tab.
- Admin navigation is presented as a horizontal top control bar and uses the lime logo.
- Music and DJ mini players are constrained to the viewport.

## Live setup still required

- Production Firebase/Auth configuration and authorised domains.
- Real customer registration/login and purchased-library testing.
- Stripe/PayPal live credentials, webhook fulfilment and receipts.
- Storage MP3/WAV uploads and path verification.
- Transactional email provider and DJ setup-link delivery.
- End-to-end DJ approval, password setup, login, forgotten password and download testing.

## Launch blocker table

| Blocker | RC5 state | Required next action |
| --- | --- | --- |
| Old-layout refresh flash | Code fix complete | Deploy, hard refresh once, verify Firebase Preview |
| Buyer cart flow | Preview-ready | Test checkout/payment/webhook live |
| Commercial enquiry routes | Preview-ready | Confirm Firebase enquiry write/email notification |
| DJ promo downloads | UI/API-ready | Upload files and test signed downloads with approved account |
| Customer My Music | Mapping fixed | Verify against real paid and DJ promo order documents |
| Authentication/email | Integration-ready | Configure production services and complete end-to-end tests |
| Responsive visual QA | Static rules complete | Verify deployed preview on target phones/tablets |


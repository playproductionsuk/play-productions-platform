# Module 1 RC7 Live Readiness

## Critical fix

`rc6-admin.js` attempted to observe `#moduleDjList` before that optional Module 1 view existed. Passing `null` to `MutationObserver.observe()` threw an uncaught `TypeError` and stopped the admin startup chain.

The observer and initial enhancement now run only when the target exists. RC7 also safely watches the existing `.admin-main` container and attaches the DJ status editor if the DJ database is created later.

## Public fixes

- Current-UI first-paint guard and versioned RC7 bundle remain active.
- Header utility order is Cart summary, Checkout, separator, My Account and DJ Login.
- Disabled services remain hidden in desktop and hamburger navigation.
- Shared hero/intro widths now allow up to 900px of readable copy.
- Music columns retain stable Price alignment with narrower action controls; the empty Actions heading is removed.
- Track detail pages initialise as `In Cart` when the selected item already exists in the shared cart.
- Promo-context track pages return to the DJ Promo Pool rather than public Music.
- DJ Application now shows the six settings-backed public social/listening links.
- DJ Promo search and filters use the same five-control grid and responsive rules as Music.
- Let’s Work links fill the available width evenly and its submit action remains right-aligned.
- Portal MP3/WAV alignment and mobile card rules remain active.

## Admin fixes

- Admin navigation moves into the lime-logo top header only while the admin portal is open.
- System Setup Status is restored as a stable dashboard card/grid.
- Late-created DJ rows receive editable Pending, Approved and Rejected status controls.
- Settings continue to use the seven explicit sections and current public-link source.

## Live setup blockers

| Area | Status | Required live action |
| --- | --- | --- |
| Admin startup | Code-fixed | Deploy and open authenticated/preview dashboard |
| Firebase/Auth | Integration present | Configure production project and domains |
| Checkout | Preview foundation | Configure Stripe/PayPal and test webhooks |
| Downloads | Signed flow present | Upload files and verify Storage paths |
| Email | Setup/reset flow present | Configure provider and test delivery |
| DJ workflow | UI/API ready | Test request, approval, setup, login and downloads |
| Buyer workflow | UI ready | Test account, payment, fulfilment and re-download |


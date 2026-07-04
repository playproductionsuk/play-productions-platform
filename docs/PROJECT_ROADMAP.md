# Play Productions Project Roadmap

## 1. Current stable live state

- Production admin works at `/admin.html`; `/admin.html?preview=1` remains the emergency preview fallback.
- DJ applications, approval/rejection, invitation email, password setup and approved-DJ login work.
- The protected Promo Crate and MP3-only downloads work for normal approved promo tracks.
- DJ Applications CSV export works.
- Music Library and Track Admin support editing, readiness, asset assignment and preview playback.
- Public catalogue, Coming Soon handling, track details, Preview, More Details and Add to Cart work.
- Customer and approved-DJ navigation are separated by the strict `users/<uid>.djAccess === true` rule.
- Sign Out clears Firebase Auth and returns users to Home.
- The auth-aware homepage hero, studio image and role-specific CTAs are live accepted and stable.
- Homepage content and brand polish are live accepted and stable:
  - Latest Tracks.
  - About Play Productions.
  - Stay Connected / Join the List.
  - Commercial Inquiry.
- The Browse Music hero is live accepted. Its confirmed release reference is `stable-preview-browse-music-hero-20260704-2042`; no separate stable-live hero tag exists.
- The Browse Music catalogue layout is live accepted and stable:
  - `Home › Browse Music` breadcrumb.
  - One `Catalogue` heading.
  - Internal approximately five-track scroll window.
  - Sticky desktop column header.
  - Commercial Inquiry is easier to reach.

Known release blocker before trusted DJ invites:

- A promo-only track can be hidden from Browse Music and shown in the Promo Crate, but its visible `Download MP3` action can fail with `This promo download is not available for that format`.
- Fix this without weakening Firebase ID-token protection, exposing private Storage paths or adding WAV access for DJs.

## 2. Current strategic priority

### DJ-first growth

Prepare Play Productions for the first 1–3 trusted DJ invites. The next sprint must finish the remaining public entry pages, correct logged-in DJ behaviour, prove promo-only protected downloads and complete one clean end-to-end DJ journey.

DJ access, delivery, tracking, outreach and useful promo metrics remain ahead of the full paid customer account journey.

## 3. Recently completed / stable milestones

- Multi-page public platform and recovered admin shell.
- Stable live DJ application, approval and invitation workflow.
- Approved-DJ Promo Crate with strict Firestore access checks.
- Protected MP3 downloads using Firebase ID tokens; no public private-storage paths.
- Music Library and Track Admin foundation, readiness, asset mapping and preview-player controls.
- Single, deduplicated DJ Applications CSV export.
- Stable Coming Soon catalogue-row behaviour.
- Strict customer-versus-DJ navigation separation.
- Sign Out redirect to Home.
- Auth-aware homepage hero and role-specific CTAs.
- Homepage content and public brand polish.
- Browse Music hero and catalogue refinement.

Confirmed release references:

- `stable-live-dj-invite-readiness-access-nav-20260703-1930`
- `stable-live-public-site-coming-soon-row-20260704-1248`
- `stable-live-signout-home-redirect-20260704-1310`
- `stable-live-auth-aware-home-hero-ctas-20260704-1459`
- `stable-live-public-content-brand-polish-20260704-1649`
- `stable-preview-browse-music-hero-20260704-2042`
- `stable-preview-browse-music-catalogue-layout-20260704-2124`
- `stable-live-browse-music-catalogue-layout-20260704-2128`

## 4. Immediate next tasks

1. Tidy the remaining public pages before trusted DJ invites:
   - Request DJ Access page.
   - Let’s Work / Commercial Inquiry page.
2. Fix required logged-in DJ experience issues:
   - Approved-DJ homepage Latest Tracks should show `Download MP3` instead of Add to Cart and hide prices.
   - Promo-only tracks hidden from Browse Music but visible in Promo Crate must allow approved-DJ MP3 download.
   - Promo Crate wording, heading and first-use guidance.
   - DJ detail/back links/breadcrumbs.
   - Download MP3 reassurance copy.
   - Mobile Promo Crate and detail layout.
   - Empty, error and loading states.
   - No accidental shop/customer controls.
   - No WAV or buy buttons.
3. Confirm test-account separation:
   - Admin account.
   - Approved DJ account.
   - True non-DJ customer account.
4. Investigate customer login/logout only using a true non-DJ customer account.
5. Run a final trusted DJ invite smoke test:
   - Public Request DJ Access.
   - Application submission.
   - Approval and invitation email.
   - Password setup.
   - Approved DJ login.
   - Promo Crate.
   - Promo-only hidden-from-shop track appears and downloads MP3.
   - Preview and More Details.
   - Protected MP3 download.
   - DJ detail remains MP3-only with no WAV action.
   - Sign Out returns Home.
   - Mobile and hamburger check.
   - No demo/preview bypass.
6. Prepare the first trusted DJ invite wording:
   - Email/message.
   - What to expect.
   - Login and download instructions.
   - Requested support/promo action.
7. Then start the Phase B speed/legacy cycling audit-first pass.

## 5. Priority roadmap

### Phase A — Final DJ Invite + Public Site Quality

Completed Phase A public polish:

- Homepage content, studio hero, auth-aware CTAs and role-aware navigation.
- Latest Tracks, About, Stay Connected / Join the List and Commercial Inquiry.
- Shared Play Productions typography, button, logo, header and footer refinements.
- Customer newsletter interest kept separate from DJ applications.
- Public-only DJ Login and Admin Login treatment.
- Single Promo Crate heading.
- Browse Music hero with supplied studio image and accepted copy.
- Browse Music breadcrumb, single Catalogue heading, five-track internal scroll and sticky desktop header.
- Public catalogue, Coming Soon, track-detail and cart behaviour preserved.

Remaining Phase A work:

- Request DJ Access page polish.
- Let’s Work / Commercial Inquiry page polish.
- Approved-DJ homepage Latest Tracks behaviour.
- Promo-only protected MP3 download fix.
- Logged-in DJ homepage, Promo Crate and detail experience polish.
- Test-account separation and customer-login validation.
- Final trusted DJ invite smoke test.
- Trusted DJ invite pack.

### Next sprint — DJ Invite + Logged-In Experience

- Tidy Request DJ Access:
  - Hero/header style, copy, form labels and mobile layout.
  - Submit/validation, success and error states.
  - Clear application, approval and invitation expectations.
  - Remove stale `DJ Promo` terminology where `Request DJ Access` or `Promo Crate` is correct.
  - Preserve the existing application, approval/rejection and invitation-email flow.
- Tidy Let’s Work / Commercial Inquiry:
  - Hero/header style, wording, form labels and mobile layout.
  - Submit/validation, success and error states.
  - Align copy with Commercial Inquiry panels on Home, Browse Music and detail pages.
  - Preserve the existing enquiry flow.
- Make homepage Latest Tracks DJ-aware only when `users/<uid>.djAccess === true`:
  - Hide prices.
  - Replace Add to Cart with `Download MP3`.
  - Keep Preview and More Details.
  - Never show WAV/master, Buy or Add to Cart actions.
  - Leave public/customer and Coming Soon behaviour unchanged.
- Support promo-only tracks:
  - Admin can show a track in Promo Crate while hiding it from the public shop.
  - Approved DJs can preview, open details and download its protected MP3.
  - Public/customer Browse Music does not show it.
  - Diagnose shop-visibility gates, MP3 field mapping and Track Admin/renderer/endpoint flag mismatches.
  - Preserve Firebase ID-token checks and private Storage paths.
  - Keep DJ delivery MP3-only.
- Separate and document test accounts:
  - Admin.
  - Approved DJ.
  - Normal non-DJ customer.
  - Investigate the `chris@utensils.co.uk` customer sign-in issue only after confirming the account role.
  - A true non-DJ customer must see Cart, Checkout, My Account and Sign Out, but not Promo Crate or Request DJ Access.
- Polish the logged-in DJ journey:
  - Clear Promo Crate landing and first-use copy.
  - Explain that previews may be limited while downloads are full MP3s.
  - Clear Download MP3 reassurance and support/contact route.
  - Correct back links and breadcrumbs.
  - Mobile view plus empty, error and loading states.
  - No accidental customer/shop controls, WAV or buy buttons.
- Run the full journey:
  - Request access → approve → invite → set password → login → Promo Crate → preview/download → detail page → sign out.
- Prepare the trusted DJ invite pack:
  - Short email/message.
  - What to do after login.
  - Download instructions.
  - Friendly social/support ask.
  - Contact route if something breaks.

### Phase B — Speed, Legacy Cycling + Performance Cleanup

Starts after the DJ invite/logged-in sprint unless a major blocker appears.

Goal: stop stale screens and old layouts flashing while improving perceived speed.

- Audit public, DJ, customer and admin startup/render chains.
- Identify each final renderer and responsibility.
- Map duplicated imports, delayed callbacks and Firestore reads.
- Remove obsolete layers one responsibility at a time.
- Prevent stale login, dashboard, portal and Promo Crate flashes.
- Measure page weight and startup timing before and after.
- Work preview-first with small rollback-safe changes.
- No broad rewrite, MutationObserver/timing-loop fix or admin-startup regression.

### Phase C — DJ Contacts, Download Tracking + Promo Metrics

- Expand contacts for DJs, radio, labels, blogs and playlist curators.
- Track DJ downloads and download history by DJ/contact.
- Add track interest, DJ engagement, campaign and outreach metrics.
- Track consent/source, support notes, plays, feedback, social tags and follow-up status.

### Phase D — SEO, Analytics + Search Setup

- Audit titles, descriptions, canonical URLs and indexing.
- Improve track-detail SEO and Open Graph/social previews.
- Generate and submit a sitemap and review `robots.txt`.
- Configure Search Console and agreed privacy-conscious analytics.

### Phase E — Admin Productivity + Catalogue Management

- Admin asset open/copy/export/download actions.
- Admin-only full MP3 preview where useful.
- Missing Data inline editing and stronger filtering/search.
- Settings-managed genre, style, subgenre, mood and tag lists.
- Improve Add Track, bulk updates, catalogue defaults and operational widgets.
- Newsletter admin/export workflow while keeping customer newsletter and DJ promo lists separate.

### Phase F — Customer Purchase + Account Flow

- Smoke-test and harden customer registration, login/logout, cart and checkout.
- Complete Stripe/payment and fulfilment only when deliberately scheduled.
- Add purchase history, account downloads and paid MP3/WAV delivery.
- Store licence/order records and reporting.

### Phase G — Storage + Maintenance

- Storage usage and orphan-asset audits.
- Asset replacement history and safe cleanup tools.
- Firebase API-key restrictions and GitHub/dependency alert cleanup.
- Firestore/Storage rules and operational health reviews.

### Phase H — Custom Vinyl Record Cutting

- Build before Mixing & Mastering.
- Public service page, content/pricing and quote/project-intake flow.
- Admin project tracking.

### Phase I — Mixing & Mastering

- Launch only when ready to present and fulfil professionally.
- Public stereo mixing, mastering and mix-plus-master page.
- Custom quote/project intake, reference upload and admin tracking.

## 6. Future backlog

### Public experience

- Persistent cross-page preview player.
- Remaining public style/button consistency.
- Additional storytelling and social proof.
- About imagery:
  - Foreground square image, ideally at least 1200 × 1200.
  - Optional wide background image, 1920 × 1080 or larger, with a dark readability treatment.

### DJ and promotion

- Promo campaigns per track.
- DJ feedback, plays, support notes and social-tag tracking.
- Release notification queue/send workflow when deliberately designed.

### Customer and sales

- Customer preferences, recovery and account/download polish.
- Paid fulfilment retries and support tooling.
- Commercial/exclusive-rights enquiry tracking without complex licensing.

### Admin and operations

- Advanced release checklist reporting.
- Contact segmentation and campaign exports.
- Storage maintenance and asset lifecycle tools.

## 7. Known issues / watch-outs

- Promo-only tracks can currently fail MP3 download despite appearing in Promo Crate; this blocks trusted DJ invitations.
- Do not require public-shop visibility for a valid approved-DJ promo download.
- Confirm MP3 field/path mapping and Track Admin visibility flags before changing the protected endpoint.
- Do not expose private Storage paths or weaken Firebase ID-token checks.
- Keep DJs MP3-only; preserve WAV/master fields for paid fulfilment and archive use.
- Use separate admin, approved-DJ and non-DJ customer test accounts.
- Old RC/module layers can cause visual cycling or repeated work; identify the final owner before changing UI.
- Do not reintroduce `admin-live-fields.js`, `coreReady` waiting or `Live admin data timed out`.
- Do not introduce MutationObserver-based fixes or persistent timing loops.
- Preserve the current admin login/startup and no-black-screen guard.
- Avoid broad rewrites; use small responsibility-based preview changes.

## 8. Deployment and safety rules

- Preview first:

  ```powershell
  firebase.cmd hosting:channel:deploy preview
  ```

- Deploy production Hosting only after preview acceptance:

  ```powershell
  firebase.cmd deploy --only hosting
  ```

- Deploy Functions only when `functions/index.js` changes.
- Keep commits small, scoped and easy to reverse.
- Create stable-preview tags after preview acceptance and stable-live tags only after live smoke testing.
- Never commit service-account keys, secrets or credentials.

## 9. Do-not-touch rules

Unless explicitly requested, do not change:

- Admin login or startup flow.
- `public/admin.html`, `public/admin-entry.js` or `public/admin-live-login.js`.
- DJ approval, rejection or invitation-email logic.
- DJ promo authentication or protected download backend.
- Checkout/payment backend.
- `functions/index.js`.
- Music Library save/export behaviour.
- Preview-player timing.
- Firestore or Storage rules.

For every future pass:

- Inspect current stable files instead of relying on old context.
- Identify the final render/data owner before editing.
- Preserve working IDs, paths, aliases and backend gates.
- Update this roadmap when milestones, issues or priorities change.

## Archived historical module notes

Detailed Module 2 and public-polish implementation history is available in Git history. `docs/ADMIN_STARTUP_AUDIT.md` remains the deep reference for admin startup, renderer and recovery details.

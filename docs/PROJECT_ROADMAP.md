# Play Productions Project Roadmap

## 1. Current stable live state

- Production admin works at `/admin.html`; `/admin.html?preview=1` remains the emergency preview fallback.
- DJ applications, approval/rejection, invitation email, password setup and approved-DJ login work.
- The protected Promo Crate and MP3-only DJ downloads work.
- DJ Applications CSV export works.
- Music Library and Track Admin support track editing, readiness, asset assignment and preview playback.
- Public catalogue, Coming Soon handling, track details and Add to Cart work.
- Customer and approved-DJ navigation are separated by the strict `users/<uid>.djAccess === true` rule.
- Sign Out clears Firebase Auth and returns users to Home.
- The auth-aware homepage hero, studio image and role-specific CTAs are deployed and pending final live validation.

## 2. Current strategic priority

### DJ-first growth

The near-term goal is to make Play Productions ready for 1–3 trusted DJ invites.

Trusted DJs should be able to:

- Apply and receive an approval invitation.
- Create their password and sign in.
- Browse the Promo Crate.
- Preview and download protected MP3 promos without manual file sending.
- Promote tracks online and on social media.

DJ access, delivery, tracking, outreach and useful promo metrics take priority over the full paid customer account journey.

## 3. Recently completed / stable milestones

- Multi-page public platform and recovered admin shell.
- Stable live DJ application and invitation workflow.
- Approved-DJ Promo Crate with strict Firestore access checks.
- Protected MP3 downloads using Firebase ID tokens; no public private-storage paths.
- Music Library and Track Admin foundation, asset mapping, readiness and preview-player controls.
- Single, deduplicated DJ Applications CSV export.
- Public Coming Soon catalogue-row polish.
- Customer-versus-DJ navigation separation.
- Sign Out redirect to Home.
- New Play Productions studio hero image and auth-aware homepage CTAs:
  - Public: Browse Music + Request DJ Access.
  - Customer: Browse Music.
  - Approved DJ: Promo Crate.

Useful release references:

- `stable-live-dj-invite-readiness-access-nav-20260703-1930`
- `stable-live-public-site-coming-soon-row-20260704-1248`
- `stable-preview-signout-home-redirect-20260704-1305`
- `stable-preview-auth-aware-home-hero-ctas-20260704-1421`
- `stable-live-public-content-brand-polish-20260704-1649`

## 4. Immediate next tasks

1. Complete Phase A.3.5 Browse Music hero and final A.3.4 acceptance checks.
2. Run the final trusted DJ invite smoke test:
   - Public Request DJ Access.
   - Invitation email and password setup.
   - Approved DJ login and Promo Crate.
   - Preview, More Details and protected MP3 download.
   - MP3-only DJ detail page with no WAV action.
   - Sign Out returns Home.
   - Mobile/hamburger check with no demo bypass.
3. Prepare the first trusted-DJ invite message, email wording and “what to expect” notes.
4. Complete a small public-quality pass only where needed for trusted invites:
   - Remove duplicate track-detail genre/metadata and stale wording.
   - Check breadcrumbs/back links and public-versus-DJ terminology.
   - Review mobile CTA/button consistency.
5. Start an audit-only site-wide speed and legacy-cycling review before removing any old layer.

## 5. Priority roadmap

### Phase A — Final DJ Invite + Public Site Quality

Goal: make the public and DJ experience polished enough for trusted DJ use.

- Phase A.2 Public Content + Brand Polish is live accepted and stable-live tagged:
  - Replaced the repetitive homepage offer boxes with Latest Tracks, About Play Productions and Join the List sections.
  - Latest Tracks reuses the existing catalogue, cart and preview-player utilities.
  - Join the List initially used a safe contact CTA with no automatic email collection.
  - Removed the duplicate top-of-page genre on public and DJ track details while retaining metadata and release date.
  - Aligned public/customer/DJ typography and key account buttons with the established action-button style.
  - Standardised visible public, footer and safe admin-header logo treatment to the Play Productions lime.
- Phase A follow-up refinements:
  - Latest Tracks: centre card actions, move price to the right where space allows and reduce card height/scale, especially on mobile. Blend the future reference style with the existing Play Productions button system.
  - About Play Productions: remove duplicated heading treatment, prepare an image-friendly split layout and add a suitable image later.
  - Join the List: use customer newsletter wording only—release updates and occasional Play Productions announcements. Keep DJ promo communications separate.
  - Header/footer typography: increase navigation-link size, align it with hero/action typography and standardise footer headings and links.
  - Button system: align Checkout, My Account, DJ Login and Sign Out sizing with hero/action buttons; resize the cart only as needed for balance.
- Phase A.3 Public Style System + Newsletter Foundation is in preview:
  - Increased and aligned header navigation, footer typography and account/action button sizing.
  - Restored the accessible inline cart icon in the final auth-aware header renderer.
  - Refined Latest Tracks card proportions, metadata/price alignment and centred actions.
  - Reduced About to one heading and prepared an image-friendly split layout without inventing an image.
  - Added a customer newsletter form using the existing validated anonymous enquiry write path with `type` and `listType` set to `customer-newsletter`.
  - Customer newsletter interest is separate from DJ applications and never changes `djAccess`.
  - No automated email sending or dedicated newsletter-admin workflow exists yet; those remain future work.
- Phase A.3.1 Public Style/Layout Correction is in preview:
  - Refined the accessible cart control and public `Customer Login` label.
  - Compacted Latest Tracks, restored square artwork and balanced card actions.
  - Changed the About heading and layout, with a safe mobile More Info control.
  - Foreground About imagery should use a square source (recommended at least 1200 × 1200); a future section background should use a wide landscape source (recommended 1920 × 1080 or wider) with a dark readability treatment.
  - Refined Stay Connected form placement and mailing-list success wording.
  - Added a Commercial Inquiry card routed to the existing Let’s Work contact flow.
  - No backend, payment, admin or newsletter automation changes were introduced.
- Phase A.3.2 Public Layout/Button + DJ Login Correction is in preview:
  - Refined header action separators and reduced the cart control width.
  - Kept square Latest Tracks artwork while balancing desktop and mobile action sizing.
  - Standardised homepage section headings to the white hero-heading type treatment.
  - Tightened newsletter consent, button and mailing-list success presentation.
  - Reused the existing Browse Music `commercial-store-panel` pattern and commercial contact route on Home.
  - Reduced and aligned the Customer Portal sign-in action.
  - Simplified DJ Login to one heading, a direct Home › DJ Login breadcrumb, clearer access guidance and a compact two-action form row.
  - No authentication rules, approval checks, backend, payment, admin or download logic changed.
- Phase A.3.3 Header Architecture, Typography + Commercial Panel Correction is in preview:
  - Reordered public/customer navigation so DJ Login and Admin Login are main navigation links while Cart, Checkout and customer account actions remain grouped on the right.
  - Approved DJs retain protected Promo Crate navigation, a public Admin Login link and Sign Out as the only right-side action.
  - Reused the measured hero heading treatment—Oswald 400, `1.02` line-height, `-.045em` letter-spacing and white text—for section, login and customer-account headings.
  - Removed the duplicate Customer Portal heading treatment and moved an honest customer release-update preference panel above My Music; preference persistence remains future work.
  - Hardened customer and DJ sign-out redirects to Home with `finally` handling.
  - Refined Stay Connected labels, consent wording and right-aligned action placement.
  - Standardised homepage, Browse Music and track-detail commercial panels to one heading, full-width copy and a right-aligned enquiry action.
  - Improved DJ Login body typography while preserving Firebase approval and password-reset behaviour.
  - No backend, payment, admin startup, approval or protected-download logic changed.
- Phase A.3.4 Header Button State + Promo Crate Heading Correction is in preview:
  - Restored boxed DJ Login and Admin Login actions in the public logged-out main navigation.
  - Removed the remaining divider before Cart.
  - Limited Admin Login to the public logged-out state; customer and approved-DJ desktop/mobile navigation omit it, and it is not part of the shared footer.
  - Reduced the Promo Crate catalogue heading to one `Promo Crate` heading using the measured Oswald hero treatment.
  - Tightened Stay Connected padding and empty-status spacing while moving Join the List slightly lower.
  - No authentication, approval, download, backend, payment or admin-startup logic changed.
- Phase A.3.5 Browse Music Hero is in preview:
  - Added a hero-style Browse Music introduction using the supplied studio image at `public/assets/browse-music-hero.png`.
  - Uses the accepted Oswald heading treatment and the copy: “Original releases for personal listening and private use. Preview tracks, add them to your cart and download securely.”
  - Preserves catalogue filters, Preview, More Details, Add to Cart and Coming Soon behaviour below the hero.
  - Retains A.3.4 public-only Admin Login, boxed public DJ/Admin Login links, divider-free Cart group and single Promo Crate heading.
  - No authentication, protected-download, backend, payment or admin-startup logic changed.
- Keep the Phase B speed/legacy cycling review as the next high-priority audit-first pass.
- Finish and live-tag the auth-aware homepage release.
- Complete the final trusted-DJ journey and invite pack.
- Clean up public/DJ track-detail metadata, headings, wording and navigation.
- Check the full public/customer/DJ mobile and hamburger journey.
- Standardise brand typography across the public header, footer, hero CTAs, customer portal, DJ portal and admin header.
- Align Checkout, My Account, DJ Login, Sign Out and account controls with the stronger hero/action button system.
- Keep the existing cart concept, adjusting its size only when the wider button system is standardised.
- Replace yellow logo treatments with the Play Productions lime across public, footer, admin, DJ and customer surfaces.
- Keep Coming Soon and public catalogue behaviour stable.
- Make the homepage leaner:
  - Remove or redesign the Music/listen, DJ promo/DJs and Create/Let’s Work boxes below the hero.
  - Put Latest Tracks directly below the hero.
  - Add a concise About Play Productions section.
  - Add a newsletter/join-the-list section.
  - Preserve role-aware hero CTAs.

### Phase B — Speed, Legacy Cycling + Performance Cleanup

Goal: stop stale screens and old layouts flashing while improving perceived speed.

- Audit startup and render chains for public, DJ, customer and admin pages.
- Identify the final renderer and responsibility of each RC/module layer.
- Isolate or remove obsolete layers one responsibility at a time.
- Reduce duplicated imports, renderers, delayed callbacks and Firestore reads.
- Prevent stale login, dashboard, portal and Promo Crate flashes.
- Measure page weight and startup timing before and after changes.
- Work preview-first with small rollback-safe changes; do not perform a broad rewrite.

### Phase C — DJ Contacts, Download Tracking + Promo Metrics

Goal: grow DJ promotion and make engagement measurable.

- Expand contacts for DJs, radio, labels, blogs and playlist curators.
- Track DJ downloads and download history by DJ/contact.
- Add track-level interest and DJ engagement statistics.
- Add Promo Crate usage metrics and a lightweight promo dashboard.
- Track campaign/outreach notes, consent/source, follow-up status and responses.
- Add useful customer behaviour metrics only where inexpensive and relevant.

### Phase D — SEO, Analytics + Search Setup

Goal: make the public site discoverable and measurable.

- Audit page titles, descriptions, canonical URLs and indexing.
- Improve track-detail SEO and Open Graph/social previews.
- Generate and submit a sitemap.
- Add or review `robots.txt`.
- Configure Google Search Console and indexing checks.
- Configure GA4 or an agreed privacy-conscious analytics setup.
- Add lightweight SEO/analytics reporting where it supports decisions.

### Phase E — Admin Productivity + Catalogue Management

Goal: improve day-to-day admin work after DJ/public growth basics.

- Admin asset open/copy/export/download actions.
- Admin-only full MP3 preview where useful.
- Missing Data inline editing and stronger filtering/search/refresh.
- Settings-managed genre, style, subgenre, mood and tag lists.
- Improve Add Track, bulk updates and catalogue defaults.
- Continue Track Admin and Music Library polish.
- Add lightweight business, release and operational dashboard widgets.

### Phase F — Customer Purchase + Account Flow

Goal: complete the paid customer journey after DJ, performance and marketing foundations.

- Harden cart, checkout and Stripe/payment flow.
- Add purchase history and reliable account downloads.
- Deliver paid MP3/WAV files and order/download emails.
- Store licence/order records.
- Add sales, fees, revenue and fulfilment reporting.

### Phase G — Storage + Maintenance

Goal: keep the platform safe and maintainable.

- Storage usage and orphan-asset audits.
- Asset replacement history and safe cleanup tools.
- Firebase API-key restrictions and GitHub/dependency alert cleanup.
- Firestore/Storage rules reviews and operational health checks.

### Phase H — Custom Vinyl Record Cutting

Goal: build Vinyl Cutting before Mixing & Mastering.

- Public service page and approved content/pricing.
- Quote/request and project-intake flow.
- Admin project tracking.

### Phase I — Mixing & Mastering

Goal: launch only when the service is ready to present and fulfil professionally.

- Public stereo mixing, mastering and mix-plus-master page.
- Custom quote/project intake and reference upload.
- Admin project tracking.

## 6. Future backlog

### Public experience

- Persistent cross-page preview player.
- Wider button/font consistency after Phase A.
- Additional homepage storytelling and social proof.
- Final detail-page and catalogue visual refinements.

### DJ and promotion

- Promo campaigns per track.
- DJ feedback, plays, support notes and social-tag tracking.
- Release notification queue/send workflow when deliberately designed.

### Customer and sales

- Customer preferences, downloads and account recovery polish.
- Paid fulfilment retries and support tooling.
- Commercial/exclusive-rights enquiry tracking without complex licensing.

### Admin and operations

- Advanced release checklist reporting.
- Contact segmentation and campaign exports.
- Storage maintenance and asset lifecycle tools.

## 7. Known issues / watch-outs

- Old RC/module layers can still cause visual cycling or repeated work. Audit the final renderer before changing UI.
- Do not reintroduce `admin-live-fields.js`.
- Do not reintroduce `coreReady` waiting logic.
- Do not reintroduce “Live admin data timed out”.
- Do not introduce MutationObserver-based fixes or persistent timing loops.
- Preserve the current admin login/startup and no-black-screen guard.
- Preserve strict DJ approval: only `users/<uid>.djAccess === true` enables Promo Crate mode.
- Preserve protected MP3 downloads and do not expose private Storage paths.
- Preserve WAV/master fields for paid fulfilment and archive use; DJs remain MP3-only.
- Avoid large rewrites. Make small, responsibility-based, preview-tested changes.

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

Detailed Module 2 implementation history has been condensed. Git history and `docs/ADMIN_STARTUP_AUDIT.md` remain the references for deep startup, renderer and recovery details.

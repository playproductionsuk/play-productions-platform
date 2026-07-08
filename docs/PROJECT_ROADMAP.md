# Play Productions Project Roadmap

## Active next task — Admin Track Management Stabilisation

Status: Phase B.2, Phase B.3 and the first Admin Track Management Save/Edit identity fix were deployed to production Hosting on 7 July 2026. A live Add Track blocker was then reported, fixed on preview and manually accepted. The containment fix is ready for production Hosting release.

Admin track save/edit identity fix:

- Symptom: editing an existing track, such as Ladida, changing preview start/duration and clicking Save Draft could create a duplicate/new Firestore track document instead of updating the existing one.
- Root cause: Firestore-loaded tracks keep the real document key in `firestoreId`, while the admin editor was using the normalised public/legacy `id` as `#editingId` and save target. Legacy IDs can differ from Firestore document IDs, so edit-mode saves could fall back to a new document.
- Fix in preview candidate: track action buttons, readiness/missing-data edit paths, editor state and Save Draft now resolve the Firestore document ID first, with slug/legacy fallbacks only for locating the row. Existing-track saves write back to the existing Firestore document; new-track saves continue to create a new slug-based draft/document.
- Validation hardening: title is now required before saving, and Website + Coming Soon/Published required-field failures mark the relevant fields with the existing red required styling before any Firestore write.
- Preview acceptance: passed. Existing track tested: La Di Da. Catalogue count stayed at 7 tracks throughout, so no duplicate was created.
- Persistence confirmed: preview start/duration changed from 28s / 30s to 29s / 31s, saved successfully, reopened correctly, then reverted to 28s / 30s and confirmed again.
- Required Title validation confirmed: Add Track save was blocked, red/error state appeared, and the required tooltip was shown.
- Add New Track draft creation was intentionally not tested to avoid creating clutter.
- Public B.2/B.3 regression remained healthy: Homepage, Browse Music, track detail, DJ Access, Let’s Work and logged-out Promo Crate protection passed.
- Note: existing/published tracks use the button label `Save Track`; this is accepted and not a blocker.
- Live blocker after production deploy: Add Track was reported to reuse/overwrite an existing track identity, affecting `I Had a Feeling` artwork/visibility and a newly added track in the DJ Promo Crate.
- Root cause found in code: `findTrackByIdentity("")` could match the first track because missing alias fields such as `docId` / `documentId` were coerced to an empty string. A blank Add Track `editingId` could therefore be treated as an existing track, preserving that track’s artwork/media and saving back to that document.
- Containment fix accepted: blank identity now returns no match; identity matching ignores null/undefined aliases; blank Add Track mode is treated as new mode, stale edit IDs block save, and new-track slug/document collisions block save instead of overwriting.
- Existing-track edit/save remains accepted: One Fam was opened and saved; it stayed as the same track, no duplicate was created, and Update/Edit reopened the same saved record.
- Add Track clean form confirmed: after editing an existing track, Add Track opened a genuinely blank new-track form. It did not inherit previous artwork, MP3 path, WAV path, preview/audio path, slug or title. Intentional defaults remain accepted for now: Artist `Play Productions`, price/site default, and preview-duration default.
- New track without artwork confirmed: Vandalize was added with MP3 and WAV but no artwork. It saved without inheriting old artwork, used the current Play Productions placeholder artwork, did not overwrite another track and appeared as expected in the admin/DJ context.
- Slug/document collision guard confirmed: adding another `Vandalize` was blocked with the expected duplicate slug/document ID error.
- Historical data cleanup item: `Touch Me Bootleg` appears to be using old `I Had a Feeling` artwork from the pre-fix overwrite/inheritance incident, and `I Had a Feeling` no longer appears as its own admin/public track. Treat this as manual data cleanup, not an active code blocker. Do not automatically recover or delete records.
- Next decision: release the accepted containment fix to production Hosting only, then live-smoke test. Do not deploy Functions for this pass.

Current polish:

- Homepage About heading removed while preserving its image, copy and mobile More Info / Show Less behaviour.
- Homepage trust/banner icons aligned to the established site lime.
- Request DJ Access and Let’s Work hero social lines finalised as `You can also reach me through the social links below.` and matched to the surrounding hero copy.
- Request DJ Access `Already approved? DJ Login` now inherits the same button treatment as the homepage hero CTAs.
- Final public polish is live and accepted.
- The final trusted DJ invite journey remains passed.

Live test progress:

- Firebase Functions approval-email template deployed successfully.
- Fresh revoked applicant `dbmlippy@gmail.com` submitted a new application successfully.
- Admin received the complete application, approval succeeded and the account linked with `djAccess`.
- New approval email, real Firebase password setup link, password setup, hosted logo and new DJ login passed.
- Approved-DJ navigation and Promo Crate access passed.
- Preview and protected MP3 downloads from the Promo Crate passed.
- Promo-only hidden-from-shop track `1Fam` appeared and downloaded successfully from the Promo Crate.
- `1Fam` More Details rendered correctly, remained MP3-only and exposed no WAV, cart, purchase or private Storage path.
- `1Fam` now downloads successfully from both the Promo Crate and DJ detail page in preview. The DJ detail flow prioritises `track.firestoreId`, matching the working Promo Crate identifier order, before falling back to slug/legacy ID.
- Public Browse Music still hides `1Fam`; normal purchasable tracks retain Add to Cart.
- Logged-out Promo Crate access redirects to DJ Login, and the direct promo detail route keeps Download MP3 disabled with a clear approved-DJ sign-in message.
- Production `?demo=1` remains safe: sample rows only, disabled MP3 downloads and no protected audio paths.

- Submit a fresh Request DJ Access application and confirm it appears in admin.
- Approve the application and confirm the invitation email, secure password setup and DJ Login path.
- Sign in as the newly approved DJ and verify Promo Crate access, preview and protected MP3 download.
- Verify a promo-only hidden-from-shop track appears and downloads.
- Verify More Details remains DJ-specific and MP3-only, with no WAV, cart or purchase controls.
- Verify mobile/hamburger navigation, Sign Out returning Home and no demo/preview bypass.
- Verify no customer/shop controls leak into the approved-DJ experience.
- Next brief: `Final Trusted DJ Invite Journey Smoke Test`.

Backlog captured during the test:

- Admin Productivity / DJ contacts: flag a new pending request as `Previously revoked applicant` when its email matches prior rejected/revoked records. Show prior dates/statuses and private admin notes to authorised admins only; do not automatically block reapplication.
- Email branding: create and host a dedicated black version of the Play Productions logo for email use, preserving the accepted dimensions and placement beneath `Enjoy the music. / Chris`. Continue using a hosted HTTPS image rather than an attachment or base64 data.
- Phase C: add deliberate DJ download tracking/metrics after the invite path is stable.

## Phase A.4.8 — Commercial Enquiry Panel Consistency

Status: completed and live accepted.

- Standardise the Commercial Enquiry panel across public track details and approved-DJ track details.
- Keep DJ detail pages MP3-only while providing the same separate commercial enquiry route.
- Add the shared Commercial Enquiry panel at the bottom of the DJ Promo Crate without duplicating it.
- Continue enforcing UK `Enquiry` spelling in visible public copy.
- Preserve public cart, Coming Soon, preview, protected DJ download and access-control behaviour.
- DJ approval invitation template is deployed and passed its first live email/password-setup check.
- Next: run the final trusted DJ invitation journey from application through protected MP3 download.
- Phase B speed and legacy-cycling audit remains after the trusted DJ journey.

## Phase A.4.7 — Social Link Editor UX and Enquiry Spelling

Status: completed and live accepted.

- Use one shared add/confirm/remove social-link experience on Request DJ Access and Let’s Work.
- Start with a compact Add social link trigger instead of an empty editor row.
- Convert added links into confirmed display rows while preserving the existing `{type, url}` JSON payload.
- Align Let’s Work form typography with Request DJ Access.
- Correct visible public copy from Inquiry to UK English Enquiry without renaming routes or stored fields.
- Keep close/remove controls lightweight, accessible and keyboard-operable.
- DJ approval invitation template is prepared but awaits a separately approved Functions deployment.
- Next: run the final trusted DJ invitation journey from application through protected MP3 download.
- Phase B speed and legacy-cycling audit remains after the trusted DJ journey.

## Phase A.4.6 — Social Link Controls Polish

Status: completed and live accepted.

- Align DJ Access and Let’s Work labels to `Social and web links (optional)`.
- Present Platform, URL, Add social link and remove controls as one compact desktop row.
- Use the lime primary style for compact Add social link controls on both forms.
- Use the lime primary style for the Already approved? DJ Login hero action.
- Preserve existing dynamic add/remove behaviour, JSON field mapping and form submission.
- DJ approval invitation template is prepared but awaits a separately approved Functions deployment.
- Next: run the final trusted DJ invitation journey from application through protected MP3 download.
- Phase B speed and legacy-cycling audit remains after the trusted DJ journey.

## Phase A.4.5 — DJ Access and Transparent Logo Refinement

Status: completed and live accepted.

- Remove the duplicate static DJ social/profile field.
- Keep the existing dynamic platform/URL editor and move it below the play/promote textarea.
- Roll out the user-supplied transparent lime logo across shared public header/footer states.
- Replace redundant footer identity text with the logo and centre public DJ/Admin access beneath it.
- Preserve the existing `brand-logo-playing` audio animation and event ownership.
- DJ approval invitation template is prepared in `functions/index.js`; no Functions deployment has been performed.
- Rejection email remains future/lower priority.
- Next: run the final trusted DJ invitation journey from application through protected MP3 download.
- Phase B speed and legacy-cycling audit remains after the trusted DJ journey.

## Phase A.4.4 — Forms, Logo and DJ Email Refinement

Status: completed and live accepted for the safe Hosting subset. The approval-email template is prepared in `functions/index.js` but remains undeployed pending a separate Functions approval.

- Remove the duplicate Customer Portal label from Customer Login.
- Finalise mobile About collapse spacing.
- Restore responsive social links and full-width form alignment on Request DJ Access and Let’s Work.
- Restore the Commercial Enquiry panel below the Let’s Work form.
- Pending: prepare a clean transparent version of the supplied lime Play Productions logo before replacing the shared header/footer identity. Do not use the `gpt-image-1.5` CLI fallback unless explicitly approved later.
- Centre public-only DJ/Admin footer access beneath the logo.
- Pending: DJ approval invitation copy is owned by `functions/index.js`; do not edit it until explicitly approved. Any later change requires a separate Functions review and deployment.
- Rejection email remains future/lower priority.
- Next: run the final trusted DJ invitation journey from application through protected MP3 download.
- Phase B speed and legacy-cycling audit remains after the trusted DJ journey.

## Phase A.4.3 — Login and Contact Layout Refinement

Status: completed and live accepted.

- Restyle Customer Login to match the accepted DJ Login visual system.
- Add safe Firebase customer password-reset support.
- Finalise the compact mobile About collapse spacing.
- Move the complete Request DJ Access message into its hero and tighten the application form.
- Move the complete Let’s Work message into its hero and tighten the enquiry form.
- Keep customer newsletter consent separate from DJ promo consent.
- Correct DJ Login terminology to `Open Promo Crate`.
- Next: run the final trusted DJ invitation journey from application through protected MP3 download.
- Phase B speed and legacy-cycling audit remains after the trusted DJ journey.

## Phase A.4.2 — Customer Actions, Content + Public Heroes

Status: completed and live accepted.

- Refinement completed on top of A.4.1.
- Customer account actions now have an explicit Cart → Checkout → My Account → Sign Out visual order on desktop and mobile.
- Mobile About collapsed copy is shorter, with More Info positioned closer to the visible content while preserving Show Less.
- Applied `Play_Productions_Website_Content_Updates.md` to Browse Music, Request DJ Access and Let’s Work.
- Added supplied Request DJ Access and Let’s Work hero artwork under `public/assets/`.
- Home, Browse Music, Request DJ Access and Let’s Work now share a compact responsive hero-height system.
- Next: complete the final trusted DJ journey smoke test, then begin the Phase B audit-first speed/legacy cycling review.

## Phase A.4.1 — Auth-Aware Navigation, CTA + About Refinement

Status: completed and live accepted.

- Phase A.4 passed live smoke testing and is tagged `stable-live-dj-invite-logged-in-experience-20260705-1053`.
- Preview-only correction started:
  - Approved-DJ Latest Tracks CTA routes to `Promo Crate`.
  - Authenticated customers omit DJ Login and retain Cart → Checkout → My Account → Sign Out.
  - Public DJ Login and Admin Login moved from the header to the footer identity area and remain hidden from customer/DJ states.
  - About now uses the supplied portrait image and approved personal copy in a responsive image-left/text-right layout.
- Next: complete the trusted DJ journey smoke test, then begin the Phase B audit-first speed/legacy cycling review.

## Phase A.4 — DJ Invite + Logged-In Experience

Status: completed and live accepted. The final fresh-account invitation journey remains the next test.

- Request DJ Access and Let’s Work pages have a new shared public-enquiry presentation, clearer copy and improved form/status treatment.
- Approved-DJ homepage Latest Tracks now switch from price/cart actions to the shared protected `Download MP3` flow while retaining Preview and More Details.
- Promo Crate and homepage DJ downloads share one protected client utility and never expose private Storage paths.
- Promo-only diagnosis: public-shop visibility is not required by `/api/dj-download`. The client could send a public slug even when the Firestore document ID differed, while the endpoint performs an exact document lookup. Firestore-loaded tracks now retain `firestoreId`, and protected downloads use it before slug/legacy ID. Allowed status, DJ visibility and `mp3Path/previewPath` still require authenticated verification on the affected record.
- Smoke tests must use separate admin, approved-DJ and true non-DJ customer accounts. Do not infer customer behaviour from an account carrying DJ/admin roles.
- Phase B remains the next audit-first technical phase after this sprint.

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
- Updated header/footer logo is live; its preview-playing movement/pulse remains working.
- Footer DJ/Admin buttons are centred beneath the logo and remain public-only.
- About uses the accepted portrait image and personal Play Productions copy.
- Customer Login styling and Firebase forgot-password support are live accepted.
- Request DJ Access and Let’s Work use the accepted heroes, forms and shared social-link editor.
- Visible public copy consistently uses UK `Enquiry`.
- Commercial Enquiry panels are present on Home, Browse Music, public detail, DJ detail and Promo Crate.
- Approved-DJ homepage Latest Tracks hide prices and use protected `Download MP3`.
- DJ detail remains MP3-only with no WAV, cart or purchase controls.
- Public, customer and approved-DJ navigation states passed live smoke testing.
- Resolved: Promo-only hidden-from-shop tracks can appear in Promo Crate and download protected MP3s for approved DJs.
- Homepage content and brand polish are live accepted and stable:
  - Latest Tracks.
  - About Play Productions.
  - Stay Connected / Join the List.
  - Commercial Enquiry.
- The Browse Music hero is live accepted. Its confirmed release reference is `stable-preview-browse-music-hero-20260704-2042`; no separate stable-live hero tag exists.
- The Browse Music catalogue layout is live accepted and stable:
  - `Home › Browse Music` breadcrumb.
  - One `Catalogue` heading.
  - Internal approximately five-track scroll window.
  - Sticky desktop column header.
  - Commercial Enquiry is easier to reach.

DJ approval email status:

- `functions/index.js` owns the approval invitation and generates the real secure password setup URL with Firebase Admin `generatePasswordResetLink`.
- The approved template, Promo Crate link and hosted website logo are prepared in the working tree.
- A separate, explicitly approved Functions deployment is required before this email update becomes live.
- Rejection email remains lower priority.

## 2. Current strategic priority

### DJ-first growth

Prepare Play Productions for the first 1–3 trusted DJ invites by completing one clean fresh-account end-to-end invitation journey.

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

1. Run the final trusted DJ invite journey smoke test:
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
   - No customer/shop controls leak.
2. If the email template is accepted, schedule a separate Functions deployment and re-run the invitation-email portion.
3. Then start the Phase B speed/legacy cycling audit-first pass.

## 5. Priority roadmap

### Phase A — Final DJ Invite + Public Site Quality

Completed Phase A public polish:

- Homepage content, studio hero, auth-aware CTAs and role-aware navigation.
- Latest Tracks, About, Stay Connected / Join the List and Commercial Enquiry.
- Shared Play Productions typography, button, logo, header and footer refinements.
- Customer newsletter interest kept separate from DJ applications.
- Public-only DJ Login and Admin Login treatment.
- Single Promo Crate heading.
- Browse Music hero with supplied studio image and accepted copy.
- Browse Music breadcrumb, single Catalogue heading, five-track internal scroll and sticky desktop header.
- Public catalogue, Coming Soon, track-detail and cart behaviour preserved.

Remaining Phase A work:

- Request DJ Access page polish.
- Let’s Work / Commercial Enquiry page polish.
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
- Tidy Let’s Work / Commercial Enquiry:
  - Hero/header style, wording, form labels and mobile layout.
  - Submit/validation, success and error states.
  - Align copy with Commercial Enquiry panels on Home, Browse Music and detail pages.
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

#### Phase B.1 audit findings

- Public pages initially load `style.css`, `platform.css` and `design-v2.css`. `site-nav.js` then appends `current-ui.css` after parsing has reached the end of the page.
- `current-ui.css` imports twelve later stylesheet generations from `design-v3.css` through `rc7-fixes.css`. `design-v3.css` and `rc6-fixes.css` hide `html:not(.ui-ready)`, while `site-nav.js` adds `ui-ready` on stylesheet load or after a 1.5-second fallback. This creates a credible old-layout → hidden/black → final-layout sequence on a cold or delayed load.
- The public settings chain imports fourteen shared enhancement modules on every public page: sprint/module layers, footer/cart polish and RC1–RC7. Several append stylesheets already present through `current-ui.css`; `rc4-fixes.js` later removes some of those duplicate link nodes.
- Homepage measurement in an authenticated warm browser session observed 25 scripts and 17 styles; Browse Music observed 24 scripts and 18 styles; Track detail observed 30 scripts and 18 styles. DOM-ready wall time was approximately 1.9–2.1 seconds in that sample.
- The current public final owners are:
  - Global header, role-aware navigation, homepage role CTAs and footer: `site-nav.js`.
  - Page visibility and social settings: `site-settings.js`, with final social-link presentation in `rc4-fixes.js`.
  - Homepage catalogue/content: `index.html` + `home.js`; trust icons from `rc3-fixes.js`; final visual rules in `rc7-fixes.css`.
  - Browse Music data/render: `music.js`; final hero replacement in `rc4-fixes.js`; accumulated catalogue controls in RC1/polish/RC6/RC7.
  - Track detail base render: `beat.js`; cart/related/player/detail responsibilities split across `track-enhancements.js`, `track-launch.js`, `track-polish.js` and `track-detail-flow.js`; final auth/back-link state in `site-nav.js` and `rc7-fixes.js`.
  - Request DJ Access / Let’s Work forms: their page modules; final hero/form structure in `rc3-fixes.js`; social links in `rc4-fixes.js`; final layout in `rc7-fixes.css`.
  - Customer Portal data/render: `account.js`; auth-panel cleanup in `customer-portal-cleanup.js`; global account navigation in `site-nav.js`.
  - Promo Crate data/access/downloads: `dj-promo.js`; global approved-DJ navigation in `site-nav.js`; final presentation spread across `sprint-dj.js`, RC4, RC6 and RC7.
- Confirmed duplicate public render paths include repeated header/footer rebuilding, repeated hero copy replacement, repeated catalogue column/action enhancement, repeated track commercial/related ordering and repeated breadcrumb/back-link correction.
- Public pages perform shared Firebase work even when their page content does not need it. Signed-in pages normally read the user profile for navigation and site settings, then add page-specific reads. Track detail calls `loadTracks()` at least twice; Customer Portal reads orders, projects and tracks in addition to shared profile/settings reads.
- Live authenticated admin startup is intentionally protected and was not changed. Its final owners remain `admin.html`, `admin-entry.js`, `admin-live-login.js`, `admin-platform.js`, `track-admin-foundation.js` and `admin-dj-workflow.js`.
- After successful admin authentication, legacy enhancement modules can repeat Firestore reads and overwrite the same views: tracks, enquiries and settings are each fetched by multiple admin/RC modules; RC6/RC7 and the final DJ workflow can all touch DJ Database status/actions. This is the strongest admin cycling risk, but it must be handled in a separately approved admin-safe phase.
- Unreferenced legacy candidates found by static reverse-reference audit: `admin-bootstrap.js`, `admin-dj.js`, `admin-field-setup.js`, `multipage.css`, `polish-admin.js`, `rc2-admin.js` and `rc2-portal.js`. They remain in place until a preview package proves no runtime or deployment dependency.

#### Safe cleanup order

1. Move the already-approved final public stylesheet entry into document `<head>` and prove identical desktop/mobile rendering before removing any CSS layer.
2. Build a page-by-page public module manifest. Load only the shared navigation/settings core globally; defer page-specific RC responsibilities to their owning page.
3. Stop duplicate stylesheet injection first (`polish-01`, `polish-02`, RC1 and RC2) while retaining their active JavaScript behaviour.
4. Consolidate one public area at a time in this order: homepage, enquiry pages, Browse Music, Track detail, Customer Portal, Promo Crate.
5. Add request-level caching for `loadTracks()` and site settings within one page lifecycle, then verify public/customer/DJ visibility and protected-download gates.
6. Quarantine unreferenced files from deployment only after static-reference, preview and smoke-test evidence agrees; delete later in a separate cleanup commit.
7. Audit authenticated admin modules separately. Preserve admin startup and login guards; first centralise loaded datasets, then make RC consumers use shared data before considering any module removal.
8. Measure the same representative pages before and after each phase. Preview first, one responsibility per commit, with rollback tags.

#### Phase B.2 public style loading

- Link the existing versioned `current-ui.css` directly from every non-admin page that loads `site-nav.js`, so the accepted final stylesheet chain begins loading from `<head>` before body content can paint.
- Keep `site-nav.js` as the readiness owner, but detect the existing link and skip duplicate late injection.
- Preserve the existing `ui-ready` lifecycle and 1.5-second failure fallback; do not add polling, MutationObserver or a new timing loop.
- Do not remove or consolidate CSS/RC generations in this pass.
- Validate hard refresh, final visual parity, one `current-ui.css` link per page and unchanged public/customer/DJ behaviour on Firebase preview.
- Preview validation confirmed one head-owned `current-ui.css` link per page, visible `ui-ready` state, no horizontal overflow, unchanged catalogue/cart/forms/login gates and no application console errors.
- Next recommended cleanup remains page-specific module loading and duplicated render ownership. Admin startup remains a separate protected pass.

#### Phase B.3 first module-loading slice

| Module | Previously loaded | Actual owner | Safe action |
| --- | --- | --- | --- |
| `sprint-pages.js` | Every public/customer/DJ page through `site-settings.js` | Homepage trust-strip placement, Services workflow and Vinyl form options | Import only from `home.js`, `services.js` and `vinyl.js` |
| `module1-pages.js` | Every public/customer/DJ page through `site-settings.js` | Request DJ Access social fields and DJ Login demo-link compatibility | Import only from `dj-access.js` and `dj-login.js` |
| `dj-polish-loader.js` | Every public/customer/DJ page through `site-settings.js` | Promo Crate-only `dj-polish-02.css` loader | Import only from `dj-promo.js` |
| `footer-icons.js` | Every public page | Shared footer social icons | Keep global |
| `polish-01.js` / `polish-02.js` | Every public page | Shared cart/footer/logo/audio polish plus homepage/music behaviour | Keep global pending responsibility split |
| RC1–RC7 public modules | Every public page | Mixed shared and page-specific compatibility responsibilities | Keep global until each final owner is proven separately |

- Keep all module files; only relocate their imports to the page entry modules that own their behaviour.
- Preserve Phase B.2 early stylesheet loading.
- Preview deployment passed structural and route smoke checks on 6 July 2026. No production deployment was made.
- Measured module reductions:
  - Homepage: 25 → 23 scripts; retains only `sprint-pages.js`.
  - Browse Music: 24 → 21 scripts; loads none of the three gated modules.
  - Track detail: 30 → 27 scripts; loads none of the three gated modules.
  - Request DJ Access and DJ Login retain only `module1-pages.js`.
  - Services and Vinyl retain only `sprint-pages.js`.
  - Promo Crate retains only `dj-polish-loader.js`.
  - Let’s Work and Customer Portal load none of the three gated modules.
- All measured pages reached `ui-ready` without horizontal overflow. Browse Music retained search, More Details and Add to Cart controls; Request DJ Access retained its form/social-field enhancement; logged-out Promo Crate access still redirects to DJ Login.
- Do not alter Firestore reads, data models, auth, protected downloads, CSS generations or final visual output in this slice.
- No MutationObserver or timing-loop fix is introduced; existing module internals remain unchanged.
- Next candidate after preview acceptance: separate shared RC behaviour from catalogue/track/form/portal-specific behaviour one owner at a time.
- Admin startup remains a separate protected pass.

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
- Add Settings-tab defaults for new tracks: default artist, default price, default preview start, default preview duration, default Store visibility, default Promo Crate visibility, purchase-enabled state and Latest/Coming Soon defaults where useful. Preview duration may later move globally to 60 seconds.
- Add clear upload progress indicators for artwork, MP3 and WAV uploads so large saves show 0-100% progress and do not feel frozen.
- Add explicit media-management controls to replace/remove artwork, replace/remove MP3, replace/remove WAV and clear/replace preview/audio paths without relying on hidden field behaviour.
- Review placeholder artwork/logo styling for tracks without custom artwork and align it with the latest preferred Play Productions identity.
- Define clearer workflows for the Release Admin, Promo/Notification Tracking and Order Data/Advanced admin sections; they currently behave more like placeholders than finished workflows.
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

- Resolved in preview: promo-only DJ detail downloads now use the Firestore document ID before slug/legacy fallbacks, matching the Promo Crate flow.
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
- Historical data cleanup: review `Touch Me Bootleg` / `I Had a Feeling` after the pre-fix Add Track overwrite/inheritance incident. Do not automatically delete or restore records; inspect and clean manually.

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

# Play Productions Project Roadmap

## 1. Current stable live state

- Live admin works at `/admin.html`.
- Production `/admin.html` defaults to the live Firebase admin.
- `/admin.html?preview=1` remains the safe preview fallback.
- DJ Applications workflow works.
- DJ approval and rejection work.
- Invitation email sends through Firebase Trigger Email.
- DJ password setup and login work.
- Approved DJs can access the promo crate.
- Protected MP3 promo downloads work.
- DJ Applications CSV export works on live.
- Full Music Library export works and is user-confirmed.

## 2. Current active module

**Module 2 — Music Library / Track Admin / public music catalogue / DJ track flow**

Module 2A is preview-only until its complete Track Admin workflow passes testing.

Module 2B has started with the first Track Missing Data Workspace shell. Catalogue View remains the readiness overview, Missing Data View lists incomplete work by priority, and Full Track Editor / All Data remains the deliberate detailed editor.

The Track Flow and Storage audit is complete. Real-track artwork, preview MP3 and WAV/master upload flows now work. Remaining Module 2 changes continue to require preview acceptance before production.

Module 2C has started: Track Admin save-preservation hardening. Existing raw Firestore data, asset aliases, licences, timestamps and stable document IDs are now protected by the revised save payload, pending preview verification.

Module 2C.1 corrects the save gate: authenticated admins on the hosting preview channel using `?live=1` must be able to write, while explicit `/admin.html?preview=1` and non-live fallback modes remain read-only.

Module 2C.2 moves the completion/readiness summary to the top of the Track Editor and gives grouped fields the full editor width. Quick Draft and save-control layout cleanup is implemented pending preview verification.

Module 2D.1 fixes the canonical asset mapping blocker found during the live `ZZ TEST Track A` workflow. Private WAV uploads must save a Storage path without requesting a forbidden download URL; artwork and preview uploads must populate the canonical URL/path fields and compatibility aliases used by readiness, public Music, DJ Promo and exports.

Module 2D.1 is functionally working on preview: disposable artwork, MP3 and master uploads persist; Coming Soon + Website On persists; and the public preview Music page shows the test track as Coming Soon without a purchase action.

Module 2D.2 attempted to align the editor status panel with the same normalized asset aliases and Web readiness resolver used by the active Music Library table. Its preview acceptance failed because the visible editor panel continued to render the stale `Required: coverUrl` and status-based percentage, even though the table reported Web 12/12 and the public Music page displayed the saved artwork correctly.

Module 2D.3 traced that exact visible sentence to `admin-platform.js` → `checklist()`. Live testing passed: the corrected renderer merges saved canonical/legacy assets with current form values, the editor readiness panel agrees with the Music Library table, and the stale `Required: coverUrl` issue is resolved.

Module 2E is the final real-track detail-flow and Track Admin polish pass. Module 2's core admin asset flow is working: real artwork, preview MP3 and WAV/master uploads save successfully, and Coming Soon public visibility works. DJ Promo summary/list download has already passed live testing. Music and DJ exports also work and must not be treated as broken.

Module 2E aligns Music and DJ detail routing around slug, Firestore document ID and legacy ID fallbacks; applies one release-date/TBC rule; and replaces the legacy DJ-detail placeholder/WAV controls with an approved-DJ protected MP3 action. It also improves field purpose, compact layout, toggle clarity, release workflow order and safe auto-fill behaviour. Module 2 remains incomplete until these detail-page changes pass preview acceptance.

Module 2E preview failed because Add Track/Edit events reached competing editor paths, leaking an existing track into new-track state, and because three release workflow checkboxes removed during layout work were still read unconditionally during save. Module 2E.1 is the narrow regression fix: `admin-platform.js` is the single Add/Edit event owner, new and existing editor states reset explicitly, release controls are restored and checkbox reads are null-safe, and a valid saved release date clears stale TBC state for admin and detail display.

Module 2E.1 preview mostly passed: Add/Edit routing and release-date/TBC handling are fixed. Closing a dirty Add Track session could still result in an accidental draft, so Module 2E.2 adds an explicit save-intent gate and a discard path. Closing/cancelling now resets unsaved new-track state without writing; only Save Draft or Save Track may authorize a Firestore submission.

Module 2E.2 mostly passed preview, but Enter in a normal Add Track input triggered the browser’s implicit default-submit-button click and therefore inherited save intent. Module 2E.3 blocks Enter-based implicit submission inside the Track Editor while preserving textarea line breaks and deliberate Save-button activation. Add Track may create a record only through Save Draft or Save Track.

**Module 2F — Preview Player Controls** is the next near-term Module 2 pass and must be completed before Module 2 is declared complete.

Do not begin Module 2F until Module 2E.3 Enter/implicit-submit safety passes preview testing.

Required direction:

- Public Music and DJ Promo streaming previews use the same configurable per-track limits.
- Track Admin supports `previewStartSeconds` and `previewDurationSeconds`.
- Useful duration choices include 30, 45, 60 and 90 seconds.
- Playback stops automatically at the configured preview end.
- The floating player close control stops playback and hides the player; selecting another preview reopens it.
- Playback-speed controls are hidden so users receive simple play/pause and useful progress/time controls.
- Optional later fields are `previewFadeInSeconds` and `previewFadeOutSeconds`.
- Preview limits must not affect protected approved-DJ MP3 downloads, paid customer downloads or internal WAV/master files.

Preview test URL:

<https://play-productions--preview-4sqed4ku.web.app/admin.html?live=1>

The current correction consolidates the visible Music Library under the live `admin-platform.js` renderer. A previous pass changed an earlier renderer and was subsequently overwritten, so future UI work must confirm final renderer ownership before editing.

## 3. Completed milestones

- Restored reliable admin login and dashboard visibility without black screens.
- Preserved safe preview-mode admin access.
- Completed the DJ application, approval, rejection and invitation workflow.
- Added DJ password setup and live email/password authentication.
- Added approved-DJ checks, promo access, sign-out and protected MP3 downloads.
- Added a single, deduplicated DJ Applications CSV export.
- Added the Track Admin readiness foundation for Web, Sale, DJ and Release.
- Grouped the track editor into Web / Track Basics, Personal Sale, DJ Promo, Release Admin and All Data / Advanced.
- Made readiness pills open and highlight their related editor sections.
- Added Music Library filters for All, Web, Sale, DJ, Release and Archived.
- Added safe archive, guarded record deletion and draft restore workflows.
- Consolidated music export around the complete full-data CSV.
- Preview confirmed the improved Music Library width, visible Actions column, removed/reduced horizontal scrolling, Delete wording, working readiness pills and working filters.
- Consolidated Add Track and the full music CSV export into one normalized action row and moved the live admin email beside Sign out; preview verification is pending.
- Preview confirmed the first Module 2B Missing Data view, including its six-column shell, priority ordering and editor-section actions.
- Refined Missing Data into the main Music Library filter row, reset Add Track to the default Web / Track Basics section, and removed redundant DJ Database summary presentation; preview verification is pending.
- User testing confirmed both Music and DJ Applications CSV exports work; exports are not a current blocker. Browser/Agent Mode can be unreliable when verifying downloads and should not override a successful user test.
- Module 2D.3 passed live testing: editor and table readiness agree and the stale `Required: coverUrl` warning is resolved.

## 4. Immediate next tasks

Priority order:

1. Complete and preview-test Module 2E detail routing, release-date/TBC, MP3-only DJ detail and Track Admin polish.
2. Build and preview-test Module 2F Preview Player Controls.
3. Live-test Module 2E and 2F before declaring Module 2 complete.
4. Start Enhancement Phase A — Public Site Quality Pass.
5. Continue through the enhancement phases in the priority order below.

Module 2A preview checks:

- Confirm the active Music Library table uses the available width without unnecessary horizontal scrolling.
- Confirm Missing Fields is absent and readiness tooltips retain useful detail.
- Confirm All, Web, Sale, DJ, Release and Archived filters and their counts.
- Confirm search works together with the selected readiness filter.
- Confirm Archive hides website, DJ and purchase visibility without deleting files.
- Confirm Restore returns an archived track to draft without publishing it.
- Confirm guarded Delete removes only the Firestore track record.
- Confirm Add Track and Export full music data CSV form one action row.
- Confirm the logged-in admin email appears beside Sign out and no longer occupies the page content area.
- Confirm the full-data export contains current and legacy track fields.
- Improve editor usability so readiness work does not open or scroll through irrelevant full-editor sections.
- Verify Missing Data priorities and field labels against real catalogue records.
- Add inline editing/saving for straightforward missing fields in a future controlled pass.
- Add upload/select actions for artwork, MP3 and WAV/master in a later pass; do not place uploads inline until the shell is proven.
- Consider a future Add Track wizard with Track Basics, Assets, Website visibility, DJ promo, Sale and Release admin steps.
- Add an unsaved-change warning before switching admin tabs or closing the editor in a later low-risk UX pass.
- Move global admin search into the top header in a future layout pass to reduce unused top-page space, then review header spacing.
- Save and reload a harmless track edit.
- Recheck DJ Database loading, export, approval and invitation flows.
- Run the complete test-track flow in preview before uploading real masters.
- Confirm field flow-through to public Music and the live DJ crate with controlled test records.
- Confirm the full music CSV contains expected admin, asset, visibility and archive fields.
- Verify the hardened edit payload preserves `mp3Path`, `previewPath`, `previewUrl`, `masterPath`, `wavPath`, `coverPath`, `coverUrl`, `createdAt`, aliases and licence data.
- Confirm slug edits continue saving to the original Firestore document ID without creating duplicates.
- Verify the editor-header Save Draft/Save Track control remains visible and reports the saved Firestore document ID.
- Verify Website, DJ Promo and Purchase toggles show clear ON/OFF states and the summary remains synchronized.
- Verify the compact top completion panel shows Web, Sale, DJ and Release readiness without recreating a right-side column.
- Verify grouped Track Editor fields use the available width and Quick Draft starts with Web / Track Basics while Release and Advanced remain secondary.
- Re-test artwork upload for `coverUrl`, `coverPath` and `thumbnail`.
- Re-test preview upload for `previewUrl`, `previewPath`, `mp3Path`, `mp3Url` and `url`.
- Re-test master upload for `masterPath` and `wavPath` without requiring a public master URL.
- Confirm Coming Soon + Website On persists after canonical assets and release timing are present.
- Confirm reopening `ZZ TEST Track A` shows Web readiness complete and no false `Required: coverUrl` message.
- Confirm the editor percentage uses the complete Web readiness result when Website is enabled.
- Preserve Module 2D.3’s proven editor/table readiness alignment.
- Test a real track's Music and DJ detail links using slug and document-ID routes.
- Confirm saved release dates appear on both detail routes and TBC appears only when selected or no usable date exists.
- Confirm DJ detail offers only protected MP3 and the main DJ crate download remains unchanged.
- Verify title-driven slug, release-title and SEO helpers preserve manual edits.
- Align live DJ crate visibility with the backend download status gate.
- Ensure customer purchase availability cannot proceed without a usable WAV/master.
- Define safe preview start/duration defaults for legacy tracks without Module 2F fields.
- Manually archive or delete the accidental `ZZ DO NOT SAVE TEST` record if it remains after Module 2E.2 passes; do not remove it automatically in code.
- Manually archive or delete the accidental `ZZ IMPLICIT SHOULD NOT SAVE` preview record after Module 2E.3 passes; do not remove real tracks or automate this cleanup.

## 5. Future development ideas

### Track and release management

- Build a left-to-right track workflow using traffic-light readiness cards.
- Continue **Module 2B — Track Missing Data Workspace**, a focused workspace for completing incomplete catalogue data efficiently.
- Keep three deliberate levels: Catalogue View for overview/readiness, Missing Data View for incomplete fields, and Full Track Editor / All Data for intentional detailed editing.
- Present missing work as editable rows with Priority, Track, Area, Missing field, Input/control and Save action.
- Add Missing Data filters for All Missing, Web, Sale, DJ, Release, High Priority, Medium Priority and Low Priority.
- Treat website, DJ promo and personal-sale blockers as high priority; release/admin metadata as medium priority; and notes, promo extras and nice-to-have fields as low priority.
- Support inline editing for simple fields including BPM, genre/style, key, mood/tags, price, status, visibility toggles, ISRC, UPC and release checks.
- Use appropriate future controls: number inputs for BPM and price, text inputs for ISRC and UPC, toggles for boolean fields, and date inputs for release/notification dates.
- Open the relevant asset section for complex artwork, MP3 and WAV/master work instead of forcing those fields inline.
- Avoid showing completed or irrelevant fields by default when a readiness area is being worked on.
- Consolidate table, editor and Missing Data calculations behind one readiness source, and avoid duplicate or stale readiness panels.
- Add a real upload workflow using one shared MP3 and one shared WAV/master asset.
- Improve metadata and readiness guidance across Web, Sale, DJ and Release.
- Add branded fallback and coming-soon artwork.
- Move genre/style and mood/tag options into Settings-managed reusable lists; Module 2E retains safe free-text entry until those settings are designed.
- Review and migrate legacy/compatibility fields in All Data / Advanced after purchase and distribution consumers are fully mapped.
- Track new-release notification state without automatic sending.
- Later add a deliberate queue/send notification action.
- Track promo campaigns and outreach per release.
- Add an admin-only Storage Usage report/widget using a backend function or controlled Admin SDK script. It should total and count covers, MP3s and masters, estimate remaining complete-track capacity and flag possible orphaned files without loosening Storage rules.

### Contacts, DJ and promotion

- Build a contact database for DJs, radio, labels, blogs and playlist curators.
- Add DJ download tracking and engagement statistics.
- Add campaign lists, outreach status, follow-ups and response notes.
- Expand email and notification automation only through explicit, guarded actions.

### Customers, sales and licensing

- Add customer purchase and download history to the portal.
- Complete paid MP3/WAV fulfilment and account-download flows.
- Keep the purchase/customer account flow as a later module after public-site cleanup.
- Add licence-management records while keeping commercial licensing enquiry-led until deliberately expanded.
- Add Stripe sales, fees and revenue reporting.

### Dashboard, analytics and operations

- Expand the Business Dashboard with useful operational and revenue metrics.
- Add SEO status, Google Analytics and Search Console reporting.
- Add an operational/system-health dashboard for Firebase, email, downloads, payments and integrations.

### Public site and services

- Test Track Admin field flow-through to the public Music page.
- Remove public demo/preview clutter.
- Complete responsive and mobile polish.
- Explore settings-driven homepage and public CMS controls.
- Build the Mixing & Mastering project workflow.
- Build the Vinyl Cutting quote and project workflow.

### Existing website module names

- **Module 1** — DJ Promo, DJ Applications and admin-access workflow.
- **Module 2** — Music Library, Track Admin, public music catalogue and DJ track flow.
- **Module 3** — Mixing & Mastering public section. Do not offer it for sale until it is ready to present properly.
- **Module 4** — Custom Vinyl Record Cutting public section. Do not offer it for sale until it is ready to present properly.

Future work outside those existing website controls must use **enhancement phase** or **workstream** names rather than additional numbered modules.

### Security and maintenance

- Complete Firebase API-key restrictions and GitHub alert cleanup.
- Keep dependency, Firestore-rule and Storage-rule reviews in the maintenance plan.

## 6. Known issues / watch-outs

- A previous correction edited an earlier Music Library renderer and did not visibly affect the final live table.
- Confirm the final active renderer before every admin UI change.
- `admin-platform.js` owns the live Music Library table after Firestore loading.
- `rc3-admin.js` owns the full music CSV export.
- `polish-02-admin.js` historically added the shorter duplicate music export; it must remain hidden/disabled for Tracks.
- Admin startup cleanup previously broke login and was reverted.
- Production deployment of Module 2B is not yet approved; preview acceptance remains required.
- DJ Database should retain one `DJ Database` title, count-bearing filters and the single DJ Applications CSV export without restoring legacy metric cards.
- Archive is the normal safe removal action. Hard delete is for obvious test/junk records only and currently leaves uploaded files behind.
- Real track, MP3 and WAV/master uploads must wait until Module 2C save-preservation tests pass.
- The live Module 2D test exposed a `coverUrl` readiness blocker because private master URL resolution aborted the Firestore save after Storage uploads. Module 2D.1 corrected this and passed the disposable-asset preview test.
- Coming Soon public flow now works on preview; Published flow and real catalogue onboarding remain pending deliberate testing.
- DJ promo authentication and MP3 downloads have already passed live testing and should not be rebuilt during editor-readiness alignment.
- Module 2D.2 initially failed because the visible editor checklist still reported `Required: coverUrl`; Module 2D.3 resolved the mismatch and passed live testing.
- The public Music flow and Music Library table/editor readiness work for the controlled Coming Soon track.
- Monitor intermittent preview 502 responses, but do not treat a single occurrence as a blocker unless it repeats.
- DJ Promo does not need retesting in the Module 2D.3 pass because the live DJ workflow and protected MP3 download have already been proven.
- Track Editor right-side layout waste was a current UX issue; Module 2C.2 addresses it by moving status/readiness to the top and making the form full-width.
- Replacing artwork, preview MP3 or master WAV creates a new timestamped object and currently leaves the previous object in Storage.
- Live DJ querying can display any `showInDjPool: true` record, while protected downloads allow only `published` and `coming-soon`; these gates need alignment.
- Public purchase readiness does not prove a master exists for every legacy/external record; paid fulfilment currently requires `masterPath`.
- Admin editing uses normalization plus merge writes. Unknown fields survive, but known normalized fields can be overwritten by defaults; `mp3Path`, timestamps, aliases and manual path fields require focused regression testing.
- Do not reintroduce `admin-live-fields.js`.
- Do not reintroduce `coreReady` waiting logic.
- Do not reintroduce **“Live admin data timed out”**.
- Do not introduce MutationObserver-based fixes.
- Avoid large rewrites and preserve working renderers.
- Module 2A work must be based on the current stable main files, not reverted packages or older branches.
- Disabled Web, Sale or DJ toggles currently count as incomplete readiness; verify that product behaviour during preview testing.
- Module 2E public/DJ detail routing and date/download changes must pass preview before Module 2 is declared complete.

## 7. Deployment rules

Preview first:

```powershell
firebase.cmd hosting:channel:deploy preview
```

Production is permitted only after preview acceptance passes.

Deploy Functions only when `functions/index.js` changes.

Keep deployments and commits small, scoped and easy to reverse.

Priority order after Module 2:

1. **Enhancement Phase A — Public Site Quality Pass**
   - Public-page, Music detail and DJ Promo visual polish.
   - Mobile/responsive review, navigation and button consistency.
   - Remove test/demo/preview clutter and refine user-facing wording.
2. **Enhancement Phase B — Purchase + Customer Account Flow**
   - Cart, checkout, payments, customer accounts and purchase history.
   - Paid MP3/WAV fulfilment, account downloads and order/download emails.
3. **Enhancement Phase C — Brand + Catalogue Setup Tools**
   - Branded black/lime fallback artwork.
   - Settings-managed genre/style, subgenre and mood/tag lists.
   - Track defaults for artist, SEO and pricing.
4. **Enhancement Phase D — Contacts + New Track Notifications**
   - Contact database for DJs, radio, labels, blogs and playlist curators.
   - Consent/source tracking, release alerts, follow-ups, responses and campaign notes.
5. **Enhancement Phase E — Admin Productivity Enhancements**
   - Missing Data inline editing and better filtering/search/refresh.
   - Quick Draft/Add Track wizard improvements and bulk updates.
6. **Enhancement Phase F — Storage + Maintenance**
   - Storage usage widget, orphan-asset audit, cleanup tools and replacement history.
7. **Module 3 — Mixing & Mastering public section**
   - Existing website module; build only when ready to present properly.
8. **Module 4 — Custom Vinyl Record Cutting public section**
   - Existing website module; build only when ready to present properly.

## 8. Do-not-touch rules

Unless explicitly requested, do not change:

- Admin login or startup flow.
- `public/admin.html`.
- `public/admin-live-login.js`.
- DJ approval, rejection or invitation-email logic.
- DJ promo download backend.
- Checkout or payments.
- Public pages.
- `functions/index.js`.

Do not add competing renderers, persistent loops or MutationObservers.

## 9. Notes for future Codex passes

Before editing:

- Inspect the current stable files rather than relying on old conversation context.
- Map the import and render chain and identify the final writer for the visible UI.
- Change the owning renderer instead of adding an overlay.
- Preserve existing IDs, save paths, asset aliases and working Firestore behaviour.
- Test on preview before considering production.

Update this roadmap whenever:

- A milestone is completed.
- A new issue or renderer conflict is discovered.
- A future task is identified.
- Module priorities change.
- Preview testing changes the status of an item.
- A known risk or watch-out is found.

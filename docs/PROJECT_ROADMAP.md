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

## 2. Current active module

**Module 2 — Track Admin / Music Library management**

Module 2A is preview-only until its complete Track Admin workflow passes testing.

Module 2B has started with the first Track Missing Data Workspace shell. Catalogue View remains the readiness overview, Missing Data View lists incomplete work by priority, and Full Track Editor / All Data remains the deliberate detailed editor.

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

## 4. Immediate next tasks

Priority order:

1. Finish Module 2A Track Admin / Music Library on preview.
2. Test track field save/reload and flow-through to the public Music page and DJ promo crate.
3. Clean public demo/test clutter from the site.
4. Smoke-test customer purchase and account flows.
5. Plan notifications, the contact database and promo campaigns.
6. Expand the Business Dashboard and analytics.
7. Develop Mixing & Mastering and Vinyl Cutting modules.

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
- Move global admin search into the top header in a future layout pass to reduce unused top-page space, then review header spacing.
- Save and reload a harmless track edit.
- Recheck DJ Database loading, export, approval and invitation flows.

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
- Add a real upload workflow using one shared MP3 and one shared WAV/master asset.
- Improve metadata and readiness guidance across Web, Sale, DJ and Release.
- Add branded fallback and coming-soon artwork.
- Track new-release notification state without automatic sending.
- Later add a deliberate queue/send notification action.
- Track promo campaigns and outreach per release.

### Contacts, DJ and promotion

- Build a contact database for DJs, radio, labels, blogs and playlist curators.
- Add DJ download tracking and engagement statistics.
- Add campaign lists, outreach status, follow-ups and response notes.
- Expand email and notification automation only through explicit, guarded actions.

### Customers, sales and licensing

- Add customer purchase and download history to the portal.
- Complete paid MP3/WAV fulfilment and account-download flows.
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
- Do not reintroduce `admin-live-fields.js`.
- Do not reintroduce `coreReady` waiting logic.
- Do not reintroduce **“Live admin data timed out”**.
- Do not introduce MutationObserver-based fixes.
- Avoid large rewrites and preserve working renderers.
- Module 2A work must be based on the current stable main files, not reverted packages or older branches.
- Disabled Web, Sale or DJ toggles currently count as incomplete readiness; verify that product behaviour during preview testing.

## 7. Deployment rules

Preview first:

```powershell
firebase.cmd hosting:channel:deploy preview
```

Production is permitted only after preview acceptance passes.

Deploy Functions only when `functions/index.js` changes.

Keep deployments and commits small, scoped and easy to reverse.

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

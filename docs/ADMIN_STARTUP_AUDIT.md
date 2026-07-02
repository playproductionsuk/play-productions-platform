# Play Productions Admin Startup Audit

## Scope and conclusion

This is a documentation-only audit of the current accepted admin. No startup, renderer, Firebase, CSS or public-site code was changed.

The current admin is functional, but its apparent startup chain is much smaller than its real chain. `admin-entry.js` imports eight modules; those imports fan out into roughly nineteen local admin modules, excluding Firebase CDN modules and inline safety scripts. Several layers render or enhance the same views, attach delayed callbacks and repeat Firestore reads. This is the most likely cause of visible old-version cycling and avoidable startup work.

No file should be removed solely because it has an RC or polish name. The accepted UI still depends on some of these files.

## Files inspected

- `public/admin.html`
- `public/admin-entry.js`
- `public/admin-live-login.js`
- `public/admin-platform.js`
- `public/admin-fields.js`
- `public/rc1-admin-fields.js`
- `public/track-admin-foundation.js`
- `public/admin-dj-workflow.js`
- `public/admin-enhancements.js`
- `public/sprint-admin.js`
- `public/case-admin.js`
- `public/module1-admin.js`
- `public/polish-admin-safe.js`
- `public/polish-02-admin.js`
- `public/rc1-admin-loader.js`
- `public/rc1-admin.js`
- `public/rc2-admin-loader.js`
- `public/rc2-admin.js`
- `public/rc3-admin.js`
- `public/rc4-admin.js`
- `public/rc5-admin.js`
- `public/rc6-admin.js`
- `public/rc7-admin.js`
- `public/platform-data.js`
- the CSS references and dynamically injected stylesheets reached from those modules
- `docs/PROJECT_ROADMAP.md`

## Startup map

### Static document phase

`admin.html` loads:

- `style.css`
- `platform.css`
- `admin-platform.css`
- `music-library-admin.css`
- `admin-dj-workflow.css`
- inline live/preview mode detection
- inline login/portal visibility safety guards
- inline sign-out safety handling
- `admin-entry.js`

The static shell starts with a safe login state. These guards remain important because failure must never hide both login and dashboard.

### Entry module phase

`admin-entry.js` imports, in order:

1. `admin-fields.js`
2. `rc1-admin-fields.js`
3. `track-admin-foundation.js`
4. `admin-platform.js`
5. `rc1-admin-loader.js`
6. `rc2-admin-loader.js`
7. `rc3-admin.js`
8. `admin-dj-workflow.js`

In live mode it also imports `admin-live-login.js`.

### Hidden fan-out

`admin-fields.js` starts an unawaited asynchronous import sequence:

1. `admin-enhancements.js`
2. `sprint-admin.js`
3. `case-admin.js`
4. `module1-admin.js`
5. `polish-admin-safe.js`
6. `polish-02-admin.js`

Because this sequence is not awaited by `admin-entry.js`, it races with the later entry imports.

The RC chain expands further:

- `rc1-admin-loader.js` waits for `polishadminready`, then imports `rc1-admin.js`.
- `rc3-admin.js` imports `rc4-admin.js`.
- `rc4-admin.js` imports `rc5-admin.js`.
- `rc5-admin.js` imports `rc6-admin.js`.
- `rc6-admin.js` imports `rc7-admin.js`.

`rc2-admin-loader.js` deliberately skips RC2 and only sets a compatibility flag.

### Live authentication phase

`admin-live-login.js` is the authoritative live authentication path:

1. initialize Firebase/Auth;
2. authenticate the user;
3. verify `admins/<uid>` and `active !== false`;
4. load dashboard modules;
5. apply final login/dashboard visibility;
6. dispatch the final visibility event.

It also waits for either the authenticated event or a two-second fallback before reapplying the final visibility state.

## Current responsibility map

| Area | Current effective owner | Competing or supporting layers | Audit status |
|---|---|---|---|
| Live authentication and final visibility | `admin-live-login.js` | `admin.html` guards; duplicate auth/visibility handling in `admin-platform.js` | Protected; duplication needs later isolation |
| Static shell | `admin.html` | `sprint-admin.js`, `track-admin-foundation.js`, `module1-admin.js` alter placement/navigation | Protected shell; accepted enhancements still active |
| Base tab switching | `admin-platform.js` | `module1-admin.js` handles module views | Active |
| Music Library table, filters and sorting | `admin-platform.js` → `renderMusicLibrary()` | `polish-admin-safe.js` contains an older renderer | `admin-platform.js` is the final owner |
| Track Editor data, save and uploads | `admin-platform.js` | `track-admin-foundation.js` groups and enhances the existing DOM | Both required |
| Missing Data workspace | `admin-platform.js` | `track-admin-foundation.js` opens/highlights editor sections | Both required |
| DJ Applications | `admin-dj-workflow.js` | `module1-admin.js`, `rc6-admin.js` and `rc7-admin.js` contain older DJ render/status logic | Final owner is `admin-dj-workflow.js` |
| Full Music CSV | `rc3-admin.js` | `polish-02-admin.js` contains an older Music CSV export | RC3 currently required for accepted export |
| DJ Applications CSV | `admin-dj-workflow.js` | `polish-02-admin.js` injects an obsolete DJ export | Final owner is `admin-dj-workflow.js` |
| Dashboard statistics/attention/health | `admin-platform.js` base render | `sprint-admin.js` delayed enhancements; `rc1-admin.js` rewrites attention/health | Contested and a visible-cycling risk |
| Settings | `sprint-admin.js`, `module1-admin.js`, `rc4-admin.js`, `rc5-admin.js` | `admin-enhancements.js` creates visibility settings | Multiple accepted responsibilities remain intertwined |
| Enquiries and orders | `admin-platform.js` base collections | `module1-admin.js`, `polish-admin-safe.js`, `polish-02-admin.js`, `rc1-admin.js`, `rc4-admin.js` | Duplicated reads/enhancements |
| Case studies | `admin-platform.js` list | `case-admin.js` editor/form | Supporting pair |

## Why old-version cycling can occur

The cycling is not one old page being loaded. It is multiple active layers progressively changing the same DOM:

- the static HTML shell paints first;
- inline safety guards apply visibility;
- live authentication applies visibility again;
- `admin-platform.js` renders base dashboard and collections;
- the unawaited `admin-fields.js` fan-out completes at variable times;
- `sprint-admin.js` schedules enhancements at 0, 250 and 750 milliseconds;
- RC4, RC6 and RC7 schedule further work at 250, 750 and 1500 milliseconds;
- `rc1-admin.js` later reloads data and rewrites dashboard attention/health;
- dynamically injected CSS can cause additional reflow after first paint.

This timing-sensitive layering explains why older/recovered layouts can briefly appear before the accepted final state.

## Repeated data work

Confirmed or strongly indicated duplicate reads include:

- `admin-platform.js`: tracks plus enquiries, projects, orders and case studies;
- `rc1-admin.js`: tracks, enquiries and orders again;
- `polish-admin-safe.js`: tracks and preview collections again;
- `admin-dj-workflow.js`: enquiries for the current DJ workflow;
- `module1-admin.js`: older enquiry/DJ handling;
- `rc6-admin.js` and `rc7-admin.js`: additional DJ enquiry reads.

The exact billed-read effect depends on authentication state, cache and permissions, but the duplication is structurally present.

## Module classification

### Active and required now

- `admin-entry.js`
- `admin-live-login.js`
- `admin-platform.js`
- `track-admin-foundation.js` and its CSS
- `admin-dj-workflow.js` and its CSS
- `platform-data.js`
- `admin-fields.js`
- `rc1-admin-fields.js`
- `sprint-admin.js` and `business-dashboard.css`
- `module1-admin.js`
- `rc3-admin.js` for the accepted full Music CSV

### Active but overlapping or legacy-shaped

- `admin-enhancements.js`
- `polish-admin-safe.js`
- `polish-02-admin.js`
- `rc1-admin-loader.js` and `rc1-admin.js`
- `rc4-admin.js`
- `rc5-admin.js`
- `rc6-admin.js`
- `rc7-admin.js`

These files are not safe deletion targets yet. They contain a mixture of accepted UI, compatibility behaviour, old renderers and delayed enhancement logic.

### Compatibility/no-op

- `rc2-admin-loader.js` currently skips RC2 and sets `globalThis.rc2AdminSkipped`.
- `rc2-admin.js` is not loaded by that loader.

### Not in the current mapped startup chain

- `admin-bootstrap.js`
- `admin-rc5-preview.js`
- `admin-live-fields.js`

`admin-live-fields.js` must not be reintroduced.

## Risk-ranked findings

### High

1. `admin-fields.js` launches an unawaited import chain, making final render order timing-dependent.
2. `rc3-admin.js` silently imports the RC4–RC7 chain even though its current named requirement is the Music CSV.
3. `polish-admin-safe.js` and `admin-platform.js` both own Music Library rendering paths.
4. `module1-admin.js`, RC6/RC7 and `admin-dj-workflow.js` overlap in DJ Database responsibilities.
5. Several modules schedule delayed DOM rewrites, directly enabling visible cycling.

### Medium

1. Auth/login visibility responsibility is duplicated between `admin-live-login.js`, `admin-platform.js` and inline guards.
2. Dashboard, enquiries, orders and DJ data are read repeatedly.
3. CSS is injected after first paint by multiple modules.
4. `rc1-admin-loader.js` can wait up to five seconds for polish readiness and has a further import timeout.

### Low

1. `rc2-admin-loader.js` adds a request/import step for a deliberate no-op.
2. Historical export controls are still created and then superseded or hidden.
3. Legacy local-order-note behaviour remains mixed into RC4.

## Safe future cleanup sequence

No item below is authorization to edit runtime code. Each step needs its own preview-first brief and acceptance test.

### Stage 1 — Documentation / no code

- Preserve this ownership map and the protected-file list.
- Capture a stable tag/snapshot and a short manual acceptance checklist.
- Add lightweight startup instrumentation in preview only in a separately authorized pass.

### Stage 2 — Low-risk disable

- Extract the accepted full Music CSV from `rc3-admin.js` into a focused current module.
- Stop importing RC3 solely for export, then test whether RC4–RC7 can be loaded only where their confirmed responsibilities are needed.
- Make `admin-platform.js` the only Music Library renderer while retaining required non-render helpers from `polish-admin-safe.js`.
- Make `admin-dj-workflow.js` the only DJ Applications renderer after parity testing.
- Keep disabled files present during this stage and preview-test each responsibility boundary.

### Stage 3 — Remove proven dead files

- Remove imports before deleting physical files.
- Remove the RC2 no-op import only after confirming no consumer relies on `rc2AdminSkipped`.
- Delete superseded renderer files only after preview and live snapshots pass.
- Keep a Git tag before physical removal.

### Stage 4 — Performance / lazy load

- Consolidate dashboard data loading so tracks/enquiries/orders are fetched once and shared.
- Replace delayed timer-based repainting with one explicit post-render event.
- Load feature-specific modules when their tab is opened, beginning with case studies and non-critical settings.
- Move required dynamic CSS into the initial admin stylesheet set only after visual comparison testing.
- Re-audit network requests, Firestore reads, event listeners and first stable paint before production deployment.

## Required regression checks for any cleanup

- Production `/admin.html` opens live login.
- `/admin.html?preview=1` remains safe preview.
- Preview-channel `/admin.html` remains preview by default.
- Preview-channel `/admin.html?live=1` authenticates and opens the dashboard once.
- Login and dashboard are never both hidden.
- Music Library loads and the Track Editor saves/reloads.
- Missing Data opens the correct editor section.
- Full Music CSV exports.
- DJ Applications load from Firestore.
- DJ export, approval, rejection, notes and invitation queueing work.
- Settings and page visibility still save.
- No `MutationObserver`, `coreReady`, `admin-live-fields.js` or “Live admin data timed out” logic is introduced.

## Audit decision

The startup chain should be simplified, but a bulk deletion or broad rewrite would be unsafe. The best first implementation pass is to extract the accepted Music CSV from RC3 and separate final Music/DJ render ownership from legacy enhancers. This creates a clean boundary before deferring or removing any RC chain.

## Module 2E.6 implementation note

The accepted Full Music CSV implementation has been extracted into the focused
`public/music-library-export.js` module. It preserves the existing button label,
placement, styling hook, full-data field order, legacy/additional field inclusion,
CSV escaping and dated filename.

`rc3-admin.js` now imports that focused module instead of owning the export code.
RC3 itself remains imported because it still has accepted non-export responsibilities:

- replacing the Key input with the current select control;
- applying service-page visibility to Projects/Cases/Vinyl navigation;
- adding the System/setup status card;
- providing the empty-order preview fallback;
- providing legacy DJ export enhancement behaviour.

Therefore RC4–RC7 are still loaded through RC3 and their delayed callbacks remain
active. Removing RC3 in this pass would have exceeded the proven-safe export boundary.
No startup/auth file was changed, no RC file was deleted and no performance
improvement is claimed until preview behaviour is measured.

The next safe candidate is to identify current owners for each remaining RC3
non-export responsibility, especially the obsolete DJ export enhancement. Once
those responsibilities have parity coverage, RC3 can be decoupled from
`admin-entry.js` and the RC4–RC7 chain can be evaluated independently.

Preview deployment verification:

- `/admin.html?live=1` displayed the stable authorised-admin login form with no
  Preview button and no stuck/blank state.
- `/admin.html?preview=1` opened the safe preview dashboard.
- Music Library displayed exactly one `Export full music data CSV` button and
  one Add Track button.
- No protected-pattern regression was found and both changed JavaScript files
  passed `node --check`.
- Browser automation did not capture the blob download event, so CSV file
  contents and the authenticated live-dashboard journey remain manual
  acceptance checks.
- Because RC3–RC7 remain active, startup cycling is expected to be unchanged;
  no performance improvement is claimed for this boundary-extraction pass.

Module 2E.6 was subsequently accepted by user preview testing, committed as
`83c9834`, and tagged
`stable-preview-module2e6-csv-extraction-20260702-2242`.

## Module 2E.7 implementation note

The visible login-to-dashboard cycle had two direct early-reveal paths:

1. `admin-live-login.js` called `showAuthenticatedDashboard()` immediately
   after permission passed, before `loadAdminDashboardModules()`.
2. `admin-platform.js` independently showed `#adminPortal` before its initial
   `loadAll()` Firestore/data render completed.

Those paths exposed the static dashboard and each legacy enhancement while the
accepted interface was still assembling. Module 2E.7 keeps the login/loading
panel visible while modules and initial dashboard data load, then lets
`admin-live-login.js` perform the final reveal once.

The change is deliberately narrow:

- `admin-live-login.js` no longer performs its pre-module or event-callback
  dashboard reveal; its existing final reveal and two-second safety fallback
  remain.
- `admin-platform.js` completes `loadAll()` before dispatching
  `play-admin-live-authenticated`. When live login owns the handoff, it does not
  independently reveal the portal.
- Preview/non-orchestrated behaviour retains the existing fallback reveal.

No delayed RC callback, RC import, Firestore query or renderer was removed.
RC3 remains imported and RC4–RC7 remain loaded. Their work should now occur
behind the login/loading state during the normal authenticated handoff, which
targets visible cycling without changing their accepted responsibilities.

### Module 2E.7.1 action-row correction

User preview testing confirmed the Module 2E.7 reveal ordering substantially
improved visible startup cycling, but exposed a pre-existing Music Library
render-order dependency: `renderMusicLibrary()` replaced
`#musicLibraryFilters.innerHTML` before querying for
`.music-library-top-actions`. When the export module created the action row
before the first data render, that replacement removed both Add Track and Full
Music CSV controls.

`admin-platform.js` now captures the existing action-row node before rebuilding
the filters and reattaches it immediately afterward. The current
`music-library-export.js` remains the action-row/export owner; no duplicate
button or new renderer was added. This preserves the improved startup handoff
and allows the controls to survive initial render, subsequent data refreshes
and tab changes.

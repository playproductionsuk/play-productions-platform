# Play Productions Admin Startup Owner Map

## Purpose

This map records the current admin startup/render ownership for Phase B.4. It is grounded in the active import chain and the existing `docs/ADMIN_STARTUP_AUDIT.md`. It is not a redesign plan and it does not authorise broad removal of old RC files.

## Current startup chain

1. `public/admin.html` paints the static login/portal shell, loads admin styles and chooses live vs preview mode.
2. `public/admin-entry.js` loads the dashboard module sequence.
3. In live mode, `public/admin-live-login.js` owns Firebase Auth, the `admins/<uid>` permission check and the final login-to-dashboard visibility handoff.
4. `public/admin-platform.js` owns the base dashboard, data load, Music Library, Track Editor, collections and core admin navigation.
5. `public/track-admin-foundation.js` enhances the Track Editor, readiness groups, media cards and editor save controls.
6. `public/admin-dj-workflow.js` owns the accepted DJ Applications workflow, request cards, approval/rejection controls, notes and final DJ Applications CSV export.
7. RC/polish modules then add legacy compatibility, dashboard/settings/order/DJ enhancements and delayed post-render mutations.

## Primary owners

| Area | Final owner | Supporting / competing modules | Status |
| --- | --- | --- | --- |
| Initial HTML shell | `admin.html` | Inline safe visibility guards | Protected |
| Live auth | `admin-live-login.js` | `admin-platform.js` has legacy auth fallback | Protected |
| Loading / visibility handoff | `admin-live-login.js` final reveal after module/data load | `admin.html`, `admin-platform.js` | Protected |
| Final dashboard base | `admin-platform.js` | `sprint-admin.js`, `rc1-admin.js`, `rc3-admin.js` | Active but contested |
| Music Library table/filter/sort | `admin-platform.js -> renderMusicLibrary()` | `polish-admin-safe.js` has older renderer | `admin-platform.js` is final owner |
| Track Editor save/upload/media | `admin-platform.js` | `track-admin-foundation.js` enhances DOM only | Required pair |
| Missing Data workspace | `admin-platform.js` | `track-admin-foundation.js` opens/focuses editor groups | Required pair |
| Full Music CSV | `music-library-export.js` loaded via `rc3-admin.js` | Older exports in `polish-02-admin.js` | Final export module is focused, RC3 still imports it |
| DJ Database / Applications | `admin-dj-workflow.js` | `module1-admin.js`, `rc6-admin.js`, `rc7-admin.js` mutate older DJ tables/actions | `admin-dj-workflow.js` is final owner |
| DJ Applications CSV | `admin-dj-workflow.js` | `rc3-admin.js` and `polish-02-admin.js` contain obsolete DJ export paths | Final owner is `admin-dj-workflow.js` |
| Settings | `sprint-admin.js`, `module1-admin.js`, `rc4-admin.js`, `rc5-admin.js` | `admin-enhancements.js` creates public page visibility | Intertwined; unsafe for broad cleanup |
| Enquiries | `admin-platform.js` base list | `module1-admin.js`, `rc1-admin.js`, `polish-02-admin.js` | Contested |
| Orders | `admin-platform.js` base list | `polish-02-admin.js`, `rc3-admin.js`, `rc4-admin.js` | Contested |
| Case studies | `admin-platform.js` list | `case-admin.js` editor functionality | Required pair |

## Module mutation map

| Module | Startup role / mutation |
| --- | --- |
| `admin-fields.js` | Adds extra Track Editor fields, then unawaited-imports `admin-enhancements.js`, `sprint-admin.js`, `case-admin.js`, `module1-admin.js`, `polish-admin-safe.js`, `polish-02-admin.js`. This hidden fan-out is a timing/cycling risk. |
| `rc1-admin-fields.js` | Adds older field compatibility. |
| `track-admin-foundation.js` | Enhances the active Track Editor; required for Phase E media/readiness UX. |
| `admin-platform.js` | Core data load/render/save owner. |
| `rc1-admin-loader.js` | Waits for polish readiness and imports `rc1-admin.js`; includes timeout behaviour. |
| `rc1-admin.js` | Reads tracks/enquiries/orders and rewrites dashboard attention/health. |
| `rc2-admin-loader.js` | Deliberately skips RC2 and sets compatibility flag. |
| `rc3-admin.js` | Key select, page visibility buttons, system status card, order fallback, imports `music-library-export.js`, then imports RC4. Before B.4 it also injected obsolete DJ export UI with delayed retries. |
| `rc4-admin.js` | Settings/account/social/order enhancements; imports RC5. |
| `rc5-admin.js` | Settings tab layer; imports RC6. |
| `rc6-admin.js` | Older DJ status controls and Firestore enquiry read; imports RC7. |
| `rc7-admin.js` | Older DJ status/navigation polish and Firestore enquiry read. |
| `module1-admin.js` | Creates module DJ/Vinyl views, renders older DJ table, loads enquiries, settings tab layer. |
| `admin-dj-workflow.js` | Final DJ Applications workflow owner. |
| `polish-admin-safe.js` | Older overview/library renderer and repeated collection reads. |
| `polish-02-admin.js` | Older export buttons, KPI strip and repeated collection reads; dispatches polish readiness. |
| `admin-enhancements.js` | Public page visibility settings and design CSS injection. |
| `sprint-admin.js` | Business dashboard visual/title/nav/settings enhancements and delayed stat rewrites. |
| `case-admin.js` | Case study editing. |

## Repeated Firestore reads / render paths

- `admin-platform.js` reads the primary collections for the accepted dashboard.
- `rc1-admin.js` reads tracks, enquiries and orders again for attention/health cards.
- `module1-admin.js` reads enquiries again for older enquiry/DJ views.
- `admin-dj-workflow.js` reads enquiries for the accepted DJ Applications workflow.
- `rc6-admin.js` and `rc7-admin.js` can read enquiries again for older DJ status enhancements.
- `polish-admin-safe.js` and `polish-02-admin.js` contain additional collection reads and older render/export paths.

## Style-only vs markup-rebuild behaviour

- Mostly style/assets: admin CSS files, `business-dashboard.css`, `design-v3.css`, `track-admin-foundation.css`, `admin-dj-workflow.css`.
- Markup rebuild or mutation: `admin-platform.js`, `module1-admin.js`, `sprint-admin.js`, `polish-admin-safe.js`, `rc1-admin.js`, `rc3-admin.js`, `rc4-admin.js`, `rc5-admin.js`, `rc6-admin.js`, `rc7-admin.js`, `admin-dj-workflow.js`.

## Unreferenced / quarantine candidates

Static audit candidates remain:

- `admin-bootstrap.js`
- `admin-dj.js`
- `admin-field-setup.js`
- `polish-admin.js`
- `rc2-admin.js`

These should not be deleted in this pass. They are quarantine candidates only.

## Safe deferred-loading candidates

Best future candidates, one at a time:

1. Case-study editor code, if the Case Studies tab is not opened.
2. Settings-only enhancements after Settings tab activation.
3. Older DJ table/status enhancers after confirming `admin-dj-workflow.js` covers all accepted DJ behaviour.
4. RC3 non-export responsibilities after each responsibility has a focused current owner.

## Unsafe to touch in Phase B.4

- `public/admin.html`
- `public/admin-entry.js`
- `public/admin-live-login.js`
- `public/admin-platform.js` save/upload/identity logic
- `public/functions/index.js`
- checkout, payments, protected download code
- Firebase rules or data schema

## Phase B.4 chosen slice

The selected cleanup slice is a small Option B-style duplicate-render reduction:

- remove RC3's obsolete `Export DJs + notes` injection, click handler and delayed retries;
- keep the accepted DJ export in `admin-dj-workflow.js`;
- keep RC3 itself and the RC4-RC7 chain in place;
- do not change live auth/startup entry files.

This removes one legacy post-render mutation path from the DJ Database without changing approval, rejection, notes, invitation, Firestore rules or backend logic.

## Before metrics captured

Preview URL measured unauthenticated/read-only:

- URL: `https://play-productions--preview-4sqed4ku.web.app/admin.html?live=1`
- Login visible: yes
- Dashboard hidden: yes
- Console errors/warnings: none observed in the unauthenticated shell
- Script count: 6 top-level document scripts
- Style count after module loading: 15 stylesheets/style nodes
- Observed dynamic admin styles included `track-admin-foundation.css`, `polish-01.css`, `polish-02.css`, `rc1-followup.css`, `rc2-fixes.css`, `design-v3.css`, `business-dashboard.css`

Authenticated dashboard timing and visible state-change count could not be measured in this restricted automation pass because an authenticated controllable browser session was not available.

## Expected effect

This does not solve all admin cycling. It removes a confirmed obsolete DJ Database mutation/retry path and documents the remaining startup owners so the next slice can safely target either module gating or repeated data/render ownership.

## Phase B.4.1 preview result

The obsolete RC3 DJ export cleanup was preview-verified:

- authenticated preview admin loaded successfully;
- Dashboard, Music Library, DJ Database and Settings remained healthy;
- the accepted `Export DJ applications CSV` button remained visible and functional structurally;
- no `Export DJs + notes` or `Export DJs CSV` legacy button appeared;
- no console errors were observed;
- broader login-to-dashboard cycling remained.

## Phase B.4.2 selected path

The remaining competing live-auth path is in `public/admin-platform.js`:

- it attached a legacy submit handler to `#loginForm`;
- it set `#loginStatus` to `Live test mode. Sign in with an authorised admin account.`;
- it created its own `onAuthStateChanged` listener;
- it could call `login.hidden = true` and `portal.hidden = false`;
- it could dispatch `play-admin-live-authenticated` as part of its own auth/reveal path.

In live mode, this competes with `admin-live-login.js`, which should remain the sole owner of:

- live Firebase sign-in state;
- `admins/<uid>` permission checking;
- sign-in/auth progress copy;
- final login/dashboard visibility.

The B.4.2 guard keeps `admin-platform.js` as the dashboard/data/render owner, but removes its duplicate live auth/reveal responsibility:

- legacy `#loginForm` submit handling now runs only when `playAdminLiveMode !== true`;
- in live mode, `admin-platform.js` performs `loadAll()` after `admin-live-login.js` has imported dashboard modules following a successful admin permission check;
- after data rendering, `admin-platform.js` dispatches the existing `play-admin-live-authenticated` event so `admin-live-login.js` can perform the final reveal;
- safe preview and non-live fallback behaviour remain on the existing legacy path.

No protected startup files are changed for B.4.2.

## Phase B.4.3 selected path

After B.4.2, authenticated preview testing reduced the precise visible startup
sequence from seven states to five, removed the `Live test mode...` status copy
and removed actual nav/login overlap. One remaining live startup flash was still
observed:

- `Business Dashboard sign in / Checking admin permission...`

The exact owner is `public/sprint-admin.js`:

```js
const title = document.querySelector("#loginPanel h1");
if (title) title.textContent = "Business Dashboard sign in";
```

This code runs immediately when `sprint-admin.js` is imported through the
admin enhancement chain. It runs in live mode and preview mode. It is useful as
legacy/safe-preview branding, but it competes with the live admin shell where
`admin.html` and `admin-live-login.js` already own the sign-in title and auth
copy.

The B.4.3 guard is intentionally tiny:

- preserve the Sprint admin module;
- preserve its stylesheet, nav labels, dashboard stat enhancement and Settings
  cards;
- preserve the legacy/safe-preview login title rewrite;
- skip only the login-title rewrite when `playAdminLiveMode === true`.

No protected startup files are changed for B.4.3.

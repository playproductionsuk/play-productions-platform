# Play Productions Project Roadmap

## 1. Current stable live state

- Live admin works at `/admin.html`.
- DJ Applications workflow works.
- DJ approval and rejection work.
- Invitation email sends through Firebase Trigger Email.
- DJ password setup works.
- DJ login works.
- DJ promo crate works.
- Protected MP3 downloads work.
- DJ Applications CSV export works on live.
- Production `/admin.html` defaults to live admin.
- `/admin.html?preview=1` remains available as the preview fallback.

## 2. Current active module

**Module 2 — Track Admin / Music Library management**

All Module 2 work is preview-first.

Preview test URL:

<https://play-productions--preview-4sqed4ku.web.app/admin.html?live=1>

## 3. Completed milestones

- Restored a reliable admin login and dashboard without black-screen behaviour.
- Preserved a safe preview-mode admin fallback.
- Completed the DJ application workflow.
- Added DJ approval and rejection handling.
- Added invitation emails through Firebase Trigger Email.
- Added DJ password setup and live email/password login.
- Added approved-DJ access checks for the promo crate.
- Added protected, MP3-only DJ promo downloads.
- Added DJ promo sign-out support.
- Added a single, deduplicated DJ Applications CSV export.
- Began the Module 2 Track Admin readiness foundation for Web, Sale, DJ and Release.
- Added track editor grouping and clickable readiness links in preview.

## 4. Immediate next tasks

- Improve the Music Library table width and layout.
- Remove the redundant Missing Fields column.
- Centre and align table headers and relevant cells.
- Centre the **Update / edit** button text.
- Keep one music export button: **Export full music data CSV**.
- Put **Add Track** and the export button in one neat action row.
- Rename **Delete document** to **Delete**.
- Add Music Library filters: **All**, **Web**, **Sale**, **DJ**, **Release** and **Archived**.
- Keep readiness pills clickable and linked to their editor sections.

## 5. Future development ideas

- Create branded fallback or coming-soon artwork in the Play Productions style.
- Test track field flow-through to the public Music page.
- Test track field flow-through to the DJ promo crate.
- Add a real track upload workflow using shared MP3 and WAV/master assets.
- Expand track readiness management across Web, Sale, DJ and Release.
- Add new-track notification tracking.
- Later add a deliberate **Queue/send new track notification** button.
- Build a contact database for DJs, radio, labels, blogs and playlist curators.
- Add promo campaign tracking per track.
- Smoke-test the customer purchase and account flow.
- Review paid MP3/WAV fulfilment options.
- Clean up public demo and preview clutter.
- Complete Firebase API-key restrictions and GitHub alert cleanup.

## 6. Known issues / watch-outs

- Do not reintroduce `admin-live-fields.js`.
- Do not reintroduce `coreReady` waiting logic.
- Do not reintroduce the message **“Live admin data timed out”**.
- A previous admin startup cleanup broke login and was reverted.
- Module 2A packages must be built from the current stable main version, not older reverted branches.
- All work should be tested on the Firebase preview channel before production.

## 7. Deployment rules

Preview first:

```powershell
firebase.cmd hosting:channel:deploy preview
```

Production only after the preview passes:

```powershell
firebase.cmd deploy --only hosting
```

Deploy Functions only when `functions/index.js` changes.

## 8. Do-not-touch rules

Unless explicitly requested, do not change:

- Admin login or startup.
- DJ approval and email workflow.
- DJ promo download backend.
- Checkout or payments.
- Public pages.
- `functions/index.js`.

## 9. Notes for future Codex passes

For every future task, update this roadmap when:

- A milestone is completed.
- A new issue is discovered.
- A future task is identified.
- Module priorities change.

Before editing, inspect the current stable files rather than relying on an older package or conversation context. Keep changes narrowly scoped, preserve working flows and test on preview before considering production deployment.

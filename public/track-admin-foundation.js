import { firebaseReady, db } from "./platform-data.js";
import { deleteDoc, doc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const style = document.createElement("link");
style.rel = "stylesheet";
style.href = "track-admin-foundation.css";
document.head.appendChild(style);

const adminUser = document.querySelector("#adminUser");
const signOutButton = document.querySelector("#signOutButton");
if (adminUser && signOutButton) {
  let accountActions = document.querySelector(".admin-account-actions");
  if (!accountActions) {
    accountActions = document.createElement("div");
    accountActions.className = "admin-account-actions";
    signOutButton.insertAdjacentElement("beforebegin", accountActions);
  }
  adminUser.classList.add("admin-header-user");
  accountActions.append(adminUser, signOutButton);
}

const checklist = document.querySelector("#releaseChecklist");
if (checklist && !document.querySelector("#samplesChecked")) {
  checklist.insertAdjacentHTML("beforebegin", `
    <section class="track-readiness-editor full">
      <div class="track-editor-group release-workflow">
        <h3>Release administration</h3>
        <p>Manual checks only. Nothing here sends email or publishes the track automatically.</p>
        <div class="track-check-grid">
          <label><input type="checkbox" checked disabled> Track assets reviewed in Web / Track Basics</label>
          <label><input id="samplesChecked" name="samplesChecked" type="checkbox"> Samples checked</label>
          <label><input id="tracklibChecked" name="tracklibChecked" type="checkbox"> Tracklib checked</label>
        </div>
      </div>
    </section>
    <section class="track-promo-tracking full">
      <div class="track-editor-group">
        <h3>Promo / Notification Tracking</h3>
        <p>Manual tracking only. Saving these fields does not send an email or publish a social post.</p>
        <div class="track-check-grid">
          <label><input id="newTrackNotificationSent" name="newTrackNotificationSent" type="checkbox"> New track notification sent</label>
        </div>
        <div class="track-admin-fields">
          <label>Notification sent date<input id="newTrackNotificationSentAt" name="newTrackNotificationSentAt" type="datetime-local"></label>
          <label>Social promo status<select id="socialPromoStatus" name="socialPromoStatus"><option value="">Not set</option><option value="planned">Planned</option><option value="posted">Posted</option><option value="not-required">Not required</option></select></label>
          <label class="wide">Notification notes<textarea id="notificationNotes" name="notificationNotes"></textarea></label>
          <label class="wide">Social promo notes<textarea id="socialPromoNotes" name="socialPromoNotes"></textarea></label>
        </div>
        <button class="button ghost mark-notification-sent" type="button" data-mark-notification-sent>Mark notification sent</button>
      </div>
    </section>
  `);
}

const trackForm = document.querySelector("#trackForm");
if (trackForm && !document.querySelector("#trackEditorGroups")) {
  const groupDefinitions = [
    ["web", "Web / Track Basics", "Core metadata, visibility and shared artwork/audio assets."],
    ["sale", "Personal Sale", "Personal MP3/WAV sale availability and track-level pricing."],
    ["dj", "DJ Promo", "Promo-pool visibility using the same shared MP3 asset."],
    ["release", "Release Admin", "Registration, distribution and release checks in workflow order."],
    ["promo", "Promo / Notification Tracking", "Manual notification and social-promotion tracking."],
    ["advanced", "All Data / Advanced", "SEO, platform links and all remaining track metadata."]
  ];
  const groups = document.createElement("div");
  groups.id = "trackEditorGroups";
  groups.className = "track-editor-groups full";
  groups.innerHTML = groupDefinitions.map(([id, title, description], index) => `
    <details id="track-group-${id}" class="track-editor-section" ${index === 0 ? "open" : ""}>
      <summary><strong>${title}</strong><span>${description}</span></summary>
      <div class="track-editor-section-body"></div>
    </details>
  `).join("");
  checklist.insertAdjacentElement("beforebegin", groups);

  const body = id => groups.querySelector(`#track-group-${id} .track-editor-section-body`);
  const moveField = (id, group) => {
    const input = document.querySelector(`#${id}`);
    const container = input?.closest(".field,.file-field,.check-field") || input?.closest("label");
    if (container && !container.closest(".track-editor-section")) body(group)?.appendChild(container);
  };

  [
    "title","artist","releaseTitle","slug","status","style","subgenre","bpm","key",
    "moodTags","teaser","description","releaseDate","dateTbc","showInStore",
    "showInLatest","featured","cover","preview","master"
  ].forEach(id => moveField(id, "web"));
  ["price","purchaseEnabled","allowExclusiveEnquiry"].forEach(id => moveField(id, "sale"));
  ["showInDjPool"].forEach(id => moveField(id, "dj"));
  [
    "samplesChecked","tracklibChecked","prsRegistered","pplRegistered","distributionUploaded",
    "tunecoreUploaded","distributedToStores","isrc","upc","distributionReleaseId","tunecoreUrl",
    "spotifyUrl","appleMusicUrl","soundcloudUrl","youtubeMusicUrl","releaseDateConfirmed",
    "publicWebsiteUpdated","releaseChecklistNotes","adminNotes"
  ].forEach(id => moveField(id, "release"));

  const releaseFoundation = document.querySelector(".track-readiness-editor");
  if (releaseFoundation) body("release")?.appendChild(releaseFoundation);
  const promoTracking = document.querySelector(".track-promo-tracking");
  if (promoTracking) body("promo")?.appendChild(promoTracking);

  const protectedNodes = new Set([
    groups,
    checklist,
    document.querySelector(".form-actions"),
    document.querySelector("#editingId")
  ]);
  [...trackForm.children].forEach(node => {
    if (!protectedNodes.has(node)) body("advanced")?.appendChild(node);
  });
  groups.querySelectorAll(".metadata-fields,.switch-grid,.file-fields").forEach(container => {
    if (!container.children.length) container.remove();
  });
  body("advanced")?.insertAdjacentHTML("afterbegin", `
    <aside class="advanced-field-guide">
      <strong>Field purpose</strong>
      <span><b>Website / SEO:</b> SEO title, description and share imagery</span>
      <span><b>Release/admin:</b> writer, producer, publisher, copyright and distribution records</span>
      <span><b>Compatibility:</b> direct MP3/WAV references retained for older catalogue and fulfilment paths</span>
      <small>These fields are preserved for compatibility. Only change them when you know which downstream service uses them.</small>
    </aside>`);
}

if (trackForm && !document.querySelector("#trackEditorSaveControls")) {
  const editorHeader = document.querySelector("#trackEditor>.admin-section-title");
  const closeEditor = document.querySelector("#closeEditor");
  const controls = document.createElement("div");
  controls.id = "trackEditorSaveControls";
  controls.className = "track-editor-save-controls";
  controls.innerHTML = `
    <span class="track-visibility-summary" aria-live="polite"></span>
    <button type="button" class="button primary" data-save-track-top>Save Track</button>
  `;
  if (editorHeader) editorHeader.insertBefore(controls, closeEditor);

  const topSave = controls.querySelector("[data-save-track-top]");
  const bottomSave = document.querySelector("#saveTrack");
  const updateSaveControls = () => {
    const isDraft = document.querySelector("#status")?.value === "draft";
    const isNew = !document.querySelector("#editingId")?.value;
    const readOnly = globalThis.playAdminPreviewOnly === true;
    const label = readOnly ? "Preview only" : isDraft && isNew ? "Save Draft" : "Save Track";
    if (topSave) {
      topSave.textContent = label;
      topSave.disabled = readOnly;
    }
    if (bottomSave) {
      bottomSave.textContent = label;
      bottomSave.disabled = readOnly;
    }
    const state = id => document.querySelector(`#${id}`)?.checked ? "On" : "Off";
    const summary = controls.querySelector(".track-visibility-summary");
    if (summary) summary.textContent = `Website: ${state("showInStore")} | DJ Promo: ${state("showInDjPool")} | Purchase: ${state("purchaseEnabled")}`;
  };
  topSave?.addEventListener("click", () => trackForm.requestSubmit(document.querySelector("#saveTrack")));
  trackForm.addEventListener("input", updateSaveControls);
  trackForm.addEventListener("change", updateSaveControls);
  window.addEventListener("play-admin-visibility-change", updateSaveControls);
  updateSaveControls();
}

if (checklist && !document.querySelector("#trackEditorStatusBar")) {
  const editorHeader = document.querySelector("#trackEditor>.admin-section-title");
  const statusBar = document.createElement("section");
  statusBar.id = "trackEditorStatusBar";
  statusBar.className = "track-editor-status-bar";
  statusBar.innerHTML = '<div id="trackEditorReadinessSummary" class="track-editor-readiness-summary" aria-live="polite"></div>';
  editorHeader?.insertAdjacentElement("afterend", statusBar);
  statusBar.appendChild(checklist);
}

const price = document.querySelector("#price");
if (price && !document.querySelector("#trackPriceHelp")) {
  price.insertAdjacentHTML("afterend", '<small id="trackPriceHelp">New tracks use the saved default price when available; this field remains the track-level override.</small>');
}

const slugField = document.querySelector("#slug");
const titleField = document.querySelector("#title");
const artistField = document.querySelector("#artist");
const releaseTitleField = document.querySelector("#releaseTitle");
const seoTitleField = document.querySelector("#seoTitle");
const seoDescriptionField = document.querySelector("#seoDescription");
const teaserField = document.querySelector("#teaser");
const descriptionField = document.querySelector("#description");
const releaseDateField = document.querySelector("#releaseDate");
const dateTbcField = document.querySelector("#dateTbc");
let slugManuallyEdited = false;
let seoTitleManuallyEdited = false;
let seoDescriptionManuallyEdited = false;

const slugFromTitle = value => String(value || "").toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
const addHelp = (input, text) => {
  if (!input || input.parentElement.querySelector(".track-field-help")) return;
  input.insertAdjacentHTML("afterend", `<small class="track-field-help">${text}</small>`);
};

addHelp(titleField, "Track name shown throughout the catalogue.");
addHelp(releaseTitleField, "Release or project title. It follows Track Title until you enter something different.");
addHelp(teaserField, "Short summary used on cards and catalogue lists.");
addHelp(descriptionField, "Longer copy used on the individual track detail page.");
addHelp(releaseDateField, "Entering a date turns off Release date TBC automatically.");
addHelp(document.querySelector("#showInStore"), "Shows this track on the public Music page when its status allows.");
addHelp(document.querySelector("#showInDjPool"), "Shows this track to approved DJs when its status and MP3 allow.");
addHelp(document.querySelector("#purchaseEnabled"), "Allows personal purchase when the track is published and sale assets are complete.");
addHelp(document.querySelector("#showInLatest"), "Includes this track in Latest Releases placements.");
addHelp(document.querySelector("#featured"), "Marks this track for featured placements.");
addHelp(document.querySelector("#allowExclusiveEnquiry"), "Shows the artist/commercial-use enquiry panel on the track detail page.");

document.querySelector("#placeholderArtwork")?.closest("label")?.setAttribute("hidden", "");
slugField?.addEventListener("input", event => {
  if (event.isTrusted) slugManuallyEdited = true;
});
seoTitleField?.addEventListener("input", event => {
  if (event.isTrusted) seoTitleManuallyEdited = true;
});
seoDescriptionField?.addEventListener("input", event => {
  if (event.isTrusted) seoDescriptionManuallyEdited = true;
});
titleField?.addEventListener("input", () => {
  const isNew = !document.querySelector("#editingId")?.value;
  if (!artistField?.value.trim()) artistField.value = "Play Productions";
  if (!releaseTitleField?.value.trim()) releaseTitleField.value = titleField.value;
  if (isNew && !slugManuallyEdited) slugField.value = slugFromTitle(titleField.value);
  if (!seoTitleManuallyEdited && !seoTitleField?.value.trim()) seoTitleField.value = `${titleField.value} | Play Productions`;
});
[teaserField, descriptionField].forEach(field => field?.addEventListener("input", () => {
  if (!seoDescriptionManuallyEdited && !seoDescriptionField?.value.trim()) {
    seoDescriptionField.value = teaserField?.value.trim() || descriptionField?.value.trim() || "";
  }
}));
releaseDateField?.addEventListener("change", () => {
  if (releaseDateField.value && dateTbcField) dateTbcField.checked = false;
});
dateTbcField?.addEventListener("change", () => {
  if (dateTbcField.checked && releaseDateField) releaseDateField.value = "";
});

function defaultTrackPrice() {
  try {
    const settings = JSON.parse(localStorage.getItem("playBusinessSettings") || "{}");
    return Number(settings.defaultTrackPrice || settings.trackDefaultPrice || 1.29);
  } catch {
    return 1.29;
  }
}

document.querySelector("#newTrack")?.addEventListener("click", () => {
  setTimeout(() => {
    if (price && !document.querySelector("#editingId")?.value) price.value = defaultTrackPrice().toFixed(2);
    slugManuallyEdited = false;
    seoTitleManuallyEdited = false;
    seoDescriptionManuallyEdited = false;
    if (artistField) artistField.value = "Play Productions";
    if (dateTbcField) dateTbcField.checked = true;
    document.querySelectorAll(".track-editor-section").forEach(section => {
      section.open = section.id === "track-group-web";
      section.classList.remove("is-focused");
    });
    document.querySelectorAll(".field-required").forEach(field => field.classList.remove("field-required"));
    document.querySelector("#track-group-web")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
});

document.addEventListener("click", event => {
  if (!event.target.closest("[data-edit],[data-library-edit]")) return;
  slugManuallyEdited = true;
  seoTitleManuallyEdited = true;
  seoDescriptionManuallyEdited = true;
});

document.addEventListener("click", async event => {
  const missingEdit = event.target.closest("[data-missing-track]");
  if (missingEdit) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const trackRow = [...document.querySelectorAll("[data-track-row]")].find(row => String(row.dataset.trackRow) === String(missingEdit.dataset.missingTrack));
    trackRow?.querySelector("[data-edit],[data-library-edit]")?.click();
    setTimeout(() => {
      const section = document.querySelector(`#track-group-${missingEdit.dataset.missingArea}`);
      document.querySelectorAll(".track-editor-section").forEach(group => group.open = group === section);
      if (!section) return;
      section.classList.add("is-focused");
      const field = document.querySelector(`#${missingEdit.dataset.missingField}`);
      const target = field?.closest(".field,.file-field,.check-field,label") || section;
      target.classList.add("field-required");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus();
      setTimeout(() => {
        section.classList.remove("is-focused");
        target.classList.remove("field-required");
      }, 1600);
    }, 100);
    return;
  }

  const readiness = event.target.closest("[data-track-readiness]");
  if (readiness) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const row = readiness.closest("[data-track-row]");
    row?.querySelector("[data-edit],[data-library-edit]")?.click();
    setTimeout(() => {
      const section = document.querySelector(`#track-group-${readiness.dataset.trackReadiness}`);
      if (!section) return;
      section.open = true;
      section.classList.add("is-focused");
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => section.classList.remove("is-focused"), 1200);
    }, 100);
    return;
  }

  const mark = event.target.closest("[data-mark-notification-sent]");
  if (mark) {
    event.preventDefault();
    const sent = document.querySelector("#newTrackNotificationSent");
    const sentAt = document.querySelector("#newTrackNotificationSentAt");
    if (sent) sent.checked = true;
    if (sentAt) {
      const now = new Date();
      sentAt.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    document.querySelector("#trackForm")?.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }

  const archive = event.target.closest("[data-track-archive]");
  const restore = event.target.closest("[data-track-restore]");
  const remove = event.target.closest("[data-track-delete-permanent]");
  if (!archive && !restore && !remove) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!firebaseReady || globalThis.playAdminPreviewOnly) {
    alert("Archive and permanent delete require live admin mode.");
    return;
  }

  const id = archive?.dataset.trackArchive || restore?.dataset.trackRestore || remove?.dataset.trackDeletePermanent;
  const row = event.target.closest("[data-track-row]");
  try {
    if (archive) {
      if (!confirm("Archive this track? It will be hidden from the website and DJ promo crate, while its record and uploaded assets are kept.")) return;
      await updateDoc(doc(db, "tracks", id), {
        status: "archived",
        showInStore: false,
        showInDjPool: false,
        purchaseEnabled: false,
        updatedAt: serverTimestamp()
      });
      row?.classList.add("is-archived");
      const status = row?.querySelector(".track-status-value");
      if (status) status.textContent = "archived";
      archive.disabled = true;
      archive.textContent = "Archived";
      window.dispatchEvent(new Event("play-admin-track-state-change"));
      return;
    }

    if (restore) {
      if (!confirm("Restore this track as a draft? It will remain hidden from the website, DJ promo crate and purchases until you review and enable it.")) return;
      await updateDoc(doc(db, "tracks", id), {
        status: "draft",
        showInStore: false,
        showInDjPool: false,
        purchaseEnabled: false,
        updatedAt: serverTimestamp()
      });
      window.dispatchEvent(new Event("play-admin-track-state-change"));
      return;
    }

    if (!confirm("Permanently delete this Firestore track document? Uploaded artwork and audio files will be retained. This cannot be undone from the admin.")) return;
    await deleteDoc(doc(db, "tracks", id));
    row?.remove();
    window.dispatchEvent(new Event("play-admin-track-state-change"));
  } catch (error) {
    alert(`The track could not be updated: ${error.message}`);
  }
}, true);

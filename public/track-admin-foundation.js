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

const adminSearch = document.querySelector("#adminSearch");
const adminNav = document.querySelector(".admin-nav");
if (adminSearch && adminNav && !document.querySelector(".admin-header-search")) {
  const searchWrap = document.createElement("div");
  searchWrap.className = "admin-header-search";
  searchWrap.appendChild(adminSearch);
  const accountActions = document.querySelector(".admin-account-actions");
  adminNav.appendChild(searchWrap);
  if (accountActions) adminNav.appendChild(accountActions);
  document.querySelector(".admin-top")?.classList.add("admin-top-empty");
}

const tracksTitle = document.querySelector('[data-page="tracks"]>.admin-section-title');
if (tracksTitle) {
  const eyebrow = tracksTitle.querySelector(".eyebrow");
  const heading = tracksTitle.querySelector("h1");
  if (eyebrow) eyebrow.remove();
  if (heading) heading.textContent = "Catalogue";
}
document.querySelectorAll(".admin-view").forEach(view => {
  const heading = view.querySelector(":scope>.admin-section-title h1,:scope>.page-title");
  if (heading) view.setAttribute("aria-label", heading.textContent.trim());
});

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
          <label><input id="distributionUploaded" name="distributionUploaded" type="checkbox"> Distribution uploaded</label>
          <label><input id="releaseDateConfirmed" name="releaseDateConfirmed" type="checkbox"> Release date confirmed</label>
          <label><input id="publicWebsiteUpdated" name="publicWebsiteUpdated" type="checkbox"> Public website updated</label>
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

const previewFileField = document.querySelector("#preview")?.closest(".file-field");
if (previewFileField && !document.querySelector("#previewStartSeconds")) {
  previewFileField.insertAdjacentHTML("afterend", `
    <div class="field preview-timing-field">
      <label>Preview Start
        <input id="previewStartSeconds" name="previewStartSeconds" type="number" min="0" step="1" value="0" inputmode="numeric">
      </label>
      <small class="track-field-help">Seconds into the MP3 where public and DJ previews begin.</small>
    </div>
    <div class="field preview-timing-field">
      <label>Preview Duration
        <input id="previewDurationSeconds" name="previewDurationSeconds" type="number" min="1" step="1" value="30" list="previewDurationOptions" inputmode="numeric">
        <datalist id="previewDurationOptions"><option value="30"><option value="45"><option value="60"><option value="90"></datalist>
      </label>
      <small class="track-field-help">Seconds available for preview playback. Suggested: 30, 45, 60 or 90.</small>
    </div>`);
}

const trackForm = document.querySelector("#trackForm");
if (trackForm && !document.querySelector("#trackEditorGroups")) {
  const groupDefinitions = [
    ["basics", "Track Basics", "Identity, musical metadata and public-facing descriptions."],
    ["availability", "Visibility & Availability", "Website, purchase, DJ promo and display-placement controls."],
    ["assets", "Assets", "Shared artwork, preview MP3 and private WAV/master files."],
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
    "moodTags","teaser","description"
  ].forEach(id => moveField(id, "basics"));
  ["price"].forEach(id => moveField(id, "basics"));
  const priceContainer = document.querySelector("#price")?.closest(".field");
  const teaserContainer = document.querySelector("#teaser")?.closest(".field");
  if (priceContainer && teaserContainer) body("basics")?.insertBefore(priceContainer, teaserContainer);
  ["showInStore","showInLatest","featured","purchaseEnabled","allowExclusiveEnquiry","showInDjPool"].forEach(id => moveField(id, "availability"));
  ["cover","preview","master"].forEach(id => moveField(id, "assets"));
  const previewTimingRow = document.createElement("div");
  previewTimingRow.className = "preview-timing-row";
  ["previewStartSeconds","previewDurationSeconds"].forEach(id => {
    const field = document.querySelector(`#${id}`)?.closest(".field");
    if (field) previewTimingRow.appendChild(field);
  });
  body("assets")?.appendChild(previewTimingRow);
  [
    "releaseDate","dateTbc",
    "samplesChecked","tracklibChecked","prsRegistered","pplRegistered","distributionUploaded",
    "tunecoreUploaded","distributedToStores","isrc","upc","distributionReleaseId","tunecoreUrl",
    "spotifyUrl","appleMusicUrl","soundcloudUrl","youtubeMusicUrl","releaseDateConfirmed",
    "publicWebsiteUpdated","releaseChecklistNotes","adminNotes"
  ].forEach(id => moveField(id, "release"));

  const releaseFoundation = document.querySelector(".track-readiness-editor");
  if (releaseFoundation) body("release")?.appendChild(releaseFoundation);
  const promoTracking = document.querySelector(".track-promo-tracking");
  if (promoTracking) body("promo")?.appendChild(promoTracking);
  const previewHelp = document.querySelector("#preview")?.closest(".file-field")?.querySelector("small");
  if (previewHelp?.textContent.toLowerCase().includes("upload handling activates")) previewHelp.remove();

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

  const workflowGuides = {
    availability: {
      title: "Visibility workflow",
      items: [
        "Use these toggles to decide where the track is allowed to appear.",
        "Website and purchase readiness still depend on the required artwork, MP3/WAV, price and status checks.",
        "DJ Promo uses the shared MP3 asset; do not add a separate DJ-only upload unless a later phase explicitly changes this."
      ]
    },
    release: {
      title: "Release workflow",
      items: [
        "Clear rights/admin checks first: samples, Tracklib, PRS/PPL and copyright notes.",
        "Add distribution details next: ISRC, UPC, release ID and store links.",
        "Finish with release date confirmed, public website updated and any internal notes."
      ]
    },
    promo: {
      title: "Promo workflow",
      items: [
        "This section is manual tracking only. It does not send emails or post to social media.",
        "Use Mark notification sent only after you have actually sent or logged the promo notification.",
        "Keep notification and social notes specific enough for future follow-up."
      ]
    },
    advanced: {
      title: "Advanced workflow",
      items: [
        "Treat these fields as compatibility and downstream-platform data.",
        "Prefer the grouped Web, Assets, Availability and Release sections for everyday edits.",
        "Only alter legacy MP3/WAV references when deliberately maintaining older catalogue or fulfilment paths."
      ]
    }
  };
  Object.entries(workflowGuides).forEach(([group, guide]) => {
    const sectionBody = body(group);
    if (!sectionBody || sectionBody.querySelector(".track-workflow-guide")) return;
    sectionBody.insertAdjacentHTML("afterbegin", `
      <aside class="track-workflow-guide">
        <strong>${guide.title}</strong>
        <ul>${guide.items.map(item => `<li>${item}</li>`).join("")}</ul>
      </aside>
    `);
  });
}

const assetDefinitions = [
  {
    input: "cover",
    key: "artwork",
    label: "Artwork",
    values: track => [track?.coverUrl, track?.coverPath, track?.thumbnail],
    placeholderFlag: track => track?.placeholderArtwork === true,
    thumbnail: track => track?.coverUrl || track?.thumbnail || "",
    connectedText: "Artwork assigned",
    missingText: "No artwork assigned",
    uploadText: "Upload Artwork",
    replaceText: "Replace Artwork",
    removeText: "Remove Artwork",
    confirmText: "Remove the artwork assignment from this track?\nThe uploaded file will remain in Storage for now."
  },
  {
    input: "preview",
    key: "mp3",
    label: "MP3",
    values: track => [track?.previewUrl, track?.previewPath, track?.mp3Path, track?.mp3Url, track?.url],
    connectedText: "MP3 assigned",
    missingText: "No MP3 assigned",
    uploadText: "Upload MP3",
    replaceText: "Replace MP3",
    removeText: "Remove MP3",
    confirmText: "Remove the MP3 assignment from this track?\nThe uploaded file will remain in Storage for now."
  },
  {
    input: "master",
    key: "wav",
    label: "WAV",
    values: track => [track?.masterPath, track?.wavPath],
    connectedText: "WAV assigned",
    missingText: "No WAV assigned",
    uploadText: "Upload WAV",
    replaceText: "Replace WAV",
    removeText: "Remove WAV",
    confirmText: "Remove the WAV assignment from this track?\nThe uploaded file will remain in Storage for now."
  }
];

function usableAssetValue(value) {
  if (typeof value !== "string") return false;
  const candidate = value.trim();
  if (!candidate) return false;
  if (/^(pending|null|undefined|none|n\/a)$/i.test(candidate)) return false;
  if (/(^|\/)(icons\/)?fallback(?:[-_.\/]|$)/i.test(candidate)) return false;
  if (/(^|\/)(placeholder|default-cover|default-artwork)(?:[-_.\/]|$)/i.test(candidate)) return false;
  return true;
}

function assetLabel(value) {
  if (typeof value !== "string") return "";
  const candidate = value.trim();
  if (!candidate) return "";
  try {
    const url = new URL(candidate, location.origin);
    const path = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
    if (path) return path;
  } catch {}
  return decodeURIComponent(candidate.split("?")[0].split("/").filter(Boolean).pop() || candidate);
}

let currentAssetTrack = null;

function resetMediaCardState(card, { clearFile = true } = {}) {
  if (!card) return;
  card.dataset.mediaAction = "keep";
  card.classList.remove("pending-replace", "pending-remove");
  const input = card.querySelector(".asset-file-input");
  if (clearFile && input) input.value = "";
  const progress = card.querySelector(".asset-upload-progress");
  if (progress) {
    progress.value = 0;
    progress.hidden = true;
  }
  const progressText = card.querySelector(".asset-progress-text");
  if (progressText) progressText.textContent = "";
}

function resetMediaPendingState({ refresh = true } = {}) {
  document.querySelectorAll("#track-group-assets .file-field").forEach(card => resetMediaCardState(card));
  if (refresh) updateAssetCards(currentAssetTrack);
}

function updateAssetCards(track = null) {
  currentAssetTrack = track;
  assetDefinitions.forEach(definition => {
    const input = document.querySelector(`#${definition.input}`);
    const card = input?.closest(".file-field");
    if (!input || !card) return;
    let status = card.querySelector(".asset-connection-status");
    let action = card.querySelector(".asset-upload-action");
    let controls = card.querySelector(".asset-management-controls");
    let remove = card.querySelector("[data-media-remove]");
    let preview = card.querySelector(".asset-current-preview");
    let progress = card.querySelector(".asset-upload-progress");
    let progressText = card.querySelector(".asset-progress-text");
    if (!status) {
      status = document.createElement("span");
      status.className = "asset-connection-status";
      input.insertAdjacentElement("beforebegin", status);
    }
    if (!action) {
      action = document.createElement("button");
      action.type = "button";
      action.className = "asset-upload-action";
      action.dataset.assetInput = definition.input;
      input.insertAdjacentElement("beforebegin", action);
    }
    if (!preview) {
      preview = document.createElement("span");
      preview.className = "asset-current-preview";
      input.insertAdjacentElement("beforebegin", preview);
    }
    if (!controls) {
      controls = document.createElement("span");
      controls.className = "asset-management-controls";
      remove = document.createElement("button");
      remove.type = "button";
      remove.className = "asset-remove-action";
      remove.dataset.mediaRemove = definition.key;
      controls.appendChild(remove);
      input.insertAdjacentElement("beforebegin", controls);
    }
    if (!progress) {
      progress = document.createElement("progress");
      progress.className = "asset-upload-progress";
      progress.max = 100;
      progress.value = 0;
      progress.hidden = true;
      controls.insertAdjacentElement("afterend", progress);
    }
    if (!progressText) {
      progressText = document.createElement("span");
      progressText.className = "asset-progress-text";
      progressText.setAttribute("aria-live", "polite");
      progress.insertAdjacentElement("afterend", progressText);
    }
    remove = card.querySelector("[data-media-remove]");
    const value = definition.values(track).find(usableAssetValue) || "";
    const connected = !definition.placeholderFlag?.(track) && Boolean(value);
    const actionState = card.dataset.mediaAction || "keep";
    const selectedFile = input.files?.[0];
    status.textContent = selectedFile ? `Selected: ${selectedFile.name}. Save Track to upload.` : actionState === "remove" ? `${definition.label} will be removed on save` : connected ? definition.connectedText : definition.missingText;
    status.classList.toggle("connected", connected || Boolean(selectedFile));
    status.classList.toggle("pending-remove", actionState === "remove");
    status.classList.toggle("pending-replace", actionState === "replace");
    const thumbnail = definition.thumbnail?.(track);
    preview.textContent = "";
    if (definition.key === "artwork" && connected && thumbnail) {
      const image = document.createElement("img");
      image.src = thumbnail;
      image.alt = "";
      preview.appendChild(image);
    }
    preview.append(document.createTextNode(selectedFile ? `Pending upload: ${selectedFile.name}` : connected ? `Current: ${assetLabel(value) || "assigned"}` : `Current: ${definition.missingText}`));
    action.textContent = selectedFile ? "Change selected file" : connected ? definition.replaceText : definition.uploadText;
    action.dataset.assetInput = definition.input;
    action.setAttribute("aria-label", action.textContent);
    if (remove) {
      remove.textContent = definition.removeText;
      remove.disabled = !connected || actionState === "remove";
      remove.title = connected ? "Clears the assignment only. Storage file remains." : "No assigned file to remove.";
    }
    input.classList.add("asset-file-input");
    input.setAttribute("aria-label", action.textContent);
    card.dataset.mediaKind = definition.key;
    card.dataset.mediaAction = actionState;
    if (!action.dataset.assetUploadBound) {
      action.dataset.assetUploadBound = "true";
      action.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (action.getAttribute("aria-disabled") === "true") return;
        input.click();
      });
    }
    if (!remove?.dataset.assetRemoveBound) {
      remove.dataset.assetRemoveBound = "true";
      remove.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (remove.disabled) return;
        if (!confirm(definition.confirmText)) return;
        card.dataset.mediaAction = "remove";
        card.classList.remove("pending-replace");
        card.classList.add("pending-remove");
        input.value = "";
        updateAssetCards(currentAssetTrack);
        document.querySelector("#trackForm")?.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    if (!input.dataset.assetStatusBound) {
      input.dataset.assetStatusBound = "true";
      input.addEventListener("change", () => {
        if (!input.files?.[0]) {
          resetMediaCardState(card, { clearFile: false });
          updateAssetCards(currentAssetTrack);
          return;
        }
        card.dataset.mediaAction = "replace";
        card.classList.add("pending-replace");
        card.classList.remove("pending-remove");
        updateAssetCards(currentAssetTrack);
        if (remove) remove.disabled = false;
        document.querySelector("#trackForm")?.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
  });
}
updateAssetCards();
window.addEventListener("play-track-editor-clear-media", () => resetMediaPendingState({ refresh: true }));
window.addEventListener("play-track-editor-saved", () => resetMediaPendingState({ refresh: false }));
window.addEventListener("play-track-editor-cancel", () => resetMediaPendingState({ refresh: false }));

if (trackForm && !document.querySelector("#trackEditorSaveControls")) {
  const editorHeader = document.querySelector("#trackEditor>.admin-section-title");
  const closeEditor = document.querySelector("#closeEditor");
  const controls = document.createElement("div");
  controls.id = "trackEditorSaveControls";
  controls.className = "track-editor-save-controls";
  controls.innerHTML = `
    <span class="track-visibility-summary" aria-live="polite"></span>
    <button type="button" class="button ghost" data-cancel-track-edit>Cancel</button>
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
  price.insertAdjacentHTML("afterend", '<small id="trackPriceHelp" class="track-field-help">Defaults from Settings when available.</small>');
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
let releaseTitleManuallyEdited = false;
let lastAutoReleaseTitle = "";

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
if (dateTbcField?.closest("label")) {
  const label = dateTbcField.closest("label");
  [...label.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.textContent = " Unreleased / date TBC");
  addHelp(dateTbcField, "Use this when the track is unreleased or the release date is not confirmed.");
}
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
releaseTitleField?.addEventListener("input", event => {
  if (event.isTrusted && releaseTitleField.value !== lastAutoReleaseTitle) releaseTitleManuallyEdited = true;
});
titleField?.addEventListener("input", () => {
  const isNew = !document.querySelector("#editingId")?.value;
  if (!artistField?.value.trim()) artistField.value = "Play Productions";
  if (releaseTitleField && !releaseTitleManuallyEdited) {
    releaseTitleField.value = titleField.value;
    lastAutoReleaseTitle = titleField.value;
  }
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

function businessSettings() {
  try {
    return JSON.parse(localStorage.getItem("playBusinessSettings") || "{}") || {};
  } catch {
    return {};
  }
}

function stringSetting(settings, key, fallback = "") {
  const value = settings[key];
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function numberSetting(settings, key, fallback = 0) {
  const value = Number(settings[key]);
  return Number.isFinite(value) ? value : fallback;
}

function booleanSetting(settings, key, fallback = false) {
  const value = settings[key];
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true" || value === "on" || value === "1";
}

function defaultTrackPrice(settings = businessSettings()) {
  return numberSetting(settings, "defaultTrackPrice", numberSetting(settings, "trackDefaultPrice", 1.29));
}

function applyCatalogueDefaults() {
  const settings = businessSettings();
  const setValue = (id, value) => {
    const field = document.querySelector(`#${id}`);
    if (field) field.value = value;
  };
  const setChecked = (id, value) => {
    const field = document.querySelector(`#${id}`);
    if (field) field.checked = value;
  };
  setValue("artist", stringSetting(settings, "defaultTrackArtist", "Play Productions"));
  setValue("status", stringSetting(settings, "defaultTrackStatus", "draft"));
  setValue("price", defaultTrackPrice(settings).toFixed(2));
  setValue("previewStartSeconds", numberSetting(settings, "defaultPreviewStartSeconds", 0));
  setValue("previewDurationSeconds", numberSetting(settings, "defaultPreviewDurationSeconds", 30));
  setChecked("showInStore", booleanSetting(settings, "defaultShowInStore", false));
  setChecked("showInDjPool", booleanSetting(settings, "defaultShowInDjPool", false));
  setChecked("purchaseEnabled", booleanSetting(settings, "defaultPurchaseEnabled", false));
  setChecked("showInLatest", booleanSetting(settings, "defaultShowInLatest", false));
  setChecked("featured", booleanSetting(settings, "defaultFeatured", false));
  setChecked("dateTbc", booleanSetting(settings, "defaultDateTbc", true));
}

document.querySelector("#newTrack")?.addEventListener("click", () => {
  setTimeout(() => {
    if (!document.querySelector("#editingId")?.value) applyCatalogueDefaults();
    slugManuallyEdited = false;
    seoTitleManuallyEdited = false;
    seoDescriptionManuallyEdited = false;
    releaseTitleManuallyEdited = false;
    lastAutoReleaseTitle = "";
    window.dispatchEvent(new Event("play-track-editor-clear-media"));
    document.querySelectorAll(".track-editor-section").forEach(section => {
      section.open = section.id === "track-group-basics";
      section.classList.remove("is-focused");
    });
    document.querySelectorAll(".field-required").forEach(field => field.classList.remove("field-required"));
    document.querySelector("#track-group-basics")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
});

window.addEventListener("play-track-editor-mode", event => {
  const isNew = event.detail?.mode === "new";
  resetMediaPendingState({ refresh: false });
  updateAssetCards(isNew ? null : event.detail?.track);
  slugManuallyEdited = !isNew;
  seoTitleManuallyEdited = !isNew;
  seoDescriptionManuallyEdited = !isNew;
  releaseTitleManuallyEdited = !isNew;
  lastAutoReleaseTitle = isNew ? "" : releaseTitleField?.value || "";
  if (!isNew) return;
  const previewDuration = document.querySelector("#previewDurationSeconds");
  if (previewDuration) previewDuration.value = "30";
  applyCatalogueDefaults();
  document.querySelectorAll(".track-editor-section").forEach(section => {
    section.open = section.id === "track-group-basics";
    section.classList.remove("is-focused");
  });
  document.querySelectorAll(".field-required").forEach(field => field.classList.remove("field-required"));
});

document.addEventListener("click", event => {
  if (!event.target.closest("[data-edit],[data-library-edit]")) return;
  slugManuallyEdited = true;
  seoTitleManuallyEdited = true;
  seoDescriptionManuallyEdited = true;
});

document.addEventListener("click", async event => {
  const jump = event.target.closest(".jump-missing");
  if (jump) {
    setTimeout(() => {
      const target = document.querySelector("#trackForm .field-required");
      const section = target?.closest(".track-editor-section");
      if (section) section.open = true;
      if (target) {
        target.classList.add("is-jump-highlight");
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.querySelector("input,select,textarea")?.focus();
        setTimeout(() => target.classList.remove("is-jump-highlight"), 1600);
      }
    }, 0);
  }

  const missingEdit = event.target.closest("[data-missing-track]");
  if (missingEdit) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const trackRow = [...document.querySelectorAll("[data-track-row]")].find(row => String(row.dataset.trackRow) === String(missingEdit.dataset.missingTrack));
    trackRow?.querySelector("[data-edit],[data-library-edit]")?.click();
    setTimeout(() => {
      const sectionMap = { web: "basics", sale: "availability", dj: "availability", release: "release" };
      const section = document.querySelector(`#track-group-${sectionMap[missingEdit.dataset.missingArea] || missingEdit.dataset.missingArea}`);
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
      const sectionMap = { web: "basics", sale: "availability", dj: "availability", release: "release" };
      const section = document.querySelector(`#track-group-${sectionMap[readiness.dataset.trackReadiness] || readiness.dataset.trackReadiness}`);
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

import { firebaseReady, db } from "./platform-data.js";
import { deleteDoc, doc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const style = document.createElement("link");
style.rel = "stylesheet";
style.href = "track-admin-foundation.css";
document.head.appendChild(style);

const checklist = document.querySelector("#releaseChecklist");
if (checklist && !document.querySelector("#samplesChecked")) {
  checklist.insertAdjacentHTML("beforebegin", `
    <section class="track-readiness-editor full">
      <div class="track-editor-group">
        <h3>Release administration</h3>
        <p>Manual checks only. Nothing here sends email or publishes the track automatically.</p>
        <div class="track-check-grid">
          <label><input id="samplesChecked" name="samplesChecked" type="checkbox"> Samples checked</label>
          <label><input id="tracklibChecked" name="tracklibChecked" type="checkbox"> Tracklib checked</label>
          <label><input id="distributionUploaded" name="distributionUploaded" type="checkbox"> Distribution uploaded</label>
          <label><input id="releaseDateConfirmed" name="releaseDateConfirmed" type="checkbox"> Release date confirmed</label>
          <label><input id="publicWebsiteUpdated" name="publicWebsiteUpdated" type="checkbox"> Public website updated</label>
          <label><input id="newTrackNotificationSent" name="newTrackNotificationSent" type="checkbox"> New track notification sent</label>
        </div>
      </div>
      <div class="track-editor-group">
        <h3>Notification and social tracking</h3>
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

const price = document.querySelector("#price");
if (price && !document.querySelector("#trackPriceHelp")) {
  price.insertAdjacentHTML("afterend", '<small id="trackPriceHelp">New tracks use the saved default price when available; this field remains the track-level override.</small>');
}

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
  }, 0);
});

if (!globalThis.playAdminPreviewOnly) {
  const saveTrack = document.querySelector("#saveTrack");
  if (saveTrack) saveTrack.textContent = "Save track";
}

document.addEventListener("click", async event => {
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
  const remove = event.target.closest("[data-track-delete-permanent]");
  if (!archive && !remove) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!firebaseReady || globalThis.playAdminPreviewOnly) {
    alert("Archive and permanent delete require live admin mode.");
    return;
  }

  const id = archive?.dataset.trackArchive || remove?.dataset.trackDeletePermanent;
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
      return;
    }

    if (!confirm("Permanently delete this Firestore track document? Uploaded artwork and audio files will be retained. This cannot be undone from the admin.")) return;
    await deleteDoc(doc(db, "tracks", id));
    row?.remove();
  } catch (error) {
    alert(`The track could not be updated: ${error.message}`);
  }
}, true);

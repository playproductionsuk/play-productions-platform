import { loadTracks } from "./platform-data.js";

const exportSelector = "[data-export-rc3-music]";

function ensureMusicLibraryExport() {
  const trackTitle = document.querySelector('[data-page="tracks"] .admin-section-title');
  if (!trackTitle) return;

  const addButton = trackTitle.querySelector("#newTrack");
  let actions = trackTitle.querySelector(".music-library-top-actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "music-library-top-actions";
    trackTitle.appendChild(actions);
  }

  if (addButton) actions.appendChild(addButton);

  let exportButton = trackTitle.querySelector(exportSelector);
  if (!exportButton) {
    exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.dataset.exportRc3Music = "";
  }

  exportButton.className = "button ghost music-library-export-button";
  exportButton.textContent = "Export full music data CSV";
  actions.appendChild(exportButton);
  document.querySelector("#musicLibraryFilters")?.appendChild(actions);

  trackTitle
    .querySelectorAll(".export-actions,#exportTracks,[data-export-tracks],[data-export-music]")
    .forEach(item => {
      if (!item.closest(".music-library-top-actions")) item.remove();
    });
}

async function exportFullMusicData() {
  const tracks = await loadTracks({ includeAdmin: true });
  const preferred = [
    "id", "title", "artist", "releaseTitle", "slug", "status", "style", "subgenre",
    "bpm", "key", "moodTags", "teaser", "description", "price", "releaseDate",
    "dateTbc", "coverUrl", "mp3Path", "previewPath", "previewUrl", "masterPath",
    "wavPath", "showInStore", "showInDjPool", "showInLatest", "featured",
    "purchaseEnabled", "allowExclusiveEnquiry", "isrc", "upc",
    "distributionReleaseId", "prsRegistered", "pplRegistered", "samplesChecked",
    "tracklibChecked", "distributionUploaded", "releaseDateConfirmed",
    "publicWebsiteUpdated", "newTrackNotificationSent", "newTrackNotificationSentAt",
    "notificationNotes", "socialPromoStatus", "socialPromoNotes", "adminNotes"
  ];
  const headers = [...preferred, ...new Set(tracks.flatMap(track => Object.keys(track)))]
    .filter((field, index, list) => list.indexOf(field) === index);
  const quote = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const serialise = value => Array.isArray(value)
    ? value.join("|")
    : value && typeof value === "object"
      ? JSON.stringify(value)
      : value;
  const rows = tracks.map(track => headers.map(field => serialise(track[field])));
  const csv = [headers, ...rows].map(row => row.map(quote).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `play-productions-music-full-data-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

ensureMusicLibraryExport();

document.addEventListener("click", event => {
  if (!event.target.closest(exportSelector)) return;
  exportFullMusicData().catch(error => {
    console.error("Full Music CSV export failed.", error);
  });
});


import { loadTracks, money, escapeHtml, trackHealth } from "./platform-data.js";
import { addToCart } from "./cart.js";
import { createPreviewDock } from "./preview-player.js";

const grid = document.querySelector("#trackGrid");
const style = document.querySelector("#styleFilter");
const bpm = document.querySelector("#bpmFilter");
const mood = document.querySelector("#moodFilter");
const sort = document.querySelector("#sortFilter");
const search = document.querySelector("#searchInput");
const count = document.querySelector("#storeCount");
const dock = document.querySelector("#playerDock");
const player = document.querySelector("#audioPlayer");
let tracks = [];
let playingId = "";

if (dock) dock.hidden = true;

function meta(track) {
  return [track.style, track.bpm && `${track.bpm} BPM`, track.key].filter(Boolean).join(" · ");
}

function availability(track, health) {
  if (track.status === "coming-soon") return "Coming soon";
  if (!track.purchaseEnabled) return track.previewUrl ? "Preview only" : "Download not available yet";
  return health.readyToBuy ? money(track.price) : "Download not available yet";
}

function row(track) {
  const health = trackHealth(track);
  const sellable = health.readyToBuy;
  const unavailableLabel = track.status === "coming-soon" ? "Coming Soon" : "Unavailable";
  const tags = (track.moodTags || []).slice(0, 2).join(" · ");
  return `<article class="store-track" data-id="${escapeHtml(track.id)}">
    <div class="store-art">
      <img src="${escapeHtml(track.coverUrl || "icons/fallback.png")}" alt="Cover art for ${escapeHtml(track.title)}">
      ${track.previewUrl ? `<button class="store-play" aria-label="Preview ${escapeHtml(track.title)}">Preview</button><div class="mini-progress"><span></span></div>` : ""}
    </div>
    <div><h3>${escapeHtml(track.title)}</h3><span class="meta">${escapeHtml(meta(track))}</span></div>
    <span class="tags">${escapeHtml(tags)}</span>
    <span class="price">${availability(track, health)}</span>
    <div class="store-track-actions">
      <a class="button ghost" href="track.html?id=${encodeURIComponent(track.id)}">More Details</a>
      ${sellable
        ? '<button class="button primary" data-add>Add to Cart</button>'
        : `<button class="button ghost store-unavailable-action" type="button" disabled>${unavailableLabel}</button>`}
    </div>
  </article>`;
}

function bpmMatch(track, value) {
  const number = Number(track.bpm);
  if (!value) return true;
  if (!number) return false;
  return value === "slow" ? number <= 110
    : value === "mid" ? number >= 111 && number <= 129
      : value === "club" ? number >= 130 && number <= 139
        : number >= 140;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const shown = tracks.filter(track =>
    track.showInStore &&
    track.status !== "archived" &&
    (!style.value || track.style === style.value) &&
    (!mood.value || (track.moodTags || []).includes(mood.value)) &&
    bpmMatch(track, bpm.value) &&
    (!query || `${track.title} ${track.style} ${(track.moodTags || []).join(" ")}`.toLowerCase().includes(query))
  );
  shown.sort((a, b) => sort.value === "az"
    ? a.title.localeCompare(b.title)
    : sort.value === "bpm"
      ? (Number(a.bpm) || 999) - (Number(b.bpm) || 999)
      : String(b.releaseDate).localeCompare(String(a.releaseDate)));
  count.textContent = `${shown.length} release${shown.length === 1 ? "" : "s"}`;
  grid.innerHTML = shown.length ? shown.map(row).join("") : '<p class="empty">No releases match those filters.</p>';
}

function resetPlaying() {
  playingId = "";
  grid.querySelectorAll(".store-track").forEach(trackRow => {
    trackRow.classList.remove("is-playing");
    const button = trackRow.querySelector(".store-play");
    if (button) button.textContent = "Preview";
    const bar = trackRow.querySelector(".mini-progress span");
    if (bar) bar.style.width = "0";
  });
}

const preview = createPreviewDock({
  audio: player,
  dock,
  closeButton: document.querySelector("#closePlayer"),
  onProgress(ratio) {
    const article = grid.querySelector(`[data-id="${CSS.escape(playingId)}"]`);
    const bar = article?.querySelector(".mini-progress span");
    if (bar) bar.style.width = `${ratio * 100}%`;
  },
  onStop: resetPlaying,
  onClose: resetPlaying
});

function toggle(track, article) {
  if (playingId === String(track.id) && preview.isPlaying()) {
    preview.pause();
    resetPlaying();
    return;
  }
  resetPlaying();
  playingId = String(track.id);
  article.classList.add("is-playing");
  article.querySelector(".store-play").textContent = "Pause";
  document.querySelector("#playerTitle").textContent = track.title;
  document.querySelector("#playerCover").src = track.coverUrl || "icons/fallback.png";
  preview.start(track, track.previewUrl).catch(resetPlaying);
}

grid.addEventListener("click", event => {
  const article = event.target.closest(".store-track");
  const track = tracks.find(item => String(item.id) === article?.dataset.id);
  if (!track) return;
  if (event.target.closest(".store-play")) toggle(track, article);
  if (event.target.closest("[data-add]")) {
    addToCart({
      id: track.id,
      title: track.title,
      price: track.price,
      type: "Digital music",
      artwork: track.coverUrl || "icons/fallback.png"
    });
    event.target.textContent = "Added ✓";
  }
});

[style, bpm, mood, sort].forEach(control => control.addEventListener("change", render));
search.addEventListener("input", render);
document.querySelector("#year") && (document.querySelector("#year").textContent = new Date().getFullYear());

try {
  tracks = await loadTracks();
  [...new Set(tracks.map(track => track.style).filter(Boolean))].sort().forEach(value => style.add(new Option(value, value)));
  [...new Set(tracks.flatMap(track => track.moodTags || []).filter(Boolean))].sort().forEach(value => mood.add(new Option(value, value)));
  render();
} catch (error) {
  grid.innerHTML = '<p class="empty">Music could not be loaded.</p>';
  console.error(error);
}

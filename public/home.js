import { loadTracks, money, escapeHtml, trackHealth } from "./platform-data.js";
import { addToCart } from "./cart.js";
import { createPreviewDock } from "./preview-player.js";

const grid = document.querySelector("#latestGrid");
const dock = document.querySelector("#playerDock");
const player = document.querySelector("#audioPlayer");
let tracks = [];
let playingId = "";

function availability(track, health) {
  if (track.status === "coming-soon") return "Coming soon";
  return health.readyToBuy ? money(track.price) : "Preview only";
}

function card(track) {
  const health = trackHealth(track);
  const sellable = health.readyToBuy;
  const unavailable = track.status === "coming-soon" ? "Coming Soon" : "Unavailable";
  return `<article class="home-track-card" data-id="${escapeHtml(track.id)}">
    <div class="home-track-art">
      <img src="${escapeHtml(track.coverUrl || "icons/fallback.png")}" alt="Cover art for ${escapeHtml(track.title)}">
      ${track.previewUrl ? `<button class="home-track-preview" type="button" aria-label="Preview ${escapeHtml(track.title)}">Preview</button>` : ""}
    </div>
    <div class="home-track-copy">
      ${track.style ? `<p class="eyebrow">${escapeHtml(track.style)}</p>` : ""}
      <h3>${escapeHtml(track.title)}</h3>
      <span>${availability(track, health)}</span>
    </div>
    <div class="home-track-actions">
      <a class="button ghost" href="track.html?id=${encodeURIComponent(track.id)}">More Details</a>
      ${sellable
        ? '<button class="button primary" type="button" data-add>Add to Cart</button>'
        : `<button class="button ghost" type="button" disabled>${unavailable}</button>`}
    </div>
  </article>`;
}

function resetPlaying() {
  playingId = "";
  grid?.querySelectorAll(".home-track-card").forEach(item => {
    item.classList.remove("is-playing");
    const button = item.querySelector(".home-track-preview");
    if (button) button.textContent = "Preview";
  });
}

const preview = player && dock ? createPreviewDock({
  audio: player,
  dock,
  closeButton: document.querySelector("#closePlayer"),
  onStop: resetPlaying,
  onClose: resetPlaying
}) : null;

function toggle(track, item) {
  if (!preview) return;
  if (playingId === String(track.id) && preview.isPlaying()) {
    preview.pause();
    resetPlaying();
    return;
  }
  resetPlaying();
  playingId = String(track.id);
  item.classList.add("is-playing");
  item.querySelector(".home-track-preview").textContent = "Pause";
  document.querySelector("#playerTitle").textContent = track.title;
  document.querySelector("#playerCover").src = track.coverUrl || "icons/fallback.png";
  preview.start(track, track.previewUrl).catch(resetPlaying);
}

grid?.addEventListener("click", event => {
  const item = event.target.closest(".home-track-card");
  const track = tracks.find(candidate => String(candidate.id) === item?.dataset.id);
  if (!track) return;
  if (event.target.closest(".home-track-preview")) toggle(track, item);
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

if (grid) {
  try {
    const catalogue = (await loadTracks()).filter(track =>
      track.showInStore && track.status !== "archived"
    );
    catalogue.sort((a, b) =>
      Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      || Number(Boolean(b.showInLatest)) - Number(Boolean(a.showInLatest))
      || String(b.releaseDate || "").localeCompare(String(a.releaseDate || ""))
    );
    tracks = catalogue.slice(0, 4);
    grid.innerHTML = tracks.length
      ? tracks.map(card).join("")
      : '<p class="empty">New music is on the way.</p>';
  } catch (error) {
    grid.innerHTML = '<p class="empty">Latest tracks could not be loaded.</p>';
    console.error(error);
  }
}

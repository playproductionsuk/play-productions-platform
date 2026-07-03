import { createInlinePreview } from "./preview-player.js";

function enhancePlayer(track) {
  const audio = document.querySelector(".track-product-player");
  if (audio && !audio.dataset.previewEnhanced) {
    audio.dataset.previewEnhanced = "true";
    createInlinePreview(audio, track || {});
  }
}
window.addEventListener("play-track-rendered", event => enhancePlayer(event.detail?.track), { once: true });
enhancePlayer(globalThis.playRenderedTrack);

const commercial = document.querySelector(".commercial-panel");
const related = document.querySelector(".related-section");
if (commercial && related) related.insertAdjacentElement("beforebegin", commercial);
if (commercial) {
  commercial.querySelector(".eyebrow")?.replaceChildren("Artists / Commercial Use");
  const paragraph = commercial.querySelector("p:not(.eyebrow)");
  if (paragraph) {
    paragraph.textContent = "Standard purchases are personal digital downloads for private listening. Artists wanting to record vocals, arrange placements or discuss commercial licensing should enquire separately.";
  }
}

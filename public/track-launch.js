import { createInlinePreview } from "./preview-player.js";

function enhancePlayer(track) {
  const audio = document.querySelector(".track-product-player");
  if (audio && !audio.dataset.previewEnhanced) {
    audio.dataset.previewEnhanced = "true";
    createInlinePreview(audio, track || {});
  }
}

function standardiseCommercialPanel() {
  const commercial = document.querySelector(".commercial-panel");
  const related = document.querySelector(".related-section");
  if (commercial && related) related.insertAdjacentElement("beforebegin", commercial);
  if (commercial) {
    commercial.classList.add("commercial-store-panel", "track-commercial-panel");
    commercial.querySelector(".eyebrow")?.remove();
    commercial.querySelector("h2")?.replaceChildren("Commercial Enquiry");
    const paragraph = commercial.querySelector("p:not(.eyebrow)");
    if (paragraph) {
      paragraph.textContent = "Standard purchases are personal digital downloads for private listening. Artists wanting to record vocals, arrange placements or discuss commercial licensing should enquire separately.";
    }
    const button = commercial.querySelector("button");
    if (button) button.textContent = "Commercial Enquiry";
  }
}

window.addEventListener("play-track-rendered", event => {
  enhancePlayer(event.detail?.track);
  standardiseCommercialPanel();
}, { once: true });
enhancePlayer(globalThis.playRenderedTrack);
standardiseCommercialPanel();

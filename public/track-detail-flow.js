import { firebaseApp, firebaseReady, db, escapeHtml } from "./platform-data.js";
import { loadTrack } from "./shop-data.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const params = new URLSearchParams(location.search);
const trackId = params.get("id") || params.get("track");
const promo = params.get("promo") === "1";
const demo = params.get("demo") === "1";

function usableDate(value) {
  if (!value) return null;
  const candidate = value?.toDate ? value.toDate() : new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? `${value}T12:00:00` : value
  );
  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

function displayReleaseDate(track) {
  const date = track.dateTbc === true ? null : usableDate(track.releaseDate);
  return date
    ? date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "Release date TBC";
}

function updateReleaseDate(track) {
  const metadata = [...document.querySelectorAll(".track-meta-grid span")];
  const released = metadata.find(item => item.querySelector("strong")?.textContent.trim() === "Released:");
  if (released) {
    released.innerHTML = `<strong>Released:</strong> ${escapeHtml(displayReleaseDate(track))}`;
    return;
  }
  document.querySelector(".track-meta-grid")?.insertAdjacentHTML(
    "beforeend",
    `<span><strong>Released:</strong> ${escapeHtml(displayReleaseDate(track))}</span>`
  );
}

function renderPromoAction(track) {
  document.querySelector(".track-product-info .download-box")?.remove();
  document.querySelector(".commercial-panel")?.remove();
  const panel = document.createElement("div");
  panel.className = "download-box promo-detail-actions";
  panel.innerHTML = `
    <p class="eyebrow">DJ promo download</p>
    <div class="download-box-head">
      <div>
        <strong>Approved DJs</strong>
        <p>Protected MP3 promo for DJ, radio and promotional play.</p>
      </div>
      <button id="djDetailDownload" class="button primary" type="button" disabled>Download MP3</button>
    </div>
    <p id="djDetailStatus" class="status-message" aria-live="polite"></p>`;
  document.querySelector(".track-product-info")?.appendChild(panel);

  const related = document.querySelector(".related-section");
  const commercial = document.createElement("aside");
  commercial.className = "commercial-store-panel track-commercial-panel dj-detail-commercial";
  commercial.innerHTML = `
    <h2>Commercial Enquiry</h2>
    <p>DJ promo access covers DJ, radio and promotional play. Recording, release, sync or other commercial use needs a separate agreement.</p>
    <a class="button ghost" href="contact.html?subject=commercial">Commercial Enquiry</a>`;
  if (related) related.insertAdjacentElement("beforebegin", commercial);
  else document.querySelector("#beatContent")?.appendChild(commercial);

  const button = panel.querySelector("#djDetailDownload");
  const status = panel.querySelector("#djDetailStatus");
  const mp3Available = Boolean(track.mp3Path || track.previewPath);
  if (!mp3Available) {
    status.textContent = "MP3 promo download is not available yet.";
    return;
  }
  if (demo) {
    status.textContent = "Downloads are disabled in demo mode.";
    return;
  }
  if (!firebaseReady || !firebaseApp) {
    status.textContent = "DJ sign-in is unavailable.";
    return;
  }

  const auth = getAuth(firebaseApp);
  onAuthStateChanged(auth, async user => {
    if (!user) {
      status.innerHTML = 'Please <a href="dj-login.html">sign in as an approved DJ</a> to download this promo.';
      return;
    }
    try {
      const profile = await getDoc(doc(db, "users", user.uid));
      if (!profile.exists() || profile.data().djAccess !== true) {
        status.textContent = "This account is not approved for DJ promo access.";
        return;
      }
      button.disabled = false;
      status.textContent = "";
      button.onclick = async () => {
        button.disabled = true;
        status.textContent = "Preparing protected MP3…";
        try {
          const token = await user.getIdToken();
          const downloadId = track.slug || track.id;
          const response = await fetch(`/api/dj-download?track=${encodeURIComponent(downloadId)}&format=mp3`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "MP3 promo download failed.");
          location.href = data.url;
        } catch (error) {
          status.textContent = error.message;
          button.disabled = false;
        }
      };
    } catch (error) {
      status.textContent = `DJ access could not be verified: ${error.message}`;
    }
  });
}

if (trackId) {
  const track = await loadTrack(trackId);
  if (track) {
    updateReleaseDate(track);
    if (promo) renderPromoAction(track);
  }
}

import {
  firebaseApp,
  firebaseReady,
  db,
  escapeHtml,
  normaliseTrack,
  loadTracks
} from "./platform-data.js";
import { createPreviewDock } from "./preview-player.js";
import { hasProtectedDjMp3, requestProtectedDjMp3 } from "./dj-download.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const list = document.querySelector("#djTrackList");
const tools = document.querySelector(".store-tools");
const dock = document.querySelector("#playerDock");
const player = document.querySelector("#audioPlayer");
let signOutButton = document.querySelector("#djSignOut");
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const demo = false;

const promoHeading = document.querySelector(".dj-pool .section-heading");
promoHeading?.querySelector(".eyebrow")?.remove();
if (promoHeading?.querySelector("h2")) promoHeading.querySelector("h2").textContent = "Promo Crate";
if (signOutButton) signOutButton.style.display = "none";
let tracks = [];
let user;
let playingId = "";

async function handleSignOut() {
  const button = document.querySelector("#djSignOut");
  if (!button || demo) return;

  button.disabled = true;
  button.textContent = "Signing out…";
  try {
    await signOut(auth);
    location.replace("index.html");
  } catch (error) {
    document.querySelector("#djDownloadStatus").textContent =
      error.message || "We could not sign you out. Please try again.";
    button.disabled = false;
    button.textContent = "Sign out";
  }
}

function ensureSignOutButton() {
  if (demo || !user) {
    document.querySelectorAll("#djSignOut").forEach(button => button.remove());
    signOutButton = null;
    return null;
  }

  const actions = document.querySelector(".premium-nav .portal-actions");
  let button = document.querySelector("#djSignOut");

  if (actions && (!button || !actions.contains(button))) {
    button?.remove();
    button = document.createElement("button");
    button.id = "djSignOut";
    button.className = "button ghost";
    button.type = "button";
    button.textContent = "Sign out";
    const djLogin = [...actions.querySelectorAll("a")].find(link =>
      link.getAttribute("href")?.includes("dj-login.html")
    );
    if (djLogin) djLogin.replaceWith(button);
    else actions.appendChild(button);
  }

  if (!button) {
    const header = document.querySelector(".premium-nav,.public-header");
    if (!header) return null;
    button = document.createElement("button");
    button.id = "djSignOut";
    button.className = "button ghost";
    button.type = "button";
    button.textContent = "Sign out";
    header.appendChild(button);
  }

  button.hidden = false;
  button.style.removeProperty("display");
  button.onclick = handleSignOut;
  signOutButton = button;
  return button;
}

function mountSignOutAfterNavigation() {
  [0, 50, 150, 300, 600, 1200, 2000, 3000].forEach(delay => {
    setTimeout(() => {
      if (user && !demo) ensureSignOutButton();
    }, delay);
  });
  window.addEventListener("load", ensureSignOutButton, { once: true });
}

tools.insertAdjacentHTML("beforeend", `
  <label><span class="sr-only">Genre</span><select id="djGenre"><option value="">All genres</option></select></label>
  <label><span class="sr-only">BPM</span><select id="djBpm"><option value="">Any BPM</option><option value="slow">Up to 110 BPM</option><option value="mid">111–129 BPM</option><option value="club">130–139 BPM</option><option value="fast">140+ BPM</option></select></label>
  <label><span class="sr-only">Mood</span><select id="djMood"><option value="">All moods</option></select></label>
  <label><span class="sr-only">Sort</span><select id="djSort"><option value="newest">Newest first</option><option value="az">A–Z</option><option value="bpm">BPM low–high</option></select></label>
`);
document.querySelector(".dj-pool").insertAdjacentHTML("beforeend", '<p id="djDownloadStatus" class="status-message"></p>');

if (demo) {
  document.querySelector("main").insertAdjacentHTML(
    "afterbegin",
    '<div class="dj-preview-banner"><strong>Approved DJ portal preview</strong><br>Sample catalogue only. Protected MP3 downloads are disabled in demo mode.</div>'
  );
}

async function allowed(account) {
  const profile = await getDoc(doc(db, "users", account.uid));
  return profile.exists() && profile.data().djAccess === true;
}

async function loadPromos() {
  if (demo || !firebaseReady) {
    tracks = (await loadTracks()).filter(track => track.showInDjPool);
  } else {
    const snapshot = await getDocs(query(collection(db, "tracks"), where("showInDjPool", "==", true)));
    tracks = snapshot.docs.map(item => normaliseTrack({ ...item.data(), firestoreId: item.id }));
  }
  [...new Set(tracks.map(track => track.style).filter(Boolean))]
    .forEach(value => document.querySelector("#djGenre").add(new Option(value, value)));
  [...new Set(tracks.flatMap(track => track.moodTags || []).filter(Boolean))]
    .forEach(value => document.querySelector("#djMood").add(new Option(value, value)));
  render();
}

function bpmMatch(track, value) {
  const bpm = Number(track.bpm);
  if (!value) return true;
  if (!bpm) return false;
  if (value === "slow") return bpm <= 110;
  if (value === "mid") return bpm >= 111 && bpm <= 129;
  if (value === "club") return bpm >= 130 && bpm <= 139;
  return bpm >= 140;
}

function render() {
  const search = document.querySelector("#djSearch").value.toLowerCase();
  const genre = document.querySelector("#djGenre").value;
  const mood = document.querySelector("#djMood").value;
  const bpm = document.querySelector("#djBpm").value;
  const sort = document.querySelector("#djSort").value;
  const shown = tracks.filter(track =>
    (!genre || track.style === genre) &&
    (!mood || (track.moodTags || []).includes(mood)) &&
    bpmMatch(track, bpm) &&
    (!search || `${track.title} ${track.style} ${(track.moodTags || []).join(" ")}`.toLowerCase().includes(search))
  );

  shown.sort((a, b) =>
    sort === "az"
      ? a.title.localeCompare(b.title)
      : sort === "bpm"
        ? (Number(a.bpm) || 999) - (Number(b.bpm) || 999)
        : String(b.releaseDate).localeCompare(String(a.releaseDate))
  );

  list.innerHTML = shown.length
    ? shown.map(track => {
        const mp3Available = hasProtectedDjMp3(track);
        const unavailable = !mp3Available
          ? '<small class="availability-note">MP3 promo download is not available yet.</small>'
          : demo
            ? '<small class="availability-note">Downloads are disabled in demo mode.</small>'
            : "";
        const detailId = track.slug || track.id;
        return `<article class="dj-track store-track" data-id="${escapeHtml(track.id)}">
          <div class="store-art">
            <img src="${escapeHtml(track.coverUrl || "icons/fallback.png")}" alt="Cover art for ${escapeHtml(track.title)}">
            ${track.previewUrl ? `<button class="store-play" aria-label="Preview ${escapeHtml(track.title)}">Preview</button><div class="mini-progress"><span></span></div>` : ""}
          </div>
          <div class="dj-track-info">
            <h3>${escapeHtml(track.title)}</h3>
            <small>${escapeHtml(track.teaser || "Promo release")}</small>
            <span class="meta">${escapeHtml([track.bpm && `${track.bpm} BPM`, track.key].filter(Boolean).join(" · "))}</span>
          </div>
          <span class="genre-cell">${escapeHtml(track.style || "—")}</span>
          <span class="tags">${escapeHtml((track.moodTags || []).join(" · ") || "—")}</span>
          <div class="format-actions">
            <button class="button ghost preview-action" data-preview>Preview</button>
            <a class="button ghost dj-more-details" href="track.html?id=${encodeURIComponent(detailId)}&promo=1${demo ? "&demo=1" : ""}">More Details</a>
            <button class="button primary dj-download" data-format="mp3" ${demo || !mp3Available ? "disabled" : ""}>Download MP3</button>
            ${unavailable}
          </div>
        </article>`;
      }).join("")
    : '<p class="empty">No promo tracks match those filters.</p>';
}

function reset() {
  playingId = "";
  list.querySelectorAll(".store-track").forEach(row => row.classList.remove("is-playing"));
  list.querySelectorAll(".mini-progress span").forEach(bar => {
    bar.style.width = "0";
  });
}

const preview = createPreviewDock({
  audio: player,
  dock,
  closeButton: document.querySelector("#closePlayer"),
  onProgress(ratio) {
    const row = list.querySelector(`[data-id="${CSS.escape(playingId)}"]`);
    const bar = row?.querySelector(".mini-progress span");
    if (bar) bar.style.width = `${ratio * 100}%`;
  },
  onStop: reset,
  onClose: reset
});

function play(track, row) {
  if (playingId === String(track.id) && preview.isPlaying()) {
    preview.pause();
    reset();
    return;
  }
  reset();
  playingId = String(track.id);
  row.classList.add("is-playing");
  dock.hidden = false;
  document.querySelector("#playerTitle").textContent = track.title;
  document.querySelector("#playerCover").src = track.coverUrl || "icons/fallback.png";
  preview.start(track, track.previewUrl).catch(reset);
}

list.addEventListener("click", async event => {
  const row = event.target.closest(".dj-track");
  const track = tracks.find(item => String(item.id) === row?.dataset.id);
  if (!track) return;

  if (event.target.closest(".store-play,[data-preview]") || (!event.target.closest("button,a") && row)) {
    play(track, row);
  }

  const download = event.target.closest(".dj-download");
  if (!download) return;
  if (download.disabled || demo || !firebaseReady) {
    document.querySelector("#djDownloadStatus").textContent =
      track.mp3Path || track.previewPath
        ? "Protected MP3 downloads are disabled in demo mode."
        : "MP3 promo download is not available yet.";
    return;
  }

  download.disabled = true;
  try {
    await requestProtectedDjMp3(user, track);
  } catch (error) {
    document.querySelector("#djDownloadStatus").textContent = error.message;
    download.disabled = false;
  }
});

["djSearch", "djGenre", "djBpm", "djMood", "djSort"].forEach(id => {
  const element = document.querySelector(`#${id}`);
  element.addEventListener(element.tagName === "INPUT" ? "input" : "change", render);
});

if (signOutButton) signOutButton.onclick = async () => {
  if (demo) {
    location.href = "index.html";
    return;
  }

  signOutButton.disabled = true;
  signOutButton.textContent = "Signing out…";
  try {
    await signOut(auth);
    location.replace("index.html");
  } catch (error) {
    document.querySelector("#djDownloadStatus").textContent =
      error.message || "We could not sign you out. Please try again.";
    signOutButton.disabled = false;
    signOutButton.textContent = "Sign out";
  }
};

if (demo || !firebaseReady) {
  document.querySelectorAll("#djSignOut").forEach(button => button.remove());
  loadPromos();
} else {
  onAuthStateChanged(auth, async account => {
    if (!account || !await allowed(account)) {
      if (account) await signOut(auth);
      location.replace(`dj-login.html?reason=${account ? "not-approved" : "signin"}`);
      return;
    }
    user = account;
    mountSignOutAfterNavigation();
    await loadPromos();
  });
}

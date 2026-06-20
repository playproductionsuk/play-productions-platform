import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";
import { app, db, firebaseReady } from "./shop-data.js";

const loginPanel = document.querySelector("#loginPanel");
const dashboard = document.querySelector("#dashboard");
const loginStatus = document.querySelector("#loginStatus");
const progress = document.querySelector("#uploadProgress");
const form = document.querySelector("#trackForm");
const auth = app ? getAuth(app) : null;
const storage = app ? getStorage(app) : null;

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
}

function safeExt(file, fallback) {
  const ext = file.name.split(".").pop().toLowerCase();
  return /^[a-z0-9]{2,5}$/.test(ext) ? ext : fallback;
}

async function isAdmin(user) {
  return (await getDoc(doc(db, "admins", user.uid))).exists();
}

async function upload(path, file, label) {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
    task.on("state_changed", snapshot => {
      const percent = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
      progress.textContent = `${label}: ${percent}%`;
    }, reject, async () => resolve(await getDownloadURL(task.snapshot.ref)));
  });
}

function pcm16(samples, start, length, totalLength, sampleRate) {
  const output = new Int16Array(length);
  const fadeStart = Math.max(0, totalLength - 3 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const position = start + i;
    let gain = position > fadeStart ? Math.max(0, (totalLength - position) / Math.max(1, totalLength - fadeStart)) : 1;
    const value = Math.max(-1, Math.min(1, samples[position] || 0)) * gain;
    output[i] = value < 0 ? value * 32768 : value * 32767;
  }
  return output;
}

async function makePreview(wav) {
  progress.textContent = "Making a 75-second MP3 preview…";
  const context = new AudioContext();
  const decoded = await context.decodeAudioData(await wav.arrayBuffer());
  const channels = Math.min(2, decoded.numberOfChannels);
  const total = Math.min(decoded.length, Math.floor(decoded.sampleRate * 75));
  const encoder = new lamejs.Mp3Encoder(channels, decoded.sampleRate, 128);
  const left = decoded.getChannelData(0);
  const right = channels > 1 ? decoded.getChannelData(1) : left;
  const chunks = [];
  for (let start = 0; start < total; start += 1152) {
    const length = Math.min(1152, total - start);
    const encoded = channels > 1
      ? encoder.encodeBuffer(pcm16(left, start, length, total, decoded.sampleRate), pcm16(right, start, length, total, decoded.sampleRate))
      : encoder.encodeBuffer(pcm16(left, start, length, total, decoded.sampleRate));
    if (encoded.length) chunks.push(new Int8Array(encoded));
    if (start % (1152 * 80) === 0) await new Promise(resolve => setTimeout(resolve, 0));
  }
  const end = encoder.flush(); if (end.length) chunks.push(new Int8Array(end));
  await context.close();
  return new File(chunks, `${slugify(wav.name.replace(/\.wav$/i, ""))}-preview.mp3`, { type: "audio/mpeg" });
}

function licence(key, fallbackSummary) {
  return {
    name: document.querySelector(`#${key}Name`).value.trim(),
    price: Number(document.querySelector(`#${key}Price`).value),
    enabled: document.querySelector(`#${key}Enabled`).checked,
    summary: fallbackSummary
  };
}

async function listTracks() {
  const target = document.querySelector("#adminTracks");
  const snapshot = await getDocs(query(collection(db, "tracks"), orderBy("createdAt", "desc")));
  if (snapshot.empty) { target.innerHTML = `<p class="empty">No uploaded beats yet.</p>`; return; }
  target.innerHTML = snapshot.docs.map(item => { const track = item.data(); return `<article class="admin-track" data-id="${item.id}" data-cover="${track.coverPath || ""}" data-preview="${track.previewPath || ""}" data-master="${track.masterPath || ""}"><img src="${track.coverUrl || "icons/fallback.png"}" alt=""><div><strong>${track.title}</strong><p>${track.style}${track.bpm ? ` · ${track.bpm} BPM` : ""}</p></div><button class="danger" type="button">Delete</button></article>`; }).join("");
}

document.querySelector("#loginForm").addEventListener("submit", async event => {
  event.preventDefault(); loginStatus.textContent = "Signing in…";
  try { await signInWithEmailAndPassword(auth, document.querySelector("#email").value, document.querySelector("#password").value); }
  catch (error) { loginStatus.textContent = "Sign-in failed. Check your email and password."; console.error(error); }
});
document.querySelector("#signOutButton").addEventListener("click", () => signOut(auth));

form.addEventListener("submit", async event => {
  event.preventDefault();
  const button = document.querySelector("#publishButton"); button.disabled = true;
  try {
    const title = document.querySelector("#title").value.trim();
    const slug = slugify(title); if (!slug) throw new Error("Please enter a valid title.");
    const existing = await getDoc(doc(db, "tracks", slug)); if (existing.exists()) throw new Error("A beat with this title already exists.");
    const cover = document.querySelector("#cover").files[0];
    const master = document.querySelector("#master").files[0];
    let preview = document.querySelector("#preview").files[0];
    if (!cover || !master) throw new Error("Cover artwork and a WAV master are required.");
    if (!preview) preview = await makePreview(master);
    const stamp = Date.now();
    const coverPath = `covers/${slug}-${stamp}.${safeExt(cover, "jpg")}`;
    const previewPath = `previews/${slug}-${stamp}.mp3`;
    const masterPath = `masters/${slug}-${stamp}.wav`;
    const coverUrl = await upload(coverPath, cover, "Uploading artwork");
    const previewUrl = await upload(previewPath, preview, "Uploading preview");
    await upload(masterPath, master, "Uploading WAV master");
    progress.textContent = "Publishing beat…";
    await setDoc(doc(db, "tracks", slug), {
      slug, title, style: document.querySelector("#style").value.trim(), bpm: Number(document.querySelector("#bpm").value) || null,
      key: document.querySelector("#key").value.trim(), description: document.querySelector("#description").value.trim(),
      coverUrl, previewUrl, coverPath, previewPath, masterPath, published: true,
      djPromoEnabled: document.querySelector("#djPromoEnabled").checked,
      licences: {
        standard: licence("standard", "WAV master for one commercial release."),
        premium: licence("premium", "Expanded commercial, streaming and video usage."),
        exclusive: licence("exclusive", "Exclusive usage rights; full terms supplied with purchase.")
      },
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    form.reset();
    document.querySelector("#djPromoEnabled").checked = true;
    ["standard", "premium", "exclusive"].forEach(key => document.querySelector(`#${key}Enabled`).checked = true);
    progress.textContent = "Published — it is now live in the shop.";
    await listTracks();
  } catch (error) { progress.textContent = error.message || "Upload failed."; console.error(error); }
  finally { button.disabled = false; }
});

document.querySelector("#adminTracks").addEventListener("click", async event => {
  const button = event.target.closest(".danger"); if (!button) return;
  const item = button.closest(".admin-track");
  if (!confirm(`Delete this beat and its uploaded files? This cannot be undone.`)) return;
  button.disabled = true;
  try {
    await deleteDoc(doc(db, "tracks", item.dataset.id));
    for (const path of [item.dataset.cover, item.dataset.preview, item.dataset.master].filter(Boolean)) await deleteObject(ref(storage, path)).catch(() => {});
    item.remove();
  } catch (error) { alert("The beat could not be deleted."); console.error(error); button.disabled = false; }
});

if (!firebaseReady) {
  loginStatus.textContent = "Setup is not finished yet. Add the Firebase app details to firebase-config.js first.";
  document.querySelector("#loginForm button").disabled = true;
} else {
  onAuthStateChanged(auth, async user => {
    if (user && await isAdmin(user)) { loginPanel.hidden = true; dashboard.hidden = false; await listTracks(); }
    else { if (user) { loginStatus.textContent = "This account has not been made an administrator."; await signOut(auth); } loginPanel.hidden = false; dashboard.hidden = true; }
  });
}

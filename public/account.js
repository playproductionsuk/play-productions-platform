import "./portal-preview.js";
import "./portal-controls.js";
import { firebaseApp, firebaseReady, db, escapeHtml, money, loadTracks } from "./platform-data.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const auth = firebaseApp ? getAuth(firebaseApp) : null;
const authPanel = document.querySelector("#authPanel");
const portal = document.querySelector("#portal");
const form = document.querySelector("#authForm");
const status = document.querySelector("#authStatus");
const forgotPassword = document.querySelector("#forgotCustomerPassword");
let mode = "login";

function setStatus(message) {
  if (status) status.textContent = message;
}

document.querySelectorAll("[data-auth]").forEach(button => button.addEventListener("click", () => {
  mode = button.dataset.auth;
  document.querySelectorAll("[data-auth]").forEach(item => item.classList.toggle("active", item === button));
  document.querySelector("#nameField").hidden = mode !== "register";
  forgotPassword.hidden = mode !== "login";
  form.querySelector('button[type="submit"]').textContent = mode === "register" ? "Create account" : "Sign in";
}));

forgotPassword?.addEventListener("click", async () => {
  const email = form.email.value.trim();
  if (!email) {
    setStatus("Enter your customer account email address first.");
    return;
  }
  if (!firebaseReady || !auth) {
    setStatus("Password reset is unavailable until Firebase Auth is configured.");
    return;
  }
  setStatus("Sending password reset email…");
  try {
    await sendPasswordResetEmail(auth, email, { url: `${location.origin}/portal.html` });
    setStatus("Password reset email sent. Check your inbox.");
  } catch (error) {
    console.error(error);
    setStatus(error.code === "auth/invalid-email"
      ? "Enter a valid email address."
      : "Password reset email could not be sent. Please try again.");
  }
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!firebaseReady) {
    setStatus("Use Preview customer portal below, or connect Firebase for real accounts.");
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  setStatus("Please wait…");
  try {
    if (mode === "register") {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(result.user, { displayName: data.name });
      await setDoc(doc(db, "users", result.user.uid), {
        name: data.name,
        email: data.email,
        authUid: result.user.uid,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      });
    } else {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    }
  } catch (error) {
    console.error(error);
    setStatus("Sign-in failed. Check your details or create an account.");
  }
});

const date = value => {
  const parsed = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  return parsed && !isNaN(parsed) ? parsed.toLocaleDateString("en-GB") : "—";
};

const musicTable = (orders, tracks) => `<table class="portal-table"><thead><tr><th>Artwork</th><th>Track</th><th>Genre</th><th>BPM</th><th>Key</th><th>Mood</th><th>Purchased</th><th>Downloads</th></tr></thead><tbody>${orders.map(order => {
  const track = tracks.find(item => String(item.id) === String(order.trackId)) || {};
  return `<tr><td><img src="${escapeHtml(order.artwork || track.coverUrl || "icons/fallback.png")}" alt=""></td><td><strong>${escapeHtml(order.productTitle || order.trackTitle || track.title || "Digital track")}</strong></td><td>${escapeHtml(track.style || order.genre || "—")}</td><td>${escapeHtml(String(track.bpm || order.bpm || "—"))}</td><td>${escapeHtml(track.key || order.key || "—")}</td><td>${escapeHtml((track.moodTags || order.moodTags || []).join?.(", ") || "—")}</td><td>${date(order.createdAt || order.purchasedAt)}</td><td><div class="format-actions">${order.mp3Url || order.downloadUrl ? `<a class="button ghost" href="${escapeHtml(order.mp3Url || order.downloadUrl)}">MP3</a>` : ""}${order.wavUrl ? `<a class="button primary" href="${escapeHtml(order.wavUrl)}">WAV</a>` : ""}${!order.mp3Url && !order.downloadUrl && !order.wavUrl ? "Preparing" : ""}</div></td></tr>`;
}).join("")}</tbody></table>`;

const orderTable = orders => `<table class="portal-table"><thead><tr><th>Date</th><th>Order</th><th>Item</th><th>Type</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead><tbody>${orders.map(order => `<tr><td>${date(order.createdAt)}</td><td>${escapeHtml(order.providerRef || order.id)}</td><td>${escapeHtml(order.productTitle || order.trackTitle || "Order")}</td><td>${escapeHtml(order.orderType || "Digital music")}</td><td>${order.amount ? money(Number(order.amount) > 100 ? order.amount / 100 : order.amount) : "—"}</td><td>${escapeHtml(order.paymentStatus || order.status || "Pending")}</td><td>${order.receiptUrl ? `<a class="text-link" href="${escapeHtml(order.receiptUrl)}">Receipt</a>` : "—"}</td></tr>`).join("")}</tbody></table>`;

async function loadPortal(user) {
  document.querySelector("#welcome").textContent = `Signed in as ${user.displayName || user.email}`;
  const [ordersSnap, projectsSnap, tracks] = await Promise.all([
    getDocs(query(collection(db, "orders"), where("customerUid", "==", user.uid))),
    getDocs(query(collection(db, "projects"), where("customerUid", "==", user.uid))),
    loadTracks()
  ]);
  const orders = ordersSnap.docs.map(item => ({ id: item.id, ...item.data() }));
  const projects = projectsSnap.docs.map(item => ({ id: item.id, ...item.data() }));
  const purchased = orders.filter(order => order.paymentStatus === "paid" && (order.orderType === "digital-track" || order.trackId));
  document.querySelector("#myMusic").innerHTML = purchased.length
    ? musicTable(purchased, tracks)
    : '<p class="empty">You haven’t bought any music yet. <a class="text-link" href="music.html">Browse the store →</a></p>';
  document.querySelector("#myProjects").innerHTML = projects.length
    ? projects.map(project => `<article class="portal-card"><span class="status-pill">${escapeHtml(project.status || "Quote requested")}</span><h3>${escapeHtml(project.projectTitle || "Studio project")}</h3><p>${escapeHtml(project.serviceType || "")}</p></article>`).join("")
    : '<p class="empty">No active projects.</p>';
  document.querySelector("#myOrders").innerHTML = orders.length
    ? orderTable(orders)
    : '<p class="empty">No orders yet.</p>';
}

document.querySelectorAll("[data-panel]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-panel]").forEach(item => item.classList.toggle("active", item === button));
  ["music", "projects", "orders"].forEach(name => {
    const panel = document.querySelector(`#${name}Panel`);
    if (panel) panel.hidden = name !== button.dataset.panel;
  });
}));

const logout = document.querySelector("#logout");
if (logout && auth) {
  logout.addEventListener("click", async () => {
    await signOut(auth);
    location.replace("index.html");
  });
}

if (firebaseReady && auth && authPanel && portal) {
  onAuthStateChanged(auth, async user => {
    authPanel.hidden = Boolean(user);
    portal.hidden = !user;
    if (user) await loadPortal(user);
  });
} else if (status) {
  status.textContent = "Customer accounts activate when Firebase is connected.";
}

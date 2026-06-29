const STORAGE_KEYS = {
  settings: "play-admin-settings-v1",
  djs: "play-admin-djs-v1",
  enquiries: "play-admin-enquiries-v1",
  orders: "play-admin-orders-v1"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const loading = $("#adminLoading");
const login = $("#adminLogin");
const dashboard = $("#adminDashboard");
const loginForm = $("#adminLoginForm");
const loginStatus = $("#adminLoginStatus");
const previewButton = $("#previewAdminButton");
const signOutButton = $("#adminSignOut");
const adminMode = $("#adminMode");
const adminError = $("#adminError");

const state = {
  mode: "loading",
  tracks: [],
  enquiries: readJson(STORAGE_KEYS.enquiries, []),
  orders: readJson(STORAGE_KEYS.orders, []),
  djs: readJson(STORAGE_KEYS.djs, sampleDjs()),
  settings: readJson(STORAGE_KEYS.settings, defaultSettings()),
  firebase: { available: false, message: "Firebase not connected in preview." }
};

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Could not read ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key}`, error);
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(2)}`;
}

function defaultSettings() {
  return {
    facebook: "https://www.facebook.com/playproductionsuk",
    instagram: "",
    tiktok: "",
    spotify: "https://open.spotify.com/artist/1GBNSQahIk3AGMX7zOJRMJ?si=hBkcpzdkTxKRFuiTbPRioA",
    appleMusic: "https://music.apple.com/gb/artist/play-productions/1567918963",
    soundcloud: "https://on.soundcloud.com/Ut0DXvRutAUJrom3Si",
    musicEnabled: true,
    djPromoEnabled: true,
    letsWorkEnabled: true,
    mixingEnabled: false,
    vinylEnabled: false
  };
}

function sampleDjs() {
  return [
    { id: "demo-dj-1", name: "Demo DJ", email: "demo@example.com", status: "Pending", socials: "Instagram", notes: "Preview record" }
  ];
}

function showOnly(view) {
  if (loading) loading.hidden = view !== "loading";
  if (login) login.hidden = view !== "login";
  if (dashboard) {
    dashboard.hidden = view !== "dashboard";
    dashboard.classList.toggle("is-active", view === "dashboard");
  }
  document.body.dataset.adminState = view;
  state.mode = view;
}

function setLoginStatus(message = "", type = "") {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.classList.toggle("error", type === "error");
}

function showAdminError(message) {
  if (!adminError) return;
  adminError.hidden = false;
  adminError.innerHTML = `<div class="admin-error-box">${escapeHtml(message)}</div>`;
}

function withTimeout(promise, timeout = ADMIN_TIMEOUT_MS, label = "Task") {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeout);
    })
  ]).finally(() => clearTimeout(timer));
}

async function fetchJson(path, fallback) {
  try {
    const response = await withTimeout(fetch(path, { cache: "no-store" }), ADMIN_TIMEOUT_MS, path);
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Using fallback for ${path}:`, error);
    return fallback;
  }
}

async function loadTracks() {
  const tracks = await fetchJson("tracks.json", []);
  state.tracks = Array.isArray(tracks) ? tracks : [];
}

function trackHealth(track) {
  const required = [];
  const recommended = [];
  if (!track.title) required.push("Title");
  if (!track.slug) required.push("Slug");
  if (!track.url && !track.masterPath) required.push("Audio path");
  if (!track.thumbnail && !track.coverUrl) recommended.push("Artwork");
  if (!track.bpm) recommended.push("BPM");
  if (!track.key) recommended.push("Key");
  if (!track.description) recommended.push("Description");
  return { required, recommended, status: required.length ? "Blocked" : recommended.length ? "Needs metadata" : "Ready" };
}

function renderAll() {
  renderOverview();
  renderMusic();
  renderEnquiries();
  renderOrders();
  renderDjs();
  renderSettings();
}

function renderOverview() {
  const pendingDjs = state.djs.filter(dj => String(dj.status).toLowerCase() === "pending");
  const trackIssues = state.tracks.filter(track => trackHealth(track).required.length || trackHealth(track).recommended.length);
  const grid = $("#overviewGrid");
  if (grid) {
    grid.innerHTML = [
      [state.enquiries.length, "New enquiries"],
      [pendingDjs.length, "DJ applications"],
      [state.orders.length, "Digital orders"],
      [trackIssues.length, "Tracks needing attention"]
    ].map(([value, label]) => `<article class="admin-card"><strong>${value}</strong><span>${label}</span></article>`).join("");
  }

  const attention = $("#attentionList");
  if (attention) {
    const items = [];
    if (pendingDjs.length) items.push(`${pendingDjs.length} DJ application${pendingDjs.length === 1 ? "" : "s"} awaiting review`);
    if (trackIssues.length) items.push(`${trackIssues.length} track${trackIssues.length === 1 ? "" : "s"} missing metadata`);
    if (!items.length) items.push("Nothing urgent. Module 1 looks tidy.");
    attention.innerHTML = items.map(item => `<div class="admin-row"><strong>${escapeHtml(item)}</strong><p>Review when ready.</p><span></span></div>`).join("");
  }

  const setup = $("#setupStatus");
  if (setup) {
    const rows = [
      ["Public catalogue", state.tracks.length ? "Connected" : "No tracks found"],
      ["Firebase/Auth", state.firebase.available ? "Connected" : "Preview / setup required"],
      ["Payments", "Setup required before live checkout"],
      ["Downloads", "Storage paths required before live downloads"],
      ["Email", "Setup required for customer/DJ messages"]
    ];
    setup.innerHTML = rows.map(([name, status]) => `<div class="admin-row"><strong>${escapeHtml(name)}</strong><p>${escapeHtml(status)}</p><span></span></div>`).join("");
  }
}

function renderMusic() {
  const wrap = $("#musicLibrary");
  if (!wrap) return;
  if (!state.tracks.length) {
    wrap.innerHTML = `<p class="admin-empty">No tracks found in tracks.json yet.</p>`;
    return;
  }
  wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Track</th><th>Genre</th><th>BPM</th><th>Status</th><th>Missing</th><th>Price</th></tr></thead><tbody>${state.tracks.map(track => {
    const health = trackHealth(track);
    const missing = [...health.required, ...health.recommended].join(", ") || "Complete";
    return `<tr><td><strong>${escapeHtml(track.title)}</strong><br><span class="admin-muted">${escapeHtml(track.slug || track.id || "")}</span></td><td>${escapeHtml(track.style || "—")}</td><td>${escapeHtml(track.bpm || "—")}</td><td>${escapeHtml(health.status)}</td><td>${escapeHtml(missing)}</td><td>${money(track.price)}</td></tr>`;
  }).join("")}</tbody></table>`;
}

function renderEnquiries() {
  const wrap = $("#enquiriesList");
  if (!wrap) return;
  if (!state.enquiries.length) {
    wrap.innerHTML = `<p class="admin-empty">No enquiries yet.</p>`;
    return;
  }
  wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th></tr></thead><tbody>${state.enquiries.map(item => `<tr><td>${escapeHtml(item.name || item.artistName || "—")}</td><td>${escapeHtml(item.email || "—")}</td><td>${escapeHtml(item.type || "Enquiry")}</td><td>${escapeHtml(item.status || "New")}</td></tr>`).join("")}</tbody></table>`;
}

function renderOrders() {
  const wrap = $("#ordersList");
  if (!wrap) return;
  if (!state.orders.length) {
    wrap.innerHTML = `<p class="admin-empty">No orders yet. Orders will appear here after live checkout is connected.</p>`;
    return;
  }
  wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Customer</th><th>Item</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${state.orders.map(order => `<tr><td>${escapeHtml(order.customer || order.email || "—")}</td><td>${escapeHtml(order.item || order.productTitle || "—")}</td><td>${money(order.amount || order.total)}</td><td>${escapeHtml(order.status || order.paymentStatus || "Pending")}</td><td>${escapeHtml(order.date || order.createdAt || "—")}</td></tr>`).join("")}</tbody></table>`;
}

function renderDjs() {
  const wrap = $("#djList");
  if (!wrap) return;
  if (!state.djs.length) {
    wrap.innerHTML = `<p class="admin-empty">No DJ records yet.</p>`;
    return;
  }
  wrap.innerHTML = `<table class="admin-table"><thead><tr><th>DJ</th><th>Email</th><th>Socials</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.djs.map(dj => `<tr><td><strong>${escapeHtml(dj.name || dj.djName || "—")}</strong><br><span class="admin-muted">${escapeHtml(dj.notes || "")}</span></td><td>${escapeHtml(dj.email || "—")}</td><td>${escapeHtml(dj.socials || "—")}</td><td>${escapeHtml(dj.status || "Pending")}</td><td><select data-dj-status="${escapeHtml(dj.id)}"><option${dj.status === "Pending" ? " selected" : ""}>Pending</option><option${dj.status === "Approved" ? " selected" : ""}>Approved</option><option${dj.status === "Rejected" ? " selected" : ""}>Rejected</option></select></td></tr>`).join("")}</tbody></table>`;
}

function renderSettings() {
  const wrap = $("#settingsArea");
  if (!wrap) return;
  const tabs = [
    ["visibility", "Public Page Visibility"],
    ["brand", "Brand & Homepage"],
    ["links", "Public Links"],
    ["pricing", "Pricing"],
    ["seo", "SEO Defaults"],
    ["payments", "Payments"],
    ["email", "Email Notifications"]
  ];
  wrap.innerHTML = `<div class="admin-settings-tabs">${tabs.map(([id, label], index) => `<button type="button" data-settings-tab="${id}" class="${index === 0 ? "active" : ""}">${label}</button>`).join("")}</div>
    <section class="settings-panel active" data-settings-panel="visibility"><div class="admin-panel"><h2>Public Page Visibility</h2><div class="admin-form-grid">${["musicEnabled","djPromoEnabled","letsWorkEnabled","mixingEnabled","vinylEnabled"].map(key => `<label><input type="checkbox" data-setting="${key}" ${state.settings[key] ? "checked" : ""}> ${settingLabel(key)}</label>`).join("")}</div><div class="settings-actions"><button class="admin-button primary" data-save-settings="visibility">Save visibility</button></div></div></section>
    <section class="settings-panel" data-settings-panel="brand"><div class="admin-panel"><h2>Brand & Homepage</h2><p class="admin-muted">Homepage copy and hero artwork can be finalised after Module 1 live setup.</p></div></section>
    <section class="settings-panel" data-settings-panel="links"><div class="admin-panel"><h2>Public Links / Social & Streaming Links</h2><div class="admin-form-grid">${["facebook","instagram","tiktok","spotify","appleMusic","soundcloud"].map(key => `<div class="admin-field"><label for="setting-${key}">${settingLabel(key)}</label><input id="setting-${key}" name="${key}" data-setting="${key}" type="url" value="${escapeHtml(state.settings[key] || "")}" autocomplete="url"></div>`).join("")}</div><div class="settings-actions"><button class="admin-button primary" data-save-settings="links">Save links</button></div></div></section>
    <section class="settings-panel" data-settings-panel="pricing"><div class="admin-panel"><h2>Pricing</h2><p class="admin-muted">Digital track prices are currently managed per track. Service pricing belongs to later modules.</p></div></section>
    <section class="settings-panel" data-settings-panel="seo"><div class="admin-panel"><h2>SEO Defaults</h2><p class="admin-muted">SEO defaults can be connected during live setup.</p></div></section>
    <section class="settings-panel" data-settings-panel="payments"><div class="admin-panel"><h2>Payments</h2><p class="admin-muted">Stripe/PayPal setup is required before live checkout.</p></div></section>
    <section class="settings-panel" data-settings-panel="email"><div class="admin-panel"><h2>Email Notifications</h2><p class="admin-muted">Transactional email setup is required for receipts and DJ approval messages.</p></div></section>`;
}

function settingLabel(key) {
  return {
    musicEnabled: "Music Store",
    djPromoEnabled: "DJ Promo",
    letsWorkEnabled: "Let’s Work",
    mixingEnabled: "Mixing & Mastering",
    vinylEnabled: "Vinyl Cutting",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
    spotify: "Spotify",
    appleMusic: "Apple Music",
    soundcloud: "SoundCloud"
  }[key] || key;
}

function switchView(id) {
  $$("[data-admin-view]").forEach(button => button.classList.toggle("active", button.dataset.adminView === id));
  $$("[data-admin-page]").forEach(section => section.classList.toggle("active", section.dataset.adminPage === id));
}

function switchSettings(id) {
  $$("[data-settings-tab]").forEach(button => button.classList.toggle("active", button.dataset.settingsTab === id));
  $$("[data-settings-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.settingsPanel === id));
}

function saveSettings(scope = "settings") {
  $$(`[data-setting]`).forEach(input => {
    if (input.type === "checkbox") state.settings[input.dataset.setting] = input.checked;
    else state.settings[input.dataset.setting] = input.value.trim();
  });
  writeJson(STORAGE_KEYS.settings, state.settings);
  const button = $(`[data-save-settings="${scope}"]`);
  if (button) {
    const original = button.textContent;
    button.textContent = "Saved ✓";
    setTimeout(() => { button.textContent = original; }, 1400);
  }
}

function exportCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map(row => headers.map(header => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function tryFirebaseAuth() {
  try {
    const configModule = await withTimeout(import("./firebase-config.js"), ADMIN_TIMEOUT_MS, "firebase config");
    const config = configModule.firebaseConfig || {};
    if (!config.apiKey || String(config.apiKey).startsWith("PASTE_")) {
      state.firebase = { available: false, message: "Firebase config contains placeholders." };
      return null;
    }
    const [{ initializeApp }, authModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js")
    ]);
    const app = initializeApp(config);
    const auth = authModule.getAuth(app);
    state.firebase = { available: true, message: "Firebase/Auth connected.", auth, authModule };
    return state.firebase;
  } catch (error) {
    console.warn("Firebase/Auth unavailable; admin preview mode remains available.", error);
    state.firebase = { available: false, message: "Firebase/Auth unavailable in preview." };
    return null;
  }
}

async function enterDashboard(mode = "Preview mode") {
  adminMode.textContent = mode;
  showOnly("dashboard");
  await loadTracks();
  renderAll();
}

function bindEvents() {
  document.addEventListener("click", event => {
    const nav = event.target.closest("[data-admin-view]");
    if (nav) switchView(nav.dataset.adminView);
    const tab = event.target.closest("[data-settings-tab]");
    if (tab) switchSettings(tab.dataset.settingsTab);
    const save = event.target.closest("[data-save-settings]");
    if (save) saveSettings(save.dataset.saveSettings);
    if (event.target.closest("#exportTracks")) exportCsv("play-productions-tracks.csv", state.tracks);
    if (event.target.closest("#exportDjs")) exportCsv("play-productions-djs.csv", state.djs);
  });

  document.addEventListener("change", event => {
    const status = event.target.closest("[data-dj-status]");
    if (!status) return;
    const dj = state.djs.find(item => String(item.id) === String(status.dataset.djStatus));
    if (dj) {
      dj.status = status.value;
      writeJson(STORAGE_KEYS.djs, state.djs);
      renderOverview();
      renderDjs();
    }
  });

  if (previewButton) {
    previewButton.addEventListener("click", () => enterDashboard("Preview mode"));
  }

  if (signOutButton) {
    signOutButton.addEventListener("click", async () => {
      if (state.firebase?.auth && state.firebase?.authModule) {
        try { await state.firebase.authModule.signOut(state.firebase.auth); } catch (error) { console.warn(error); }
      }
      showOnly("login");
      setLoginStatus("Signed out.");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async event => {
      event.preventDefault();
      const email = $("#adminEmail")?.value.trim();
      const password = $("#adminPassword")?.value;
      if (!email || !password) return setLoginStatus("Enter email and password.", "error");
      setLoginStatus("Signing in…");
      if (!state.firebase.available) {
        setLoginStatus(`${state.firebase.message} Use Preview dashboard for now.`, "error");
        return;
      }
      try {
        await withTimeout(state.firebase.authModule.signInWithEmailAndPassword(state.firebase.auth, email, password), ADMIN_TIMEOUT_MS, "admin sign in");
        await enterDashboard(email);
      } catch (error) {
        console.error("Admin sign-in failed", error);
        setLoginStatus("Could not sign in. Check Firebase/Auth setup or use Preview dashboard.", "error");
      }
    });
  }
}

async function boot() {
  showOnly("loading");
  bindEvents();
  const fallback = setTimeout(() => {
    if (state.mode === "loading") {
      showOnly("login");
      setLoginStatus("Admin setup is taking too long. Use Preview dashboard while live services are configured.");
    }
  }, 4500);

  try {
    await tryFirebaseAuth();
  } catch (error) {
    console.warn(error);
  } finally {
    clearTimeout(fallback);
    if (state.mode === "loading") {
      showOnly("login");
      setLoginStatus(state.firebase.message || "Ready.");
    }
  }
}

window.addEventListener("error", event => {
  console.error("Admin error:", event.error || event.message);
  if (state.mode === "loading") {
    showOnly("login");
    setLoginStatus("Admin loaded with a recoverable error. Use Preview dashboard.", "error");
  } else if (state.mode === "dashboard") {
    showAdminError("A dashboard task failed. Refresh or use preview mode while setup is completed.");
  }
});

window.addEventListener("unhandledrejection", event => {
  console.error("Admin background task failed:", event.reason);
  if (state.mode === "loading") {
    showOnly("login");
    setLoginStatus("Admin setup did not complete. Use Preview dashboard.", "error");
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

import { firebaseReady, db } from "./platform-data.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "business-dashboard.css";
document.head.appendChild(css);
document.title = "Business Dashboard — Play Productions";

const title = document.querySelector("#loginPanel h1");
if (title && globalThis.playAdminLiveMode !== true) title.textContent = "Business Dashboard sign in";

const nav = document.querySelector(".admin-nav");
const tracks = nav?.querySelector('[data-view="tracks"]');
const projects = nav?.querySelector('[data-view="projects"]');
const cases = nav?.querySelector('[data-view="cases"]');
if (tracks) tracks.textContent = "Music Library";
if (projects) projects.textContent = "Mixing Projects";
if (cases) cases.textContent = "Case Studies";
if (nav && projects) {
  const vinyl = document.createElement("button");
  vinyl.textContent = "Vinyl Projects";
  vinyl.addEventListener("click", () => {
    projects.click();
    document.querySelector('[data-page="projects"] h1').textContent = "Vinyl Projects";
    setTimeout(() => document.querySelectorAll("#projectList .data-row").forEach(row => row.hidden = !/vinyl/i.test(row.textContent)), 0);
  });
  projects.insertAdjacentElement("afterend", vinyl);
  projects.addEventListener("click", () => {
    document.querySelector('[data-page="projects"] h1').textContent = "Mixing Projects";
    setTimeout(() => document.querySelectorAll("#projectList .data-row").forEach(row => row.hidden = /vinyl/i.test(row.textContent)), 0);
  });
  const dj = document.createElement("button");
  dj.textContent = "DJ Access";
  dj.addEventListener("click", () => {
    document.querySelector('[data-view="enquiries"]').click();
    setTimeout(() => document.querySelector("#djApprovalPanel")?.scrollIntoView({ behavior: "smooth" }), 0);
  });
  nav.querySelector('[data-view="settings"]')?.insertAdjacentElement("beforebegin", dj);
}

const stats = document.querySelector("#statGrid");
const enhanceStats = () => {
  if (!stats?.children.length || stats.dataset.enhanced) return;
  stats.dataset.enhanced = "true";
  const cards = [...stats.children];
  const names = ["New enquiries", "Mixing projects", "Vinyl projects", "DJ applications", "Orders", "Missing metadata", "Ready to publish"];
  stats.innerHTML = names.map((name, i) => `<article data-dashboard-target="${i}"><strong>${cards[i % cards.length]?.querySelector("strong")?.textContent || 0}</strong><span>${name}</span></article>`).join("");
};
if (stats) {
  window.addEventListener("play-admin-dashboard-rendered", enhanceStats);
  [0, 250, 750].forEach(delay => setTimeout(enhanceStats, delay));
  stats.addEventListener("click", event => {
    const card = event.target.closest("[data-dashboard-target]");
    if (!card) return;
    const targets = ["enquiries", "projects", "projects", "enquiries", "orders", "tracks", "tracks"];
    document.querySelector(`[data-view="${targets[Number(card.dataset.dashboardTarget)]}"]`)?.click();
  });
}

function settingsValue(saved, key, fallback = "") {
  return saved[key] ?? fallback;
}

function checked(saved, key, fallback = false) {
  const value = saved[key];
  if (value === undefined || value === null || value === "") return fallback ? "checked" : "";
  return value === true || value === "true" || value === "on" || value === "1" ? "checked" : "";
}

function checkboxField(name, label, saved, fallback = false) {
  return `<label class="settings-checkbox"><input type="hidden" name="${name}" value="false"><input name="${name}" type="checkbox" value="true" ${checked(saved, name, fallback)}> ${label}</label>`;
}

const settings = document.querySelector('[data-page="settings"]');
if (settings) {
  const saved = JSON.parse(localStorage.getItem("playBusinessSettings") || "{}");
  const v = (key, fallback = "") => settingsValue(saved, key, fallback);
  settings.insertAdjacentHTML("beforeend", `
    <form id="businessSettings" class="settings-groups">
      <section class="settings-card">
        <h3>Brand & homepage</h3>
        <label>Producer strapline<input name="brandStrapline" value="${v("brandStrapline", "Independent Producer")}"></label>
        <label>Homepage introduction<textarea name="homepageIntro">${v("homepageIntro", "Buy music, hire Play Productions, request DJ access or order custom vinyl.")}</textarea></label>
      </section>
      <section class="settings-card">
        <h3>Pricing</h3>
        <label>Stereo mastering from (£)<input name="masteringBase" type="number" value="${v("masteringBase", 30)}"></label>
        <label>Stereo mixing from (£)<input name="mixingBase" type="number" value="${v("mixingBase", 35)}"></label>
        <label>Mix + master from (£)<input name="mixMasterBase" type="number" value="${v("mixMasterBase", 55)}"></label>
        <label>Vinyl custom-enquiry quantity<input name="vinylMaxQuantity" type="number" value="${v("vinylMaxQuantity", 5)}"></label>
      </section>
      <section class="settings-card" data-settings-card="catalogue-defaults" data-settings-section="catalogue-defaults">
        <h3>Catalogue defaults</h3>
        <p class="settings-card-note">Used only when opening Add Track. Existing tracks keep their saved values.</p>
        <label>Default artist<input name="defaultTrackArtist" value="${v("defaultTrackArtist", "Play Productions")}"></label>
        <label>Default track price (£)<input name="defaultTrackPrice" type="number" min="0" step="0.01" value="${v("defaultTrackPrice", 1.29)}"></label>
        <label>Default status<select name="defaultTrackStatus"><option value="draft" ${v("defaultTrackStatus", "draft") === "draft" ? "selected" : ""}>Draft</option><option value="coming-soon" ${v("defaultTrackStatus") === "coming-soon" ? "selected" : ""}>Coming soon</option></select></label>
        <label>Default preview start (seconds)<input name="defaultPreviewStartSeconds" type="number" min="0" step="1" value="${v("defaultPreviewStartSeconds", 0)}"></label>
        <label>Default preview duration (seconds)<input name="defaultPreviewDurationSeconds" type="number" min="1" step="1" value="${v("defaultPreviewDurationSeconds", 30)}"></label>
        ${checkboxField("defaultShowInStore", "Show new tracks on website", saved, false)}
        ${checkboxField("defaultShowInDjPool", "Show new tracks in DJ Promo", saved, false)}
        ${checkboxField("defaultPurchaseEnabled", "Enable personal purchase", saved, false)}
        ${checkboxField("defaultShowInLatest", "Include in Latest Releases", saved, false)}
        ${checkboxField("defaultFeatured", "Mark as featured", saved, false)}
        ${checkboxField("defaultDateTbc", "Release date TBC", saved, true)}
      </section>
      <section class="settings-card">
        <h3>Social links</h3>
        <label>Instagram<input name="instagram" value="${v("instagram", "https://www.instagram.com/playproductionsuk")}"></label>
        <label>TikTok<input name="tiktok" value="${v("tiktok", "https://www.tiktok.com/@playproductionsuk")}"></label>
        <label>Facebook<input name="facebook" value="${v("facebook", "")}"></label>
      </section>
      <section class="settings-card">
        <h3>SEO defaults</h3>
        <label>Default meta title<input name="seoTitle" value="${v("seoTitle", "Play Productions")}"></label>
        <label>Default description<textarea name="seoDescription">${v("seoDescription", "")}</textarea></label>
        <label>Open Graph image<input name="seoImage" value="${v("seoImage", "og-image.jpg")}"></label>
      </section>
      <section class="settings-card">
        <h3>Payments</h3>
        <label>Stripe status<input value="Configured through Functions secrets" disabled></label>
        <label>PayPal status<input value="Configured through Functions secrets" disabled></label>
      </section>
      <section class="settings-card">
        <h3>Email placeholders</h3>
        <label>From name<input name="emailFromName" value="${v("emailFromName", "Play Productions")}"></label>
        <label>Reply-to email<input name="emailReplyTo" type="email" value="${v("emailReplyTo", "")}"></label>
      </section>
      <button class="button primary">Save business settings</button>
      <p id="businessSettingsStatus"></p>
    </form>
  `);

  document.querySelector("#businessSettings").addEventListener("submit", async event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    localStorage.setItem("playBusinessSettings", JSON.stringify(values));
    const status = document.querySelector("#businessSettingsStatus");
    status.textContent = "Settings saved locally.";
    if (firebaseReady && getAuth().currentUser) {
      try {
        await setDoc(doc(db, "settings", "business"), { ...values, updatedAt: serverTimestamp() }, { merge: true });
        status.textContent = "Business settings saved.";
      } catch {
        status.textContent = "Saved locally; Firestore permission is still required.";
      }
    }
  });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs, query, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const visibilityStyle = document.createElement("style");
visibilityStyle.textContent = "[hidden]{display:none!important}";
document.head.appendChild(visibilityStyle);

export const firebaseReady = !Object.values(firebaseConfig).some(value => String(value).startsWith("PASTE_"));
export const firebaseApp = firebaseReady ? initializeApp(firebaseConfig) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

export function money(value) { return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0)); }
export function slugify(value = "") { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70); }
export function escapeHtml(value = "") { const element = document.createElement("span"); element.textContent = value; return element.innerHTML; }

export function normaliseTrack(raw) {
  const legacyId = raw.id || String(raw.trackNumber || "").replace(/^0+/, "");
  return {
    id: legacyId || slugify(raw.title), slug: raw.slug || slugify(raw.title), title: raw.title || "Untitled",
    status: raw.status || "published", productType: raw.productType || "digital-track",
    showInStore: raw.showInStore ?? raw.published ?? true, showInDjPool: raw.showInDjPool ?? raw.djPromoEnabled ?? false,
    showInLatest: raw.showInLatest ?? true, featured: raw.featured ?? false, allowExclusiveEnquiry: raw.allowExclusiveEnquiry ?? true,
    purchaseEnabled: raw.purchaseEnabled ?? true, dateTbc: raw.dateTbc ?? false,
    coverUrl: raw.coverUrl || raw.thumbnail || (raw.placeholderArtwork ? "icons/fallback.png" : ""), coverPath: raw.coverPath || "",
    previewUrl: raw.previewUrl || raw.url || "", previewPath: raw.previewPath || "", masterPath: raw.masterPath || "",
    style: raw.style || raw.genre || "", bpm: raw.bpm || "", key: raw.key || "", moodTags: raw.moodTags || [],
    teaser: raw.teaser || raw.description || "", description: raw.description || raw.teaser || "",
    price: Number(raw.price ?? 1.29), releaseDate: raw.releaseDate || "", adminNotes: raw.adminNotes || "",
    seoTitle: raw.seoTitle || "", seoDescription: raw.seoDescription || "", ogImageUrl: raw.ogImageUrl || "", shareImageUrl: raw.shareImageUrl || "", featuredImageUrl: raw.featuredImageUrl || "",
    isrc: raw.isrc || "", upc: raw.upc || "", tunecoreUrl: raw.tunecoreUrl || "", prsId: raw.prsId || "", pplId: raw.pplId || "", spotifyUrl: raw.spotifyUrl || "", appleMusicUrl: raw.appleMusicUrl || "", mp3Url: raw.mp3Url || "", wavPath: raw.wavPath || raw.masterPath || "",
    sortPriority: Number(raw.sortPriority || 0), createdAt: raw.createdAt || null, updatedAt: raw.updatedAt || null
  };
}

export const requirements = {
  draft: { required: ["title"], recommended: ["style", "teaser"] },
  "coming-soon": { required: ["title", "coverUrl", "teaser", "releaseTiming"], recommended: ["previewUrl", "style", "seoDescription"] },
  published: { required: ["title", "slug", "coverUrl", "previewUrl", "masterPath", "price", "style", "description", "releaseDate"], recommended: ["bpm", "key", "moodTags", "seoTitle", "seoDescription", "ogImageUrl"] },
  archived: { required: ["title"], recommended: [] },
  "dj-only": { required: ["title", "coverUrl", "masterPath"], recommended: ["description", "previewUrl", "style", "moodTags"] }
};

function present(track, field) {
  if (field === "releaseTiming") return Boolean(track.releaseDate || track.dateTbc);
  if (field === "price") return Number(track.price) > 0;
  if (field === "moodTags") return Array.isArray(track.moodTags) ? track.moodTags.length > 0 : Boolean(track.moodTags);
  return Boolean(track[field]);
}

export function trackHealth(track) {
  const mode = track.showInDjPool && !track.showInStore ? "dj-only" : track.status;
  const config = requirements[mode] || requirements.draft;
  const missingRequired = config.required.filter(field => !present(track, field));
  const missingRecommended = config.recommended.filter(field => !present(track, field));
  const total = config.required.length * 3 + config.recommended.length;
  const earned = (config.required.length - missingRequired.length) * 3 + (config.recommended.length - missingRecommended.length);
  const risks = [];
  if (track.status === "published" && track.showInStore && (!track.purchaseEnabled || missingRequired.length)) risks.push("Store purchase is unavailable");
  if (track.showInDjPool && !track.masterPath) risks.push("DJ download has no master file");
  return { score: total ? Math.round(earned / total * 100) : 100, missingRequired, missingRecommended, risks, readyToBuy: track.status === "published" && track.showInStore && track.purchaseEnabled && missingRequired.length === 0 };
}

export async function loadTracks({ includeAdmin = false } = {}) {
  if (!firebaseReady) { const response = await fetch("tracks.json"); return (await response.json()).map(normaliseTrack); }
  const snapshot = includeAdmin ? await getDocs(collection(db, "tracks")) : await getDocs(query(collection(db, "tracks"), where("status", "in", ["coming-soon", "published"])));
  return snapshot.docs.map(item => normaliseTrack({ id: item.id, ...item.data() })).sort((a, b) => b.sortPriority - a.sortPriority || String(b.releaseDate).localeCompare(String(a.releaseDate)));
}

export async function createEnquiry(payload) {
  if (!firebaseReady) { console.info("Demo enquiry", payload); return { id: "demo" }; }
  return addDoc(collection(db, "enquiries"), { ...payload, status: "new", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

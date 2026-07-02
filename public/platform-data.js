import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs, query, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const visibilityStyle = document.createElement("style");
visibilityStyle.textContent = "[hidden]{display:none!important}";
document.head.appendChild(visibilityStyle);

const firebaseAppKeys = ["apiKey", "authDomain", "projectId", "appId"];
export const firebaseReady = firebaseAppKeys.every(key => {
  const value = String(firebaseConfig[key] || "").trim();
  return value && !value.startsWith("PASTE_");
});
export const firebaseApp = firebaseReady ? initializeApp(firebaseConfig) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

export function money(value) { return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0)); }
export function slugify(value = "") { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70); }
export function escapeHtml(value = "") { const element = document.createElement("span"); element.textContent = value; return element.innerHTML; }

export function normaliseTrack(raw) {
  const legacyId = raw.id || String(raw.trackNumber || "").replace(/^0+/, "");
  return {
    id: legacyId || slugify(raw.title), legacyId: raw.legacyId || raw.trackNumber || "", slug: raw.slug || slugify(raw.title), title: raw.title || "Untitled", artist: raw.artist || "Play Productions", releaseTitle: raw.releaseTitle || "",
    status: raw.status || "published", productType: raw.productType || "digital-track",
    showInStore: raw.showInStore ?? raw.published ?? true, showInDjPool: raw.showInDjPool ?? raw.djPromoEnabled ?? false,
    showInLatest: raw.showInLatest ?? true, featured: raw.featured ?? false, allowExclusiveEnquiry: raw.allowExclusiveEnquiry ?? true,
    purchaseEnabled: raw.purchaseEnabled ?? true, dateTbc: raw.releaseDate ? false : raw.dateTbc ?? false,
    coverUrl: raw.coverUrl || raw.thumbnail || (raw.placeholderArtwork ? "icons/fallback.png" : ""), coverPath: raw.coverPath || "", thumbnail: raw.thumbnail || raw.coverUrl || "",
    previewUrl: raw.previewUrl || raw.url || "", previewPath: raw.previewPath || "", mp3Path: raw.mp3Path || raw.previewPath || "", mp3Url: raw.mp3Url || raw.previewUrl || raw.url || "", url: raw.url || raw.previewUrl || "", masterPath: raw.masterPath || raw.wavPath || "",
    style: raw.style || raw.genre || "", subgenre: raw.subgenre || "", bpm: raw.bpm || "", key: raw.key || "", moodTags: raw.moodTags || [],
    teaser: raw.teaser || raw.description || "", description: raw.description || raw.teaser || "",
    price: Number(raw.price ?? 1.29), releaseDate: raw.releaseDate || "", adminNotes: raw.adminNotes || "",
    seoTitle: raw.seoTitle || "", seoDescription: raw.seoDescription || "", ogImageUrl: raw.ogImageUrl || "", shareImageUrl: raw.shareImageUrl || "", featuredImageUrl: raw.featuredImageUrl || "",
    isrc: raw.isrc || "", upc: raw.upc || "", tunecoreUrl: raw.tunecoreUrl || "", distributionReleaseId: raw.distributionReleaseId || "", hyperfollowUrl: raw.hyperfollowUrl || "", prsId: raw.prsId || "", pplId: raw.pplId || "", spotifyUrl: raw.spotifyUrl || "", appleMusicUrl: raw.appleMusicUrl || "", soundcloudUrl: raw.soundcloudUrl || "", youtubeMusicUrl: raw.youtubeMusicUrl || "", wavPath: raw.wavPath || raw.masterPath || "", composerDetails: raw.composerDetails || "", producerDetails: raw.producerDetails || "", publisherDetails: raw.publisherDetails || "", distributionDate: raw.distributionDate || "", copyrightNotes: raw.copyrightNotes || "", prsRegistered: raw.prsRegistered ?? false, pplRegistered: raw.pplRegistered ?? false, tunecoreUploaded: raw.tunecoreUploaded ?? false, distributedToStores: raw.distributedToStores ?? false, samplesChecked: raw.samplesChecked ?? false, tracklibChecked: raw.tracklibChecked ?? false, distributionUploaded: raw.distributionUploaded ?? raw.tunecoreUploaded ?? raw.distributedToStores ?? false, releaseDateConfirmed: raw.releaseDateConfirmed ?? false, publicWebsiteUpdated: raw.publicWebsiteUpdated ?? false, newTrackNotificationSent: raw.newTrackNotificationSent ?? false, newTrackNotificationSentAt: raw.newTrackNotificationSentAt || "", notificationNotes: raw.notificationNotes || "", socialPromoStatus: raw.socialPromoStatus || "", socialPromoNotes: raw.socialPromoNotes || "", releaseChecklistNotes: raw.releaseChecklistNotes || "",
    sortPriority: Number(raw.sortPriority || 0), createdAt: raw.createdAt || null, updatedAt: raw.updatedAt || null
  };
}

export const requirements = {
  draft: { required: ["title"], recommended: ["style", "teaser"] },
  "coming-soon": { required: ["title", "coverUrl", "teaser", "releaseTiming"], recommended: ["previewUrl", "style", "seoDescription"] },
  published: { required: ["title", "slug", "coverUrl", "previewUrl", "masterPath", "price", "style", "description", "releaseTiming"], recommended: ["bpm", "key", "moodTags", "seoTitle", "seoDescription", "ogImageUrl"] },
  archived: { required: ["title"], recommended: [] },
  "dj-only": { required: ["title", "coverUrl", "mainMp3"], recommended: ["description", "style", "moodTags"] }
};

function present(track, field) {
  if (field === "mainMp3") return Boolean(track.mp3Path || track.previewPath || track.previewUrl || track.url);
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
  if (track.showInDjPool && !present(track, "mainMp3")) risks.push("DJ promo has no MP3 file");
  return { score: total ? Math.round(earned / total * 100) : 100, missingRequired, missingRecommended, risks, readyToBuy: track.status === "published" && track.showInStore && track.purchaseEnabled && Number(track.price) > 0 };
}

export function resolveMainMp3(track = {}) {
  return track.mp3Path || track.previewPath || track.previewUrl || track.url || "";
}

export function resolveMainMaster(track = {}) {
  return track.masterPath || track.wavPath || "";
}

export function trackReadiness(track = {}) {
  const mp3 = Boolean(resolveMainMp3(track));
  const master = Boolean(resolveMainMaster(track));
  const releaseTiming = Boolean(track.releaseDate || track.dateTbc);
  const websiteChecks = {
    title: Boolean(track.title),
    slug: Boolean(track.slug),
    style: Boolean(track.style),
    bpm: Boolean(track.bpm),
    artwork: Boolean(track.coverUrl),
    mp3,
    master,
    teaser: Boolean(track.teaser || track.description),
    status: Boolean(track.status),
    showInStore: track.showInStore === true,
    showInDjPoolDecision: typeof track.showInDjPool === "boolean",
    releaseTiming
  };
  const saleChecks = {
    purchaseEnabled: track.purchaseEnabled === true,
    price: Number(track.price) > 0,
    mp3,
    master
  };
  const djEnabled = track.showInDjPool === true;
  const djChecks = {
    showInDjPool: djEnabled,
    mp3,
    compatibleStatus: ["published", "coming-soon"].includes(track.status)
  };
  const releaseChecks = {
    prsRegistered: track.prsRegistered === true,
    samplesChecked: track.samplesChecked === true,
    tracklibChecked: track.tracklibChecked === true,
    distributionUploaded: track.distributionUploaded === true || track.tunecoreUploaded === true || track.distributedToStores === true,
    isrc: Boolean(track.isrc),
    upc: Boolean(track.upc),
    distributionId: Boolean(track.distributionReleaseId || track.tunecoreUrl),
    releaseDateConfirmed: track.releaseDateConfirmed === true,
    publicWebsiteUpdated: track.publicWebsiteUpdated === true,
    notificationTracked: track.newTrackNotificationSent === true,
    socialPromo: Boolean(track.socialPromoStatus)
  };
  const group = (checks, enabled = true) => {
    const entries = Object.entries(checks);
    const complete = entries.filter(([, value]) => value).length;
    return { enabled, checks, complete, total: entries.length, ready: enabled && complete === entries.length };
  };
  return {
    website: group(websiteChecks, track.showInStore === true),
    sale: group(saleChecks, track.purchaseEnabled === true),
    dj: group(djChecks, djEnabled),
    release: group(releaseChecks)
  };
}

function timed(promise, milliseconds = 6500) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("The data request timed out.")), milliseconds))]);
}

async function localTracks() {
  const response = await timed(fetch("tracks.json"), 5000);
  if (!response.ok) throw new Error("The local music catalogue could not be loaded.");
  return (await response.json()).map(normaliseTrack);
}

export async function loadTracks({ includeAdmin = false } = {}) {
  if (!firebaseReady || globalThis.playAdminPreviewOnly) return localTracks();
  try {
    const request = includeAdmin ? getDocs(collection(db, "tracks")) : getDocs(query(collection(db, "tracks"), where("status", "in", ["coming-soon", "published"])));
    const snapshot = await timed(request);
    if (snapshot.empty) return localTracks();
    return snapshot.docs.map(item => normaliseTrack({ ...item.data(), id: item.id })).sort((a, b) => b.sortPriority - a.sortPriority || String(b.releaseDate).localeCompare(String(a.releaseDate)));
  } catch (error) {
    console.warn("Firebase tracks unavailable; using local catalogue.", error);
    return localTracks();
  }
}

export async function createEnquiry(payload) {
  if (!firebaseReady || globalThis.playAdminPreviewOnly) { const id=`demo-${Date.now()}`,item={...payload,id,status:"new",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};let saved=[];try{saved=JSON.parse(localStorage.getItem("playDemoEnquiries")||"[]")}catch{}saved.unshift(item);localStorage.setItem("playDemoEnquiries",JSON.stringify(saved));console.info("Demo enquiry",item);return { id }; }
  return addDoc(collection(db, "enquiries"), { ...payload, status: "new", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

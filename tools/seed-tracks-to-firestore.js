const fs = require("fs");
const path = require("path");
const admin = require("../functions/node_modules/firebase-admin");

const projectId = "play-productions";
const usePreviewAsMaster = process.argv.includes("--use-preview-as-master");
const force = process.argv.includes("--force");

admin.initializeApp({ projectId });

const db = admin.firestore();

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normaliseTrack(raw) {
  const slug = raw.slug || slugify(raw.title || raw.id);
  const preview = raw.previewUrl || raw.previewPath || raw.url || "";
  const cover = raw.coverUrl || raw.thumbnail || "";

  const track = {
    ...raw,
    id: raw.id || slug,
    slug,
    title: raw.title || "Untitled",
    artist: raw.artist || "Play Productions",
    status: raw.status || "published",
    productType: raw.productType || "digital-track",
    showInStore: raw.showInStore ?? raw.published ?? true,
    showInDjPool: raw.showInDjPool ?? raw.djPromoEnabled ?? false,
    showInLatest: raw.showInLatest ?? true,
    featured: raw.featured ?? false,
    allowExclusiveEnquiry: raw.allowExclusiveEnquiry ?? true,
    purchaseEnabled: raw.purchaseEnabled ?? true,
    style: raw.style || "",
    moodTags: Array.isArray(raw.moodTags) ? raw.moodTags : [],
    teaser: raw.teaser || "",
    description: raw.description || "",
    price: Number(raw.price ?? 0),
    releaseDate: raw.releaseDate || "",
    coverUrl: cover,
    previewUrl: preview,
    previewPath: raw.previewPath || preview,
    mp3Path: raw.mp3Path || raw.mp3Url || preview,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  if (raw.masterPath || raw.wavPath || raw.wavUrl) {
    track.masterPath = raw.masterPath || raw.wavPath || raw.wavUrl;
  } else if (usePreviewAsMaster) {
    track.masterPath = preview;
  }

  return track;
}

async function main() {
  const file = path.join(__dirname, "..", "public", "tracks.json");
  const tracks = JSON.parse(fs.readFileSync(file, "utf8"));

  let created = 0;
  let skipped = 0;
  let updated = 0;

  for (const raw of tracks) {
    const track = normaliseTrack(raw);
    const docId = track.slug || String(track.id);
    const ref = db.collection("tracks").doc(docId);
    const snap = await ref.get();

    if (snap.exists && !force) {
      skipped++;
      console.log(`Skipped existing: ${docId}`);
      continue;
    }

    await ref.set(track, { merge: true });

    if (snap.exists) {
      updated++;
      console.log(`Updated: ${docId}`);
    } else {
      created++;
      console.log(`Created: ${docId}`);
    }
  }

  console.log("");
  console.log(`Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

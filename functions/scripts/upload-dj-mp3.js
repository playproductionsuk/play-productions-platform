"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const args = new Set(process.argv.slice(2));
const valueAfter = flag => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : "";
};

if (args.has("--help")) {
  console.log(`
Upload existing public/tracks/*.mp3 files for protected DJ downloads.

Dry run:
  npm run migrate:dj-mp3

Write to Firebase:
  npm run migrate:dj-mp3 -- --execute --project play-productions --bucket YOUR_BUCKET

Options:
  --execute                    Perform uploads and Firestore writes.
  --project <project-id>       Override the project from .firebaserc.
  --bucket <bucket-name>       Override the Firebase Storage bucket.
  --use-mp3-as-master-test     Set masterPath to the MP3 path for temporary testing.
  --force                      Allow an existing masterPath to be replaced in test mode.
  --help                       Show this help.

Authentication uses Application Default Credentials. Set GOOGLE_APPLICATION_CREDENTIALS
to a service-account file outside this repository, or use another ADC-supported login.
`);
  process.exit(0);
}

const execute = args.has("--execute");
const force = args.has("--force");
const useMp3AsMaster = args.has("--use-mp3-as-master-test");
const repoRoot = path.resolve(__dirname, "..", "..");
const publicRoot = path.join(repoRoot, "public");
const tracksRoot = path.join(publicRoot, "tracks");
const cataloguePath = path.join(publicRoot, "tracks.json");

const safeName = slug => `${String(slug).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.mp3`;

async function readProjectId() {
  const explicit = valueAfter("--project");
  if (explicit) return explicit;
  try {
    const config = JSON.parse(await fs.readFile(path.join(repoRoot, ".firebaserc"), "utf8"));
    return config.projects?.default || "";
  } catch {
    return "";
  }
}

function resolveTrackFile(track) {
  const relative = String(track.url || "");
  if (!relative.toLowerCase().endsWith(".mp3")) return null;
  const absolute = path.resolve(publicRoot, relative);
  const expectedRoot = `${path.resolve(tracksRoot)}${path.sep}`;
  if (!absolute.startsWith(expectedRoot)) throw new Error(`Unsafe track path for ${track.slug}: ${relative}`);
  return absolute;
}

async function existingFiles(catalogue) {
  const rows = [];
  for (const track of catalogue) {
    if (!track.slug) {
      rows.push({ track, error: "Missing slug" });
      continue;
    }
    const source = resolveTrackFile(track);
    if (!source) {
      rows.push({ track, error: "No MP3 URL in tracks.json" });
      continue;
    }
    try {
      const stat = await fs.stat(source);
      if (!stat.isFile()) throw new Error("Not a file");
      rows.push({
        track,
        source,
        size: stat.size,
        objectPath: `dj/mp3/${safeName(track.slug)}`
      });
    } catch {
      rows.push({ track, error: `MP3 not found: ${path.relative(repoRoot, source)}` });
    }
  }
  return rows;
}

async function main() {
  const catalogue = JSON.parse(await fs.readFile(cataloguePath, "utf8"));
  if (!Array.isArray(catalogue)) throw new Error("public/tracks.json must contain an array.");

  const rows = await existingFiles(catalogue);
  const summary = {
    catalogue: catalogue.length,
    matched: rows.filter(row => row.source).length,
    uploaded: 0,
    reused: 0,
    created: 0,
    updated: 0,
    skipped: rows.filter(row => row.error).length,
    masterPreserved: 0,
    errors: 0
  };

  console.log(execute ? "LIVE WRITE MODE" : "DRY RUN — no Firebase changes will be made");
  for (const row of rows) {
    if (row.error) console.log(`SKIP ${row.track.title || row.track.slug || "unknown"}: ${row.error}`);
    else console.log(`PLAN ${row.track.slug}: ${path.relative(repoRoot, row.source)} -> ${row.objectPath} (${row.size} bytes)`);
  }
  if (!execute) {
    console.log("Run again with --execute after reviewing the plan.");
    console.table(summary);
    return;
  }

  const projectId = await readProjectId();
  if (!projectId) throw new Error("Firebase project ID is required. Pass --project <project-id>.");
  const bucketName = valueAfter("--bucket") || process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) throw new Error("Storage bucket is required. Pass --bucket <bucket-name> or set FIREBASE_STORAGE_BUCKET.");

  const { applicationDefault, getApps, initializeApp } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");
  const { getStorage } = require("firebase-admin/storage");
  if (!getApps().length) {
    initializeApp({ credential: applicationDefault(), projectId, storageBucket: bucketName });
  }
  const db = getFirestore();
  const bucket = getStorage().bucket(bucketName);

  for (const row of rows.filter(item => item.source)) {
    const { track, source, objectPath } = row;
    try {
      const object = bucket.file(objectPath);
      const [objectExists] = await object.exists();
      if (!objectExists || force) {
        await bucket.upload(source, {
          destination: objectPath,
          resumable: false,
          metadata: {
            contentType: "audio/mpeg",
            cacheControl: "private, max-age=0, no-store",
            metadata: { source: "public-tracks-migration", trackSlug: track.slug }
          }
        });
        summary.uploaded += 1;
      } else {
        summary.reused += 1;
      }

      const ref = db.collection("tracks").doc(track.slug);
      const snapshot = await ref.get();
      const current = snapshot.exists ? snapshot.data() : {};
      const update = {
        ...(snapshot.exists ? {} : {
          ...track,
          slug: track.slug,
          coverUrl: track.coverUrl || track.thumbnail || "",
          previewUrl: track.previewUrl || track.url || ""
        }),
        mp3Path: objectPath,
        previewPath: objectPath
      };

      if (useMp3AsMaster) {
        if (!current.masterPath || force) update.masterPath = objectPath;
        else summary.masterPreserved += 1;
      }

      const changed = !snapshot.exists || Object.entries(update).some(([key, value]) => current[key] !== value);
      if (!changed) {
        summary.skipped += 1;
        console.log(`SKIP ${track.slug}: Firestore paths already match.`);
        continue;
      }

      await ref.set(update, { merge: true });
      if (snapshot.exists) summary.updated += 1;
      else summary.created += 1;
      console.log(`${snapshot.exists ? "UPDATE" : "CREATE"} tracks/${track.slug}: ${JSON.stringify(update)}`);
    } catch (error) {
      summary.errors += 1;
      console.error(`ERROR ${track.slug}: ${error.message}`);
    }
  }

  console.table(summary);
  if (summary.errors) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

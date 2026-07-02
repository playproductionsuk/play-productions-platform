export { firebaseApp as app, db, firebaseReady, loadTracks, money, normaliseTrack, trackHealth, createEnquiry, escapeHtml, slugify } from "./platform-data.js";
import { loadTracks } from "./platform-data.js";
export async function loadTrack(id) {
  const requested = decodeURIComponent(String(id || "")).trim();
  const tracks = await loadTracks();
  return tracks.find(track =>
    [track.slug, track.id, track.legacyId]
      .filter(value => value !== undefined && value !== null && value !== "")
      .some(value => String(value) === requested)
  );
}

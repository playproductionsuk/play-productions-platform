export { firebaseApp as app, db, firebaseReady, loadTracks, money, normaliseTrack, trackHealth, createEnquiry, escapeHtml, slugify } from "./platform-data.js";
import { loadTracks } from "./platform-data.js";
export async function loadTrack(id) { const tracks = await loadTracks(); return tracks.find(track => String(track.id) === String(id) || track.slug === id); }

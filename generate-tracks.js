const fs = require('fs');
const path = require('path');

const TRACKS_DIR = path.join(__dirname, 'public', 'tracks');
const COVERS_DIR = path.join(__dirname, 'public', 'covers');
const OUTPUT_FILE = path.join(__dirname, 'public', 'tracks.json');

function parseFilename(filename) {
  const match = filename.match(/^(\d+) - (.+) \((.+)\)\.mp3$/i);
  if (!match) return null;
  const [, trackNumber, title, style] = match;

  const coverImage = findCoverImage(trackNumber);

  return {
    trackNumber,
    title,
    style,
    url: `tracks/${filename}`,
    thumbnail: coverImage
  };
}

function findCoverImage(trackNumber) {
  const possibleExtensions = ['jpg', 'jpeg', 'png'];
  for (const ext of possibleExtensions) {
    const fileName = `${trackNumber}.${ext}`;
    const fullPath = path.join(COVERS_DIR, fileName);
    if (fs.existsSync(fullPath)) {
      return `covers/${fileName}`;
    }
  }
  return 'icons/fallback.png'; // fallback image
}

function generateTrackList() {
  fs.readdir(TRACKS_DIR, (err, files) => {
    if (err) {
      console.error('Error reading tracks directory:', err);
      return;
    }

    const tracks = files
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .map(parseFilename)
      .filter(Boolean);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tracks, null, 2));
    console.log(`✅ ${tracks.length} track(s) written to tracks.json`);
  });
}

generateTrackList();

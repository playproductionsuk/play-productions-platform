export function hasProtectedDjMp3(track = {}) {
  return Boolean(track.mp3Path || track.previewPath);
}

export async function requestProtectedDjMp3(user, track = {}) {
  if (!user) throw new Error("DJ sign-in required.");
  if (!hasProtectedDjMp3(track)) throw new Error("MP3 promo download is not available yet.");

  const token = await user.getIdToken();
  const downloadId = track.firestoreId || track.slug || track.id;
  const response = await fetch(
    `/api/dj-download?track=${encodeURIComponent(downloadId)}&format=mp3`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) throw new Error(data.error || "MP3 promo download failed.");
  if (!data.url) throw new Error("The protected MP3 link was not returned.");
  location.href = data.url;
}

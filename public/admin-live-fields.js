const ogField = document.querySelector("#ogImageUrl")?.closest(".field");

if (ogField && !document.querySelector("#isrc")) {
  ogField.insertAdjacentHTML("afterend", `
    <div class="field"><label>Share image URL<input id="shareImageUrl" name="shareImageUrl"></label></div>
    <div class="field"><label>Featured image URL<input id="featuredImageUrl" name="featuredImageUrl"></label></div>
    <div class="field full metadata-fields">
      <label>ISRC<input id="isrc" name="isrc"></label>
      <label>UPC<input id="upc" name="upc"></label>
      <label>TuneCore release ID<input id="tunecoreUrl" name="tunecoreUrl"></label>
      <label>PRS work ID<input id="prsId" name="prsId"></label>
      <label>PPL recording ID<input id="pplId" name="pplId"></label>
      <label>Spotify URL<input id="spotifyUrl" name="spotifyUrl"></label>
      <label>Apple Music URL<input id="appleMusicUrl" name="appleMusicUrl"></label>
      <label>SoundCloud URL<input id="soundcloudUrl" name="soundcloudUrl"></label>
      <label>YouTube Music URL<input id="youtubeMusicUrl" name="youtubeMusicUrl"></label>
      <label>MP3 file URL<input id="mp3Url" name="mp3Url"></label>
      <label>WAV file path<input id="wavPath" name="wavPath"></label>
    </div>
    <div class="switch-grid full">
      <label><input id="prsRegistered" name="prsRegistered" type="checkbox"> PRS registered</label>
      <label><input id="pplRegistered" name="pplRegistered" type="checkbox"> PPL registered</label>
      <label><input id="tunecoreUploaded" name="tunecoreUploaded" type="checkbox"> TuneCore uploaded</label>
      <label><input id="distributedToStores" name="distributedToStores" type="checkbox"> Distributed to stores</label>
    </div>
    <div class="field full"><label>Release checklist notes<textarea id="releaseChecklistNotes" name="releaseChecklistNotes"></textarea></label></div>
  `);
}

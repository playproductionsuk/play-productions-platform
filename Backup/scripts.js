<script>
  const trackList = document.getElementById("track-list");

  const audio = new Audio();
  let tracks = [];
  let currentIndex = 0;

  const controls = document.createElement("div");
  controls.className = "player-controls";
  controls.innerHTML = `
    <button id="prevBtn">⏮️</button>
    <button id="playPauseBtn">▶️</button>
    <button id="nextBtn">⏭️</button>
    <div id="trackInfo"></div>
  `;
  document.querySelector("main").appendChild(controls);

  const prevBtn = document.getElementById("prevBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const trackInfo = document.getElementById("trackInfo");

  const loadTrack = (index) => {
    const track = tracks[index];
    audio.src = track.url;
    audio.play();
    updateUI(index);
    playPauseBtn.textContent = "⏸️";
  };

  const updateUI = (index) => {
    document.querySelectorAll(".track").forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });
    trackInfo.textContent = `${tracks[index].title} [${tracks[index].style}]`;
  };

  const fetchTracks = async () => {
    const response = await fetch("tracks.json");
    tracks = await response.json();
    tracks.sort((a, b) => Number(a.trackNumber) - Number(b.trackNumber));

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const wrapper = document.createElement("div");
      wrapper.className = "track";
      wrapper.addEventListener("click", () => {
        currentIndex = i;
        loadTrack(i);
      });

      const title = document.createElement("h3");
      title.innerText = `${track.trackNumber}. ${track.title}`;
      wrapper.appendChild(title);

      const tag = document.createElement("span");
      tag.className = "style-tag";
      tag.innerText = track.style;
      wrapper.appendChild(tag);

      trackList.appendChild(wrapper);
    }
  };

  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = "⏸️";
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶️";
    }
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack(currentIndex);
  });

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentIndex);
  });

  fetchTracks();
</script>

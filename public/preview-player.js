const DEFAULT_START_SECONDS = 0;
const DEFAULT_DURATION_SECONDS = 30;

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function previewTiming(track = {}) {
  const duration = finiteNumber(track.previewDurationSeconds, DEFAULT_DURATION_SECONDS);
  return {
    start: Math.max(0, finiteNumber(track.previewStartSeconds, DEFAULT_START_SECONDS)),
    duration: duration > 0 ? duration : DEFAULT_DURATION_SECONDS
  };
}

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(finiteNumber(value, 0)));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function ensureStyles() {
  if (document.querySelector("#previewPlayerStyles")) return;
  const style = document.createElement("style");
  style.id = "previewPlayerStyles";
  style.textContent = `
    audio[data-preview-engine]{display:none!important}
    .player-dock:has(.preview-player-controls){grid-template-columns:56px minmax(110px,.8fr) minmax(0,1.7fr) 36px;width:min(760px,calc(100% - 32px))}
    .preview-player-controls{display:grid;grid-template-columns:auto auto minmax(0,1fr);align-items:center;gap:10px;min-width:0;width:100%;overflow:hidden}
    .preview-player-toggle{width:36px;height:36px;border-radius:50%;border:1px solid #a6f000;background:#131313;color:#a6f000;cursor:pointer}
    .preview-player-range{display:block;width:100%;min-width:0;max-width:100%;accent-color:#a6f000}
    .preview-player-time{min-width:76px;color:#b8b8b8;font-size:11px;text-align:left}
    .custom-player{display:block!important}
    .custom-player .preview-player-controls{min-width:0;width:100%}
    @media(max-width:850px){
      .player-dock:has(.preview-player-controls){grid-template-columns:48px 1fr 34px}
      .player-dock .preview-player-controls{grid-column:1/-1;grid-row:2;min-width:0;width:100%}
      .player-dock>.icon-button{grid-column:3;grid-row:1}
    }
    @media(max-width:520px){
      .preview-player-controls{grid-template-columns:auto auto 1fr;gap:7px}
      .preview-player-time{min-width:68px}
    }
  `;
  document.head.appendChild(style);
}

function createControls(audio, container) {
  ensureStyles();
  audio.controls = false;
  audio.hidden = true;
  audio.dataset.previewEngine = "true";
  audio.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
  audio.disableRemotePlayback = true;
  audio.playbackRate = 1;

  const controls = document.createElement("div");
  controls.className = "preview-player-controls";
  controls.innerHTML = `
    <button class="preview-player-toggle" type="button" aria-label="Play preview">▶</button>
    <time class="preview-player-time">0:00 / 0:30</time>
    <input class="preview-player-range" type="range" min="0" max="100" step="0.1" value="0" aria-label="Preview progress">`;
  container.insertBefore(controls, audio);
  return {
    controls,
    toggle: controls.querySelector(".preview-player-toggle"),
    range: controls.querySelector(".preview-player-range"),
    time: controls.querySelector(".preview-player-time")
  };
}

function boundedAudio(audio, ui, callbacks = {}) {
  let start = DEFAULT_START_SECONDS;
  let duration = DEFAULT_DURATION_SECONDS;
  let end = duration;
  let ready = false;

  const usableEnd = () => Number.isFinite(audio.duration) ? Math.min(end, audio.duration) : end;
  const windowLength = () => Math.max(1, usableEnd() - start);
  const update = () => {
    const elapsed = Math.max(0, Math.min(windowLength(), audio.currentTime - start));
    const ratio = Math.min(1, elapsed / windowLength());
    ui.range.value = String(ratio * 100);
    ui.time.textContent = `${formatTime(elapsed)} / ${formatTime(windowLength())}`;
    callbacks.onProgress?.(ratio, elapsed, windowLength());
  };
  const resetButton = () => {
    ui.toggle.textContent = "▶";
    ui.toggle.setAttribute("aria-label", "Play preview");
  };
  const pause = () => {
    audio.pause();
    resetButton();
  };
  const stopAtBoundary = () => {
    pause();
    audio.currentTime = start;
    update();
    callbacks.onStop?.();
  };
  const applyStart = () => {
    const maximum = Number.isFinite(audio.duration) ? Math.max(0, audio.duration - 0.05) : start;
    start = Math.min(start, maximum);
    end = start + duration;
    audio.currentTime = start;
    ready = true;
    update();
  };
  const play = async () => {
    audio.playbackRate = 1;
    const playback = audio.play();
    if (!ready) {
      await new Promise(resolve => {
        if (ready) resolve();
        else audio.addEventListener("loadedmetadata", resolve, { once: true });
      });
    }
    try {
      await playback;
      ui.toggle.textContent = "Ⅱ";
      ui.toggle.setAttribute("aria-label", "Pause preview");
    } catch (error) {
      resetButton();
      throw error;
    }
  };
  const configure = (track, source) => {
    pause();
    const timing = previewTiming(track);
    start = timing.start;
    duration = timing.duration;
    end = start + duration;
    ready = false;
    ui.range.value = "0";
    ui.time.textContent = `0:00 / ${formatTime(duration)}`;
    if (audio.src !== new URL(source, location.href).href) audio.src = source;
    if (audio.readyState >= 1) applyStart();
    else audio.addEventListener("loadedmetadata", applyStart, { once: true });
    audio.load();
  };
  const close = () => {
    pause();
    ready = false;
    audio.removeAttribute("src");
    audio.load();
    ui.range.value = "0";
    callbacks.onClose?.();
  };

  ui.toggle.addEventListener("click", () => {
    if (audio.paused) play().catch(() => callbacks.onStop?.());
    else pause();
  });
  ui.range.addEventListener("input", () => {
    if (!ready) return;
    audio.currentTime = start + Number(ui.range.value) / 100 * windowLength();
    update();
  });
  audio.addEventListener("timeupdate", () => {
    if (!ready) return;
    if (audio.currentTime < start - 0.1) audio.currentTime = start;
    if (audio.currentTime >= usableEnd() - 0.05) {
      stopAtBoundary();
      return;
    }
    update();
  });
  audio.addEventListener("ratechange", () => {
    if (audio.playbackRate !== 1) audio.playbackRate = 1;
  });
  audio.addEventListener("ended", stopAtBoundary);

  return { configure, play, pause, close, isPlaying: () => !audio.paused };
}

export function createPreviewDock({ audio, dock, closeButton, onProgress, onStop, onClose }) {
  const ui = createControls(audio, dock);
  const engine = boundedAudio(audio, ui, { onProgress, onStop, onClose });
  closeButton?.addEventListener("click", () => {
    engine.close();
    dock.hidden = true;
  });
  return {
    start(track, source) {
      engine.configure(track, source);
      dock.hidden = false;
      return engine.play();
    },
    pause: engine.pause,
    close: engine.close,
    isPlaying: engine.isPlaying
  };
}

export function createInlinePreview(audio, track) {
  const existing = audio.nextElementSibling;
  if (existing?.classList.contains("custom-player")) existing.remove();
  const wrapper = document.createElement("div");
  wrapper.className = "custom-player";
  audio.insertAdjacentElement("afterend", wrapper);
  wrapper.appendChild(audio);
  const ui = createControls(audio, wrapper);
  const engine = boundedAudio(audio, ui);
  engine.configure(track, audio.src);
  return engine;
}

const TIMELINE_URL = '/static/timeline.json';
const VIDEO_URL = '/static/videos/total.mp4';

const NODE_SELECTORS = [
  '#content_intro_hero_banner_2 h1',
  '#content_link_1',
  '#content_link_2',
  '#content_link_3',
  '.breadcrumbs-list > li.item:last-child',
  '#content_main_heading_1',
  '#content_main_heading_2',
  '#content_main_richtext_1 p:nth-of-type(1)',
  '#content_main_richtext_1 p:nth-of-type(2)',
  '#content_main_richtext_1 p:nth-of-type(3)',
  '#content_main_richtext_1 p:nth-of-type(4)',
  '#content_main_richtext_1 p:nth-of-type(5)',
  '#content_main_title_1 h2',
  '#content_main_richtext_2 p:nth-of-type(1)',
  '#content_main_richtext_2 p:nth-of-type(2)',
  '#content_main_richtext_2 p:nth-of-type(3)',
  '#content_main_richtext_2 p:nth-of-type(4)',
  '#content_main_richtext_2 p:nth-of-type(5)',
  '#content_main_quote_1',
  '#content_main_quote_2',
  '#content_main_quote_3',
  '#content_main_richtext_3 p',
  '#content_main_title_2 h2',
  '#content_main_heading_3',
  '#content_main_richtext_4 li',
  '#content_main_heading_4',
  '#content_main_richtext_5 li',
  '#content_main_heading_5',
  '#content_main_richtext_6 li',
  '#content_main_richtext_7 p',
  '#content_main_title_3 h2',
  '#content_main_listHorizontal_1 li:nth-child(1)',
  '#content_main_listHorizontal_1 li:nth-child(2)',
  '#content_main_listHorizontal_1 li:nth-child(3)',
  '#content_main_listHorizontal_1 li:nth-child(4)',
];

const DESKTOP_SIZE_STATES = [260, 320, 380];
const MOBILE_SIZE_STATES = [200, 260, 320];
const SPEED_STATES = [1, 1.3, 1.5];
const DEFAULT_SPEED = 1.3;
const PLAY_ICON_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M9 6.5L18 12 9 17.5z"/>
</svg>`;

const PAUSE_ICON_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z"/>
</svg>`;

const CLOSE_ICON_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/>
</svg>`;

const RESIZE_ICON_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 4H4v5M15 20h5v-5M4 4l7 7M20 20l-7-7"/>
</svg>`;

let timeline = null;
let items = [];
let player = null;
let video = null;
let subtitleEl = null;
let progressTrack = null;
let progressFill = null;
let speedButton = null;
let sizeButton = null;
let timeLabel = null;
let subtitleTypingTimer = null;
let subtitleTypingChars = [];
let subtitleTypingIndex = 0;
let currentSizeIndex = 0;
let currentSpeedIndex = SPEED_STATES.indexOf(DEFAULT_SPEED);
let activeIndex = -1;
let lastScrollIndex = -1;
let pendingSeekTime = null;
let isDraggingProgress = false;
let suppressProgressClick = false;
let playerDragState = null;
let suppressVideoClick = false;
let documentClickHandlerAttached = false;
let signLanguageEnabled = (() => {
  try {
    return localStorage.getItem('hsbc-sign-language-enabled') !== 'false';
  } catch (_) {
    return true;
  }
})();
let initPromise = null;

function normalizedText(el) {
  if (!(el instanceof Element)) {
    return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  }
  const clone = el.cloneNode(true);
  clone.querySelectorAll('.visuallyhidden, .sr-only').forEach((node) => node.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

function injectStyles() {
  if (document.getElementById('hsbc-total-player-styles')) return;
  const style = document.createElement('style');
  style.id = 'hsbc-total-player-styles';
  style.textContent = `
.hsbc-total-player,
.hsbc-total-player * {
  box-sizing: border-box;
}
.hsbc-total-player {
  position: fixed;
  right: max(12px, env(safe-area-inset-right));
  bottom: max(12px, env(safe-area-inset-bottom));
  z-index: 2147483000;
  display: none;
  flex-direction: column;
  overflow: hidden;
  width: min(
    var(--hsbc-total-width, 480px),
    calc(100vw - 24px),
    calc(100vh - 180px)
  );
  border-radius: 12px;
  background: #fff;
  border: 1px solid #a9cdec;
  box-shadow: 0 18px 52px rgba(13, 70, 132, 0.24);
  color: #0b3b68;
  font-family: Arial, SimHei, "Microsoft YaHei", "Microsoft JhengHei", Helvetica, sans-serif;
  letter-spacing: 0;
}
.hsbc-total-player.is-open {
  display: flex;
}
.hsbc-total-subtitle {
  position: relative;
  height: 78px;
  overflow-y: auto;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
  color: #222;
  background: #fff;
  border-bottom: 1px solid #d7d7d7;
}
.hsbc-total-subtitle.is-typing::after {
  content: "";
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 3px;
  vertical-align: -0.18em;
  background: #222;
  animation: hsbcTotalCaret 0.75s steps(1, end) infinite;
}
@keyframes hsbcTotalCaret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.hsbc-total-video-wrap {
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  overflow: hidden;
  background: #eaf3fb;
  aspect-ratio: var(--hsbc-total-video-ratio, 1 / 1);
}
.hsbc-total-video-wrap video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #eaf3fb;
}
.hsbc-total-top-left,
.hsbc-total-bottom-right {
  position: absolute;
  z-index: 5;
  display: flex;
  gap: 8px;
}
.hsbc-total-top-left {
  top: 10px;
  left: 10px;
}
.hsbc-total-bottom-right {
  right: 10px;
  bottom: 10px;
}
.hsbc-total-control-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  background: transparent;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.72));
  transition: background 0.18s ease, transform 0.18s ease, opacity 0.18s ease;
}
.hsbc-total-control-btn:hover,
.hsbc-total-control-btn:focus-visible {
  background: rgba(0, 0, 0, 0.14);
  transform: scale(1.06);
  outline: 2px solid rgba(0, 0, 0, 0.24);
  outline-offset: 2px;
}
.hsbc-total-control-btn svg {
  width: 20px;
  height: 20px;
  display: block;
}
.hsbc-total-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 7px 10px;
  background: #fff;
  border-top: 1px solid #d7d7d7;
}
.hsbc-total-speed {
  display: inline-flex;
  flex: 0 0 auto;
  width: 52px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 14px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: #0067b8;
  background: #eef4fa;
  box-shadow: inset 0 0 0 1px #c7d8e6;
  font: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  transition: background 0.18s ease, color 0.18s ease;
}
.hsbc-total-speed:hover {
  color: #003d6b;
  background: #dcebf5;
}
.hsbc-total-speed:focus-visible {
  outline: 2px solid #0a78c4;
  outline-offset: 2px;
}
.hsbc-total-progress {
  position: relative;
  flex: 1 1 auto;
  min-width: 48px;
  height: 28px;
  display: flex;
  align-items: center;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}
.hsbc-total-track {
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #d3e5f2;
  overflow: visible;
}
.hsbc-total-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #0067b8, #35a7ff);
  pointer-events: none;
}
.hsbc-total-fill::after {
  content: "";
  position: absolute;
  right: -7px;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #0067b8;
  box-shadow: 0 1px 5px rgba(0, 103, 184, 0.32);
  transform: translateY(-50%);
}
.hsbc-total-time {
  flex: 0 0 auto;
  min-width: 86px;
  text-align: right;
  font-size: 11px;
  color: #386e9b;
  font-variant-numeric: tabular-nums;
}
.hsbc-total-sentence {
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.4s ease, outline-color 0.4s ease, box-shadow 0.4s ease;
}
.hsbc-total-sentence:hover {
  background-color: #fff4c2 !important;
}
.hsbc-total-sentence:focus-visible {
  outline: 2px solid #1795de;
  outline-offset: 2px;
}
.hsbc-total-sentence.hsbc-total-active {
  outline: 2px solid #0067b8 !important;
  outline-offset: 2px;
  background-color: #dcecff !important;
  box-shadow: 0 0 0 4px rgba(0, 103, 184, 0.14);
}
.hsbc-total-sentence-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  margin-left: 7px;
  border-radius: 50%;
  vertical-align: -0.34em;
  color: #fff;
  background: #0067b8;
  box-shadow: 0 2px 7px rgba(0, 103, 184, 0.34);
  opacity: 0;
  visibility: hidden;
  transform: scale(0.55);
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease, background-color 0.3s ease, visibility 0.22s ease;
}
.hsbc-total-sentence:hover .hsbc-total-sentence-icon,
.hsbc-total-sentence:focus-visible .hsbc-total-sentence-icon,
.hsbc-total-sentence.is-revealed .hsbc-total-sentence-icon,
.hsbc-total-sentence.hsbc-total-active .hsbc-total-sentence-icon {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
}
.hsbc-total-sentence.hsbc-total-active .hsbc-total-sentence-icon {
  background: #0a72c6;
  box-shadow: 0 2px 8px rgba(10, 114, 198, 0.4);
}
.hsbc-total-sentence-icon svg {
  width: 15px;
  height: 15px;
  display: block;
  margin-left: 1px;
}
.hsbc-total-sentence-icon.is-disabled {
  display: none !important;
}
@media (hover: none), (pointer: coarse) {
  .hsbc-total-sentence:hover .hsbc-total-sentence-icon {
    opacity: 0;
    visibility: hidden;
    transform: scale(0.55);
  }
  .hsbc-total-sentence.is-revealed .hsbc-total-sentence-icon,
  .hsbc-total-sentence.hsbc-total-active .hsbc-total-sentence-icon {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }
}
@media (max-width: 600px) {
  .hsbc-total-player {
    right: 8px;
    bottom: 8px;
    width: min(
      var(--hsbc-total-width, 480px),
      calc(100vw - 16px),
      calc(100vh - 164px)
    );
    border-radius: 10px;
  }
  .hsbc-total-subtitle {
    height: 64px;
    padding: 8px 12px;
    font-size: 14px;
  }
  .hsbc-total-controls {
    gap: 6px;
    min-height: 40px;
    padding: 6px 8px;
  }
  .hsbc-total-speed {
    width: 48px;
    height: 26px;
    font-size: 11px;
  }
  .hsbc-total-time {
    min-width: 68px;
    font-size: 10px;
  }
  .hsbc-total-control-btn {
    width: 34px;
    height: 34px;
  }
}

/* ADCC floating-player style overrides */
.hsbc-total-player {
  overflow: visible;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft JhengHei", "Microsoft YaHei", sans-serif;
  width: min(
    var(--hsbc-total-width, 320px),
    calc(100vw - 24px),
    calc(100vh - 120px)
  );
}
.hsbc-total-subtitle {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  height: auto;
  max-height: 300px;
  margin-bottom: 8px;
  padding: 12px 16px;
  overflow-y: auto;
  background: #e0e0e0;
  color: #000;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.8;
  border: 0;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  white-space: pre-wrap;
  word-break: break-all;
}
.hsbc-total-subtitle.has-text {
  display: block;
  touch-action: none;
}
.hsbc-total-subtitle.is-typing::after {
  content: none;
}
.hsbc-total-video-wrap {
  touch-action: none;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  background: #f0f0f0;
}
.hsbc-total-video-wrap video {
  background: #f0f0f0;
}
.hsbc-total-controls {
  gap: 8px;
  min-height: 44px;
  padding: 7px 10px;
  background: #fafafa;
  border-top: 1px solid #eee;
}
.hsbc-total-speed {
  width: auto;
  min-width: 56px;
  height: auto;
  padding: 6px 12px;
  border: 0;
  border-radius: 6px;
  background: none;
  box-shadow: none;
  color: #888;
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
}
.hsbc-total-speed:hover {
  background: #f0f0f0;
  color: #1a1a1a;
}
.hsbc-total-progress {
  height: 28px;
}
.hsbc-total-track {
  height: 5px;
  border-radius: 3px;
  background: #e8e8e8;
}
.hsbc-total-fill {
  border-radius: 3px;
  background: #1a1a1a;
}
.hsbc-total-fill::after {
  content: none;
}
.hsbc-total-time {
  color: #999;
  font-size: 12px;
}
.hsbc-total-control-btn {
  width: 32px;
  height: 32px;
  color: #fff;
  background: transparent;
  border: 0;
  border-radius: 6px;
  box-shadow: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.72));
}
.hsbc-total-control-btn:hover,
.hsbc-total-control-btn:focus-visible {
  background: rgba(0, 0, 0, 0.55);
  transform: scale(1.04);
  outline: 0;
}
.hsbc-total-control-btn svg {
  width: 19px;
  height: 19px;
}
.hsbc-total-sentence-icon {
  display: inline-flex !important;
  width: 24px;
  height: 24px;
  margin-left: 6px;
  background: rgba(0, 0, 0, 0.45);
  box-shadow: none;
  vertical-align: middle;
  line-height: 1;
  transform-origin: center;
}
.hsbc-total-sentence.hsbc-total-active .hsbc-total-sentence-icon {
  background: #1a1a1a;
  box-shadow: none;
}
.hsbc-total-sentence-icon svg {
  width: 13px;
  height: 13px;
  margin: 0;
  display: block;
}
@media (max-width: 768px) {
  .hsbc-total-player {
    right: 4px;
    bottom: 4px;
    border-radius: 10px;
    width: min(
      var(--hsbc-total-width, 320px),
      calc(100vw - 8px),
      calc(100vh - 108px)
    );
  }
  .hsbc-total-subtitle {
    font-size: 13px;
    padding: 8px 10px;
    line-height: 1.6;
    margin-bottom: 6px;
    border-radius: 6px;
  }
  .hsbc-total-controls {
    min-height: 40px;
    padding: 6px 8px;
  }
  .hsbc-total-speed {
    min-width: 46px;
    padding: 5px 10px;
    font-size: 16px;
  }
  .hsbc-total-time {
    min-width: 60px;
    font-size: 11px;
  }
  .hsbc-total-control-btn {
    width: 30px;
    height: 30px;
  }
}
`;
  document.head.appendChild(style);
}

function formatTime(value) {
  if (!Number.isFinite(value)) return '0:00';
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatSpeed(value) {
  return `${value.toFixed(1)}x`;
}

function iconTemplate() {
  return `<span class="hsbc-total-sentence-icon" aria-hidden="true">${PLAY_ICON_SVG}</span>`;
}

function stopSubtitleTyping() {
  if (subtitleTypingTimer !== null) {
    clearInterval(subtitleTypingTimer);
    subtitleTypingTimer = null;
  }
  subtitleTypingChars = [];
  subtitleTypingIndex = 0;
  if (subtitleEl) subtitleEl.classList.remove('is-typing');
}

function startSubtitleTyping(text, durationSeconds) {
  stopSubtitleTyping();
  if (!subtitleEl) return;
  subtitleTypingChars = Array.from(text || '');
  subtitleEl.textContent = '';
  if (!subtitleTypingChars.length) {
    subtitleEl.classList.remove('has-text');
    return;
  }
  subtitleEl.classList.add('has-text');
  subtitleEl.classList.add('is-typing');
  const duration = Number.isFinite(durationSeconds) && durationSeconds > 0
    ? durationSeconds
    : Math.max(4, subtitleTypingChars.length * 0.1);
  const interval = Math.max(26, (duration * 280) / subtitleTypingChars.length);
  subtitleTypingTimer = setInterval(() => {
    subtitleTypingIndex = Math.min(subtitleTypingChars.length, subtitleTypingIndex + 1);
    subtitleEl.textContent = subtitleTypingChars.slice(0, subtitleTypingIndex).join('');
    if (subtitleTypingIndex >= subtitleTypingChars.length) {
      clearInterval(subtitleTypingTimer);
      subtitleTypingTimer = null;
      subtitleEl.classList.remove('is-typing');
    }
  }, interval);
}

function setActiveItem(index, scroll = false) {
  if (activeIndex === index && items[activeIndex]?.el) {
    if (scroll) scrollToSentence(index);
    return;
  }
  if (items[activeIndex]) {
    items[activeIndex].el.classList.remove('hsbc-total-active');
    items[activeIndex].el.classList.remove('is-revealed');
    const oldIcon = items[activeIndex].el.querySelector('.hsbc-total-sentence-icon');
    if (oldIcon) oldIcon.innerHTML = PLAY_ICON_SVG;
  }
  activeIndex = index;
  if (!items[activeIndex]) {
    if (subtitleEl) subtitleEl.textContent = '';
    subtitleEl?.classList.remove('has-text');
    stopSubtitleTyping();
    return;
  }
  items[activeIndex].el.classList.add('hsbc-total-active');
  const icon = items[activeIndex].el.querySelector('.hsbc-total-sentence-icon');
  if (icon) icon.innerHTML = PAUSE_ICON_SVG;
  startSubtitleTyping(items[activeIndex].text, items[activeIndex].node?.duration);
  if (scroll) scrollToSentence(index);
}

function scrollToSentence(index) {
  const item = items[index];
  if (!item?.el) return;
  if (lastScrollIndex === index) return;
  lastScrollIndex = index;
  item.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function indexAtTime(currentTime) {
  if (!timeline?.nodes?.length) return -1;
  const nodes = timeline.nodes;
  if (currentTime >= timeline.total_duration - 0.05) {
    return nodes.length - 1;
  }
  for (let i = 0; i < nodes.length; i += 1) {
    if (currentTime >= nodes[i].start - 0.05 && currentTime < nodes[i].end) {
      return i;
    }
  }
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  nodes.forEach((node, index) => {
    const mid = (node.start + node.end) / 2;
    const distance = Math.abs(currentTime - mid);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });
  return nearestIndex;
}

function updateProgress(currentTime) {
  if (!timeline || !timeline.total_duration) return;
  const percent = Math.max(0, Math.min(100, (currentTime / timeline.total_duration) * 100));
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (timeLabel) {
    timeLabel.textContent = `${formatTime(currentTime)} / ${formatTime(timeline.total_duration)}`;
  }
}

function progressTimeFromEvent(event) {
  if (!progressTrack || !timeline) return 0;
  const rect = progressTrack.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  return ratio * timeline.total_duration;
}

function seekFromProgressEvent(event, commit) {
  if (!timeline || !video) return;
  event.preventDefault();
  const targetTime = progressTimeFromEvent(event);
  seekToTime(targetTime, commit);
  if (commit) {
    video.play().catch(() => {});
  }
}

function updateSpeedButtons() {
  if (!speedButton) return;
  speedButton.textContent = formatSpeed(SPEED_STATES[currentSpeedIndex]);
  speedButton.setAttribute('aria-label', `Playback speed ${formatSpeed(SPEED_STATES[currentSpeedIndex])}`);
  if (video) video.playbackRate = SPEED_STATES[currentSpeedIndex];
}

function defaultSizeIndex() {
  return 1;
}

function activeSizeStates() {
  return window.matchMedia('(max-width: 768px)').matches ? MOBILE_SIZE_STATES : DESKTOP_SIZE_STATES;
}

function applySize() {
  if (!player) return;
  const states = activeSizeStates();
  player.style.setProperty('--hsbc-total-width', `${states[currentSizeIndex]}px`);
  const nextIndex = (currentSizeIndex + 1) % states.length;
  const isEnlarge = states[nextIndex] > states[currentSizeIndex];
  if (sizeButton) {
    sizeButton.title = isEnlarge ? 'Make larger' : 'Make smaller';
    sizeButton.setAttribute('aria-label', isEnlarge ? 'Make larger' : 'Make smaller');
  }
}

function toggleSize() {
  currentSizeIndex = (currentSizeIndex + 1) % activeSizeStates().length;
  applySize();
}

function speedControlHtml() {
  return `<button class="hsbc-total-speed" id="hsbc-total-speed" type="button" title="Playback speed" aria-label="Playback speed ${formatSpeed(DEFAULT_SPEED)}">${formatSpeed(DEFAULT_SPEED)}</button>`;
}

function canDragPlayerFrom(event) {
  if (!player || event.button !== undefined && event.button !== 0) return false;
  if (event.target.closest('button, a, input, select, textarea')) return false;
  if (event.target.closest('.hsbc-total-controls, .hsbc-total-progress, .hsbc-total-speed, .hsbc-total-control-btn')) return false;
  return Boolean(event.target.closest('.hsbc-total-video-wrap, .hsbc-total-subtitle'));
}

function startPlayerDrag(event) {
  if (!player || playerDragState) return;
  if (!canDragPlayerFrom(event)) return;
  const rect = player.getBoundingClientRect();
  const subtitleHeight = subtitleEl?.classList.contains('has-text') && subtitleEl.offsetHeight > 0
    ? subtitleEl.offsetHeight + 8
    : 0;
  playerDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: rect.left,
    startTop: rect.top,
    subtitleHeight,
    didDrag: false,
  };
  player.style.transition = 'none';
  player.style.right = 'auto';
  player.style.bottom = 'auto';
  event.preventDefault();
}

function movePlayerDrag(event) {
  if (!playerDragState || !player) return;
  if (playerDragState.pointerId !== undefined && event.pointerId !== playerDragState.pointerId) return;
  const dx = event.clientX - playerDragState.startX;
  const dy = event.clientY - playerDragState.startY;
  if (Math.abs(dx) + Math.abs(dy) > 3) playerDragState.didDrag = true;
  const maxLeft = Math.max(0, window.innerWidth - player.offsetWidth);
  const maxTop = Math.max(playerDragState.subtitleHeight, window.innerHeight - player.offsetHeight);
  const left = Math.max(0, Math.min(maxLeft, playerDragState.startLeft + dx));
  const top = Math.max(playerDragState.subtitleHeight, Math.min(maxTop, playerDragState.startTop + dy));
  player.style.left = `${left}px`;
  player.style.top = `${top}px`;
  event.preventDefault();
}

function endPlayerDrag() {
  if (!playerDragState) return;
  if (playerDragState.didDrag) {
    suppressVideoClick = true;
    setTimeout(() => {
      suppressVideoClick = false;
    }, 0);
  }
  playerDragState = null;
  if (player) player.style.transition = '';
}

function ensurePlayerDom() {
  if (player) return;
  injectStyles();
  currentSizeIndex = defaultSizeIndex();
  player = document.createElement('div');
  player.id = 'hsbc-total-player';
  player.className = 'hsbc-total-player hidden-to-sign-language-player';
  player.setAttribute('role', 'dialog');
  player.setAttribute('aria-label', 'Sign language video player');
  player.innerHTML = `
    <div class="hsbc-total-subtitle" id="hsbc-total-subtitle"></div>
    <div class="hsbc-total-video-wrap">
      <video id="hsbc-total-video" playsinline preload="metadata" controlsList="nodownload nofullscreen noremoteplayback"></video>
      <div class="hsbc-total-top-left">
        <button id="hsbc-total-close" class="hsbc-total-control-btn" type="button" title="Close" aria-label="Close">${CLOSE_ICON_SVG}</button>
      </div>
      <div class="hsbc-total-bottom-right">
        <button id="hsbc-total-resize" class="hsbc-total-control-btn" type="button" title="Resize" aria-label="Resize">${RESIZE_ICON_SVG}</button>
      </div>
    </div>
    <div class="hsbc-total-controls">
      ${speedControlHtml()}
      <div class="hsbc-total-progress" id="hsbc-total-progress" role="slider" aria-label="Video progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="hsbc-total-track">
          <div class="hsbc-total-fill" id="hsbc-total-fill"></div>
        </div>
      </div>
      <div class="hsbc-total-time" id="hsbc-total-time">0:00 / 0:00</div>
    </div>
  `;
  document.body.appendChild(player);
  player.addEventListener('pointerdown', startPlayerDrag);
  window.addEventListener('pointermove', movePlayerDrag);
  window.addEventListener('pointerup', endPlayerDrag);
  window.addEventListener('pointercancel', endPlayerDrag);

  subtitleEl = document.getElementById('hsbc-total-subtitle');
  progressTrack = document.querySelector('.hsbc-total-track');
  progressFill = document.getElementById('hsbc-total-fill');
  speedButton = document.getElementById('hsbc-total-speed');
  sizeButton = document.getElementById('hsbc-total-resize');
  timeLabel = document.getElementById('hsbc-total-time');
  video = document.getElementById('hsbc-total-video');

  video.innerHTML = `<source src="${VIDEO_URL}" type="video/mp4">`;
  video.load();
  video.playbackRate = SPEED_STATES[currentSpeedIndex];
  applySize();
  updateSpeedButtons();

  video.addEventListener('loadedmetadata', () => {
    if (video.videoWidth && video.videoHeight) {
      player.style.setProperty('--hsbc-total-video-ratio', `${video.videoWidth} / ${video.videoHeight}`);
    }
    if (timeline?.total_duration && timeLabel) {
      timeLabel.textContent = `${formatTime(0)} / ${formatTime(timeline.total_duration)}`;
    }
    if (pendingSeekTime !== null) {
      try {
        video.currentTime = pendingSeekTime;
      } catch (_) {}
      pendingSeekTime = null;
    }
  });
  video.addEventListener('timeupdate', () => {
    if (!player?.classList.contains('is-open')) return;
    const nextIndex = indexAtTime(video.currentTime);
    if (nextIndex !== activeIndex) setActiveItem(nextIndex, false);
    updateProgress(video.currentTime);
  });
  video.addEventListener('seeked', () => {
    updateProgress(video.currentTime);
  });
  video.addEventListener('ended', () => {
    setActiveItem(items.length - 1, false);
  });
  video.addEventListener('click', () => {
    if (!video) return;
    if (suppressVideoClick) {
      suppressVideoClick = false;
      return;
    }
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  document.getElementById('hsbc-total-close').addEventListener('click', hidePlayer);
  sizeButton.addEventListener('click', toggleSize);

  speedButton.addEventListener('click', () => {
    currentSpeedIndex = (currentSpeedIndex + 1) % SPEED_STATES.length;
    updateSpeedButtons();
  });

  const progress = document.getElementById('hsbc-total-progress');
  progress.addEventListener('pointerdown', (event) => {
    if (!timeline || !video) return;
    isDraggingProgress = true;
    progress.setPointerCapture(event.pointerId);
    seekFromProgressEvent(event, false);
  });
  progress.addEventListener('pointermove', (event) => {
    if (!isDraggingProgress) return;
    seekFromProgressEvent(event, false);
  });
  progress.addEventListener('pointerup', (event) => {
    if (!isDraggingProgress) return;
    isDraggingProgress = false;
    suppressProgressClick = true;
    setTimeout(() => {
      suppressProgressClick = false;
    }, 0);
    seekFromProgressEvent(event, true);
  });
  progress.addEventListener('pointercancel', () => {
    isDraggingProgress = false;
  });
  progress.addEventListener('click', (event) => {
    if (isDraggingProgress || suppressProgressClick || !timeline || !video) return;
    seekFromProgressEvent(event, true);
  });

  player.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      hidePlayer();
    }
  });
}

function seekToTime(time, scroll = false) {
  if (!video || !timeline) return;
  const targetTime = Math.max(0, Math.min(timeline.total_duration, time));
  const index = indexAtTime(targetTime);
  pendingSeekTime = targetTime;
  try {
    if (video.readyState >= 1) {
      video.currentTime = targetTime;
      pendingSeekTime = null;
    }
  } catch (_) {}
  setActiveItem(index, scroll);
  updateProgress(targetTime);
}

function seekToIndex(index) {
  if (!timeline || !timeline.nodes[index]) return;
  seekToTime(timeline.nodes[index].start + 0.02, true);
  if (video) {
    video.play().catch(() => {});
  }
}

function revealTouchSentence(sentence) {
  document.querySelectorAll('.hsbc-total-sentence.is-revealed').forEach((el) => {
    if (el !== sentence) el.classList.remove('is-revealed');
  });
  if (sentence) sentence.classList.add('is-revealed');
}

function showPlayer(index) {
  ensurePlayerDom();
  if (!player) return;
  player.classList.add('is-open');
  if (video) video.playbackRate = SPEED_STATES[currentSpeedIndex];
  setActiveItem(index, true);
}

export function hidePlayer() {
  if (player) {
    player.classList.remove('is-open');
    if (video) video.pause();
  }
  stopSubtitleTyping();
  if (subtitleEl) subtitleEl.textContent = '';
  subtitleEl?.classList.remove('has-text');
  revealTouchSentence(null);
  clearAllHighlights();
}

function addSentenceIcon(item) {
  if (!item?.el || item.el.querySelector('.hsbc-total-sentence-icon')) return;
  item.el.insertAdjacentHTML('beforeend', iconTemplate());
}

function attachSentenceInteraction(item, index) {
  if (!item?.el) return;
  item.el.classList.add('hsbc-total-sentence');
  item.el.dataset.hsbcTotalNode = String(index);
  item.el.setAttribute('tabindex', '0');
  item.el.setAttribute('role', 'button');
  item.el.setAttribute('aria-label', `Play sign language video: ${item.text}`);
  item.el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      event.stopPropagation();
      if (!signLanguageEnabled) return;
      revealTouchSentence(item.el);
      showPlayer(index);
      seekToIndex(index);
    }
  });
}

function setupSentenceClickDelegation() {
  if (documentClickHandlerAttached) return;
  documentClickHandlerAttached = true;
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const sentence = target?.closest?.('[data-hsbc-total-node]');
      if (!sentence) return;
      if (!signLanguageEnabled) return;
      const index = Number(sentence.dataset.hsbcTotalNode);
      if (!Number.isInteger(index) || !items[index]) return;
      event.preventDefault();
      event.stopPropagation();
      const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      if (coarsePointer && !sentence.classList.contains('is-revealed') && !sentence.classList.contains('hsbc-total-active')) {
        revealTouchSentence(sentence);
        return;
      }
      revealTouchSentence(sentence);
      showPlayer(index);
      seekToIndex(index);
    },
    true,
  );
}

function updateSentenceIconsVisibility() {
  document.querySelectorAll('.hsbc-total-sentence-icon').forEach((icon) => {
    if (signLanguageEnabled) {
      icon.classList.remove('is-disabled');
      icon.style.removeProperty('display');
    } else {
      icon.classList.add('is-disabled');
      icon.style.display = 'none';
    }
  });
  document.querySelectorAll('.hsbc-total-sentence').forEach((el) => {
    el.style.cursor = signLanguageEnabled ? 'pointer' : '';
    if (!signLanguageEnabled) {
      el.classList.remove('is-revealed');
    }
  });
}

function mapNodesToPage(nodes) {
  items = nodes.map((node, index) => {
    const el = document.querySelector(NODE_SELECTORS[index]);
    if (!el) return null;
    return {
      node,
      el,
      text: normalizedText(el) || node.text || node.index,
    };
  });

  const missing = items.map((item, index) => item ? null : index).filter((value) => value !== null);
  if (missing.length > 0) {
    console.warn('Missing total-video node selectors:', missing);
    items = items.filter(Boolean);
  }

  items.forEach((item, index) => {
    addSentenceIcon(item);
    attachSentenceInteraction(item, index);
  });
  setupSentenceClickDelegation();
  updateSentenceIconsVisibility();
}

async function initialize() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    injectStyles();
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }
    const response = await fetch(TIMELINE_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Timeline fetch failed: ${response.status}`);
    }
    timeline = await response.json();
    ensurePlayerDom();
    mapNodesToPage(timeline.nodes);
    updateProgress(0);
    setActiveItem(-1, false);
  })().catch((error) => {
    initPromise = null;
    console.error('Unable to initialize total video player:', error);
  });
  return initPromise;
}

export function addInteractiveHighlightSequence() {
  return initialize();
}

export function clearAllHighlights() {
  document.querySelectorAll('.hsbc-total-active').forEach((el) => {
    el.classList.remove('hsbc-total-active');
    const icon = el.querySelector('.hsbc-total-sentence-icon');
    if (icon) icon.innerHTML = PLAY_ICON_SVG;
  });
  activeIndex = -1;
}

export function enableSignLanguage() {
  signLanguageEnabled = true;
  updateSentenceIconsVisibility();
}

export function disableSignLanguage() {
  signLanguageEnabled = false;
  updateSentenceIconsVisibility();
  clearAllHighlights();
  hidePlayer();
}

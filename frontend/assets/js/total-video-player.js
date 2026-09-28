function versionedConfig(timelineUrl, videoUrl) {
  const configuredVersion = (version, revision) => {
    const versionedVideoUrl = videoUrl
      .replace(/\.mp4(\?.*)?$/i, `_${version}.mp4`)
      .concat(`?v=${revision}`);
    return {
      timelineUrl: timelineUrl.replace(/\.json$/i, `-${version}.json`),
      videoUrl: versionedVideoUrl,
    };
  };
  return {
    timelineUrl,
    videoUrl,
    versions: {
      C: { timelineUrl, videoUrl },
      D: configuredVersion('D', '20260928d'),
      E: configuredVersion('E', '20260928e'),
    },
  };
}

const PAGE_CONFIGS = {
  '/instant-messaging-app-scams': {
    ...versionedConfig(
      '/static/timelines/instant-messaging-app-scams.json',
      '/static/videos/page-3-merged_1080x1920_pad.mp4?v=20260924opt',
    ),
    useNodeSelectors: true,
    nodeSelectors: ['#par-introduction_articleTitle_1 h1'],
    textMatchFallback: true,
  },
  '/job-scams': {
    ...versionedConfig(
      '/static/timelines/job-scams.json',
      '/static/videos/page-4-merged_1080x1920_pad.mp4?v=20260924opt',
    ),
    useNodeSelectors: true,
    nodeSelectors: ['#par-introduction_articleTitle_1 h1'],
    textMatchFallback: true,
  },
  '/investment-scams': {
    ...versionedConfig(
      '/static/timelines/investment-scams.json',
      '/static/videos/page-5-merged_1080x1920_pad.mp4?v=20260924opt',
    ),
    useNodeSelectors: true,
    nodeSelectors: ['#par-introduction_articleTitle_1 h1'],
    textMatchFallback: true,
  },
  '/prevent-fraud': {
    ...versionedConfig(
      '/static/timelines/prevent-fraud.json',
      '/static/videos/page-6-merged_1080x1920_pad.mp4?v=20260924opt',
    ),
    useNodeSelectors: true,
    nodeSelectors: ['#par-introduction_articleTitle_1 h1'],
    textMatchFallback: true,
  },
  '/romance-scams': {
    ...versionedConfig(
      '/static/timelines/romance-scams.json',
      '/static/videos/page-7-merged_1080x1920_pad.mp4?v=20260924opt',
    ),
    useNodeSelectors: true,
    nodeSelectors: ['#par-introduction_articleTitle_1 h1'],
    textMatchFallback: true,
  },
  '/passwords': {
    ...versionedConfig(
      '/static/timelines/passwords.json',
      '/static/videos/page-8-merged_1080x1920_pad.mp4?v=20260924opt',
    ),
    useNodeSelectors: true,
    nodeSelectors: ['#par-introduction_articleTitle_1 h1'],
    textMatchFallback: true,
  },
};

function normalizedRoute(pathname) {
  return pathname
    .replace(/\/+$/, '')
    .replace(/\/(en|sc)$/i, '')
    || '/';
}

const PAGE_CONFIG =
  window.HSBC_TOTAL_VIDEO_CONFIG
  || PAGE_CONFIGS[normalizedRoute(window.location.pathname)]
  || {};
const TIMELINE_URL = PAGE_CONFIG.timelineUrl || '/static/timeline.json';
const VIDEO_URL = PAGE_CONFIG.videoUrl || '/static/videos/total.mp4';
const VIDEO_VERSIONS = PAGE_CONFIG.versions || null;
const VIDEO_VERSION_ORDER = ['C', 'D', 'E'];
const USE_NODE_SELECTORS = PAGE_CONFIG.useNodeSelectors !== false;
const TEXT_MATCH_FALLBACK = PAGE_CONFIG.textMatchFallback === true;

const NODE_SELECTORS = PAGE_CONFIG.nodeSelectors || [
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
let versionButton = null;
let sizeButton = null;
let timeLabel = null;
let subtitleTypingTimer = null;
let subtitleTypingChars = [];
let subtitleTypingIndex = 0;
let currentSizeIndex = 0;
let currentSpeedIndex = SPEED_STATES.indexOf(DEFAULT_SPEED);
let currentVideoVersion = 'C';
let activeIndex = -1;
let lastScrollIndex = -1;
let pendingSeekTime = null;
let pendingPlayAfterVersionSwitch = false;
let isDraggingProgress = false;
let suppressProgressClick = false;
let playerDragState = null;
let suppressVideoClick = false;
let documentClickHandlerAttached = false;
let videoSourceUrl = null;
let versionAvailabilityRequest = 0;
let pendingPlayRequest = false;
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

function normalizedMatchText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/况/g, '況')
    .replace(/户/g, '戶')
    .replace(/帐/g, '帳')
    .replace(/账/g, '賬')
    .replace(/骗/g, '騙')
    .replace(/财/g, '財')
    .replace(/务/g, '務')
    .replace(/转/g, '轉')
    .replace(/资/g, '資')
    .replace(/讯/g, '訊')
    .replace(/荀/g, '筍')
    .replace(/[\s\u00a0"'“”‘’.,，。！？!?;；:：()（）\[\]【】\-–—_]+/g, '');
}

function isVisibleTextElement(el) {
  if (!(el instanceof Element) || !el.isConnected) return false;
  if (el.closest('.hidden-to-sign-language-player, .visuallyhidden, .sr-only, [hidden]')) {
    return false;
  }
  const style = window.getComputedStyle(el);
  return (
    style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0
    && el.getClientRects().length > 0
  );
}

function findTextMatch(node, usedElements) {
  const wanted = [node.text, node.text_en, node.text_sc]
    .map(normalizedMatchText)
    .filter((value) => value.length >= 2);
  if (wanted.length === 0) return null;

  const scopes = [
    document.querySelector('main'),
    document.querySelector('article'),
    document.body,
  ].filter(Boolean);
  const selector =
    'h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,figcaption,td,th,div,span,strong';

  for (const scope of scopes) {
    const elements = Array.from(scope.querySelectorAll(selector)).filter(isVisibleTextElement);
    for (const target of wanted) {
      const exact = elements
        .filter((el) => {
          if (usedElements.has(el)) return false;
          return normalizedMatchText(normalizedText(el)) === target;
        })
        .sort(
          (a, b) =>
            a.querySelectorAll('*').length - b.querySelectorAll('*').length,
        )[0];
      if (exact) return exact;
    }
  }

  for (const scope of scopes) {
    const elements = Array.from(scope.querySelectorAll(selector)).filter(isVisibleTextElement);
    for (const target of wanted) {
      if (target.length < 12) continue;
      const partial = elements
        .filter((el) => {
          if (usedElements.has(el)) return false;
          const value = normalizedMatchText(normalizedText(el));
          return value.length >= 4
            && (value.startsWith(target) || target.startsWith(value));
        })
        .sort((a, b) => {
          const aValue = normalizedMatchText(normalizedText(a));
          const bValue = normalizedMatchText(normalizedText(b));
          const aStartsWithTarget = aValue.startsWith(target);
          const bStartsWithTarget = bValue.startsWith(target);
          if (aStartsWithTarget !== bStartsWithTarget) {
            return aStartsWithTarget ? -1 : 1;
          }
          if (aValue.length !== bValue.length) {
            return aStartsWithTarget
              ? aValue.length - bValue.length
              : bValue.length - aValue.length;
          }
          return a.querySelectorAll('*').length - b.querySelectorAll('*').length;
        })[0];
      if (partial) return partial;
    }
  }

  for (const scope of scopes) {
    const elements = Array.from(scope.querySelectorAll(selector)).filter(isVisibleTextElement);
    for (const target of wanted) {
      if (target.length < 12) continue;
      const containing = elements
        .filter((el) => {
          if (usedElements.has(el)) return false;
          return normalizedMatchText(normalizedText(el)).includes(target);
        })
        .sort((a, b) => {
          const aLength = normalizedMatchText(normalizedText(a)).length;
          const bLength = normalizedMatchText(normalizedText(b)).length;
          if (aLength !== bLength) return aLength - bLength;
          return a.querySelectorAll('*').length - b.querySelectorAll('*').length;
        })[0];
      if (containing) return containing;
    }
  }

  return null;
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
  aspect-ratio: 1 / 1;
}
.hsbc-total-video-wrap video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
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
.hsbc-total-version {
  width: 42px;
}
.hsbc-total-version.is-unavailable {
  opacity: 0.55;
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
    requestVideoPlayback();
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

function versionControlHtml() {
  if (!VIDEO_VERSIONS || Object.keys(VIDEO_VERSIONS).length < 2) return '';
  return '<button class="hsbc-total-speed hsbc-total-version" id="hsbc-total-version" type="button" title="Switch to D version" aria-label="Video version C">C</button>';
}

function ensureVideoSource(config) {
  const nextUrl = config?.videoUrl || VIDEO_URL;
  if (!video || videoSourceUrl === nextUrl) return;
  videoSourceUrl = nextUrl;
  video.pause();
  video.removeAttribute('src');
  video.innerHTML = '';
  video.setAttribute('preload', 'none');
  video.src = nextUrl;
  video.load();
  video.playbackRate = SPEED_STATES[currentSpeedIndex];
}

function requestVideoPlayback() {
  if (!video) return;
  pendingPlayRequest = true;
  const playPromise = video.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
}

function retryPendingPlayback() {
  if (!pendingPlayRequest || !video) return;
  const playPromise = video.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
}

async function versionResourcesAvailable(version) {
  if (version === 'C') return true;
  const config = VIDEO_VERSIONS?.[version];
  if (!config) return false;
  const [timelineResponse, videoResponse] = await Promise.all([
    fetch(config.timelineUrl, { method: 'HEAD', cache: 'no-store' }),
    fetch(config.videoUrl, { method: 'HEAD', cache: 'no-store' }),
  ]);
  return timelineResponse.ok && videoResponse.ok;
}

async function findNextAvailableVersion() {
  const currentIndex = VIDEO_VERSION_ORDER.indexOf(currentVideoVersion);
  if (currentIndex < 0) return null;
  for (let offset = 1; offset < VIDEO_VERSION_ORDER.length; offset += 1) {
    const candidate =
      VIDEO_VERSION_ORDER[(currentIndex + offset) % VIDEO_VERSION_ORDER.length];
    if (VIDEO_VERSIONS?.[candidate] && await versionResourcesAvailable(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function refreshVersionButton() {
  if (!versionButton) return;
  const requestId = ++versionAvailabilityRequest;
  const nextVersion = await findNextAvailableVersion();
  if (requestId !== versionAvailabilityRequest || !versionButton) return;
  versionButton.dataset.nextVersion = nextVersion || '';
  versionButton.title = nextVersion
    ? `Switch to ${nextVersion} version`
    : 'No other video version available';
}

async function switchVideoVersion(version) {
  if (!VIDEO_VERSIONS?.[version] || version === currentVideoVersion || !video) {
    return;
  }
  if (version !== 'C' && !(await versionResourcesAvailable(version))) {
    versionButton?.classList.add('is-unavailable');
    if (versionButton) versionButton.title = `Version ${version} is not available yet`;
    setTimeout(() => versionButton?.classList.remove('is-unavailable'), 1200);
    return;
  }

  const config = VIDEO_VERSIONS[version];
  const response = await fetch(config.timelineUrl, { cache: 'no-store' });
  if (!response.ok) return;

  const previousActiveIndex = activeIndex;
  const previousNodeKey = items[activeIndex]?.node?.index || null;
  const wasPlaying = Boolean(
    player?.classList.contains('is-open') && video && !video.paused,
  );

  timeline = await response.json();
  const nextNodesByIndex = new Map(
    timeline.nodes.map((node) => [node.index, node]),
  );
  items.forEach((item, index) => {
    if (!item) return;
    item.node =
      (item.node?.index && nextNodesByIndex.get(item.node.index))
      || timeline.nodes[index]
      || null;
  });

  let nextActiveIndex = -1;
  if (previousNodeKey) {
    nextActiveIndex = items.findIndex(
      (item) => item?.node?.index === previousNodeKey,
    );
  }
  if (nextActiveIndex < 0 && previousActiveIndex >= 0) {
    nextActiveIndex = previousActiveIndex;
  }

  currentVideoVersion = version;
  ensureVideoSource(config);
  if (versionButton) {
    versionButton.textContent = version;
    versionButton.setAttribute('aria-label', `Video version ${version}`);
    versionButton.classList.remove('is-unavailable');
    refreshVersionButton();
  }

  const nextNode = nextActiveIndex >= 0 ? items[nextActiveIndex]?.node : null;
  if (nextNode) {
    pendingSeekTime = nextNode.start + 0.02;
    pendingPlayAfterVersionSwitch = wasPlaying;
    setActiveItem(nextActiveIndex, true);
    updateProgress(nextNode.start);
  } else {
    pendingSeekTime = 0;
    pendingPlayAfterVersionSwitch = false;
    setActiveItem(-1, false);
    updateProgress(0);
  }
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
}

function movePlayerDrag(event) {
  if (!playerDragState || !player) return;
  if (playerDragState.pointerId !== undefined && event.pointerId !== playerDragState.pointerId) return;
  const dx = event.clientX - playerDragState.startX;
  const dy = event.clientY - playerDragState.startY;
  if (!playerDragState.didDrag && Math.hypot(dx, dy) < 8) {
    return;
  }
  if (!playerDragState.didDrag) {
    playerDragState.didDrag = true;
    player.style.transition = 'none';
    player.style.right = 'auto';
    player.style.bottom = 'auto';
  }
  const maxLeft = Math.max(0, window.innerWidth - player.offsetWidth);
  const maxTop = Math.max(playerDragState.subtitleHeight, window.innerHeight - player.offsetHeight);
  const left = Math.max(0, Math.min(maxLeft, playerDragState.startLeft + dx));
  const top = Math.max(playerDragState.subtitleHeight, Math.min(maxTop, playerDragState.startTop + dy));
  player.style.left = `${left}px`;
  player.style.top = `${top}px`;
  event.preventDefault();
}

function keepPlayerInViewport() {
  if (!player) return;
  const rect = player.getBoundingClientRect();
  const margin = 8;
  const outside =
    rect.right <= margin
    || rect.bottom <= margin
    || rect.left >= window.innerWidth - margin
    || rect.top >= window.innerHeight - margin;
  if (outside) {
    player.style.left = '';
    player.style.top = '';
    player.style.right = '';
    player.style.bottom = '';
    player.style.transition = '';
    return;
  }
  if (rect.left < margin) player.style.left = `${margin}px`;
  if (rect.top < margin) player.style.top = `${margin}px`;
  if (rect.right > window.innerWidth - margin) {
    player.style.left = `${Math.max(margin, window.innerWidth - rect.width - margin)}px`;
  }
  if (rect.bottom > window.innerHeight - margin) {
    player.style.top = `${Math.max(margin, window.innerHeight - rect.height - margin)}px`;
  }
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
      <video id="hsbc-total-video" playsinline preload="none" controlsList="nodownload nofullscreen noremoteplayback"></video>
      <div class="hsbc-total-top-left">
        <button id="hsbc-total-close" class="hsbc-total-control-btn" type="button" title="Close" aria-label="Close">${CLOSE_ICON_SVG}</button>
      </div>
      <div class="hsbc-total-bottom-right">
        <button id="hsbc-total-resize" class="hsbc-total-control-btn" type="button" title="Resize" aria-label="Resize">${RESIZE_ICON_SVG}</button>
      </div>
    </div>
    <div class="hsbc-total-controls">
      ${versionControlHtml()}
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
  versionButton = document.getElementById('hsbc-total-version');
  sizeButton = document.getElementById('hsbc-total-resize');
  timeLabel = document.getElementById('hsbc-total-time');
  video = document.getElementById('hsbc-total-video');

  video.playbackRate = SPEED_STATES[currentSpeedIndex];
  applySize();
  updateSpeedButtons();
  versionButton?.addEventListener('click', () => {
    const nextVersion = versionButton.dataset.nextVersion;
    if (!nextVersion) {
      refreshVersionButton();
      return;
    }
    switchVideoVersion(nextVersion).catch((error) => {
      console.error('Unable to switch video version:', error);
    });
  });
  refreshVersionButton();

  video.addEventListener('loadedmetadata', () => {
    if (video.videoWidth && video.videoHeight) {
      player.style.setProperty('--hsbc-total-video-ratio', '1 / 1');
    }
    if (timeline?.total_duration && timeLabel) {
      timeLabel.textContent = `${formatTime(0)} / ${formatTime(timeline.total_duration)}`;
    }
    const versionSeekTime = pendingSeekTime;
    if (versionSeekTime !== null) {
      try {
        video.currentTime = versionSeekTime;
      } catch (_) {}
      pendingSeekTime = null;
    }
    if (versionSeekTime !== null && activeIndex >= 0 && items[activeIndex]) {
      startSubtitleTyping(
        items[activeIndex].text,
        items[activeIndex].node?.duration,
      );
    }
    if (pendingPlayAfterVersionSwitch) {
      pendingPlayRequest = true;
    }
    pendingPlayAfterVersionSwitch = false;
    retryPendingPlayback();
  });
  video.addEventListener('canplay', retryPendingPlayback);
  video.addEventListener('playing', () => {
    pendingPlayRequest = false;
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
      requestVideoPlayback();
    } else {
      pendingPlayRequest = false;
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
    requestVideoPlayback();
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
  keepPlayerInViewport();
  ensureVideoSource(VIDEO_VERSIONS?.[currentVideoVersion] || { videoUrl: VIDEO_URL });
  if (video) video.playbackRate = SPEED_STATES[currentSpeedIndex];
  setActiveItem(index, true);
}

export function hidePlayer() {
  if (player) {
    player.classList.remove('is-open');
    pendingPlayRequest = false;
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
  if (
    item.el.classList.contains('hsbc-total-sentence')
    && item.el.dataset.hsbcTotalNode === String(index)
  ) {
    return;
  }
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
      if (target?.closest?.('.hsbc-total-player, button, a, input, select, textarea')) {
        return;
      }
      let sentence = target?.closest?.('[data-hsbc-total-node]');
      if (!sentence && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
        const coordinateMatch = items.find((item) => {
          if (!item?.el) return false;
          const rect = item.el.getBoundingClientRect();
          return (
            event.clientX >= rect.left
            && event.clientX <= rect.right
            && event.clientY >= rect.top
            && event.clientY <= rect.bottom
          );
        });
        sentence = coordinateMatch?.el || null;
      }
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

function mapNodesToPage(nodes, warnMissing = true) {
  const usedElements = new Set();
  items = nodes.map((node, index) => {
    let el = null;
    if (node.selector) {
      el = document.querySelector(node.selector);
    }
    if (!el && USE_NODE_SELECTORS && NODE_SELECTORS[index]) {
      el = document.querySelector(NODE_SELECTORS[index]);
    }
    if (!el && TEXT_MATCH_FALLBACK) {
      el = findTextMatch(node, usedElements);
    }
    if (!el) return null;
    usedElements.add(el);
    return {
      node,
      el,
      text: normalizedText(el) || node.text || node.index,
    };
  });

  const missing = items.map((item, index) => item ? null : index).filter((value) => value !== null);
  if (warnMissing && missing.length > 0) {
    console.warn('Missing total-video node selectors:', missing);
  }

  items.forEach((item, index) => {
    if (!item) return;
    addSentenceIcon(item);
    attachSentenceInteraction(item, index);
  });
  setupSentenceClickDelegation();
  updateSentenceIconsVisibility();
}

async function mapNodesWhenReady(nodes) {
  let bestMappedCount = 0;
  let stableAttempts = 0;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    mapNodesToPage(nodes, false);
    const mappedCount = items.filter(Boolean).length;
    if (mappedCount >= nodes.length) return;
    if (mappedCount > bestMappedCount) {
      bestMappedCount = mappedCount;
      stableAttempts = 0;
    } else {
      stableAttempts += 1;
    }
    if (attempt >= 3 && stableAttempts >= 12) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const missing = items.map((item, index) => item ? null : index).filter((value) => value !== null);
  console.warn('Missing total-video node selectors:', missing);
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
    await mapNodesWhenReady(timeline.nodes);
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

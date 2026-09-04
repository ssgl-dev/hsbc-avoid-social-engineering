// mini-player.js

let miniPlayer = null;
let currentSizeIndex = 0; // Start with the smallest size (index 0)
let lastFocusedButton = null;
let lastClickedPlayButton = null; // Store the last clicked play button
// New proportions suited for side bar + video area
const sizeStates = [
  [320, 310],
  [384, 372],
  [460.8, 446.4],
];

// Store reference to clearAllHighlights function
let clearAllHighlights = null;
export function setClearHighlightsFunction(fn) {
  clearAllHighlights = fn;
}

// Store reference to current text block for focus restoration
let currentTextBlock = null;
export function setCurrentTextBlock(textBlock) {
  currentTextBlock = textBlock;
}

// Function to set the last clicked play button
export function setLastClickedPlayButton(playButton) {
  lastClickedPlayButton = playButton;
  // console.log('Last clicked play button set:', playButton);
}

// External navigation handlers (set by interactive-highlight)
let navHandlers = { prev: null, next: null };
export function setMiniPlayerNavHandlers(handlers = {}) {
  navHandlers.prev = typeof handlers.prev === 'function' ? handlers.prev : null;
  navHandlers.next = typeof handlers.next === 'function' ? handlers.next : null;
}
export function updateMiniPlayerNavState(state = {}) {
  // console.log('Updating mini-player nav state:', state);
  const prevBtn = document.getElementById('mini-player-prev');
  const nextBtn = document.getElementById('mini-player-next');
  if (prevBtn && typeof state.hasPrev === 'boolean') {
    prevBtn.disabled = !state.hasPrev;
    prevBtn.style.opacity = state.hasPrev ? '1' : '0.5';
    prevBtn.style.cursor = state.hasPrev ? 'pointer' : 'not-allowed';
    prevBtn.setAttribute('aria-disabled', String(!state.hasPrev));
  }
  if (nextBtn && typeof state.hasNext === 'boolean') {
    nextBtn.disabled = !state.hasNext;
    nextBtn.style.opacity = state.hasNext ? '1' : '0.5';
    nextBtn.style.cursor = state.hasNext ? 'pointer' : 'not-allowed';
    nextBtn.setAttribute('aria-disabled', String(!state.hasNext));
  }
}

function getNearestPlayButton() {
  // Use current text block if available, otherwise fall back to focused element
  // console.log('current text block:' , currentTextBlock);
  const currentFocus = currentTextBlock || document.activeElement;
  // console.log('Current focus for getNearestPlayButton:', currentFocus);
  if (!currentFocus) return null;
  
  // Get all trans-hands-icon elements in document order
  const playButtons = Array.from(document.querySelectorAll('.trans-hands-icon'));
  if (playButtons.length === 0) return null;
  // console.log('Found play buttons:', playButtons.length);
  // Get all elements in document order to find current position
  const allElements = Array.from(document.querySelectorAll('*'));
  const currentIndex = allElements.indexOf(currentFocus);
  // console.log("currentIndex:", currentIndex);

  if (currentIndex === -1) return playButtons[0]; // Return first button if current element not found

  let nearestPrevButton = null;
  // Find the play button that appears closest before current element in document flow
  for (const playButton of playButtons) {
    const playButtonIndex = allElements.indexOf(playButton);
    // console.log("playButtonIndex:", playButtonIndex);
    // console.log("button:", playButton);
    
    if (playButtonIndex < currentIndex) {
      nearestPrevButton = playButton; // Keep updating to get the closest one before current
    } else {
      break; // Stop when we reach buttons after current element
    }
  }
  
  // If no button found before current element, return the last one
  if (nearestPrevButton) {
    // console.log("chosen index:", allElements.indexOf(nearestPrevButton));
    // console.log("chosen button:", nearestPrevButton);
    return nearestPrevButton;
  }
  return playButtons[0];
}

export async function showMiniPlayer(text) {
  if (miniPlayer) {
    miniPlayer.remove();
    miniPlayer = null;
  }
  miniPlayer = document.createElement('div');
  miniPlayer.id = 'mini-video-player';
  miniPlayer.style.position = 'fixed';
  miniPlayer.style.bottom = '2%';
  miniPlayer.style.right = '1%';
  miniPlayer.style.width = sizeStates[currentSizeIndex][0] + 'px';
  miniPlayer.style.height = sizeStates[currentSizeIndex][1] + 'px';
  miniPlayer.style.zIndex = 1000000;
  miniPlayer.style.display = 'none';
  miniPlayer.style.color = '#333';
  miniPlayer.style.background = 'linear-gradient(145deg, #f8f9fa, #e9ecef)';
  miniPlayer.style.overflow = 'hidden';
  miniPlayer.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)';
  miniPlayer.style.borderRadius = '12px';
  miniPlayer.style.border = '1px solid #dee2e6';
  miniPlayer.style.transition = 'width 0.3s ease, height 0.3s ease, opacity 0.2s ease, transform 0.2s ease';
  miniPlayer.innerHTML = `
    <div id="mini-player-content" style="display:flex;width:100%;height:100%;" class="hidden-to-sign-language-player">
  <div id="vlitejs-player" style="flex:1;display:flex;align-items:center;justify-content:center;padding:0;background:transparent;border-radius:0;overflow:hidden;"></div>
      <div id="mini-player-side-bar" style="width:72px;background:rgba(255, 255, 255, 0.25);backdrop-filter:blur(8px);border-left:1px solid rgba(255,255,255,0.15);box-shadow:-2px 0 8px rgba(53, 53, 220, 0.1);display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:8px;gap:8px;">
        <div style="display:flex;flex-direction:column;gap:8px;align-items:center;">
          <button id="close-mini-player" title="Close" style="background:linear-gradient(135deg,#1e488bff,#1e488bff);border:none;border-radius:6px;font-size:26px;font-weight:bold;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:white;transition:all 0.2s ease;box-shadow:0 1px 3px rgba(0, 0, 0, 0.2);"><span>×</span></button>
          <button id="expand-mini-player" title="Make larger" style="background:linear-gradient(135deg,#1e488bff,#1e488bff);border:none;border-radius:6px;font-size:26px;font-weight:bold;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:white;transition:all 0.2s ease;box-shadow:0 1px 3px rgba(0, 0, 0, 0.2);"><span>+</span></button>
          <button id="shrink-mini-player" title="Make smaller" style="background:linear-gradient(135deg,#1e488bff,#1e488bff);border:none;border-radius:6px;font-size:26px;font-weight:bold;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:white;transition:all 0.2s ease;box-shadow:0 1px 3px rgba(0,0,0,0.2);"><span>−</span></button>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;align-items:center;">
          <button id="mini-player-prev" title="Previous" style="background:none;border:none;outline:none;cursor:pointer;padding:0;transition:transform 0.1s;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
            <svg width="38" height="38" viewBox="0 0 48 48"><rect x="13" y="12" width="3" height="24" fill="#1e488bff"/><polygon points="32,36 18,24 32,12" fill="#1e488bff"/></svg>
          </button>
          <button id="mini-player-replay" title="Replay" style="background:none;border:none;outline:none;cursor:pointer;padding:0;transition:transform 0.1s;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
            <svg width="38" height="38" fill="#1e488bff" viewBox="-24 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M232 448Q186 448 148 425 109 402 87 363 64 324 64 278L64 256 112 256 112 280Q112 331 147 366 182 400 233 400 265 400 293 384 320 367 336 340 352 313 352 281 352 230 318 195 283 160 232 160L232 232 136 136 232 40 232 112Q279 112 317 134 355 157 378 196 400 234 400 280 400 327 378 364 356 403 317 426 277 448 232 448Z"></path></svg>
          </button>
          <button id="mini-player-next" title="Next" style="background:none;border:none;outline:none;cursor:pointer;padding:0;transition:transform 0.1s;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
            <svg width="38" height="38" viewBox="0 0 48 48"><rect x="32" y="12" width="3" height="24" fill="#1e488bff"/><polygon points="16,12 30,24 16,36" fill="#1e488bff"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(miniPlayer);
  miniPlayer.style.display = 'block';
  miniPlayer.style.opacity = '1';
  miniPlayer.style.transform = 'scale(1)';

  // Accessibility: auto-focus first relevant control when mini-player opens
  setTimeout(() => {
    const preferred = document.getElementById('mini-player-replay'); // Changed from prev to replay for initial state
    const focusables = Array.from(miniPlayer.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (preferred && !preferred.disabled) {
      preferred.focus();
    } else if (focusables.length > 0) {
      focusables[0].focus();
    }
  }, 0);

  // --- Glassy UI minimal CSS ---
  miniPlayer.style.background = 'rgba(255, 255, 255, 0.25)';
  miniPlayer.style.backdropFilter = 'blur(16px) saturate(180%)';
  miniPlayer.style.border = '1px solid rgba(255, 255, 255, 0.35)';
  miniPlayer.style.boxShadow = '0 8px 32px 0 rgba(53, 84, 220, 0.37)'; 
  miniPlayer.style.color = '#222222ff';

  // --- Modern circular red/white button style ---
  const buttonBase = [
    'background:#fff;',
    'border:none;',
    'border-radius:50%;',
    'width:40px;',
    'height:40px;',
    'display:flex;',
    'align-items:center;',
    'justify-content:center;',
    'cursor:pointer;',
    'color:#1e488bff;', 
    'box-shadow:0 2px 8px rgba(53, 84, 220, 0.37);', 
    'padding:0;',
    'z-index:2147483647;',
    'position:relative;',
    'pointer-events:auto;',
    'transition:background 0.2s,color 0.2s,box-shadow 0.2s;'
  ].join('');

  // Apply base style and icon color
  const buttonIds = ['shrink-mini-player','expand-mini-player','close-mini-player','mini-player-prev','mini-player-replay','mini-player-next'];
  const ariaLabels = {
    'shrink-mini-player': 'Make mini player smaller',
    'expand-mini-player': 'Make mini player larger',
    'close-mini-player': 'Close mini player',
    'mini-player-prev': 'Previous section',
    'mini-player-replay': 'Replay video',
    'mini-player-next': 'Next section'
  };
  buttonIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.style.cssText = buttonBase;
      // For text-based buttons (×, +, −), set larger font size
      if (id === 'close-mini-player' || id === 'expand-mini-player' || id === 'shrink-mini-player') {
        btn.style.fontSize = '20px';
        btn.style.fontWeight = 'bold';
      }
      // Accessibility: ensure label and focus ring
      if (ariaLabels[id]) btn.setAttribute('aria-label', ariaLabels[id]);
      btn.setAttribute('role', 'button');
      btn.tabIndex = 0;
      // SVG icons: set color to blue
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.style.display = 'block';
        svg.style.width = '24px';
        svg.style.height = '24px';
        svg.style.color = '#353ddcff';
        // Set all child shapes to blue, including rect elements
        svg.querySelectorAll('circle,polygon,path,rect').forEach(el => {
          el.setAttribute('stroke', '#353ddcff');
          // Fill polygons, paths, and rects, but not circles
          if (el.tagName === 'circle') {
            el.setAttribute('fill', 'none');
          } else {
            el.setAttribute('fill', '#353ddcff');
          }
        });
      }
      // Visible focus indicator
      btn.addEventListener('focus', () => {
        lastFocusedButton = btn;
        btn.style.outline = '2px solid #1095C1';
        btn.style.outlineOffset = '2px';
      });
      btn.addEventListener('blur', () => {
        btn.style.outline = 'none';
        btn.style.outlineOffset = '0';
      });
      // Keyboard activation with Enter/Space
      btn.addEventListener('keydown', (e) => {
        const key = e.key || e.code;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
          e.preventDefault();
          e.stopPropagation();
          // Click only if not disabled
          if (!btn.disabled && btn.getAttribute('aria-disabled') !== 'true') {
            btn.click();
          }
        }
      });
      // Hover effect: invert colors
      btn.onmouseenter = () => {
        btn.style.background = '#353ddcff';
        btn.style.color = '#fff';
        btn.style.boxShadow = '0 2px 8px rgba(53, 84, 220, 0.35)';
        if (svg) {
          svg.querySelectorAll('circle,polygon,path,rect').forEach(el => {
            el.setAttribute('stroke', '#fff');
            // Fill polygons, paths, and rects, but not circles
            if (el.tagName === 'circle') {
              el.setAttribute('fill', 'none');
            } else {
              el.setAttribute('fill', '#fff');
            }
          });
        }
      };
      btn.onmouseleave = () => {
        btn.style.background = '#fff';
        btn.style.color = '#353ddcff';
        btn.style.boxShadow = '0 2px 8px rgba(53, 84, 220, 0.35)';
        if (svg) {
          svg.querySelectorAll('circle,polygon,path,rect').forEach(el => {
            el.setAttribute('stroke', '#353ddcff');
            // Fill polygons, paths, and rects, but not circles
            if (el.tagName === 'circle') {
              el.setAttribute('fill', 'none');
            } else {
              el.setAttribute('fill', '#353ddcff');
            }
          });
        }
      };
    }
  });

  // Button logic
  function updateButtonStates() {
    const shrinkBtn = document.getElementById('shrink-mini-player');
    const expandBtn = document.getElementById('expand-mini-player');
    if (!shrinkBtn || !expandBtn) return;
    shrinkBtn.disabled = currentSizeIndex === 0;
    shrinkBtn.style.opacity = currentSizeIndex === 0 ? '0.5' : '1';
    shrinkBtn.style.cursor = currentSizeIndex === 0 ? 'not-allowed' : 'pointer';
    shrinkBtn.setAttribute('aria-disabled', String(currentSizeIndex === 0));
    expandBtn.disabled = currentSizeIndex === sizeStates.length - 1;
    expandBtn.style.opacity = currentSizeIndex === sizeStates.length - 1 ? '0.5' : '1';
    expandBtn.style.cursor = currentSizeIndex === sizeStates.length - 1 ? 'not-allowed' : 'pointer';
    expandBtn.setAttribute('aria-disabled', String(currentSizeIndex === sizeStates.length - 1));
  }
  document.getElementById('shrink-mini-player').onclick = function() {
    if (currentSizeIndex > 0) {
      currentSizeIndex--;
      const [w, h] = sizeStates[currentSizeIndex];
      miniPlayer.style.width = w + 'px';
      miniPlayer.style.height = h + 'px';
      updateButtonStates();
    }
  };
  document.getElementById('expand-mini-player').onclick = function() {
    if (currentSizeIndex < sizeStates.length - 1) {
      currentSizeIndex++;
      const [w, h] = sizeStates[currentSizeIndex];
      miniPlayer.style.width = w + 'px';
      miniPlayer.style.height = h + 'px';
      updateButtonStates();
    }
  };
  document.getElementById('close-mini-player').onclick = function() {
    hideMiniPlayer();
  };
  updateButtonStates();
  // Focus trap within mini-player: Tab cycles within controls and wraps
  // ESC key closes the mini-player
  const handleKeydown = (e) => {
    // Handle ESC key to close mini-player
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      hideMiniPlayer();
      return;
    }
    
    // Handle Tab key for focus trap
    if (e.key !== 'Tab') return;
    const focusables = Array.from(miniPlayer.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    }
  };
  miniPlayer.addEventListener('keydown', handleKeydown);

  // Global ESC key listener for closing mini-player
  const globalEscapeHandler = (e) => {
    if (e.key === 'Escape' && miniPlayer && document.body.contains(miniPlayer)) {
      e.preventDefault();
      e.stopPropagation();
      hideMiniPlayer();
    }
  };
  document.addEventListener('keydown', globalEscapeHandler);
  
  // Store the handler so we can remove it when mini-player is closed
  miniPlayer._globalEscapeHandler = globalEscapeHandler;

  // Navigation logic (prev/next/replay)
  function focusNearestEnabled(fromEl) {
    const order = ['mini-player-prev','mini-player-replay','mini-player-next'];
    const isEnabled = (id) => {
      const el = document.getElementById(id);
      return el && !el.disabled && el.getAttribute('aria-disabled') !== 'true' && el.offsetParent !== null;
    };
    const tryFocus = (id) => {
      const el = document.getElementById(id);
      if (el && isEnabled(id)) { el.focus(); return true; }
      return false;
    };
    // Prefer original element if still enabled
    if (fromEl && fromEl.id && tryFocus(fromEl.id)) return;
    // Otherwise, pick nearest in the declared order
    const startIdx = fromEl && fromEl.id ? order.indexOf(fromEl.id) : -1;
    // Search forward then backward
    for (let i = 1; i <= order.length; i++) {
      const fwdIdx = (startIdx + i) % order.length;
      if (tryFocus(order[fwdIdx])) return;
    }
    for (let i = 1; i <= order.length; i++) {
      const backIdx = (startIdx - i + order.length) % order.length;
      if (tryFocus(order[backIdx])) return;
    }
    // Final fallback: first focusable in mini-player
    const any = Array.from(miniPlayer.querySelectorAll('button'))
      .find(el => !el.disabled && el.getAttribute('aria-disabled') !== 'true' && el.offsetParent !== null);
    any?.focus();
  }

  document.getElementById('mini-player-prev').onclick = function() {
    const before = lastFocusedButton || document.activeElement;
    if (navHandlers.prev) navHandlers.prev();
    // Defer focus restore until after nav state updates
    setTimeout(() => { focusNearestEnabled(before); }, 0);
  };
  document.getElementById('mini-player-next').onclick = function() {
    const before = lastFocusedButton || document.activeElement;
    if (navHandlers.next) navHandlers.next();
    setTimeout(() => { focusNearestEnabled(before); }, 0);
  };
  document.getElementById('mini-player-replay').onclick = function() {
    const vid = document.getElementById('vlite-video');
    if (vid) {
      vid.currentTime = 0;
      vid.play();
    }
  };

  // Dynamic video loading will be handled separately for each text content
  const playerDiv = document.getElementById('vlitejs-player');

    playerDiv.innerHTML = `
    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:transparent;border-radius:0;overflow:hidden;line-height:0;">
      <video id="vlite-video" class="vlite-js" muted playsinline preload="auto" style="display:block;width:100%;height:100%;object-fit:cover;background:transparent;" tabindex="-1" disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback noplaybackrate">
      </video>
    </div>
  `;
  const vid = document.getElementById('vlite-video');
  // 添加一个永久的事件监听器，每当新视频元数据加载完成时，就设置播放速度
  // 这是解决后续视频速度被重置的根本方法
  vid.addEventListener('loadedmetadata', () => {
    vid.playbackRate = 1.3; // 在这里设置您想要的速度
  });

  // Load initial video content
  await loadVideoForText(text, vid);

  setTimeout(() => {
    const vid = document.getElementById('vlite-video');
    if (vid) {
      vid.loop = false; // Ensure video doesn't loop
      vid.play().catch(() => {});
    }
  }, 100);
}

// New function to handle video loading for specific text content
export async function loadVideoForText(text, videoElement) {
  const pageTitle = document.title || '';
  const bodyContent = JSON.stringify({source: text || '', page_title: pageTitle});
  console.log('Loading video for content:', bodyContent);
  
  try {
    const getSrc = await fetch('/video-selector/select', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: bodyContent
    });
    const res = await getSrc.json();
    const fallback = '/static/videos/stub.webm'; 
    const video_src = res != null && res.success ? res['video_source'] : fallback;
    console.log('Selected video src:', video_src);

    const useSrc = await urlExists(video_src) ? video_src : fallback;
    const type = useSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    
    videoElement.innerHTML = `<source src="${useSrc}" type="${type}">`;
    videoElement.load();
    
    videoElement.onerror = () => {
      if (videoElement.currentSrc !== fallback) {
        videoElement.innerHTML = `<source src="${fallback}" type="video/webm">`;
        videoElement.load();
      }
    };
  } catch (error) {
    console.error('Error loading video:', error);
    // Fallback to default video
    const fallback = '/static/videos/stub.webm';
    videoElement.innerHTML = `<source src="${fallback}" type="video/webm">`;
    videoElement.load();
  }
}

async function urlExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;    
  } catch {
    return false;           
  }
}

export function hideMiniPlayer() {
  if (miniPlayer) {
    // Remove global ESC key listener
    if (miniPlayer._globalEscapeHandler) {
      document.removeEventListener('keydown', miniPlayer._globalEscapeHandler);
    }
    
    // Properly cleanup video element to prevent memory leaks
    const video = document.getElementById('vlite-video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load(); // Reset video element
      video.onended = null;
      video.onerror = null;
      video.onloadstart = null;
      video.oncanplay = null;
    }
    
    // Clear all highlights when closing mini-player
    if (clearAllHighlights) {
      clearAllHighlights();
    } else {
      // Fallback: manually clear highlights if function not set
      document.querySelectorAll('.trans-highlighted').forEach(el => {
        el.classList.remove('trans-highlighted');
        el.style.boxShadow = '';
        el.style.border = '';
        el.style.background = '';
        el.style.outline = '';
      });
    }
    
    // Add fade out animation
    miniPlayer.style.opacity = '0';
    miniPlayer.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      if (miniPlayer) {
        miniPlayer.remove();
        miniPlayer = null;
        // Reset to the smallest size for next time
        currentSizeIndex = 0;
      }
      // Restore focus to last clicked play button or nearest play button
      // Check both local variable and global variable (for video-player-button-under.js compatibility)
      const toFocus = lastClickedPlayButton || window.lastClickedPlayButton || getNearestPlayButton();
      // console.log('Restoring focus to:', toFocus);
      // console.log(toFocus.parentElement);
      if (toFocus) {
        toFocus.focus();
      }
      setCurrentTextBlock(null);
      lastClickedPlayButton = null; // Reset after use
      window.lastClickedPlayButton = null; // Reset global variable too
    }, 200); // Reduced timeout for better responsiveness
  }
}

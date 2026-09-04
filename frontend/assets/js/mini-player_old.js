// mini-player.js

let miniPlayer = null;
let currentSizeIndex = 1;
let lastFocusedButton = null;
const sizeStates = [
  [200, 200],
  [240, 240],
  [288, 288],
  [345.6, 345.6],
  [414.72, 414.72]
];

// External navigation handlers (set by interactive-highlight)
let navHandlers = { prev: null, next: null };
export function setMiniPlayerNavHandlers(handlers = {}) {
  navHandlers.prev = typeof handlers.prev === 'function' ? handlers.prev : null;
  navHandlers.next = typeof handlers.next === 'function' ? handlers.next : null;
}
export function updateMiniPlayerNavState(state = {}) {
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

export function showMiniPlayer(text) {
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
  miniPlayer.style.transition = 'width 0.3s ease, height 0.3s ease';
  miniPlayer.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;height:40px;background:linear-gradient(135deg,#fff,#f1f3f4);border-bottom:1px solid #d1d5db;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:flex-end;padding:0 8px;z-index:2147483647;gap:4px;box-shadow:0 1px 3px rgba(0,0,0,0.1);pointer-events:auto;">
      <button id="shrink-mini-player" style="background:linear-gradient(135deg,#6c757d,#5a6268);border:none;border-radius:4px;font-size:14px;font-weight:bold;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:white;transition:all 0.2s ease;box-shadow:0 1px 3px rgba(0,0,0,0.2);z-index:2147483647;position:relative;pointer-events:auto;" title="Make smaller">−</button>
      <button id="expand-mini-player" style="background:linear-gradient(135deg,#6c757d,#5a6268);border:none;border-radius:4px;font-size:14px;font-weight:bold;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:white;transition:all 0.2s ease;box-shadow:0 1px 3px rgba(0,0,0,0.2);z-index:2147483647;position:relative;pointer-events:auto;" title="Make larger">+</button>
      <button id="close-mini-player" style="background:linear-gradient(135deg,#6c757d,#5a6268);border:none;border-radius:4px;font-size:14px;font-weight:bold;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:white;transition:all 0.2s ease;box-shadow:0 1px 3px rgba(0,0,0,0.2);z-index:2147483647;position:relative;pointer-events:auto;" title="Close">×</button>
    </div>
    <div id="vlitejs-player" style="position:absolute;top:40px;left:0;right:0;bottom:50px;border-radius:0 0 0px 0px;background:#f8f9fa;border-top:1px solid #e9ecef;"></div>
    <div id="mini-player-bottom-bar" style="position:absolute;left:0;right:0;bottom:0;height:50px;background:rgba(255,255,255,0);display:flex;align-items:center;justify-content:center;gap:32px;z-index:2147483647;pointer-events:auto;">
      <button id="mini-player-prev" style="background:none;border:none;outline:none;cursor:pointer;padding:0;transition:transform 0.1s;width:40px;height:40px;display:flex;align-items:center;justify-content:center;" title="Previous"><svg width="32" height="32" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="none" stroke="#8B1E1E" stroke-width="2"/><polygon points="30,36 18,24 30,12" fill="#8B1E1E"/></svg></button>
      <button id="mini-player-replay" style="background:none;border:none;outline:none;cursor:pointer;padding:0;transition:transform 0.1s;width:40px;height:40px;display:flex;align-items:center;justify-content:center;" title="Replay"><svg width="32" height="32" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="none" stroke="#8B1E1E" stroke-width="2"/><path d="M24 14v-4l-7 7 7 7v-4c5 0 9 4 9 9s-4 9-9 9-9-4-9-9" fill="none" stroke="#8B1E1E" stroke-width="2"/></svg></button>
      <button id="mini-player-next" style="background:none;border:none;outline:none;cursor:pointer;padding:0;transition:transform 0.1s;width:40px;height:40px;display:flex;align-items:center;justify-content:center;" title="Next"><svg width="32" height="32" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="none" stroke="#8B1E1E" stroke-width="2"/><polygon points="18,12 30,24 18,36" fill="#8B1E1E"/></svg></button>
    </div>
  `;
  document.body.appendChild(miniPlayer);
  miniPlayer.style.display = 'block';

  // Accessibility: auto-focus first relevant control when mini-player opens
  setTimeout(() => {
    const preferred = document.getElementById('mini-player-prev');
    const focusables = Array.from(miniPlayer.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (preferred && !preferred.disabled) {
      preferred.focus();
    } else if (focusables.length > 0) {
      focusables[0].focus();
    }
  }, 0);

  // --- Glassy UI minimal CSS ---
  miniPlayer.style.background = 'rgba(255,255,255,0.25)';
  miniPlayer.style.backdropFilter = 'blur(16px) saturate(180%)';
  miniPlayer.style.border = '1px solid rgba(255,255,255,0.35)';
  miniPlayer.style.boxShadow = '0 8px 32px 0 rgba(220,53,69,0.37)'; 
  miniPlayer.style.color = '#222';
  // header bar
  const headerBar = miniPlayer.querySelector('div');
  if (headerBar) {
    headerBar.style.background = 'rgba(255,255,255,0.35)';
    headerBar.style.backdropFilter = 'blur(12px)';
    headerBar.style.borderBottom = '1px solid rgba(255,255,255,0.25)';
    headerBar.style.boxShadow = '0 2px 8px rgba(220,53,69,0.10)'; 
  }
  // bottom bar
  const bottomBar = miniPlayer.querySelector('#mini-player-bottom-bar');
  if (bottomBar) {
    bottomBar.style.background = 'rgba(255,255,255,0.25)';
    bottomBar.style.backdropFilter = 'blur(8px)';
    bottomBar.style.borderTop = '1px solid rgba(255,255,255,0.15)';
    bottomBar.style.boxShadow = '0 -2px 8px rgba(220,53,69,0.10)'; 
  }

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
    'color:#dc3545;', 
    'box-shadow:0 2px 8px rgba(220,53,69,0.25);', 
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
      // Accessibility: ensure label and focus ring
      if (ariaLabels[id]) btn.setAttribute('aria-label', ariaLabels[id]);
      btn.setAttribute('role', 'button');
      btn.tabIndex = 0;
      // SVG icons: set color to red
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.style.display = 'block';
        svg.style.width = '24px';
        svg.style.height = '24px';
        svg.style.color = '#dc3545';
        // Set all child shapes to red
        svg.querySelectorAll('circle,polygon,path').forEach(el => {
          el.setAttribute('stroke', '#dc3545');
          el.setAttribute('fill', el.tagName === 'polygon' ? '#dc3545' : 'none');
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
        btn.style.background = '#dc3545';
        btn.style.color = '#fff';
        btn.style.boxShadow = '0 2px 8px rgba(220,53,69,0.35)';
        if (svg) {
          svg.querySelectorAll('circle,polygon,path').forEach(el => {
            el.setAttribute('stroke', '#fff');
            el.setAttribute('fill', el.tagName === 'polygon' ? '#fff' : 'none');
          });
        }
      };
      btn.onmouseleave = () => {
        btn.style.background = '#fff';
        btn.style.color = '#dc3545';
        btn.style.boxShadow = '0 2px 8px rgba(220,53,69,0.25)';
        if (svg) {
          svg.querySelectorAll('circle,polygon,path').forEach(el => {
            el.setAttribute('stroke', '#dc3545');
            el.setAttribute('fill', el.tagName === 'polygon' ? '#dc3545' : 'none');
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
  const handleTrap = (e) => {
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
  miniPlayer.addEventListener('keydown', handleTrap);

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

  // Dynamic video loading (faked fetch INTRODUCE HERE :P)
  const playerDiv = document.getElementById('vlitejs-player');
  // Use the correct video source
  const VIDEO_SOURCE = '/static/videos/stub.webm';
  playerDiv.innerHTML = `
    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;border-radius:0;overflow:hidden;margin-bottom:20%;">
      <video id="vlite-video" class="vlite-js" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;background:#000;" tabindex="-1" disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback noplaybackrate">
        <source src="${VIDEO_SOURCE}" type="video/webm">
      </video>
    </div>
  `;
  setTimeout(() => {
    const vid = document.getElementById('vlite-video');
    if (vid) vid.play().catch(() => {});
  }, 100);
}

export function hideMiniPlayer() {
  if (miniPlayer) {
    miniPlayer.style.display = 'none';
    setTimeout(() => {
      if (miniPlayer) miniPlayer.remove();
      miniPlayer = null;
      currentSizeIndex = 4;
    }, 300);
  }
}

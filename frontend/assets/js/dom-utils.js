// dom-utils.js
export function measureIntrinsicTextWidth(container) {
  try {
    const range = document.createRange();
    range.selectNodeContents(container);
    const rects = range.getClientRects();
    let maxLineWidth = 0;
    for (const r of rects) {
      if (r.width > maxLineWidth) maxLineWidth = r.width;
    }
    const clone = document.createElement('span');
    const cs = getComputedStyle(container);
    Object.assign(clone.style, {
      visibility: 'hidden', position: 'absolute', left: '-9999px', top: '0', whiteSpace: 'normal', padding: '0', margin: '0', pointerEvents: 'none', font: cs.font, fontSize: cs.fontSize, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight
    });
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    let textContent = '';
    while (walker.nextNode()) {
      if (!walker.currentNode.parentElement?.closest('.signly-button')) {
        textContent += walker.currentNode.textContent;
      }
    }
    textContent = textContent.replace(/\s+/g, ' ').trim();
    clone.textContent = textContent;
    document.body.appendChild(clone);
    const singleLineWidth = clone.getBoundingClientRect().width;
    clone.remove();
    if (maxLineWidth > 0 && maxLineWidth < singleLineWidth * 1.05) {
      return maxLineWidth;
    }
    return Math.min(singleLineWidth, container.getBoundingClientRect().width || singleLineWidth);
  } catch (e) {
    return container.getBoundingClientRect().width || 0;
  }
}

export function setButtonWidth(button, targetContentWidth) {
  const horizontalExtra = 0;
  const finalWidth = Math.max(0, targetContentWidth) + horizontalExtra;
  button.style.width = finalWidth + 'px';
  button.style.maxWidth = finalWidth + 'px';
}

export function clearAllOutlines(state) {
  const existingOverlay = document.querySelector('.trans-outline-overlay');
  if (existingOverlay) existingOverlay.remove();
  const allTransElements = document.querySelectorAll('.signly-button');
  allTransElements.forEach(btn => {
    if (btn.style.display === 'flex' || btn.style.display === 'block' || btn.offsetParent !== null) {
      btn.style.display = 'none';
      btn.style.visibility = 'hidden';
      btn.style.opacity = '0';
      console.log('🧹 Cleaning up visible button from:', btn.parentElement?.className);
    }
  });
  if (state.activeOutlineElement) {
    const el = state.activeOutlineElement;
    const isIcon = el.classList.contains('icon') || el.querySelector('i, .icon, svg') || el.tagName.toLowerCase() === 'i' || el.getAttribute('aria-hidden') === 'true';
    const isInNotificationBanner = el.closest('.notification-banner') || el.classList.contains('notification-banner') || el.classList.contains('notification-banner-text') || el.closest('.notification-banner-text') || el.closest('.A-PNLINLNEMSGE-RW-ALL') || el.closest('[id*="notificationBanner"]') || (el.parentElement && (el.parentElement.classList.contains('notification-banner-text') || el.parentElement.closest('.notification-banner') || el.parentElement.closest('.A-PNLINLNEMSGE-RW-ALL')));
    if (!isIcon && !isInNotificationBanner) {
      el.style.width = '';
      el.style.display = '';
    }
    state.activeOutlineElement = null;
  }
}

export function hideButtonOnly(state) {
  if (state.activeOutlineElement) {
    const sibBtn = state.activeOutlineElement.nextElementSibling;
    if (sibBtn && sibBtn.classList.contains('signly-button')) {
      sibBtn.style.display = 'none';
    }
  }
}


// Visibility helper
export function isVisible(el) {
  if (!el) return false;
  const cs = window.getComputedStyle(el);
  if (!cs || cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
  // offsetParent check filters many hidden cases; allow fixed/absolute by also checking size
  const hasLayout = el.offsetParent !== null || cs.position === 'fixed' || cs.position === 'absolute';
  const hasBox = (el.offsetWidth + el.offsetHeight) > 0;
  return hasLayout && hasBox;
}

export function isAssistiveHidden(el) {
  if (!el) return false;
  if (el.getAttribute && el.getAttribute('aria-hidden') === 'true') return true;
  if (el.classList && (el.classList.contains('visuallyhidden') || el.classList.contains('sr-only') || el.classList.contains('hidden'))) return true;
  return false;
}

// Text leaf predicate: element is visible, has text, and no visible child with text (ignoring the hand icon)
export function isLeafTextElement(el) {
  if (!el || !(el instanceof Element)) return false;
  if (!isVisible(el) || isAssistiveHidden(el)) return false;
  if (el.classList && el.classList.contains('trans-hands-icon')) return false;
  const hasText = (el.innerText || '').trim().length > 0;
  if (!hasText) return false;
  const childHasText = Array.from(el.children).some(ch =>
    isVisible(ch) && !isAssistiveHidden(ch) && !ch.classList.contains('trans-hands-icon') && (ch.innerText || '').trim().length > 0
  );
  return !childHasText;
}

// Find the first deepest text leaf inside root (including root if it qualifies)
export function getFirstLeafTextElement(root) {
  if (!root) return null;
  if (isLeafTextElement(root)) return root;
  const candidates = root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,button,span,div');
  for (const el of candidates) {
    if (isLeafTextElement(el)) return el;
  }
  return null;
}

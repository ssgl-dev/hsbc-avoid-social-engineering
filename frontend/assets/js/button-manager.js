// button-manager.js
import { setButtonWidth, clearAllOutlines, hideButtonOnly } from './dom-utils.js';

export function setupButtonManager() {
  document.querySelectorAll('.cc-btn').forEach(btn => {
    setButtonWidth(btn);
    btn.addEventListener('mouseenter', () => {
      clearAllOutlines();
      btn.classList.add('cc-btn-outline');
    });
    btn.addEventListener('mouseleave', () => {
      btn.classList.remove('cc-btn-outline');
    });
    btn.addEventListener('click', () => {
      hideButtonOnly(btn);
    });
  });
}

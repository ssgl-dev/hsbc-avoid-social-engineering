// main.js
import { setupButtonManager } from './button-manager.js';
import { addInteractiveHighlightSequence } from './interactive-highlight.js';
import { setupHandIconAnimations } from './icon-animation.js';
import { setAriaAttributes } from './aria-setting.js';

window.addEventListener('DOMContentLoaded', () => {
  setupButtonManager();
  addInteractiveHighlightSequence();
  setupHandIconAnimations();
  setAriaAttributes();
});

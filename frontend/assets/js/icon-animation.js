// icon-animation.js
export function animateHandIcon(icon) {
  if (!icon) return;
  icon.animate([
    { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 #353ddcff)' },
    { transform: 'scale(1.2)', filter: 'drop-shadow(0 0 8px #353ddcff)' },
    { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 #353ddcff)' }
  ], {
    duration: 800,
    iterations: 1
  });
}

export function setupHandIconAnimations() {
  document.querySelectorAll('.trans-hands-icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => animateHandIcon(icon));
  });
}

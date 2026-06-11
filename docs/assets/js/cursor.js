/* ═══════════════════════════════════════════════════════════
   CURSOR.JS — Custom magnetic cursor (desktop only)
   ═══════════════════════════════════════════════════════════ */

'use strict';

(function initCursor() {
  // Skip on touch devices or reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (prefersReduced || isTouch) return;

  const cursor    = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  if (!cursor || !cursorRing) return;

  let mx = -100, my = -100; // mouse position
  let rx = -100, ry = -100; // ring position (lags behind)
  let rafId = null;

  // Update cursor dot immediately
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Animate ring with lerp for smooth lag
  function animateRing() {
    const lerp = 0.11;
    rx += (mx - rx) * lerp;
    ry += (my - ry) * lerp;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states on interactive elements
  const interactiveSelectors = [
    'a', 'button', '.service-card', '.project-item',
    '.faq-item__question', '.blog-post-card', '.blog-post--featured',
    '.blog-post--side', '.testimonial-tab', '.filter-btn', '.package-card',
    'input', 'textarea', 'select'
  ].join(', ');

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.add('is-hovering');
      cursorRing.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.remove('is-hovering');
      cursorRing.classList.remove('is-hovering');
    }
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
  });
})();

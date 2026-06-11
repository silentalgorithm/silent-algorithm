/* ═══════════════════════════════════════════════════════════
   UTILS.JS — Shared helpers
   ═══════════════════════════════════════════════════════════ */

"use strict";

/** Debounce: delay execution until after wait ms of inactivity */
function debounce(fn, wait = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Throttle: call at most once per interval */
function throttle(fn, interval = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    }
  };
}

/** Query helper */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Add event listener with auto cleanup */
function on(el, event, handler, options) {
  if (!el) return () => {};
  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
}

/** Parse URL query params into an object */
function getParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

/** Prefill form fields from URL params */
function prefillFromParams() {
  const params = getParams();
  Object.entries(params).forEach(([key, val]) => {
    const el = document.getElementById(key) || qs(`[name="${key}"]`);
    if (el) el.value = decodeURIComponent(val);
  });
}

/** Animate counting up a number */
function animateCount(el, target, duration = 1200) {
  const start = performance.now();
  const isDecimal = String(target).includes(".");
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = isDecimal ? current.toFixed(1) : current;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/** Trap focus inside an element (for modals/mobile menu) */
function trapFocus(container) {
  const focusable = qsa(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    container,
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleTab(e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  container.addEventListener("keydown", handleTab);
  first.focus();
  return () => container.removeEventListener("keydown", handleTab);
}

// Expose globally for other scripts
window.TSA = {
  debounce,
  throttle,
  qs,
  qsa,
  on,
  prefillFromParams,
  animateCount,
  trapFocus,
};

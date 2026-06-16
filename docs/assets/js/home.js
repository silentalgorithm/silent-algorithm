/* ═══════════════════════════════════════════════════════════
   HOME.JS — Home page specific interactions
   ═══════════════════════════════════════════════════════════ */

'use strict';

(function initHome() {
  const { qs, prefillFromParams } = window.TSA;

  // Prefill contact form if URL has query params
  // e.g. /#contacto?servicio=Desarrollo+Web&paquete=Conversión
  prefillFromParams();

  /* ── PARALLAX GRID LINES (subtle) ── */
  const gridLines = qs('.hero__grid-lines');
  if (gridLines && window.matchMedia('(hover: hover)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const offset = window.scrollY * 0.3;
          gridLines.style.transform = `translateY(${offset}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

})();

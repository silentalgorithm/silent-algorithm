/* ═══════════════════════════════════════════════════════════
   NAV.JS — Sticky nav, mobile menu, active link highlighting
   ═══════════════════════════════════════════════════════════ */

"use strict";

(function initNav() {
  const { qs, qsa, on, trapFocus, throttle } = window.TSA;

  const navbar = qs("#navbar");
  const navToggle = qs("#navToggle");
  const mobileMenu = qs("#mobileMenu");
  if (!navbar) return;

  /* ── SCROLL BEHAVIOR ── */
  const onScroll = throttle(() => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 60);
  }, 50);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load

  /* ── MOBILE MENU ── */
  let releaseFocus = null;

  function openMenu() {
    mobileMenu.removeAttribute("hidden");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Cerrar menú");
    document.body.style.overflow = "hidden";
    releaseFocus = trapFocus(mobileMenu);
    mobileMenu.addEventListener("keydown", closeOnEsc);
  }

  function closeMenu() {
    mobileMenu.setAttribute("hidden", "");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú de navegación");
    document.body.style.overflow = "";
    if (releaseFocus) {
      releaseFocus();
      releaseFocus = null;
    }
    mobileMenu.removeEventListener("keydown", closeOnEsc);
    navToggle.focus();
  }

  function closeOnEsc(e) {
    if (e.key === "Escape") closeMenu();
  }

  if (navToggle) {
    on(navToggle, "click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });
  }

  // Close on mobile link click
  qsa(".nav__mobile-link, .nav__mobile a").forEach((link) => {
    on(link, "click", closeMenu);
  });

  /* ── ACTIVE SECTION HIGHLIGHT (home page) ── */
  const sections = qsa("section[id]");
  const navLinks = qsa(".nav__links a");

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              const href = link.getAttribute("href");
              const matches = href === `/#${id}` || href === `#${id}`;
              link.classList.toggle("is-active", matches);
              link.setAttribute("aria-current", matches ? "true" : "false");
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ── SMOOTH SCROLL for anchor links ── */
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"], a[href^="/#"]');
    if (!link) return;

    const href = link.getAttribute("href");
    const hash = href.startsWith("/") ? href.slice(1) : href;
    const target = document.querySelector(hash);
    if (!target) return;

    // Only handle same-page anchors
    if (href.startsWith("/") && window.location.pathname !== "/") return;

    e.preventDefault();
    closeMenu();

    const navH = navbar ? navbar.offsetHeight : 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: "smooth" });

    // Update URL without navigation
    history.pushState(null, "", hash);
  });
})();

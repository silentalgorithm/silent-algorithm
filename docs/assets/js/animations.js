/* ═══════════════════════════════════════════════════════════
   ANIMATIONS.JS — Scroll reveals, FAQ accordion,
                   Testimonial tabs, Project filter
   ═══════════════════════════════════════════════════════════ */

"use strict";

(function initAnimations() {
  const { qsa, qs, animateCount } = window.TSA;

  /* ─────────────────────────────────────────────
     1. SCROLL REVEAL
     ───────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  qsa(".reveal").forEach((el) => revealObserver.observe(el));

  /* ─────────────────────────────────────────────
     2. COUNTER ANIMATION (hero stats)
     ───────────────────────────────────────────── */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) animateCount(el, target, 1400);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );
  qsa("[data-count]").forEach((el) => counterObserver.observe(el));

  /* ─────────────────────────────────────────────
     3. FAQ ACCORDION
     ───────────────────────────────────────────── */
  const faqItems = qsa(".faq-item");

  faqItems.forEach((item) => {
    const btn = qs(".faq-item__question", item);
    const answer = qs(".faq-item__answer", item);
    if (!btn || !answer) return;

    // Init first item open
    if (item === faqItems[0]) {
      btn.setAttribute("aria-expanded", "true");
      answer.removeAttribute("hidden");
    }

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Close all
      faqItems.forEach((other) => {
        const otherBtn = qs(".faq-item__question", other);
        const otherAnswer = qs(".faq-item__answer", other);
        if (otherBtn && otherAnswer) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherAnswer.setAttribute("hidden", "");
        }
      });

      // Open clicked (toggle)
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        answer.removeAttribute("hidden");
        // Animate open
        answer.style.animation = `fadeDown 0.3s var(--ease-snap)`;
        answer.addEventListener(
          "animationend",
          () => {
            answer.style.animation = "";
          },
          { once: true },
        );
      }
    });
  });

  /* ─────────────────────────────────────────────
     4. TESTIMONIAL TABS
     ───────────────────────────────────────────── */
  const tabs = qsa(".testimonial-tab");
  const panels = qsa(".testimonial-panel");

  function activateTestimonial(index) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("testimonial-tab--active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach((panel, i) => {
      const active = i === index;
      panel.classList.toggle("testimonial-panel--active", active);
      panel.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTestimonial(i));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activateTestimonial((i + 1) % tabs.length);
        tabs[(i + 1) % tabs.length].focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        activateTestimonial((i - 1 + tabs.length) % tabs.length);
        tabs[(i - 1 + tabs.length) % tabs.length].focus();
      }
    });
  });

  // Auto-rotate every 6 seconds
  let autoIndex = 0;
  let autoTimer = setInterval(() => {
    if (!document.hidden) {
      autoIndex = (autoIndex + 1) % tabs.length;
      activateTestimonial(autoIndex);
    }
  }, 6000);

  // Pause auto-rotate on manual interaction
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      clearInterval(autoTimer);
      autoIndex = i;
    });
  });

  /* ─────────────────────────────────────────────
     5. PROJECT FILTER
     ───────────────────────────────────────────── */
  const filterBtns = qsa(".filter-btn");
  let projectItems;
  if (qs(".project-item")) {
    projectItems = qsa(".project-item");
  } else {
    projectItems = qsa(".blog-post-card");
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      // Update button states
      filterBtns.forEach((b) => {
        b.classList.remove("filter-btn--active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("filter-btn--active");
      btn.setAttribute("aria-selected", "true");

      // Show/hide projects with animation
      projectItems.forEach((item) => {
        const matches = filter === "todos" || item.dataset.categoria === filter;
        if (matches) {
          item.removeAttribute("data-hidden");
          item.style.animation = `fadeIn 0.4s var(--ease-snap)`;
          item.addEventListener(
            "animationend",
            () => {
              item.style.animation = "";
            },
            { once: true },
          );
        } else {
          item.setAttribute("data-hidden", "");
        }
      });
    });
  });

  /* ─────────────────────────────────────────────
     6. PAGE TRANSITION OUT
     ───────────────────────────────────────────── */
  const overlay = qs("#pageTransition");
  if (overlay) {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");

      // Only same-origin, non-anchor, non-download links
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("/#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http") ||
        link.hasAttribute("download") ||
        link.target === "_blank"
      ) {
        return;
      }
      if (link.origin && link.origin !== location.origin) return;

      e.preventDefault();
      overlay.classList.add("is-entering");
      overlay.addEventListener(
        "animationend",
        () => {
          window.location.href = href;
        },
        { once: true },
      );
    });
  }
})();

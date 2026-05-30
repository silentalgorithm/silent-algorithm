/* ═══════════════════════════════════════════════════════════
   CONTACT-FORM.JS — Validation, submission, UX feedback
   ═══════════════════════════════════════════════════════════ */

"use strict";

(function initContactForm() {
  const { qs } = window.TSA;

  const form = qs("#contactForm");
  const submitBtn = qs("#formSubmit");
  const statusEl = qs("#formStatus");
  if (!form) return;

  /* ── VALIDATION RULES ── */
  const rules = {
    nombre: { required: true, minLength: 2, label: "El nombre" },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      label: "El email",
    },
    servicio: { required: true, label: "El servicio" },
    mensaje: { required: true, minLength: 20, label: "El mensaje" },
  };

  function validateField(name, value) {
    const rule = rules[name];
    if (!rule) return "";
    value = value.trim();
    if (rule.required && !value) return `${rule.label} es requerido.`;
    if (rule.minLength && value.length < rule.minLength)
      return `${rule.label} debe tener al menos ${rule.minLength} caracteres.`;
    if (rule.pattern && !rule.pattern.test(value))
      return `${rule.label} no tiene un formato válido.`;
    return "";
  }

  function showFieldError(name, message) {
    const input = form.querySelector(`[name="${name}"]`);
    const error = form.querySelector(`#${name}-error`);
    if (input) input.classList.toggle("is-invalid", !!message);
    if (error) error.textContent = message;
  }

  function clearFieldError(name) {
    showFieldError(name, "");
  }

  /* ── LIVE VALIDATION on blur ── */
  Object.keys(rules).forEach((name) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;
    input.addEventListener("blur", () => {
      const err = validateField(name, input.value);
      showFieldError(name, err);
    });
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid")) {
        const err = validateField(name, input.value);
        showFieldError(name, err);
      }
    });
  });

  /* ── ANTI-SPAM honeypot check ── */
  function isBot() {
    const hp = form.querySelector('[name="website"]');
    return hp && hp.value.length > 0;
  }

  /* ── LOADING STATE ── */
  function setLoading(loading) {
    const textEl = qs(".form__submit-text", form);
    const loadingEl = qs(".form__submit-loading", form);
    submitBtn.disabled = loading;
    if (textEl) textEl.hidden = loading;
    if (loadingEl) loadingEl.hidden = !loading;
  }

  /* ── STATUS MESSAGE ── */
  function showStatus(message, type = "success") {
    statusEl.textContent = message;
    statusEl.className = `form__status is-${type}`;
    statusEl.hidden = false;
    statusEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ── SUBMIT ── */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot check
    if (isBot()) return;

    // Validate all fields
    let hasErrors = false;
    Object.keys(rules).forEach((name) => {
      const input = form.querySelector(`[name="${name}"]`);
      const err = validateField(name, input ? input.value : "");
      showFieldError(name, err);
      if (err) hasErrors = true;
    });
    if (hasErrors) {
      const firstError = form.querySelector(".is-invalid");
      if (firstError) firstError.focus();
      return;
    }

    setLoading(true);
    statusEl.hidden = true;

    // Collect form data
    const data = Object.fromEntries(new FormData(form));
    delete data.website; // remove honeypot

    try {
      /*
      
       * ── PRODUCTION INTEGRATION ──────────────────────────────
       * Replace with your backend endpoint, Formspree, or Netlify Forms.
       *
       * Example with Formspree:
       *   const res = await fetch('https://formspree.io/f/YOUR_ID', {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
       *     body: JSON.stringify(data)
       *   });
       *   if (!res.ok) throw new Error('Server error');
       *
       * Example with Netlify Forms:
       *   Add data-netlify="true" to the <form> tag.
       *   Add an input: <input type="hidden" name="form-name" value="contactForm">
       * ────────────────────────────────────────────────────────
       */
      // https://github.com/github/fetch
      const res = await fetch(
        // "https://formsubmit.co/ajax/cf4613eefdedda49610cc78124d20ff1",
        "https://formsubmit.co/ajax/mmnlcarvajal@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) throw new Error("Server error");

      // Development simulation
      await new Promise((r) => setTimeout(r, 1200));
      // console.log("[TSA] Form submission:", data);

      // Success
      form.reset();
      showStatus(
        "✓ Mensaje enviado. Te contactaremos en menos de 24 horas. ¡Gracias!",
        "success",
      );
      localStorage.removeItem("dataform");

      // Track conversion (analytics)
      if (window.gtag)
        window.gtag("event", "form_submit", { event_category: "contact" });
    } catch (err) {
      console.error("[TSA] Form error:", err);
      showStatus(
        "Hubo un error al enviar el mensaje. Por favor intenta de nuevo o escríbenos directamente a secreto@thesilentalgorithm.com",
        "error",
      );
    } finally {
      setLoading(false);
    }
  });
})();

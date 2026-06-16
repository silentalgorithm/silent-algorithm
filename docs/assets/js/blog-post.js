/* ═══════════════════════════════════════════════════════════
   BLOG-POST.JS — TOC generation, reading progress, code copy
   ═══════════════════════════════════════════════════════════ */

'use strict';

(function initBlogPost() {
  const { qs, qsa } = window.TSA;

  /* ── READING PROGRESS BAR ── */
  const article = qs('.article__content');
  if (article) {
    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Progreso de lectura');
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const articleTop    = article.getBoundingClientRect().top + window.scrollY;
      const articleBottom = articleTop + article.offsetHeight;
      const scrolled      = window.scrollY + window.innerHeight;
      const progress      = Math.max(0, Math.min(1,
        (window.scrollY - articleTop) / (articleBottom - articleTop - window.innerHeight)
      ));
      bar.style.transform = `scaleX(${progress})`;
      bar.setAttribute('aria-valuenow', Math.round(progress * 100));
    }, { passive: true });
  }

  /* ── TABLE OF CONTENTS ── */
  const tocContainer = qs('#toc');
  const contentArea  = qs('.article__content');

  if (tocContainer && contentArea) {
    const headings = qsa('h2, h3', contentArea);
    if (headings.length >= 2) {
      const fragment = document.createDocumentFragment();

      headings.forEach((heading, i) => {
        // Ensure heading has an ID
        if (!heading.id) {
          heading.id = `heading-${i}-${heading.textContent
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 40)}`;
        }

        const link = document.createElement('a');
        link.href      = `#${heading.id}`;
        link.className = `toc-link toc-link--${heading.tagName.toLowerCase()}`;
        link.textContent = heading.textContent.replace(/#$/, '').trim();
        if (heading.tagName === 'H3') link.style.paddingLeft = 'var(--space-8)';
        fragment.appendChild(link);
      });

      tocContainer.appendChild(fragment);

      /* Active TOC highlight on scroll */
      const tocLinks = qsa('.toc-link', tocContainer);
      const headingEls = headings;

      const tocObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              tocLinks.forEach(l => l.classList.remove('is-active'));
              const activeLink = tocContainer.querySelector(`a[href="#${entry.target.id}"]`);
              if (activeLink) activeLink.classList.add('is-active');
            }
          });
        },
        { rootMargin: '-10% 0px -80% 0px' }
      );
      headingEls.forEach(h => tocObserver.observe(h));
    } else {
      // Hide TOC if too few headings
      const tocWrapper = qs('.article__toc');
      if (tocWrapper) tocWrapper.style.display = 'none';
    }
  }

  /* ── CODE BLOCK COPY BUTTON ── */
  qsa('pre', contentArea || document).forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const copyBtn = document.createElement('button');
    copyBtn.className  = 'code-copy-btn';
    copyBtn.textContent = 'Copiar';
    copyBtn.setAttribute('aria-label', 'Copiar código');
    copyBtn.style.cssText = `
      position: absolute; top: 12px; right: 12px;
      font-family: var(--ff-mono); font-size: 0.6rem; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--smoke); background: var(--dusk);
      border: 1px solid rgba(255,255,255,0.08); padding: 4px 10px; cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
    `;
    wrapper.appendChild(copyBtn);

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        copyBtn.textContent = '✓ Copiado';
        copyBtn.style.color = 'var(--gold)';
        setTimeout(() => {
          copyBtn.textContent = 'Copiar';
          copyBtn.style.color = 'var(--smoke)';
        }, 2000);
      } catch {
        copyBtn.textContent = 'Error';
      }
    });
  });

})();

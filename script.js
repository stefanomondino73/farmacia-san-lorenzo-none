/* ============================================================
   FARMACIA SAN LORENZO - script.js
   Vanilla JS, no jQuery.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ===== Cookie consent (GDPR) ===== */
  (function () {
    var KEY = 'cookieConsent_v1';
    var banner = document.getElementById('cookie-banner');
    var prefs = document.getElementById('cookie-prefs');
    var reopen = document.getElementById('cookie-reopen');
    if (!banner || !prefs || !reopen) return;

    var catInputs = prefs.querySelectorAll('input[data-cookie-cat]');

    function readConsent() {
      try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
    }
    function activateScripts(consent) {
      // Scripts held as type="text/plain" data-cookie-cat="analytics|marketing"
      // are injected only after consent for that category.
      document.querySelectorAll('script[type="text/plain"][data-cookie-cat]').forEach(function (s) {
        var cat = s.getAttribute('data-cookie-cat');
        if (consent[cat] && !s.dataset.activated) {
          var n = document.createElement('script');
          if (s.src) n.src = s.src; else n.textContent = s.textContent;
          document.head.appendChild(n);
          s.dataset.activated = '1';
        }
      });
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }));
    }
    function saveConsent(consent) {
      consent.necessary = true;
      consent.ts = new Date().toISOString();
      consent.v = 1;
      localStorage.setItem(KEY, JSON.stringify(consent));
      activateScripts(consent);
    }
    function showBanner() { banner.hidden = false; reopen.hidden = true; }
    function hideBanner() { banner.hidden = true; reopen.hidden = false; }
    function openPrefs() {
      var c = readConsent() || {};
      catInputs.forEach(function (i) { i.checked = !!c[i.getAttribute('data-cookie-cat')]; });
      prefs.hidden = false;
    }
    function closePrefs() { prefs.hidden = true; }

    function acceptAll() {
      var c = { necessary: true };
      catInputs.forEach(function (i) { c[i.getAttribute('data-cookie-cat')] = true; });
      saveConsent(c); hideBanner(); closePrefs();
    }
    function rejectAll() {
      var c = { necessary: true };
      catInputs.forEach(function (i) { c[i.getAttribute('data-cookie-cat')] = false; });
      saveConsent(c); hideBanner(); closePrefs();
    }
    function savePrefs() {
      var c = { necessary: true };
      catInputs.forEach(function (i) { c[i.getAttribute('data-cookie-cat')] = i.checked; });
      saveConsent(c); hideBanner(); closePrefs();
    }

    document.querySelectorAll('[data-cookie-action]').forEach(function (el) {
      el.addEventListener('click', function () {
        switch (el.getAttribute('data-cookie-action')) {
          case 'accept': acceptAll(); break;
          case 'reject': rejectAll(); break;
          case 'customize': openPrefs(); break;
          case 'save': savePrefs(); break;
          case 'close-prefs': closePrefs(); break;
        }
      });
    });
    prefs.addEventListener('click', function (e) { if (e.target === prefs) closePrefs(); });
    reopen.addEventListener('click', openPrefs);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !prefs.hidden) closePrefs();
    });

    var existing = readConsent();
    if (existing) { activateScripts(existing); hideBanner(); }
    else { showBanner(); }
  })();

  /* ===== Ingressi soft allo scroll (discreto, IntersectionObserver) ===== */
  (function () {
    window.__reveal = true; // segnala al failsafe inline che l'observer è attivo
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var selector = [
      '.hero-photo',
      '.fraseadeffetto > .container',
      '.fraseadeffetto2 > .container',
      '.fraseadeffetto3 > .container',
      '#reparti > h1',
      '.mortar-wrap',
      '#portfolio-item-container',
      '.servizio',
      '.scroll-gallery-group',
      '#orari .table-responsive',
      '.map-wrap',
      '.page-header',
      '.page-hero',
      '.timeline-item',
      '.pullquote > .container',
      '.approccio-intro',
      '.valore',
      '.team-intro',
      '.team-card'
    ].join(', ');
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ===== Hours notice banner ===== */
  const hoursBanner = document.getElementById('hours-banner');
  const hoursBannerClose = document.getElementById('hours-banner-close');
  if (hoursBanner && hoursBannerClose) {
    if (localStorage.getItem('hoursBannerDismissed') === '1') {
      hoursBanner.classList.add('hidden');
    }
    hoursBannerClose.addEventListener('click', function () {
      hoursBanner.classList.add('hidden');
      localStorage.setItem('hoursBannerDismissed', '1');
    });
  }

  /* ===== Mobile navbar toggle ===== */
  const toggle = document.querySelector('.navbar-toggle');
  const collapse = document.querySelector('.navbar-collapse');
  if (toggle && collapse) {
    toggle.addEventListener('click', function () {
      collapse.classList.toggle('open');
    });
    // chiudi menu su click voce
    collapse.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => collapse.classList.remove('open'));
    });
  }

  /* ===== Scroll-to-top button ===== */
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 400) scrollBtn.classList.add('visible');
      else scrollBtn.classList.remove('visible');
    });
    scrollBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== Lightbox gallery (chi-siamo) ===== */
  const gallery = document.getElementById('gallery');
  if (gallery) {
    // crea overlay
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Chiudi">×</button><img alt="">';
    document.body.appendChild(overlay);

    const overlayImg = overlay.querySelector('img');
    const closeBtn = overlay.querySelector('.lightbox-close');

    gallery.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', function () {
        const src = li.getAttribute('data-src') || li.querySelector('img').src;
        overlayImg.src = src;
        overlay.classList.add('open');
      });
    });

    function closeLightbox() { overlay.classList.remove('open'); overlayImg.src = ''; }
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeLightbox();
    });
  }

  /* ===== Card reparti: flip 3D su tap/tastiera (hover gestito da CSS) ===== */
  const repartoCards = document.querySelectorAll('.reparto-card');
  if (repartoCards.length) {
    repartoCards.forEach(function (card) {
      card.addEventListener('click', function () {
        const wasOpen = card.classList.contains('is-open');
        repartoCards.forEach(function (c) { c.classList.remove('is-open'); });
        if (!wasOpen) card.classList.add('is-open');
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  /* ===== Rimuovi loader overlay residuo ===== */
  const loader = document.querySelector('.boss-loader-overlay');
  if (loader) loader.remove();

});

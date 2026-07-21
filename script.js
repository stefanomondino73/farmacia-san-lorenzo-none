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

  /* ===== Avviso orari: popup all'ingresso (punto 8) =====
     Esce a ogni ingresso nel sito. Niente localStorage: prima la chiusura
     salvava un flag permanente e il popup non tornava mai più.
     Unica eccezione: la navigazione interna fra le pagine, altrimenti
     ricomparirebbe a ogni clic del menu. */
  (function () {
    var daAltraPagina = false;
    try {
      daAltraPagina = !!document.referrer &&
                      new URL(document.referrer).host === location.host;
    } catch (e) { daAltraPagina = false; }

    /* Un ricaricamento (F5) o un back/forward valgono come nuovo ingresso:
       si sopprime solo il clic da un'altra pagina del sito. */
    var nav = (performance.getEntriesByType &&
               performance.getEntriesByType('navigation')[0]) || null;
    var ricaricata = nav ? (nav.type === 'reload' || nav.type === 'back_forward') : false;

    if (daAltraPagina && !ricaricata) return;
    var overlay = document.createElement('div');
    overlay.className = 'hours-modal-overlay';
    overlay.innerHTML =
      '<div class="hours-modal" role="dialog" aria-modal="true" aria-labelledby="hm-title">' +
        '<button class="hours-modal-close" aria-label="Chiudi avviso">&times;</button>' +
        '<div class="hours-modal-head">' +
          '<span class="hours-modal-badge" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5.2l3.4 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</span>' +
          '<p class="hours-modal-eyebrow">Avviso alla clientela</p>' +
          '<h2 id="hm-title">Da settembre cambiano gli orari</h2>' +
        '</div>' +
        '<div class="hours-modal-body">' +
          '<ul class="hours-modal-list">' +
            '<li><span class="hm-day">Luned&igrave;</span><span class="hm-time">08:30&ndash;12:30 &middot; 15:30&ndash;19:30</span></li>' +
            '<li><span class="hm-day">Sabato</span><span class="hm-time">08:30&ndash;12:30</span></li>' +
          '</ul>' +
          '<button class="btn hours-modal-ok">Ho capito</button>' +
        '</div>' +
      '</div>';
    function close() {
      overlay.classList.remove('open');
      /* nessun flag salvato: al prossimo ingresso l'avviso torna a comparire */
      setTimeout(function () { if (overlay.parentNode) overlay.remove(); }, 300);
    }
    document.body.appendChild(overlay);
    void overlay.offsetWidth; // forza il reflow: la transizione parte in modo affidabile
    overlay.classList.add('open');
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.hours-modal-close').addEventListener('click', close);
    overlay.querySelector('.hours-modal-ok').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();

  /* ===== Evidenzia il giorno corrente negli orari (giallo) ===== */
  (function () {
    var today = new Date().getDay(); // 0 = Domenica ... 6 = Sabato
    document.querySelectorAll('[data-day]').forEach(function (el) {
      if (parseInt(el.getAttribute('data-day'), 10) === today) el.classList.add('is-today');
    });
  })();

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

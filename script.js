/* ============================================================
   FARMACIA SAN LORENZO - script.js
   Vanilla JS, no jQuery.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

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

  /* ===== Rimuovi loader overlay residuo ===== */
  const loader = document.querySelector('.boss-loader-overlay');
  if (loader) loader.remove();

});

/* NECTA EPK — interactions */
(function () {
  'use strict';

  var root = document.documentElement;
  var nav = document.getElementById('siteNav');
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');

  /* ---------- language ---------- */
  var langBtns = document.querySelectorAll('[data-set-lang]');

  var LANGS = { en: 'en', kr: 'ko', es: 'es', jp: 'ja', de: 'de' };

  function setLang(lang) {
    if (!LANGS[lang]) lang = 'en';
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', LANGS[lang]);
    langBtns.forEach(function (b) {
      var on = b.getAttribute('data-set-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem('necta-lang', lang); } catch (e) {}
  }

  langBtns.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); });
  });

  try {
    var saved = localStorage.getItem('necta-lang');
    if (saved && LANGS[saved]) setLang(saved);
  } catch (e) {}

  /* ---------- hero photo slideshow (manual only) ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var heroPrev = document.getElementById('heroPrev');
  var heroNext = document.getElementById('heroNext');
  var heroCount = document.getElementById('heroCount');
  var heroMedia = document.querySelector('.hero-media');
  var slideIndex = 0;

  function showSlide(n) {
    if (!slides.length) return;
    slideIndex = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === slideIndex); });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === slideIndex);
      if (i === slideIndex) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    if (heroCount) heroCount.textContent = String(slideIndex + 1);
  }

  if (slides.length) {
    showSlide(0);
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { showSlide(i); });
    });
    if (heroPrev) heroPrev.addEventListener('click', function () { showSlide(slideIndex - 1); });
    if (heroNext) heroNext.addEventListener('click', function () { showSlide(slideIndex + 1); });

    /* swipe / drag on the photo */
    if (heroMedia) {
      var sx = null;
      heroMedia.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        sx = e.clientX;
      });
      heroMedia.addEventListener('pointerup', function (e) {
        if (sx === null) return;
        var dx = e.clientX - sx;
        sx = null;
        if (Math.abs(dx) > 36) showSlide(slideIndex + (dx < 0 ? 1 : -1));
      });
      heroMedia.addEventListener('pointercancel', function () { sx = null; });
      heroMedia.addEventListener('pointerleave', function () { sx = null; });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (nav.classList.contains('is-open')) return;
      showSlide(slideIndex + (e.key === 'ArrowRight' ? 1 : -1));
    });
  }

  /* ---------- nav: scrolled state ---------- */
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- nav: index overlay ---------- */
  function closeMenu() {
    nav.classList.remove('is-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('is-locked', open);
    });
  }
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
  });

  /* ---------- nav: current section ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var linkFor = {};
  navLinks.querySelectorAll('a').forEach(function (a) {
    linkFor[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        Object.keys(linkFor).forEach(function (k) {
          linkFor[k].classList.toggle('is-current', k === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- back to top with no hash jump ---------- */
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

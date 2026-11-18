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

  /* ---------- track 5 inline player ---------- */
  var trPlay = document.getElementById('trPlay');
  var trAudio = document.getElementById('trAudio');

  if (trPlay && trAudio) {
    trPlay.addEventListener('click', function () {
      if (trAudio.paused) {
        var pr = trAudio.play();
        if (pr && pr.catch) pr.catch(function () {});
      } else {
        trAudio.pause();
      }
    });
    trAudio.addEventListener('play', function () {
      trPlay.classList.add('is-on');
      trPlay.setAttribute('aria-label', 'Pause GOTTA FIX MY BANGS');
    });
    function trReset() {
      trPlay.classList.remove('is-on');
      trPlay.setAttribute('aria-label', 'Play GOTTA FIX MY BANGS');
    }
    trAudio.addEventListener('pause', trReset);
    trAudio.addEventListener('ended', function () { trReset(); trAudio.currentTime = 0; });
  }

  /* ---------- custom cursor (fine pointer only) ---------- */
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    var cimg = document.createElement('img');
    cimg.src = 'assets/cursor-necta.png';
    cimg.alt = '';
    cimg.setAttribute('aria-hidden', 'true');
    cursor.appendChild(cimg);
    document.body.appendChild(cursor);

    var cx = -120, cy = -120, tx = -120, ty = -120, raf = null, live = false;

    function cursorLoop() {
      cx += (tx - cx) * 0.35;
      cy += (ty - cy) * 0.35;
      cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      raf = requestAnimationFrame(cursorLoop);
    }

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!live) {
        live = true;
        cx = tx; cy = ty;
        cursor.style.opacity = '1';
        document.body.classList.add('cursor-on');
        if (!raf) cursorLoop();
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      live = false;
      cursor.style.opacity = '0';
      document.body.classList.remove('cursor-on');
      cursor.classList.remove('is-falling');
    });

    document.addEventListener('mousedown', function () { cursor.classList.add('is-falling'); });
    document.addEventListener('mouseup', function () {
      window.setTimeout(function () { cursor.classList.remove('is-falling'); }, 140);
    });
  }

  /* ---------- back to top with no hash jump ---------- */
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

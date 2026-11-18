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

  /* ---------- hero photo slideshow ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var slideIndex = 0;
  var slideTimer = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(n) {
    slideIndex = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === slideIndex); });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === slideIndex);
      if (i === slideIndex) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  function startSlides() {
    if (slideTimer) clearInterval(slideTimer);
    if (reduceMotion || slides.length < 2) return;
    slideTimer = setInterval(function () {
      if (document.hidden) return;
      showSlide(slideIndex + 1);
    }, 4420);
  }

  if (slides.length) {
    showSlide(0);
    startSlides();
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { showSlide(i); startSlides(); });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (slideTimer) clearInterval(slideTimer); slideTimer = null; }
      else startSlides();
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

  /* ---------- mini player: HTML5 audio ---------- */
  var mp = document.getElementById('miniPlayer');
  var mpAudio = document.getElementById('mpAudio');

  if (mp && mpAudio) {
    var mpPlayBtn = document.getElementById('mpPlay');
    var mpLabel = document.getElementById('mpLabel');
    var mpIco = document.getElementById('mpIco');
    var mpSeek = document.getElementById('mpSeek');
    var mpProg = document.getElementById('mpProg');
    var mpTime = document.getElementById('mpTime');

    function mpClock(s) {
      if (!isFinite(s) || s < 0) s = 0;
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function mpPaint() {
      var d = mpAudio.duration;
      var t = mpAudio.currentTime || 0;
      var pct = d ? Math.min(100, (t / d) * 100) : 0;
      mpProg.style.width = pct + '%';
      mpSeek.setAttribute('aria-valuenow', String(Math.round(pct)));
      mpTime.textContent = mpClock(t) + ' / ' + mpClock(d);
    }

    function mpState(state) {
      var playing = state === 'playing';
      mp.setAttribute('data-state', state);
      mpPlayBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      mpLabel.textContent = playing ? 'Pause' : 'Play';
      mpIco.textContent = playing ? '❚❚' : '▶';
    }

    mpPlayBtn.addEventListener('click', function () {
      if (mpAudio.paused) {
        var p = mpAudio.play();
        if (p && p.catch) p.catch(function () { mpState('paused'); });
      } else {
        mpAudio.pause();
      }
    });

    mpAudio.addEventListener('play', function () { mpState('playing'); });
    mpAudio.addEventListener('pause', function () { mpState('paused'); });
    mpAudio.addEventListener('ended', function () {
      mpState('paused');
      mpAudio.currentTime = 0;
      mpPaint();
    });
    mpAudio.addEventListener('loadedmetadata', mpPaint);
    mpAudio.addEventListener('durationchange', mpPaint);
    mpAudio.addEventListener('timeupdate', mpPaint);

    mpSeek.addEventListener('click', function (e) {
      var r = mpSeek.getBoundingClientRect();
      var d = mpAudio.duration;
      if (!d || !r.width) return;
      var ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      mpAudio.currentTime = ratio * d;
      mpPaint();
    });
    mpSeek.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var step = e.key === 'ArrowRight' ? 5 : -5;
      mpAudio.currentTime = Math.min(mpAudio.duration || 0, Math.max(0, (mpAudio.currentTime || 0) + step));
      mpPaint();
    });

    mpPaint();
    mpState('paused');
  }

  /* ---------- back to top with no hash jump ---------- */
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

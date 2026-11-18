/* NECTA EPK — interactions */
(function () {
  'use strict';

  var root = document.documentElement;
  var nav = document.getElementById('siteNav');
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');

  /* ---------- language ---------- */
  var langBtns = document.querySelectorAll('[data-set-lang]');

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'kr' ? 'ko' : 'en');
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
    if (saved === 'kr' || saved === 'en') setLang(saved);
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

  /* ---------- nav: mobile menu ---------- */
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

    /* ---------- reveal on scroll ---------- */
    var reveals = document.querySelectorAll('.reveal');
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          revObs.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- lightbox ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbCount = document.getElementById('lbCount');
  var lbDl = document.getElementById('lbDl');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbClose = document.getElementById('lbClose');
  var current = 0;
  var lastFocus = null;

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  function shotData(i) {
    var fig = shots[i];
    var img = fig.querySelector('img');
    var dl = fig.querySelector('.dl');
    var cap = fig.querySelector('.shot-cap');
    return {
      large: img.getAttribute('srcset').split(',')[1].trim().split(' ')[0],
      alt: img.getAttribute('alt') || '',
      full: dl.getAttribute('href'),
      name: dl.getAttribute('download'),
      caption: cap.innerHTML
    };
  }

  function render(i) {
    current = (i + shots.length) % shots.length;
    var d = shotData(current);
    lbImg.src = d.large;
    lbImg.alt = d.alt;
    lbImg.classList.remove('is-zoomed');
    lbCap.innerHTML = d.caption;
    lbCount.textContent = pad(current + 1) + ' / ' + pad(shots.length);
    lbDl.setAttribute('href', d.full);
    lbDl.setAttribute('download', d.name);
  }

  function openLb(i) {
    lastFocus = document.activeElement;
    render(i);
    lb.hidden = false;
    document.body.classList.add('is-locked');
    lbClose.focus();
  }

  function closeLb() {
    lb.hidden = true;
    document.body.classList.remove('is-locked');
    lbImg.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }

  shots.forEach(function (fig, i) {
    var btn = fig.querySelector('.shot-btn');
    btn.addEventListener('click', function () { openLb(i); });
  });

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', function () { render(current - 1); });
  lbNext.addEventListener('click', function () { render(current + 1); });
  lbImg.addEventListener('click', function () { lbImg.classList.toggle('is-zoomed'); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') render(current - 1);
    else if (e.key === 'ArrowRight') render(current + 1);
  });

  /* swipe on mobile */
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 55) render(current + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });

  /* ---------- video player ---------- */
  var player = document.getElementById('player');
  var playerPoster = document.getElementById('playerPoster');
  var playerFrame = document.getElementById('playerFrame');
  var playerNow = document.getElementById('playerNow');
  var vcards = Array.prototype.slice.call(document.querySelectorAll('.vcard'));
  var activeCard = document.querySelector('.vcard.is-active') || vcards[0];

  function playVideo(id, title) {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
    f.title = 'NECTA — ' + title;
    f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.setAttribute('allowfullscreen', '');
    playerFrame.innerHTML = '';
    playerFrame.appendChild(f);
    playerFrame.hidden = false;
    playerPoster.style.display = 'none';
    playerNow.textContent = title;
    vcards.forEach(function (c) {
      c.classList.toggle('is-active', c.getAttribute('data-id') === id);
    });
  }

  if (playerPoster) {
    playerPoster.addEventListener('click', function () {
      playVideo(activeCard.getAttribute('data-id'), activeCard.getAttribute('data-title'));
    });
  }

  vcards.forEach(function (card) {
    card.addEventListener('click', function () {
      var id = card.getAttribute('data-id');
      activeCard = card;
      playVideo(id, card.getAttribute('data-title'));
      var r = player.getBoundingClientRect();
      if (r.top < 70 || r.bottom > window.innerHeight) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* ============================================================
     MINI PLAYER BAR (HTML5 audio — GOTTA FIX MY BANGS)
     ============================================================ */
  var mp = document.getElementById('miniPlayer');
  var mpAudio = document.getElementById('mpAudio');

  if (mp && mpAudio) {
    var mpPlayBtn = document.getElementById('mpPlay');
    var mpSeek = document.getElementById('mpSeek');
    var mpProg = document.getElementById('mpProg');
    var mpTime = document.getElementById('mpTime');
    var mpMute = document.getElementById('mpMute');
    var mpVol = document.getElementById('mpVol');

    function mpFmt(s) {
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
      mpTime.textContent = mpFmt(t) + ' / ' + mpFmt(d);
    }

    function mpSetState(state) {
      mp.setAttribute('data-state', state);
      mpPlayBtn.setAttribute('aria-label', state === 'playing' ? 'Pause' : 'Play');
    }

    function mpStopStageVideo() {
      if (!playerFrame || playerFrame.hidden) return;
      playerFrame.innerHTML = '';
      playerFrame.hidden = true;
      if (playerPoster) playerPoster.style.display = '';
    }

    mpPlayBtn.addEventListener('click', function () {
      if (mpAudio.paused) {
        mpStopStageVideo();
        var p = mpAudio.play();
        if (p && p.catch) p.catch(function () { mpSetState('paused'); });
      } else {
        mpAudio.pause();
      }
    });

    mpAudio.addEventListener('play', function () { mpSetState('playing'); });
    mpAudio.addEventListener('pause', function () { mpSetState('paused'); });
    mpAudio.addEventListener('ended', function () { mpSetState('paused'); mpAudio.currentTime = 0; mpPaint(); });
    mpAudio.addEventListener('loadedmetadata', mpPaint);
    mpAudio.addEventListener('durationchange', mpPaint);
    mpAudio.addEventListener('timeupdate', mpPaint);

    function mpSeekTo(clientX) {
      var r = mpSeek.getBoundingClientRect();
      var d = mpAudio.duration;
      if (!d || !r.width) return;
      var ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      mpAudio.currentTime = ratio * d;
      mpPaint();
    }

    mpSeek.addEventListener('click', function (e) { mpSeekTo(e.clientX); });
    mpSeek.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var step = e.key === 'ArrowRight' ? 5 : -5;
      mpAudio.currentTime = Math.min(mpAudio.duration || 0, Math.max(0, (mpAudio.currentTime || 0) + step));
      mpPaint();
    });

    function mpApplyMute() {
      var muted = mpAudio.muted || mpAudio.volume === 0;
      mpMute.setAttribute('aria-pressed', muted ? 'true' : 'false');
      mpMute.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
      mp.classList.toggle('is-muted', muted);
    }

    mpMute.addEventListener('click', function () {
      if (mpAudio.muted || mpAudio.volume === 0) {
        mpAudio.muted = false;
        if (mpAudio.volume === 0) {
          mpAudio.volume = 1;
          if (mpVol) mpVol.value = 100;
        }
      } else {
        mpAudio.muted = true;
      }
      mpApplyMute();
    });

    if (mpVol) {
      mpVol.addEventListener('input', function () {
        var v = Number(mpVol.value) / 100;
        mpAudio.volume = v;
        mpAudio.muted = v === 0;
        mpApplyMute();
      });
    }

    /* the section video player and the bar never play over each other */
    var basePlayVideo = playVideo;
    playVideo = function (id, title) {
      if (!mpAudio.paused) mpAudio.pause();
      basePlayVideo(id, title);
    };

    mpPaint();
    mpApplyMute();
  }

  /* ---------- back to top with no hash jump ---------- */
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

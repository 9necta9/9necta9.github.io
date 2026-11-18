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
     MINI PLAYER BAR (YouTube IFrame API)
     ============================================================ */
  var mp = document.getElementById('miniPlayer');

  if (mp) {
    var mpTracks = [
      { id: 'TMpNwV3jur4', title: 'TONGUES ON FIRE (feat. YOUHA)' },
      { id: 'tYMHT1vPHUU', title: 'PUT THEM IN SHOYU' },
      { id: 'aIJ7ihRCS7Q', title: 'LOVEY DOVEY' },
      { id: 'i40SDQeMpcI', title: 'THE BOY IS MINE' },
      { id: 'QNnZcBhI2BM', title: 'GIRLHOOD' },
      { id: 'iCM2_iZ6-JE', title: 'SEOUL BIZARRE' }
    ];
    var mpPlayBtn = document.getElementById('mpPlay');
    var mpPrevBtn = document.getElementById('mpPrev');
    var mpNextBtn = document.getElementById('mpNext');
    var mpTitleEl = document.getElementById('mpTitle');
    var mpIdxEl = document.getElementById('mpIdx');
    var mpProgEl = document.getElementById('mpProg');
    var mpIndex = 0;
    var mpPlayer = null;
    var mpReady = false;
    var mpApiRequested = false;
    var mpApiCallback = null;
    var mpPending = false;
    var mpProgTimer = null;

    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    function mpRender() {
      mpTitleEl.textContent = mpTracks[mpIndex].title;
      mpIdxEl.textContent = pad2(mpIndex + 1) + ' / ' + pad2(mpTracks.length);
      mpPlayBtn.setAttribute('aria-label', mp.getAttribute('data-state') === 'playing' ? 'Pause' : 'Play');
    }

    function mpSetState(state) {
      mp.setAttribute('data-state', state);
      mpPlayBtn.setAttribute('aria-label', state === 'playing' ? 'Pause' : 'Play');
      if (state === 'playing') {
        if (!mpProgTimer) {
          mpProgTimer = setInterval(function () {
            if (!mpPlayer || !mpPlayer.getDuration) return;
            var d = mpPlayer.getDuration();
            var t = mpPlayer.getCurrentTime();
            mpProgEl.style.width = (d ? Math.min(100, (t / d) * 100) : 0) + '%';
          }, 400);
        }
      } else if (mpProgTimer) {
        clearInterval(mpProgTimer);
        mpProgTimer = null;
      }
    }

    function mpStopStageVideo() {
      if (!playerFrame || playerFrame.hidden) return;
      playerFrame.innerHTML = '';
      playerFrame.hidden = true;
      if (playerPoster) playerPoster.style.display = '';
    }

    function mpPauseSilently() {
      if (mpPlayer && mp.getAttribute('data-state') === 'playing') {
        try { mpPlayer.pauseVideo(); } catch (e) {}
      }
    }

    function mpSyncCard(id) {
      vcards.forEach(function (c) {
        c.classList.toggle('is-active', c.getAttribute('data-id') === id);
      });
    }

    function mpOnState(e) {
      if (e.data === 1) { mpSetState('playing'); mpSyncCard(mpTracks[mpIndex].id); }
      else if (e.data === 2 || e.data === 5) mpSetState('paused');
      else if (e.data === 0) { mpIndex = (mpIndex + 1) % mpTracks.length; mpRender(); mpPlayer.loadVideoById(mpTracks[mpIndex].id); }
    }

    function mpCreatePlayer() {
      mpPlayer = new window.YT.Player('mpYt', {
        width: 240,
        height: 135,
        videoId: mpTracks[mpIndex].id,
        playerVars: {
          autoplay: 0, controls: 0, playsinline: 1, rel: 0, modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            mpReady = true;
            if (mpPending) {
              mpPending = false;
              e.target.playVideo();
            }
          },
          onStateChange: mpOnState
        }
      });
    }

    function mpLoadApi() {
      if (mpApiRequested) return;
      mpApiRequested = true;
      var s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      document.head.appendChild(s);
    }

    window.onYouTubeIframeAPIReady = function () {
      if (mpApiCallback) { var cb = mpApiCallback; mpApiCallback = null; cb(); }
    };

    function mpPlayCurrent() {
      mpStopStageVideo();
      if (mpPlayer && mpReady) {
        mpPlayer.loadVideoById(mpTracks[mpIndex].id);
        mpSyncCard(mpTracks[mpIndex].id);
        return;
      }
      /* player still booting: start as soon as it is ready */
      mpPending = true;
      mpSyncCard(mpTracks[mpIndex].id);
    }

    mpPlayBtn.addEventListener('click', function () {
      var playing = mp.getAttribute('data-state') === 'playing';
      if (!playing) { mpPlayCurrent(); }
      else if (mpPlayer && mpReady) { try { mpPlayer.pauseVideo(); } catch (e) {} }
    });

    mpPrevBtn.addEventListener('click', function () {
      mpIndex = (mpIndex - 1 + mpTracks.length) % mpTracks.length;
      mpRender();
      mpPlayCurrent();
    });

    mpNextBtn.addEventListener('click', function () {
      mpIndex = (mpIndex + 1) % mpTracks.length;
      mpRender();
      mpPlayCurrent();
    });

    /* the section video player and the bar never play over each other */
    var basePlayVideo = playVideo;
    playVideo = function (id, title) {
      mpPauseSilently();
      basePlayVideo(id, title);
    };

    mpRender();

    /* boot the player with the API as the page loads, so the first tap on
       play keeps its user gesture (mobile autoplay policy) */
    mpApiCallback = mpCreatePlayer;
    mpLoadApi();
  }

  /* ---------- back to top with no hash jump ---------- */
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

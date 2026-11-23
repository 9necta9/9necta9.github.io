(function () {
  'use strict';

  /* ---------- photo slideshow ---------- */
  var track = document.getElementById('track');
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
    var dotsBox = document.getElementById('dots');
    var count = document.getElementById('count');
    var index = 0;

    slides.forEach(function (slide, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Photo ' + (n + 1));
      b.addEventListener('click', function () { go(n); });
      dotsBox.appendChild(b);
    });
    var dotEls = Array.prototype.slice.call(dotsBox.children);

    function go(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === index); });
      dotEls.forEach(function (d, k) {
        d.classList.toggle('is-active', k === index);
        if (k === index) { d.setAttribute('aria-current', 'true'); }
        else { d.removeAttribute('aria-current'); }
      });
      count.textContent = (index + 1) + ' / ' + slides.length;
    }

    document.getElementById('prev').addEventListener('click', function () { go(index - 1); });
    document.getElementById('next').addEventListener('click', function () { go(index + 1); });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); }
      if (e.key === 'ArrowRight') { go(index + 1); }
    });

    var startX = null;
    track.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    track.addEventListener('pointerup', function (e) {
      if (startX === null) { return; }
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 36) { go(index + (dx < 0 ? 1 : -1)); }
    });
    track.addEventListener('pointercancel', function () { startX = null; });

    go(0);
  }

  /* ---------- bio language toggle ---------- */
  var langBtns = Array.prototype.slice.call(document.querySelectorAll('[data-set-lang]'));
  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-set-lang');
      document.documentElement.setAttribute('data-lang', lang);
      document.documentElement.setAttribute('lang', lang === 'kr' ? 'ko' : 'en');
      langBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  });

  /* ---------- broken thumbnail fallback ---------- */
  Array.prototype.slice.call(document.querySelectorAll('.vid-thumb img')).forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
    });
  });
}());

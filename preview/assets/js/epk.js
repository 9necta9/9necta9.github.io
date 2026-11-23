(function () {
  'use strict';

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

/* 기준이 쌓이는 자리 — 학생 요청: 칸을 누르면 그 칸 위에 굵은 선이 그어진다(한 번에 한 칸). 같은 칸을 다시 누르면 선이 사라진다 */
(function () {
  'use strict';
  var items = [].slice.call(document.querySelectorAll('.kc-item'));
  items.forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      items.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); x.classList.remove('is-on'); });
      if (on) { b.setAttribute('aria-pressed', 'true'); b.classList.add('is-on'); }
    });
  });
})();

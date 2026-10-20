/* 첫 화면 아래 모든 구역 — 학생 요청: 스크롤하면 사진과 문장이 자연스럽게 나타난다(천천히 · 반복). (1장·2장에서 시작해 전체로 넓힘)
   사진은 아래에서 천천히 올라오며 또렷해지고, 문장은 조금 덜 움직이며 따라 나온다. 한 번에 들어온 것들은 차례로 조금씩 늦게.
   화면 밖으로 완전히 나가면 다시 숨겨 두어서, 위로 올렸다가 다시 내려와도(또는 반대로) 매번 다시 나타난다.
   움직임 줄이기 설정을 켠 사람과 이 기능이 없는 브라우저에서는 처음부터 다 보인다 */
(function () {
  'use strict';
  var IMG = '#s2 .wm-fig, #s3 .cs-fig, #s4 .mo-stage, #s5 .ag-fig';
  var TXT = [
    '#s1 .mo-h2', '#s1 .ix li',                                                              /* 소개 */
    '#s2 .mo-label', '#s2 .mo-h2', '#s2 .grp-t', '#s2 .grp-s', '#s2 .wm-cap',                /* 1장 */
    '.s3-head .mo-label', '.ch-lead', '#s3 .cs-sub', '#s3 .cs-title', '#s3 .cs-n', '#s3 .cs-t', '#s3 .cs-d', '#s3 .cs-src',/* 2장 */
    '#s4 .mo-label',                                                                         /* 3장 */
    '#s5 .ag-head .mo-label', '#s5 .ag-title', '#s5 .ag-list li', '#s5 .ag-page',                       /* 가까이 */
    '#s6 .mo-label', '#s6 .kc-item',                                                         /* 기준 */
    '.mo-foot-logo', '.mo-foot-cols p'                                                       /* 맨 아래 */
  ].join(', ');
  var items = [].slice.call(document.querySelectorAll(IMG + ', ' + TXT));
  if (!items.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('gz-on');
  items.forEach(function (el) { el.classList.add(el.matches(IMG) ? 'gz-img' : 'gz-txt'); });
  var STAGGER = 180;

  /* 들어올 때 — 화면 아래쪽 12%는 빼고, 조금 더 올라왔을 때 나타나게 */
  var inIO = new IntersectionObserver(function (es) {
    var k = 0;
    es.filter(function (e) { return e.isIntersecting && !e.target.classList.contains('gz-in'); })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; })
      .forEach(function (e) {
        var el = e.target, extra = el.matches('.wm-cap, .cs-t, .cs-d') ? 200 : 0;   /* 사진 이름·설명은 사진보다 조금 늦게 */
        el.style.transitionDelay = (k++ * STAGGER + extra) + 'ms';
        el.classList.add('gz-in');
      });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

  /* 나갈 때 — 화면 밖으로 완전히 나갔을 때만 조용히 되돌림(보이는 중에는 사라지지 않게) */
  var outIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) return;
      var el = e.target;
      el.classList.add('gz-reset'); el.classList.remove('gz-in'); el.style.transitionDelay = '0ms';
      void el.offsetWidth; el.classList.remove('gz-reset');
    });
  }, { threshold: 0 });

  items.forEach(function (el) { inIO.observe(el); outIO.observe(el); });

  /* 페이지 맨 끝까지 내렸을 때 — 화면 아래쪽 12% 안에 남는 끝 부분(맨 아래 이름 등)도 나타나게 */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    setTimeout(function () {
      ticking = false;
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
      var k = 0;
      items.forEach(function (el) {
        if (el.classList.contains('gz-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { el.style.transitionDelay = (k++ * STAGGER) + 'ms'; el.classList.add('gz-in'); }
      });
    }, 100);
  }, { passive: true });
})();

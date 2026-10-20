/* 첫 화면 인트로 — 학생 요청(참고 영상 · 고급 브랜드처럼, 6주 STEP 04)
   단계를 section.mo-hero[data-lx]에 차례로 적는다: 1 초점 → 2 검색창 타이핑 → 3 확대 → 4 말풍선 들판과 제목 → 5 사진 카드 격자 → done(제목과 첫 화면).
   화면에 고정된 랜딩이라 재생 중에는 스크롤을 잠근다.
   첫 화면이 맨 위에 있을 때 한 번 재생하고, 끝나면 '다시 보기'로 다시 볼 수 있다. 움직임 줄이기 설정이면 바로 끝 상태로 간다. 소리는 없다. */
(function () {
  'use strict';
  var hero = document.querySelector('.mo-hero'), lx = hero && hero.querySelector('.lx');
  if (!lx) return;
  var R = document.documentElement, fig = hero.querySelector('.mo-hero-fig');
  var type = lx.querySelector('.lx-type'), skip = hero.querySelector('.lx-skip'), replay = hero.querySelector('.lx-replay');
  var Q = '어떤 빛·색·배치가 나를 머물게 할까?';   /* 6주 주제카드 '이번 주 질문' */
  var qs = [].slice.call(lx.querySelectorAll('.lx-q'));
  var timers = [];
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function step(n) { hero.setAttribute('data-lx', n); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function done() {
    clear(); type.textContent = Q; hero.classList.remove('lx-play', 'lx-named', 'lx-wide');
    step('done'); R.classList.remove('lx-on');
  }
  function play() {
    window.scrollTo(0, 0);
    clear(); R.classList.add('lx-on'); type.textContent = ''; hero.classList.remove('lx-play', 'lx-named', 'lx-filling');
    hero.classList.remove('lx-wide');
    qs.forEach(function (q) { q.classList.remove('is-on', 'is-done'); q.querySelector('b').textContent = ''; });
    step(0); void fig.offsetWidth; hero.classList.add('lx-play'); step(1);       /* 1 흐린 사진에 천천히 초점이 맞는다(CSS 애니메이션) */
    at(2600, function () { step(2); });                                             /* 2 검색창 */
    for (var i = 1; i <= Q.length; i++) (function (k) { at(3200 + k * 85, function () { type.textContent = Q.slice(0, k); }); })(i);
    at(6400, function () { step(3); });                                             /* 3 화면 가득 확대 */
    at(7900, function () { step(4); });                                             /* 4 말풍선 들판(참고 영상 12초) + 물방울 — 물방울이 보이도록 7초 머문다 */
    qs.forEach(function (q) {                                                       /*   학생 요청(방향 바꿈): 타이핑 대신 문장이 물속에서 떠오르듯 — 시간차를 두고 흐림 → 또렷 + 천천히 위로 */
      var t = q.getAttribute('data-t'), b = q.querySelector('b'), d = 8200 + (+q.style.getPropertyValue('--d') || 0);
      at(d, function () { b.textContent = t; q.classList.add('is-on'); });
    });
    at(12400, function () { hero.classList.add('lx-named'); });                     /*   가운데 질문 → 제목 */
    at(15100, function () { step(5); });                                            /* 5 가운데 카드 */
    at(15900, function () { hero.classList.add('lx-wide'); });                      /*   양옆 카드 */
    at(19100, done);                                                                /* 첫 화면으로 */
  }
  skip.addEventListener('click', done);
  replay.addEventListener('click', play);
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || window.scrollY > 120) done(); else play();
})();

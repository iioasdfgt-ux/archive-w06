/* 첫 화면 사진 고리 — 학생 요청(참고: cipher.tv 사진이 돌아가는 부분, 같은 속도)
   카드 스무 장이 타원 고리를 따라 아주 천천히 돈다(약 0.4°/초 — 참고 페이지에서 잰 값). 스크롤하면 그만큼 더 돈다.
   고리는 위쪽이 멀고(작게) 아래쪽이 가까워(크게) 보이는 기울어진 원판처럼 보이게 크기와 겹침 순서를 바꾼다.
   카드에 마우스를 올리면 그 사진만 커지고 선명, 나머지는 흑백으로 어두워지며 아래에 번호와 이름이 뜬다. 고리는 대각선으로 기울었고, 누르면 그 사진이 전체 화면 + 제목. 움직임 줄이기 설정이면 멈춘 고리 */
(function () {
  'use strict';
  var hero = document.querySelector('.mo-hero'), ring = hero && hero.querySelector('.ring');
  if (!ring) return;
  var cards = [].slice.call(ring.querySelectorAll('.ring-card'));
  var capN = hero.querySelector('.ring-n'), capT = hero.querySelector('.ring-t');
  var N = cards.length, SPEED = 1, SCROLL = 0.15, TILT = -24;   /* 도/초 · 스크롤 1px당 도 · 고리 기울기(오른쪽 위로) */
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ang = 0, last = performance.now(), hover = -1, slow = 1, open = false;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  var root = document.documentElement; root.classList.add('ring-land');   /* 고리 화면 = 랜딩: 메뉴 바·스크롤 없음 */
  var figImg = hero.querySelector('.mo-hero-fig img'), xBtn = hero.querySelector('.ring-x'), srcEl = hero.querySelector('.ring-src');
  function layout() {
    var w = hero.clientWidth, h = hero.clientHeight, mob = w <= 768;
    var cx = w * .5, cy = h * (mob ? .5 : .5);
    var rx = w * (mob ? .4 : .32), ry = h * (mob ? .24 : .22);
    var tilt = TILT * Math.PI / 180, ct = Math.cos(tilt), st = Math.sin(tilt);
    var base = mob ? Math.min(150, w * .38) : Math.min(210, w * .146);
    var rot = ang + window.scrollY * SCROLL;
    /* 카드 사이 간격이 고리 어디서나 같도록 — 같은 각도가 아니라 같은 둘레 길이마다 한 장 */
    var K = 360, arc = [0], L = 0;
    for (var k = 1; k <= K; k++) {
      var a0 = (k - 1) / K * 2 * Math.PI, a1 = k / K * 2 * Math.PI;
      L += Math.hypot((Math.cos(a1) - Math.cos(a0)) * rx, (Math.sin(a1) - Math.sin(a0)) * ry); arc.push(L);
    }
    for (var i = 0; i < N; i++) {
      var f = (((rot / 360 + i / N) % 1) + 1) % 1 * L, j = 1;
      while (j < K && arc[j] < f) j++;
      var th = ((j - 1) + (f - arc[j - 1]) / (arc[j] - arc[j - 1] || 1)) / K * 2 * Math.PI;
      var depth = (Math.sin(th) + 1) / 2;              /* 0 = 위(멂) · 1 = 아래(가까움) */
      var s = .62 + depth * .5;
      if (i === hover) s *= 1.35;
      var c = cards[i];
      c.style.width = base + 'px'; c.style.height = Math.round(base * .66) + 'px';
      var ex = Math.cos(th) * rx, ey = Math.sin(th) * ry;   /* 타원 위 자리 → 대각선으로 기울임 */
      var x = cx + ex * ct - ey * st, y = cy + ex * st + ey * ct;
      c.style.transform = 'translate(' + (x - base / 2) + 'px,' + (y - base * .33) + 'px) scale(' + s + ')';
      c.style.zIndex = i === hover ? 999 : Math.round(depth * 100);
    }
  }
  function tick(now) {
    var dt = Math.min(64, now - last); last = now;
    slow += ((hover > -1 || open ? 0 : 1) - slow) * .08;       /* 마우스를 올리면 부드럽게 멈춤 */
    if (!still) ang += SPEED * dt / 1000 * slow;
    layout(); requestAnimationFrame(tick);
  }
  cards.forEach(function (c, i) {
    c.addEventListener('mouseenter', function () {
      if (!c._pre) { c._pre = new Image(); c._pre.src = c.dataset.full; }   /* 올려 둔 사진 원본 미리 받기 */
      hover = i; hero.classList.add('ring-focus'); c.classList.add('is-on');
      capN.textContent = (i < 9 ? '0' : '') + (i + 1); capT.textContent = c.dataset.cap;
    });
    c.addEventListener('mouseleave', function () {
      if (hover === i) hover = -1; c.classList.remove('is-on');
      if (hover === -1) hero.classList.remove('ring-focus');
    });
  });
  /* 사진을 누르면 그 사진(원본)이 화면 전체에 깔리고 제목이 나온다 — 수정 전 첫 화면처럼. X(또는 Esc)로 고리로 돌아감 */
  function show(c) {
    /* 누른 카드 사진을 바로 깔고(예전 배너 사진이 먼저 보이지 않게), 큰 원본은 다 받은 뒤에 바꿔 끼움 */
    var want = c.dataset.full; figImg.dataset.want = want;
    figImg.removeAttribute('srcset'); figImg.src = c.querySelector('img').getAttribute('src');
    var big = new Image(); big.onload = function () { if (figImg.dataset.want === want) figImg.src = want; }; big.src = want;
    figImg.style.objectPosition = c.style.getPropertyValue('--pos') || '50% 50%';   /* 얼굴·머리·해파리가 잘리지 않게 */
    figImg.alt = c.dataset.cap;
    srcEl.textContent = '사진 출처 — ' + c.dataset.src;   /* 그 사진의 출처(assets/CREDITS.tsv 기준) */
    open = true; hero.classList.add('is-open'); root.classList.remove('ring-land'); hero.classList.remove('ring-focus');
    cards.forEach(function (k) { k.classList.remove('is-on'); }); hover = -1;

  }
  function close() { open = false; hero.classList.remove('is-open'); window.scrollTo(0, 0); root.classList.add('ring-land'); }
  cards.forEach(function (c) { c.addEventListener('click', function () { show(c); }); });
  xBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') close(); });
  window.addEventListener('resize', layout);
  layout(); requestAnimationFrame(tick);
})();

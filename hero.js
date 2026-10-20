/* 첫 화면 — 학생 요청(6주 STEP 04): 광고 영상처럼 밝고 명랑하게
   1) 제목 어절이 하나씩 튀어나오고 '빛이 가득한'에 노란 형광 밑줄이 그어진다(글자는 그대로, 감싸기만 한다).
   2) 장면(공간) 셋을 7초마다 바꾼다. 색 원이 퍼지며 열리고, 카드가 탄성 있게 튀어 올라 둥실거린다. 도형도 한 번씩 통 튄다(CSS).
   3) 소리: 버튼을 누르면 경쾌한 마림바 같은 소리가 켜진다(파일 없이 이 스크립트가 만든다). 장면마다 화음이 바뀌고, 카드가 튈 때 '톡' 소리.
      브라우저는 누르기 전에는 소리를 낼 수 없어서 처음엔 꺼져 있다. */
(function () {
  'use strict';
  var hero = document.querySelector('.hv');
  if (!hero) return;
  var scenes = [].slice.call(hero.querySelectorAll('.hv-scene'));
  var shapes = hero.querySelector('.hv-shapes');
  var btn = hero.querySelector('.hv-sound');
  var STEP = 7000, at = -1, timer = null;

  /* ── 제목 어절 나누기 ── */
  var h1 = hero.querySelector('.mo-h1');
  if (h1 && !h1.querySelector('.hv-w')) {
    var HL = ['빛이', '가득한'], k = 0;
    var parts = h1.textContent.split(/(\s+)/);
    h1.textContent = '';
    parts.forEach(function (p) {
      if (/^\s+$/.test(p) || !p) { h1.appendChild(document.createTextNode(p)); return; }
      var s = document.createElement('span'); s.className = 'hv-w' + (HL.indexOf(p) > -1 ? ' hv-hl' : ''); s.style.setProperty('--k', k++); s.textContent = p;
      h1.appendChild(s);
    });
  }
  setTimeout(function () { hero.classList.add('hv-go-on'); }, 60);   /* rAF는 화면이 가려진 탭에서 멈출 수 있어 타이머로 */

  function show(i) {
    at = (i + scenes.length) % scenes.length;
    scenes.forEach(function (s, n) {
      if (n === at) { s.classList.remove('is-on'); void s.offsetWidth; s.classList.add('is-on'); }  /* 다시 켤 때 움직임을 처음부터 */
      else s.classList.remove('is-on');
    });
    if (shapes) { shapes.classList.remove('hv-bounce'); void shapes.offsetWidth; shapes.classList.add('hv-bounce'); }
    sound.scene(at, scenes[at].querySelectorAll('.hv-card').length);
  }
  function play() { clearInterval(timer); timer = setInterval(function () { show(at + 1); }, STEP); }

  /* ── 소리 ── */
  var sound = (function () {
    var ctx = null, out = null, echo = null, loop = null, cur = 0, step = 0, nextT = 0, on = false;
    var BPM = 112, E8 = 60 / BPM / 2;                       /* 8분음표 길이(초) */
    /* 장면마다 화음 — 1 C장 · 2 F장 · 3 G장 (밝은 장조) */
    var CH = [
      { bass: 130.81, arp: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 392.00, 659.25] },
      { bass: 174.61, arp: [261.63, 349.23, 440.00, 523.25, 440.00, 349.23, 440.00, 698.46] },
      { bass: 196.00, arp: [293.66, 392.00, 493.88, 587.33, 493.88, 392.00, 493.88, 783.99] }
    ];
    function build() {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
      ctx = new C();
      out = ctx.createGain(); out.gain.value = 0;
      var comp = ctx.createDynamicsCompressor();
      var dl = ctx.createDelay(1); dl.delayTime.value = E8 * 3;
      var fb = ctx.createGain(); fb.gain.value = .25;
      echo = ctx.createGain(); echo.gain.value = .22;
      out.connect(comp); comp.connect(ctx.destination);
      echo.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(comp);
      return true;
    }
    function mallet(f, t, v, len) {                         /* 마림바 같은 톡 — 기음 + 4배음이 빨리 사라짐 */
      [[1, v], [4, v * .18]].forEach(function (h) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f * h[0];
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(h[1], t + .005);
        g.gain.exponentialRampToValueAtTime(.0001, t + (h[0] === 1 ? len : .12));
        o.connect(g); g.connect(out); if (h[0] === 1) g.connect(echo);
        o.start(t); o.stop(t + len + .05);
      });
    }
    function thump(t) {                                      /* 부드러운 북 */
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + .14);
      g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + .25);
    }
    function shaker(t) {                                     /* 찰찰 — 짧은 잡음 */
      var len = .05, b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      var s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = b; hp.type = 'highpass'; hp.frequency.value = 6000; g.gain.value = .05;
      s.connect(hp); hp.connect(g); g.connect(out); s.start(t);
    }
    function tick() {                                        /* 조금 앞서 박자를 예약한다 */
      while (nextT < ctx.currentTime + .15) {
        var c = CH[cur], n = step % 8;
        mallet(c.arp[n], nextT, n === 0 ? .2 : .13, .5);
        if (n === 0 || n === 4) { mallet(c.bass, nextT, .22, .9); thump(nextT); }
        if (n % 2 === 1) shaker(nextT);
        nextT += E8; step++;
      }
    }
    function pops(count) {                                   /* 카드가 튀어 오르는 때에 맞춰 '톡' */
      var t = ctx.currentTime + .35;
      for (var i = 0; i < count; i++) mallet(CH[cur].arp[3] * (i % 2 ? 1.5 : 2), t + i * .11 + .25, .06, .18);
    }
    return {
      on: function () {
        if (!ctx && !build()) return false;
        if (ctx.state === 'suspended') ctx.resume();
        on = true; step = 0; nextT = ctx.currentTime + .05;
        out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(.8, ctx.currentTime, .15);
        clearInterval(loop); loop = setInterval(tick, 40);
        return true;
      },
      off: function () {
        if (!ctx) return;
        on = false; clearInterval(loop); out.gain.setTargetAtTime(0, ctx.currentTime, .15);
        setTimeout(function () { if (!on) ctx.suspend(); }, 800);
      },
      scene: function (i, count) {
        cur = i;
        if (ctx && on) { step = 0; pops(count); }
      }
    };
  })();

  btn.addEventListener('click', function () {
    var turnOn = btn.getAttribute('aria-pressed') !== 'true';
    if (turnOn && !sound.on()) { btn.textContent = '소리 없음'; return; }
    if (!turnOn) sound.off();
    btn.setAttribute('aria-pressed', turnOn ? 'true' : 'false');
    btn.textContent = turnOn ? '소리 끄기' : '소리 켜기';
  });

  /* 첫 화면이 안 보이면 장면 넘김을 쉰다 */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) play(); else clearInterval(timer); }); }).observe(hero);
  } else play();
  show(0);
})();

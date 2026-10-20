/* 3장 공간 · 가까이 — 학생 요청
   1) 왼쪽 사진이 4초마다 자동으로 아래로 넘어가고(지금 사진은 아래로 빠지고 다음 사진이 위에서 내려옴), 오른쪽 목록의 표시 줄도 함께 넘어간다.
      글 상자(공간 이름·설명)와 쪽번호도 같이 바뀐다. 목록을 누르면 그 사진으로 바로 간다. 오른쪽 판에 마우스가 있는 동안은 자동 넘김을 쉰다.
   2) 목록 줄에 마우스를 올리면 그 사진이 작은 직사각형으로 커서를 따라다닌다(참고 사이트처럼 휘어지지 않게, 크지 않게). 마우스가 있는 기기에서만 */
(function () {
  'use strict';
  var sec = document.querySelector('.ag'); if (!sec) return;
  var slides = [].slice.call(sec.querySelectorAll('.ag-slide'));
  var rows = [].slice.call(sec.querySelectorAll('.ag-row'));
  var t = sec.querySelector('.ag-box-t'), d = sec.querySelector('.ag-box-d'), now = sec.querySelector('.ag-now');
  var panel = sec.querySelector('.ag-panel');
  var desc = JSON.parse(sec.querySelector('.ag-desc').textContent);
  var at = 0, timer = null, STEP = 3000;   /* 학생 요청: 4초 → 3초로 조금 빠르게 */

  function go(i) {
    i = (i + slides.length) % slides.length; if (i === at) return;
    var cur = slides[at], nxt = slides[i];
    nxt.loading = 'eager';
    cur.classList.remove('is-on'); cur.classList.add('is-out');            /* 지금 사진은 아래로 빠지고 */
    nxt.classList.remove('is-out'); nxt.classList.add('is-in');            /* 다음 사진은 위에 놓였다가 */
    void nxt.offsetWidth; nxt.classList.remove('is-in'); nxt.classList.add('is-on');   /* 내려온다 */
    setTimeout(function () { cur.classList.remove('is-out'); }, 1000);
    rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
    var b = rows[i]; t.textContent = b.dataset.space; d.innerHTML = desc[b.dataset.space];
    now.textContent = (i < 9 ? '0' : '') + (i + 1);
    at = i;
  }
  function play() { clearInterval(timer); timer = setInterval(function () { go(at + 1); }, STEP); }
  function stop() { clearInterval(timer); }
  rows.forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
  panel.addEventListener('mouseenter', stop); panel.addEventListener('mouseleave', play);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) play(); else stop(); }); }, { threshold: .3 }).observe(sec);
  else play();

  /* 학생 요청: 사진 안 설명 상자의 아래 끝을 09번 줄 아래 선에 맞춘다(사진은 끝까지 그대로). 두 칸으로 나뉜 넓은 화면에서만, 화면 크기가 바뀌면 다시 잰다 */
  var box = sec.querySelector('.ag-box'), list = sec.querySelector('.ag-list');
  function fit() {
    box.style.bottom = '';
    if (window.innerWidth <= 768) return;
    var gap = Math.round(sec.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom);
    box.style.bottom = Math.max(0, gap) + 'px';
  }
  fit(); window.addEventListener('resize', fit); window.addEventListener('load', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  /* 커서를 따라오는 작은 사진 */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var peek = sec.querySelector('.ag-peek'), pimg = peek.querySelector('img');
  var x = 0, y = 0, px = 0, py = 0, raf = 0, on = false;
  function loop() {
    px += (x - px) * .18; py += (y - py) * .18;
    peek.style.transform = 'translate(' + px + 'px,' + py + 'px)';
    raf = (on || Math.abs(x - px) > .5) ? requestAnimationFrame(loop) : 0;
  }
  rows.forEach(function (b) {
    b.addEventListener('mouseenter', function () { pimg.src = b.dataset.src; peek.classList.add('is-on'); on = true; if (!raf) raf = requestAnimationFrame(loop); });
    b.addEventListener('mouseleave', function () { peek.classList.remove('is-on'); on = false; });
  });
  panel.addEventListener('mousemove', function (e) { var r = panel.getBoundingClientRect(); x = e.clientX - r.left; y = e.clientY - r.top; if (!on && !raf) { px = x; py = y; } });
})();

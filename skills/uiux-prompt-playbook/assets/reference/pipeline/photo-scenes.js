/* Photo and page-transition scenes (family 「照片与转场」) for the pipeline playground.
   Same contract as scenes.js: (root, ctx) builds the demo and may return a cleanup.
   Springs follow the stage feel: ctx.tilt() is 0.6 / 1 / 1.5 for subtle / standard / lively,
   which sets the damping (subtle never overshoots); ctx.d() scales the stiffness. */
(() => {
  'use strict';
  const S = window.PIPE_SCENES;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const T = s => (window.I18N && I18N.t ? I18N.t(s) : s);

  const PHOTOS = [
    ['海边的早晨', '海岸 · 05:40', 'pp-sea'],
    ['读到一半的书', '书房 · 14:10', 'pp-book'],
    ['雪线之上', '山谷 · 07:25', 'pp-snow'],
    ['黄色电车', '老城 · 16:20', 'pp-tram'],
    ['石板小巷', '老街 · 17:05', 'pp-alley'],
    ['金色麦田', '平原 · 11:30', 'pp-field']
  ];

  /* A damped spring on one number; keeps value and velocity when interrupted. */
  function springer(ctx, alive) {
    return (o) => {
      const zeta = { 0.6: 1, 1: 0.72, 1.5: 0.48 }[ctx.tilt()] || 0.72;
      const m = ctx.d(1000) / 1000;
      const k = (o.stiffness || 240) / (m * m), c = 2 * zeta * Math.sqrt(k);
      let x = o.from, v = o.velocity || 0, last = 0, id = 0, stopped = false;
      const stop = () => { stopped = true; cancelAnimationFrame(id); };
      if (ctx.reduced()) { o.update(o.to); if (o.done) o.done(); return { stop, x: () => o.to }; }
      const step = (t) => {
        if (stopped || !alive()) return;
        const dt = Math.min(0.032, last ? (t - last) / 1000 : 0.016); last = t;
        v += (-k * (x - o.to) - c * v) * dt; x += v * dt;
        if (Math.abs(v) < 0.003 && Math.abs(x - o.to) < 0.0008) { o.update(o.to); if (o.done) o.done(); return; }
        o.update(x); id = requestAnimationFrame(step);
      };
      id = requestAnimationFrame(step);
      return { stop, x: () => x };
    };
  }

  /* Pointer drag reporting dx and release velocity (px/ms over the last ~80ms). */
  function dragger(el, h) {
    let id = null, x0 = 0, hist = [];
    el.addEventListener('pointerdown', e => {
      if (e.button > 0 || e.target.closest('button')) return;
      id = e.pointerId; x0 = e.clientX; hist = [[e.timeStamp, e.clientX]];
      el.setPointerCapture(id); if (h.start) h.start();
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      hist.push([e.timeStamp, e.clientX]); while (hist.length > 2 && e.timeStamp - hist[0][0] > 80) hist.shift();
      h.move(e.clientX - x0);
    });
    const end = e => {
      if (e.pointerId !== id) return; id = null;
      const a = hist[0], b = hist[hist.length - 1];
      h.end(e.clientX - x0, b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0);
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  const play = (ctx, el, frames, ms, easing, extra) =>
    (ctx.reduced() ? { finished: Promise.resolve(), cancel() {} } : el.animate(frames, Object.assign({ duration: ctx.d(ms), easing: easing || ctx.ease, fill: 'both' }, extra)));
  const rel = (el, root) => { const a = el.getBoundingClientRect(), b = root.getBoundingClientRect(); return { left: a.left - b.left + 'px', top: a.top - b.top + 'px', width: a.width + 'px', height: a.height + 'px' }; };

  /* ---------- 1. fan ---------- */
  S.photoFan = (root, ctx) => {
    let alive = true; const spring = springer(ctx, () => alive);
    const items = PHOTOS.slice(0, 4);
    root.innerHTML = `<div class="ap pf"><header class="ap-head"><h4>旅行相册</h4><span class="ap-sub pf-n">1 / 4</span></header>
      <div class="pf-fan" tabindex="0" role="group" aria-roledescription="轮播" aria-label="照片扇面，左右方向键切换">${items.map((p, i) => `<div class="pf-card pp ${p[2]}" aria-hidden="true"></div>`).join('')}</div>
      <div class="pf-title"><b>${items[0][0]}</b></div><p class="pf-place">${items[0][1]}</p>
      <div class="pf-dots" aria-hidden="true">${items.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
      <div class="pf-btns"><button type="button" class="ap-pill pf-prev" aria-label="上一张">←</button><button type="button" class="ap-pill pf-next" aria-label="下一张">→</button></div></div>`;
    const fan = $('.pf-fan', root), cards = $$('.pf-card', root);
    let pos = 0, index = 0, mo = null;
    const layout = p => {
      pos = p;
      cards.forEach((c, i) => {
        const d = i - p, a = Math.abs(d);
        c.style.transform = `translateX(${d * 30}px) translateY(${a * 9}px) rotate(${d * 13}deg) scale(${1 - Math.min(a, 3) * 0.05})`;
        c.style.zIndex = String(20 - Math.round(a * 4)); c.style.opacity = a > 2.6 ? '0' : '1';
      });
    };
    const swap = (i, why) => {
      const box = $('.pf-title', root), old = $('b', box), nb = document.createElement('b'), dir = i > index ? 1 : -1;
      nb.textContent = items[i][0]; box.append(nb);
      play(ctx, old, [{ transform: 'translateY(0)' }, { transform: `translateY(${-100 * dir}%)` }], 240, 'cubic-bezier(.4,0,.2,1)').finished.then(() => old.remove(), () => old.remove());
      if (ctx.reduced()) old.remove();
      play(ctx, nb, [{ transform: `translateY(${100 * dir}%)` }, { transform: 'none' }], 300);
      $('.pf-place', root).textContent = items[i][1];
      $$('.pf-dots i', root).forEach((d, j) => d.classList.toggle('on', j === i));
      $('.pf-n', root).textContent = `${i + 1} / ${items.length}`;
      ctx.announce(`第 ${i + 1} 张，共 ${items.length} 张：${items[i][0]}`); ctx.log(`${why}：切到第 ${i + 1} 张，标题遮罩替换，分页点拉长`);
    };
    const go = (t, v, why) => {
      t = clamp(t, 0, items.length - 1);
      if (t !== index) { swap(t, why); index = t; } else if (why) ctx.log(`${why}：吸附回当前这张`);
      if (mo) mo.stop();
      mo = spring({ from: pos, to: t, velocity: v || 0, stiffness: 230, update: layout });
    };
    let start = 0;
    dragger(fan, {
      start() { if (mo) mo.stop(); start = pos; },
      move(dx) { let p = start - dx / 110; if (p < 0) p /= 3; if (p > items.length - 1) p = items.length - 1 + (p - items.length + 1) / 3; layout(p); },
      end(dx, vx) { let t = Math.round(pos); if (t === index && Math.abs(vx) > 0.5) t = index - Math.sign(vx); go(t, -vx * 9, Math.abs(vx) > 0.5 ? '快速滑动' : '拖动松手'); }
    });
    fan.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(index + (e.key === 'ArrowRight' ? 1 : -1), 0, e.key === 'ArrowRight' ? '→' : '←'); } });
    $('.pf-next', root).addEventListener('click', () => go(index + 1, 0, '按钮'));
    $('.pf-prev', root).addEventListener('click', () => go(index - 1, 0, '按钮'));
    layout(0);
    return () => { alive = false; };
  };

  /* ---------- 2. thumbnail -> ticket ---------- */
  S.photoTicket = (root, ctx) => {
    const items = PHOTOS.slice(0, 4);
    root.innerHTML = `<div class="ap pt"><header class="ap-head"><h4>我的行程</h4><span class="ap-sub">4 张票根</span></header>
      <div class="pt-grid">${items.map((p, i) => `<button type="button" class="pt-thumb" data-i="${i}" aria-label="打开「${p[0]}」票根"><span class="pp ${p[2]}"></span><b>${p[0]}</b><small>${p[1]}</small></button>`).join('')}</div>
      <section class="pt-page" hidden><button type="button" class="pt-back" aria-label="返回行程">‹</button>
        <article class="pt-ticket"><span class="pp pt-img"></span><div class="pt-body"><p class="pt-no">ADMIT ONE · NO. <span></span></p><h4 tabindex="-1"></h4>
        <dl><div><dt>地点</dt><dd class="pt-place"></dd></div><div><dt>座位</dt><dd>靠窗 07</dd></div></dl><i class="pt-perf" aria-hidden="true"></i><p class="pt-stub">保留此票根 · 不可转让</p></div></article></section></div>`;
    const ap = $('.pt', root), grid = $('.pt-grid', root), page = $('.pt-page', root), img = $('.pt-img', root), body = $('.pt-body', root);
    let busy = false, cur = null;
    const fly = (from, to, cls, ms, easing) => {
      const f = document.createElement('span'); f.className = 'pp pt-fly ' + cls; ap.append(f);
      const a = play(ctx, f, [Object.assign({}, from, { borderRadius: '12px' }), Object.assign({}, to, { borderRadius: '18px 18px 4px 4px' })], ms, easing);
      return a.finished.then(() => f.remove(), () => f.remove());
    };
    const open = (btn, why) => {
      if (busy) { ctx.log('转场中，忽略重复点击'); return; }
      busy = true; cur = btn;
      const p = items[+btn.dataset.i];
      img.className = 'pp pt-img ' + p[2]; $('h4', body).textContent = p[0]; $('.pt-place', body).textContent = p[1]; $('.pt-no span', body).textContent = `00${+btn.dataset.i + 1}41`;
      const from = rel($('.pp', btn), ap); page.hidden = false; const to = rel(img, ap);
      img.style.visibility = 'hidden'; grid.inert = true;
      play(ctx, grid, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.94)', opacity: 0 }], 280, 'ease-out');
      play(ctx, body, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 0, transform: 'translateY(14px)', offset: 0.45 }, { opacity: 1, transform: 'none' }], 440);
      ctx.log(`${why}：缩略图放大成票根，旧页缩小淡出`);
      fly(from, to, p[2], 400).then(() => { img.style.visibility = ''; busy = false; $('h4', body).focus({ preventScroll: true }); ctx.announce(`已打开「${p[0]}」票根`); });
    };
    const close = why => {
      if (busy || !cur) return; busy = true;
      const p = items[+cur.dataset.i], to = rel($('.pp', cur), ap), from = rel(img, ap);
      img.style.visibility = 'hidden';
      play(ctx, body, [{ opacity: 1 }, { opacity: 0 }], 140, 'ease-out');
      play(ctx, grid, [{ transform: 'scale(.94)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], 340);
      ctx.log(`${why}：沿原路缩回同一张缩略图`);
      fly(from, to, p[2], 360).then(() => { page.hidden = true; img.style.visibility = ''; grid.inert = false; busy = false; cur.focus({ preventScroll: true }); ctx.announce('已返回行程'); });
    };
    grid.addEventListener('click', e => { const b = e.target.closest('.pt-thumb'); if (b) open(b, '点击'); });
    $('.pt-back', root).addEventListener('click', () => close('返回按钮'));
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && !page.hidden) { e.preventDefault(); close('Esc'); } });
  };

  /* ---------- 3. gather ---------- */
  S.photoGather = (root, ctx) => {
    let alive = true; const spring = springer(ctx, () => alive);
    root.innerHTML = `<div class="ap pgx"><header class="ap-head"><h4>未整理</h4><span class="ap-sub">6 张照片</span></header>
      <div class="pgx-grid">${PHOTOS.map(p => `<span class="pp ${p[2]}" aria-hidden="true"></span>`).join('')}</div>
      <div class="pgx-foot"><button type="button" class="pgx-make">生成相册</button></div>
      <section class="pgx-album" hidden><button type="button" class="ap-pill pgx-back">‹ 照片</button>
        <div class="pgx-cover" aria-hidden="true">${PHOTOS.slice(0, 3).map((p, i) => `<span class="pp ${p[2]}" style="--r:${[-7, 5, 0][i]}deg"></span>`).join('')}</div>
        <h4 tabindex="-1">十月 · 在路上</h4><p>六个地方，从清晨到傍晚。相册已按拍摄时间排好。</p></section></div>`;
    const tiles = $$('.pgx-grid .pp', root), make = $('.pgx-make', root), album = $('.pgx-album', root), gridWrap = [$('.pgx-grid', root), $('.pgx-foot', root), $('.ap-head', root)];
    const rot = [-9, 6, -4, 8, -6, 3];
    const run = (from, to, done) => {
      const g = $('.pgx-grid', root).getBoundingClientRect(), cx = g.left + g.width / 2, cy = g.top + g.height / 2;
      const d = tiles.map(t => { t.style.transform = ''; const r = t.getBoundingClientRect(); return [cx - r.left - r.width / 2, cy - r.top - r.height / 2]; });
      let left = tiles.length;
      tiles.forEach((t, i) => {
        const set = p => { t.style.transform = `translate(${d[i][0] * p}px,${d[i][1] * p}px) rotate(${rot[i] * p}deg) scale(${1 - 0.18 * p})`; };
        set(from);
        ctx.later(() => spring({ from, to, stiffness: 210, update: set, done: () => { if (--left === 0) done(); } }), ctx.reduced() ? 0 : ctx.d(30) * i);
      });
    };
    make.addEventListener('click', () => {
      if (make.disabled) return;
      make.disabled = true; ctx.log('点击生成：每张错开约 30ms 飞向中心'); ctx.announce('正在整理照片');
      run(0, 1, () => {
        gridWrap.forEach(el => { el.hidden = true; }); album.hidden = false;
        play(ctx, album, [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], 300);
        $('h4', album).focus({ preventScroll: true }); ctx.announce('相册已生成'); ctx.log('全部落定后切页：那一摞变成封面');
      });
    });
    $('.pgx-back', root).addEventListener('click', () => {
      album.hidden = true; gridWrap.forEach(el => { el.hidden = false; });
      ctx.log('返回：照片从中心散回原格子');
      run(1, 0, () => { make.disabled = false; make.focus({ preventScroll: true }); ctx.announce('照片已散回原位'); });
    });
    return () => { alive = false; };
  };

  /* ---------- 4. swipe to sort ---------- */
  S.photoSort = (root, ctx) => {
    let alive = true; const spring = springer(ctx, () => alive);
    root.innerHTML = `<div class="ap ps"><header class="ap-head"><h4>挑照片</h4><span class="ap-sub ps-score"></span></header>
      <div class="ps-deck" tabindex="0" aria-label="分拣卡片，左方向键跳过，右方向键保留"></div>
      <div class="ps-btns"><button type="button" class="ps-skip">← 跳过</button><button type="button" class="ps-undo" aria-label="撤销上一张"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 14 4 9l5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button type="button" class="ps-keep">保留 →</button></div></div>`;
    const deck = $('.ps-deck', root);
    let queue = PHOTOS.slice(), hist = [], n = { skip: 0, keep: 0 }, mo = null, busy = false;
    const top = () => $('.ps-card.top', deck);
    const draw = () => {
      deck.innerHTML = queue.length ? queue.slice(0, 3).reverse().map((p, i, a) => { const dd = a.length - 1 - i; return `<article class="ps-card ${dd ? '' : 'top'}" style="--d:${dd}" ${dd ? 'aria-hidden="true"' : ''}><span class="pp ${p[2]}"></span><b>${p[0]}</b><small>${p[1]}</small><em class="ps-tag keep">保留</em><em class="ps-tag skip">跳过</em></article>`; }).join('')
        : `<p class="ps-empty">全部分完了。<br>保留 ${n.keep} 张，跳过 ${n.skip} 张。</p>`;
      $('.ps-score', root).textContent = `保留 ${n.keep} · 跳过 ${n.skip}`;
      $('.ps-undo', root).disabled = !hist.length;
      deck.setAttribute('aria-label', queue.length ? `当前「${T(queue[0][0])}」，左方向键跳过，右方向键保留` : '分拣完成');
    };
    const place = x => {
      const c = top(); if (!c) return; const w = deck.clientWidth * 0.35;
      c.style.transform = `translateX(${x}px) rotate(${clamp(x / 14, -12, 12) * ctx.tilt()}deg)`;
      $('.keep', c).style.opacity = clamp(x / w, 0, 1); $('.skip', c).style.opacity = clamp(-x / w, 0, 1);
    };
    const commit = (kind, why) => {
      const c = top(); if (!c || busy) return; busy = true; if (mo) mo.stop();
      const dir = kind === 'keep' ? 1 : -1;
      play(ctx, c, [{ transform: c.style.transform || 'none', opacity: 1 }, { transform: `translateX(${dir * deck.clientWidth * 1.3}px) rotate(${dir * 24}deg)`, opacity: 0 }], 260, 'cubic-bezier(.4,0,1,1)').finished.then(() => {
        const item = queue.shift(); hist.push([item, kind]); n[kind]++; busy = false; draw();
        ctx.announce(kind === 'keep' ? `已保留「${item[0]}」` : `已跳过「${item[0]}」`);
        ctx.log(`${why}：${kind === 'keep' ? '保留' : '跳过'}「${item[0]}」`);
      });
    };
    dragger(deck, {
      start() { if (mo) mo.stop(); },
      move(x) { if (!busy) place(x); },
      end(x, vx) {
        if (!top() || busy) return;
        if (Math.abs(x) > deck.clientWidth * 0.35) return commit(x > 0 ? 'keep' : 'skip', '拖过 35%');
        if (Math.abs(vx) > 0.7 && Math.abs(x) > 24) return commit(vx > 0 ? 'keep' : 'skip', '快速甩出');
        mo = spring({ from: x, to: 0, velocity: vx * 400, stiffness: 320, update: place });
        if (Math.abs(x) > 10) ctx.log(`没过阈值（${Math.round(x)}px）：弹簧回中`);
      }
    });
    deck.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); commit('keep', '→'); } if (e.key === 'ArrowLeft') { e.preventDefault(); commit('skip', '←'); } });
    $('.ps-keep', root).addEventListener('click', () => commit('keep', '按钮'));
    $('.ps-skip', root).addEventListener('click', () => commit('skip', '按钮'));
    $('.ps-undo', root).addEventListener('click', () => {
      const h = hist.pop(); if (!h || busy) return;
      n[h[1]]--; queue.unshift(h[0]); draw();
      const d = h[1] === 'keep' ? 1 : -1;
      play(ctx, top(), [{ transform: `translateX(${d * 160}px) rotate(${d * 14}deg)`, opacity: 0 }, { transform: 'none', opacity: 1 }], 360);
      ctx.announce(`已撤销「${h[0][0]}」`); ctx.log(`撤销：「${h[0][0]}」飞回`);
    });
    draw();
    return () => { alive = false; };
  };

  /* ---------- 5. headline line by line ---------- */
  S.photoLines = (root, ctx) => {
    let alive = true; const spring = springer(ctx, () => alive);
    const CH = [
      { lines: ['在海边', '等第一班', '日出'], label: '在海边等第一班日出', cls: 'pp-sea', tab: '海' },
      { lines: ['把旧书', '一页一页', '读完'], label: '把旧书一页一页读完', cls: 'pp-book', tab: '书' },
      { lines: ['走到', '雪线以上', '再回头'], label: '走到雪线以上再回头', cls: 'pp-snow', tab: '雪' }
    ];
    const lineHtml = c => c.lines.map(l => `<span class="pl-mask" aria-hidden="true"><span class="pl-line">${l}</span></span>`).join('');
    root.innerHTML = `<div class="ap pl"><div class="pl-hero pp ${CH[0].cls}" aria-hidden="true"></div>
      <p class="pl-ch">CHAPTER 01</p><h4 class="pl-big" aria-label="${CH[0].label}">${lineHtml(CH[0])}</h4>
      <div class="pl-tabs" role="group" aria-label="章节">${CH.map((c, i) => `<button type="button" data-ch="${i}" aria-pressed="${!i}">${c.tab}</button>`).join('')}</div></div>`;
    const big = $('.pl-big', root), hero = $('.pl-hero', root);
    let idx = 0, running = [], mo = null, ver = 0;
    const go = (i, why) => {
      if (i === idx) return;
      const my = ++ver; idx = i; const c = CH[i];
      running.forEach(a => a.cancel()); running = []; if (mo) mo.stop();
      $$('[data-ch]', root).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.ch === i)));
      $('.pl-ch', root).textContent = `CHAPTER 0${i + 1}`;
      big.setAttribute('aria-label', T(c.label));
      ctx.announce(T(c.label)); ctx.log(`${why}：旧行依次上移退出，每行间隔 ${ctx.d(60)}ms`);
      const outs = $$('.pl-line', big).map((l, k) => play(ctx, l, [{ transform: 'translateY(0)' }, { transform: 'translateY(-110%)' }], 240, 'cubic-bezier(.4,0,.2,1)', { delay: ctx.d(60) * k }));
      running.push(...outs);
      const fade = play(ctx, hero, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.9)' }], 200, 'ease-in');
      running.push(fade);
      Promise.all(outs.map(a => a.finished)).then(() => {
        if (my !== ver) return;
        big.innerHTML = lineHtml(c);
        running = $$('.pl-line', big).map((l, k) => play(ctx, l, [{ transform: 'translateY(110%)' }, { transform: 'none' }], 360, 'cubic-bezier(.2,.8,.2,1)', { delay: ctx.d(60) * k }));
        fade.cancel(); hero.className = 'pl-hero pp ' + c.cls;
        mo = spring({ from: 0, to: 1, stiffness: 240, update: p => { hero.style.opacity = String(clamp(p, 0, 1)); hero.style.transform = `scale(${0.9 + 0.1 * p})`; } });
      }, () => {});
    };
    root.addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b) go(+b.dataset.ch, '切换章节'); });
    return () => { alive = false; };
  };

  /* ---------- 6. album stack ---------- */
  S.photoAlbum = (root, ctx) => {
    const items = PHOTOS.slice(0, 5);
    root.innerHTML = `<div class="ap pa"><header class="ap-head"><h4>相册</h4><span class="ap-sub pa-n">01 / 05</span></header>
      <div class="pa-stack" tabindex="0" aria-label="相册卡片，左右方向键切换">${items.map((p, i) => `<article class="pa-card" data-i="${i}"><span class="pp ${p[2]}"></span><b>${p[0]}</b><small>${p[1]}<span> · ${12 + i * 7} 张照片</span></small></article>`).join('')}</div>
      <div class="pa-dots" aria-hidden="true">${items.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
      <div class="pa-btns"><button type="button" class="ap-pill pa-prev">← 上一本</button><button type="button" class="ap-pill pa-next">下一本 →</button></div></div>`;
    const stack = $('.pa-stack', root), cards = $$('.pa-card', root);
    const ROT = [0, -3, 3, -2, 2];
    let order = cards.map((_, i) => i), busy = false;
    const layout = (instant, why) => {
      const back = ctx.tilt() < 1 ? 'cubic-bezier(.2,.8,.2,1)' : ctx.ease;
      order.forEach((i, dd) => {
        const c = cards[i];
        c.style.transition = instant || ctx.reduced() ? 'none' : `transform ${ctx.d(520)}ms ${back} ${ctx.d(45) * dd}ms`;
        c.style.transform = `translateY(${dd * 12}px) scale(${1 - dd * 0.05}) rotate(${ROT[dd] * ctx.tilt()}deg)`;
        c.style.zIndex = String(10 - dd); c.setAttribute('aria-hidden', String(dd !== 0));
      });
      const t = order[0];
      $$('.pa-dots i', root).forEach((d, j) => d.classList.toggle('on', j === t));
      $('.pa-n', root).textContent = `0${t + 1} / 0${items.length}`;
      if (why) { ctx.announce(`相册 ${t + 1} / ${items.length}：${items[t][0]}`); ctx.log(`${why}：其余卡片弹簧前移，指示器更新`); }
    };
    const next = (dir, x, why) => {
      if (busy) return; busy = true;
      if (dir > 0) {
        const c = cards[order[0]], s = x < 0 ? -1 : 1;
        c.style.transition = 'none';
        play(ctx, c, [{ transform: `translateX(${x || 0}px) rotate(${(x || 0) / 18}deg)` }, { transform: `translateX(${s * 260}px) rotate(${s * 16}deg)` }], 200, 'ease-in', { fill: 'none' }).finished.then(() => { order.push(order.shift()); layout(false, why); busy = false; });
      } else { order.unshift(order.pop()); layout(false, why); busy = false; }
    };
    dragger(stack, {
      move(x) { if (busy) return; const c = cards[order[0]]; c.style.transition = 'none'; c.style.transform = `translateX(${x}px) rotate(${x / 18}deg)`; },
      end(x, vx) { if (busy) return; if (Math.abs(x) > 90 || Math.abs(vx) > 0.6) next(1, x, Math.abs(x) > 90 ? '拖过阈值' : '快速滑走'); else { layout(); if (Math.abs(x) > 10) ctx.log('没过阈值：回弹'); } }
    });
    stack.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); next(1, 0, '→'); } if (e.key === 'ArrowLeft') { e.preventDefault(); next(-1, 0, '←'); } });
    $('.pa-next', root).addEventListener('click', () => next(1, 0, '按钮'));
    $('.pa-prev', root).addEventListener('click', () => next(-1, 0, '按钮'));
    layout(true);
  };

  /* ---------- 7. list card lift ---------- */
  S.photoLift = (root, ctx) => {
    const items = PHOTOS.slice(0, 4);
    root.innerHTML = `<div class="ap pk"><header class="ap-head"><h4>本周故事</h4><span class="ap-sub">4 篇</span></header>
      <div class="pk-list">${items.map((p, i) => `<button type="button" class="pk-card" data-i="${i}"><span class="pp ${p[2]}"></span><span><b>${p[0]}</b><small>${p[1]}</small></span></button>`).join('')}</div>
      <section class="pk-detail" hidden><span class="pp pk-img"></span><button type="button" class="pk-back" aria-label="返回列表">‹</button>
        <div class="pk-copy"><h4 tabindex="-1"></h4><small></small><p>这张照片是在路上随手拍的。点返回，它会落回列表里原来的位置。</p></div></section></div>`;
    const ap = $('.pk', root), list = $('.pk-list', root), det = $('.pk-detail', root), copy = $('.pk-copy', root);
    let busy = false, cur = null;
    const full = () => ({ left: '0px', top: '0px', width: ap.clientWidth + 'px', height: ap.clientHeight + 'px' });
    const open = (card, why) => {
      if (busy) { ctx.log('转场中，忽略重复点击'); return; }
      busy = true; cur = card;
      const p = items[+card.dataset.i];
      card.classList.add('lifted'); ap.classList.add('dimmed'); list.inert = true;
      $('.pk-img', det).className = 'pp pk-img ' + p[2]; $('h4', det).textContent = p[0]; $('small', copy).textContent = p[1];
      ctx.log(`${why}：卡片放大上浮，其余模糊变淡`);
      ctx.later(() => {
        const from = Object.assign(rel(card, ap), { borderRadius: '16px' });
        det.hidden = false;
        play(ctx, copy, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 0, transform: 'translateY(12px)', offset: 0.5 }, { opacity: 1, transform: 'none' }], 420);
        play(ctx, det, [from, Object.assign(full(), { borderRadius: '0px' })], 380, 'cubic-bezier(.2,.9,.3,1)').finished.then(() => {
          busy = false; $('h4', det).focus({ preventScroll: true }); ctx.announce(`已打开「${p[0]}」`); ctx.log('展开成详情，焦点移到标题');
        });
      }, ctx.reduced() ? 0 : ctx.d(190));
    };
    const close = why => {
      if (busy || !cur) return; busy = true;
      cur.classList.remove('lifted');
      const to = Object.assign(rel(cur, ap), { borderRadius: '16px' });
      play(ctx, copy, [{ opacity: 1 }, { opacity: 0 }], 120);
      play(ctx, det, [Object.assign(full(), { borderRadius: '0px' }), to], 440, ctx.ease).finished.then(() => {
        det.hidden = true; det.getAnimations().forEach(a => a.cancel());
        ap.classList.remove('dimmed'); list.inert = false; busy = false;
        cur.focus({ preventScroll: true }); ctx.announce('已返回列表'); ctx.log(`${why}：落回原位并回弹，模糊撤掉`);
      });
    };
    list.addEventListener('click', e => { const c = e.target.closest('.pk-card'); if (c) open(c, '点击'); });
    $('.pk-back', root).addEventListener('click', () => close('返回按钮'));
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && !det.hidden) { e.preventDefault(); close('Esc'); } });
  };
})();

(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const phone = $('#phone');
  const list = $('#tasks');
  const live = $('#live');
  const srMirror = $('#sr-mirror');
  const toast = $('#toast');
  const toastText = $('#toast-text');
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- page theme ---------- */
  const themeBtn = $('#theme');
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    themeBtn.textContent = t === 'dark' ? '浅色' : '深色';
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
  }
  let saved = null;
  try { saved = localStorage.getItem('pipeline-theme'); } catch (e) { /* storage unavailable */ }
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('pipeline-theme', next); } catch (e) { /* ignore */ }
  });

  /* ---------- model ---------- */
  const SAMPLE = [
    { id: 't1', title: '回复设计评审意见', meta: '09:30 · 工作' },
    { id: 't2', title: '取快递（驿站 3 号柜）', meta: '12:00 · 生活' },
    { id: 't3', title: '整理周报数据', meta: '15:00 · 工作', done: true },
    { id: 't4', title: '给妈妈打电话', meta: '19:00 · 家人' },
    { id: 't5', title: '读完《设计中的设计》第三章', meta: '21:30 · 阅读' },
    { id: 't6', title: '预约周六羽毛球场', meta: '随时 · 运动' }
  ];
  let items = SAMPLE.map(t => ({ ...t }));
  let pending = null; // { item, index, timer, li, anims }
  const leaving = new Map(); // id -> { li, anims }

  const audit = () => phone.dataset.audit;
  const reduced = () => reduceQuery.matches || $('#reduce').checked;
  const slow = () => ($('#slow').checked ? 4 : 1);

  /* ---------- logs ---------- */
  let t0 = performance.now();
  const stamp = () => `${String(Math.round(performance.now() - t0)).padStart(5, ' ')}ms`;
  function log(which, text) {
    const ol = $(which === 'data' ? '#log-data' : '#log-paint');
    const li = document.createElement('li');
    li.textContent = `${stamp()}  ${text}`;
    li.title = li.textContent;
    ol.append(li);
    while (ol.children.length > 40) ol.firstElementChild.remove();
    ol.parentElement.scrollTop = ol.parentElement.scrollHeight;
  }
  function resetClock() { t0 = performance.now(); $('#log-data').textContent = ''; $('#log-paint').textContent = ''; }

  function announce(text) {
    if (audit() === 'before') { srMirror.textContent = '（修复前：没有任何播报）'; return; }
    live.textContent = '';
    setTimeout(() => { live.textContent = text; srMirror.textContent = text; }, 30);
  }

  /* ---------- render ---------- */
  function rowEl(t) {
    const li = document.createElement('li');
    li.className = 'task' + (t.done ? ' done' : '');
    li.dataset.id = t.id;
    li.innerHTML = `<span class="reveal" aria-hidden="true">删除</span>
      <div class="task-body" tabindex="0" aria-describedby="row-help">
        <span class="chk" aria-hidden="true"></span>
        <span class="ttl"></span>
        <button type="button" class="more" aria-haspopup="dialog">⋯</button>
      </div>`;
    $('.ttl', li).append(t.title, Object.assign(document.createElement('span'), { className: 'meta', textContent: t.meta }));
    $('.task-body', li).setAttribute('aria-label', `${t.title}，${t.meta}${t.done ? '，已完成' : ''}`);
    $('.more', li).setAttribute('aria-label', `「${t.title}」的更多操作`);
    bindRow(li);
    return li;
  }
  function render() {
    list.textContent = '';
    items.forEach(t => list.append(rowEl(t)));
    refreshMeta();
  }
  function refreshMeta() {
    const done = items.filter(t => t.done).length;
    const total = items.length;
    $('#count').textContent = total ? `${done} / ${total} 已完成` : '0 项';
    $('#progress i').style.width = total ? `${(done / total) * 100}%` : '0';
    $('#progress').setAttribute('aria-label', `已完成 ${done} 项，共 ${total} 项`);
    $('#empty').hidden = total > 0 || leaving.size > 0;
  }
  const help = Object.assign(document.createElement('p'), { id: 'row-help', className: 'sr-only', textContent: '按 Delete 删除，按回车标记完成，或使用更多操作按钮。' });
  phone.append(help);

  /* ---------- focus policy ---------- */
  function focusAfterRemoval(li) {
    if (audit() === 'before') {
      document.activeElement && document.activeElement.blur();
      return '页面 body ⚠ 焦点丢失';
    }
    const alive = el => el && el.classList.contains('task') && !leaving.has(el.dataset.id);
    let next = li.nextElementSibling;
    while (next && !alive(next)) next = next.nextElementSibling;
    let prev = li.previousElementSibling;
    while (prev && !alive(prev)) prev = prev.previousElementSibling;
    const target = next || prev;
    if (target) { $('.task-body', target).focus({ preventScroll: true }); return `${next ? '下一' : '上一'}行「${$('.ttl', target).firstChild.textContent}」`; }
    const h = $('#list-title'); h.focus({ preventScroll: true }); return '空状态标题';
  }

  /* ---------- remove / undo ---------- */
  function commitPending() {
    if (!pending) return;
    clearTimeout(pending.timer);
    log('data', `撤销窗口关闭，「${pending.item.title}」最终删除`);
    pending = null;
  }

  function remove(id, via, fromX = 0) {
    const index = items.findIndex(t => t.id === id);
    if (index < 0) return;
    const li = list.querySelector(`.task[data-id="${id}"]`);
    commitPending();
    const [item] = items.splice(index, 1);
    log('data', `删除「${item.title}」（${via}）`);
    const where = focusAfterRemoval(li);
    log('data', `焦点 → ${where}`);

    const k = slow();
    const body = $('.task-body', li);
    li.setAttribute('aria-hidden', 'true');
    li.inert = true;
    if (!reduced()) li.classList.add('swiping');
    const h = li.offsetHeight;
    let out;
    if (reduced()) {
      out = li.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120 * k, fill: 'forwards' });
      log('paint', '淡出 120ms（减少动态效果，无位移）');
    } else {
      out = body.animate([
        { transform: `translateX(${fromX}px) rotate(0deg)`, opacity: 1 },
        { transform: 'translateX(-110%) rotate(-3deg)', opacity: 0 }
      ], { duration: 220 * k, easing: 'cubic-bezier(.4,0,.9,.6)', fill: 'forwards' });
      log('paint', `离场 ${220 * k}ms 开始`);
    }
    const entry = { li, anims: [out], index, closing: null };
    leaving.set(id, entry);
    out.finished.then(() => {
      if (!leaving.has(id)) return;
      log('paint', reduced() ? '淡出完成' : '离场完成，补位开始');
      const close = li.animate([{ height: `${h}px`, marginBottom: '8px' }, { height: '0px', marginBottom: '0px' }],
        { duration: (reduced() ? 1 : 180) * k, easing: 'ease-out', fill: 'forwards' });
      entry.anims.push(close);
      return close.finished.then(() => {
        if (!leaving.has(id)) return;
        leaving.delete(id);
        li.remove();
        log('paint', '补位完成，节点移除');
        refreshMeta();
      });
    }).catch(() => { /* cancelled by undo */ });

    pending = { item, index, timer: setTimeout(commitPending, 5000) };
    toastText.textContent = `已删除「${item.title.length > 8 ? item.title.slice(0, 8) + '…' : item.title}」`;
    toast.hidden = false;
    announce(`已删除「${item.title}」，可撤销`);
    refreshMeta();
  }

  function undo() {
    if (!pending) return;
    const { item, index } = pending;
    clearTimeout(pending.timer);
    pending = null;
    items.splice(Math.min(index, items.length), 0, item);
    log('data', `撤销：「${item.title}」回到第 ${index + 1} 位`);
    toast.hidden = true;
    const entry = leaving.get(item.id);
    let li;
    if (entry) {
      leaving.delete(item.id);
      li = entry.li;
      entry.anims.forEach(a => { a.playbackRate = -1; a.play(); });
      Promise.all(entry.anims.map(a => a.finished)).then(() => entry.anims.forEach(a => a.cancel())).catch(() => {});
      li.removeAttribute('aria-hidden');
      li.inert = false;
      Promise.all(entry.anims.map(a => a.finished)).then(() => li.classList.remove('swiping')).catch(() => {});
      log('paint', '动画中途撤销：原路反向');
    } else {
      li = rowEl(item);
      const after = list.children[index] || null;
      list.insertBefore(li, after);
      if (!reduced()) li.animate([{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 200 * slow(), easing: 'ease-out' });
      log('paint', reduced() ? '直接出现' : '从左侧回到原位 200ms');
    }
    if (audit() === 'after') $('.task-body', li).focus({ preventScroll: true });
    announce(`已恢复「${item.title}」`);
    refreshMeta();
  }
  $('#undo').addEventListener('click', undo);
  $('#restore').addEventListener('click', () => {
    commitPending(); toast.hidden = true; items = SAMPLE.map(t => ({ ...t })); render();
    $('.task-body', list).focus();
    log('data', '恢复示例任务');
  });

  function toggleDone(id) {
    const t = items.find(x => x.id === id); if (!t) return;
    t.done = !t.done;
    const li = list.querySelector(`.task[data-id="${id}"]`);
    li.classList.toggle('done', t.done);
    $('.task-body', li).setAttribute('aria-label', `${t.title}，${t.meta}${t.done ? '，已完成' : ''}`);
    announce(t.done ? `「${t.title}」已完成` : `「${t.title}」标为未完成`);
    refreshMeta();
  }

  /* ---------- row input: swipe, keyboard, menu ---------- */
  function bindRow(li) {
    const body = $('.task-body', li);
    let sx = 0, sy = 0, dx = 0, drag = false, pid = null;
    body.addEventListener('pointerdown', e => {
      if (e.target.closest('.more') || e.button > 0 || li.classList.contains('busy')) return;
      sx = e.clientX; sy = e.clientY; dx = 0; drag = false; pid = e.pointerId;
    });
    body.addEventListener('pointermove', e => {
      if (pid !== e.pointerId) return;
      const mx = e.clientX - sx, my = e.clientY - sy;
      if (!drag) {
        if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) { drag = true; body.setPointerCapture(pid); li.classList.add('swiping'); }
        else if (Math.abs(my) > 8) { pid = null; return; }
        else return;
      }
      dx = Math.min(0, mx);
      body.style.transform = `translateX(${dx}px)`;
      li.classList.toggle('armed', -dx > body.offsetWidth * 0.4);
    });
    const end = e => {
      if (pid !== e.pointerId) return;
      pid = null;
      if (!drag) return;
      drag = false;
      if (li.classList.contains('armed')) {
        body.style.transform = '';
        remove(li.dataset.id, '左滑', dx);
      } else {
        body.animate([{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }], { duration: reduced() ? 1 : 160, easing: 'ease-out' });
        body.style.transform = '';
        li.classList.remove('swiping');
      }
      li.classList.remove('armed');
    };
    body.addEventListener('pointerup', end);
    body.addEventListener('pointercancel', end);
    body.addEventListener('keydown', e => {
      if (e.target !== body) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && audit() === 'after') { e.preventDefault(); remove(li.dataset.id, 'Delete 键'); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDone(li.dataset.id); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const sib = e.key === 'ArrowDown' ? li.nextElementSibling : li.previousElementSibling;
        if (sib) $('.task-body', sib).focus();
      }
    });
    $('.more', li).addEventListener('click', () => openSheet(li.dataset.id, $('.more', li)));
  }

  const sheet = $('#action-sheet');
  const back = $('#sheet-back');
  let sheetFor = null, sheetReturn = null;
  function openSheet(id, from) {
    sheetFor = id; sheetReturn = from;
    sheet.hidden = false; back.hidden = false;
    $('#app').inert = true;
    $('[data-sheet="delete"]', sheet).focus();
  }
  function closeSheet(restore = true) {
    sheet.hidden = true; back.hidden = true;
    $('#app').inert = false;
    if (restore && sheetReturn && sheetReturn.isConnected) sheetReturn.focus();
    sheetFor = null;
  }
  back.addEventListener('click', () => closeSheet());
  sheet.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
    if (e.key === 'Tab') {
      const b = $$('button', sheet); const i = b.indexOf(document.activeElement);
      e.preventDefault(); b[(i + (e.shiftKey ? b.length - 1 : 1)) % b.length].focus();
    }
  });
  sheet.addEventListener('click', e => {
    const a = e.target.closest('[data-sheet]'); if (!a) return;
    const id = sheetFor;
    if (a.dataset.sheet === 'delete') { closeSheet(false); remove(id, '⋯ 菜单'); }
    else if (a.dataset.sheet === 'done') { closeSheet(); toggleDone(id); }
    else closeSheet();
  });

  /* ---------- stage 3: tokens ---------- */
  const TOKENS = {
    light: { '--p-card': '#ffffff', '--p-ink': '#1b1c1e', '--p-muted': '#5c6066', '--p-accent': '#2741c8', '--p-on-accent': '#ffffff', '--p-danger': '#c62f22', '--p-on-danger': '#ffffff' },
    dark: { '--p-card': '#1e2024', '--p-ink': '#ecebe6', '--p-muted': '#a2a6ad', '--p-accent': '#8ea2ff', '--p-on-accent': '#0d1020', '--p-danger': '#ff7a6b', '--p-on-danger': '#1a0503' }
  };
  const BEFORE_MUTED = { light: '#a9abad', dark: '#55585e' };
  const PAIRS = [
    ['--p-ink', '--p-card', '正文 / 卡片'],
    ['--p-muted', '--p-card', '次要文字 / 卡片'],
    ['--p-on-accent', '--p-accent', '“新建”按钮'],
    ['--p-on-danger', '--p-danger', '滑出的“删除”']
  ];
  function lum(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  }
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  function tokensFor(theme) {
    const t = { ...TOKENS[theme] };
    if (audit() === 'before') t['--p-muted'] = BEFORE_MUTED[theme];
    return t;
  }
  function renderTokens() {
    const theme = phone.dataset.ptheme;
    const t = tokensFor(theme);
    Object.entries(t).forEach(([k, v]) => phone.style.setProperty(k, v));
    $('#tokens tbody').innerHTML = PAIRS.map(([fg, bg, use]) => {
      const r = ratio(t[fg], t[bg]);
      return `<tr><td><code>${fg}</code></td><td><span class="sw" style="background:${t[fg]}"></span><code>${t[fg]}</code> / <span class="sw" style="background:${t[bg]}"></span><code>${t[bg]}</code></td><td>${use}</td><td class="${r >= 4.5 ? 'pass' : 'fail'}">${r.toFixed(1)}:1 ${r >= 4.5 ? '✓' : '✗'}</td></tr>`;
    }).join('');
  }
  $$('[data-ptheme]').forEach(b => b.addEventListener('click', () => {
    phone.dataset.ptheme = b.dataset.ptheme;
    $$('[data-ptheme]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderTokens();
  }));

  /* ---------- stage 4: contract playback ---------- */
  const playBtn = $('#play-contract');
  playBtn.addEventListener('click', async () => {
    playBtn.disabled = true;
    const steps = $$('#contract li');
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const hot = i => steps.forEach((s, j) => s.classList.toggle('hot', i === j));
    if (!items.length) $('#restore').click();
    const first = list.querySelector('.task');
    const id = first.dataset.id;
    const body = $('.task-body', first);
    hot(0); body.style.outline = '2px solid var(--p-accent)'; await wait(1100);
    hot(1); body.style.outline = '';
    const w = body.offsetWidth * 0.45;
    if (!reduced()) await body.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-w}px)` }], { duration: 500, fill: 'forwards', easing: 'ease-out' }).finished;
    first.classList.add('armed', 'swiping'); await wait(600);
    hot(2); body.getAnimations().forEach(a => a.cancel()); first.classList.remove('armed');
    remove(id, '回放', reduced() ? 0 : -w); await wait(1300);
    hot(3); undo(); await wait(1300);
    hot(4); await wait(1400);
    hot(-1); playBtn.disabled = false;
  });

  /* ---------- stage 5: state matrix ---------- */
  function setRowState(s) {
    $$('#matrix button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.rs === s)));
    const li = list.querySelector('.task'); if (!li) return;
    const body = $('.task-body', li);
    li.classList.remove('armed', 'busy', 'err', 'swiping');
    body.style.transform = ''; body.style.outline = '';
    li.removeAttribute('aria-busy');
    const meta = $('.meta', li); const t = items.find(x => x.id === li.dataset.id);
    if (meta && t) meta.textContent = t.meta;
    if (s === 'focus') { body.style.outline = '2px solid var(--p-accent)'; body.style.outlineOffset = '-2px'; }
    if (s === 'drag' || s === 'armed') li.classList.add('swiping');
    if (s === 'drag') body.style.transform = `translateX(${-body.offsetWidth * 0.2}px)`;
    if (s === 'armed') { body.style.transform = `translateX(${-body.offsetWidth * 0.45}px)`; li.classList.add('armed'); }
    if (s === 'busy') { li.classList.add('busy'); li.setAttribute('aria-busy', 'true'); }
    if (s === 'error') { li.classList.add('err'); if (meta) meta.textContent = '删除失败 · 已保留，可重试'; }
  }
  $$('#matrix button').forEach(b => b.addEventListener('click', () => setRowState(b.dataset.rs)));

  /* ---------- stage 6: motion tests ---------- */
  $('#burst').addEventListener('click', () => {
    resetClock();
    if (items.length < 3) $('#restore').click();
    const ids = items.slice(0, 3).map(t => t.id);
    ids.forEach((id, i) => setTimeout(() => remove(id, `连删 ${i + 1}/3`), i * 90 * slow()));
  });
  $('#midundo').addEventListener('click', () => {
    resetClock();
    if (!items.length) $('#restore').click();
    remove(items[0].id, '测试');
    setTimeout(undo, 100 * slow());
  });
  $('#reduce').addEventListener('change', e => log('paint', e.target.checked ? '减少动态效果：开' : '减少动态效果：关'));

  /* ---------- stage 8: audit ---------- */
  const FINDINGS = [
    { t: '只能左滑删除', sev: '高', rep: '只用键盘或开关控制，无法删除任何任务。', fix: '每行加“⋯”菜单；聚焦时 Delete 键删除。', retest: 'Tab 到任意行按 Delete，行被删除。' },
    { t: '删除后焦点丢失', sev: '高', rep: '键盘删除后再按 Tab，从页面顶部重新开始。', fix: '焦点移到下一行 → 上一行 → 空状态标题。', retest: '看第 06 道日志里的“焦点 →”一行。' },
    { t: '删除没有播报', sev: '中', rep: '读屏用户听不到删除结果，也不知道可以撤销。', fix: 'polite live region 播报“已删除，可撤销”。', retest: '下方“读屏会听到”出现对应文本。' },
    { t: '次要文字太浅', sev: '中', rep: '时间与分类文字在卡片上难以辨认。', fix: '提高 --p-muted 明度差。', retest: null }
  ];
  function renderFindings() {
    const before = audit() === 'before';
    const theme = phone.dataset.ptheme;
    const t = tokensFor(theme);
    const r = ratio(t['--p-muted'], t['--p-card']).toFixed(1);
    $('#findings').innerHTML = FINDINGS.map(f => `<li><span class="sev">严重度 ${f.sev}</span><span class="st ${before ? 'open' : 'closed'}">${before ? '未修复' : '已复测'}</span><b>${f.t}</b><br>复现：${f.rep}<br>修复：${f.fix}<br>复测：${f.retest || `当前主题计算对比度 ${r}:1（要求 ≥ 4.5:1）`}</li>`).join('');
  }
  $$('[data-audit]').forEach(b => b.addEventListener('click', () => {
    phone.dataset.audit = b.dataset.audit;
    $$('[data-audit]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    srMirror.textContent = '（还没有播报）';
    renderTokens(); renderFindings();
  }));

  /* ---------- stages: rail + observer ---------- */
  const CAPS = ['', '意图：灰块与区域编号', '样子：唯一的强调色只给“新建”', '令牌：切换原型主题，对比度重算', '行为：五段契约，可逐段回放', '组件：同一行的六种状态', '动效：数据先变，画面后到', '手持：安全区（斜纹）与拇指热区（蓝）', '证据：修复前 / 修复后', '提示词：前八道的合订本'];
  const HINTS = { 1: '还没有样式，但已经可以删除和撤销。', 5: '用左侧按钮切换第一行的状态。', 6: '左滑一行，或用左侧的测试按钮。', 7: '撤销条与“⋯”都在蓝色热区内。', 8: '切到“修复前”，再试着用键盘删除。' };
  const stages = $$('.stage');
  const rail = $('#rail');
  stages.forEach(s => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.dataset.stage.padStart(2, '0');
    b.setAttribute('aria-label', `第 ${s.dataset.stage} 道：${$('h3', s).textContent}`);
    b.addEventListener('click', () => { s.scrollIntoView({ behavior: reduceQuery.matches ? 'auto' : 'smooth', block: 'start' }); setStage(s.dataset.stage); });
    li.append(b); rail.append(li);
    const peek = document.createElement('button');
    peek.type = 'button'; peek.className = 'peek'; peek.textContent = '在原型上看 ↑';
    peek.addEventListener('click', () => { setStage(s.dataset.stage); $('.device-wrap').scrollIntoView({ behavior: reduceQuery.matches ? 'auto' : 'smooth' }); });
    $('header', s).append(peek);
  });
  let current = '1';
  function setStage(n) {
    if (n === current) return;
    if (current === '5') setRowState('idle');
    current = n;
    phone.dataset.stage = n;
    stages.forEach(s => s.classList.toggle('on', s.dataset.stage === n));
    $$('button', rail).forEach((b, i) => {
      const on = String(i + 1) === n;
      if (on) { b.setAttribute('aria-current', 'step'); b.classList.add('seen'); } else b.removeAttribute('aria-current');
    });
    $('#cap-no').textContent = n.padStart(2, '0');
    $('#cap-text').textContent = CAPS[+n];
    $('#device-hint').textContent = HINTS[n] || '左滑一行、点“⋯”，或聚焦后按 Delete。';
  }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) setStage(e.target.dataset.stage); });
  }, { rootMargin: '-35% 0px -60% 0px' });
  stages.forEach(s => io.observe(s));

  /* ---------- assembled prompt ---------- */
  const PROMPT = [
    ['', '请在一个手机 App 的「今日清单」里实现任务删除，需求原话：「卡片删除时飞走，别太夸张」。'],
    ['', ''],
    ['', '场景'],
    ['01', '单手、通勤间隙清理清单；删除可撤销 5 秒，不弹二次确认（假设，需产品确认）。'],
    ['02', '安静的纸面清单；强调色只给“新建”，红色只出现在滑出的删除区域。'],
    ['', '动作'],
    ['04', '三条等价路径：左滑超过行宽 40%｜行尾“⋯”→ 底部动作面板 → 删除｜聚焦时按 Delete。'],
    ['05', 'TaskList 持有数据与 pendingUndo；TaskRow 只持有拖动位移；事件 onRemove(id, via) / onUndo(id)。'],
    ['', '手感（提议值，不是定律）'],
    ['06', '离场 ≈220ms，倾斜 ≤3°，无回弹；补位 ≈180ms ease-out；未过阈值松手 160ms 弹回。'],
    ['06', '撤销发生在动画中途时原路反向，不重新播放。'],
    ['', '边界'],
    ['04', '数据在触发瞬间标记删除，动画被打断、关闭或跳过都不影响结果。'],
    ['06', 'reduced-motion：无位移，120ms 淡出，播报与撤销不变。'],
    ['07', '撤销条位于底部导航与 Home 指示条之上；可点区域 ≥ 44px；“⋯”面板 Esc / 点遮罩关闭，焦点回到“⋯”。'],
    ['01', '清单为空时显示空状态；同步失败保留该行并提示重试。'],
    ['', '验收'],
    ['08', '1. 只用键盘：Tab 到任意行按 Delete 可删除，焦点落到下一行（无下一行则上一行，再无则清单标题），不落到 body。'],
    ['08', '2. 删除后读屏播报“已删除「…」，可撤销”；撤销后播报“已恢复「…」”。'],
    ['06', '3. 连续快速删除三条、删除中途撤销、开启减少动态效果，三种情况都不残留遮挡或空白行。'],
    ['03', '4. 正文、次要文字、按钮文字、删除文字在浅/深主题下对比度均 ≥ 4.5:1。'],
    ['07', '5. 390×844 视口下撤销条不被底部导航或指示条遮挡。'],
    ['', '6. 未在真机与实际读屏软件上测试的项目，列入报告的“未验证”清单。']
  ];
  const pre = $('#prompt-text');
  PROMPT.forEach(([src, text]) => {
    if (src) pre.append(Object.assign(document.createElement('span'), { className: 'src', textContent: `[${src}] ` }));
    pre.append(text + '\n');
  });
  $('#copy').addEventListener('click', async () => {
    const text = PROMPT.map(([, t]) => t).join('\n');
    const status = $('#copy-status');
    try { await navigator.clipboard.writeText(text); status.textContent = '已复制（不含来源标记）。'; }
    catch (e) {
      const r = document.createRange(); r.selectNodeContents(pre);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      status.textContent = '浏览器不允许直接复制，已选中文本，请按 Ctrl/⌘ + C。';
    }
  });

  render();
  renderTokens();
  renderFindings();
  current = '';
  setStage('1');
})();

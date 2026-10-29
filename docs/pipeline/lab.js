(() => {
  'use strict';
  const { FEELS, EFFECTS, buildPrompt } = window.PIPE;
  const SCENES = window.PIPE_SCENES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const TILT = { subtle: 0.6, normal: 1, lively: 1.5 };

  const st = { cat: 'web', fam: '全部', q: '', id: null, feel: 'normal', agent: 'claude', surf: 'auto' };
  const reduced = () => reduceQuery.matches || $('#reduce').checked;
  const byId = id => EFFECTS.find(e => e.id === id);

  /* ---------- theme ---------- */
  const themeBtn = $('#theme');
  const setTheme = t => { document.documentElement.dataset.theme = t; themeBtn.textContent = t === 'dark' ? '浅色' : '深色'; themeBtn.setAttribute('aria-pressed', String(t === 'dark')); };
  let saved = null;
  try { saved = localStorage.getItem('pipeline-theme'); } catch (e) { /* storage unavailable */ }
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(t);
    try { localStorage.setItem('pipeline-theme', t); } catch (e) { /* ignore */ }
  });

  /* ---------- feedback ---------- */
  const live = $('#live');
  function announce(msg) { live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30); }
  const feed = $('#feed');
  function log(msg) {
    const li = document.createElement('li'); li.textContent = msg; feed.prepend(li);
    if (!reduced()) li.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'ease-out' });
    while (feed.children.length > 4) feed.lastElementChild.remove();
  }

  /* ---------- stage ---------- */
  const stage = $('#stage');
  let gen = 0, cleanup = null;
  const timers = new Set();
  function teardown() {
    gen++;
    timers.forEach(clearTimeout); timers.clear();
    if (typeof cleanup === 'function') try { cleanup(); } catch (e) { /* ignore */ }
    cleanup = null;
  }
  function makeCtx(g) {
    return {
      d: ms => (reduced() ? 1 : Math.max(1, Math.round(ms * FEELS[st.feel].k))),
      get ease() { return FEELS[st.feel].ease; },
      tilt: () => TILT[st.feel],
      reduced,
      log: m => { if (g === gen) log(m); },
      announce: m => { if (g === gen) announce(m); },
      later: (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (g === gen) fn(); }, ms); timers.add(id); return id; },
      frame: fn => requestAnimationFrame(t => { if (g === gen) fn(t); })
    };
  }
  function applyVars() {
    stage.style.setProperty('--k', reduced() ? 0.001 : FEELS[st.feel].k);
    stage.style.setProperty('--ease', FEELS[st.feel].ease);
    stage.toggleAttribute('data-reduced', reduced());
  }
  function mount(e, animate) {
    teardown();
    const g = gen;
    const frame = document.createElement('div');
    frame.className = e.cat === 'app' ? 'phone' : 'browser';
    frame.innerHTML = e.cat === 'app'
      ? '<div class="ph-status" aria-hidden="true"><span>9:41</span><span>●●● ▮</span></div><div class="scene"></div><div class="ph-home" aria-hidden="true"></div>'
      : `<div class="br-bar" aria-hidden="true"><i></i><i></i><i></i><span>pipeline.local / ${e.id.slice(2)}</span></div><div class="scene"></div>`;
    const root = $('.scene', frame);
    root.setAttribute('role', 'region'); root.setAttribute('aria-label', `效果预览：${e.title}`);
    stage.dataset.cat = e.cat;
    stage.replaceChildren(frame);
    applyVars();
    try { cleanup = SCENES[e.scene](root, makeCtx(g)); } catch (err) { root.textContent = '场景加载失败：' + err.message; console.error(err); }
    if (animate && !reduced()) frame.animate([{ opacity: 0, transform: 'translateY(10px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
    feed.textContent = '';
    $('#st-hint').textContent = e.hint;
  }

  /* ---------- library ---------- */
  const list = $('#list');
  function visible() {
    const q = st.q.trim().toLowerCase();
    return EFFECTS.filter(e => e.cat === st.cat && (st.fam === '全部' || e.fam === st.fam) &&
      (!q || [e.title, e.sum, e.fam, ...e.keys].join(' ').toLowerCase().includes(q)));
  }
  function drawFams() {
    const fams = ['全部', ...new Set(EFFECTS.filter(e => e.cat === st.cat).map(e => e.fam))];
    if (!fams.includes(st.fam)) st.fam = '全部';
    $('#fams').innerHTML = fams.map(f => `<button type="button" aria-pressed="${f === st.fam}">${f}</button>`).join('');
  }
  function drawList() {
    const v = visible();
    list.innerHTML = v.map(e => {
      const n = EFFECTS.filter(x => x.cat === e.cat).indexOf(e) + 1;
      return `<li><button type="button" data-id="${e.id}" aria-current="${e.id === st.id}"><span class="no">${String(n).padStart(2, '0')}</span><span class="t"><b>${e.title}</b><small>${e.fam}</small></span></button></li>`;
    }).join('');
    $('#list-empty').hidden = v.length > 0;
  }
  $('#fams').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; st.fam = b.textContent; drawFams(); drawList(); });
  $('#q').addEventListener('input', ev => { st.q = ev.target.value; drawList(); });
  list.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-id]'); if (!b) return;
    if (!reduced()) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(.98)' }, { transform: 'scale(1)' }], { duration: 160 });
    select(b.dataset.id, true);
  });
  list.addEventListener('keydown', ev => {
    if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
    const bs = $$('button', list), i = bs.indexOf(document.activeElement); if (i < 0) return;
    ev.preventDefault(); bs[clampIdx(i + (ev.key === 'ArrowDown' ? 1 : -1), bs.length)].focus();
  });
  const clampIdx = (i, n) => Math.max(0, Math.min(n - 1, i));

  /* ---------- category ---------- */
  function placeInd(animate) {
    const b = $(`.cats [data-cat="${st.cat}"]`), ind = $('.cats-ind');
    ind.style.transition = animate && !reduced() ? 'transform .32s cubic-bezier(.3,1.2,.5,1), width .32s' : 'none';
    ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  function setCat(cat, keepId) {
    st.cat = cat;
    $$('.cats button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
    placeInd(true);
    drawFams();
    if (!keepId) { const first = EFFECTS.find(e => e.cat === cat); select(first.id, true); }
    else drawList();
  }
  $$('.cats button').forEach(b => b.addEventListener('click', () => { if (b.dataset.cat !== st.cat) setCat(b.dataset.cat); }));
  addEventListener('resize', () => placeInd(false));

  /* ---------- detail ---------- */
  function drawDetail() {
    const e = byId(st.id);
    const n = EFFECTS.filter(x => x.cat === e.cat).indexOf(e) + 1;
    $('#d-no').textContent = `${e.cat === 'app' ? 'APP' : 'WEB'} ${String(n).padStart(2, '0')}`;
    $('#d-title').textContent = e.title; $('#d-sum').textContent = e.sum;
    $('#st-fam').textContent = `${e.cat === 'app' ? 'App / 小程序' : '网页'} · ${e.fam}`; $('#st-title').textContent = e.title;
    const skills = ['uiux-workflow', ...e.skills, ...(e.cat === 'app' && !e.skills.includes('uiux-mobile-patterns') ? ['uiux-mobile-patterns'] : [])];
    $('#d-skills').innerHTML = skills.map(s => `<span>${st.agent === 'codex' ? '$' : ''}${s}</span>`).join('');
    $('#d-prompt').textContent = buildPrompt([e], { feel: st.feel, agent: st.agent, cat: e.cat });
    $('#d-acc').innerHTML = e.acc.map(a => `<li>${a}</li>`).join('');
  }
  function select(id, animate) {
    const e = byId(id); if (!e) return;
    st.id = id;
    if (e.cat !== st.cat) { setCat(e.cat, true); }
    drawList(); drawDetail(); mount(e, animate);
    try { history.replaceState(null, '', '#' + id); } catch (err) { /* ignore */ }
  }

  $$('[data-feel]').forEach(b => b.addEventListener('click', () => setFeel(b.dataset.feel, true)));
  function setFeel(f, fromStage) {
    st.feel = f;
    $$('[data-feel]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.feel === f)));
    applyVars(); drawDetail();
    if (fromStage) log(`手感切换为「${FEELS[f].label}」：时长 ×${FEELS[f].k}，${FEELS[f].easeText}`);
  }
  $('#reduce').addEventListener('change', ev => { applyVars(); log(ev.target.checked ? '减少动态效果：开（状态与反馈保留，位移去掉）' : '减少动态效果：关'); });
  $('#reset').addEventListener('click', () => { mount(byId(st.id), true); log('已重置'); });
  $$('[data-agent]').forEach(b => b.addEventListener('click', () => {
    st.agent = b.dataset.agent;
    $$('[data-agent]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    drawDetail(); if (lastCompose) compose(true);
  }));

  function copyText(btn, text) {
    const done = ok => {
      btn.classList.remove('done'); btn.offsetWidth; btn.classList.add('done');
      $('.copy-b', btn).textContent = ok ? '已复制 ✓' : '请手动复制';
      announce(ok ? '已复制提示词' : '浏览器不允许直接复制，已选中文本');
      setTimeout(() => btn.classList.remove('done'), 1600);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => done(true), () => fallback());
    else fallback();
    function fallback() {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } ta.remove();
      done(ok);
    }
  }
  $('#d-copy').addEventListener('click', ev => copyText(ev.currentTarget, $('#d-prompt').textContent));

  /* ---------- composer ---------- */
  const EXAMPLES = [
    '小程序首页的底部导航切换时，背景块滑过去，图标轻轻弹一下，别太夸张。用 uni-app。',
    '消息列表左滑删除，要能撤销，删除的时候有点飞走的感觉',
    '地图页底部有个可以上拉的面板，拖到一半能停住，手感要跟手',
    '后台的数据看板，折线图能拖动选一段时间，看合计和平均，用 React',
    '官网的注册表单，填错了输入框抖一下，提交成功卡片翻过来，深色模式也要好看',
    '作品集页面按分类筛选，卡片要平滑地挪到新位置，活泼一点'
  ];
  $('#examples').innerHTML = EXAMPLES.map(x => `<button type="button">${x.length > 18 ? x.slice(0, 18) + '…' : x}</button>`).join('');
  $$('#examples button').forEach((b, i) => b.addEventListener('click', () => { $('#need').value = EXAMPLES[i]; compose(); }));
  $$('[data-surf]').forEach(b => b.addEventListener('click', () => {
    st.surf = b.dataset.surf; $$('[data-surf]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    if (lastCompose) compose(true);
  }));

  const APP_CUES = ['app', '小程序', '手机', '移动端', '手势', '触屏', '左滑', '右滑', '下拉', '上拉', 'ios', '安卓', 'android', 'uni-app', '微信', '底部导航', 'h5', '单手'];
  const WEB_CUES = ['网页', '网站', '官网', '后台', 'dashboard', '看板', '工作台', '桌面', '浏览器', 'pc', '表格', '管理系统', 'saas', '鼠标', '悬停', 'hover'];
  const STACKS = [['react', 'React'], ['next', 'Next.js'], ['vue', 'Vue'], ['nuxt', 'Nuxt'], ['svelte', 'Svelte'], ['angular', 'Angular'], ['uni-app', 'uni-app'], ['uniapp', 'uni-app'], ['taro', 'Taro'], ['微信小程序', '微信小程序原生'], ['flutter', 'Flutter'], ['swiftui', 'SwiftUI'], ['compose', 'Jetpack Compose'], ['react native', 'React Native'], ['tailwind', 'Tailwind CSS'], ['framer', 'Framer Motion'], ['gsap', 'GSAP']];
  const SUBTLE = ['别太夸张', '不要太夸张', '克制', '低调', '轻一点', '轻轻', '简洁', '安静', '稳重', '高级', '精致', '自然', '细腻'];
  const LIVELY = ['活泼', '弹', '俏皮', '夸张一点', '有趣', '灵动', 'q弹', '爽', '可爱', '有活力', '酷炫'];
  const EXTRAS = [
    [['深色', '暗色', 'dark'], '主题：同时适配浅色与深色，两种主题下文字与控件对比度均 ≥ 4.5:1（uiux-design-system）。'],
    [['无障碍', '读屏', '键盘', 'a11y', '残障'], '无障碍：完整键盘路径与读屏播报是硬性要求，请逐条复测并在交付中给出证据。'],
    [['震动', '触感', 'haptic'], '触感：支持时在关键节点给一次短震动，不支持时不影响功能。'],
    [['性能', '流畅', '卡顿', '60'], '性能：只动画 transform / opacity；如需布局动画，用运行时性能记录说明代价，不要只凭截图声称流畅。'],
    [['响应式', '适配', '平板', 'ipad'], '适配：在 390、768、1280 三个宽度下检查布局与触控区域。']
  ];
  let lastCompose = false;
  function parse(need) {
    const t = need.toLowerCase();
    const a = APP_CUES.filter(c => t.includes(c)).length, w = WEB_CUES.filter(c => t.includes(c)).length;
    const cat = st.surf !== 'auto' ? st.surf : a > w ? 'app' : w > a ? 'web' : null;
    const stack = (STACKS.find(([k]) => t.includes(k)) || [])[1] || '';
    const feel = SUBTLE.some(c => t.includes(c)) ? 'subtle' : LIVELY.some(c => t.includes(c)) ? 'lively' : null;
    const extras = EXTRAS.filter(([ks]) => ks.some(k => t.includes(k))).map(x => x[1]);
    const scored = EFFECTS.map(e => {
      let s = 0;
      e.keys.forEach(k => { if (t.includes(k.toLowerCase())) s += k.length >= 3 ? 4 : 3; });
      for (let i = 0; i < e.title.length - 1; i++) { const bg = e.title.slice(i, i + 2); if (/[一-龥]{2}/.test(bg) && t.includes(bg)) s += 1; }
      if (s > 0 && cat) s += e.cat === cat ? 3 : -3;
      return [e, s];
    }).filter(x => x[1] > 0).sort((p, q) => q[1] - p[1]);
    const top = scored[0];
    const picks = top ? [top[0]] : [];
    const second = scored.find(([e, s]) => top && e !== top[0] && e.cat === top[0].cat && s >= Math.max(3, top[1] * 0.45));
    if (second) picks.push(second[0]);
    return { cat: cat || (picks[0] ? picks[0].cat : null), stack, feel, extras, picks, scored };
  }
  function fallbackPrompt(need, p) {
    const skill = s => (st.agent === 'codex' ? '$' + s : s);
    const cat = p.cat || 'web';
    return [
      st.agent === 'plain' ? '请按“意图 → 行为契约 → 组件状态 → 动效 → 验收”的顺序完成下面的界面需求。' : `${st.agent === 'codex' ? '$uiux-workflow 请统筹' : '请使用 uiux-workflow skill 统筹'}这次实现。`,
      '',
      `需求原话：「${need}」`,
      `界面：${cat === 'app' ? 'App / 小程序（手持触摸为主）' : '网页（指针 + 键盘）'}${p.cat ? '' : '（未能判断，按网页处理；如不对请先确认）'}`,
      p.stack ? `技术栈：${p.stack}；沿用项目现有组件与令牌。` : '技术栈：沿用项目现有框架；没有时用原生 HTML/CSS/JS 写单文件演示。',
      ...p.extras,
      '',
      '这个需求在示例库里没有直接对应的效果，请先补全再实现：',
      `1. 用 ${skill('uiux-page-planning')} 写出界面、用户任务和必须的状态（空 / 加载 / 失败）。`,
      `2. 用 ${skill('uiux-interaction-spec')} 写出五段交互契约：对象、触发、过程、结果与反向、无障碍与降级；拿不准的地方先问我。`,
      `3. 用 ${skill('uiux-motion-engineering')} 给出提议时长与缓动、中断策略、减少动态效果版本。`,
      `4. 实现后用 ${skill('uiux-accessibility-review')} 复测键盘、焦点、播报与对比度。`,
      '',
      '交付：契约 + 可运行代码 + “已验证 / 未验证”两份清单。不要改动无关页面。'
    ].join('\n');
  }
  function compose(silent) {
    const need = $('#need').value.trim();
    if (!need) { $('#need').focus(); if (!silent) announce('请先写下需求'); return; }
    lastCompose = true;
    const p = parse(need);
    const feel = p.feel || st.feel;
    const tags = [
      `界面：${p.cat === 'app' ? 'App / 小程序' : p.cat === 'web' ? '网页' : '未判断'}${st.surf !== 'auto' ? '（手动）' : ''}`,
      `手感：${FEELS[feel].label}${p.feel ? '' : '（沿用舞台设置）'}`,
      p.stack ? `技术栈：${p.stack}` : null,
      ...p.extras.map(x => x.split('：')[0])
    ].filter(Boolean);
    $('#parsed').innerHTML = '<span>识别到</span>' + tags.map(x => `<b>${x}</b>`).join('');
    const out = $('#out');
    out.textContent = p.picks.length ? buildPrompt(p.picks, { need, feel, agent: st.agent, cat: p.cat || p.picks[0].cat, stack: p.stack, extras: p.extras }) : fallbackPrompt(need, p);
    if (!silent && !reduced()) out.animate([{ opacity: 0.2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
    $('#matches').innerHTML = p.picks.length
      ? '<span>匹配到</span>' + p.picks.map((e, i) => `<button type="button" data-id="${e.id}">${i ? '组合' : '主效果'} · ${e.title}<em>在舞台预览 ↑</em></button>`).join('')
      : '<span>没有直接匹配，已生成“先补全契约”的工单</span>';
    $('#out-copy').disabled = false;
    if (p.feel && p.feel !== st.feel) setFeel(p.feel);
    if (!silent) announce(p.picks.length ? `已生成，匹配到 ${p.picks.map(e => e.title).join('、')}` : '已生成，需要先补全交互契约');
  }
  $('#go').addEventListener('click', () => compose());
  $('#need').addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); compose(); } });
  $('#matches').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-id]'); if (!b) return;
    select(b.dataset.id, true);
    $('#playground').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  });
  $('#out-copy').addEventListener('click', ev => copyText(ev.currentTarget, $('#out').textContent));

  /* ---------- init ---------- */
  ['web', 'app'].forEach(c => { $('#n-' + c).textContent = EFFECTS.filter(e => e.cat === c).length; });
  const fromHash = byId(location.hash.slice(1));
  st.cat = fromHash ? fromHash.cat : 'web';
  $$('.cats button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === st.cat)));
  drawFams();
  select(fromHash ? fromHash.id : EFFECTS.find(e => e.cat === st.cat).id, false);
  requestAnimationFrame(() => placeInd(false));
  addEventListener('hashchange', () => { const e = byId(location.hash.slice(1)); if (e && e.id !== st.id) select(e.id, true); });
  reduceQuery.addEventListener('change', applyVars);
})();

/* Live scenes for the pipeline playground.
   Each scene receives (root, ctx) and builds a self-contained interactive demo.
   ctx.d(ms) scales a duration by the current feel (≈0 under reduced motion),
   ctx.ease is the current easing, ctx.log / ctx.announce give visible and
   screen-reader feedback, ctx.later / ctx.frame are cleaned up on teardown. */
(() => {
  'use strict';
  const S = {};
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rubber = (over, r) => Math.sign(over) * r * (1 - Math.exp(-Math.abs(over) / r));
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* ======================= WEB ======================= */

  S.statusButton = (root, ctx) => {
    root.innerHTML = `<div class="sb">
      <div class="sb-card">
        <p class="sc-kicker">设置 / 通知</p>
        <h4>通知偏好</h4>
        <label class="sb-row"><span>任务被指派给我时发邮件</span><input type="checkbox" checked></label>
        <label class="sb-row"><span>每周一发送项目摘要</span><input type="checkbox"></label>
        <label class="sb-row"><span>评论里提到我时推送</span><input type="checkbox" checked></label>
        <div class="sb-foot"><span class="sb-note">第 <b class="sb-n">1</b> 次提交</span>
          <button class="sb-btn" type="button"><span class="sb-label">保存设置</span>
            <svg class="sb-ring" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>
            <svg class="sb-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
          </button></div>
      </div></div>`;
    const btn = $('.sb-btn', root), label = $('.sb-label', root);
    let n = 0, busy = false;
    btn.addEventListener('click', () => {
      if (busy) { ctx.log('加载中，忽略重复点击'); return; }
      busy = true; n++;
      const fail = n % 3 === 0;
      const w = btn.offsetWidth;
      btn.setAttribute('aria-busy', 'true');
      btn.classList.remove('error', 'success');
      ctx.announce('正在保存'); ctx.log(`提交第 ${n} 次${fail ? '（将模拟失败）' : ''}`);
      btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(.97)' }, { transform: 'scale(1)' }], { duration: ctx.d(120) });
      if (ctx.reduced()) { label.textContent = '保存中…'; btn.classList.add('plain-busy'); }
      else { btn.style.width = w + 'px'; btn.offsetWidth; btn.classList.add('loading'); btn.style.width = '48px'; }
      ctx.later(() => {
        btn.removeAttribute('aria-busy');
        btn.classList.remove('plain-busy');
        if (fail) {
          btn.classList.remove('loading'); btn.style.width = w + 'px';
          label.textContent = '重试';
          btn.classList.add('error');
          if (!ctx.reduced()) btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }], { duration: ctx.d(360) });
          ctx.announce('保存失败，请重试'); ctx.log('失败：按钮轻摇，文案改为“重试”，焦点保持');
          ctx.later(() => { btn.style.width = ''; busy = false; $('.sb-n', root).textContent = n + 1; }, ctx.d(260));
        } else {
          btn.classList.add('success');
          if (ctx.reduced()) label.textContent = '已保存 ✓';
          ctx.announce('已保存'); ctx.log('成功：描出对勾');
          ctx.later(() => {
            btn.classList.remove('loading', 'success');
            btn.style.width = w + 'px';
            label.textContent = '保存设置';
            ctx.later(() => { btn.style.width = ''; busy = false; $('.sb-n', root).textContent = n + 1; }, ctx.d(260));
          }, 1200);
        }
      }, 900);
    });
  };

  S.dragSort = (root, ctx) => {
    let items = ['回复设计评审意见', '整理周报数据', '预约周四会议室', '更新组件文档', '发布 v2.3 版本'];
    const tags = ['紧急', '本周', '本周', '待定', '下周'];
    root.innerHTML = `<div class="ds"><div class="ds-card"><p class="sc-kicker">项目 / 优先级</p><h4>本周待办</h4><p class="ds-sub">拖动左侧把手调整顺序</p><ol class="ds-list"></ol></div></div>`;
    const list = $('.ds-list', root);
    let drag = null;
    const render = focusIdx => {
      list.innerHTML = items.map((t, i) => `<li class="ds-item"><button type="button" class="ds-handle" aria-label="拖动「${esc(t)}」，当前第 ${i + 1} 项，共 ${items.length} 项。空格拿起">⠿</button><span class="ds-no">${i + 1}</span><span class="ds-t">${esc(t)}</span><span class="ds-tag">${tags[i]}</span></li>`).join('');
      if (focusIdx != null) $$('.ds-handle', list)[focusIdx].focus();
    };
    render();
    const rows = () => $$('.ds-item', list);
    const step = () => { const r = rows(); return r[1].getBoundingClientRect().top - r[0].getBoundingClientRect().top; };
    function layout() {
      const { from, target, dy } = drag;
      rows().forEach((li, i) => {
        if (i === from) { li.style.transform = `translateY(${dy}px) scale(1.02)`; return; }
        const s = (from < i && i <= target) ? -drag.step : (target <= i && i < from) ? drag.step : 0;
        li.style.transform = s ? `translateY(${s}px)` : '';
      });
    }
    function pick(i, kb) {
      drag = { from: i, target: i, dy: 0, step: step(), kb };
      rows().forEach((li, j) => li.classList.toggle('shift', j !== i));
      rows()[i].classList.add('lift');
      ctx.log(`拿起「${items[i]}」`); ctx.announce(`已拿起「${items[i]}」，第 ${i + 1} 项。${kb ? '用上下方向键移动，空格放下，Esc 取消' : ''}`);
    }
    function moveTo(t) {
      t = clamp(t, 0, items.length - 1);
      if (t !== drag.target) { drag.target = t; ctx.announce(`第 ${t + 1} 项`); ctx.log(`越过中线 → 第 ${t + 1} 位`); }
    }
    function drop(cancel) {
      const d = drag; drag = null;
      const li = rows()[d.from];
      const final = cancel ? 0 : (d.target - d.from) * d.step;
      li.classList.add('settle');
      li.style.transform = `translateY(${final}px)`;
      if (cancel) rows().forEach((r, i) => { if (i !== d.from) r.style.transform = ''; });
      ctx.later(() => {
        if (!cancel) { const [m] = items.splice(d.from, 1); items.splice(d.target, 0, m); const [tg] = tags.splice(d.from, 1); tags.splice(d.target, 0, tg); }
        render(d.kb || document.activeElement === document.body ? (cancel ? d.from : d.target) : null);
        if (cancel) { ctx.announce('已取消，顺序未变'); ctx.log('Esc 取消，回到原位'); }
        else { ctx.announce(`已放下，现在是第 ${d.target + 1} 项`); ctx.log(`放下 → 第 ${d.target + 1} 位`); }
      }, ctx.d(220));
    }
    list.addEventListener('pointerdown', e => {
      const h = e.target.closest('.ds-handle'); if (!h || drag || e.button > 0) return;
      e.preventDefault();
      const i = $$('.ds-handle', list).indexOf(h);
      pick(i, false); drag.y0 = e.clientY; drag.pid = e.pointerId;
      h.setPointerCapture(e.pointerId);
      layout();
    });
    list.addEventListener('pointermove', e => {
      if (!drag || drag.pid !== e.pointerId) return;
      drag.dy = clamp(e.clientY - drag.y0, -drag.from * drag.step - 20, (items.length - 1 - drag.from) * drag.step + 20);
      moveTo(drag.from + Math.round(drag.dy / drag.step));
      layout();
    });
    const up = e => { if (drag && drag.pid === e.pointerId) drop(false); };
    list.addEventListener('pointerup', up); list.addEventListener('pointercancel', e => { if (drag && drag.pid === e.pointerId) drop(true); });
    list.addEventListener('keydown', e => {
      const h = e.target.closest('.ds-handle'); if (!h) return;
      const i = $$('.ds-handle', list).indexOf(h);
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!drag) { pick(i, true); layout(); } else drop(false); }
      else if (drag && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); moveTo(drag.target + (e.key === 'ArrowUp' ? -1 : 1)); drag.dy = (drag.target - drag.from) * drag.step; layout(); }
      else if (drag && e.key === 'Escape') { e.preventDefault(); drop(true); }
    });
  };

  S.filterGrid = (root, ctx) => {
    const cats = ['全部', '品牌', '产品', '研究'];
    const data = [['春季品牌焕新', '品牌'], ['会员中心改版', '产品'], ['用户访谈 12 场', '研究'], ['海报系统', '品牌'], ['结算流程', '产品'], ['可用性测试', '研究'], ['包装插画', '品牌'], ['数据看板', '产品'], ['竞品分析', '研究']];
    root.innerHTML = `<div class="fg"><div class="fg-head"><div><p class="sc-kicker">作品集</p><h4>最近的项目</h4></div><p class="fg-count" aria-live="polite">显示 9 项</p></div>
      <div class="fg-chips" role="group" aria-label="按分类筛选">${cats.map((c, i) => `<button type="button" aria-pressed="${i === 0}">${c}</button>`).join('')}</div>
      <div class="fg-grid">${data.map(([t, c], i) => `<a href="#" class="fg-card" data-cat="${c}" style="--h:${(i * 47) % 360}"><span class="fg-art" aria-hidden="true"></span><b>${t}</b><small>${c}</small></a>`).join('')}</div></div>`;
    const grid = $('.fg-grid', root);
    grid.addEventListener('click', e => { if (e.target.closest('.fg-card')) { e.preventDefault(); ctx.log('卡片在动画中仍可点击'); } });
    $('.fg-chips', root).addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('.fg-chips button', root).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const cat = b.textContent;
      const cards = $$('.fg-card', grid);
      const g = grid.getBoundingClientRect();
      const first = new Map(cards.filter(c => !c.hidden).map(c => [c, c.getBoundingClientRect()]));
      cards.forEach(c => c.getAnimations().forEach(a => a.cancel()));
      $$('.fg-ghost', grid).forEach(x => x.remove());
      const show = c => cat === '全部' || c.dataset.cat === cat;
      const leaving = cards.filter(c => !c.hidden && !show(c));
      const entering = cards.filter(c => c.hidden && show(c));
      cards.forEach(c => { c.hidden = !show(c); });
      if (!ctx.reduced()) {
        leaving.forEach(c => {
          const r = first.get(c); const ghost = c.cloneNode(true);
          ghost.hidden = false; ghost.className = 'fg-card fg-ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.removeAttribute('href');
          Object.assign(ghost.style, { left: r.left - g.left + 'px', top: r.top - g.top + 'px', width: r.width + 'px', height: r.height + 'px' });
          grid.append(ghost);
          ghost.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.9)' }], { duration: ctx.d(160), easing: 'ease-in', fill: 'forwards' }).onfinish = () => ghost.remove();
        });
        cards.filter(c => !c.hidden && first.has(c)).forEach(c => {
          const l = c.getBoundingClientRect(), f = first.get(c);
          const dx = f.left - l.left, dy = f.top - l.top;
          if (Math.abs(dx) + Math.abs(dy) > 1) c.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: ctx.d(280), easing: ctx.ease });
        });
        entering.forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(8px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: ctx.d(220), delay: ctx.d(90 + i * 30), easing: 'ease-out', fill: 'backwards' }));
      }
      const n = cards.filter(c => !c.hidden).length;
      $('.fg-count', root).textContent = `显示 ${n} 项`;
      ctx.log(`筛选「${cat}」：离开 ${leaving.length}，移位 ${n - entering.length}，进入 ${entering.length}`);
    });
  };

  S.commandPalette = (root, ctx) => {
    const cmds = ['新建项目', '打开最近文件', '切换深色主题', '邀请成员加入', '导出为 PDF', '查看键盘快捷键', '跳转到设置', '归档已完成任务'];
    root.innerHTML = `<div class="cp"><header class="cp-top"><b>Northwind 工作台</b><button type="button" class="cp-trigger"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>搜索命令<kbd>Ctrl K</kbd></button></header>
      <div class="cp-body"><div class="cp-side"><i></i><i></i><i></i><i></i></div><div class="cp-main"><p class="sc-kicker">概览</p><h4>本周进度</h4><div class="cp-bars"><i style="--w:72%"></i><i style="--w:48%"></i><i style="--w:86%"></i></div><p class="cp-toast" role="status"></p></div></div>
      <div class="cp-back" hidden></div>
      <div class="cp-panel" role="dialog" aria-modal="true" aria-label="命令面板" hidden>
        <input type="text" class="cp-input" role="combobox" aria-expanded="true" aria-controls="cp-list" aria-autocomplete="list" placeholder="输入命令，例如“导出”" autocomplete="off">
        <ul class="cp-list" id="cp-list" role="listbox" aria-label="命令"></ul>
        <p class="cp-empty" hidden>没有匹配的命令。<button type="button" class="cp-clear">清空输入</button></p>
        <p class="cp-help">↑↓ 选择 · Enter 执行 · Esc 关闭</p>
      </div></div>`;
    const trig = $('.cp-trigger', root), back = $('.cp-back', root), panel = $('.cp-panel', root), input = $('.cp-input', root), list = $('.cp-list', root);
    let open = false, active = 0, shown = [], anims = [];
    function draw() {
      const q = input.value.trim().toLowerCase();
      shown = cmds.filter(c => !q || c.toLowerCase().includes(q));
      active = clamp(active, 0, Math.max(0, shown.length - 1));
      list.innerHTML = shown.map((c, i) => {
        const at = q ? c.toLowerCase().indexOf(q) : -1;
        const txt = at >= 0 ? esc(c.slice(0, at)) + '<mark>' + esc(c.slice(at, at + q.length)) + '</mark>' + esc(c.slice(at + q.length)) : esc(c);
        return `<li role="option" id="cp-o${i}" aria-selected="${i === active}">${txt}</li>`;
      }).join('');
      $('.cp-empty', root).hidden = shown.length > 0;
      if (shown.length) input.setAttribute('aria-activedescendant', `cp-o${active}`); else input.removeAttribute('aria-activedescendant');
    }
    function show() {
      if (open) return; open = true;
      back.hidden = false; panel.hidden = false; input.value = ''; active = 0; draw(); input.focus();
      anims = [back.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ctx.d(160) }),
        panel.animate([{ opacity: 0, transform: 'translate(-50%,-8px) scale(.96)' }, { opacity: 1, transform: 'translate(-50%,0) scale(1)' }], { duration: ctx.d(200), easing: ctx.ease })];
      ctx.log('打开命令面板，焦点进入输入框');
    }
    function hide(msg) {
      if (!open) return; open = false;
      const running = anims.some(a => a.playState === 'running');
      if (running) { anims.forEach(a => a.reverse()); ctx.log('打开中途关闭：动画原路反向'); }
      else anims = [back.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ctx.d(140) }), panel.animate([{ opacity: 1, transform: 'translate(-50%,0) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-6px) scale(.97)' }], { duration: ctx.d(140), easing: 'ease-in' })];
      Promise.all(anims.map(a => a.finished)).then(() => { if (!open) { back.hidden = true; panel.hidden = true; } }).catch(() => {});
      trig.focus();
      if (msg) {
        const t = $('.cp-toast', root); t.textContent = msg; t.classList.remove('pop'); t.offsetWidth; t.classList.add('pop');
      }
      ctx.log(msg ? `执行「${msg.replace('已执行：', '')}」，焦点回到触发按钮` : '关闭，焦点回到触发按钮');
    }
    trig.addEventListener('click', show);
    back.addEventListener('click', () => hide());
    $('.cp-clear', root).addEventListener('click', () => { input.value = ''; draw(); input.focus(); });
    input.addEventListener('input', () => { active = 0; draw(); });
    list.addEventListener('click', e => { const li = e.target.closest('li'); if (li) hide('已执行：' + shown[$$('li', list).indexOf(li)]); });
    list.addEventListener('mousemove', e => { const li = e.target.closest('li'); if (!li) return; const i = $$('li', list).indexOf(li); if (i !== active) { active = i; draw(); } });
    panel.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) { active = (active + (e.key === 'ArrowDown' ? 1 : shown.length - 1)) % shown.length; draw(); $('#cp-o' + active, root).scrollIntoView({ block: 'nearest' }); } }
      else if (e.key === 'Enter') { e.preventDefault(); if (shown.length) hide('已执行：' + shown[active]); }
      else if (e.key === 'Escape') { e.preventDefault(); hide(); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    });
    root.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open ? hide() : show(); } });
  };

  S.accordion = (root, ctx) => {
    const qa = [['可以随时取消订阅吗？', '可以。在「账户 → 订阅」里随时取消，当前计费周期结束前仍可使用全部功能，不会额外收费。'],
      ['团队成员上限是多少？', '标准版最多 20 人，专业版不限人数。超过上限时会提示升级，已有成员不受影响。'],
      ['数据存放在哪里？', '默认存放在离你最近的区域节点，并每天异地备份。企业版可以指定区域，并导出完整审计日志。导出文件为 CSV 与 JSON 两种格式，包含全部字段与修改历史。'],
      ['支持哪些付款方式？', '支持银行卡、支付宝、微信支付和对公转账。对公转账需要 1–3 个工作日确认。']];
    root.innerHTML = `<div class="ac"><p class="sc-kicker">帮助中心</p><h4>常见问题</h4><div class="ac-list">${qa.map(([q, a], i) => `<div class="ac-item"><h5><button type="button" aria-expanded="false" aria-controls="ac-p${i}" id="ac-b${i}"><span>${q}</span><i aria-hidden="true">⌄</i></button></h5><div class="ac-panel" id="ac-p${i}" role="region" aria-labelledby="ac-b${i}" hidden><p>${a}</p></div></div>`).join('')}</div></div>`;
    root.addEventListener('click', e => {
      const b = e.target.closest('.ac-item button'); if (!b) return;
      const panel = $('#' + b.getAttribute('aria-controls'), root);
      const open = b.getAttribute('aria-expanded') !== 'true';
      const running = panel.getAnimations().length > 0;
      const cur = panel.hidden ? 0 : panel.getBoundingClientRect().height;
      panel.getAnimations().forEach(a => a.cancel());
      b.setAttribute('aria-expanded', String(open));
      panel.hidden = false;
      const target = open ? panel.scrollHeight : 0;
      ctx.log(`${open ? '展开' : '收起'}「${$('span', b).textContent}」${running ? '（从当前高度反向）' : ''}`);
      if (ctx.reduced()) { panel.hidden = !open; return; }
      const a = panel.animate([{ height: cur + 'px' }, { height: target + 'px' }], { duration: ctx.d(open ? 260 : 200), easing: open ? ctx.ease : 'ease-in' });
      if (open) $('p', panel).animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: ctx.d(220), delay: ctx.d(60), fill: 'backwards' });
      a.onfinish = () => { if (!open) panel.hidden = true; };
    });
  };

  S.chartBrush = (root, ctx) => {
    const N = 30, W = 600, H = 250, L = 40, R = 14, T = 18, B = 30;
    const v = Array.from({ length: N }, (_, i) => Math.round(150 + 55 * Math.sin(i / 3) + 22 * Math.cos(i * 1.7) + i * 2.6));
    const max = 280, min = 40;
    const x = i => L + (i * (W - L - R)) / (N - 1);
    const y = val => T + ((max - val) * (H - T - B)) / (max - min);
    const line = v.map((val, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(val).toFixed(1)}`).join('');
    root.innerHTML = `<div class="cb"><div class="cb-head"><div><p class="sc-kicker">分析 / 流量</p><h4>近 30 天访问量</h4></div><button type="button" class="cb-clear" disabled>清除选择</button></div>
      <svg class="cb-svg" viewBox="0 0 ${W} ${H}" tabindex="0" role="application" aria-label="近 30 天访问量折线图。左右方向键移动，按住 Shift 选择区间" aria-describedby="cb-sum">
        <defs><linearGradient id="cb-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient>
        <pattern id="cb-p" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--accent)" fill-opacity=".10"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--accent)" stroke-opacity=".35" stroke-width="2"/></pattern></defs>
        ${[50, 100, 150, 200, 250].map(t => `<line class="cb-grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="cb-ax" x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('')}
        ${[0, 7, 14, 21, 29].map(i => `<text class="cb-ax" x="${x(i)}" y="${H - 8}" text-anchor="middle">${i + 1}日</text>`).join('')}
        <rect class="cb-brush" y="${T}" height="${H - T - B}" fill="url(#cb-p)" width="0"/>
        <path d="${line}L${x(N - 1)},${H - B}L${x(0)},${H - B}Z" fill="url(#cb-g)"/>
        <path class="cb-line" d="${line}"/>
        <g class="cb-cross" opacity="0"><line class="cb-vl" y1="${T}" y2="${H - B}"/><circle r="5"/><g class="cb-tip"><rect width="104" height="40" rx="6"/><text class="cb-t1" x="10" y="17"></text><text class="cb-t2" x="10" y="32"></text></g></g>
      </svg>
      <div class="cb-sum" id="cb-sum" aria-live="polite"><div><small>区间</small><b class="cb-range">全部 30 天</b></div><div><small>合计</small><b class="cb-total">0</b></div><div><small>日均</small><b class="cb-avg">0</b></div></div></div>`;
    const svg = $('.cb-svg', root), cross = $('.cb-cross', root), brush = $('.cb-brush', root), clearBtn = $('.cb-clear', root);
    let cur = 15, sel = null, anchor = null, down = null;
    const idxAt = e => { const r = svg.getBoundingClientRect(); const px = ((e.clientX - r.left) * W) / r.width; return clamp(Math.round(((px - L) * (N - 1)) / (W - L - R)), 0, N - 1); };
    function showCross(i) {
      cur = i; cross.setAttribute('opacity', '1');
      $('.cb-vl', root).setAttribute('x1', x(i)); $('.cb-vl', root).setAttribute('x2', x(i));
      const c = $('circle', cross); c.setAttribute('cx', x(i)); c.setAttribute('cy', y(v[i]));
      const tx = x(i) > W - 130 ? x(i) - 116 : x(i) + 12, ty = clamp(y(v[i]) - 50, T, H - B - 44);
      $('.cb-tip', root).setAttribute('transform', `translate(${tx},${ty})`);
      $('.cb-t1', root).textContent = `第 ${i + 1} 天`; $('.cb-t2', root).textContent = `${v[i]} 次访问`;
    }
    const nums = { total: 0, avg: 0 };
    function roll(cls, to) {
      const elm = $(cls, root), from = nums[cls === '.cb-total' ? 'total' : 'avg'];
      nums[cls === '.cb-total' ? 'total' : 'avg'] = to;
      const dur = ctx.d(360), t0 = performance.now();
      const tick = now => { const p = Math.min(1, (now - t0) / dur); const e = 1 - (1 - p) ** 3; elm.textContent = Math.round(from + (to - from) * e).toLocaleString(); if (p < 1) ctx.frame(tick); };
      ctx.frame(tick);
    }
    function setSel(a, b, quiet) {
      sel = a == null ? null : [Math.min(a, b), Math.max(a, b)];
      const [s, e] = sel || [0, N - 1];
      brush.setAttribute('x', sel ? x(s) - 4 : 0); brush.setAttribute('width', sel ? x(e) - x(s) + 8 : 0);
      clearBtn.disabled = !sel;
      if (quiet) return;
      const part = v.slice(s, e + 1), tot = part.reduce((p, q) => p + q, 0);
      $('.cb-range', root).textContent = sel ? `第 ${s + 1}–${e + 1} 天（${e - s + 1} 天）` : '全部 30 天';
      roll('.cb-total', tot); roll('.cb-avg', Math.round(tot / part.length));
    }
    setSel(null, null);
    svg.addEventListener('pointermove', e => {
      const i = idxAt(e); showCross(i);
      if (down) { down.moved = down.moved || i !== down.a; if (down.moved) setSel(down.a, i, true); }
    });
    svg.addEventListener('pointerleave', () => { if (!down) cross.setAttribute('opacity', '0'); });
    svg.addEventListener('pointerdown', e => { if (e.button > 0) return; down = { a: idxAt(e), moved: false }; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointerup', e => {
      if (!down) return;
      const d = down; down = null;
      if (d.moved) { setSel(d.a, idxAt(e)); ctx.log(`刷选第 ${sel[0] + 1}–${sel[1] + 1} 天`); }
    });
    svg.addEventListener('dblclick', () => { setSel(null); ctx.log('双击清除区间'); });
    clearBtn.addEventListener('click', () => { setSel(null); svg.focus(); ctx.log('清除区间'); });
    svg.addEventListener('focus', () => showCross(cur));
    svg.addEventListener('blur', () => cross.setAttribute('opacity', '0'));
    svg.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const n = clamp(cur + (e.key === 'ArrowLeft' ? -1 : 1), 0, N - 1);
      if (e.shiftKey) { if (anchor == null) anchor = cur; showCross(n); setSel(anchor, n); }
      else { anchor = null; showCross(n); }
      ctx.announce(`第 ${n + 1} 天，${v[n]} 次访问`);
    });
  };

  S.formValidate = (root, ctx) => {
    root.innerHTML = `<div class="fv"><div class="fv-card"><div class="fv-inner">
      <form class="fv-front" novalidate><p class="sc-kicker">创建账号</p><h4>开始免费试用</h4>
        <div class="fv-field"><label for="fv-e">工作邮箱</label><input id="fv-e" type="email" autocomplete="off" aria-describedby="fv-e-m"><p class="fv-msg" id="fv-e-m"></p></div>
        <div class="fv-field"><label for="fv-p">密码</label><input id="fv-p" type="password" autocomplete="new-password" aria-describedby="fv-p-h fv-p-m"><div class="fv-meter" aria-hidden="true"><i></i></div><p class="fv-hint" id="fv-p-h">至少 8 位，包含字母和数字</p><p class="fv-msg" id="fv-p-m"></p></div>
        <button type="submit" class="fv-submit">注册</button></form>
      <div class="fv-back"><div class="fv-ok" aria-hidden="true">✓</div><h4 tabindex="-1">账号已创建</h4><p>验证邮件已发送到 <b class="fv-mail"></b></p><button type="button" class="fv-again">再试一次</button></div>
    </div></div></div>`;
    const card = $('.fv-card', root), form = $('.fv-front', root), back = $('.fv-back', root);
    const email = $('#fv-e', root), pw = $('#fv-p', root);
    back.inert = true;
    const rules = {
      'fv-e': val => !val ? '请填写邮箱' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val) ? '' : '邮箱格式不对，例如 name@company.com',
      'fv-p': val => !val ? '请设置密码' : val.length < 8 ? `还差 ${8 - val.length} 位` : !(/\d/.test(val) && /[a-z]/i.test(val)) ? '需要同时包含字母和数字' : ''
    };
    function check(inp, shake) {
      const m = rules[inp.id](inp.value.trim()), msg = $('#' + inp.id + '-m', root), field = inp.closest('.fv-field');
      const was = inp.getAttribute('aria-invalid') === 'true';
      inp.setAttribute('aria-invalid', String(!!m));
      if (m && msg.textContent !== m) { msg.textContent = m; msg.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: ctx.d(180), easing: 'ease-out' }); }
      if (!m) msg.textContent = '';
      if (m && shake && !ctx.reduced() && !field.getAnimations().length) field.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: ctx.d(300) });
      if (was && !m) ctx.log(`「${$('label', field).textContent}」已修正，提示清除`);
      return !m;
    }
    [email, pw].forEach(i => {
      i.addEventListener('blur', () => { if (i.value) { if (!check(i, true)) ctx.log(`「${$('label', i.closest('.fv-field')).textContent}」失焦校验未通过`); } });
      i.addEventListener('input', () => { if (i.getAttribute('aria-invalid') === 'true') check(i, false); });
    });
    pw.addEventListener('input', () => {
      const s = pw.value; let sc = 0;
      if (s.length >= 8) sc++; if (/\d/.test(s) && /[a-z]/i.test(s)) sc++; if (/[A-Z]/.test(s) && /[a-z]/.test(s)) sc++; if (/[^\w]/.test(s) || s.length >= 12) sc++;
      const m = $('.fv-meter', root); m.dataset.s = s ? sc : ''; m.firstElementChild.style.width = s ? `${Math.max(1, sc) * 25}%` : '0';
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = [email, pw].filter(i => !check(i, true));
      if (bad.length) { bad[0].focus(); ctx.announce(`有 ${bad.length} 处需要修改：${bad.map(b => $('#' + b.id + '-m', root).textContent).join('；')}`); ctx.log(`提交被拦下：${bad.length} 处错误，焦点移到第一个`); return; }
      const b = $('.fv-submit', root); b.disabled = true; b.textContent = '注册中…';
      ctx.later(() => {
        $('.fv-mail', root).textContent = email.value.trim();
        card.classList.add('flipped'); form.inert = true; back.inert = false;
        b.disabled = false; b.textContent = '注册';
        ctx.later(() => $('h4', back).focus(), ctx.d(420));
        ctx.announce('账号已创建'); ctx.log('提交成功：卡片翻面，焦点移到结果标题');
      }, 600);
    });
    $('.fv-again', root).addEventListener('click', () => {
      card.classList.remove('flipped'); form.inert = false; back.inert = true; form.reset();
      [email, pw].forEach(i => { i.removeAttribute('aria-invalid'); $('#' + i.id + '-m', root).textContent = ''; });
      $('.fv-meter', root).firstElementChild.style.width = '0';
      ctx.later(() => email.focus(), ctx.d(420));
    });
  };

  S.compareSlider = (root, ctx) => {
    const art = `<div class="cs-art" aria-hidden="true"><i class="cs-sun"></i><i class="cs-h1"></i><i class="cs-h2"></i><i class="cs-lake"></i></div>`;
    root.innerHTML = `<div class="cs"><div class="cs-head"><p class="sc-kicker">修图 / 调色</p><h4>湖边日落 · 前后对比</h4></div>
      <div class="cs-frame"><div class="cs-after">${art}</div><div class="cs-before">${art}</div>
      <span class="cs-lab cs-lb">修图前</span><span class="cs-lab cs-la">修图后</span>
      <div class="cs-line"><button type="button" class="cs-knob" role="slider" aria-label="前后对比分割线" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">⟷</button></div></div>
      <p class="cs-note">拖动把手或点击图片任意位置 · 双击把手回到中间</p></div>`;
    const frame = $('.cs-frame', root), knob = $('.cs-knob', root);
    let pos = 50, tween = null, drag = null;
    function set(p) {
      pos = clamp(p, 0, 100);
      frame.style.setProperty('--pos', pos + '%');
      knob.setAttribute('aria-valuenow', Math.round(pos));
      knob.setAttribute('aria-valuetext', `修图前占 ${Math.round(pos)}%，修图后占 ${Math.round(100 - pos)}%`);
      $('.cs-lb', root).style.opacity = pos < 16 ? 0 : 1; $('.cs-la', root).style.opacity = pos > 84 ? 0 : 1;
    }
    function glide(to) {
      if (tween) tween.stop = true;
      if (ctx.reduced()) { set(to); return; }
      const from = pos, dur = ctx.d(260), t0 = performance.now(), me = { stop: false }; tween = me;
      const tick = now => { if (me.stop) return; const p = Math.min(1, (now - t0) / dur); set(from + (to - from) * (1 - (1 - p) ** 3)); if (p < 1) ctx.frame(tick); else tween = null; };
      ctx.frame(tick);
    }
    const pct = e => { const r = frame.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    set(50);
    frame.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      e.preventDefault();
      if (tween) { tween.stop = true; tween = null; ctx.log('滑动中按下：接管为拖动'); }
      frame.setPointerCapture(e.pointerId);
      const onKnob = !!e.target.closest('.cs-line');
      drag = { x0: e.clientX, live: onKnob };
      if (!onKnob) { glide(pct(e)); ctx.log(`点击 → 分割线滑到 ${Math.round(pct(e))}%`); }
      knob.focus({ preventScroll: true });
    });
    frame.addEventListener('pointermove', e => {
      if (!drag) return;
      if (!drag.live && Math.abs(e.clientX - drag.x0) > 4) { drag.live = true; if (tween) { tween.stop = true; tween = null; } }
      if (drag.live) set(pct(e));
    });
    const end = () => { if (drag && drag.live) ctx.log(`拖到 ${Math.round(pos)}%`); drag = null; };
    frame.addEventListener('pointerup', end); frame.addEventListener('pointercancel', end);
    knob.addEventListener('dblclick', () => { glide(50); ctx.log('双击把手：回到 50%'); });
    knob.addEventListener('keydown', e => {
      const stepv = e.shiftKey ? 10 : 2;
      const k = { ArrowLeft: -stepv, ArrowDown: -stepv, ArrowRight: stepv, ArrowUp: stepv }[e.key];
      if (k) { e.preventDefault(); set(pos + k); }
      else if (e.key === 'Home') { e.preventDefault(); set(0); }
      else if (e.key === 'End') { e.preventDefault(); set(100); }
    });
  };

  /* ======================= APP ======================= */

  S.swipeDelete = (root, ctx) => {
    const SAMPLE = [['林小雨', '周六一起去看展吗？', '09:41'], ['设计周报', '本周评审意见已汇总', '09:12'], ['快递驿站', '您的包裹已到 3 号柜', '昨天'], ['妈妈', '晚上记得打电话', '昨天'], ['羽毛球群', '周六 10 点 5 号场', '周二']];
    let items = SAMPLE.map((r, i) => ({ id: 'm' + i, who: r[0], text: r[1], t: r[2] }));
    root.innerHTML = `<div class="ap sw"><header class="ap-head"><h4 tabindex="-1" class="sw-title">消息</h4><span class="ap-sub">左滑管理</span></header>
      <ul class="sw-list"></ul><div class="sw-empty" hidden><p>没有消息了</p><button type="button" class="ap-pill sw-restore">恢复示例</button></div>
      <div class="ap-toast" hidden><span></span><button type="button">撤销</button></div></div>`;
    const list = $('.sw-list', root), toast = $('.ap-toast', root);
    const leaving = new Map(); let pending = null, openRow = null;
    function row(it) {
      const li = document.createElement('li'); li.className = 'sw-row'; li.dataset.id = it.id;
      li.innerHTML = `<button type="button" class="sw-del" tabindex="-1">删除</button><div class="sw-body" tabindex="0" role="group" aria-label="${esc(it.who)}：${esc(it.text)}，${it.t}。按 Delete 删除"><span class="sw-av" aria-hidden="true">${esc(it.who[0])}</span><span class="sw-tx"><b>${esc(it.who)}</b><small>${esc(it.text)}</small></span><time>${it.t}</time></div>`;
      bind(li); return li;
    }
    const render = () => { list.textContent = ''; items.forEach(it => list.append(row(it))); refresh(); };
    const refresh = () => { $('.sw-empty', root).hidden = items.length > 0 || leaving.size > 0; };
    function setX(li, x, animate) {
      const b = $('.sw-body', li);
      b.style.transition = animate ? `transform ${ctx.d(160)}ms ${ctx.ease}` : 'none';
      b.style.transform = x ? `translateX(${x}px)` : '';
      li.classList.toggle('open', x < 0);
      $('.sw-del', li).tabIndex = x < 0 ? 0 : -1;
    }
    function closeOpen(except) { if (openRow && openRow !== except && openRow.isConnected) setX(openRow, 0, true); if (openRow !== except) openRow = null; }
    function focusNext(li) {
      const alive = el => el && !leaving.has(el.dataset.id);
      let n = li.nextElementSibling; while (n && !alive(n)) n = n.nextElementSibling;
      let p = li.previousElementSibling; while (p && !alive(p)) p = p.previousElementSibling;
      const t = n || p;
      if (t) { $('.sw-body', t).focus({ preventScroll: true }); return `${n ? '下' : '上'}一行`; }
      $('.sw-title', root).focus({ preventScroll: true }); return '标题';
    }
    function remove(li, via) {
      const id = li.dataset.id, idx = items.findIndex(i => i.id === id); if (idx < 0) return;
      if (pending) { clearTimeout(pending.timer); pending = null; }
      const [it] = items.splice(idx, 1);
      const where = focusNext(li);
      li.inert = true; li.classList.add('gone');
      const b = $('.sw-body', li), h = li.offsetHeight, x0 = new DOMMatrix(getComputedStyle(b).transform).m41;
      b.style.transition = 'none';
      const out = ctx.reduced() ? li.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' })
        : b.animate([{ transform: `translateX(${x0}px) rotate(0)` }, { transform: `translateX(-115%) rotate(${-3 * ctx.tilt()}deg)`, opacity: 0.4 }], { duration: ctx.d(220), easing: 'cubic-bezier(.4,0,.9,.6)', fill: 'forwards' });
      const entry = { li, anims: [out] }; leaving.set(id, entry);
      out.finished.then(() => {
        if (!leaving.has(id)) return;
        const c = li.animate([{ height: h + 'px' }, { height: '0px' }], { duration: ctx.d(180), easing: 'ease-out', fill: 'forwards' });
        entry.anims.push(c);
        return c.finished.then(() => { if (!leaving.has(id)) return; leaving.delete(id); li.remove(); refresh(); });
      }).catch(() => {});
      pending = { it, idx, timer: ctx.later(() => { pending = null; toast.hidden = true; }, 5000) };
      $('span', toast).textContent = `已删除「${it.who}」`; toast.hidden = false;
      toast.animate([{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: ctx.d(220), easing: ctx.ease });
      ctx.announce(`已删除「${it.who}」的消息，可撤销`); ctx.log(`${via}删除「${it.who}」，焦点 → ${where}`);
      refresh();
    }
    $('button', toast).addEventListener('click', () => {
      if (!pending) return;
      const { it, idx } = pending; clearTimeout(pending.timer); pending = null; toast.hidden = true;
      items.splice(Math.min(idx, items.length), 0, it);
      const e = leaving.get(it.id); let li;
      if (e) {
        leaving.delete(it.id); li = e.li; li.inert = false; li.classList.remove('gone');
        e.anims.forEach(a => { a.playbackRate = -1; a.play(); });
        Promise.all(e.anims.map(a => a.finished)).then(() => { e.anims.forEach(a => a.cancel()); setX(li, 0, false); }).catch(() => {});
        ctx.log('动画中途撤销：原路反向');
      } else {
        li = row(it); list.insertBefore(li, list.children[idx] || null);
        if (!ctx.reduced()) li.animate([{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], { duration: ctx.d(220), easing: 'ease-out' });
        ctx.log('撤销：回到原位');
      }
      $('.sw-body', li).focus({ preventScroll: true });
      ctx.announce(`已恢复「${it.who}」`); refresh();
    });
    $('.sw-restore', root).addEventListener('click', () => { items = SAMPLE.map((r, i) => ({ id: 'm' + i, who: r[0], text: r[1], t: r[2] })); render(); $('.sw-body', list).focus(); });
    function bind(li) {
      const b = $('.sw-body', li);
      let st = null;
      b.addEventListener('pointerdown', e => {
        if (e.button > 0) return;
        closeOpen(li);
        st = { x: e.clientX, y: e.clientY, base: new DOMMatrix(getComputedStyle(b).transform).m41, drag: false, id: e.pointerId };
      });
      b.addEventListener('pointermove', e => {
        if (!st || st.id !== e.pointerId) return;
        const mx = e.clientX - st.x, my = e.clientY - st.y;
        if (!st.drag) { if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) { st.drag = true; b.setPointerCapture(e.pointerId); } else if (Math.abs(my) > 8) { st = null; return; } else return; }
        const w = b.offsetWidth; let x = st.base + mx;
        x = x > 0 ? rubber(x, 30) : x;
        setX(li, x, false);
        li.classList.toggle('armed', -x > w * 0.55);
      });
      const end = e => {
        if (!st || st.id !== e.pointerId) return;
        const s = st; st = null;
        if (!s.drag) { if (li.classList.contains('open')) { setX(li, 0, true); openRow = null; } return; }
        const x = new DOMMatrix(getComputedStyle(b).transform).m41, w = b.offsetWidth;
        if (li.classList.contains('armed')) { li.classList.remove('armed'); remove(li, '长滑'); }
        else if (-x > w * 0.3) { setX(li, -88, true); openRow = li; ctx.log('露出删除按钮'); }
        else { setX(li, 0, true); ctx.log('未过阈值，弹回'); }
      };
      b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
      b.addEventListener('keydown', e => {
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(li, 'Delete 键'); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const s = e.key === 'ArrowDown' ? li.nextElementSibling : li.previousElementSibling; if (s) $('.sw-body', s).focus(); }
      });
      $('.sw-del', li).addEventListener('click', () => remove(li, '按钮'));
    }
    render();
  };

  S.bottomSheet = (root, ctx) => {
    const places = [['半山咖啡', '320m · 营业至 22:00', '4.8'], ['旧书与豆', '450m · 安静 · 有插座', '4.6'], ['转角烘焙', '600m · 可外带', '4.5'], ['白日梦工厂', '800m · 露台座位', '4.7'], ['一楼咖啡', '1.1km · 24 小时', '4.3'], ['南山小馆', '1.3km · 手冲', '4.9'], ['云上咖啡', '1.6km · 景观', '4.4'], ['布丁咖啡', '2.0km · 宠物友好', '4.6']];
    root.innerHTML = `<div class="ap bs"><div class="bs-map" aria-hidden="true">${places.slice(0, 6).map((_, i) => `<i style="left:${18 + (i * 29) % 64}%;top:${14 + (i * 23) % 50}%"></i>`).join('')}<b>⌖</b></div>
      <div class="bs-dim"></div>
      <section class="bs-sheet" aria-label="附近的咖啡馆">
        <div class="bs-grab"><button type="button" class="bs-handle" aria-label="面板：收起。点击切换高度"><i></i></button><h4>附近的咖啡馆</h4><p>${places.length} 家 · 按距离</p></div>
        <ul class="bs-list">${places.map(p => `<li><b>${p[0]}</b><small>${p[1]}</small><span>★ ${p[2]}</span></li>`).join('')}</ul>
      </section></div>`;
    const sheet = $('.bs-sheet', root), dim = $('.bs-dim', root), handle = $('.bs-handle', root), list = $('.bs-list', root);
    const names = { peek: '收起', half: '半屏', full: '全屏' };
    let H, snaps, state = 'peek', y, drag = null;
    function measure() { H = root.clientHeight; snaps = { full: 36, half: H * 0.5, peek: H - 128 }; }
    function apply(ny, animate) {
      y = ny;
      const t = animate ? `${ctx.d(320)}ms ${ctx.ease}` : '0s';
      sheet.style.transition = `transform ${t}`; dim.style.transition = `opacity ${animate ? ctx.d(200) : 0}ms linear`;
      sheet.style.transform = `translateY(${y}px)`;
      dim.style.opacity = clamp((snaps.half - y) / (snaps.half - snaps.full), 0, 1) * 0.45;
      dim.style.pointerEvents = y < snaps.half - 10 ? 'auto' : 'none';
      list.style.overflowY = state === 'full' ? 'auto' : 'hidden';
    }
    function go(s, why) { state = s; apply(snaps[s], true); handle.setAttribute('aria-label', `面板：${names[s]}。点击切换高度`); ctx.log(`${why} → 吸附到${names[s]}`); ctx.announce(`面板${names[s]}`); }
    measure(); apply(snaps.peek, false);
    const grab = $('.bs-grab', root);
    grab.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      const cur = new DOMMatrix(getComputedStyle(sheet).transform).m42;
      const wasAnimating = Math.abs(cur - y) > 1;
      apply(cur, false);
      drag = { y0: e.clientY, base: cur, moved: false, hist: [[performance.now(), e.clientY]], took: wasAnimating };
      e.preventDefault(); handle.focus({ preventScroll: true });
      grab.setPointerCapture(e.pointerId);
      if (wasAnimating) ctx.log('吸附中按下：从当前位置接管');
    });
    grab.addEventListener('pointermove', e => {
      if (!drag) return;
      const dy = e.clientY - drag.y0; if (Math.abs(dy) > 4) drag.moved = true;
      if (!drag.moved) return;
      let ny = drag.base + dy;
      if (ny < snaps.full) ny = snaps.full + rubber(ny - snaps.full, 50);
      if (ny > snaps.peek) ny = snaps.peek + rubber(ny - snaps.peek, 50);
      apply(ny, false);
      drag.hist.push([performance.now(), e.clientY]); if (drag.hist.length > 5) drag.hist.shift();
    });
    const end = e => {
      if (!drag) return; const d = drag; drag = null;
      if (!d.moved) { if (!d.took) go({ peek: 'half', half: 'full', full: 'peek' }[state], '点击把手'); else go(state, '轻点'); return; }
      const [t0, y0] = d.hist[0], v = (e.clientY - y0) / Math.max(1, performance.now() - t0);
      const proj = y + v * 180;
      const best = Object.entries(snaps).sort((a, b) => Math.abs(a[1] - proj) - Math.abs(b[1] - proj))[0][0];
      go(best, `松手速度 ${v.toFixed(2)}px/ms`);
    };
    grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
    dim.addEventListener('click', () => go('peek', '点遮罩'));
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && state !== 'peek') { e.preventDefault(); go('peek', 'Esc'); handle.focus(); } });
    const ro = new ResizeObserver(() => { measure(); apply(snaps[state], false); }); ro.observe(root);
    return () => ro.disconnect();
  };

  S.tabPill = (root, ctx) => {
    const tabs = [['首页', '⌂'], ['发现', '◎'], ['消息', '✉'], ['我的', '☺']];
    const content = i => Array.from({ length: 9 }, (_, j) => `<li><i style="--h:${(i * 80 + j * 25) % 360}"></i><span><b>${tabs[i][0]} · 第 ${j + 1} 条</b><small>向上滚动，再切换回来看位置是否保留</small></span></li>`).join('');
    root.innerHTML = `<div class="ap tp"><div class="tp-stage">${tabs.map((t, i) => `<section class="tp-panel" id="tp-p${i}" role="tabpanel" aria-labelledby="tp-t${i}" ${i ? 'hidden' : ''}><header class="ap-head"><h4>${t[0]}</h4></header><ul class="tp-feed">${content(i)}</ul></section>`).join('')}</div>
      <nav class="tp-bar"><div class="tp-tabs" role="tablist" aria-label="主导航"><span class="tp-pill" aria-hidden="true"></span>${tabs.map((t, i) => `<button type="button" role="tab" id="tp-t${i}" aria-controls="tp-p${i}" aria-selected="${!i}" tabindex="${i ? -1 : 0}"><i aria-hidden="true">${t[1]}</i><span>${t[0]}</span></button>`).join('')}</div></nav></div>`;
    const btns = $$('[role=tab]', root), panels = $$('.tp-panel', root), pill = $('.tp-pill', root);
    let cur = 0;
    function placePill(animate) {
      const b = btns[cur];
      pill.style.transition = animate ? `transform ${ctx.d(280)}ms ${ctx.ease}, width ${ctx.d(280)}ms ${ctx.ease}` : 'none';
      pill.style.width = b.offsetWidth - 8 + 'px'; pill.style.transform = `translateX(${b.offsetLeft + 4}px)`;
    }
    function select(i, why, focus) {
      if (i === cur) { const f = $('.tp-feed', panels[i]); panels[i].scrollTo({ top: 0, behavior: ctx.reduced() ? 'auto' : 'smooth' }); ctx.log('重复点击当前标签：回到顶部'); return; }
      const dir = i > cur ? 1 : -1, old = panels[cur], nw = panels[i];
      panels.forEach(p => { p.getAnimations().forEach(a => a.cancel()); if (p !== old && p !== nw) p.hidden = true; });
      btns[cur].setAttribute('aria-selected', 'false'); btns[cur].tabIndex = -1;
      cur = i; btns[i].setAttribute('aria-selected', 'true'); btns[i].tabIndex = 0; if (focus) btns[i].focus();
      placePill(true);
      nw.hidden = false;
      if (ctx.reduced()) { old.hidden = true; nw.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 }); }
      else {
        $('i', btns[i]).animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + 0.15 * ctx.tilt()})` }, { transform: 'scale(1)' }], { duration: ctx.d(240), easing: ctx.ease });
        nw.animate([{ transform: `translateX(${dir * 30}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: ctx.d(260), easing: 'cubic-bezier(.2,.8,.2,1)' });
        old.animate([{ transform: 'none', opacity: 1 }, { transform: `translateX(${-dir * 18}%)`, opacity: 0 }], { duration: ctx.d(200), easing: 'ease-in' }).onfinish = () => { if (btns[panels.indexOf(old)].getAttribute('aria-selected') !== 'true') old.hidden = true; };
      }
      ctx.log(`${why} → ${tabs[i][0]}`);
    }
    btns.forEach((b, i) => b.addEventListener('click', () => select(i, '点击')));
    $('.tp-tabs', root).addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
      e.preventDefault(); select((cur + k + tabs.length) % tabs.length, '方向键', true);
    });
    let sw = null;
    const stg = $('.tp-stage', root);
    stg.addEventListener('pointerdown', e => { sw = { x: e.clientX, y: e.clientY }; });
    stg.addEventListener('pointerup', e => {
      if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { const n = cur + (dx < 0 ? 1 : -1); if (n >= 0 && n < tabs.length) select(n, '横向滑动'); }
    });
    requestAnimationFrame(() => placePill(false));
    const ro = new ResizeObserver(() => placePill(false)); ro.observe(root);
    return () => ro.disconnect();
  };

  S.pullRefresh = (root, ctx) => {
    let posts = [['阿澈', '今天的晚霞像橘子汽水'], ['设计小组', '新版组件库已发布'], ['Lin', '周末去爬山的有吗'], ['读书会', '这周读《看不见的城市》'], ['Momo', '新开的面包店真不错'], ['阿杰', '跑完了第一个半马']];
    const fresh = [['小雨', '刚刚：下雨了，记得带伞'], ['运动打卡', '刚刚：今日步数 8,231'], ['团队', '刚刚：周会改到 15:00']];
    root.innerHTML = `<div class="ap pr"><header class="ap-head"><h4>动态</h4><button type="button" class="ap-pill pr-btn">刷新</button></header>
      <div class="pr-ind" aria-hidden="true"><i>↓</i><span>下拉刷新</span></div>
      <div class="pr-scroll"><ul class="pr-list"></ul></div></div>`;
    const sc = $('.pr-scroll', root), list = $('.pr-list', root), ind = $('.pr-ind', root);
    const item = (p, isNew) => `<li class="${isNew ? 'pr-new' : ''}"><span class="sw-av" aria-hidden="true">${esc(p[0][0])}</span><span><b>${esc(p[0])}</b><small>${esc(p[1])}</small></span></li>`;
    list.innerHTML = posts.map(p => item(p)).join('');
    let pull = null, busy = false, off = 0, fi = 0;
    const TH = 64;
    function setOff(v, animate) {
      off = v;
      const t = animate ? `transform ${ctx.d(240)}ms ${ctx.ease}` : 'none';
      list.style.transition = t; ind.style.transition = animate ? `opacity ${ctx.d(200)}ms` : 'none';
      list.style.transform = v ? `translateY(${v}px)` : '';
      ind.style.opacity = Math.min(1, v / TH);
      if (!busy && !ctx.reduced()) $('i', ind).style.transform = `rotate(${Math.min(180, (v / TH) * 180)}deg)`;
      ind.classList.toggle('armed', v >= TH && !busy);
      $('span', ind).textContent = busy ? '正在刷新…' : v >= TH ? '松开刷新' : '下拉刷新';
    }
    function start(y) { if (busy || sc.scrollTop > 0) return false; pull = { y0: y }; return true; }
    function move(y) { if (!pull) return false; const dy = y - pull.y0; if (dy <= 0) { setOff(0); return false; } setOff(rubber(dy, 140)); return true; }
    function end() {
      if (!pull) return; pull = null;
      if (off >= TH) refresh('下拉'); else { if (off > 0) ctx.log('未过阈值，回弹'); setOff(0, true); }
    }
    function refresh(why) {
      if (busy) { ctx.log('刷新中，忽略'); return; }
      busy = true; ind.classList.add('busy'); setOff(56, true); ctx.log(`${why}触发刷新`);
      ctx.later(() => {
        const p = fresh[fi++ % fresh.length]; posts.unshift(p);
        busy = false; ind.classList.remove('busy'); setOff(0, true);
        list.insertAdjacentHTML('afterbegin', item(p, true));
        const li = list.firstElementChild;
        if (!ctx.reduced()) li.animate([{ transform: 'translateY(-16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: ctx.d(300), delay: ctx.d(120), easing: ctx.ease, fill: 'backwards' });
        ctx.later(() => li.classList.remove('pr-new'), 1600);
        ctx.announce('已更新 1 条'); ctx.log('完成：新条目滑入并高亮');
      }, 1200);
    }
    sc.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' && e.button === 0 && start(e.clientY)) sc.setPointerCapture(e.pointerId); });
    sc.addEventListener('pointermove', e => { if (e.pointerType !== 'touch') move(e.clientY); });
    sc.addEventListener('pointerup', e => { if (e.pointerType !== 'touch') end(); });
    sc.addEventListener('touchstart', e => start(e.touches[0].clientY), { passive: true });
    sc.addEventListener('touchmove', e => { if (pull && move(e.touches[0].clientY)) e.preventDefault(); }, { passive: false });
    sc.addEventListener('touchend', end);
    $('.pr-btn', root).addEventListener('click', () => refresh('按钮'));
  };

  S.cardStack = (root, ctx) => {
    const DECK = [['京都', '秋天的红叶与寺院', 15], ['冰岛', '黑沙滩与极光', 200], ['大理', '洱海边骑车', 170], ['里斯本', '坡道与黄色电车', 40], ['新西兰', '徒步与星空', 120]];
    let deck, hist, liked, skipped;
    root.innerHTML = `<div class="ap ck"><header class="ap-head"><h4>想去的地方</h4><span class="ap-sub ck-score"></span></header>
      <div class="ck-deck"></div>
      <div class="ck-empty" hidden><p>都看完了</p><button type="button" class="ap-pill ck-again">重来</button></div>
      <div class="ck-btns"><button type="button" class="ck-no" aria-label="跳过">✕</button><button type="button" class="ck-undo" aria-label="撤回上一张">↶</button><button type="button" class="ck-yes" aria-label="收藏">♥</button></div></div>`;
    const deckEl = $('.ck-deck', root);
    function reset() { deck = DECK.slice(); hist = []; liked = 0; skipped = 0; draw(); }
    function draw(focusTop) {
      deckEl.innerHTML = deck.slice(0, 3).map((c, i) => `<article class="ck-card" style="--h:${c[2]};--i:${i};z-index:${3 - i}" ${i ? 'aria-hidden="true"' : 'tabindex="0" aria-label="' + c[0] + '：' + c[1] + '。左右方向键选择"'}><div class="ck-art"></div><h5>${c[0]}</h5><p>${c[1]}</p><span class="ck-st ck-st-no">跳过</span><span class="ck-st ck-st-yes">收藏</span></article>`).join('');
      $('.ck-empty', root).hidden = deck.length > 0;
      $('.ck-score', root).textContent = `收藏 ${liked} · 跳过 ${skipped}`;
      $('.ck-undo', root).disabled = !hist.length;
      const top = $('.ck-card', deckEl); if (top) { bindTop(top); if (focusTop) top.focus(); }
    }
    function fly(dir, from, why) {
      const top = $('.ck-card', deckEl); if (!top) return;
      const c = deck.shift(); hist.push([c, dir]); dir > 0 ? liked++ : skipped++;
      top.removeAttribute('tabindex'); top.style.zIndex = 9;
      const tx = from ? from.x : 0, ty = from ? from.y : 0, r = from ? from.r : 0;
      const keep = top;
      deckEl.append(keep);
      ctx.announce(`${dir > 0 ? '收藏' : '跳过'}「${c[0]}」`); ctx.log(`${why}：${dir > 0 ? '收藏' : '跳过'}「${c[0]}」`);
      const done = () => keep.remove();
      if (ctx.reduced()) { keep.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120 }).onfinish = done; }
      else keep.animate([{ transform: `translate(${tx}px,${ty}px) rotate(${r}deg)` }, { transform: `translate(${dir * 420}px,${ty + 40}px) rotate(${dir * 22}deg)`, opacity: 0.6 }], { duration: ctx.d(300), easing: 'cubic-bezier(.3,.6,.6,1)', fill: 'forwards' }).onfinish = done;
      const rest = $$('.ck-card', deckEl).filter(x => x !== keep);
      rest.forEach(x => x.remove());
      deckEl.insertAdjacentHTML('afterbegin', deck.slice(0, 3).map((cc, i) => `<article class="ck-card" style="--h:${cc[2]};--i:${i + 1};z-index:${3 - i}" ${i ? 'aria-hidden="true"' : 'tabindex="0" aria-label="' + cc[0] + '：' + cc[1] + '。左右方向键选择"'}><div class="ck-art"></div><h5>${cc[0]}</h5><p>${cc[1]}</p><span class="ck-st ck-st-no">跳过</span><span class="ck-st ck-st-yes">收藏</span></article>`).join(''));
      const fresh = $$('.ck-card', deckEl).filter(x => x !== keep);
      deckEl.offsetWidth; fresh.forEach((x, i) => x.style.setProperty('--i', i));
      if (fresh[0]) { bindTop(fresh[0]); if (!from) fresh[0].focus({ preventScroll: true }); }
      $('.ck-empty', root).hidden = deck.length > 0;
      $('.ck-score', root).textContent = `收藏 ${liked} · 跳过 ${skipped}`;
      $('.ck-undo', root).disabled = false;
    }
    function bindTop(card) {
      let st = null;
      card.addEventListener('pointerdown', e => { if (e.button > 0) return; st = { x: e.clientX, y: e.clientY, h: [[performance.now(), e.clientX]] }; card.setPointerCapture(e.pointerId); card.style.transition = 'none'; });
      card.addEventListener('pointermove', e => {
        if (!st) return; const dx = e.clientX - st.x, dy = (e.clientY - st.y) * 0.3;
        const r = clamp(dx / 14, -12, 12) * ctx.tilt();
        card.style.transform = `translate(${dx}px,${dy}px) rotate(${r}deg)`;
        $('.ck-st-yes', card).style.opacity = clamp(dx / 100, 0, 1); $('.ck-st-no', card).style.opacity = clamp(-dx / 100, 0, 1);
        st.last = { x: dx, y: dy, r }; st.h.push([performance.now(), e.clientX]); if (st.h.length > 5) st.h.shift();
      });
      const end = e => {
        if (!st) return; const s = st; st = null;
        const l = s.last || { x: 0, y: 0, r: 0 };
        const v = (e.clientX - s.h[0][1]) / Math.max(1, performance.now() - s.h[0][0]);
        if (Math.abs(l.x) > 100 || (Math.abs(v) > 0.6 && Math.abs(l.x) > 30)) { fly(Math.sign(l.x || v), l, Math.abs(l.x) > 100 ? '拖过阈值' : '快速甩出'); return; }
        card.style.transition = `transform ${ctx.d(260)}ms ${ctx.ease}`; card.style.transform = '';
        $$('.ck-st', card).forEach(x => { x.style.opacity = 0; });
        if (s.last) ctx.log('未过阈值，回弹');
      };
      card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
      card.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); fly(-1, null, '←'); } if (e.key === 'ArrowRight') { e.preventDefault(); fly(1, null, '→'); } });
    }
    $('.ck-no', root).addEventListener('click', () => fly(-1, null, '按钮'));
    $('.ck-yes', root).addEventListener('click', () => fly(1, null, '按钮'));
    $('.ck-undo', root).addEventListener('click', () => {
      const h = hist.pop(); if (!h) return;
      const [c, dir] = h; deck.unshift(c); dir > 0 ? liked-- : skipped--;
      draw(true);
      const top = $('.ck-card', deckEl);
      if (!ctx.reduced()) top.animate([{ transform: `translate(${dir * 420}px,40px) rotate(${dir * 22}deg)` }, { transform: 'none' }], { duration: ctx.d(300), easing: ctx.ease });
      ctx.announce(`撤回「${c[0]}」`); ctx.log(`撤回：「${c[0]}」从${dir > 0 ? '右' : '左'}侧飞回`);
    });
    $('.ck-again', root).addEventListener('click', () => { reset(); $('.ck-card', deckEl).focus(); });
    reset();
  };

  S.holdConfirm = (root, ctx) => {
    const C = 2 * Math.PI * 34;
    root.innerHTML = `<div class="ap hc"><header class="ap-head"><h4>确认转账</h4></header>
      <div class="hc-sum"><span class="sw-av" aria-hidden="true">林</span><p>转给 林小雨</p><b>¥ 520.00</b><small>招商银行储蓄卡 (8821)</small></div>
      <div class="hc-zone"><button type="button" class="hc-btn" aria-describedby="hc-help"><svg viewBox="0 0 80 80" aria-hidden="true"><circle class="hc-track" cx="40" cy="40" r="34"/><circle class="hc-ring" cx="40" cy="40" r="34" style="stroke-dasharray:${C};stroke-dashoffset:${C}"/></svg><span class="hc-ic">按住</span></button>
      <p id="hc-help" class="hc-help">按住 1.2 秒确认，提前松开会取消</p><p class="hc-pct" aria-hidden="true"></p>
      <button type="button" class="hc-alt">改用确认对话框</button></div>
      <div class="hc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="hc-dt" hidden><p id="hc-dt">确认向 林小雨 转账 ¥520.00？</p><div><button type="button" class="hc-cancel">取消</button><button type="button" class="hc-ok">确认转账</button></div></div></div>`;
    const btn = $('.hc-btn', root), ring = $('.hc-ring', root), help = $('.hc-help', root), pctEl = $('.hc-pct', root), dlg = $('.hc-dialog', root);
    let hold = null, p = 0, done = false;
    const draw = v => { p = v; ring.style.strokeDashoffset = C * (1 - v); pctEl.textContent = v > 0 && v < 1 && ctx.reduced() ? `${Math.round(v * 100)}%` : ''; };
    function begin() {
      if (hold || done) return;
      btn.classList.add('holding'); help.textContent = '继续按住…';
      const t0 = performance.now() - p * 1200; hold = { stop: false };
      const me = hold;
      const tick = now => { if (me.stop) return; const v = Math.min(1, (now - t0) / 1200); draw(v); if (v >= 1) finish(); else ctx.frame(tick); };
      ctx.frame(tick); ctx.log('开始按住');
    }
    function finish() {
      hold.stop = true; hold = null; done = true;
      btn.classList.remove('holding'); btn.classList.add('done'); $('.hc-ic', root).textContent = '✓';
      if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) { /* ignore */ }
      help.textContent = '转账已确认'; ctx.announce('转账已确认'); ctx.log('填满：执行一次转账');
      if (!ctx.reduced()) btn.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + 0.08 * ctx.tilt()})` }, { transform: 'scale(1)' }], { duration: ctx.d(260), easing: ctx.ease });
      ctx.later(resetAll, 2400);
    }
    function release() {
      if (!hold) return; hold.stop = true; hold = null; btn.classList.remove('holding');
      if (done) return;
      const from = p, t0 = performance.now(), dur = ctx.d(200);
      const tick = now => { const k = Math.min(1, (now - t0) / dur); draw(from * (1 - k)); if (k < 1 && !hold) ctx.frame(tick); };
      ctx.frame(tick);
      help.textContent = '再按住一会儿'; ctx.log(`提前松开（${Math.round(from * 100)}%）：取消，圆环回退`);
      if (!ctx.reduced()) help.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: ctx.d(240) });
    }
    function resetAll() { done = false; btn.classList.remove('done'); $('.hc-ic', root).textContent = '按住'; draw(0); help.textContent = '按住 1.2 秒确认，提前松开会取消'; }
    btn.addEventListener('pointerdown', e => { if (e.button > 0) return; e.preventDefault(); btn.setPointerCapture(e.pointerId); begin(); });
    btn.addEventListener('pointerup', release); btn.addEventListener('pointercancel', release); btn.addEventListener('lostpointercapture', release);
    btn.addEventListener('contextmenu', e => e.preventDefault());
    btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); begin(); } else if (e.key === ' ' || e.key === 'Enter') e.preventDefault(); });
    btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') release(); });
    btn.addEventListener('click', e => e.preventDefault());
    $('.hc-alt', root).addEventListener('click', () => { dlg.hidden = false; $('.hc-ok', root).focus(); ctx.log('打开替代确认对话框'); });
    $('.hc-cancel', root).addEventListener('click', () => { dlg.hidden = true; $('.hc-alt', root).focus(); });
    $('.hc-ok', root).addEventListener('click', () => { dlg.hidden = true; btn.focus(); draw(1); hold = { stop: true }; finish(); });
    dlg.addEventListener('keydown', e => { if (e.key === 'Escape') { dlg.hidden = true; $('.hc-alt', root).focus(); } });
  };

  S.likeBurst = (root, ctx) => {
    let liked = false, count = 128;
    root.innerHTML = `<div class="ap lk"><header class="ap-head"><span class="sw-av" aria-hidden="true">阿</span><h4>阿澈</h4><span class="ap-sub">2 分钟前</span></header>
      <div class="lk-photo" aria-label="照片：海边的晚霞。双击点赞" role="img"><i class="lk-sun"></i><i class="lk-sea"></i></div>
      <div class="lk-bar"><button type="button" class="lk-btn" aria-pressed="false"><span class="lk-heart" aria-hidden="true">♡</span><span class="lk-num"><span>128</span></span></button><span class="ap-sub">今天的晚霞像橘子汽水 🍊</span></div></div>`;
    const photo = $('.lk-photo', root), btn = $('.lk-btn', root);
    const label = () => btn.setAttribute('aria-label', `点赞，${count} 人赞过`);
    label();
    function roll(up) {
      const box = $('.lk-num', root), old = box.firstElementChild;
      const nw = document.createElement('span'); nw.textContent = count; box.append(nw);
      if (ctx.reduced()) { old.remove(); return; }
      const d = ctx.d(240), dir = up ? 1 : -1;
      old.animate([{ transform: 'none', opacity: 1 }, { transform: `translateY(${-dir * 100}%)`, opacity: 0 }], { duration: d, easing: 'ease-in' }).onfinish = () => old.remove();
      nw.animate([{ transform: `translateY(${dir * 100}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: d, easing: ctx.ease });
    }
    function set(v, why) {
      if (v === liked) return; liked = v; count += v ? 1 : -1;
      btn.setAttribute('aria-pressed', String(v)); btn.classList.toggle('on', v); $('.lk-heart', root).textContent = v ? '♥' : '♡';
      if (!ctx.reduced()) $('.lk-heart', root).animate(v ? [{ transform: 'scale(1)' }, { transform: `scale(${1 + 0.3 * ctx.tilt()})` }, { transform: 'scale(.9)' }, { transform: 'scale(1)' }] : [{ transform: 'scale(1)' }, { transform: 'scale(.8)' }, { transform: 'scale(1)' }], { duration: ctx.d(300), easing: ctx.ease });
      roll(v); label(); ctx.log(`${why}：${v ? '点赞' : '取消'}，计数 ${count}`);
    }
    function burst(x, y) {
      $$('.lk-big, .lk-dot', photo).forEach(n => n.remove());
      if (ctx.reduced()) return;
      const h = document.createElement('span'); h.className = 'lk-big'; h.textContent = '♥'; h.style.left = x + 'px'; h.style.top = y + 'px'; photo.append(h);
      h.animate([{ transform: 'translate(-50%,-50%) scale(0)', opacity: 1 }, { transform: `translate(-50%,-50%) scale(${1 + 0.2 * ctx.tilt()})`, opacity: 1, offset: 0.35 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.55 }, { transform: 'translate(-50%,-90%) scale(1)', opacity: 0 }], { duration: ctx.d(720), easing: 'ease-out' }).onfinish = () => h.remove();
      for (let i = 0; i < 6; i++) {
        const d = document.createElement('i'); d.className = 'lk-dot'; d.style.left = x + 'px'; d.style.top = y + 'px'; photo.append(d);
        const a = (i / 6) * Math.PI * 2, r = 60 * (0.7 + 0.3 * ctx.tilt());
        d.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r}px)) scale(.3)`, opacity: 0 }], { duration: ctx.d(500), easing: 'cubic-bezier(.1,.7,.3,1)' }).onfinish = () => d.remove();
      }
    }
    let last = 0, lx = 0, ly = 0;
    photo.addEventListener('pointerup', e => {
      const r = photo.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
      if (now - last < 320 && Math.hypot(x - lx, y - ly) < 30) { burst(x, y); if (liked) ctx.log('双击：已点赞，只重播动画'); else set(true, '双击图片'); last = 0; }
      else { last = now; lx = x; ly = y; }
    });
    btn.addEventListener('click', () => set(!liked, '按钮'));
  };

  S.sharedExpand = (root, ctx) => {
    const cards = [['山里的面包店', '每天清晨五点开炉，只做三种面包。老板说，卖完就关门去爬山。', 30], ['城市夜跑路线', '从江边出发，沿着老城墙跑一圈，全程 8.6 公里，路灯和风都刚好。', 220], ['阳台小菜园', '三个花盆种出一整个夏天：薄荷、小番茄和总也长不大的辣椒。', 120], ['旧物修理铺', '一位老师傅修了四十年收音机，墙上挂满了客人留下的感谢信。', 330]];
    root.innerHTML = `<div class="ap se"><header class="ap-head"><h4>发现</h4><span class="ap-sub">本周精选</span></header>
      <div class="se-grid">${cards.map((c, i) => `<button type="button" class="se-card" data-i="${i}" style="--h:${c[2]}"><span class="se-art" aria-hidden="true"></span><b>${c[0]}</b></button>`).join('')}</div>
      <article class="se-detail" hidden aria-labelledby="se-t"><div class="se-hero" aria-hidden="true"></div><button type="button" class="se-back" aria-label="返回发现">‹</button><div class="se-body"><h4 id="se-t" tabindex="-1"></h4><p></p><p class="se-more">这是一个共享元素转场示例：卡片本身变成了详情页的头图与容器，返回时再缩回原位。</p></div></article></div>`;
    const grid = $('.se-grid', root), det = $('.se-detail', root);
    let from = null, geo = null, txt = null, open = false;
    const rectIn = el => { const a = el.getBoundingClientRect(), b = root.getBoundingClientRect(); return { l: a.left - b.left, t: a.top - b.top, w: a.width, h: a.height }; };
    function show(card) {
      from = card; open = true;
      const i = +card.dataset.i, c = cards[i];
      det.style.setProperty('--h', c[2]); $('h4', det).textContent = c[0]; $('.se-body p', det).textContent = c[1];
      det.hidden = false; grid.inert = true; card.style.visibility = 'hidden';
      ctx.log(`打开「${c[0]}」`);
      if (ctx.reduced()) { $('h4', det).focus(); return; }
      const r = rectIn(card), W = root.clientWidth, H = root.clientHeight;
      geo = det.animate([{ left: r.l + 'px', top: r.t + 'px', width: r.w + 'px', height: r.h + 'px', borderRadius: '16px' }, { left: '0px', top: '0px', width: W + 'px', height: H + 'px', borderRadius: '0px' }], { duration: ctx.d(360), easing: ctx.ease === 'cubic-bezier(.2,.8,.2,1)' ? ctx.ease : 'cubic-bezier(.2,.9,.3,1)' });
      txt = $('.se-body', det).animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: ctx.d(200), delay: ctx.d(200), fill: 'backwards', easing: 'ease-out' });
      geo.onfinish = () => { if (open) $('h4', det).focus({ preventScroll: true }); };
    }
    function hide(why) {
      if (!open) return; open = false;
      const card = from;
      const done = () => { det.hidden = true; grid.inert = false; card.style.visibility = ''; card.focus({ preventScroll: true }); };
      ctx.log(`${why}：收回原位，焦点回到卡片`);
      if (ctx.reduced()) { done(); return; }
      if (geo && geo.playState === 'running') { geo.reverse(); if (txt) txt.reverse(); geo.onfinish = done; ctx.log('展开中途返回：从当前进度反向'); return; }
      const r = rectIn(card), W = root.clientWidth, H = root.clientHeight;
      $('.se-body', det).animate([{ opacity: 1 }, { opacity: 0 }], { duration: ctx.d(100), fill: 'forwards' });
      geo = det.animate([{ left: '0px', top: '0px', width: W + 'px', height: H + 'px', borderRadius: '0px' }, { left: r.l + 'px', top: r.t + 'px', width: r.w + 'px', height: r.h + 'px', borderRadius: '16px' }], { duration: ctx.d(300), delay: ctx.d(60), easing: 'cubic-bezier(.4,0,.2,1)' });
      geo.onfinish = () => { $('.se-body', det).getAnimations().forEach(a => a.cancel()); done(); };
    }
    grid.addEventListener('click', e => { const c = e.target.closest('.se-card'); if (c) show(c); });
    $('.se-back', det).addEventListener('click', () => hide('返回按钮'));
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && open) { e.preventDefault(); hide('Esc'); } });
    let sx = null;
    det.addEventListener('pointerdown', e => { sx = e.clientX < 40 ? e.clientX : null; });
    det.addEventListener('pointerup', e => { if (sx != null && e.clientX - sx > 70) hide('右滑返回'); sx = null; });
  };

  window.PIPE_SCENES = S;
})();

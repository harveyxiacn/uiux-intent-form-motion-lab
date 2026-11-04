/* State-and-response scenes for the App prompts in family 「状态与回应」.
   Same contract as scenes.js: S.stateLab(root, variant, ctx) renders into root and returns a teardown.
   Rule shared by all eight: business state changes first, animation only connects the states,
   so interrupting, repeating or reducing motion never leaves the data wrong. */
(function () {
  "use strict";

  const S = (window.LAB_SCENES = window.LAB_SCENES || {});
  const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(.22,.75,.25,1)";

  function shell(root, o) {
    root.innerHTML = `
      <div class="scene st-scene">
        <div class="scene-head">
          <div><p class="scene-kicker">${o.kicker}</p><h4 class="scene-title">${o.title}</h4></div>
          <p class="scene-note">${o.note}</p>
        </div>
        <div class="scene-body"></div>
        <p class="scene-status" data-status aria-live="polite">${o.status}</p>
      </div>`;
    const scene = root.querySelector(".scene");
    return { body: scene.querySelector(".scene-body"), status: scene.querySelector("[data-status]") };
  }

  function bind(bag, target, type, handler, options) {
    target.addEventListener(type, handler, options);
    bag.push(() => target.removeEventListener(type, handler, options));
  }

  function later(bag, fn, ms) {
    // state holds (sending, processing, success) keep their timing under reduced motion;
    // only the movement is removed, so every state stays readable
    const id = setTimeout(fn, ms);
    bag.push(() => clearTimeout(id));
    return id;
  }

  function animate(el, frames, options) {
    if (!el || prefersReduced()) return { finished: Promise.resolve(), cancel() {} };
    return el.animate(frames, Object.assign({ fill: "none", easing: EASE }, options));
  }

  /* Short press-and-rebound used by every button in this family. */
  function bounce(el) {
    animate(el, [{ transform: "scale(1)" }, { transform: "scale(.92)", offset: .35 }, { transform: "scale(1.03)", offset: .75 }, { transform: "scale(1)" }], { duration: 300 });
  }

  const CHECK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const PLANE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2L20.5 3.5l-4.2 17-5-5.2-3.6 3 .7-5.1L3 11.2z" fill="currentColor"/><path d="M8.4 13.2l12.1-9.7" stroke="#1a1b16" stroke-opacity=".35" stroke-width="1.2"/></svg>`;

  S.stateLab = function (root, variant) {
    const bag = [];
    const meta = {
      plane: ["MOBILE / SEND", "纸飞机发送", "点分享行程<br>纸飞机从按钮里飞出去", "行程未分享"],
      press: ["MOBILE / LONG PRESS", "长按快捷菜单", "按住卡片不放<br>旁边展开操作菜单", "长按卡片或按 Enter 打开菜单"],
      accordion: ["MOBILE / ACCORDION", "手风琴问答", "点一个问题<br>答案展开，下方内容让位", "全部收起"],
      multi: ["MOBILE / SELECT", "多选操作栏", "勾选几项<br>底部操作栏升起", "未选择"],
      stepper: ["MOBILE / STEPPER", "数量步进器", "点加减<br>数字纵向滚动切换", "数量 1"],
      flip: ["MOBILE / FLIP", "卡片翻面", "点卡片<br>沿竖轴翻到背面", "正面"],
      chips: ["MOBILE / FILTER", "搜索筛选标签", "点标签或输入关键词<br>底色滑过去，结果依次出现", "显示全部 6 个结果"],
      steps: ["MOBILE / STEPS", "步骤进度条", "完成一步<br>圆点变对勾、连线填满", "第 1 步 · 共 4 步"]
    }[variant] || ["MOBILE / STATE", "状态与回应", "", ""];
    const ui = shell(root, { kicker: meta[0], title: meta[1], note: meta[2], status: meta[3] });
    const body = ui.body;
    const say = (text) => { ui.status.textContent = text; };

    /* 1. Paper-plane send button: idle -> sending -> shared / failed ------------------ */
    if (variant === "plane") {
      body.innerHTML = `<div class="st-screen st-plane-screen">
        <p class="mono st-eyebrow">TRIP · 3 DAYS</p><h5>山海三日行</h5>
        <div class="st-trip"><span>Day 1 · 海岸步道</span><span>Day 2 · 雪线营地</span><span>Day 3 · 老城电车</span></div>
        <div class="st-send-wrap">
          <button type="button" class="st-send" data-send data-state="idle"><span class="st-send-icon" data-icon>${PLANE}</span><span data-label>分享行程</span></button>
        </div>
        <label class="st-toggle"><input type="checkbox" data-fail> 模拟网络失败</label>
        <button type="button" class="st-link" data-reset>重置</button>
      </div>`;
      const btn = body.querySelector("[data-send]");
      const label = body.querySelector("[data-label]");
      const icon = body.querySelector("[data-icon]");
      const fail = body.querySelector("[data-fail]");
      const setState = (state, text, iconHtml) => {
        btn.dataset.state = state;
        label.textContent = text;
        icon.innerHTML = iconHtml;
        btn.setAttribute("aria-busy", String(state === "sending"));
      };
      const send = () => {
        const state = btn.dataset.state;
        if (state === "sending" || state === "done") return; // repeated taps do not resend
        bounce(btn);
        setState("sending", "发送中…", `<i class="st-spin" aria-hidden="true"></i>`);
        say("正在发送行程…");
        if (!prefersReduced()) {
          // the plane is a decorative copy; the button state above is the real feedback
          const plane = document.createElement("span");
          plane.className = "st-plane-fly";
          plane.innerHTML = PLANE;
          plane.setAttribute("aria-hidden", "true");
          btn.parentNode.appendChild(plane);
          animate(plane, [
            { transform: "translate(0,0) rotate(0) scale(1)", opacity: 1 },
            { transform: "translate(60px,-40px) rotate(-12deg) scale(1.1)", opacity: 1, offset: .4 },
            { transform: "translate(150px,-150px) rotate(-26deg) scale(.6)", opacity: 0 }
          ], { duration: 720, easing: "cubic-bezier(.45,0,.2,1)" }).finished.then(() => plane.remove(), () => plane.remove());
        }
        later(bag, () => {
          if (fail.checked) {
            setState("error", "发送失败，点此重试", "!");
            say("发送失败：网络不可用，行程没有被分享");
          } else {
            setState("done", "已分享", CHECK);
            animate(btn, [{ transform: "scale(.96)" }, { transform: "scale(1.04)", offset: .6 }, { transform: "scale(1)" }], { duration: 320 });
            say("已分享给 3 位同行人");
          }
        }, 900);
      };
      bind(bag, btn, "click", send);
      bind(bag, body.querySelector("[data-reset]"), "click", () => { setState("idle", "分享行程", PLANE); say("行程未分享"); btn.focus(); });
    }

    /* 2. Long-press card with a quick-action menu --------------------------------------- */
    if (variant === "press") {
      body.innerHTML = `<div class="st-screen">
        <p class="mono st-eyebrow">NOTES</p><h5>我的笔记</h5>
        <div class="st-press-area">
          <button type="button" class="st-press-card" data-card aria-haspopup="menu" aria-expanded="false">
            <span class="st-press-img mx-img mx-ph-1"></span>
            <span><b data-title>海边的早晨</b><small>长按查看操作</small></span>
            <i class="st-pin" data-pin hidden>已置顶</i>
          </button>
          <div class="st-menu" role="menu" aria-label="笔记操作" data-menu hidden>
            <button type="button" role="menuitem" data-act="置顶">置顶</button>
            <button type="button" role="menuitem" data-act="分享">分享</button>
            <button type="button" role="menuitem" data-act="收藏">收藏</button>
            <button type="button" role="menuitem" class="danger" data-act="删除">删除</button>
          </div>
        </div>
        <p class="st-hint">按住约 0.45 秒；移动手指会取消。键盘：Enter 或菜单键打开，方向键选择，Esc 关闭。</p>
      </div>`;
      const card = body.querySelector("[data-card]");
      const menu = body.querySelector("[data-menu]");
      const items = [...menu.querySelectorAll("[role=menuitem]")];
      let timer = 0, x0 = 0, y0 = 0, opened = false;
      const open = () => {
        opened = true;
        card.classList.add("lifted");
        card.setAttribute("aria-expanded", "true");
        menu.hidden = false;
        animate(menu, [{ opacity: 0, transform: "scale(.85)" }, { opacity: 1, transform: "scale(1)" }], { duration: 260 });
        items.forEach((item, i) => animate(item, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 220, delay: 30 * i, fill: "backwards" }));
        items[0].focus({ preventScroll: true });
        if (navigator.vibrate) try { navigator.vibrate(10); } catch (error) { /* optional */ }
        say("菜单已打开");
      };
      const close = (message, focusCard) => {
        if (!opened) return;
        opened = false;
        card.setAttribute("aria-expanded", "false");
        const done = () => { menu.hidden = true; card.classList.remove("lifted", "pressing"); };
        animate(menu, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.9)" }], { duration: 200 }).finished.then(done, done);
        if (focusCard !== false) card.focus({ preventScroll: true });
        say(message || "菜单已收起");
      };
      const cancelPress = () => { clearTimeout(timer); timer = 0; if (!opened) card.classList.remove("pressing"); };
      bag.push(cancelPress);
      bind(bag, card, "pointerdown", (event) => {
        if (event.button !== 0 || opened) return;
        x0 = event.clientX; y0 = event.clientY;
        card.classList.add("pressing");
        timer = setTimeout(open, 450);
      });
      bind(bag, card, "pointermove", (event) => { if (timer && Math.hypot(event.clientX - x0, event.clientY - y0) > 10) cancelPress(); });
      bind(bag, card, "pointerup", cancelPress);
      bind(bag, card, "pointercancel", cancelPress);
      bind(bag, card, "pointerleave", cancelPress);
      bind(bag, card, "contextmenu", (event) => event.preventDefault());
      bind(bag, card, "click", (event) => { if (event.detail === 0 && !opened) open(); }); // keyboard Enter / Space
      bind(bag, card, "keydown", (event) => { if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) { event.preventDefault(); open(); } });
      bind(bag, menu, "click", (event) => {
        const item = event.target.closest("[data-act]");
        if (!item) return;
        const act = item.dataset.act;
        if (act === "置顶") body.querySelector("[data-pin]").hidden = false;
        close(`已${act}「海边的早晨」`);
      });
      bind(bag, menu, "keydown", (event) => {
        const i = items.indexOf(document.activeElement);
        if (event.key === "ArrowDown") { event.preventDefault(); items[(i + 1) % items.length].focus(); }
        if (event.key === "ArrowUp") { event.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        if (event.key === "Escape") { event.preventDefault(); close(); }
        if (event.key === "Tab") close(null, false);
      });
      bind(bag, document, "pointerdown", (event) => { if (opened && !menu.contains(event.target) && !card.contains(event.target)) close(null, false); });
    }

    /* 3. Accordion FAQ: one answer open at a time, content below moves with it ----------- */
    if (variant === "accordion") {
      const faq = [
        ["可以带宠物入住吗？", "可以。小型犬猫需在预订时备注，每晚加收 50 元清洁费。"],
        ["几点可以办理入住？", "下午 2 点后可入住，中午 12 点前退房；提前到达可以免费寄存行李。"],
        ["取消订单怎么退款？", "入住前 48 小时取消全额退款；48 小时内取消扣除首晚房费，3 个工作日内原路退回。"],
        ["有停车位吗？", "有免费露天停车位 20 个，先到先得，不需要预约。"]
      ];
      body.innerHTML = `<div class="st-screen">
        <p class="mono st-eyebrow">FAQ</p><h5>常见问题</h5>
        <div class="st-acc">${faq.map((f, i) => `
          <div class="st-acc-item">
            <h6><button type="button" id="st-q${i}" aria-expanded="false" aria-controls="st-a${i}" data-i="${i}"><span>${f[0]}</span><i aria-hidden="true">⌄</i></button></h6>
            <div class="st-acc-panel" id="st-a${i}" role="region" aria-labelledby="st-q${i}"><div><p>${f[1]}</p></div></div>
          </div>`).join("")}
        </div>
        <p class="st-after">还有问题？<b>联系客服</b> · 这一行会随着答案展开向下让位。</p>
      </div>`;
      const buttons = [...body.querySelectorAll(".st-acc button")];
      const panels = [...body.querySelectorAll(".st-acc-panel")];
      panels.forEach((panel) => panel.setAttribute("inert", ""));
      const set = (i, open) => {
        buttons[i].setAttribute("aria-expanded", String(open));
        panels[i].classList.toggle("open", open);
        if (open) panels[i].removeAttribute("inert"); else panels[i].setAttribute("inert", "");
      };
      bind(bag, body.querySelector(".st-acc"), "click", (event) => {
        const btn = event.target.closest("button[data-i]");
        if (!btn) return;
        const i = +btn.dataset.i, wasOpen = btn.getAttribute("aria-expanded") === "true";
        buttons.forEach((_, j) => { if (j !== i) set(j, false); });
        set(i, !wasOpen);
        say(wasOpen ? "全部收起" : `已展开「${faq[i][0]}」`);
      });
    }

    /* 4. Multi-select list with a bottom action bar ------------------------------------ */
    if (variant === "multi") {
      const SEED = [
        ["海边的早晨", "2.4 MB"], ["读到一半的书", "1.1 MB"], ["雪线之上", "3.8 MB"],
        ["黄色电车", "2.0 MB"], ["石板小巷", "2.7 MB"], ["金色麦田", "1.6 MB"]
      ];
      const seed = () => SEED.map((r, i) => ({ id: i, name: r[0], size: r[1], on: false }));
      let rows = seed();
      body.innerHTML = `<div class="st-screen st-multi-screen">
        <div class="st-multi-head"><div><p class="mono st-eyebrow">FILES</p><h5>最近照片</h5></div><button type="button" class="st-link" data-all>全选</button></div>
        <ul class="st-multi" data-list></ul>
        <div class="st-bar" data-bar aria-hidden="true">
          <b data-count>已选 0 项</b>
          <button type="button" data-clear>取消</button>
          <button type="button" class="danger" data-delete>删除</button>
        </div>
      </div>`;
      const list = body.querySelector("[data-list]");
      const bar = body.querySelector("[data-bar]");
      const count = body.querySelector("[data-count]");
      const allBtn = body.querySelector("[data-all]");
      const render = () => {
        list.innerHTML = rows.length ? rows.map((r) => `<li><button type="button" role="checkbox" aria-checked="${r.on}" data-id="${r.id}"><i class="st-box" aria-hidden="true">${CHECK}</i><span class="mx-img mx-ph-${r.id + 1}"></span><span><b>${r.name}</b><small>${r.size}</small></span></button></li>`).join("")
          : `<li class="st-empty">没有照片了 · <button type="button" class="st-link" data-restore>恢复示例</button></li>`;
      };
      const sync = () => {
        const n = rows.filter((r) => r.on).length;
        count.textContent = `已选 ${n} 项`;
        const show = n > 0;
        bar.classList.toggle("up", show);
        bar.setAttribute("aria-hidden", String(!show));
        bar.querySelectorAll("button").forEach((b) => { b.tabIndex = show ? 0 : -1; });
        allBtn.textContent = n === rows.length && n ? "全不选" : "全选";
        allBtn.disabled = !rows.length;
        say(n ? `已选 ${n} 项` : "未选择");
      };
      /* data changes at once; paint() only shows it, so a delayed paint always reads current state */
      const paint = (id, pop) => {
        const r = rows.find((x) => x.id === id);
        const btn = list.querySelector(`[data-id="${id}"]`);
        if (!r || !btn) return;
        btn.setAttribute("aria-checked", String(r.on));
        if (r.on && pop) bounce(btn.querySelector(".st-box"));
      };
      bind(bag, list, "click", (event) => {
        if (event.target.closest("[data-restore]")) { rows = seed(); render(); sync(); return; }
        const btn = event.target.closest("[data-id]"); if (!btn) return;
        const r = rows.find((x) => x.id === +btn.dataset.id);
        r.on = !r.on; paint(r.id, true); sync();
      });
      bind(bag, allBtn, "click", () => {
        const target = !rows.every((r) => r.on);
        rows.forEach((r) => { r.on = target; });
        rows.forEach((r, i) => later(bag, () => paint(r.id, true), 45 * i)); // boxes light up one after another
        sync();
      });
      bind(bag, body.querySelector("[data-clear]"), "click", () => { rows.forEach((r) => { r.on = false; paint(r.id); }); sync(); allBtn.focus(); });
      bind(bag, body.querySelector("[data-delete]"), "click", () => {
        const gone = rows.filter((r) => r.on).length;
        rows = rows.filter((r) => !r.on);
        render(); sync();
        say(`已删除 ${gone} 项`);
        allBtn.focus();
      });
      render(); sync();
    }

    /* 5. Quantity stepper with vertically rolling digits -------------------------------- */
    if (variant === "stepper") {
      const PRICE = 68, MAX = 20;
      let n = 1;
      body.innerHTML = `<div class="st-screen st-stepper-screen">
        <span class="st-product mx-img mx-ph-6"></span>
        <p class="mono st-eyebrow">FIELD · 明信片</p><h5>金色麦田明信片</h5>
        <p class="st-price">单价 ¥${PRICE}</p>
        <div class="st-stepper" role="group" aria-label="购买数量">
          <button type="button" data-minus aria-label="减少一件">−</button>
          <span class="st-roll" aria-hidden="true"><span data-num>1</span></span>
          <button type="button" data-plus aria-label="增加一件">+</button>
        </div>
        <output class="st-total" data-total aria-live="polite">数量 1 · 合计 ¥${PRICE}</output>
        <p class="st-hint">数量不能小于 0，最多 ${MAX} 件；按钮按住不放不会连发。</p>
      </div>`;
      const roll = body.querySelector(".st-roll");
      const minus = body.querySelector("[data-minus]");
      const plus = body.querySelector("[data-plus]");
      const total = body.querySelector("[data-total]");
      const swap = (dir) => {
        roll.querySelectorAll("[data-old]").forEach((el) => el.remove());
        const old = roll.querySelector("[data-num]");
        const next = document.createElement("span");
        next.textContent = String(n);
        next.setAttribute("data-num", "");
        old.removeAttribute("data-num");
        old.setAttribute("data-old", "");
        roll.appendChild(next);
        if (prefersReduced()) { old.remove(); return; }
        animate(old, [{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${-100 * dir}%)`, opacity: 0 }], { duration: 260, fill: "forwards" }).finished.then(() => old.remove(), () => old.remove());
        animate(next, [{ transform: `translateY(${100 * dir}%)`, opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 300 });
      };
      const sync = () => {
        minus.disabled = n <= 0; plus.disabled = n >= MAX;
        total.textContent = `数量 ${n} · 合计 ¥${n * PRICE}`;
        say(n === 0 ? "数量 0 · 已到下限" : n === MAX ? `数量 ${n} · 已到上限` : `数量 ${n}`);
      };
      const change = (d, btn) => {
        const next = Math.max(0, Math.min(MAX, n + d));
        bounce(btn);
        if (next === n) return;
        n = next; swap(d); sync();
        if (btn.disabled) (d > 0 ? minus : plus).focus(); // keep focus on a usable button
      };
      bind(bag, minus, "click", () => change(-1, minus));
      bind(bag, plus, "click", () => change(1, plus));
      sync();
    }

    /* 6. Flip card on the vertical axis ------------------------------------------------- */
    if (variant === "flip") {
      body.innerHTML = `<div class="st-screen st-flip-screen">
        <p class="mono st-eyebrow">MEMBER</p><h5>会员卡</h5>
        <button type="button" class="st-flip" data-flip aria-pressed="false" aria-label="会员卡，点击翻到背面">
          <span class="st-face st-front" data-front>
            <span class="mono">LAB MEMBER</span><b>夏小满</b><small>NO. 0423 · 2026</small><em>点击翻面 ↻</em>
          </span>
          <span class="st-face st-back" data-back aria-hidden="true">
            <span class="mono">BENEFITS</span>
            <span class="st-qr" aria-hidden="true"></span>
            <small>展览免费入场 · 咖啡 9 折<br>有效期至 2027.12</small>
          </span>
        </button>
        <p class="st-hint">背面在旋转过半前不可见，不会出现镜像文字；Enter / 空格也能翻。</p>
      </div>`;
      const card = body.querySelector("[data-flip]");
      const front = body.querySelector("[data-front]");
      const back = body.querySelector("[data-back]");
      bind(bag, card, "click", () => {
        const flipped = card.getAttribute("aria-pressed") !== "true";
        card.setAttribute("aria-pressed", String(flipped));
        card.classList.toggle("flipped", flipped);
        card.setAttribute("aria-label", flipped ? "会员卡背面：展览免费入场，咖啡 9 折，点击翻回正面" : "会员卡，点击翻到背面");
        front.setAttribute("aria-hidden", String(flipped));
        back.setAttribute("aria-hidden", String(!flipped));
        say(flipped ? "背面" : "正面");
      });
    }

    /* 7. Search + filter chips with a sliding highlight and staggered results ------------ */
    if (variant === "chips") {
      const DATA = [
        ["海岸步道", "景点", 1], ["雪线营地", "住宿", 3], ["老城电车", "景点", 4],
        ["巷口面馆", "美食", 5], ["麦田民宿", "住宿", 6], ["书店咖啡", "美食", 2]
      ];
      const TAGS = ["全部", "景点", "美食", "住宿"];
      body.innerHTML = `<div class="st-screen">
        <p class="mono st-eyebrow">EXPLORE</p><h5>附近去处</h5>
        <label class="st-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="搜索地点" data-q aria-label="搜索地点"></label>
        <div class="st-chips" role="group" aria-label="按类型筛选" data-chips>
          <i class="st-chip-bg" aria-hidden="true" data-bg></i>
          ${TAGS.map((t, i) => `<button type="button" data-tag="${t}" aria-pressed="${i === 0}">${t}</button>`).join("")}
        </div>
        <ul class="st-results" data-results></ul>
      </div>`;
      const chips = body.querySelector("[data-chips]");
      const bg = body.querySelector("[data-bg]");
      const results = body.querySelector("[data-results]");
      const q = body.querySelector("[data-q]");
      let tag = "全部", running = [], token = 0;
      const moveBg = (btn, instant) => {
        bg.style.transition = instant || prefersReduced() ? "none" : "";
        bg.style.width = btn.offsetWidth + "px";
        bg.style.transform = `translateX(${btn.offsetLeft}px)`;
      };
      const draw = () => {
        const text = q.value.trim();
        const list = DATA.filter((d) => (tag === "全部" || d[1] === tag) && (!text || d[0].includes(text)));
        results.innerHTML = list.length ? list.map((d) => `<li><span class="mx-img mx-ph-${d[2]}"></span><b>${d[0]}</b><small>${d[1]}</small></li>`).join("")
          : `<li class="st-empty">没有找到「${text || tag}」相关的去处</li>`;
        running = [...results.children].map((li, i) => animate(li, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 260, delay: 40 * i, fill: "backwards" }));
        say(list.length ? `${tag} · ${list.length} 个结果` : "没有结果");
      };
      const update = () => {
        const mine = ++token;
        running.forEach((a) => a.cancel()); // rapid clicks: drop the stale stagger
        const out = animate(results, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" });
        out.finished.then(() => { if (mine !== token) return; out.cancel(); draw(); }, () => {});
      };
      bind(bag, chips, "click", (event) => {
        const btn = event.target.closest("[data-tag]"); if (!btn || btn.dataset.tag === tag) return;
        tag = btn.dataset.tag;
        chips.querySelectorAll("[data-tag]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        moveBg(btn);
        update();
      });
      let typing = 0;
      bind(bag, q, "input", () => { clearTimeout(typing); typing = setTimeout(update, 180); });
      bag.push(() => clearTimeout(typing));
      const onResize = () => moveBg(chips.querySelector('[aria-pressed="true"]'), true);
      bind(bag, window, "resize", onResize);
      requestAnimationFrame(onResize);
      draw();
    }

    /* 8. Step progress: dot -> check, connector fills, next dot lights -------------------- */
    if (variant === "steps") {
      const STEPS = [
        ["填写信息", "填写联系人姓名和手机号，用于接收取票码。"],
        ["选择座位", "选择观展场次与座位，靠窗座位剩余 4 个。"],
        ["确认支付", "确认订单金额 ¥136，支持微信与银行卡。"],
        ["完成", "预约成功！取票码已发送到手机，入场时出示即可。"]
      ];
      let at = 0, busy = false;
      body.innerHTML = `<div class="st-screen st-steps-screen">
        <p class="mono st-eyebrow">BOOKING</p><h5>预约观展</h5>
        <ol class="st-steps" data-steps>${STEPS.map((s, i) => `<li data-i="${i}"><span class="st-dot"><b>${i + 1}</b>${CHECK}</span><small>${s[0]}</small>${i < STEPS.length - 1 ? `<i class="st-line" aria-hidden="true"><i></i></i>` : ""}</li>`).join("")}</ol>
        <div class="st-desc-wrap"><div class="st-desc" data-desc><b>${STEPS[0][0]}</b><p>${STEPS[0][1]}</p></div></div>
        <div class="st-steps-actions"><button type="button" class="st-ghost" data-prev>上一步</button><button type="button" class="st-primary" data-next>完成这一步</button></div>
      </div>`;
      const lis = [...body.querySelectorAll("[data-steps] li")];
      const desc = body.querySelector("[data-desc]");
      const prev = body.querySelector("[data-prev]");
      const next = body.querySelector("[data-next]");
      const paint = () => {
        lis.forEach((li, i) => {
          li.classList.toggle("done", i < at || at === STEPS.length - 1 && i === at);
          li.classList.toggle("current", i === at);
          if (i === at) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
        });
        prev.disabled = at === 0 || busy;
        next.disabled = busy;
        next.textContent = busy ? "处理中…" : at === STEPS.length - 1 ? "重新开始" : at === STEPS.length - 2 ? "确认支付" : "完成这一步";
      };
      const swapDesc = (dir) => {
        const fill = () => { desc.innerHTML = `<b>${STEPS[at][0]}</b><p>${STEPS[at][1]}</p>`; };
        const out = animate(desc, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-16 * dir}px)` }], { duration: 160, fill: "forwards" });
        out.finished.then(() => { fill(); out.cancel(); animate(desc, [{ opacity: 0, transform: `translateX(${16 * dir}px)` }, { opacity: 1, transform: "none" }], { duration: 240 }); }, fill);
      };
      const go = (to) => {
        const dir = to > at ? 1 : -1;
        at = to; paint(); swapDesc(dir);
        say(at === STEPS.length - 1 ? "全部完成 · 预约成功" : `第 ${at + 1} 步 · 共 ${STEPS.length} 步`);
      };
      bind(bag, next, "click", () => {
        if (busy) return;
        if (at === STEPS.length - 1) { go(0); return; }
        busy = true; paint(); say("处理中…");
        later(bag, () => { busy = false; go(at + 1); }, 420); // a short loading state before success
      });
      bind(bag, prev, "click", () => { if (!busy && at > 0) go(at - 1); });
      paint();
    }

    return () => bag.splice(0).forEach((fn) => { try { fn(); } catch (error) { /* already gone */ } });
  };
})();

/* Photo and page-transition scenes for the App prompts in family 「照片与转场」.
   Same contract as scenes.js: S.motionLab(root, variant, ctx) renders into root and returns a teardown. */
(function () {
  "use strict";

  const S = (window.LAB_SCENES = window.LAB_SCENES || {});
  const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const T = (text) => (window.I18N && I18N.t ? I18N.t(text) : text);

  function shell(root, o) {
    root.innerHTML = `
      <div class="scene mx-scene">
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

  /* Damped spring on one number. Interrupting keeps the current value and velocity,
     so a new drag or target continues from where the motion is. */
  function spring(bag, opts) {
    const k = opts.stiffness || 260, c = opts.damping || 22;
    let x = opts.from, v = opts.velocity || 0, to = opts.to, id = 0, last = 0, done = false;
    const stop = () => { cancelAnimationFrame(id); done = true; };
    bag.push(stop);
    if (prefersReduced()) { opts.onUpdate(to); if (opts.onDone) opts.onDone(); return { stop, value: () => to, velocity: () => 0 }; }
    const step = (time) => {
      const dt = Math.min(0.032, last ? (time - last) / 1000 : 0.016);
      last = time;
      v += (-k * (x - to) - c * v) * dt;
      x += v * dt;
      if (Math.abs(v) < 0.002 && Math.abs(x - to) < 0.0005) { x = to; opts.onUpdate(x); done = true; if (opts.onDone) opts.onDone(); return; }
      opts.onUpdate(x);
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return { stop, value: () => x, velocity: () => v, done: () => done };
  }

  function animate(el, frames, options) {
    if (!el || prefersReduced()) return { finished: Promise.resolve(), cancel() {} };
    return el.animate(frames, Object.assign({ fill: "both" }, options));
  }

  /* Pointer drag with velocity in px/ms, measured over the last ~80ms. */
  function drag(bag, el, handlers) {
    let id = null, x0 = 0, y0 = 0, samples = [];
    bind(bag, el, "pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) return;
      id = event.pointerId; x0 = event.clientX; y0 = event.clientY; samples = [{ x: x0, t: event.timeStamp }];
      el.setPointerCapture(id);
      handlers.start && handlers.start();
    });
    bind(bag, el, "pointermove", (event) => {
      if (event.pointerId !== id) return;
      samples.push({ x: event.clientX, t: event.timeStamp });
      while (samples.length > 2 && event.timeStamp - samples[0].t > 80) samples.shift();
      handlers.move(event.clientX - x0, event.clientY - y0);
    });
    const end = (event) => {
      if (event.pointerId !== id) return;
      id = null;
      const a = samples[0], b = samples[samples.length - 1];
      const vx = b && a && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0;
      handlers.end(event.clientX - x0, vx);
    };
    bind(bag, el, "pointerup", end);
    bind(bag, el, "pointercancel", end);
  }

  const PHOTOS = [
    { name: "海边的早晨", place: "海岸 · 05:40", cls: "mx-ph-1" },
    { name: "读到一半的书", place: "书房 · 14:10", cls: "mx-ph-2" },
    { name: "雪线之上", place: "山谷 · 07:25", cls: "mx-ph-3" },
    { name: "黄色电车", place: "老城 · 16:20", cls: "mx-ph-4" },
    { name: "石板小巷", place: "老街 · 17:05", cls: "mx-ph-5" },
    { name: "金色麦田", place: "平原 · 11:30", cls: "mx-ph-6" }
  ];

  S.motionLab = function (root, variant) {
    const bag = [];
    const meta = {
      fan: ["MOBILE / FAN", "扇形叠切切换", "左右拖动照片<br>整组跟着摆位", "第 1 张 · 共 4 张"],
      ticket: ["MOBILE / SHARED", "共享元素过渡", "点一张缩略图<br>它会变成票根", "点缩略图打开票根"],
      gather: ["MOBILE / GATHER", "照片收拢动效", "照片先收拢<br>再变成相册封面", "6 张照片 · 待整理"],
      sort: ["MOBILE / SORT", "滑动分拣", "向右保留，向左跳过<br>没拖够会弹回来", "还剩 6 张"],
      title: ["MOBILE / TITLE", "标题逐行切换", "切换章节<br>标题一行一行换", "第 1 章"],
      album: ["MOBILE / ALBUM", "相册卡片滑动切换", "把最上面一张滑走<br>后面的依次补上", "相册 1 / 5"],
      lift: ["MOBILE / LIFT", "列表卡片弹性转场", "点一张卡片<br>它先浮起再展开", "点卡片打开详情"]
    }[variant] || ["MOBILE / MOTION", "照片与转场", "", ""];
    const ui = shell(root, { kicker: meta[0], title: meta[1], note: meta[2], status: meta[3] });
    const body = ui.body;
    const say = (text) => { ui.status.textContent = text; };

    /* 1. Fan carousel ------------------------------------------------------- */
    if (variant === "fan") {
      const items = PHOTOS.slice(0, 4);
      body.innerHTML = `<div class="mx-screen mx-fan-screen">
        <div class="mx-fan" tabindex="0" role="group" aria-roledescription="轮播" aria-label="照片扇面，左右方向键切换">
          ${items.map((p, i) => `<div class="mx-fan-card ${p.cls}" data-i="${i}" aria-hidden="true"><span class="mono">0${i + 1}</span></div>`).join("")}
        </div>
        <div class="mx-mask mx-fan-title"><b data-title>${items[0].name}</b></div>
        <p class="mx-fan-place" data-place>${items[0].place}</p>
        <div class="mx-dots" data-dots>${items.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>
        <div class="mx-row"><button type="button" class="stage-action ghost" data-prev aria-label="上一张">←</button><button type="button" class="stage-action accent" data-next aria-label="下一张">→</button></div>
      </div>`;
      const fan = body.querySelector(".mx-fan");
      const cards = [...body.querySelectorAll(".mx-fan-card")];
      let pos = 0, index = 0, motion = null;
      const layout = (p) => {
        pos = p;
        cards.forEach((card, i) => {
          const d = i - p, a = Math.abs(d);
          card.style.transform = `translateX(${d * 30}px) translateY(${a * 9}px) rotate(${d * 13}deg) scale(${1 - Math.min(a, 3) * .05})`;
          card.style.zIndex = String(20 - Math.round(a * 4));
          card.style.opacity = String(a > 2.6 ? 0 : 1);
        });
      };
      const swapTitle = (i) => {
        const old = body.querySelector("[data-title]");
        const next = document.createElement("b");
        next.textContent = items[i].name;
        next.setAttribute("data-title", "");
        const dir = i > index ? 1 : -1;
        old.removeAttribute("data-title");
        old.parentNode.appendChild(next);
        animate(old, [{ transform: "translateY(0)" }, { transform: `translateY(${-100 * dir}%)` }], { duration: 260, easing: "cubic-bezier(.4,0,.2,1)" }).finished.then(() => old.remove(), () => old.remove());
        animate(next, [{ transform: `translateY(${100 * dir}%)` }, { transform: "translateY(0)" }], { duration: 320, easing: "cubic-bezier(.22,.75,.25,1)" });
        if (prefersReduced()) old.remove();
        body.querySelector("[data-place]").textContent = items[i].place;
        body.querySelectorAll("[data-dots] i").forEach((dot, j) => dot.classList.toggle("on", j === i));
        say(`第 ${i + 1} 张 · 共 ${items.length} 张`);
      };
      const goTo = (target, velocity) => {
        target = clamp(target, 0, items.length - 1);
        if (target !== index) { swapTitle(target); index = target; }
        if (motion) motion.stop();
        motion = spring(bag, { from: pos, to: target, velocity: velocity || 0, stiffness: 230, damping: 19, onUpdate: layout });
      };
      let start = 0;
      drag(bag, fan, {
        start() { if (motion) motion.stop(); start = pos; },
        move(dx) {
          let p = start - dx / 110;
          if (p < 0) p = p / 3; if (p > items.length - 1) p = items.length - 1 + (p - items.length + 1) / 3;
          layout(p);
        },
        end(dx, vx) {
          // a clear flick (> 0.5 px/ms) moves one photo even when the drag was short
          let target = Math.round(pos);
          if (target === index && Math.abs(vx) > .5) target = index - Math.sign(vx);
          goTo(target, -vx * 9);
        }
      });
      bind(bag, fan, "keydown", (event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); goTo(index + 1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); goTo(index - 1); }
      });
      bind(bag, body.querySelector("[data-next]"), "click", () => goTo(index + 1));
      bind(bag, body.querySelector("[data-prev]"), "click", () => goTo(index - 1));
      layout(0);
    }

    /* 2. Thumbnail -> ticket shared element ------------------------------------ */
    if (variant === "ticket") {
      const items = PHOTOS.slice(0, 4);
      body.innerHTML = `<div class="mx-screen" data-screen>
        <section class="mx-page mx-thumbs" data-list>
          <p class="mono mx-eyebrow">MY TRIPS</p><h5>我的行程</h5>
          <div class="mx-thumb-grid">${items.map((p, i) => `<button type="button" class="mx-thumb" data-i="${i}" aria-label="打开 ${p.name} 票根"><span class="mx-img ${p.cls}"></span><b>${p.name}</b><small>${p.place}</small></button>`).join("")}</div>
        </section>
        <section class="mx-page mx-ticket-page" data-detail hidden>
          <button type="button" class="mx-back" data-back>← 行程</button>
          <article class="mx-ticket">
            <span class="mx-img mx-ticket-img" data-ticket-img></span>
            <div class="mx-ticket-body" data-ticket-body>
              <p class="mono">ADMIT ONE · NO. <span data-no></span></p>
              <h5 tabindex="-1" data-ticket-title></h5>
              <dl><div><dt>地点</dt><dd data-ticket-place></dd></div><div><dt>座位</dt><dd>靠窗 07</dd></div></dl>
              <i class="mx-perf" aria-hidden="true"></i>
              <p class="mx-stub mono">保留此票根 · 不可转让</p>
            </div>
          </article>
        </section>
      </div>`;
      const screen = body.querySelector("[data-screen]");
      const list = body.querySelector("[data-list]");
      const detail = body.querySelector("[data-detail]");
      const ticketImg = body.querySelector("[data-ticket-img]");
      const ticketBody = body.querySelector("[data-ticket-body]");
      let busy = false, current = null;
      const rel = (el) => { const a = el.getBoundingClientRect(), b = screen.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
      const flyer = (from, to, cls, duration, easing) => {
        const f = document.createElement("span");
        f.className = "mx-img mx-flyer " + cls;
        screen.appendChild(f);
        const frame = (r, radius) => ({ left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px", borderRadius: radius });
        const anim = animate(f, [frame(from, "10px"), frame(to, "16px 16px 4px 4px")], { duration, easing });
        return anim.finished.then(() => f.remove(), () => f.remove());
      };
      const open = (button) => {
        if (busy) return;
        busy = true; current = button;
        const p = items[+button.dataset.i];
        ticketImg.className = "mx-img mx-ticket-img " + p.cls;
        body.querySelector("[data-ticket-title]").textContent = p.name;
        body.querySelector("[data-ticket-place]").textContent = p.place;
        body.querySelector("[data-no]").textContent = "00" + (+button.dataset.i + 1) + "41";
        const from = rel(button.querySelector(".mx-img"));
        detail.hidden = false;
        const to = rel(ticketImg);
        ticketImg.style.visibility = "hidden";
        animate(list, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.94)", opacity: 0 }], { duration: 300, easing: "ease-out" });
        animate(ticketBody, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 0, transform: "translateY(14px)", offset: .45 }, { opacity: 1, transform: "none" }], { duration: 460, easing: "cubic-bezier(.22,.75,.25,1)" });
        flyer(from, to, p.cls, 420, "cubic-bezier(.22,.75,.25,1)").then(() => {
          ticketImg.style.visibility = ""; list.hidden = true; busy = false;
          body.querySelector("[data-ticket-title]").focus({ preventScroll: true });
          say(`已打开「${p.name}」票根`);
        });
      };
      const close = () => {
        if (busy || !current) return;
        busy = true;
        const p = items[+current.dataset.i];
        list.hidden = false;
        const to = rel(current.querySelector(".mx-img"));
        const from = rel(ticketImg);
        ticketImg.style.visibility = "hidden";
        animate(ticketBody, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-out" });
        animate(list, [{ transform: "scale(.94)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 360, easing: "cubic-bezier(.22,.75,.25,1)" });
        flyer(from, to, p.cls, 380, "cubic-bezier(.22,.75,.25,1)").then(() => {
          detail.hidden = true; ticketImg.style.visibility = ""; busy = false;
          current.focus({ preventScroll: true });
          say("已缩回原缩略图");
        });
      };
      bind(bag, list, "click", (event) => { const b = event.target.closest(".mx-thumb"); if (b) open(b); });
      bind(bag, body.querySelector("[data-back]"), "click", close);
      bind(bag, screen, "keydown", (event) => { if (event.key === "Escape" && !detail.hidden) close(); });
    }

    /* 3. Photos gather into a cover --------------------------------------------- */
    if (variant === "gather") {
      body.innerHTML = `<div class="mx-screen" data-screen>
        <section class="mx-page" data-grid-page>
          <p class="mono mx-eyebrow">UNSORTED · 6</p><h5>十月的照片</h5>
          <div class="mx-gather-grid" data-grid>${PHOTOS.map((p) => `<span class="mx-img ${p.cls}" aria-hidden="true"></span>`).join("")}</div>
          <button type="button" class="stage-action accent mx-wide" data-make>生成相册</button>
        </section>
        <section class="mx-page mx-album-page" data-album hidden>
          <button type="button" class="mx-back" data-back>← 照片</button>
          <div class="mx-cover" aria-hidden="true">${PHOTOS.slice(0, 3).map((p, i) => `<span class="mx-img ${p.cls}" style="--r:${[-7, 5, 0][i]}deg"></span>`).join("")}</div>
          <p class="mono mx-eyebrow">ALBUM · 6 PHOTOS</p><h5 tabindex="-1" data-album-title>十月 · 在路上</h5>
          <p class="mx-copy">六个地方，从清晨到傍晚。相册已按拍摄时间排好。</p>
        </section>
      </div>`;
      const gridPage = body.querySelector("[data-grid-page]");
      const albumPage = body.querySelector("[data-album]");
      const tiles = [...body.querySelectorAll("[data-grid] .mx-img")];
      const make = body.querySelector("[data-make]");
      const rot = [-9, 6, -4, 8, -6, 3];
      const offsets = () => {
        const g = body.querySelector("[data-grid]").getBoundingClientRect();
        const cx = g.left + g.width / 2, cy = g.top + g.height / 2;
        return tiles.map((t) => { const r = t.getBoundingClientRect(); return { dx: cx - (r.left + r.width / 2), dy: cy - (r.top + r.height / 2) }; });
      };
      const run = (from, to, after) => {
        const d = offsets();
        let left = tiles.length;
        tiles.forEach((tile, i) => {
          const set = (p) => { tile.style.transform = `translate(${d[i].dx * p}px, ${d[i].dy * p}px) rotate(${rot[i] * p}deg) scale(${1 - .18 * p})`; };
          set(from);
          const go = () => spring(bag, { from, to, stiffness: 210, damping: 17, onUpdate: set, onDone: () => { if (--left === 0) after(); } });
          if (prefersReduced()) go(); else setTimeout(go, i * 30);
        });
      };
      bind(bag, make, "click", () => {
        make.disabled = true; say("正在收拢…");
        run(0, 1, () => {
          animate(gridPage, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).finished.then(() => {
            gridPage.hidden = true; albumPage.hidden = false;
            animate(albumPage, [{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(.22,.75,.25,1)" });
            body.querySelector("[data-album-title]").focus({ preventScroll: true });
            say("相册已生成");
          });
        });
      });
      bind(bag, body.querySelector("[data-back]"), "click", () => {
        albumPage.hidden = true; gridPage.hidden = false;
        animate(gridPage, [{ opacity: 0 }, { opacity: 1 }], { duration: 140 });
        run(1, 0, () => { make.disabled = false; make.focus({ preventScroll: true }); say("照片已散回原位"); });
      });
    }

    /* 4. Swipe to sort ------------------------------------------------------- */
    if (variant === "sort") {
      body.innerHTML = `<div class="mx-screen mx-sort-screen">
        <div class="mx-sort-head"><span>跳过 <b data-skip>0</b></span><span class="mono">SORT</span><span>保留 <b data-keep>0</b></span></div>
        <div class="mx-deck" data-deck tabindex="0" aria-label="分拣卡片，左方向键跳过，右方向键保留"></div>
        <div class="mx-row"><button type="button" class="stage-action ghost" data-act="skip">← 跳过</button><button type="button" class="stage-action ghost" data-undo disabled>撤销</button><button type="button" class="stage-action accent" data-act="keep">保留 →</button></div>
      </div>`;
      const deck = body.querySelector("[data-deck]");
      let queue = PHOTOS.slice(), history = [], counts = { skip: 0, keep: 0 }, motion = null, busy = false, dx = 0;
      const top = () => deck.querySelector(".mx-sort-card.top");
      const render = () => {
        if (!queue.length) { deck.innerHTML = `<p class="mx-empty">全部分完了。<br>保留 ${counts.keep} 张，跳过 ${counts.skip} 张。</p>`; }
        else deck.innerHTML = queue.slice(0, 3).reverse().map((p, i, arr) => {
          const depth = arr.length - 1 - i;
          return `<article class="mx-sort-card ${depth === 0 ? "top" : ""}" style="--d:${depth}"><span class="mx-img ${p.cls}"></span><b>${p.name}</b><small>${p.place}</small><em class="mx-tag skip">跳过</em><em class="mx-tag keep">保留</em></article>`;
        }).join("");
        body.querySelector("[data-skip]").textContent = counts.skip;
        body.querySelector("[data-keep]").textContent = counts.keep;
        body.querySelector("[data-undo]").disabled = !history.length;
        deck.setAttribute("aria-label", queue.length ? `当前「${T(queue[0].name)}」，左方向键跳过，右方向键保留` : "分拣完成");
      };
      const place = (x) => {
        dx = x;
        const card = top(); if (!card) return;
        const w = deck.clientWidth * .35;
        card.style.transform = `translateX(${x}px) rotate(${clamp(x / 14, -12, 12)}deg)`;
        card.querySelector(".mx-tag.keep").style.opacity = String(clamp(x / w, 0, 1));
        card.querySelector(".mx-tag.skip").style.opacity = String(clamp(-x / w, 0, 1));
      };
      const commit = (kind) => {
        const card = top(); if (!card || busy) return;
        busy = true; if (motion) motion.stop();
        const dir = kind === "keep" ? 1 : -1;
        animate(card, [{ transform: card.style.transform || "none", opacity: 1 }, { transform: `translateX(${dir * deck.clientWidth * 1.3}px) rotate(${dir * 24}deg)`, opacity: 0 }], { duration: 260, easing: "cubic-bezier(.4,0,1,1)" }).finished.then(() => {
          history.push({ item: queue.shift(), kind }); counts[kind] += 1; busy = false; render();
          say(kind === "keep" ? `已保留「${history[history.length - 1].item.name}」` : `已跳过「${history[history.length - 1].item.name}」`);
        });
      };
      drag(bag, deck, {
        start() { if (motion) motion.stop(); },
        move(x) { if (!busy) place(x); },
        end(x, vx) {
          if (!top() || busy) return;
          if (Math.abs(x) > deck.clientWidth * .35 || (Math.abs(vx) > .7 && Math.abs(x) > 24)) return commit((Math.abs(vx) > .7 ? vx : x) > 0 ? "keep" : "skip");
          motion = spring(bag, { from: x, to: 0, velocity: vx * 1000 * .4, stiffness: 320, damping: 15, onUpdate: place });
          say(Math.abs(x) > 30 ? "没拖够，已弹回" : "向左跳过，向右保留");
        }
      });
      bind(bag, body, "click", (event) => { const b = event.target.closest("[data-act]"); if (b) commit(b.dataset.act); });
      bind(bag, deck, "keydown", (event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); commit("keep"); }
        if (event.key === "ArrowLeft") { event.preventDefault(); commit("skip"); }
      });
      bind(bag, body.querySelector("[data-undo]"), "click", () => {
        const last = history.pop(); if (!last || busy) return;
        counts[last.kind] -= 1; queue.unshift(last.item); render();
        animate(top(), [{ transform: `translateX(${last.kind === "keep" ? 160 : -160}px) rotate(${last.kind === "keep" ? 14 : -14}deg)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.16,1.3,.3,1)" });
        say(`已撤销「${last.item.name}」`);
      });
      render();
    }

    /* 5. Title line-by-line ---------------------------------------------------- */
    if (variant === "title") {
      const chapters = [
        { lines: ["在海边", "等第一班", "日出"], label: "在海边等第一班日出", cls: "mx-ph-1", tab: "海" },
        { lines: ["把旧书", "一页一页", "读完"], label: "把旧书一页一页读完", cls: "mx-ph-2", tab: "书" },
        { lines: ["走到", "雪线以上", "再回头"], label: "走到雪线以上再回头", cls: "mx-ph-3", tab: "雪" }
      ];
      body.innerHTML = `<div class="mx-screen mx-title-screen">
        <div class="mx-hero mx-img ${chapters[0].cls}" data-hero aria-hidden="true"></div>
        <p class="mono mx-eyebrow" data-chapter>CHAPTER 01</p>
        <h5 class="mx-big" data-big aria-label="${chapters[0].label}"></h5>
        <div class="mx-tabs" role="group" aria-label="章节">${chapters.map((c, i) => `<button type="button" aria-pressed="${i === 0}" data-ch="${i}">${c.tab}</button>`).join("")}</div>
      </div>`;
      const big = body.querySelector("[data-big]");
      const hero = body.querySelector("[data-hero]");
      let index = 0, running = [], heroMotion = null;
      const lineHtml = (lines) => lines.map((l) => `<span class="mx-mask" aria-hidden="true"><span class="mx-line">${l}</span></span>`).join("");
      big.innerHTML = lineHtml(chapters[0].lines);
      const go = (next) => {
        if (next === index) return;
        running.forEach((a) => a.cancel()); running = [];
        if (heroMotion) heroMotion.stop();
        const c = chapters[next];
        index = next;
        body.querySelectorAll("[data-ch]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.ch === next)));
        body.querySelector("[data-chapter]").textContent = "CHAPTER 0" + (next + 1);
        big.setAttribute("aria-label", T(c.label));
        say(`第 ${next + 1} 章`);
        const old = [...big.querySelectorAll(".mx-line")];
        const outs = old.map((line, i) => animate(line, [{ transform: getComputedStyle(line).transform === "none" ? "translateY(0)" : getComputedStyle(line).transform }, { transform: "translateY(-110%)" }], { duration: 260, delay: i * 60, easing: "cubic-bezier(.4,0,.2,1)" }));
        running.push(...outs);
        const fade = animate(hero, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.9)" }], { duration: 220, easing: "ease-in" });
        running.push(fade);
        Promise.all(outs.map((a) => a.finished)).then(() => {
          if (index !== next) return;
          big.innerHTML = lineHtml(c.lines);
          running = [...big.querySelectorAll(".mx-line")].map((line, i) => animate(line, [{ transform: "translateY(110%)" }, { transform: "translateY(0)" }], { duration: 380, delay: i * 60, easing: "cubic-bezier(.22,.75,.25,1)" }));
          fade.cancel();
          hero.className = "mx-hero mx-img " + c.cls;
          heroMotion = spring(bag, { from: 0, to: 1, stiffness: 240, damping: 15, onUpdate: (p) => { hero.style.opacity = String(clamp(p, 0, 1)); hero.style.transform = `scale(${.9 + .1 * p})`; } });
        }, () => {});
      };
      bind(bag, body, "click", (event) => { const b = event.target.closest("[data-ch]"); if (b) go(+b.dataset.ch); });
    }

    /* 6. Album stack ------------------------------------------------------------ */
    if (variant === "album") {
      const items = PHOTOS.slice(0, 5);
      body.innerHTML = `<div class="mx-screen mx-album-screen">
        <p class="mono mx-eyebrow">ALBUMS</p><h5>相册</h5>
        <div class="mx-albums" data-stack tabindex="0" aria-label="相册卡片，左右方向键切换">
          ${items.map((p, i) => `<article class="mx-album-card" data-i="${i}"><span class="mx-img ${p.cls}"></span><b>${p.name}</b><small>${p.place}<span> · ${12 + i * 7} 张照片</span></small></article>`).join("")}
        </div>
        <div class="mx-dots" data-dots>${items.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>
        <div class="mx-row"><button type="button" class="stage-action ghost" data-prev>← 上一本</button><span class="mono mx-count" data-count>01 / 05</span><button type="button" class="stage-action accent" data-next>下一本 →</button></div>
      </div>`;
      const stack = body.querySelector("[data-stack]");
      const cards = [...stack.querySelectorAll(".mx-album-card")];
      let order = cards.map((_, i) => i), busy = false;
      const ROT = [0, -3, 3, -2, 2];
      const layout = (instant) => {
        order.forEach((i, depth) => {
          const card = cards[i];
          card.style.transition = instant || prefersReduced() ? "none" : `transform .52s cubic-bezier(.16,1.3,.3,1) ${depth * 45}ms`;
          card.style.transform = `translateY(${depth * 12}px) scale(${1 - depth * .05}) rotate(${ROT[depth]}deg)`;
          card.style.zIndex = String(10 - depth);
          card.setAttribute("aria-hidden", String(depth !== 0));
        });
        const top = order[0];
        body.querySelectorAll("[data-dots] i").forEach((dot, j) => dot.classList.toggle("on", j === top));
        body.querySelector("[data-count]").textContent = `0${top + 1} / 0${items.length}`;
        say(`相册 ${top + 1} / ${items.length} · ${items[top].name}`);
      };
      const next = (dir, fromX) => {
        if (busy) return;
        busy = true;
        if (dir > 0) {
          const card = cards[order[0]];
          card.style.transition = "none";
          animate(card, [{ transform: `translateX(${fromX || 0}px) rotate(${(fromX || 0) / 18}deg)` }, { transform: `translateX(${(fromX < 0 ? -1 : 1) * 260}px) rotate(${(fromX < 0 ? -1 : 1) * 16}deg)` }], { duration: 200, easing: "ease-in", fill: "none" }).finished.then(() => {
            order.push(order.shift()); layout(); busy = false;
          });
        } else { order.unshift(order.pop()); layout(); busy = false; }
      };
      let dragX = 0;
      drag(bag, stack, {
        start() { dragX = 0; },
        move(x) {
          if (busy) return;
          dragX = x;
          const card = cards[order[0]];
          card.style.transition = "none";
          card.style.transform = `translateX(${x}px) rotate(${x / 18}deg)`;
        },
        end(x, vx) {
          if (busy) return;
          if (Math.abs(x) > 90 || Math.abs(vx) > .6) next(1, x);
          else layout();
        }
      });
      bind(bag, body.querySelector("[data-next]"), "click", () => next(1, 0));
      bind(bag, body.querySelector("[data-prev]"), "click", () => next(-1));
      bind(bag, stack, "keydown", (event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); next(1, 0); }
        if (event.key === "ArrowLeft") { event.preventDefault(); next(-1); }
      });
      layout(true);
    }

    /* 7. List card lift -> detail -------------------------------------------- */
    if (variant === "lift") {
      const items = PHOTOS.slice(0, 4);
      body.innerHTML = `<div class="mx-screen" data-screen>
        <section class="mx-page mx-lift-list" data-list>
          <p class="mono mx-eyebrow">STORIES</p><h5>本周故事</h5>
          ${items.map((p, i) => `<button type="button" class="mx-lift-card" data-i="${i}"><span class="mx-img ${p.cls}"></span><span><b>${p.name}</b><small>${p.place}</small></span></button>`).join("")}
        </section>
        <section class="mx-lift-detail" data-detail hidden>
          <span class="mx-img" data-detail-img></span>
          <button type="button" class="mx-back mx-lift-back" data-back>← 返回</button>
          <div class="mx-lift-copy" data-copy>
            <h5 tabindex="-1" data-detail-title></h5><small data-detail-place></small>
            <p class="mx-copy">这张照片是在路上随手拍的。点返回，它会落回列表里原来的位置。</p>
          </div>
        </section>
      </div>`;
      const screen = body.querySelector("[data-screen]");
      const list = body.querySelector("[data-list]");
      const detail = body.querySelector("[data-detail]");
      const copy = body.querySelector("[data-copy]");
      let busy = false, current = null;
      const rect = (el) => { const a = el.getBoundingClientRect(), b = screen.getBoundingClientRect(); return { left: a.left - b.left + "px", top: a.top - b.top + "px", width: a.width + "px", height: a.height + "px" }; };
      const full = () => ({ left: "0px", top: "0px", width: screen.clientWidth + "px", height: screen.clientHeight + "px" });
      const open = (card) => {
        if (busy) return;
        busy = true; current = card;
        const p = items[+card.dataset.i];
        card.classList.add("lifted");
        list.classList.add("dimmed");
        body.querySelector("[data-detail-img]").className = "mx-img " + p.cls;
        body.querySelector("[data-detail-title]").textContent = p.name;
        body.querySelector("[data-detail-place]").textContent = p.place;
        setTimeout(() => {
          const from = Object.assign(rect(card), { borderRadius: "14px" });
          detail.hidden = false;
          animate(copy, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 0, transform: "translateY(12px)", offset: .5 }, { opacity: 1, transform: "none" }], { duration: 440 });
          animate(detail, [from, Object.assign(full(), { borderRadius: "0px" })], { duration: 400, easing: "cubic-bezier(.22,.75,.25,1)" }).finished.then(() => {
            busy = false; body.querySelector("[data-detail-title]").focus({ preventScroll: true });
            say(`已打开「${p.name}」`);
          });
        }, prefersReduced() ? 0 : 190);
      };
      const close = () => {
        if (busy || !current) return;
        busy = true;
        current.classList.remove("lifted");
        const to = Object.assign(rect(current), { borderRadius: "14px" });
        animate(copy, [{ opacity: 1 }, { opacity: 0 }], { duration: 140 });
        animate(detail, [Object.assign(full(), { borderRadius: "0px" }), to], { duration: 460, easing: "cubic-bezier(.16,1.25,.3,1)" }).finished.then(() => {
          detail.hidden = true;
          detail.getAnimations().forEach((a) => a.cancel());
          list.classList.remove("dimmed");
          busy = false; current.focus({ preventScroll: true });
          say("已落回列表原位");
        });
      };
      bind(bag, list, "click", (event) => { const c = event.target.closest(".mx-lift-card"); if (c) open(c); });
      bind(bag, body.querySelector("[data-back]"), "click", close);
      bind(bag, screen, "keydown", (event) => { if (event.key === "Escape" && !detail.hidden) close(); });
    }

    return () => bag.splice(0).forEach((fn) => { try { fn(); } catch (error) { /* already gone */ } });
  };
})();

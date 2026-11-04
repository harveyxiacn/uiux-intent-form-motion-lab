/* Light neumorphism component scenes for the web prompts in family 「新拟态组件」.
   Same contract as scenes.js: S.neuLab(root, variant, ctx) renders into root and returns a teardown.
   Depth (raised / pressed) carries state, but every state is also written as text or an icon,
   because soft same-colour shadows alone are too faint to be the only signal. */
(function () {
  "use strict";

  const S = (window.LAB_SCENES = window.LAB_SCENES || {});
  const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(.25,.8,.25,1)";
  const DUR = 600;

  function shell(root, o) {
    root.innerHTML = `
      <div class="scene nu-scene">
        <div class="scene-head">
          <div><p class="scene-kicker">${o.kicker}</p><h4 class="scene-title">${o.title}</h4></div>
          <p class="scene-note">${o.note}</p>
        </div>
        <div class="scene-body"><div class="nu-board"></div></div>
        <p class="scene-status" data-status aria-live="polite">${o.status}</p>
      </div>`;
    const scene = root.querySelector(".scene");
    return { body: scene.querySelector(".nu-board"), status: scene.querySelector("[data-status]") };
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
  }

  function animate(el, frames, options) {
    if (!el || prefersReduced()) return { finished: Promise.resolve(), cancel() {} };
    return el.animate(frames, Object.assign({ duration: DUR, easing: EASE }, options));
  }

  /* Press = sink into the surface, then rebound past flat and settle. */
  function press(el) {
    el.classList.remove("nu-rebound");
    void el.offsetWidth;
    el.classList.add("nu-rebound");
  }

  const CHECK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  S.neuLab = function (root, variant) {
    const bag = [];
    const meta = {
      light: ["WEB / NEUMORPHISM", "灯光开关", "按下滑块下沉<br>松开回弹并切换灯光", "灯光 Off"],
      thermo: ["WEB / NEUMORPHISM", "温度调节旋钮", "拖动旋钮或用方向键<br>16–30℃", "当前 22℃"],
      player: ["WEB / NEUMORPHISM", "新拟态播放器", "点凸起的播放键<br>频谱和进度一起动", "已暂停"],
      upload: ["WEB / NEUMORPHISM", "文件上传", "点内凹入口<br>文件收拢、进度填满", "3 个文件待上传"],
      booking: ["WEB / NEUMORPHISM", "预约组件", "选一天<br>再选一个时段", "请选择日期"],
      quantity: ["WEB / NEUMORPHISM", "数量调节", "点凸起的加减<br>数量和金额一起变", "数量 1 · ¥39"]
    }[variant] || ["WEB / NEUMORPHISM", "新拟态组件", "", ""];
    const ui = shell(root, { kicker: meta[0], title: meta[1], note: meta[2], status: meta[3] });
    const body = ui.body;
    const say = (text) => { ui.status.textContent = text; };

    /* 1. Light switch: the knob sinks while held, slides on release ----------------------- */
    if (variant === "light") {
      body.innerHTML = `<div class="nu-card nu-light" data-room>
        <span class="nu-bulb" aria-hidden="true"></span>
        <p class="nu-label">客厅主灯</p>
        <button type="button" class="nu-switch" role="switch" aria-checked="false" aria-label="客厅主灯" data-switch><i class="nu-knob" aria-hidden="true"></i></button>
        <b class="nu-state" data-state>Off</b>
      </div>`;
      const room = body.querySelector("[data-room]");
      const sw = body.querySelector("[data-switch]");
      const set = (on) => {
        sw.setAttribute("aria-checked", String(on));
        room.classList.toggle("on", on);
        body.querySelector("[data-state]").textContent = on ? "On" : "Off";
        say(on ? "灯光 On" : "灯光 Off");
      };
      bind(bag, sw, "pointerdown", () => sw.classList.add("held"));
      ["pointerup", "pointerleave", "pointercancel"].forEach((t) => bind(bag, sw, t, () => sw.classList.remove("held")));
      bind(bag, sw, "click", () => { set(sw.getAttribute("aria-checked") !== "true"); press(sw); });
    }

    /* 2. Thermostat knob: dot, arc and number follow the drag --------------------------- */
    if (variant === "thermo") {
      const MIN = 16, MAX = 30, SWEEP = 270, R = 84, LEN = 2 * Math.PI * R * SWEEP / 360;
      let t = 22;
      const ticks = Array.from({ length: MAX - MIN + 1 }, (_, i) => {
        const a = (-135 + i * SWEEP / (MAX - MIN)) * Math.PI / 180;
        return `<line x1="${110 + Math.sin(a) * 98}" y1="${110 - Math.cos(a) * 98}" x2="${110 + Math.sin(a) * (i % 2 ? 103 : 106)}" y2="${110 - Math.cos(a) * (i % 2 ? 103 : 106)}"/>`;
      }).join("");
      body.innerHTML = `<div class="nu-card nu-thermo">
        <div class="nu-dial" data-dial role="slider" tabindex="0" aria-label="目标温度" aria-valuemin="${MIN}" aria-valuemax="${MAX}" aria-valuenow="${t}" aria-valuetext="${t}℃">
          <svg viewBox="0 0 220 220" aria-hidden="true">
            <g class="nu-ticks">${ticks}</g>
            <circle class="nu-track" cx="110" cy="110" r="${R}" stroke-dasharray="${LEN} 999" transform="rotate(135 110 110)"/>
            <circle class="nu-arc" data-arc cx="110" cy="110" r="${R}" stroke-dasharray="0 999" transform="rotate(135 110 110)"/>
          </svg>
          <div class="nu-knob-face" data-face><i class="nu-dot" aria-hidden="true"></i></div>
          <div class="nu-temp"><b data-num>${t}</b><span>℃</span></div>
        </div>
        <div class="nu-row"><button type="button" class="nu-btn" data-down aria-label="降低 1℃">−</button><span class="nu-mode" data-mode>舒适</span><button type="button" class="nu-btn" data-up aria-label="升高 1℃">+</button></div>
      </div>`;
      const dial = body.querySelector("[data-dial]");
      const face = body.querySelector("[data-face]");
      const arc = body.querySelector("[data-arc]");
      const set = (v, quiet) => {
        t = Math.max(MIN, Math.min(MAX, Math.round(v)));
        const f = (t - MIN) / (MAX - MIN);
        face.style.transform = `rotate(${-135 + f * SWEEP}deg)`;
        arc.setAttribute("stroke-dasharray", `${f * LEN} 999`);
        body.querySelector("[data-num]").textContent = t;
        body.querySelector("[data-mode]").textContent = t <= 19 ? "凉爽" : t >= 26 ? "温暖" : "舒适";
        dial.setAttribute("aria-valuenow", t);
        dial.setAttribute("aria-valuetext", `${t}℃`);
        if (!quiet) say(`当前 ${t}℃`);
      };
      const fromPointer = (event) => {
        const r = dial.getBoundingClientRect();
        let a = Math.atan2(event.clientX - (r.left + r.width / 2), -(event.clientY - (r.top + r.height / 2))) * 180 / Math.PI; // 0 at top, clockwise
        if (a > 135 && a <= 180) a = 135; if (a < -135 || a > 180) a = -135; // dead zone at the bottom
        set(MIN + (a + 135) / SWEEP * (MAX - MIN));
      };
      let id = null;
      bind(bag, dial, "pointerdown", (event) => { id = event.pointerId; dial.setPointerCapture(id); dial.classList.add("drag"); fromPointer(event); });
      bind(bag, dial, "pointermove", (event) => { if (event.pointerId === id) fromPointer(event); });
      const end = (event) => { if (event.pointerId === id) { id = null; dial.classList.remove("drag"); } };
      bind(bag, dial, "pointerup", end); bind(bag, dial, "pointercancel", end);
      bind(bag, dial, "keydown", (event) => {
        const k = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 3, PageDown: -3 }[event.key];
        if (k) { event.preventDefault(); set(t + k); }
        if (event.key === "Home") { event.preventDefault(); set(MIN); }
        if (event.key === "End") { event.preventDefault(); set(MAX); }
      });
      bind(bag, body.querySelector("[data-down]"), "click", (e) => { press(e.currentTarget); set(t - 1); });
      bind(bag, body.querySelector("[data-up]"), "click", (e) => { press(e.currentTarget); set(t + 1); });
      set(t, true);
    }

    /* 3. Player: spectrum + progress run while playing, spectrum retracts on pause ------- */
    if (variant === "player") {
      const LENGTH = 214; // seconds
      let pos = 48, playing = false, raf = 0, last = 0;
      body.innerHTML = `<div class="nu-card nu-player">
        <div class="nu-cover" aria-hidden="true"><span class="mx-img mx-ph-1"></span></div>
        <p class="nu-label">海边的早晨</p><small class="nu-sub">实验室乐队 · Lo-fi</small>
        <div class="nu-spectrum" data-spec aria-hidden="true">${Array.from({ length: 18 }, () => "<i></i>").join("")}</div>
        <div class="nu-progress" aria-hidden="true"><i data-bar></i></div>
        <div class="nu-times mono"><span data-pos>0:48</span><span>3:34</span></div>
        <div class="nu-row">
          <button type="button" class="nu-btn" data-back aria-label="后退 10 秒">↺</button>
          <button type="button" class="nu-btn nu-play" data-play aria-label="播放"><span data-icon>▶</span></button>
          <button type="button" class="nu-btn" data-fwd aria-label="前进 10 秒">↻</button>
        </div>
      </div>`;
      const spec = body.querySelector("[data-spec]");
      const bars = [...spec.children];
      const btn = body.querySelector("[data-play]");
      const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
      const draw = () => {
        body.querySelector("[data-bar]").style.transform = `scaleX(${pos / LENGTH})`;
        body.querySelector("[data-pos]").textContent = fmt(pos);
      };
      const tick = (time) => {
        const dt = last ? (time - last) / 1000 : 0; last = time;
        pos = Math.min(LENGTH, pos + dt);
        bars.forEach((b, i) => { b.style.transform = `scaleY(${.25 + .75 * Math.abs(Math.sin(time / (260 + i * 37) + i))})`; });
        draw();
        if (pos >= LENGTH) { toggle(false); say("播放结束"); return; }
        raf = requestAnimationFrame(tick);
      };
      const toggle = (on) => {
        playing = on;
        cancelAnimationFrame(raf); last = 0;
        btn.setAttribute("aria-label", on ? "暂停" : "播放");
        btn.classList.toggle("pressed", on);
        body.querySelector("[data-icon]").textContent = on ? "❚❚" : "▶";
        spec.classList.toggle("live", on);
        if (on) { if (pos >= LENGTH) pos = 0; raf = requestAnimationFrame(tick); say("播放中"); }
        else { bars.forEach((b) => { b.style.transform = ""; }); say("已暂停"); }
      };
      bag.push(() => cancelAnimationFrame(raf));
      bind(bag, btn, "click", () => { press(btn); toggle(!playing); });
      bind(bag, body.querySelector("[data-back]"), "click", (e) => { press(e.currentTarget); pos = Math.max(0, pos - 10); draw(); });
      bind(bag, body.querySelector("[data-fwd]"), "click", (e) => { press(e.currentTarget); pos = Math.min(LENGTH, pos + 10); draw(); });
      draw();
    }

    /* 4. Upload: files gather into the well, progress fills, check, rebound to idle ------- */
    if (variant === "upload") {
      const FILES = [["行程单.pdf", "1.2 MB"], ["海边.jpg", "3.4 MB"], ["预算.xlsx", "86 KB"]];
      let busy = false;
      body.innerHTML = `<div class="nu-card nu-upload">
        <div class="nu-files" data-files>${FILES.map((f, i) => `<div class="nu-file" data-i="${i}"><b>${f[0]}</b><small>${f[1]}</small></div>`).join("")}</div>
        <button type="button" class="nu-well" data-go><span class="nu-well-icon" data-icon aria-hidden="true">↑</span><span data-text>点这里上传 3 个文件</span></button>
        <div class="nu-progress" role="progressbar" aria-label="上传进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-progress><i data-bar></i></div>
        <p class="nu-sub" data-pct>0%</p>
      </div>`;
      const well = body.querySelector("[data-go]");
      const cards = [...body.querySelectorAll(".nu-file")];
      const bar = body.querySelector("[data-bar]");
      const prog = body.querySelector("[data-progress]");
      const setPct = (p) => { bar.style.transform = `scaleX(${p / 100})`; prog.setAttribute("aria-valuenow", p); body.querySelector("[data-pct]").textContent = `${p}%`; };
      bind(bag, well, "click", () => {
        if (busy) return;
        busy = true; press(well);
        well.setAttribute("aria-disabled", "true");
        body.querySelector("[data-text]").textContent = "上传中…";
        say("正在上传 3 个文件");
        const wr = well.getBoundingClientRect();
        cards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const dx = wr.left + wr.width / 2 - (r.left + r.width / 2), dy = wr.top + wr.height / 2 - (r.top + r.height / 2);
          animate(card, [{ transform: "none", opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: 0 }], { delay: 110 * i, fill: "forwards" });
        });
        let p = 0;
        const step = () => {
          p = Math.min(100, p + 7 + Math.round(Math.random() * 6));
          setPct(p);
          if (p < 100) { later(bag, step, 90); return; }
          well.classList.add("done");
          body.querySelector("[data-icon]").innerHTML = CHECK;
          body.querySelector("[data-text]").textContent = "上传完成";
          say("3 个文件已上传");
          // hold the success state, then rebound back to an empty uploader
          later(bag, () => {
            well.classList.remove("done"); press(well);
            cards.forEach((card, i) => { card.getAnimations().forEach((a) => a.cancel()); animate(card, [{ transform: "scale(.6)", opacity: 0 }, { transform: "scale(1.04)", opacity: 1, offset: .7 }, { transform: "none", opacity: 1 }], { delay: 80 * i, fill: "backwards" }); });
            body.querySelector("[data-icon]").textContent = "↑";
            body.querySelector("[data-text]").textContent = "点这里上传 3 个文件";
            well.removeAttribute("aria-disabled");
            setPct(0); busy = false;
            say("已复位，可再次上传");
          }, 1600);
        };
        later(bag, step, 450);
      });
    }

    /* 5. Booking: pick a day -> time slots expand -> pick a slot -> result scales in ------- */
    if (variant === "booking") {
      const DAYS = [["周一", 10], ["周二", 11], ["周三", 12], ["周四", 13], ["周五", 14]];
      const SLOTS = ["09:30", "11:00", "14:00", "16:30"];
      const FULL = { "11-11:00": true, "13-09:30": true };
      let day = null, slot = null;
      body.innerHTML = `<div class="nu-card nu-booking">
        <p class="nu-label">预约看展 · 11 月</p>
        <div class="nu-days" role="group" aria-label="选择日期">${DAYS.map((d) => `<button type="button" class="nu-day" data-day="${d[1]}" aria-pressed="false"><small>${d[0]}</small><b>${d[1]}</b></button>`).join("")}</div>
        <div class="nu-expand" data-slots-wrap><div><div class="nu-slots" role="group" aria-label="选择时段" data-slots></div></div></div>
        <div class="nu-expand" data-result-wrap><div><div class="nu-result" data-result></div></div></div>
      </div>`;
      const slotsWrap = body.querySelector("[data-slots-wrap]");
      const resultWrap = body.querySelector("[data-result-wrap]");
      slotsWrap.setAttribute("inert", ""); resultWrap.setAttribute("inert", "");
      const showResult = () => {
        const on = !!slot;
        resultWrap.classList.toggle("open", on);
        if (on) resultWrap.removeAttribute("inert"); else resultWrap.setAttribute("inert", "");
        if (on) {
          const r = body.querySelector("[data-result]");
          r.innerHTML = `<span class="nu-ok" aria-hidden="true">${CHECK}</span><span><b>已预约 11 月 ${day} 日 ${slot}</b><small>请提前 15 分钟到场，凭手机号入场</small></span><button type="button" class="nu-link" data-cancel>取消</button>`;
          animate(r, [{ transform: "scale(.9)", opacity: 0 }, { transform: "none", opacity: 1 }]);
          say(`已预约 11 月 ${day} 日 ${slot}`);
        }
      };
      const drawSlots = () => {
        body.querySelector("[data-slots]").innerHTML = SLOTS.map((s) => {
          const full = FULL[`${day}-${s}`];
          return `<button type="button" class="nu-slot" data-slot="${s}" aria-pressed="${slot === s}" ${full ? "disabled" : ""}>${s}${full ? "<small>已满</small>" : ""}</button>`;
        }).join("");
      };
      bind(bag, body.querySelector(".nu-days"), "click", (event) => {
        const b = event.target.closest("[data-day]"); if (!b) return;
        press(b);
        const d = +b.dataset.day;
        day = day === d ? null : d; slot = null;
        body.querySelectorAll("[data-day]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.day === day)));
        if (day) drawSlots();
        slotsWrap.classList.toggle("open", !!day);
        if (day) slotsWrap.removeAttribute("inert"); else slotsWrap.setAttribute("inert", "");
        showResult();
        say(day ? `11 月 ${day} 日 · 请选择时段` : "请选择日期");
      });
      bind(bag, body.querySelector("[data-slots]"), "click", (event) => {
        const b = event.target.closest("[data-slot]"); if (!b || b.disabled) return;
        press(b);
        slot = slot === b.dataset.slot ? null : b.dataset.slot;
        body.querySelectorAll("[data-slot]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.slot === slot)));
        showResult();
        if (!slot) say(`11 月 ${day} 日 · 请选择时段`);
      });
      bind(bag, resultWrap, "click", (event) => {
        if (!event.target.closest("[data-cancel]")) return;
        slot = null; drawSlots(); showResult();
        body.querySelector("[data-slot]:not(:disabled)").focus();
        say("已取消预约");
      });
    }

    /* 6. Quantity: raised +/- sink and rebound, amount follows, edges disable ------------ */
    if (variant === "quantity") {
      const PRICE = 39, MIN = 1, MAX = 9;
      let n = 1;
      body.innerHTML = `<div class="nu-card nu-qty">
        <div class="nu-cover nu-cup" aria-hidden="true"><span class="mx-img mx-ph-2"></span></div>
        <p class="nu-label">手冲咖啡豆 · 200g</p><small class="nu-sub">单价 ¥${PRICE} · 限购 ${MAX} 袋</small>
        <div class="nu-row nu-qty-row" role="group" aria-label="购买数量">
          <button type="button" class="nu-btn" data-minus aria-label="减少一袋">−</button>
          <output class="nu-count" data-n aria-live="off">1</output>
          <button type="button" class="nu-btn" data-plus aria-label="增加一袋">+</button>
        </div>
        <p class="nu-sum">合计 <b data-sum>¥${PRICE}</b></p>
      </div>`;
      const minus = body.querySelector("[data-minus]");
      const plus = body.querySelector("[data-plus]");
      const sync = () => {
        minus.disabled = n <= MIN; plus.disabled = n >= MAX;
        body.querySelector("[data-n]").textContent = n;
        body.querySelector("[data-sum]").textContent = `¥${n * PRICE}`;
        animate(body.querySelector("[data-sum]"), [{ transform: "scale(1.12)" }, { transform: "none" }], { duration: 360 });
        say(n === MIN ? `数量 ${n} · ¥${n * PRICE} · 已到下限` : n === MAX ? `数量 ${n} · ¥${n * PRICE} · 已到上限` : `数量 ${n} · ¥${n * PRICE}`);
      };
      const change = (d, b) => {
        press(b);
        const next = Math.max(MIN, Math.min(MAX, n + d));
        if (next === n) return;
        n = next; sync();
        if (b.disabled) (d > 0 ? minus : plus).focus();
      };
      bind(bag, minus, "click", () => change(-1, minus));
      bind(bag, plus, "click", () => change(1, plus));
      minus.disabled = true;
    }

    return () => bag.splice(0).forEach((fn) => { try { fn(); } catch (error) { /* already gone */ } });
  };
})();

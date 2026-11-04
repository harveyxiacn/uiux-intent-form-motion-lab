(function () {
  "use strict";

  const S = (window.LAB_SCENES = window.LAB_SCENES || {});
  const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  function shell(root, options) {
    const o = options || {};
    root.innerHTML = `
      <div class="scene ${o.className || ""}">
        <div class="scene-head">
          <div><p class="scene-kicker">${escapeHtml(o.kicker || "MOBILE / LAB")}</p><h4 class="scene-title">${escapeHtml(o.title || "")}</h4></div>
          <p class="scene-note">${o.note || ""}</p>
        </div>
        <div class="scene-body"></div>
        <p class="scene-status" data-status aria-live="off">${escapeHtml(o.status || "直接操作预览 · 键盘可用")}</p>
      </div>`;
    const scene = root.querySelector(".scene");
    return { scene, body: scene.querySelector(".scene-body"), status: scene.querySelector("[data-status]") };
  }

  function setStatus(ui, text) {
    if (ui && ui.status) ui.status.textContent = text;
  }

  function bind(bag, target, type, handler, options) {
    target.addEventListener(type, handler, options);
    bag.push(() => target.removeEventListener(type, handler, options));
  }

  function timer(bag, fn, delay) {
    const id = setTimeout(fn, delay);
    bag.push(() => clearTimeout(id));
    return id;
  }

  function raf(bag, fn) {
    let id = 0;
    const loop = (time) => { fn(time); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    bag.push(() => cancelAnimationFrame(id));
  }

  function animate(el, frames, options) {
    if (!el || prefersReduced()) return { finished: Promise.resolve(), cancel() {} };
    return el.animate(frames, Object.assign({ fill: "both" }, options));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function makeButton(label, className, attrs) {
    return `<button type="button" class="${className || "stage-action"}" ${attrs || ""}>${label}</button>`;
  }

  /* ============================================================
     1. THEME REVEAL
     ============================================================ */
  S.themeReveal = function (root, variant) {
    const bag = [];
    const ui = shell(root, {
      kicker: "APP / THEME",
      title: "触点扩散换主题",
      note: variant === "switch" ? "点下面的开关<br>光线从开关长出来" : "点手机里的任意位置<br>深色从触点扩散",
      status: "浅色主题 · 从触点开始"
    });
    ui.body.innerHTML = `
      <div class="tr-phone" data-mode="light">
        <div class="tr-screen">
          <div class="tr-meta"><span>09:41</span><span>WED 28</span></div>
          <div class="tr-avatar" aria-hidden="true"><span></span></div>
          <h5>晚上好，林。</h5>
          <p class="tr-sub">今天想先做哪件事？</p>
          <div class="tr-tiles">
            <div class="tr-tile"><b>25</b><span>分钟专注</span><i style="--w:72%"></i></div>
            <div class="tr-tile"><b>03</b><span>件待办</span><i style="--w:44%"></i></div>
          </div>
          <div class="tr-rows">
            <div class="tr-row"><span>夜间提醒</span><em>22:30</em></div>
            <div class="tr-row"><span>本周节奏</span><em>稳定</em></div>
          </div>
          ${variant === "switch"
            ? `<button type="button" class="tr-switch" role="switch" aria-checked="false"><span class="tr-knob"></span><em>深色模式</em></button>`
            : `<button type="button" class="tr-switch" role="switch" aria-checked="false"><span class="tr-knob"></span><em>深色模式</em></button>`}
        </div>
        <div class="tr-ripple" aria-hidden="true"></div>
        <div class="tr-tapnote" aria-hidden="true">点击任意位置</div>
      </div>`;
    const phone = ui.body.querySelector(".tr-phone");
    const screen = ui.body.querySelector(".tr-screen");
    const ripple = ui.body.querySelector(".tr-ripple");
    const toggle = ui.body.querySelector(".tr-switch");
    const note = ui.body.querySelector(".tr-tapnote");
    let dark = false;
    let busy = false;

    const palette = () => dark ? { bg: "#f3f0e7", fg: "#181914" } : { bg: "#171813", fg: "#f0ede2" };

    function commit(next, x, y) {
      dark = next;
      phone.dataset.mode = dark ? "dark" : "light";
      toggle.setAttribute("aria-checked", String(dark));
      toggle.querySelector("em").textContent = dark ? "浅色模式" : "深色模式";
      note.textContent = dark ? "再点一次收回" : "点击任意位置";
      setStatus(ui, (dark ? "深色" : "浅色") + "主题 · 从 " + Math.round(x) + "," + Math.round(y) + " 扩散");
      ripple.style.clipPath = "circle(0px at 50% 50%)";
      ripple.style.background = "transparent";
    }

    function reveal(x, y) {
      if (busy) return;
      if (prefersReduced()) {
        commit(!dark, x, y);
        return;
      }
      busy = true;
      const target = palette();
      ripple.style.background = target.bg;
      ripple.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      const far = Math.hypot(Math.max(x, phone.clientWidth - x), Math.max(y, phone.clientHeight - y)) + 40;
      const anim = ripple.animate([
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${far}px at ${x}px ${y}px)` }
      ], { duration: 560, easing: "cubic-bezier(.22,.75,.25,1)", fill: "forwards" });
      anim.finished.then(() => {
        commit(!dark, x, y);
        busy = false;
      }).catch(() => { busy = false; });
    }

    function pointFromEvent(event) {
      const rect = phone.getBoundingClientRect();
      return [clamp(event.clientX - rect.left, 0, rect.width), clamp(event.clientY - rect.top, 0, rect.height)];
    }

    bind(bag, phone, "pointerdown", (event) => {
      if (event.target.closest(".tr-switch") && variant === "tap") return;
      const [x, y] = pointFromEvent(event);
      reveal(x, y);
    });
    bind(bag, toggle, "click", (event) => {
      event.stopPropagation();
      const rect = toggle.getBoundingClientRect();
      const box = phone.getBoundingClientRect();
      reveal(rect.left - box.left + rect.width / 2, rect.top - box.top + rect.height / 2);
    });
    bind(bag, toggle, "keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggle.click();
      }
    });
    // Prevent double activation from pointerdown + click on the switch in tap mode.
    bind(bag, screen, "click", (event) => {
      if (event.target.closest(".tr-switch")) event.stopPropagation();
    });
    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     2. SORT LAB
     ============================================================ */
  const SORT_ITEMS = [
    { id: "a", title: "项目简报", meta: "今天 14:00" },
    { id: "b", title: "首页改版", meta: "进行中" },
    { id: "c", title: "周报草稿", meta: "明天" },
    { id: "d", title: "灵感收集", meta: "12 条" },
    { id: "e", title: "客户回访", meta: "周五" }
  ];

  S.sortLab = function (root, variant) {
    const bag = [];
    const isSnap = variant === "snap";
    const isFavorite = variant === "favorite";
    const ui = shell(root, {
      kicker: "MOBILE / DRAG",
      title: isSnap ? "拖动吸附参考线" : isFavorite ? "拖过分隔线固定" : "拖拽排序，其余让位",
      note: isSnap ? "拖动方块靠近虚线<br>进入阈值会自动吸附" : "按住任意一行拖动<br>松手落到可预测的位置",
      status: "按住一行，向上或向下拖动"
    });

    if (isSnap) {
      ui.body.innerHTML = `
        <div class="snap-stage" tabindex="0" aria-label="可拖动的方块，方向键移动">
          <div class="snap-guide" data-x="24"></div><div class="snap-guide" data-x="50"></div><div class="snap-guide" data-x="76"></div>
          <div class="snap-block" style="left:24%;top:42%"><span>8pt</span></div>
          <p class="snap-hint">方向键微调 · Shift + 方向键 1px</p>
        </div>`;
      const stage = ui.body.querySelector(".snap-stage");
      const block = ui.body.querySelector(".snap-block");
      const guides = Array.from(ui.body.querySelectorAll(".snap-guide"));
      let x = 24;
      let y = 42;
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let originX = 0;
      let originY = 0;
      const render = () => {
        block.style.left = x + "%";
        block.style.top = y + "%";
      };
      const snap = (value, axis) => {
        let best = null;
        let distance = Infinity;
        [24, 50, 76].forEach((guide) => {
          const d = Math.abs(value - guide);
          if (d < distance) { distance = d; best = guide; }
        });
        if (distance <= 4) {
          guides.forEach((g) => g.classList.toggle("live", Number(g.dataset.x) === best));
          setStatus(ui, "吸附到 " + best + "% 参考线" + (axis === "x" ? " · 水平" : " · 垂直"));
          return best;
        }
        guides.forEach((g) => g.classList.remove("live"));
        setStatus(ui, "自由位置 · " + Math.round(value) + "%");
        return value;
      };
      bind(bag, stage, "pointerdown", (event) => {
        if (event.target.closest(".snap-block")) {
          dragging = true;
          startX = event.clientX;
          startY = event.clientY;
          originX = x;
          originY = y;
          block.classList.add("dragging");
          stage.setPointerCapture(event.pointerId);
        }
      });
      bind(bag, stage, "pointermove", (event) => {
        if (!dragging) return;
        const rect = stage.getBoundingClientRect();
        x = clamp(originX + (event.clientX - startX) / rect.width * 100, 3, 97);
        y = clamp(originY + (event.clientY - startY) / rect.height * 100, 8, 92);
        render();
        snap(x, "x");
        snap(y, "y");
      });
      const end = () => {
        if (!dragging) return;
        dragging = false;
        block.classList.remove("dragging");
        const sx = snap(x, "x");
        const sy = snap(y, "y");
        if (sx !== x || sy !== y) {
          const fromX = x;
          const fromY = y;
          const anim = animate(block, [
            { transform: "translate(-50%,-50%) scale(1.02)" },
            { transform: "translate(-50%,-50%) scale(.96)" },
            { transform: "translate(-50%,-50%) scale(1)" }
          ], { duration: 220, easing: "cubic-bezier(.16,1.3,.3,1)" });
          x = sx; y = sy; render();
          void fromX; void fromY; void anim;
        }
      };
      bind(bag, stage, "pointerup", end);
      bind(bag, stage, "pointercancel", end);
      bind(bag, stage, "keydown", (event) => {
        const step = event.shiftKey ? 1 : 4;
        const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        const delta = map[event.key];
        if (!delta) return;
        event.preventDefault();
        x = clamp(x + delta[0], 3, 97);
        y = clamp(y + delta[1], 8, 92);
        render();
        snap(x, "x");
        snap(y, "y");
      });
      return () => bag.forEach((fn) => fn());
    }

    ui.body.innerHTML = `
      <div class="sort-wrap">
        <div class="sort-fixed" ${isFavorite ? "" : "hidden"}>
          <p class="sort-zone-label">常用</p>
          <div class="sort-list" data-zone="fixed"></div>
          <div class="sort-divider" data-divider><span>拖到这里固定</span></div>
        </div>
        <div class="sort-main">
          <p class="sort-zone-label">${isFavorite ? "其他" : "今天"}</p>
          <div class="sort-list" data-zone="main"></div>
        </div>
      </div>`;
    const fixedList = ui.body.querySelector('[data-zone="fixed"]');
    const mainList = ui.body.querySelector('[data-zone="main"]');
    const divider = ui.body.querySelector("[data-divider]");
    let order = SORT_ITEMS.map((item) => item.id);
    let pinned = isFavorite ? new Set(["a"]) : new Set();
    let drag = null;

    function rowHtml(item) {
      return `<div class="sort-row" data-id="${item.id}" tabindex="0" role="listitem">
        <span class="sort-grip" aria-hidden="true">⠿</span>
        <span class="sort-copy"><strong>${item.title}</strong><small>${item.meta}</small></span>
        <span class="sort-star" aria-hidden="true">${pinned.has(item.id) ? "★" : "☆"}</span>
      </div>`;
    }

    function renderRows() {
      const sorted = [
        ...SORT_ITEMS.filter((item) => pinned.has(item.id)),
        ...SORT_ITEMS.filter((item) => !pinned.has(item.id))
      ];
      fixedList.innerHTML = sorted.filter((item) => pinned.has(item.id)).map(rowHtml).join("");
      mainList.innerHTML = sorted.filter((item) => !pinned.has(item.id)).map(rowHtml).join("");
      if (isFavorite) {
        fixedList.setAttribute("role", "list");
        mainList.setAttribute("role", "list");
      }
      ui.body.querySelectorAll(".sort-list").forEach((list) => {
        if (!list.querySelector(".sort-row")) list.innerHTML = `<p class="sort-empty">松手后会固定在这里</p>`;
      });
    }
    renderRows();

    function allRows() {
      return Array.from(ui.body.querySelectorAll(".sort-row"));
    }

    function moveRow(id, direction) {
      const current = order.indexOf(id);
      const next = clamp(current + direction, 0, order.length - 1);
      if (next === current) return;
      order.splice(current, 1);
      order.splice(next, 0, id);
      pinned = new Set(order.filter((item) => pinned.has(item)));
      renderRows();
      const row = ui.body.querySelector(`[data-id="${id}"]`);
      if (row) row.focus();
      setStatus(ui, "已移动到第 " + (next + 1) + " 位");
    }

    bind(bag, ui.body, "keydown", (event) => {
      const row = event.target.closest(".sort-row");
      if (!row || !event.altKey) return;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        moveRow(row.dataset.id, event.key === "ArrowUp" ? -1 : 1);
      }
    });

    bind(bag, ui.body, "pointerdown", (event) => {
      const row = event.target.closest(".sort-row");
      if (!row || event.button !== 0 && event.pointerType === "mouse") return;
      const list = row.closest(".sort-list");
      drag = {
        row,
        list,
        id: row.dataset.id,
        startY: event.clientY,
        lastY: event.clientY,
        rect: row.getBoundingClientRect(),
        rows: allRows(),
        originIndex: allRows().indexOf(row),
        target: allRows().indexOf(row),
        fixed: pinned.has(row.dataset.id),
        pointerId: event.pointerId
      };
      row.classList.add("dragging");
      row.setPointerCapture(event.pointerId);
      allRows().forEach((item) => item.classList.remove("drop-target"));
      setStatus(ui, "正在拖动「" + row.querySelector("strong").textContent + "」");
    });

    bind(bag, ui.body, "pointermove", (event) => {
      if (!drag) return;
      const rows = allRows();
      const rowH = drag.rect.height + 8;
      const delta = event.clientY - drag.startY;
      drag.row.style.transform = `translateY(${delta}px) scale(1.03)`;
      drag.lastY = event.clientY;
      const center = event.clientY;
      let target = 0;
      rows.forEach((row, index) => {
        if (row === drag.row) return;
        const rect = row.getBoundingClientRect();
        if (center > rect.top + rect.height / 2) target = index;
      });
      const current = rows.indexOf(drag.row);
      if (center < rows[0].getBoundingClientRect().top) target = 0;
      if (center > rows[rows.length - 1].getBoundingClientRect().bottom) target = rows.length - 1;
      if (target > current) target = Math.max(current, target);
      if (target < current) target = Math.min(current, target);
      drag.target = target;
      rows.forEach((row, index) => {
        if (row === drag.row) return;
        let offset = 0;
        if (current < target && index > current && index <= target) offset = -rowH;
        if (current > target && index >= target && index < current) offset = rowH;
        row.style.transform = offset ? `translateY(${offset}px)` : "";
        row.classList.toggle("drop-target", index === target);
      });
      const overDivider = isFavorite && divider && event.clientY < divider.getBoundingClientRect().bottom + 10;
      divider?.classList.toggle("live", overDivider && !drag.fixed);
      setStatus(ui, overDivider && !drag.fixed ? "松手固定到常用" : "松手移到第 " + (target + 1) + " 位");
    });

    function finishDrag() {
      if (!drag) return;
      const rows = allRows();
      const current = rows.indexOf(drag.row);
      const target = drag.target;
      const overDivider = isFavorite && divider && drag.lastY < divider.getBoundingClientRect().bottom + 10;
      if (isFavorite && overDivider) pinned.add(drag.id);
      else if (isFavorite && drag.fixed && !overDivider) pinned.delete(drag.id);
      if (target !== current || (isFavorite && overDivider !== drag.fixed)) {
        const id = drag.id;
        order.splice(order.indexOf(id), 1);
        order.splice(target, 0, id);
        setStatus(ui, pinned.has(id) ? "已固定「" + drag.row.querySelector("strong").textContent + "」" : "已移到第 " + (target + 1) + " 位");
      }
      rows.forEach((row) => { row.style.transform = ""; row.classList.remove("dragging", "drop-target"); });
      divider?.classList.remove("live");
      drag = null;
      renderRows();
      const next = ui.body.querySelector(`[data-id="${order[target]}"]`);
      if (next) next.focus({ preventScroll: true });
    }
    bind(bag, ui.body, "pointerup", finishDrag);
    bind(bag, ui.body, "pointercancel", finishDrag);
    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     3. FEEDBACK LAB
     ============================================================ */
  S.feedbackLab = function (root, variant) {
    const bag = [];
    const ui = shell(root, {
      kicker: "MOBILE / FEEDBACK",
      title: "反馈小实验室",
      note: "每个回应都要<br>说得清发生了什么",
      status: ""
    });
    const body = ui.body;

    if (variant === "batch") {
      const items = ["确认参会", "上传发票", "填写地址", "选择座位", "阅读须知"];
      body.innerHTML = `<div class="fb-card">
        <div class="fb-head"><span>批量确认</span><button type="button" class="stage-action ghost" id="fb-all">全选</button></div>
        <div class="fb-list">${items.map((item, index) => `
          <button type="button" class="check-row" role="checkbox" aria-checked="false" data-i="${index}">
            <span class="check-box" aria-hidden="true">✓</span><span>${item}</span><small>${String(index + 1).padStart(2, "0")}</small>
          </button>`).join("")}</div>
        <p class="fb-count" data-count>已选 0 / 5</p>
      </div>`;
      const rows = Array.from(body.querySelectorAll(".check-row"));
      const count = body.querySelector("[data-count]");
      let busy = false;
      const update = () => {
        const n = rows.filter((row) => row.getAttribute("aria-checked") === "true").length;
        count.textContent = "已选 " + n + " / 5";
        body.querySelector("#fb-all").textContent = n === 5 ? "取消全选" : "全选";
      };
      rows.forEach((row) => bind(bag, row, "click", () => {
        row.setAttribute("aria-checked", String(row.getAttribute("aria-checked") !== "true"));
        row.classList.add("pop");
        setTimeout(() => row.classList.remove("pop"), 320);
        update();
        setStatus(ui, row.textContent.trim().replace(/\s+/g, " "));
      }));
      bind(bag, body.querySelector("#fb-all"), "click", () => {
        if (busy) return;
        const allOn = rows.every((row) => row.getAttribute("aria-checked") === "true");
        busy = true;
        rows.forEach((row, index) => timer(bag, () => {
          row.setAttribute("aria-checked", String(!allOn));
          row.classList.add("pop");
          setTimeout(() => row.classList.remove("pop"), 320);
          update();
          if (index === rows.length - 1) {
            busy = false;
            setStatus(ui, allOn ? "已取消全选" : "已按顺序全选");
          }
        }, prefersReduced() ? 0 : index * 70));
      });
      update();
    }

    if (variant === "steps") {
      const steps = ["信息", "偏好", "确认", "完成"];
      body.innerHTML = `<div class="fb-card steps-card">
        <div class="steps-top"><span data-step-label>第 1 步 · 信息</span><span class="mono" data-step-count>1 / 4</span></div>
        <div class="steps-track"><i data-step-bar></i></div>
        <div class="steps-dots">${steps.map((step, index) => `<span data-dot="${index}"><b>${index + 1}</b><small>${step}</small></span>`).join("")}</div>
        <div class="fb-actions"><button type="button" class="stage-action ghost" data-prev>上一步</button><button type="button" class="stage-action accent" data-next>完成这一步</button></div>
      </div>`;
      let current = 0;
      const bar = body.querySelector("[data-step-bar]");
      const label = body.querySelector("[data-step-label]");
      const count = body.querySelector("[data-step-count]");
      const dots = Array.from(body.querySelectorAll("[data-dot]"));
      const render = (overshoot) => {
        const pct = current / (steps.length - 1) * 100;
        if (overshoot && !prefersReduced()) {
          animate(bar, [
            { width: pct + "%" },
            { width: Math.min(100, pct + 8) + "%" },
            { width: pct + "%" }
          ], { duration: 420, easing: "cubic-bezier(.16,1.3,.3,1)" });
        } else {
          bar.style.width = pct + "%";
        }
        label.textContent = "第 " + (current + 1) + " 步 · " + steps[current];
        count.textContent = (current + 1) + " / " + steps.length;
        dots.forEach((dot, index) => dot.classList.toggle("done", index <= current));
        body.querySelector("[data-next]").textContent = current === steps.length - 1 ? "再走一遍" : "完成这一步";
      };
      bind(bag, body.querySelector("[data-next]"), "click", () => {
        if (current === steps.length - 1) current = 0;
        else current += 1;
        render(true);
        setStatus(ui, current === 0 ? "已回到第一步" : "步骤 " + (current + 1) + " 完成");
      });
      bind(bag, body.querySelector("[data-prev]"), "click", () => {
        if (current === 0) return;
        current -= 1;
        render(false);
        setStatus(ui, "已回到第 " + (current + 1) + " 步");
      });
      render(false);
    }

    if (variant === "switchGroup") {
      const labels = ["通知", "声音", "震动", "夜间"];
      body.innerHTML = `<div class="fb-card">
        <div class="fb-head"><span>只让被点的那个变</span><span class="pill">同组回应</span></div>
        <div class="switch-grid">${labels.map((label, index) => `
          <button type="button" class="switch-row" role="switch" aria-checked="${index === 0}"><span>${label}</span><i><b></b></i></button>`).join("")}</div>
        <p class="fb-note">其余开关只做一次视觉震动，aria-checked 保持不变。</p>
      </div>`;
      const switches = Array.from(body.querySelectorAll(".switch-row"));
      switches.forEach((sw, index) => bind(bag, sw, "click", () => {
        sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true"));
        switches.forEach((other) => {
          if (other === sw) return;
          other.classList.remove("shake");
          void other.offsetWidth;
          other.classList.add("shake");
          timer(bag, () => other.classList.remove("shake"), 400);
        });
        setStatus(ui, "「" + labels[index] + "」" + (sw.getAttribute("aria-checked") === "true" ? "已打开" : "已关闭") + "；另外 3 个状态未变");
      }));
      bind(bag, body, "keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          const sw = event.target.closest(".switch-row");
          if (sw) { event.preventDefault(); sw.click(); }
        }
      });
    }

    if (variant === "press") {
      body.innerHTML = `<div class="fb-card press-stage">
        <button type="button" class="press-card" id="press-card">
          <span class="press-icon" aria-hidden="true">◎</span>
          <strong>按住我</strong>
          <small>按下会下沉，松开回弹</small>
        </button>
        <p class="fb-note">按住后移出卡片范围，这次按压会被取消。</p>
      </div>`;
      const card = body.querySelector("#press-card");
      let active = false;
      const down = (event) => {
        active = true;
        card.classList.add("pressed");
        card.setPointerCapture?.(event.pointerId);
      };
      const up = (event) => {
        if (!active) return;
        active = false;
        card.classList.remove("pressed");
        if (event) {
          const rect = card.getBoundingClientRect();
          const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
          if (!inside) {
            setStatus(ui, "移出卡片，这次按压已取消");
            return;
          }
        }
        card.classList.add("release");
        timer(bag, () => card.classList.remove("release"), 260);
        setStatus(ui, "按下并松开 · 反馈完成");
      };
      bind(bag, card, "pointerdown", down);
      bind(bag, card, "pointerup", up);
      bind(bag, card, "pointercancel", up);
      bind(bag, card, "pointerleave", (event) => { if (active && event.buttons) card.classList.remove("pressed"); });
      bind(bag, card, "keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          card.classList.add("pressed");
          timer(bag, () => { card.classList.remove("pressed"); card.classList.add("release"); timer(bag, () => card.classList.remove("release"), 260); setStatus(ui, "键盘触发 · 完整反馈"); }, 180);
        }
      });
    }

    if (variant === "copy") {
      body.innerHTML = `<div class="fb-card copy-stage">
        <p class="copy-label">分享链接</p>
        <div class="copy-line"><code>lab.uiux/atlas/14</code>
          <button type="button" class="copy-button" id="copy-button" aria-label="复制链接">
            <span class="copy-face copy-idle" aria-hidden="true">⧉</span>
            <span class="copy-face copy-done" aria-hidden="true">✓</span>
          </button>
        </div>
        <p class="copy-toast" id="copy-toast" role="status">已复制</p>
        <p class="fb-note">点击后翻面对勾，一秒后自动复原。复制失败会显示另一种结果。</p>
      </div>`;
      const button = body.querySelector("#copy-button");
      const toast = body.querySelector("#copy-toast");
      let timerId = 0;
      bind(bag, button, "click", async () => {
        let ok = true;
        try {
          if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText("lab.uiux/atlas/14");
          else {
            const area = document.createElement("textarea");
            area.value = "lab.uiux/atlas/14";
            document.body.append(area);
            area.select();
            ok = document.execCommand("copy");
            area.remove();
          }
        } catch (error) { ok = false; }
        button.classList.add(ok ? "copied" : "failed");
        toast.textContent = ok ? "已复制" : "复制失败，请手动选择";
        toast.classList.add("show");
        setStatus(ui, toast.textContent);
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          button.classList.remove("copied", "failed");
          toast.classList.remove("show");
        }, 1000);
        bag.push(() => clearTimeout(timerId));
      });
    }

    if (variant === "ring") {
      body.innerHTML = `<div class="fb-card ring-stage">
        <div class="ring-wrap">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="48" class="ring-track"></circle>
            <circle cx="60" cy="60" r="48" class="ring-value" id="ring-value"></circle>
          </svg>
          <div class="ring-center"><b id="ring-number">0</b><small>ml</small></div>
        </div>
        <input id="ring-range" type="range" min="0" max="100" value="0" step="1" aria-label="饮水量">
        <div class="fb-actions"><button type="button" class="stage-action ghost" id="ring-reset">重置</button><button type="button" class="stage-action accent" id="ring-fill">加到 72</button></div>
        <p class="fb-note">弧长、数字与颜色同步；超过目标时换色。</p>
      </div>`;
      const range = body.querySelector("#ring-range");
      const circle = body.querySelector("#ring-value");
      const number = body.querySelector("#ring-number");
      const circumference = 2 * Math.PI * 48;
      circle.style.strokeDasharray = circumference;
      let displayed = 0;
      let animationFrame = 0;
      const paint = (value, animateValue) => {
        const target = Number(value);
        const set = (v) => {
          const pct = clamp(v, 0, 100) / 100;
          circle.style.strokeDashoffset = circumference * (1 - pct);
          number.textContent = Math.round(v);
          circle.classList.toggle("over", v > 72);
        };
        if (animateValue && !prefersReduced()) {
          cancelAnimationFrame(animationFrame);
          const start = displayed;
          const started = performance.now();
          const tick = (now) => {
            const t = clamp((now - started) / 560, 0, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            set(start + (target - start) * eased);
            if (t < 1) animationFrame = requestAnimationFrame(tick);
            else displayed = target;
          };
          animationFrame = requestAnimationFrame(tick);
        } else {
          set(target);
          displayed = target;
        }
      };
      bind(bag, range, "input", () => paint(range.value, false));
      bind(bag, body.querySelector("#ring-fill"), "click", () => {
        range.value = 72;
        paint(72, true);
        setStatus(ui, "已加到目标 72 ml");
      });
      bind(bag, body.querySelector("#ring-reset"), "click", () => {
        range.value = 0;
        paint(0, true);
        setStatus(ui, "已重置");
      });
      paint(0, false);
    }

    if (variant === "expand") {
      body.innerHTML = `<div class="fb-card expand-card">
        <span class="pill">设计说明</span>
        <div class="expand-clip"><p>好的界面不急着把全部信息一次倒出来。它先给你一个可以判断的摘要，再把细节放在你伸手可及的地方。展开时高度随内容渐变，箭头同时翻转；收起时回到摘要，而不是突然跳走。</p><p>这段补充说明只在展开后出现。键盘可以展开，读屏会听到“已展开”。</p></div>
        <button type="button" class="expand-toggle" aria-expanded="false" aria-controls="expand-more"><span>展开全文</span><i aria-hidden="true">↓</i></button>
        <p id="expand-more" class="sr">展开后显示完整说明</p>
      </div>`;
      const card = body.querySelector(".expand-card");
      const toggle = body.querySelector(".expand-toggle");
      const clip = body.querySelector(".expand-clip");
      const label = toggle.querySelector("span");
      toggle.id = "expand-toggle";
      body.querySelector("#expand-more").id = "expand-more";
      toggle.setAttribute("aria-controls", "expand-more");
      bind(bag, toggle, "click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        label.textContent = open ? "收起" : "展开全文";
        card.classList.toggle("open", open);
        setStatus(ui, open ? "已展开全文" : "已收起");
      });
    }

    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     4. SLIDER LAB
     ============================================================ */
  function makeSlider(options) {
    const o = options || {};
    const wrap = document.createElement("div");
    wrap.className = "slider " + (o.className || "");
    wrap.innerHTML = `
      <div class="slider-read"><b data-read>${o.value}</b><span>${o.unit || ""}</span></div>
      <div class="slider-track" data-track>
        <i class="slider-fill" data-fill></i>
        <button type="button" class="slider-thumb" role="slider" data-thumb
          aria-valuemin="${o.min}" aria-valuemax="${o.max}" aria-valuenow="${o.value}" aria-label="${o.label || "数值"}"></button>
      </div>
      <div class="slider-ticks" data-ticks></div>`;
    const track = wrap.querySelector("[data-track]");
    const fill = wrap.querySelector("[data-fill]");
    const thumb = wrap.querySelector("[data-thumb]");
    const read = wrap.querySelector("[data-read]");
    const ticks = wrap.querySelector("[data-ticks]");
    let value = o.value;
    let active = false;
    const pct = () => (value - o.min) / (o.max - o.min) * 100;
    const draw = (silent) => {
      const p = clamp(pct(), 0, 100);
      fill.style.width = p + "%";
      thumb.style.left = p + "%";
      thumb.setAttribute("aria-valuenow", String(Math.round(value)));
      read.textContent = o.format ? o.format(value) : Math.round(value);
      if (!silent && o.onInput) o.onInput(value);
    };
    const valueAt = (clientX) => {
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      let next = o.min + ratio * (o.max - o.min);
      if (o.step) next = Math.round(next / o.step) * o.step;
      return clamp(next, o.min, o.max);
    };
    const move = (event) => {
      if (!active) return;
      value = valueAt(event.clientX);
      if (o.rubber) {
        const rect = track.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        if (ratio < 0) value = o.min + (ratio * (o.max - o.min)) * .22;
        if (ratio > 1) value = o.max + ((ratio - 1) * (o.max - o.min)) * .22;
      }
      draw(false);
    };
    const end = () => {
      if (!active) return;
      active = false;
      wrap.classList.remove("active");
      if (o.rubber) {
        const before = value;
        value = clamp(value, o.min, o.max);
        if (before !== value) {
          animate(thumb, [
            { transform: "translate(-50%,-50%) scaleX(1.05)" },
            { transform: "translate(-50%,-50%) scaleX(.94)" },
            { transform: "translate(-50%,-50%) scaleX(1)" }
          ], { duration: 260, easing: "cubic-bezier(.16,1.3,.3,1)" });
          if (o.onRubber) o.onRubber(before);
        }
      }
      if (o.snapTo) {
        const snapped = o.snapTo(value);
        if (snapped !== value) {
          value = snapped;
          if (!prefersReduced()) {
            const fillRect = fill.getBoundingClientRect();
            animate(fill, [
              { width: pct() + "%" },
              { width: clamp(pct() + 5, 0, 100) + "%" },
              { width: pct() + "%" }
            ], { duration: 360, easing: "cubic-bezier(.16,1.3,.3,1)" });
            void fillRect;
          }
          draw(false);
        }
      } else {
        draw(false);
      }
      if (o.onEnd) o.onEnd(value);
    };
    track.addEventListener("pointerdown", (event) => {
      active = true;
      wrap.classList.add("active");
      track.setPointerCapture(event.pointerId);
      value = valueAt(event.clientX);
      draw(false);
    });
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    thumb.addEventListener("keydown", (event) => {
      const step = o.step || 1;
      const map = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
      if (event.key in map) {
        event.preventDefault();
        value = clamp(value + map[event.key], o.min, o.max);
        draw(false);
      }
      if (event.key === "Home") { event.preventDefault(); value = o.min; draw(false); }
      if (event.key === "End") { event.preventDefault(); value = o.max; draw(false); }
    });
    if (o.ticks) {
      ticks.innerHTML = o.ticks.map((tick) => `<span>${tick.label}</span>`).join("");
      wrap.style.setProperty("--tick-count", o.ticks.length);
      ticks.style.gridTemplateColumns = `repeat(${o.ticks.length},1fr)`;
    }
    draw(true);
    return { wrap, set(v, silent) { value = clamp(v, o.min, o.max); draw(silent); }, get: () => value, element: thumb };
  }

  S.sliderLab = function (root, variant) {
    const bag = [];
    const ui = shell(root, {
      kicker: "MOBILE / CONTROL",
      title: variant === "volume" ? "音量条橡皮筋" : variant === "dual" ? "双头范围滑块" : variant === "linked" ? "联动滑杆与读数" : variant === "font" ? "字号刻度实时预览" : variant === "timeRange" ? "拖动连选时间段" : "滑杆吸附与过冲",
      note: "拖动、键盘、松手<br>三种输入都要能完成",
      status: ""
    });
    const body = ui.body;

    if (variant === "snap") {
      body.innerHTML = `<div class="fb-card slider-card">
        <p class="slider-label">圆角半径</p>
        <div data-mount></div>
        <div class="slider-preview"><span data-preview>24</span><small>px</small></div>
        <p class="fb-note">松手后先轻轻过冲，再被最近的 8px 刻度拉回。</p>
      </div>`;
      const mount = body.querySelector("[data-mount]");
      const preview = body.querySelector("[data-preview]");
      const slider = makeSlider({
        min: 0, max: 48, value: 24, step: 8, label: "圆角半径",
        ticks: [{ label: "0" }, { label: "8" }, { label: "16" }, { label: "24" }, { label: "32" }, { label: "40" }, { label: "48" }],
        snapTo: (value) => Math.round(value / 8) * 8,
        onInput: (value) => { preview.textContent = Math.round(value); },
        onEnd: (value) => setStatus(ui, "吸附到 " + Math.round(value) + "px")
      });
      mount.append(slider.wrap);
    }

    if (variant === "volume") {
      body.innerHTML = `<div class="fb-card slider-card volume-card">
        <div class="volume-row"><span class="volume-icon" aria-hidden="true">🔈</span><b data-volume>64</b><small>%</small></div>
        <div data-mount></div>
        <p class="fb-note">按住轨道会变粗；拖过 0 或 100，填充会像橡皮筋一样被拉出去，松手回弹。</p>
      </div>`;
      const mount = body.querySelector("[data-mount]");
      const label = body.querySelector("[data-volume]");
      const slider = makeSlider({
        min: 0, max: 100, value: 64, label: "音量", className: "volume-slider", rubber: true,
        onInput: (value) => { label.textContent = Math.round(clamp(value, 0, 100)); },
        onRubber: () => setStatus(ui, "越过端点，橡皮筋回弹"),
        onEnd: (value) => setStatus(ui, "音量 " + Math.round(value) + "%")
      });
      mount.append(slider.wrap);
    }

    if (variant === "dual") {
      body.innerHTML = `<div class="fb-card slider-card dual-card">
        <p class="slider-label">价格区间</p>
        <div class="dual-read"><b data-min>¥1200</b><span>—</span><b data-max>¥8600</b></div>
        <div class="dual-track" data-track>
          <i class="dual-fill" data-fill></i>
          <button type="button" class="dual-thumb" data-thumb="min" role="slider" aria-label="最低价" aria-valuemin="0" aria-valuemax="100" aria-valuenow="12"></button>
          <button type="button" class="dual-thumb" data-thumb="max" role="slider" aria-label="最高价" aria-valuemin="0" aria-valuemax="100" aria-valuenow="86"></button>
        </div>
        <p class="fb-note">两个把手之间伸缩填充；拖动时浮出实时数值，松手收回。</p>
      </div>`;
      const track = body.querySelector("[data-track]");
      const fill = body.querySelector("[data-fill]");
      const minThumb = body.querySelector('[data-thumb="min"]');
      const maxThumb = body.querySelector('[data-thumb="max"]');
      const minLabel = body.querySelector("[data-min]");
      const maxLabel = body.querySelector("[data-max]");
      let values = [12, 86];
      let active = null;
      const draw = () => {
        fill.style.left = values[0] + "%";
        fill.style.width = (values[1] - values[0]) + "%";
        minThumb.style.left = values[0] + "%";
        maxThumb.style.left = values[1] + "%";
        minThumb.setAttribute("aria-valuenow", String(Math.round(values[0])));
        maxThumb.setAttribute("aria-valuenow", String(Math.round(values[1])));
        minLabel.textContent = "¥" + Math.round(1200 + values[0] * 86);
        maxLabel.textContent = "¥" + Math.round(1200 + values[1] * 86);
      };
      const at = (event) => {
        const rect = track.getBoundingClientRect();
        return clamp((event.clientX - rect.left) / rect.width * 100, 0, 100);
      };
      const start = (which) => (event) => {
        active = which;
        track.setPointerCapture(event.pointerId);
        track.classList.add("dragging");
      };
      minThumb.addEventListener("pointerdown", start("min"));
      maxThumb.addEventListener("pointerdown", start("max"));
      track.addEventListener("pointermove", (event) => {
        if (!active) return;
        const value = at(event);
        if (active === "min") values[0] = Math.min(value, values[1] - 4);
        else values[1] = Math.max(value, values[0] + 4);
        draw();
        setStatus(ui, "区间 " + Math.round(values[0]) + "–" + Math.round(values[1]));
      });
      track.addEventListener("pointerup", () => { active = null; track.classList.remove("dragging"); });
      const key = (which) => (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const index = which === "min" ? 0 : 1;
        let value = values[index];
        if (event.key === "ArrowLeft") value -= 2;
        if (event.key === "ArrowRight") value += 2;
        if (event.key === "Home") value = 0;
        if (event.key === "End") value = 100;
        if (index === 0) values[0] = Math.min(value, values[1] - 4);
        else values[1] = Math.max(value, values[0] + 4);
        draw();
      };
      minThumb.addEventListener("keydown", key("min"));
      maxThumb.addEventListener("keydown", key("max"));
      draw();
    }

    if (variant === "linked") {
      body.innerHTML = `<div class="fb-card slider-card linked-card">
        <div class="linked-top">
          <div class="linked-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" class="ring-track"></circle><circle cx="50" cy="50" r="40" class="ring-value" data-ring></circle></svg><b data-value>40</b></div>
          <div><p class="slider-label">本周专注</p><p class="linked-unit"><b data-minutes>6</b> 小时</p></div>
        </div>
        <div data-mount></div>
        <p class="fb-note">轨道、滑钮、数字和圆环共用同一状态，不各自滞后。</p>
      </div>`;
      const mount = body.querySelector("[data-mount]");
      const ring = body.querySelector("[data-ring]");
      const valueEl = body.querySelector("[data-value]");
      const minutes = body.querySelector("[data-minutes]");
      const circumference = 2 * Math.PI * 40;
      ring.style.strokeDasharray = circumference;
      const slider = makeSlider({
        min: 0, max: 40, value: 24, step: 1, label: "专注小时",
        onInput: (value) => {
          const pct = value / 40;
          ring.style.strokeDashoffset = circumference * (1 - pct);
          valueEl.textContent = Math.round(pct * 100) + "%";
          minutes.textContent = Math.round(value * .25);
        },
        onEnd: (value) => setStatus(ui, "已设为 " + Math.round(value * .25) + " 小时")
      });
      mount.append(slider.wrap);
      slider.set(24);
    }

    if (variant === "font") {
      body.innerHTML = `<div class="fb-card slider-card font-card">
        <p class="slider-label">正文预览</p>
        <p class="font-preview" data-preview>把一句话放进合适的字号里，阅读会自己变得轻松。</p>
        <div data-mount></div>
        <p class="fb-note">松手吸附到常用档位：14 / 16 / 18 / 20 / 24。</p>
      </div>`;
      const preview = body.querySelector("[data-preview]");
      const mount = body.querySelector("[data-mount]");
      const sizes = [14, 16, 18, 20, 24];
      const slider = makeSlider({
        min: 14, max: 24, value: 16, step: 1, label: "字号",
        ticks: sizes.map((size) => ({ label: size })),
        snapTo: (value) => sizes.reduce((best, size) => Math.abs(size - value) < Math.abs(best - value) ? size : best, sizes[0]),
        onInput: (value) => { preview.style.fontSize = Math.round(value) + "px"; },
        onEnd: (value) => setStatus(ui, "字号 " + Math.round(value) + "px")
      });
      mount.append(slider.wrap);
    }

    if (variant === "timeRange") {
      const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
      body.innerHTML = `<div class="fb-card slider-card time-card">
        <div class="time-read"><span>可用时间</span><b data-range>10:00 – 12:00</b></div>
        <div class="time-grid" data-grid>${slots.map((slot, index) => `<button type="button" class="time-cell" data-i="${index}" aria-pressed="false"><span>${slot}</span></button>`).join("")}</div>
        <p class="fb-note">按住拖动连选；已选中的两端可以单独调整。</p>
        <div class="time-handles"><span>开始 <button type="button" data-handle="start" aria-label="调整开始时间">−</button><button type="button" data-handle="start-add" aria-label="延后开始时间">+</button></span><span>结束 <button type="button" data-handle="end" aria-label="提前结束时间">−</button><button type="button" data-handle="end-add" aria-label="延后结束时间">+</button></span></div>
      </div>`;
      const grid = body.querySelector("[data-grid]");
      const cells = Array.from(grid.querySelectorAll(".time-cell"));
      const rangeLabel = body.querySelector("[data-range]");
      let start = 2;
      let end = 5;
      let dragging = false;
      const draw = () => {
        cells.forEach((cell, index) => {
          cell.classList.toggle("on", index >= start && index <= end);
          cell.classList.toggle("edge", index === start || index === end);
          cell.setAttribute("aria-pressed", String(index >= start && index <= end));
        });
        rangeLabel.textContent = slots[start] + " – " + (slots[end + 1] || "15:00");
      };
      const indexAt = (event) => {
        const rect = grid.getBoundingClientRect();
        return clamp(Math.floor((event.clientX - rect.left) / rect.width * cells.length), 0, cells.length - 1);
      };
      grid.addEventListener("pointerdown", (event) => {
        dragging = true;
        grid.setPointerCapture(event.pointerId);
        const index = indexAt(event);
        start = index;
        end = index;
        draw();
      });
      grid.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const index = indexAt(event);
        start = Math.min(start, index);
        end = Math.max(end, index);
        draw();
      });
      grid.addEventListener("pointerup", () => {
        dragging = false;
        setStatus(ui, "已选 " + slots[start] + " 到 " + (slots[end + 1] || "15:00"));
      });
      body.querySelectorAll("[data-handle]").forEach((button) => {
        bind(bag, button, "click", () => {
          const action = button.dataset.handle;
          if (action === "start") start = Math.max(0, start - 1);
          if (action === "start-add") start = Math.min(end, start + 1);
          if (action === "end") end = Math.max(start, end - 1);
          if (action === "end-add") end = Math.min(cells.length - 1, end + 1);
          draw();
          setStatus(ui, "已调整到 " + slots[start] + " – " + (slots[end + 1] || "15:00"));
        });
      });
      draw();
    }

    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     5. TAG LAB
     ============================================================ */
  S.tagLab = function (root, variant) {
    const bag = [];
    const titles = { filter: "筛选标签实心反白", removable: "可删除标签收缩成圆点", colors: "滑动选色，相邻弹起", yield: "选中标签放大，邻居让位" };
    const ui = shell(root, {
      kicker: "MOBILE / TAGS",
      title: titles[variant] || "标签实验室",
      note: "点击、拖动、键盘<br>选中态都不只靠颜色",
      status: ""
    });
    const body = ui.body;

    if (variant === "filter") {
      const tags = ["全部", "设计", "开发", "动效", "无障碍", "数据", "灵感", "长标签测试"];
      body.innerHTML = `<div class="fb-card tag-card">
        <div class="tag-head"><span>主题筛选</span><b data-count>0 个已选</b></div>
        <div class="tag-scroll" data-tags>${tags.map((tag, index) => `<button type="button" class="tag" aria-pressed="${index === 0}" data-tag="${tag}">${tag}</button>`).join("")}</div>
        <p class="fb-note">横向滚动不会抢走页面纵向滚动；键盘左右键可移动焦点。</p>
      </div>`;
      const buttons = Array.from(body.querySelectorAll(".tag"));
      const count = body.querySelector("[data-count]");
      const update = () => {
        const n = buttons.filter((button) => button.getAttribute("aria-pressed") === "true").length;
        count.textContent = n + " 个已选";
      };
      buttons.forEach((button, index) => {
        bind(bag, button, "click", () => {
          button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
          update();
          setStatus(ui, button.dataset.tag + " " + (button.getAttribute("aria-pressed") === "true" ? "已选中" : "已取消"));
        });
        bind(bag, button, "keydown", (event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            const next = buttons[(index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length];
            next.focus();
          }
        });
      });
      update();
    }

    if (variant === "removable") {
      body.innerHTML = `<div class="fb-card tag-card">
        <div class="tag-head"><span>已保存的标签</span><b data-count>4</b></div>
        <div class="tag-wrap" data-tags></div>
        <form class="tag-form" data-form><input data-input placeholder="新增标签，回车确认" aria-label="新增标签"><button type="submit" class="stage-action accent">添加</button></form>
        <p class="fb-note">删除时先收缩成圆点再消失；重名或空输入会被拦住。</p>
      </div>`;
      const wrap = body.querySelector("[data-tags]");
      const form = body.querySelector("[data-form]");
      const input = body.querySelector("[data-input]");
      const count = body.querySelector("[data-count]");
      let tags = ["动效", "卡片", "手势", "主题"];
      const render = () => {
        wrap.innerHTML = tags.map((tag) => `<span class="removable" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}<button type="button" aria-label="删除 ${escapeHtml(tag)}">×</button></span>`).join("");
        count.textContent = tags.length;
        wrap.querySelectorAll(".removable button").forEach((button) => {
          button.addEventListener("click", () => {
            const chip = button.closest(".removable");
            const name = chip.dataset.tag;
            const anim = animate(chip, [
              { transform: "scale(1)", opacity: 1 },
              { transform: "scale(.2)", opacity: 0, width: "12px" }
            ], { duration: 260, easing: "cubic-bezier(.55,.06,.68,.19)" });
            anim.finished.then(() => {
              tags = tags.filter((tag) => tag !== name);
              render();
              setStatus(ui, "已删除「" + name + "」");
            }).catch(() => {});
          });
        });
      };
      render();
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = input.value.trim();
        if (!name) { setStatus(ui, "输入不能为空"); input.focus(); return; }
        if (tags.includes(name)) { setStatus(ui, "「" + name + "」已经存在"); input.select(); return; }
        tags.push(name);
        input.value = "";
        render();
        setStatus(ui, "已新增「" + name + "」");
      });
    }

    if (variant === "colors") {
      const colors = ["#f4f0e6", "#ff7a4d", "#c9ef6f", "#a9d6ff", "#c7b7ff", "#ffc2d1", "#1a1b16"];
      body.innerHTML = `<div class="fb-card tag-card color-card">
        <div class="color-preview" data-preview><span>主题色</span><b data-hex>#ff7a4d</b></div>
        <div class="swatch-row" data-swatches>${colors.map((color, index) => `<button type="button" class="swatch" style="--c:${color}" data-color="${color}" data-i="${index}" aria-label="选择颜色 ${color}" aria-pressed="${index === 1}"></button>`).join("")}</div>
        <p class="fb-note">按住滑动，经过的色块依次放大；松手选中，预览色平滑过渡。</p>
      </div>`;
      const row = body.querySelector("[data-swatches]");
      const preview = body.querySelector("[data-preview]");
      const hex = body.querySelector("[data-hex]");
      const swatches = Array.from(row.querySelectorAll(".swatch"));
      let active = false;
      let selected = 1;
      const pick = (index, commit) => {
        selected = index;
        swatches.forEach((swatch, i) => {
          swatch.classList.toggle("hovering", i === index);
          swatch.setAttribute("aria-pressed", String(i === index));
        });
        if (commit) {
          const color = colors[index];
          preview.style.background = color;
          preview.style.color = index === 0 || index === 2 || index === 3 || index === 4 || index === 5 ? "#1a1b16" : "#f4f0e6";
          hex.textContent = color.toUpperCase();
          setStatus(ui, "主题色 " + color.toUpperCase());
        }
      };
      row.addEventListener("pointerdown", (event) => {
        const swatch = event.target.closest(".swatch");
        if (!swatch) return;
        active = true;
        row.setPointerCapture(event.pointerId);
        pick(Number(swatch.dataset.i), false);
      });
      row.addEventListener("pointermove", (event) => {
        if (!active) return;
        const swatch = document.elementFromPoint(event.clientX, event.clientY)?.closest?.(".swatch");
        if (swatch && row.contains(swatch)) pick(Number(swatch.dataset.i), false);
      });
      const end = () => {
        if (!active) return;
        active = false;
        pick(selected, true);
      };
      row.addEventListener("pointerup", end);
      row.addEventListener("pointercancel", end);
      swatches.forEach((swatch, index) => bind(bag, swatch, "click", () => pick(index, true)));
      pick(1, false);
    }

    if (variant === "yield") {
      const tags = ["全部", "动效", "卡片", "手势", "排版"];
      body.innerHTML = `<div class="fb-card tag-card yield-card">
        <div class="yield-row" data-row>${tags.map((tag, index) => `<button type="button" class="yield-tag" data-i="${index}" aria-pressed="${index === 1}">${tag}</button>`).join("")}</div>
        <p class="yield-line" data-line>选中「动效」，相邻标签向两侧让出空间。</p>
        <p class="fb-note">切换时只让变化的标签移动，容器高度不变。</p>
      </div>`;
      const row = body.querySelector("[data-row]");
      const buttons = Array.from(row.querySelectorAll(".yield-tag"));
      const line = body.querySelector("[data-line]");
      let selected = 1;
      const render = () => {
        buttons.forEach((button, index) => {
          button.setAttribute("aria-pressed", String(index === selected));
          button.style.transform = index === selected ? "scale(1.16)" : "";
          button.style.margin = index === selected - 1 ? "0 10px 0 0" : index === selected + 1 ? "0 0 0 10px" : "";
        });
        line.textContent = "选中「" + buttons[selected].textContent + "」，相邻标签向两侧让出空间。";
      };
      buttons.forEach((button, index) => bind(bag, button, "click", () => {
        selected = index;
        render();
        setStatus(ui, "已选中 " + button.textContent);
      }));
      bind(bag, row, "keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          selected = (selected + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
          render();
          buttons[selected].focus();
        }
      });
      render();
    }

    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     6. INPUT LAB
     ============================================================ */
  S.inputLab = function (root, variant) {
    const bag = [];
    const titles = { floating: "浮动标题输入框", error: "表单错误轻晃滑入", autocomplete: "输入联想与键盘选择", record: "长按录音，滑动取消", search: "动态搜索框" };
    const ui = shell(root, {
      kicker: "MOBILE / INPUT",
      title: titles[variant] || "输入实验室",
      note: "输入是任务<br>不是装饰",
      status: ""
    });
    const body = ui.body;

    if (variant === "floating") {
      body.innerHTML = `<div class="fb-card input-card">
        <div class="float-field" data-field>
          <input id="float-name" placeholder=" " autocomplete="off">
          <label for="float-name">你的称呼</label>
          <i aria-hidden="true"></i>
        </div>
        <p class="input-help">聚焦时标题上移缩小；有内容时失焦保持；为空失焦复原。</p>
        <button type="button" class="stage-action accent" data-validate>检查这个字段</button>
        <p class="input-error" data-error role="status"></p>
      </div>`;
      const field = body.querySelector("[data-field]");
      const input = field.querySelector("input");
      const error = body.querySelector("[data-error]");
      bind(bag, input, "input", () => field.classList.toggle("filled", input.value.length > 0));
      bind(bag, body.querySelector("[data-validate]"), "click", () => {
        if (!input.value.trim()) {
          field.classList.add("invalid");
          error.textContent = "请填写称呼，再继续。";
          field.animate?.([
            { transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }
          ], { duration: 260 });
          input.focus();
          setStatus(ui, "字段为空 · 错误提示已出现");
        } else {
          field.classList.remove("invalid");
          error.textContent = "";
          setStatus(ui, "字段有效");
        }
      });
      bind(bag, input, "input", () => {
        if (input.value.trim()) {
          field.classList.remove("invalid");
          error.textContent = "";
        }
      });
    }

    if (variant === "error") {
      body.innerHTML = `<form class="fb-card input-card" data-form novalidate>
        <p class="slider-label">订阅更新</p>
        <div class="float-field" data-field>
          <input id="error-email" type="email" placeholder=" " autocomplete="email" aria-describedby="error-msg">
          <label for="error-email">邮箱</label>
          <i aria-hidden="true"></i>
        </div>
        <p class="input-error" id="error-msg" data-error role="alert"></p>
        <button type="submit" class="stage-action accent">订阅</button>
        <p class="fb-note">出错时轻晃一次，提示从下方滑入；修正后收起。</p>
      </form>`;
      const form = body.querySelector("[data-form]");
      const field = body.querySelector("[data-field]");
      const input = form.querySelector("input");
      const error = body.querySelector("[data-error]");
      bind(bag, form, "submit", (event) => {
        event.preventDefault();
        const value = input.value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
          field.classList.add("invalid");
          error.textContent = "请输入完整的邮箱地址，例如 name@example.com。";
          if (!prefersReduced()) {
            animate(field, [
              { transform: "translateX(0)" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }
            ], { duration: 300, easing: "ease-out" });
          }
          input.focus();
          setStatus(ui, "邮箱格式不正确");
        } else {
          field.classList.remove("invalid");
          error.textContent = "";
          setStatus(ui, "邮箱有效 · 可以提交");
        }
      });
      bind(bag, input, "input", () => {
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim())) {
          field.classList.remove("invalid");
          error.textContent = "";
        }
      });
    }

    if (variant === "autocomplete") {
      const options = ["界面设计", "界面动效", "交互规格", "动效工程", "无障碍审查", "组件工程", "视觉方向", "页面规划"];
      body.innerHTML = `<div class="fb-card input-card autocomplete-card">
        <div class="float-field filled" data-field>
          <input id="auto-input" placeholder=" " autocomplete="off" role="combobox" aria-expanded="false" aria-controls="auto-list" aria-autocomplete="list">
          <label for="auto-input">查找一个 Skill</label>
          <i aria-hidden="true"></i>
        </div>
        <ul class="auto-list" id="auto-list" role="listbox"></ul>
        <p class="input-help" data-help>输入「动效」试试。上下键移动，回车确认，Esc 关闭。</p>
      </div>`;
      const input = body.querySelector("#auto-input");
      const list = body.querySelector("#auto-list");
      const help = body.querySelector("[data-help]");
      let filtered = options;
      let active = -1;
      const render = () => {
        const value = input.value.trim();
        filtered = options.filter((option) => !value || option.includes(value));
        list.innerHTML = filtered.map((option, index) => {
          const marked = value ? option.replace(value, `<mark>${value}</mark>`) : option;
          return `<li role="option" aria-selected="${index === active}" data-i="${index}" class="${index === active ? "active" : ""}">${marked}</li>`;
        }).join("");
        input.setAttribute("aria-expanded", String(filtered.length > 0));
        help.textContent = filtered.length ? "上下键移动，回车确认，Esc 关闭。" : "没有匹配项，可以换成「动效」或「设计」。";
      };
      bind(bag, input, "input", () => { active = -1; render(); });
      bind(bag, input, "keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          if (!filtered.length) return;
          active = (active + (event.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length;
          render();
        }
        if (event.key === "Enter" && active >= 0) {
          event.preventDefault();
          input.value = filtered[active];
          active = -1;
          render();
          setStatus(ui, "已选择 " + input.value);
          help.textContent = "已选择：" + input.value;
          list.innerHTML = "";
          input.setAttribute("aria-expanded", "false");
        }
        if (event.key === "Escape") {
          list.innerHTML = "";
          input.setAttribute("aria-expanded", "false");
          input.focus();
          setStatus(ui, "已关闭联想");
        }
      });
      bind(bag, list, "click", (event) => {
        const item = event.target.closest("[data-i]");
        if (!item) return;
        input.value = filtered[Number(item.dataset.i)];
        list.innerHTML = "";
        input.setAttribute("aria-expanded", "false");
        setStatus(ui, "已选择 " + input.value);
      });
      render();
    }

    if (variant === "record") {
      body.innerHTML = `<div class="fb-card input-card record-card">
        <p class="slider-label">语音备忘</p>
        <div class="record-panel" data-panel>
          <div class="record-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <p class="record-time" data-time>按住说话</p>
        </div>
        <button type="button" class="record-button" data-record aria-label="按住录音"><span aria-hidden="true">●</span></button>
        <p class="record-hint" data-hint>长按开始录音，松手结束，向上滑动取消。</p>
      </div>`;
      const button = body.querySelector("[data-record]");
      const panel = body.querySelector("[data-panel]");
      const timeEl = body.querySelector("[data-time]");
      const hint = body.querySelector("[data-hint]");
      let recording = false;
      let startY = 0;
      let startedAt = 0;
      let interval = 0;
      const stop = (cancelled) => {
        if (!recording) return;
        recording = false;
        clearInterval(interval);
        panel.classList.remove("recording", "cancelling");
        button.classList.remove("recording");
        timeEl.textContent = cancelled ? "已取消" : "已结束 · " + ((Date.now() - startedAt) / 1000).toFixed(1) + "s";
        hint.textContent = cancelled ? "向上滑动取消，这次没有保存。" : "松手结束；录音只在本页演示。";
        setStatus(ui, cancelled ? "录音已取消" : "录音已结束");
      };
      bind(bag, button, "pointerdown", (event) => {
        recording = true;
        startY = event.clientY;
        startedAt = Date.now();
        panel.classList.add("recording");
        button.classList.add("recording");
        button.setPointerCapture(event.pointerId);
        timeEl.textContent = "0.0s";
        hint.textContent = "松手结束，向上滑动取消。";
        interval = setInterval(() => {
          if (recording) timeEl.textContent = ((Date.now() - startedAt) / 1000).toFixed(1) + "s";
        }, 100);
        bag.push(() => clearInterval(interval));
      });
      bind(bag, button, "pointermove", (event) => {
        if (!recording) return;
        const cancel = startY - event.clientY > 42;
        panel.classList.toggle("cancelling", cancel);
        hint.textContent = cancel ? "松手取消录音" : "松手结束，向上滑动取消。";
      });
      bind(bag, button, "pointerup", (event) => {
        const cancel = startY - event.clientY > 42;
        stop(cancel);
      });
      bind(bag, button, "pointercancel", () => stop(true));
      bind(bag, button, "keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          if (!recording) {
            recording = true;
            startedAt = Date.now();
            panel.classList.add("recording");
            button.classList.add("recording");
            timeEl.textContent = "0.0s";
            interval = setInterval(() => { if (recording) timeEl.textContent = ((Date.now() - startedAt) / 1000).toFixed(1) + "s"; }, 100);
            timer(bag, () => stop(false), 1200);
          }
        }
      });
    }

    if (variant === "search") {
      body.innerHTML = `<div class="fb-card input-card search-card">
        <div class="search-bar" data-bar>
          <span aria-hidden="true">⌕</span>
          <input id="search-dynamic" placeholder="搜索作品、标签或作者" aria-label="搜索">
          <button type="button" data-clear aria-label="清空搜索">×</button>
        </div>
        <p class="input-help" data-help>输入时实时过滤，Esc 收起。</p>
        <div class="search-results" data-results></div>
      </div>`;
      const bar = body.querySelector("[data-bar]");
      const input = body.querySelector("#search-dynamic");
      const results = body.querySelector("[data-results]");
      const help = body.querySelector("[data-help]");
      const clear = body.querySelector("[data-clear]");
      const items = ["圆形扩散换主题", "拖拽排序", "共享元素转场", "弧形快捷菜单", "滚动绑定进度", "卡片沿曲线删除", "双头范围滑块", "环形读数"];
      const render = () => {
        const value = input.value.trim();
        const found = items.filter((item) => !value || item.includes(value));
        results.innerHTML = found.length ? found.map((item) => `<div class="search-item"><span>${item}</span><small>↗</small></div>`).join("") : `<p class="search-empty">没有找到「${escapeHtml(value)}」。</p>`;
        help.textContent = value ? "找到 " + found.length + " 条 · Esc 收起" : "输入时实时过滤，Esc 收起。";
        bar.classList.toggle("filled", value.length > 0);
      };
      bind(bag, input, "focus", () => bar.classList.add("focus"));
      bind(bag, input, "blur", () => bar.classList.remove("focus"));
      bind(bag, input, "input", render);
      bind(bag, input, "keydown", (event) => {
        if (event.key === "Escape") {
          input.value = "";
          input.blur();
          render();
          setStatus(ui, "搜索已清空");
        }
      });
      bind(bag, clear, "click", () => {
        input.value = "";
        input.focus();
        render();
        setStatus(ui, "搜索已清空");
      });
      render();
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     7. OVERLAY LAB
     ============================================================ */
  function overlayStage(body) {
    body.innerHTML = `<div class="ov-stage"><div class="ov-page" data-page></div><div class="ov-scrim" data-scrim></div><div class="ov-host" data-host></div></div>`;
    const stage = body.querySelector(".ov-stage");
    const page = body.querySelector("[data-page]");
    const scrim = body.querySelector("[data-scrim]");
    const host = body.querySelector("[data-host]");
    return { stage, page, scrim, host };
  }

  S.overlayLab = function (root, variant) {
    const bag = [];
    const titles = {
      sheet: "不压暗的底部面板",
      ticket: "撕线取票面板",
      stepSheet: "分步底部弹窗",
      photo: "照片抽屉",
      checkout: "结算栏弹出清单",
      category: "分类标签展开成网格",
      calendar: "日期弹出日历",
      confirm: "确认弹窗回弹后原地完成",
      tooltip: "气泡提示自动收回",
      timer: "顶部计时小条",
      weather: "顶部天气条下拉展开",
      buttonMenu: "按钮弹出菜单",
      cardDetail: "卡片弹出详情",
      drawer: "侧边抽屉推走页面",
      selectAlign: "下拉以选中项对齐"
    };
    const notes = {
      sheet: "不加遮罩<br>背后仍可操作",
      ticket: "向下撕开<br>看见取票码",
      stepSheet: "切换步骤<br>高度跟着内容",
      photo: "拖面板<br>照片同步缩",
      checkout: "点结算栏<br>清单从上方长出来",
      category: "单行展开<br>选中后收回",
      calendar: "从标签下方<br>弹出选日期",
      confirm: "确认后<br>原地变成完成",
      tooltip: "指向目标<br>数秒后收回",
      timer: "离开页面<br>时间条撑开",
      weather: "下拉跟手<br>上划收起",
      buttonMenu: "以按钮为原点<br>点外部收回",
      cardDetail: "从原位放大<br>关闭缩回",
      drawer: "面板滑入<br>页面让位",
      selectAlign: "展开对齐<br>当前选中项"
    };
    const ui = shell(root, {
      kicker: "MOBILE / OVERLAY",
      title: titles[variant] || "弹层实验室",
      note: notes[variant] || "弹层要有来处<br>也要有归处",
      status: ""
    });
    const { stage, page, scrim, host } = overlayStage(ui.body);

    function openPanel(panel, trigger) {
      panel.classList.add("open");
      scrim.classList.add("open");
      const focusTarget = panel.querySelector("[data-focus]") || panel.querySelector("button");
      if (focusTarget) focusTarget.focus({ preventScroll: true });
      panel.dataset.trigger = trigger ? trigger.id || "trigger" : "";
      setStatus(ui, "面板已打开");
    }
    function closePanel(panel, trigger, silent) {
      panel.classList.remove("open");
      scrim.classList.remove("open");
      if (trigger) trigger.focus({ preventScroll: true });
      if (!silent) setStatus(ui, "面板已关闭");
    }
    function makeTrigger(text, id) {
      return `<button type="button" class="ov-trigger" id="${id}">${text}</button>`;
    }

    if (variant === "sheet") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">笔记</span></div>
        <h5 class="ov-title">今天的想法</h5>
        <p class="ov-copy">面板升起时不压暗背景，背后的页面仍然可以滚动、点击。关闭后焦点回到触发按钮。</p>
        <div class="ov-notes"><span>01 先写一句</span><span>02 再补一张图</span><span>03 最后命名</span></div>
        ${makeTrigger("打开快速笔记", "sheet-trigger")}
        <p class="ov-hint">轻点面板外，或向下拖 40px 关闭。</p>`;
      const panel = document.createElement("div");
      panel.className = "ov-sheet ov-note-sheet";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "快速笔记");
      panel.innerHTML = `<div class="ov-handle" data-handle><i></i></div><div class="ov-sheet-head"><b>快速笔记</b><button type="button" class="ov-close" data-focus aria-label="关闭">×</button></div><textarea placeholder="写下一句话…" aria-label="笔记内容"></textarea><button type="button" class="stage-action accent">保存笔记</button>`;
      host.append(panel);
      const trigger = page.querySelector("#sheet-trigger");
      let open = false;
      const set = (next) => {
        open = next;
        panel.classList.toggle("open", next);
        if (next) {
          panel.querySelector("textarea").focus({ preventScroll: true });
          setStatus(ui, "面板升起，背景仍可操作");
        } else {
          trigger.focus({ preventScroll: true });
          setStatus(ui, "面板已收起");
        }
      };
      bind(bag, trigger, "click", () => set(true));
      bind(bag, panel.querySelector(".ov-close"), "click", () => set(false));
      bind(bag, page, "click", (event) => {
        if (open && !event.target.closest("#sheet-trigger")) set(false);
      });
      let drag = null;
      const handle = panel.querySelector("[data-handle]");
      bind(bag, handle, "pointerdown", (event) => {
        drag = { y: event.clientY, offset: 0 };
        panel.style.transition = "none";
        handle.setPointerCapture(event.pointerId);
      });
      bind(bag, handle, "pointermove", (event) => {
        if (!drag) return;
        drag.offset = Math.max(0, event.clientY - drag.y);
        panel.style.transform = `translateY(${drag.offset}px)`;
      });
      bind(bag, handle, "pointerup", () => {
        if (!drag) return;
        panel.style.transition = "";
        panel.style.transform = "";
        if (drag.offset > 40) set(false);
        drag = null;
      });
    }

    if (variant === "ticket") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">票夹</span></div>
        <h5 class="ov-title">明天见。</h5>
        <p class="ov-copy">一张取票凭证，底部是一条可以撕开的虚线。向下拉，票根沿着虚线打开。</p>
        <div class="ov-ticket-card"><span>ADMIT ONE</span><b>14:30</b><small>慢半拍 · 三层展厅</small></div>
        <p class="ov-hint">从底部向上拖，或点「取票」。</p>`;
      const ticket = document.createElement("div");
      ticket.className = "ov-ticket";
      ticket.innerHTML = `<button type="button" class="ov-ticket-top" id="ticket-pull">取票 <span aria-hidden="true">↑</span></button><div class="ov-tear" aria-hidden="true"></div><div class="ov-ticket-body"><p class="mono">ENTRY CODE</p><b>8F 2A · 9C 04</b><div class="ov-barcode" aria-hidden="true"></div><small>出示此码入场 · 可复制</small></div>`;
      host.append(ticket);
      const trigger = ticket.querySelector("#ticket-pull");
      let open = false;
      const set = (next) => {
        open = next;
        ticket.classList.toggle("open", next);
        trigger.innerHTML = next ? "收起 <span aria-hidden=\"true\">↓</span>" : "取票 <span aria-hidden=\"true\">↑</span>";
        setStatus(ui, next ? "取票码已展开" : "票根已合上");
      };
      bind(bag, trigger, "click", () => set(!open));
      let drag = null;
      bind(bag, ticket, "pointerdown", (event) => {
        drag = { y: event.clientY };
        ticket.style.transition = "none";
        ticket.setPointerCapture(event.pointerId);
      });
      bind(bag, ticket, "pointermove", (event) => {
        if (!drag) return;
        const delta = drag.y - event.clientY;
        const base = open ? 0 : 150;
        ticket.style.transform = `translateY(${clamp(base - delta, 0, 150)}px)`;
      });
      bind(bag, ticket, "pointerup", (event) => {
        if (!drag) return;
        const delta = drag.y - event.clientY;
        ticket.style.transition = "";
        ticket.style.transform = "";
        if (delta > 45) set(true);
        else if (delta < -35) set(false);
        drag = null;
      });
    }

    if (variant === "stepSheet") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">预约</span></div>
        <h5 class="ov-title">选一个下午。</h5>
        <p class="ov-copy">分步弹窗的内容横向滑动，高度跟着内容平滑过渡。关闭再打开，从第一步开始。</p>
        ${makeTrigger("开始预约", "step-trigger")}`;
      const panel = document.createElement("div");
      panel.className = "ov-sheet ov-step-sheet";
      panel.innerHTML = `<div class="ov-handle"><i></i></div><div class="ov-sheet-head"><b data-step-title>第 1 步 · 选日期</b><button type="button" class="ov-close" aria-label="关闭">×</button></div><div class="ov-step-view" data-view></div><div class="ov-step-actions"><button type="button" class="stage-action ghost" data-prev>上一步</button><button type="button" class="stage-action accent" data-next>下一步</button></div>`;
      host.append(panel);
      const trigger = page.querySelector("#step-trigger");
      const view = panel.querySelector("[data-view]");
      const title = panel.querySelector("[data-step-title]");
      const steps = [
        { title: "第 1 步 · 选日期", html: `<p class="ov-step-copy">下周六，下午两点。展厅里人不多，适合慢慢看。</p><div class="ov-chips"><span class="on">周六 14:00</span><span>周日 11:00</span></div>` },
        { title: "第 2 步 · 选人数", html: `<p class="ov-step-copy">这次几个人一起？</p><div class="ov-chips"><span>1 人</span><span class="on">2 人</span><span>3 人</span><span>4 人</span></div>` },
        { title: "第 3 步 · 确认", html: `<p class="ov-step-copy">周六 14:00 · 2 人。确认后会把票放进你的票夹。</p><div class="ov-ticket-mini"><b>SAT 14:00</b><span>2 人 · 三层展厅</span></div>` },
        { title: "完成", html: `<div class="ov-done"><b>✓</b><p>预约已保存。周六见。</p></div>` }
      ];
      let current = 0;
      const render = () => {
        title.textContent = steps[current].title;
        view.innerHTML = steps[current].html;
        panel.querySelector("[data-prev]").disabled = current === 0;
        panel.querySelector("[data-next]").textContent = current === steps.length - 1 ? "完成" : "下一步";
        view.animate?.([{ opacity: 0, transform: "translateX(14px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 260, easing: "ease-out" });
      };
      const set = (open) => {
        panel.classList.toggle("open", open);
        if (!open) {
          current = 0;
          render();
          trigger.focus({ preventScroll: true });
          setStatus(ui, "弹窗已关闭，回到第一步");
        } else {
          setStatus(ui, "已打开第 1 步");
        }
      };
      bind(bag, trigger, "click", () => { set(true); });
      bind(bag, panel.querySelector(".ov-close"), "click", () => set(false));
      bind(bag, panel.querySelector("[data-next]"), "click", () => {
        if (current < steps.length - 1) {
          current += 1;
          render();
          setStatus(ui, "进入" + steps[current].title);
        } else {
          set(false);
        }
      });
      bind(bag, panel.querySelector("[data-prev]"), "click", () => {
        if (current > 0) { current -= 1; render(); setStatus(ui, "回到" + steps[current].title); }
      });
      render();
    }

    if (variant === "photo") {
      page.innerHTML = `<div class="ov-photo"><span class="mono">PHOTO / 01</span><b>雨后的<br>混凝土</b></div>`;
      const panel = document.createElement("div");
      panel.className = "ov-photo-panel";
      panel.innerHTML = `<div class="ov-handle" data-handle><i></i></div><div class="ov-sheet-head"><b>照片说明</b><button type="button" class="ov-close" aria-label="收起">×</button></div><p>拍摄于 10 月 18 日，雨后。面板升起时会压住照片下沿；向上拖，照片缩成窄条。</p><div class="ov-photo-tags"><span>建筑</span><span>自然光</span><span>低饱和</span></div>`;
      host.append(panel);
      const photo = page.querySelector(".ov-photo");
      let height = 240;
      let open = false;
      const apply = (h) => {
        height = clamp(h, 120, 300);
        photo.style.height = height + "px";
      };
      bind(bag, panel.querySelector(".ov-close"), "click", () => {
        open = false;
        panel.classList.remove("open");
        apply(240);
        setStatus(ui, "照片已铺开");
      });
      let drag = null;
      bind(bag, panel, "pointerdown", (event) => {
        if (event.target.closest("button")) return;
        drag = { y: event.clientY, height };
        panel.setPointerCapture(event.pointerId);
      });
      bind(bag, panel, "pointermove", (event) => {
        if (!drag) return;
        apply(drag.height - (event.clientY - drag.y));
      });
      bind(bag, panel, "pointerup", () => {
        if (!drag) return;
        open = height > 170;
        panel.classList.toggle("open", open);
        apply(open ? 140 : 240);
        setStatus(ui, open ? "面板展开，照片缩成窄条" : "照片重新铺开");
        drag = null;
      });
      // Start open so the first view shows the interaction.
      timer(bag, () => { panel.classList.add("open"); apply(140); }, 120);
    }

    if (variant === "checkout") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">购物袋</span></div>
        <h5 class="ov-title">两件，够了。</h5>
        <div class="ov-cart"><div><span>亚麻衬衫</span><small>M · 燕麦色</small></div><b>¥320</b></div>
        <div class="ov-cart"><div><span>手工陶杯</span><small>1 只 · 米白</small></div><b>¥168</b></div>
        <p class="ov-copy">清单从结算栏上方展开，栏本身不移动。合计始终可见。</p>`;
      const bar = document.createElement("div");
      bar.className = "ov-checkout";
      bar.innerHTML = `<div class="ov-checkout-list"><div class="ov-cart"><div><span>亚麻衬衫</span><small>× 1</small></div><b>¥320</b></div><div class="ov-cart"><div><span>手工陶杯</span><small>× 1</small></div><b>¥168</b></div><div class="ov-checkout-total"><span>合计</span><b>¥488</b></div></div><button type="button" class="ov-checkout-bar" aria-expanded="false"><span><small>2 件</small><b>¥488</b></span><em>去结算</em></button>`;
      host.append(bar);
      const button = bar.querySelector(".ov-checkout-bar");
      bind(bag, button, "click", () => {
        const open = bar.classList.toggle("open");
        button.setAttribute("aria-expanded", String(open));
        setStatus(ui, open ? "清单已展开" : "清单已收起");
      });
    }

    if (variant === "category") {
      const cats = ["全部", "建筑", "平面", "产品", "动效", "摄影", "字体", "插画", "空间", "材料", "声音", "文本"];
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">分类</span></div>
        <h5 class="ov-title">从一个词开始。</h5>
        <div class="ov-cat-single" data-single><span>建筑</span><span>平面</span><span>产品</span><span>动效</span><button type="button" data-more>更多 +</button></div>
        <div class="ov-cat-grid" data-grid>${cats.map((cat) => `<button type="button" data-cat="${cat}" aria-pressed="${cat === "建筑"}">${cat}</button>`).join("")}</div>
        <p class="ov-hint">展开成网格后，选一个分类，网格收回并让选中项居中。</p>`;
      const grid = page.querySelector("[data-grid]");
      const more = page.querySelector("[data-more]");
      const single = page.querySelector("[data-single]");
      bind(bag, more, "click", () => {
        page.classList.toggle("cats-open");
        more.textContent = page.classList.contains("cats-open") ? "收起 −" : "更多 +";
        setStatus(ui, page.classList.contains("cats-open") ? "分类网格已展开" : "分类已收回");
      });
      bind(bag, grid, "click", (event) => {
        const button = event.target.closest("[data-cat]");
        if (!button) return;
        grid.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        page.classList.remove("cats-open");
        more.textContent = "更多 +";
        single.querySelectorAll("span").forEach((span, index) => {
          if (index === 2) span.textContent = button.dataset.cat;
        });
        button.scrollIntoView({ block: "nearest", inline: "center" });
        setStatus(ui, "已选择「" + button.dataset.cat + "」");
      });
    }

    if (variant === "calendar") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">日期</span></div>
        <h5 class="ov-title">定在哪一天？</h5>
        <button type="button" class="ov-date-trigger" id="date-trigger" aria-haspopup="dialog" aria-expanded="false"><span>2026 年 10 月 29 日</span><i aria-hidden="true">▾</i></button>
        <p class="ov-copy">日历从标签下方展开，选中后收回并更新文字。方向键可以移动日期。</p>`;
      const trigger = page.querySelector("#date-trigger");
      const pop = document.createElement("div");
      pop.className = "ov-calendar";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", "选择日期");
      const days = ["一", "二", "三", "四", "五", "六", "日"];
      let selected = 29;
      const render = () => {
        const offset = 3; // Oct 1 2026 is Thursday; Monday-first grid starts Sep 28.
        const cells = [];
        for (let i = 0; i < offset; i += 1) cells.push({ label: 28 + i, muted: true, day: 28 + i });
        for (let i = 1; i <= 31; i += 1) cells.push({ label: i, muted: false, day: i });
        pop.innerHTML = `<div class="ov-cal-head"><button type="button" aria-label="上个月">‹</button><b>2026 年 10 月</b><button type="button" aria-label="下个月">›</button></div><div class="ov-cal-days">${days.map((day) => `<span>${day}</span>`).join("")}</div><div class="ov-cal-grid">${cells.map((cell) => `<button type="button" class="${cell.muted ? "muted" : ""} ${cell.day === selected ? "selected" : ""}" data-day="${cell.day}" ${cell.muted ? "disabled" : ""}>${cell.label}</button>`).join("")}</div>`;
        pop.querySelectorAll("[data-day]").forEach((button) => {
          button.addEventListener("click", () => {
            selected = Number(button.dataset.day);
            trigger.querySelector("span").textContent = `2026 年 10 月 ${selected} 日`;
            pop.classList.remove("open");
            trigger.setAttribute("aria-expanded", "false");
            trigger.focus({ preventScroll: true });
            setStatus(ui, "已选择 10 月 " + selected + " 日");
          });
        });
      };
      render();
      host.append(pop);
      bind(bag, trigger, "click", () => {
        const open = pop.classList.toggle("open");
        trigger.setAttribute("aria-expanded", String(open));
        if (open) {
          const selectedButton = pop.querySelector(".selected");
          selectedButton?.focus({ preventScroll: true });
          setStatus(ui, "日历已展开");
        }
      });
    }

    if (variant === "confirm") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">设置</span></div>
        <h5 class="ov-title">清理缓存？</h5>
        <p class="ov-copy">确认后不打开新弹窗，而是在原地切换成完成状态。取消则收回原按钮。</p>
        ${makeTrigger("清理 248 MB 缓存", "confirm-trigger")}`;
      const dialog = document.createElement("div");
      dialog.className = "ov-dialog";
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "confirm-title");
      dialog.innerHTML = `<h6 id="confirm-title">确定清理缓存？</h6><p>本地草稿不会删除，只清理图片缓存。</p><div class="ov-dialog-actions"><button type="button" class="stage-action ghost" data-cancel>取消</button><button type="button" class="stage-action accent" data-ok>确认清理</button></div><div class="ov-dialog-done"><b>✓</b><span>已清理 248 MB</span></div>`;
      host.append(dialog);
      const trigger = page.querySelector("#confirm-trigger");
      const show = () => {
        dialog.classList.add("open");
        scrim.classList.add("open");
        dialog.classList.remove("done");
        if (!prefersReduced()) {
          dialog.animate([
            { transform: "translate(-50%,-46%) scale(.94)", opacity: 0 },
            { transform: "translate(-50%,-50%) scale(1.02)", opacity: 1 },
            { transform: "translate(-50%,-50%) scale(1)", opacity: 1 }
          ], { duration: 380, easing: "cubic-bezier(.16,1.3,.3,1)" });
        }
        dialog.querySelector("[data-ok]").focus({ preventScroll: true });
        setStatus(ui, "确认弹窗已打开");
      };
      const hide = () => {
        dialog.classList.remove("open");
        scrim.classList.remove("open");
        trigger.focus({ preventScroll: true });
      };
      bind(bag, trigger, "click", show);
      bind(bag, dialog.querySelector("[data-cancel]"), "click", () => { hide(); setStatus(ui, "已取消"); });
      bind(bag, dialog.querySelector("[data-ok]"), "click", () => {
        dialog.classList.add("done");
        setStatus(ui, "清理完成 · 弹窗原地变成完成态");
        timer(bag, hide, 1600);
      });
    }

    if (variant === "tooltip") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">设置</span></div>
        <h5 class="ov-title">一个很小的说明。</h5>
        <p class="ov-copy">气泡带指向箭头，出现在目标上方，数秒后自动收回。悬停或聚焦时暂停计时。</p>
        <div class="ov-tooltip-wrap"><button type="button" class="ov-icon-button" id="tip-target" aria-describedby="tip">?</button><span class="ov-tooltip" id="tip" role="tooltip">这会把当前设置同步到所有设备。箭头始终指向目标。</span></div>`;
      const target = page.querySelector("#tip-target");
      const tip = page.querySelector("#tip");
      let timerId = 0;
      const show = () => {
        clearTimeout(timerId);
        tip.classList.add("show");
        setStatus(ui, "气泡已显示，3 秒后收回");
        timerId = setTimeout(hide, 3000);
      };
      const hide = () => {
        clearTimeout(timerId);
        tip.classList.remove("show");
      };
      bind(bag, target, "click", show);
      bind(bag, target, "pointerenter", show);
      bind(bag, target, "pointerleave", () => timer(bag, hide, 900));
      bind(bag, target, "focus", show);
      bind(bag, target, "blur", hide);
    }

    if (variant === "timer") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">专注</span></div>
        <div class="ov-timer" data-timer>
          <button type="button" class="ov-timer-bar" data-timer-toggle aria-expanded="false"><span class="mono">FOCUS</span><b data-clock>25:00</b><small>点击展开</small></button>
          <div class="ov-timer-card"><p>离开页面时，计时条会横向撑开显示剩余时间；数秒无操作自动收回。</p><div class="ov-timer-actions"><button type="button" class="stage-action ghost" data-pause>暂停</button><button type="button" class="stage-action accent" data-finish>结束</button></div></div>
        </div>
        <p class="ov-copy">计时基于真实时间戳；页面不可见时也不会停走。</p>`;
      const timerEl = page.querySelector("[data-timer]");
      const toggle = page.querySelector("[data-timer-toggle]");
      const clock = page.querySelector("[data-clock]");
      let seconds = 25 * 60;
      let running = true;
      let idle = 0;
      const paint = () => {
        clock.textContent = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
      };
      const collapse = () => {
        timerEl.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      };
      const armIdle = () => {
        clearTimeout(idle);
        idle = setTimeout(() => { collapse(); setStatus(ui, "数秒无操作，计时条已收回"); }, 5000);
      };
      bind(bag, toggle, "click", () => {
        const open = timerEl.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        if (open) { armIdle(); setStatus(ui, "计时卡已展开"); }
        else { clearTimeout(idle); setStatus(ui, "计时卡已收回"); }
      });
      bind(bag, page.querySelector("[data-pause]"), "click", (event) => {
        running = !running;
        event.target.textContent = running ? "暂停" : "继续";
        armIdle();
        setStatus(ui, running ? "计时继续" : "计时已暂停");
      });
      bind(bag, page.querySelector("[data-finish]"), "click", () => { running = false; seconds = 0; paint(); setStatus(ui, "本轮已结束"); });
      const interval = setInterval(() => { if (running && seconds > 0) { seconds -= 1; paint(); } }, 1000);
      bag.push(() => clearInterval(interval));
      bag.push(() => clearTimeout(idle));
      paint();
    }

    if (variant === "weather") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">天气</span></div>
        <div class="ov-weather" data-weather>
          <div class="ov-weather-bar" data-weather-bar><span>杭州 · 多云</span><b>19°</b><small>下拉看逐小时</small></div>
          <div class="ov-weather-more"><div><span>14:00</span><b>21°</b><small>晴</small></div><div><span>15:00</span><b>22°</b><small>晴</small></div><div><span>16:00</span><b>21°</b><small>少云</small></div><div><span>17:00</span><b>19°</b><small>多云</small></div><div><span>18:00</span><b>18°</b><small>阴</small></div></div>
        </div>
        <p class="ov-copy">下拉跟手展开逐小时天气，上划收起。收起时仍显示当前温度。</p>`;
      const weather = page.querySelector("[data-weather]");
      const bar = page.querySelector("[data-weather-bar]");
      let drag = null;
      let open = false;
      bind(bag, bar, "pointerdown", (event) => {
        drag = { y: event.clientY };
        bar.setPointerCapture(event.pointerId);
      });
      bind(bag, bar, "pointermove", (event) => {
        if (!drag) return;
        const delta = event.clientY - drag.y;
        bar.style.transform = `translateY(${clamp(delta, 0, 90)}px)`;
      });
      bind(bag, bar, "pointerup", (event) => {
        if (!drag) return;
        const delta = event.clientY - drag.y;
        bar.style.transform = "";
        open = delta > 35 ? true : delta < -30 ? false : open;
        weather.classList.toggle("open", open);
        setStatus(ui, open ? "逐小时天气已展开" : "天气条已收起");
        drag = null;
      });
      bind(bag, bar, "click", () => {
        open = !open;
        weather.classList.toggle("open", open);
        setStatus(ui, open ? "逐小时天气已展开" : "天气条已收起");
      });
    }

    if (variant === "buttonMenu") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">项目</span></div>
        <h5 class="ov-title">一个按钮，<br>几种动作。</h5>
        <p class="ov-copy">菜单以按钮为原点展开，点击外部或 Esc 原路收回。</p>
        <div class="ov-menu-wrap"><button type="button" class="ov-trigger" id="menu-trigger" aria-haspopup="menu" aria-expanded="false">更多动作 <span aria-hidden="true">⋯</span></button><div class="ov-menu" role="menu"><button type="button" role="menuitem">重命名</button><button type="button" role="menuitem">复制链接</button><button type="button" role="menuitem">导出</button><button type="button" role="menuitem" class="danger">删除</button></div></div>`;
      const trigger = page.querySelector("#menu-trigger");
      const menu = page.querySelector(".ov-menu");
      const set = (open) => {
        menu.classList.toggle("open", open);
        trigger.setAttribute("aria-expanded", String(open));
        if (open) menu.querySelector("button").focus({ preventScroll: true });
        else trigger.focus({ preventScroll: true });
      };
      bind(bag, trigger, "click", (event) => { event.stopPropagation(); set(!menu.classList.contains("open")); });
      bind(bag, page, "click", (event) => { if (!event.target.closest(".ov-menu-wrap")) set(false); });
      bind(bag, page, "keydown", (event) => { if (event.key === "Escape") set(false); });
      bind(bag, menu, "click", (event) => {
        const item = event.target.closest("[role=menuitem]");
        if (item) { set(false); setStatus(ui, "已选择「" + item.textContent + "」"); }
      });
    }

    if (variant === "cardDetail") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">项目</span></div>
        <h5 class="ov-title">从卡片里长出来。</h5>
        <button type="button" class="ov-project-card" id="detail-card"><span class="mono">PROJECT / 07</span><b>慢半拍</b><small>展览视觉系统</small></button>
        <p class="ov-copy">点击后从原位置放大为居中面板，关闭时缩回。焦点进入面板并循环。</p>`;
      const card = page.querySelector("#detail-card");
      const panel = document.createElement("div");
      panel.className = "ov-detail";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "项目详情");
      panel.innerHTML = `<button type="button" class="ov-close" aria-label="关闭" data-focus>×</button><span class="mono">PROJECT / 07</span><h6>慢半拍</h6><p>为一个慢节奏的展览做的视觉系统：低饱和、宽字距、留白比信息多。</p><div class="ov-detail-tags"><span>展览</span><span>视觉系统</span><span>2026</span></div>`;
      host.append(panel);
      const open = () => {
        panel.classList.add("open");
        scrim.classList.add("open");
        if (!prefersReduced()) {
          const stageRect = stage.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          panel.animate([
            { transform: `translate(${cardRect.left - stageRect.left - 60}px, ${cardRect.top - stageRect.top - 60}px) scale(.3)`, opacity: 0, borderRadius: "16px" },
            { transform: "translate(0,0) scale(1)", opacity: 1, borderRadius: "18px" }
          ], { duration: 420, easing: "cubic-bezier(.16,1.2,.3,1)" });
        }
        panel.querySelector("[data-focus]").focus({ preventScroll: true });
        setStatus(ui, "详情已展开");
      };
      const close = () => {
        panel.classList.remove("open");
        scrim.classList.remove("open");
        card.focus({ preventScroll: true });
        setStatus(ui, "详情已收回");
      };
      bind(bag, card, "click", open);
      bind(bag, panel.querySelector(".ov-close"), "click", close);
      bind(bag, stage, "keydown", (event) => { if (event.key === "Escape" && panel.classList.contains("open")) close(); });
    }

    if (variant === "drawer") {
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">导航</span></div>
        <h5 class="ov-title">让页面，<br>往旁边站。</h5>
        <p class="ov-copy">面板从左侧滑入，主页面右移缩小；点击主页面复原。</p>
        ${makeTrigger("打开导航", "drawer-trigger")}`;
      const drawer = document.createElement("div");
      drawer.className = "ov-drawer";
      drawer.innerHTML = `<div class="ov-sheet-head"><b>导航</b><button type="button" class="ov-close" aria-label="关闭">×</button></div><nav><button type="button" class="on">今天</button><button type="button">本周</button><button type="button">归档</button><button type="button">设置</button></nav><p class="mono">MAKE ROOM FOR THE MENU</p>`;
      host.append(drawer);
      const trigger = page.querySelector("#drawer-trigger");
      let isOpen = false;
      const set = (open) => {
        isOpen = open;
        drawer.classList.toggle("open", open);
        page.classList.toggle("pushed", open);
        scrim.classList.toggle("open", open);
        setStatus(ui, open ? "抽屉打开，页面让位" : "页面已复原");
        if (open) drawer.querySelector(".ov-close").focus({ preventScroll: true });
        else trigger.focus({ preventScroll: true });
      };
      bind(bag, trigger, "click", () => set(true));
      bind(bag, drawer.querySelector(".ov-close"), "click", () => set(false));
      bind(bag, page, "click", () => { if (isOpen) set(false); });
    }

    if (variant === "selectAlign") {
      const options = ["设计系统", "动效工程", "组件工程", "页面规划", "视觉方向", "无障碍复核", "手机模式", "交互规格"];
      page.innerHTML = `
        <div class="ov-top"><span>09:41</span><span class="mono">选择</span></div>
        <h5 class="ov-title">对齐，<br>不是从头顶开始。</h5>
        <p class="ov-copy">列表以当前选中项为中心对齐，选中后收回并更新框内文字。</p>
        <button type="button" class="ov-select-trigger" id="select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>动效工程</span><i aria-hidden="true">▾</i></button>`;
      const trigger = page.querySelector("#select-trigger");
      const list = document.createElement("div");
      list.className = "ov-select-list";
      list.setAttribute("role", "listbox");
      let selected = 1;
      const render = () => {
        list.innerHTML = options.map((option, index) => `<button type="button" role="option" aria-selected="${index === selected}" data-i="${index}"><span>${option}</span><i>${index === selected ? "✓" : ""}</i></button>`).join("");
        list.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
          selected = Number(button.dataset.i);
          trigger.querySelector("span").textContent = options[selected];
          list.classList.remove("open");
          trigger.setAttribute("aria-expanded", "false");
          trigger.focus({ preventScroll: true });
          setStatus(ui, "已选择「" + options[selected] + "」");
        }));
      };
      render();
      host.append(list);
      bind(bag, trigger, "click", () => {
        const open = list.classList.toggle("open");
        trigger.setAttribute("aria-expanded", String(open));
        if (open) {
          const selectedButton = list.querySelector('[aria-selected="true"]');
          const listRect = list.getBoundingClientRect();
          const buttonRect = selectedButton.getBoundingClientRect();
          list.scrollTop = selectedButton.offsetTop - list.clientHeight / 2 + buttonRect.height / 2;
          setStatus(ui, "列表已对齐到当前选中项");
        }
      });
    }

    bind(bag, stage, "keydown", (event) => {
      if (event.key === "Escape") {
        const openPanel = host.querySelector(".open, .ov-sheet.open");
        if (openPanel) {
          openPanel.classList.remove("open");
          scrim.classList.remove("open");
          setStatus(ui, "已关闭");
        }
      }
    });
    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     8. CARD LAB
     ============================================================ */
  S.cardLab = function (root, variant) {
    const bag = [];
    const titles = {
      stack: "卡片堆叠层级", delete: "卡片沿曲线飞向删除", fullscreen: "卡片展开成全屏详情", flip: "立体翻面卡片",
      snap: "横滑吸附卡片", shared: "共享元素转场", dragSheet: "底部把手拖拽展开", flyDock: "加号卡片飞入底栏"
    };
    const ui = shell(root, {
      kicker: "MOBILE / CARD",
      title: titles[variant] || "卡片实验室",
      note: "卡片不是盒子<br>它有位置和去向",
      status: ""
    });
    const body = ui.body;

    if (variant === "stack") {
      const cards = [
        { no: "01", title: "雨后的混凝土", meta: "建筑 · 10 月 18 日" },
        { no: "02", title: "把光留在墙上", meta: "摄影 · 10 月 11 日" },
        { no: "03", title: "慢一点也没关系", meta: "随笔 · 10 月 03 日" },
        { no: "04", title: "一张没有名字的椅子", meta: "产品 · 09 月 26 日" }
      ];
      body.innerHTML = `<div class="stack-stage" data-stack>
        <div class="stack-cards" data-cards></div>
        <div class="stack-actions"><button type="button" class="stage-action ghost" data-prev>上一张</button><button type="button" class="stage-action accent" data-next>下一张 ↑</button></div>
      </div>`;
      const stageEl = body.querySelector("[data-stack]");
      let index = 0;
      const render = () => {
        const wrap = body.querySelector("[data-cards]");
        wrap.innerHTML = cards.map((card, i) => {
          const offset = (i - index + cards.length) % cards.length;
          const visible = offset < 3;
          return `<article class="stack-card ${offset === 0 ? "top" : ""}" style="--o:${offset}; opacity:${visible ? 1 : 0}; pointer-events:${offset === 0 ? "auto" : "none"}" aria-hidden="${visible ? "false" : "true"}">
            <span class="mono">${card.no} / 04</span><h5>${card.title}</h5><small>${card.meta}</small>
            <i class="stack-corner" aria-hidden="true"></i>
          </article>`;
        }).join("");
        body.querySelector("[data-cards]").style.setProperty("--index", index);
        setStatus(ui, "余下 " + (cards.length - index) + " 张");
      };
      bind(bag, body.querySelector("[data-next]"), "click", () => {
        index = Math.min(cards.length - 1, index + 1);
        render();
        animate(body.querySelector(".stack-card.top"), [
          { transform: "translateY(0) rotate(0)", opacity: 1 },
          { transform: "translateY(-140px) rotate(-8deg)", opacity: 0 }
        ], { duration: 360, easing: "cubic-bezier(.22,.75,.25,1)" });
      });
      bind(bag, body.querySelector("[data-prev]"), "click", () => {
        index = Math.max(0, index - 1);
        render();
      });
      bind(bag, body, "click", (event) => {
        if (event.target.closest(".stack-card.top")) body.querySelector("[data-next]").click();
      });
      render();
    }

    if (variant === "delete") {
      const items = [
        { id: 1, title: "草稿 · 未命名", meta: "刚刚编辑" },
        { id: 2, title: "灵感 · 三张图", meta: "昨天" },
        { id: 3, title: "旧版本 · 09/28", meta: "上周" }
      ];
      body.innerHTML = `<div class="delete-stage">
        <div class="delete-target" aria-hidden="true">⌫</div>
        <div class="delete-list" data-list>${items.map((item) => `
          <div class="delete-card" data-id="${item.id}"><div><b>${item.title}</b><small>${item.meta}</small></div><button type="button" aria-label="删除 ${item.title}">×</button></div>`).join("")}</div>
        <button type="button" class="stage-action ghost" data-reset>恢复全部</button>
      </div>`;
      let current = items.slice();
      const render = () => {
        body.querySelector("[data-list]").innerHTML = current.map((item) => `
          <div class="delete-card" data-id="${item.id}"><div><b>${item.title}</b><small>${item.meta}</small></div><button type="button" aria-label="删除 ${item.title}">×</button></div>`).join("");
        if (!current.length) body.querySelector("[data-list]").innerHTML = `<p class="delete-empty">都删掉了。撤销入口在真实产品里应该保留。</p>`;
      };
      const remove = (card) => {
        const target = body.querySelector(".delete-target").getBoundingClientRect();
        const rect = card.getBoundingClientRect();
        const dx = target.left + target.width / 2 - (rect.left + rect.width / 2);
        const dy = target.top + target.height / 2 - (rect.top + rect.height / 2);
        card.style.pointerEvents = "none";
        const anim = card.animate([
          { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
          { transform: `translate(${dx * .55}px, ${dy * .35 - 26}px) scale(.82) rotate(4deg)`, opacity: .85, offset: .55 },
          { transform: `translate(${dx}px, ${dy}px) scale(.16) rotate(12deg)`, opacity: 0 }
        ], { duration: 520, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
        anim.finished.then(() => {
          current = current.filter((item) => item.id !== Number(card.dataset.id));
          render();
          body.querySelector(".delete-target").classList.add("catch");
          setTimeout(() => body.querySelector(".delete-target").classList.remove("catch"), 300);
          setStatus(ui, "已删除，可在真实产品里提供撤销");
        }).catch(() => {});
      };
      bind(bag, body, "click", (event) => {
        const button = event.target.closest(".delete-card button");
        if (button) remove(button.closest(".delete-card"));
      });
      bind(bag, body.querySelector("[data-reset]"), "click", () => { current = items.slice(); render(); setStatus(ui, "列表已恢复"); });
      render();
    }

    if (variant === "fullscreen") {
      body.innerHTML = `<div class="full-stage">
        <div class="full-grid">
          <button type="button" class="full-card" data-card="0"><span class="full-cover cover-a"></span><b>雨后的混凝土</b><small>建筑 · 10 月 18 日</small></button>
          <button type="button" class="full-card" data-card="1"><span class="full-cover cover-b"></span><b>把光留在墙上</b><small>摄影 · 10 月 11 日</small></button>
        </div>
        <div class="full-detail" data-detail>
          <div class="full-detail-cover cover-a"></div>
          <button type="button" class="ov-close" data-close aria-label="关闭">×</button>
          <div class="full-detail-copy"><span class="mono">ARCHIVE / 01</span><h5>雨后的混凝土</h5><p>下过雨之后，墙面把光收进去，又慢慢吐出来。这组照片想保留的，是那种不急着被看完的质感。</p><small>下拉或按 Esc 关闭</small></div>
        </div>
      </div>`;
      const detail = body.querySelector("[data-detail]");
      const close = () => { detail.classList.remove("open"); setStatus(ui, "已缩回原卡片"); };
      bind(bag, body, "click", (event) => {
        const card = event.target.closest(".full-card");
        if (card) {
          detail.classList.add("open");
          detail.querySelector(".ov-close").focus({ preventScroll: true });
          setStatus(ui, "卡片已展开为详情");
        }
      });
      bind(bag, body.querySelector("[data-close]"), "click", close);
      let startY = 0;
      bind(bag, detail, "pointerdown", (event) => { if (event.target.closest(".ov-close")) return; startY = event.clientY; });
      bind(bag, detail, "pointerup", (event) => { if (event.clientY - startY > 70) close(); });
      bind(bag, body, "keydown", (event) => { if (event.key === "Escape") close(); });
    }

    if (variant === "flip") {
      body.innerHTML = `<div class="flip-stage">
        <button type="button" class="flip-card" data-flip aria-pressed="false" aria-label="翻转卡片">
          <span class="flip-inner">
            <span class="flip-face flip-front"><span class="mono">FRONT / 01</span><b>慢半拍</b><small>点击翻面</small></span>
            <span class="flip-face flip-back"><span class="mono">BACK / 01</span><b>慢一点，<br>也能到。</b><small>2026 · 秋季展</small></span>
          </span>
          <i class="flip-gloss" aria-hidden="true"></i>
        </button>
        <p class="fb-note">背面内容不镜像；指针移动时高光跟着走。</p>
      </div>`;
      const card = body.querySelector("[data-flip]");
      bind(bag, card, "click", () => {
        const next = card.getAttribute("aria-pressed") !== "true";
        card.setAttribute("aria-pressed", String(next));
        card.classList.toggle("flipped", next);
        setStatus(ui, next ? "已翻到背面" : "已翻回正面");
      });
      bind(bag, card, "pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width * 100) + "%");
        card.style.setProperty("--my", ((event.clientY - rect.top) / rect.height * 100) + "%");
      });
      bind(bag, card, "keydown", (event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); card.click(); } });
    }

    if (variant === "snap") {
      const cards = [
        { title: "窄门", meta: "01 / 04", cls: "cover-a" },
        { title: "长桌", meta: "02 / 04", cls: "cover-b" },
        { title: "空房", meta: "03 / 04", cls: "cover-c" },
        { title: "回声", meta: "04 / 04", cls: "cover-d" }
      ];
      body.innerHTML = `<div class="snap-stage2">
        <div class="snap-carousel" data-carousel>${cards.map((card) => `<article class="snap-card2"><span class="snap-cover ${card.cls}"></span><b>${card.title}</b><small>${card.meta}</small></article>`).join("")}</div>
        <div class="snap-dots" data-dots>${cards.map((card, index) => `<button type="button" aria-label="第 ${index + 1} 张" aria-pressed="${index === 0}" data-dot="${index}"></button>`).join("")}</div>
        <p class="fb-note">松手吸附到完整卡片，相邻卡片保留一部分预览。</p>
      </div>`;
      const carousel = body.querySelector("[data-carousel]");
      const dots = Array.from(body.querySelectorAll("[data-dot]"));
      const cardsEls = Array.from(carousel.querySelectorAll(".snap-card2"));
      const sync = () => {
        const width = carousel.clientWidth;
        const index = Math.round(carousel.scrollLeft / (width * .86));
        dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === index)));
        setStatus(ui, "第 " + (index + 1) + " 张");
      };
      bind(bag, carousel, "scroll", () => { clearTimeout(carousel._t); carousel._t = setTimeout(sync, 80); });
      dots.forEach((dot, index) => bind(bag, dot, "click", () => {
        carousel.scrollTo({ left: cardsEls[index].offsetLeft - 8, behavior: prefersReduced() ? "auto" : "smooth" });
      }));
      bind(bag, carousel, "keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const current = dots.findIndex((dot) => dot.getAttribute("aria-pressed") === "true");
        const next = clamp(current + (event.key === "ArrowRight" ? 1 : -1), 0, cards.length - 1);
        carousel.scrollTo({ left: cardsEls[next].offsetLeft - 8, behavior: prefersReduced() ? "auto" : "smooth" });
      });
      timer(bag, sync, 100);
    }

    if (variant === "shared") {
      body.innerHTML = `<div class="shared-stage">
        <button type="button" class="shared-card" data-shared>
          <span class="shared-cover cover-b"></span>
          <span class="shared-copy"><span class="mono">FEATURE / 02</span><b>把光留在墙上</b><small>点击展开详情</small></span>
        </button>
        <div class="shared-detail" data-detail aria-hidden="true">
          <div class="shared-detail-cover cover-b"></div>
          <button type="button" class="ov-close" data-close aria-label="关闭">×</button>
          <div class="shared-detail-copy"><span class="mono">FEATURE / 02</span><h5>把光留在墙上</h5><p>同一个标题和封面，从卡片位置连续移动到详情中的对应位置。文字不做整体缩放，只改变位置与容器。</p></div>
        </div>
      </div>`;
      const card = body.querySelector("[data-shared]");
      const detail = body.querySelector("[data-detail]");
      const open = () => {
        detail.classList.add("open");
        detail.setAttribute("aria-hidden", "false");
        if (!prefersReduced()) {
          const stageRect = body.querySelector(".shared-stage").getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          detail.animate([
            { clipPath: `inset(${cardRect.top - stageRect.top}px ${stageRect.right - cardRect.right}px ${stageRect.bottom - cardRect.bottom}px ${cardRect.left - stageRect.left}px round 16px)`, opacity: .6 },
            { clipPath: "inset(0px 0px 0px 0px round 18px)", opacity: 1 }
          ], { duration: 520, easing: "cubic-bezier(.22,.75,.25,1)" });
        }
        detail.querySelector("[data-close]").focus({ preventScroll: true });
        setStatus(ui, "共享元素已从卡片移动到详情");
      };
      const close = () => { detail.classList.remove("open"); detail.setAttribute("aria-hidden", "true"); card.focus({ preventScroll: true }); setStatus(ui, "已回到卡片"); };
      bind(bag, card, "click", open);
      bind(bag, detail.querySelector("[data-close]"), "click", close);
      bind(bag, body, "keydown", (event) => { if (event.key === "Escape") close(); });
    }

    if (variant === "dragSheet") {
      body.innerHTML = `<div class="dragsheet-stage">
        <article class="dragsheet-card" data-card>
          <div class="dragsheet-cover cover-c"><span class="mono">PLAYLIST / 07</span><b>雨天工作歌单</b></div>
          <div class="dragsheet-handle" data-handle><i></i></div>
          <div class="dragsheet-body"><h5>雨天工作歌单</h5><p>12 首 · 48 分钟</p><div class="dragsheet-more"><p>向下拖动把手，内容高度跟手展开；松手按阈值吸附到展开或收起。</p><ul><li>01 雨落在窗上</li><li>02 慢速键盘</li><li>03 下午四点</li></ul></div></div>
        </article>
      </div>`;
      const card = body.querySelector("[data-card]");
      const handle = body.querySelector("[data-handle]");
      let startY = 0;
      let open = false;
      let base = 0;
      const set = (next) => {
        open = next;
        card.classList.toggle("open", open);
        setStatus(ui, open ? "已展开播放列表" : "已收起");
      };
      bind(bag, handle, "pointerdown", (event) => { startY = event.clientY; base = open ? 1 : 0; handle.setPointerCapture(event.pointerId); card.classList.add("dragging"); });
      bind(bag, handle, "pointermove", (event) => {
        if (!startY) return;
        const delta = event.clientY - startY;
        card.style.setProperty("--drag", clamp(delta, -80, 80) + "px");
      });
      bind(bag, handle, "pointerup", (event) => {
        if (!startY) return;
        const delta = event.clientY - startY;
        card.classList.remove("dragging");
        card.style.removeProperty("--drag");
        if (delta < -26) set(true);
        else if (delta > 26) set(false);
        else set(base === 1 ? open : !open);
        startY = 0;
      });
    }

    if (variant === "flyDock") {
      body.innerHTML = `<div class="fly-stage">
        <div class="fly-list">
          <article class="fly-card" data-fly><span class="mono">TRIP / 12</span><b>去海边</b><small>周六 · 08:00</small><button type="button" class="fly-add" aria-label="加入行程">＋</button></article>
        </div>
        <div class="fly-dock"><button type="button" class="fly-dock-btn" aria-label="行程"><span aria-hidden="true">◎</span><i data-badge>0</i></button></div>
      </div>`;
      const card = body.querySelector("[data-fly]");
      const add = body.querySelector(".fly-add");
      const badge = body.querySelector("[data-badge]");
      let count = 0;
      let busy = false;
      bind(bag, add, "click", () => {
        if (busy) return;
        busy = true;
        const target = body.querySelector(".fly-dock-btn").getBoundingClientRect();
        const rect = card.getBoundingClientRect();
        const clone = document.createElement("div");
        clone.className = "fly-clone";
        clone.style.left = rect.left + "px";
        clone.style.top = rect.top + "px";
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
        document.body.append(clone);
        const dx = target.left + target.width / 2 - (rect.left + rect.width / 2);
        const dy = target.top + target.height / 2 - (rect.top + rect.height / 2);
        clone.animate([
          { transform: "translate(0,0) scale(1)", borderRadius: "14px", opacity: 1 },
          { transform: `translate(${dx * .45}px, ${dy * .1 - 80}px) scale(.45)`, borderRadius: "40%", opacity: .9, offset: .55 },
          { transform: `translate(${dx}px, ${dy}px) scale(.06)`, borderRadius: "50%", opacity: 0 }
        ], { duration: 620, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" }).finished.then(() => {
          clone.remove();
          count += 1;
          badge.textContent = String(count);
          const dock = body.querySelector(".fly-dock-btn");
          dock.classList.add("bump");
          setTimeout(() => dock.classList.remove("bump"), 400);
          busy = false;
          setStatus(ui, "已加入行程 · " + count + " 项");
        }).catch(() => { busy = false; clone.remove(); });
      });
    }

    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     9. NAV LAB
     ============================================================ */
  S.navLab = function (root, variant) {
    const bag = [];
    const titles = { capsule: "底栏白色胶囊滑动", fab: "悬浮按钮随滚动收展", arc: "弧形快捷菜单", edgeBall: "吸边悬浮球", week: "横向周日期条", embedded: "底栏嵌主按钮" };
    const ui = shell(root, {
      kicker: "MOBILE / NAV",
      title: titles[variant] || "导航实验室",
      note: "导航要回答<br>我现在在哪里",
      status: ""
    });
    const body = ui.body;

    if (variant === "capsule") {
      const tabs = ["今天", "探索", "收藏", "我的"];
      body.innerHTML = `<div class="nav-phone">
        <div class="nav-screen"><h5 data-screen>今天</h5><p data-sub>把今天的事，放在眼前。</p><div class="nav-blocks"><span></span><span></span><span></span></div></div>
        <nav class="capsule-nav" aria-label="示例底部导航"><span class="capsule-pill" data-pill></span>${tabs.map((tab, index) => `<button type="button" aria-pressed="${index === 0}" data-tab="${index}"><i aria-hidden="true">${["○", "◇", "☆", "☺"][index]}</i><em>${tab}</em></button>`).join("")}</nav>
      </div>`;
      const nav = body.querySelector(".capsule-nav");
      const pill = body.querySelector("[data-pill]");
      const buttons = Array.from(nav.querySelectorAll("button"));
      const screen = body.querySelector("[data-screen]");
      const sub = body.querySelector("[data-sub]");
      const copy = ["把今天的事，放在眼前。", "去发现还没见过的。", "收好你舍不得丢的。", "你的偏好与设置。"];
      const set = (index) => {
        buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
        const width = 100 / tabs.length;
        pill.style.width = width + "%";
        pill.style.transform = `translateX(${index * 100}%)`;
        screen.textContent = tabs[index];
        sub.textContent = copy[index];
        setStatus(ui, "当前标签：" + tabs[index]);
      };
      buttons.forEach((button, index) => bind(bag, button, "click", () => set(index)));
      bind(bag, nav, "keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const current = buttons.findIndex((button) => button.getAttribute("aria-pressed") === "true");
        const next = (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
        set(next);
        buttons[next].focus();
      });
      set(0);
    }

    if (variant === "fab") {
      body.innerHTML = `<div class="fab-phone">
        <div class="fab-list" data-scroll>${Array.from({ length: 9 }, (_, index) => `<article><span class="mono">0${index + 1}</span><b>${["清晨的咖啡", "走到地铁口", "一封没写完的信", "午后的光", "把桌面收干净", "回一个电话", "读十页书", "散步二十分钟", "关掉通知"][index]}</b><small>轻点查看详情</small></article>`).join("")}</div>
        <button type="button" class="fab-button" data-fab><span aria-hidden="true">＋</span><em>记录</em></button>
      </div>`;
      const scroll = body.querySelector("[data-scroll]");
      const fab = body.querySelector("[data-fab]");
      let last = 0;
      bind(bag, scroll, "scroll", () => {
        const down = scroll.scrollTop > last;
        last = scroll.scrollTop;
        fab.classList.toggle("compact", down && scroll.scrollTop > 20);
        if (scroll.scrollTop < 8) fab.classList.remove("compact");
      });
      bind(bag, fab, "click", () => {
        setStatus(ui, fab.classList.contains("compact") ? "轻点展开，再点一次记录" : "已打开记录");
        if (fab.classList.contains("compact")) fab.classList.remove("compact");
      });
    }

    if (variant === "arc") {
      const items = [
        { icon: "✎", label: "写一条" },
        { icon: "▣", label: "传图" },
        { icon: "◷", label: "计时" },
        { icon: "♡", label: "收藏" }
      ];
      body.innerHTML = `<div class="arc-stage">
        <div class="arc-note"><span class="mono">QUICK ACTIONS</span><b>从右下角开始。</b><p>点击圆形按钮，图标沿弧线依次弹出；再次点击沿原路收回。</p></div>
        <div class="arc-wrap">
          ${items.map((item, index) => `<button type="button" class="arc-item" style="--i:${index}" data-item="${index}"><span>${item.icon}</span><em>${item.label}</em></button>`).join("")}
          <button type="button" class="arc-fab" data-arc aria-expanded="false" aria-label="打开快捷菜单"><span aria-hidden="true">＋</span></button>
        </div>
      </div>`;
      const fab = body.querySelector("[data-arc]");
      const wrap = body.querySelector(".arc-wrap");
      const set = (open) => {
        wrap.classList.toggle("open", open);
        fab.setAttribute("aria-expanded", String(open));
        setStatus(ui, open ? "快捷菜单已沿弧线展开" : "快捷菜单已收回");
      };
      bind(bag, fab, "click", () => set(!wrap.classList.contains("open")));
      body.querySelectorAll(".arc-item").forEach((item) => bind(bag, item, "click", () => {
        set(false);
        setStatus(ui, "已选择 " + item.querySelector("em").textContent);
      }));
      bind(bag, body, "keydown", (event) => { if (event.key === "Escape") set(false); });
    }

    if (variant === "edgeBall") {
      body.innerHTML = `<div class="ball-stage">
        <div class="ball-list" data-scroll>${Array.from({ length: 8 }, (_, index) => `<article><b>${["早上好", "今天的三件事", "午后提醒", "晚间回顾", "把通知关掉", "写一封短信", "整理相册", "早点睡"][index]}</b><small>滑动页面，看悬浮球半隐藏</small></article>`).join("")}</div>
        <button type="button" class="edge-ball" data-ball aria-label="快捷操作">＋</button>
        <div class="ball-menu" data-ballmenu><button type="button">新建</button><button type="button">搜索</button><button type="button">设置</button></div>
      </div>`;
      const stageEl = body.querySelector(".ball-stage");
      const ball = body.querySelector("[data-ball]");
      const menu = body.querySelector("[data-ballmenu]");
      const list = body.querySelector("[data-scroll]");
      let side = "right";
      let drag = null;
      let idle = 0;
      const place = (x, y) => {
        const rect = stageEl.getBoundingClientRect();
        ball.style.left = clamp(x, 8, rect.width - 52) + "px";
        ball.style.top = clamp(y, 8, rect.height - 52) + "px";
      };
      bind(bag, ball, "pointerdown", (event) => {
        drag = { x: event.clientX, y: event.clientY, bx: ball.offsetLeft, by: ball.offsetTop };
        ball.setPointerCapture(event.pointerId);
        ball.classList.add("dragging");
      });
      bind(bag, ball, "pointermove", (event) => {
        if (!drag) return;
        place(drag.bx + event.clientX - drag.x, drag.by + event.clientY - drag.y);
      });
      bind(bag, ball, "pointerup", () => {
        if (!drag) return;
        const rect = stageEl.getBoundingClientRect();
        side = ball.offsetLeft + 24 < rect.width / 2 ? "left" : "right";
        ball.classList.remove("dragging");
        ball.classList.add("snapped");
        place(side === "left" ? 10 : rect.width - 56, ball.offsetTop);
        setTimeout(() => ball.classList.remove("snapped"), 350);
        setStatus(ui, "悬浮球已吸附到" + (side === "left" ? "左" : "右") + "边缘");
        drag = null;
      });
      bind(bag, ball, "click", () => {
        if (drag) return;
        menu.classList.toggle("open");
        setStatus(ui, menu.classList.contains("open") ? "快捷菜单已打开" : "快捷菜单已关闭");
      });
      bind(bag, list, "scroll", () => {
        ball.classList.add("half");
        clearTimeout(idle);
        idle = setTimeout(() => ball.classList.remove("half"), 500);
      });
      bag.push(() => clearTimeout(idle));
    }

    if (variant === "week") {
      const days = ["一", "二", "三", "四", "五", "六", "日"];
      let week = 0;
      let selected = 3;
      body.innerHTML = `<div class="week-card">
        <div class="week-head"><button type="button" data-prev aria-label="上一周">‹</button><b data-month>2026 年 10 月</b><button type="button" data-next aria-label="下一周">›</button></div>
        <div class="week-strip" data-strip><span class="week-pill" data-pill></span>${days.map((day, index) => `<button type="button" aria-pressed="${index === selected}" data-day="${index}"><small>${day}</small><b>${26 + index}</b></button>`).join("")}</div>
        <p class="week-note" data-note>选中 10 月 29 日，星期四。</p>
      </div>`;
      const strip = body.querySelector("[data-strip]");
      const pill = body.querySelector("[data-pill]");
      const buttons = Array.from(strip.querySelectorAll("button"));
      const month = body.querySelector("[data-month]");
      const note = body.querySelector("[data-note]");
      const set = (index) => {
        selected = index;
        buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
        pill.style.width = `calc((100% - 16px) / 7)`;
        pill.style.transform = `translateX(${index * 100}%)`;
        month.textContent = `2026 年 ${10 + week} 月`;
        note.textContent = "选中 " + month.textContent + " " + (26 + index) + " 日，星期" + days[index] + "。";
        setStatus(ui, note.textContent);
      };
      buttons.forEach((button, index) => bind(bag, button, "click", () => set(index)));
      bind(bag, body.querySelector("[data-prev]"), "click", () => { week = Math.max(0, week - 1); selected = 0; set(0); });
      bind(bag, body.querySelector("[data-next]"), "click", () => { week = Math.min(3, week + 1); selected = 0; set(0); });
      set(selected);
    }

    if (variant === "embedded") {
      body.innerHTML = `<div class="embed-phone">
        <div class="embed-screen" data-screen><span class="mono">HOME / TODAY</span><h5>今天，<br>先做一件。</h5><p data-note>点击右下角的主按钮，随时回到首页并打开编辑。</p></div>
        <nav class="embed-nav" aria-label="示例底部导航"><button type="button" aria-pressed="true">今天</button><button type="button">日历</button><button type="button">我的</button><button type="button" class="embed-cta" data-cta aria-label="新建记录">＋</button></nav>
        <div class="embed-sheet" data-sheet><div class="ov-handle"><i></i></div><div class="ov-sheet-head"><b>新建记录</b><button type="button" class="ov-close" data-close aria-label="关闭">×</button></div><textarea placeholder="今天想记下什么？" aria-label="记录内容"></textarea><button type="button" class="stage-action accent">保存</button></div>
      </div>`;
      const sheet = body.querySelector("[data-sheet]");
      const screen = body.querySelector("[data-screen]");
      const note = body.querySelector("[data-note]");
      const set = (open) => {
        sheet.classList.toggle("open", open);
        screen.scrollTop = 0;
        setStatus(ui, open ? "已回到首页并打开编辑" : "编辑已关闭");
      };
      bind(bag, body.querySelector("[data-cta]"), "click", () => set(true));
      bind(bag, body.querySelector("[data-close]"), "click", () => set(false));
      body.querySelectorAll(".embed-nav button:not(.embed-cta)").forEach((button) => bind(bag, button, "click", () => {
        body.querySelectorAll(".embed-nav button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        screen.querySelector("h5").innerHTML = button.textContent === "日历" ? "这个月，<br>慢慢排。" : button.textContent === "我的" ? "你的，<br>都在这里。" : "今天，<br>先做一件。";
        setStatus(ui, "当前标签：" + button.textContent);
      }));
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     10. GESTURE LAB
     ============================================================ */
  S.gestureLab = function (root, variant) {
    const bag = [];
    const titles = {
      edgeBack: "边缘滑动返回，看速度", escape: "可逃逸按钮", diff: "只让变化的字动", axis: "横竖滑动锁定",
      catch: "接住飞出去的卡片", project: "松手前预知落点", rubber: "拉到头还能再拉"
    };
    const notes = {
      edgeBack: "快速外甩继续<br>往回带就取消", escape: "移出热区<br>就不提交",
      diff: "不变的字<br>保持不动", axis: "12px 内<br>锁定方向",
      catch: "触摸即接管<br>不让动画锁死", project: "拖拽中<br>预测落点",
      rubber: "越界有阻力<br>松手弹回"
    };
    const ui = shell(root, {
      kicker: "MOBILE / GESTURE",
      title: titles[variant] || "手势实验室",
      note: notes[variant] || "手指没松开<br>界面就要跟手",
      status: ""
    });
    const body = ui.body;

    if (variant === "edgeBack") {
      body.innerHTML = `<div class="gx-stage edge-stage" data-stage>
        <div class="edge-page" data-page><span class="mono">DETAIL / 04</span><h5>慢半拍<br>展览现场</h5><p>从左侧边缘向右拖，页面跟手返回。松手时看距离，也看速度。</p><div class="edge-shadow" data-shadow></div></div>
        <div class="edge-progress" data-progress><i></i></div>
        <div class="edge-hot" data-hot aria-hidden="true"></div>
        <button type="button" class="stage-action ghost edge-reset" data-reset>重新打开</button>
      </div>`;
      const stageEl = body.querySelector("[data-stage]");
      const page = body.querySelector("[data-page]");
      const shadow = body.querySelector("[data-shadow]");
      const progress = body.querySelector("[data-progress]");
      let drag = null;
      const reset = () => {
        page.style.transform = "";
        page.classList.remove("gone");
        shadow.style.opacity = "0";
        progress.style.opacity = "0";
        setStatus(ui, "从左侧边缘向右拖");
      };
      bind(bag, stageEl, "pointerdown", (event) => {
        const rect = stageEl.getBoundingClientRect();
        if (event.clientX - rect.left > 34) return;
        drag = { x: event.clientX, t: performance.now() };
        page.style.transition = "none";
        stageEl.setPointerCapture(event.pointerId);
      });
      bind(bag, stageEl, "pointermove", (event) => {
        if (!drag) return;
        const dx = clamp(event.clientX - drag.x, 0, stageEl.clientWidth);
        page.style.transform = `translateX(${dx}px)`;
        shadow.style.opacity = String(Math.min(.5, dx / stageEl.clientWidth));
        progress.style.opacity = "1";
        progress.querySelector("i").style.width = (dx / stageEl.clientWidth * 100) + "%";
        drag.dx = dx;
      });
      bind(bag, stageEl, "pointerup", () => {
        if (!drag) return;
        const velocity = (drag.dx || 0) / Math.max(1, performance.now() - drag.t);
        const commit = (drag.dx || 0) > stageEl.clientWidth * .34 || velocity > .55;
        page.style.transition = "";
        if (commit) {
          page.style.transform = `translateX(${stageEl.clientWidth}px)`;
          page.classList.add("gone");
          setStatus(ui, "已返回 · 速度 " + velocity.toFixed(2) + " px/ms");
          timer(bag, reset, 1200);
        } else {
          page.style.transform = "";
          shadow.style.opacity = "0";
          progress.style.opacity = "0";
          setStatus(ui, "已取消 · 速度 " + velocity.toFixed(2) + " px/ms");
        }
        drag = null;
      });
      bind(bag, body.querySelector("[data-reset]"), "click", reset);
      bind(bag, stageEl, "keydown", (event) => { if (event.key === "Escape") reset(); });
    }

    if (variant === "escape") {
      body.innerHTML = `<div class="gx-stage escape-stage">
        <div class="escape-note"><span class="mono">HIT AREA / 120%</span><p>按住按钮，再把手指滑出去。移出热区后提交会被取消。</p></div>
        <div class="escape-hit" data-hit>
          <button type="button" class="escape-button" data-button>确认发布</button>
        </div>
        <p class="escape-state" data-state>等待按下</p>
      </div>`;
      const hit = body.querySelector("[data-hit]");
      const button = body.querySelector("[data-button]");
      const state = body.querySelector("[data-state]");
      let active = false;
      bind(bag, hit, "pointerdown", (event) => {
        active = true;
        button.classList.add("pressed");
        hit.classList.add("active");
        hit.setPointerCapture(event.pointerId);
        state.textContent = "按住中 · 移出热区可取消";
      });
      bind(bag, hit, "pointermove", (event) => {
        if (!active) return;
        const rect = button.getBoundingClientRect();
        const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        button.classList.toggle("cancel", !inside);
        state.textContent = inside ? "在热区内 · 松手提交" : "已移出 · 松手取消";
      });
      bind(bag, hit, "pointerup", (event) => {
        if (!active) return;
        active = false;
        const rect = button.getBoundingClientRect();
        const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        hit.classList.remove("active");
        button.classList.remove("pressed", "cancel");
        if (inside) {
          button.classList.add("done");
          button.textContent = "已发布";
          state.textContent = "commit = true";
          timer(bag, () => { button.classList.remove("done"); button.textContent = "确认发布"; }, 1400);
        } else {
          state.textContent = "commit = false · 没有发布";
        }
        setStatus(ui, state.textContent);
      });
      bind(bag, button, "keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        button.classList.add("done");
        button.textContent = "已发布";
        state.textContent = "键盘确认 · commit = true";
        setStatus(ui, state.textContent);
        timer(bag, () => { button.classList.remove("done"); button.textContent = "确认发布"; }, 1400);
      });
    }

    if (variant === "diff") {
      const filters = ["全部", "动效", "卡片", "手势"];
      const counts = { "全部": "14", "动效": "6", "卡片": "4", "手势": "9" };
      body.innerHTML = `<div class="gx-stage diff-stage">
        <div class="diff-card">
          <div class="diff-filters" role="group" aria-label="筛选">${filters.map((filter, index) => `<button type="button" aria-pressed="${index === 0}" data-filter="${filter}">${filter}</button>`).join("")}</div>
          <div class="diff-result"><b data-count>14</b><span data-label>个结果</span></div>
          <p class="diff-copy" data-copy>只让变化的字符做滚动，其他字符保持原位。</p>
        </div>
      </div>`;
      const count = body.querySelector("[data-count]");
      const copy = body.querySelector("[data-copy]");
      const buttons = Array.from(body.querySelectorAll("[data-filter]"));
      const setText = (el, oldText, newText) => {
        el.innerHTML = "";
        const length = Math.max(oldText.length, newText.length);
        for (let i = 0; i < length; i += 1) {
          const span = document.createElement("span");
          span.textContent = newText[i] || "";
          if (oldText[i] !== newText[i]) {
            span.className = "diff-char";
            span.animate?.([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260, delay: i * 18, easing: "ease-out" });
          }
          el.append(span);
        }
      };
      buttons.forEach((button) => bind(bag, button, "click", () => {
        buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        const filter = button.dataset.filter;
        setText(count, count.textContent, counts[filter]);
        const messages = {
          "全部": "只让变化的字符做滚动，其他字符保持原位。",
          "动效": "动效类结果上移，未命中的卡片保持安静。",
          "卡片": "卡片类结果替换前面的数字，其余字符不动。",
          "手势": "手势类结果回到列表顶部，只在变化处做反馈。"
        };
        setText(copy, copy.textContent, messages[filter]);
        setStatus(ui, "已筛选 " + filter + " · " + counts[filter] + " 个结果");
      }));
    }

    if (variant === "axis") {
      body.innerHTML = `<div class="gx-stage axis-stage" data-stage>
        <div class="axis-card" data-card>
          <div class="axis-photo"><span class="mono">PHOTO / 03</span><b>把光<br>留在墙上</b></div>
          <div class="axis-hint"><span data-axis>拖动：横滑翻页 / 竖滑关闭</span></div>
        </div>
        <div class="axis-pages"><span class="on"></span><span></span><span></span></div>
      </div>`;
      const card = body.querySelector("[data-card]");
      const axis = body.querySelector("[data-axis]");
      let start = null;
      let locked = null;
      let pageIndex = 0;
      bind(bag, card, "pointerdown", (event) => {
        start = { x: event.clientX, y: event.clientY, t: performance.now() };
        locked = null;
        card.setPointerCapture(event.pointerId);
      });
      bind(bag, card, "pointermove", (event) => {
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (!locked && Math.hypot(dx, dy) > 12) {
          locked = Math.abs(dx) > Math.abs(dy) + 6 ? "x" : "y";
          axis.textContent = locked === "x" ? "锁定：横向翻页" : "锁定：竖直关闭";
          setStatus(ui, "已锁定" + (locked === "x" ? "横向" : "竖直") + "手势");
        }
        if (locked === "x") {
          card.style.transform = `translateX(${dx * .45}px) rotate(${dx * .006}deg)`;
        }
        if (locked === "y") {
          card.style.transform = `translateY(${dy * .45}px) scale(${1 - Math.min(.08, Math.abs(dy) / 1200)})`;
        }
      });
      bind(bag, card, "pointerup", (event) => {
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        card.style.transform = "";
        if (locked === "x" && Math.abs(dx) > 60) {
          pageIndex = clamp(pageIndex + (dx < 0 ? 1 : -1), 0, 2);
          body.querySelectorAll(".axis-pages span").forEach((dot, index) => dot.classList.toggle("on", index === pageIndex));
          setStatus(ui, "翻到第 " + (pageIndex + 1) + " 张");
        }
        if (locked === "y" && dy > 70) setStatus(ui, "竖直下拉关闭 · 返回上一页");
        if (!locked) setStatus(ui, "位移不足 12px，没有锁定方向");
        start = null;
      });
    }

    if (variant === "catch") {
      body.innerHTML = `<div class="gx-stage catch-stage">
        <div class="catch-note"><span class="mono">INERTIA / 0.94</span><p>卡片正在惯性滑动。再按一次，动画立刻停下，交给你的手。</p></div>
        <div class="catch-card" data-card><b>接住我</b><small>touch down 即停止</small></div>
        <p class="catch-state" data-state>滑动中</p>
      </div>`;
      const card = body.querySelector("[data-card]");
      const state = body.querySelector("[data-state]");
      let x = 0;
      let velocity = 7.2;
      let raf = 0;
      let holding = false;
      let lastX = 0;
      let lastT = 0;
      const bounds = 210;
      const tick = () => {
        if (!holding) {
          x += velocity;
          if (x > bounds || x < -bounds) { velocity *= -1; x = clamp(x, -bounds, bounds); }
          velocity *= .94;
        }
        card.style.transform = `translateX(${x}px) rotate(${x * .04}deg)`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      bag.push(() => cancelAnimationFrame(raf));
      bind(bag, card, "pointerdown", (event) => {
        holding = true;
        lastX = event.clientX;
        lastT = performance.now();
        card.setPointerCapture(event.pointerId);
        state.textContent = "已接住 · 拖拽中";
        setStatus(ui, "已停止惯性，开始接管");
      });
      bind(bag, card, "pointermove", (event) => {
        if (!holding) return;
        const now = performance.now();
        const dt = Math.max(1, now - lastT);
        x += event.clientX - lastX;
        velocity = (event.clientX - lastX) / dt * 16;
        x = clamp(x, -bounds, bounds);
        lastX = event.clientX;
        lastT = now;
        card.style.transform = `translateX(${x}px) rotate(${x * .04}deg)`;
      });
      bind(bag, card, "pointerup", () => {
        holding = false;
        state.textContent = "松手 · 继续惯性";
        setStatus(ui, "已松手，惯性继续");
      });
    }

    if (variant === "project") {
      const pages = ["窄门", "长桌", "空房", "回声"];
      body.innerHTML = `<div class="gx-stage project-stage">
        <div class="project-note"><span class="mono">PROJECT / VELOCITY</span><p>拖拽时实时预测会落到哪一张，指示点提前亮起。</p></div>
        <div class="project-carousel" data-carousel><div class="project-track" data-track>${pages.map((page, index) => `<article class="project-card"><span class="mono">0${index + 1} / 04</span><b>${page}</b></article>`).join("")}</div></div>
        <div class="project-dots" data-dots>${pages.map((page, index) => `<span class="${index === 0 ? "on" : ""}"></span>`).join("")}</div>
        <p class="project-state" data-state>第 1 张</p>
      </div>`;
      const carousel = body.querySelector("[data-carousel]");
      const track = body.querySelector("[data-track]");
      const dots = Array.from(body.querySelectorAll("[data-dots] span"));
      const state = body.querySelector("[data-state]");
      let startX = 0;
      let offset = 0;
      let index = 0;
      let dragging = false;
      const width = () => carousel.clientWidth * .8;
      const paint = (delta, predicted) => {
        track.style.transform = `translateX(${-index * width() + delta}px)`;
        dots.forEach((dot, i) => dot.classList.toggle("on", i === predicted));
      };
      bind(bag, carousel, "pointerdown", (event) => {
        dragging = true;
        startX = event.clientX;
        offset = 0;
        carousel.setPointerCapture(event.pointerId);
        track.style.transition = "none";
      });
      bind(bag, carousel, "pointermove", (event) => {
        if (!dragging) return;
        offset = event.clientX - startX;
        const projected = clamp(index - Math.round(offset / width()), 0, pages.length - 1);
        paint(offset, projected);
        state.textContent = "预测：第 " + (projected + 1) + " 张";
      });
      bind(bag, carousel, "pointerup", () => {
        if (!dragging) return;
        dragging = false;
        const projected = clamp(index - Math.round(offset / width()), 0, pages.length - 1);
        index = projected;
        track.style.transition = "transform .4s cubic-bezier(.16,1.06,.3,1)";
        paint(0, index);
        state.textContent = "落点：第 " + (index + 1) + " 张";
        setStatus(ui, "已落到预测的第 " + (index + 1) + " 张");
        offset = 0;
      });
      paint(0, 0);
    }

    if (variant === "rubber") {
      body.innerHTML = `<div class="gx-stage rubber-stage">
        <div class="rubber-note"><span class="mono">OVERSCROLL / 1 / (1 + d / 120)</span><p>在顶部继续下拉，阻力越来越大；松手用弹簧回到边界。</p></div>
        <div class="rubber-viewport" data-viewport><div class="rubber-list" data-list>${["清晨的咖啡", "走到地铁口", "一封没写完的信", "午后的光", "把桌面收干净"].map((item, index) => `<article><span class="mono">0${index + 1}</span><b>${item}</b></article>`).join("")}</div></div>
        <p class="rubber-state" data-state>在顶部</p>
      </div>`;
      const viewport = body.querySelector("[data-viewport]");
      const list = body.querySelector("[data-list]");
      const state = body.querySelector("[data-state]");
      let startY = 0;
      let pull = 0;
      let active = false;
      bind(bag, viewport, "pointerdown", (event) => {
        if (viewport.scrollTop > 0) return;
        active = true;
        startY = event.clientY;
        viewport.setPointerCapture(event.pointerId);
        list.style.transition = "none";
      });
      bind(bag, viewport, "pointermove", (event) => {
        if (!active) return;
        const raw = Math.max(0, event.clientY - startY);
        pull = 120 * raw / (raw + 120);
        list.style.transform = `translateY(${pull}px)`;
        state.textContent = "越界 " + Math.round(pull) + "px · 阻力递增";
      });
      bind(bag, viewport, "pointerup", () => {
        if (!active) return;
        active = false;
        list.style.transition = "transform .5s cubic-bezier(.16,1.3,.3,1)";
        list.style.transform = "";
        state.textContent = pull > 40 ? "松手 · 触发刷新" : "松手 · 平滑回弹";
        setStatus(ui, state.textContent);
        pull = 0;
      });
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     11. SCROLL LAB
     ============================================================ */
  S.scrollLab = function (root, variant) {
    const bag = [];
    const titles = {
      pinch: "捏合，改密度", progress: "滚动就是进度", blur: "滚动带出速度",
      pull: "下拉，把顶图放大", reflow: "换列数，走弧线", contrast: "背景反色，字跟着变",
      focus: "选一个，其余退后", parallax: "双列，不同速度", sticky: "日期吸住，内容滑过"
    };
    const notes = {
      pinch: "双指捏合<br>或点 +/-", progress: "滚到哪<br>进度到哪",
      blur: "越快越糊<br>停下就清晰", pull: "越拉越大<br>松手回弹",
      reflow: "2 / 3 / 4 列<br>位置连续", contrast: "深色段白字<br>浅色段黑字",
      focus: "被选中的<br>才留在前景", parallax: "两列不同速度<br>产生纵深",
      sticky: "日期不动<br>条目滑过"
    };
    const ui = shell(root, {
      kicker: "MOBILE / SCROLL",
      title: titles[variant] || "滚动实验室",
      note: notes[variant] || "滚动不是位移<br>是节奏",
      status: "上下滚动试试"
    });
    const body = ui.body;

    if (variant === "pinch") {
      body.innerHTML = `<div class="sc-stage">
        <div class="sc-toolbar"><span class="mono" data-cols>3 列</span><div><button type="button" class="sc-step" data-step="-1" aria-label="减少列数">−</button><button type="button" class="sc-step" data-step="1" aria-label="增加列数">＋</button></div></div>
        <div class="sc-pinch-grid" data-grid>${Array.from({ length: 12 }, (_, i) => `<span style="--i:${i}"><i></i></span>`).join("")}</div>
        <p class="sc-hint">触屏可双指捏合 · 桌面按住 Ctrl 滚轮</p>
      </div>`;
      const grid = body.querySelector("[data-grid]");
      const label = body.querySelector("[data-cols]");
      let cols = 3;
      const apply = (next) => {
        cols = clamp(next, 2, 5);
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        label.textContent = cols + " 列";
        setStatus(ui, "网格密度：" + cols + " 列");
      };
      body.querySelectorAll("[data-step]").forEach((button) => bind(bag, button, "click", () => apply(cols + Number(button.dataset.step))));
      const pointers = new Map();
      let pinchStart = 0;
      let startCols = cols;
      bind(bag, grid, "pointerdown", (event) => {
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size === 2) {
          const [a, b] = Array.from(pointers.values());
          pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
          startCols = cols;
        }
      });
      bind(bag, grid, "pointermove", (event) => {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size === 2 && pinchStart) {
          const [a, b] = Array.from(pointers.values());
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          const ratio = distance / pinchStart;
          if (ratio > 1.18) { apply(startCols - 1); pinchStart = distance; startCols = cols; }
          if (ratio < .84) { apply(startCols + 1); pinchStart = distance; startCols = cols; }
        }
      });
      ["pointerup", "pointercancel"].forEach((type) => bind(bag, grid, type, (event) => {
        pointers.delete(event.pointerId);
        if (pointers.size < 2) pinchStart = 0;
      }));
      bind(bag, grid, "wheel", (event) => {
        if (!event.ctrlKey) return;
        event.preventDefault();
        apply(cols + (event.deltaY > 0 ? 1 : -1));
      }, { passive: false });
      apply(3);
    }

    if (variant === "progress") {
      body.innerHTML = `<div class="sc-stage sc-progress-stage">
        <div class="sc-progress-head"><span class="mono">阅读进度</span><b data-percent>0%</b></div>
        <div class="sc-progress-track"><i data-bar></i></div>
        <div class="sc-viewport" data-scroller tabindex="0" aria-label="可滚动文章">
          ${["光从窗边开始", "把桌面留空", "慢一点也没关系", "在傍晚收尾"].map((title, index) => `<article class="sc-progress-section"><span class="mono">0${index + 1}</span><h5>${title}</h5><p>${["先让视线有一个落点，再决定什么应该出现。", "留白不是没有内容，是让重要的东西有地方呼吸。", "滚动本身就是一条时间线，进度只是它的影子。", "收尾不是结束，是让下一次开始变得自然。"][index]}</p><div class="sc-progress-dot" data-dot></div></article>`).join("")}
        </div>
      </div>`;
      const scroller = body.querySelector("[data-scroller]");
      const bar = body.querySelector("[data-bar]");
      const percent = body.querySelector("[data-percent]");
      const dots = Array.from(body.querySelectorAll("[data-dot]"));
      const update = () => {
        const max = scroller.scrollHeight - scroller.clientHeight;
        const value = max > 0 ? scroller.scrollTop / max : 0;
        bar.style.width = (value * 100) + "%";
        percent.textContent = Math.round(value * 100) + "%";
        dots.forEach((dot, index) => dot.style.transform = `rotate(${value * 360 + index * 40}deg) scale(${1 + value * .25})`);
      };
      bind(bag, scroller, "scroll", update, { passive: true });
      update();
    }

    if (variant === "blur") {
      body.innerHTML = `<div class="sc-stage sc-blur-stage">
        <div class="sc-blur-head"><span class="mono">VELOCITY / BLUR</span><span data-speed>0.0 px/ms</span></div>
        <div class="sc-viewport sc-blur-list" data-scroller tabindex="0" aria-label="可滚动画廊">
          ${["墙上的光", "旧木桌", "半开的窗", "一只杯子", "下午四点", "没有声音", "纸张边缘", "轻轻合上"].map((item, index) => `<article class="sc-blur-row"><span class="mono">0${index + 1}</span><b>${item}</b><small>${["光", "木", "窗", "杯", "时", "静", "纸", "合"][index]}</small></article>`).join("")}
        </div>
      </div>`;
      const scroller = body.querySelector("[data-scroller]");
      const speedLabel = body.querySelector("[data-speed]");
      const rows = Array.from(body.querySelectorAll(".sc-blur-row"));
      let lastTop = 0;
      let lastTime = performance.now();
      let settle = 0;
      const apply = (value) => {
        const blur = clamp(value * .8, 0, 5);
        rows.forEach((row, index) => row.style.filter = blur > .2 ? `blur(${blur}px)` : "");
        speedLabel.textContent = value.toFixed(1) + " px/ms";
      };
      bind(bag, scroller, "scroll", () => {
        const now = performance.now();
        const dt = Math.max(1, now - lastTime);
        const delta = Math.abs(scroller.scrollTop - lastTop);
        apply(delta / dt);
        lastTop = scroller.scrollTop;
        lastTime = now;
        clearTimeout(settle);
        settle = setTimeout(() => apply(0), 120);
      }, { passive: true });
      bag.push(() => clearTimeout(settle));
    }

    if (variant === "pull") {
      body.innerHTML = `<div class="sc-stage sc-pull-stage">
        <div class="sc-pull-viewport" data-viewport tabindex="0">
          <div class="sc-pull-content" data-content>
            <div class="sc-pull-photo" data-photo><span class="mono">FIELD NOTES / 07</span><b>海边的<br>风很慢</b></div>
            <div class="sc-pull-copy"><span class="mono">下拉顶图</span><p>在顶部继续向下拉，图片跟随放大；松手后用弹簧回到原位。</p></div>
          </div>
        </div>
        <span class="sc-pull-label" data-label>下拉放大</span>
      </div>`;
      const viewport = body.querySelector("[data-viewport]");
      const content = body.querySelector("[data-content]");
      const photo = body.querySelector("[data-photo]");
      const label = body.querySelector("[data-label]");
      let start = 0;
      let active = false;
      let pull = 0;
      bind(bag, viewport, "pointerdown", (event) => {
        if (viewport.scrollTop > 0) return;
        active = true;
        start = event.clientY;
        viewport.setPointerCapture(event.pointerId);
        content.style.transition = "none";
      });
      bind(bag, viewport, "pointermove", (event) => {
        if (!active) return;
        const raw = Math.max(0, event.clientY - start);
        pull = 120 * raw / (raw + 120);
        content.style.transform = `translateY(${pull}px)`;
        photo.style.transform = `scale(${1 + pull / 300})`;
        label.textContent = pull > 44 ? "松手刷新" : "继续下拉";
      });
      bind(bag, viewport, "pointerup", () => {
        if (!active) return;
        active = false;
        content.style.transition = "transform .5s cubic-bezier(.16,1.3,.3,1)";
        content.style.transform = "";
        photo.style.transition = "transform .5s cubic-bezier(.16,1.3,.3,1)";
        photo.style.transform = "";
        setStatus(ui, pull > 44 ? "已触发刷新 · 顶图放大后回弹" : "未到阈值 · 平滑回弹");
        label.textContent = pull > 44 ? "正在刷新…" : "下拉放大";
        pull = 0;
      });
    }

    if (variant === "reflow") {
      body.innerHTML = `<div class="sc-stage">
        <div class="sc-toolbar"><span class="mono" data-col-label>2 列</span><div class="sc-seg" role="group" aria-label="列数">${[2, 3, 4].map((cols) => `<button type="button" data-cols="${cols}" aria-pressed="${cols === 2}">${cols}</button>`).join("")}</div></div>
        <div class="sc-reflow-grid" data-grid data-cols="2">${Array.from({ length: 8 }, (_, i) => `<article><span class="mono">0${i + 1}</span><b>${["纸", "光", "桌", "窗", "杯", "信", "风", "影"][i]}</b></article>`).join("")}</div>
      </div>`;
      const grid = body.querySelector("[data-grid]");
      const label = body.querySelector("[data-col-label]");
      const buttons = Array.from(body.querySelectorAll("[data-cols]"));
      const setCols = (cols) => {
        const first = new Map(Array.from(grid.children).map((item) => [item, item.getBoundingClientRect()]));
        grid.dataset.cols = String(cols);
        label.textContent = cols + " 列";
        buttons.forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.cols) === cols)));
        Array.from(grid.children).forEach((item) => {
          const before = first.get(item);
          const after = item.getBoundingClientRect();
          if (!before || prefersReduced()) return;
          const dx = before.left - after.left;
          const dy = before.top - after.top;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
          item.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1.06,.3,1)" });
        });
        setStatus(ui, "已切换为 " + cols + " 列，位置连续过渡");
      };
      buttons.forEach((button) => bind(bag, button, "click", () => setCols(Number(button.dataset.cols))));
    }

    if (variant === "contrast") {
      body.innerHTML = `<div class="sc-stage sc-contrast-stage">
        <div class="sc-contrast-head" data-head><span class="mono">CONTRAST</span><b data-zone>暗色区</b></div>
        <div class="sc-viewport sc-contrast-scroll" data-scroller tabindex="0" aria-label="滚动切换背景">
          <section class="sc-zone dark" data-tone="暗色区"><span class="mono">01</span><h5>深色<br>让光更亮</h5></section>
          <section class="sc-zone light" data-tone="浅色区"><span class="mono">02</span><h5>浅色<br>让字更稳</h5></section>
          <section class="sc-zone dark" data-tone="暗色区"><span class="mono">03</span><h5>再回到<br>深色</h5></section>
        </div>
      </div>`;
      const scroller = body.querySelector("[data-scroller]");
      const head = body.querySelector("[data-head]");
      const zone = body.querySelector("[data-zone]");
      const sections = Array.from(body.querySelectorAll(".sc-zone"));
      const update = () => {
        const mid = scroller.scrollTop + scroller.clientHeight * .12;
        let active = sections[0];
        sections.forEach((section) => { if (section.offsetTop <= mid) active = section; });
        const dark = active.classList.contains("dark");
        head.classList.toggle("on-light", !dark);
        head.querySelector(".mono").textContent = dark ? "#f3f0e7 text" : "#151612 text";
        zone.textContent = active.dataset.tone;
        setStatus(ui, "当前区段：" + active.dataset.tone + " · 头部文字已反色");
      };
      bind(bag, scroller, "scroll", update, { passive: true });
      update();
    }

    if (variant === "focus") {
      body.innerHTML = `<div class="sc-stage">
        <div class="sc-focus-grid" data-grid>${["把光留在墙上", "一张旧木桌", "窗边的下午", "没有寄出的信", "慢慢收好"].map((title, index) => `<button type="button" class="sc-focus-card" data-focus aria-pressed="${index === 0}" style="--i:${index}"><span class="mono">0${index + 1}</span><b>${title}</b><small>${["FOCUS", "OBJECT", "LIGHT", "LETTER", "CLOSE"][index]}</small></button>`).join("")}</div>
      </div>`;
      const cards = Array.from(body.querySelectorAll("[data-focus]"));
      cards.forEach((card) => bind(bag, card, "click", () => {
        cards.forEach((item) => {
          item.setAttribute("aria-pressed", String(item === card));
          item.classList.toggle("dim", item !== card);
        });
        setStatus(ui, "聚焦：" + card.querySelector("b").textContent + " · 其余退后");
      }));
    }

    if (variant === "parallax") {
      body.innerHTML = `<div class="sc-stage sc-parallax-stage">
        <div class="sc-viewport" data-scroller tabindex="0" aria-label="视差滚动">
          <div class="sc-parallax-inner">
            <div class="sc-parallax-col left" data-slow>${["01", "02", "03", "04"].map((n, i) => `<div class="sc-par-item h${i % 2 ? "short" : ""}"><span class="mono">${n}</span><b>${["光", "墙", "窗", "影"][i]}</b></div>`).join("")}</div>
            <div class="sc-parallax-col right" data-fast>${["A", "B", "C", "D"].map((n, i) => `<div class="sc-par-item text"><span class="mono">${n}</span><p>${["两列以不同速度移动，近处更快，远处更慢。", "视差不是装饰，是在滚动里建立空间关系。", "速度差要克制，过了就会晕。", "停下时，两列仍然对齐。"][i]}</p></div>`).join("")}</div>
          </div>
        </div>
      </div>`;
      const scroller = body.querySelector("[data-scroller]");
      const slow = body.querySelector("[data-slow]");
      const fast = body.querySelector("[data-fast]");
      const update = () => {
        const y = scroller.scrollTop;
        slow.style.transform = `translateY(${y * -.06}px)`;
        fast.style.transform = `translateY(${y * -.16}px)`;
      };
      bind(bag, scroller, "scroll", update, { passive: true });
    }

    if (variant === "sticky") {
      body.innerHTML = `<div class="sc-stage">
        <div class="sc-sticky-viewport" data-scroller tabindex="0" aria-label="日期吸顶列表">
          <div class="sc-sticky-inner">
            <div class="sc-sticky-date"><span class="mono">2026</span><b>10 / 29</b><small>星期四</small></div>
            <div class="sc-sticky-items">${["09:20 咖啡", "11:40 邮件", "14:05 长桌", "16:30 窗边", "18:10 收尾", "20:00 回家"].map((item, index) => `<article><span class="mono">0${index + 1}</span><b>${item}</b></article>`).join("")}</div>
          </div>
        </div>
      </div>`;
      const scroller = body.querySelector("[data-scroller]");
      const date = body.querySelector(".sc-sticky-date");
      bind(bag, scroller, "scroll", () => {
        date.classList.toggle("stuck", scroller.scrollTop > 8);
        setStatus(ui, "日期吸附：" + (scroller.scrollTop > 8 ? "已吸顶" : "原位"));
      }, { passive: true });
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     12. DIARY LAB
     ============================================================ */
  S.diaryLab = function (root, variant) {
    const bag = [];
    const titles = {
      sheet: "不压暗的日记面板", title: "大标题跟着选项换", numbers: "数字卡压住头图",
      swipe: "头图左右滑翻篇", calendar: "月历空格直接补写"
    };
    const notes = {
      sheet: "背景还在<br>只是退后", title: "字换了<br>位置不跳",
      numbers: "数字压图<br>建立层级", swipe: "跟手翻页<br>松手吸附",
      calendar: "点空格<br>直接写"
    };
    const ui = shell(root, {
      kicker: "MOBILE / DIARY",
      title: titles[variant] || "日记实验室",
      note: notes[variant] || "记录<br>要轻",
      status: ""
    });
    const body = ui.body;

    if (variant === "sheet") {
      body.innerHTML = `<div class="dy-stage dy-sheet-stage">
        <div class="dy-home" data-home>
          <div class="dy-home-head"><span class="mono">2026 / 10 / 29</span><b>星期四</b></div>
          <div class="dy-hero"><span class="mono">TODAY</span><h5>今天，<br>先记一句。</h5><p>面板升起时，背景不压暗，只轻轻退后。</p></div>
          <div class="dy-entries">${["09:20 咖啡比昨天苦一点", "14:05 窗边的光停在桌角"].map((item) => `<article><span class="mono">·</span><p>${item}</p></article>`).join("")}</div>
          <button type="button" class="dy-add" data-open>写一句 <span>＋</span></button>
        </div>
        <div class="dy-sheet" data-sheet aria-hidden="true">
          <div class="dy-handle"><i></i></div>
          <div class="dy-sheet-head"><span class="mono">NEW ENTRY</span><button type="button" data-close aria-label="关闭">×</button></div>
          <textarea placeholder="今天想记下什么？" aria-label="日记内容" data-input></textarea>
          <div class="dy-sheet-foot"><span class="mono">不压暗背景</span><button type="button" class="stage-action accent" data-save>保存</button></div>
        </div>
      </div>`;
      const home = body.querySelector("[data-home]");
      const sheet = body.querySelector("[data-sheet]");
      const input = body.querySelector("[data-input]");
      const set = (open) => {
        sheet.classList.toggle("open", open);
        sheet.setAttribute("aria-hidden", String(!open));
        home.classList.toggle("behind", open);
        if (open) input.focus();
        setStatus(ui, open ? "面板已升起 · 背景保持可见" : "面板已收起");
      };
      bind(bag, body.querySelector("[data-open]"), "click", () => set(true));
      bind(bag, body.querySelector("[data-close]"), "click", () => set(false));
      bind(bag, body.querySelector("[data-save]"), "click", () => {
        const text = input.value.trim();
        if (text) {
          const article = document.createElement("article");
          article.innerHTML = `<span class="mono">·</span><p></p>`;
          article.querySelector("p").textContent = text;
          home.querySelector(".dy-entries").append(article);
          input.value = "";
          setStatus(ui, "已保存：" + text);
        }
        set(false);
      });
    }

    if (variant === "title") {
      const tabs = [
        { label: "今天", title: "今天，先做一件。", count: "2 条记录" },
        { label: "本周", title: "这一周，慢慢排。", count: "9 条记录" },
        { label: "全部", title: "所有写下的，都在。", count: "48 条记录" }
      ];
      body.innerHTML = `<div class="dy-stage dy-title-stage">
        <div class="dy-title-top"><span class="mono">MY DIARY</span><span class="mono" data-count>2 条记录</span></div>
        <div class="dy-title-copy"><h5 data-title>今天，先做一件。</h5><p>切换选项时，标题只做轻微的位移与淡入，不改变页面结构。</p></div>
        <div class="dy-tabs" role="tablist" aria-label="日记时间范围">${tabs.map((tab, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-tab="${index}">${tab.label}</button>`).join("")}<i data-indicator></i></div>
        <div class="dy-title-list">${["09:20 咖啡", "14:05 窗边", "18:40 收尾"].map((item, index) => `<article><span class="mono">0${index + 1}</span><b>${item}</b></article>`).join("")}</div>
      </div>`;
      const heading = body.querySelector("[data-title]");
      const count = body.querySelector("[data-count]");
      const buttons = Array.from(body.querySelectorAll("[data-tab]"));
      const indicator = body.querySelector("[data-indicator]");
      const move = (index) => {
        const active = buttons[index];
        indicator.style.width = active.offsetWidth + "px";
        indicator.style.transform = `translateX(${active.offsetLeft}px)`;
      };
      buttons.forEach((button, index) => bind(bag, button, "click", () => {
        buttons.forEach((item) => item.setAttribute("aria-selected", String(item === button)));
        heading.animate?.([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: "cubic-bezier(.16,1.06,.3,1)" });
        heading.textContent = tabs[index].title;
        count.textContent = tabs[index].count;
        move(index);
        setStatus(ui, "已切换到 " + tabs[index].label + " · " + tabs[index].count);
      }));
      move(0);
    }

    if (variant === "numbers") {
      body.innerHTML = `<div class="dy-stage dy-numbers-stage">
        <div class="dy-number-photo"><span class="mono">FIELD NOTE / 029</span><b data-number>29</b><small>OCT · 2026</small></div>
        <button type="button" class="dy-number-card" data-next><span class="mono">今天的数字</span><strong>把一天压成<br>一个数字。</strong><span class="dy-number-meta">轻点换一个数字 ↺</span></button>
      </div>`;
      const number = body.querySelector("[data-number]");
      let value = 29;
      bind(bag, body.querySelector("[data-next]"), "click", () => {
        value = value % 31 + 1;
        number.animate?.([{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" });
        number.textContent = String(value).padStart(2, "0");
        setStatus(ui, "数字卡更新为 " + value + " · 仍然压住头图");
      });
    }

    if (variant === "swipe") {
      const pages = [
        { className: "c1", title: "海边的风", copy: "把光留在肩上" },
        { className: "c2", title: "旧木桌", copy: "下午四点的影子" },
        { className: "c3", title: "半开的窗", copy: "没有声音的房间" }
      ];
      body.innerHTML = `<div class="dy-stage dy-swipe-stage">
        <div class="dy-swipe-view" data-view><div class="dy-swipe-track" data-track>${pages.map((page, index) => `<figure class="dy-swipe-page ${page.className}"><span class="mono">0${index + 1} / 03</span><figcaption><b>${page.title}</b><small>${page.copy}</small></figcaption></figure>`).join("")}</div></div>
        <div class="dy-swipe-foot"><div class="dy-swipe-dots" data-dots>${pages.map((page, index) => `<span class="${index === 0 ? "on" : ""}"></span>`).join("")}</div><p class="mono" data-state>第 1 篇</p></div>
      </div>`;
      const view = body.querySelector("[data-view]");
      const track = body.querySelector("[data-track]");
      const dots = Array.from(body.querySelectorAll("[data-dots] span"));
      const state = body.querySelector("[data-state]");
      let index = 0;
      let start = 0;
      let delta = 0;
      let dragging = false;
      const paint = () => { track.style.transform = `translateX(calc(${-index * 100}% + ${delta}px))`; };
      bind(bag, view, "pointerdown", (event) => {
        dragging = true;
        start = event.clientX;
        delta = 0;
        view.setPointerCapture(event.pointerId);
        track.style.transition = "none";
      });
      bind(bag, view, "pointermove", (event) => {
        if (!dragging) return;
        delta = event.clientX - start;
        paint();
      });
      bind(bag, view, "pointerup", () => {
        if (!dragging) return;
        dragging = false;
        const threshold = view.clientWidth * .2;
        if (delta < -threshold) index = Math.min(pages.length - 1, index + 1);
        if (delta > threshold) index = Math.max(0, index - 1);
        delta = 0;
        track.style.transition = "transform .42s cubic-bezier(.16,1.06,.3,1)";
        paint();
        dots.forEach((dot, i) => dot.classList.toggle("on", i === index));
        state.textContent = "第 " + (index + 1) + " 篇";
        setStatus(ui, "翻到《" + pages[index].title + "》");
      });
      view.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        index = clamp(index + (event.key === "ArrowRight" ? 1 : -1), 0, pages.length - 1);
        track.style.transition = "transform .42s cubic-bezier(.16,1.06,.3,1)";
        paint();
        dots.forEach((dot, i) => dot.classList.toggle("on", i === index));
        state.textContent = "第 " + (index + 1) + " 篇";
      });
      view.tabIndex = 0;
      view.setAttribute("aria-label", "左右滑动切换日记");
      paint();
    }

    if (variant === "calendar") {
      body.innerHTML = `<div class="dy-stage dy-cal-stage">
        <div class="dy-cal-head"><div><span class="mono">OCTOBER / 2026</span><h5>十月</h5></div><button type="button" class="dy-cal-today" data-today>回到今天</button></div>
        <div class="dy-cal-week">${["一", "二", "三", "四", "五", "六", "日"].map((day) => `<span>${day}</span>`).join("")}</div>
        <div class="dy-cal-grid" data-grid></div>
        <div class="dy-cal-compose" data-compose><span class="mono" data-picked>点一个空格，直接补写</span><div><input type="text" maxlength="24" placeholder="写一句…" aria-label="补写日记" data-note><button type="button" class="stage-action accent" data-save>记下</button></div></div>
      </div>`;
      const grid = body.querySelector("[data-grid]");
      const picked = body.querySelector("[data-picked]");
      const note = body.querySelector("[data-note]");
      const saved = new Set([3, 8, 14, 21, 27]);
      let selected = null;
      const render = () => {
        grid.innerHTML = "";
        for (let blank = 0; blank < 3; blank += 1) grid.insertAdjacentHTML("beforeend", `<span class="dy-cal-empty" aria-hidden="true"></span>`);
        for (let day = 1; day <= 31; day += 1) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "dy-cal-day" + (saved.has(day) ? " has" : "") + (day === 29 ? " today" : "");
          button.dataset.day = String(day);
          button.setAttribute("aria-label", "10 月 " + day + " 日" + (saved.has(day) ? "，已有记录" : ""));
          button.innerHTML = `<span>${day}</span>${saved.has(day) ? "<i></i>" : ""}`;
          button.addEventListener("click", () => {
            selected = day;
            grid.querySelectorAll(".dy-cal-day").forEach((item) => item.classList.toggle("selected", item === button));
            picked.textContent = "10 / " + String(day).padStart(2, "0") + (saved.has(day) ? " 已有一条 · 可补写" : " 空格 · 直接补写");
            note.focus();
          });
          grid.append(button);
        }
      };
      bind(bag, body.querySelector("[data-save]"), "click", () => {
        if (!selected) { setStatus(ui, "先点一个日期"); return; }
        if (!note.value.trim()) { note.focus(); return; }
        saved.add(selected);
        const day = selected;
        note.value = "";
        render();
        picked.textContent = "10 / " + String(day).padStart(2, "0") + " 已记下";
        setStatus(ui, "已补写 10 月 " + day + " 日");
      });
      bind(bag, body.querySelector("[data-today]"), "click", () => {
        const today = grid.querySelector(".dy-cal-day.today");
        today?.focus();
        setStatus(ui, "今天：10 月 29 日");
      });
      render();
      note.addEventListener("keydown", (event) => { if (event.key === "Enter") body.querySelector("[data-save]").click(); });
    }

    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     13. MOBILE KIT
     ============================================================ */
  S.mobileKit = function (root, variant) {
    const bag = [];
    const titles = {
      switch: "弹性开关", bottomBar: "底部操作栏预留安全区", operation: "多功能操作卡片",
      segmented: "分段控件滑块跟随", ring: "环形读数与滑杆联动", search: "搜索筛选合并一行"
    };
    const notes = {
      switch: "拖动也有<br>弹簧回弹", bottomBar: "home 指示条<br>不挡按钮",
      operation: "一张卡<br>四个动作", segmented: "滑块走<br>文字淡",
      ring: "滑杆改数<br>环跟着走", search: "一行里<br>完成两步"
    };
    const ui = shell(root, {
      kicker: "MOBILE / KIT",
      title: titles[variant] || "移动控件",
      note: notes[variant] || "小控件<br>大手感",
      status: ""
    });
    const body = ui.body;

    if (variant === "switch") {
      body.innerHTML = `<div class="mk-stage mk-switch-stage">
        <div class="mk-switch-card">
          <div class="mk-switch-copy"><span class="mono">FOCUS MODE</span><b>专注模式</b><p>打开后，通知静音，只保留当前任务。</p></div>
          <button type="button" class="mk-switch" role="switch" aria-checked="false" aria-label="专注模式"><i></i><span>OFF</span></button>
        </div>
        <div class="mk-switch-rows">${["通知静音", "只保留当前任务", "结束时提醒"].map((item, index) => `<div><span>${item}</span><em>${index === 1 ? "随开关变化" : "已启用"}</em></div>`).join("")}</div>
        <p class="mk-hint">拖动圆点，或按空格 / 回车切换</p>
      </div>`;
      const toggle = body.querySelector(".mk-switch");
      const copy = body.querySelector(".mk-switch-copy p");
      const set = (on) => {
        toggle.setAttribute("aria-checked", String(on));
        toggle.querySelector("span").textContent = on ? "ON" : "OFF";
        copy.textContent = on ? "通知已静音，只保留当前任务。" : "打开后，通知静音，只保留当前任务。";
        setStatus(ui, on ? "专注模式已打开" : "专注模式已关闭");
      };
      bind(bag, toggle, "click", () => set(toggle.getAttribute("aria-checked") !== "true"));
      bind(bag, toggle, "keydown", (event) => {
        if (event.key !== " " && event.key !== "Enter") return;
        event.preventDefault();
        set(toggle.getAttribute("aria-checked") !== "true");
      });
    }

    if (variant === "bottomBar") {
      body.innerHTML = `<div class="mk-stage mk-bar-stage">
        <div class="mk-bar-scroll">
          <div class="mk-bar-photo"><span class="mono">OBJECT / 04</span><b>一只<br>慢杯子</b></div>
          <div class="mk-bar-info"><div><span class="mono">CERAMIC CUP</span><h5>慢杯子</h5></div><b>¥ 168</b></div>
          <p>底部操作栏与系统 home 指示条之间预留安全区，按钮不会被挡住。</p>
          <button type="button" class="mk-safe-toggle" data-toggle>切换安全区高度 ↕</button>
        </div>
        <div class="mk-bottom-bar" data-bar>
          <div class="mk-safe-zone" aria-hidden="true"><span>safe-area 34px</span></div>
          <div class="mk-bar-actions"><button type="button" class="mk-bar-ghost" data-cart>加入收藏</button><button type="button" class="mk-bar-primary" data-buy>立即购买</button></div>
        </div>
      </div>`;
      let safe = true;
      bind(bag, body.querySelector("[data-toggle]"), "click", () => {
        safe = !safe;
        body.querySelector("[data-bar]").classList.toggle("compact-safe", !safe);
        setStatus(ui, safe ? "已预留 34px 安全区" : "安全区缩小，按钮下移");
      });
      bind(bag, body.querySelector("[data-buy]"), "click", () => setStatus(ui, "已进入结算 · 底栏没有遮挡"));
      bind(bag, body.querySelector("[data-cart]"), "click", (event) => {
        event.currentTarget.textContent = "已收藏 ✓";
        setStatus(ui, "已加入收藏");
      });
    }

    if (variant === "operation") {
      const actions = [
        { key: "note", label: "记一句", icon: "✎", text: "打开快速记录，不离开当前页面。" },
        { key: "move", label: "挪到明天", icon: "→", text: "把当前卡片整体挪到明天的列表。" },
        { key: "share", label: "分享", icon: "↗", text: "只分享标题与链接，不暴露内容。" },
        { key: "archive", label: "归档", icon: "▣", text: "移动到底部归档区，可撤销。" }
      ];
      body.innerHTML = `<div class="mk-stage mk-op-stage">
        <article class="mk-op-card">
          <div class="mk-op-top"><span class="mono">TASK / 07</span><button type="button" aria-label="更多">•••</button></div>
          <h5>把桌面<br>收干净</h5>
          <p>多功能操作卡片把常用动作放在一个可预期的位置。</p>
          <div class="mk-op-grid">${actions.map((action) => `<button type="button" data-action="${action.key}"><i>${action.icon}</i><span>${action.label}</span></button>`).join("")}</div>
          <p class="mk-op-note" data-note>选择一个动作。</p>
        </article>
      </div>`;
      const note = body.querySelector("[data-note]");
      body.querySelectorAll("[data-action]").forEach((button) => bind(bag, button, "click", () => {
        body.querySelectorAll("[data-action]").forEach((item) => item.classList.toggle("active", item === button));
        const action = actions.find((item) => item.key === button.dataset.action);
        note.textContent = action.text;
        setStatus(ui, action.label + "：" + action.text);
      }));
    }

    if (variant === "segmented") {
      const tabs = ["全部", "照片", "文字"];
      body.innerHTML = `<div class="mk-stage mk-seg-stage">
        <div class="mk-seg" role="tablist" aria-label="内容类型">${tabs.map((tab, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-seg="${index}">${tab}</button>`).join("")}<i data-thumb></i></div>
        <div class="mk-seg-panel" data-panel><span class="mono">ALL ENTRIES</span><h5>四十八条<br>慢慢看。</h5><p>切换分段时，滑块先移动，内容再淡入。滑块尺寸由当前选项决定。</p></div>
      </div>`;
      const buttons = Array.from(body.querySelectorAll("[data-seg]"));
      const thumb = body.querySelector("[data-thumb]");
      const panel = body.querySelector("[data-panel]");
      const copy = ["ALL ENTRIES", "PHOTOS", "WORDS"];
      const headings = ["四十八条<br>慢慢看。", "十二张<br>留光。", "三十六段<br>写下来。"];
      const move = (index) => {
        const button = buttons[index];
        thumb.style.width = button.offsetWidth + "px";
        thumb.style.transform = `translateX(${button.offsetLeft}px)`;
      };
      buttons.forEach((button, index) => bind(bag, button, "click", () => {
        buttons.forEach((item) => item.setAttribute("aria-selected", String(item === button)));
        panel.animate?.([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" });
        panel.innerHTML = `<span class="mono">${copy[index]}</span><h5>${headings[index]}</h5><p>切换分段时，滑块先移动，内容再淡入。滑块尺寸由当前选项决定。</p>`;
        move(index);
        setStatus(ui, "当前分段：" + tabs[index]);
      }));
      move(0);
    }

    if (variant === "ring") {
      body.innerHTML = `<div class="mk-stage mk-ring-stage">
        <div class="mk-ring-wrap">
          <svg viewBox="0 0 200 200" class="mk-ring" aria-hidden="true"><circle cx="100" cy="100" r="78" class="track"/><circle cx="100" cy="100" r="78" class="value" data-circle/></svg>
          <div class="mk-ring-label"><b data-value>68</b><span class="mono">/ 100</span><small>今日专注</small></div>
        </div>
        <div class="mk-ring-control"><span class="mono">拖动滑杆</span><input type="range" min="0" max="100" value="68" aria-label="专注值" data-range><div><span>0</span><span>100</span></div></div>
      </div>`;
      const circle = body.querySelector("[data-circle]");
      const value = body.querySelector("[data-value]");
      const range = body.querySelector("[data-range]");
      const circumference = 2 * Math.PI * 78;
      circle.style.strokeDasharray = String(circumference);
      const update = () => {
        const number = Number(range.value);
        value.textContent = number;
        circle.style.strokeDashoffset = String(circumference * (1 - number / 100));
        setStatus(ui, "专注值 " + number + " · 环形与滑杆联动");
      };
      bind(bag, range, "input", update);
      update();
    }

    if (variant === "search") {
      const entries = ["咖啡", "窗边", "旧木桌", "海边", "一封信", "收尾"];
      body.innerHTML = `<div class="mk-stage mk-search-stage">
        <div class="mk-search-row">
          <label class="mk-search-field"><span aria-hidden="true">⌕</span><input type="search" placeholder="搜索记录" aria-label="搜索记录" data-search></label>
          <button type="button" class="mk-filter" data-filter aria-expanded="false">筛选 <i>2</i></button>
        </div>
        <div class="mk-filter-chips" data-chips hidden><button type="button" aria-pressed="true">全部</button><button type="button" aria-pressed="false">照片</button><button type="button" aria-pressed="false">文字</button><button type="button" aria-pressed="false">本周</button></div>
        <div class="mk-search-list" data-list>${entries.map((entry, index) => `<article><span class="mono">0${index + 1}</span><b>${entry}</b><small>${["咖啡", "光", "木", "海", "信", "傍晚"][index]}</small></article>`).join("")}</div>
      </div>`;
      const input = body.querySelector("[data-search]");
      const chips = body.querySelector("[data-chips]");
      const filter = body.querySelector("[data-filter]");
      const list = body.querySelector("[data-list]");
      const rows = Array.from(list.querySelectorAll("article"));
      bind(bag, filter, "click", () => {
        const open = filter.getAttribute("aria-expanded") !== "true";
        filter.setAttribute("aria-expanded", String(open));
        chips.hidden = !open;
        setStatus(ui, open ? "筛选行已展开" : "筛选已收起");
      });
      bind(bag, input, "input", () => {
        const query = input.value.trim();
        rows.forEach((row) => { row.hidden = query !== "" && !row.innerText.includes(query); });
        setStatus(ui, query ? "搜索：" + query : "显示全部记录");
      });
      chips.querySelectorAll("button").forEach((button) => bind(bag, button, "click", () => {
        chips.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        setStatus(ui, "筛选：" + button.textContent);
      }));
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     14. BUTTON LAB
     ============================================================ */
  S.buttonLab = function (root, variant, ctx) {
    const bag = [];
    const prompt = (ctx && ctx.prompt) || {};
    const isApp = prompt.category === "app";
    const titles = {
      liquid: "点击位置扩散填充", hold: "长按环形确认", progress: isApp ? "保存按钮变进度环" : "按钮变进度条",
      slide: "滑动确认", magnet: "磁吸跟随", yield: "按钮让位", roll: isApp ? "状态按钮文字纵向滚动" : "文案滚动切换", panel: "按钮展开面板"
    };
    const notes = {
      liquid: "从触点开始<br>不是从中心", hold: "按住 900ms<br>移开就取消",
      progress: "进度条由按钮<br>本身变形", slide: "拖到头<br>才提交",
      magnet: "靠近才吸<br>离开就回", yield: "一个变大<br>邻居让位",
      roll: "文字上滚<br>高度不变", panel: "展开在按钮<br>下方"
    };
    const ui = shell(root, {
      kicker: isApp ? "MOBILE / BUTTON" : "WEB / BUTTON",
      title: titles[variant] || "按钮实验室",
      note: notes[variant] || "按钮<br>不只是一块颜色",
      status: ""
    });
    const body = ui.body;

    if (variant === "liquid") {
      body.innerHTML = `<div class="bl-stage bl-center">
        <div class="bl-liquid-demo"><button type="button" class="bl-liquid" data-liquid><i data-fill></i><span data-label>加入收藏</span></button><p class="bl-caption">点按钮的不同位置，看填充从触点扩散。</p></div>
      </div>`;
      const button = body.querySelector("[data-liquid]");
      const fill = body.querySelector("[data-fill]");
      const label = body.querySelector("[data-label]");
      let saved = false;
      bind(bag, button, "pointerdown", (event) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty("--x", ((event.clientX - rect.left) / rect.width * 100) + "%");
        button.style.setProperty("--y", ((event.clientY - rect.top) / rect.height * 100) + "%");
      });
      bind(bag, button, "click", () => {
        saved = !saved;
        button.classList.toggle("saved", saved);
        fill.animate?.([
          { clipPath: "circle(0% at var(--x) var(--y))" },
          { clipPath: "circle(150% at var(--x) var(--y))" }
        ], { duration: 520, easing: "cubic-bezier(.22,.75,.25,1)", fill: "both" });
        label.textContent = saved ? "已收藏 ✓" : "加入收藏";
        setStatus(ui, saved ? "已收藏 · 填充从触点展开" : "已取消 · 沿原路收回");
      });
    }

    if (variant === "hold") {
      body.innerHTML = `<div class="bl-stage bl-center">
        <div class="bl-hold-demo"><button type="button" class="bl-hold" data-hold style="--p:0"><span data-label>按住确认</span><i class="bl-hold-ring" aria-hidden="true"></i></button><p class="bl-caption">按住 900ms。提前松手或移出，进度归零。</p></div>
      </div>`;
      const button = body.querySelector("[data-hold]");
      const label = body.querySelector("[data-label]");
      let rafId = 0;
      let startTime = 0;
      let holding = false;
      const reset = () => {
        holding = false;
        cancelAnimationFrame(rafId);
        button.style.setProperty("--p", "0");
        button.classList.remove("holding", "done");
        label.textContent = "按住确认";
      };
      const tick = () => {
        if (!holding) return;
        const p = clamp((performance.now() - startTime) / 900, 0, 1);
        button.style.setProperty("--p", String(p));
        if (p >= 1) {
          holding = false;
          button.classList.add("done");
          label.textContent = "已确认 ✓";
          setStatus(ui, "长按完成 · 动作已提交");
          timer(bag, reset, 1500);
          return;
        }
        rafId = requestAnimationFrame(tick);
      };
      const start = () => {
        if (holding) return;
        holding = true;
        startTime = performance.now();
        button.classList.add("holding");
        label.textContent = "继续按住…";
        rafId = requestAnimationFrame(tick);
      };
      bind(bag, button, "pointerdown", (event) => { button.setPointerCapture(event.pointerId); start(); });
      bind(bag, button, "pointerup", () => { if (holding) { reset(); setStatus(ui, "已取消 · 没有提交"); } });
      bind(bag, button, "pointerleave", () => { if (holding) { reset(); setStatus(ui, "已移出 · 没有提交"); } });
      bind(bag, button, "keydown", (event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); start(); } });
      bind(bag, button, "keyup", () => { if (holding) { reset(); setStatus(ui, "已取消 · 没有提交"); } });
    }

    if (variant === "progress") {
      if (isApp) {
        body.innerHTML = `<div class="bl-stage bl-center">
          <div class="bl-save-demo">
            <button type="button" class="bl-save" data-save aria-label="保存">
              <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="track"/><circle cx="60" cy="60" r="52" class="value" data-ring/></svg>
              <span data-label>保存</span>
            </button>
            <p class="bl-caption">点击后按钮变成进度环，完成再变回保存。</p>
          </div>
        </div>`;
        const save = body.querySelector("[data-save]");
        const ring = body.querySelector("[data-ring]");
        const label = body.querySelector("[data-label]");
        const circumference = 2 * Math.PI * 52;
        ring.style.strokeDasharray = String(circumference);
        let running = false;
        const run = () => {
          if (running) return;
          running = true;
          let value = 0;
          save.classList.add("running");
          const step = () => {
            value = Math.min(100, value + 3 + Math.random() * 9);
            ring.style.strokeDashoffset = String(circumference * (1 - value / 100));
            label.textContent = Math.round(value) + "%";
            if (value < 100) { timer(bag, step, 70 + Math.random() * 60); return; }
            save.classList.add("done");
            label.textContent = "已保存";
            setStatus(ui, "保存完成 · 进度环停在 100%");
            timer(bag, () => {
              save.classList.remove("running", "done");
              ring.style.strokeDashoffset = String(circumference);
              label.textContent = "保存";
              running = false;
            }, 1400);
          };
          step();
        };
        bind(bag, save, "click", run);
      } else {
        body.innerHTML = `<div class="bl-stage bl-center">
          <div class="bl-progress-demo">
            <button type="button" class="bl-progress-button" data-start aria-expanded="false">
              <span class="bl-progress-fill" data-fill></span>
              <span data-label>保存更改</span>
              <span class="mono" data-percent>READY</span>
            </button>
            <p class="bl-caption">按钮的宽度先展开成进度条，完成后再收回。</p>
          </div>
        </div>`;
        const button = body.querySelector("[data-start]");
        const fill = body.querySelector("[data-fill]");
        const label = body.querySelector("[data-label]");
        const percent = body.querySelector("[data-percent]");
        let running = false;
        bind(bag, button, "click", () => {
          if (running) return;
          running = true;
          button.setAttribute("aria-expanded", "true");
          button.classList.add("running");
          let value = 0;
          const step = () => {
            value = Math.min(100, value + 5 + Math.random() * 12);
            fill.style.width = value + "%";
            label.textContent = value < 100 ? "正在保存…" : "已保存 ✓";
            percent.textContent = Math.round(value) + "%";
            if (value < 100) { timer(bag, step, 110); return; }
            setStatus(ui, "保存完成 · 按钮收回原位");
            timer(bag, () => {
              button.setAttribute("aria-expanded", "false");
              button.classList.remove("running");
              fill.style.width = "0%";
              label.textContent = "保存更改";
              percent.textContent = "READY";
              running = false;
            }, 1200);
          };
          step();
        });
      }
    }

    if (variant === "slide") {
      body.innerHTML = `<div class="bl-stage bl-center">
        <div class="bl-slide-demo">
          <div class="bl-slide-track" data-track><span class="bl-slide-label" data-label>向右滑动确认</span><button type="button" class="bl-slide-handle" data-handle aria-label="向右滑动确认">→</button></div>
          <p class="bl-caption">拖到 78% 以上提交；中途松手会回弹。</p>
        </div>
      </div>`;
      const track = body.querySelector("[data-track]");
      const handle = body.querySelector("[data-handle]");
      const label = body.querySelector("[data-label]");
      let start = 0;
      let offset = 0;
      let dragging = false;
      const max = () => track.clientWidth - handle.offsetWidth - 8;
      const paint = (value) => {
        handle.style.transform = `translateX(${value}px)`;
        track.style.setProperty("--fill", (value / max() * 100) + "%");
        label.textContent = value / max() > .78 ? "松手提交" : "向右滑动确认";
      };
      bind(bag, handle, "pointerdown", (event) => {
        if (track.dataset.done === "true") return;
        dragging = true;
        start = event.clientX;
        handle.setPointerCapture(event.pointerId);
        handle.style.transition = "none";
      });
      bind(bag, handle, "pointermove", (event) => {
        if (!dragging) return;
        offset = clamp(event.clientX - start, 0, max());
        paint(offset);
      });
      bind(bag, handle, "pointerup", () => {
        if (!dragging) return;
        dragging = false;
        handle.style.transition = "";
        if (offset / max() > .78) {
          paint(max());
          track.dataset.done = "true";
          label.textContent = "已确认 ✓";
          handle.textContent = "✓";
          setStatus(ui, "滑动确认完成");
          timer(bag, () => {
            offset = 0;
            track.dataset.done = "false";
            handle.textContent = "→";
            paint(0);
          }, 1600);
        } else {
          offset = 0;
          paint(0);
          setStatus(ui, "未到阈值 · 回弹");
        }
      });
      bind(bag, handle, "keydown", (event) => {
        if (event.key === "ArrowRight") { offset = clamp(offset + 40, 0, max()); paint(offset); }
        if (event.key === "Enter" && offset / max() > .78) { offset = max(); paint(offset); track.dataset.done = "true"; label.textContent = "已确认 ✓"; }
      });
      handle.tabIndex = 0;
    }

    if (variant === "magnet") {
      body.innerHTML = `<div class="bl-stage bl-magnet-stage" data-field>
        <span class="bl-magnet-hint mono">把指针移到按钮附近</span>
        <button type="button" class="bl-magnet" data-magnet>靠近我</button>
        <p class="bl-caption" data-readout>距离：—</p>
      </div>`;
      const field = body.querySelector("[data-field]");
      const button = body.querySelector("[data-magnet]");
      const readout = body.querySelector("[data-readout]");
      const reset = () => {
        button.style.transform = "";
        button.classList.remove("near");
        readout.textContent = "距离：—";
      };
      bind(bag, field, "pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const distance = Math.hypot(dx, dy);
        if (distance > 150) { reset(); return; }
        const pull = (1 - distance / 150) * .32;
        button.style.transform = `translate(${dx * pull}px,${dy * pull}px)`;
        button.classList.toggle("near", distance < 90);
        readout.textContent = "距离：" + Math.round(distance) + "px · 吸力 " + Math.round(pull * 100) + "%";
      });
      bind(bag, field, "pointerleave", reset);
      bind(bag, button, "click", () => setStatus(ui, "按钮被磁吸后点击"));
    }

    if (variant === "yield") {
      const actions = [
        { key: "later", label: "稍后", cls: "ghost" },
        { key: "look", label: "查看详情", cls: "soft" },
        { key: "buy", label: "立即购买", cls: "solid" }
      ];
      body.innerHTML = `<div class="bl-stage bl-center">
        <div class="bl-yield-demo"><div class="bl-yield" data-group>${actions.map((action) => `<button type="button" class="${action.cls}" data-yield="${action.key}">${action.label}</button>`).join("")}</div><p class="bl-caption">悬停或聚焦一个按钮，它变大，邻居让位。</p></div>
      </div>`;
      const buttons = Array.from(body.querySelectorAll("[data-yield]"));
      const setActive = (active) => buttons.forEach((button) => button.classList.toggle("active", button === active));
      buttons.forEach((button) => {
        bind(bag, button, "mouseenter", () => setActive(button));
        bind(bag, button, "focus", () => setActive(button));
        bind(bag, button, "click", () => {
          setActive(button);
          setStatus(ui, "已选择：" + button.textContent);
        });
      });
      bind(bag, body.querySelector("[data-group]"), "mouseleave", () => setActive(null));
      bind(bag, body.querySelector("[data-group]"), "blurout", () => setActive(null));
    }

    if (variant === "roll") {
      const states = isApp ? ["未开始", "处理中", "已完成"] : ["保存", "已保存", "继续编辑"];
      body.innerHTML = `<div class="bl-stage bl-center">
        <div class="bl-roll-demo"><button type="button" class="bl-roll" data-roll aria-label="${states[0]}"><span data-roll-track>${states.map((state) => `<i>${state}</i>`).join("")}</span></button><p class="bl-caption">点击后整列文字上滚，按钮高度不变。</p></div>
      </div>`;
      const button = body.querySelector("[data-roll]");
      const track = body.querySelector("[data-roll-track]");
      let index = 0;
      bind(bag, button, "click", () => {
        index = (index + 1) % states.length;
        track.style.transform = `translateY(${-index * 100}%)`;
        button.setAttribute("aria-label", states[index]);
        setStatus(ui, "状态切换：" + states[index]);
      });
    }

    if (variant === "panel") {
      const options = ["复制链接", "导出为图片", "发送到手机"];
      body.innerHTML = `<div class="bl-stage bl-center">
        <div class="bl-panel-demo">
          <button type="button" class="bl-panel-button" data-toggle aria-expanded="false"><span>更多操作</span><i>⌄</i></button>
          <div class="bl-panel" data-panel><div>${options.map((option, index) => `<button type="button" data-option><span class="mono">0${index + 1}</span>${option}</button>`).join("")}</div></div>
          <p class="bl-caption" data-note>面板在按钮下方展开，焦点留在按钮上。</p>
        </div>
      </div>`;
      const toggle = body.querySelector("[data-toggle]");
      const panel = body.querySelector("[data-panel]");
      const note = body.querySelector("[data-note]");
      const set = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        panel.classList.toggle("open", open);
        if (!open) toggle.focus();
        setStatus(ui, open ? "面板已展开" : "面板已收起");
      };
      bind(bag, toggle, "click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
      body.querySelectorAll("[data-option]").forEach((option) => bind(bag, option, "click", () => {
        note.textContent = "已选择：" + option.textContent.replace(/^0\d/, "").trim();
        setStatus(ui, note.textContent);
        set(false);
      }));
    }

    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     15. LAYOUT LAB
     ============================================================ */
  S.layoutLab = function (root, variant) {
    const bag = [];
    const titles = {
      inline: "标题里嵌小图", folder: "档案夹标签页", grid: "点一格撑成通栏", cutout: "镂空大标题",
      parallax: "双列错位滚动", split: "拖动分屏比例", bubbles: "圆泡堆叠选择", sticky: "左栏日期吸住"
    };
    const notes = {
      inline: "图是句子<br>的一部分", folder: "标签在前<br>内容在后",
      grid: "选中一格<br>重排其余", cutout: "文字是窗<br>不是贴图",
      parallax: "两列错位<br>建立纵深", split: "比例由手<br>决定",
      bubbles: "大小不同<br>层级不同", sticky: "日期不动<br>内容滑过"
    };
    const ui = shell(root, {
      kicker: "WEB / LAYOUT",
      title: titles[variant] || "布局实验室",
      note: notes[variant] || "布局<br>先于装饰",
      status: ""
    });
    const body = ui.body;

    if (variant === "inline") {
      body.innerHTML = `<div class="ll-stage ll-inline-stage">
        <div class="ll-inline-card">
          <p class="ll-inline-kicker mono">EDITORIAL / 04</p>
          <h5>把<span class="ll-inline-img i1" role="img" aria-label="窗边的光"></span>光留在墙上，<br>把<span class="ll-inline-img i2" role="img" aria-label="旧木桌"></span>桌面慢慢收干净。</h5>
          <p class="ll-inline-copy">图片不是插图，是句子里的一个词。它跟着行高走，不单独占一行。</p>
          <div class="ll-inline-foot"><span class="mono">READ 04 MIN</span><button type="button" data-swap>换一组图 ↺</button></div>
        </div>
      </div>`;
      const images = Array.from(body.querySelectorAll(".ll-inline-img"));
      const sets = [["i1", "i2"], ["i2", "i3"], ["i3", "i1"]];
      let index = 0;
      bind(bag, body.querySelector("[data-swap]"), "click", () => {
        index = (index + 1) % sets.length;
        images[0].className = "ll-inline-img " + sets[index][0];
        images[1].className = "ll-inline-img " + sets[index][1];
        images.forEach((image) => image.animate?.([{ transform: "scale(.82) rotate(-4deg)" }, { transform: "none" }], { duration: 380, easing: "cubic-bezier(.16,1.3,.3,1)" }));
        setStatus(ui, "已换一组内嵌图 · 行高保持不变");
      });
    }

    if (variant === "folder") {
      const folders = [
        { label: "2024", title: "旧档案", count: "18 份", copy: "纸边发黄，但顺序还在。" },
        { label: "2025", title: "进行中", count: "07 份", copy: "有些事还没收尾，先留着。" },
        { label: "2026", title: "今年", count: "12 份", copy: "新的标签，新的抽屉。" }
      ];
      body.innerHTML = `<div class="ll-stage ll-folder-stage">
        <div class="ll-folder-tabs" role="tablist" aria-label="档案年份">${folders.map((folder, index) => `<button type="button" role="tab" aria-selected="${index === 2}" data-folder="${index}">${folder.label}</button>`).join("")}</div>
        <div class="ll-folder-stack">${folders.map((folder, index) => `<article class="ll-folder" data-panel="${index}"><div><span class="mono">${folder.count}</span><h5>${folder.title}</h5><p>${folder.copy}</p></div><span class="ll-folder-mark">${folder.label}</span></article>`).join("")}</div>
      </div>`;
      const buttons = Array.from(body.querySelectorAll("[data-folder]"));
      const panels = Array.from(body.querySelectorAll("[data-panel]"));
      const set = (index) => {
        buttons.forEach((button, i) => button.setAttribute("aria-selected", String(i === index)));
        panels.forEach((panel, i) => {
          panel.className = "ll-folder" + (i === index ? " front" : i < index ? " behind-left" : " behind-right");
        });
        setStatus(ui, "打开 " + folders[index].label + " · " + folders[index].title);
      };
      buttons.forEach((button, index) => bind(bag, button, "click", () => set(index)));
      set(2);
    }

    if (variant === "grid") {
      const tiles = [
        { title: "总览", value: "24", unit: "个项目", copy: "一眼看到全部。" },
        { title: "进行中", value: "07", unit: "个任务", copy: "正在移动的部分。" },
        { title: "待整理", value: "12", unit: "条记录", copy: "先放一边，稍后处理。" },
        { title: "已完成", value: "48", unit: "次交付", copy: "留下来当证据。" }
      ];
      body.innerHTML = `<div class="ll-stage">
        <div class="ll-bento" data-bento>${tiles.map((tile, index) => `<button type="button" class="ll-bento-tile" data-tile="${index}" aria-pressed="${index === 0}"><span class="mono">0${index + 1}</span><b>${tile.title}</b><strong>${tile.value}</strong><small>${tile.unit}</small><p>${tile.copy}</p></button>`).join("")}</div>
        <p class="ll-bento-note">点击任意一格，它会撑成通栏，其余格子重新排列。</p>
      </div>`;
      const bento = body.querySelector("[data-bento]");
      const tileEls = Array.from(body.querySelectorAll("[data-tile]"));
      const set = (index) => {
        const first = new Map(tileEls.map((tile) => [tile, tile.getBoundingClientRect()]));
        tileEls.forEach((tile, i) => {
          tile.classList.toggle("active", i === index);
          tile.setAttribute("aria-pressed", String(i === index));
        });
        tileEls.forEach((tile) => {
          const before = first.get(tile);
          const after = tile.getBoundingClientRect();
          if (!before || prefersReduced()) return;
          const dx = before.left - after.left;
          const dy = before.top - after.top;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
          tile.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1.06,.3,1)" });
        });
        setStatus(ui, tiles[index].title + " 已撑成通栏");
      };
      tileEls.forEach((tile, index) => bind(bag, tile, "click", () => set(index)));
    }

    if (variant === "cutout") {
      body.innerHTML = `<div class="ll-stage ll-cutout-stage" data-stage>
        <div class="ll-cutout-card">
          <h5 data-title>把光<br>留在墙上</h5>
          <div class="ll-cutout-foot"><span class="mono">TYPE AS WINDOW</span><button type="button" data-shift>移动底图 →</button></div>
        </div>
      </div>`;
      const stage = body.querySelector("[data-stage]");
      const title = body.querySelector("[data-title]");
      let shift = 0;
      bind(bag, stage, "pointermove", (event) => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width * 100;
        const y = (event.clientY - rect.top) / rect.height * 100;
        title.style.backgroundPosition = `${x}% ${y}%`;
      });
      bind(bag, body.querySelector("[data-shift]"), "click", () => {
        shift = (shift + 33) % 100;
        title.style.backgroundPosition = shift + "% 50%";
        setStatus(ui, "底图位置移动 · 字仍然是窗");
      });
    }

    if (variant === "parallax") {
      body.innerHTML = `<div class="ll-stage ll-parallax-stage">
        <div class="ll-parallax-scroll" data-scroller tabindex="0" aria-label="双列视差">
          <div class="ll-parallax-grid">
            <div class="ll-par-col" data-left>${["光", "墙", "窗", "影", "桌"].map((t, i) => `<div class="ll-par-item ${i % 2 ? "tall" : ""}"><span class="mono">0${i + 1}</span><b>${t}</b></div>`).join("")}</div>
            <div class="ll-par-col" data-right>${["A", "B", "C", "D"].map((t, i) => `<div class="ll-par-item text"><span class="mono">${t}</span><p>${["页面滚动时，两列以不同速度移动。", "近处更快，远处更慢。", "速度差建立空间，不是装饰。", "停下来时，仍然读得懂。"][i]}</p></div>`).join("")}</div>
          </div>
        </div>
      </div>`;
      const scroller = body.querySelector("[data-scroller]");
      const left = body.querySelector("[data-left]");
      const right = body.querySelector("[data-right]");
      bind(bag, scroller, "scroll", () => {
        const y = scroller.scrollTop;
        left.style.transform = `translateY(${y * -.08}px)`;
        right.style.transform = `translateY(${y * -.2}px)`;
      }, { passive: true });
    }

    if (variant === "split") {
      body.innerHTML = `<div class="ll-stage ll-split-stage">
        <div class="ll-split" data-split style="--split:50%">
          <div class="ll-split-pane left"><span class="mono">BEFORE</span><h5>把桌面<br>收干净</h5><p>左侧保留原始版本。</p></div>
          <div class="ll-split-pane right"><span class="mono">AFTER</span><h5>只留<br>一件事</h5><p>右侧是整理后的版本。</p></div>
          <button type="button" class="ll-split-handle" data-handle aria-label="拖动分屏比例"><i>↔</i></button>
        </div>
      </div>`;
      const split = body.querySelector("[data-split]");
      const handle = body.querySelector("[data-handle]");
      let dragging = false;
      const set = (clientX) => {
        const rect = split.getBoundingClientRect();
        const value = clamp((clientX - rect.left) / rect.width * 100, 22, 78);
        split.style.setProperty("--split", value + "%");
        return value;
      };
      bind(bag, handle, "pointerdown", (event) => {
        dragging = true;
        handle.setPointerCapture(event.pointerId);
      });
      bind(bag, handle, "pointermove", (event) => {
        if (!dragging) return;
        set(event.clientX);
      });
      bind(bag, handle, "pointerup", (event) => {
        if (!dragging) return;
        dragging = false;
        const value = set(event.clientX);
        setStatus(ui, "分屏比例 " + Math.round(value) + " / " + Math.round(100 - value));
      });
      bind(bag, handle, "keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const current = parseFloat(getComputedStyle(split).getPropertyValue("--split")) || 50;
        const next = clamp(current + (event.key === "ArrowRight" ? 5 : -5), 22, 78);
        split.style.setProperty("--split", next + "%");
        setStatus(ui, "分屏比例 " + Math.round(next) + " / " + Math.round(100 - next));
      });
      handle.tabIndex = 0;
    }

    if (variant === "bubbles") {
      const bubbles = ["静", "光", "纸", "窗", "慢"];
      body.innerHTML = `<div class="ll-stage ll-bubble-stage" data-bubble-stage>
        ${bubbles.map((bubble, index) => `<button type="button" class="ll-bubble b${index}" data-bubble="${index}" aria-pressed="${index === 0}"><span>${bubble}</span></button>`).join("")}
        <p class="ll-bubble-note" data-note>选中一个，其他圆泡向后退。</p>
      </div>`;
      const els = Array.from(body.querySelectorAll("[data-bubble]"));
      const note = body.querySelector("[data-note]");
      els.forEach((el) => bind(bag, el, "click", () => {
        els.forEach((item) => {
          item.setAttribute("aria-pressed", String(item === el));
          item.classList.toggle("dim", item !== el);
        });
        note.textContent = "已选择「" + el.textContent + "」，其余圆泡后退。";
        setStatus(ui, note.textContent);
      }));
    }

    if (variant === "sticky") {
      body.innerHTML = `<div class="ll-stage ll-sticky-stage">
        <div class="ll-sticky-scroll" data-scroller tabindex="0" aria-label="日期吸住的时间线">
          <div class="ll-sticky-grid">
            <aside class="ll-sticky-date"><span class="mono">2026</span><b>10 / 29</b><small>星期四</small><div class="ll-sticky-line"></div></aside>
            <div class="ll-sticky-items">${["09:20 咖啡比昨天苦一点", "11:40 把邮件发出去", "14:05 窗边的光停在桌角", "16:30 长桌会议", "18:10 收尾", "20:00 回家"].map((item, index) => `<article><span class="mono">0${index + 1}</span><p>${item}</p></article>`).join("")}</div>
          </div>
        </div>
      </div>`;
      const scroller = body.querySelector("[data-scroller]");
      const date = body.querySelector(".ll-sticky-date");
      bind(bag, scroller, "scroll", () => {
        date.classList.toggle("stuck", scroller.scrollTop > 6);
      }, { passive: true });
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     16. SELECT LAB
     ============================================================ */
  S.selectLab = function (root, variant) {
    const bag = [];
    const titles = {
      single: "单选下拉", local: "本地筛选下拉", group: "分组下拉", remote: "远程搜索下拉",
      multi: "多选折叠选择器", tree: "父子联动树形选择器", date: "日期区间选择器",
      creatable: "可新建选择器", split: "拆分按钮", mega: "三列分组多列导航"
    };
    const notes = {
      single: "选中之后<br>菜单收起", local: "输入即筛<br>不用翻", group: "先分组<br>再选择",
      remote: "输入才请求<br>结果可取消", multi: "选完再确认<br>计数清楚", tree: "父子联动<br>半选状态",
      date: "区间清楚<br>预设可用", creatable: "没有就新建<br>不中断", split: "主操作和<br>更多分开",
      mega: "三列并排<br>一次看全"
    };
    const ui = shell(root, {
      kicker: "WEB / SELECT",
      title: titles[variant] || "选择器实验室",
      note: notes[variant] || "选择<br>需要边界",
      status: "点击控件试试"
    });
    const body = ui.body;
    let autoOpen = null;
    const wrap = (inner, hint) => `<div class="sel-stage"><div class="sel-shell">${inner}<p class="sel-hint">${hint}</p></div></div>`;

    const closeOutside = (container, close) => {
      const handler = (event) => { if (!container.contains(event.target)) close(); };
      document.addEventListener("pointerdown", handler);
      bag.push(() => document.removeEventListener("pointerdown", handler));
    };
    const keyNav = (menu) => {
      const options = Array.from(menu.querySelectorAll("[data-option]"));
      menu.addEventListener("keydown", (event) => {
        const index = options.indexOf(document.activeElement);
        if (event.key === "ArrowDown") { event.preventDefault(); options[Math.min(options.length - 1, index + 1)]?.focus(); }
        if (event.key === "ArrowUp") { event.preventDefault(); options[Math.max(0, index - 1)]?.focus(); }
      });
    };

    if (variant === "single") {
      const people = [
        { name: "林小满", role: "设计", color: "#c7b7ff" },
        { name: "周予安", role: "前端", color: "#c9ef6f" },
        { name: "陈默", role: "内容", color: "#a9d6ff" },
        { name: "方野", role: "运营", color: "#ff9d78" }
      ];
      body.innerHTML = wrap(`<p class="sel-kicker mono">ASSIGNEE</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-haspopup="listbox" aria-expanded="false"><span data-label>选择负责人</span><i aria-hidden="true">⌄</i></button><div class="sel-menu" data-menu role="listbox" aria-label="负责人">${people.map((person, index) => `<button type="button" class="sel-option" role="option" aria-selected="${index === 0}" data-option="${index}"><span class="sel-avatar" style="background:${person.color}">${person.name[0]}</span><span><b>${person.name}</b><small>${person.role}</small></span><i class="sel-check">✓</i></button>`).join("")}</div></div>`, "选中后菜单立即收起，焦点回到触发器。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      const close = () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); };
      const open = () => { menu.classList.add("open"); trigger.setAttribute("aria-expanded", "true"); menu.querySelector('[aria-selected="true"]')?.focus(); };
      bind(bag, trigger, "click", () => { if (menu.classList.contains("open")) close(); else open(); });
      bind(bag, trigger, "keydown", (event) => { if (event.key === "ArrowDown") { event.preventDefault(); open(); } });
      bind(bag, menu, "keydown", (event) => { if (event.key === "Escape") { close(); trigger.focus(); } });
      keyNav(menu);
      body.querySelectorAll("[data-option]").forEach((option) => bind(bag, option, "click", () => {
        const person = people[Number(option.dataset.option)];
        body.querySelectorAll("[data-option]").forEach((item) => item.setAttribute("aria-selected", String(item === option)));
        label.textContent = person.name + " · " + person.role;
        close();
        trigger.focus();
        setStatus(ui, "已选择 " + person.name + "（" + person.role + "）");
      }));
      closeOutside(field, close);
    }

    if (variant === "local") {
      const cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "南京", "武汉", "西安", "厦门"];
      body.innerHTML = wrap(`<p class="sel-kicker mono">CITY FILTER</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-haspopup="listbox" aria-expanded="false"><span data-label>全部城市</span><i aria-hidden="true">⌄</i></button><div class="sel-menu" data-menu role="listbox" aria-label="城市"><div class="sel-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="输入城市名" aria-label="筛选城市" data-filter></div><div data-options>${cities.map((city) => `<button type="button" class="sel-option" role="option" aria-selected="false" data-option><span></span><span><b>${city}</b></span><i class="sel-check">✓</i></button>`).join("")}</div><p class="sel-empty" data-empty hidden>没有匹配的城市</p></div></div>`, "输入时只过滤本地列表，不发送请求。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      const filter = body.querySelector("[data-filter]");
      const empty = body.querySelector("[data-empty]");
      const options = Array.from(body.querySelectorAll("[data-option]"));
      const close = () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); };
      const open = () => { menu.classList.add("open"); trigger.setAttribute("aria-expanded", "true"); filter.value = ""; options.forEach((o) => o.hidden = false); empty.hidden = true; filter.focus(); };
      bind(bag, trigger, "click", () => menu.classList.contains("open") ? close() : open());
      bind(bag, filter, "input", () => {
        const query = filter.value.trim();
        let shown = 0;
        options.forEach((option) => {
          const match = option.innerText.includes(query);
          option.hidden = !match;
          if (match) shown += 1;
        });
        empty.hidden = shown > 0;
      });
      options.forEach((option) => bind(bag, option, "click", () => {
        label.textContent = option.innerText.trim();
        options.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
        close();
        trigger.focus();
        setStatus(ui, "城市筛选：" + label.textContent);
      }));
      bind(bag, menu, "keydown", (event) => { if (event.key === "Escape") { close(); trigger.focus(); } });
      closeOutside(field, close);
    }

    if (variant === "group") {
      const groups = [
        { label: "设计", items: ["界面设计", "动效原型", "设计系统"] },
        { label: "开发", items: ["前端实现", "性能优化", "无障碍"] },
        { label: "运营", items: ["内容策略", "活动页面", "数据复盘"] }
      ];
      body.innerHTML = wrap(`<p class="sel-kicker mono">PROJECT TYPE</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-haspopup="listbox" aria-expanded="false"><span data-label>选择项目类型</span><i aria-hidden="true">⌄</i></button><div class="sel-menu" data-menu role="listbox" aria-label="项目类型">${groups.map((group) => `<p class="sel-group-label">${group.label}</p>${group.items.map((item) => `<button type="button" class="sel-option" role="option" aria-selected="false" data-option><span></span><span><b>${item}</b></span><i class="sel-check">✓</i></button>`).join("")}`).join("")}</div></div>`, "分组标题不参与选择，只帮助定位。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      const options = Array.from(body.querySelectorAll("[data-option]"));
      const close = () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); };
      bind(bag, trigger, "click", () => {
        if (menu.classList.contains("open")) { close(); return; }
        menu.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
        options[0].focus();
      });
      keyNav(menu);
      options.forEach((option) => bind(bag, option, "click", () => {
        label.textContent = option.querySelector("b").textContent;
        options.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
        close();
        trigger.focus();
        setStatus(ui, "已选择类型：" + label.textContent);
      }));
      bind(bag, menu, "keydown", (event) => { if (event.key === "Escape") { close(); trigger.focus(); } });
      closeOutside(field, close);
    }

    if (variant === "remote") {
      const cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "南京", "武汉", "西安", "厦门", "青岛", "长沙"];
      body.innerHTML = wrap(`<p class="sel-kicker mono">REMOTE SEARCH</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-haspopup="listbox" aria-expanded="false"><span data-label>搜索城市</span><i aria-hidden="true">⌄</i></button><div class="sel-menu" data-menu><div class="sel-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="输入关键字，模拟请求" aria-label="远程搜索城市" data-input></div><p class="sel-loading" data-loading hidden>搜索中…</p><div data-results></div></div></div>`, "输入 250ms 后才返回结果，旧请求会被取消。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      const input = body.querySelector("[data-input]");
      const loading = body.querySelector("[data-loading]");
      const results = body.querySelector("[data-results]");
      let remoteTimer = 0;
      const close = () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); };
      const open = () => { menu.classList.add("open"); trigger.setAttribute("aria-expanded", "true"); input.value = ""; results.innerHTML = ""; loading.hidden = true; input.focus(); };
      const render = (query) => {
        const items = cities.filter((city) => city.includes(query));
        results.innerHTML = items.length ? items.map((city) => `<button type="button" class="sel-option" role="option" data-option><span></span><span><b>${city}</b></span><i class="sel-check">✓</i></button>`).join("") : `<p class="sel-empty">没有结果，换个词试试</p>`;
        results.querySelectorAll("[data-option]").forEach((option) => bind(bag, option, "click", () => {
          label.textContent = option.innerText.trim();
          close();
          trigger.focus();
          setStatus(ui, "远程结果已选择：" + label.textContent);
        }));
      };
      bind(bag, trigger, "click", () => menu.classList.contains("open") ? close() : open());
      bind(bag, input, "input", () => {
        const query = input.value.trim();
        clearTimeout(remoteTimer);
        if (!query) { results.innerHTML = ""; loading.hidden = true; return; }
        loading.hidden = false;
        remoteTimer = setTimeout(() => {
          loading.hidden = true;
          render(query);
          setStatus(ui, "远程搜索返回：" + query);
        }, 250);
      });
      bag.push(() => clearTimeout(remoteTimer));
      bind(bag, menu, "keydown", (event) => { if (event.key === "Escape") { close(); trigger.focus(); } });
      closeOutside(field, close);
    }

    if (variant === "multi") {
      const tags = ["动效", "卡片", "手势", "图表", "表单", "空状态", "无障碍", "响应式"];
      const selected = new Set(["动效", "卡片"]);
      body.innerHTML = wrap(`<p class="sel-kicker mono">TAGS</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-haspopup="listbox" aria-expanded="false"><span data-label>已选 2 项</span><i aria-hidden="true">⌄</i></button><div class="sel-menu" data-menu role="listbox" aria-multiselectable="true" aria-label="标签">${tags.map((tag) => `<button type="button" class="sel-option" role="option" aria-selected="${selected.has(tag)}" data-option="${tag}"><span class="sel-box"></span><span><b>${tag}</b></span></button>`).join("")}<div class="sel-menu-foot"><button type="button" data-clear>清空</button><button type="button" data-apply>完成</button></div></div><div class="sel-chips" data-chips></div></div>`, "多选不立即收起，底部统一完成。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      const chips = body.querySelector("[data-chips]");
      const paint = () => {
        label.textContent = selected.size ? "已选 " + selected.size + " 项" : "选择标签";
        menu.querySelectorAll("[data-option]").forEach((option) => option.setAttribute("aria-selected", String(selected.has(option.dataset.option))));
        chips.innerHTML = Array.from(selected).map((tag) => `<span>${tag}<button type="button" aria-label="移除 ${tag}" data-remove="${tag}">×</button></span>`).join("");
        chips.querySelectorAll("[data-remove]").forEach((button) => bind(bag, button, "click", () => {
          selected.delete(button.dataset.remove);
          paint();
          setStatus(ui, "已移除 " + button.dataset.remove);
        }));
      };
      bind(bag, trigger, "click", () => {
        const open = !menu.classList.contains("open");
        menu.classList.toggle("open", open);
        trigger.setAttribute("aria-expanded", String(open));
      });
      menu.querySelectorAll("[data-option]").forEach((option) => bind(bag, option, "click", () => {
        const tag = option.dataset.option;
        if (selected.has(tag)) selected.delete(tag); else selected.add(tag);
        paint();
        setStatus(ui, "当前选择 " + selected.size + " 项");
      }));
      bind(bag, body.querySelector("[data-clear]"), "click", () => { selected.clear(); paint(); });
      bind(bag, body.querySelector("[data-apply]"), "click", () => {
        menu.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
        setStatus(ui, "已应用 " + selected.size + " 个标签");
      });
      closeOutside(field, () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); });
      paint();
    }

    if (variant === "tree") {
      const tree = [
        { label: "动效", children: ["入场", "拖拽", "滚动"] },
        { label: "组件", children: ["按钮", "卡片", "选择器"] },
        { label: "内容", children: ["空状态", "错误", "加载"] }
      ];
      body.innerHTML = wrap(`<p class="sel-kicker mono">TREE</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-expanded="false"><span data-label>选择目录</span><i aria-hidden="true">⌄</i></button><div class="sel-menu sel-tree" data-menu>${tree.map((group, gi) => `<div class="sel-tree-group"><label class="sel-tree-parent"><input type="checkbox" data-parent="${gi}"><span class="sel-box"></span><b>${group.label}</b></label>${group.children.map((child, ci) => `<label class="sel-tree-child"><input type="checkbox" data-child="${gi}-${ci}"><span class="sel-box"></span><span>${child}</span></label>`).join("")}</div>`).join("")}</div></div>`, "勾选父项会联动所有子项；只勾一部分时显示半选。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      const update = () => {
        let count = 0;
        tree.forEach((group, gi) => {
          const children = Array.from(menu.querySelectorAll(`[data-child^="${gi}-"]`));
          const checked = children.filter((child) => child.checked).length;
          const parent = menu.querySelector(`[data-parent="${gi}"]`);
          parent.checked = checked === children.length;
          parent.indeterminate = checked > 0 && checked < children.length;
          count += checked;
        });
        label.textContent = count ? "已选 " + count + " 项" : "选择目录";
        setStatus(ui, "已选 " + count + " 个条目");
      };
      bind(bag, trigger, "click", () => {
        const open = !menu.classList.contains("open");
        menu.classList.toggle("open", open);
        trigger.setAttribute("aria-expanded", String(open));
      });
      menu.querySelectorAll("[data-parent]").forEach((parent) => bind(bag, parent, "change", () => {
        const gi = parent.dataset.parent;
        menu.querySelectorAll(`[data-child^="${gi}-"]`).forEach((child) => { child.checked = parent.checked; });
        update();
      }));
      menu.querySelectorAll("[data-child]").forEach((child) => bind(bag, child, "change", update));
      closeOutside(field, () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); });
      update();
    }

    if (variant === "date") {
      body.innerHTML = wrap(`<p class="sel-kicker mono">DATE RANGE</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-expanded="false"><span data-label>选择日期区间</span><i aria-hidden="true">⌄</i></button><div class="sel-menu sel-date" data-menu><p class="sel-group-label">快捷区间</p><div class="sel-presets">${["近 7 天", "近 30 天", "本季度"].map((preset) => `<button type="button" data-preset="${preset}">${preset}</button>`).join("")}</div><label>开始<input type="date" value="2026-10-01" data-start></label><label>结束<input type="date" value="2026-10-29" data-end></label><button type="button" class="sel-apply" data-apply>应用区间</button></div></div>`, "预设只改输入值，点「应用」才提交。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      const start = body.querySelector("[data-start]");
      const end = body.querySelector("[data-end]");
      const fmt = (value) => value ? value.slice(5).replace("-", "/") : "—";
      const paint = () => { label.textContent = fmt(start.value) + " – " + fmt(end.value); };
      bind(bag, trigger, "click", () => {
        const open = !menu.classList.contains("open");
        menu.classList.toggle("open", open);
        trigger.setAttribute("aria-expanded", String(open));
      });
      body.querySelectorAll("[data-preset]").forEach((button) => bind(bag, button, "click", () => {
        const preset = button.dataset.preset;
        let days = preset === "近 7 天" ? 7 : preset === "近 30 天" ? 30 : 90;
        const endDate = new Date("2026-10-29");
        const startDate = new Date(endDate.getTime() - (days - 1) * 86400000);
        const iso = (date) => date.toISOString().slice(0, 10);
        start.value = iso(startDate);
        end.value = iso(endDate);
        body.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("active", item === button));
        setStatus(ui, "已套用预设：" + preset + "（尚未应用）");
      }));
      bind(bag, body.querySelector("[data-apply]"), "click", () => {
        paint();
        menu.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
        setStatus(ui, "日期区间：" + label.textContent);
      });
      closeOutside(field, () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); });
    }

    if (variant === "creatable") {
      const tags = ["动效", "卡片", "手势"];
      const selected = new Set(["动效"]);
      body.innerHTML = wrap(`<p class="sel-kicker mono">CREATABLE</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-expanded="false"><span data-label>选择或新建标签</span><i aria-hidden="true">⌄</i></button><div class="sel-menu" data-menu><div class="sel-search"><span aria-hidden="true">⌕</span><input type="text" placeholder="输入后回车新建" aria-label="新建标签" data-input></div><div data-options>${tags.map((tag) => `<button type="button" class="sel-option" role="option" aria-selected="${selected.has(tag)}" data-option="${tag}"><span></span><span><b>${tag}</b></span><i class="sel-check">✓</i></button>`).join("")}</div><p class="sel-create-hint" data-create hidden>按回车创建新标签</p></div><div class="sel-chips" data-chips></div></div>`, "输入不存在的标签，回车即可创建并选中。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      const input = body.querySelector("[data-input]");
      const createHint = body.querySelector("[data-create]");
      const optionsBox = body.querySelector("[data-options]");
      const chips = body.querySelector("[data-chips]");
      let all = tags.slice();
      const paint = () => {
        label.textContent = selected.size ? "已选 " + selected.size + " 项" : "选择或新建标签";
        optionsBox.innerHTML = all.map((tag) => `<button type="button" class="sel-option" role="option" aria-selected="${selected.has(tag)}" data-option="${tag}"><span></span><span><b>${tag}</b></span><i class="sel-check">✓</i></button>`).join("");
        optionsBox.querySelectorAll("[data-option]").forEach((option) => bind(bag, option, "click", () => {
          const tag = option.dataset.option;
          if (selected.has(tag)) selected.delete(tag); else selected.add(tag);
          paint();
          setStatus(ui, "已选择：" + tag);
        }));
        chips.innerHTML = Array.from(selected).map((tag) => `<span>${tag}</span>`).join("");
      };
      bind(bag, trigger, "click", () => {
        const open = !menu.classList.contains("open");
        menu.classList.toggle("open", open);
        trigger.setAttribute("aria-expanded", String(open));
        if (open) input.focus();
      });
      bind(bag, input, "input", () => {
        const query = input.value.trim();
        createHint.hidden = !query || all.includes(query);
      });
      bind(bag, input, "keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        if (!all.includes(value)) all.push(value);
        selected.add(value);
        input.value = "";
        createHint.hidden = true;
        paint();
        setStatus(ui, "已新建并选中：" + value);
      });
      closeOutside(field, () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); });
      paint();
    }

    if (variant === "split") {
      body.innerHTML = wrap(`<p class="sel-kicker mono">SPLIT ACTION</p><div class="sel-field sel-split" data-field><div class="sel-split-group"><button type="button" class="sel-split-main" data-main>发布</button><button type="button" class="sel-split-arrow" data-trigger aria-haspopup="menu" aria-expanded="false" aria-label="更多发布选项">⌄</button></div><div class="sel-menu sel-split-menu" data-menu role="menu"><button type="button" role="menuitem" data-choice="定时发布"><span class="mono">01</span>定时发布</button><button type="button" role="menuitem" data-choice="存为草稿"><span class="mono">02</span>存为草稿</button><button type="button" role="menuitem" data-choice="复制链接"><span class="mono">03</span>复制链接</button></div><p class="sel-split-note" data-note>主按钮执行默认动作，箭头只负责更多选项。</p></div>`, "默认动作与更多选项分开，避免误触。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const note = body.querySelector("[data-note]");
      let count = 0;
      bind(bag, body.querySelector("[data-main]"), "click", () => { count += 1; note.textContent = "已发布 " + count + " 次"; setStatus(ui, note.textContent); });
      bind(bag, trigger, "click", () => {
        const open = !menu.classList.contains("open");
        menu.classList.toggle("open", open);
        trigger.setAttribute("aria-expanded", String(open));
      });
      menu.querySelectorAll("[data-choice]").forEach((option) => bind(bag, option, "click", () => {
        note.textContent = "已选择：" + option.dataset.choice;
        setStatus(ui, note.textContent);
        menu.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }));
      closeOutside(field, () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); });
    }

    if (variant === "mega") {
      const columns = [
        { label: "产品", items: ["提示词实验室", "动效工作台", "组件库", "设计系统"] },
        { label: "资源", items: ["设计指南", "验收清单", "无障碍", "术语库"] },
        { label: "公司", items: ["关于", "方法", "联系", "招聘"] }
      ];
      body.innerHTML = wrap(`<p class="sel-kicker mono">MEGA NAV</p><div class="sel-field" data-field><button type="button" class="sel-trigger" data-trigger aria-expanded="false"><span data-label>打开导航</span><i aria-hidden="true">⌄</i></button><div class="sel-menu sel-mega" data-menu><div class="sel-mega-grid">${columns.map((column) => `<div><p class="sel-group-label">${column.label}</p>${column.items.map((item) => `<button type="button" data-option>${item}<span>↗</span></button>`).join("")}</div>`).join("")}</div><p class="sel-mega-foot">三列并排，一次看全；点击后关闭。</p></div></div>`, "列标题不可点，条目才是导航目标。");
      const field = body.querySelector("[data-field]");
      const trigger = body.querySelector("[data-trigger]");
      const menu = body.querySelector("[data-menu]");
      const label = body.querySelector("[data-label]");
      bind(bag, trigger, "click", () => {
        const open = !menu.classList.contains("open");
        menu.classList.toggle("open", open);
        trigger.setAttribute("aria-expanded", String(open));
        if (open) menu.querySelector("[data-option]")?.focus();
      });
      menu.querySelectorAll("[data-option]").forEach((option) => bind(bag, option, "click", () => {
        label.textContent = option.textContent.replace("↗", "").trim();
        menu.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
        setStatus(ui, "已选择导航：" + label.textContent);
      }));
      bind(bag, menu, "keydown", (event) => { if (event.key === "Escape") { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); trigger.focus(); } });
      closeOutside(field, () => { menu.classList.remove("open"); trigger.setAttribute("aria-expanded", "false"); });
    }

    const autoTrigger = body.querySelector(".sel-trigger, [data-trigger]");
    const autoMenu = body.querySelector("[data-menu]");
    if (autoTrigger && autoMenu) {
      timer(bag, () => {
        autoMenu.classList.add("open");
        autoTrigger.setAttribute("aria-expanded", "true");
      }, 140);
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     17. DASHBOARD MENU
     ============================================================ */
  S.dashboardMenu = function (root, variant) {
    const bag = [];
    const titles = {
      workspace: "工作区切换器", sort: "菜单拖动排序", search: "菜单内搜索",
      breadcrumb: "面包屑加同级下拉", flyout: "悬停滑出二级面板", arc: "弧形快捷菜单"
    };
    const notes = {
      workspace: "切工作区<br>不迷路", sort: "顺序自己排<br>松手就记住",
      search: "输入就缩小<br>范围", breadcrumb: "层级清楚<br>同级可换",
      flyout: "悬停展开<br>离开收回", arc: "一个按钮<br>四个方向"
    };
    const ui = shell(root, {
      kicker: "WEB / DASHBOARD MENU",
      title: titles[variant] || "后台菜单",
      note: notes[variant] || "菜单<br>是导航的地图",
      status: ""
    });
    const body = ui.body;
    const navItems = ["总览", "项目", "日历", "文件", "设置"];

    if (variant === "workspace") {
      const spaces = [
        { name: "界面研究所", meta: "12 位成员", color: "#c7b7ff" },
        { name: "动效工作台", meta: "6 位成员", color: "#c9ef6f" },
        { name: "个人沙盒", meta: "仅你可见", color: "#a9d6ff" }
      ];
      body.innerHTML = `<div class="dsh-stage">
        <aside class="dsh-side">
          <div class="dsh-brand"><i>界</i><span>界面有意思</span></div>
          <div class="dsh-ws" data-ws><button type="button" class="dsh-ws-trigger" data-ws-trigger aria-expanded="false"><span class="dsh-ws-avatar" data-ws-avatar style="background:${spaces[0].color}">界</span><span><b data-ws-name>${spaces[0].name}</b><small data-ws-meta>${spaces[0].meta}</small></span><i>⌄</i></button><div class="dsh-ws-menu" data-ws-menu>${spaces.map((space, index) => `<button type="button" data-space="${index}" aria-selected="${index === 0}"><span class="dsh-ws-dot" style="background:${space.color}"></span><span><b>${space.name}</b><small>${space.meta}</small></span><i>✓</i></button>`).join("")}</div></div>
          <nav class="dsh-nav" aria-label="主导航">${navItems.map((item, index) => `<button type="button" class="${index === 0 ? "active" : ""}"><span class="dsh-nav-icon">${["◫", "▤", "▦", "▣", "⚙"][index]}</span>${item}</button>`).join("")}</nav>
          <div class="dsh-user"><span class="dsh-user-avatar">林</span><span><b>林小满</b><small>设计负责人</small></span></div>
        </aside>
        <main class="dsh-main">
          <div class="dsh-top"><span class="mono">WORKSPACE</span><span class="dsh-top-pill">已同步</span></div>
          <div class="dsh-hero"><span class="mono" data-ws-kicker>${spaces[0].name}</span><h5 data-ws-title>今天，<br>先看全局。</h5><p>切换工作区后，导航、标题和成员信息一起更新，但页面不刷新。</p></div>
          <div class="dsh-cards">${["进行中 07", "待审核 03", "本周完成 12"].map((item) => `<div><span class="mono">${item.split(" ")[0]}</span><b>${item.split(" ")[1]}</b></div>`).join("")}</div>
        </main>
      </div>`;
      const ws = body.querySelector("[data-ws]");
      const trigger = body.querySelector("[data-ws-trigger]");
      const menu = body.querySelector("[data-ws-menu]");
      const name = body.querySelector("[data-ws-name]");
      const meta = body.querySelector("[data-ws-meta]");
      const kicker = body.querySelector("[data-ws-kicker]");
      const set = (open) => { menu.classList.toggle("open", open); trigger.setAttribute("aria-expanded", String(open)); };
      bind(bag, trigger, "click", () => set(!menu.classList.contains("open")));
      body.querySelectorAll("[data-space]").forEach((button) => bind(bag, button, "click", () => {
        const space = spaces[Number(button.dataset.space)];
        name.textContent = space.name;
        meta.textContent = space.meta;
        kicker.textContent = space.name;
        body.querySelector("[data-ws-avatar]").textContent = space.name[0];
        body.querySelector("[data-ws-avatar]").style.background = space.color;
        body.querySelectorAll("[data-space]").forEach((item) => item.setAttribute("aria-selected", String(item === button)));
        set(false);
        setStatus(ui, "已切换到工作区：" + space.name);
      }));
      bind(bag, document, "pointerdown", (event) => { if (!ws.contains(event.target)) set(false); });
      timer(bag, () => set(true), 180);
    }

    if (variant === "sort") {
      body.innerHTML = `<div class="dsh-stage">
        <aside class="dsh-side">
          <div class="dsh-brand"><i>界</i><span>界面有意思</span></div>
          <p class="dsh-side-label mono">拖动排序</p>
          <div class="dsh-sort-list" data-list>${navItems.map((item, index) => `<div class="dsh-sort-row" data-row="${index}" tabindex="0"><span class="dsh-drag">⠿</span><span class="dsh-sort-icon">${["◫", "▤", "▦", "▣", "⚙"][index]}</span><span>${item}</span><small>${["01", "02", "03", "04", "05"][index]}</small></div>`).join("")}</div>
          <p class="dsh-sort-hint">拖动或 Alt + ↑↓<br>后台会记住顺序</p>
        </aside>
        <main class="dsh-main">
          <div class="dsh-top"><span class="mono">MENU ORDER</span><span class="dsh-top-pill">可拖动</span></div>
          <div class="dsh-sort-preview"><span class="mono">CURRENT ORDER</span><ol data-order>${navItems.map((item) => `<li>${item}</li>`).join("")}</ol></div>
          <p class="dsh-main-note">菜单顺序改变后，当前页高亮保持在原项目上，而不是跟着位置走。</p>
        </main>
      </div>`;
      const list = body.querySelector("[data-list]");
      let rows = Array.from(body.querySelectorAll("[data-row]"));
      const order = body.querySelector("[data-order]");
      const paintOrder = () => {
        rows = Array.from(list.querySelectorAll("[data-row]"));
        order.innerHTML = rows.map((row) => `<li>${row.querySelector("span:nth-child(3)").textContent}</li>`).join("");
        rows.forEach((row, index) => { row.dataset.row = String(index); row.querySelector("small").textContent = String(index + 1).padStart(2, "0"); });
      };
      let drag = null;
      rows.forEach((row) => {
        bind(bag, row, "pointerdown", (event) => {
          if (event.target.closest("button")) return;
          const at = Array.from(list.querySelectorAll("[data-row]")).indexOf(row);
          drag = { row, index: at, startY: event.clientY, dy: 0, offset: at };
          row.classList.add("dragging");
          row.setPointerCapture(event.pointerId);
        });
        bind(bag, row, "pointermove", (event) => {
          if (!drag || drag.row !== row) return;
          drag.dy = event.clientY - drag.startY;
          const from = drag.index;
          const rowHeight = row.getBoundingClientRect().height + 4;
          drag.offset = clamp(from + Math.round(drag.dy / rowHeight), 0, rows.length - 1);
          row.style.transform = `translateY(${drag.dy}px)`;
          rows.forEach((item, i) => {
            if (item === row) return;
            let shift = 0;
            if (from < drag.offset && i > from && i <= drag.offset) shift = -rowHeight;
            if (from > drag.offset && i >= drag.offset && i < from) shift = rowHeight;
            item.style.transform = shift ? `translateY(${shift}px)` : "";
          });
        });
        bind(bag, row, "pointerup", () => {
          if (!drag || drag.row !== row) return;
          const target = drag.offset;
          const from = drag.index;
          row.classList.remove("dragging");
          rows.forEach((item) => { item.style.transform = ""; });
          if (target !== from) {
            const before = new Map(rows.map((item) => [item, item.getBoundingClientRect()]));
            const reordered = rows.filter((item) => item !== row);
            reordered.splice(target, 0, row);
            reordered.forEach((item) => list.append(item));
            paintOrder();
            rows.forEach((item) => {
              const old = before.get(item);
              const now = item.getBoundingClientRect();
              const dy = old.top - now.top;
              if (prefersReduced() || Math.abs(dy) < 1) return;
              item.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 300, easing: "cubic-bezier(.16,1.06,.3,1)" });
            });
            setStatus(ui, "菜单顺序已更新 · " + row.textContent.replace(/[⠿◫▤▦▣⚙]/g, "").trim());
          } else {
            row.style.transform = "";
          }
          drag = null;
        });
        bind(bag, row, "keydown", (event) => {
          if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
          event.preventDefault();
          const at = rows.indexOf(row);
          const next = at + (event.key === "ArrowDown" ? 1 : -1);
          if (next < 0 || next >= rows.length) return;
          const other = rows[next];
          if (event.key === "ArrowDown") list.insertBefore(other, row);
          else list.insertBefore(row, other);
          paintOrder();
          row.focus();
          setStatus(ui, "已用键盘移动：" + row.textContent.replace(/[⠿◫▤▦▣⚙]/g, "").trim());
        });
      });
    }

    if (variant === "search") {
      body.innerHTML = `<div class="dsh-stage">
        <aside class="dsh-side">
          <div class="dsh-brand"><i>界</i><span>界面有意思</span></div>
          <label class="dsh-search"><span>⌕</span><input type="search" placeholder="搜索菜单…" aria-label="搜索菜单" data-input></label>
          <div class="dsh-search-results" data-results>${navItems.map((item, index) => `<button type="button" data-nav="${item}"><span>${["◫", "▤", "▦", "▣", "⚙"][index]}</span>${item}<small>菜单</small></button>`).join("")}</div>
          <p class="dsh-search-empty" data-empty hidden>没有匹配的菜单</p>
          <p class="dsh-search-count" data-count>5 个菜单项</p>
        </aside>
        <main class="dsh-main">
          <div class="dsh-top"><span class="mono">COMMAND / SEARCH</span><span class="dsh-top-pill">本地过滤</span></div>
          <div class="dsh-search-hero"><span class="mono">JUMP TO</span><h5>输入两个字，<br>直接到达。</h5><p>搜索只过滤菜单本身，不改变当前选中的页面。按 Esc 清空。</p><div class="dsh-search-chip" data-chip>总览</div></div>
        </main>
      </div>`;
      const input = body.querySelector("[data-input]");
      const rows = Array.from(body.querySelectorAll("[data-nav]"));
      const empty = body.querySelector("[data-empty]");
      const count = body.querySelector("[data-count]");
      const chip = body.querySelector("[data-chip]");
      bind(bag, input, "input", () => {
        const query = input.value.trim();
        let shown = 0;
        rows.forEach((row) => { const match = row.innerText.includes(query); row.hidden = !match; if (match) shown += 1; });
        empty.hidden = shown > 0;
        count.textContent = query ? shown + " 个匹配项" : "5 个菜单项";
        setStatus(ui, query ? "搜索：" + query + " · " + shown + " 个结果" : "显示全部菜单");
      });
      bind(bag, input, "keydown", (event) => {
        if (event.key === "Escape") { input.value = ""; input.dispatchEvent(new Event("input")); input.blur(); }
      });
      rows.forEach((row) => bind(bag, row, "click", () => {
        rows.forEach((item) => item.classList.toggle("active", item === row));
        chip.textContent = row.dataset.nav;
        setStatus(ui, "已跳转到：" + row.dataset.nav);
      }));
    }

    if (variant === "breadcrumb") {
      const siblings = ["设计系统", "动效规范", "组件库", "图标集"];
      body.innerHTML = `<div class="dsh-stage">
        <main class="dsh-main dsh-full">
          <div class="dsh-top"><span class="mono">PROJECT / SETTINGS</span><span class="dsh-top-pill">自动保存</span></div>
          <div class="dsh-crumb-row" data-crumb><nav class="dsh-crumb" aria-label="面包屑"><button type="button">工作台</button><i>/</i><button type="button">项目</button><i>/</i><button type="button" class="dsh-crumb-current" data-current aria-expanded="false">设计系统 <span>⌄</span></button></nav><div class="dsh-crumb-menu" data-menu>${siblings.map((item, index) => `<button type="button" data-sibling="${item}" aria-selected="${index === 0}">${item}<i>${index === 0 ? "✓" : "↗"}</i></button>`).join("")}</div></div>
          <div class="dsh-hero"><span class="mono">CURRENT PAGE</span><h5 data-title>设计系统</h5><p>面包屑最后一级可以展开同级页面；切换同级时，前面的层级保持不变。</p></div>
          <div class="dsh-cards">${["Token 48", "组件 26", "文档 12"].map((item) => `<div><span class="mono">${item.split(" ")[0]}</span><b>${item.split(" ")[1]}</b></div>`).join("")}</div>
        </main>
      </div>`;
      const row = body.querySelector("[data-crumb]");
      const trigger = body.querySelector("[data-current]");
      const menu = body.querySelector("[data-menu]");
      const title = body.querySelector("[data-title]");
      const set = (open) => { menu.classList.toggle("open", open); trigger.setAttribute("aria-expanded", String(open)); };
      bind(bag, trigger, "click", () => set(!menu.classList.contains("open")));
      body.querySelectorAll("[data-sibling]").forEach((button) => bind(bag, button, "click", () => {
        const value = button.dataset.sibling;
        trigger.innerHTML = value + " <span>⌄</span>";
        title.textContent = value;
        body.querySelectorAll("[data-sibling]").forEach((item) => item.setAttribute("aria-selected", String(item === button)));
        set(false);
        setStatus(ui, "同级别切换为：" + value);
      }));
      bind(bag, document, "pointerdown", (event) => { if (!row.contains(event.target)) set(false); });
      timer(bag, () => set(true), 180);
    }

    if (variant === "flyout") {
      body.innerHTML = `<div class="dsh-stage">
        <aside class="dsh-side dsh-flyout-side">
          <div class="dsh-brand"><i>界</i><span>界面有意思</span></div>
          <nav class="dsh-nav" aria-label="带二级面板的导航">${["总览", "设计", "开发", "资源", "设置"].map((item, index) => index === 1 ? `<div class="dsh-flyout-wrap" data-wrap><button type="button" class="dsh-flyout-trigger" data-trigger aria-expanded="false"><span class="dsh-nav-icon">◫</span>${item}<i>›</i></button><div class="dsh-flyout" data-flyout><p class="dsh-side-label mono">设计</p><button type="button" data-sub="设计系统">设计系统 <small>12</small></button><button type="button" data-sub="动效规范">动效规范 <small>08</small></button><button type="button" data-sub="组件库">组件库 <small>26</small></button></div></div>` : `<button type="button" class="${index === 0 ? "active" : ""}"><span class="dsh-nav-icon">${["◫", "", "▤", "▣", "⚙"][index]}</span>${item}</button>`).join("")}</nav>
          <p class="dsh-sort-hint">悬停或聚焦「设计」<br>打开右侧面板</p>
        </aside>
        <main class="dsh-main">
          <div class="dsh-top"><span class="mono">HOVER FLYOUT</span><span class="dsh-top-pill">悬停展开</span></div>
          <div class="dsh-hero"><span class="mono">DESIGN</span><h5 data-title>设计</h5><p data-copy>二级面板在导航右侧滑出，离开后自动收回，不遮挡主内容。</p></div>
        </main>
      </div>`;
      const wrap = body.querySelector("[data-wrap]");
      const trigger = body.querySelector("[data-trigger]");
      const flyout = body.querySelector("[data-flyout]");
      const title = body.querySelector("[data-title]");
      const copy = body.querySelector("[data-copy]");
      const set = (open) => { flyout.classList.toggle("open", open); trigger.setAttribute("aria-expanded", String(open)); };
      bind(bag, wrap, "pointerenter", () => set(true));
      bind(bag, wrap, "pointerleave", () => set(false));
      bind(bag, trigger, "focus", () => set(true));
      bind(bag, trigger, "click", () => set(!flyout.classList.contains("open")));
      body.querySelectorAll("[data-sub]").forEach((button) => bind(bag, button, "click", () => {
        title.textContent = button.dataset.sub;
        copy.textContent = "已打开「" + button.dataset.sub + "」，二级面板仍然从同一方向出现。";
        setStatus(ui, "二级导航：" + button.dataset.sub);
      }));
      timer(bag, () => set(true), 160);
    }

    if (variant === "arc") {
      const actions = [
        { label: "新建", icon: "＋", angle: 180 },
        { label: "搜索", icon: "⌕", angle: 210 },
        { label: "分享", icon: "↗", angle: 240 },
        { label: "设置", icon: "⚙", angle: 270 }
      ];
      body.innerHTML = `<div class="dsh-stage dsh-arc-stage">
        <div class="dsh-arc-main"><div class="dsh-top"><span class="mono">QUICK MENU / ARC</span><span class="dsh-top-pill">一个按钮</span></div><div class="dsh-hero"><span class="mono">RADIAL</span><h5>从一个点，<br>展开四个方向。</h5><p>弧形菜单围绕主按钮展开，选项之间的角度保持相等。</p></div><div class="dsh-arc-cards"><span>项目 24</span><span>本周 06</span><span>待办 12</span></div></div>
        <div class="dsh-arc" data-arc>${actions.map((action) => `<button type="button" class="dsh-arc-item" data-arc-item="${action.label}" style="--a:${action.angle}deg"><span>${action.icon}</span><small>${action.label}</small></button>`).join("")}<button type="button" class="dsh-fab" data-fab aria-expanded="false" aria-label="打开快捷菜单"><i>＋</i></button></div>
      </div>`;
      const arc = body.querySelector("[data-arc]");
      const fab = body.querySelector("[data-fab]");
      const set = (open) => {
        arc.classList.toggle("open", open);
        fab.setAttribute("aria-expanded", String(open));
        fab.querySelector("i").textContent = open ? "×" : "＋";
        setStatus(ui, open ? "弧形菜单已展开" : "快捷菜单已收起");
      };
      bind(bag, fab, "click", () => set(!arc.classList.contains("open")));
      body.querySelectorAll("[data-arc-item]").forEach((button) => bind(bag, button, "click", () => {
        setStatus(ui, "快捷动作：" + button.dataset.arcItem);
        set(false);
      }));
      bind(bag, document, "pointerdown", (event) => { if (!arc.contains(event.target)) set(false); });
      timer(bag, () => set(true), 180);
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     18. DASHBOARD MINI
     ============================================================ */
  S.dashboardMini = function (root, variant) {
    const bag = [];
    const titles = {
      console: "快捷控制台", energy: "能量面板", schedule: "日程轨道",
      files: "文件收纳盒", habit: "习惯打卡盘", focus: "专注仪表"
    };
    const notes = {
      console: "少量控件<br>快速调整", energy: "剩余多少<br>一眼看到",
      schedule: "时间在轨道上<br>不在列表里", files: "收纳有层级<br>查找有线索",
      habit: "连续记录<br>不靠意志", focus: "一个计时器<br>只做一件事"
    };
    const ui = shell(root, {
      kicker: "WEB / DASHBOARD MINI",
      title: titles[variant] || "小面板",
      note: notes[variant] || "小面板<br>只做一件事",
      status: ""
    });
    const body = ui.body;

    if (variant === "console") {
      body.innerHTML = `<div class="dmi-stage"><article class="dmi-card dmi-console">
        <div class="dmi-card-head"><div><span class="mono">ROOM / 01</span><h5>快捷控制台</h5></div><span class="dmi-badge">已连接</span></div>
        <div class="dmi-console-row"><span>灯光</span><input type="range" min="0" max="100" value="72" data-range="light" aria-label="灯光亮度"><b data-out="light">72%</b></div>
        <div class="dmi-console-row"><span>音量</span><input type="range" min="0" max="100" value="40" data-range="volume" aria-label="音量"><b data-out="volume">40%</b></div>
        <div class="dmi-console-row"><span>温度</span><div class="dmi-stepper"><button type="button" data-temp="-1" aria-label="降低温度">−</button><b data-temp-out>24°</b><button type="button" data-temp="1" aria-label="升高温度">＋</button></div></div>
        <button type="button" class="dmi-wide-toggle" data-dnd aria-pressed="false"><span><b>勿扰模式</b><small>关闭通知与提示音</small></span><i></i></button>
      </article></div>`;
      body.querySelectorAll("[data-range]").forEach((input) => bind(bag, input, "input", () => {
        const key = input.dataset.range;
        body.querySelector(`[data-out="${key}"]`).textContent = input.value + "%";
        setStatus(ui, (key === "light" ? "灯光" : "音量") + " " + input.value + "%");
      }));
      let temp = 24;
      body.querySelectorAll("[data-temp]").forEach((button) => bind(bag, button, "click", () => {
        temp = clamp(temp + Number(button.dataset.temp), 16, 30);
        body.querySelector("[data-temp-out]").textContent = temp + "°";
        setStatus(ui, "温度设定 " + temp + "°");
      }));
      const dnd = body.querySelector("[data-dnd]");
      bind(bag, dnd, "click", () => {
        const on = dnd.getAttribute("aria-pressed") !== "true";
        dnd.setAttribute("aria-pressed", String(on));
        setStatus(ui, on ? "勿扰模式已开启" : "勿扰模式已关闭");
      });
    }

    if (variant === "energy") {
      body.innerHTML = `<div class="dmi-stage"><article class="dmi-card dmi-energy">
        <div class="dmi-card-head"><div><span class="mono">TODAY / ENERGY</span><h5>能量面板</h5></div><span class="dmi-badge" data-energy-label>68 / 100</span></div>
        <div class="dmi-energy-main"><div class="dmi-energy-dial"><b data-energy>68</b><span class="mono">剩余</span></div><div class="dmi-energy-bars">${[["工作", 42], ["休息", 26], ["运动", 18]].map(([label, value]) => `<div><span>${label}</span><div><i style="--v:${value}%"></i></div><b>${value}%</b></div>`).join("")}</div></div>
        <div class="dmi-energy-foot"><p>每完成一次休息，能量会补回来一点。</p><button type="button" class="dmi-primary" data-charge>出去走走 +5</button></div>
      </article></div>`;
      const energy = body.querySelector("[data-energy]");
      const label = body.querySelector("[data-energy-label]");
      let value = 68;
      bind(bag, body.querySelector("[data-charge]"), "click", () => {
        value = Math.min(100, value + 5);
        energy.textContent = value;
        label.textContent = value + " / 100";
        energy.animate?.([{ transform: "scale(.82)" }, { transform: "none" }], { duration: 350, easing: "cubic-bezier(.16,1.3,.3,1)" });
        body.querySelector(".dmi-energy-dial").classList.toggle("full", value >= 100);
        setStatus(ui, "能量恢复到 " + value + " / 100");
      });
    }

    if (variant === "schedule") {
      const events = [
        { time: "09:20", title: "咖啡", meta: "15 min", top: 8 },
        { time: "11:40", title: "把邮件发出去", meta: "45 min", top: 78 },
        { time: "14:05", title: "长桌会议", meta: "60 min", top: 158 },
        { time: "16:30", title: "窗边", meta: "30 min", top: 238 }
      ];
      body.innerHTML = `<div class="dmi-stage"><article class="dmi-card dmi-schedule">
        <div class="dmi-card-head"><div><span class="mono">THU / OCT 29</span><h5>日程轨道</h5></div><span class="dmi-badge">4 个事件</span></div>
        <div class="dmi-schedule-grid"><div class="dmi-track">${[9, 11, 13, 15, 17].map((hour) => `<span class="dmi-hour" style="top:${(hour - 9) * 48}px">${hour}:00</span>`).join("")}<i class="dmi-now" style="top:132px"></i>${events.map((event, index) => `<button type="button" class="dmi-event" data-event="${index}" style="top:${event.top}px"><b>${event.time}</b><span>${event.title}</span><small>${event.meta}</small></button>`).join("")}</div><aside class="dmi-event-detail" data-detail><span class="mono">SELECT AN EVENT</span><h6>今天，<br>排得下。</h6><p>点左侧任意事件，右侧显示它的时间与备注。</p></aside></div>
      </article></div>`;
      const detail = body.querySelector("[data-detail]");
      body.querySelectorAll("[data-event]").forEach((button) => bind(bag, button, "click", () => {
        const event = events[Number(button.dataset.event)];
        body.querySelectorAll("[data-event]").forEach((item) => item.classList.toggle("active", item === button));
        detail.innerHTML = `<span class="mono">${event.time} / ${event.meta}</span><h6>${event.title}</h6><p>事件在轨道上的高度对应时长，开始时间决定位置。点其他事件可以切换。</p>`;
        setStatus(ui, "当前事件：" + event.title);
      }));
    }

    if (variant === "files") {
      const files = [
        { name: "品牌规范.pdf", type: "文档", color: "#c7b7ff" },
        { name: "首页草稿.fig", type: "设计", color: "#c9ef6f" },
        { name: "海边.jpg", type: "图片", color: "#a9d6ff" },
        { name: "会议记录.md", type: "文档", color: "#ff9d78" },
        { name: "图标集.svg", type: "设计", color: "#c7b7ff" },
        { name: "窗边.png", type: "图片", color: "#a9d6ff" }
      ];
      body.innerHTML = `<div class="dmi-stage"><article class="dmi-card dmi-files">
        <div class="dmi-card-head"><div><span class="mono">FILES / 06</span><h5>文件收纳盒</h5></div><span class="dmi-badge">1.8 GB / 5 GB</span></div>
        <div class="dmi-file-tabs">${["全部", "文档", "设计", "图片"].map((tab, index) => `<button type="button" data-file-tab="${tab}" aria-pressed="${index === 0}">${tab}</button>`).join("")}</div>
        <div class="dmi-file-grid" data-file-grid>${files.map((file, index) => `<button type="button" class="dmi-file" data-file="${index}" data-type="${file.type}"><span class="dmi-file-icon" style="background:${file.color}">${file.type[0]}</span><b>${file.name}</b><small>${file.type} · 2 天前</small></button>`).join("")}</div>
        <div class="dmi-storage"><div><i></i></div><span>存储空间 36%</span></div>
      </article></div>`;
      const tabs = Array.from(body.querySelectorAll("[data-file-tab]"));
      const cards = Array.from(body.querySelectorAll("[data-file]"));
      tabs.forEach((tab) => bind(bag, tab, "click", () => {
        tabs.forEach((item) => item.setAttribute("aria-pressed", String(item === tab)));
        const type = tab.dataset.fileTab;
        cards.forEach((card) => { card.hidden = type !== "全部" && card.dataset.type !== type; });
        setStatus(ui, "文件筛选：" + type);
      }));
      cards.forEach((card) => bind(bag, card, "click", () => {
        cards.forEach((item) => item.classList.toggle("active", item === card));
        setStatus(ui, "已选中：" + card.querySelector("b").textContent);
      }));
    }

    if (variant === "habit") {
      const habits = ["早起", "阅读", "运动", "不熬夜"];
      const days = ["一", "二", "三", "四", "五", "六", "日"];
      const done = new Set(["0-0", "0-1", "0-2", "1-0", "1-1", "1-3", "2-1", "2-4", "3-0", "3-2"]);
      body.innerHTML = `<div class="dmi-stage"><article class="dmi-card dmi-habit">
        <div class="dmi-card-head"><div><span class="mono">WEEK / 44</span><h5>习惯打卡盘</h5></div><span class="dmi-badge" data-streak>连续 6 天</span></div>
        <div class="dmi-habit-grid"><span></span>${days.map((day) => `<span class="dmi-day">${day}</span>`).join("")}${habits.map((habit, hi) => `<span class="dmi-habit-name">${habit}</span>${days.map((day, di) => `<button type="button" class="dmi-habit-cell ${done.has(hi + "-" + di) ? "on" : ""}" data-habit="${hi}-${di}" aria-label="${habit} ${day}" aria-pressed="${done.has(hi + "-" + di)}"></button>`).join("")}`).join("")}</div>
        <div class="dmi-habit-foot"><div><b data-done>10</b><span> / 28 次完成</span></div><p>点格子切换。连续记录比一次做满更重要。</p></div>
      </article></div>`;
      const doneLabel = body.querySelector("[data-done]");
      const cells = Array.from(body.querySelectorAll("[data-habit]"));
      const update = () => {
        doneLabel.textContent = done.size;
        setStatus(ui, "本周完成 " + done.size + " / 28");
      };
      cells.forEach((cell) => bind(bag, cell, "click", () => {
        const key = cell.dataset.habit;
        if (done.has(key)) { done.delete(key); cell.classList.remove("on"); cell.setAttribute("aria-pressed", "false"); }
        else { done.add(key); cell.classList.add("on"); cell.setAttribute("aria-pressed", "true"); }
        update();
      }));
      update();
    }

    if (variant === "focus") {
      body.innerHTML = `<div class="dmi-stage"><article class="dmi-card dmi-focus">
        <div class="dmi-card-head"><div><span class="mono">FOCUS / 01</span><h5>专注仪表</h5></div><span class="dmi-badge" data-state>准备开始</span></div>
        <div class="dmi-focus-main"><div class="dmi-focus-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="82" class="track"/><circle cx="100" cy="100" r="82" class="value" data-ring/></svg><div><b data-clock>25:00</b><span class="mono">MINUTES</span></div></div><div class="dmi-focus-side"><p>一次只做一件事。计时结束后，休息五分钟。</p><div class="dmi-focus-presets">${[25, 45, 60].map((min) => `<button type="button" data-min="${min}" aria-pressed="${min === 25}">${min} 分钟</button>`).join("")}</div><button type="button" class="dmi-primary" data-start>开始专注</button></div></div>
      </article></div>`;
      const clock = body.querySelector("[data-clock]");
      const ring = body.querySelector("[data-ring]");
      const state = body.querySelector("[data-state]");
      const start = body.querySelector("[data-start]");
      const circumference = 2 * Math.PI * 82;
      ring.style.strokeDasharray = String(circumference);
      let minutes = 25;
      let remaining = 25 * 60;
      let interval = 0;
      let running = false;
      const paint = () => {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        clock.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
        ring.style.strokeDashoffset = String(circumference * (1 - remaining / (minutes * 60)));
      };
      const stop = () => {
        running = false;
        clearInterval(interval);
        start.textContent = "开始专注";
        state.textContent = "已暂停";
      };
      bind(bag, start, "click", () => {
        if (running) { stop(); setStatus(ui, "计时已暂停"); return; }
        if (remaining <= 0) remaining = minutes * 60;
        running = true;
        start.textContent = "暂停";
        state.textContent = "专注中";
        interval = setInterval(() => {
          remaining = Math.max(0, remaining - 1);
          paint();
          if (remaining === 0) {
            stop();
            state.textContent = "已完成";
            start.textContent = "再来一次";
            setStatus(ui, "专注完成 · 休息五分钟");
          }
        }, 1000);
        bag.push(() => clearInterval(interval));
        setStatus(ui, "开始 " + minutes + " 分钟专注");
      });
      body.querySelectorAll("[data-min]").forEach((button) => bind(bag, button, "click", () => {
        minutes = Number(button.dataset.min);
        remaining = minutes * 60;
        body.querySelectorAll("[data-min]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        paint();
        setStatus(ui, "计时长度：" + minutes + " 分钟");
      }));
      paint();
    }

    return () => bag.forEach((fn) => fn());
  };

  /* ============================================================
     19. DASHBOARD LAYOUT
     ============================================================ */
  S.dashboardLayout = function (root, variant) {
    const bag = [];
    const titles = {
      map: "地图主导布局", goal: "目标导向布局", content: "内容主视觉布局",
      trend: "趋势主导布局", three: "三栏信息布局", split: "数据日程分栏"
    };
    const notes = {
      map: "地图先说话<br>列表跟随", goal: "目标在前<br>数据在后",
      content: "先给画面<br>再给信息", trend: "趋势占主位<br>数字做注脚",
      three: "三列并排<br>各有任务", split: "数据和日程<br>各占一半"
    };
    const ui = shell(root, {
      kicker: "WEB / DASHBOARD LAYOUT",
      title: titles[variant] || "布局方案",
      note: notes[variant] || "布局<br>决定先后",
      status: ""
    });
    const body = ui.body;

    if (variant === "map") {
      const places = [
        { name: "界面研究所", area: "静安", x: 32, y: 38, count: 12 },
        { name: "动效工作台", area: "徐汇", x: 58, y: 62, count: 6 },
        { name: "个人沙盒", area: "黄浦", x: 73, y: 32, count: 3 }
      ];
      body.innerHTML = `<div class="dl-stage dl-map-stage">
        <div class="dl-map"><span class="dl-map-label mono">WORKSPACE MAP</span>${places.map((place, index) => `<button type="button" class="dl-pin" style="left:${place.x}%;top:${place.y}%" data-pin="${index}" aria-label="${place.name}"><i></i><span>${place.count}</span></button>`).join("")}<div class="dl-map-rings" aria-hidden="true"><i></i><i></i><i></i></div></div>
        <aside class="dl-map-side"><span class="mono">PLACES / 03</span><h5>地图先说话，<br>列表再补充。</h5><div class="dl-place-list">${places.map((place, index) => `<button type="button" data-place="${index}" class="${index === 0 ? "active" : ""}"><span><b>${place.name}</b><small>${place.area} · ${place.count} 个项目</small></span><i>→</i></button>`).join("")}</div></aside>
      </div>`;
      const set = (index) => {
        body.querySelectorAll("[data-place]").forEach((item, i) => item.classList.toggle("active", i === index));
        body.querySelectorAll("[data-pin]").forEach((item, i) => item.classList.toggle("active", i === index));
        setStatus(ui, "聚焦：" + places[index].name + " · " + places[index].area);
      };
      body.querySelectorAll("[data-place]").forEach((item, index) => bind(bag, item, "click", () => set(index)));
      body.querySelectorAll("[data-pin]").forEach((item, index) => bind(bag, item, "click", () => set(index)));
    }

    if (variant === "goal") {
      const steps = ["收集素材", "确定方向", "完成首版", "验收上线"];
      body.innerHTML = `<div class="dl-stage dl-goal-stage">
        <div class="dl-goal-head"><div><span class="mono">GOAL / Q4</span><h5>目标导向布局</h5></div><span class="dl-pill">3 / 4 完成</span></div>
        <div class="dl-goal-main"><div class="dl-goal-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="82" class="track"/><circle cx="100" cy="100" r="82" class="value" data-goal-ring/></svg><div><b data-goal-value>75%</b><span class="mono">完成度</span></div></div><div class="dl-milestones">${steps.map((step, index) => `<button type="button" data-step="${index}" class="${index < 3 ? "done" : ""}" aria-pressed="${index < 3}"><i>${index < 3 ? "✓" : index + 1}</i><span>${step}</span><small>${index < 3 ? "已完成" : "待完成"}</small></button>`).join("")}</div></div>
        <p class="dl-goal-note">目标在前，数字只做注脚。点里程碑切换完成状态。</p>
      </div>`;
      const ring = body.querySelector("[data-goal-ring]");
      const value = body.querySelector("[data-goal-value]");
      const circumference = 2 * Math.PI * 82;
      ring.style.strokeDasharray = String(circumference);
      const update = () => {
        const done = body.querySelectorAll("[data-step].done").length;
        const pct = Math.round(done / steps.length * 100);
        ring.style.strokeDashoffset = String(circumference * (1 - pct / 100));
        value.textContent = pct + "%";
        body.querySelector(".dl-pill").textContent = done + " / 4 完成";
        setStatus(ui, "目标完成度 " + pct + "%");
      };
      body.querySelectorAll("[data-step]").forEach((button) => bind(bag, button, "click", () => {
        const done = button.classList.toggle("done");
        button.setAttribute("aria-pressed", String(done));
        button.querySelector("i").textContent = done ? "✓" : Number(button.dataset.step) + 1;
        button.querySelector("small").textContent = done ? "已完成" : "待完成";
        update();
      }));
      update();
    }

    if (variant === "content") {
      const items = [
        { title: "把光留在墙上", meta: "FIELD NOTES / 01", cls: "a" },
        { title: "慢半拍", meta: "ESSAY / 02", cls: "b" },
        { title: "没有声音的房间", meta: "PHOTO / 03", cls: "c" }
      ];
      body.innerHTML = `<div class="dl-stage dl-content-stage">
        <article class="dl-feature" data-feature><span class="mono" data-meta>${items[0].meta}</span><div data-art class="dl-feature-art a"></div><h5 data-feature-title>把光<br>留在墙上</h5><p>先给画面，再给信息。内容主视觉布局让第一屏只回答「这是什么」。</p></article>
        <div class="dl-content-side"><span class="mono">MORE STORIES</span>${items.map((item, index) => `<button type="button" data-story="${index}" class="${index === 0 ? "active" : ""}"><span class="dl-story-art ${item.cls}"></span><span><b>${item.title}</b><small>${item.meta}</small></span></button>`).join("")}</div>
      </div>`;
      const art = body.querySelector("[data-art]");
      const title = body.querySelector("[data-feature-title]");
      const meta = body.querySelector("[data-meta]");
      body.querySelectorAll("[data-story]").forEach((button) => bind(bag, button, "click", () => {
        const item = items[Number(button.dataset.story)];
        body.querySelectorAll("[data-story]").forEach((el) => el.classList.toggle("active", el === button));
        art.className = "dl-feature-art " + item.cls;
        title.innerHTML = item.title.replace("，", "，<br>");
        meta.textContent = item.meta;
        setStatus(ui, "主视觉切换为：" + item.title);
      }));
    }

    if (variant === "trend") {
      body.innerHTML = `<div class="dl-stage dl-trend-stage">
        <div class="dl-trend-head"><div><span class="mono">TRAFFIC / 30 DAYS</span><h5>趋势主导布局</h5></div><div class="dl-range">${[7, 30, 90].map((d) => `<button type="button" data-range="${d}" aria-pressed="${d === 30}">${d} 天</button>`).join("")}</div></div>
        <div class="dl-kpis">${[["访问", "48.2k", "+12%"], ["停留", "3m 18s", "+8%"], ["转化", "4.6%", "-0.3%"]].map(([label, value, delta]) => `<div><span class="mono">${label}</span><b>${value}</b><em class="${delta.startsWith("-") ? "down" : ""}">${delta}</em></div>`).join("")}</div>
        <div class="dl-chart" data-chart>${Array.from({ length: 30 }, (_, i) => `<i style="--h:${18 + Math.round(Math.sin(i * .55) * 20 + Math.cos(i * .21) * 18 + 30)}%"></i>`).join("")}</div>
        <div class="dl-trend-foot"><span class="mono">MAR 30 – APR 29</span><span class="mono" data-range-label>最近 30 天</span></div>
      </div>`;
      const chart = body.querySelector("[data-chart]");
      const label = body.querySelector("[data-range-label]");
      body.querySelectorAll("[data-range]").forEach((button) => bind(bag, button, "click", () => {
        body.querySelectorAll("[data-range]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        const days = Number(button.dataset.range);
        const count = days === 7 ? 7 : days === 30 ? 30 : 45;
        chart.innerHTML = Array.from({ length: count }, (_, i) => `<i style="--h:${18 + Math.round(Math.sin(i * .55) * 20 + Math.cos(i * .21) * 18 + 30)}%"></i>`).join("");
        label.textContent = "最近 " + days + " 天";
        setStatus(ui, "趋势范围：" + days + " 天");
      }));
    }

    if (variant === "three") {
      const columns = [
        { label: "收件箱", count: 6, items: ["一封没写完的信", "周五的提案", "合作方回复"] },
        { label: "进行中", count: 3, items: ["首页动效", "卡片删除", "筛选器"] },
        { label: "笔记", count: 8, items: ["留白不是空", "滚动是时间线", "按钮要先像按钮"] }
      ];
      body.innerHTML = `<div class="dl-stage dl-three-stage">${columns.map((col, ci) => `<section class="dl-column"><div class="dl-column-head"><span class="mono">${col.label}</span><b>${col.count}</b></div>${col.items.map((item, ii) => `<button type="button" data-card="${ci}-${ii}"><span class="mono">0${ii + 1}</span><p>${item}</p><i>→</i></button>`).join("")}<div class="dl-column-add">＋ 新建</div></section>`).join("")}</div>`;
      body.querySelectorAll("[data-card]").forEach((button) => bind(bag, button, "click", () => {
        body.querySelectorAll("[data-card]").forEach((item) => item.classList.toggle("active", item === button));
        setStatus(ui, "已选中卡片：" + button.querySelector("p").textContent);
      }));
    }

    if (variant === "split") {
      const rows = [
        { time: "09:20", name: "咖啡", state: "记录" },
        { time: "11:40", name: "邮件", state: "完成" },
        { time: "14:05", name: "长桌", state: "进行中" },
        { time: "16:30", name: "窗边", state: "记录" }
      ];
      body.innerHTML = `<div class="dl-stage dl-split-stage">
        <section class="dl-table"><div class="dl-column-head"><span class="mono">TODAY / DATA</span><b>4</b></div><div class="dl-table-head"><span>时间</span><span>事项</span><span>状态</span></div>${rows.map((row, index) => `<button type="button" data-row="${index}" class="${index === 2 ? "active" : ""}"><span class="mono">${row.time}</span><b>${row.name}</b><em>${row.state}</em></button>`).join("")}</section>
        <aside class="dl-cal"><div class="dl-cal-head"><span class="mono">OCTOBER</span><b>29</b></div><div class="dl-cal-grid">${["一", "二", "三", "四", "五", "六", "日"].map((d) => `<span class="dl-cal-day">${d}</span>`).join("")}${Array.from({ length: 7 }, (_, i) => `<span class="dl-cal-day ${i === 3 ? "on" : ""}">${26 + i}</span>`).join("")}</div><p data-note>选中左侧任意一行，右侧日期同步高亮。</p></aside>
      </div>`;
      const note = body.querySelector("[data-note]");
      body.querySelectorAll("[data-row]").forEach((button) => bind(bag, button, "click", () => {
        body.querySelectorAll("[data-row]").forEach((item) => item.classList.toggle("active", item === button));
        const row = rows[Number(button.dataset.row)];
        note.textContent = "10 月 29 日 · " + row.time + " " + row.name + "（" + row.state + "）";
        setStatus(ui, note.textContent);
      }));
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     20. CHART LAB
     ============================================================ */
  S.chartLab = function (root, variant) {
    const bag = [];
    const titles = {
      bars: "弹性排序柱", segmented: "分段选择器联动图表", donut: "轨道分配环",
      heat: "活动热力矩阵", curve: "流量曲线与探针", share: "流量占比条", gauge: "双针目标仪表"
    };
    const notes = {
      bars: "排序时<br>柱子自己走", segmented: "换区间<br>数据跟着换",
      donut: "每一段<br>都能点", heat: "密度不同<br>颜色不同",
      curve: "探针跟着<br>指针走", share: "占比清楚<br>来源可点",
      gauge: "目标与现状<br>两根针"
    };
    const ui = shell(root, {
      kicker: "WEB / CHART",
      title: titles[variant] || "图表实验室",
      note: notes[variant] || "图表<br>先回答问题",
      status: ""
    });
    const body = ui.body;
    const shellCard = (inner) => `<div class="ch-stage"><article class="ch-card">${inner}</article></div>`;

    if (variant === "bars") {
      const data = [
        { label: "A", value: 38 }, { label: "B", value: 72 }, { label: "C", value: 51 },
        { label: "D", value: 88 }, { label: "E", value: 64 }, { label: "F", value: 29 }, { label: "G", value: 76 }
      ];
      body.innerHTML = shellCard(`<div class="ch-head"><div><span class="mono">SORT / ELASTIC</span><h5>弹性排序柱</h5></div><button type="button" class="ch-action" data-sort>按数值 ↑</button></div><div class="ch-bars" data-bars>${data.map((item) => `<button type="button" class="ch-bar" data-bar="${item.label}" style="--v:${item.value}%"><span>${item.value}</span><i></i><b>${item.label}</b></button>`).join("")}</div><p class="ch-note" data-note>点「按数值」让柱子重新排队，高度与顺序一起过渡。</p>`);
      const bars = body.querySelector("[data-bars]");
      let ascending = true;
      bind(bag, body.querySelector("[data-sort]"), "click", () => {
        const items = Array.from(bars.querySelectorAll(".ch-bar"));
        const sorted = items.slice().sort((a, b) => {
          const av = Number(a.querySelector("span").textContent);
          const bv = Number(b.querySelector("span").textContent);
          return ascending ? av - bv : bv - av;
        });
        sorted.forEach((item) => bars.append(item));
        body.querySelector("[data-sort]").textContent = ascending ? "按数值 ↓" : "按数值 ↑";
        body.querySelector("[data-note]").textContent = ascending ? "从小到大；再点一次反向。" : "从大到小；再点一次回到升序。";
        ascending = !ascending;
        setStatus(ui, "已按数值重新排序");
      });
      bars.querySelectorAll("[data-bar]").forEach((bar) => bind(bag, bar, "click", () => {
        bars.querySelectorAll("[data-bar]").forEach((item) => item.classList.toggle("active", item === bar));
        setStatus(ui, bar.dataset.bar + " = " + bar.querySelector("span").textContent);
      }));
    }

    if (variant === "segmented") {
      const sets = {
        "周": [42, 58, 36, 74, 62, 88, 51],
        "月": [62, 48, 71, 55, 83, 66, 91, 57, 74, 68, 46, 80],
        "年": [38, 52, 66, 49, 72, 84, 63, 91, 77, 58, 69, 88]
      };
      body.innerHTML = shellCard(`<div class="ch-head"><div><span class="mono">RANGE / LINKED</span><h5>分段联动图表</h5></div><div class="ch-seg" role="tablist" aria-label="时间范围">${Object.keys(sets).map((key, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-seg="${key}">${key}</button>`).join("")}<i data-thumb></i></div></div><div class="ch-total"><b data-total>${sets["周"].reduce((a, b) => a + b, 0)}</b><span class="mono">TOTAL / 周</span></div><div class="ch-columns" data-columns>${sets["周"].map((value) => `<i style="--v:${value}%"></i>`).join("")}</div><div class="ch-axis"><span>周一</span><span>周三</span><span>周五</span><span>周日</span></div><p class="ch-note">切换区间后，柱子数量、高度与总量一起更新。</p>`);
      const buttons = Array.from(body.querySelectorAll("[data-seg]"));
      const columns = body.querySelector("[data-columns]");
      const total = body.querySelector("[data-total]");
      const note = body.querySelector(".ch-total .mono");
      const thumb = body.querySelector("[data-thumb]");
      const move = (index) => {
        const button = buttons[index];
        thumb.style.width = button.offsetWidth + "px";
        thumb.style.transform = `translateX(${button.offsetLeft}px)`;
      };
      buttons.forEach((button) => bind(bag, button, "click", () => {
        const key = button.dataset.seg;
        buttons.forEach((item) => item.setAttribute("aria-selected", String(item === button)));
        columns.innerHTML = sets[key].map((value) => `<i style="--v:${value}%"></i>`).join("");
        total.textContent = sets[key].reduce((a, b) => a + b, 0);
        note.textContent = "TOTAL / " + key;
        move(buttons.indexOf(button));
        setStatus(ui, "区间切换为：" + key);
      }));
      move(0);
    }

    if (variant === "donut") {
      const slices = [
        { label: "动效", value: 38, color: "#1a1b16" },
        { label: "卡片", value: 26, color: "#7c63d2" },
        { label: "手势", value: 20, color: "#c9ef6f" },
        { label: "其他", value: 16, color: "#d65a35" }
      ];
      const C = 2 * Math.PI * 64;
      let offset = 0;
      body.innerHTML = shellCard(`<div class="ch-head"><div><span class="mono">ALLOCATION / 100</span><h5>轨道分配环</h5></div><span class="ch-badge">4 个分类</span></div><div class="ch-donut-wrap"><div class="ch-donut"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="64" class="ch-donut-track"/>${slices.map((slice, index) => { const length = slice.value / 100 * C - 4; const dash = `${length} ${C - length}`; const off = -offset / 100 * C; offset += slice.value; return `<circle cx="90" cy="90" r="64" class="ch-donut-slice" data-slice="${index}" stroke="${slice.color}" stroke-dasharray="${dash}" stroke-dashoffset="${off}"/>`; }).join("")}</svg><div class="ch-donut-center"><b data-center>100</b><span class="mono">TOTAL</span></div></div><div class="ch-legend">${slices.map((slice, index) => `<button type="button" data-legend="${index}" aria-pressed="true"><i style="background:${slice.color}"></i><span>${slice.label}</span><b>${slice.value}%</b></button>`).join("")}</div></div><p class="ch-note">每一段都是独立轨道；点图例可以暂时移出该段。</p>`);
      const center = body.querySelector("[data-center]");
      const legend = Array.from(body.querySelectorAll("[data-legend]"));
      legend.forEach((button) => bind(bag, button, "click", () => {
        const index = Number(button.dataset.legend);
        const on = button.getAttribute("aria-pressed") !== "true";
        button.setAttribute("aria-pressed", String(on));
        const slice = body.querySelector(`[data-slice="${index}"]`);
        slice.style.opacity = on ? "1" : ".14";
        center.textContent = on ? slices[index].value : "—";
        center.nextElementSibling.textContent = on ? slices[index].label : "TOTAL";
        setStatus(ui, (on ? "显示：" : "隐藏：") + slices[index].label);
      }));
    }

    if (variant === "heat") {
      const weeks = 14;
      const cells = [];
      let seed = 7;
      for (let d = 0; d < 7; d += 1) {
        for (let w = 0; w < weeks; w += 1) {
          seed = (seed * 9301 + 49297) % 233280;
          const value = Math.round(seed / 233280 * 4);
          cells.push({ d, w, value });
        }
      }
      body.innerHTML = shellCard(`<div class="ch-head"><div><span class="mono">ACTIVITY / 14 WEEKS</span><h5>活动热力矩阵</h5></div><span class="ch-badge" data-heat-label>点一个格子</span></div><div class="ch-heat-wrap"><div class="ch-heat-days">${["一", "", "三", "", "五", "", "日"].map((d) => `<span>${d}</span>`).join("")}</div><div class="ch-heat" data-heat>${cells.map((cell) => `<button type="button" class="ch-heat-cell" data-value="${cell.value}" data-day="${cell.d}" data-week="${cell.w}" aria-label="第 ${cell.w + 1} 周，${["一", "二", "三", "四", "五", "六", "日"][cell.d]}，${cell.value} 次"></button>`).join("")}</div></div><div class="ch-heat-foot"><span class="mono">少</span>${[0, 1, 2, 3, 4].map((v) => `<i class="ch-heat-cell v${v}"></i>`).join("")}<span class="mono">多</span><p data-heat-note>颜色越深，当天记录越多。</p></div>`);
      const label = body.querySelector("[data-heat-label]");
      const note = body.querySelector("[data-heat-note]");
      const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
      body.querySelectorAll("[data-heat] .ch-heat-cell").forEach((cell) => {
        cell.classList.add("v" + cell.dataset.value);
        bind(bag, cell, "click", () => {
          label.textContent = ["0 次", "1 次", "2 次", "3 次", "4 次"][cell.dataset.value];
          note.textContent = "第 " + (Number(cell.dataset.week) + 1) + " 周 · " + days[Number(cell.dataset.day)] + " · " + cell.dataset.value + " 次记录";
          body.querySelectorAll("[data-heat] .ch-heat-cell").forEach((item) => item.classList.toggle("active", item === cell));
          setStatus(ui, note.textContent);
        });
      });
    }

    if (variant === "curve") {
      const values = [18, 24, 21, 38, 33, 51, 46, 62, 58, 72, 66, 84, 78, 61, 55, 68, 74, 63, 71, 59, 52, 46, 41, 35];
      const width = 560;
      const height = 210;
      const max = 90;
      const points = values.map((value, index) => [index / (values.length - 1) * width, height - value / max * height]);
      const path = points.reduce((acc, point, index) => {
        if (index === 0) return "M" + point[0] + "," + point[1];
        const prev = points[index - 1];
        const mid = (prev[0] + point[0]) / 2;
        return acc + " C" + mid + "," + prev[1] + " " + mid + "," + point[1] + " " + point[0] + "," + point[1];
      }, "");
      body.innerHTML = shellCard(`<div class="ch-head"><div><span class="mono">TRAFFIC / 24H</span><h5>流量曲线与探针</h5></div><span class="ch-badge" data-probe-label>指到曲线上</span></div><div class="ch-curve-wrap" data-curve><svg viewBox="0 0 560 210" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="chFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c63d2" stop-opacity=".34"/><stop offset="1" stop-color="#7c63d2" stop-opacity="0"/></linearGradient></defs><path class="ch-area" d="${path} L${width},${height} L0,${height} Z"/><path class="ch-line" d="${path}"/></svg><i class="ch-probe" data-probe></i><i class="ch-probe-dot" data-dot></i><span class="ch-tip" data-tip>—</span></div><div class="ch-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div><p class="ch-note">指针在图表上移动时，探针跟随最近的采样点。</p>`);
      const curve = body.querySelector("[data-curve]");
      const probe = body.querySelector("[data-probe]");
      const dot = body.querySelector("[data-dot]");
      const tip = body.querySelector("[data-tip]");
      const label = body.querySelector("[data-probe-label]");
      bind(bag, curve, "pointermove", (event) => {
        const rect = curve.getBoundingClientRect();
        const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const index = Math.round(ratio * (values.length - 1));
        const point = points[index];
        const px = point[0] / width * rect.width;
        const py = point[1] / height * rect.height;
        probe.style.left = px + "px";
        probe.style.opacity = "1";
        dot.style.left = px + "px";
        dot.style.top = py + "px";
        dot.style.opacity = "1";
        tip.style.left = px + "px";
        tip.style.top = Math.max(8, py - 32) + "px";
        tip.textContent = String(index).padStart(2, "0") + ":00 · " + values[index] + "k";
        label.textContent = values[index] + "k";
        setStatus(ui, "探针：" + String(index).padStart(2, "0") + ":00 · " + values[index] + "k");
      });
      bind(bag, curve, "pointerleave", () => {
        probe.style.opacity = "0";
        dot.style.opacity = "0";
        tip.style.opacity = "0";
      });
    }

    if (variant === "share") {
      const sources = [
        { label: "自然搜索", value: 42, color: "#1a1b16" },
        { label: "直接访问", value: 26, color: "#7c63d2" },
        { label: "社交媒体", value: 19, color: "#c9ef6f" },
        { label: "推荐链接", value: 13, color: "#d65a35" }
      ];
      body.innerHTML = shellCard(`<div class="ch-head"><div><span class="mono">TRAFFIC / SOURCES</span><h5>流量占比条</h5></div><span class="ch-badge" data-share-label>48.2k 访问</span></div><div class="ch-share-bar" data-bar>${sources.map((source, index) => `<i style="--w:${source.value}%;background:${source.color}" data-seg="${index}"><span>${source.value}%</span></i>`).join("")}</div><div class="ch-share-list">${sources.map((source, index) => `<button type="button" data-source="${index}"><i style="background:${source.color}"></i><span>${source.label}</span><b>${source.value}%</b></button>`).join("")}</div><div class="ch-share-total"><b data-share-total>48.2k</b><span class="mono">总访问</span><p data-share-copy>点任意来源，查看它的占比与颜色。</p></div>`);
      const label = body.querySelector("[data-share-label]");
      const total = body.querySelector("[data-share-total]");
      const copy = body.querySelector("[data-share-copy]");
      const segments = Array.from(body.querySelectorAll("[data-seg]"));
      body.querySelectorAll("[data-source]").forEach((button, index) => bind(bag, button, "click", () => {
        const source = sources[index];
        segments.forEach((seg, i) => seg.classList.toggle("dim", i !== index));
        button.classList.add("active");
        body.querySelectorAll("[data-source]").forEach((item) => { if (item !== button) item.classList.remove("active"); });
        label.textContent = source.label + " " + source.value + "%";
        total.textContent = Math.round(48200 * source.value / 100).toLocaleString() + " 次";
        copy.textContent = source.label + " 占全部访问的 " + source.value + "%，用独立颜色标记。";
        setStatus(ui, copy.textContent);
      }));
    }

    if (variant === "gauge") {
      body.innerHTML = shellCard(`<div class="ch-head"><div><span class="mono">TARGET / ACTUAL</span><h5>双针目标仪表</h5></div><span class="ch-badge" data-gauge-label>目标 82 · 当前 68</span></div><div class="ch-gauge"><svg viewBox="0 0 300 180" aria-hidden="true"><path d="M35 160 A115 115 0 0 1 265 160" class="ch-gauge-track"/><path d="M35 160 A115 115 0 0 1 265 160" class="ch-gauge-value" data-gauge-arc/><g data-needle-target transform="rotate(58 150 160)"><line x1="150" y1="160" x2="150" y2="62"/><circle cx="150" cy="160" r="5"/></g><g data-needle-actual transform="rotate(32 150 160)"><line x1="150" y1="160" x2="150" y2="72"/><circle cx="150" cy="160" r="5"/></g><text x="150" y="135" text-anchor="middle" class="ch-gauge-num" data-gauge-num>68</text></svg><div class="ch-gauge-legend"><span><i class="actual"></i>当前</span><span><i class="target"></i>目标</span></div></div><div class="ch-gauge-control"><label for="gauge-range">当前值</label><input id="gauge-range" type="range" min="0" max="100" value="68" data-range><div><span>0</span><span>100</span></div></div><p class="ch-note">两根针分别指向当前值与目标值；拖动滑杆只改当前值。</p>`);
      const arc = body.querySelector("[data-gauge-arc]");
      const actualNeedle = body.querySelector("[data-needle-actual]");
      const num = body.querySelector("[data-gauge-num]");
      const label = body.querySelector("[data-gauge-label]");
      const range = body.querySelector("[data-range]");
      const length = Math.PI * 115;
      arc.style.strokeDasharray = String(length);
      const paint = () => {
        const value = Number(range.value);
        arc.style.strokeDashoffset = String(length * (1 - value / 100));
        actualNeedle.setAttribute("transform", `rotate(${-90 + value * 1.8} 150 160)`);
        num.textContent = value;
        label.textContent = "目标 82 · 当前 " + value;
        setStatus(ui, "当前 " + value + " · 目标 82");
      };
      bind(bag, range, "input", paint);
      paint();
    }

    return () => bag.forEach((fn) => fn());
  };


  /* ============================================================
     21. APPLE LAB
     ============================================================ */
  S.appleLab = function (root, variant) {
    const bag = [];
    const titles = {
      arch: "建筑设计网站", art: "艺术作品网站", palette: "图片取色控件", audio: "音效调节面板"
    };
    const notes = {
      arch: "结构先于<br>装饰", art: "让作品<br>占满画面",
      palette: "从图里取色<br>不是猜", audio: "听见<br>再调"
    };
    const ui = shell(root, {
      kicker: "WEB / APPLE-INSPIRED",
      title: titles[variant] || "编辑式界面",
      note: notes[variant] || "克制<br>但有个性",
      status: ""
    });
    const body = ui.body;

    if (variant === "arch") {
      const projects = [
        { no: "04", title: "光宅", place: "杭州 / 2026", copy: "让光先进入房间，再决定墙的位置。", cls: "a" },
        { no: "03", title: "长桌", place: "上海 / 2025", copy: "一张长桌，把工作与生活放在同一条线上。", cls: "b" },
        { no: "02", title: "窄门", place: "苏州 / 2024", copy: "入口很窄，里面的院子很宽。", cls: "c" }
      ];
      body.innerHTML = `<div class="ap-stage ap-arch-stage">
        <header class="ap-nav"><span class="ap-brand">ARCHIVE<span>®</span></span><nav><a href="#top">项目</a><a href="#top">方法</a><a href="#top">联系</a></nav><button type="button" class="ap-menu" aria-label="打开菜单">☰</button></header>
        <div class="ap-arch-grid">
          <div class="ap-arch-copy"><span class="mono" data-no>SELECTED WORK / ${projects[0].no}</span><h5 data-title>${projects[0].title}</h5><p data-copy>${projects[0].copy}</p><div class="ap-arch-meta"><span class="mono" data-place>${projects[0].place}</span><span class="mono">VIEW PROJECT ↗</span></div><div class="ap-dots" role="tablist" aria-label="项目">${projects.map((project, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-project="${index}">${project.no}</button>`).join("")}</div></div>
          <div class="ap-arch-art ${projects[0].cls}" data-art><span class="mono">STRUCTURE / LIGHT / 2026</span><div class="ap-arch-lines" aria-hidden="true"><i></i><i></i><i></i><i></i></div><b data-big>${projects[0].no}</b><small>ARCHIVE OF QUIET SPACES</small></div>
        </div>
      </div>`;
      const art = body.querySelector("[data-art]");
      body.querySelectorAll("[data-project]").forEach((button) => bind(bag, button, "click", () => {
        const project = projects[Number(button.dataset.project)];
        body.querySelectorAll("[data-project]").forEach((item) => item.setAttribute("aria-selected", String(item === button)));
        art.className = "ap-arch-art " + project.cls;
        body.querySelector("[data-big]").textContent = project.no;
        body.querySelector("[data-title]").textContent = project.title;
        body.querySelector("[data-copy]").textContent = project.copy;
        body.querySelector("[data-place]").textContent = project.place;
        body.querySelector("[data-no]").textContent = "SELECTED WORK / " + project.no;
        setStatus(ui, "项目切换：" + project.title + " · " + project.place);
      }));
      bind(bag, art, "click", () => setStatus(ui, "打开项目详情（演示）"));
    }

    if (variant === "art") {
      const works = [
        { title: "把光留在墙上", meta: "OIL / 2026 / 120 × 90", cls: "a" },
        { title: "没有声音的房间", meta: "MIXED / 2025 / 80 × 80", cls: "b" },
        { title: "海边的风", meta: "PHOTO / 2025 / 60 × 90", cls: "c" }
      ];
      body.innerHTML = `<div class="ap-stage ap-art-stage">
        <header class="ap-nav"><span class="ap-brand">STILL<span>·</span>ROOM</span><span class="mono ap-nav-meta">SELECTED WORKS 2024–2026</span><button type="button" class="ap-menu" aria-label="打开菜单">☰</button></header>
        <div class="ap-art-main">
          <div class="ap-art-index">${works.map((work, index) => `<button type="button" data-work="${index}" aria-pressed="${index === 0}"><span class="mono">0${index + 1}</span></button>`).join("")}</div>
          <div class="ap-art-canvas a" data-canvas><div class="ap-art-shape"></div><span class="mono">CANVAS / 01</span></div>
          <aside class="ap-art-caption"><span class="mono" data-meta>${works[0].meta}</span><h5 data-title>把光<br>留在墙上</h5><p>作品占满画面，文字只在边缘出现。点左侧编号切换。</p><button type="button" class="ap-art-next" data-next>下一件 →</button></aside>
        </div>
      </div>`;
      const canvas = body.querySelector("[data-canvas]");
      let index = 0;
      const set = (next) => {
        index = (next + works.length) % works.length;
        const work = works[index];
        canvas.className = "ap-art-canvas " + work.cls;
        canvas.animate?.([{ opacity: .4, transform: "scale(1.02)" }, { opacity: 1, transform: "none" }], { duration: 480, easing: "ease-out" });
        body.querySelector("[data-title]").innerHTML = work.title.replace("，", "，<br>");
        body.querySelector("[data-meta]").textContent = work.meta;
        body.querySelectorAll("[data-work]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.work) === index)));
        setStatus(ui, "当前作品：" + work.title);
      };
      body.querySelectorAll("[data-work]").forEach((button) => bind(bag, button, "click", () => set(Number(button.dataset.work))));
      bind(bag, body.querySelector("[data-next]"), "click", () => set(index + 1));
    }

    if (variant === "palette") {
      body.innerHTML = `<div class="ap-stage ap-palette-stage">
        <div class="ap-pal-photo" data-photo><span class="mono">CLICK TO SAMPLE / SUNSET 18:42</span><i class="ap-pal-cursor" data-cursor></i><div class="ap-pal-photo-meta"><b data-hex>#B76945</b><span class="mono" data-rgb>rgb(183, 105, 69)</span></div></div>
        <aside class="ap-pal-panel"><div class="ap-pal-head"><div><span class="mono">PALETTE / 05</span><h5>从图里<br>取色。</h5></div><button type="button" class="ap-copy" data-copy>复制 HEX ⧉</button></div><p>点图片任意位置取样，右侧生成一组同色相的明暗色。</p><div class="ap-swatches" data-swatches></div><div class="ap-pal-foot"><span class="mono" data-hsl>hsl(19, 45%, 49%)</span><span class="mono">CLICK IMAGE TO SAMPLE</span></div></aside>
      </div>`;
      const photo = body.querySelector("[data-photo]");
      const cursor = body.querySelector("[data-cursor]");
      const hexLabel = body.querySelector("[data-hex]");
      const rgbLabel = body.querySelector("[data-rgb]");
      const hslLabel = body.querySelector("[data-hsl]");
      const swatches = body.querySelector("[data-swatches]");
      let current = "#b76945";
      const hslToRgb = (h, s, l) => {
        s /= 100; l /= 100;
        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
      };
      const toHex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
      const paint = (h, s, l) => {
        const rgb = hslToRgb(h, s, l);
        current = toHex(rgb);
        photo.style.setProperty("--sample", current);
        hexLabel.textContent = current.toUpperCase();
        rgbLabel.textContent = "rgb(" + rgb.join(", ") + ")";
        hslLabel.textContent = "hsl(" + Math.round(h) + ", " + Math.round(s) + "%, " + Math.round(l) + "%)";
        const shades = [Math.max(12, l - 28), Math.max(16, l - 14), l, Math.min(86, l + 14), Math.min(92, l + 28)];
        swatches.innerHTML = shades.map((shade, index) => `<button type="button" data-swatch="${index}" aria-label="色阶 ${index + 1}" style="background:${toHex(hslToRgb(h, s, shade))}"><span>${toHex(hslToRgb(h, s, shade)).toUpperCase()}</span></button>`).join("");
        swatches.querySelectorAll("[data-swatch]").forEach((button) => bind(bag, button, "click", () => {
          const hex = button.querySelector("span").textContent;
          cursor.style.background = hex;
          setStatus(ui, "已选择色阶 " + hex);
        }));
      };
      bind(bag, photo, "pointerdown", (event) => {
        const rect = photo.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        cursor.style.left = x * 100 + "%";
        cursor.style.top = y * 100 + "%";
        cursor.style.opacity = "1";
        const h = 18 + x * 200;
        const s = 38 + y * 34;
        const l = 30 + (1 - y) * 32;
        paint(h, s, l);
        setStatus(ui, "取样 " + current.toUpperCase());
      });
      bind(bag, body.querySelector("[data-copy]"), "click", async () => {
        try { await navigator.clipboard.writeText(current.toUpperCase()); } catch (_) {}
        setStatus(ui, "已复制 " + current.toUpperCase());
      });
      paint(19, 45, 49);
    }

    if (variant === "audio") {
      body.innerHTML = `<div class="ap-stage ap-audio-stage">
        <div class="ap-audio-head"><div><span class="mono">SOUND / ROOM</span><h5>调到<br>刚好。</h5></div><span class="ap-audio-tag" data-tag>深夜 · 低增益</span></div>
        <div class="ap-wave" data-wave>${Array.from({ length: 42 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
        <div class="ap-audio-controls"><button type="button" class="ap-play" data-play aria-pressed="false" aria-label="播放"><span>▶</span></button><div class="ap-track"><b>Slow Room</b><small class="mono">FIELD RECORDING / 04:18</small></div><div class="ap-time mono">00:00</div></div>
        <div class="ap-sliders">${[["低频", 42], ["中频", 58], ["高频", 34]].map(([label, value]) => `<label><span>${label}</span><input type="range" min="0" max="100" value="${value}" aria-label="${label}"><b>${value}</b></label>`).join("")}</div>
        <div class="ap-presets"><button type="button" data-preset="清晨">清晨</button><button type="button" data-preset="深夜" class="active">深夜</button><button type="button" data-preset="现场">现场</button></div>
      </div>`;
      const wave = body.querySelector("[data-wave]");
      const play = body.querySelector("[data-play]");
      const tag = body.querySelector("[data-tag]");
      const bars = Array.from(wave.querySelectorAll("i"));
      let playing = false;
      const paint = () => {
        const values = Array.from(body.querySelectorAll(".ap-sliders input")).map((input) => Number(input.value));
        body.querySelectorAll(".ap-sliders b").forEach((label, index) => { label.textContent = values[index]; });
        bars.forEach((bar, index) => {
          const base = .16 + (values[0] / 100 * .28) * Math.abs(Math.sin(index * .7)) + (values[1] / 100 * .3) * Math.abs(Math.cos(index * .33)) + (values[2] / 100 * .2) * Math.abs(Math.sin(index * 1.3));
          bar.style.height = Math.round(clamp(base, .1, .95) * 100) + "%";
        });
      };
      body.querySelectorAll(".ap-sliders input").forEach((input) => bind(bag, input, "input", paint));
      bind(bag, play, "click", () => {
        playing = !playing;
        play.setAttribute("aria-pressed", String(playing));
        play.querySelector("span").textContent = playing ? "❚❚" : "▶";
        wave.classList.toggle("playing", playing);
        tag.textContent = playing ? "播放中 · 低增益" : "已暂停";
        setStatus(ui, playing ? "开始播放 · 波形随音量变化" : "已暂停");
      });
      body.querySelectorAll("[data-preset]").forEach((button) => bind(bag, button, "click", () => {
        const preset = button.dataset.preset;
        const sets = { "清晨": [62, 48, 70], "深夜": [42, 58, 34], "现场": [78, 74, 58] };
        const values = sets[preset];
        body.querySelectorAll(".ap-sliders input").forEach((input, index) => { input.value = values[index]; });
        body.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("active", item === button));
        tag.textContent = preset + " · 低增益";
        paint();
        setStatus(ui, "预设切换：" + preset);
      }));
      paint();
    }

    return () => bag.forEach((fn) => fn());
  };


  /* larger labs below */
})();

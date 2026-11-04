/* Dashboard menu scenes for the web prompts in family 「看板菜单」.
   Same contract as scenes.js: S.menuLab(root, variant, ctx) renders into root and returns a teardown.
   One rule for all six: the selected key is the only state; menu highlight and content are both drawn from it,
   so they can never disagree (including "back to overview"). */
(function () {
  "use strict";

  const S = (window.LAB_SCENES = window.LAB_SCENES || {});
  /* Host context. The pipeline playground passes ctx.reduced() (its own switch), ctx.d(ms) (feel scaling)
     and ctx.log(); the prompt lab passes neither, so the system setting and the written durations apply. */
  const MQ = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let host = null;
  const prefersReduced = () => (host && typeof host.reduced === "function" ? host.reduced() : MQ());
  const dur = (ms) => (host && typeof host.d === "function" && !prefersReduced() ? host.d(ms) : ms);

  const P = {
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
    file: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
    send: '<path d="M21 3L3 10.5l7 2.5 2.5 7z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };
  const icon = (name) => `<svg class="mn-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[name]}</svg>`;

  function bind(bag, target, type, handler) {
    target.addEventListener(type, handler);
    bag.push(() => target.removeEventListener(type, handler));
  }

  /* Swap the content panel; a newer swap cancels the older one. */
  function swapper(panel) {
    let token = 0;
    return (html) => {
      const mine = ++token;
      if (prefersReduced() || !panel.animate) { panel.innerHTML = html; return; }
      const out = panel.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(6px)" }], { duration: dur(120), easing: "ease-in", fill: "forwards" });
      out.finished.then(() => {
        if (mine !== token) return;
        panel.innerHTML = html; out.cancel();
        panel.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: dur(240), easing: "cubic-bezier(.22,.75,.25,1)" });
      }, () => {});
    };
  }

  const kpis = (list) => `<div class="mn-kpis">${list.map((k) => `<div class="mn-kpi"><small>${k[0]}</small><b>${k[1]}</b><em class="${String(k[2]).startsWith("-") ? "down" : "up"}">${k[2]}</em></div>`).join("")}</div>`;
  const rows = (list) => `<ul class="mn-list">${list.map((r) => `<li><span>${r[0]}</span><small>${r[1]}</small><b>${r[2]}</b></li>`).join("")}</ul>`;
  const bars = (vals) => `<div class="mn-bars" aria-hidden="true">${vals.map((v) => `<i style="height:${v}%"></i>`).join("")}</div>`;

  S.menuLab = function (root, variant, ctx) {
    host = ctx || null;
    const bag = [];
    const meta = {
      sidebar: ["WEB / SIDEBAR", "图文侧栏菜单", "点左侧入口<br>右侧内容同步切换"],
      groups: ["WEB / GROUPED", "内容分组菜单", "按业务模块分组<br>点入口，列表同步更新"],
      capsule: ["WEB / CAPSULE", "顶部胶囊菜单", "没有侧栏<br>深色胶囊标出当前项"],
      rail: ["WEB / ICON RAIL", "极简图标侧栏", "窄图标轨<br>悬停或聚焦显示名称"],
      brand: ["WEB / BRAND RAIL", "品牌色侧栏菜单", "深色看板<br>珊瑚橙标出当前页"],
      tabs: ["WEB / GROUP TABS", "分组标签顶栏", "切换作物分组<br>产量与阶段同步更新"]
    }[variant] || ["WEB / MENU", "看板菜单", ""];

    /* Content for each key, per variant ------------------------------------------------ */
    const PAGES = {
      sidebar: {
        overview: ["总览", "home", () => kpis([["本月营收", "¥482k", "+12%"], ["新客户", "1,284", "+8%"], ["退款率", "1.9%", "-0.4%"]]) + bars([40, 55, 48, 70, 62, 80, 74])],
        orders: ["订单", "box", () => rows([["#20481", "待发货 · 2 件", "¥328"], ["#20480", "已付款 · 1 件", "¥129"], ["#20477", "退款中", "¥56"], ["#20473", "已完成 · 3 件", "¥712"]])],
        clients: ["客户", "users", () => rows([["林舟", "上海 · 12 单", "VIP"], ["周未", "杭州 · 4 单", "新客"], ["陈一", "成都 · 9 单", "常客"]])],
        reports: ["报表", "file", () => kpis([["转化率", "3.8%", "+0.6%"], ["客单价", "¥216", "+4%"]]) + bars([30, 42, 38, 51, 60, 58, 66])],
        settings: ["设置", "gear", () => rows([["店铺名称", "界面有意思", "编辑"], ["通知", "邮件 + 站内", "开启"], ["成员", "4 人", "管理"]])]
      },
      groups: [
        ["内容", [["shows", "节目", "play"], ["discover", "发现", "compass"], ["topics", "专题", "layers"]]],
        ["运营", [["events", "活动", "calendar"], ["push", "推送", "send"]]],
        ["数据", [["plays", "播放", "chart"], ["audience", "用户", "users"]]]
      ],
      groupData: {
        shows: rows([["深夜读书会", "第 42 期 · 已上线", "3.2万播放"], ["城市漫步", "第 18 期 · 审核中", "—"], ["厨房实验", "第 9 期 · 草稿", "—"]]),
        discover: rows([["本周推荐", "8 个位置", "已排期"], ["新人必听", "12 个位置", "待更新"], ["编辑精选", "6 个位置", "已排期"]]),
        topics: rows([["秋天的声音", "14 期节目", "进行中"], ["旅行播客", "22 期节目", "已结束"]]),
        events: rows([["双 11 会员月", "11.01–11.30", "进行中"], ["新年听单", "12.20 开始", "筹备"]]),
        push: rows([["每日一听", "每天 08:00", "开启"], ["新节目提醒", "实时", "开启"], ["周报", "周一 09:00", "关闭"]]),
        plays: kpis([["今日播放", "8.6万", "+5%"], ["完播率", "61%", "+2%"]]) + bars([50, 46, 62, 58, 71, 77, 69]),
        audience: kpis([["日活", "2.1万", "+3%"], ["新增", "1,920", "-1%"]]) + bars([35, 40, 42, 48, 46, 52, 57])
      },
      capsule: {
        overview: ["概览", () => kpis([["访问", "12.4万", "+9%"], ["转化", "3.1%", "+0.3%"], ["收入", "¥86k", "+11%"], ["留存", "42%", "+1%"]]) + bars([44, 52, 49, 63, 58, 72, 70, 76, 68, 81])],
        traffic: ["流量", () => rows([["搜索", "48%", "5.9万"], ["直接访问", "27%", "3.3万"], ["社交", "17%", "2.1万"], ["邮件", "8%", "1.0万"]])],
        convert: ["转化", () => kpis([["加购", "9.4%", "+0.8%"], ["下单", "3.1%", "+0.3%"], ["支付", "2.8%", "+0.2%"]]) + bars([90, 64, 41, 30, 28])],
        retain: ["留存", () => kpis([["次日", "42%", "+1%"], ["7 日", "23%", "-2%"], ["30 日", "11%", "+1%"]]) + bars([100, 42, 31, 26, 23, 18, 11])]
      },
      rail: {
        top: [["home", "首页", "home"], ["stats", "统计", "chart"], ["files", "文件", "folder"], ["plan", "日程", "calendar"]],
        bottom: [["notice", "通知", "bell"], ["me", "我的账户", "user"]],
        data: {
          home: kpis([["待办", "6", "+2"], ["本周完成", "18", "+5"]]) + rows([["整理 Q4 预算", "今天 16:00", "高"], ["评审首页改版", "明天", "中"]]),
          stats: kpis([["访问", "3.2万", "+6%"], ["时长", "4m12s", "+9%"]]) + bars([40, 48, 45, 60, 66, 59, 72]),
          files: rows([["品牌规范.pdf", "2.4 MB · 昨天", "共享"], ["预算.xlsx", "86 KB · 周一", "私有"], ["截图", "36 项", "文件夹"]]),
          plan: rows([["设计评审", "周二 10:00", "会议室 A"], ["客户回访", "周三 15:00", "线上"], ["发布复盘", "周五 11:00", "会议室 B"]]),
          notice: rows([["林舟评论了你的文件", "5 分钟前", "查看"], ["预算已审批", "1 小时前", "查看"]]),
          me: rows([["账户", "夏小满 · 管理员", "编辑"], ["安全", "两步验证已开启", "管理"]])
        }
      },
      brand: {
        top: [["dash", "看板", "home"], ["orders", "订单", "box"], ["clients", "客户", "users"], ["reports", "报表", "chart"]],
        bottom: [["alerts", "提醒", "bell"], ["settings", "设置", "gear"], ["account", "账户", "user"]],
        data: {
          dash: kpis([["营收", "¥1.28M", "+14%"], ["订单", "8,412", "+6%"], ["客单价", "¥152", "+3%"]]) + bars([42, 58, 50, 66, 61, 79, 84]),
          orders: rows([["#88213", "待发货", "¥486"], ["#88212", "已完成", "¥129"], ["#88209", "退款中", "¥64"]]),
          clients: rows([["新客", "本月 1,284", "+8%"], ["复购", "本月 2,016", "+4%"], ["流失预警", "86 位", "跟进"]]),
          reports: kpis([["毛利率", "38%", "+2%"], ["退货率", "2.1%", "-0.3%"]]) + bars([30, 36, 41, 39, 47, 52, 55]),
          alerts: rows([["库存不足 · 珊瑚马克杯", "剩 12 件", "补货"], ["差评待回复", "3 条", "处理"]]),
          settings: rows([["品牌色", "珊瑚橙 #FF6A3D", "编辑"], ["圆角", "12px 统一", "编辑"]]),
          account: rows([["夏小满", "管理员", "退出"]])
        }
      },
      tabs: {
        wheat: ["小麦", { yield: "486", unit: "kg/亩", area: "1,240 亩", stage: 3, trend: [52, 58, 61, 66, 70, 74] }],
        corn: ["玉米", { yield: "612", unit: "kg/亩", area: "860 亩", stage: 2, trend: [40, 46, 55, 63, 68, 72] }],
        rice: ["水稻", { yield: "538", unit: "kg/亩", area: "1,020 亩", stage: 4, trend: [60, 62, 65, 70, 76, 81] }],
        soy: ["大豆", { yield: "198", unit: "kg/亩", area: "420 亩", stage: 1, trend: [22, 28, 31, 30, 35, 38] }]
      }
    };
    const STAGES = ["播种", "出苗", "拔节", "抽穗", "成熟"];

    root.innerHTML = `
      <div class="scene mn-scene">
        <div class="scene-head">
          <div><p class="scene-kicker">${meta[0]}</p><h4 class="scene-title">${meta[1]}</h4></div>
          <p class="scene-note">${meta[2]}</p>
        </div>
        <div class="scene-body"><div class="mn-app mn-v-${variant}"></div></div>
        <p class="scene-status" data-status aria-live="polite"></p>
      </div>`;
    const app = root.querySelector(".mn-app");
    const status = root.querySelector("[data-status]");
    const say = (text) => { status.textContent = text; if (host && typeof host.log === "function") host.log(text); };

    /* Shared wiring: buttons carry data-key; aria-current marks the one selected page. */
    const wire = (container, render) => {
      bind(bag, container, "click", (event) => {
        const b = event.target.closest("[data-key]");
        if (!b || !container.contains(b)) return;
        render(b.dataset.key);
      });
    };
    const mark = (key) => app.querySelectorAll("[data-key]").forEach((b) => {
      if (b.dataset.key === key) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });

    if (variant === "sidebar") {
      const pages = PAGES.sidebar;
      app.innerHTML = `<nav class="mn-side" aria-label="主菜单"><b class="mn-brand">界面<span>有意思</span></b>${Object.entries(pages).map(([k, p]) => `<button type="button" class="mn-item" data-key="${k}">${icon(p[1])}<span>${p[0]}</span></button>`).join("")}</nav>
        <main class="mn-main"><header class="mn-head"><h5 data-title></h5><button type="button" class="mn-back" data-back hidden>← 返回总览</button></header><div data-panel></div></main>`;
      const swap = swapper(app.querySelector("[data-panel]"));
      const render = (key, first) => {
        mark(key);
        app.querySelector("[data-title]").textContent = pages[key][0];
        app.querySelector("[data-back]").hidden = key === "overview";
        if (first) app.querySelector("[data-panel]").innerHTML = pages[key][2](); else swap(pages[key][2]());
        if (!first) say(`已切换到「${pages[key][0]}」`);
      };
      wire(app.querySelector(".mn-side"), (k) => render(k));
      bind(bag, app.querySelector("[data-back]"), "click", () => { render("overview"); app.querySelector('[data-key="overview"]').focus(); });
      render("overview", true); say("当前：总览");
    }

    if (variant === "groups") {
      const all = PAGES.groups.flatMap((g) => g[1]);
      app.innerHTML = `<nav class="mn-side mn-grouped" aria-label="内容管理">${PAGES.groups.map((g) => `<div class="mn-group"><p class="mn-group-title">${g[0]}</p>${g[1].map((it) => `<button type="button" class="mn-item" data-key="${it[0]}">${icon(it[2])}<span>${it[1]}</span></button>`).join("")}</div>`).join("")}</nav>
        <main class="mn-main"><header class="mn-head"><p class="mn-crumb" data-crumb></p><h5 data-title></h5></header><div data-panel></div></main>`;
      const swap = swapper(app.querySelector("[data-panel]"));
      const render = (key, first) => {
        const it = all.find((x) => x[0] === key);
        const group = PAGES.groups.find((g) => g[1].includes(it))[0];
        mark(key);
        app.querySelector("[data-crumb]").textContent = `${group} / ${it[1]}`;
        app.querySelector("[data-title]").textContent = it[1];
        if (first) app.querySelector("[data-panel]").innerHTML = PAGES.groupData[key]; else swap(PAGES.groupData[key]);
        say(`${group} · ${it[1]}`);
      };
      wire(app.querySelector(".mn-side"), (k) => render(k));
      render("shows", true);
    }

    if (variant === "capsule") {
      const pages = PAGES.capsule;
      app.innerHTML = `<header class="mn-top"><b class="mn-brand">界面<span>有意思</span></b>
        <nav class="mn-capsule" aria-label="数据视图"><i class="mn-pill" aria-hidden="true" data-pill></i>${Object.entries(pages).map(([k, p]) => `<button type="button" data-key="${k}">${p[0]}</button>`).join("")}</nav>
        <span class="mn-avatar" aria-hidden="true">夏</span></header>
        <main class="mn-main mn-wide"><h5 data-title></h5><div data-panel></div></main>`;
      const nav = app.querySelector(".mn-capsule");
      const pill = app.querySelector("[data-pill]");
      const swap = swapper(app.querySelector("[data-panel]"));
      const place = (instant) => {
        const b = nav.querySelector("[aria-current]"); if (!b) return;
        pill.style.transition = instant || prefersReduced() ? "none" : "";
        pill.style.width = b.offsetWidth + "px";
        pill.style.transform = `translateX(${b.offsetLeft}px)`;
      };
      const render = (key, first) => {
        mark(key); place(first);
        app.querySelector("[data-title]").textContent = pages[key][0];
        if (first) app.querySelector("[data-panel]").innerHTML = pages[key][1](); else swap(pages[key][1]());
        say(`视图：${pages[key][0]}`);
      };
      wire(nav, (k) => render(k));
      const onResize = () => place(true);
      window.addEventListener("resize", onResize); bag.push(() => window.removeEventListener("resize", onResize));
      render("overview", true);
      requestAnimationFrame(() => place(true));
    }

    if (variant === "rail" || variant === "brand") {
      const cfg = PAGES[variant];
      const all = cfg.top.concat(cfg.bottom);
      const btn = (it) => `<button type="button" class="mn-rail-btn" data-key="${it[0]}" aria-label="${it[1]}">${icon(it[2])}<span class="mn-tip" aria-hidden="true">${it[1]}</span></button>`;
      app.innerHTML = `<nav class="mn-rail" aria-label="${variant === "brand" ? "主导航" : "应用导航"}"><b class="mn-logo" aria-hidden="true">界</b><div class="mn-rail-top">${cfg.top.map(btn).join("")}</div><div class="mn-rail-bottom">${cfg.bottom.map(btn).join("")}</div></nav>
        <main class="mn-main"><header class="mn-head"><h5 data-title></h5></header><div data-panel></div></main>`;
      const swap = swapper(app.querySelector("[data-panel]"));
      const render = (key, first) => {
        const it = all.find((x) => x[0] === key);
        mark(key);
        app.querySelector("[data-title]").textContent = it[1];
        if (first) app.querySelector("[data-panel]").innerHTML = cfg.data[key]; else swap(cfg.data[key]);
        say(`当前页：${it[1]}`);
      };
      wire(app.querySelector(".mn-rail"), (k) => render(k));
      // arrow keys move between rail icons (roving within the rail, Tab still leaves it)
      bind(bag, app.querySelector(".mn-rail"), "keydown", (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        const list = [...app.querySelectorAll(".mn-rail-btn")];
        const i = list.indexOf(document.activeElement); if (i < 0) return;
        event.preventDefault();
        list[(i + (event.key === "ArrowDown" ? 1 : -1) + list.length) % list.length].focus();
      });
      render(cfg.top[0][0], true);
    }

    if (variant === "tabs") {
      const crops = PAGES.tabs;
      app.innerHTML = `<header class="mn-top mn-white"><b class="mn-brand">禾田<span>看板</span></b>
        <nav class="mn-tabs" aria-label="作物分组">${Object.entries(crops).map(([k, c]) => `<button type="button" data-key="${k}"><i aria-hidden="true"></i>${c[0]}</button>`).join("")}</nav>
        <span class="mn-avatar" aria-hidden="true">农</span></header>
        <main class="mn-main mn-wide"><div data-panel></div></main>`;
      const swap = swapper(app.querySelector("[data-panel]"));
      const page = (c) => `
        <div class="mn-kpis">
          <div class="mn-kpi"><small>预计亩产</small><b>${c[1].yield}<span> ${c[1].unit}</span></b></div>
          <div class="mn-kpi"><small>种植面积</small><b>${c[1].area}</b></div>
          <div class="mn-kpi"><small>当前阶段</small><b>${STAGES[c[1].stage]}</b></div>
        </div>
        <div class="mn-card"><small>种植阶段 · ${c[0]}</small>
          <ol class="mn-stage">${STAGES.map((s, i) => `<li class="${i < c[1].stage ? "past" : i === c[1].stage ? "now" : ""}">${s}</li>`).join("")}</ol>
        </div>
        <div class="mn-card"><small>近 6 周长势指数</small>${bars(c[1].trend)}</div>`;
      const render = (key, first) => {
        mark(key);
        if (first) app.querySelector("[data-panel]").innerHTML = page(crops[key]); else swap(page(crops[key]));
        say(`${crops[key][0]} · 亩产 ${crops[key][1].yield} kg · ${STAGES[crops[key][1].stage]}`);
      };
      wire(app.querySelector(".mn-tabs"), (k) => render(k));
      render("wheat", true);
    }

    return () => bag.splice(0).forEach((fn) => { try { fn(); } catch (error) { /* already gone */ } });
  };
})();

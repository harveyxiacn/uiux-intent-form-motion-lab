(function () {
  "use strict";

  const DATA = window.LAB_DATA;
  const SCENES = window.LAB_SCENES || {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const state = {
    category: "web",
    family: "all",
    query: "",
    selected: null,
    teardown: null
  };

  const els = {
    list: $("#prompt-list"),
    empty: $("#library-empty"),
    count: $("#prompt-count"),
    search: $("#lab-search"),
    families: $("#family-list"),
    stage: $("#stage"),
    stageShell: $("#stage-shell"),
    stageFamily: $("#stage-family"),
    stageTitle: $("#stage-title"),
    stageEffect: $("#stage-effect"),
    browserUrl: $("#browser-url"),
    detailNumber: $("#detail-number"),
    detailTitle: $("#detail-title"),
    detailSummary: $("#detail-summary"),
    detailTags: $("#detail-tags"),
    detailPrompt: $("#detail-prompt"),
    detailAccept: $("#detail-accept"),
    detailSkills: $("#detail-skills"),
    status: $("#lab-status")
  };

  function announce(message) {
    if (!els.status) return;
    els.status.textContent = "";
    requestAnimationFrame(() => { els.status.textContent = message; });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function normalize(value) {
    return String(value).toLowerCase().replace(/\s+/g, " ").trim();
  }

  // When the page is shown in another language, search and matching also look at the translated text.
  const I18N = window.I18N && window.I18N.lang !== "zh-CN" ? window.I18N : null;
  function fieldsOf(prompt) {
    const base = [prompt.title, prompt.summary, prompt.prompt, prompt.family, prompt.tags.join(" "), prompt.scene];
    return I18N ? base.concat([prompt.title, prompt.summary, prompt.prompt, prompt.family, prompt.scene].map(I18N.t), prompt.tags.map(I18N.t)) : base;
  }

  function promptNumber(prompt) {
    return String(DATA.prompts.indexOf(prompt) + 1).padStart(3, "0");
  }

  function filtered() {
    const q = normalize(state.query);
    return DATA.prompts.filter((prompt) => {
      if (prompt.category !== state.category) return false;
      if (state.family !== "all" && prompt.family !== state.family) return false;
      if (!q) return true;
      const haystack = normalize(fieldsOf(prompt).join(" "));
      return q.split(" ").every((token) => haystack.includes(token));
    });
  }

  function renderFamilies() {
    const families = Array.from(new Set(DATA.prompts.filter((p) => p.category === state.category).map((p) => p.family)));
    els.families.innerHTML = "";
    const all = document.createElement("button");
    all.type = "button";
    all.className = "family-chip";
    all.dataset.family = "all";
    all.textContent = "全部";
    all.setAttribute("aria-pressed", String(state.family === "all"));
    els.families.append(all);
    families.forEach((family) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "family-chip";
      button.dataset.family = family;
      button.textContent = family;
      button.setAttribute("aria-pressed", String(state.family === family));
      els.families.append(button);
    });
  }

  function renderList() {
    const prompts = filtered();
    els.count.textContent = `${prompts.length} 条`;
    els.list.innerHTML = "";
    const fragment = document.createDocumentFragment();
    prompts.forEach((prompt) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "prompt-row";
      button.dataset.id = prompt.id;
      button.setAttribute("aria-current", String(state.selected && state.selected.id === prompt.id));
      button.innerHTML = `<span class="pr-index">${escapeHtml(promptNumber(prompt))}</span><span><strong>${escapeHtml(prompt.title)}</strong><small>${escapeHtml(prompt.summary)}</small></span>`;
      fragment.append(button);
    });
    els.list.append(fragment);
    els.empty.hidden = prompts.length > 0;
    if (!prompts.length) {
      els.list.innerHTML = "";
    }
  }

  function setCategory(category) {
    if (state.category === category) return;
    state.category = category;
    state.family = "all";
    $$(".category-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.category === category));
    });
    renderFamilies();
    const prompts = filtered();
    const next = prompts.find((prompt) => prompt.id === state.selected?.id) || prompts[0];
    renderList();
    if (next) select(next, { updateHash: false });
    announce(category === "web" ? `网页提示词，共 ${prompts.length} 条` : `App 与小程序提示词，共 ${prompts.length} 条`);
  }

  function setFamily(family) {
    state.family = family;
    renderFamilies();
    renderList();
    const prompts = filtered();
    if (state.selected && !prompts.some((prompt) => prompt.id === state.selected.id) && prompts[0]) {
      select(prompts[0], { updateHash: false });
    }
  }

  function setQuery(query) {
    state.query = query;
    renderList();
    const prompts = filtered();
    if (prompts.length && (!state.selected || !prompts.some((p) => p.id === state.selected.id))) {
      select(prompts[0], { updateHash: false });
    }
  }

  function teardownScene() {
    if (typeof state.teardown === "function") {
      try { state.teardown(); } catch (error) { console.error(error); }
    }
    state.teardown = null;
    els.stage.innerHTML = "";
  }

  function mountScene(prompt) {
    teardownScene();
    const scene = SCENES[prompt.scene];
    els.stageShell.dataset.frame = prompt.category;
    els.browserUrl.textContent = "playground.local / " + prompt.scene;
    if (!scene) {
      els.stage.innerHTML = `<div class="scene"><p class="scene-note">这个场景还没有加载。</p></div>`;
      return;
    }
    try {
      const result = scene(els.stage, prompt.variant, {
        reduced: reducedQuery.matches,
        announce,
        theme: document.documentElement.dataset.theme || "light",
        prompt
      });
      state.teardown = typeof result === "function" ? result : null;
    } catch (error) {
      console.error(error);
      els.stage.innerHTML = `<div class="scene"><p class="scene-note">场景加载失败：${escapeHtml(error.message)}</p></div>`;
      announce("场景加载失败");
    }
  }

  function renderDetail(prompt) {
    els.detailNumber.textContent = promptNumber(prompt);
    els.detailTitle.textContent = prompt.title;
    els.detailSummary.textContent = prompt.summary;
    els.detailPrompt.textContent = prompt.prompt;
    els.stageTitle.textContent = prompt.title;
    els.stageFamily.textContent = I18N ? `${I18N.t(prompt.family)} / ${I18N.t(prompt.category === "web" ? "网页" : "App · 小程序")}` : prompt.family + " / " + (prompt.category === "web" ? "网页" : "App · 小程序");
    els.stageEffect.textContent = prompt.summary;
    els.detailTags.innerHTML = prompt.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    els.detailAccept.innerHTML = prompt.acceptance.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    els.detailSkills.innerHTML = prompt.skills.map((skill) => {
      const label = skill.replace(/^uiux-/, "");
      return `<a href="https://github.com/harveyxiacn/uiux-intent-form-motion-lab/tree/main/skills/${encodeURIComponent(skill)}" target="_blank" rel="noopener">${escapeHtml(label)} ↗</a>`;
    }).join("");
  }

  function select(prompt, options) {
    if (!prompt) return;
    const opts = options || {};
    const changed = !state.selected || state.selected.id !== prompt.id;
    state.selected = prompt;
    if (prompt.category !== state.category) {
      state.category = prompt.category;
      state.family = "all";
      $$(".category-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.category === prompt.category)));
      renderFamilies();
      renderList();
    }
    $$(".prompt-row").forEach((row) => row.setAttribute("aria-current", String(row.dataset.id === prompt.id)));
    renderDetail(prompt);
    if (changed || opts.force) mountScene(prompt);
    if (opts.updateHash !== false && location.hash !== "#p/" + prompt.id) {
      history.replaceState(null, "", "#p/" + prompt.id);
    }
    const row = els.list.querySelector(`[data-id="${prompt.id}"]`);
    if (row) {
      const listRect = els.list.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      if (rowRect.top < listRect.top) els.list.scrollTop -= listRect.top - rowRect.top;
      if (rowRect.bottom > listRect.bottom) els.list.scrollTop += rowRect.bottom - listRect.bottom;
      if (rowRect.left < listRect.left) els.list.scrollLeft -= listRect.left - rowRect.left;
      if (rowRect.right > listRect.right) els.list.scrollLeft += rowRect.right - listRect.right;
    }
  }

  function selectById(id) {
    const prompt = DATA.prompts.find((item) => item.id === id);
    if (prompt) select(prompt);
  }

  async function copyText(text, label) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.append(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      announce(`${label || "提示词"}已复制`);
      return true;
    } catch (error) {
      console.error(error);
      announce("复制失败，请手动选择文字");
      return false;
    }
  }

  function setupTheme() {
    const toggle = $("#theme-toggle");
    const meta = $('meta[name="theme-color"]');
    let saved = null;
    try { saved = localStorage.getItem("lab-theme"); } catch (error) { /* storage is optional */ }
    const preferred = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const apply = (theme, persist) => {
      document.documentElement.dataset.theme = theme;
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
      toggle.setAttribute("aria-label", theme === "dark" ? "切换为浅色主题" : "切换为深色主题");
      if (meta) meta.content = theme === "dark" ? "#161712" : "#f3f0e7";
      if (persist) {
        try { localStorage.setItem("lab-theme", theme); } catch (error) { /* optional */ }
      }
      if (state.selected) mountScene(state.selected);
    };
    apply(preferred, false);
    toggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      apply(next, true);
      announce(next === "dark" ? "已切换到深色主题" : "已切换到浅色主题");
    });
  }

  function renderCoverage() {
    const grid = $("#skill-grid");
    const local = [
      ["uiux-page-planning", "页面规划", "先定界面类别、用户目标和信息层级。"],
      ["uiux-style-direction", "视觉方向", "构图、字体、配色与图像方向的具体选择。"],
      ["uiux-interaction-spec", "交互规格", "触发、过程、结果与反向操作。"],
      ["uiux-design-system", "设计系统", "语义 token、主题和组件状态矩阵。"],
      ["uiux-component-engineering", "组件工程", "组件契约、状态归属与组合 API。"],
      ["uiux-motion-engineering", "动效工程", "可中断、可降级、可验证的动效。"],
      ["uiux-accessibility-review", "无障碍复核", "键盘、焦点、对比度和真实证据。"],
      ["uiux-mobile-patterns", "手机模式", "手持任务流、导航、输入与安全区。"]
    ];
    const upstream = [
      ["finesse-term", "finesse-term", "把大白话翻译成 UI 术语，并指出成对的坑。"],
      ["finesse-ui", "finesse-ui", "按 brand / product / H5 选择构建方式。"],
      ["ui-ux-pro-max", "UI UX Pro Max", "风格、配色、字体与 UX 规则的资料库。"],
      ["design-taste-frontend", "Design Taste", "艺术方向、反模板化与真实浏览器检查。"],
      ["interface-design", "Interface Design", "产品 UI 的层级、token 与系统一致性。"],
      ["impeccable", "Impeccable", "审查、批评、打磨与修复。"],
      ["uiux-prompt-playbook", "提示词手册", "141 条可执行提示词与按需组合的写法。"]
    ];
    const counts = {};
    DATA.prompts.forEach((prompt) => {
      prompt.skills.forEach((skill) => { counts[skill] = (counts[skill] || 0) + 1; });
    });
    const card = (skill, title, copy, className) => {
      const meta = className === "upstream"
        ? "实时展台"
        : className === "prompt-playbook"
          ? `${DATA.prompts.length} 条`
          : (counts[skill] || 0) + " prompts";
      return `
      <a class="skill-card ${className}" href="https://github.com/harveyxiacn/uiux-intent-form-motion-lab/tree/main/skills/${skill}" target="_blank" rel="noopener">
        <span class="sc-top"><span>${className === "upstream" ? "UPSTREAM" : className === "prompt-playbook" ? "NEW / 15" : "LOCAL"}</span><span>${meta}</span></span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(copy)}</p>
        <span class="sc-count">${escapeHtml(skill)} ↗</span>
      </a>`;
    };
    const playbook = upstream.pop();
    grid.innerHTML = local.map(([skill, title, copy]) => card(skill, title, copy, "local")).join("")
      + card(playbook[0], playbook[1], playbook[2], "prompt-playbook")
      + upstream.map(([skill, title, copy]) => card(skill, title, copy, "upstream")).join("");
  }

  function countStats() {
    $("#stat-prompts").textContent = DATA.prompts.length;
    $("#stat-scenes").textContent = new Set(DATA.prompts.map((prompt) => prompt.scene)).size;
    $("#web-count").textContent = DATA.prompts.filter((prompt) => prompt.category === "web").length;
    $("#app-count").textContent = DATA.prompts.filter((prompt) => prompt.category === "app").length;
  }

  function setupLibrary() {
    els.search.addEventListener("input", (event) => setQuery(event.target.value));
    els.families.addEventListener("click", (event) => {
      const button = event.target.closest("[data-family]");
      if (button) setFamily(button.dataset.family);
    });
    els.list.addEventListener("click", (event) => {
      const row = event.target.closest("[data-id]");
      if (row) selectById(row.dataset.id);
    });
    $$(".category-button").forEach((button) => {
      button.addEventListener("click", () => setCategory(button.dataset.category));
    });
    $("#stage-reset").addEventListener("click", () => {
      if (state.selected) {
        mountScene(state.selected);
        announce("已重置当前效果");
      }
    });
    $("#stage-shuffle").addEventListener("click", () => {
      const pool = DATA.prompts.filter((prompt) => prompt.category === state.category && prompt.id !== state.selected?.id);
      if (!pool.length) return;
      select(pool[Math.floor(Math.random() * pool.length)]);
      announce("随机换了一条提示词");
    });
    $("#detail-copy").addEventListener("click", () => {
      if (state.selected) copyText(state.selected.prompt, "提示词");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) {
        event.preventDefault();
        els.search.focus();
      }
    });
  }

  function setupHash() {
    const applyHash = () => {
      const match = location.hash.match(/^#p\/(.+)$/);
      if (!match) return;
      selectById(decodeURIComponent(match[1]));
    };
    addEventListener("hashchange", applyHash);
    applyHash();
  }

  const CONCEPTS = [
    { keys: ["底部导航", "底栏", "tabbar", "tab bar", "标签栏"], words: ["底栏", "导航", "胶囊", "标签"], boost: 7 },
    { keys: ["主题", "深色", "暗色", "换肤"], words: ["主题", "深色", "扩散", "圆形"], boost: 7 },
    { keys: ["删除", "移走", "扔掉"], words: ["删除", "曲线", "撤销", "缩小"], boost: 6 },
    { keys: ["拖", "排序", "拖动", "挪动", "让位"], words: ["拖拽", "排序", "让位", "吸附"], boost: 6 },
    { keys: ["卡片", "堆叠", "翻面", "翻转"], words: ["卡片", "堆叠", "翻转", "详情"], boost: 4 },
    { keys: ["弹窗", "抽屉", "面板", "弹出", "底部"], words: ["弹层", "面板", "抽屉", "底部"], boost: 4 },
    { keys: ["滚动", "下滑", "上滑", "滚"], words: ["滚动", "吸顶", "视差", "进度"], boost: 5 },
    { keys: ["按钮", "按一下", "点击"], words: ["按钮", "长按", "滑动确认", "进度"], boost: 4 },
    { keys: ["开关", "切换"], words: ["开关", "切换", "状态", "弹性"], boost: 4 },
    { keys: ["搜索", "筛选", "查找"], words: ["搜索", "筛选", "联想", "下拉"], boost: 5 },
    { keys: ["图表", "数据", "仪表", "占比", "曲线"], words: ["图表", "数据", "环形", "曲线", "仪表"], boost: 6 },
    { keys: ["手势", "滑动返回", "惯性", "橡皮筋"], words: ["手势", "惯性", "橡皮筋", "方向"], boost: 6 },
    { keys: ["日历", "日期", "时间"], words: ["日历", "日期", "时间", "周"], boost: 4 },
    { keys: ["标签", "分类"], words: ["标签", "分类", "筛选", "让位"], boost: 4 },
    { keys: ["输入框", "表单", "输入"], words: ["输入", "表单", "错误", "浮动"], boost: 4 },
    { keys: ["照片", "图片", "取色"], words: ["照片", "图片", "取色", "全屏"], boost: 3 },
    { keys: ["高级", "精致", "质感", "顺滑", "自然"], words: ["高级", "质感", "缓动", "弹簧", "柔和"], boost: 1 }
  ];

  function tokensOf(text) {
    const clean = normalize(text).replace(/[，。！？、；：,.!?;:"'“”‘’()（）\[\]【】]/g, " ");
    const parts = clean.split(/\s+/).filter(Boolean);
    const tokens = new Set(parts);
    parts.forEach((part) => {
      const han = part.replace(/[^一-龥]/g, "");
      for (let i = 0; i < han.length - 1; i += 1) tokens.add(han.slice(i, i + 2));
      for (let i = 0; i < han.length - 2; i += 1) tokens.add(han.slice(i, i + 3));
    });
    return Array.from(tokens).filter((token) => token.length > 1 || /[a-z]/i.test(token));
  }

  function scorePrompt(prompt, text, inferredCategory) {
    const haystack = normalize(fieldsOf(prompt).join(" "));
    let score = 0;
    tokensOf(text).forEach((token) => {
      if (haystack.includes(token) && !(I18N && /^[a-z]{1,2}$/.test(token))) score += token.length >= 3 ? 3 : 2;
    });
    CONCEPTS.forEach((concept) => {
      if (concept.keys.some((key) => normalize(text).includes(key))) {
        concept.words.forEach((word) => {
          if (haystack.includes(word)) score += concept.boost;
        });
      }
    });
    if (inferredCategory && prompt.category === inferredCategory) score += 10;
    if (inferredCategory && prompt.category !== inferredCategory) score -= 8;
    return score;
  }

  function inferCategory(text) {
    const value = normalize(text);
    const appHits = ["app", "小程序", "手机", "移动", "手势", "触屏", "底部导航", "ios", "安卓", "mobile", "phone", "mini program", "gesture", "swipe", "android"].filter((key) => value.includes(key)).length;
    const webHits = ["网页", "网站", "后台", "dashboard", "工作台", "桌面", "官网", "浏览器", "表格", "website", "web page", "admin", "desktop", "browser", "table"].filter((key) => value.includes(key)).length;
    if (appHits > webHits) return "app";
    if (webHits > appHits) return "web";
    return null;
  }

  function buildComposed(text, matches) {
    const top = matches[0];
    if (!top) {
      return `请设计一个界面效果，并先补齐以下信息：\n\n1. 场景：这是网页、App 还是小程序？用户在什么情境下使用？\n2. 动作：用户做什么，界面如何回应？\n3. 手感：入场时长、缓动、是否可中断，手指松开后落在哪里？\n4. 边界：空状态、失败、快速重复、反向操作、键盘或读屏如何完成？\n5. 验收：给出 3 条可以在浏览器里复现的检查。\n\n原始需求：${text}`;
    }
    const category = top.category === "web" ? "网页" : "App / 小程序";
    const second = matches[1];
    const lines = [
      `请实现一个${category}界面效果，需求原话是：「${text}」。`,
      "",
      `目标场景：${category} · ${top.family}`,
      `核心效果：${top.prompt}`,
      second ? `可组合的第二个效果（${second.title}）：${second.prompt}` : "",
      "",
      "手感：入场 320–560ms，使用缓动而非线性；拖动跟手，松手后吸附到可预测的位置；允许中途反向或取消，不能锁死。",
      "边界：必须保留空状态、失败状态和 reduced-motion 替代；只改变视觉，不改变业务状态；触摸、键盘和读屏都能完成同一件事。",
      "验收：",
      ...top.acceptance.map((item, index) => (index + 1) + ". " + item)
    ].filter(Boolean);
    return lines.join("\n");
  }

  function setupComposer() {
    const input = $("#need-input");
    const button = $("#compose-button");
    const output = $("#compose-output");
    const empty = $("#compose-empty");
    const result = $("#compose-result");
    const title = $("#compose-title");
    const label = $("#compose-label");
    const textEl = $("#compose-text");
    const matchesEl = $("#compose-matches");
    const count = $("#compose-count");
    const examples = [
      "我想让底部导航切换时有个背景块滑过去",
      "卡片删除时飞走，但别太夸张",
      "手机上滑到顶部继续拉，图片会放大",
      "后台菜单太多，想加搜索和拖动排序",
      "网页按钮点一下从点击位置扩散填充"
    ];
    const exampleRow = $("#need-examples");
    examples.forEach((example) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "example-chip";
      chip.textContent = example;
      chip.addEventListener("click", () => {
        input.value = example;
        count.textContent = input.value.length + " / 300";
        input.focus();
      });
      exampleRow.append(chip);
    });
    input.addEventListener("input", () => { count.textContent = input.value.length + " / 300"; });

    button.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) {
        announce("先写一句你的需求");
        input.focus();
        return;
      }
      const inferred = inferCategory(text);
      const matches = DATA.prompts
        .map((prompt) => ({ prompt, score: scorePrompt(prompt, text, inferred) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => item.prompt);
      const composed = buildComposed(text, matches);
      title.textContent = matches.length ? "已经补成可执行的样子。" : "还需要一点信息。";
      empty.hidden = true;
      result.hidden = false;
      label.textContent = matches.length ? `匹配到 ${matches.length} 个效果 · 生成结果` : "没有匹配到具体效果 · 通用骨架";
      textEl.textContent = composed;
      matchesEl.innerHTML = matches.map((prompt, index) => `
        <button type="button" class="compose-match" data-id="${prompt.id}">
          <b>0${index + 1}</b>
          <span>${escapeHtml(prompt.title)} · ${escapeHtml(prompt.summary)}</span>
        </button>`).join("");
      output.dataset.top = matches[0]?.id || "";
      announce(matches.length ? `已生成提示词，匹配到 ${matches.length} 个效果` : "已生成通用提示词骨架");
    });

    $("#compose-copy").addEventListener("click", () => copyText(textEl.textContent, "生成结果"));
    $("#compose-preview").addEventListener("click", () => {
      const id = output.dataset.top;
      if (!id) return;
      selectById(id);
      document.getElementById("playground").scrollIntoView({ behavior: reducedQuery.matches ? "auto" : "smooth" });
      announce("已在实验室中打开");
    });
    matchesEl.addEventListener("click", (event) => {
      const match = event.target.closest("[data-id]");
      if (!match) return;
      selectById(match.dataset.id);
      document.getElementById("playground").scrollIntoView({ behavior: reducedQuery.matches ? "auto" : "smooth" });
    });
  }

  function init() {
    countStats();
    setupTheme();
    renderFamilies();
    renderCoverage();
    setupLibrary();
    setupComposer();
    renderList();
    const initialId = (location.hash.match(/^#p\/(.+)$/) || [])[1];
    const initial = initialId && DATA.prompts.find((prompt) => prompt.id === decodeURIComponent(initialId));
    select(initial || DATA.prompts.find((prompt) => prompt.category === "web"), { force: true, updateHash: false });
    setupHash();
    announce(`提示词实验室已就绪，共 ${DATA.prompts.length} 条提示词`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

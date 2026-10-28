(() => {
  "use strict";

  const DATA = window.ATLAS_DATA;
  if (!DATA) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const status = $("#atlas-status");

  function announce(message) {
    if (!status) return;
    status.textContent = "";
    requestAnimationFrame(() => { status.textContent = message; });
  }

  function lcs(a, b) {
    const left = a.toLowerCase();
    const right = b.toLowerCase();
    let best = 0;
    let previous = new Array(right.length + 1).fill(0);
    for (let i = 1; i <= left.length; i += 1) {
      const current = new Array(right.length + 1).fill(0);
      for (let j = 1; j <= right.length; j += 1) {
        if (left[i - 1] === right[j - 1]) {
          current[j] = previous[j - 1] + 1;
          if (current[j] > best) best = current[j];
        }
      }
      previous = current;
    }
    return best;
  }

  /* ---------- theme ---------- */
  const themeButton = $("#theme-toggle");
  function readTheme() {
    try { return localStorage.getItem("atlas-theme"); } catch { return null; }
  }
  function inheritedTheme() {
    try {
      if (window.parent !== window) return window.parent.document.documentElement.dataset.theme;
    } catch { /* a cross-origin embed cannot be read */ }
    return null;
  }
  function setTheme(theme, persist = true) {
    const dark = theme === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.textContent = dark ? "浅色" : "深色";
    themeButton.setAttribute("aria-label", `切换为${dark ? "浅" : "深"}色主题`);
    if (persist) {
      try { localStorage.setItem("atlas-theme", dark ? "dark" : "light"); } catch { /* optional */ }
    }
  }
  setTheme(readTheme() || inheritedTheme() || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), false);
  themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    announce(`已切换为${next === "dark" ? "深" : "浅"}色主题`);
  });
  addEventListener("message", (event) => {
    if (event.origin !== location.origin) return;
    if (event.data?.type === "uiux-theme" && (event.data.theme === "dark" || event.data.theme === "light")) {
      setTheme(event.data.theme, false);
    }
  });

  /* ---------- 01 finesse-term ---------- */
  const termForm = $("#term-form");
  const termInput = $("#term-input");
  const termResult = $("#term-result");

  function bestTerm(query) {
    const q = query.trim();
    if (!q) return null;
    let winner = null;
    let winnerScore = 0;
    for (const term of DATA.terms) {
      let score = 0;
      if (q === term.title || q === term.id || q === term.en) score = 20;
      for (const trigger of term.triggers) {
        if (q.includes(trigger) || trigger.includes(q)) score = Math.max(score, 12 + trigger.length);
        const overlap = lcs(q, trigger);
        if (overlap >= 2) score = Math.max(score, overlap);
      }
      const titleOverlap = lcs(q, term.title);
      if (titleOverlap >= 2) score = Math.max(score, titleOverlap + 1);
      if (score > winnerScore) { winner = term; winnerScore = score; }
    }
    return winnerScore >= 3 ? winner : null;
  }

  function renderTerm(term) {
    const pairs = term.pairs.map((pair) => `<span>${pair}</span>`).join("");
    termResult.innerHTML = `
      <div class="term-card">
        <div class="term-top">
          <span class="term-surface">${term.surface} · ${term.layer}</span>
          <h4 class="term-title">${term.title}<small>${term.en}</small></h4>
        </div>
        <p class="term-plain">${term.plain}</p>
        <div class="term-say"><span>可以直接这样说</span><p>${term.say}</p></div>
        <div class="term-trap"><span>最常见的坑</span><p>${term.trap}</p></div>
        <div class="term-pairs"><b>成对出现：</b>${pairs}</div>
      </div>`;
    announce(`找到了：${term.title}。${term.plain}`);
  }

  function runTerm(query) {
    const term = bestTerm(query);
    if (!term) {
      termResult.innerHTML = `
        <p class="hint">没有命中。试试更具体的症状，例如「按钮被黑杠挡住」「弹窗底下还能滑」「点不准老是点错」。</p>`;
      announce("没有命中，请试试更具体的症状描述。");
      return;
    }
    renderTerm(term);
  }

  termForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runTerm(termInput.value);
  });
  $$("#term-chips button").forEach((button) => {
    button.addEventListener("click", () => {
      termInput.value = button.dataset.term;
      runTerm(button.dataset.term);
    });
  });

  /* ---------- 02 finesse-ui registers ---------- */
  const registers = {
    brand: {
      src: "../../screenshots/web-desktop.png",
      alt: "慢半拍展览官网的桌面首屏，超大中文标题、橙色丝带与展览插画",
      tag: "BRAND / DESKTOP",
      caption: "设计就是产品：先用一个明确的视觉引擎建立第一印象，再把阅读路线收进安静的版面。",
      spectacle: 8, density: 3,
      changes: [["构图", "巨幅标题、斜向丝带、错落截图"], ["字体", "中文粗体承担情绪，正文保持克制"], ["动效", "只给有意义的反馈，不做持续噪声"]]
    },
    product: {
      src: "../../screenshots/dashboard-desktop.png",
      alt: "专注数据工作台的桌面界面，趋势、任务与待办在同一视野里",
      tag: "PRODUCT / DESKTOP",
      caption: "设计服务产品：密度、层级和数据状态优先。仪表盘不是品牌页加几张图表，它有自己的语法。",
      spectacle: 3, density: 8,
      changes: [["构图", "KPI、趋势与任务同屏，信息先于装饰"], ["字体", "固定字阶与表格数字，保证扫读"], ["动效", "只保留状态反馈，不做背景运动"]]
    },
    h5: {
      src: "../../screenshots/app-mobile.png",
      alt: "一刻手机应用的 390px 界面，日期选择、每日事项与底部导航",
      tag: "H5 / 390PX",
      caption: "H5 是容器：先搭手机框、安全区和拇指层级，再在下面选择内容语法。它不是把桌面页压窄。",
      spectacle: 4, density: 6,
      changes: [["构图", "单列任务流、底部导航、安全区"], ["字体", "手持距离下的字阶与触控目标"], ["动效", "短、可中断，键盘与手势都要照顾"]]
    }
  };

  const registerTabs = $$("#station-register [role=tab]");
  const registerPanel = $("#register-panel");
  const registerImage = $("#register-image");
  const registerFrameTag = $("#register-frame-tag");
  const registerCaption = $("#register-caption");
  const registerChanges = $("#register-changes");

  function selectRegister(name, announceIt = true) {
    const data = registers[name];
    if (!data) return;
    registerTabs.forEach((tab) => {
      const selected = tab.dataset.register === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    registerPanel.dataset.register = name;
    registerPanel.setAttribute("aria-labelledby", `reg-${name}`);
    registerImage.src = data.src;
    registerImage.alt = data.alt;
    registerImage.width = name === "h5" ? 390 : 1440;
    registerImage.height = name === "h5" ? 844 : 1000;
    registerFrameTag.textContent = data.tag;
    registerCaption.textContent = data.caption;
    registerChanges.innerHTML = data.changes.map(([label, text]) => `<li><span>${label}</span>${text}</li>`).join("");
    $("#spectacle-meter").style.setProperty("--v", data.spectacle);
    $("#density-meter").style.setProperty("--v", data.density);
    $("#spectacle-value").textContent = data.spectacle;
    $("#density-value").textContent = data.density;
    if (announceIt) announce(`已切换到 ${name} register。${data.caption}`);
  }

  registerTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectRegister(tab.dataset.register));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % registerTabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + registerTabs.length) % registerTabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = registerTabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        registerTabs[next].focus();
        selectRegister(registerTabs[next].dataset.register);
      }
    });
  });
  selectRegister("brand", false);

  /* ---------- 03 ui-ux-pro-max search ---------- */
  const searchForm = $("#search-form");
  const searchInput = $("#search-input");
  const searchResults = $("#search-results");
  const searchNote = $("#search-note");
  const domainTabs = $$("#search-domains [role=tab]");
  let searchQuery = "";
  let searchDomain = "style";

  function filterEntries(entries, query, fields) {
    if (!query) return { entries: entries.slice(0, 3), exact: true };
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = entries
      .map((entry) => {
        const haystack = fields.map((field) => entry[field] || "").join(" ").toLowerCase();
        const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
        return { entry, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
    return { entries: scored.slice(0, 3).map((item) => item.entry), exact: scored.length > 0 };
  }

  function renderSearch(announceIt = true) {
    const query = searchQuery.trim();
    let entries;
    let exact = true;
    if (searchDomain === "style") {
      ({ entries, exact } = filterEntries(DATA.styles, query, ["name", "type", "keywords", "bestFor", "risk"]));
    } else if (searchDomain === "palette") {
      ({ entries, exact } = filterEntries(DATA.palettes, query, ["product", "note", "tags"]));
    } else {
      ({ entries, exact } = filterEntries(DATA.fonts, query, ["name", "category", "heading", "body", "mood", "bestFor", "tags"]));
    }

    const fallback = query && !exact;
    if (fallback) {
      const source = searchDomain === "style" ? DATA.styles : searchDomain === "palette" ? DATA.palettes : DATA.fonts;
      entries = source.slice(0, 3);
    }

    searchNote.textContent = query
      ? fallback
        ? `「${query}」没有精确命中，先显示相邻的 ${entries.length} 条。`
        : `「${query}」命中 ${entries.length} 条${searchDomain === "style" ? "风格" : searchDomain === "palette" ? "配色" : "字体"}资料。`
      : `显示 3 条资料节选。输入语境可按关键词收窄。`;

    if (searchDomain === "style") {
      searchResults.innerHTML = entries.map((entry) => `
        <article class="search-card">
          <h5>${entry.name}</h5>
          <p class="search-meta">${entry.type} · ${entry.colors}</p>
          <p><b>关键词</b> ${entry.keywords}</p>
          <p><b>适合</b> ${entry.bestFor}</p>
          <span class="risk">${entry.risk}</span>
        </article>`).join("");
    } else if (searchDomain === "palette") {
      searchResults.innerHTML = entries.map((entry) => `
        <article class="search-card">
          <h5>${entry.product}</h5>
          <div class="swatches" aria-hidden="true">
            <span style="background:${entry.primary}"></span>
            <span style="background:${entry.accent}"></span>
            <span style="background:${entry.bg}"></span>
            <span style="background:${entry.fg}"></span>
          </div>
          <p class="search-meta">Primary ${entry.primary} · Accent ${entry.accent} · BG ${entry.bg}</p>
          <p><b>语气</b> ${entry.note}</p>
        </article>`).join("");
    } else {
      searchResults.innerHTML = entries.map((entry) => {
        const serif = entry.category.includes("Serif");
        const mono = entry.category.includes("Mono");
        const headingStyle = serif ? "font-family:var(--serif)" : mono ? "font-family:var(--mono)" : "font-family:var(--sans)";
        return `
        <article class="search-card">
          <h5>${entry.name}</h5>
          <div class="font-pair"><strong style="${headingStyle}">${entry.heading}</strong><em>+ ${entry.body}</em></div>
          <p class="search-meta">${entry.category}</p>
          <p><b>情绪</b> ${entry.mood}</p>
          <p><b>适合</b> ${entry.bestFor}</p>
        </article>`;
      }).join("");
    }

    if (announceIt) announce(searchNote.textContent);
  }

  function selectDomain(name, announceIt = true) {
    searchDomain = name;
    domainTabs.forEach((tab) => {
      const selected = tab.dataset.domain === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    searchResults.setAttribute("aria-labelledby", `domain-${name}`);
    renderSearch(false);
    if (announceIt) announce(searchNote.textContent);
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchQuery = searchInput.value.trim();
    renderSearch();
  });
  $$("#search-chips button").forEach((button) => {
    button.addEventListener("click", () => {
      searchQuery = button.dataset.query;
      searchInput.value = searchQuery;
      renderSearch();
    });
  });
  domainTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectDomain(tab.dataset.domain));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % domainTabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + domainTabs.length) % domainTabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = domainTabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        domainTabs[next].focus();
        selectDomain(domainTabs[next].dataset.domain);
      }
    });
  });
  renderSearch(false);

  /* ---------- 04 design-taste-frontend ---------- */
  const cardsRoot = $("#direction-cards");
  const preview = $("#direction-preview");
  const dealButton = $("#deal-button");
  const dealCount = $("#deal-count");
  let dealt = [];
  let selectedDirection = null;

  function sameDirectionSet(a, b) {
    return a.length === b.length && a.every((item) => b.some((other) => other.id === item.id));
  }

  function dealDirections(announceIt = true) {
    let next = [];
    let attempts = 0;
    do {
      const pool = [...DATA.directions];
      next = [];
      while (next.length < 3 && pool.length) {
        const index = Math.floor(Math.random() * pool.length);
        next.push(pool.splice(index, 1)[0]);
      }
      attempts += 1;
    } while (dealt.length && sameDirectionSet(next, dealt) && attempts < 12);
    dealt = next;
    selectedDirection = next[0];
    dealCount.textContent = `${DATA.directions.length} 个方向中抽取 3 个`;
    renderDirections();
    renderDirectionPreview(selectedDirection);
    if (announceIt) announce(`抽到三个方向：${next.map((item) => item.zh).join("、")}。已预览第一个。`);
  }

  function renderDirections() {
    cardsRoot.innerHTML = dealt.map((direction) => `
      <button type="button" class="direction-card" data-direction="${direction.id}" aria-pressed="${direction.id === selectedDirection.id}">
        <h5>${direction.name}</h5>
        <span class="zh">${direction.zh} · ${direction.tones.join(" / ")}</span>
        <p>${direction.idea}</p>
        <span class="tags">${direction.type}</span>
        <span class="mini-swatches" aria-hidden="true">${direction.palette.map((color) => `<i style="background:${color}"></i>`).join("")}</span>
      </button>`).join("");
    $$(".direction-card", cardsRoot).forEach((button) => {
      button.addEventListener("click", () => {
        const direction = dealt.find((item) => item.id === button.dataset.direction);
        if (!direction) return;
        selectedDirection = direction;
        $$(".direction-card", cardsRoot).forEach((card) => card.setAttribute("aria-pressed", String(card === button)));
        renderDirectionPreview(direction);
        announce(`已选择方向：${direction.zh}。${direction.idea}`);
      });
    });
  }

  function renderDirectionPreview(direction) {
    if (!direction) return;
    preview.style.setProperty("--p0", direction.palette[0]);
    preview.style.setProperty("--p1", direction.palette[1]);
    preview.style.setProperty("--p2", direction.palette[2]);
    preview.style.setProperty("--p3", direction.palette[3]);
    preview.className = `direction-preview dp-${direction.layout}`;
    preview.dataset.direction = direction.id;

    let body = "";
    if (direction.layout === "monument") {
      body = `<div class="dp-word"><span>SPECTRUM</span><span>STUDIO</span></div><p class="dp-line">一个把名字做成建筑的工作室。其余内容退到边缘，让第一眼只记住一件事。</p>`;
    } else if (direction.layout === "chapters") {
      body = `<div class="chapter"><span>01 / 立场</span><strong>先让颜色<br>开口</strong></div><div class="chapter"><span>02 / 作品</span><strong>每一屏<br>换一次气</strong></div><div class="chapter"><span>03 / 联系</span><strong>留下来<br>继续看</strong></div>`;
    } else if (direction.layout === "place") {
      body = `<div class="dp-word">慢半拍<br>展览馆</div><p class="dp-line">一张真实的场地照片承担气氛，文字只做注解。先让人想进去，再告诉他在哪。</p><span class="dp-caption">VOL. 04 / 2026</span>`;
    } else if (direction.layout === "instrument") {
      body = `<div class="dp-word">SYSTEM / 08:42</div><div class="dp-bars" aria-hidden="true"><i style="height:38%"></i><i style="height:62%"></i><i style="height:48%"></i><i style="height:84%"></i><i style="height:56%"></i><i style="height:72%"></i><i style="height:94%"></i><i style="height:66%"></i></div><p class="dp-line">把真实界面放进首屏，用密度和精确感代替装饰。产品本身成为最有说服力的画面。</p>`;
    } else if (direction.layout === "quiet") {
      body = `<div class="dp-word">A quieter<br>instrument</div><p class="dp-line">像仪表盘一样克制：细线、等宽数字、一个行动色。所有注意力留给正在发生的事。</p><span class="dp-mark">◌</span>`;
    } else {
      body = `<div class="dp-word">MAKE<br><span>NOISE</span></div><p class="dp-line">高饱和平涂、超大粗字、没有渐变。像一张贴在城市里的海报：先被看见，再被读完。</p><span class="dp-block" aria-hidden="true"></span>`;
    }

    preview.innerHTML = `<span class="dp-label">DIRECTION PREVIEW / ${direction.zh}</span>${body}<span class="dp-note">方向预览 · 非最终页面</span>`;
  }

  dealButton.addEventListener("click", () => dealDirections());
  dealDirections(false);

  /* ---------- 05 interface-design ---------- */
  const craftToggle = $("#craft-toggle");
  const productPanel = $("#product-panel");
  const craftDecisions = $$("#craft-decisions li");
  let crafted = false;

  function setCrafted(next, announceIt = true) {
    crafted = next;
    productPanel.dataset.crafted = String(crafted);
    craftToggle.setAttribute("aria-pressed", String(crafted));
    craftToggle.textContent = crafted ? "显示：设计后" : "显示：默认生成";
    craftDecisions.forEach((item) => item.classList.toggle("on", crafted));
    if (announceIt) announce(crafted ? "已切换到设计后的输出：层级、间距、状态与焦点都有了明确决定。" : "已切换到默认生成：信息被平均摊平，状态和焦点都缺少层级。");
  }
  craftToggle.addEventListener("click", () => setCrafted(!crafted));
  setCrafted(false, false);

  /* ---------- 06 impeccable audit ---------- */
  const auditCard = $("#audit-form");
  const auditButton = $("#audit-button");
  const fixButton = $("#fix-button");
  const resetButton = $("#reset-button");
  const findingsRoot = $("#audit-findings");
  const auditSubmit = $("#audit-submit");
  const auditError = $("#audit-error");
  const auditSwitch = $("#audit-switch");
  const auditToggleLabel = $("#audit-toggle-label");

  const findings = [
    { id: "contrast", severity: "P1", title: "保存按钮文字对比度不足", fix: "把文字改为纸面色、背景改为墨色；对比度从约 2.6:1 提升到 12:1 以上。" },
    { id: "target", severity: "P2", title: "关闭按钮热区只有 24×24", fix: "热区扩大到 44×44；视觉图标仍保持轻量，不挤占版面。" },
    { id: "focus", severity: "P1", title: "开关缺少可见焦点", fix: "补回 :focus-visible 焦点环，键盘用户能看见当前位置。" },
    { id: "alert", severity: "P2", title: "错误提示没有被播报", fix: "标记为 role=alert，并让保存按钮通过 aria-describedby 关联提示。" }
  ];

  function renderFindings(fixed = false) {
    findingsRoot.innerHTML = findings.map((finding) => `
      <li data-fixed="${fixed}">
        <div class="finding-top">
          <span class="severity">${finding.severity}</span>
          <strong>${finding.title}</strong>
          ${fixed ? '<span class="finding-state">已修复 ✓</span>' : ""}
        </div>
        <p class="finding-fix">${finding.fix}</p>
      </li>`).join("");
  }

  function runAudit() {
    auditCard.dataset.fixed = "false";
    auditError.removeAttribute("role");
    auditSubmit.removeAttribute("aria-describedby");
    renderFindings(false);
    fixButton.disabled = false;
    resetButton.disabled = true;
    auditButton.textContent = "重新审查 ↻";
    announce("审查完成：4 项问题，其中 2 项高优先级。可以应用修复。");
  }

  function applyFixes() {
    auditCard.dataset.fixed = "true";
    auditError.setAttribute("role", "alert");
    auditSubmit.setAttribute("aria-describedby", "audit-error");
    renderFindings(true);
    fixButton.disabled = true;
    resetButton.disabled = false;
    announce("已修复 4 项：对比度、触控热区、可见焦点与错误播报。");
  }

  function resetAudit() {
    auditCard.dataset.fixed = "false";
    auditError.removeAttribute("role");
    auditSubmit.removeAttribute("aria-describedby");
    findingsRoot.innerHTML = '<li class="hint">审查结果会在这里逐条列出，并指向具体元素。</li>';
    fixButton.disabled = true;
    resetButton.disabled = true;
    auditButton.textContent = "运行审查 ↗";
    announce("已重置示例界面。");
  }

  auditButton.addEventListener("click", runAudit);
  fixButton.addEventListener("click", applyFixes);
  resetButton.addEventListener("click", resetAudit);
  auditSwitch.addEventListener("click", () => {
    const on = auditSwitch.getAttribute("aria-checked") === "true";
    auditSwitch.setAttribute("aria-checked", String(!on));
    auditToggleLabel.textContent = on ? "已关闭" : "已开启";
    announce(on ? "每周摘要已关闭。" : "每周摘要已开启。");
  });
  auditSubmit.addEventListener("click", () => announce("演示：保存操作不会提交，也不会联网。"));
  $("#audit-close").addEventListener("click", () => announce("演示：这是审查定位用的关闭按钮，不会隐藏卡片。"));

  /* ---------- eight-stage index ---------- */
  const skillGrid = $("#skill-grid");
  const filterButtons = $$(".filter");
  const indexCount = $("#index-count");

  function skillCard(skill, index) {
    const number = String(index + 1).padStart(2, "0");
    const sourceClass = skill.source === "upstream" ? "source upstream" : "source";
    const sourceLabel = skill.source === "upstream" ? "上游" : "本项目";
    const top = skill.source === "local" ? ' target="_top"' : "";
    const repo = skill.source === "local"
      ? `skills/${skill.id}/SKILL.md`
      : `skills/upstream/${skill.id}/SKILL.md`;
    return `
      <article class="skill-card" data-source="${skill.source}" data-stage="${skill.stage}">
        <div class="skill-top"><span class="num">${number}</span><span class="${sourceClass}">${sourceLabel} · ${skill.stage}</span></div>
        <h3>${skill.label}<small>${skill.id}</small></h3>
        <p class="effect">${skill.effect}</p>
        <p class="detail">${skill.detail}</p>
        <div class="skill-links">
          <a href="${skill.target}"${top}>${skill.targetLabel} ↗</a>
          <a href="https://github.com/harveyxiacn/uiux-intent-form-motion-lab/blob/main/${repo}" target="_blank" rel="noopener">源文件 ↗</a>
        </div>
      </article>`;
  }

  function applyFilter(next, announceIt = true) {
    filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === next)));
    let visible = 0;
    $$(".skill-card", skillGrid).forEach((card) => {
      const show = next === "all" || card.dataset.source === next;
      card.hidden = !show;
      if (show) visible += 1;
    });
    indexCount.textContent = `显示 ${visible} / ${DATA.skills.length}`;
    const label = next === "all" ? "全部" : next === "local" ? "本项目" : "上游";
    if (announceIt) announce(`已筛选${label} Skill：${visible} 个。`);
  }

  skillGrid.innerHTML = DATA.skills.map(skillCard).join("");
  filterButtons.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.filter)));
  applyFilter("all", false);

  // Stage links in the hero focus the matching cards without hiding the others.
  $$("[data-stage-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const stage = link.dataset.stageLink;
      const cards = $$(".skill-card", skillGrid);
      cards.forEach((card) => card.classList.toggle("stage-focus", card.dataset.stage === stage));
      announce(`已定位到${stage}阶段的 Skill。`);
      setTimeout(() => cards.forEach((card) => card.classList.remove("stage-focus")), 2400);
    });
  });
})();

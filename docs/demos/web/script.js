(() => {
  const filters = [...document.querySelectorAll('.filter')];
  const exhibits = [...document.querySelectorAll('.exhibit')];
  const collectButtons = [...document.querySelectorAll('.collect')];
  const tray = document.querySelector('#sticker-tray');
  const empty = document.querySelector('#empty');
  const selected = new Set();
  const status = document.querySelector('#collection-status');
  const storageKey = 'manbanpai-demo-stickers-v1';
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) saved.forEach(name => { if (collectButtons.some(button => button.dataset.sticker === name)) selected.add(name); }); } catch (_) { /* Storage is optional, including file URLs and private browsing. */ }
  filters.forEach(button => button.addEventListener('click', () => {
    const choice = button.dataset.filter;
    filters.forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', String(active)); });
    let count = 0;
    exhibits.forEach(exhibit => { const visible = choice === 'all' || exhibit.dataset.category === choice; exhibit.hidden = !visible; if (visible) count++; });
    document.querySelector('#filter-result').textContent = `找到 ${count} 场小冒险`;
  }));
  function render() {
    tray.querySelectorAll('.sticker').forEach(sticker => sticker.remove());
    empty.hidden = selected.size > 0;
    collectButtons.forEach(button => { const active = selected.has(button.dataset.sticker); button.setAttribute('aria-pressed', String(active)); button.innerHTML = `${active ? '已收集' : '收集贴纸'} <span aria-hidden="true">${active ? '−' : '＋'}</span>`; });
    selected.forEach(name => { const sticker = document.createElement('button'); sticker.type = 'button'; sticker.className = 'sticker'; sticker.textContent = name; sticker.setAttribute('aria-label', `移除${name}贴纸`); sticker.addEventListener('click', () => { selected.delete(name); update(`${name}已放回展厅`); const next = tray.querySelector('.sticker'); (next || document.querySelector('#reset')).focus(); }); tray.append(sticker); });
    document.querySelector('#count').textContent = `${selected.size} / 3`;
    try { localStorage.setItem(storageKey, JSON.stringify([...selected])); } catch (_) { /* Core interaction still works without persistence. */ }
  }
  function update(message) { render(); status.textContent = `${message}。已收集 ${selected.size} 枚贴纸。`; }
  collectButtons.forEach(button => button.addEventListener('click', () => { const name = button.dataset.sticker; const exists = selected.has(name); exists ? selected.delete(name) : selected.add(name); update(`${name}${exists ? '已放回展厅' : '已贴进游玩册'}`); }));
  document.querySelector('#reset').addEventListener('click', () => { selected.clear(); update('游玩册已清空'); });
  render();
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('reveal'); observer.unobserve(entry.target); } }), { threshold: .12 });
    document.querySelectorAll('.hero-copy > *, .section-top > *, .exhibit, .passport > div, .visit > *, footer > *').forEach((element, index) => { element.style.animationDelay = `${index % 3 * 70}ms`; observer.observe(element); });
  }
})();


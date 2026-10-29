const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const contrast = require('./contrast.cjs');
const base = process.env.DEMO_BASE || 'http://localhost:4173/docs/';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  try {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(base).origin });
  } catch (error) { /* clipboard may be unavailable in some builds */ }
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(base);
  await page.waitForSelector('.prompt-row');
  await page.evaluate(() => { try { localStorage.clear(); } catch (error) { /* optional */ } });
  await page.reload();
  await page.waitForSelector('.prompt-row');
  await page.evaluate(() => document.fonts && document.fonts.ready);

  assert.equal(await page.locator('#stat-prompts').innerText(), '148');
  assert.equal(await page.locator('#stat-scenes').innerText(), '22');
  assert.equal(await page.locator('#web-count').innerText(), '58');
  assert.equal(await page.locator('#app-count').innerText(), '90');
  assert.equal(await page.locator('#prompt-list .prompt-row').count(), 58);
  assert.equal(await page.locator('#prompt-count').innerText(), '58 条');

  const families = await page.locator('#family-list .family-chip').evaluateAll((nodes) => nodes.map((node) => node.textContent));
  assert.ok(families.length >= 8, 'family filters should be populated');
  assert.equal(families[0], '全部');

  // Every catalogue prompt must mount a real scene and render its detail.
  const coverage = [];
  for (const category of ['web', 'app']) {
    await page.locator(`.category-button[data-category="${category}"]`).click();
    const rows = page.locator('#prompt-list .prompt-row');
    const total = await rows.count();
    assert.equal(total, category === 'web' ? 58 : 90, category + ' prompt count');
    for (let index = 0; index < total; index += 1) {
      const row = rows.nth(index);
      const id = await row.getAttribute('data-id');
      const title = (await row.locator('strong').innerText()).trim();
      await row.click();
      const state = await page.evaluate(() => ({
        title: document.querySelector('#detail-title')?.textContent,
        prompt: document.querySelector('#detail-prompt')?.textContent || '',
        acceptance: document.querySelectorAll('#detail-accept li').length,
        scene: document.querySelectorAll('#stage .scene').length,
        fallback: document.querySelector('#stage .scene-note')?.textContent || '',
        stageTitle: document.querySelector('#stage-title')?.textContent,
        hash: location.hash
      }));
      assert.equal(state.title, title, id + ' detail title');
      assert.equal(state.stageTitle, title, id + ' stage title');
      assert.ok(state.prompt.length > 40, id + ' prompt text');
      assert.ok(state.acceptance >= 2, id + ' acceptance checks');
      assert.equal(state.scene, 1, id + ' scene mounted');
      assert.ok(!/场景加载失败|这个场景还没有加载/.test(state.fallback), id + ' scene fallback');
      assert.equal(state.hash, '#p/' + id, id + ' hash');
      coverage.push(id);
    }
  }
  assert.equal(new Set(coverage).size, 148, 'all prompt ids covered exactly once');

  // Search, family filtering and empty state.
  await page.locator('.category-button[data-category="web"]').click();
  await page.locator('#lab-search').fill('拖拽');
  const dragged = await page.locator('#prompt-list .prompt-row').count();
  assert.ok(dragged >= 1 && dragged < 58, 'search narrows results');
  await page.locator('#lab-search').fill('完全不存在的一个效果');
  assert.equal(await page.locator('#prompt-list .prompt-row').count(), 0);
  assert.equal(await page.locator('#library-empty').isVisible(), true);
  await page.locator('#lab-search').fill('');
  await page.locator('.family-chip').nth(1).click();
  assert.ok((await page.locator('#prompt-list .prompt-row').count()) > 0, 'family filter keeps prompts');
  await page.locator('.family-chip[data-family="all"]').click();

  // Deep link, reset and keyboard shortcut.
  await page.goto(base + '#p/app-nav-capsule');
  await page.waitForSelector('.prompt-row[data-id="app-nav-capsule"][aria-current="true"]');
  assert.match(await page.locator('#detail-title').innerText(), /胶囊/);
  await page.goto(base + '#p/app-card-delete');
  await page.waitForSelector('.prompt-row[data-id="app-card-delete"][aria-current="true"]');
  assert.equal(await page.locator('.category-button[data-category="app"]').getAttribute('aria-pressed'), 'true');
  await page.locator('#stage-reset').click();
  assert.ok((await page.locator('#stage .scene').count()) === 1, 'reset remounts scene');
  assert.ok((await page.locator('#stage').innerHTML()).length > 20, 'reset leaves scene content');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('/');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'lab-search');
  await page.locator('#lab-search').fill('');

  // Copy the selected prompt.
  await page.goto(base + '#p/app-card-delete');
  await page.waitForSelector('.prompt-row[data-id="app-card-delete"][aria-current="true"]');
  await page.locator('#detail-copy').click();
  await page.waitForFunction(() => document.querySelector('#lab-status')?.textContent.includes('已复制'));
  let copied = '';
  try { copied = await page.evaluate(() => navigator.clipboard.readText()); } catch (error) { /* permission optional */ }
  if (copied) assert.ok(copied.includes('卡片'), 'clipboard receives the prompt');

  // Natural-language composer: generate, copy, preview.
  await page.locator('#need-input').fill('我想让底部导航更精致，切换的时候有个背景块滑过去；还想让卡片删除时有个飞走的动画，别太夸张。');
  await page.locator('#compose-button').click();
  await page.waitForSelector('#compose-result:not([hidden])');
  assert.match(await page.locator('#compose-label').innerText(), /匹配到 \d 个效果/);
  assert.ok((await page.locator('#compose-matches .compose-match').count()) >= 1);
  const composed = await page.locator('#compose-text').innerText();
  assert.match(composed, /目标场景/);
  assert.match(composed, /核心效果/);
  assert.match(composed, /边界/);
  assert.match(composed, /验收/);
  await page.locator('#compose-copy').click();
  await page.waitForFunction(() => document.querySelector('#lab-status')?.textContent.includes('已复制'));
  const top = await page.locator('#compose-output').getAttribute('data-top');
  assert.ok(top, 'composer records a top match');
  await page.locator('#compose-preview').click();
  await page.waitForFunction((id) => location.hash === '#p/' + id, top);
  assert.equal(await page.locator('#detail-title').innerText(), await page.locator(`#compose-matches [data-id="${top}"] span`).evaluate((el) => el.textContent.split(' · ')[0]));

  // Empty need does not generate.
  await page.locator('#need-input').fill('');
  await page.locator('#compose-button').click();
  await page.waitForFunction(() => document.querySelector('#lab-status')?.textContent.includes('先写一句'));

  // Theme toggle remounts the current scene and persists.
  await page.goto(base + '#p/app-theme-tap');
  await page.waitForSelector('.prompt-row[data-id="app-theme-tap"][aria-current="true"]');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
  assert.equal(await page.locator('#theme-toggle').getAttribute('aria-pressed'), 'true');
  assert.ok((await page.locator('#stage .scene').count()) >= 1, 'dark theme keeps the scene');
  await page.reload();
  await page.waitForSelector('.prompt-row');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');

  const lightContrast = await contrast(page, ['.hero-lede', '.stage-caption', '.detail-summary', '.prompt-row small'], 'lab light');
  await page.locator('#theme-toggle').click();
  const darkContrast = await contrast(page, ['.hero-lede', '.stage-caption', '.detail-summary', '.prompt-row small'], 'lab dark');
  fs.writeFileSync('docs/screenshots/lab-contrast-results.json', JSON.stringify([lightContrast, darkContrast], null, 2));
  await page.locator('#theme-toggle').click();

  // Screenshots at stable desktop states.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base);
  await page.waitForSelector('.prompt-row');
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: 'docs/screenshots/lab-desktop.png', fullPage: false });

  await page.goto(base + '#p/app-nav-capsule');
  await page.waitForSelector('.prompt-row[data-id="app-nav-capsule"][aria-current="true"]');
  await page.waitForTimeout(500);
  await page.locator('.stage-column').screenshot({ path: 'docs/screenshots/lab-scene-app.png' });

  await page.goto(base + '#p/web-chart-curve');
  await page.waitForSelector('.prompt-row[data-id="web-chart-curve"][aria-current="true"]');
  await page.waitForTimeout(500);
  await page.locator('.stage-column').screenshot({ path: 'docs/screenshots/lab-scene-web.png' });

  await page.goto(base);
  await page.waitForSelector('.prompt-row');
  await page.locator('#need-input').fill('底部导航切换时背景块滑过去，卡片删除飞走');
  await page.locator('#compose-button').click();
  await page.waitForSelector('#compose-result:not([hidden])');
  await page.locator('#composer').screenshot({ path: 'docs/screenshots/lab-composer.png' });

  await page.locator('#theme-toggle').click();
  await page.goto(base);
  await page.waitForSelector('.prompt-row');
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); });
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'docs/screenshots/lab-dark.png', fullPage: false });
  await page.locator('#theme-toggle').click();

  // Mobile: no horizontal overflow, library and stage both usable.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.waitForSelector('.prompt-row');
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: 'docs/screenshots/lab-mobile.png', fullPage: false });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'lab mobile overflow');
  await page.locator('.category-button[data-category="app"]').click();
  assert.equal(await page.locator('#prompt-list .prompt-row').count(), 90);
  await page.goto(base + '#p/app-nav-capsule');
  await page.waitForSelector('.prompt-row[data-id="app-nav-capsule"][aria-current="true"]');
  await page.waitForTimeout(400);
  assert.ok((await page.locator('#stage .scene').count()) >= 1, 'mobile scene mounts');
  const stageHeight = await page.locator('#stage').evaluate((el) => el.getBoundingClientRect().height);
  assert.ok(stageHeight >= 600, 'mobile stage keeps enough height: ' + stageHeight);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'lab app mobile overflow');
  await page.locator('.stage-column').screenshot({ path: 'docs/screenshots/lab-mobile-app.png' });

  assert.deepEqual(errors, []);
  console.log('PASS: 148 prompts mount 22 real scenes (58 web / 90 app); search/family/empty states; deep links; reset; keyboard shortcut; copy; composer generate/copy/preview; theme persistence; contrast; desktop and 390px screenshots; no page errors');
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

/* Pipeline playground checks: every effect mounts a scene and builds a prompt; the 20 bridged effects
   (状态与回应 / 新拟态组件 / 看板菜单) respond to input, log to the feed, follow the reduce switch and feel,
   and fit the frames at 390px.
   Usage: DEMO_BASE=http://localhost:4173/docs/ node scripts/verify-pipeline.cjs   (SHOTS=<dir> optional) */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = (process.env.DEMO_BASE || 'http://localhost:4173/docs/') + 'pipeline/';
const shots = process.env.SHOTS || '';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  if (shots) fs.mkdirSync(shots, { recursive: true });

  await page.goto(base);
  await page.waitForSelector('#list button');
  assert.equal(await page.locator('#n-web').innerText(), '20');
  assert.equal(await page.locator('#n-app').innerText(), '23');
  const effects = await page.evaluate(() => window.PIPE.EFFECTS.map((e) => ({ id: e.id, cat: e.cat, title: e.title, scene: e.scene, fam: e.fam })));
  assert.equal(effects.length, 43);

  // Every effect: deep link mounts its scene, the prompt carries the contract.
  for (const e of effects) {
    await page.goto(base + '#' + e.id);
    await page.waitForFunction((t) => document.querySelector('#d-title')?.textContent === t, e.title);
    const st = await page.evaluate(() => ({
      text: document.querySelector('#stage .scene')?.textContent || '',
      kids: document.querySelector('#stage .scene')?.children.length || 0,
      prompt: document.querySelector('#d-prompt')?.textContent || ''
    }));
    assert.ok(st.kids > 0 && !/场景加载失败/.test(st.text), e.id + ' scene mounted');
    assert.match(st.prompt, /交互契约/, e.id + ' prompt contract');
    assert.ok(st.prompt.includes(e.title), e.id + ' prompt names the effect');
  }

  // Bridged effects: one real interaction each must change state and write to the feed.
  const act = {
    'a-plane': async (s) => s.locator('[data-send]').click(),
    'a-press': async (s) => { await s.locator('[data-card]').focus(); await page.keyboard.press('Enter'); },
    'a-accordion': async (s) => s.locator('.st-acc button').first().click(),
    'a-multi': async (s) => s.locator('[data-id="0"]').click(),
    'a-stepper': async (s) => s.locator('[data-plus]').click(),
    'a-flip': async (s) => s.locator('[data-flip]').click(),
    'a-chips': async (s) => s.locator('[data-tag="美食"]').click(),
    'a-steps': async (s) => s.locator('[data-next]').click(),
    'w-neu-light': async (s) => s.locator('[data-switch]').click(),
    'w-neu-thermo': async (s) => { await s.locator('[data-dial]').focus(); await page.keyboard.press('ArrowUp'); },
    'w-neu-player': async (s) => s.locator('[data-play]').click(),
    'w-neu-upload': async (s) => s.locator('[data-go]').click(),
    'w-neu-booking': async (s) => s.locator('[data-day="12"]').click(),
    'w-neu-qty': async (s) => s.locator('[data-plus]').click(),
    'w-menu-sidebar': async (s) => s.locator('[data-key="orders"]').click(),
    'w-menu-groups': async (s) => s.locator('[data-key="push"]').click(),
    'w-menu-capsule': async (s) => s.locator('[data-key="traffic"]').click(),
    'w-menu-rail': async (s) => s.locator('[data-key="files"]').click(),
    'w-menu-brand': async (s) => s.locator('[data-key="orders"]').click(),
    'w-menu-tabs': async (s) => s.locator('[data-key="corn"]').click()
  };
  const bridged = effects.filter((e) => act[e.id]);
  assert.equal(bridged.length, 20, 'all 20 new effects are in the catalogue');
  for (const feel of ['subtle', 'lively']) {
    for (const e of bridged) {
      await page.goto(base + '#' + e.id);
      await page.waitForFunction((t) => document.querySelector('#d-title')?.textContent === t, e.title);
      await page.locator(`[data-feel="${feel}"]`).click();
      const stage = page.locator('#stage');
      assert.equal(await stage.locator('.pl-bridge').count(), 1, e.id + ' uses the bridge');
      assert.equal(await stage.locator('.pl-bridge .scene-head').isVisible(), false, e.id + ' scene head hidden');
      const before = await page.locator('#feed li').count();
      await act[e.id](stage);
      await page.waitForTimeout(1100);
      assert.ok((await page.locator('#feed li').count()) > before, e.id + ' writes to the feed (' + feel + ')');
      if (shots && feel === 'lively') await page.locator('.stage-col').screenshot({ path: path.join(shots, 'pipe-' + e.id + '.png') });
    }
  }

  // Feel scales scripted motion: the press menu animation is longer on 活泼 than on 克制.
  const menuMs = async (feel) => {
    await page.goto(base + '#a-press');
    await page.waitForSelector('#stage [data-card]');
    await page.locator(`[data-feel="${feel}"]`).click();
    await page.locator('#reset').click(); // same hash twice does not remount, so start from a fresh scene
    await page.waitForSelector('#stage [data-card]');
    await page.locator('#stage [data-card]').focus(); await page.keyboard.press('Enter');
    return page.evaluate(() => Math.max(0, ...document.querySelector('#stage [data-menu]').getAnimations().map((a) => a.effect.getTiming().duration)));
  };
  const subtle = await menuMs('subtle'), lively = await menuMs('lively');
  assert.ok(lively > subtle, `feel scales duration (${subtle} → ${lively})`);

  // The page's reduce switch (not only the OS setting) removes scripted motion and keeps the state.
  await page.goto(base + '#a-press');
  await page.waitForSelector('#stage [data-card]');
  await page.locator('#reduce').check();
  await page.locator('#reset').click();
  await page.waitForSelector('#stage [data-card]');
  await page.locator('#stage [data-card]').focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#stage [data-menu]').isVisible(), true);
  assert.equal(await page.evaluate(() => document.querySelector('#stage [data-menu]').getAnimations().length), 0, 'no scripted animation when reduced');
  await page.goto(base + '#a-plane');
  await page.waitForSelector('#stage [data-send]');
  await page.locator('#stage [data-send]').click();
  assert.equal(await page.locator('#stage [data-send]').getAttribute('data-state'), 'sending', 'reduced keeps the sending state visible');
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('#stage [data-send]').getAttribute('data-state'), 'done');
  await page.locator('#reduce').uncheck();

  // Composer finds the new families from plain language.
  for (const [need, id] of [['新拟态风格的温控旋钮', 'w-neu-thermo'], ['长按卡片弹出快捷菜单', 'a-press'], ['Dashboard 顶部胶囊菜单', 'w-menu-capsule']]) {
    await page.locator('#need').fill(need);
    await page.locator('#go').click();
    await page.waitForFunction(() => !/在左边写下需求/.test(document.querySelector('#out').textContent));
    assert.ok((await page.locator('#matches').innerHTML()).includes(id), `composer matches ${id} for「${need}」`);
  }

  // 390px: no horizontal overflow, scenes fit their frames.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ['a-multi', 'a-steps', 'w-neu-booking', 'w-menu-sidebar', 'w-menu-tabs']) {
    await page.goto(base + '#' + id);
    await page.waitForSelector('#stage .pl-bridge');
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, id + ' page overflow at 390');
    if (shots) await page.locator('.stage-col').screenshot({ path: path.join(shots, 'pipe-' + id + '-390.png') });
  }

  assert.deepEqual(errors, []);
  console.log(`PASS: pipeline 43 effects (20 web / 23 app) mount and build prompts; 20 bridged effects × 2 feels respond and log; feel scaling; reduce switch; composer matches; 390px; no page errors`);
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });

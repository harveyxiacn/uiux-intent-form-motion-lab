/* Behaviour checks for the scene families 状态与回应 (stateLab), 新拟态组件 (neuLab) and 看板菜单 (menuLab).
   Usage: DEMO_BASE=http://localhost:4173/docs/ node scripts/verify-interactions.cjs
   Optional SHOTS=<dir> writes one stage screenshot per prompt (desktop) plus a 390px pass. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.DEMO_BASE || 'http://localhost:4173/docs/';
const shots = process.env.SHOTS || '';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  const results = [];
  if (shots) fs.mkdirSync(shots, { recursive: true });

  async function open(page, id) {
    await page.goto(base + '#p/' + id);
    await page.waitForSelector(`.prompt-row[data-id="${id}"][aria-current="true"]`);
    await page.waitForSelector('#stage .scene');
    return page.locator('#stage');
  }
  const status = (st) => st.locator('[data-status]').innerText();
  async function settle(page, ms) { await page.waitForTimeout(ms || 450); }

  for (const reduced of ['reduce', 'no-preference']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: reduced });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(reduced + ': ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(reduced + ': ' + m.text()); });
    const check = async (id, fn) => {
      const st = await open(page, id);
      await fn(st);
      if (shots && reduced === 'no-preference') await page.locator('.stage-column').screenshot({ path: path.join(shots, id + '.png') });
      results.push(reduced + ' ' + id);
    };

    /* ---- 状态与回应 ---- */
    await check('app-state-plane', async (st) => {
      const btn = st.locator('[data-send]');
      await btn.click();
      assert.equal(await btn.getAttribute('data-state'), 'sending');
      await btn.click(); // repeated tap while sending is ignored
      await settle(page, 1100);
      assert.equal(await btn.getAttribute('data-state'), 'done');
      assert.match(await btn.innerText(), /已分享/);
      await st.locator('[data-reset]').click();
      await st.locator('[data-fail]').check();
      await btn.click(); await settle(page, 1100);
      assert.equal(await btn.getAttribute('data-state'), 'error');
      assert.match(await status(st), /失败/);
    });
    await check('app-state-press', async (st) => {
      const card = st.locator('[data-card]');
      await card.click(); // a short tap does not open the menu
      assert.equal(await st.locator('[data-menu]').isHidden(), true);
      const box = await card.boundingBox();
      await page.mouse.move(box.x + 40, box.y + 30); await page.mouse.down(); await page.waitForTimeout(650); await page.mouse.up();
      assert.equal(await st.locator('[data-menu]').isVisible(), true);
      assert.equal(await card.getAttribute('aria-expanded'), 'true');
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('role')), 'menuitem');
      await st.locator('[data-act="置顶"]').click(); await settle(page);
      assert.equal(await st.locator('[data-menu]').isHidden(), true);
      assert.equal(await st.locator('[data-pin]').isVisible(), true);
      // keyboard path: Enter opens, Escape closes and returns focus
      await card.focus(); await page.keyboard.press('Enter');
      assert.equal(await st.locator('[data-menu]').isVisible(), true);
      await page.keyboard.press('ArrowDown'); await page.keyboard.press('Escape'); await settle(page);
      assert.equal(await st.locator('[data-menu]').isHidden(), true);
      assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-card')), true);
    });
    await check('app-state-accordion', async (st) => {
      const q = st.locator('.st-acc button');
      const after = st.locator('.st-after');
      const y0 = (await after.boundingBox()).y;
      await q.nth(0).click(); await settle(page);
      assert.equal(await q.nth(0).getAttribute('aria-expanded'), 'true');
      assert.ok((await after.boundingBox()).y > y0 + 10, 'content below moves down');
      await q.nth(2).click(); await settle(page);
      assert.equal(await q.nth(0).getAttribute('aria-expanded'), 'false');
      assert.equal(await q.nth(2).getAttribute('aria-expanded'), 'true');
      assert.equal(await st.locator('.st-acc-panel[inert]').count(), 3);
    });
    await check('app-state-multi', async (st) => {
      const bar = st.locator('[data-bar]');
      assert.equal(await bar.getAttribute('aria-hidden'), 'true');
      await st.locator('[data-id="0"]').click(); await st.locator('[data-id="2"]').click();
      assert.match(await st.locator('[data-count]').innerText(), /已选 2 项/);
      assert.equal(await bar.getAttribute('aria-hidden'), 'false');
      await st.locator('[data-all]').click(); await settle(page, 600);
      assert.equal(await st.locator('[role=checkbox][aria-checked=true]').count(), 6);
      await st.locator('[data-clear]').click(); await settle(page);
      assert.equal(await st.locator('[role=checkbox][aria-checked=true]').count(), 0);
      assert.equal(await bar.getAttribute('aria-hidden'), 'true');
      await st.locator('[data-id="1"]').click(); await st.locator('[data-delete]').click();
      assert.equal(await st.locator('[role=checkbox]').count(), 5);
      assert.match(await status(st), /已删除 1 项/);
    });
    await check('app-state-stepper', async (st) => {
      const minus = st.locator('[data-minus]'), plus = st.locator('[data-plus]');
      await minus.click(); await settle(page);
      assert.equal(await minus.isDisabled(), true, 'minus disabled at 0');
      assert.match(await st.locator('[data-total]').innerText(), /数量 0 · 合计 ¥0/);
      for (let i = 0; i < 5; i += 1) await plus.click();
      await settle(page);
      assert.equal(await st.locator('[data-num]').innerText(), '5');
      assert.equal(await st.locator('.st-roll span').count(), 1, 'old digits removed');
      assert.match(await st.locator('[data-total]').innerText(), /¥340/);
    });
    await check('app-state-flip', async (st) => {
      const card = st.locator('[data-flip]');
      await card.click(); await settle(page);
      assert.equal(await card.getAttribute('aria-pressed'), 'true');
      assert.equal(await st.locator('[data-back]').getAttribute('aria-hidden'), 'false');
      assert.equal(await st.locator('.st-face').first().evaluate((el) => getComputedStyle(el).backfaceVisibility), 'hidden');
      await card.focus(); await page.keyboard.press('Enter'); await settle(page);
      assert.equal(await card.getAttribute('aria-pressed'), 'false');
    });
    await check('app-state-chips', async (st) => {
      await st.locator('[data-tag="美食"]').click();
      await st.locator('[data-tag="住宿"]').click(); // rapid second click wins
      await settle(page, 700);
      assert.equal(await st.locator('[data-results] li').count(), 2);
      assert.match(await status(st), /住宿 · 2 个结果/);
      const bg = await st.locator('[data-bg]').boundingBox(), on = await st.locator('[data-tag="住宿"]').boundingBox();
      assert.ok(Math.abs(bg.x - on.x) < 3 && Math.abs(bg.width - on.width) < 3, 'highlight sits under the current chip');
      await st.locator('[data-q]').fill('不存在'); await settle(page, 700);
      assert.match(await st.locator('[data-results]').innerText(), /没有找到/);
    });
    await check('app-state-steps', async (st) => {
      const next = st.locator('[data-next]');
      await next.click();
      assert.equal(await next.isDisabled(), true, 'processing state blocks repeat');
      await settle(page, 800);
      assert.equal(await st.locator('[data-steps] li').nth(0).getAttribute('class'), 'done');
      assert.equal(await st.locator('[data-steps] li[aria-current=step]').getAttribute('data-i'), '1');
      assert.match(await st.locator('[data-desc]').innerText(), /选择座位/);
      await st.locator('[data-prev]').click(); await settle(page);
      assert.equal(await st.locator('[data-steps] li[aria-current=step]').getAttribute('data-i'), '0');
      for (let i = 0; i < 3; i += 1) { await next.click(); await settle(page, 800); }
      assert.match(await status(st), /全部完成/);
      assert.equal(await st.locator('[data-steps] li.done').count(), 4);
    });

    /* ---- 新拟态组件 ---- */
    await check('web-neu-light', async (st) => {
      const sw = st.locator('[data-switch]');
      await sw.click(); await settle(page, 700);
      assert.equal(await sw.getAttribute('aria-checked'), 'true');
      assert.equal(await st.locator('[data-state]').innerText(), 'On');
      await sw.focus(); await page.keyboard.press('Space'); await settle(page);
      assert.equal(await st.locator('[data-state]').innerText(), 'Off');
    });
    await check('web-neu-thermo', async (st) => {
      const dial = st.locator('[data-dial]');
      await dial.focus(); await page.keyboard.press('End');
      assert.equal(await dial.getAttribute('aria-valuenow'), '30');
      await page.keyboard.press('ArrowUp');
      assert.equal(await dial.getAttribute('aria-valuenow'), '30', 'clamped at 30');
      await page.keyboard.press('Home');
      assert.equal(await st.locator('[data-num]').innerText(), '16');
      const b = await dial.boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + 4); await page.mouse.down(); await page.mouse.up(); // top = midpoint
      assert.equal(await dial.getAttribute('aria-valuenow'), '23');
      await page.mouse.move(b.x + b.width / 2 + 2, b.y + b.height - 4); await page.mouse.down(); await page.mouse.up(); // dead zone
      const v = +(await dial.getAttribute('aria-valuenow'));
      assert.ok(v === 16 || v === 30, 'dead zone snaps to an end: ' + v);
    });
    await check('web-neu-player', async (st) => {
      const play = st.locator('[data-play]');
      const t0 = await st.locator('[data-pos]').innerText();
      await play.click(); await page.waitForTimeout(1300);
      assert.equal(await play.getAttribute('aria-label'), '暂停');
      assert.notEqual(await st.locator('[data-pos]').innerText(), t0, 'progress advances');
      assert.equal(await st.locator('[data-spec].live').count(), 1);
      await play.click(); await settle(page, 700);
      assert.equal(await play.getAttribute('aria-label'), '播放');
      assert.equal(await st.locator('[data-spec].live').count(), 0);
    });
    await check('web-neu-upload', async (st) => {
      const well = st.locator('[data-go]');
      await well.click(); await well.click({ force: true });
      await page.waitForFunction(() => document.querySelector('#stage [data-progress]').getAttribute('aria-valuenow') === '100', null, { timeout: 5000 });
      assert.match(await well.innerText(), /上传完成/);
      await page.waitForFunction(() => /可再次上传/.test(document.querySelector('#stage [data-status]').textContent), null, { timeout: 5000 });
      assert.equal(await st.locator('[data-progress]').getAttribute('aria-valuenow'), '0');
    });
    await check('web-neu-booking', async (st) => {
      assert.equal(await st.locator('[data-slots-wrap]').getAttribute('inert'), '');
      await st.locator('[data-day="11"]').click(); await settle(page, 700);
      assert.equal(await st.locator('[data-slot="11:00"]').isDisabled(), true, 'full slot disabled');
      await st.locator('[data-slot="14:00"]').click(); await settle(page, 700);
      assert.match(await st.locator('[data-result]').innerText(), /已预约 11 月 11 日 14:00/);
      await st.locator('[data-cancel]').click(); await settle(page, 700);
      assert.match(await status(st), /已取消/);
    });
    await check('web-neu-quantity', async (st) => {
      const minus = st.locator('[data-minus]'), plus = st.locator('[data-plus]');
      assert.equal(await minus.isDisabled(), true);
      for (let i = 0; i < 10; i += 1) { if (!(await plus.isDisabled())) await plus.click(); }
      assert.equal(await st.locator('[data-n]').innerText(), '9');
      assert.equal(await plus.isDisabled(), true);
      assert.equal(await st.locator('[data-sum]').innerText(), '¥351');
    });

    /* ---- 看板菜单 ---- */
    const menuCheck = async (id, first, other, contentRe) => {
      await check(id, async (st) => {
        assert.equal(await st.locator(`[data-key="${first}"]`).getAttribute('aria-current'), 'page');
        await st.locator(`[data-key="${other}"]`).click(); await settle(page, 500);
        assert.equal(await st.locator('[aria-current=page]').count(), 1, 'exactly one current item');
        assert.equal(await st.locator(`[data-key="${other}"]`).getAttribute('aria-current'), 'page');
        if (contentRe) assert.match(await st.locator('.mn-main').innerText(), contentRe);
      });
    };
    await menuCheck('web-menu-sidebar', 'overview', 'orders', /#20481/);
    {
      const st = page.locator('#stage');
      await st.locator('[data-back]').click(); await settle(page, 500);
      assert.equal(await st.locator('[data-key="overview"]').getAttribute('aria-current'), 'page', 'back to overview restores highlight');
      assert.equal(await st.locator('[data-back]').isHidden(), true);
    }
    await menuCheck('web-menu-groups', 'shows', 'discover', /本周推荐/);
    await menuCheck('web-menu-capsule', 'overview', 'retain', /次日/);
    {
      const st = page.locator('#stage');
      const pill = await st.locator('[data-pill]').boundingBox(), on = await st.locator('[data-key="retain"]').boundingBox();
      assert.ok(Math.abs(pill.x - on.x) < 3, 'capsule pill under current option');
    }
    await menuCheck('web-menu-rail', 'home', 'notice', /林舟/);
    await menuCheck('web-menu-brand', 'dash', 'alerts', /库存不足/);
    {
      const st = page.locator('#stage');
      const bg = await st.locator('[data-key="alerts"]').evaluate((el) => getComputedStyle(el).backgroundColor);
      assert.equal(bg, 'rgb(255, 106, 61)', 'brand colour on current item');
    }
    await menuCheck('web-menu-tabs', 'wheat', 'rice', /抽穗/);

    await context.close();
  }

  // Phone width: no horizontal overflow on the new scenes; sidebars collapse to icons.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const p = await phone.newPage();
  p.on('pageerror', (e) => errors.push('390: ' + e.message));
  const ids = ['app-state-chips', 'app-state-steps', 'web-neu-thermo', 'web-neu-booking', 'web-menu-sidebar', 'web-menu-groups', 'web-menu-capsule', 'web-menu-tabs', 'web-menu-brand'];
  for (const id of ids) {
    await open(p, id);
    await p.waitForTimeout(250);
    const over = await p.evaluate(() => {
      const stage = document.querySelector('#stage');
      return { doc: document.documentElement.scrollWidth > innerWidth, stage: stage.scrollWidth > stage.clientWidth + 1 };
    });
    assert.equal(over.doc, false, id + ' page overflow at 390');
    assert.equal(over.stage, false, id + ' stage overflow at 390');
    if (shots) await p.locator('.stage-column').screenshot({ path: path.join(shots, id + '-390.png') });
  }
  await phone.close();

  assert.deepEqual(errors, []);
  console.log(`PASS: ${results.length} scene checks (20 prompts × reduced / full motion) + ${ids.length} at 390px; no page errors`);
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });

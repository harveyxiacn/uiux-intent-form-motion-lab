const assert = require('node:assert/strict');
const fs = require('node:fs');
const contrast = require('./contrast.cjs');

module.exports = async (p, base) => {
  await p.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.goto(base + 'demos/skills/');
  await p.waitForSelector('.skill-card');
  await p.evaluate(() => { try { localStorage.removeItem('atlas-theme'); } catch { /* optional */ } });
  assert.equal(await p.title(), '技能地图 — 十五个 UI/UX Skill 的现场');

  const headingLines = async (selector) => {
    const box = await p.locator(selector).evaluate((el) => {
      const style = getComputedStyle(el);
      return { height: el.getBoundingClientRect().height, lineHeight: parseFloat(style.lineHeight) };
    });
    return box.height / box.lineHeight;
  };
  assert.ok((await headingLines('.hero h1')) < 2.3, 'hero heading should hold two lines');
  assert.ok((await headingLines('#stations-title')) < 2.3, 'station heading should hold two lines');

  const terms = [
    ['按钮被黑杠挡住了', '安全区'],
    ['鼠标放上去变个色', '悬停态'],
    ['弹窗底下还能滑', '滚动穿透'],
    ['图片加载完页面往下跳', '布局偏移'],
    ['点不准老是点错', '点击热区']
  ];
  for (const [query, expected] of terms) {
    await p.locator('#term-input').fill(query);
    await p.locator('#term-form button[type=submit]').click();
    assert.ok((await p.locator('.term-title').innerText()).includes(expected), `${query} should resolve to ${expected}`);
  }
  await p.locator('#term-input').fill('完全无关的一句话');
  await p.locator('#term-form button[type=submit]').click();
  assert.equal(await p.locator('.term-card').count(), 0);

  await p.locator('#reg-h5').click();
  assert.equal(await p.locator('#register-panel').getAttribute('data-register'), 'h5');
  assert.match(await p.locator('#register-image').getAttribute('src'), /app-mobile/);
  assert.equal(await p.locator('#spectacle-value').innerText(), '4');
  assert.equal(await p.locator('#density-value').innerText(), '6');
  assert.equal(await p.locator('#register-changes li').count(), 3);
  await p.locator('#reg-brand').focus();
  await p.keyboard.press('ArrowRight');
  assert.equal(await p.locator('#reg-product').getAttribute('aria-selected'), 'true');
  await p.keyboard.press('End');
  assert.equal(await p.locator('#reg-h5').getAttribute('aria-selected'), 'true');

  await p.locator('#search-input').fill('fintech dashboard');
  await p.locator('#search-form button[type=submit]').click();
  assert.match(await p.locator('#search-note').innerText(), /命中 3 条风格资料/);
  const styles = await p.locator('#search-results h5').allInnerTexts();
  assert.ok(styles.includes('Data-Dense Dashboard'), 'fintech dashboard should surface the data-dense style');
  await p.locator('#domain-palette').click();
  assert.equal(await p.locator('#search-results h5').first().innerText(), 'Fintech / Crypto');
  assert.equal(await p.locator('.swatches').first().locator('span').count(), 4);
  await p.locator('#domain-font').click();
  const fonts = await p.locator('#search-results h5').allInnerTexts();
  assert.ok(fonts.includes('Modern Professional') || fonts.includes('Tech Startup'), 'fintech should surface a professional or tech pairing');

  assert.equal(await p.locator('.direction-card').count(), 3);
  const firstDirection = await p.locator('.direction-card').first().getAttribute('data-direction');
  assert.equal(await p.locator('#direction-preview').getAttribute('data-direction'), firstDirection);
  const secondDirection = await p.locator('.direction-card').nth(1).getAttribute('data-direction');
  await p.locator('.direction-card').nth(1).click();
  assert.equal(await p.locator('#direction-preview').getAttribute('data-direction'), secondDirection);
  await p.locator('#deal-button').click();
  assert.equal(await p.locator('.direction-card').count(), 3);
  const beforeDeal = (await p.locator('.direction-card').evaluateAll((cards) => cards.map((card) => card.dataset.direction).sort())).join(',');
  await p.locator('#deal-button').click();
  const afterDeal = (await p.locator('.direction-card').evaluateAll((cards) => cards.map((card) => card.dataset.direction).sort())).join(',');
  assert.notEqual(afterDeal, beforeDeal, 're-deal should not repeat the same three directions');

  await p.locator('#craft-toggle').click();
  assert.equal(await p.locator('#product-panel').getAttribute('data-crafted'), 'true');
  assert.equal(await p.locator('#craft-decisions li.on').count(), 4);
  await p.locator('#craft-toggle').click();
  assert.equal(await p.locator('#product-panel').getAttribute('data-crafted'), 'false');

  await p.locator('#audit-button').click();
  assert.equal(await p.locator('#audit-findings li').count(), 4);
  assert.equal(await p.locator('#fix-button').isDisabled(), false);
  await p.locator('#fix-button').click();
  assert.equal(await p.locator('#audit-form').getAttribute('data-fixed'), 'true');
  assert.equal(await p.locator('#audit-error').getAttribute('role'), 'alert');
  assert.equal(await p.locator('#audit-submit').getAttribute('aria-describedby'), 'audit-error');
  assert.equal(await p.locator('#audit-findings li[data-fixed=true]').count(), 4);
  assert.equal(await p.locator('#reset-button').isDisabled(), false);
  await p.locator('#reset-button').click();
  assert.equal(await p.locator('#audit-form').getAttribute('data-fixed'), 'false');
  assert.equal(await p.locator('#audit-error').getAttribute('role'), null);

  assert.equal(await p.locator('.skill-card').count(), 15);
  assert.equal(await p.locator('#index-count').innerText(), '显示 15 / 15');
  await p.locator('[data-filter=local]').click();
  assert.equal(await p.locator('.skill-card:visible').count(), 9);
  await p.locator('[data-filter=upstream]').click();
  assert.equal(await p.locator('.skill-card:visible').count(), 6);
  await p.locator('[data-filter=all]').click();
  assert.equal(await p.locator('.skill-card:visible').count(), 15);
  assert.match(await p.locator('.skill-card').first().locator('.skill-links a').first().getAttribute('href'), /\.\.\/\.\.\/showcase\.html#/);

  await p.locator('[data-stage-link="验证"]').click();
  assert.equal(await p.locator('.skill-card.stage-focus').count(), 2);

  const before = await p.locator('html').getAttribute('data-theme');
  if (before !== 'light') await p.locator('#theme-toggle').click();
  const contrastSelectors = ['.lede', '.station-lede', '.search-card p', '.skill-card .effect', '.method-list p', '.site-footer p'];
  const contrastResults = [await contrast(p, contrastSelectors, 'atlas light')];
  await p.locator('#theme-toggle').click();
  assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
  contrastResults.push(await contrast(p, contrastSelectors, 'atlas dark'));
  fs.writeFileSync('docs/screenshots/atlas-contrast-results.json', JSON.stringify(contrastResults, null, 2));
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: 'docs/screenshots/skills-dark.png' });
  await p.locator('#theme-toggle').click();
  assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');

  await p.setViewportSize({ width: 390, height: 844 });
  await p.evaluate(() => scrollTo(0, 0));
  assert.ok((await headingLines('.hero h1')) < 2.3, 'mobile hero heading should hold two lines');
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'mobile horizontal overflow');
  assert.equal(await p.locator('#station-term').evaluate((el) => el.getBoundingClientRect().width > 0), true);
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: 'docs/screenshots/skills-fold.png' });
};

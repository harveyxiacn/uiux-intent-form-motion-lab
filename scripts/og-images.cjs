// Captures the 1200×630 social preview images referenced by og:image.
// Usage: DEMO_BASE=http://localhost:4173/docs/ node scripts/og-images.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.DEMO_BASE || 'http://localhost:4173/docs/';
const shots = [
  ['lab', ''],
  ['showcase', 'showcase.html'],
  ['pipeline', 'pipeline/'],
  ['walkthrough', 'pipeline/walkthrough.html'],
  ['skills', 'demos/skills/'],
];
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light' });
  for (const [name, path] of shots) {
    await page.goto(base + path);
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* optional */ } document.documentElement.dataset.theme = 'light'; });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `docs/og/${name}.png` });
    console.log('og', name);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

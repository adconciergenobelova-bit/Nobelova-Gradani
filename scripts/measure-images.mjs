// Measures image loading cost and health for the local site.
// Usage: node scripts/measure-images.mjs [label] [url]
import { chromium } from '@playwright/test';

const label = process.argv[2] || 'run';
const url = process.argv[3] || 'http://127.0.0.1:8099/index.html';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const imageResponses = [];
const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('response', async (res) => {
  const req = res.request();
  if (req.resourceType() !== 'image') return;
  let bytes = 0;
  try {
    const body = await res.body();
    bytes = body.length;
  } catch {
    bytes = Number(res.headers()['content-length'] || 0);
  }
  imageResponses.push({ url: res.url(), status: res.status(), bytes });
});

const start = Date.now();
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
const loadMs = Date.now() - start;

// Scroll through the page so lazily-loaded images are requested, then settle.
await page.evaluate(async () => {
  const h = document.body.scrollHeight;
  for (let y = 0; y < h; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {});
await page.waitForTimeout(1500);

const stats = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')];
  return {
    total: imgs.length,
    broken: imgs
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
    lazy: imgs.filter((i) => i.loading === 'lazy').length,
    pending: imgs.filter((i) => !i.complete).length,
  };
});

const totalBytes = imageResponses.reduce((s, r) => s + r.bytes, 0);
const byType = {};
for (const r of imageResponses) {
  const ext = r.url.split('?')[0].split('.').pop().toLowerCase();
  byType[ext] = (byType[ext] || 0) + r.bytes;
}

console.log(JSON.stringify({
  label,
  loadMs,
  imageRequests: imageResponses.length,
  totalImageKB: Math.round(totalBytes / 1024),
  byTypeKB: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, Math.round(v / 1024)])),
  stats,
  consoleErrors: consoleErrors.slice(0, 10),
  largest: imageResponses
    .slice()
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8)
    .map((r) => ({ kb: Math.round(r.bytes / 1024), url: r.url.replace(url.replace(/index\.html$/, ''), '') })),
}, null, 2));

await page.screenshot({ path: `screenshots/${label}-top.png` });
await browser.close();

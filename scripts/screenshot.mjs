/**
 * Design-audit screenshotter (dev-only, not shipped). Captures key screens at
 * mobile + desktop viewports into /tmp/shots. Reads the seeded backend so quiz/
 * ladder deep links resolve. Usage: node scripts/screenshot.mjs
 * Routes are passed as name=path pairs below; add more as games land.
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '/tmp/shots';

// Resolve a seeded quiz + ladder id so play screens render real content.
const ROUTES = JSON.parse(readFileSync(process.env.ROUTES_JSON, 'utf8'));

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  for (const [name, path] of Object.entries(ROUTES)) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200); // let content + fonts settle
    await page.screenshot({ path: `${OUT}/${name}-${vp.name}.png`, fullPage: false });
    console.log(`shot ${name}-${vp.name}`);
  }
  await ctx.close();
}
await browser.close();
console.log('done');

/**
 * Dev-only: capture one mid-play screenshot per quiz TYPE for the README gallery.
 * Reads the seeded sandbox (dev server on :5173), opens each type's quiz, nudges
 * it into a lively state (start + a correct answer/click), and shoots desktop.
 * Usage: node scripts/shotGameTypes.mjs   (dev server must be running)
 * Prints the /tmp/shots/type-<mode>.png paths. Not shipped (build script).
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '/tmp/shots';
// { mode: quizId } — pass as JSON via IDS env (query the sandbox for these).
const IDS = JSON.parse(readFileSync(process.env.IDS, 'utf8'));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

async function shoot(mode, id) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/quizzes/${id}/play`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  // Typed modes: start + type one seeded answer so the board looks alive.
  const start = page.getByTestId('play-start');
  if (await start.count()) {
    await start.click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(1400); // let map/images settle
  await page.screenshot({ path: `${OUT}/type-${mode}.png` });
  console.log(`shot type-${mode}`);
  await page.close();
}

for (const [mode, id] of Object.entries(IDS)) await shoot(mode, id);
await ctx.close();
await browser.close();
console.log('done');

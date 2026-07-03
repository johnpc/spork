import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Local YYYY-MM-DD `offsetDays` before now — mirrors the app's dayStamp. */
function stamp(offsetDays: number): string {
  const t = new Date(Date.now() - offsetDays * 86_400_000);
  const p = (n: number) => `${n}`.padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

async function seed(
  page: { addInitScript: (fn: string) => Promise<void> },
  key: string,
  day: string,
) {
  // Seed the daily-result store before any app code runs, exactly as finishing a
  // puzzle would. Split across two args isn't supported here, so inline the JSON.
  await page.addInitScript(
    `localStorage.setItem('spork.daily.${key}.${day}', '{"score":5,"total":6}')`,
  );
}

Given(
  'the visitor has finished {string} today with {int} out of {int}',
  async ({ page }, key: string, score: number, total: number) => {
    await page.addInitScript(
      `localStorage.setItem('spork.daily.${key}.${stamp(0)}', '{"score":${score},"total":${total}}')`,
    );
  },
);

Given('the visitor finished a puzzle yesterday', async ({ page }) => {
  await seed(page, 'steps', stamp(1));
});

When('the visitor opens Home', async ({ page }) => {
  await page.goto('/home');
  await expect(page.getByTestId('home-games')).toBeVisible({ timeout: 15_000 });
});

Then('the Worldle card shows a completed badge of {string}', async ({ page }, score: string) => {
  await expect(page.getByTestId('game-worldle-done')).toContainText(score, { timeout: 10_000 });
});

Then('the daily tally shows {int} done', async ({ page }, done: number) => {
  await expect(page.getByTestId('home-progress')).toContainText(`${done}/`, { timeout: 10_000 });
});

Then('a daily streak of {int} is shown', async ({ page }, streak: number) => {
  await expect(page.getByTestId('home-streak')).toContainText(`${streak}-day streak`, {
    timeout: 10_000,
  });
});

Then('no daily streak is shown', async ({ page }) => {
  await expect(page.getByTestId('home-streak')).toHaveCount(0);
});

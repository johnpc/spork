import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Local YYYY-MM-DD `offsetDays` before now — mirrors the app's dayStamp. */
function stamp(offsetDays: number): string {
  const t = new Date(Date.now() - offsetDays * 86_400_000);
  const p = (n: number) => `${n}`.padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

Given(
  'the visitor has finished {string} on the day before today with {int} out of {int}',
  async ({ page }, key: string, score: number, total: number) => {
    await page.addInitScript(
      `localStorage.setItem('spork.daily.${key}.${stamp(1)}', '{"score":${score},"total":${total}}')`,
    );
  },
);

// "When the visitor opens Home" is defined in homeProgress.steps.ts (shared).

When('the visitor steps the date switcher back one day', async ({ page }) => {
  await page.getByTestId('date-prev').click();
});

Then("the switcher shows yesterday's date", async ({ page }) => {
  await expect(page.getByTestId('date-label')).toHaveText(stamp(1), { timeout: 10_000 });
});

Then('the switcher shows {string}', async ({ page }, label: string) => {
  await expect(page.getByTestId('date-label')).toHaveText(label);
});

Then('the forward day arrow is disabled', async ({ page }) => {
  await expect(page.getByTestId('date-next')).toBeDisabled();
});

Then('the Wordle card shows a completed badge of {string}', async ({ page }, score: string) => {
  await expect(page.getByTestId('game-wordle-done')).toContainText(score, { timeout: 10_000 });
});

When('the visitor opens the Wordle permalink for the day before today', async ({ page }) => {
  await page.goto(`/daily/wordle/${stamp(1)}`);
});

Then('a Wordle board is shown', async ({ page }) => {
  await expect(page).toHaveURL(/\/wordle\/[^/]+$/, { timeout: 15_000 });
  await expect(page.getByTestId('wordle-board')).toBeVisible({ timeout: 15_000 });
});

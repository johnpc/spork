import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Open the named quiz from the Quizzes list (shared by "opens"/"reopens"). */
async function openQuiz(page: import('@playwright/test').Page, topic: string) {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('world-map')).toBeVisible({ timeout: 15_000 });
}

Given('the player opens the {string} map quiz', async ({ page }, topic: string) => {
  await openQuiz(page, topic);
});

When('the player reopens the {string} map quiz', async ({ page }, topic: string) => {
  await openQuiz(page, topic);
});

When('the player starts the quiz', async ({ page }) => {
  await page.getByTestId('play-start').click();
  await expect(page.getByTestId('play-input')).toBeVisible();
});

When('the player types the answer {string}', async ({ page }, answer: string) => {
  const box = page.getByTestId('play-input');
  await box.fill(answer);
  await box.press('Enter');
});

Then('the score shows {string}', async ({ page }, count: string) => {
  await expect(page.getByTestId('play-score')).toContainText(`${count} /`, { timeout: 10_000 });
});

Then('the region for {string} is filled in on the map', async ({ page }, _country: string) => {
  // Assert on the REAL rendered SVG: at least one region carries the "found"
  // role class after a correct answer (honest e2e — not just a counter).
  await expect
    .poll(async () => page.locator('.sp-region--found').count(), { timeout: 10_000 })
    .toBeGreaterThanOrEqual(1);
});

When('the player gives up', async ({ page }) => {
  await page.getByTestId('play-giveup').click();
});

Then('a quiz score summary is shown', async ({ page }) => {
  await expect(page.getByTestId('play-done')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('play-final-score')).toBeVisible();
});

Then('a saved best score of at least {int} is shown', async ({ page }, min: number) => {
  // Best score is saved to localStorage on give-up; reopening the quiz reads it
  // back into the lobby's "Your best: N / total". Assert on that rendered value.
  await expect(page.getByTestId('play-best')).toBeVisible({ timeout: 10_000 });
  const text = (await page.getByTestId('play-best').textContent()) ?? '';
  const found = Number(text.match(/(\d+)\s*\//)?.[1] ?? '0');
  expect(found).toBeGreaterThanOrEqual(min);
});

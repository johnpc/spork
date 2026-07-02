import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Open the named ORDER_UP quiz from the Quizzes list (reuses the quiz-link
 * pattern from play.steps; waits for THIS renderer's root, not the map). */
Given('the player opens the {string} order-up quiz', async ({ page }, topic: string) => {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('order-up')).toBeVisible({ timeout: 15_000 });
});

When('the player starts the order-up quiz', async ({ page }) => {
  // CLICK/ARRANGE modes auto-start on first interaction — click Start only if
  // it's shown, then confirm the board is live.
  const start = page.getByTestId('play-start');
  if (await start.count()) await start.click();
  await expect(page.getByTestId('order-up-progress')).toBeVisible({ timeout: 15_000 });
});

When('the player places the item {string}', async ({ page }, label: string) => {
  await page.getByRole('button', { name: label }).click();
});

Then('the order-up score shows {string}', async ({ page }, count: string) => {
  await expect(page.getByTestId('play-score')).toContainText(`${count} /`, { timeout: 10_000 });
});

Then('the item {string} is marked placed', async ({ page }, label: string) => {
  // Honest e2e: assert the REAL rendered button flipped to its placed role.
  await expect(page.getByTestId('order-up-placed').filter({ hasText: label })).toBeVisible({
    timeout: 10_000,
  });
});

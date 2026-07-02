import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Open the named CLASSIC quiz from the Quizzes list (reuses the openQuiz
 * navigation pattern from play.steps, asserting on the classic renderer). */
async function openClassicQuiz(page: import('@playwright/test').Page, topic: string) {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('classic-list')).toBeVisible({ timeout: 15_000 });
}

Given('the player opens the {string} classic quiz', async ({ page }, topic: string) => {
  await openClassicQuiz(page, topic);
});

When('the player starts the classic quiz', async ({ page }) => {
  await page.getByTestId('play-start').click();
  await expect(page.getByTestId('play-input')).toBeVisible();
});

When('the player types the classic answer {string}', async ({ page }, answer: string) => {
  const box = page.getByTestId('play-input');
  await box.fill(answer);
  await box.press('Enter');
});

Then('the classic score shows {string}', async ({ page }, count: string) => {
  await expect(page.getByTestId('play-score')).toContainText(`${count} /`, { timeout: 10_000 });
});

Then('the classic slot for {string} is revealed', async ({ page }, label: string) => {
  // Honest e2e: assert on the REAL rendered list — a found slot carries the
  // found role class AND shows the answer's display label.
  const slot = page.getByTestId('classic-found').filter({ hasText: label });
  await expect(slot).toBeVisible({ timeout: 10_000 });
  await expect(slot).toHaveClass(/classic-slot--found/);
});

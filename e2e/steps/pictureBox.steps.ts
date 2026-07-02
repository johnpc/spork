import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Open the named quiz from the Quizzes list and wait for the picture grid. */
async function openPictureQuiz(page: import('@playwright/test').Page, topic: string) {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('picture-box')).toBeVisible({ timeout: 15_000 });
}

Given('the player opens the {string} picture-box quiz', async ({ page }, topic: string) => {
  await openPictureQuiz(page, topic);
});

When('the player starts the picture-box quiz', async ({ page }) => {
  await page.getByTestId('play-start').click();
  await expect(page.getByTestId('play-input')).toBeVisible();
});

When('the player names the picture {string}', async ({ page }, answer: string) => {
  const box = page.getByTestId('play-input');
  await box.fill(answer);
  await box.press('Enter');
});

Then('the picture-box score shows {string}', async ({ page }, count: string) => {
  await expect(page.getByTestId('play-score')).toContainText(`${count} /`, { timeout: 10_000 });
});

Then('the picture labelled {string} is revealed', async ({ page }, label: string) => {
  // Assert on the REAL rendered grid: the found tile shows its actual label
  // (honest e2e — not just a counter).
  await expect(page.getByTestId('picture-box-found').filter({ hasText: label })).toBeVisible({
    timeout: 10_000,
  });
});

When('the player gives up on the picture-box quiz', async ({ page }) => {
  await page.getByTestId('play-giveup').click();
});

Then('a picture-box score summary is shown', async ({ page }) => {
  await expect(page.getByTestId('play-done')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('play-final-score')).toBeVisible();
});

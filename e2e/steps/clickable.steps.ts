import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Open the named quiz from the Quizzes list and wait for the clickable map to
 * render (the CLICKABLE analogue of the map's openQuiz). Click modes auto-start,
 * so the give-up control is present immediately — no Start button. */
async function openClickable(page: import('@playwright/test').Page, topic: string) {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('clickable-grid')).toBeVisible({ timeout: 15_000 });
}

Given('the player opens the {string} clickable quiz', async ({ page }, topic: string) => {
  await openClickable(page, topic);
});

When('the player clicks the region {string}', async ({ page }, regionId: string) => {
  await page.locator(`[data-region="${regionId}"]`).click({ force: true });
});

Then('the region {string} is marked found', async ({ page }, regionId: string) => {
  // Honest e2e: assert on the REAL rendered map — the clicked region now carries
  // the "found" role (data-testid flips to clickable-found), not just a counter.
  await expect(page.locator(`[data-region="${regionId}"]`)).toHaveAttribute(
    'data-testid',
    'clickable-found',
    { timeout: 10_000 },
  );
});

When('the player gives up on the clickable quiz', async ({ page }) => {
  await page.getByTestId('play-giveup').click();
});

Then('a clickable score summary is shown', async ({ page }) => {
  await expect(page.getByTestId('play-done')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('play-final-score')).toBeVisible();
});

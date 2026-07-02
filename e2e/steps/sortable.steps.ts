import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import type { Page } from '@playwright/test';

const { Given, When, Then } = createBdd();

/** Open the named SORTABLE quiz from the Quizzes list (guest, no sign-in). */
async function openSortable(page: Page, topic: string) {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('sortable')).toBeVisible({ timeout: 15_000 });
}

Given('the player opens the {string} sortable quiz', async ({ page }, topic: string) => {
  await openSortable(page, topic);
});

When('the player starts the sortable quiz', async ({ page }) => {
  // Sortable is a click mode — it auto-starts on the first interaction, so
  // there's no Start button; just confirm the board is present.
  await expect(page.getByTestId('sortable-buckets')).toBeVisible();
});

When('the player selects the item {string}', async ({ page }, item: string) => {
  await page.getByTestId('sortable-item').filter({ hasText: item }).click();
});

When('the player drops it into the {string} bucket', async ({ page }, bucket: string) => {
  await page.getByTestId('sortable-bucket').filter({ hasText: bucket }).click();
});

Then('the sortable score shows {string}', async ({ page }, count: string) => {
  await expect(page.getByTestId('play-score')).toContainText(`${count} /`, { timeout: 10_000 });
});

Then('the item {string} is no longer in the unsorted list', async ({ page }, item: string) => {
  // Honest e2e: the sorted item leaves the RENDERED unsorted list on a correct drop.
  await expect(page.getByTestId('sortable-item').filter({ hasText: item })).toHaveCount(0, {
    timeout: 10_000,
  });
});

Then('the item {string} is still in the unsorted list', async ({ page }, item: string) => {
  await expect(page.getByTestId('sortable-item').filter({ hasText: item })).toHaveCount(1);
});

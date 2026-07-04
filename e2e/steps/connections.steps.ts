import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the player opens a Connections puzzle', async ({ page }) => {
  await page.goto('/connections');
  // Lists are newest-first by puzzleDate; the first SEED puzzle (the fruit/water/
  // metals/suits one) is the oldest, so it's last — that's what these assume.
  await page.getByTestId('connections-link').last().click();
  await expect(page.getByTestId('connections')).toBeVisible({ timeout: 15_000 });
});

When(
  'the player selects the words {string}, {string}, {string}, {string}',
  async ({ page }, w1: string, w2: string, w3: string, w4: string) => {
    for (const word of [w1, w2, w3, w4]) {
      await page.getByTestId('connections-tile').filter({ hasText: word }).click();
    }
  },
);

When('the player submits the selection', async ({ page }) => {
  await page.getByTestId('connections-submit').click();
});

Then('a solved group is shown with the theme {string}', async ({ page }, theme: string) => {
  await expect(page.getByTestId('connections-solved').filter({ hasText: theme })).toBeVisible({
    timeout: 10_000,
  });
});

Then('the mistakes count increases', async ({ page }) => {
  await expect(page.getByText(/Mistakes: [1-9]/)).toBeVisible({ timeout: 10_000 });
});

Then('no solved group is shown', async ({ page }) => {
  await expect(page.getByTestId('connections-solved')).toHaveCount(0);
});

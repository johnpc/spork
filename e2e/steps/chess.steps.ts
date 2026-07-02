import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the player opens the {string} puzzle', async ({ page }, name: string) => {
  await page.goto('/chess');
  await page
    .getByTestId('chess-link')
    .filter({ hasText: new RegExp(name) })
    .click();
  await expect(page.getByTestId('chess')).toBeVisible({ timeout: 15_000 });
});

When('the player taps square {string}', async ({ page }, sq: string) => {
  await page.getByTestId(`sq-${sq}`).click();
});

Then('the piece on square {string} is shown', async ({ page }, sq: string) => {
  await expect(page.getByTestId(`piece-${sq}`)).toBeVisible({ timeout: 10_000 });
});

Then('the puzzle is solved', async ({ page }) => {
  await expect(page.getByTestId('chess-solved')).toBeVisible({ timeout: 10_000 });
});

Then('a try-again message is shown', async ({ page }) => {
  await expect(page.getByTestId('chess-error')).toBeVisible({ timeout: 10_000 });
});

Then('the puzzle is not solved', async ({ page }) => {
  await expect(page.getByTestId('chess-solved')).toHaveCount(0);
});

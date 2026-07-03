import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('the visitor opens an unknown URL', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
});

Then('the not-found screen is shown', async ({ page }) => {
  await expect(page.getByTestId('not-found')).toBeVisible({ timeout: 15_000 });
});

Then('it offers a link back to the games', async ({ page }) => {
  await expect(page.getByTestId('not-found-home')).toHaveAttribute('href', '/home');
});

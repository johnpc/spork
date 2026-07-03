import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Then } = createBdd();

Given('a visitor opens the {string} daily game', async ({ page }, slug: string) => {
  // The /daily/:game route resolves today's puzzle of that type and redirects
  // into its play surface — same entry point the Home card uses.
  await page.goto(`/daily/${slug}`);
});

Then('the world map is shown', async ({ page }) => {
  await expect(page).toHaveURL(/\/quizzes\/[^/]+\/play$/, { timeout: 15_000 });
  await expect(page.getByTestId('clickable-grid').or(page.getByTestId('world-map'))).toBeVisible({
    timeout: 15_000,
  });
});

Then('the order-up board is shown', async ({ page }) => {
  await expect(page).toHaveURL(/\/quizzes\/[^/]+\/play$/, { timeout: 15_000 });
  await expect(page.getByTestId('order-up')).toBeVisible({ timeout: 15_000 });
});

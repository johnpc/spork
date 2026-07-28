import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Then } = createBdd();

Given('a visitor opens the {string} daily game', async ({ page }, slug: string) => {
  // The /daily/:game route resolves today's puzzle of that type and redirects
  // into its play surface — same entry point the Home card uses.
  await page.goto(`/daily/${slug}`);
});

// Force the puzzle-list fetch (AppSync GraphQL) to fail before opening the game,
// to exercise the daily-entry error/retry state — not a silent "Loading…" hang.
Given(
  'a visitor opens the {string} daily game with a failing network',
  async ({ page }, slug: string) => {
    await page.route('**/graphql', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"errors":[{"message":"boom"}]}',
      }),
    );
    await page.goto(`/daily/${slug}`);
  },
);

Then('a retry prompt is shown, not an endless spinner', async ({ page }) => {
  await expect(page.getByTestId('daily-load-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('daily-loading')).toHaveCount(0);
  await expect(page.getByTestId('daily-load-retry')).toBeVisible();
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

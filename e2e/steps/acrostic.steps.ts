import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the player opens the {string} acrostic', async ({ page }, title: string) => {
  await page.goto('/acrostic');
  await page
    .getByTestId('acrostic-link')
    .filter({ hasText: new RegExp(title) })
    .click();
  await expect(page.getByTestId('acrostic')).toBeVisible({ timeout: 15_000 });
});

When(
  'the player answers clue {int} with {string}',
  async ({ page }, index: number, answer: string) => {
    const box = page.getByTestId(`clue-input-${index}`);
    await box.fill(answer);
    await box.press('Enter');
  },
);

Then('the acrostic progress is {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('acrostic-progress')).toHaveText(text, { timeout: 10_000 });
});

Then('the acrostic is solved', async ({ page }) => {
  await expect(page.getByTestId('acrostic-solved')).toBeVisible({ timeout: 10_000 });
});

Then('the acrostic is not solved', async ({ page }) => {
  await expect(page.getByTestId('acrostic-solved')).toHaveCount(0);
});

Then('the acrostic quote is attributed to {string}', async ({ page }, author: string) => {
  await expect(page.getByTestId('quote-author')).toContainText(author, { timeout: 10_000 });
});

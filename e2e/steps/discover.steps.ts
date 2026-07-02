import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('a visitor opens the app at the root', async ({ page }) => {
  await page.goto('/');
});

Then('they are taken to the games home', async ({ page }) => {
  await expect(page).toHaveURL(/\/home$/);
});

Given('a visitor opens Discover', async ({ page }) => {
  await page.goto('/discover');
  await expect(page).toHaveURL(/\/discover$/);
});

Then('a category section {string} is visible', async ({ page }, title: string) => {
  // Assert on a REAL seeded category rendered as a section header — the guest
  // read of the Category rows.
  await expect(page.getByRole('button', { name: title })).toBeVisible();
});

When('they expand the {string} section', async ({ page }, title: string) => {
  const header = page.getByRole('button', { name: title });
  // Expand only if collapsed (the first section starts open).
  if ((await header.getAttribute('aria-expanded')) === 'false') await header.click();
});

Then('a deck titled {string} is visible', async ({ page }, topic: string) => {
  // Real seeded deck previewed inline — the guest deck read via the categorySlug GSI.
  await expect(page.getByTestId('deck-card').filter({ hasText: new RegExp(topic) })).toBeVisible({
    timeout: 15_000,
  });
});

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

Given('a visitor opens Discover with a failing network', async ({ page }) => {
  await page.route('**/graphql', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: '{"errors":[{"message":"boom"}]}',
    }),
  );
  await page.goto('/discover');
  await expect(page).toHaveURL(/\/discover$/);
});

Then('Discover shows a retry, not a blank list', async ({ page }) => {
  await expect(page.getByTestId('load-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('load-retry')).toBeVisible();
});

Given('a visitor opens Discover with deck reads failing', async ({ page }) => {
  // Fail ONLY the per-category deck query (listDeckByCategorySlug) so the shelves
  // still load from the real backend — proves the section's own error path.
  await page.route('**/graphql', async (route) => {
    const body = route.request().postData() ?? '';
    if (body.includes('listDeckByCategorySlug')) {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"errors":[{"message":"boom"}]}',
      });
    }
    return route.continue();
  });
  await page.goto('/discover');
  await expect(page).toHaveURL(/\/discover$/);
});

Then('the section shows a retry, not a "no decks" message', async ({ page }) => {
  await expect(page.getByTestId('load-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('load-retry')).toBeVisible();
  await expect(page.getByTestId('load-empty')).toHaveCount(0);
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

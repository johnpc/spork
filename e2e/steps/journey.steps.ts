import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;

// A unique deck name per run so repeats/retries never collide on the shared
// sandbox. Captured at creation, reused across later steps + assertions.
let deckName = '';
let deckUrl = '';

Given('the journey editor signs in', async ({ page }) => {
  if (!USERNAME || !PASSWORD) test.skip(true, 'TEST_USERNAME / TEST_PASSWORD not set');
  await page.goto('/signin');
  await page.locator('input[type="email"]').fill(USERNAME as string);
  await page.locator('input[type="password"]').fill(PASSWORD as string);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForFunction(
    () =>
      Object.keys(window.localStorage).some(
        (k) => k.includes('CognitoIdentityServiceProvider') && k.endsWith('.accessToken'),
      ),
    undefined,
    { timeout: 15_000 },
  );
});

When('the editor creates and fills a deck in {string}', async ({ page }, categorySlug: string) => {
  deckName = `E2E Journey ${Date.now()}`;
  await page.goto('/admin/decks');
  await expect(page.getByTestId('new-deck-form')).toBeVisible({ timeout: 15_000 });
  const form = page.getByTestId('new-deck-form');
  await form.getByLabel('New deck topic').fill(deckName);
  await form.getByLabel('Category').selectOption(categorySlug);
  await page.getByRole('button', { name: 'Create' }).click();
  const row = page.getByTestId('admin-deck').filter({ hasText: deckName });
  await expect(row).toBeVisible({ timeout: 15_000 });
  // Open the editor and add a card so the deck is studyable.
  await row.getByRole('link', { name: deckName }).click();
  await expect(page.getByTestId('add-card-form')).toBeVisible({ timeout: 15_000 });
  await page.getByLabel('New card front').fill('Hola');
  await page.getByLabel('New card back').fill('Hello');
  await page.getByRole('button', { name: 'Add card' }).click();
  await expect(page.getByTestId('card-edit')).toHaveCount(1, { timeout: 15_000 });
});

When('the editor publishes that deck', async ({ page }) => {
  await page.goto('/admin/decks');
  const row = page.getByTestId('admin-deck').filter({ hasText: deckName });
  await row.getByRole('button', { name: 'Publish' }).click();
  await expect(row.getByTestId('deck-status')).toHaveText('PUBLISHED', { timeout: 15_000 });
});

Then('the deck appears in the {string} section on Discover', async ({ page }, title: string) => {
  // The gap-catcher: a published deck MUST surface in Discover under its
  // category section (not just exist in the DB).
  await page.goto('/discover');
  const header = page.getByRole('button', { name: title });
  await expect(header).toBeVisible({ timeout: 15_000 });
  if ((await header.getAttribute('aria-expanded')) === 'false') await header.click();
  const card = page.getByTestId('deck-card').filter({ hasText: deckName });
  await expect(card).toBeVisible({ timeout: 15_000 });
  deckUrl = (await card.getAttribute('href')) ?? '';
  expect(deckUrl).toMatch(/\/decks\//);
});

When('the learner opens that deck and studies it', async ({ page }) => {
  await page.goto(deckUrl);
  await expect(page.getByTestId('deck-title')).toContainText(deckName, { timeout: 15_000 });
  await page.getByTestId('study-link').click();
});

Then('the learner can reveal and grade a card', async ({ page }) => {
  // Multiple choice: pick an option, then advance.
  await page.getByTestId('study-opt').first().click();
  await expect(page.getByTestId('study-after')).toBeVisible({ timeout: 15_000 });
  await page.getByTestId('study-next').click();
  // After grading, either the next card or the all-caught-up state shows.
  await expect
    .poll(
      async () =>
        (await page.getByTestId('study-done').isVisible()) ||
        (await page.getByTestId('study-card').isVisible()),
      { timeout: 15_000 },
    )
    .toBe(true);
});

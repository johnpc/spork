import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;

// The deck name a scenario creates, made unique per run so repeated runs and
// Playwright retries never collide on the shared sandbox (the seed clears decks
// each CI cycle, but a within-run retry would otherwise leave a duplicate row).
// Steps after creation resolve the literal feature name to this actual name.
const actualName = new Map<string, string>();
const resolve = (name: string) => actualName.get(name) ?? name;

Given('the editor signs in', async ({ page }) => {
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

const deckRow = (page: import('@playwright/test').Page, topic: string) =>
  page.getByTestId('admin-deck').filter({ hasText: new RegExp(topic) });

When('the editor opens deck management', async ({ page }) => {
  await page.goto('/admin/decks');
  await expect(page.getByTestId('new-deck-form')).toBeVisible({ timeout: 15_000 });
});

When('the editor creates a deck named {string}', async ({ page }, topic: string) => {
  const unique = `${topic} ${Date.now()}`;
  actualName.set(topic, unique);
  await page.getByLabel('New deck topic').fill(unique);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(deckRow(page, unique)).toBeVisible({ timeout: 15_000 });
});

When('the editor opens the deck {string}', async ({ page }, topic: string) => {
  const name = resolve(topic);
  await deckRow(page, name)
    .getByRole('link', { name: new RegExp(name) })
    .click();
  await expect(page.getByTestId('add-card-form')).toBeVisible({ timeout: 15_000 });
});

When(
  'the editor adds a card with front {string} and back {string}',
  async ({ page }, front: string, back: string) => {
    await page.getByLabel('New card front').fill(front);
    await page.getByLabel('New card back').fill(back);
    await page.getByRole('button', { name: 'Add card' }).click();
  },
);

Then('the deck editor lists {int} card', async ({ page }, count: number) => {
  await expect(page.getByTestId('card-edit')).toHaveCount(count, { timeout: 15_000 });
});

When('the editor publishes the deck {string}', async ({ page }, topic: string) => {
  await page.goto('/admin/decks');
  await deckRow(page, resolve(topic)).getByRole('button', { name: 'Publish' }).click();
});

Then('the deck {string} shows status {string}', async ({ page }, topic: string, status: string) => {
  await expect(deckRow(page, resolve(topic)).getByTestId('deck-status')).toHaveText(status, {
    timeout: 15_000,
  });
});

Then('the AI generate-deck form is available', async ({ page }) => {
  await expect(page.getByTestId('generate-form')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Generate with AI' })).toBeVisible();
});

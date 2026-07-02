import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;

Given('the test user signs in', async ({ page }) => {
  if (!USERNAME || !PASSWORD) test.skip(true, 'TEST_USERNAME / TEST_PASSWORD not set');
  await page.goto('/signin');
  await page.locator('input[type="email"]').fill(USERNAME as string);
  await page.locator('input[type="password"]').fill(PASSWORD as string);
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait for the established Cognito session before any data read — otherwise
  // the read races the session and fires as a guest (silently empty, ADR 0004).
  await page.waitForFunction(
    () =>
      Object.keys(window.localStorage).some(
        (k) => k.includes('CognitoIdentityServiceProvider') && k.endsWith('.accessToken'),
      ),
    undefined,
    { timeout: 15_000 },
  );
});

When('the test user opens the {string} deck', async ({ page }, topic: string) => {
  await page.goto('/discover/languages');
  await page
    .getByTestId('deck-card')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('deck-title')).toContainText(topic);
});

When('the test user adds the deck to My Decks', async ({ page }) => {
  const btn = page.getByTestId('save-deck');
  // The deck may already be saved from a previous run — only add if not.
  if ((await btn.getAttribute('aria-pressed')) === 'false') await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true', { timeout: 15_000 });
});

Then('the deck button shows it is in My Decks', async ({ page }) => {
  await expect(page.getByTestId('save-deck')).toContainText('In My Decks');
});

When('the test user opens the My Decks tab', async ({ page }) => {
  await page.goto('/my-decks');
});

Then('{string} is listed in My Decks', async ({ page }, topic: string) => {
  // Reads the owner-scoped UserDeck row back — the real authenticated read.
  await expect(page.getByTestId('my-deck').filter({ hasText: new RegExp(topic) })).toBeVisible({
    timeout: 15_000,
  });
});

Then("the Due Today panel reflects the saved deck's due cards", async ({ page }) => {
  // The suite reseeds before running, so the saved deck's cards are new =>
  // due, and the cross-deck panel surfaces it with a study link.
  const panel = page.getByTestId('due-today');
  await expect(panel).toBeVisible({ timeout: 15_000 });
  await expect(panel.getByTestId('due-deck').first()).toBeVisible();
});

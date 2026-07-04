import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the player opens the first Spelling Bee puzzle', async ({ page }) => {
  await page.goto('/spellingbee');
  // Lists are newest-first by puzzleDate; the first SEED board (letters=abdeiou,
  // center=o, "abode" valid) is the oldest, so it's last — that's what we assume.
  await page.getByTestId('bee-link').last().click();
  await expect(page.getByTestId('spelling-bee')).toBeVisible({ timeout: 15_000 });
});

When('the player types the word {string}', async ({ page }, word: string) => {
  for (const letter of word) {
    await page.getByTestId(`hex-${letter}`).click();
  }
});

When('the player submits the word', async ({ page }) => {
  await page.getByTestId('bee-enter').click();
});

Then('the word {string} appears in the found list', async ({ page }, word: string) => {
  await expect(page.getByTestId('bee-found-word').filter({ hasText: word })).toBeVisible({
    timeout: 10_000,
  });
});

Then('the score increases', async ({ page }) => {
  await expect(page.getByTestId('bee-score')).toContainText(/Score: [1-9]/);
});

Then('an error is shown', async ({ page }) => {
  await expect(page.getByTestId('bee-error')).toBeVisible({ timeout: 10_000 });
});

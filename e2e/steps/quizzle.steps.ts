import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the player opens the {string} quizzle', async ({ page }, topic: string) => {
  await page.goto('/quizzle');
  await page
    .getByTestId('quizzle-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('quizzle')).toBeVisible({ timeout: 15_000 });
});

When('the player starts the quizzle', async ({ page }) => {
  await page.getByTestId('quizzle-start').click();
  await expect(page.getByTestId('quizzle-question')).toBeVisible({ timeout: 10_000 });
});

When('the player wagers {string}', async ({ page }, amount: string) => {
  const box = page.getByTestId('wager-input');
  await box.fill(amount);
  await page.getByTestId('wager-submit').click();
  await expect(page.getByTestId('answer-input')).toBeVisible({ timeout: 10_000 });
});

When('the player answers {string}', async ({ page }, guess: string) => {
  const box = page.getByTestId('answer-input');
  // Quizzle auto-submits the instant a CORRECT answer is typed (no button needed);
  // a wrong/other answer needs the explicit Submit. Click it only if still shown.
  await box.fill(guess);
  const submit = page.getByTestId('answer-submit');
  if (await submit.count()) await submit.click().catch(() => {});
});

Then('the answer is marked correct', async ({ page }) => {
  await expect(page.getByTestId('quizzle-result')).toContainText('Correct', { timeout: 10_000 });
});

Then('the bank shows {string}', async ({ page }, amount: string) => {
  await expect(page.getByTestId('quizzle-bank')).toContainText(amount, { timeout: 10_000 });
});

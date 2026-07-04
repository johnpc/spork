import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the player opens the {string} ladder', async ({ page }, pair: string) => {
  await page.goto('/steps');
  await page
    .getByTestId('ladder-link')
    .filter({ hasText: new RegExp(pair) })
    .click();
  await expect(page.getByTestId('steps')).toBeVisible({ timeout: 15_000 });
});

When('the player enters the word {string}', async ({ page }, word: string) => {
  const box = page.getByTestId('step-input');
  await box.fill(word);
  await box.press('Enter');
});

Then('the ladder shows the word {string}', async ({ page }, word: string) => {
  await expect(page.getByTestId('ladder-word').filter({ hasText: word })).toBeVisible({
    timeout: 10_000,
  });
});

Then('the ladder is solved', async ({ page }) => {
  await expect(page.getByTestId('steps-solved')).toBeVisible({ timeout: 10_000 });
});

Then('a step error is shown', async ({ page }) => {
  await expect(page.getByTestId('steps-error')).toBeVisible({ timeout: 10_000 });
});

Then('the ladder is not solved', async ({ page }) => {
  await expect(page.getByTestId('steps-solved')).toHaveCount(0);
});

When('the player gives up the ladder', async ({ page }) => {
  await page.getByTestId('steps-giveup').click();
});

Then('the solution is shown', async ({ page }) => {
  await expect(page.getByTestId('steps-solution')).toBeVisible({ timeout: 10_000 });
});

Then('the solution includes {string}', async ({ page }, word: string) => {
  const solution = page.getByTestId('steps-solution');
  await expect(solution).toContainText(word);
});

Then('further input is blocked', async ({ page }) => {
  await expect(page.getByTestId('step-input')).toHaveCount(0);
});

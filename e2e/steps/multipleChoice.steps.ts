import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Open the named quiz from the Quizzes list and wait for the MC renderer. */
async function openMcQuiz(page: import('@playwright/test').Page, topic: string) {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('multiple-choice')).toBeVisible({ timeout: 15_000 });
}

// NOTE: the shared steps `the player starts the quiz` and `the score shows
// {string}` come from play.steps.ts — playwright-bdd loads one global registry,
// so we must NOT redefine them here (duplicate-definition error). This file
// defines only the MC-specific steps.

Given('the player opens the {string} multiple-choice quiz', async ({ page }, topic: string) => {
  await openMcQuiz(page, topic);
});

Then('the current question is {string}', async ({ page }, question: string) => {
  await expect(page.getByTestId('mc-question')).toHaveText(question, { timeout: 10_000 });
});

When('the player picks the option {string}', async ({ page }, label: string) => {
  await page
    .getByTestId('mc-option')
    .filter({ hasText: new RegExp(`^${label}$`) })
    .click();
});

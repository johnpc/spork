import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Then } = createBdd();

/** Open the named SLIDESHOW quiz from the Quizzes list, waiting on the real
 * rendered deck (not just navigation). Reuses the /quizzes list + quiz-link
 * pattern from play.steps.ts but asserts on the slideshow root. */
Given('the player opens the {string} slideshow quiz', async ({ page }, topic: string) => {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('slideshow')).toBeVisible({ timeout: 15_000 });
});

/** Assert on the REAL rendered slide: the current album prompt is displayed. */
Then('the slide prompt shows {string}', async ({ page }, prompt: string) => {
  await expect(page.getByTestId('slideshow-slide')).toContainText(prompt, { timeout: 10_000 });
});

import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Open the named quiz from the Quizzes list, then wait for the PICTURE_CLICK
 * renderer to mount (its root testid) — reusing the /quizzes navigate + click
 * pattern from play.steps.ts, but asserting on this type's rendered surface. */
async function openQuiz(page: import('@playwright/test').Page, topic: string) {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('picture-click')).toBeVisible({ timeout: 15_000 });
}

Given('the player opens the {string} picture-click quiz', async ({ page }, topic: string) => {
  await openQuiz(page, topic);
});

When('the player starts the picture-click quiz', async ({ page }) => {
  // CLICK modes auto-start on first interaction — click Start only if present,
  // then confirm the session is live (give-up is shown for a running session).
  const start = page.getByTestId('play-start');
  if (await start.count()) await start.click();
  await expect(page.getByTestId('play-giveup')).toBeVisible({ timeout: 15_000 });
});

When('the player clicks the {string} hotspot', async ({ page }, label: string) => {
  await page.getByRole('button', { name: label, exact: true }).click();
});

Then('the picture-click score shows {string}', async ({ page }, count: string) => {
  await expect(page.getByTestId('play-score')).toContainText(`${count} /`, { timeout: 10_000 });
});

Then('the {string} hotspot is marked found on the diagram', async ({ page }, label: string) => {
  // Honest e2e: assert on the REAL rendered hotspot — the clicked spot now
  // carries the found testid AND renders its display label.
  const found = page.getByTestId('pc-found');
  await expect(found).toBeVisible({ timeout: 10_000 });
  await expect(found).toContainText(label);
});

When('the player gives up the picture-click quiz', async ({ page }) => {
  await page.getByTestId('play-giveup').click();
});

Then('a picture-click score summary is shown', async ({ page }) => {
  await expect(page.getByTestId('play-done')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('play-final-score')).toBeVisible();
});

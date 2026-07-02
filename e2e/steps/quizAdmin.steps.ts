import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;

// A unique topic per run so the draft/published assertions target THIS quiz.
// No Date.now() at import time (stable); computed on first use in the step.
let topic = '';

Given('the editor opens Quiz Studio', async ({ page }) => {
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
  await page.goto('/admin/quizzes');
  await expect(page.getByTestId('quiz-gen-form')).toBeVisible({ timeout: 15_000 });
});

When(
  'the editor generates a {string} quiz about a unique topic',
  async ({ page }, mode: string) => {
    topic = `E2E ${mode} ${Math.floor(Date.now() / 1000)}`;
    await page.getByLabel('Quiz mode').selectOption(mode);
    await page.getByLabel('AI quiz topic').fill(topic);
    await page.getByLabel('Answer count').fill('5');
    await page.getByTestId('quiz-gen-submit').click();
  },
);

Then('the generation run reaches DRAFT_READY', async ({ page }) => {
  // The runs list polls every ~4s; wait for a DRAFT_READY status to appear.
  await expect(page.getByText('DRAFT_READY').first()).toBeVisible({ timeout: 60_000 });
});

Then('the generated quiz appears as a draft', async ({ page }) => {
  await expect(page.getByTestId('quiz-draft').filter({ hasText: topic })).toBeVisible({
    timeout: 30_000,
  });
});

When('the editor publishes the generated draft', async ({ page }) => {
  const draft = page.getByTestId('quiz-draft').filter({ hasText: topic });
  await draft.getByTestId('quiz-publish').click();
  // Wait for the publish to land: the draft leaves the DRAFT list once its
  // status flips to PUBLISHED (useQuizAdmin invalidates the draft query).
  await expect(draft).toHaveCount(0, { timeout: 20_000 });
});

Then('the published quiz appears in the Quizzes list', async ({ page }) => {
  // Navigate once, wait for the list to finish loading, then assert. Reload
  // (not re-goto in a tight loop) if the freshly-published quiz isn't there yet
  // — the public read can lag the publish write by a moment.
  await expect
    .poll(
      async () => {
        await page.goto('/quizzes');
        await expect(page.getByTestId('quiz-list')).toBeVisible({ timeout: 15_000 });
        return page.getByTestId('quiz-link').filter({ hasText: topic }).count();
      },
      { timeout: 30_000, intervals: [2000, 3000, 5000, 5000] },
    )
    .toBeGreaterThanOrEqual(1);
});

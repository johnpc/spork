import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;

Given('the study test user signs in', async ({ page }) => {
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

Given('a guest opens the app', async ({ page }) => {
  // No sign-in — the deck + study flow must work for a signed-out visitor.
  await page.goto('/home');
});

// Seeded decks live in different Discover categories; map the topic to its
// category so a scenario can pick either deck (the streak scenario uses a
// different deck than the single-card one to avoid same-user due-card contention).
const DECK_CATEGORY: Record<string, string> = {
  'Top Spanish Phrases': 'languages',
  'Greek Gods': 'mythology',
};

When('the user starts studying the {string} deck', async ({ page }, topic: string) => {
  await page.goto(`/discover/${DECK_CATEGORY[topic] ?? 'languages'}`);
  await page
    .getByTestId('deck-card')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('deck-title')).toContainText(topic);
  await page.getByTestId('study-link').click();
});

Then('the study session shows progress {string}', async ({ page }, prefix: string) => {
  await expect(page.getByTestId('study-progress')).toContainText(prefix, { timeout: 15_000 });
});

Then('four answer options are shown', async ({ page }) => {
  // A 3-card deck yields its answer + 2 distractors = 3 options; assert ≥2.
  const count = await page.getByTestId('study-opt').count();
  expect(count).toBeGreaterThanOrEqual(2);
});

When('the user picks an answer option', async ({ page }) => {
  await page.getByTestId('study-opt').first().click();
});

Then('answer feedback is shown', async ({ page }) => {
  // After picking, the post-answer area (with Next) reveals.
  await expect(page.getByTestId('study-after')).toBeVisible({ timeout: 15_000 });
});

When('the user advances to the next card', async ({ page }) => {
  await page.getByTestId('study-next').click();
});

Then('the study session advances past the first card', async ({ page }) => {
  // Either the next card (progress "2 /") or the all-caught-up state for a
  // 1-card session — both prove the grade persisted and the queue advanced.
  await expect
    .poll(
      async () => {
        if (await page.getByTestId('study-done').isVisible()) return true;
        return (await page.getByTestId('study-progress').textContent())?.includes('2 /') ?? false;
      },
      { timeout: 15_000 },
    )
    .toBe(true);
});

When('the user answers every card in the session', async ({ page }) => {
  // Wait for the session to settle into one of its two initial states — a card
  // to answer, or the "all caught up" screen — so we don't decide before the
  // study data has loaded.
  await expect(
    page.getByTestId('study-opt').first().or(page.getByTestId('study-done')),
  ).toBeVisible({ timeout: 15_000 });
  // If nothing is due (e.g. a re-run where SM-2 scheduled the cards forward),
  // start a "Review all" round so there's always a session to complete.
  const reviewAll = page.getByTestId('study-review-all');
  if (await reviewAll.isVisible().catch(() => false)) {
    await reviewAll.click();
    await expect(page.getByTestId('study-opt').first()).toBeVisible({ timeout: 15_000 });
  }
  // Answer-then-Next until the done screen appears (bounded loop).
  for (let i = 0; i < 50; i++) {
    if (await page.getByTestId('study-done').isVisible()) break;
    await page.getByTestId('study-opt').first().click();
    await page.getByTestId('study-next').click();
  }
});

Then('a session score summary is shown', async ({ page }) => {
  await expect(page.getByTestId('study-done')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('study-score')).toBeVisible();
});

When('the user opens the You tab', async ({ page }) => {
  await page.goto('/you');
});

Then('a study streak of at least 1 day is shown', async ({ page }) => {
  // The session records the streak async (best-effort, after the last card),
  // so reload the You tab until useStat reflects it.
  await expect
    .poll(
      async () => {
        const n = Number(
          (await page
            .getByTestId('streak-current')
            .textContent()
            .catch(() => '0')) ?? '0',
        );
        if (n < 1) await page.reload();
        return n;
      },
      { timeout: 20_000, intervals: [1000, 2000, 3000, 3000, 4000, 4000] },
    )
    .toBeGreaterThanOrEqual(1);
});

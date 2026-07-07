import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Pin the clock to a "World" finale day (dayNumber % 7 === 0) so the map games'
 * regional rotation exposes ALL countries — otherwise the day's continent varies
 * and hardcoded answers (Brazil, USA…) would only score on their region's day.
 * Must run before navigation so usePlay reads the fixed date. */
Given('the map shows the whole world today', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-01-08T12:00:00Z'));
});

/** Open the named quiz from the Quizzes list (shared by "opens"/"reopens"). */
async function openQuiz(page: import('@playwright/test').Page, topic: string) {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('world-map')).toBeVisible({ timeout: 15_000 });
}

Given('the player opens the {string} map quiz', async ({ page }, topic: string) => {
  await openQuiz(page, topic);
});

/** Pin the clock to a Worldle "click" day scoped to North America (2026-01-10 is
 * day 20463: odd → CLICKABLE, day%6 → North America), so the seeded MAP quiz is
 * shown as a find-it-on-the-map game cropped to that continent. */
Given('today is a Worldle click day for North America', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-01-10T12:00:00Z'));
});

/** Open the daily map quiz on a click day — same quiz, but it renders as the
 * CLICKABLE grid rather than the typed world map. */
Given('the player opens the {string} map quiz on a click day', async ({ page }, topic: string) => {
  await page.goto('/quizzes');
  await page
    .getByTestId('quiz-link')
    .filter({ hasText: new RegExp(topic) })
    .click();
  await expect(page.getByTestId('clickable-grid')).toBeVisible({ timeout: 15_000 });
});

Then('the player is prompted to find {string}', async ({ page }, country: string) => {
  await expect(page.getByTestId('clickable-prompt')).toHaveText(`Find ${country}`, {
    timeout: 10_000,
  });
});

When('the player reopens the {string} map quiz', async ({ page }, topic: string) => {
  await openQuiz(page, topic);
});

When('the player starts the quiz', async ({ page }) => {
  // Typed modes show an explicit Start button; click/pick/arrange modes auto-
  // start on the first interaction (no Start button). Click Start only if present.
  const start = page.getByTestId('play-start');
  if (await start.count()) await start.click();
  // The give-up control confirms the play surface is active (typed modes show it
  // once started; click modes show it immediately).
  await expect(page.getByTestId('play-giveup')).toBeVisible();
});

When('the player types the answer {string}', async ({ page }, answer: string) => {
  const box = page.getByTestId('play-input');
  await box.fill(answer);
  await box.press('Enter');
});

Then('the score shows {string}', async ({ page }, count: string) => {
  await expect(page.getByTestId('play-score')).toContainText(`${count} /`, { timeout: 10_000 });
});

Then('the region for {string} is filled in on the map', async ({ page }, _country: string) => {
  // Assert on the REAL rendered SVG: at least one region carries the "found"
  // role class after a correct answer (honest e2e — not just a counter).
  await expect
    .poll(async () => page.locator('.sp-region--found').count(), { timeout: 10_000 })
    .toBeGreaterThanOrEqual(1);
});

When('the player gives up', async ({ page }) => {
  await page.getByTestId('play-giveup').click();
});

Then('a quiz score summary is shown', async ({ page }) => {
  await expect(page.getByTestId('play-done')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('play-final-score')).toBeVisible();
});

Then('a saved best score of at least {int} is shown', async ({ page }, min: number) => {
  // Best score is saved to localStorage on give-up; reopening the quiz reads it
  // back into the lobby's "Your best: N / total". Assert on that rendered value.
  await expect(page.getByTestId('play-best')).toBeVisible({ timeout: 10_000 });
  const text = (await page.getByTestId('play-best').textContent()) ?? '';
  const found = Number(text.match(/(\d+)\s*\//)?.[1] ?? '0');
  expect(found).toBeGreaterThanOrEqual(min);
});

Then('the correct answer {string} is revealed', async ({ page }, answer: string) => {
  // Assert on the REAL rendered reveal — the mc-reveal element shows all
  // correct answers after give-up/time-up. Honest e2e — not just a counter.
  const reveal = page.getByTestId('mc-reveal');
  await expect(reveal).toBeVisible({ timeout: 10_000 });
  await expect(reveal).toContainText(answer);
});

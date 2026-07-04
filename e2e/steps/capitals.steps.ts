import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Then, When } = createBdd();

// Seeded state/country → capital lookups (a subset — enough to answer whatever
// slide comes up first). Mirrors the fixtures in amplify/seed/fixtures/quizzes.
const CAPITALS: Record<string, string> = {
  // US states
  Alabama: 'Montgomery',
  Alaska: 'Juneau',
  Arizona: 'Phoenix',
  Arkansas: 'Little Rock',
  California: 'Sacramento',
  Colorado: 'Denver',
  'New York': 'Albany',
  Texas: 'Austin',
  Florida: 'Tallahassee',
  Maryland: 'Annapolis',
  Georgia: 'Atlanta',
  // countries
  France: 'Paris',
  Japan: 'Tokyo',
  Egypt: 'Cairo',
  Brazil: 'Brasília',
  Canada: 'Ottawa',
  Australia: 'Canberra',
  Germany: 'Berlin',
  Nigeria: 'Abuja',
  Kenya: 'Nairobi',
};

Then('a slideshow quiz is shown', async ({ page }) => {
  await expect(page).toHaveURL(/\/quizzes\/[^/]+\/play$/, { timeout: 15_000 });
  await expect(page.getByTestId('slideshow')).toBeVisible({ timeout: 15_000 });
});

Then('the clickable US map is shown', async ({ page }) => {
  await expect(page).toHaveURL(/\/quizzes\/[^/]+\/play$/, { timeout: 15_000 });
  await expect(page.getByTestId('clickable-grid')).toBeVisible({ timeout: 15_000 });
  // The US map (states-10m) has ~56 region paths — enough to confirm it drew.
  await expect
    .poll(async () => page.locator('.clickable-map__map path').count(), { timeout: 10_000 })
    .toBeGreaterThan(40);
});

/** Read the current slide's prompt (a state or country), look up its capital,
 * and type it — asserting on REAL seeded data, not a hardcoded answer. */
When('the player answers the capital prompt correctly', async ({ page }) => {
  const prompt = (await page.getByTestId('slideshow-slide').textContent())?.trim() ?? '';
  const key = Object.keys(CAPITALS).find((k) => prompt.includes(k));
  expect(key, `no known capital for prompt "${prompt}"`).toBeTruthy();
  const input = page.getByTestId('play-input');
  await input.fill(CAPITALS[key as string]);
  await input.press('Enter');
});

// Remember the prompt before skipping so the next step can assert it changed —
// proving Skip moved on without the player needing to know the answer.
let promptBeforeSkip = '';

When('the player skips the current prompt', async ({ page }) => {
  promptBeforeSkip = (await page.getByTestId('slideshow-prompt').textContent())?.trim() ?? '';
  await page.getByTestId('slideshow-skip').click();
});

Then('a different prompt is shown', async ({ page }) => {
  await expect(page.getByTestId('slideshow-prompt')).not.toHaveText(promptBeforeSkip, {
    timeout: 10_000,
  });
});

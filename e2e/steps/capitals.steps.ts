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

import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the player opens the first Wordle puzzle', async ({ page }) => {
  await page.goto('/wordle');
  // Lists are newest-first by puzzleDate; the first SEED answer ("crane") is the
  // oldest, so it's last in the list — that's the puzzle these scenarios assume.
  await page.getByTestId('wordle-link').last().click();
  await expect(page.getByTestId('wordle')).toBeVisible({ timeout: 15_000 });
});

When('the player types {string}', async ({ page }, word: string) => {
  for (const letter of word) {
    await page.getByTestId(`wordle-key-${letter}`).click();
  }
});

When('the player submits the guess', async ({ page }) => {
  await page.getByTestId('wordle-key-enter').click();
});

Then('all tiles in the last guess are green', async ({ page }) => {
  // Check that all tiles in row 0 have the --correct class
  for (let i = 0; i < 5; i++) {
    await expect(page.getByTestId(`wordle-tile-0-${i}`)).toHaveClass(
      /wordle-board__tile--correct/,
      { timeout: 10_000 },
    );
  }
});

Then('the win message is shown', async ({ page }) => {
  await expect(page.getByTestId('wordle-won')).toBeVisible({ timeout: 10_000 });
});

Then('an error message is shown', async ({ page }) => {
  await expect(page.getByTestId('wordle-error')).toBeVisible({ timeout: 10_000 });
});

Then('the guess count remains {int}', async ({ page }, count: number) => {
  // maxGuesses rows are always rendered; count real guesses by scored tiles.
  const scoredTiles = await page
    .locator(
      '.wordle-board__tile--correct, .wordle-board__tile--present, .wordle-board__tile--absent',
    )
    .count();
  expect(scoredTiles).toBe(count * 5); // count guesses * 5 tiles per guess
});

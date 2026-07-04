/** Seed published Wordle puzzles. Creates one WordlePuzzle per seed answer,
 * spreading puzzleDates across days using the same dateFor helper as ladders. */
import { client, EDITOR_WRITE } from './seedClient';
import { seedWordleAnswers } from './fixtures/wordle';
import { dateFor } from './fixtures/seedDates';

export async function seedWordleData(): Promise<number> {
  const now = new Date().toISOString();
  let created = 0;
  for (let i = 0; i < seedWordleAnswers.length; i++) {
    const answer = seedWordleAnswers[i];
    const { errors } = await client.models.WordlePuzzle.create(
      {
        answer,
        wordLength: 5,
        maxGuesses: 6,
        status: 'PUBLISHED',
        publishedAt: now,
        puzzleDate: dateFor(i, seedWordleAnswers.length),
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`WordlePuzzle ${answer}: ${JSON.stringify(errors)}`);
    created += 1;
  }
  console.log(`Seeded ${created} Wordle puzzles.`);
  return created;
}

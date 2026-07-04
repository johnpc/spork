/** Seed published Wordle puzzles as a browse history. Only the most recent
 * BROWSE_DAYS answers are inserted (one per day, today back) — the full
 * seedWordleAnswers pool stays the daily-ingest rotation source, independent of
 * this. Capping keeps the list well under fetchWordles' 200-row page so it's
 * fully ordered + deterministic (a 500-row scan page returns rows in hash order,
 * which breaks both list ordering and today's-puzzle lookup). */
import { client, EDITOR_WRITE } from './seedClient';
import { seedWordleAnswers } from './fixtures/wordle';
import { dateFor } from './fixtures/seedDates';

const BROWSE_DAYS = 30;

export async function seedWordleData(): Promise<number> {
  const now = new Date().toISOString();
  const answers = seedWordleAnswers.slice(0, BROWSE_DAYS);
  let created = 0;
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const { errors } = await client.models.WordlePuzzle.create(
      {
        answer,
        wordLength: 5,
        maxGuesses: 6,
        status: 'PUBLISHED',
        publishedAt: now,
        puzzleDate: dateFor(i, answers.length),
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`WordlePuzzle ${answer}: ${JSON.stringify(errors)}`);
    created += 1;
  }
  console.log(`Seeded ${created} Wordle puzzles.`);
  return created;
}

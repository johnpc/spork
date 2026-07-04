/** Seed published Spelling Bee puzzles. Mirrors seedLadders: create each
 * PUBLISHED SpellingBeePuzzle with answers + pangrams as JSON. */
import { client, EDITOR_WRITE } from './seedClient';
import { seedBees } from './fixtures/spellingBee';
import { dateFor } from './fixtures/seedDates';

export async function seedSpellingBeeData(): Promise<number> {
  const now = new Date().toISOString();
  let created = 0;
  for (let i = 0; i < seedBees.length; i++) {
    const b = seedBees[i];
    const { errors } = await client.models.SpellingBeePuzzle.create(
      {
        letters: b.letters,
        centerLetter: b.centerLetter,
        answers: JSON.stringify(b.answers),
        pangrams: JSON.stringify(b.pangrams),
        status: 'PUBLISHED',
        publishedAt: now,
        puzzleDate: dateFor(i, seedBees.length),
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`SpellingBeePuzzle ${b.letters}: ${JSON.stringify(errors)}`);
    created += 1;
  }
  console.log(`Seeded ${created} Spelling Bee puzzles.`);
  return created;
}

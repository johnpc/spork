/** Seed published word ladders for the Steps game. Mirrors seedQuizzes: create
 * each PUBLISHED WordLadder with its dictionary + par path as JSON. */
import { client, EDITOR_WRITE } from './seedClient';
import { seedLadders } from './fixtures/ladders';

export async function seedLadderData(): Promise<number> {
  const now = new Date().toISOString();
  let created = 0;
  for (const l of seedLadders) {
    const { errors } = await client.models.WordLadder.create(
      {
        start: l.start,
        target: l.target,
        difficulty: l.difficulty,
        dictionary: JSON.stringify(l.dictionary),
        parPath: JSON.stringify(l.parPath),
        status: 'PUBLISHED',
        publishedAt: now,
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`WordLadder ${l.start}->${l.target}: ${JSON.stringify(errors)}`);
    created += 1;
  }
  console.log(`Seeded ${created} word ladders.`);
  return created;
}

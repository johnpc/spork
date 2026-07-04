/** Seed published Connections puzzles. Mirrors seedLadders: create each
 * PUBLISHED ConnectionsPuzzle with its groups (JSON) + maxMistakes. */
import { client, EDITOR_WRITE } from './seedClient';
import { seedConnections } from './fixtures/connections';
import { dateFor } from './fixtures/seedDates';

export async function seedConnectionsData(): Promise<number> {
  const now = new Date().toISOString();
  let created = 0;
  for (let i = 0; i < seedConnections.length; i++) {
    const c = seedConnections[i];
    const { errors } = await client.models.ConnectionsPuzzle.create(
      {
        groups: JSON.stringify(c.groups),
        maxMistakes: c.maxMistakes ?? 4,
        status: 'PUBLISHED',
        publishedAt: now,
        puzzleDate: dateFor(i, seedConnections.length),
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`ConnectionsPuzzle: ${JSON.stringify(errors)}`);
    created += 1;
  }
  console.log(`Seeded ${created} Connections puzzles.`);
  return created;
}
